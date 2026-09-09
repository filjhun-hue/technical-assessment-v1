import {
  DataEntryRecord,
  DataEntrySubmission,
  QuizResult,
  TypingResult,
  MultitaskingMetric,
  CandidateAssessmentReport,
  CandidateInfo
} from '../types/assessment';
import { DATA_ENTRY_RECORDINGS } from '../data/dataEntryRecordings';
import { NAVIGATION_QUESTIONS } from '../data/navigationQuestions';
import { TROUBLESHOOTING_QUESTIONS } from '../data/troubleshootingQuestions';

// Normalization helper for strings
export function normalizeStr(str: string | undefined): string {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Normalization helper for phone numbers (extract digits)
export function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// Field-by-field comparator
export function evaluateFieldMatch(
  field: keyof DataEntryRecord,
  expected: string,
  actual: string | undefined
): boolean {
  if (!actual) return false;
  const expNorm = normalizeStr(expected);
  const actNorm = normalizeStr(actual);

  if (field === 'phoneNumber') {
    return normalizePhone(expected) === normalizePhone(actual);
  }
  if (field === 'accountNumber') {
    return expected.replace(/\s+/g, '') === actual.replace(/\s+/g, '');
  }
  if (field === 'email') {
    return expNorm === actNorm;
  }
  if (field === 'customerName') {
    return expNorm === actNorm;
  }
  if (field === 'appointment') {
    // Check if key date components match
    const expDateClean = expNorm.replace(/,/g, '').replace(/\s+/g, ' ');
    const actDateClean = actNorm.replace(/,/g, '').replace(/\s+/g, ' ');
    return expDateClean === actDateClean;
  }

  return expNorm === actNorm;
}

export function gradeDataEntry(
  candidateRecords: Record<string, Partial<DataEntryRecord>>,
  replays: Record<string, number>,
  timeSpentSeconds: number
): DataEntrySubmission {
  const fields: (keyof DataEntryRecord)[] = [
    'customerName',
    'accountNumber',
    'phoneNumber',
    'email',
    'appointment'
  ];

  let totalFields = 0;
  let correctFields = 0;
  const fieldErrors: DataEntrySubmission['fieldErrors'] = [];

  DATA_ENTRY_RECORDINGS.forEach((rec) => {
    const candidateRec = candidateRecords[rec.id] || {};
    const expectedRec = rec.expectedData;

    fields.forEach((f) => {
      totalFields++;
      const expectedVal = expectedRec[f] as string;
      const actualVal = (candidateRec[f] as string) || '';
      const isMatch = evaluateFieldMatch(f, expectedVal, actualVal);

      if (isMatch) {
        correctFields++;
      } else {
        fieldErrors.push({
          recordId: rec.id,
          field: f,
          expected: expectedVal,
          actual: actualVal,
          isMatch: false
        });
      }
    });
  });

  const accuracyScore = totalFields > 0 ? Math.round((correctFields / totalFields) * 100) : 0;

  return {
    candidateRecords,
    replays,
    accuracyScore,
    totalFields,
    correctFields,
    fieldErrors,
    completed: true,
    timeSpentSeconds
  };
}

export function gradeNavigationQuiz(
  answers: Record<string, string>,
  timeSpentSeconds: number
): QuizResult {
  let score = 0;
  NAVIGATION_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.correctOptionId) {
      score++;
    }
  });

  const total = NAVIGATION_QUESTIONS.length;
  const percentage = Math.round((score / total) * 100);

  return {
    answers,
    score,
    total,
    percentage,
    timeSpentSeconds,
    completed: true
  };
}

export function gradeTroubleshootingQuiz(
  answers: Record<string, string>,
  timeSpentSeconds: number
): QuizResult {
  let score = 0;
  TROUBLESHOOTING_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.correctOptionId) {
      score++;
    }
  });

  const total = TROUBLESHOOTING_QUESTIONS.length;
  const percentage = Math.round((score / total) * 100);

  return {
    answers,
    score,
    total,
    percentage,
    timeSpentSeconds,
    completed: true
  };
}

export function computeOverallAssessment(
  candidate: CandidateInfo,
  typing: TypingResult,
  navigation: QuizResult,
  dataEntry: DataEntrySubmission,
  multitasking: MultitaskingMetric,
  troubleshooting: QuizResult
): CandidateAssessmentReport {
  // Typing score: based on 35 WPM and 90% accuracy benchmark
  // Benchmark maxes out at 50 WPM
  const typingWpmComponent = Math.min(100, Math.round((typing.wpm / 45) * 100));
  const typingAccComponent = typing.accuracy;
  const typingOverallScore = Math.round(typingWpmComponent * 0.5 + typingAccComponent * 0.5);

  // Weighted overall calculation:
  // Typing: 20%
  // Computer Navigation: 20%
  // Audio Data Entry: 25%
  // Multitasking: 15%
  // Troubleshooting: 20%
  const overallScore = Math.round(
    typingOverallScore * 0.2 +
    navigation.percentage * 0.2 +
    dataEntry.accuracyScore * 0.25 +
    multitasking.overallScore * 0.15 +
    troubleshooting.percentage * 0.2
  );

  let overallStatus: 'PASSED' | 'REVIEW_REQUIRED' | 'NEEDS_RETEST' = 'PASSED';
  
  // Suggested minimum benchmark: Typing >= 35 WPM & >= 90% accuracy, quizzes >= 70%
  if (
    typing.wpm >= 35 &&
    typing.accuracy >= 90 &&
    dataEntry.accuracyScore >= 75 &&
    navigation.percentage >= 70 &&
    troubleshooting.percentage >= 70 &&
    multitasking.overallScore >= 60
  ) {
    overallStatus = 'PASSED';
  } else if (
    overallScore >= 65 &&
    (typing.wpm >= 30 || typing.accuracy >= 85)
  ) {
    overallStatus = 'REVIEW_REQUIRED';
  } else {
    overallStatus = 'NEEDS_RETEST';
  }

  return {
    candidate: {
      ...candidate,
      completedAt: new Date().toISOString()
    },
    typing,
    navigation,
    dataEntry,
    multitasking,
    troubleshooting,
    overallScore,
    overallStatus,
    generatedAt: new Date().toISOString()
  };
}

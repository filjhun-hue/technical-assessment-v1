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

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_MAP: Record<string, string> = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12'
};

// Parses string like "September 18, 2026, 2:00 PM" into { date: "2026-09-18", time: "14:00" }
export function parseAppointmentString(str: string | undefined): { date: string; time: string } {
  if (!str) return { date: '', time: '' };

  const trimmed = str.trim();
  // Check ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parts = trimmed.split(/[T\s]/);
    return {
      date: parts[0] || '',
      time: parts[1] ? parts[1].slice(0, 5) : ''
    };
  }

  let date = '';
  let time = '';

  const monthMatch = trimmed.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
  const yearMatch = trimmed.match(/\b(20\d\d)\b/);

  if (monthMatch && yearMatch) {
    const monthKey = monthMatch[1].toLowerCase();
    const mm = MONTH_MAP[monthKey] || '01';
    const yyyy = yearMatch[1];
    const afterMonth = trimmed.slice(trimmed.toLowerCase().indexOf(monthKey) + monthKey.length);
    const dayMatch = afterMonth.match(/\s*(\d{1,2})/);
    const dd = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
    date = `${yyyy}-${mm}-${dd}`;
  }

  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const min = timeMatch[2];
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    time = `${hour.toString().padStart(2, '0')}:${min}`;
  }

  return { date, time };
}

// Formats date ("YYYY-MM-DD") and time ("HH:mm") into standard string e.g. "September 18, 2026, 2:00 PM"
export function formatToAppointmentString(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const monthIdx = parseInt(mStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || '';
  const day = dStr || '01';

  if (!timeStr) {
    return `${monthName} ${day}, ${year}`;
  }

  const [hStr, minStr] = timeStr.split(':');
  let hour = parseInt(hStr, 10);
  const minutes = minStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour -= 12;
  }

  return `${monthName} ${day}, ${year}, ${hour}:${minutes} ${ampm}`;
}

// Address normalizer for flexible abbreviations and punctuation
export function normalizeAddress(s: string | undefined): string {
  if (!s) return '';
  return normalizeStr(s)
    .replace(/[,\.#\/\-]/g, ' ')
    .replace(/\b(blvd|blvrd|bvd|blv)\b/g, 'boulevard')
    .replace(/\b(ave|av)\b/g, 'avenue')
    .replace(/\b(dr)\b/g, 'drive')
    .replace(/\b(ct|crt)\b/g, 'court')
    .replace(/\b(st|str)\b/g, 'street')
    .replace(/\b(rd)\b/g, 'road')
    .replace(/\b(ste|suit)\b/g, 'suite')
    .replace(/\b(bldg|bld|bldng)\b/g, 'building')
    .replace(/\b(flr|fl)\b/g, 'floor')
    .replace(/\b(apt)\b/g, 'apartment')
    .replace(/\b(rm)\b/g, 'room')
    .replace(/\s+/g, ' ')
    .trim();
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
  if (field === 'company') {
    return expNorm === actNorm;
  }
  if (field === 'email') {
    if (expNorm === actNorm) return true;
    // Allow dot variations before the '@' (e.g. m.calhoun@apexbio.org vs mcalhoun@apexbio.org)
    const cleanEmail = (e: string) => {
      const [user, domain] = e.split('@');
      return `${(user || '').replace(/\./g, '')}@${domain || ''}`;
    };
    return cleanEmail(expNorm) === cleanEmail(actNorm);
  }
  if (field === 'customerName') {
    return expNorm === actNorm;
  }
  if (field === 'streetAddress') {
    return normalizeAddress(expected) === normalizeAddress(actual);
  }
  if (field === 'appointment') {
    const expParsed = parseAppointmentString(expected);
    const actParsed = parseAppointmentString(actual);
    if (expParsed.date && actParsed.date) {
      const [ey, em, ed] = expParsed.date.split('-');
      const [ay, am, ad] = actParsed.date.split('-');
      const dateMatches = ey === ay && em === am && parseInt(ed, 10) === parseInt(ad, 10);
      const timeMatches = !expParsed.time || expParsed.time === actParsed.time;
      if (dateMatches && timeMatches) return true;
    }
    const expDateClean = expNorm.replace(/,/g, '').replace(/\bat\b/g, '').replace(/\s+/g, ' ');
    const actDateClean = actNorm.replace(/,/g, '').replace(/\bat\b/g, '').replace(/\s+/g, ' ');
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
    'company',
    'phoneNumber',
    'email',
    'streetAddress',
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

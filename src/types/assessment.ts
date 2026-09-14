export type TestSectionId = 
  | 'onboarding'
  | 'typing'
  | 'navigation'
  | 'data-entry'
  | 'multitasking'
  | 'troubleshooting'
  | 'results';

export interface CandidateInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  targetPosition: string;
  startedAt: string;
  completedAt?: string;
  unfocusCount: number;
}

export interface TypingResult {
  wpm: number;
  accuracy: number;
  errors: number;
  cpm: number;
  durationSeconds: number;
  completed: boolean;
  externalScoreSubmitted?: boolean;
  externalUrl?: string;
  externalWpm?: number;
  externalAccuracy?: number;
}

export interface Question {
  id: string;
  category?: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizResult {
  answers: Record<string, string>; // questionId -> optionId
  score: number; // raw correct
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  completed: boolean;
}

export interface DataEntryRecord {
  id: string;
  customerName: string;
  company: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  appointment: string;
}

export interface DataEntrySubmission {
  candidateRecords: Record<string, Partial<DataEntryRecord>>;
  replays: Record<string, number>; // recordingId -> replay count
  accuracyScore: number; // 0 to 100
  totalFields: number;
  correctFields: number;
  fieldErrors: {
    recordId: string;
    field: keyof DataEntryRecord;
    expected: string;
    actual: string;
    isMatch: boolean;
  }[];
  completed: boolean;
  timeSpentSeconds: number;
}

export interface MultitaskingMetric {
  chatResolved: number; // Mapped to objectionsResolved
  chatTotal: number;
  ticketsProcessed: number; // Mapped to dispositionsLogged
  ticketsTotal: number;
  verificationsDone: number; // Mapped to appointmentsBooked
  verificationsTotal: number;
  accuracyPercentage: number;
  avgResponseTimeSec: number;
  overallScore: number; // 0 to 100
  completed: boolean;
  objectionsResolved?: number;
  dispositionsHandled?: number;
  appointmentsBooked?: number;
}

export interface CandidateAssessmentReport {
  candidate: CandidateInfo;
  typing: TypingResult;
  navigation: QuizResult;
  dataEntry: DataEntrySubmission;
  multitasking: MultitaskingMetric;
  troubleshooting: QuizResult;
  overallScore: number;
  overallStatus: 'PASSED' | 'REVIEW_REQUIRED' | 'NEEDS_RETEST';
  generatedAt: string;
}

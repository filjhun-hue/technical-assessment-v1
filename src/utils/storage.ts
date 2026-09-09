import { CandidateAssessmentReport } from '../types/assessment';
import { saveAssessmentToSupabase, fetchAssessmentsFromSupabase } from './supabaseClient';

const STORAGE_KEY_REPORTS = 'tech_assessment_hr_reports_v1';

export function saveAssessmentReport(report: CandidateAssessmentReport): void {
  try {
    const existing = getAllAssessmentReports();
    const filtered = existing.filter((r) => r.candidate.id !== report.candidate.id);
    filtered.unshift(report);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));

    // Asynchronously synchronize with Supabase if configured
    saveAssessmentToSupabase(report).catch((err) => {
      console.warn('Background Supabase sync notice:', err);
    });
  } catch (e) {
    console.error('Failed to save assessment report to localStorage', e);
  }
}

export function getAllAssessmentReports(): CandidateAssessmentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse assessment reports', e);
    return [];
  }
}

export async function syncReportsWithSupabase(): Promise<CandidateAssessmentReport[]> {
  const localReports = getAllAssessmentReports();
  const remoteReports = await fetchAssessmentsFromSupabase();

  if (remoteReports.length === 0) {
    return localReports;
  }

  // Merge remote and local (remote takes precedence on conflict)
  const map = new Map<string, CandidateAssessmentReport>();
  localReports.forEach((r) => map.set(r.candidate.id, r));
  remoteReports.forEach((r) => map.set(r.candidate.id, r));

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(merged));
  } catch (e) {
    // ignore
  }

  return merged;
}

export function exportReportsToCSV(reports: CandidateAssessmentReport[]): void {
  if (!reports || reports.length === 0) return;

  const headers = [
    'Candidate ID',
    'Candidate Name',
    'Email',
    'Phone',
    'Position',
    'Date Completed',
    'Overall Score (%)',
    'Status',
    'Typing WPM',
    'Typing Accuracy (%)',
    'Typing Errors',
    'Navigation Quiz (%)',
    'Data Entry Accuracy (%)',
    'Multitasking Score (%)',
    'Troubleshooting Quiz (%)',
    'Tab Unfocus Count'
  ];

  const rows = reports.map((r) => [
    `"${r.candidate.id}"`,
    `"${r.candidate.fullName}"`,
    `"${r.candidate.email}"`,
    `"${r.candidate.phone}"`,
    `"${r.candidate.targetPosition}"`,
    `"${r.candidate.completedAt || r.generatedAt}"`,
    r.overallScore,
    `"${r.overallStatus}"`,
    r.typing.wpm,
    r.typing.accuracy,
    r.typing.errors,
    r.navigation.percentage,
    r.dataEntry.accuracyScore,
    r.multitasking.overallScore,
    r.troubleshooting.percentage,
    r.candidate.unfocusCount || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Technical_Assessment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

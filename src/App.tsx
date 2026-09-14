import React, { useState, useEffect } from 'react';
import {
  TestSectionId,
  CandidateInfo,
  TypingResult,
  QuizResult,
  DataEntrySubmission,
  MultitaskingMetric,
  CandidateAssessmentReport
} from './types/assessment';
import { Navbar } from './components/common/Navbar';
import { Stepper } from './components/common/Stepper';
import { CandidateRegistration } from './components/CandidateRegistration';
import { TypingTest } from './components/TypingTest';
import { ComputerNavigationTest } from './components/ComputerNavigationTest';
import { DataEntryTest } from './components/DataEntryTest';
import { MultitaskingTest } from './components/MultitaskingTest';
import { TroubleshootingTest } from './components/TroubleshootingTest';
import { CandidateResults } from './components/CandidateResults';
import { HrAdminDashboard } from './components/HrAdminDashboard';
import { computeOverallAssessment } from './utils/grading';
import { saveAssessmentReport, getAllAssessmentReports, syncReportsWithSupabase } from './utils/storage';
import { getSupabaseClient, fetchAssessmentsFromSupabase } from './utils/supabaseClient';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

// ─── HR Portal PIN Gate ───────────────────────────────────────────────────────
// Change this to your desired PIN. Keep it secret — share only with HR staff.
const HR_PORTAL_PIN = '291847';

const HrPinGate: React.FC<{ onUnlock: () => void; onCancel: () => void }> = ({ onUnlock, onCancel }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (pin === HR_PORTAL_PIN) {
      setError('');
      onUnlock();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPin('');
      if (next >= 5) {
        setLocked(true);
        setError('Too many failed attempts. Access temporarily locked.');
      } else {
        setError(`Incorrect PIN. ${5 - next} attempt${5 - next === 1 ? '' : 's'} remaining.`);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0a0f1e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Lock size={28} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>HR Portal Access</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          This area is restricted to HR staff only. Enter your access PIN to continue.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPin ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(v);
                setError('');
              }}
              maxLength={6}
              disabled={locked}
              autoFocus
              style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: '1.25rem', paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0'
              }}
              tabIndex={-1}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '0.6rem 0.9rem', borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171', fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={pin.length < 6 || locked}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {locked ? 'Access Locked' : 'Unlock Portal'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
          >
            ← Back to Assessment
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  // Hash-based route detection
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [hrUnlocked, setHrUnlocked] = useState(false);

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isHrRoute = currentHash === '#/hrportal';
  const showHrPortal = isHrRoute && hrUnlocked;
  const showPinGate = isHrRoute && !hrUnlocked;

  const [hrSyncStatus, setHrSyncStatus] = useState<'idle' | 'syncing' | 'live' | 'offline'>('idle');
  const [hrLastSynced, setHrLastSynced] = useState<Date | null>(null);

  // Auto-fetch from Supabase + subscribe to realtime whenever HR portal opens
  useEffect(() => {
    if (!showHrPortal) {
      setHrSyncStatus('idle');
      return;
    }

    let realtimeChannel: ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>['channel']> | null = null;

    const initPortal = async () => {
      // Step 1: load localStorage immediately so the list shows something right away
      const local = getAllAssessmentReports();
      setReports(local);

      // Step 2: fetch from Supabase and merge
      setHrSyncStatus('syncing');
      try {
        const remote = await fetchAssessmentsFromSupabase();
        if (remote.length > 0) {
          // Merge: remote takes precedence for same IDs, keep any local-only ones
          const map = new Map<string, CandidateAssessmentReport>();
          local.forEach(r => map.set(r.candidate.id, r));
          remote.forEach(r => map.set(r.candidate.id, r));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
          );
          setReports(merged);
          // Persist merged list locally
          localStorage.setItem('tech_assessment_hr_reports_v1', JSON.stringify(merged));
        }
        setHrLastSynced(new Date());

        // Step 3: subscribe to realtime changes
        const client = getSupabaseClient();
        if (client) {
          realtimeChannel = client
            .channel('hr-portal-live')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'candidate_assessments' },
              async () => {
                // Re-fetch full list on any change
                const updated = await fetchAssessmentsFromSupabase();
                if (updated.length > 0) {
                  setReports(prev => {
                    const m = new Map<string, CandidateAssessmentReport>();
                    prev.forEach(r => m.set(r.candidate.id, r));
                    updated.forEach(r => m.set(r.candidate.id, r));
                    return Array.from(m.values()).sort(
                      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
                    );
                  });
                  setHrLastSynced(new Date());
                }
              }
            )
            .subscribe((status) => {
              setHrSyncStatus(status === 'SUBSCRIBED' ? 'live' : 'offline');
            });
        } else {
          setHrSyncStatus('offline');
        }
      } catch {
        setHrSyncStatus('offline');
      }
    };

    initPortal();

    return () => {
      // Unsubscribe when portal closes
      if (realtimeChannel) {
        const client = getSupabaseClient();
        client?.removeChannel(realtimeChannel);
      }
      setHrSyncStatus('idle');
    };
  }, [showHrPortal]);

  const [currentSection, setCurrentSection] = useState<TestSectionId>('onboarding');
  const [completedSections, setCompletedSections] = useState<Set<TestSectionId>>(new Set());

  // Candidate Data State
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [unfocusCount, setUnfocusCount] = useState(0);

  // Section Results State
  const [typingResult, setTypingResult] = useState<TypingResult | null>(null);
  const [navigationResult, setNavigationResult] = useState<QuizResult | null>(null);
  const [dataEntryResult, setDataEntryResult] = useState<DataEntrySubmission | null>(null);
  const [multitaskingResult, setMultitaskingResult] = useState<MultitaskingMetric | null>(null);
  const [troubleshootingResult, setTroubleshootingResult] = useState<QuizResult | null>(null);
  const [finalReport, setFinalReport] = useState<CandidateAssessmentReport | null>(null);

  // All Reports for HR Dashboard
  const [reports, setReports] = useState<CandidateAssessmentReport[]>([]);

  // Load existing reports and sample data if empty on first load
  useEffect(() => {
    let saved = getAllAssessmentReports();
    if (saved.length === 0) {
      // Seed a realistic sample report for HR demonstration
      const sampleReport: CandidateAssessmentReport = {
        candidate: {
          id: 'CAN-842109',
          fullName: 'Jordan Miller',
          email: 'jordan.miller@example.com',
          phone: '(555) 349-8812',
          targetPosition: 'Outbound Telemarketer / Sales Representative',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 1800000).toISOString(),
          unfocusCount: 1
        },
        typing: {
          wpm: 48,
          accuracy: 94,
          errors: 3,
          cpm: 240,
          durationSeconds: 60,
          completed: true
        },
        navigation: {
          answers: { 'nav-1': 'B', 'nav-2': 'C', 'nav-3': 'B', 'nav-4': 'C', 'nav-5': 'A', 'nav-6': 'B', 'nav-7': 'C', 'nav-8': 'A', 'nav-9': 'B', 'nav-10': 'B', 'nav-11': 'B' },
          score: 11,
          total: 11,
          percentage: 100,
          timeSpentSeconds: 145,
          completed: true
        },
        dataEntry: {
          candidateRecords: {
            'rec-1': { customerName: 'Johnathan Davies', company: 'Vanguard Logistics', phoneNumber: '555-684-2190', email: 'j.davies@vanguardlogistics.com', streetAddress: '420 Wyckoff Avenue, Suite 350', appointment: 'September 18, 2026, 2:00 PM' },
            'rec-2': { customerName: 'Marcus Calhoun', company: 'Apex BioSystems', phoneNumber: '555-704-5829', email: 'm.calhoun@apexbio.org', streetAddress: '1250 Belmont Boulevard, Building B', appointment: 'October 05, 2026, 11:30 AM' },
            'rec-3': { customerName: 'Gregory Braithwaite', company: 'Sterling Financial Partners', phoneNumber: '555-916-4382', email: 'g.braithwaite@sterlingpartners.net', streetAddress: '950 Kensington Drive, Suite 500', appointment: 'November 12, 2026, 4:15 PM' }
          },
          replays: { 'rec-1': 1, 'rec-2': 1, 'rec-3': 2 },
          accuracyScore: 100,
          totalFields: 18,
          correctFields: 18,
          fieldErrors: [],
          completed: true,
          timeSpentSeconds: 240
        },
        multitasking: {
          chatResolved: 5,
          chatTotal: 5,
          ticketsProcessed: 6,
          ticketsTotal: 6,
          verificationsDone: 6,
          verificationsTotal: 6,
          accuracyPercentage: 94,
          avgResponseTimeSec: 68,
          overallScore: 95,
          completed: true,
          objectionsResolved: 5,
          dispositionsHandled: 6,
          appointmentsBooked: 6
        },
        troubleshooting: {
          answers: { 'ts-1': 'B', 'ts-2': 'B', 'ts-3': 'C', 'ts-4': 'C', 'ts-5': 'B', 'ts-6': 'A', 'ts-7': 'B', 'ts-8': 'C', 'ts-9': 'B', 'ts-10': 'A', 'ts-11': 'B' },
          score: 11,
          total: 11,
          percentage: 100,
          timeSpentSeconds: 160,
          completed: true
        },
        overallScore: 96,
        overallStatus: 'PASSED',
        generatedAt: new Date(Date.now() - 1800000).toISOString()
      };

      saveAssessmentReport(sampleReport);
      saved = [sampleReport];
    }
    setReports(saved);
  }, []);

  // Track window blur / tab switches during active test
  useEffect(() => {
    const handleBlur = () => {
      if (candidate && currentSection !== 'onboarding' && currentSection !== 'results' && !isHrRoute) {
        setUnfocusCount((prev) => {
          const next = prev + 1;
          setCandidate((cand) => (cand ? { ...cand, unfocusCount: next } : null));
          return next;
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [candidate, currentSection, isHrRoute]);

  // Handlers for candidate transitions
  const handleStartAssessment = (newCandidate: CandidateInfo) => {
    setCandidate(newCandidate);
    setUnfocusCount(0);
    setCurrentSection('typing');
  };

  const handleCompleteTyping = (result: TypingResult) => {
    setTypingResult(result);
    setCompletedSections((prev) => new Set(prev).add('typing'));
    setCurrentSection('navigation');
  };

  const handleCompleteNavigation = (result: QuizResult) => {
    setNavigationResult(result);
    setCompletedSections((prev) => new Set(prev).add('navigation'));
    setCurrentSection('data-entry');
  };

  const handleCompleteDataEntry = (result: DataEntrySubmission) => {
    setDataEntryResult(result);
    setCompletedSections((prev) => new Set(prev).add('data-entry'));
    setCurrentSection('multitasking');
  };

  const handleCompleteMultitasking = (result: MultitaskingMetric) => {
    setMultitaskingResult(result);
    setCompletedSections((prev) => new Set(prev).add('multitasking'));
    setCurrentSection('troubleshooting');
  };

  const handleCompleteTroubleshooting = (result: QuizResult) => {
    setTroubleshootingResult(result);
    setCompletedSections((prev) => new Set(prev).add('troubleshooting'));

    const activeCandidate = candidate || {
      id: 'CAN-' + Math.floor(100000 + Math.random() * 900000),
      fullName: 'Jordan Miller',
      email: 'jordan.miller@example.com',
      phone: '(555) 349-8812',
      targetPosition: 'Outbound Telemarketer / Sales Representative',
      startedAt: new Date().toISOString(),
      unfocusCount
    };

    const activeTyping = typingResult || {
      wpm: 45,
      accuracy: 94,
      errors: 2,
      cpm: 225,
      durationSeconds: 60,
      completed: true
    };

    const activeNav = navigationResult || {
      answers: { 'nav-1': 'B', 'nav-2': 'C', 'nav-3': 'B', 'nav-4': 'C', 'nav-5': 'A', 'nav-6': 'B', 'nav-7': 'C', 'nav-8': 'A', 'nav-9': 'B', 'nav-10': 'B', 'nav-11': 'B' },
      score: 11,
      total: 11,
      percentage: 100,
      timeSpentSeconds: 120,
      completed: true
    };

    const activeDataEntry = dataEntryResult || {
      candidateRecords: {
        'rec-1': { customerName: 'Johnathan Davies', company: 'Vanguard Logistics', phoneNumber: '555-684-2190', email: 'j.davies@vanguardlogistics.com', streetAddress: '420 Wyckoff Avenue, Suite 350', appointment: 'September 18, 2026, 2:00 PM' }
      },
      replays: { 'rec-1': 1 },
      accuracyScore: 96,
      totalFields: 18,
      correctFields: 17,
      fieldErrors: [],
      completed: true,
      timeSpentSeconds: 240
    };

    const activeMulti = multitaskingResult || {
      chatResolved: 5,
      chatTotal: 5,
      ticketsProcessed: 6,
      ticketsTotal: 6,
      verificationsDone: 6,
      verificationsTotal: 6,
      accuracyPercentage: 90,
      avgResponseTimeSec: 65,
      overallScore: 92,
      completed: true,
      objectionsResolved: 5,
      dispositionsHandled: 6,
      appointmentsBooked: 6
    };

    const report = computeOverallAssessment(
      activeCandidate,
      activeTyping,
      activeNav,
      activeDataEntry,
      activeMulti,
      result
    );
    setFinalReport(report);
    saveAssessmentReport(report);
    setReports(getAllAssessmentReports());

    setCurrentSection('results');
  };

  const handleRetest = () => {
    setCandidate(null);
    setTypingResult(null);
    setNavigationResult(null);
    setDataEntryResult(null);
    setMultitaskingResult(null);
    setTroubleshootingResult(null);
    setFinalReport(null);
    setCompletedSections(new Set());
    setUnfocusCount(0);
    setCurrentSection('onboarding');
  };

  const handleDeleteReport = (candidateId: string) => {
    const updated = reports.filter((r) => r.candidate.id !== candidateId);
    setReports(updated);
    localStorage.setItem('tech_assessment_hr_reports_v1', JSON.stringify(updated));
  };

  const handleClearAllReports = () => {
    setReports([]);
    localStorage.removeItem('tech_assessment_hr_reports_v1');
  };

  // ── PIN Gate: shown when navigating to /#/hrportal before unlock
  if (showPinGate) {
    return (
      <HrPinGate
        onUnlock={() => {
          // Refresh from localStorage immediately so newly submitted reports appear
          setReports(getAllAssessmentReports());
          setHrUnlocked(true);
        }}
        onCancel={() => {
          window.location.hash = '';
          setHrUnlocked(false);
        }}
      />
    );
  }

  // ── HR Dashboard: shown after unlock on /#/hrportal
  if (showHrPortal) {
    return (
      <div className="app-container">
        <Navbar
          currentSection={currentSection}
          candidate={null}
          isAdminView={true}
          unfocusCount={0}
        />
        <main className="main-content">
          <HrAdminDashboard
            reports={reports}
            onDeleteReport={handleDeleteReport}
            onClearAll={handleClearAllReports}
            onBackToAssessment={() => {
              setHrUnlocked(false);
              window.location.hash = '';
            }}
            syncStatus={hrSyncStatus}
            lastSynced={hrLastSynced}
            onRefreshReports={async () => {
              setHrSyncStatus('syncing');
              try {
                const merged = await syncReportsWithSupabase();
                setReports(merged.length > 0 ? merged : getAllAssessmentReports());
                setHrLastSynced(new Date());
                setHrSyncStatus('live');
              } catch {
                setHrSyncStatus('offline');
              }
            }}
          />
        </main>
      </div>
    );
  }

  // ── Candidate Assessment Flow (default)
  return (
    <div className="app-container">
      <Navbar
        currentSection={currentSection}
        candidate={candidate}
        unfocusCount={unfocusCount}
      />

      <main className="main-content">
        <Stepper
          currentSection={currentSection}
          completedSections={completedSections}
          onSelectSection={(sec) => setCurrentSection(sec)}
        />

        {currentSection === 'onboarding' && (
          <CandidateRegistration onStartAssessment={handleStartAssessment} />
        )}

        {currentSection === 'typing' && (
          <TypingTest onComplete={handleCompleteTyping} />
        )}

        {currentSection === 'navigation' && (
          <ComputerNavigationTest onComplete={handleCompleteNavigation} />
        )}

        {currentSection === 'data-entry' && (
          <DataEntryTest onComplete={handleCompleteDataEntry} />
        )}

        {currentSection === 'multitasking' && (
          <MultitaskingTest onComplete={handleCompleteMultitasking} />
        )}

        {currentSection === 'troubleshooting' && (
          <TroubleshootingTest onComplete={handleCompleteTroubleshooting} />
        )}

        {currentSection === 'results' && finalReport && (
          <CandidateResults
            report={finalReport}
            onRetest={handleRetest}
            onGoToAdmin={() => {
              window.location.hash = '#/hrportal';
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;

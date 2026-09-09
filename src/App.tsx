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

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<TestSectionId>('onboarding');
  const [completedSections, setCompletedSections] = useState<Set<TestSectionId>>(new Set());
  const [isAdminView, setIsAdminView] = useState(false);

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
          targetPosition: 'Technical Support Specialist',
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
            'rec-2': { customerName: 'Meredith Calhoun', company: 'Apex BioSystems', phoneNumber: '555-704-5829', email: 'mcalhoun@apexbio.org', streetAddress: '1250 Pszczolka Boulevard, Building B', appointment: 'October 05, 2026, 11:30 AM' },
            'rec-3': { customerName: 'Gregory Braithwaite', company: 'Sterling Financial Partners', phoneNumber: '555-916-4382', email: 'g.braithwaite@sterlingpartners.net', streetAddress: '950 Ksiezopolski Drive, Suite 500', appointment: 'November 12, 2026, 4:15 PM' },
            'rec-4': { customerName: 'Stephanie Vandeberg', company: 'CloudScale Solutions', phoneNumber: '555-831-6724', email: 'svandeberg@cloudscale.io', streetAddress: '310 Queuencelle Court, Floor 4', appointment: 'December 02, 2026, 9:00 AM' }
          },
          replays: { 'rec-1': 1, 'rec-2': 1, 'rec-3': 2, 'rec-4': 1 },
          accuracyScore: 100,
          totalFields: 24,
          correctFields: 24,
          fieldErrors: [],
          completed: true,
          timeSpentSeconds: 310
        },
        multitasking: {
          chatResolved: 4,
          chatTotal: 4,
          ticketsProcessed: 5,
          ticketsTotal: 5,
          verificationsDone: 4,
          verificationsTotal: 4,
          accuracyPercentage: 92,
          avgResponseTimeSec: 68,
          overallScore: 94,
          completed: true
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
      if (candidate && currentSection !== 'onboarding' && currentSection !== 'results' && !isAdminView) {
        setUnfocusCount((prev) => {
          const next = prev + 1;
          setCandidate((cand) => (cand ? { ...cand, unfocusCount: next } : null));
          return next;
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [candidate, currentSection, isAdminView]);

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
      targetPosition: 'Technical Support Specialist',
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
      totalFields: 24,
      correctFields: 23,
      fieldErrors: [],
      completed: true,
      timeSpentSeconds: 240
    };

    const activeMulti = multitaskingResult || {
      chatResolved: 4,
      chatTotal: 4,
      ticketsProcessed: 5,
      ticketsTotal: 5,
      verificationsDone: 4,
      verificationsTotal: 4,
      accuracyPercentage: 90,
      avgResponseTimeSec: 65,
      overallScore: 92,
      completed: true
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

  return (
    <div className="app-container">
      <Navbar
        currentSection={currentSection}
        candidate={candidate}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        unfocusCount={unfocusCount}
      />

      <main className="main-content">
        {isAdminView ? (
          <HrAdminDashboard
            reports={reports}
            onDeleteReport={handleDeleteReport}
            onClearAll={handleClearAllReports}
            onBackToAssessment={() => {
              setIsAdminView(false);
            }}
            onRefreshReports={() => {
              setReports(getAllAssessmentReports());
            }}
          />
        ) : (
          <>
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
                onGoToAdmin={() => setIsAdminView(true)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;

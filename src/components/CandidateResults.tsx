import React, { useEffect } from 'react';
import { CandidateAssessmentReport } from '../types/assessment';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  RotateCcw,
  Keyboard,
  Compass,
  Headphones,
  Layers,
  Wrench,
  User,
  Calendar,
  FileCheck
} from 'lucide-react';

interface CandidateResultsProps {
  report: CandidateAssessmentReport;
  onRetest: () => void;
  onGoToAdmin: () => void;
}

export const CandidateResults: React.FC<CandidateResultsProps> = ({
  report,
  onRetest,
  onGoToAdmin
}) => {
  const { candidate, typing, navigation, dataEntry, multitasking, troubleshooting, overallScore, overallStatus } = report;

  useEffect(() => {
    if (overallStatus === 'PASSED') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully if canvas is unavailable
      }
    }
  }, [overallStatus]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'PASSED':
        return (
          <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
            <CheckCircle2 size={16} /> Benchmark Passed
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
            <AlertTriangle size={16} /> HR Review Required
          </span>
        );
      default:
        return (
          <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
            <XCircle size={16} /> Needs Retest
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Candidate Assessment Evaluation Certificate
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} /> Print / Save PDF
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onGoToAdmin}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <FileCheck size={15} /> HR Portal View
          </button>
        </div>
      </div>

      {/* Main Printable Scorecard */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Certificate Header */}
        <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
              <Award size={18} /> Official Assessment Report
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.3rem' }}>
              {candidate.fullName}
            </h1>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} /> ID: <strong>{candidate.id}</strong>
              </span>
              <span>Role: <strong>{candidate.targetPosition}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> {new Date(report.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Final Competency Status
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Overall Weighted Score Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>
              Composite Technical Index
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {overallScore}
              <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Calculated across Typing Speed, System Navigation, Audio Entry, Multitasking & Troubleshooting.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Typing Target (35+ WPM):</span>
              <strong style={{ color: typing.wpm >= 35 ? '#34d399' : '#f87171' }}>
                {typing.wpm} WPM {typing.wpm >= 35 ? '✓' : '✗'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Typing Accuracy (≥90%):</span>
              <strong style={{ color: typing.accuracy >= 90 ? '#34d399' : '#f87171' }}>
                {typing.accuracy}% {typing.accuracy >= 90 ? '✓' : '✗'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Unfocus / Tab Switches:</span>
              <strong style={{ color: candidate.unfocusCount > 0 ? '#fcd34d' : '#34d399' }}>
                {candidate.unfocusCount || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Section-by-Section Performance Cards */}
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem' }}>
          Detailed Module Scores
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {/* Module 1: Typing */}
          <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Keyboard size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.95rem' }}>1. Typing Test</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {typing.wpm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>WPM</span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Accuracy: <strong style={{ color: '#fff' }}>{typing.accuracy}%</strong> • Errors: <strong style={{ color: '#fff' }}>{typing.errors}</strong>
            </div>
            {typing.externalScoreSubmitted && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#a5b4fc' }}>
                TypingTest.com Verified
              </div>
            )}
          </div>

          {/* Module 2: Computer Navigation */}
          <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Compass size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.95rem' }}>2. Computer Navigation</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {navigation.percentage}%
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Score: <strong style={{ color: '#fff' }}>{navigation.score}</strong> / {navigation.total} correct
            </div>
          </div>

          {/* Module 3: Audio Data Entry */}
          <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Headphones size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.95rem' }}>3. Audio Data Entry</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {dataEntry.accuracyScore}%
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Fields: <strong style={{ color: '#fff' }}>{dataEntry.correctFields}</strong> / {dataEntry.totalFields} exact match
            </div>
          </div>

          {/* Module 4: Multitasking Simulation */}
          <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Layers size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.95rem' }}>4. Outbound Sales Sim</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {multitasking.overallScore}%
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Objections: <strong style={{ color: '#fff' }}>{multitasking.chatResolved}</strong> • Dispositions: <strong style={{ color: '#fff' }}>{multitasking.ticketsProcessed}</strong> • Appts: <strong style={{ color: '#fff' }}>{multitasking.verificationsDone}</strong>
            </div>
          </div>

          {/* Module 5: Troubleshooting */}
          <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Wrench size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.95rem' }}>5. Troubleshooting</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {troubleshooting.percentage}%
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Score: <strong style={{ color: '#fff' }}>{troubleshooting.score}</strong> / {troubleshooting.total} scenarios
            </div>
          </div>
        </div>

        {/* Footer Signature & Timestamp */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <div>
            System Generated Assessment Key: <code>{candidate.id}-{Date.now().toString().slice(-6)}</code>
          </div>
          <div className="no-print">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={onRetest}
            >
              <RotateCcw size={13} /> Retake Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

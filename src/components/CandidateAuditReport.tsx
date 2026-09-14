import React, { useRef, useState } from 'react';
import { CandidateAssessmentReport, DataEntryRecord } from '../types/assessment';
import { DATA_ENTRY_RECORDINGS } from '../data/dataEntryRecordings';
import { NAVIGATION_QUESTIONS } from '../data/navigationQuestions';
import { TROUBLESHOOTING_QUESTIONS } from '../data/troubleshootingQuestions';
import { evaluateFieldMatch } from '../utils/grading';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Keyboard,
  Compass,
  Headphones,
  Layers,
  Wrench,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Target,
  TrendingUp,
  Flag,
  FileText,
  Eye,
  BarChart2,
  Award,
  AlertCircle,
  Check,
  X,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CandidateAuditReportProps {
  report: CandidateAssessmentReport;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ScoreBar: React.FC<{
  value: number;
  max?: number;
  color?: string;
  height?: number;
  animate?: boolean;
}> = ({ value, max = 100, color = '#6366f1', height = 8 }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor =
    pct >= 80 ? '#10b981' :
    pct >= 60 ? '#f59e0b' :
    '#ef4444';

  return (
    <div style={{
      width: '100%', height, borderRadius: 99,
      background: 'rgba(255,255,255,0.07)', overflow: 'hidden'
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        borderRadius: 99,
        background: color === 'auto'
          ? `linear-gradient(90deg, ${barColor}, ${barColor}cc)`
          : `linear-gradient(90deg, ${color}, ${color}cc)`,
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
    </div>
  );
};

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  score?: number;
  scoreLabel?: string;
  passed?: boolean;
}> = ({ icon, title, subtitle, score, scoreLabel, passed }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.25rem 1.5rem', marginBottom: 0,
    background: 'rgba(99, 102, 241, 0.06)',
    borderBottom: '1px solid var(--border-subtle)',
    borderRadius: '12px 12px 0 0'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    {score !== undefined && (
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '1.6rem', fontWeight: 800,
          color: score >= 80 ? '#34d399' : score >= 60 ? '#fcd34d' : '#f87171'
        }}>
          {score}{scoreLabel || '%'}
        </div>
        {passed !== undefined && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
            padding: '0.15rem 0.55rem', borderRadius: 99,
            background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: passed ? '#34d399' : '#f87171',
            border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            {passed ? 'PASS' : 'FAIL'}
          </span>
        )}
      </div>
    )}
  </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)'
  }}>
    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
    <span style={{
      fontSize: '0.85rem', fontWeight: 600, color: '#fff',
      fontFamily: mono ? 'var(--font-mono)' : undefined
    }}>{value}</span>
  </div>
);

const MatchBadge: React.FC<{ matched: boolean }> = ({ matched }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
    borderRadius: 99,
    background: matched ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
    color: matched ? '#34d399' : '#f87171',
    border: `1px solid ${matched ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
  }}>
    {matched ? <Check size={10} /> : <X size={10} />}
    {matched ? 'Match' : 'Mismatch'}
  </span>
);

const RiskFlag: React.FC<{ level: 'high' | 'medium' | 'low'; message: string }> = ({ level, message }) => {
  const colors = {
    high: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#f87171', icon: '#ef4444' },
    medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d', icon: '#f59e0b' },
    low: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', text: '#6ee7b7', icon: '#10b981' },
  };
  const c = colors[level];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
      padding: '0.65rem 0.9rem', borderRadius: 8,
      background: c.bg, border: `1px solid ${c.border}`, marginBottom: '0.5rem'
    }}>
      <AlertCircle size={14} color={c.icon} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: '0.82rem', color: c.text }}>{message}</span>
    </div>
  );
};

// ─── Collapsible Breakdown Toggles ───────────────────────────────────────────

const NavBreakdownToggle: React.FC<{ navigation: import('../types/assessment').QuizResult }> = ({ navigation }) => {
  const [open, setOpen] = useState(false);
  const wrong = NAVIGATION_QUESTIONS.filter(q => navigation.answers[q.id] !== q.correctOptionId).length;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.65rem 0.9rem', borderRadius: 8,
          background: open ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
          color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.18s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--text-muted)'
          }}>
            Question-by-Question Breakdown
          </span>
          <span style={{
            fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: 99,
            background: wrong > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            color: wrong > 0 ? '#f87171' : '#34d399',
            border: `1px solid ${wrong > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
          }}>
            {NAVIGATION_QUESTIONS.length} questions · {wrong} incorrect
          </span>
        </span>
        {open ? <ChevronUp size={15} color="var(--text-dim)" /> : <ChevronDown size={15} color="var(--text-dim)" />}
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.65rem' }}>
          {NAVIGATION_QUESTIONS.map((q, idx) => {
            const chosen = navigation.answers[q.id];
            const isCorrect = chosen === q.correctOptionId;
            const chosenOption = q.options.find(o => o.id === chosen);
            const correctOption = q.options.find(o => o.id === q.correctOptionId);
            return (
              <div key={q.id} style={{
                padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.82rem',
                background: isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 6 }}>Q{idx + 1}.</span>
                    <span style={{ color: '#fff' }}>{q.question}</span>
                  </div>
                  <MatchBadge matched={isCorrect} />
                </div>
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '1.5rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                  <span style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                    Selected: <strong>{chosen || 'None'}</strong>{chosenOption ? ` — ${chosenOption.text}` : ''}
                  </span>
                  {!isCorrect && correctOption && (
                    <span style={{ color: '#34d399' }}>
                      Correct: <strong>{q.correctOptionId}</strong> — {correctOption.text}
                    </span>
                  )}
                </div>
                {!isCorrect && q.explanation && (
                  <div style={{ marginTop: '0.35rem', color: 'var(--text-dim)', fontSize: '0.76rem', fontStyle: 'italic' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TsBreakdownToggle: React.FC<{ troubleshooting: import('../types/assessment').QuizResult }> = ({ troubleshooting }) => {
  const [open, setOpen] = useState(false);
  const wrong = TROUBLESHOOTING_QUESTIONS.filter(q => troubleshooting.answers[q.id] !== q.correctOptionId).length;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.65rem 0.9rem', borderRadius: 8,
          background: open ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
          color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.18s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--text-muted)'
          }}>
            Scenario-by-Scenario Breakdown
          </span>
          <span style={{
            fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: 99,
            background: wrong > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            color: wrong > 0 ? '#f87171' : '#34d399',
            border: `1px solid ${wrong > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
          }}>
            {TROUBLESHOOTING_QUESTIONS.length} scenarios · {wrong} incorrect
          </span>
        </span>
        {open ? <ChevronUp size={15} color="var(--text-dim)" /> : <ChevronDown size={15} color="var(--text-dim)" />}
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.65rem' }}>
          {TROUBLESHOOTING_QUESTIONS.map((q, idx) => {
            const chosen = troubleshooting.answers[q.id];
            const isCorrect = chosen === q.correctOptionId;
            const chosenOption = q.options.find(o => o.id === chosen);
            const correctOption = q.options.find(o => o.id === q.correctOptionId);
            return (
              <div key={q.id} style={{
                padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.82rem',
                background: isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 6 }}>S{idx + 1}.</span>
                    <span style={{ color: '#fff' }}>{q.question}</span>
                  </div>
                  <MatchBadge matched={isCorrect} />
                </div>
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '1.5rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                  <span style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                    Selected: <strong>{chosen || 'None'}</strong>{chosenOption ? ` — ${chosenOption.text}` : ''}
                  </span>
                  {!isCorrect && correctOption && (
                    <span style={{ color: '#34d399' }}>
                      Correct: <strong>{q.correctOptionId}</strong> — {correctOption.text}
                    </span>
                  )}
                </div>
                {!isCorrect && q.explanation && (
                  <div style={{ marginTop: '0.35rem', color: 'var(--text-dim)', fontSize: '0.76rem', fontStyle: 'italic' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CandidateAuditReport: React.FC<CandidateAuditReportProps> = ({ report, onBack }) => {

  const printRef = useRef<HTMLDivElement>(null);
  const { candidate, typing, navigation, dataEntry, multitasking, troubleshooting, overallScore, overallStatus, generatedAt } = report;

  const durationMin = candidate.startedAt && candidate.completedAt
    ? Math.round((new Date(candidate.completedAt).getTime() - new Date(candidate.startedAt).getTime()) / 60000)
    : null;

  const totalReplays = Object.values(dataEntry.replays).reduce((a, b) => a + b, 0);

  // ── Risk Flags ──────────────────────────────────────────────────────────────
  const risks: { level: 'high' | 'medium' | 'low'; message: string }[] = [];

  if ((candidate.unfocusCount ?? 0) >= 3)
    risks.push({ level: 'high', message: `High tab-switch count (${candidate.unfocusCount}×): Candidate may have consulted external resources during assessment.` });
  else if ((candidate.unfocusCount ?? 0) >= 1)
    risks.push({ level: 'medium', message: `${candidate.unfocusCount} tab switch(es) detected. Candidate navigated away briefly during the test.` });
  else
    risks.push({ level: 'low', message: 'No tab switches detected. Focus was maintained throughout the assessment.' });

  if (typing.wpm < 35)
    risks.push({ level: 'high', message: `Typing speed (${typing.wpm} WPM) is below the 35 WPM minimum required for outbound telemarketing role.` });
  if (typing.accuracy < 90)
    risks.push({ level: 'medium', message: `Typing accuracy (${typing.accuracy}%) falls below the 90% benchmark — may affect CRM data quality.` });
  if (dataEntry.accuracyScore < 75)
    risks.push({ level: 'high', message: `Audio transcription accuracy (${dataEntry.accuracyScore}%) is critically low. Candidate may struggle with prospect data capture.` });
  if (totalReplays >= 6)
    risks.push({ level: 'medium', message: `Audio replayed ${totalReplays}× — suggests difficulty processing spoken information at normal speed.` });
  if (navigation.percentage < 70)
    risks.push({ level: 'medium', message: `Computer navigation score (${navigation.percentage}%) below threshold — candidate may need additional system training.` });
  if (troubleshooting.percentage < 70)
    risks.push({ level: 'medium', message: `Troubleshooting score (${troubleshooting.percentage}%) below 70% — soft-skills / process judgment needs development.` });
  if (multitasking.overallScore < 60)
    risks.push({ level: 'high', message: `Multitasking simulation score (${multitasking.overallScore}%) is critically low. Candidate struggled to juggle simultaneous outbound tasks.` });

  // ── HR Recommendation ───────────────────────────────────────────────────────
  let recommendation = '';
  let recommendationColor = '';
  if (overallStatus === 'PASSED') {
    recommendation = `${candidate.fullName} meets or exceeds all performance benchmarks for the Outbound Telemarketer role. We recommend proceeding to the next hiring stage (panel interview or offer). Particular strengths include audio transcription accuracy and overall composite score of ${overallScore}%.`;
    recommendationColor = '#34d399';
  } else if (overallStatus === 'REVIEW_REQUIRED') {
    recommendation = `${candidate.fullName} demonstrates partial qualification. Specific areas — especially ${typing.wpm < 35 ? 'typing speed' : dataEntry.accuracyScore < 75 ? 'audio data entry' : 'multitasking simulation'} — fall below target thresholds. Recommend a structured follow-up interview to assess readiness and determine whether additional training would bring performance to benchmark.`;
    recommendationColor = '#fcd34d';
  } else {
    recommendation = `${candidate.fullName} does not meet the minimum performance benchmarks at this time. Composite score of ${overallScore}% is below the 65% threshold. Recommend a re-assessment after a minimum 2-week remediation period focused on typing speed, CRM data entry accuracy, and prospecting call handling.`;
    recommendationColor = '#f87171';
  }

  const handlePrint = () => window.print();

  const fieldLabels: Record<string, string> = {
    customerName: 'Prospect Full Name',
    company: 'Company Name',
    phoneNumber: 'Direct Phone Number',
    email: 'Work Email Address',
    streetAddress: 'Street Address',
    appointment: 'Appointment Date & Time'
  };

  // Typing: score components
  const wpmScore = Math.min(100, Math.round((typing.wpm / 45) * 100));
  const typingComposite = Math.round(wpmScore * 0.5 + typing.accuracy * 0.5);

  return (
    <div ref={printRef} style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Top Action Bar ─────────────────────────────────────────── */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap'
      }}>
        <button type="button" className="btn btn-secondary" onClick={onBack}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={15} /> Back to Candidate List
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Report generated {new Date(generatedAt).toLocaleString()}
          </span>
          <button type="button" className="btn btn-primary" onClick={handlePrint}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Printer size={15} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 0: Report Header                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '2rem 2.5rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.75rem', marginBottom: '1.75rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#818cf8', marginBottom: '0.5rem'
            }}>
              <FileText size={13} /> Candidate Assessment Audit Report
            </div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>{candidate.fullName}</h1>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={13} /> ID: <strong style={{ color: '#fff' }}>{candidate.id}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={13} /> {candidate.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={13} /> {candidate.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Target size={13} /> {candidate.targetPosition}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Competency Status
            </div>
            {overallStatus === 'PASSED' && (
              <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}>
                <CheckCircle2 size={15} /> Benchmark Passed
              </span>
            )}
            {overallStatus === 'REVIEW_REQUIRED' && (
              <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}>
                <AlertTriangle size={15} /> HR Review Required
              </span>
            )}
            {overallStatus === 'NEEDS_RETEST' && (
              <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}>
                <XCircle size={15} /> Needs Retest
              </span>
            )}
            <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
              {new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Composite Score Banner */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem',
          alignItems: 'center', flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', margin: '0 auto',
              background: `conic-gradient(
                ${overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'} ${overallScore * 3.6}deg,
                rgba(255,255,255,0.07) 0deg
              )`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(99,102,241,0.2)'
            }}>
              <div style={{
                width: 86, height: 86, borderRadius: '50%',
                background: '#0f172a',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{overallScore}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</div>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
              Composite Score
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Typing Speed & Accuracy (20%)', value: typingComposite, target: 80 },
              { label: 'Computer Navigation (20%)', value: navigation.percentage, target: 70 },
              { label: 'Audio Data Entry (25%)', value: dataEntry.accuracyScore, target: 75 },
              { label: 'Outbound Sales Sim (15%)', value: multitasking.overallScore, target: 60 },
              { label: 'Troubleshooting (20%)', value: troubleshooting.percentage, target: 70 },
            ].map(({ label, value, target }) => (
              <div key={label}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.8rem', marginBottom: '0.3rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{
                    fontWeight: 700,
                    color: value >= target ? '#34d399' : value >= target * 0.85 ? '#fcd34d' : '#f87171'
                  }}>{value}%</span>
                </div>
                <ScoreBar value={value} color="auto" height={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {[
            { label: 'Started', value: candidate.startedAt ? new Date(candidate.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—', icon: <Clock size={14} /> },
            { label: 'Duration', value: durationMin !== null ? `${durationMin} min` : '—', icon: <TrendingUp size={14} /> },
            { label: 'Tab Switches', value: `${candidate.unfocusCount ?? 0}×`, icon: <Eye size={14} />, warn: (candidate.unfocusCount ?? 0) > 0 },
            { label: 'Audio Replays', value: `${totalReplays}×`, icon: <Headphones size={14} /> },
            { label: 'Fields Verified', value: `${dataEntry.correctFields} / ${dataEntry.totalFields}`, icon: <CheckCircle2 size={14} /> },
            { label: 'Avg Response', value: `${multitasking.avgResponseTimeSec}s`, icon: <Zap size={14} /> },
          ].map(({ label, value, icon, warn }) => (
            <div key={label} style={{
              padding: '0.75rem 1rem', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--text-dim)', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                {icon} {label}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: warn ? '#fcd34d' : '#fff' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Typing Test                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Keyboard size={18} />}
          title="Module 1 · Typing Test"
          subtitle="Speed and accuracy benchmark — minimum 35 WPM, 90% accuracy required"
          score={typing.wpm}
          scoreLabel=" WPM"
          passed={typing.wpm >= 35 && typing.accuracy >= 90}
        />
        <div style={{ padding: '1.5rem 1.5rem 1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            {/* Left: metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <InfoRow label="Words Per Minute (WPM)" value={
                <span style={{ color: typing.wpm >= 35 ? '#34d399' : '#f87171' }}>
                  {typing.wpm} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(req: 35+)</span>
                </span>
              } />
              <InfoRow label="Typing Accuracy" value={
                <span style={{ color: typing.accuracy >= 90 ? '#34d399' : '#f87171' }}>
                  {typing.accuracy}% <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(req: 90%+)</span>
                </span>
              } />
              <InfoRow label="Characters Per Minute (CPM)" value={typing.cpm} />
              <InfoRow label="Total Errors" value={
                <span style={{ color: typing.errors === 0 ? '#34d399' : typing.errors <= 5 ? '#fcd34d' : '#f87171' }}>
                  {typing.errors}
                </span>
              } />
              <InfoRow label="Test Duration" value={`${typing.durationSeconds}s`} />
              <InfoRow label="Verification Method" value={
                typing.externalScoreSubmitted ? (
                  <span style={{ color: '#a5b4fc' }}>TypingTest.com Verified ✓</span>
                ) : 'Built-in Engine'
              } />
            </div>

            {/* Right: score bars */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>WPM vs Benchmark (45 WPM = 100%)</span>
                  <strong style={{ color: '#fff' }}>{wpmScore}%</strong>
                </div>
                <ScoreBar value={wpmScore} color="auto" height={10} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Accuracy</span>
                  <strong style={{ color: '#fff' }}>{typing.accuracy}%</strong>
                </div>
                <ScoreBar value={typing.accuracy} color="auto" height={10} />
              </div>
              <div style={{
                marginTop: '1.25rem', padding: '0.85rem 1rem', borderRadius: 10,
                background: typingComposite >= 80 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${typingComposite >= 80 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Module Composite Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: typingComposite >= 80 ? '#34d399' : '#f87171' }}>
                  {typingComposite}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>WPM (50%) + Accuracy (50%)</div>
              </div>
            </div>
          </div>

          {/* Benchmarks grid */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: '35+ WPM', pass: typing.wpm >= 35, detail: `Scored ${typing.wpm} WPM` },
              { label: '90%+ Accuracy', pass: typing.accuracy >= 90, detail: `Scored ${typing.accuracy}%` },
              { label: '≤5 Errors', pass: typing.errors <= 5, detail: `${typing.errors} error${typing.errors !== 1 ? 's' : ''}` },
            ].map(({ label, pass, detail }) => (
              <div key={label} style={{
                flex: '1 1 150px', padding: '0.6rem 0.9rem', borderRadius: 8,
                background: pass ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
                border: `1px solid ${pass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {pass ? <CheckCircle2 size={16} color="#34d399" /> : <XCircle size={16} color="#f87171" />}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: pass ? '#34d399' : '#f87171' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Computer Navigation                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Compass size={18} />}
          title="Module 2 · Computer Navigation Quiz"
          subtitle="Basic computer literacy and system navigation — 70% passing threshold"
          score={navigation.percentage}
          passed={navigation.percentage >= 70}
        />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <div>
              <InfoRow label="Score" value={`${navigation.score} / ${navigation.total}`} />
              <InfoRow label="Percentage" value={`${navigation.percentage}%`} />
              <InfoRow label="Time Spent" value={`${Math.floor(navigation.timeSpentSeconds / 60)}m ${navigation.timeSpentSeconds % 60}s`} />
              <InfoRow label="Avg Per Question" value={`${Math.round(navigation.timeSpentSeconds / navigation.total)}s`} />
            </div>
            <div>
              <div style={{ marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score Progress</div>
              <ScoreBar value={navigation.percentage} color="auto" height={12} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <span>0%</span><span style={{ color: '#f59e0b' }}>70% threshold</span><span>100%</span>
              </div>
            </div>
          </div>

          {/* Q&A breakdown — collapsible */}
          <NavBreakdownToggle navigation={navigation} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Audio Data Entry                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Headphones size={18} />}
          title="Module 3 · Fast-Paced Prospect Audio Transcription"
          subtitle="3 call recordings — name, company, phone, email, address, appointment (18 fields total)"
          score={dataEntry.accuracyScore}
          passed={dataEntry.accuracyScore >= 75}
        />
        <div style={{ padding: '1.5rem' }}>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Accuracy Score', value: `${dataEntry.accuracyScore}%`, color: dataEntry.accuracyScore >= 75 ? '#34d399' : '#f87171' },
              { label: 'Fields Correct', value: `${dataEntry.correctFields} / ${dataEntry.totalFields}`, color: '#fff' },
              { label: 'Total Replays', value: `${totalReplays}×`, color: totalReplays >= 6 ? '#fcd34d' : '#fff' },
              { label: 'Time Spent', value: `${Math.floor(dataEntry.timeSpentSeconds / 60)}m ${dataEntry.timeSpentSeconds % 60}s`, color: '#fff' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '0.85rem', borderRadius: 10, textAlign: 'center',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Per-recording field diffs */}
          {DATA_ENTRY_RECORDINGS.map((rec) => {
            const candidateRec = dataEntry.candidateRecords[rec.id] || {};
            const expected = rec.expectedData;
            const replays = dataEntry.replays[rec.id] || 0;
            const recFields = (['customerName', 'company', 'phoneNumber', 'email', 'streetAddress', 'appointment'] as (keyof DataEntryRecord)[]);
            const recCorrect = recFields.filter(f => evaluateFieldMatch(f, expected[f], candidateRec[f] as string)).length;

            return (
              <div key={rec.id} style={{
                marginBottom: '1.25rem', borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}>
                {/* Recording header */}
                <div style={{
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(99,102,241,0.05)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#a5b4fc' }}>{rec.title}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{rec.callerLabel}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      🔁 Replayed {replays}×
                    </span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 99,
                      background: recCorrect === 6 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                      color: recCorrect === 6 ? '#34d399' : '#f87171',
                      border: `1px solid ${recCorrect === 6 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>
                      {recCorrect} / 6 fields
                    </span>
                  </div>
                </div>

                {/* Field table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['Field', 'Expected Answer', 'Candidate Input', 'Result'].map(h => (
                        <th key={h} style={{
                          padding: '0.6rem 1rem', textAlign: 'left',
                          fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: 'var(--text-dim)',
                          borderBottom: '1px solid var(--border-subtle)'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recFields.map((f) => {
                      const expVal = expected[f] as string;
                      const actVal = (candidateRec[f] as string) || '';
                      const isMatch = evaluateFieldMatch(f, expVal, actVal);
                      return (
                        <tr key={f} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: isMatch ? 'transparent' : 'rgba(239,68,68,0.03)'
                        }}>
                          <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: '#c7d2fe' }}>
                            {fieldLabels[f]}
                          </td>
                          <td style={{ padding: '0.7rem 1rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {expVal}
                          </td>
                          <td style={{ padding: '0.7rem 1rem', color: isMatch ? '#fff' : '#f87171', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {actVal || <em style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-sans)' }}>blank</em>}
                          </td>
                          <td style={{ padding: '0.7rem 1rem' }}>
                            <MatchBadge matched={isMatch} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Outbound Sales Multitasking Simulation              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Layers size={18} />}
          title="Module 4 · Outbound Sales Multitasking Simulation"
          subtitle="Live objection handling, call dispositioning, and appointment booking — 60% threshold"
          score={multitasking.overallScore}
          passed={multitasking.overallScore >= 60}
        />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            {/* Left: per-channel stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <InfoRow label="Overall Sim Score" value={
                <span style={{ color: multitasking.overallScore >= 80 ? '#34d399' : multitasking.overallScore >= 60 ? '#fcd34d' : '#f87171' }}>
                  {multitasking.overallScore}%
                </span>
              } />
              <InfoRow label="Decision Accuracy" value={`${multitasking.accuracyPercentage}%`} />
              <InfoRow label="Avg Response Time" value={`${multitasking.avgResponseTimeSec}s`} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <InfoRow label="Objections Resolved" value={
                `${multitasking.objectionsResolved ?? multitasking.chatResolved} / ${multitasking.chatTotal}`
              } />
              <InfoRow label="Call Dispositions Logged" value={
                `${multitasking.dispositionsHandled ?? multitasking.ticketsProcessed} / ${multitasking.ticketsTotal}`
              } />
              <InfoRow label="Appointments Booked" value={
                `${multitasking.appointmentsBooked ?? multitasking.verificationsDone} / ${multitasking.verificationsTotal}`
              } />
            </div>
          </div>

          {/* Per-channel score bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              {
                label: 'Channel 1 — Objection Handling & Rebuttals',
                done: multitasking.objectionsResolved ?? multitasking.chatResolved,
                total: multitasking.chatTotal,
                description: 'Handled live prospect objections during simulated cold calls'
              },
              {
                label: 'Channel 2 — Rapid Call Dispositioning',
                done: multitasking.dispositionsHandled ?? multitasking.ticketsProcessed,
                total: multitasking.ticketsTotal,
                description: 'Logged call outcomes with correct disposition codes'
              },
              {
                label: 'Channel 3 — Calendar Slot Matching (Appointments)',
                done: multitasking.appointmentsBooked ?? multitasking.verificationsDone,
                total: multitasking.verificationsTotal,
                description: 'Matched prospect availability and booked consultation slots'
              },
            ].map(({ label, done, total, description }) => {
              const pct = Math.round((done / total) * 100);
              return (
                <div key={label} style={{
                  padding: '0.9rem 1.1rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{description}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <strong style={{ color: pct >= 80 ? '#34d399' : pct >= 60 ? '#fcd34d' : '#f87171' }}>{done}/{total}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{pct}%</div>
                    </div>
                  </div>
                  <ScoreBar value={pct} color="auto" height={6} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Troubleshooting                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Wrench size={18} />}
          title="Module 5 · Troubleshooting & Problem-Solving"
          subtitle="Call-center and CRM process scenarios — 70% passing threshold"
          score={troubleshooting.percentage}
          passed={troubleshooting.percentage >= 70}
        />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <div>
              <InfoRow label="Score" value={`${troubleshooting.score} / ${troubleshooting.total}`} />
              <InfoRow label="Percentage" value={`${troubleshooting.percentage}%`} />
              <InfoRow label="Time Spent" value={`${Math.floor(troubleshooting.timeSpentSeconds / 60)}m ${troubleshooting.timeSpentSeconds % 60}s`} />
              <InfoRow label="Avg Per Question" value={`${Math.round(troubleshooting.timeSpentSeconds / troubleshooting.total)}s`} />
            </div>
            <div>
              <div style={{ marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score Progress</div>
              <ScoreBar value={troubleshooting.percentage} color="auto" height={12} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <span>0%</span><span style={{ color: '#f59e0b' }}>70% threshold</span><span>100%</span>
              </div>
            </div>
          </div>

          {/* Scenario breakdown — collapsible */}
          <TsBreakdownToggle troubleshooting={troubleshooting} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: Risk Assessment & Integrity                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Shield size={18} />}
          title="Risk Assessment & Integrity Flags"
          subtitle="Automated flags based on behavior patterns and score deviations"
        />
        <div style={{ padding: '1.5rem' }}>
          {risks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No risk flags detected.</div>
          ) : (
            risks.map((r, i) => <RiskFlag key={i} level={r.level} message={r.message} />)
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: HR Recommendation                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <SectionHeader
          icon={<Award size={18} />}
          title="HR Recommendation"
          subtitle="System-generated hiring recommendation based on composite scoring"
        />
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1.25rem 1.5rem', borderRadius: 10,
            background: overallStatus === 'PASSED' ? 'rgba(16,185,129,0.07)' : overallStatus === 'REVIEW_REQUIRED' ? 'rgba(245,158,11,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${overallStatus === 'PASSED' ? 'rgba(16,185,129,0.25)' : overallStatus === 'REVIEW_REQUIRED' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Automated Recommendation
            </div>
            <p style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.7 }}>{recommendation}</p>
          </div>

          {/* Score breakdown table */}
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Weighted Score Breakdown
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Module', 'Raw Score', 'Weight', 'Weighted', 'Threshold', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '0.6rem 0.85rem', textAlign: 'left', fontWeight: 600,
                    fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { module: 'Typing', raw: typingComposite, weight: 0.20, threshold: 80, thresholdLabel: '35 WPM / 90%' },
                { module: 'Computer Navigation', raw: navigation.percentage, weight: 0.20, threshold: 70, thresholdLabel: '70%' },
                { module: 'Audio Data Entry', raw: dataEntry.accuracyScore, weight: 0.25, threshold: 75, thresholdLabel: '75%' },
                { module: 'Outbound Sales Sim', raw: multitasking.overallScore, weight: 0.15, threshold: 60, thresholdLabel: '60%' },
                { module: 'Troubleshooting', raw: troubleshooting.percentage, weight: 0.20, threshold: 70, thresholdLabel: '70%' },
              ].map(({ module, raw, weight, threshold, thresholdLabel }) => {
                const weighted = Math.round(raw * weight);
                const pass = raw >= threshold;
                return (
                  <tr key={module} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#fff' }}>{module}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: pass ? '#34d399' : '#f87171', fontWeight: 700 }}>{raw}%</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>{Math.round(weight * 100)}%</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#a5b4fc', fontWeight: 600 }}>{weighted} pts</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-dim)' }}>{thresholdLabel}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      {pass
                        ? <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>✓ Pass</span>
                        : <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>✗ Below threshold</span>
                      }
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderTop: '2px solid var(--border-active)' }}>
                <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#fff' }}>COMPOSITE</td>
                <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#fff' }}>{overallScore}%</td>
                <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)' }}>100%</td>
                <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#a5b4fc' }}>{overallScore} pts</td>
                <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-dim)' }}>65% pass</td>
                <td style={{ padding: '0.75rem 0.85rem' }}>
                  {overallStatus === 'PASSED'
                    ? <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Passed</span>
                    : overallStatus === 'REVIEW_REQUIRED'
                    ? <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Review</span>
                    : <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>Retest</span>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)',
        padding: '1rem 0'
      }}>
        <div>HR AssessPro · Confidential Candidate Report · {new Date(generatedAt).toLocaleString()}</div>
        <div>Report Key: <code style={{ fontFamily: 'var(--font-mono)' }}>{candidate.id}-{new Date(generatedAt).getTime().toString().slice(-8)}</code></div>
      </div>
    </div>
  );
};

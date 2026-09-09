import React, { useState } from 'react';
import { CandidateAssessmentReport } from '../types/assessment';
import { exportReportsToCSV, syncReportsWithSupabase } from '../utils/storage';
import { NAVIGATION_QUESTIONS } from '../data/navigationQuestions';
import { TROUBLESHOOTING_QUESTIONS } from '../data/troubleshootingQuestions';
import { DATA_ENTRY_RECORDINGS } from '../data/dataEntryRecordings';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  FileSpreadsheet,
  X,
  Database,
  RefreshCw
} from 'lucide-react';
import {
  getSupabaseCredentials,
  setSupabaseCredentials,
  testSupabaseConnection
} from '../utils/supabaseClient';

interface HrAdminDashboardProps {
  reports: CandidateAssessmentReport[];
  onDeleteReport: (candidateId: string) => void;
  onClearAll: () => void;
  onBackToAssessment: () => void;
  onRefreshReports?: () => void;
}

export const HrAdminDashboard: React.FC<HrAdminDashboardProps> = ({
  reports,
  onDeleteReport,
  onClearAll,
  onBackToAssessment,
  onRefreshReports
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'REVIEW_REQUIRED' | 'NEEDS_RETEST'>('ALL');
  const [selectedReport, setSelectedReport] = useState<CandidateAssessmentReport | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'dataEntry' | 'quizAnswers'>('overview');

  // Supabase Modal State
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbUrl, setDbUrl] = useState(getSupabaseCredentials().url);
  const [dbAnonKey, setDbAnonKey] = useState(getSupabaseCredentials().anonKey);
  const [testingDb, setTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.candidate.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const total = reports.length;
  const passed = reports.filter((r) => r.overallStatus === 'PASSED').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const avgWpm = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.typing.wpm, 0) / total) : 0;
  const avgDataEntry = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.dataEntry.accuracyScore, 0) / total) : 0;

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-panel" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <FileSpreadsheet size={24} color="#818cf8" />
              <h1 style={{ fontSize: '1.75rem', color: '#fff' }}>HR Recruitment Portal & Candidate Hub</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Review standardized technical evaluations, verify TypingTest benchmarks, audit field-level transcription accuracy, and export candidate rosters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                setIsSyncing(true);
                await syncReportsWithSupabase();
                setIsSyncing(false);
                if (onRefreshReports) onRefreshReports();
              }}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              title="Fetch latest submissions from Supabase cloud database"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Sync Cloud'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDbUrl(getSupabaseCredentials().url);
                setDbAnonKey(getSupabaseCredentials().anonKey);
                setShowDbModal(true);
              }}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Database size={15} color="#38bdf8" /> Supabase Config
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => exportReportsToCSV(reports)}
              disabled={reports.length === 0}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Download size={15} /> Export CSV
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onBackToAssessment}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              + Launch New Assessment
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="stats-grid" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          <div className="stat-box">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#34d399' }}>{passRate}%</div>
            <div className="stat-label">Benchmark Pass Rate</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: avgWpm >= 35 ? '#34d399' : '#f59e0b' }}>
              {avgWpm}
            </div>
            <div className="stat-label">Avg Typing WPM (Req: 35+)</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#818cf8' }}>{avgDataEntry}%</div>
            <div className="stat-label">Avg Data Entry Accuracy</div>
          </div>
        </div>
      </div>

      {/* Filter and Candidate Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Search candidate name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Statuses ({total})</option>
              <option value="PASSED">Passed Benchmark</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
              <option value="NEEDS_RETEST">Needs Retest</option>
            </select>

            {reports.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger"
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all candidate records?')) {
                    onClearAll();
                  }
                }}
              >
                <Trash2 size={14} /> Clear Roster
              </button>
            )}
          </div>
        </div>

        {/* Candidates Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Overall</th>
                <th>Typing WPM / Acc</th>
                <th>Navigation</th>
                <th>Audio Entry</th>
                <th>Multitask</th>
                <th>Troubleshoot</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div>No candidate assessment records found.</div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const isPassed = rep.overallStatus === 'PASSED';
                  const isReview = rep.overallStatus === 'REVIEW_REQUIRED';

                  return (
                    <tr key={rep.candidate.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{rep.candidate.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rep.candidate.email}</div>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {rep.candidate.targetPosition}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{rep.overallScore}%</strong>
                          {isPassed ? (
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Passed</span>
                          ) : isReview ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Review</span>
                          ) : (
                            <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Retest</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: rep.typing.wpm >= 35 ? '#34d399' : '#f59e0b' }}>
                          {rep.typing.wpm} WPM
                        </strong>{' '}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ({rep.typing.accuracy}%)
                        </span>
                      </td>
                      <td>{rep.navigation.percentage}%</td>
                      <td>{rep.dataEntry.accuracyScore}%</td>
                      <td>{rep.multitasking.overallScore}%</td>
                      <td>{rep.troubleshooting.percentage}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            onClick={() => setSelectedReport(rep)}
                            title="Inspect Candidate Submission"
                          >
                            <Eye size={14} /> Audit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => onDeleteReport(rep.candidate.id)}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Audit Modal */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>
                  Candidate Audit: {selectedReport.candidate.fullName}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ID: {selectedReport.candidate.id} • Applied For: {selectedReport.candidate.targetPosition} • Completed: {new Date(selectedReport.generatedAt).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.6rem' }}
                onClick={() => setSelectedReport(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Audit Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${detailTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setDetailTab('overview')}
              >
                Summary & Typing
              </button>
              <button
                type="button"
                className={`btn ${detailTab === 'dataEntry' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setDetailTab('dataEntry')}
              >
                Audio Data Entry Diff ({selectedReport.dataEntry.accuracyScore}%)
              </button>
              <button
                type="button"
                className={`btn ${detailTab === 'quizAnswers' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setDetailTab('quizAnswers')}
              >
                Questionnaire Answers
              </button>
            </div>

            {/* Tab Content 1: Overview */}
            {detailTab === 'overview' && (
              <div>
                <div className="stats-grid" style={{ margin: '0 0 1.5rem 0' }}>
                  <div className="stat-box">
                    <div className="stat-value">{selectedReport.overallScore}%</div>
                    <div className="stat-label">Composite Score</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{selectedReport.typing.wpm}</div>
                    <div className="stat-label">Typing WPM</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{selectedReport.typing.accuracy}%</div>
                    <div className="stat-label">Typing Accuracy</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{selectedReport.candidate.unfocusCount || 0}</div>
                    <div className="stat-label">Tab Switches</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>Typing Test Submission Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>Duration: <strong>{selectedReport.typing.durationSeconds}s</strong></div>
                    <div>Total Errors: <strong>{selectedReport.typing.errors}</strong></div>
                    <div>Characters Per Minute: <strong>{selectedReport.typing.cpm}</strong></div>
                    <div>External Verified: <strong>{selectedReport.typing.externalScoreSubmitted ? 'Yes (TypingTest.com)' : 'Built-in Engine'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Data Entry Field-by-Field Diff */}
            {detailTab === 'dataEntry' && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Comparison between candidate input vs expected ground truth across all 4 audio recordings.
                </p>

                {DATA_ENTRY_RECORDINGS.map((rec) => {
                  const candidateRec = selectedReport.dataEntry.candidateRecords[rec.id] || {};
                  const expected = rec.expectedData;
                  const replaysCount = selectedReport.dataEntry.replays[rec.id] || 0;

                  return (
                    <div
                      key={rec.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <strong style={{ color: '#a5b4fc' }}>{rec.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audio Replays: {replaysCount}x</span>
                      </div>

                      <div className="data-table-wrapper">
                        <table className="data-table" style={{ fontSize: '0.825rem' }}>
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Expected</th>
                              <th>Candidate Input</th>
                              <th>Match Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(['customerName', 'company', 'phoneNumber', 'email', 'streetAddress', 'appointment'] as (keyof typeof expected)[]).map((f) => {
                              const expVal = expected[f];
                              const actVal = candidateRec[f] || '';
                              const isMatch = actVal.trim().toLowerCase() === expVal.trim().toLowerCase();

                              const fieldLabels: Record<string, string> = {
                                customerName: 'Prospect Full Name',
                                company: 'Company Name',
                                phoneNumber: 'Direct Phone (Corrected)',
                                email: 'Work Email (Corrected)',
                                streetAddress: 'Street Address (Spelled)',
                                appointment: 'Appointment Date/Time'
                              };

                              return (
                                <tr key={f}>
                                  <td style={{ fontWeight: 600 }}>{fieldLabels[f] || f}</td>
                                  <td>{expVal}</td>
                                  <td style={{ color: isMatch ? '#34d399' : '#f87171' }}>
                                    {actVal || '«Blank»'}
                                  </td>
                                  <td>
                                    {isMatch ? (
                                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Exact</span>
                                    ) : (
                                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Mismatch</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab Content 3: Quiz Answers */}
            {detailTab === 'quizAnswers' && (
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>
                  Computer Navigation Questionnaire ({selectedReport.navigation.percentage}%)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {NAVIGATION_QUESTIONS.map((q) => {
                    const chosen = selectedReport.navigation.answers[q.id];
                    const isCorrect = chosen === q.correctOptionId;

                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                          border: isCorrect ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{q.question}</div>
                        <div style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                          Candidate Selected: {chosen || 'None'} • Correct: {q.correctOptionId}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>
                  Troubleshooting Test ({selectedReport.troubleshooting.percentage}%)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {TROUBLESHOOTING_QUESTIONS.map((q) => {
                    const chosen = selectedReport.troubleshooting.answers[q.id];
                    const isCorrect = chosen === q.correctOptionId;

                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                          border: isCorrect ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{q.question}</div>
                        <div style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                          Candidate Selected: {chosen || 'None'} • Correct: {q.correctOptionId}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supabase Connection & Configuration Modal */}
      {showDbModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '2rem',
              background: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Database size={22} color="#38bdf8" />
                <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>Supabase Cloud Database Settings</h2>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.6rem' }}
                onClick={() => setShowDbModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Connect your Supabase project so candidate submissions from Vercel or any device automatically save to your remote PostgreSQL cloud database.
            </p>

            <div className="form-group">
              <label className="form-label">Supabase Project URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://xyzcompany.supabase.co"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value.trim())}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supabase Publishable / Anon Key (anon_key)</label>
              <input
                type="password"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={dbAnonKey}
                onChange={(e) => setDbAnonKey(e.target.value.trim())}
              />
            </div>

            {testResult && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: testResult.success ? '#6ee7b7' : '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {testResult.message}
              </div>
            )}

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <strong>Tip for Vercel:</strong> In your Vercel Project Settings &gt; Environment Variables, add:
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li><code>VITE_SUPABASE_URL</code></li>
                <li><code>VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
              Also ensure you ran the table creation script from <code>supabase_schema.sql</code> in your Supabase SQL Editor.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!dbUrl || !dbAnonKey || testingDb}
                onClick={async () => {
                  setTestingDb(true);
                  setTestResult(null);
                  const res = await testSupabaseConnection(dbUrl, dbAnonKey);
                  setTestingDb(false);
                  setTestResult(res);
                }}
              >
                {testingDb ? 'Testing...' : 'Test Connection'}
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    setSupabaseCredentials({ url: dbUrl, anonKey: dbAnonKey });
                    setIsSyncing(true);
                    await syncReportsWithSupabase();
                    setIsSyncing(false);
                    if (onRefreshReports) onRefreshReports();
                    setShowDbModal(false);
                  }}
                >
                  Save & Sync Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { CandidateAssessmentReport } from '../types/assessment';
import { exportReportsToCSV } from '../utils/storage';
import { CandidateAuditReport } from './CandidateAuditReport';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  BarChart2
} from 'lucide-react';

interface HrAdminDashboardProps {
  reports: CandidateAssessmentReport[];
  onDeleteReport: (candidateId: string) => void;
  onClearAll: () => void;
  onBackToAssessment: () => void;
  onRefreshReports?: () => Promise<void> | void;
  syncStatus?: 'idle' | 'syncing' | 'live' | 'offline';
  lastSynced?: Date | null;
}

export const HrAdminDashboard: React.FC<HrAdminDashboardProps> = ({
  reports,
  onDeleteReport,
  onClearAll,
  onBackToAssessment,
  onRefreshReports,
  syncStatus = 'idle',
  lastSynced
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'REVIEW_REQUIRED' | 'NEEDS_RETEST'>('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<CandidateAssessmentReport | null>(null);
  const [isForceSyncing, setIsForceSyncing] = useState(false);

  // ── Full-page audit view ─────────────────────────────────────────────────────
  if (selectedReport) {
    return (
      <CandidateAuditReport
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  // Available unique positions for filter
  const availablePositions = Array.from(new Set(reports.map((r) => r.candidate.targetPosition).filter(Boolean)));

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.candidate.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.overallStatus === statusFilter;
    const matchesPosition = positionFilter === 'ALL' || r.candidate.targetPosition === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Analytics Metrics
  const total = reports.length;
  const passed = reports.filter((r) => r.overallStatus === 'PASSED').length;
  const review = reports.filter((r) => r.overallStatus === 'REVIEW_REQUIRED').length;
  const retest = reports.filter((r) => r.overallStatus === 'NEEDS_RETEST').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const avgWpm = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.typing.wpm, 0) / total) : 0;
  const avgDataEntry = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.dataEntry.accuracyScore, 0) / total) : 0;
  const avgOverall = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / total) : 0;

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-panel" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <FileSpreadsheet size={24} color="#818cf8" />
              <h1 style={{ fontSize: '1.75rem', color: '#fff' }}>HR Recruitment Portal &amp; Candidate Hub</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Review standardized technical evaluations, audit field-level transcription accuracy, and export candidate rosters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Live Sync Status Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', borderRadius: 99,
              background:
                syncStatus === 'live' ? 'rgba(16,185,129,0.1)' :
                syncStatus === 'syncing' ? 'rgba(99,102,241,0.1)' :
                syncStatus === 'offline' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${
                syncStatus === 'live' ? 'rgba(16,185,129,0.3)' :
                syncStatus === 'syncing' ? 'rgba(99,102,241,0.3)' :
                syncStatus === 'offline' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'
              }`,
              fontSize: '0.78rem', fontWeight: 600
            }}>
              {/* Status dot */}
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background:
                  syncStatus === 'live' ? '#10b981' :
                  syncStatus === 'syncing' ? '#6366f1' :
                  syncStatus === 'offline' ? '#ef4444' : '#64748b',
                boxShadow: syncStatus === 'live' ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
                animation: syncStatus === 'live' ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{
                color:
                  syncStatus === 'live' ? '#34d399' :
                  syncStatus === 'syncing' ? '#a5b4fc' :
                  syncStatus === 'offline' ? '#f87171' : 'var(--text-dim)'
              }}>
                {syncStatus === 'live' ? 'Live · Connected' :
                 syncStatus === 'syncing' ? 'Syncing...' :
                 syncStatus === 'offline' ? 'Offline · Local only' : 'Connecting...'}
              </span>
              {lastSynced && syncStatus !== 'syncing' && (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                  · {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>

            {/* Manual force-sync button */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                if (!onRefreshReports) return;
                setIsForceSyncing(true);
                await onRefreshReports();
                setIsForceSyncing(false);
              }}
              disabled={isForceSyncing || syncStatus === 'syncing'}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              title="Manually force a full Supabase sync"
            >
              <RefreshCw size={15} style={{ animation: isForceSyncing ? 'spin 1s linear infinite' : 'none' }} />
              {isForceSyncing ? 'Syncing...' : 'Force Sync'}
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
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#60a5fa' }}>{avgOverall}%</div>
            <div className="stat-label">Avg Composite Score</div>
          </div>
          <div className="stat-box">
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>{passed} Pass</span>
              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>{review} Review</span>
              <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>{retest} Retest</span>
            </div>
            <div className="stat-label" style={{ marginTop: '0.4rem' }}>Status Breakdown</div>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {availablePositions.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="ALL">All Roles ({reports.length})</option>
                  {availablePositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
            </div>

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
                <th>Integrity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div>No candidate assessment records found.</div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const isPassed = rep.overallStatus === 'PASSED';
                  const isReview = rep.overallStatus === 'REVIEW_REQUIRED';
                  const switches = rep.candidate.unfocusCount ?? 0;

                  return (
                    <tr key={rep.candidate.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{rep.candidate.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rep.candidate.email}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{rep.candidate.id}</div>
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
                      <td>
                        <span style={{ color: rep.navigation.percentage >= 70 ? '#34d399' : '#f87171' }}>
                          {rep.navigation.percentage}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: rep.dataEntry.accuracyScore >= 75 ? '#34d399' : '#f87171' }}>
                          {rep.dataEntry.accuracyScore}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: rep.multitasking.overallScore >= 60 ? '#34d399' : '#f87171' }}>
                          {rep.multitasking.overallScore}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: rep.troubleshooting.percentage >= 70 ? '#34d399' : '#f87171' }}>
                          {rep.troubleshooting.percentage}%
                        </span>
                      </td>
                      <td>
                        {switches === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Clean</span>
                        ) : switches >= 3 ? (
                          <span style={{ fontSize: '0.75rem', color: '#f87171' }}>⚠ {switches}× switches</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>{switches}× switch</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => setSelectedReport(rep)}
                            title="Open Full Audit Report"
                          >
                            <BarChart2 size={13} /> Audit
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
    </div>
  );
};

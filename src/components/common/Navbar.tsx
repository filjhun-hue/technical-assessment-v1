import React from 'react';
import { CandidateInfo, TestSectionId } from '../../types/assessment';
import { Award, Shield, User, FileSpreadsheet, Eye } from 'lucide-react';

interface NavbarProps {
  currentSection: TestSectionId;
  candidate: CandidateInfo | null;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  unfocusCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  candidate,
  isAdminView,
  onToggleAdminView,
  unfocusCount
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">HR AssessPro</div>
            <div className="brand-subtitle">Technical Competency & Assessment Suite</div>
          </div>
        </div>

        <div className="nav-actions">
          {candidate && !isAdminView && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <User size={15} color="#818cf8" />
                <strong style={{ color: '#fff' }}>{candidate.fullName}</strong>
                <span>({candidate.targetPosition})</span>
              </div>

              {unfocusCount > 0 && (
                <span className="badge badge-warning" title="Candidate navigated away from assessment window">
                  <Eye size={12} /> {unfocusCount} Tab Switch{unfocusCount > 1 ? 'es' : ''}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            className={`mode-toggle-btn ${isAdminView ? 'admin-active' : ''}`}
            onClick={onToggleAdminView}
          >
            {isAdminView ? (
              <>
                <Award size={15} /> Candidate View
              </>
            ) : (
              <>
                <FileSpreadsheet size={15} /> HR Admin Portal
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

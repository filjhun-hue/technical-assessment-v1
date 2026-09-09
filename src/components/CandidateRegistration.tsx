import React, { useState } from 'react';
import { CandidateInfo } from '../types/assessment';
import { UserCheck, ShieldCheck, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface CandidateRegistrationProps {
  onStartAssessment: (candidate: CandidateInfo) => void;
}

export const CandidateRegistration: React.FC<CandidateRegistrationProps> = ({
  onStartAssessment
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetPosition, setTargetPosition] = useState('Customer Support Representative');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter both your full name and a valid email address.');
      return;
    }

    const candidate: CandidateInfo = {
      id: 'CAN-' + Math.floor(100000 + Math.random() * 900000),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || 'Not Provided',
      targetPosition,
      startedAt: new Date().toISOString(),
      unfocusCount: 0
    };

    onStartAssessment(candidate);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
            }}
          >
            <UserCheck size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem' }}>
            HR Technical Assessment Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto' }}>
            Welcome! This standardized assessment evaluates essential skills required for operational, data, and support roles.
          </p>
        </div>

        {/* Overview Modules Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={18} color="#6ee7b7" />
            <h3 style={{ fontSize: '1rem', color: '#fff' }}>Assessment Modules & Standards</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                1. Typing Test
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: <strong>35+ WPM</strong> with ≥ <strong>90% Accuracy</strong>.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                2. Computer Navigation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                11 questions covering shortcuts, Task Manager, file systems & web.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                3. Audio Data Entry
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Listen to 4 audio calls and transcribe names, emails, dates & IDs accurately.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                4. Multitasking Simulation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Handle simultaneous live customer chats, priority tickets & verifications.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                5. Troubleshooting Test
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                11 real-world support scenarios (network, audio devices, memory, cache).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <Clock size={15} />
            <span>Estimated total completion time: <strong>18 - 25 minutes</strong>. Audio playback enabled.</span>
          </div>
        </div>

        {/* Candidate Form */}
        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div
              style={{
                background: 'var(--danger-glow)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#fca5a5',
                fontSize: '0.9rem',
                marginBottom: '1.25rem'
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Candidate Full Name *</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="e.g. Jordan Miller"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="e.g. jordan.miller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Contact Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="targetPosition">Target Position</label>
              <select
                id="targetPosition"
                className="form-select"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
              >
                <option value="Customer Support Representative">Customer Support Representative</option>
                <option value="Technical Support Specialist">Technical Support Specialist</option>
                <option value="Data Entry Specialist">Data Entry Specialist</option>
                <option value="Operations Associate">Operations Associate</option>
                <option value="Virtual Assistant">Virtual Assistant</option>
                <option value="General Applicant">General Applicant</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
              Begin Assessment <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

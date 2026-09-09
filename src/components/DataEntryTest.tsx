import React, { useState, useEffect } from 'react';
import { DataEntryRecord, DataEntrySubmission } from '../types/assessment';
import { DATA_ENTRY_RECORDINGS, AudioRecordingItem } from '../data/dataEntryRecordings';
import { AudioEngine } from '../utils/speechAudio';
import { gradeDataEntry } from '../utils/grading';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DataEntryTestProps {
  onComplete: (submission: DataEntrySubmission) => void;
}

export const DataEntryTest: React.FC<DataEntryTestProps> = ({ onComplete }) => {
  const [activeRecIndex, setActiveRecIndex] = useState(0);
  const [candidateRecords, setCandidateRecords] = useState<Record<string, Partial<DataEntryRecord>>>({
    'rec-1': {},
    'rec-2': {},
    'rec-3': {},
    'rec-4': {}
  });
  const [replays, setReplays] = useState<Record<string, number>>({
    'rec-1': 0,
    'rec-2': 0,
    'rec-3': 0,
    'rec-4': 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.1); // default slightly faster for fast-speaking prospect
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      AudioEngine.stop();
    };
  }, []);

  const activeRec: AudioRecordingItem = DATA_ENTRY_RECORDINGS[activeRecIndex];

  const handlePlayAudio = () => {
    if (isPlaying) {
      AudioEngine.stop();
      setIsPlaying(false);
      return;
    }

    setReplays((prev) => ({
      ...prev,
      [activeRec.id]: (prev[activeRec.id] || 0) + 1
    }));

    setIsPlaying(true);
    AudioEngine.speakText(
      activeRec.speechScript,
      playbackSpeed,
      () => {
        setIsPlaying(false);
      },
      (speaking) => {
        setIsPlaying(speaking);
      }
    );
  };

  const handleFieldChange = (recordingId: string, field: keyof DataEntryRecord, value: string) => {
    setCandidateRecords((prev) => ({
      ...prev,
      [recordingId]: {
        ...prev[recordingId],
        [field]: value
      }
    }));
  };

  const currentRecInput = candidateRecords[activeRec.id] || {};

  // Check how many records have all 6 fields filled
  const totalRecs = DATA_ENTRY_RECORDINGS.length;
  let filledRecordsCount = 0;
  DATA_ENTRY_RECORDINGS.forEach((rec) => {
    const r = candidateRecords[rec.id];
    if (r && r.customerName && r.company && r.phoneNumber && r.email && r.streetAddress && r.appointment) {
      filledRecordsCount++;
    }
  });

  const handleSubmit = () => {
    AudioEngine.stop();
    const submission = gradeDataEntry(candidateRecords, replays, timeSpentSeconds);
    onComplete(submission);
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <div>
          <h2 className="panel-title">
            <Headphones size={24} color="#818cf8" />
            Module 3: Fast-Paced Prospect Audio Transcription
          </h2>
          <p className="panel-description">
            Simulated inbound prospect call. The prospect speaks quickly, self-corrects mid-call (e.g. initial phone/email revised to corporate line), and spells out complex street addresses. Transcribe the accurate final details into the CRM form.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Clock size={16} />
            <span>{Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s</span>
          </div>

          <span className={`badge ${filledRecordsCount === totalRecs ? 'badge-success' : 'badge-primary'}`}>
            {filledRecordsCount} of {totalRecs} Records Complete
          </span>
        </div>
      </div>

      {/* Recording Selector Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {DATA_ENTRY_RECORDINGS.map((rec, idx) => {
          const isSelected = activeRecIndex === idx;
          const recData = candidateRecords[rec.id] || {};
          const isComplete = Boolean(
            recData.customerName &&
            recData.company &&
            recData.phoneNumber &&
            recData.email &&
            recData.streetAddress &&
            recData.appointment
          );

          return (
            <button
              key={rec.id}
              type="button"
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
              onClick={() => {
                if (isPlaying) AudioEngine.stop();
                setIsPlaying(false);
                setActiveRecIndex(idx);
              }}
            >
              <span>Prospect #{idx + 1}</span>
              {isComplete && <CheckCircle2 size={15} color="#34d399" />}
            </button>
          );
        })}
      </div>

      {/* Audio Player Box */}
      <div className="audio-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            type="button"
            className="audio-play-btn"
            onClick={handlePlayAudio}
            title={isPlaying ? 'Pause Audio' : 'Play Prospect Audio'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
          </button>

          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
              {activeRec.title}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {activeRec.callerLabel} • Approx {activeRec.durationEstimate}
            </div>
          </div>
        </div>

        {/* Animated Waveform Pillars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="audio-waveform-bar">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((item) => (
              <div
                key={item}
                className={`wave-pillar ${isPlaying ? 'active' : ''}`}
                style={{
                  animationDelay: `${(item * 0.08) % 0.8}s`,
                  height: isPlaying ? undefined : '6px'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <RotateCcw size={14} />
              <span>Plays: <strong>{replays[activeRec.id] || 0}</strong></span>
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              disabled={isPlaying}
            >
              <option value={0.85}>0.85x Slow</option>
              <option value={1.0}>1.0x Normal</option>
              <option value={1.1}>1.1x Fast (Default)</option>
              <option value={1.25}>1.25x Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Structured CRM Entry Form for Active Call */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Enter Verified Prospect Information for Call #{activeRecIndex + 1}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertCircle size={14} /> {activeRec.notesPrompt}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} color="#818cf8" /> Prospect Full Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Johnathan Davies"
              value={currentRecInput.customerName || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'customerName', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={14} color="#818cf8" /> Company Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Vanguard Logistics"
              value={currentRecInput.company || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'company', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} color="#818cf8" /> Direct Phone Number *
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Final corrected number)</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 555-684-2190"
              value={currentRecInput.phoneNumber || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'phoneNumber', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} color="#818cf8" /> Work Email Address *
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Final corrected work email)</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. j.davies@vanguardlogistics.com"
              value={currentRecInput.email || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'email', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#818cf8" /> Corporate Street Address *
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Spelled-out street name & suite/building)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 420 Wyckoff Avenue, Suite 350"
              value={currentRecInput.streetAddress || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'streetAddress', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="#818cf8" /> Appointment / Consultation Date & Time *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. September 18, 2026, 2:00 PM"
              value={currentRecInput.appointment || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'appointment', e.target.value)}
            />
          </div>
        </div>

        {/* Quick pagination button between records */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          {activeRecIndex > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => {
                if (isPlaying) AudioEngine.stop();
                setIsPlaying(false);
                setActiveRecIndex((prev) => prev - 1);
              }}
            >
              Previous Prospect
            </button>
          )}

          {activeRecIndex < totalRecs - 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => {
                if (isPlaying) AudioEngine.stop();
                setIsPlaying(false);
                setActiveRecIndex((prev) => prev + 1);
              }}
            >
              Next Prospect (#{activeRecIndex + 2})
            </button>
          )}
        </div>
      </div>

      {/* Overview Table of All Entered Records */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>
          Live CRM Batch Overview
        </h4>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Call Ref</th>
                <th>Prospect Name</th>
                <th>Company</th>
                <th>Corrected Phone</th>
                <th>Work Email</th>
                <th>Street Address</th>
                <th>Appointment</th>
                <th>Replays</th>
              </tr>
            </thead>
            <tbody>
              {DATA_ENTRY_RECORDINGS.map((rec, idx) => {
                const r = candidateRecords[rec.id] || {};
                return (
                  <tr
                    key={rec.id}
                    style={{
                      cursor: 'pointer',
                      background: activeRecIndex === idx ? 'rgba(99, 102, 241, 0.1)' : undefined
                    }}
                    onClick={() => {
                      if (isPlaying) AudioEngine.stop();
                      setIsPlaying(false);
                      setActiveRecIndex(idx);
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#a5b4fc' }}>Call #{idx + 1}</td>
                    <td>{r.customerName || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.company || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.phoneNumber || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.email || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.streetAddress || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.appointment || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{replays[rec.id] || 0}x</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Submit Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {filledRecordsCount === totalRecs
            ? 'All 4 prospect records are verified and ready for submission.'
            : `${totalRecs - filledRecordsCount} record(s) still have incomplete fields.`}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const filled: Record<string, Partial<DataEntryRecord>> = {};
              DATA_ENTRY_RECORDINGS.forEach((rec) => {
                filled[rec.id] = { ...rec.expectedData };
              });
              setCandidateRecords(filled);
            }}
            style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            ⚡ Quick-Fill Records (Demo)
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={filledRecordsCount < totalRecs}
          >
            Submit & Continue to Multitasking Sim <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

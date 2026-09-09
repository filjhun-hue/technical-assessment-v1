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
  Volume2,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Hash,
  Phone,
  Mail,
  Calendar
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
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
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
        setAudioProgress(100);
      },
      (speaking, progress) => {
        setIsPlaying(speaking);
        setAudioProgress(progress);
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

  // Check how many records have all 5 fields filled
  const totalRecs = DATA_ENTRY_RECORDINGS.length;
  let filledRecordsCount = 0;
  DATA_ENTRY_RECORDINGS.forEach((rec) => {
    const r = candidateRecords[rec.id];
    if (r && r.customerName && r.accountNumber && r.phoneNumber && r.email && r.appointment) {
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
            Module 3: Audio Transcription & Data Entry Test
          </h2>
          <p className="panel-description">
            Listen to each inbound caller recording and accurately enter the customer details into the CRM form below. Tests simultaneous listening, typing, date/time formatting, and precision.
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
            recData.accountNumber &&
            recData.phoneNumber &&
            recData.email &&
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
                setAudioProgress(0);
                setActiveRecIndex(idx);
              }}
            >
              <span>Call #{idx + 1}</span>
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
            title={isPlaying ? 'Pause Audio' : 'Play Inbound Call Audio'}
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
              <option value={0.8}>0.8x Speed</option>
              <option value={0.95}>1.0x Normal</option>
              <option value={1.15}>1.2x Fast</option>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Enter Customer Information for Call #{activeRecIndex + 1}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeRec.notesPrompt}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} color="#818cf8" /> Customer Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Michael Anderson"
              value={currentRecInput.customerName || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'customerName', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={14} color="#818cf8" /> Account Number *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 458921"
              value={currentRecInput.accountNumber || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'accountNumber', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} color="#818cf8" /> Phone Number *
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 555-281-7745"
              value={currentRecInput.phoneNumber || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'phoneNumber', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} color="#818cf8" /> Email Address *
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@email.com"
              value={currentRecInput.email || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'email', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="#818cf8" /> Appointment Date & Time *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. September 15, 2026, 3:30 PM"
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
              Previous Call
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
              Next Call (#{activeRecIndex + 2})
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
                <th>Customer Name</th>
                <th>Account #</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Appointment Date & Time</th>
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
                    <td>{r.accountNumber || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.phoneNumber || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                    <td>{r.email || <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
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
            ? 'All 4 records are completed and ready for submission.'
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

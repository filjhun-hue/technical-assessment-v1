import React, { useState, useEffect } from 'react';
import { DataEntryRecord, DataEntrySubmission } from '../types/assessment';
import { DATA_ENTRY_RECORDINGS, AudioRecordingItem } from '../data/dataEntryRecordings';
import { AudioEngine } from '../utils/speechAudio';
import { gradeDataEntry, parseAppointmentString, formatToAppointmentString, MONTH_NAMES } from '../utils/grading';
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
    'rec-3': {}
  });
  const [replays, setReplays] = useState<Record<string, number>>({
    'rec-1': 0,
    'rec-2': 0,
    'rec-3': 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85); // Default comfortable speed for clear comprehension
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
      setAudioProgress(0);
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
        setAudioProgress(0);
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

  // Calendar date & time picker helpers
  const { date: activeDate, time: activeTime } = parseAppointmentString(currentRecInput.appointment);

  const handleDateChange = (dateVal: string) => {
    const timeVal = activeTime || '09:00';
    const formatted = dateVal ? formatToAppointmentString(dateVal, timeVal) : '';
    handleFieldChange(activeRec.id, 'appointment', formatted);
  };

  const handleTimeChange = (timeVal: string) => {
    let dateVal = activeDate;
    if (!dateVal) {
      const expParsed = parseAppointmentString(activeRec.expectedData.appointment);
      dateVal = expParsed.date || '2026-09-18';
    }
    const formatted = timeVal ? formatToAppointmentString(dateVal, timeVal) : '';
    handleFieldChange(activeRec.id, 'appointment', formatted);
  };

  const handleClearAppointment = () => {
    handleFieldChange(activeRec.id, 'appointment', '');
  };

  const calendarBadge = React.useMemo(() => {
    if (!activeDate) return null;
    const [y, m, d] = activeDate.split('-');
    const monthIdx = parseInt(m, 10) - 1;
    const monthShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][monthIdx] || 'CAL';
    const monthFull = MONTH_NAMES[monthIdx] || '';

    let timeFormatted = '';
    if (activeTime) {
      const [h, min] = activeTime.split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
      timeFormatted = `${hour}:${min} ${ampm}`;
    }

    return {
      year: y,
      monthShort,
      monthFull,
      day: d,
      timeFormatted
    };
  }, [activeDate, activeTime]);

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
            Simulated inbound prospect calls. The prospect speaks at a clear pace, spells out his name and street address, and repeats his office location. Transcribe the accurate verified details into the CRM form.
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
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              disabled={isPlaying}
              title="Adjust playback speed"
            >
              <option value={0.65}>0.65x Extra Slow (Easy Catch)</option>
              <option value={0.75}>0.75x Slow Pace</option>
              <option value={0.85}>0.85x Comfortable (Default)</option>
              <option value={1.0}>1.0x Standard Normal</option>
              <option value={1.15}>1.15x Fast Pace</option>
            </select>
          </div>
        </div>

        {/* Audio Playback Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.85rem' }}>
          <div
            style={{
              width: `${isPlaying ? Math.max(audioProgress, 5) : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              transition: 'width 0.2s linear'
            }}
          />
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
              autoComplete="off"
              spellCheck={false}
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
              autoComplete="off"
              spellCheck={false}
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
              autoComplete="off"
              spellCheck={false}
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
              autoComplete="off"
              spellCheck={false}
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
              autoComplete="off"
              spellCheck={false}
              value={currentRecInput.streetAddress || ''}
              onChange={(e) => handleFieldChange(activeRec.id, 'streetAddress', e.target.value)}
            />
          </div>

          <div
            className="form-group"
            style={{
              gridColumn: '1 / -1',
              marginBottom: 0,
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                <Calendar size={18} color="#818cf8" /> Appointment / Consultation Date & Time *
              </label>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                📅 Interactive Calendar & Time Slot Picker
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
              {/* Date Picker Input */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    1. Choose Consultation Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ cursor: 'pointer', fontSize: '0.95rem' }}
                    value={activeDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Click the calendar icon to browse or pick the date
                </span>
              </div>

              {/* Time Picker Input & Quick Slots */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    2. Choose Consultation Time
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="time"
                      className="form-input"
                      style={{ cursor: 'pointer', fontSize: '0.95rem', flex: '1 1 120px' }}
                      value={activeTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                    />
                    <select
                      className="form-select"
                      style={{ width: 'auto', fontSize: '0.85rem', cursor: 'pointer', flex: '1 1 140px' }}
                      value={activeTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                    >
                      <option value="">Quick Slot...</option>
                      <option value="09:00">9:00 AM (Morning)</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM (Late Morning)</option>
                      <option value="12:00">12:00 PM (Noon)</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM (Afternoon)</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:15">4:15 PM (Late Afternoon)</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Enter exact time or pick standard business hour slot
                </span>
              </div>

              {/* Visual Calendar Badge & Confirmed Schedule */}
              <div
                style={{
                  background: calendarBadge
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%)'
                    : 'rgba(15, 23, 42, 0.4)',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: calendarBadge
                    ? '1px solid rgba(129, 140, 248, 0.4)'
                    : '1px dashed var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  minHeight: '84px',
                  position: 'relative'
                }}
              >
                {calendarBadge ? (
                  <>
                    {/* Realistic Calendar Tear-Off Sheet Icon */}
                    <div
                      style={{
                        width: '54px',
                        height: '60px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#1e293b',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          background: '#4f46e5',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          padding: '2px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        {calendarBadge.monthShort}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          color: '#f8fafc',
                          lineHeight: 1
                        }}
                      >
                        {calendarBadge.day}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Scheduled CRM Appointment
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#fff',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {currentRecInput.appointment}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Year {calendarBadge.year} • Time {calendarBadge.timeFormatted || '--'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearAppointment}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '0.75rem',
                        alignSelf: 'flex-start'
                      }}
                      title="Clear date and time"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={24} color="#64748b" />
                    <span>Select a date on the calendar and time slot above to book the consultation.</span>
                  </div>
                )}
              </div>
            </div>
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
            ? `All ${totalRecs} prospect records are verified and ready for submission.`
            : `${totalRecs - filledRecordsCount} record(s) still have incomplete fields.`}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {typeof window !== 'undefined' && (window.location.search.includes('demo=true') || (import.meta as any).env?.DEV) && (
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
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', opacity: 0.7 }}
              title="Only visible in development/demo mode"
            >
              ⚡ Quick-Fill Records (Demo)
            </button>
          )}

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

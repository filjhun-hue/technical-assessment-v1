import React, { useState, useEffect, useRef } from 'react';
import { TypingResult } from '../types/assessment';
import { TYPING_PASSAGES } from '../data/typingPassages';
import { Keyboard, Timer, AlertCircle, CheckCircle2, RotateCcw, ExternalLink, ArrowRight } from 'lucide-react';

interface TypingTestProps {
  onComplete: (result: TypingResult) => void;
}

export const TypingTest: React.FC<TypingTestProps> = ({ onComplete }) => {
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const passage = TYPING_PASSAGES[selectedPassageIndex].text;

  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [durationLimit] = useState(60); // 60 seconds standard test

  // External typing test submission tab
  const [activeTab, setActiveTab] = useState<'interactive' | 'external'>('interactive');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalWpm, setExternalWpm] = useState<number | ''>('');
  const [externalAccuracy, setExternalAccuracy] = useState<number | ''>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Timer loop
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && !isFinished) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= durationLimit) {
            handleFinish();
            return durationLimit;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished, durationLimit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
      setIsActive(true);
    }

    setInputVal(val);

    // If candidate reached the end of the passage
    if (val.length >= passage.length) {
      handleFinish();
    }
  };

  // Metrics calculation
  let correctChars = 0;
  let errorCount = 0;
  for (let i = 0; i < inputVal.length; i++) {
    if (inputVal[i] === passage[i]) {
      correctChars++;
    } else {
      errorCount++;
    }
  }

  const effectiveTimeMin = Math.max(elapsedSeconds, 1) / 60;
  // Standard formula: (Total Characters typed / 5) / Time in minutes
  const grossWpm = Math.round((inputVal.length / 5) / effectiveTimeMin) || 0;
  const netWpm = Math.max(0, Math.round(((inputVal.length - errorCount) / 5) / effectiveTimeMin)) || 0;
  const accuracy = inputVal.length > 0 ? Math.round((correctChars / inputVal.length) * 100) : 100;
  const cpm = Math.round(inputVal.length / effectiveTimeMin) || 0;

  const meetsBenchmark = netWpm >= 35 && accuracy >= 90;

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
  };

  const handleReset = () => {
    setInputVal('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsActive(false);
    setIsFinished(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleProceedInteractive = () => {
    const result: TypingResult = {
      wpm: netWpm,
      accuracy,
      errors: errorCount,
      cpm,
      durationSeconds: elapsedSeconds || 1,
      completed: true
    };
    onComplete(result);
  };

  const handleProceedExternal = (e: React.FormEvent) => {
    e.preventDefault();
    const wpmVal = typeof externalWpm === 'number' ? externalWpm : 0;
    const accVal = typeof externalAccuracy === 'number' ? externalAccuracy : 0;

    const result: TypingResult = {
      wpm: wpmVal,
      accuracy: accVal,
      errors: 0,
      cpm: wpmVal * 5,
      durationSeconds: 60,
      completed: true,
      externalScoreSubmitted: true,
      externalUrl: externalUrl || 'https://www.typingtest.com/',
      externalWpm: wpmVal,
      externalAccuracy: accVal
    };
    onComplete(result);
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <div>
          <h2 className="panel-title">
            <Keyboard size={24} color="#818cf8" />
            Module 1: Typing Speed & Accuracy Test
          </h2>
          <p className="panel-description">
            Evaluate your keying speed and precision under timed conditions. Benchmark standard: <strong>35+ WPM</strong> with at least <strong>90% accuracy</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'interactive' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('interactive')}
          >
            Built-in Test
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'external' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('external')}
          >
            External TypingTest.com Score
          </button>
        </div>
      </div>

      {activeTab === 'interactive' ? (
        <div>
          {/* Live Metric Statistics */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value" style={{ color: netWpm >= 35 ? '#34d399' : '#f59e0b' }}>
                {netWpm}
              </div>
              <div className="stat-label">Net WPM (Target: 35+)</div>
            </div>

            <div className="stat-box">
              <div className="stat-value" style={{ color: accuracy >= 90 ? '#34d399' : '#f87171' }}>
                {accuracy}%
              </div>
              <div className="stat-label">Accuracy (Target: 90%+)</div>
            </div>

            <div className="stat-box">
              <div className="stat-value" style={{ color: errorCount > 5 ? '#f87171' : '#fff' }}>
                {errorCount}
              </div>
              <div className="stat-label">Errors Detected</div>
            </div>

            <div className="stat-box">
              <div className="stat-value" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <Timer size={22} />
                {durationLimit - elapsedSeconds}s
              </div>
              <div className="stat-label">Time Remaining</div>
            </div>
          </div>

          {/* Benchmark Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: meetsBenchmark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.08)',
              border: meetsBenchmark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {meetsBenchmark ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <AlertCircle size={18} color="#818cf8" />
              )}
              <span style={{ fontSize: '0.9rem' }}>
                HR Benchmark Requirement: <strong>35 Words Per Minute</strong> with <strong>90% Accuracy</strong>.
              </span>
            </div>

            <div>
              {meetsBenchmark ? (
                <span className="badge badge-success">Benchmark Met</span>
              ) : (
                <span className="badge badge-warning">In Progress</span>
              )}
            </div>
          </div>

          {/* Interactive Typing Passage Display */}
          <div
            className={`typing-arena ${isActive ? 'focused' : ''}`}
            onClick={() => inputRef.current?.focus()}
            style={{ cursor: 'text' }}
          >
            {passage.split('').map((char, index) => {
              let charClass = 'char-pending';
              if (index < inputVal.length) {
                charClass = inputVal[index] === char ? 'char-correct' : 'char-incorrect';
              } else if (index === inputVal.length) {
                charClass = 'char-current';
              }

              return (
                <span key={index} className={charClass}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Hidden/Transparent Input Controller */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            disabled={isFinished}
            placeholder={
              !isActive && !isFinished
                ? 'Click here and start typing the text above to begin the 60s timer...'
                : 'Keep typing...'
            }
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: '#0b1120',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          {/* Passage Switcher & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sample Passage:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                value={selectedPassageIndex}
                onChange={(e) => {
                  setSelectedPassageIndex(Number(e.target.value));
                  handleReset();
                }}
                disabled={isActive}
              >
                {TYPING_PASSAGES.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={handleReset}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!isFinished ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleFinish}
                  disabled={inputVal.length < 30}
                >
                  Submit Current Result
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleProceedInteractive}
                >
                  Save & Continue to Computer Navigation <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* External TypingTest.com Score Form */
        <form onSubmit={handleProceedExternal} style={{ maxWidth: '640px', margin: '1rem auto' }}>
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
              <ExternalLink size={16} color="#818cf8" />
              External Platform: TypingTest.com
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              If instructed by your recruiter to take the test directly on{' '}
              <a
                href="https://www.typingtest.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#818cf8', textDecoration: 'underline' }}
              >
                TypingTest.com
              </a>
              , complete a 1-minute test there and input your recorded scores below for HR verification.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="extWpm">Recorded Words Per Minute (WPM) *</label>
            <input
              id="extWpm"
              type="number"
              min="0"
              max="200"
              className="form-input"
              placeholder="e.g. 48"
              value={externalWpm}
              onChange={(e) => setExternalWpm(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="extAcc">Recorded Accuracy (%) *</label>
            <input
              id="extAcc"
              type="number"
              min="0"
              max="100"
              className="form-input"
              placeholder="e.g. 96"
              value={externalAccuracy}
              onChange={(e) => setExternalAccuracy(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="extUrl">Verification / Certificate URL (Optional)</label>
            <input
              id="extUrl"
              type="url"
              className="form-input"
              placeholder="https://www.typingtest.com/result/..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              Verify & Proceed <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

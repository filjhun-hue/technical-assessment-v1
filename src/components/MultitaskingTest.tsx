import React, { useState, useEffect } from 'react';
import { MultitaskingMetric } from '../types/assessment';
import {
  MULTITASKING_OBJECTIONS,
  MULTITASKING_DISPOSITIONS,
  MULTITASKING_APPOINTMENTS,
  ObjectionItem,
  DispositionItem,
  AppointmentSlotItem,
  DispositionType
} from '../data/multitaskingData';
import {
  Layers,
  Headphones,
  PhoneCall,
  CalendarCheck,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MultitaskingTestProps {
  onComplete: (metric: MultitaskingMetric) => void;
}

export const MultitaskingTest: React.FC<MultitaskingTestProps> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds simulation
  const [isFinished, setIsFinished] = useState(false);

  // Channel 1: Objection Rebuttal state
  const [currentObjIndex, setCurrentObjIndex] = useState(0);
  const [selectedRebuttalOption, setSelectedRebuttalOption] = useState<string | null>(null);
  const [objectionsResolved, setObjectionsResolved] = useState(0);
  const [correctRebuttals, setCorrectRebuttals] = useState(0);

  // Channel 2: Dialer Call Disposition state
  const [currentDispIndex, setCurrentDispIndex] = useState(0);
  const [dispositionsLogged, setDispositionsLogged] = useState(0);
  const [correctDispositions, setCorrectDispositions] = useState(0);

  // Channel 3: Calendar Slot Matching state
  const [currentApptIndex, setCurrentApptIndex] = useState(0);
  const [appointmentsBooked, setAppointmentsBooked] = useState(0);
  const [correctAppointments, setCorrectAppointments] = useState(0);

  // Timer loop
  useEffect(() => {
    let interval: number | undefined;
    if (started && !isFinished && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCompleteSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, isFinished, timeLeft]);

  const activeObjection: ObjectionItem | undefined = MULTITASKING_OBJECTIONS[currentObjIndex];
  const activeDisposition: DispositionItem | undefined = MULTITASKING_DISPOSITIONS[currentDispIndex];
  const activeAppointment: AppointmentSlotItem | undefined = MULTITASKING_APPOINTMENTS[currentApptIndex];

  // Hotkey listener for dispositions (keys 1-5)
  useEffect(() => {
    if (!started || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '1') handleSelectDisposition('Meeting');
      else if (e.key === '2') handleSelectDisposition('Callback');
      else if (e.key === '3') handleSelectDisposition('Gatekeeper');
      else if (e.key === '4') handleSelectDisposition('Voicemail');
      else if (e.key === '5') handleSelectDisposition('DNC');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, isFinished, activeDisposition, currentDispIndex]);

  const handleDeliverRebuttal = () => {
    if (!selectedRebuttalOption || !activeObjection) return;

    const chosen = activeObjection.options.find((o) => o.id === selectedRebuttalOption);
    if (chosen?.isBest) {
      setCorrectRebuttals((prev) => prev + 1);
    }
    setObjectionsResolved((prev) => prev + 1);
    setSelectedRebuttalOption(null);

    if (currentObjIndex < MULTITASKING_OBJECTIONS.length - 1) {
      setCurrentObjIndex((prev) => prev + 1);
    }
  };

  const handleSelectDisposition = (disp: DispositionType) => {
    if (!activeDisposition) return;

    if (activeDisposition.correctDisposition === disp) {
      setCorrectDispositions((prev) => prev + 1);
    }
    setDispositionsLogged((prev) => prev + 1);

    if (currentDispIndex < MULTITASKING_DISPOSITIONS.length - 1) {
      setCurrentDispIndex((prev) => prev + 1);
    }
  };

  const handleSelectSlot = (slotId: string) => {
    if (!activeAppointment) return;

    const chosen = activeAppointment.slots.find((s) => s.id === slotId);
    if (chosen?.isCorrect) {
      setCorrectAppointments((prev) => prev + 1);
    }
    setAppointmentsBooked((prev) => prev + 1);

    if (currentApptIndex < MULTITASKING_APPOINTMENTS.length - 1) {
      setCurrentApptIndex((prev) => prev + 1);
    }
  };

  const handleCompleteSimulation = () => {
    setIsFinished(true);

    const totalActions =
      MULTITASKING_OBJECTIONS.length +
      MULTITASKING_DISPOSITIONS.length +
      MULTITASKING_APPOINTMENTS.length;
    const correctActions = correctRebuttals + correctDispositions + correctAppointments;
    const accuracy = totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 100;
    const completionRate = Math.round(
      ((objectionsResolved + dispositionsLogged + appointmentsBooked) / totalActions) * 100
    );

    const overallScore = Math.round(accuracy * 0.6 + completionRate * 0.4);

    const metric: MultitaskingMetric = {
      chatResolved: objectionsResolved,
      chatTotal: MULTITASKING_OBJECTIONS.length,
      ticketsProcessed: dispositionsLogged,
      ticketsTotal: MULTITASKING_DISPOSITIONS.length,
      verificationsDone: appointmentsBooked,
      verificationsTotal: MULTITASKING_APPOINTMENTS.length,
      accuracyPercentage: accuracy,
      avgResponseTimeSec: Math.round(90 - timeLeft),
      overallScore,
      completed: true,
      objectionsResolved,
      dispositionsHandled: dispositionsLogged,
      appointmentsBooked
    };

    onComplete(metric);
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <div>
          <h2 className="panel-title">
            <Layers size={24} color="#818cf8" />
            Module 4: Outbound Telemarketing Multitasking Simulation
          </h2>
          <p className="panel-description">
            Simulates a high-performance outbound sales dialer floor. Candidates must simultaneously pivot live prospect objections, accurately tag call dispositions under wrap timer, and lock in appointment calendar slots.
          </p>
        </div>

        {started && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: timeLeft < 20 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: timeLeft < 20 ? '1px solid #ef4444' : '1px solid var(--accent-primary)',
              color: timeLeft < 20 ? '#fca5a5' : '#a5b4fc',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            <Clock size={20} className={timeLeft < 20 ? 'pulse' : ''} />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {!started ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            margin: '1.5rem 0'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '1.25rem',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              marginBottom: '1.25rem'
            }}
          >
            <PhoneCall size={48} color="#818cf8" />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.75rem' }}>
            Ready to Enter the Outbound Sales & Dialer Simulation?
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '620px',
              margin: '0 auto 1.75rem',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}
          >
            You will have <strong>90 seconds</strong> to handle 3 concurrent telemarketing channels:
            <br />
            <strong>1. Live Objection Handling</strong> (Select best rebuttals to pivot to meetings)
            <br />
            <strong>2. Rapid Call Dispositioning</strong> (Accurately tag outcomes & compliance DNC)
            <br />
            <strong>3. Calendar Slot Matching</strong> (Match prospect availability to AE open slots)
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            onClick={() => setStarted(true)}
          >
            Start 90s Outbound Simulation <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div>
          {/* Live Multitasking Dashboard */}
          <div className="multitask-grid">
            {/* Column 1: Live Cold Call Objection Handling */}
            <div className="multitask-pane">
              <div className="multitask-pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Headphones size={18} color="#818cf8" />
                  <strong style={{ fontSize: '0.95rem' }}>Channel 1: Live Objection Handling</strong>
                </div>
                <span className="badge badge-primary">
                  {objectionsResolved} / {MULTITASKING_OBJECTIONS.length} Handled
                </span>
              </div>

              {activeObjection && objectionsResolved < MULTITASKING_OBJECTIONS.length ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem',
                      borderLeft:
                        activeObjection.urgency === 'high'
                          ? '4px solid #ef4444'
                          : '4px solid #f59e0b',
                      marginBottom: '1rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <strong style={{ color: '#fff' }}>{activeObjection.prospect}</strong>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {activeObjection.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      {activeObjection.title}
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#f1f5f9', fontStyle: 'italic', margin: 0 }}>
                      "{activeObjection.objection}"
                    </p>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem'
                      }}
                    >
                      Select Highest-Converting Rebuttal & Meeting Pivot:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {activeObjection.options.map((opt) => (
                        <label
                          key={opt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '6px',
                            background:
                              selectedRebuttalOption === opt.id
                                ? 'rgba(99, 102, 241, 0.2)'
                                : 'rgba(255, 255, 255, 0.03)',
                            border:
                              selectedRebuttalOption === opt.id
                                ? '1px solid var(--accent-primary)'
                                : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.835rem',
                            lineHeight: 1.45
                          }}
                          onClick={() => setSelectedRebuttalOption(opt.id)}
                        >
                          <input
                            type="radio"
                            name="objection-opt"
                            checked={selectedRebuttalOption === opt.id}
                            onChange={() => setSelectedRebuttalOption(opt.id)}
                            style={{ accentColor: 'var(--accent-primary)', marginTop: '2px' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        marginTop: '0.75rem',
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                      onClick={handleDeliverRebuttal}
                      disabled={!selectedRebuttalOption}
                    >
                      <Send size={14} /> Deliver Rebuttal & Next Call
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: 'var(--success)'
                  }}
                >
                  <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600 }}>All Prospect Objections Overcome!</div>
                </div>
              )}
            </div>

            {/* Column 2: Rapid Auto-Dialer Call Dispositioning */}
            <div className="multitask-pane">
              <div className="multitask-pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PhoneCall size={18} color="#34d399" />
                  <strong style={{ fontSize: '0.95rem' }}>Channel 2: Rapid Call Dispositioning</strong>
                </div>
                <span className="badge badge-success">
                  {dispositionsLogged} / {MULTITASKING_DISPOSITIONS.length} Logged
                </span>
              </div>

              {activeDisposition && dispositionsLogged < MULTITASKING_DISPOSITIONS.length ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.3rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ color: '#a5b4fc', fontWeight: 700 }}>
                        {activeDisposition.leadCode}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>Wrap Timer: Active</span>
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#fff',
                        marginBottom: '0.3rem'
                      }}
                    >
                      {activeDisposition.contactName} • {activeDisposition.company}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#cbd5e1',
                        lineHeight: 1.45,
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        borderLeft: '3px solid #38bdf8'
                      }}
                    >
                      {activeDisposition.callSummary}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>Assign CRM Call Outcome:</span>
                      <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Hotkeys: [1-5]</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                          borderColor: '#10b981',
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectDisposition('Meeting')}
                      >
                        <span>🤝 Meeting Booked</span>
                        <kbd style={{ fontSize: '0.7rem', padding: '1px 5px' }}>1</kbd>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                          borderColor: '#38bdf8',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectDisposition('Callback')}
                      >
                        <span>📞 Call Back Later</span>
                        <kbd style={{ fontSize: '0.7rem', padding: '1px 5px' }}>2</kbd>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                          borderColor: '#f59e0b',
                          color: '#fbbf24',
                          background: 'rgba(245, 158, 11, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectDisposition('Gatekeeper')}
                      >
                        <span>🛡️ Gatekeeper Block</span>
                        <kbd style={{ fontSize: '0.7rem', padding: '1px 5px' }}>3</kbd>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                          borderColor: '#a855f7',
                          color: '#c084fc',
                          background: 'rgba(168, 85, 247, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectDisposition('Voicemail')}
                      >
                        <span>📼 Left Voicemail</span>
                        <kbd style={{ fontSize: '0.7rem', padding: '1px 5px' }}>4</kbd>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          gridColumn: '1 / -1',
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                          borderColor: '#ef4444',
                          color: '#f87171',
                          background: 'rgba(239, 68, 68, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectDisposition('DNC')}
                      >
                        <span>⛔ Hard DNC / Do Not Call Compliance</span>
                        <kbd style={{ fontSize: '0.7rem', padding: '1px 5px' }}>5</kbd>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: 'var(--success)'
                  }}
                >
                  <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600 }}>All Dialer Calls Dispositioned!</div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Live Calendar Slot Matching (Appointment Booking) */}
          <div
            style={{
              marginTop: '1.5rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={18} color="#f59e0b" />
                <strong style={{ fontSize: '0.95rem' }}>
                  Channel 3: Live Calendar Slot Matching (Appointment Booking)
                </strong>
              </div>
              <span className="badge badge-warning">
                {appointmentsBooked} / {MULTITASKING_APPOINTMENTS.length} Booked
              </span>
            </div>

            {activeAppointment && appointmentsBooked < MULTITASKING_APPOINTMENTS.length ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{activeAppointment.prospectName}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({activeAppointment.company})</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Requested Window:{' '}
                    <strong style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {activeAppointment.requestedWindow}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {activeAppointment.slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.825rem',
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                        color: '#fef3c7'
                      }}
                      onClick={() => handleSelectSlot(slot.id)}
                    >
                      <Calendar size={13} style={{ marginRight: '4px' }} />
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                ✓ All appointment calendar requests matched!
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Work swiftly and maintain high compliance to ensure top telemarketing performance.
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCompleteSimulation}
            >
              Finish Simulation & Proceed to Troubleshooting <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MultitaskingMetric } from '../types/assessment';
import {
  MULTITASKING_CHATS,
  MULTITASKING_TICKETS,
  MULTITASKING_VERIFICATIONS,
  ChatItem,
  TicketItem,
  VerificationItem
} from '../data/multitaskingData';
import {
  Layers,
  MessageSquare,
  Ticket,
  CheckSquare,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface MultitaskingTestProps {
  onComplete: (metric: MultitaskingMetric) => void;
}

export const MultitaskingTest: React.FC<MultitaskingTestProps> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds simulation
  const [isFinished, setIsFinished] = useState(false);

  // Chat state
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [selectedChatOption, setSelectedChatOption] = useState<string | null>(null);
  const [chatsResolved, setChatsResolved] = useState(0);
  const [correctChatAnswers, setCorrectChatAnswers] = useState(0);

  // Ticket triage state
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [ticketsProcessed, setTicketsProcessed] = useState(0);
  const [correctTicketPriorities, setCorrectTicketPriorities] = useState(0);

  // Order verification state
  const [currentVerifIndex, setCurrentVerifIndex] = useState(0);
  const [verificationsDone, setVerificationsDone] = useState(0);
  const [correctVerifications, setCorrectVerifications] = useState(0);

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

  const activeChat: ChatItem | undefined = MULTITASKING_CHATS[currentChatIndex];
  const activeTicket: TicketItem | undefined = MULTITASKING_TICKETS[currentTicketIndex];
  const activeVerif: VerificationItem | undefined = MULTITASKING_VERIFICATIONS[currentVerifIndex];

  const handleSendChatReply = () => {
    if (!selectedChatOption || !activeChat) return;

    const chosen = activeChat.options.find((o) => o.id === selectedChatOption);
    if (chosen?.isBest) {
      setCorrectChatAnswers((prev) => prev + 1);
    }
    setChatsResolved((prev) => prev + 1);
    setSelectedChatOption(null);

    if (currentChatIndex < MULTITASKING_CHATS.length - 1) {
      setCurrentChatIndex((prev) => prev + 1);
    }
  };

  const handleAssignTicketPriority = (priority: 'Low' | 'Medium' | 'Urgent') => {
    if (!activeTicket) return;

    if (activeTicket.correctPriority === priority) {
      setCorrectTicketPriorities((prev) => prev + 1);
    }
    setTicketsProcessed((prev) => prev + 1);

    if (currentTicketIndex < MULTITASKING_TICKETS.length - 1) {
      setCurrentTicketIndex((prev) => prev + 1);
    }
  };

  const handleVerifyOrder = (verdictMatches: boolean) => {
    if (!activeVerif) return;

    if (activeVerif.isMatch === verdictMatches) {
      setCorrectVerifications((prev) => prev + 1);
    }
    setVerificationsDone((prev) => prev + 1);

    if (currentVerifIndex < MULTITASKING_VERIFICATIONS.length - 1) {
      setCurrentVerifIndex((prev) => prev + 1);
    }
  };

  const handleCompleteSimulation = () => {
    setIsFinished(true);

    const totalActions = MULTITASKING_CHATS.length + MULTITASKING_TICKETS.length + MULTITASKING_VERIFICATIONS.length;
    const correctActions = correctChatAnswers + correctTicketPriorities + correctVerifications;
    const accuracy = totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 100;
    const completionRate = Math.round(
      ((chatsResolved + ticketsProcessed + verificationsDone) / totalActions) * 100
    );

    const overallScore = Math.round(accuracy * 0.6 + completionRate * 0.4);

    const metric: MultitaskingMetric = {
      chatResolved: chatsResolved,
      chatTotal: MULTITASKING_CHATS.length,
      ticketsProcessed,
      ticketsTotal: MULTITASKING_TICKETS.length,
      verificationsDone,
      verificationsTotal: MULTITASKING_VERIFICATIONS.length,
      accuracyPercentage: accuracy,
      avgResponseTimeSec: Math.round(90 - timeLeft),
      overallScore,
      completed: true
    };

    onComplete(metric);
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <div>
          <h2 className="panel-title">
            <Layers size={24} color="#818cf8" />
            Module 4: Multitasking & Priority Triage Simulation
          </h2>
          <p className="panel-description">
            Simulates a real-time call center environment. Candidates must juggle incoming live chat inquiries, system priority ticket triage, and ledger amount verifications simultaneously.
          </p>
        </div>

        {started && !isFinished && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Clock size={16} color="#f87171" />
            <span style={{ fontWeight: 700, color: '#fca5a5' }}>{timeLeft}s Remaining</span>
          </div>
        )}
      </div>

      {!started ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#818cf8'
            }}
          >
            <Layers size={28} />
          </div>

          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem' }}>
            Ready to Begin the Multitasking Simulation?
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 1.75rem', fontSize: '0.95rem' }}>
            You will have <strong>90 seconds</strong> to handle active customer chats, assign correct urgency tiers to internal support tickets, and cross-reference ledger amounts.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            onClick={() => setStarted(true)}
          >
            Start 90s Simulation <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div>
          {/* Live Multitasking Dashboard */}
          <div className="multitask-grid">
            {/* Column 1: Live Customer Chat */}
            <div className="multitask-pane">
              <div className="multitask-pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} color="#818cf8" />
                  <strong style={{ fontSize: '0.95rem' }}>Channel 1: Inbound Customer Chat</strong>
                </div>
                <span className="badge badge-primary">
                  {chatsResolved} / {MULTITASKING_CHATS.length} Handled
                </span>
              </div>

              {activeChat && chatsResolved < MULTITASKING_CHATS.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem',
                      borderLeft: activeChat.urgency === 'high' ? '4px solid #ef4444' : '4px solid #f59e0b',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>{activeChat.sender}</strong>
                      {activeChat.urgency === 'high' && (
                        <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertTriangle size={12} /> High Urgency
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>"{activeChat.message}"</p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Select Most Professional & Direct Response:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {activeChat.options.map((opt) => (
                        <label
                          key={opt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '6px',
                            background: selectedChatOption === opt.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            border: selectedChatOption === opt.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                          onClick={() => setSelectedChatOption(opt.id)}
                        >
                          <input
                            type="radio"
                            name="chat-opt"
                            checked={selectedChatOption === opt.id}
                            onChange={() => setSelectedChatOption(opt.id)}
                            style={{ accentColor: 'var(--accent-primary)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                      onClick={handleSendChatReply}
                      disabled={!selectedChatOption}
                    >
                      <Send size={14} /> Send Reply & Next Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div>All Inbound Chats Cleared!</div>
                </div>
              )}
            </div>

            {/* Column 2: System Ticket Priority Triage */}
            <div className="multitask-pane">
              <div className="multitask-pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ticket size={18} color="#34d399" />
                  <strong style={{ fontSize: '0.95rem' }}>Channel 2: Urgent Ticket Triage</strong>
                </div>
                <span className="badge badge-success">
                  {ticketsProcessed} / {MULTITASKING_TICKETS.length} Triaged
                </span>
              </div>

              {activeTicket && ticketsProcessed < MULTITASKING_TICKETS.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                      <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{activeTicket.code}</span>
                      <span className="badge badge-primary">{activeTicket.category}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '0.3rem' }}>
                      {activeTicket.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {activeTicket.summary}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Assign SLA Severity Priority:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem', fontSize: '0.8rem', borderColor: '#3b82f6', color: '#93c5fd' }}
                        onClick={() => handleAssignTicketPriority('Low')}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem', fontSize: '0.8rem', borderColor: '#f59e0b', color: '#fcd34d' }}
                        onClick={() => handleAssignTicketPriority('Medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#fca5a5' }}
                        onClick={() => handleAssignTicketPriority('Urgent')}
                      >
                        Urgent
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div>All Tickets Triaged!</div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Rapid Ledger Verification Check */}
          <div
            style={{
              marginTop: '1.5rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={18} color="#f59e0b" />
                <strong style={{ fontSize: '0.95rem' }}>Channel 3: Rapid Ledger Amount Cross-Check</strong>
              </div>
              <span className="badge badge-warning">
                {verificationsDone} / {MULTITASKING_VERIFICATIONS.length} Checked
              </span>
            </div>

            {activeVerif && verificationsDone < MULTITASKING_VERIFICATIONS.length ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div>Order: <strong style={{ color: '#fff' }}>{activeVerif.orderId}</strong></div>
                  <div>Customer: <strong style={{ color: '#fff' }}>{activeVerif.customerName}</strong></div>
                  <div>Declared: <strong style={{ color: '#a5b4fc' }}>{activeVerif.declaredAmount}</strong></div>
                  <div>Ledger: <strong style={{ color: '#6ee7b7' }}>{activeVerif.ledgerAmount}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => handleVerifyOrder(false)}
                  >
                    Mismatch / Flag
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => handleVerifyOrder(true)}
                  >
                    Amounts Match
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                ✓ All ledger verifications completed!
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Work quickly and accurately to maintain a high customer satisfaction rating.
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

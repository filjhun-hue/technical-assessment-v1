import React, { useState, useEffect } from 'react';
import { QuizResult } from '../types/assessment';
import { NAVIGATION_QUESTIONS } from '../data/navigationQuestions';
import { gradeNavigationQuiz } from '../utils/grading';
import { Compass, CheckCircle2, AlertCircle, ArrowRight, Clock } from 'lucide-react';

interface ComputerNavigationTestProps {
  onComplete: (result: QuizResult) => void;
}

export const ComputerNavigationTest: React.FC<ComputerNavigationTestProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalQuestions = NAVIGATION_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) return;
    const result = gradeNavigationQuiz(answers, timeSpentSeconds);
    onComplete(result);
  };

  // Helper to format shortcut keys nicely into <kbd> tags
  const renderFormattedText = (text: string) => {
    // Look for shortcut patterns like Ctrl + C, Alt + Tab, Ctrl + Alt + Delete, etc.
    const parts = text.split(/(Ctrl \+ [A-Z]|Ctrl \+ Alt \+ Delete|Alt \+ Tab|Windows Key \+ [A-Z]|Shift \+ Space|Cmd \+ [A-Z]|Shift \+ Cmd \+ 4|PrtScn|Ctrl \+ Shift \+ Esc|Ctrl \+ Z|Cmd \+ Z|Ctrl \+ F|Cmd \+ F|Ctrl \+ S|Esc)/g);
    return parts.map((part, i) => {
      if (
        part.startsWith('Ctrl') ||
        part.startsWith('Alt') ||
        part.startsWith('Windows Key') ||
        part.startsWith('Shift') ||
        part.startsWith('Cmd') ||
        part === 'PrtScn' ||
        part === 'Esc'
      ) {
        return <kbd key={i}>{part}</kbd>;
      }
      return part;
    });
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <div>
          <h2 className="panel-title">
            <Compass size={24} color="#818cf8" />
            Module 2: Computer Navigation & Usage Questionnaire
          </h2>
          <p className="panel-description">
            Written and practical questionnaire testing essential operating system navigation, file management, and workflow shortcuts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Clock size={16} />
            <span>{Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s</span>
          </div>

          <span className={`badge ${isAllAnswered ? 'badge-success' : 'badge-primary'}`}>
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {NAVIGATION_QUESTIONS.map((q, index) => {
            const selectedOption = answers[q.id];

            return (
              <div key={q.id} className="question-block">
                <div className="question-header">
                  <span className="question-num">Q{index + 1}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      {q.category}
                    </div>
                    <div className="question-text">
                      {renderFormattedText(q.question)}
                    </div>
                  </div>
                </div>

                <div className="options-grid">
                  {q.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;

                    return (
                      <label
                        key={opt.id}
                        className={`option-label ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, opt.id)}
                          className="option-radio"
                        />
                        <span className="option-letter">{opt.id})</span>
                        <span className="option-text">
                          {renderFormattedText(opt.text)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action / Progress Footer */}
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
          <div>
            {!isAllAnswered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} />
                Please answer all {totalQuestions} questions before proceeding ({totalQuestions - answeredCount} remaining).
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} />
                All {totalQuestions} questions answered and ready to submit!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {typeof window !== 'undefined' && (window.location.search.includes('demo=true') || (import.meta as any).env?.DEV) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const autoAnswers: Record<string, string> = {};
                  NAVIGATION_QUESTIONS.forEach((q) => {
                    autoAnswers[q.id] = q.correctOptionId;
                  });
                  setAnswers(autoAnswers);
                }}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', opacity: 0.7 }}
                title="Only visible in development/demo mode"
              >
                ⚡ Quick-Select Answers (Demo)
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isAllAnswered}
            >
              Submit & Proceed to Audio Data Entry <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

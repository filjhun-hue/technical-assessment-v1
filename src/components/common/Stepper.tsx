import React from 'react';
import { TestSectionId } from '../../types/assessment';
import { Keyboard, Compass, Headphones, Layers, Wrench, CheckCircle2 } from 'lucide-react';

interface StepperProps {
  currentSection: TestSectionId;
  completedSections: Set<TestSectionId>;
  onSelectSection?: (section: TestSectionId) => void;
}

interface StepItemConfig {
  id: TestSectionId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  stepNum: number;
}

const STEPS: StepItemConfig[] = [
  { id: 'typing', label: 'Typing Test', icon: Keyboard, stepNum: 1 },
  { id: 'navigation', label: 'Computer Navigation', icon: Compass, stepNum: 2 },
  { id: 'data-entry', label: 'Audio Data Entry', icon: Headphones, stepNum: 3 },
  { id: 'multitasking', label: 'Outbound Sales Sim', icon: Layers, stepNum: 4 },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench, stepNum: 5 }
];

export const Stepper: React.FC<StepperProps> = ({
  currentSection,
  completedSections,
  onSelectSection
}) => {
  if (currentSection === 'onboarding' || currentSection === 'results') {
    return null;
  }

  return (
    <nav className="stepper-nav" aria-label="Assessment Steps">
      {STEPS.map((step) => {
        const isActive = currentSection === step.id;
        const isCompleted = completedSections.has(step.id);
        const isAccessible = isCompleted || isActive;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => {
              if (onSelectSection && isAccessible) {
                onSelectSection(step.id);
              }
            }}
            style={{
              cursor: isAccessible ? 'pointer' : 'not-allowed',
              opacity: isAccessible ? 1 : 0.6
            }}
            title={
              isAccessible
                ? `Go to ${step.label}`
                : `Complete preceding modules to unlock ${step.label}`
            }
          >
            <div className="step-number">
              {isCompleted ? <CheckCircle2 size={16} /> : step.stepNum}
            </div>
            <Icon size={16} />
            <span>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export interface TypingPassage {
  id: string;
  title: string;
  difficulty: 'Standard' | 'Business' | 'Technical';
  text: string;
}

export const TYPING_PASSAGES: TypingPassage[] = [
  {
    id: 'passage-1',
    title: 'Outbound Cold Calling & Rapport',
    difficulty: 'Business',
    text: 'Successful outbound telemarketing requires immediate value delivery and confident rapport building. Top-performing sales representatives listen actively to prospect needs, acknowledge timing constraints with genuine empathy, and position solutions that address specific operational bottlenecks. Clear articulation, professional tonality, and persistent optimism turn cold interactions into high-value appointments.'
  },
  {
    id: 'passage-2',
    title: 'Appointment Setting & CRM Cadence',
    difficulty: 'Standard',
    text: 'Disciplined dialer pace and instantaneous CRM documentation determine sales floor efficiency. When an interested prospect requests a consultation, confirming their decision-maker authority, time zone availability, and executive calendar slot prevents scheduling errors. Accurate notes and immediate disposition tagging keep our revenue pipeline organized and predictable.'
  },
  {
    id: 'passage-3',
    title: 'Customer Service Excellence',
    difficulty: 'Standard',
    text: 'Effective communication is the cornerstone of exceptional customer service. When speaking with clients, active listening enables you to understand their genuine concerns and provide swift, accurate resolutions. Maintaining a calm, empathetic tone de-escalates stressful situations, fosters long-term trust, and reinforces our commitment to organizational excellence.'
  },
  {
    id: 'passage-4',
    title: 'Digital Workspace & Productivity',
    difficulty: 'Business',
    text: 'Modern professional environments rely heavily on collaborative cloud tools, seamless documentation, and prompt correspondence. Organizing digital assets systematically reduces workflow friction and ensures team members access critical records without unnecessary delays. Attention to detail and disciplined data entry form the foundation of high-performing operations.'
  },
  {
    id: 'passage-5',
    title: 'Technical Support & Systems',
    difficulty: 'Technical',
    text: 'System troubleshooting requires structured methodology and logical diagnosis. Before applying complex interventions, verify fundamental connections, inspect active background processes, and observe system latency indicators. Documenting precise incident steps enables engineering teams to isolate root causes and prevent recurring service disruptions.'
  }
];

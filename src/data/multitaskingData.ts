export interface ObjectionItem {
  id: string;
  prospect: string;
  title: string;
  objection: string;
  category: 'Competitor' | 'Brush-Off' | 'No Budget' | 'Timing' | 'Skeptical';
  urgency: 'medium' | 'high';
  options: {
    id: string;
    text: string;
    isBest: boolean;
  }[];
}

export type DispositionType = 'Meeting' | 'Callback' | 'Gatekeeper' | 'Voicemail' | 'DNC';

export interface DispositionItem {
  id: string;
  leadCode: string;
  contactName: string;
  company: string;
  callSummary: string;
  correctDisposition: DispositionType;
}

export interface AppointmentSlotChoice {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface AppointmentSlotItem {
  id: string;
  prospectName: string;
  company: string;
  requestedWindow: string;
  slots: AppointmentSlotChoice[];
}

// Backward compatibility types
export type ChatItem = ObjectionItem;
export type TicketItem = DispositionItem;
export type VerificationItem = AppointmentSlotItem;

export const MULTITASKING_OBJECTIONS: ObjectionItem[] = [
  {
    id: 'obj-1',
    prospect: 'Karen Bradley',
    title: 'VP of Operations, Titan Logistics',
    objection: "We are already locked into an annual contract with another vendor and we're totally satisfied.",
    category: 'Competitor',
    urgency: 'high',
    options: [
      {
        id: 'o1-1',
        text: 'Their customer service is known to be terrible. You should break your contract and switch to us.',
        isBest: false
      },
      {
        id: 'o1-2',
        text: 'Completely understand, Karen! Most of our current partners were with them too. We actually aren\'t asking you to switch—we serve as a backup overflow provider when your primary vendor is at capacity. Would you be open to a 10-minute rate comparison next Tuesday?',
        isBest: true
      },
      {
        id: 'o1-3',
        text: 'No problem at all, I will remove your name from our calling list immediately.',
        isBest: false
      }
    ]
  },
  {
    id: 'obj-2',
    prospect: 'Marcus Sterling',
    title: 'Director of Technology, Apex Cloud',
    objection: "I don't have time for cold calls. Just email me your sales deck and pricing sheet and I'll look it over.",
    category: 'Brush-Off',
    urgency: 'medium',
    options: [
      {
        id: 'o2-1',
        text: 'I\'d be glad to send that over, Marcus! So I don\'t flood your inbox with generic slides, are you currently more focused on reducing cloud infrastructure cost or automating server backups?',
        isBest: true
      },
      {
        id: 'o2-2',
        text: 'Our company policy strictly prohibits emailing any information unless you first book a 30-minute demonstration.',
        isBest: false
      },
      {
        id: 'o2-3',
        text: 'Sure thing, I\'ll send over our 50-page brochure right away and call you back in 15 minutes to review it.',
        isBest: false
      }
    ]
  },
  {
    id: 'obj-3',
    prospect: 'David Chen',
    title: 'CFO, Sterling Healthcare Group',
    objection: "Our budget is completely frozen until Q4. There is zero money to spend on new software right now.",
    category: 'No Budget',
    urgency: 'high',
    options: [
      {
        id: 'o3-1',
        text: 'Can you speak with your executive committee to get an emergency budget exception for this?',
        isBest: false
      },
      {
        id: 'o3-2',
        text: 'Understood, David—most CFOs we speak with are guarding capital closely right now. We wouldn\'t expect any financial commitment today. We are sharing preliminary ROI models so leaders have numbers ready when planning reopens. Would Thursday at 2:00 PM work for a brief 10-minute briefing?',
        isBest: true
      },
      {
        id: 'o3-3',
        text: 'You don\'t need budget because our tool pays for itself immediately on day one.',
        isBest: false
      }
    ]
  },
  {
    id: 'obj-4',
    prospect: 'Rachel Vance',
    title: 'Head of People & HR, Nexus Media',
    objection: "I'm literally stepping into a company all-hands meeting right now, I have zero seconds to talk.",
    category: 'Timing',
    urgency: 'high',
    options: [
      {
        id: 'o4-1',
        text: 'Wait, please don\'t hang up! This will only take 60 seconds, let me just explain our main feature.',
        isBest: false
      },
      {
        id: 'o4-2',
        text: 'Understood, Rachel! I caught you completely by surprise. Go ahead into your meeting—can I reach back out tomorrow morning at 9:15 AM before your schedule fills up?',
        isBest: true
      },
      {
        id: 'o4-3',
        text: 'Could you just put me on speakerphone while you attend your all-hands meeting?',
        isBest: false
      }
    ]
  },
  {
    id: 'obj-5',
    prospect: 'Anthony Russo',
    title: 'Managing Director, Russo Manufacturing',
    objection: "How did you get my direct phone number? Who authorized you to contact me?",
    category: 'Skeptical',
    urgency: 'medium',
    options: [
      {
        id: 'o5-1',
        text: 'I appreciate you asking, Anthony. I noticed your recent regional plant expansion on LinkedIn and retrieved your verified corporate desk line via our B2B directory. If you\'d prefer I delete this line, I will do so immediately—or I can share in 30 seconds why we reached out?',
        isBest: true
      },
      {
        id: 'o5-2',
        text: 'It\'s public information on the internet, so anyone in our company has legal authorization to call you.',
        isBest: false
      },
      {
        id: 'o5-3',
        text: 'We buy marketing lists online and your phone number happened to be on today\'s dialer batch.',
        isBest: false
      }
    ]
  }
];

export const MULTITASKING_DISPOSITIONS: DispositionItem[] = [
  {
    id: 'disp-1',
    leadCode: 'LEAD-401',
    contactName: 'Gregory Scott',
    company: 'Scott Industrial Corp',
    callSummary: "Prospect shouted: 'Stop calling this number! Remove me from your calling list immediately or I will report you to the FTC!'",
    correctDisposition: 'DNC'
  },
  {
    id: 'disp-2',
    leadCode: 'LEAD-402',
    contactName: 'Amanda Hughes',
    company: 'Vanguard Medical Labs',
    callSummary: "Prospect answered: 'I'm interested, but I'm driving right now. Can your senior account exec call my desk tomorrow at 3:30 PM EST?'",
    correctDisposition: 'Callback'
  },
  {
    id: 'disp-3',
    leadCode: 'LEAD-403',
    contactName: 'Evelyn Marsh',
    company: 'Summit Capital Partners',
    callSummary: "Receptionist answered: 'Ms. Marsh is out of the office until Wednesday. All vendor screening is handled through her executive assistant on Thursday mornings.'",
    correctDisposition: 'Gatekeeper'
  },
  {
    id: 'disp-4',
    leadCode: 'LEAD-404',
    contactName: 'Brian Kowalski',
    company: 'Kowalski Logistics Inc',
    callSummary: "Prospect confirmed: 'Yes, 15 minutes this Friday at 10:00 AM works. Send the meeting invite and video link to my corporate email.'",
    correctDisposition: 'Meeting'
  },
  {
    id: 'disp-5',
    leadCode: 'LEAD-405',
    contactName: 'Stephanie Clark',
    company: 'BlueWave Digital',
    callSummary: "Dialer connected, 5 rings, automated system played: 'The person you are trying to reach is unavailable. Please record your message after the tone.'",
    correctDisposition: 'Voicemail'
  },
  {
    id: 'disp-6',
    leadCode: 'LEAD-406',
    contactName: 'Thomas Wright',
    company: 'Wright Construction Group',
    callSummary: "Prospect stated firmly: 'Take my name and business off your dialer permanently. Do not ever contact us again.'",
    correctDisposition: 'DNC'
  }
];

export const MULTITASKING_APPOINTMENTS: AppointmentSlotItem[] = [
  {
    id: 'appt-1',
    prospectName: 'Elena Rostova',
    company: 'BioDynamics Inc',
    requestedWindow: 'Tuesday afternoon between 2:00 PM and 4:00 PM EST',
    slots: [
      { id: 's1-1', label: 'Tuesday 11:00 AM EST', isCorrect: false },
      { id: 's1-2', label: 'Tuesday 3:00 PM EST', isCorrect: true },
      { id: 's1-3', label: 'Thursday 3:00 PM EST', isCorrect: false }
    ]
  },
  {
    id: 'appt-2',
    prospectName: 'Marcus Vance',
    company: 'Titan Global Freight',
    requestedWindow: 'Friday morning before 11:00 AM CST (12:00 PM EST)',
    slots: [
      { id: 's2-1', label: 'Friday 9:30 AM CST (10:30 AM EST)', isCorrect: true },
      { id: 's2-2', label: 'Friday 1:30 PM CST (2:30 PM EST)', isCorrect: false },
      { id: 's2-3', label: 'Thursday 9:30 AM CST (10:30 AM EST)', isCorrect: false }
    ]
  },
  {
    id: 'appt-3',
    prospectName: 'Dr. Sarah Jenkins',
    company: 'Valley Health Network',
    requestedWindow: 'Monday during lunch hour: 12:00 PM - 1:30 PM EST',
    slots: [
      { id: 's3-1', label: 'Monday 9:00 AM EST', isCorrect: false },
      { id: 's3-2', label: 'Monday 12:30 PM EST', isCorrect: true },
      { id: 's3-3', label: 'Tuesday 12:30 PM EST', isCorrect: false }
    ]
  },
  {
    id: 'appt-4',
    prospectName: 'Liam O\'Connor',
    company: 'FinTech Secure',
    requestedWindow: 'Thursday late afternoon after 4:00 PM PST (7:00 PM EST)',
    slots: [
      { id: 's4-1', label: 'Thursday 2:00 PM PST', isCorrect: false },
      { id: 's4-2', label: 'Friday 4:30 PM PST', isCorrect: false },
      { id: 's4-3', label: 'Thursday 4:30 PM PST', isCorrect: true }
    ]
  },
  {
    id: 'appt-5',
    prospectName: 'Natalie Dupont',
    company: 'Omni Retail Solutions',
    requestedWindow: 'Wednesday early morning between 8:30 AM and 10:00 AM EST',
    slots: [
      { id: 's5-1', label: 'Wednesday 9:15 AM EST', isCorrect: true },
      { id: 's5-2', label: 'Wednesday 11:15 AM EST', isCorrect: false },
      { id: 's5-3', label: 'Thursday 9:15 AM EST', isCorrect: false }
    ]
  },
  {
    id: 'appt-6',
    prospectName: 'Arthur Pendelton',
    company: 'Pendelton Materials',
    requestedWindow: 'Friday early afternoon between 1:00 PM and 2:30 PM EST',
    slots: [
      { id: 's6-1', label: 'Friday 11:00 AM EST', isCorrect: false },
      { id: 's6-2', label: 'Friday 1:45 PM EST', isCorrect: true },
      { id: 's6-3', label: 'Monday 1:45 PM EST', isCorrect: false }
    ]
  }
];

// Aliases for backward compatibility
export const MULTITASKING_CHATS = MULTITASKING_OBJECTIONS;
export const MULTITASKING_TICKETS = MULTITASKING_DISPOSITIONS;
export const MULTITASKING_VERIFICATIONS = MULTITASKING_APPOINTMENTS;

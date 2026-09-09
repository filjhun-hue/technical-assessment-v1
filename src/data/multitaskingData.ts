export interface ChatItem {
  id: string;
  sender: string;
  message: string;
  options: {
    id: string;
    text: string;
    isBest: boolean;
  }[];
  urgency: 'medium' | 'high';
}

export interface TicketItem {
  id: string;
  code: string;
  title: string;
  category: 'Billing' | 'Technical' | 'Account' | 'Shipping';
  correctPriority: 'Low' | 'Medium' | 'Urgent';
  summary: string;
}

export interface VerificationItem {
  id: string;
  orderId: string;
  customerName: string;
  declaredAmount: string;
  ledgerAmount: string;
  isMatch: boolean;
}

export const MULTITASKING_CHATS: ChatItem[] = [
  {
    id: 'chat-1',
    sender: 'Client: Marcus Vance',
    message: 'I have been waiting 15 minutes for my reset code and my webinar begins in 5 minutes!',
    urgency: 'high',
    options: [
      { id: 'c1-1', text: 'You should have requested it earlier.', isBest: false },
      { id: 'c1-2', text: 'I understand the urgency! I am sending a direct one-time passcode to your mobile right now.', isBest: true },
      { id: 'c1-3', text: 'Please submit a formal ticket and wait 24 hours.', isBest: false }
    ]
  },
  {
    id: 'chat-2',
    sender: 'Client: Elena Rostova',
    message: 'Can you tell me if my invoice #9802 was processed or if the payment failed?',
    urgency: 'medium',
    options: [
      { id: 'c2-1', text: 'I am checking invoice #9802 in our billing ledger right now for you.', isBest: true },
      { id: 'c2-2', text: 'Call the billing department tomorrow morning.', isBest: false },
      { id: 'c2-3', text: 'Ask your bank directly instead.', isBest: false }
    ]
  },
  {
    id: 'chat-3',
    sender: 'Client: David Kim',
    message: 'Our company firewall is blocking port 443 during conference calls. Do you have documentation?',
    urgency: 'medium',
    options: [
      { id: 'c3-1', text: 'Here is our Network Security Whitelist Guide and IP ranges for your IT team.', isBest: true },
      { id: 'c3-2', text: 'Just disable your entire company firewall completely.', isBest: false },
      { id: 'c3-3', text: 'Port 443 is not our problem.', isBest: false }
    ]
  },
  {
    id: 'chat-4',
    sender: 'Client: Sarah Jenkins',
    message: 'I received the wrong package size in order #5521. Can I get an immediate replacement?',
    urgency: 'high',
    options: [
      { id: 'c4-1', text: 'Return everything and buy it again at full price.', isBest: false },
      { id: 'c4-2', text: 'I sincerely apologize! I have generated a prepaid return label and expedited the replacement order.', isBest: true },
      { id: 'c4-3', text: 'Mistakes happen, wait until next week.', isBest: false }
    ]
  }
];

export const MULTITASKING_TICKETS: TicketItem[] = [
  {
    id: 'tkt-1',
    code: 'TKT-802',
    title: 'Executive Boardroom Video Call Outage',
    category: 'Technical',
    correctPriority: 'Urgent',
    summary: 'C-Suite scheduled meeting in progress; dialer connectivity severed.'
  },
  {
    id: 'tkt-2',
    code: 'TKT-803',
    title: 'Monthly Recurring Invoice Receipt Copy',
    category: 'Billing',
    correctPriority: 'Low',
    summary: 'User requests PDF copy of last month regular receipt for tax records.'
  },
  {
    id: 'tkt-3',
    code: 'TKT-804',
    title: 'Multiple Login Failures & Password Locked',
    category: 'Account',
    correctPriority: 'Medium',
    summary: 'Sales manager locked out after 5 invalid attempts from hotel Wi-Fi.'
  },
  {
    id: 'tkt-4',
    code: 'TKT-805',
    title: 'Warehouse Label Printer Firmware Upgrade',
    category: 'Technical',
    correctPriority: 'Low',
    summary: 'Routine maintenance scheduled for weekend downtime.'
  },
  {
    id: 'tkt-5',
    code: 'TKT-806',
    title: 'Suspected Fraud: Duplicate $4,200 Wire Transfer Request',
    category: 'Billing',
    correctPriority: 'Urgent',
    summary: 'Suspicious overseas charge initiated without two-factor authentication.'
  }
];

export const MULTITASKING_VERIFICATIONS: VerificationItem[] = [
  {
    id: 'ver-1',
    orderId: 'ORD-9842',
    customerName: 'Jonathan Reed',
    declaredAmount: '$249.00',
    ledgerAmount: '$249.00',
    isMatch: true
  },
  {
    id: 'ver-2',
    orderId: 'ORD-9843',
    customerName: 'Patricia Gomez',
    declaredAmount: '$1,120.00',
    ledgerAmount: '$1,210.00',
    isMatch: false
  },
  {
    id: 'ver-3',
    orderId: 'ORD-9844',
    customerName: 'Arthur Pendelton',
    declaredAmount: '$89.50',
    ledgerAmount: '$89.50',
    isMatch: true
  },
  {
    id: 'ver-4',
    orderId: 'ORD-9845',
    customerName: 'Nathalie Dupont',
    declaredAmount: '$450.00',
    ledgerAmount: '$405.00',
    isMatch: false
  }
];

import { DataEntryRecord } from '../types/assessment';

export interface AudioRecordingItem {
  id: string;
  title: string;
  callerLabel: string;
  durationEstimate: string;
  speechScript: string;
  expectedData: DataEntryRecord;
  notesPrompt: string;
}

export const DATA_ENTRY_RECORDINGS: AudioRecordingItem[] = [
  {
    id: 'rec-1',
    title: 'Recording 1 - Customer Michael Anderson',
    callerLabel: 'Inbound Call #1042 - Account Verification',
    durationEstimate: '22s',
    speechScript: 'Hello, this is Michael Anderson. My account number is 4 5 8 9 2 1. My phone number is 5 5 5 - 2 8 1 - 7 7 4 5. My email address is michael.anderson@email.com. I would like to schedule my consultation for September 15, 2026, at 3:30 PM. Thank you!',
    notesPrompt: 'Listen carefully and extract: Customer Name, Account Number, Phone Number, Email, and Appointment Date & Time.',
    expectedData: {
      id: 'rec-1',
      customerName: 'Michael Anderson',
      accountNumber: '458921',
      phoneNumber: '555-281-7745',
      email: 'michael.anderson@email.com',
      appointment: 'September 15, 2026, 3:30 PM'
    }
  },
  {
    id: 'rec-2',
    title: 'Recording 2 - Client Samantha Miller',
    callerLabel: 'Inbound Call #1043 - Technical Support Onboarding',
    durationEstimate: '24s',
    speechScript: 'Hi there, my name is Samantha Miller. My reference account number is 8 9 2 1 0 4. You can reach me at 5 5 5 - 7 3 9 - 1 2 8 4. Email is s.miller@horizontech.io. We have confirmed our onboarding review for October 02, 2026, at 10:15 AM.',
    notesPrompt: 'Double-check email domain and account number accuracy.',
    expectedData: {
      id: 'rec-2',
      customerName: 'Samantha Miller',
      accountNumber: '892104',
      phoneNumber: '555-739-1284',
      email: 's.miller@horizontech.io',
      appointment: 'October 02, 2026, 10:15 AM'
    }
  },
  {
    id: 'rec-3',
    title: 'Recording 3 - Logistics Client David Rodriguez',
    callerLabel: 'Inbound Call #1044 - Dispatch Rescheduling',
    durationEstimate: '25s',
    speechScript: 'Good morning, this is David Rodriguez from Nexus Logistics. Account number is 6 1 4 7 5 3. Mobile phone is 5 5 5 - 9 0 2 - 3 4 1 1. My contact email is d.rodriguez99@nexuslogistics.com. Please lock in our appointment for November 18, 2026, at 1:00 PM.',
    notesPrompt: 'Pay attention to the spelling of the email prefix and the exact appointment time.',
    expectedData: {
      id: 'rec-3',
      customerName: 'David Rodriguez',
      accountNumber: '614753',
      phoneNumber: '555-902-3411',
      email: 'd.rodriguez99@nexuslogistics.com',
      appointment: 'November 18, 2026, 1:00 PM'
    }
  },
  {
    id: 'rec-4',
    title: 'Recording 4 - Healthcare Provider Jennifer Hayes',
    callerLabel: 'Inbound Call #1045 - Facility Consultation',
    durationEstimate: '23s',
    speechScript: 'Hi, I am calling to confirm details for Jennifer Hayes. Account ID is 3 0 7 8 4 2. Best direct phone line is 5 5 5 - 4 1 6 - 8 9 2 0. Email address is jennifer.hayes@apexcare.org. The requested appointment slot is December 05, 2026, at 4:45 PM.',
    notesPrompt: 'Verify correct account digits and organizational email address.',
    expectedData: {
      id: 'rec-4',
      customerName: 'Jennifer Hayes',
      accountNumber: '307842',
      phoneNumber: '555-416-8920',
      email: 'jennifer.hayes@apexcare.org',
      appointment: 'December 05, 2026, 4:45 PM'
    }
  }
];

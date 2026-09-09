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
    title: 'Recording 1 - Prospect Johnathan Davies',
    callerLabel: 'Inbound Lead #2041 - Rapid Inquiry & Self-Correction',
    durationEstimate: '26s',
    speechScript: 'Hi, this is Johnathan Davies calling from Vanguard Logistics. My phone number is 5 5 5 - 2 1 9 - 4 8 2 0... wait, no, actually that cell has poor reception here, please reach my direct desk at 5 5 5 - 6 8 4 - 2 1 9 0. My email is john.d... wait, no, let\'s use my corporate work email, j.davies@vanguardlogistics.com. Our office address for the contract is 4 2 0 W-Y-C-K-O-F-F Avenue, Suite 3 5 0, that\'s Wyckoff Avenue. Please book our software walkthrough for September 18, 2026, at 2:00 PM. Thanks!',
    notesPrompt: 'Prospect speaks quickly and self-corrects phone number and email. Listen for spelled-out street name.',
    expectedData: {
      id: 'rec-1',
      customerName: 'Johnathan Davies',
      company: 'Vanguard Logistics',
      phoneNumber: '555-684-2190',
      email: 'j.davies@vanguardlogistics.com',
      streetAddress: '420 Wyckoff Avenue, Suite 350',
      appointment: 'September 18, 2026, 2:00 PM'
    }
  },
  {
    id: 'rec-2',
    title: 'Recording 2 - Prospect Meredith Calhoun',
    callerLabel: 'Inbound Lead #2042 - Research Facility Intake',
    durationEstimate: '27s',
    speechScript: 'Hello there, Meredith Calhoun here with Apex BioSystems. Call me at 5 5 5 - 8 3 9 - 1 1 4 2... actually sorry, that line is forwarding to voicemail, use 5 5 5 - 7 0 4 - 5 8 2 9 instead. Email address is m.calhoun... wait, scratch that personal account, send the invitation to mcalhoun@apexbio.org. Our laboratory is at 1 2 5 0 P-S-Z-C-Z-O-L-K-A Boulevard, that\'s Pszczolka Boulevard, Building B. Let\'s set our consultation for October 05, 2026, at 11:30 AM.',
    notesPrompt: 'Self-corrects phone and email to organizational address. Watch the Polish street spelling (Pszczolka).',
    expectedData: {
      id: 'rec-2',
      customerName: 'Meredith Calhoun',
      company: 'Apex BioSystems',
      phoneNumber: '555-704-5829',
      email: 'mcalhoun@apexbio.org',
      streetAddress: '1250 Pszczolka Boulevard, Building B',
      appointment: 'October 05, 2026, 11:30 AM'
    }
  },
  {
    id: 'rec-3',
    title: 'Recording 3 - Prospect Gregory Braithwaite',
    callerLabel: 'Inbound Lead #2043 - Financial Compliance Review',
    durationEstimate: '28s',
    speechScript: 'Good day, Gregory Braithwaite with Sterling Financial Partners. My direct line is 5 5 5 - 3 2 8 - 9 4 1 0... wait, hold on, dial 5 5 5 - 9 1 6 - 4 3 8 2 so my associate picks up if I am in court. Email is greg... wait, no, our official compliance email address is g.braithwaite@sterlingpartners.net. We are located at 9 5 0 K-S-I-E-Z-O-P-O-L-S-K-I Drive, Suite 5 0 0, that\'s Ksiezopolski Drive. Please schedule our security briefing for November 12, 2026, at 4:15 PM.',
    notesPrompt: 'Fast-paced caller. Captures final compliance email and spelled-out Ksiezopolski Drive.',
    expectedData: {
      id: 'rec-3',
      customerName: 'Gregory Braithwaite',
      company: 'Sterling Financial Partners',
      phoneNumber: '555-916-4382',
      email: 'g.braithwaite@sterlingpartners.net',
      streetAddress: '950 Ksiezopolski Drive, Suite 500',
      appointment: 'November 12, 2026, 4:15 PM'
    }
  },
  {
    id: 'rec-4',
    title: 'Recording 4 - Prospect Stephanie Vandeberg',
    callerLabel: 'Inbound Lead #2044 - Cloud Infrastructure Lead',
    durationEstimate: '26s',
    speechScript: 'Hi, Stephanie Vandeberg here from CloudScale Solutions. Best contact number is 5 5 5 - 4 9 2 - 3 8 1 0... wait, that was my home line, call my work cell at 5 5 5 - 8 3 1 - 6 7 2 4. Email is steph.v... wait, no, let\'s use my primary corporate email, svandeberg@cloudscale.io. Ship the pilot testing units to 3 1 0 Q-U-E-U-E-N-C-E-L-L-E Court, Floor 4, that\'s Queuencelle Court. We have penciled in December 02, 2026, at 9:00 AM for the deployment review.',
    notesPrompt: 'Self-corrects phone and email. Spells Queuencelle Court.',
    expectedData: {
      id: 'rec-4',
      customerName: 'Stephanie Vandeberg',
      company: 'CloudScale Solutions',
      phoneNumber: '555-831-6724',
      email: 'svandeberg@cloudscale.io',
      streetAddress: '310 Queuencelle Court, Floor 4',
      appointment: 'December 02, 2026, 9:00 AM'
    }
  }
];

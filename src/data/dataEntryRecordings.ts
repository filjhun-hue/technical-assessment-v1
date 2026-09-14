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
    title: 'Call Recording 1',
    callerLabel: 'Inbound Lead #2041 - Logistics Inquiry',
    durationEstimate: '26s',
    speechScript: "Hi, this is Johnathan Davies. That's spelled J, O, H, N, A, T, H, A, N, Davies, D, A, V, I, E, S, calling from Vanguard Logistics. My phone number is 5 5 5, 2 1 9, 4 8 2 0... wait, no, actually that cell has poor reception here. Please reach my direct desk at 5 5 5, 6 8 4, 2 1 9 0. My email is john dot d... wait, let's use my corporate work email: j dot davies at vanguard logistics dot com. Spelled: j, dot, d, a, v, i, e, s, at vanguard logistics dot com. Our office address for the contract is 4 2 0 Wyckoff Avenue, Suite 3 5 0. That street is spelled W, Y, C, K, O, F, F, Avenue. Again, that address is 4 2 0 Wyckoff Avenue, Suite 3 5 0. Please book our consultation for September 18, 2026, at 2:00 PM. Thanks!",
    notesPrompt: 'Prospect spells out his name and street address. Listen for final direct phone desk and repeated corporate address.',
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
    title: 'Call Recording 2',
    callerLabel: 'Inbound Lead #2042 - Research Facility Intake',
    durationEstimate: '26s',
    speechScript: "Hello there, Marcus Calhoun here. That's spelled M, A, R, C, U, S, Calhoun, C, A, L, H, O, U, N, with Apex BioSystems. You can reach me at 5 5 5, 8 3 9, 1 1 4 2... actually sorry, that line is forwarding to voicemail. Use 5 5 5, 7 0 4, 5 8 2 9 instead. Email address is marcus dot c... wait, scratch that personal account, send the invitation to m dot calhoun at apex bio dot org. Spelled: m, dot, c, a, l, h, o, u, n, at apex bio dot org. Our laboratory is at 1 2 5 0 Belmont Boulevard, Building B. That street is spelled B, E, L, M, O, N, T, Boulevard. Again, that address is 1 2 5 0 Belmont Boulevard, Building B. Let's set our consultation for October 05, 2026, at 11:30 AM.",
    notesPrompt: 'Prospect spells out his name and street address. Listen for final direct line and repeated laboratory address.',
    expectedData: {
      id: 'rec-2',
      customerName: 'Marcus Calhoun',
      company: 'Apex BioSystems',
      phoneNumber: '555-704-5829',
      email: 'm.calhoun@apexbio.org',
      streetAddress: '1250 Belmont Boulevard, Building B',
      appointment: 'October 05, 2026, 11:30 AM'
    }
  },
  {
    id: 'rec-3',
    title: 'Call Recording 3',
    callerLabel: 'Inbound Lead #2043 - Financial Compliance Review',
    durationEstimate: '27s',
    speechScript: "Good day, Gregory Braithwaite. That's spelled G, R, E, G, O, R, Y, Braithwaite, B, R, A, I, T, H, W, A, I, T, E, with Sterling Financial Partners. My direct line is 5 5 5, 3 2 8, 9 4 1 0... wait, hold on, dial 5 5 5, 9 1 6, 4 3 8 2 so my associate picks up if I am in court. Email is greg... wait, no, our official compliance address is g dot braithwaite at sterling partners dot net. Spelled: g, dot, b, r, a, i, t, h, w, a, i, t, e, at sterling partners dot net. We are located at 9 5 0 Kensington Drive, Suite 5 0 0. That street is spelled K, E, N, S, I, N, G, T, O, N, Drive. Again, that address is 9 5 0 Kensington Drive, Suite 5 0 0. Please schedule our briefing for November 12, 2026, at 4:15 PM.",
    notesPrompt: 'Prospect spells out his name and street address. Listen for final direct line and repeated office address.',
    expectedData: {
      id: 'rec-3',
      customerName: 'Gregory Braithwaite',
      company: 'Sterling Financial Partners',
      phoneNumber: '555-916-4382',
      email: 'g.braithwaite@sterlingpartners.net',
      streetAddress: '950 Kensington Drive, Suite 500',
      appointment: 'November 12, 2026, 4:15 PM'
    }
  }
];

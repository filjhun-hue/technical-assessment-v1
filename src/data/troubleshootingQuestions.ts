import { Question } from '../types/assessment';

export const TROUBLESHOOTING_QUESTIONS: Question[] = [
  {
    id: 'ts-1',
    category: '1. Network Connection',
    question: 'Scenario: A prospect or team member says their computer shows it is connected to Wi-Fi, but they cannot load any websites or access the CRM. What is the best first step to check?',
    options: [
      { id: 'A', text: "Immediately restart the computer's operating system." },
      { id: 'B', text: 'Check if the router actually has internet access by testing another device, like a smartphone, on the same Wi-Fi network.' },
      { id: 'C', text: 'Uninstall and reinstall the web browser.' },
      { id: 'D', text: 'Unplug the computer monitor and plug it back in.' }
    ],
    correctOptionId: 'B',
    explanation: 'Testing another device on the same network quickly isolates whether the problem is with the internet service provider / router or the specific local machine.'
  },
  {
    id: 'ts-2',
    category: '2. Audio Input (Microphone)',
    question: 'Scenario: You are on an outbound call, but the prospect complains that your voice is cutting out constantly or sounds like a "robot." What is the most likely cause you need to investigate?',
    options: [
      { id: 'A', text: 'Your headset microphone is physically broken and needs replacement.' },
      { id: 'B', text: 'You are experiencing network latency or a highly unstable internet connection.' },
      { id: 'C', text: "The computer's screen resolution is set too high." },
      { id: 'D', text: "The prospect's phone has a virus." }
    ],
    correctOptionId: 'B',
    explanation: 'A "robotic" voice or choppy audio on VoIP calls is classic packet loss, jitter, or high network latency on the internet connection.'
  },
  {
    id: 'ts-3',
    category: '3. Audio Output (Speakers/Headphones)',
    question: 'Scenario: You start a dialer session or join a team meeting. You can see the other person speaking (their microphone icon is lighting up), but you cannot hear them at all. What should you check first?',
    options: [
      { id: 'A', text: 'Tell the other person their microphone is muted.' },
      { id: 'B', text: 'Perform a hard reboot of your computer.' },
      { id: 'C', text: "Check your computer's volume settings and ensure your headset is selected as the active audio output device." },
      { id: 'D', text: 'Disconnect from the internet and reconnect.' }
    ],
    correctOptionId: 'C',
    explanation: 'If their mic is lighting up, their audio is broadcasting; the most common failure point is your local volume being muted or directed to the wrong audio output device.'
  },
  {
    id: 'ts-4',
    category: '4. Software Freezing',
    question: 'Scenario: You are in the middle of logging notes into the CRM, and the webpage suddenly freezes. The mouse moves, but clicking buttons on the website does nothing. What is the quickest first step to resolve this?',
    options: [
      { id: 'A', text: 'Unplug the computer from the wall outlet to force a shutdown.' },
      { id: 'B', text: 'Submit an IT support ticket and wait for a response before doing anything else.' },
      { id: 'C', text: 'Refresh the web page (F5 or Ctrl + R) to see if the connection timed out.' },
      { id: 'D', text: 'Delete the CRM shortcut from your desktop.' }
    ],
    correctOptionId: 'C',
    explanation: 'Refreshing the webpage (F5 or Ctrl + R) reloads scripts and re-establishes the browser connection without losing system state.'
  },
  {
    id: 'ts-5',
    category: '5. Peripheral Devices',
    question: 'Scenario: Your wireless mouse suddenly stops moving the cursor on the screen, but your keyboard is still typing perfectly. What is the most logical troubleshooting step?',
    options: [
      { id: 'A', text: "Assume the computer's motherboard is failing." },
      { id: 'B', text: "Check the mouse's battery level or replace the batteries, and ensure the USB receiver is plugged in securely." },
      { id: 'C', text: 'Restart the internet router.' },
      { id: 'D', text: 'Hit the mouse against the desk to reset the optical sensor.' }
    ],
    correctOptionId: 'B',
    explanation: 'Wireless mice run on internal batteries and use a 2.4GHz USB dongle or Bluetooth; dead batteries or a loose receiver are the most common causes.'
  },
  {
    id: 'ts-6',
    category: '6. Application Performance',
    question: 'Scenario: Your computer is running extremely slowly today. It takes several seconds for letters to appear on the screen when you type, and switching between tabs is lagging. What is the best immediate action?',
    options: [
      { id: 'A', text: 'Open the Task Manager (or Activity Monitor) to see if a background application is using up all your CPU or RAM.' },
      { id: 'B', text: 'Buy more cloud storage.' },
      { id: 'C', text: 'Turn off the computer monitor to save power.' },
      { id: 'D', text: 'Wipe the hard drive completely clean.' }
    ],
    correctOptionId: 'A',
    explanation: 'Task Manager reveals memory leaks or rogue background processes hogging CPU/RAM so you can safely identify and terminate them.'
  },
  {
    id: 'ts-7',
    category: '7. Web Application / Browser Cache Issue',
    question: 'Scenario: The company recently updated the CRM web application, but when you log in, the dashboard looks distorted and some buttons are overlapping. Your teammates in the chat say their screens look completely normal. What is the best first step to fix your view?',
    options: [
      { id: 'A', text: 'Submit an emergency ticket to the developers stating the application is broken.' },
      { id: 'B', text: 'Clear your web browser’s cache and cookies, or try opening the CRM in an Incognito/Private browsing window.' },
      { id: 'C', text: 'Restart your internet router to refresh the connection.' },
      { id: 'D', text: "Change your monitor's display resolution." }
    ],
    correctOptionId: 'B',
    explanation: 'When web apps update, browsers often retain stale cached CSS stylesheets and JS files. Clearing cache or opening Incognito loads the fresh assets.'
  },
  {
    id: 'ts-8',
    category: '8. Dual Monitor Display',
    question: 'Scenario: You have a second monitor plugged in to help manage your workflow, but the second screen suddenly goes black while your main laptop screen is still working fine. What is the most logical first thing to check?',
    options: [
      { id: 'A', text: "Check the computer's Task Manager for a virus." },
      { id: 'B', text: 'Uninstall and reinstall your web browser.' },
      { id: 'C', text: 'Verify that the monitor is powered on and that the HDMI or display cable is securely connected at both ends.' },
      { id: 'D', text: 'Turn off the computer and wait an hour before turning it back on.' }
    ],
    correctOptionId: 'C',
    explanation: 'Physical connection issues (loose HDMI/DisplayPort cable or power cord disconnection) account for the vast majority of sudden external screen outages.'
  },
  {
    id: 'ts-9',
    category: '9. Login Credentials',
    question: 'Scenario: You are starting your shift and trying to log into the team dashboard, but you keep getting an "Invalid Password" error. You are absolutely certain you are typing the correct password. What is the most common, simple reason for this that you should check first?',
    options: [
      { id: 'A', text: 'The company servers have crashed.' },
      { id: 'B', text: "Your keyboard's Caps Lock key is accidentally turned on, or your Num Lock is turned off." },
      { id: 'C', text: 'Your internet connection is too slow to process the login.' },
      { id: 'D', text: 'The keyboard needs to be replaced.' }
    ],
    correctOptionId: 'B',
    explanation: 'Passwords are case-sensitive; having Caps Lock active silently changes the typed password and produces invalid credential errors.'
  },
  {
    id: 'ts-10',
    category: '10. Default Audio Device Routing',
    question: 'Scenario: You plug in a new USB headset to start making outbound calls. However, when the phone rings, the audio is still coming out of your laptop\'s built-in speakers instead of the headset. How do you fix this?',
    options: [
      { id: 'A', text: 'Go into the computer’s system Sound Settings and manually select the USB headset as the default "Output" device.' },
      { id: 'B', text: 'Mute the laptop speakers using the keyboard volume keys.' },
      { id: 'C', text: 'Unplug the headset and plug it back in repeatedly until the computer recognizes it.' },
      { id: 'D', text: 'Call the IT department to update the computer\'s operating system.' }
    ],
    correctOptionId: 'A',
    explanation: 'Setting the USB headset as the default system output or within the calling software sound configuration directs incoming audio to the headset.'
  },
  {
    id: 'ts-11',
    category: '11. Background Application Interference',
    question: 'Scenario: Your outbound dialing software keeps dropping calls exactly when you open a specific spreadsheet to check prospect data. What is the most likely cause?',
    options: [
      { id: 'A', text: 'The spreadsheet is infected with a virus that targets phone calls.' },
      { id: 'B', text: 'Your computer lacks enough RAM (memory) to run the heavy spreadsheet and the dialer at the same time, causing the dialer to crash.' },
      { id: 'C', text: 'The dialing software needs a new password.' },
      { id: 'D', text: 'Your headset is disconnected.' }
    ],
    correctOptionId: 'B',
    explanation: 'Large spreadsheets with heavy macros or hundreds of thousands of rows consume significant RAM, starving VoIP processes and triggering crashes or dropped connections.'
  }
];

import { Question } from '../types/assessment';

export const NAVIGATION_QUESTIONS: Question[] = [
  {
    id: 'nav-1',
    category: 'Keyboard Shortcuts',
    question: 'What is the primary function of the keyboard shortcuts Ctrl + C and Ctrl + V?',
    options: [
      { id: 'A', text: 'Cut text and save it to a new file' },
      { id: 'B', text: 'Copy a selected item and paste it elsewhere' },
      { id: 'C', text: 'Close an application and view the desktop' },
      { id: 'D', text: 'Center text and view the print preview' }
    ],
    correctOptionId: 'B',
    explanation: 'Ctrl + C copies the selected item/text into the clipboard, and Ctrl + V pastes it at the cursor location.'
  },
  {
    id: 'nav-2',
    category: 'Window & App Management',
    question: 'Which keyboard shortcut is commonly used to quickly switch between open applications?',
    options: [
      { id: 'A', text: 'Shift + Space' },
      { id: 'B', text: 'Ctrl + Alt + Delete' },
      { id: 'C', text: 'Alt + Tab' },
      { id: 'D', text: 'Windows Key + D' }
    ],
    correctOptionId: 'C',
    explanation: 'Alt + Tab (or Cmd + Tab on macOS) cycles quickly between active open windows and applications.'
  },
  {
    id: 'nav-3',
    category: 'File System & Search',
    question: "What is the most efficient way to search for a specific file on your computer if you don't know which folder it is in?",
    options: [
      { id: 'A', text: 'Open every folder on the desktop one by one' },
      { id: 'B', text: 'Use the search bar in the Start Menu or File Explorer' },
      { id: 'C', text: 'Open a web browser and search for the file name' },
      { id: 'D', text: 'Look through the Recycle Bin' }
    ],
    correctOptionId: 'B',
    explanation: 'The system search bar in the Start Menu or File Explorer indexes your storage to locate files rapidly.'
  },
  {
    id: 'nav-4',
    category: 'Operating System Tools',
    question: 'What is the primary purpose of the Task Manager?',
    options: [
      { id: 'A', text: 'To manage daily calendar appointments' },
      { id: 'B', text: 'To download new software updates' },
      { id: 'C', text: 'To view system performance and force-close unresponsive applications' },
      { id: 'D', text: 'To organize files into folders' }
    ],
    correctOptionId: 'C',
    explanation: 'Task Manager displays active processes, resource utilization (CPU, memory, disk), and lets you kill unresponsive tasks.'
  },
  {
    id: 'nav-5',
    category: 'Network & File Concepts',
    question: 'Which of the following best describes the difference between downloading and uploading a file?',
    options: [
      { id: 'A', text: 'Downloading is saving a file from the internet to your computer; uploading is sending a file from your computer to the internet.' },
      { id: 'B', text: 'Downloading requires an internet connection; uploading only requires a local network.' },
      { id: 'C', text: 'Downloading is sending an email; uploading is receiving an email.' },
      { id: 'D', text: 'Downloading moves files to the cloud; uploading saves files to a USB drive.' }
    ],
    correctOptionId: 'A',
    explanation: 'Downloading pulls data from a remote server/internet to your local device; uploading pushes data from your device to a remote server.'
  },
  {
    id: 'nav-6',
    category: 'Screen Capture',
    question: 'Which of the following is a standard method to take a screenshot of your computer screen?',
    options: [
      { id: 'A', text: 'Pressing the Esc key twice' },
      { id: 'B', text: 'Pressing Print Screen (PrtScn) or using the Snipping Tool / Shift + Cmd + 4' },
      { id: 'C', text: 'Pressing Ctrl + S' },
      { id: 'D', text: 'Clicking the right mouse button on the desktop' }
    ],
    correctOptionId: 'B',
    explanation: 'PrtScn / Snipping Tool (Windows Key + Shift + S) or Shift + Cmd + 4 on macOS capture screenshot selections.'
  },
  {
    id: 'nav-7',
    category: 'Troubleshooting & Recovery',
    question: 'What is the best immediate step to take if an application freezes and becomes entirely unresponsive?',
    options: [
      { id: 'A', text: 'Unplug the computer from the wall outlet' },
      { id: 'B', text: 'Delete the application from the computer' },
      { id: 'C', text: 'Press Ctrl + Alt + Delete (or Ctrl + Shift + Esc) to open the Task Manager and end the task' },
      { id: 'D', text: 'Press the spacebar repeatedly until it responds' }
    ],
    correctOptionId: 'C',
    explanation: 'Invoking the Task Manager allows you to terminate the specific frozen process without risking filesystem corruption.'
  },
  {
    id: 'nav-8',
    category: 'Desktop & File Organization',
    question: 'How do you manually organize a group of loose files on your desktop into a new folder?',
    options: [
      { id: 'A', text: 'Right-click the desktop, select "New Folder," name it, and drag the files inside' },
      { id: 'B', text: 'Select all files and press "Delete"' },
      { id: 'C', text: 'Open the files and click "Save As" for every single one' },
      { id: 'D', text: 'Double-click the desktop to automatically group them' }
    ],
    correctOptionId: 'A',
    explanation: 'Right-clicking to create a new folder and dragging the files inside is the standard desktop organization workflow.'
  },
  {
    id: 'nav-9',
    category: 'Keyboard Shortcuts',
    question: 'What does the keyboard shortcut Ctrl + Z (or Cmd + Z) do?',
    options: [
      { id: 'A', text: 'Zooms in on the screen' },
      { id: 'B', text: 'Undoes the last action' },
      { id: 'C', text: 'Zips a file into a compressed folder' },
      { id: 'D', text: 'Puts the computer to sleep' }
    ],
    correctOptionId: 'B',
    explanation: 'Ctrl + Z reverses the most recent action or typed input.'
  },
  {
    id: 'nav-10',
    category: 'Browser Navigation',
    question: 'If you are on a long webpage and need to find a specific word, what is the fastest method?',
    options: [
      { id: 'A', text: 'Scroll slowly and read every line' },
      { id: 'B', text: 'Press Ctrl + F (or Cmd + F) to open the "Find" search box' },
      { id: 'C', text: 'Refresh the page' },
      { id: 'D', text: 'Bookmark the page and check it later' }
    ],
    correctOptionId: 'B',
    explanation: 'Ctrl + F (Find in Page) opens an instant in-browser search to navigate directly to matching words.'
  },
  {
    id: 'nav-11',
    category: 'Web Security',
    question: "When looking at a website's address bar, what indicates that the connection is secure for entering passwords or personal information?",
    options: [
      { id: 'A', text: 'The website address starts with "www."' },
      { id: 'B', text: 'The URL begins with "https://" and shows a small padlock icon' },
      { id: 'C', text: 'The website has a professional design' },
      { id: 'D', text: 'A pop-up confirms the site is safe' }
    ],
    correctOptionId: 'B',
    explanation: 'HTTPS with a padlock icon signifies encrypted SSL/TLS data transmission between your browser and the web server.'
  }
];

// Audio synthesizer utility using Web Speech Synthesis API and Web Audio context

export class AudioEngine {
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static isSpeaking: boolean = false;
  private static onStateChangeCallback: ((speaking: boolean, progress: number) => void) | null = null;

  public static speakText(
    text: string,
    rate: number = 0.95,
    onEnd?: () => void,
    onStateChange?: (speaking: boolean, progress: number) => void
  ): boolean {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return false;
    }

    window.speechSynthesis.cancel();
    this.onStateChangeCallback = onStateChange || null;

    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Choose preferred clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Zira'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true, 0);
    };

    utterance.onboundary = (event) => {
      if (text.length > 0 && this.onStateChangeCallback) {
        const progress = Math.min(100, Math.round((event.charIndex / text.length) * 100));
        this.onStateChangeCallback(true, progress);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, 100);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, 0);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public static pause(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public static resume(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public static stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false, 0);
      }
    }
  }

  public static isPlaying(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }
}

// Audio synthesizer utility using Web Speech Synthesis API and Web Audio context

export class AudioEngine {
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static isSpeaking: boolean = false;
  private static onStateChangeCallback: ((speaking: boolean, progress: number) => void) | null = null;
  private static keepAliveTimer: number | null = null;

  private static startKeepAlive(): void {
    this.stopKeepAlive();
    // Chromium bug workaround: speech synthesis abruptly pauses after ~15 seconds without a resume ping
    this.keepAliveTimer = window.setInterval(() => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  private static stopKeepAlive(): void {
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

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

    this.stop();
    this.onStateChangeCallback = onStateChange || null;

    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Choose preferred clear English male voice to match prospect persona
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('David') ||
            v.name.includes('Guy') ||
            v.name.includes('Mark') ||
            v.name.includes('George') ||
            v.name.includes('James') ||
            v.name.includes('Ryan') ||
            v.name.includes('Christopher') ||
            v.name.includes('Male'))
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google')) &&
          !v.name.includes('Zira') &&
          !v.name.includes('Samantha') &&
          !v.name.includes('Jenny') &&
          !v.name.includes('Female')
      ) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.startKeepAlive();
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
      this.stopKeepAlive();
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, 100);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.stopKeepAlive();
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
    this.stopKeepAlive();
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

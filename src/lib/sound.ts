// Процедурный звуковой движок (Web Audio API) + TTS озвучка (Web Speech API)
// Не требует внешних mp3 файлов и работает мгновенно на телефоне и в OBS.

class SoundEngine {
  private ctx: AudioContext | null = null;
  public volume = 0.65;
  public muted = false;
  public ttsEnabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.muted || this.volume <= 0) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, gainPeak = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const vol = gainPeak * this.volume;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, vol), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playGuess() {
    this.playTone(440, 0.09, 'triangle', 0, 0.14);
    this.playTone(554, 0.09, 'triangle', 0.05, 0.12);
  }

  playWrong() {
    this.playTone(220, 0.14, 'sawtooth', 0, 0.1);
    this.playTone(170, 0.16, 'sawtooth', 0.07, 0.09);
  }

  playCorrect() {
    this.playTone(523.25, 0.12, 'sine', 0, 0.24);
    this.playTone(659.25, 0.14, 'sine', 0.08, 0.24);
    this.playTone(783.99, 0.22, 'sine', 0.16, 0.26);
  }

  playGift() {
    this.playTone(587.33, 0.12, 'triangle', 0, 0.22);
    this.playTone(880, 0.16, 'triangle', 0.08, 0.24);
    this.playTone(1174.66, 0.26, 'sine', 0.16, 0.26);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', idx * 0.1, 0.28);
    });
  }

  speak(text: string, lang = 'ru-RU') {
    if (typeof window === 'undefined' || this.muted || !this.ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'en' ? 'en-US' : lang === 'tr' ? 'tr-TR' : lang === 'id' ? 'id-ID' : 'ru-RU';
      utter.volume = Math.min(1, Math.max(0, this.volume));
      utter.rate = 1.05;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore TTS failures in restricted OBS/browser contexts
    }
  }
}

export const soundEngine = new SoundEngine();

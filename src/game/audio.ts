/**
 * Procedural Web Audio API sound synthesizer for Sky Hop.
 * Zero external audio files required — ultra-crisp, zero latency, pitch-dynamic audio.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private isMusicPlaying = false;
  private currentChordIndex = 0;

  private sfxVolume = 0.8;
  private musicVolume = 0.5;
  private sfxEnabled = true;
  private musicEnabled = true;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume * 0.35 : 0, this.ctx.currentTime);
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(enabled ? this.sfxVolume : 0, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(enabled ? this.musicVolume * 0.35 : 0, this.ctx.currentTime);
    }
    if (enabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  /**
   * Sound: Wing Flap / Thrust
   */
  public playFlap(pitchMultiplier = 1.0) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = (240 + Math.random() * 30) * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Sound: Passed Obstacle (Chime scaled to combo)
   */
  public playScore(combo = 0) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
    const note = notes[Math.min(notes.length - 1, combo)];

    osc.frequency.setValueAtTime(note, t);
    osc.frequency.exponentialRampToValueAtTime(note * 1.05, t + 0.15);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Sound: Coin pickup (crisp double ping with musical pentatonic streak escalation)
   */
  public playCoin(streak = 0) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale escalation based on streak (0 to 6)
    const pitches = [
      { f1: 987.77, f2: 1318.51 }, // B5 -> E6
      { f1: 1108.73, f2: 1479.98 }, // C#6 -> F#6
      { f1: 1244.51, f2: 1661.22 }, // D#6 -> G#6
      { f1: 1318.51, f2: 1760.0 }, // E6 -> A6
      { f1: 1479.98, f2: 1975.53 }, // F#6 -> B6
      { f1: 1661.22, f2: 2217.46 }, // G#6 -> C#7
      { f1: 1975.53, f2: 2637.02 }, // B6 -> E7
    ];
    const pitch = pitches[Math.min(pitches.length - 1, Math.max(0, streak))];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch.f1, t);
    osc.frequency.setValueAtTime(pitch.f2, t + 0.045);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.setValueAtTime(0.24, t + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * Sound: Gem pickup (shimmering triplet)
   */
  public playGem() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.18, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(st);
      osc.stop(st + 0.3);
    });
  }

  /**
   * Sound: Near-miss whoosh
   */
  public playNearMiss() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Sound: Powerup collected
   */
  public playPowerup() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + i * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.16, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(st);
      osc.stop(st + 0.36);
    });
  }

  /**
   * Sound: Shield break / damage absorbed
   */
  public playShieldBreak() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Sound: Collision / Crash game over
   */
  public playCrash() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Low rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.45);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  /**
   * Sound: Resurrect / Revive fanfare
   */
  public playRevive() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [329.63, 440, 554.37, 659.25, 880, 1108.73]; // E4 -> C#6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + idx * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, st + 0.25);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.24, st + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(st);
      osc.stop(st + 0.38);
    });
  }

  /**
   * Sound: Button click / UI tap
   */
  public playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Ambient Lo-Fi Harmonic Background Synthesizer
   */
  public startAmbientMusic() {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGain || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.playNextChord();
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playNextChord() {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    // Chords: Cmaj7 -> Am7 -> Fmaj7 -> Gsus4
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // C, E, G, B
      [220.0, 261.63, 329.63, 392.0],  // A, C, E, G
      [174.61, 220.0, 261.63, 329.63], // F, A, C, E
      [196.0, 261.63, 293.66, 392.0],  // G, C, D, G
    ];

    const chord = chords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

    const now = this.ctx.currentTime;
    const chordDuration = 2.4;

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 80, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.02, now + chordDuration - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(now);
      osc.stop(now + chordDuration + 0.1);
    });

    this.musicTimer = window.setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playNextChord();
      }
    }, chordDuration * 1000 - 150);
  }
}

export const soundEngine = new SoundEngine();

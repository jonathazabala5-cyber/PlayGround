// Lightweight procedural audio. No external assets: everything is synthesised.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.started = false;
    this.timer = null;
    this.chirpTimer = null;
    this.volume = 0.55;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.ctx.destination);
      this.startAmbient();
      this.scheduleChirp();
      this.started = true;
    } catch (error) {
      console.warn('Audio unavailable', error);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : this.volume, t + 0.25);
    }
  }

  noiseBuffer(seconds = 1, brown = true) {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(rate * seconds)), rate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      } else {
        data[i] = white;
      }
    }
    return buffer;
  }

  startAmbient() {
    const ctx = this.ctx;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(6, true);
    source.loop = true;

    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 420;
    low.Q.value = 0.6;

    const lowGain = ctx.createGain();
    lowGain.gain.value = 0.075;

    source.connect(low).connect(lowGain).connect(this.master);
    source.start();

    // A breath of leaves and distant water.
    const air = ctx.createBufferSource();
    air.buffer = this.noiseBuffer(4, false);
    air.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1800;
    band.Q.value = 0.5;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.007;
    air.connect(band).connect(airGain).connect(this.master);
    air.start();

    // Slow swell so the jungle feels alive.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.022;
    lfo.connect(lfoGain).connect(lowGain.gain);
    lfo.start();
  }

  scheduleChirp() {
    if (this.timer) clearTimeout(this.timer);
    const delay = 2600 + Math.random() * 6500;
    this.timer = setTimeout(() => {
      this.chirp();
      this.scheduleChirp();
    }, delay);
  }

  chirp() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.02;
    const base = 1500 + Math.random() * 1500;
    const notes = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < notes; i += 1) {
      const t = t0 + i * (0.075 + Math.random() * 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * (1 + i * 0.04), t);
      osc.frequency.exponentialRampToValueAtTime(base * (1.22 + Math.random() * 0.2), t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.12);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.022, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(this.master);
      osc.start(t);
      osc.stop(t + 0.19);
    }
  }

  tone(freq, duration, type = 'sine', gain = 0.08, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + duration);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, duration * 0.2));
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  noise(duration = 0.2, gain = 0.07, filterType = 'lowpass', frequency = 800, q = 0.8, delay = 0) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(duration + 0.05, false);
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(env).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  step() {
    this.noise(0.11, 0.035, 'bandpass', 420 + Math.random() * 180, 1.4);
  }

  splash() {
    this.noise(0.4, 0.08, 'bandpass', 1100, 0.9);
    this.tone(180, 0.25, 'sine', 0.03, 90);
  }

  cut() {
    this.noise(0.22, 0.13, 'highpass', 900, 0.7);
    this.noise(0.12, 0.06, 'bandpass', 2600, 1.2);
    this.tone(130, 0.18, 'triangle', 0.06, 70);
  }

  pickup() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, 0.55, 'triangle', 0.045, null, i * 0.08));
    this.tone(1567.98, 0.7, 'sine', 0.025, null, 0.32);
  }

  gate() {
    this.noise(2.6, 0.12, 'lowpass', 260, 0.5);
    this.tone(54, 2.4, 'sawtooth', 0.08, 28);
    this.tone(81, 2.8, 'triangle', 0.05, 42);
    this.tone(162, 1.6, 'sine', 0.025, 108, 0.4);
  }

  chime() {
    this.tone(880, 0.5, 'sine', 0.035);
    this.tone(1318.5, 0.7, 'sine', 0.022, null, 0.09);
  }

  win() {
    const melody = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    melody.forEach((f, i) => {
      this.tone(f, 1.4, 'triangle', 0.055, null, i * 0.18);
      this.tone(f / 2, 1.8, 'sine', 0.03, null, i * 0.18);
    });
    this.tone(261.63, 3.2, 'sine', 0.04, null, 0.4);
    this.tone(329.63, 3.2, 'sine', 0.035, null, 0.4);
    this.tone(392, 3.2, 'sine', 0.03, null, 0.4);
  }
}

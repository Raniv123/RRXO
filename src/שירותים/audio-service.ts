import { Phase } from '../types';

interface AudioProfile {
  chord: number[];
  waveType: OscillatorType;
  filterFreq: number;
  filterType: BiquadFilterType;
  lfoRate: number;
  volume: number;
}

const PROFILES: Record<Phase, AudioProfile> = {
  ICE: {
    chord: [174.61, 220.00, 261.63, 329.63], // Fmaj7
    waveType: 'sine',
    filterFreq: 400,
    filterType: 'lowpass',
    lfoRate: 0.1,
    volume: 0.08
  },
  WARM: {
    chord: [146.83, 185.00, 220.00, 261.63], // D7
    waveType: 'sine',
    filterFreq: 600,
    filterType: 'lowpass',
    lfoRate: 0.2,
    volume: 0.1
  },
  HOT: {
    chord: [110.00, 164.81, 196.00, 277.18], // Am add9
    waveType: 'sine',
    filterFreq: 800,
    filterType: 'bandpass',
    lfoRate: 0.4,
    volume: 0.12
  },
  FIRE: {
    chord: [65.41, 98.00, 116.54, 155.56], // Cm7
    waveType: 'sawtooth',
    filterFreq: 1200,
    filterType: 'bandpass',
    lfoRate: 0.6,
    volume: 0.14
  }
};

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private currentPhase: Phase | null = null;
  private isPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async start(phase: Phase): Promise<void> {
    if (this.isPlaying && this.currentPhase === phase) return;

    await this.stop();
    const ctx = this.getContext();
    if (ctx.state === 'suspended') await ctx.resume();

    const profile = PROFILES[phase];

    // Master gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);

    // Filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type = profile.filterType;
    this.filter.frequency.value = profile.filterFreq;
    this.filter.Q.value = 1.5;
    this.filter.connect(this.masterGain);

    // LFO for tremolo
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = profile.lfoRate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);
    this.lfo.start();

    // Chord oscillators
    this.oscillators = profile.chord.map(freq => {
      const osc = ctx.createOscillator();
      osc.type = profile.waveType;
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.value = profile.volume / profile.chord.length;
      osc.connect(oscGain);
      oscGain.connect(this.filter!);
      osc.start();
      return osc;
    });

    // Pink noise
    this.createNoise(ctx, profile);

    // Fade in
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

    this.currentPhase = phase;
    this.isPlaying = true;
  }

  private createNoise(ctx: AudioContext, profile: AudioProfile): void {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = profile.filterFreq * 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.3;

    this.noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    this.noiseSource.start();
  }

  async transition(newPhase: Phase): Promise<void> {
    if (this.currentPhase === newPhase) return;
    await this.start(newPhase);
  }

  async stop(): Promise<void> {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.cleanup();
      return;
    }

    const ctx = this.ctx;
    this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    await new Promise(resolve => setTimeout(resolve, 1600));
    this.cleanup();
  }

  private cleanup(): void {
    this.oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch {} });
    this.oscillators = [];
    if (this.lfo) { try { this.lfo.stop(); this.lfo.disconnect(); } catch {} this.lfo = null; }
    if (this.noiseSource) { try { this.noiseSource.stop(); this.noiseSource.disconnect(); } catch {} this.noiseSource = null; }
    if (this.filter) { try { this.filter.disconnect(); } catch {} this.filter = null; }
    if (this.masterGain) { try { this.masterGain.disconnect(); } catch {} this.masterGain = null; }
    this.isPlaying = false;
    this.currentPhase = null;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentPhase(): Phase | null {
    return this.currentPhase;
  }
}

export const audioService = new AudioService();

import { clamp } from '@/lib/tempo';
import type { ClickPreset } from '@/types/metronome';

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** Lazily creates (and caches per context) a short white-noise buffer for noise presets. */
function getNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    const length = Math.floor(ctx.sampleRate * 0.1);
    buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

/** Options controlling a single scheduled click. */
export interface ScheduleClickOptions {
  /** Synthesis parameters for the click. */
  preset: ClickPreset;
  /** Whether this is an accented downbeat (higher pitch + louder). */
  accent: boolean;
  /** Output volume, 0–1. */
  volume: number;
  /** Node the click connects to (e.g. `ctx.destination`). */
  destination: AudioNode;
}

/**
 * Schedules a single click at an exact time on the given audio context. Works
 * with both a live {@link AudioContext} and an `OfflineAudioContext`, so the
 * exported file matches live playback exactly.
 *
 * @param ctx Audio context to schedule on.
 * @param when Start time in the context's time coordinate (seconds).
 * @param options Click configuration.
 */
export function scheduleClick(ctx: BaseAudioContext, when: number, options: ScheduleClickOptions): void {
  const { preset, accent, volume, destination } = options;

  const frequency = accent ? preset.accentFrequency : preset.frequency;
  const peak = clamp(volume, 0, 1) * (accent ? 1 : 0.75);
  const start = when;
  const end = when + preset.decay;

  const gain = ctx.createGain();
  gain.connect(destination);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  if (preset.kind === 'tone') {
    const osc = ctx.createOscillator();
    osc.type = preset.waveform ?? 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(end + 0.02);
  } else {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.setValueAtTime(6, start);
    source.connect(filter);
    filter.connect(gain);
    source.start(start);
    source.stop(end + 0.02);
  }
}

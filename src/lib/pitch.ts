import { NOTE_NAMES } from '@/constants/tuner';

/** A resolved musical note derived from a detected frequency. */
export interface NoteReading {
  /** Detected frequency in Hz. */
  frequency: number;
  /** MIDI note number of the nearest note (A4 = 69). */
  midi: number;
  /** Pitch-class name of the nearest note, e.g. `A`, `C#`. */
  name: string;
  /** Octave number of the nearest note (scientific pitch notation). */
  octave: number;
  /** Exact frequency of the nearest note for the active reference (Hz). */
  targetFrequency: number;
  /** Signed cents deviation from the nearest note (−50..+50, negative = flat). */
  cents: number;
}

/** Minimum RMS amplitude required to treat a buffer as a real signal (vs. silence). */
const RMS_SILENCE_THRESHOLD = 0.01;

/** Amplitude threshold used to trim leading/trailing near-silence before correlation. */
const EDGE_TRIM_THRESHOLD = 0.2;

/**
 * Estimates the fundamental frequency of a monophonic signal via normalized
 * autocorrelation with parabolic interpolation. Suitable for instrument tuning.
 *
 * @param buffer Time-domain samples in [-1, 1] (e.g. from `getFloatTimeDomainData`).
 * @param sampleRate Sample rate of the audio context (Hz).
 * @returns The detected frequency in Hz, or `-1` when no clear pitch is found
 *   (signal too quiet or unvoiced).
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const size = buffer.length;

  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < RMS_SILENCE_THRESHOLD) {
    return -1;
  }

  // Trim edges below a small amplitude to reduce spurious correlation.
  let start = 0;
  let end = size - 1;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < EDGE_TRIM_THRESHOLD) {
      start = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < EDGE_TRIM_THRESHOLD) {
      end = size - i;
      break;
    }
  }

  const trimmed = buffer.subarray(start, end);
  const trimmedSize = trimmed.length;
  if (trimmedSize < 2) {
    return -1;
  }

  const correlation = new Float32Array(trimmedSize);
  for (let lag = 0; lag < trimmedSize; lag++) {
    let sum = 0;
    for (let i = 0; i < trimmedSize - lag; i++) {
      sum += trimmed[i] * trimmed[i + lag];
    }
    correlation[lag] = sum;
  }

  // Skip the initial descending slope, then find the first strong peak.
  let lag = 0;
  while (lag < trimmedSize - 1 && correlation[lag] > correlation[lag + 1]) {
    lag++;
  }

  let maxValue = -1;
  let maxLag = -1;
  for (let i = lag; i < trimmedSize; i++) {
    if (correlation[i] > maxValue) {
      maxValue = correlation[i];
      maxLag = i;
    }
  }
  if (maxLag <= 0) {
    return -1;
  }

  // Parabolic interpolation around the peak for sub-sample accuracy.
  let refinedLag = maxLag;
  if (maxLag > 0 && maxLag < trimmedSize - 1) {
    const x1 = correlation[maxLag - 1];
    const x2 = correlation[maxLag];
    const x3 = correlation[maxLag + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a !== 0) {
      refinedLag = maxLag - b / (2 * a);
    }
  }

  return sampleRate / refinedLag;
}

/**
 * Exact frequency of a MIDI note for a given reference pitch.
 * @param midi MIDI note number (A4 = 69).
 * @param a4 Reference frequency for A4 (Hz).
 */
export function frequencyFromMidi(midi: number, a4: number): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Resolves a detected frequency to its nearest note plus cents deviation.
 *
 * @param frequency Detected frequency in Hz (must be > 0).
 * @param a4 Reference frequency for A4 (Hz).
 * @returns A {@link NoteReading}, or `null` when `frequency` is not positive.
 */
export function noteReadingFromFrequency(frequency: number, a4: number): NoteReading | null {
  if (!(frequency > 0)) {
    return null;
  }

  const midi = Math.round(12 * Math.log2(frequency / a4) + 69);
  const targetFrequency = frequencyFromMidi(midi, a4);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

  return {
    frequency,
    midi,
    name: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    targetFrequency,
    cents
  };
}

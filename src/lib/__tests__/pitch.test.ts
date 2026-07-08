import { describe, expect, it } from 'vitest';
import { autoCorrelate, frequencyFromMidi, noteReadingFromFrequency } from '@/lib/pitch';

/** Generates a mono sine-wave buffer at the given frequency. */
function sineBuffer(frequency: number, sampleRate: number, size: number): Float32Array {
  const buffer = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return buffer;
}

describe('noteReadingFromFrequency', () => {
  it('maps 440Hz to A4 with 0 cents at reference 440', () => {
    const reading = noteReadingFromFrequency(440, 440);
    expect(reading).not.toBeNull();
    expect(reading!.name).toBe('A');
    expect(reading!.octave).toBe(4);
    expect(reading!.midi).toBe(69);
    expect(reading!.cents).toBe(0);
  });

  it('maps ~261.63Hz to C4', () => {
    const reading = noteReadingFromFrequency(261.63, 440);
    expect(reading!.name).toBe('C');
    expect(reading!.octave).toBe(4);
    expect(reading!.midi).toBe(60);
    expect(Math.abs(reading!.cents)).toBeLessThanOrEqual(1);
  });

  it('reports a flat (negative) cents deviation below the target', () => {
    const reading = noteReadingFromFrequency(437, 440);
    expect(reading!.name).toBe('A');
    expect(reading!.cents).toBeLessThan(0);
  });

  it('honours a non-standard A4 reference', () => {
    const reading = noteReadingFromFrequency(442, 442);
    expect(reading!.name).toBe('A');
    expect(reading!.cents).toBe(0);
  });

  it('returns null for non-positive frequency', () => {
    expect(noteReadingFromFrequency(0, 440)).toBeNull();
    expect(noteReadingFromFrequency(-5, 440)).toBeNull();
  });
});

describe('frequencyFromMidi', () => {
  it('returns the reference for MIDI 69', () => {
    expect(frequencyFromMidi(69, 440)).toBeCloseTo(440);
  });

  it('doubles frequency one octave up', () => {
    expect(frequencyFromMidi(81, 440)).toBeCloseTo(880);
  });
});

describe('autoCorrelate', () => {
  it('detects a 440Hz sine within 1Hz', () => {
    const sampleRate = 44100;
    const detected = autoCorrelate(sineBuffer(440, sampleRate, 2048), sampleRate);
    expect(detected).toBeGreaterThan(439);
    expect(detected).toBeLessThan(441);
  });

  it('detects a 220Hz sine within 1Hz', () => {
    const sampleRate = 44100;
    const detected = autoCorrelate(sineBuffer(220, sampleRate, 4096), sampleRate);
    expect(detected).toBeGreaterThan(219);
    expect(detected).toBeLessThan(221);
  });

  it('returns -1 for near-silence', () => {
    expect(autoCorrelate(new Float32Array(2048), 44100)).toBe(-1);
  });
});

import { describe, expect, it } from 'vitest';
import { beatDurationSeconds, bpmFromTapTimes, clamp } from '@/lib/tempo';

describe('beatDurationSeconds', () => {
  it('returns 0.5s per beat at 120 BPM in 4/4', () => {
    expect(beatDurationSeconds(120, 4)).toBeCloseTo(0.5);
  });

  it('scales for eighth-note denominators (twice as fast)', () => {
    expect(beatDurationSeconds(120, 8)).toBeCloseTo(0.25);
  });

  it('is one second per beat at 60 BPM in 4/4', () => {
    expect(beatDurationSeconds(60, 4)).toBeCloseTo(1);
  });
});

describe('clamp', () => {
  it('clamps below the minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps above the maximum', () => {
    expect(clamp(50, 0, 10)).toBe(10);
  });

  it('passes values within range through', () => {
    expect(clamp(7, 0, 10)).toBe(7);
  });
});

describe('bpmFromTapTimes', () => {
  it('returns null with fewer than two taps', () => {
    expect(bpmFromTapTimes([])).toBeNull();
    expect(bpmFromTapTimes([1000])).toBeNull();
  });

  it('computes 120 BPM from taps 500ms apart', () => {
    expect(bpmFromTapTimes([0, 500, 1000, 1500])).toBe(120);
  });

  it('averages uneven intervals', () => {
    // Intervals: 600, 400 -> average 500ms -> 120 BPM.
    expect(bpmFromTapTimes([0, 600, 1000])).toBe(120);
  });

  it('returns null for non-advancing timestamps', () => {
    expect(bpmFromTapTimes([1000, 1000])).toBeNull();
  });
});

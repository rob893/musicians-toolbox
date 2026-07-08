import { describe, expect, it } from 'vitest';
import { describeSettings } from '@/lib/metronomeSummary';
import { DEFAULT_SETTINGS } from '@/constants/metronome';

describe('describeSettings', () => {
  it('summarizes the default settings', () => {
    expect(describeSettings(DEFAULT_SETTINGS)).toBe('120 BPM · 4/4 · Quarter · Beep');
  });

  it('reflects tempo, time signature, subdivision, and sound', () => {
    const summary = describeSettings({
      ...DEFAULT_SETTINGS,
      bpm: 90,
      beatsPerMeasure: 6,
      denominator: 8,
      subdivision: 'triplet',
      preset: 'woodblock'
    });
    expect(summary).toBe('90 BPM · 6/8 · Triplet · Woodblock');
  });

  it('appends "no accent" when the downbeat is not stressed', () => {
    expect(describeSettings({ ...DEFAULT_SETTINGS, stressFirstBeat: false })).toContain('no accent');
  });
});

import { describe, expect, it } from 'vitest';
import { buildBeatPulses, getSubdivision, SUBDIVISIONS } from '@/lib/subdivision';

describe('getSubdivision', () => {
  it('returns the matching definition', () => {
    expect(getSubdivision('triplet').offsets).toEqual([0, 1 / 3, 2 / 3]);
  });

  it('falls back to quarter for an unknown id', () => {
    // @ts-expect-error intentionally invalid id
    expect(getSubdivision('nope').id).toBe('quarter');
  });

  it('always starts each pattern on the beat (offset 0)', () => {
    for (const def of SUBDIVISIONS) {
      expect(def.offsets[0]).toBe(0);
    }
  });
});

describe('buildBeatPulses', () => {
  it('quarter emits a single on-beat pulse', () => {
    expect(buildBeatPulses('quarter', false, true)).toEqual([{ offset: 0, emphasis: 'normal' }]);
  });

  it('accents the downbeat when stress is enabled', () => {
    expect(buildBeatPulses('quarter', true, true)).toEqual([{ offset: 0, emphasis: 'accent' }]);
  });

  it('does not accent the downbeat when stress is disabled', () => {
    expect(buildBeatPulses('quarter', true, false)).toEqual([{ offset: 0, emphasis: 'normal' }]);
  });

  it('eighth adds one weak off-beat at the half', () => {
    expect(buildBeatPulses('eighth', true, true)).toEqual([
      { offset: 0, emphasis: 'accent' },
      { offset: 1 / 2, emphasis: 'weak' }
    ]);
  });

  it('sixteenth adds three weak subdivisions', () => {
    const pulses = buildBeatPulses('sixteenth', false, true);
    expect(pulses.map(p => p.offset)).toEqual([0, 1 / 4, 1 / 2, 3 / 4]);
    expect(pulses.map(p => p.emphasis)).toEqual(['normal', 'weak', 'weak', 'weak']);
  });

  it('triplet places two weak pulses at thirds', () => {
    expect(buildBeatPulses('triplet', false, true).map(p => p.offset)).toEqual([0, 1 / 3, 2 / 3]);
  });

  it('swing places the off-beat on the second triplet position (2/3)', () => {
    expect(buildBeatPulses('swing', true, true)).toEqual([
      { offset: 0, emphasis: 'accent' },
      { offset: 2 / 3, emphasis: 'weak' }
    ]);
  });
});

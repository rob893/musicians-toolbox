import type { Emphasis, Subdivision } from '@/types/metronome';

/** Definition of a beat subdivision: where clicks fall within a single beat. */
export interface SubdivisionDef {
  /** Stable identifier. */
  id: Subdivision;
  /** Human-readable label for the UI. */
  label: string;
  /** Glyph shown in the selector tile. */
  glyph: string;
  /**
   * Pulse offsets within a beat, expressed as a fraction of the beat (0..1).
   * Index 0 is always `0` (the beat itself); later entries are subdivisions.
   */
  offsets: readonly number[];
}

/**
 * Available beat subdivisions. `quarter` is one click per beat (the default);
 * the others insert extra, less-stressed clicks. `swing` places the off-beat on
 * the second triplet position for a swung eighth-note feel.
 */
export const SUBDIVISIONS: readonly SubdivisionDef[] = [
  { id: 'quarter', label: 'Quarter', glyph: '♩', offsets: [0] },
  { id: 'eighth', label: 'Eighth', glyph: '♫', offsets: [0, 1 / 2] },
  { id: 'sixteenth', label: 'Sixteenth', glyph: '♬', offsets: [0, 1 / 4, 1 / 2, 3 / 4] },
  { id: 'triplet', label: 'Triplet', glyph: '³', offsets: [0, 1 / 3, 2 / 3] },
  { id: 'swing', label: 'Swing', glyph: '↝', offsets: [0, 2 / 3] }
];

/**
 * Looks up a subdivision by id, falling back to `quarter` if unknown.
 * @param id Subdivision identifier.
 */
export function getSubdivision(id: Subdivision): SubdivisionDef {
  return SUBDIVISIONS.find(s => s.id === id) ?? SUBDIVISIONS[0];
}

/** A single scheduled click within a beat: its position and relative emphasis. */
export interface BeatPulse {
  /** Position within the beat as a fraction (0..1). */
  offset: number;
  /** Relative emphasis of the click. */
  emphasis: Emphasis;
}

/**
 * Builds the ordered list of clicks for one beat given the active subdivision.
 *
 * The on-beat pulse (offset 0) is `accent` only on a downbeat when stressing is
 * enabled, otherwise `normal`; all in-between subdivision pulses are `weak`.
 *
 * @param subdivision Active subdivision pattern.
 * @param isDownbeat Whether this beat is the first beat of the measure.
 * @param stressFirstBeat Whether the downbeat should be accented.
 * @returns Pulses in playback order.
 */
export function buildBeatPulses(subdivision: Subdivision, isDownbeat: boolean, stressFirstBeat: boolean): BeatPulse[] {
  return getSubdivision(subdivision).offsets.map((offset, index) => {
    if (index === 0) {
      return { offset, emphasis: isDownbeat && stressFirstBeat ? 'accent' : 'normal' };
    }
    return { offset, emphasis: 'weak' };
  });
}

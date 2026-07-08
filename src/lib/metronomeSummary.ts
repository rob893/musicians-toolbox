import { getPreset } from '@/constants/metronome';
import { getSubdivision } from '@/lib/subdivision';
import type { MetronomeSettings } from '@/types/metronome';

/**
 * Produces a short, human-readable summary of metronome settings for display in
 * lists (e.g. saved presets), such as `120 BPM · 4/4 · Triplet · Beep`.
 *
 * @param settings Metronome settings to describe.
 * @returns A middot-separated summary string.
 */
export function describeSettings(settings: MetronomeSettings): string {
  const parts = [
    `${settings.bpm} BPM`,
    `${settings.beatsPerMeasure}/${settings.denominator}`,
    getSubdivision(settings.subdivision).label,
    getPreset(settings.preset).label
  ];
  if (!settings.stressFirstBeat) {
    parts.push('no accent');
  }
  return parts.join(' · ');
}

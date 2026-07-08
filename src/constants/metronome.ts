import type { ClickPreset, Denominator, MetronomeSettings, SoundPresetId } from '@/types/metronome';

/** Minimum selectable tempo (BPM). */
export const BPM_MIN = 30;
/** Maximum selectable tempo (BPM). */
export const BPM_MAX = 300;

/** Minimum beats per measure. */
export const NUMERATOR_MIN = 1;
/** Maximum beats per measure. */
export const NUMERATOR_MAX = 12;

/** Selectable time-signature denominators. */
export const DENOMINATORS: readonly Denominator[] = [4, 8];

/** Synthesis parameters for each selectable click preset. */
export const SOUND_PRESETS: readonly ClickPreset[] = [
  { id: 'beep', label: 'Beep', kind: 'tone', frequency: 880, accentFrequency: 1320, decay: 0.05, waveform: 'sine' },
  {
    id: 'click',
    label: 'Click',
    kind: 'tone',
    frequency: 1000,
    accentFrequency: 1500,
    decay: 0.03,
    waveform: 'square'
  },
  { id: 'woodblock', label: 'Woodblock', kind: 'noise', frequency: 1800, accentFrequency: 2600, decay: 0.04 }
];

/**
 * Looks up a click preset by id, falling back to the first preset if unknown.
 * @param id Preset identifier.
 * @returns The matching {@link ClickPreset}.
 */
export function getPreset(id: SoundPresetId): ClickPreset {
  return SOUND_PRESETS.find(p => p.id === id) ?? SOUND_PRESETS[0];
}

/** Default metronome settings used on first load. */
export const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: 120,
  beatsPerMeasure: 4,
  denominator: 4,
  preset: 'beep',
  volume: 0.8
};

/** localStorage key for persisted metronome settings. */
export const SETTINGS_STORAGE_KEY = 'ctb.settings';

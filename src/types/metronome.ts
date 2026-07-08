/** Identifier for a synthesized click sound preset. */
export type SoundPresetId = 'beep' | 'woodblock' | 'click';

/** Supported time-signature denominators (note value that gets one beat). */
export type Denominator = 4 | 8;

/** Theme mode; `system` follows the OS `prefers-color-scheme`. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Beat subdivision pattern applied within each beat. */
export type Subdivision = 'quarter' | 'eighth' | 'sixteenth' | 'triplet' | 'swing';

/**
 * Relative emphasis of a scheduled click: `accent` (stressed downbeat),
 * `normal` (a main beat), or `weak` (an in-between subdivision).
 */
export type Emphasis = 'accent' | 'normal' | 'weak';

/**
 * Full set of user-controllable metronome settings. This is the shape that is
 * persisted to localStorage (transient playback state is kept separately).
 */
export interface MetronomeSettings {
  /** Tempo in beats per minute. */
  bpm: number;
  /** Beats per measure (time-signature numerator). */
  beatsPerMeasure: number;
  /** Note value that gets one beat (time-signature denominator). */
  denominator: Denominator;
  /** Selected click sound preset. */
  preset: SoundPresetId;
  /** Output volume, 0–1. */
  volume: number;
  /** When true, the first beat of each measure is accented; when false all main beats sound the same. */
  stressFirstBeat: boolean;
  /** Beat subdivision pattern (adds less-stressed clicks between beats). */
  subdivision: Subdivision;
}

/**
 * Tunable synthesis parameters for a click preset. The same parameters drive
 * both live playback and offline (export) rendering so the file matches what
 * the user hears.
 */
export interface ClickPreset {
  /** Stable identifier. */
  id: SoundPresetId;
  /** Human-readable label for the UI. */
  label: string;
  /** Whether the click is a pitched tone or a filtered noise burst. */
  kind: 'tone' | 'noise';
  /** Fundamental/centre frequency (Hz) for a normal (non-accented) beat. */
  frequency: number;
  /** Fundamental/centre frequency (Hz) for the accented downbeat. */
  accentFrequency: number;
  /** Amplitude envelope decay time in seconds. */
  decay: number;
  /** Oscillator waveform (tone presets only). */
  waveform?: OscillatorType;
}

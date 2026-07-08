/** Default reference pitch for A4 in Hz (concert pitch). */
export const DEFAULT_A4 = 440;

/** Minimum selectable A4 reference (Hz). */
export const A4_MIN = 415;

/** Maximum selectable A4 reference (Hz). */
export const A4_MAX = 466;

/** Absolute cents deviation within which a note is considered "in tune". */
export const IN_TUNE_CENTS = 5;

/** localStorage key for the persisted A4 reference. */
export const TUNER_A4_STORAGE_KEY = 'ctb.tuner.a4';

/** Note names for the 12 pitch classes, indexed by semitone from C. */
export const NOTE_NAMES: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

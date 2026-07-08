/** A selectable theme colour with a matching high-contrast foreground. */
export interface PaletteColor {
  /** Stable identifier persisted to localStorage. */
  id: string;
  /** Human-readable label for the UI. */
  label: string;
  /** Base colour applied to `--primary` / `--secondary`. */
  value: string;
  /** Contrast colour applied to the corresponding `-foreground` variable. */
  foreground: string;
}

/**
 * Predefined colour swatches the user can choose from for primary and secondary
 * theme colours. A fixed palette (rather than a free-form picker) keeps every
 * option legible against its paired foreground.
 */
export const PALETTE: readonly PaletteColor[] = [
  { id: 'blue', label: 'Blue', value: '#2563eb', foreground: '#ffffff' },
  { id: 'indigo', label: 'Indigo', value: '#4f46e5', foreground: '#ffffff' },
  { id: 'violet', label: 'Violet', value: '#7c3aed', foreground: '#ffffff' },
  { id: 'pink', label: 'Pink', value: '#db2777', foreground: '#ffffff' },
  { id: 'rose', label: 'Rose', value: '#e11d48', foreground: '#ffffff' },
  { id: 'orange', label: 'Orange', value: '#ea580c', foreground: '#ffffff' },
  { id: 'amber', label: 'Amber', value: '#f59e0b', foreground: '#0b0f19' },
  { id: 'lime', label: 'Lime', value: '#84cc16', foreground: '#0b0f19' },
  { id: 'emerald', label: 'Emerald', value: '#059669', foreground: '#ffffff' },
  { id: 'teal', label: 'Teal', value: '#0d9488', foreground: '#ffffff' },
  { id: 'cyan', label: 'Cyan', value: '#0891b2', foreground: '#ffffff' },
  { id: 'slate', label: 'Slate', value: '#475569', foreground: '#ffffff' }
];

/** Default primary colour (used when nothing is persisted). */
export const DEFAULT_PRIMARY: PaletteColor = PALETTE[0];
/** Default secondary colour (used when nothing is persisted). */
export const DEFAULT_SECONDARY: PaletteColor = PALETTE[11];

/**
 * Resolves a palette colour by id, falling back to the supplied default.
 * @param id Persisted palette id (may be null/unknown).
 * @param fallback Colour to use when the id is missing or invalid.
 */
export function resolvePaletteColor(id: string | null, fallback: PaletteColor): PaletteColor {
  return PALETTE.find(c => c.id === id) ?? fallback;
}

/** localStorage keys for persisted theme state. */
export const THEME_STORAGE_KEYS = {
  mode: 'ctb.theme.mode',
  primary: 'ctb.theme.primary',
  secondary: 'ctb.theme.secondary'
} as const;

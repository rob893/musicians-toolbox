import { createContext, useContext } from 'react';
import type { PaletteColor } from '@/constants/palette';
import type { ThemeMode } from '@/types/metronome';

/** Value exposed by {@link ThemeContext}. */
export interface ThemeContextValue {
  /** Selected mode: light, dark, or follow-system. */
  mode: ThemeMode;
  /** Resolved dark state after applying `system` against `prefers-color-scheme`. */
  isDark: boolean;
  /** Currently selected primary colour. */
  primary: PaletteColor;
  /** Currently selected secondary colour. */
  secondary: PaletteColor;
  /** Sets the theme mode and persists it. */
  setMode: (mode: ThemeMode) => void;
  /** Sets the primary colour and persists it. */
  setPrimary: (color: PaletteColor) => void;
  /** Sets the secondary colour and persists it. */
  setSecondary: (color: PaletteColor) => void;
}

/** React context carrying the active theme and its setters. */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Accesses the current theme context.
 * @throws If used outside a `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

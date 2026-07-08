import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  resolvePaletteColor,
  THEME_STORAGE_KEYS,
  type PaletteColor
} from '@/constants/palette';
import type { ThemeMode } from '@/types/metronome';
import { ThemeContext, type ThemeContextValue } from './themeContext';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

function readMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEYS.mode);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

/**
 * Provides theme state (mode + primary/secondary colours) to the app.
 *
 * Mode defaults to `system` and toggles the `.dark` class on `<html>` based on
 * the resolved preference. The chosen colours are written as inline custom
 * properties on `<html>` so they override the stylesheet defaults in both light
 * and dark mode. All three values persist to localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [systemDark, setSystemDark] = useState<boolean>(prefersDark);
  const [primary, setPrimaryState] = useState<PaletteColor>(() =>
    resolvePaletteColor(localStorage.getItem(THEME_STORAGE_KEYS.primary), DEFAULT_PRIMARY)
  );
  const [secondary, setSecondaryState] = useState<PaletteColor>(() =>
    resolvePaletteColor(localStorage.getItem(THEME_STORAGE_KEYS.secondary), DEFAULT_SECONDARY)
  );

  useEffect(() => {
    const mql = window.matchMedia(SYSTEM_DARK_QUERY);
    const handler = (event: MediaQueryListEvent): void => setSystemDark(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--primary', primary.value);
    el.style.setProperty('--primary-foreground', primary.foreground);
  }, [primary]);

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--secondary', secondary.value);
    el.style.setProperty('--secondary-foreground', secondary.foreground);
  }, [secondary]);

  const setMode = useCallback((next: ThemeMode): void => {
    setModeState(next);
    localStorage.setItem(THEME_STORAGE_KEYS.mode, next);
  }, []);

  const setPrimary = useCallback((color: PaletteColor): void => {
    setPrimaryState(color);
    localStorage.setItem(THEME_STORAGE_KEYS.primary, color.id);
  }, []);

  const setSecondary = useCallback((color: PaletteColor): void => {
    setSecondaryState(color);
    localStorage.setItem(THEME_STORAGE_KEYS.secondary, color.id);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, primary, secondary, setMode, setPrimary, setSecondary }),
    [mode, isDark, primary, secondary, setMode, setPrimary, setSecondary]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

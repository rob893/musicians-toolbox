import { useCallback } from 'react';
import { MAX_PRESETS, PRESETS_STORAGE_KEY } from '@/constants/metronome';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { MetronomeSettings, SavedMetronomePreset } from '@/types/metronome';

/** Result of {@link useMetronomePresets}. */
export interface UseMetronomePresetsResult {
  /** Saved presets, newest first. */
  presets: SavedMetronomePreset[];
  /** Whether another preset can be saved (under the {@link MAX_PRESETS} cap). */
  canSave: boolean;
  /** Maximum number of presets allowed. */
  maxPresets: number;
  /**
   * Saves the given settings under `name`. No-op when the cap is reached.
   * @returns `true` if saved, `false` if the cap prevented saving.
   */
  savePreset: (name: string, settings: MetronomeSettings) => boolean;
  /** Deletes the preset with the given id. */
  deletePreset: (id: string) => void;
}

/** Generates a unique id, falling back when `crypto.randomUUID` is unavailable. */
function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Manages the user's saved metronome configurations in localStorage, capped at
 * {@link MAX_PRESETS}. Newly saved presets are prepended (newest first).
 */
export function useMetronomePresets(): UseMetronomePresetsResult {
  const [presets, setPresets] = useLocalStorage<SavedMetronomePreset[]>(PRESETS_STORAGE_KEY, []);

  const savePreset = useCallback(
    (name: string, settings: MetronomeSettings): boolean => {
      if (presets.length >= MAX_PRESETS) {
        return false;
      }
      const preset: SavedMetronomePreset = {
        id: createId(),
        name,
        settings,
        createdAt: Date.now()
      };
      setPresets(prev => (prev.length >= MAX_PRESETS ? prev : [preset, ...prev]));
      return true;
    },
    [presets.length, setPresets]
  );

  const deletePreset = useCallback(
    (id: string): void => {
      setPresets(prev => prev.filter(p => p.id !== id));
    },
    [setPresets]
  );

  return {
    presets,
    canSave: presets.length < MAX_PRESETS,
    maxPresets: MAX_PRESETS,
    savePreset,
    deletePreset
  };
}

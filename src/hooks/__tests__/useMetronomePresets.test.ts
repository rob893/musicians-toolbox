import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMetronomePresets } from '@/hooks/useMetronomePresets';
import { DEFAULT_SETTINGS, MAX_PRESETS } from '@/constants/metronome';

afterEach(() => {
  localStorage.clear();
});

describe('useMetronomePresets', () => {
  it('starts empty and allows saving', () => {
    const { result } = renderHook(() => useMetronomePresets());
    expect(result.current.presets).toHaveLength(0);
    expect(result.current.canSave).toBe(true);

    act(() => {
      result.current.savePreset('Fast', { ...DEFAULT_SETTINGS, bpm: 180 });
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Fast');
    expect(result.current.presets[0].settings.bpm).toBe(180);
  });

  it('prepends newly saved presets (newest first)', () => {
    const { result } = renderHook(() => useMetronomePresets());
    act(() => {
      result.current.savePreset('First', DEFAULT_SETTINGS);
    });
    act(() => {
      result.current.savePreset('Second', DEFAULT_SETTINGS);
    });
    expect(result.current.presets.map(p => p.name)).toEqual(['Second', 'First']);
  });

  it('deletes a preset by id', () => {
    const { result } = renderHook(() => useMetronomePresets());
    act(() => {
      result.current.savePreset('Keep', DEFAULT_SETTINGS);
      result.current.savePreset('Remove', DEFAULT_SETTINGS);
    });
    const removeId = result.current.presets.find(p => p.name === 'Remove')!.id;
    act(() => {
      result.current.deletePreset(removeId);
    });
    expect(result.current.presets.map(p => p.name)).toEqual(['Keep']);
  });

  it('enforces the maximum number of presets', () => {
    const { result } = renderHook(() => useMetronomePresets());
    act(() => {
      for (let i = 0; i < MAX_PRESETS; i++) {
        result.current.savePreset(`P${i}`, DEFAULT_SETTINGS);
      }
    });
    expect(result.current.presets).toHaveLength(MAX_PRESETS);
    expect(result.current.canSave).toBe(false);

    let saved: boolean | undefined;
    act(() => {
      saved = result.current.savePreset('Overflow', DEFAULT_SETTINGS);
    });
    expect(saved).toBe(false);
    expect(result.current.presets).toHaveLength(MAX_PRESETS);
  });
});

import { useCallback, useRef } from 'react';
import { bpmFromTapTimes } from '@/lib/tempo';

/** Options for {@link useTapTempo}. */
export interface UseTapTempoOptions {
  /** Number of recent taps to average over. */
  maxTaps?: number;
  /** Idle gap (ms) after which the tap history resets. */
  resetMs?: number;
}

/**
 * Tap-tempo helper. Each call to `tap` records the current time and, once at
 * least two taps exist, reports an averaged BPM via `onTempo`. A long pause
 * between taps clears the history so a new tempo can be tapped cleanly.
 *
 * @param onTempo Callback invoked with the derived BPM.
 * @param options Averaging window and reset behaviour.
 * @returns An object with a `tap` function to call on each tap.
 */
export function useTapTempo(onTempo: (bpm: number) => void, options: UseTapTempoOptions = {}): { tap: () => void } {
  const { maxTaps = 6, resetMs = 2000 } = options;
  const tapsRef = useRef<number[]>([]);

  const tap = useCallback((): void => {
    const now = performance.now();
    const taps = tapsRef.current;

    if (taps.length > 0 && now - taps[taps.length - 1] > resetMs) {
      taps.length = 0;
    }

    taps.push(now);
    if (taps.length > maxTaps) {
      taps.shift();
    }

    const bpm = bpmFromTapTimes(taps);
    if (bpm !== null) {
      onTempo(bpm);
    }
  }, [onTempo, maxTaps, resetMs]);

  return { tap };
}

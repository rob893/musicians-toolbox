import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioContext, resumeAudioContext } from '@/audio/audioContext';
import { scheduleClick } from '@/audio/clickSynth';
import { getPreset } from '@/constants/metronome';
import { beatDurationSeconds } from '@/lib/tempo';
import { buildBeatPulses } from '@/lib/subdivision';
import type { MetronomeSettings } from '@/types/metronome';

/** Timer tick interval (ms) at which the scheduler wakes to queue clicks. */
const LOOKAHEAD_MS = 25;
/** How far ahead (seconds) clicks are scheduled on each tick. */
const SCHEDULE_AHEAD_S = 0.1;

/** Result of {@link useMetronome}. */
export interface UseMetronomeResult {
  /** Whether the metronome is currently running. */
  isPlaying: boolean;
  /** Zero-based index of the current beat within the measure, or -1 when stopped. */
  currentBeat: number;
  /** Starts playback (resumes the audio context). */
  start: () => Promise<void>;
  /** Stops playback. */
  stop: () => void;
  /** Toggles playback on/off. */
  toggle: () => Promise<void>;
}

/**
 * Drives a sample-accurate metronome using a lookahead scheduler: a coarse
 * timer wakes periodically and schedules upcoming clicks against the audio
 * context clock, which keeps timing rock-steady regardless of timer jitter.
 *
 * The latest `settings` are read at each scheduled beat, so tempo, time
 * signature, preset, and volume changes take effect immediately without
 * restarting playback. The accented downbeat is beat 0 of each measure.
 *
 * @param settings Current metronome settings.
 * @returns Playback state and controls.
 */
export function useMetronome(settings: MetronomeSettings): UseMetronomeResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatRef = useRef(0);
  const uiTimeoutsRef = useRef<number[]>([]);

  const clearUiTimeouts = useCallback((): void => {
    uiTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    uiTimeoutsRef.current = [];
  }, []);

  const scheduler = useCallback((): void => {
    const ctx = getAudioContext();
    const current = settingsRef.current;
    const preset = getPreset(current.preset);

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beatStart = nextNoteTimeRef.current;
      const beatInMeasure = beatRef.current % current.beatsPerMeasure;
      const beatDuration = beatDurationSeconds(current.bpm, current.denominator);

      for (const pulse of buildBeatPulses(current.subdivision, beatInMeasure === 0, current.stressFirstBeat)) {
        scheduleClick(ctx, beatStart + pulse.offset * beatDuration, {
          preset,
          emphasis: pulse.emphasis,
          volume: current.volume,
          destination: ctx.destination
        });
      }

      const delayMs = Math.max(0, (beatStart - ctx.currentTime) * 1000);
      const timeoutId = window.setTimeout(() => setCurrentBeat(beatInMeasure), delayMs);
      uiTimeoutsRef.current.push(timeoutId);

      nextNoteTimeRef.current += beatDuration;
      beatRef.current += 1;
    }
  }, []);

  const stop = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearUiTimeouts();
    beatRef.current = 0;
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, [clearUiTimeouts]);

  const start = useCallback(async (): Promise<void> => {
    if (timerRef.current !== null) {
      return;
    }
    const ctx = await resumeAudioContext();
    beatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.1;
    setIsPlaying(true);
    scheduler();
    timerRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
  }, [scheduler]);

  const toggle = useCallback(async (): Promise<void> => {
    if (timerRef.current !== null) {
      stop();
    } else {
      await start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      uiTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    };
  }, []);

  return { isPlaying, currentBeat, start, stop, toggle };
}

/**
 * Pure tempo/timing math shared by live playback, offline rendering, and tests.
 */

/**
 * Duration of a single click (beat) in seconds.
 *
 * BPM is treated as the quarter-note tempo, so the denominator scales the
 * interval: quarter notes (denominator 4) click every `60 / bpm` seconds while
 * eighth notes (denominator 8) click twice as fast.
 *
 * @param bpm Tempo in beats per minute (quarter-note reference).
 * @param denominator Time-signature denominator (note value that gets a click).
 * @returns Seconds between consecutive clicks.
 */
export function beatDurationSeconds(bpm: number, denominator: number): number {
  return (60 / bpm) * (4 / denominator);
}

/**
 * Clamps a number to an inclusive range.
 * @param value Input value.
 * @param min Lower bound.
 * @param max Upper bound.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Derives a tempo (BPM) from a series of tap timestamps by averaging the
 * intervals between consecutive taps.
 *
 * @param times Tap timestamps in milliseconds, in chronological order.
 * @returns The averaged BPM rounded to the nearest integer, or `null` when
 *   fewer than two taps are available.
 */
export function bpmFromTapTimes(times: number[]): number | null {
  if (times.length < 2) {
    return null;
  }

  let total = 0;
  for (let i = 1; i < times.length; i++) {
    total += times[i] - times[i - 1];
  }

  const averageInterval = total / (times.length - 1);
  if (averageInterval <= 0) {
    return null;
  }

  return Math.round(60000 / averageInterval);
}

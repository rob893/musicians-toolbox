import { getPreset } from '@/constants/metronome';
import { beatDurationSeconds } from '@/lib/tempo';
import { buildBeatPulses } from '@/lib/subdivision';
import type { MetronomeSettings } from '@/types/metronome';
import { scheduleClick } from './clickSynth';

/** Options for {@link renderClickTrack}. */
export interface RenderClickTrackOptions {
  /** Metronome settings to render (tempo, time signature, preset, volume, subdivision, stress). */
  settings: MetronomeSettings;
  /** Length of the exported track in seconds. */
  durationSeconds: number;
  /** Output sample rate (defaults to 44.1 kHz). */
  sampleRate?: number;
}

/**
 * Renders a click track offline into an {@link AudioBuffer} using the same
 * synthesis, subdivision, and accent logic as live playback, so the exported
 * file matches what the user hears.
 *
 * @param options Render configuration.
 * @returns The rendered audio buffer (mono).
 */
export async function renderClickTrack({
  settings,
  durationSeconds,
  sampleRate = 44100
}: RenderClickTrackOptions): Promise<AudioBuffer> {
  const length = Math.max(1, Math.ceil(durationSeconds * sampleRate));

  // Prefer the standard constructor; fall back to the webkit-prefixed one on
  // older iOS/Safari, which still supports promise-based startRendering().
  const w = window as unknown as {
    OfflineAudioContext?: typeof OfflineAudioContext;
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  };
  const Ctor = w.OfflineAudioContext ?? w.webkitOfflineAudioContext;
  if (!Ctor) {
    throw new Error('Offline audio rendering is not supported in this browser.');
  }
  const offline = new Ctor(1, length, sampleRate);

  const preset = getPreset(settings.preset);
  const beatDuration = beatDurationSeconds(settings.bpm, settings.denominator);

  for (let beat = 0; ; beat++) {
    const beatStart = beat * beatDuration;
    if (beatStart >= durationSeconds) {
      break;
    }
    const isDownbeat = beat % settings.beatsPerMeasure === 0;
    for (const pulse of buildBeatPulses(settings.subdivision, isDownbeat, settings.stressFirstBeat)) {
      const when = beatStart + pulse.offset * beatDuration;
      if (when >= durationSeconds) {
        continue;
      }
      scheduleClick(offline, when, {
        preset,
        emphasis: pulse.emphasis,
        volume: settings.volume,
        destination: offline.destination
      });
    }
  }

  const rendered = await offline.startRendering();
  if (rendered.length === 0) {
    throw new Error('The rendered click track was empty.');
  }
  return rendered;
}

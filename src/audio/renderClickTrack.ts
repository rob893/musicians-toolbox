import { getPreset } from '@/constants/metronome';
import { beatDurationSeconds } from '@/lib/tempo';
import type { MetronomeSettings } from '@/types/metronome';
import { scheduleClick } from './clickSynth';

/** Options for {@link renderClickTrack}. */
export interface RenderClickTrackOptions {
  /** Metronome settings to render (tempo, time signature, preset, volume). */
  settings: MetronomeSettings;
  /** Length of the exported track in seconds. */
  durationSeconds: number;
  /** Output sample rate (defaults to 44.1 kHz). */
  sampleRate?: number;
}

/**
 * Renders a click track offline into an {@link AudioBuffer} using the same
 * synthesis path as live playback. The first beat of each measure is accented.
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
  const offline = new OfflineAudioContext(1, length, sampleRate);

  const preset = getPreset(settings.preset);
  const interval = beatDurationSeconds(settings.bpm, settings.denominator);

  for (let beat = 0; ; beat++) {
    const when = beat * interval;
    if (when >= durationSeconds) {
      break;
    }
    const accent = beat % settings.beatsPerMeasure === 0;
    scheduleClick(offline, when, {
      preset,
      accent,
      volume: settings.volume,
      destination: offline.destination
    });
  }

  return offline.startRendering();
}

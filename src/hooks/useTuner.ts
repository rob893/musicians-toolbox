import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioContext, resumeAudioContext } from '@/audio/audioContext';
import { autoCorrelate, noteReadingFromFrequency, type NoteReading } from '@/lib/pitch';

/** FFT size for the analyser; also the length of each time-domain buffer. */
const FFT_SIZE = 2048;

/** Smoothing factor for the exponential moving average applied to detected pitch. */
const SMOOTHING = 0.2;

/** Frames without a detected pitch before the reading is cleared. */
const SILENCE_FRAMES = 10;

/** Status of the tuner's microphone session. */
export type TunerStatus = 'idle' | 'listening' | 'denied' | 'error';

/** Result of {@link useTuner}. */
export interface UseTunerResult {
  /** Current microphone/session status. */
  status: TunerStatus;
  /** Latest note reading, or `null` when no pitch is currently detected. */
  reading: NoteReading | null;
  /** Human-readable error message when `status` is `denied`/`error`. */
  error: string | null;
  /** Requests microphone access and begins pitch detection. */
  start: () => Promise<void>;
  /** Stops detection and releases the microphone. */
  stop: () => void;
}

/**
 * Microphone-based pitch detection for the tuner.
 *
 * Captures audio via `getUserMedia`, feeds it through an `AnalyserNode` on the
 * shared {@link AudioContext}, and runs {@link autoCorrelate} each animation
 * frame to produce a smoothed {@link NoteReading} relative to the given A4
 * reference. The shared context is never closed on stop (the metronome may
 * still be using it); only the mic stream and analyser are released.
 *
 * @param a4 Reference frequency for A4 (Hz).
 */
export function useTuner(a4: number): UseTunerResult {
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [reading, setReading] = useState<NoteReading | null>(null);
  const [error, setError] = useState<string | null>(null);

  const a4Ref = useRef(a4);
  useEffect(() => {
    a4Ref.current = a4;
  }, [a4]);

  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(FFT_SIZE * 4)));
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);
  const silenceRef = useRef(0);

  const stop = useCallback((): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    smoothedRef.current = 0;
    silenceRef.current = 0;
    setReading(null);
    setStatus('idle');
  }, []);

  const start = useCallback(async (): Promise<void> => {
    if (rafRef.current !== null) {
      return;
    }
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setError('Microphone access is not supported in this browser.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      setStatus(denied ? 'denied' : 'error');
      setError(denied ? 'Microphone permission was denied.' : 'Could not access the microphone.');
      return;
    }

    const ctx = await resumeAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    source.connect(analyser);

    streamRef.current = stream;
    sourceRef.current = source;
    analyserRef.current = analyser;
    setStatus('listening');

    const tick = (): void => {
      const node = analyserRef.current;
      if (!node) {
        return;
      }
      node.getFloatTimeDomainData(bufferRef.current);
      const frequency = autoCorrelate(bufferRef.current, getAudioContext().sampleRate);

      if (frequency > 0) {
        silenceRef.current = 0;
        const prev = smoothedRef.current;
        const smoothed = prev > 0 ? prev + SMOOTHING * (frequency - prev) : frequency;
        smoothedRef.current = smoothed;
        setReading(noteReadingFromFrequency(smoothed, a4Ref.current));
      } else if (++silenceRef.current >= SILENCE_FRAMES) {
        smoothedRef.current = 0;
        setReading(null);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return { status, reading, error, start, stop };
}

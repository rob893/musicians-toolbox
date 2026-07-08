import { describe, expect, it } from 'vitest';
import { audioBufferToWav, audioBufferToWavBytes } from '@/audio/wavEncoder';

/** Builds a minimal AudioBuffer-like object sufficient for the encoder. */
function fakeBuffer(channels: number[][], sampleRate = 44100): AudioBuffer {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length: channels[0].length,
    duration: channels[0].length / sampleRate,
    getChannelData: (channel: number) => Float32Array.from(channels[channel])
  } as unknown as AudioBuffer;
}

function readString(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(view.getUint8(offset + i));
  }
  return out;
}

describe('audioBufferToWav', () => {
  it('returns a blob of type audio/wav', () => {
    expect(audioBufferToWav(fakeBuffer([[0, 0]])).type).toBe('audio/wav');
  });
});

describe('audioBufferToWavBytes', () => {
  it('writes a valid RIFF/WAVE header', () => {
    const view = new DataView(audioBufferToWavBytes(fakeBuffer([[0, 0, 0, 0]])));
    expect(readString(view, 0, 4)).toBe('RIFF');
    expect(readString(view, 8, 4)).toBe('WAVE');
    expect(readString(view, 12, 4)).toBe('fmt ');
    expect(readString(view, 36, 4)).toBe('data');

    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
  });

  it('writes correct format fields for mono 44.1kHz', () => {
    const view = new DataView(audioBufferToWavBytes(fakeBuffer([[0, 0, 0]], 44100)));

    expect(view.getUint16(22, true)).toBe(1); // channels
    expect(view.getUint32(24, true)).toBe(44100); // sample rate
    expect(view.getUint32(28, true)).toBe(44100 * 2); // byte rate (mono, 16-bit)
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint32(40, true)).toBe(3 * 2); // data size = frames * channels * 2
  });

  it('quantizes samples to 16-bit PCM and clamps out-of-range values', () => {
    const view = new DataView(audioBufferToWavBytes(fakeBuffer([[1, -1, 0, 2]])));

    // Samples begin at byte 44.
    expect(view.getInt16(44, true)).toBe(32767); // +1.0
    expect(view.getInt16(46, true)).toBe(-32768); // -1.0
    expect(view.getInt16(48, true)).toBe(0); // 0
    expect(view.getInt16(50, true)).toBe(32767); // +2.0 clamped to +1.0
  });

  it('interleaves stereo channels', () => {
    const view = new DataView(audioBufferToWavBytes(fakeBuffer([[1, 0], [-1, 0]])));

    expect(view.getUint16(22, true)).toBe(2); // channels
    expect(view.getInt16(44, true)).toBe(32767); // L[0] = +1
    expect(view.getInt16(46, true)).toBe(-32768); // R[0] = -1
  });
});

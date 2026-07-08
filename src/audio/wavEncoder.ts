/** Writes an ASCII string into a DataView at the given byte offset. */
function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

/**
 * Encodes an {@link AudioBuffer} as raw 16-bit PCM WAV bytes.
 *
 * Channels are interleaved and samples are clamped to [-1, 1] before
 * quantization. Works for mono or multi-channel buffers.
 *
 * @param buffer Rendered audio buffer.
 * @returns An `ArrayBuffer` containing a complete WAV file.
 */
export function audioBufferToWavBytes(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  // RIFF header.
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk.
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk.
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let frame = 0; frame < numFrames; frame++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][frame]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

/**
 * Encodes an {@link AudioBuffer} as a 16-bit PCM WAV `Blob` of type `audio/wav`.
 * @param buffer Rendered audio buffer.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  return new Blob([audioBufferToWavBytes(buffer)], { type: 'audio/wav' });
}

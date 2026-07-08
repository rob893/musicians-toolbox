let sharedContext: AudioContext | null = null;

/**
 * Returns the shared {@link AudioContext}, creating it lazily on first use.
 * Must ultimately be triggered by a user gesture to satisfy browser autoplay
 * policies (see {@link resumeAudioContext}).
 *
 * @throws If the Web Audio API is unavailable in the current browser.
 */
export function getAudioContext(): AudioContext {
  if (!sharedContext) {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) {
      throw new Error('The Web Audio API is not supported in this browser.');
    }
    sharedContext = new Ctor();
  }
  return sharedContext;
}

/**
 * Resumes the shared audio context if it is suspended. Call this from within a
 * user gesture (e.g. the play button) before scheduling audio.
 * @returns The running audio context.
 */
export async function resumeAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

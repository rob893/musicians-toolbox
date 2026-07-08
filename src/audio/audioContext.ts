let sharedContext: AudioContext | null = null;
let unlocked = false;

/**
 * Best-effort opt-in to the "playback" audio session so iOS Safari plays Web
 * Audio like media — i.e. it ignores the hardware ring/silent switch instead of
 * muting generated sound. No-op on browsers without the AudioSession API
 * (Safari 16.4+); harmless elsewhere.
 */
function configureAudioSession(): void {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) {
    try {
      nav.audioSession.type = 'playback';
    } catch {
      // Some engines expose a read-only value; ignore if it can't be set.
    }
  }
}

/**
 * Plays a single silent sample to "unlock" audio on iOS Safari, which otherwise
 * keeps a freshly created context effectively muted until a buffer has been
 * started from within a user gesture. Runs at most once.
 */
function unlockOnGesture(ctx: AudioContext): void {
  if (unlocked) {
    return;
  }
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    unlocked = true;
  } catch {
    // Ignore: unlocking is a best-effort iOS workaround.
  }
}

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
    configureAudioSession();
    sharedContext = new Ctor();
  }
  return sharedContext;
}

/**
 * Resumes the shared audio context if it is suspended. Call this from within a
 * user gesture (e.g. the play button) before scheduling audio; it also opts into
 * the iOS "playback" audio session and performs the one-time iOS unlock so sound
 * is audible on iPhone/Safari regardless of the silent switch.
 * @returns The running audio context.
 */
export async function resumeAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext();
  configureAudioSession();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  unlockOnGesture(ctx);
  return ctx;
}

/**
 * App-wide capture of the PWA install flow. This module registers its listeners
 * on import (so `beforeinstallprompt`, which fires early, isn't missed) — import
 * it once near app startup. Consumers use {@link usePwaInstall}.
 */

/** The non-standard `beforeinstallprompt` event exposed by Chromium browsers. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach(listener => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    // Prevent the mini-infobar so we can trigger the prompt from our own UI.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/**
 * Subscribes to install-availability changes.
 * @param callback Invoked when the deferred prompt appears or is consumed.
 * @returns An unsubscribe function.
 */
export function subscribeInstall(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Returns the captured install prompt, or `null` if none is available. */
export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** Whether the app is currently running as an installed (standalone) PWA. */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

/** Whether the current device is iOS/iPadOS (where install is manual). */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const isIPad = /Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document;
  return /iPad|iPhone|iPod/.test(ua) || isIPad;
}

/**
 * Triggers the browser install prompt and awaits the user's choice.
 * @returns `true` if the user accepted, `false` otherwise (including no prompt).
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return choice.outcome === 'accepted';
}

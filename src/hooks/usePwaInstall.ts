import { useCallback, useEffect, useState } from 'react';
import { getInstallPrompt, isIOS, isStandalone, promptInstall, subscribeInstall } from '@/lib/pwaInstall';

/** Result of {@link usePwaInstall}. */
export interface UsePwaInstallResult {
  /** Whether a browser install prompt is available to trigger. */
  canInstall: boolean;
  /** Whether the app is already installed (running standalone). */
  isInstalled: boolean;
  /** Whether the device is iOS, where installation is manual (Add to Home Screen). */
  ios: boolean;
  /** Triggers the install prompt (no-op when unavailable). */
  install: () => Promise<void>;
}

/**
 * Exposes PWA install state and an installer trigger. Reflects the app-wide
 * capture in `lib/pwaInstall`, staying in sync as the prompt appears, the app is
 * installed, or the display mode changes.
 */
export function usePwaInstall(): UsePwaInstallResult {
  const [canInstall, setCanInstall] = useState(() => getInstallPrompt() !== null);
  const [isInstalled, setIsInstalled] = useState(() => isStandalone());

  useEffect(() => {
    const update = (): void => {
      setCanInstall(getInstallPrompt() !== null);
      setIsInstalled(isStandalone());
    };
    const unsubscribe = subscribeInstall(update);
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', update);
    return () => {
      unsubscribe();
      mql.removeEventListener('change', update);
    };
  }, []);

  const install = useCallback(async (): Promise<void> => {
    await promptInstall();
  }, []);

  return { canInstall, isInstalled, ios: isIOS(), install };
}

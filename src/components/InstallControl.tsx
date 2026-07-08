import { Check, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/usePwaInstall';

/**
 * Install affordance for the PWA. Shows an install button when the browser
 * supports prompting, a confirmation when already installed, and manual
 * Add-to-Home-Screen guidance on iOS (which has no install prompt).
 */
export function InstallControl(): React.JSX.Element {
  const { canInstall, isInstalled, ios, install } = usePwaInstall();

  if (isInstalled) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Check className="text-primary size-4" />
        The app is installed on this device.
      </p>
    );
  }

  if (canInstall) {
    return (
      <div className="flex flex-col gap-2">
        <Button onClick={() => void install()} className="w-fit gap-2">
          <Download />
          Install app
        </Button>
        <p className="text-muted-foreground text-xs">
          Adds Musician&apos;s Toolbox to your device for quick, offline access.
        </p>
      </div>
    );
  }

  if (ios) {
    return (
      <p className="text-muted-foreground flex items-start gap-2 text-sm">
        <Share className="mt-0.5 size-4 shrink-0" />
        <span>
          To install on iPhone or iPad, tap the <strong>Share</strong> button in Safari and choose{' '}
          <strong>Add to Home Screen</strong>.
        </span>
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Installation isn&apos;t available right now — your browser may not support it, or the app may already be
      installed.
    </p>
  );
}

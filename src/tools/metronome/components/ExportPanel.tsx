import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { renderClickTrack } from '@/audio/renderClickTrack';
import { audioBufferToWav } from '@/audio/wavEncoder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isIOS } from '@/lib/pwaInstall';
import { beatDurationSeconds, clamp } from '@/lib/tempo';
import { cn } from '@/lib/utils';
import type { MetronomeSettings } from '@/types/metronome';

/** Length unit for the export. */
type LengthUnit = 'seconds' | 'bars';

/** Hard cap on rendered length to avoid accidental huge exports. */
const MAX_DURATION_SECONDS = 3600;

/** Props for {@link ExportPanel}. */
export interface ExportPanelProps {
  /** Metronome settings the click track is rendered from. */
  settings: MetronomeSettings;
}

/** Formats a duration in seconds as `m:ss`. */
function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Renders a click track for the current settings over a user-defined length
 * (in seconds or bars) and downloads it as a 16-bit PCM WAV file.
 */
export function ExportPanel({ settings }: ExportPanelProps): React.JSX.Element {
  const [unit, setUnit] = useState<LengthUnit>('seconds');
  const [length, setLength] = useState(30);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationSeconds = useMemo(() => {
    const value = Number.isFinite(length) ? length : 0;
    if (unit === 'seconds') {
      return clamp(value, 0, MAX_DURATION_SECONDS);
    }
    const barSeconds = settings.beatsPerMeasure * beatDurationSeconds(settings.bpm, settings.denominator);
    return clamp(value * barSeconds, 0, MAX_DURATION_SECONDS);
  }, [length, unit, settings]);

  const canExport = durationSeconds >= 0.5 && !isRendering;

  const handleExport = async (): Promise<void> => {
    setError(null);
    setIsRendering(true);
    try {
      const buffer = await renderClickTrack({ settings, durationSeconds });
      const blob = audioBufferToWav(buffer);
      const filename = `click-${settings.bpm}bpm-${settings.beatsPerMeasure}-${settings.denominator}.wav`;

      // iOS Safari ignores the anchor `download` attribute, so use the native
      // share sheet (Save to Files / share) when the file can be shared.
      if (isIOS()) {
        const file = new File([blob], filename, { type: 'audio/wav' });
        const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
        if (nav.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: filename });
            return;
          } catch (err) {
            // User cancelled the share sheet — leave without falling back.
            if (err instanceof DOMException && err.name === 'AbortError') {
              return;
            }
            // Otherwise fall through to the download path below.
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      // Defer cleanup: revoking the object URL synchronously after click truncates
      // the download to an empty/0-second file on iOS/Safari (WebKit).
      window.setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 15000);
    } catch {
      setError('Something went wrong while rendering the click track.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="length-input">Length</Label>
        <div className="flex items-center gap-2">
          <Input
            id="length-input"
            type="number"
            inputMode="numeric"
            min={1}
            value={length}
            onChange={event => setLength(Math.max(0, Number(event.target.value)))}
            className="w-24"
          />
          <div className="bg-muted flex rounded-md p-0.5">
            {(['seconds', 'bars'] as const).map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setUnit(option)}
                className={cn(
                  'rounded-sm px-3 py-1 text-sm capitalize transition-colors',
                  unit === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Exports about <span className="tabular-nums">{formatDuration(durationSeconds)}</span> of audio as a WAV file.
        </p>
      </div>

      <Button onClick={handleExport} disabled={!canExport} className="w-full gap-2">
        {isRendering ? <Loader2 className="animate-spin" /> : <Download />}
        {isRendering ? 'Rendering…' : 'Export WAV'}
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

/** Props for {@link VolumeControl}. */
export interface VolumeControlProps {
  /** Current volume, 0–1. */
  volume: number;
  /** Called with the new volume, 0–1. */
  onVolumeChange: (volume: number) => void;
}

/** Volume slider (0–100%) with a level-appropriate icon. */
export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps): React.JSX.Element {
  const percent = Math.round(volume * 100);
  const Icon = percent === 0 ? VolumeX : percent < 50 ? Volume1 : Volume2;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="volume-slider">Volume</Label>
        <span className="text-muted-foreground text-sm tabular-nums">{percent}%</span>
      </div>
      <div className="flex items-center gap-3">
        <Icon className="text-muted-foreground size-4 shrink-0" />
        <Slider
          id="volume-slider"
          value={[percent]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => onVolumeChange(value / 100)}
          aria-label="Volume"
          className="flex-1"
        />
      </div>
    </div>
  );
}

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BPM_MAX, BPM_MIN } from '@/constants/metronome';
import { useTapTempo } from '@/hooks/useTapTempo';
import { clamp } from '@/lib/tempo';

/** Props for {@link BpmControl}. */
export interface BpmControlProps {
  /** Current tempo in BPM. */
  bpm: number;
  /** Called with the new (clamped) BPM. */
  onBpmChange: (bpm: number) => void;
}

/**
 * Tempo control: slider, numeric input, −/+ steppers, and a tap-tempo button.
 * All inputs are clamped to the supported BPM range.
 */
export function BpmControl({ bpm, onBpmChange }: BpmControlProps): React.JSX.Element {
  const setClamped = (value: number): void => onBpmChange(clamp(Math.round(value), BPM_MIN, BPM_MAX));
  const { tap } = useTapTempo(setClamped);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <Label htmlFor="bpm-input">Tempo</Label>
        <div className="flex items-baseline gap-1">
          <Input
            id="bpm-input"
            type="number"
            inputMode="numeric"
            min={BPM_MIN}
            max={BPM_MAX}
            value={bpm}
            onChange={event => setClamped(Number(event.target.value))}
            className="h-9 w-20 text-right text-lg font-semibold tabular-nums"
          />
          <span className="text-muted-foreground text-sm">BPM</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Decrease tempo" onClick={() => setClamped(bpm - 1)}>
          <Minus />
        </Button>
        <Slider
          value={[bpm]}
          min={BPM_MIN}
          max={BPM_MAX}
          step={1}
          onValueChange={([value]) => setClamped(value)}
          aria-label="Tempo"
          className="flex-1"
        />
        <Button variant="outline" size="icon" aria-label="Increase tempo" onClick={() => setClamped(bpm + 1)}>
          <Plus />
        </Button>
      </div>

      <Button variant="secondary" onClick={tap} className="self-start">
        Tap tempo
      </Button>
    </div>
  );
}

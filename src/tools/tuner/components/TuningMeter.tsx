import { IN_TUNE_CENTS } from '@/constants/tuner';
import { cn } from '@/lib/utils';

/** Props for {@link TuningMeter}. */
export interface TuningMeterProps {
  /** Signed cents deviation (−50..+50), or `null` when no pitch is detected. */
  cents: number | null;
}

/** Evenly spaced tick marks across the −50..+50 cents scale. */
const TICKS = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

/**
 * Horizontal tuning meter: a needle indicates cents deviation from the nearest
 * note, centered when in tune. Turns to the primary colour within the in-tune
 * threshold and leans left (flat) or right (sharp) otherwise.
 */
export function TuningMeter({ cents }: TuningMeterProps): React.JSX.Element {
  const clamped = cents === null ? 0 : Math.max(-50, Math.min(50, cents));
  const percent = (clamped + 50) / 100; // 0..1 across the track
  const inTune = cents !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  const active = cents !== null;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-between px-0.5">
        <span className="text-muted-foreground text-xs">♭ flat</span>
        <span className={cn('text-xs font-medium', inTune ? 'text-primary' : 'text-muted-foreground')}>
          {active ? `${cents! > 0 ? '+' : ''}${cents}¢` : '—'}
        </span>
        <span className="text-muted-foreground text-xs">sharp ♯</span>
      </div>

      <div className="bg-muted relative h-12 w-full rounded-lg">
        {/* Tick marks */}
        {TICKS.map(tick => (
          <span
            key={tick}
            className={cn(
              'absolute top-1/2 w-px -translate-x-1/2 -translate-y-1/2',
              tick === 0 ? 'bg-muted-foreground/60 h-6' : 'bg-muted-foreground/30 h-3'
            )}
            style={{ left: `${((tick + 50) / 100) * 100}%` }}
          />
        ))}

        {/* Center in-tune zone */}
        <span
          className="bg-primary/15 absolute inset-y-0"
          style={{
            left: `${((-IN_TUNE_CENTS + 50) / 100) * 100}%`,
            width: `${((IN_TUNE_CENTS * 2) / 100) * 100}%`
          }}
        />

        {/* Needle */}
        <span
          className={cn(
            'absolute top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,background-color] duration-100',
            active ? (inTune ? 'bg-primary' : 'bg-foreground') : 'bg-muted-foreground/40'
          )}
          style={{ left: `${percent * 100}%` }}
        />
      </div>
    </div>
  );
}

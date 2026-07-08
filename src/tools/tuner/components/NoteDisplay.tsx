import type { NoteReading } from '@/lib/pitch';
import { cn } from '@/lib/utils';

/** Props for {@link NoteDisplay}. */
export interface NoteDisplayProps {
  /** Current note reading, or `null` when no pitch is detected. */
  reading: NoteReading | null;
  /** Whether the current reading is within the in-tune threshold. */
  inTune: boolean;
}

/** Large readout of the detected note name, octave, and frequency. */
export function NoteDisplay({ reading, inTune }: NoteDisplayProps): React.JSX.Element {
  const accidental = reading?.name.includes('#');
  const letter = reading ? reading.name.replace('#', '') : '—';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex items-start font-bold tabular-nums transition-colors',
          reading ? (inTune ? 'text-primary' : 'text-foreground') : 'text-muted-foreground'
        )}
      >
        <span className="text-7xl leading-none sm:text-8xl">{letter}</span>
        {reading && (
          <span className="mt-1 flex flex-col items-start text-2xl leading-none sm:text-3xl">
            {accidental && <span>#</span>}
            <span className="text-muted-foreground text-lg">{reading.octave}</span>
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm tabular-nums">
        {reading ? `${reading.frequency.toFixed(1)} Hz` : 'Play a note…'}
      </p>
    </div>
  );
}

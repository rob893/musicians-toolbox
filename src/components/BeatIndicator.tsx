import { cn } from '@/lib/utils';

/** Props for {@link BeatIndicator}. */
export interface BeatIndicatorProps {
  /** Number of beats in the measure (number of dots). */
  beatsPerMeasure: number;
  /** Zero-based active beat index, or -1 when stopped. */
  currentBeat: number;
  /** Whether playback is active (drives the highlight). */
  isPlaying: boolean;
}

/**
 * Row of dots visualizing the measure. The downbeat (beat 0) is drawn in the
 * primary colour and larger; the active beat is highlighted while playing.
 */
export function BeatIndicator({ beatsPerMeasure, currentBeat, isPlaying }: BeatIndicatorProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="img" aria-label="Beat indicator">
      {Array.from({ length: beatsPerMeasure }, (_, index) => {
        const isDownbeat = index === 0;
        const isActive = isPlaying && index === currentBeat;
        return (
          <span
            key={index}
            className={cn(
              'rounded-full transition-all duration-100',
              isDownbeat ? 'size-4' : 'size-3',
              isActive
                ? cn('scale-125', isDownbeat ? 'bg-primary ring-primary/40 ring-4' : 'bg-primary')
                : isDownbeat
                  ? 'bg-primary/40'
                  : 'bg-muted-foreground/30'
            )}
          />
        );
      })}
    </div>
  );
}

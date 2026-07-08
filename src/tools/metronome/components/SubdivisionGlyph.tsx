import type { Subdivision } from '@/types/metronome';

/** Layout spec for drawing a subdivision's note grouping. */
interface GlyphSpec {
  /** Notehead x positions within the 56-wide viewBox. */
  xs: number[];
  /** Number of beam bars connecting the stems (0 = plain quarter note). */
  beams: number;
  /** Whether to draw a "3" bracket above (triplet/swing feel). */
  triplet?: boolean;
}

const SPECS: Record<Subdivision, GlyphSpec> = {
  quarter: { xs: [28], beams: 0 },
  eighth: { xs: [18, 38], beams: 1 },
  sixteenth: { xs: [10, 24, 38, 52], beams: 2 },
  triplet: { xs: [12, 28, 44], beams: 1, triplet: true },
  swing: { xs: [14, 42], beams: 1, triplet: true }
};

/** Props for {@link SubdivisionGlyph}. */
export interface SubdivisionGlyphProps {
  /** Subdivision to draw. */
  subdivision: Subdivision;
}

/**
 * Renders a small note-grouping glyph for a subdivision (noteheads + stems +
 * beams, with a "3" bracket for triplet/swing). Uses `currentColor` so it
 * inherits the surrounding text colour.
 */
export function SubdivisionGlyph({ subdivision }: SubdivisionGlyphProps): React.JSX.Element {
  const spec = SPECS[subdivision];
  const noteTop = 12;
  const noteBottom = 24;
  const stemX = 4; // stem offset to the right of the notehead centre

  return (
    <svg viewBox="0 0 56 32" className="h-7 w-14" fill="none" aria-hidden="true">
      {spec.triplet && (
        <>
          <path
            d={`M${spec.xs[0]} 6 H${spec.xs[spec.xs.length - 1] + stemX}`}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.7"
          />
          <text
            x={(spec.xs[0] + spec.xs[spec.xs.length - 1] + stemX) / 2}
            y="5"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            3
          </text>
        </>
      )}

      {/* Stems */}
      {spec.xs.map(x => (
        <line
          key={`s${x}`}
          x1={x + stemX}
          y1={noteBottom - 2}
          x2={x + stemX}
          y2={noteTop - 4}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}

      {/* Beams */}
      {spec.beams > 0 &&
        Array.from({ length: spec.beams }, (_, b) => (
          <line
            key={`b${b}`}
            x1={spec.xs[0] + stemX}
            y1={noteTop - 4 + b * 4}
            x2={spec.xs[spec.xs.length - 1] + stemX}
            y2={noteTop - 4 + b * 4}
            stroke="currentColor"
            strokeWidth="2.5"
          />
        ))}

      {/* Noteheads */}
      {spec.xs.map(x => (
        <ellipse key={`n${x}`} cx={x} cy={noteBottom} rx="4" ry="3" fill="currentColor" />
      ))}
    </svg>
  );
}

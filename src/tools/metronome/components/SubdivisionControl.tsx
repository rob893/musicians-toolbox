import { SubdivisionGlyph } from './SubdivisionGlyph';
import { Label } from '@/components/ui/label';
import { SUBDIVISIONS } from '@/lib/subdivision';
import { cn } from '@/lib/utils';
import type { Subdivision } from '@/types/metronome';

/** Props for {@link SubdivisionControl}. */
export interface SubdivisionControlProps {
  /** Currently selected subdivision. */
  subdivision: Subdivision;
  /** Called with the newly selected subdivision. */
  onSubdivisionChange: (subdivision: Subdivision) => void;
}

/** Row of selectable tiles for choosing the beat subdivision (quarter … swing). */
export function SubdivisionControl({ subdivision, onSubdivisionChange }: SubdivisionControlProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Label>Subdivision</Label>
      <div className="grid grid-cols-5 gap-2">
        {SUBDIVISIONS.map(def => {
          const selected = def.id === subdivision;
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => onSubdivisionChange(def.id)}
              aria-pressed={selected}
              title={def.label}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <SubdivisionGlyph subdivision={def.id} />
              <span className="text-[10px] leading-none font-medium sm:text-xs">{def.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

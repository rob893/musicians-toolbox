import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DENOMINATORS, NUMERATOR_MAX, NUMERATOR_MIN } from '@/constants/metronome';
import type { Denominator } from '@/types/metronome';

/** Props for {@link TimeSignatureControl}. */
export interface TimeSignatureControlProps {
  /** Beats per measure (numerator). */
  beatsPerMeasure: number;
  /** Note value that gets one beat (denominator). */
  denominator: Denominator;
  /** Called with a new numerator. */
  onNumeratorChange: (value: number) => void;
  /** Called with a new denominator. */
  onDenominatorChange: (value: Denominator) => void;
}

const numerators = Array.from({ length: NUMERATOR_MAX - NUMERATOR_MIN + 1 }, (_, i) => NUMERATOR_MIN + i);

/** Time-signature selector: beats-per-measure and denominator dropdowns. */
export function TimeSignatureControl({
  beatsPerMeasure,
  denominator,
  onNumeratorChange,
  onDenominatorChange
}: TimeSignatureControlProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Label>Time signature</Label>
      <div className="flex items-center gap-2">
        <Select value={String(beatsPerMeasure)} onValueChange={value => onNumeratorChange(Number(value))}>
          <SelectTrigger className="w-20" aria-label="Beats per measure">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {numerators.map(n => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground text-2xl leading-none">/</span>

        <Select value={String(denominator)} onValueChange={value => onDenominatorChange(Number(value) as Denominator)}>
          <SelectTrigger className="w-20" aria-label="Note value">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DENOMINATORS.map(d => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

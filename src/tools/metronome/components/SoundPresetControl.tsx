import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SOUND_PRESETS } from '@/constants/metronome';
import type { SoundPresetId } from '@/types/metronome';

/** Props for {@link SoundPresetControl}. */
export interface SoundPresetControlProps {
  /** Currently selected preset id. */
  preset: SoundPresetId;
  /** Called with the newly selected preset id. */
  onPresetChange: (preset: SoundPresetId) => void;
}

/** Dropdown for choosing the click sound preset. */
export function SoundPresetControl({ preset, onPresetChange }: SoundPresetControlProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="preset-select">Sound</Label>
      <Select value={preset} onValueChange={value => onPresetChange(value as SoundPresetId)}>
        <SelectTrigger id="preset-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SOUND_PRESETS.map(p => (
            <SelectItem key={p.id} value={p.id}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

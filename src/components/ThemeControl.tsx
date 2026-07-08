import { Monitor, Moon, Sun } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PALETTE, type PaletteColor } from '@/constants/palette';
import { useTheme } from '@/contexts/themeContext';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/types/metronome';

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon }
];

/** Props for {@link SwatchRow}. */
interface SwatchRowProps {
  label: string;
  selectedId: string;
  onSelect: (color: PaletteColor) => void;
}

/** A labelled grid of colour swatches with a selected-state ring. */
function SwatchRow({ label, selectedId, onSelect }: SwatchRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map(color => (
          <button
            key={color.id}
            type="button"
            onClick={() => onSelect(color)}
            aria-label={color.label}
            aria-pressed={selectedId === color.id}
            title={color.label}
            style={{ backgroundColor: color.value }}
            className={cn(
              'ring-offset-background size-7 rounded-full transition-transform hover:scale-110',
              selectedId === color.id ? 'ring-ring scale-110 ring-2 ring-offset-2' : 'ring-0'
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Appearance controls: light/dark/system mode plus primary & secondary colour swatches. */
export function ThemeControl(): React.JSX.Element {
  const { mode, setMode, primary, setPrimary, secondary, setSecondary } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Mode</Label>
        <div className="bg-muted flex rounded-md p-0.5">
          {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors',
                mode === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <SwatchRow label="Primary colour" selectedId={primary.id} onSelect={setPrimary} />
      <SwatchRow label="Secondary colour" selectedId={secondary.id} onSelect={setSecondary} />
    </div>
  );
}

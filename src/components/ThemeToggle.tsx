import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/themeContext';
import type { ThemeMode } from '@/types/metronome';

const MODE_ORDER: ThemeMode[] = ['light', 'dark', 'system'];
const MODE_ICON: Record<ThemeMode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

/** Compact header button that cycles through light → dark → system theme modes. */
export function ThemeToggle(): React.JSX.Element {
  const { mode, setMode } = useTheme();
  const Icon = MODE_ICON[mode];
  const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length];

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${mode}. Switch to ${next}.`}
      title={`Theme: ${mode}`}
      onClick={() => setMode(next)}
    >
      <Icon />
    </Button>
  );
}

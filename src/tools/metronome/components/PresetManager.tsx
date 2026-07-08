import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMetronomePresets } from '@/hooks/useMetronomePresets';
import { describeSettings } from '@/lib/metronomeSummary';
import type { MetronomeSettings } from '@/types/metronome';

/** Props for {@link PresetManager}. */
export interface PresetManagerProps {
  /** Current metronome settings (captured when saving). */
  settings: MetronomeSettings;
  /** Called with a saved preset's settings when the user loads it. */
  onLoad: (settings: MetronomeSettings) => void;
}

/** Maximum length for a preset name. */
const NAME_MAX_LENGTH = 40;

/**
 * Save/load panel for metronome configurations. Users name and store the
 * current settings (up to the configured cap) and can load or delete any saved
 * configuration.
 */
export function PresetManager({ settings, onLoad }: PresetManagerProps): React.JSX.Element {
  const { presets, canSave, maxPresets, savePreset, deletePreset } = useMetronomePresets();
  const [name, setName] = useState('');

  const handleSave = (): void => {
    const trimmed = name.trim();
    const finalName = trimmed || describeSettings(settings);
    if (savePreset(finalName, settings)) {
      setName('');
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Saved settings</CardTitle>
        <CardDescription>
          Save the current configuration and load it later. Stored in your browser (up to {maxPresets}).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={name}
            maxLength={NAME_MAX_LENGTH}
            placeholder="Name this configuration"
            aria-label="Preset name"
            onChange={event => setName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && canSave) {
                handleSave();
              }
            }}
          />
          <Button onClick={handleSave} disabled={!canSave} className="gap-2">
            <Save />
            Save
          </Button>
        </div>

        {!canSave && (
          <p className="text-muted-foreground text-xs">
            You&apos;ve reached the maximum of {maxPresets} saved configurations. Delete one to save more.
          </p>
        )}

        {presets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved configurations yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {presets.map(preset => (
              <li key={preset.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{preset.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{describeSettings(preset.settings)}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onLoad(preset.settings)}>
                  Load
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${preset.name}`}
                  onClick={() => deletePreset(preset.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

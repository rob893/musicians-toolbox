import { BeatIndicator } from './components/BeatIndicator';
import { BpmControl } from './components/BpmControl';
import { ExportPanel } from './components/ExportPanel';
import { SoundPresetControl } from './components/SoundPresetControl';
import { SubdivisionControl } from './components/SubdivisionControl';
import { TimeSignatureControl } from './components/TimeSignatureControl';
import { TransportControls } from './components/TransportControls';
import { VolumeControl } from './components/VolumeControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/constants/metronome';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMetronome } from '@/hooks/useMetronome';
import type { Denominator, MetronomeSettings, SoundPresetId, Subdivision } from '@/types/metronome';

/**
 * Metronome tool: tempo, time signature, accented downbeat, live playback, and
 * WAV click-track export. Settings persist to localStorage.
 */
export function MetronomeTool(): React.JSX.Element {
  const [stored, setSettings] = useLocalStorage<MetronomeSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const settings: MetronomeSettings = { ...DEFAULT_SETTINGS, ...stored };
  const { isPlaying, currentBeat, toggle } = useMetronome(settings);

  const update = (partial: Partial<MetronomeSettings>): void => setSettings(prev => ({ ...prev, ...partial }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Metronome</CardTitle>
          <CardDescription>Set the tempo and time signature.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="bg-muted/40 flex min-h-16 items-center justify-center rounded-lg p-4">
            <BeatIndicator beatsPerMeasure={settings.beatsPerMeasure} currentBeat={currentBeat} isPlaying={isPlaying} />
          </div>

          <TransportControls isPlaying={isPlaying} onToggle={() => void toggle()} />

          <Separator />

          <BpmControl bpm={settings.bpm} onBpmChange={bpm => update({ bpm })} />

          <div className="grid gap-6 sm:grid-cols-2">
            <TimeSignatureControl
              beatsPerMeasure={settings.beatsPerMeasure}
              denominator={settings.denominator}
              onNumeratorChange={beatsPerMeasure => update({ beatsPerMeasure })}
              onDenominatorChange={(denominator: Denominator) => update({ denominator })}
            />
            <SoundPresetControl
              preset={settings.preset}
              onPresetChange={(preset: SoundPresetId) => update({ preset })}
            />
          </div>

          <VolumeControl volume={settings.volume} onVolumeChange={volume => update({ volume })} />

          <Separator />

          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox
              checked={settings.stressFirstBeat}
              onCheckedChange={checked => update({ stressFirstBeat: checked === true })}
            />
            <span className="flex flex-col">
              <Label className="cursor-pointer">Stress first beat</Label>
              <span className="text-muted-foreground text-xs">Accent the downbeat of each measure.</span>
            </span>
          </label>

          <SubdivisionControl
            subdivision={settings.subdivision}
            onSubdivisionChange={(subdivision: Subdivision) => update({ subdivision })}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Download a click track of the current settings as a WAV file.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportPanel settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}

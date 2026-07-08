import { Music4 } from 'lucide-react';
import { BeatIndicator } from '@/components/BeatIndicator';
import { BpmControl } from '@/components/BpmControl';
import { ExportPanel } from '@/components/ExportPanel';
import { SoundPresetControl } from '@/components/SoundPresetControl';
import { ThemeControl } from '@/components/ThemeControl';
import { TimeSignatureControl } from '@/components/TimeSignatureControl';
import { TransportControls } from '@/components/TransportControls';
import { VolumeControl } from '@/components/VolumeControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/constants/metronome';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMetronome } from '@/hooks/useMetronome';
import type { Denominator, MetronomeSettings, SoundPresetId } from '@/types/metronome';

/** Root application: metronome, click-track export, and appearance controls. */
export default function App(): React.JSX.Element {
  const [stored, setSettings] = useLocalStorage<MetronomeSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const settings: MetronomeSettings = { ...DEFAULT_SETTINGS, ...stored };
  const { isPlaying, currentBeat, toggle } = useMetronome(settings);

  const update = (partial: Partial<MetronomeSettings>): void => setSettings(prev => ({ ...prev, ...partial }));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center gap-3">
        <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Music4 className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Click Track Builder</h1>
          <p className="text-muted-foreground text-sm">Metronome &amp; WAV click-track exporter</p>
        </div>
      </header>

      <main className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metronome</CardTitle>
            <CardDescription>Set the tempo and time signature — the downbeat is accented.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="bg-muted/40 flex min-h-16 items-center justify-center rounded-lg p-4">
              <BeatIndicator
                beatsPerMeasure={settings.beatsPerMeasure}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
              />
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
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Download a click track of the current settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportPanel settings={settings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Personalize the theme and colours.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeControl />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-muted-foreground mt-auto pt-2 text-center text-xs">
        Runs entirely in your browser — no account, no upload.
      </footer>
    </div>
  );
}

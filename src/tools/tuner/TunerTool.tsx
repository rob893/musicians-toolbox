import { Mic, MicOff, Minus, Plus } from 'lucide-react';
import { NoteDisplay } from './components/NoteDisplay';
import { TuningMeter } from './components/TuningMeter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { A4_MAX, A4_MIN, DEFAULT_A4, IN_TUNE_CENTS, TUNER_A4_STORAGE_KEY } from '@/constants/tuner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTuner } from '@/hooks/useTuner';
import { clamp } from '@/lib/tempo';

/**
 * Tuner tool: microphone-based real-time pitch detection. Shows the nearest
 * note and a cents meter, with an adjustable A4 reference (persisted).
 */
export function TunerTool(): React.JSX.Element {
  const [a4, setA4] = useLocalStorage<number>(TUNER_A4_STORAGE_KEY, DEFAULT_A4);
  const { status, reading, error, start, stop } = useTuner(a4);

  const isListening = status === 'listening';
  const inTune = reading !== null && Math.abs(reading.cents) <= IN_TUNE_CENTS;
  const setReference = (value: number): void => setA4(clamp(Math.round(value), A4_MIN, A4_MAX));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Tuner</h1>
        <p className="text-muted-foreground mt-1">Tune your instrument using your device&apos;s microphone.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chromatic tuner</CardTitle>
          <CardDescription>Play a single note and match it to the nearest pitch.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="bg-muted/40 flex flex-col items-center gap-5 rounded-lg py-6">
            <NoteDisplay reading={isListening ? reading : null} inTune={inTune} />
            <div className="w-full max-w-sm px-4">
              <TuningMeter cents={isListening && reading ? reading.cents : null} />
            </div>
          </div>

          <Button
            size="lg"
            variant={isListening ? 'destructive' : 'default'}
            onClick={() => (isListening ? stop() : void start())}
            className="w-full gap-2 text-base"
          >
            {isListening ? <MicOff /> : <Mic />}
            {isListening ? 'Stop' : 'Start tuning'}
          </Button>

          {error && (
            <p className="text-destructive text-center text-sm" role="alert">
              {error}
            </p>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="a4-input">Reference pitch</Label>
              <p className="text-muted-foreground text-xs">A4 = {a4} Hz</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Lower reference pitch"
                onClick={() => setReference(a4 - 1)}
                disabled={a4 <= A4_MIN}
              >
                <Minus />
              </Button>
              <span id="a4-input" className="w-12 text-center text-lg font-semibold tabular-nums">
                {a4}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Raise reference pitch"
                onClick={() => setReference(a4 + 1)}
                disabled={a4 >= A4_MAX}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

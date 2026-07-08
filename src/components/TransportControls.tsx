import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Props for {@link TransportControls}. */
export interface TransportControlsProps {
  /** Whether playback is active. */
  isPlaying: boolean;
  /** Toggles playback on/off. */
  onToggle: () => void;
}

/** Primary play/stop button for the metronome. */
export function TransportControls({ isPlaying, onToggle }: TransportControlsProps): React.JSX.Element {
  return (
    <Button
      size="lg"
      variant={isPlaying ? 'destructive' : 'default'}
      onClick={onToggle}
      aria-label={isPlaying ? 'Stop' : 'Start'}
      className="w-full gap-2 text-base"
    >
      {isPlaying ? <Square className="fill-current" /> : <Play className="fill-current" />}
      {isPlaying ? 'Stop' : 'Start'}
    </Button>
  );
}

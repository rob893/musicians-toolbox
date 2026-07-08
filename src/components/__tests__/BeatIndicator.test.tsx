import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BeatIndicator } from '@/components/BeatIndicator';

describe('BeatIndicator', () => {
  it('renders one dot per beat in the measure', () => {
    render(<BeatIndicator beatsPerMeasure={5} currentBeat={-1} isPlaying={false} />);
    const indicator = screen.getByRole('img', { name: /beat indicator/i });
    expect(indicator.children).toHaveLength(5);
  });

  it('updates the dot count with the time signature', () => {
    const { rerender } = render(<BeatIndicator beatsPerMeasure={3} currentBeat={0} isPlaying />);
    expect(screen.getByRole('img', { name: /beat indicator/i }).children).toHaveLength(3);

    rerender(<BeatIndicator beatsPerMeasure={7} currentBeat={0} isPlaying />);
    expect(screen.getByRole('img', { name: /beat indicator/i }).children).toHaveLength(7);
  });
});

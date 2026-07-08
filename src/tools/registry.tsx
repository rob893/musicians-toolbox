import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Gauge, Music4 } from 'lucide-react';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { MetronomeTool } from './metronome/MetronomeTool';

/** Availability of a tool in the toolbox. */
export type ToolStatus = 'available' | 'coming-soon';

/** Metadata describing a single tool. Adding a tool = adding one entry here. */
export interface ToolDefinition {
  /** Stable identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Short description shown on the home dashboard. */
  description: string;
  /** Route path (leading slash), e.g. `/metronome`. */
  path: string;
  /** Icon used in navigation and cards. */
  icon: LucideIcon;
  /** Whether the tool is usable or a placeholder. */
  status: ToolStatus;
  /** Rendered element for the route (only for available tools). */
  element?: ReactNode;
}

/**
 * The registry of tools. The router, sidebar, and home dashboard are all
 * generated from this list, so new tools only need to be declared here.
 */
export const TOOLS: readonly ToolDefinition[] = [
  {
    id: 'metronome',
    name: 'Metronome',
    description: 'Keep time with an adjustable BPM and time signature, an accented downbeat, and WAV export.',
    path: '/metronome',
    icon: Music4,
    status: 'available',
    element: <MetronomeTool />
  },
  {
    id: 'tuner',
    name: 'Tuner',
    description: 'Tune your instrument by microphone with real-time pitch detection.',
    path: '/tuner',
    icon: Gauge,
    status: 'coming-soon'
  }
];

/**
 * Returns the element to render for a tool's route: its own element when
 * available, otherwise a standard "coming soon" placeholder.
 */
export function getToolElement(tool: ToolDefinition): ReactNode {
  if (tool.status === 'available' && tool.element) {
    return tool.element;
  }
  return <ComingSoonPage name={tool.name} description={tool.description} icon={tool.icon} />;
}

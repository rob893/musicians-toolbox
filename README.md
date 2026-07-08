# Musician's Toolbox

A growing collection of **client-only** browser tools for musicians. No account, no backend, no
uploads — everything runs locally in your browser, and the app is installable and works offline (PWA).

## Tools

- **Metronome** — adjustable BPM (30–300) via slider, number input, ±1 steppers, or tap tempo;
  flexible time signatures (1–12 beats, /4 or /8) with an accented downbeat; selectable click
  sounds; visual beat indicator; and **WAV click-track export** of any length (seconds or bars).
- **Tuner** — _coming soon_: microphone-based real-time pitch detection.

More tools are planned. The app is structured as a navigable shell (sidebar + routes) so new tools
slot in cleanly.

## Tech stack

React 19 · React Router · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york) · Radix UI ·
vite-plugin-pwa.

## Getting started

```bash
npm install
npm run dev      # start the dev server
```

Then open the printed local URL.

### Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint with ESLint                     |
| `npm run test`    | Run unit tests (Vitest)              |

## Project structure

```
src/
  components/       Shell + shared components (AppLayout, SidebarNav, ThemeToggle, ThemeControl)
    ui/             shadcn/ui primitives
  pages/            Route pages (Home dashboard, Settings, ComingSoon, NotFound)
  tools/
    registry.tsx    Central tool registry — router, sidebar, and dashboard are generated from it
    metronome/      The metronome tool (MetronomeTool + its components)
  audio/            Web Audio engine — context, click synth, offline render, WAV encoder
  constants/        Metronome ranges/presets and the theme colour palette
  contexts/         ThemeProvider (mode + colours, persisted)
  hooks/            useMetronome (scheduler), useTapTempo, useLocalStorage
  lib/              Pure helpers (tempo math, cn)
  types/            Shared type definitions
```

### Adding a new tool

1. Build the tool under `src/tools/<tool>/`.
2. Add one entry to `TOOLS` in `src/tools/registry.tsx` (id, name, description, path, icon, status,
   and `element` when available).

That's it — the route, sidebar link, and home-dashboard card are generated automatically. Tools with
`status: 'coming-soon'` render a placeholder page until an `element` is provided.

## Routing & deployment

The app uses a hash router (`HashRouter`), which works out of the box on static hosts like GitHub
Pages without server-side rewrites.

Deployment is automated via `.github/workflows/deploy.yml`, which builds on every push to `main` and
publishes to GitHub Pages. Because project sites are served from `/<repo>/`, the workflow sets
`VITE_BASE_PATH` to the repository name at build time so all asset URLs resolve correctly.

To enable it: in the repository, go to **Settings → Pages → Build and deployment → Source** and
select **GitHub Actions**.

To build for a custom base path locally:

```bash
# PowerShell
$env:VITE_BASE_PATH = "/musicians-toolbox/"; npm run build
```

## Regenerating icons

The PWA icons in `public/icons/` are produced by a dependency-free script:

```bash
node scripts/generate-icons.mjs
```

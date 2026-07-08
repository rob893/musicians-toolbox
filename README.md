# Click Track Builder

A client-only web app that combines a **metronome** with a **click-track exporter**. Set a tempo
and time signature, hear an accented downbeat, then export a click track of any length as a WAV
file. Everything runs in your browser — no account, no backend, no uploads.

## Features

- **Metronome** — adjustable BPM (30–300) via slider, number input, ±1 steppers, or **tap tempo**.
- **Flexible time signatures** — 1–12 beats per measure with a 4 or 8 denominator. The first beat
  of each measure is accented (higher pitch + louder).
- **Selectable click sounds** — Beep, Click, and Woodblock presets, synthesized with the Web Audio API.
- **Visual beat indicator**, **volume control**, and a drift-free lookahead scheduler for accurate timing.
- **WAV export** — render a click track for a user-defined length (in seconds or bars) and download it.
- **Theming** — pick primary and secondary colours from a palette and choose light / dark / **system**
  mode. Preferences persist across sessions.
- **PWA** — installable and works offline.
- **Responsive** — mobile-first layout that scales up to desktop.

> Export format note: the app exports **WAV** (16-bit PCM), which browsers support natively without
> a bundled encoder. Adding MP3 later would require a JS encoder such as `lamejs`.

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york) · Radix UI · vite-plugin-pwa.

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
  audio/        Web Audio engine — context, click synth, offline render, WAV encoder
  components/   UI components (controls, panels) + shadcn primitives in components/ui
  constants/    Metronome ranges/presets and the theme colour palette
  contexts/     ThemeProvider (mode + colours, persisted)
  hooks/        useMetronome (scheduler), useTapTempo, useLocalStorage
  lib/          Pure helpers (tempo math, cn)
  types/        Shared type definitions
```

## Deployment (GitHub Pages)

Deployment is automated via `.github/workflows/deploy.yml`, which builds on every push to `main`
and publishes to GitHub Pages. Because project sites are served from `/<repo>/`, the workflow sets
`VITE_BASE_PATH` to the repository name at build time so all asset URLs resolve correctly.

To enable it: in the repository, go to **Settings → Pages → Build and deployment → Source** and
select **GitHub Actions**.

To build for a custom base path locally:

```bash
# PowerShell
$env:VITE_BASE_PATH = "/click-track-builder/"; npm run build
```

## Regenerating icons

The PWA icons in `public/icons/` are produced by a dependency-free script:

```bash
node scripts/generate-icons.mjs
```

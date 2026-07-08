# Musician's Toolbox

A **client-only** (no backend) collection of browser-based tools for musicians. React 19 + Vite +
TypeScript + Tailwind v4 + shadcn/ui, shipped as an installable **PWA** and deployed to **GitHub
Pages**. Everything runs locally in the browser — no account, no server, no uploads. The first tools
are a **metronome** (with WAV click-track export) and a mic-based **tuner** (autocorrelation pitch
detection).

## Repo Layout

- `src/components/` — app shell + shared components (`AppLayout`, `SidebarNav`, `ThemeControl`); shadcn/ui primitives in `src/components/ui/`
- `src/pages/` — route pages (`HomePage` dashboard, `SettingsPage`, `ComingSoonPage`, `NotFoundPage`)
- `src/tools/` — one folder per tool (`metronome/`, `tuner/`), plus `registry.tsx` (the central tool registry)
- `src/audio/` — Web Audio engine: `audioContext`, `clickSynth`, `renderClickTrack` (OfflineAudioContext), `wavEncoder`
- `src/hooks/` — `useMetronome` (lookahead scheduler), `useTapTempo`, `useLocalStorage`, `useTuner` (mic + pitch detection), `useMetronomePresets` (saved configs)
- `src/contexts/` — `ThemeProvider` + `themeContext` (mode + palette colours, persisted)
- `src/constants/` — `metronome.ts` (ranges/presets), `palette.ts` (theme swatches)
- `src/lib/` — pure helpers (`tempo.ts` math, `utils.ts` `cn`)
- `src/types/` — shared type definitions
- `scripts/generate-icons.mjs` — dependency-free PWA icon generator
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages

## Commands

Run from repo root.

`npm i` · `npm run dev` · `npm run lint` (+ `lint-fix`) · `npm run test` (Vitest) · `npm run build` · `npm run preview` · `npm run prettier`

- **Dev/preview run on port `5190`** (`strictPort`), deliberately distinct from sibling apps (default
  5173 = derpcode/coinwarden/starter; Cairnly = 5180) so each app keeps its own localhost origin and
  does **not** share service workers / storage. If 5190 is taken, Vite fails fast rather than
  silently moving to another app's port.

## Architecture

- **Client-only.** No API, no auth, no axios/react-query. All state is local; user settings persist to
  `localStorage` via `useLocalStorage`. The metronome also supports up to `MAX_PRESETS` (50) named
  saved configurations via `useMetronomePresets` (key `ctb.metronome.presets`).
- **Routing:** `HashRouter` (in `main.tsx`) — works on GitHub Pages with no server rewrites. Routes are
  generated from the tool registry in `App.tsx`.
- **Tool registry (`src/tools/registry.tsx`) is the single source of truth.** The router, sidebar
  (`SidebarNav`), and home dashboard (`HomePage`) are all generated from the `TOOLS` array. A tool has
  `id`, `name`, `description`, `path`, `icon` (lucide), `status` (`available` | `coming-soon`), and an
  `element` (when available). `getToolElement` renders the tool's element or a `ComingSoonPage`
  placeholder.
- **Audio timing:** live playback uses a **lookahead scheduler** (`useMetronome`) that schedules clicks
  against the `AudioContext` clock for drift-free timing. Export (`renderClickTrack`) uses an
  `OfflineAudioContext` with the **same** `clickSynth` path so the WAV matches what's heard. The
  `AudioContext` is a lazy singleton and must be resumed inside a user gesture (the play button).
- **Beat subdivisions & accents:** each beat is expanded into pulses by pure `buildBeatPulses`
  (`lib/subdivision.ts`) from the active subdivision (quarter/eighth/sixteenth/triplet/swing — swing =
  offbeat on the 2/3 triplet position) and the `stressFirstBeat` setting. Each pulse carries an
  `Emphasis` (`accent`/`normal`/`weak`) that `scheduleClick` maps to pitch + gain tiers. Both the live
  scheduler and the offline renderer use `buildBeatPulses`, so export matches playback.
- **Export format is WAV** (16-bit PCM via `wavEncoder`) — native, no encoder dependency. MP3 would
  require a JS encoder (e.g. lamejs). On iOS the export uses the Web Share API (`navigator.share` with a
  `File`) since Safari ignores the anchor `download` attribute; elsewhere it downloads via an anchor and
  **defers `URL.revokeObjectURL`** (immediate revoke yields a 0-second file on WebKit).
- **iOS/WebKit audio:** all iOS browsers are WebKit. `audioContext.ts` sets
  `navigator.audioSession.type = 'playback'` (Safari 16.4+) and plays a 1-sample unlock buffer on the
  first gesture so sound isn't muted by the silent switch. `renderClickTrack` falls back to
  `webkitOfflineAudioContext`.
- **PWA install:** `beforeinstallprompt` is captured app-wide in `lib/pwaInstall` (imported in
  `main.tsx` so it isn't missed); `usePwaInstall` + `InstallControl` power the Install card on the
  Settings page (iOS shows manual Add-to-Home-Screen guidance). Manifest `name`/`short_name` are both
  "Musician's Toolbox"; iOS uses `apple-mobile-web-app-title` + `apple-touch-icon` in `index.html`.
- **Tuner audio:** `useTuner` captures mic via `getUserMedia`, runs `autoCorrelate` (in `lib/pitch.ts`)
  on `AnalyserNode` time-domain data each rAF, and maps frequency → note/cents vs a persisted A4
  reference. It shares the singleton `AudioContext` but must **not** close it on stop (the metronome may
  still use it) — it only stops the mic tracks and disconnects nodes. Note: the Web Audio typed-array
  APIs need `Float32Array<ArrayBuffer>` (construct from an explicit `ArrayBuffer`), not the default
  `Float32Array<ArrayBufferLike>`.
- **Mobile first** all pages must be responsive and look good on mobile devices.

### Adding a new tool

1. Build it under `src/tools/<tool>/`.
2. Add one entry to `TOOLS` in `src/tools/registry.tsx`.

The route, sidebar link, and dashboard card appear automatically. Leave `status: 'coming-soon'` (and
omit `element`) until it's ready.

## Theming

- `ThemeProvider` manages **mode** (`light` / `dark` / `system`, default `system` via `matchMedia`) and
  **primary/secondary colours** chosen from a **predefined palette** (`constants/palette.ts`) — swatches,
  not a free-form picker. All three persist to `localStorage`.
- Implemented with Tailwind v4 `@theme inline` in `index.css`: `--primary`/`--secondary` (and their
  `-foreground` pairs) are overridden as inline custom properties on `documentElement` at runtime, so
  `bg-primary` / `bg-secondary` utilities re-colour live. `.dark` class is toggled on `documentElement`.
- Theme controls live solely on the **Settings** page (`ThemeControl`: mode segmented toggle + colour
  swatches); there is no theme toggle in the nav/header.

## UI Components

- **Desktop + mobile friendly is a hard requirement.** Layout is mobile-first: persistent sidebar on
  desktop (`lg:`), slide-over drawer on mobile (closes on navigation). Verify no horizontal overflow at
  375px.
- Uses **shadcn/ui (new-york, slate)** primitives under `src/components/ui/` with the `@/` alias and
  **lucide-react** icons. Prefer these primitives; add custom components when they don't fit.
- shadcn note: keep non-component exports out of component files — cva variant maps live in a sibling
  file (e.g. `button-variants.ts`) so components satisfy React Fast Refresh (the ESLint config has **no**
  `components/ui` override, matching Cairnly).

## Coding Style

- **TypeScript:** ESLint via `eslint.config.js` (copied from Cairnly), format with `npm run prettier`
  (single quotes, width 120, no trailing commas, LF, `arrowParens: avoid`). Prefer method syntax
  `func(): Type {}` over arrow signatures. `@typescript-eslint/no-explicit-any` is an error.
- **Comments:** JSDoc on all exported functions/components/types (what, params, returns, non-obvious
  behaviour). Inline comments explain **why**, not what. Don't reference reviews/tickets in comments.

## Deployment (GitHub Pages)

- `.github/workflows/deploy.yml` builds on push to `main` and deploys via GitHub Actions. It sets
  `VITE_BASE_PATH=/<repo>/` at build time (project sites serve from `/<repo>/`). Node is pinned to
  `lts/*`. Enable once via **Settings → Pages → Source → GitHub Actions**.
- `HashRouter` + `VITE_BASE_PATH` mean no SPA-fallback tricks are needed.
- Hobby project: don't add Actions supply-chain hardening (SHA-pinning, protected environments,
  Dependabot) unless asked.

## Validation

After implementing a change:

1. `npm run test` (Vitest) — pure logic (tempo math, WAV encoder) is unit-tested; audio scheduling is
   verified manually in-browser.
2. `npm run prettier` then `npm run lint`.
3. `npm run build` (type-check + production build).
4. Smoke-test in a browser with the Playwright CLI skill (routes, the affected tool, mobile drawer,
   375px overflow, console errors).

## Commits

- The user commits explicitly — **do not commit unless asked in the current turn.** Never add a
  `Co-authored-by: Copilot` / AI-authorship trailer.
- When asked: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`), one logical change per commit.

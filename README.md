# HermesVJ

HermesVJ is a static Web/PWA visual display system for agent-generated live visuals. The repository is the source of truth: Hermes Agent writes sketches and metadata, GitHub Pages serves the client, and the browser renders the selected sketch inside a sandboxed iframe.

## Current status

This repo now contains the Phase 1 MVP foundation:
- Vite + React + TypeScript app in `app/`
- repo-root `manifest.json` consumed by the client
- seed p5 sketch in `sketches/2026-05-10-120000-neon-orbits/`
- p5 and Hydra iframe runtimes
- manual refresh, latest mode, gallery mode, previous/next controls, fullscreen, and polling toggle
- GitHub Pages workflow in `.github/workflows/pages.yml`

## Local development

```bash
cd app
npm install
npm run dev
```

Open the Vite URL and the client will fetch `../manifest.json` once the build artifact is produced. For a full static verification run:

```bash
cd app
npm test
npm run build
```

Then serve `app/dist/` with any static server.

## Publishing flow

1. Add a new sketch directory under `sketches/`.
2. Write `sketch.js` and `sketch.json`.
3. Append the sketch to root `manifest.json` and update `latest`.
4. Commit with `visual: add <slug>`.
5. Push to `main`.
6. GitHub Pages deploys the app from the workflow artifact.

## Repository layout

```text
/
  AGENTS.md
  README.md
  manifest.json
  .github/workflows/pages.yml
  app/
  sketches/
  hermes/
```

## Next implementation targets

- cache last successful manifest for transient network failures
- improve iframe error reporting and load transitions
- add QR code and mobile-first fullscreen controls
- create the HermesVJ skill commands for visual generation and rollback

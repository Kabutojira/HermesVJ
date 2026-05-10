# HermesVJ MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Stand up a static GitHub Pages-compatible HermesVJ MVP that renders p5 and Hydra sketches from a repository manifest.

**Architecture:** A Vite/React client in `app/` fetches the repo-root `manifest.json`, renders the selected sketch in a sandboxed iframe using engine-specific runtime templates, and copies `manifest.json` plus `sketches/` into the deploy artifact during build. GitHub Pages hosts the built app as static files.

**Tech Stack:** Vite, React, TypeScript, Vitest, GitHub Pages, p5.js runtime CDN, Hydra runtime CDN.

---

### Task 1: Validate manifest URL and normalization helpers
- Files:
  - Create: `app/tests/manifest.test.ts`
  - Create: `app/src/lib/manifest.ts`
- Steps:
  1. Write failing tests for manifest URL resolution and manifest validation.
  2. Run `npm test` in `app/` and confirm failure.
  3. Implement minimal manifest helpers.
  4. Re-run `npm test` and confirm pass.

### Task 2: Build the React shell
- Files:
  - Create: `app/src/App.tsx`
  - Create: `app/src/main.tsx`
  - Create: `app/src/styles.css`
  - Create: `app/src/components/*.tsx`
- Steps:
  1. Add latest/gallery state, manual navigation, polling controls, and fullscreen controls.
  2. Render engine badge and visible error states.

### Task 3: Implement iframe runtimes
- Files:
  - Create: `app/src/runtime/p5-runtime.html`
  - Create: `app/src/runtime/hydra-runtime.html`
  - Create: `app/src/lib/sketch.ts`
- Steps:
  1. Build sandboxed runtime templates.
  2. Load p5 instance-mode modules safely.
  3. Load Hydra sketches as full-screen scripts inside iframe sandbox.

### Task 4: Make Pages deployment static-friendly
- Files:
  - Create: `app/scripts/postbuild.mjs`
  - Create: `.github/workflows/pages.yml`
- Steps:
  1. Copy root manifest and sketches into `app/dist`.
  2. Duplicate `index.html` to `404.html` for GitHub Pages SPA fallback.
  3. Add a Pages deployment workflow.

### Task 5: Seed repository content
- Files:
  - Create: `manifest.json`
  - Create: `sketches/2026-05-10-120000-neon-orbits/*`
  - Create: `README.md`
- Steps:
  1. Add a valid seed visual.
  2. Document repo layout, workflow, and next commands.

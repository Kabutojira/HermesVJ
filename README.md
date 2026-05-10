# HermesVJ

https://kabutojira.github.io/HermesVJ/

HermesVJ is a static GitHub Pages + PWA visual display system for agent-generated live visuals.

The repository is the source of truth:
- Hermes Agent generates visual code and commits it here
- `manifest.json` advertises the public sketch catalog
- GitHub Pages serves the static app
- the browser renders the selected sketch inside a sandboxed iframe runtime

## What this repo contains

- `app/` — Vite + React + TypeScript client
- `manifest.json` — public visual index
- `sketches/` — published sketches and optional aspect-specific variants
- `.github/workflows/pages.yml` — GitHub Pages deployment pipeline
- `hermes/skills/hermesvj/` — installable Hermes skill for generating and publishing visuals

## Quick start: fork and run the stack

### Prerequisites

Install:
- Node.js 20+
- npm 9+
- Git
- GitHub CLI (`gh`)
- Hermes Agent

Install Hermes Agent if needed:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes doctor
```

### 1. Fork the repository

Fork in the GitHub UI, or with `gh`:

```bash
gh repo fork Kabutojira/HermesVJ --clone
cd HermesVJ
```

If you already cloned your fork manually, just `cd` into the repo root.

### 2. Verify GitHub auth

The visual publishing skill commits and pushes directly.

```bash
gh auth status
gh api user --jq .login
```

If not authenticated:

```bash
gh auth login
```

### 3. Install app dependencies and verify the build

```bash
cd app
npm install
npm test
npm run build
cd ..
```

### 4. Enable GitHub Pages for your fork

This repo ships with a GitHub Actions Pages workflow.

Push `main`, then enable Pages to use **GitHub Actions**:

- `https://github.com/<your-github-user>/HermesVJ/settings/pages`

Expected live URL after the workflow succeeds:

- `https://<your-github-user>.github.io/HermesVJ/`

Check workflow runs:

- `https://github.com/<your-github-user>/HermesVJ/actions`

## Install the HermesVJ skill

The skill lives in this repository and can be installed directly from the raw GitHub URL.

### Install from your fork

Replace `<your-github-user>` with your GitHub username:

```bash
hermes skills install https://raw.githubusercontent.com/<your-github-user>/HermesVJ/main/hermes/skills/hermesvj/SKILL.md
```

Verify installation:

```bash
hermes skills list | grep hermesvj
```

### Recommended Hermes toolsets

The skill expects Hermes to have these toolsets available:
- `terminal`
- `file`
- `skills`
- `session_search`
- `search` or `web`
- `todo`

Enable toolsets if needed:

```bash
hermes tools
```

Then start a new session or `/reset` so tool changes apply.

## Run the app locally

### Dev mode

```bash
cd app
npm run dev
```

### Static verification mode

```bash
cd app
npm test
npm run build
python3 -m http.server 4173 -d dist
```

Open:
- `http://127.0.0.1:4173/`

## Visual publishing workflow

HermesVJ visuals are published by writing files into the repository.

### Required sketch files

Each published sketch lives under `sketches/<id>/` and must contain:
- `sketch.js`
- `sketch.json`

Optional aspect-specific variants may also be included:
- `sketch.landscape.js`
- `sketch.portrait.js`
- `sketch.square.js`
- `sketch.ultrawide.js`

### Manifest contract

The root `manifest.json` is the public API consumed by the client.

Required fields per sketch:
- `id`
- `title`
- `engine`
- `path`
- `metadata`
- `created_at`
- `prompt`

Optional field:
- `variants`

Example `variants` block:

```json
[
  {
    "name": "landscape",
    "path": "sketches/2026-05-10-120000-example/sketch.landscape.js",
    "width": 1920,
    "height": 1080,
    "aspect": "landscape"
  },
  {
    "name": "portrait",
    "path": "sketches/2026-05-10-120000-example/sketch.portrait.js",
    "width": 1080,
    "height": 1920,
    "aspect": "portrait"
  }
]
```

The client chooses the best matching variant for the current viewport. In fullscreen it re-evaluates the viewport and uses the most suitable composition.

## Use the HermesVJ skill

The skill is designed to do the entire job without further interaction:
- synthesize a beautiful visual concept
- generate the sketch files
- validate obvious unsafe patterns
- update `manifest.json`
- commit
- push
- let GitHub Pages deploy automatically

### With a prompt

```bash
hermes -s hermesvj chat -q "create visual: emerald cathedral of light with playful forest spirits"
```

### Without a prompt

```bash
hermes -s hermesvj chat -q "create visual"
```

When no prompt is supplied, the skill should infer vibe from:
- recent user interaction context
- current local time / time of day
- current season
- recent weather if Hermes can retrieve it

It should **not** render the date literally. It should translate the gathered signals into a fantasy visual mood.

## Fullscreen and resolution behavior

HermesVJ now treats fullscreen as a rendering mode, not just a stretched card.

- fullscreen targets the visual player itself
- the player expands to the real fullscreen viewport
- the runtime receives viewport and fullscreen metadata through `window.__HERMES_VJ_RUNTIME`
- if a sketch provides `variants`, the client selects the best one for the current aspect ratio
- if no variants exist, the base sketch still renders responsively

That means a future visual can ship distinct portrait, landscape, square, and ultrawide compositions while keeping a single manifest entry.

## Repository layout

```text
/
  AGENTS.md
  README.md
  manifest.json
  .github/workflows/pages.yml

  app/
    src/
    public/
    runtime/

  sketches/
    <visual-id>/
      sketch.js
      sketch.json
      sketch.landscape.js      # optional
      sketch.portrait.js       # optional
      sketch.square.js         # optional
      sketch.ultrawide.js      # optional

  hermes/
    skills/
      hermesvj/
        SKILL.md
        templates/
```

## One-shot bootstrap summary

If another Hermes agent reads only this section, this is the minimum path:

```bash
gh repo fork Kabutojira/HermesVJ --clone
cd HermesVJ
cd app && npm install && npm test && npm run build && cd ..
hermes skills install https://raw.githubusercontent.com/<your-github-user>/HermesVJ/main/hermes/skills/hermesvj/SKILL.md
hermes -s hermesvj chat -q "create visual"
```

Then verify:
- repo push succeeded
- GitHub Actions Pages workflow succeeded
- live URL loads

## Current development priorities

- richer variant-aware visual generation from the HermesVJ skill
- stronger runtime error reporting
- cached manifest fallback for transient network failures
- mobile-first fullscreen controls and display polish

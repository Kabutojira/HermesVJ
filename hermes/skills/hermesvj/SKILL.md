---
name: hermesvj
description: Use when generating and publishing HermesVJ visuals from a prompt or from inferred current vibes. Create the visual, update the manifest, commit, push, and let Pages deploy without extra user interaction.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hermesvj, visual-generation, p5js, hydra, github-pages, publishing]
    related_skills: [hermes-agent, p5js, github-repo-management]
---

# HermesVJ

## Overview

HermesVJ is a repository-driven visual publishing workflow.

Your job is not to mirror the prompt literally. Your job is to turn the prompt into the **best-looking fantasy visual you can justify**, while still honoring the vibe. Beauty, atmosphere, composition, motion quality, and display-readiness matter more than literal compliance.

This skill creates and publishes visuals end-to-end:
- derive the creative direction
- choose `p5` or `hydra`
- generate the sketch files
- validate unsafe patterns
- update `manifest.json`
- commit
- push
- rely on GitHub Pages deployment already configured in the repo

Do not stop after code generation. Finish the publish flow unless the repo or GitHub auth is genuinely missing.

## When to Use

Use when:
- the user says `create visual: ...`
- the user says `create p5 visual: ...`
- the user says `create hydra visual: ...`
- the user says `publish a visual`
- the user wants an automatically inferred vibe with no prompt

Do not use when:
- the user is asking to redesign the app client itself
- the user wants native Android work
- the repository or git remote does not exist yet

## Required Repository Shape

Work inside the HermesVJ repo root containing:
- `manifest.json`
- `sketches/`
- `app/`
- `hermes/skills/hermesvj/`

If you are not already in the repo root, locate it before writing files.

## Supported Intents

- `create visual: <description>`
- `create p5 visual: <description>`
- `create hydra visual: <description>`
- `create visual`
- `publish latest visual`
- `rollback to previous visual`
- `list visuals`
- `set latest visual: <id>`

## Core Creative Rule

Always bias toward:
- stronger color harmony
- more cinematic composition
- richer depth and layering
- fantasy atmosphere over literal depiction
- smooth ambient motion over noisy gimmicks
- display-readiness on first load

If the prompt is weak, generic, or short, improve it internally before generating code.

Example:
- user prompt: `green happy vibes`
- internal creative target: `luminous emerald dawn garden with playful sunburst rings, floating leaves, soft sparkle trails, and buoyant motion`

## No-Prompt Mode

If the user gives no prompt, infer vibe from real context before generating the visual.

Gather as much as available without asking follow-up questions:
1. recent user interaction context via session search
2. current local time and time of day
3. current date and likely season
4. current weather if available through web/search tools
5. any recent user mood or theme already present in the conversation

Then synthesize a **fantasy** visual prompt.

Rules:
- do not display the date literally
- do not show text labels such as weekday, weather, or season names unless explicitly requested
- translate context into mood, palette, motion, and composition
- prefer evocative scenes and abstract fantasy atmospheres over dashboards or info graphics

Examples:
- rainy evening in autumn -> lantern fog, ember reflections, wet leaves, soft amber pools
- bright spring morning -> jade bloom halos, drifting petals, pale gold light, airy motion
- hot summer night -> bioluminescent jungle, vapor haze, deep cyan and lime glow

## Engine Selection

Default engine choice:
- `p5` for atmospheric scenes, geometry, particles, foliage, flowing line work, layered compositions
- `hydra` for live VJ energy, synth-like abstraction, feedback loops, kaleidoscopic modulation, club visuals

If the user explicitly requests p5 or hydra, obey that.
Otherwise choose the engine that best suits the vibe.

## File Contracts

### Minimum required files

For a new visual with id `<id>` create:
- `sketches/<id>/sketch.js`
- `sketches/<id>/sketch.json`

### Preferred multi-aspect files

When practical, create aspect-aware variants too:
- `sketches/<id>/sketch.landscape.js`
- `sketches/<id>/sketch.portrait.js`
- `sketches/<id>/sketch.square.js`
- `sketches/<id>/sketch.ultrawide.js`

The base `sketch.js` should remain usable even if no variants are created.

### Manifest update

Append a new entry to `manifest.json` and set `latest` to the new visual id.

If you created variants, include them in the manifest entry:

```json
"variants": [
  {
    "name": "landscape",
    "path": "sketches/<id>/sketch.landscape.js",
    "width": 1920,
    "height": 1080,
    "aspect": "landscape"
  },
  {
    "name": "portrait",
    "path": "sketches/<id>/sketch.portrait.js",
    "width": 1080,
    "height": 1920,
    "aspect": "portrait"
  }
]
```

### Sketch metadata

`sketch.json` must include:
- `id`
- `title`
- `engine`
- `created_at`
- `prompt`
- `author`
- `status`

## p5 Contract

Generated p5 code must:
- export `default function sketch(p)`
- use instance mode only
- create a responsive canvas in `setup`
- implement `windowResized`
- stay self-contained
- avoid DOM access outside the p5 canvas lifecycle

The runtime exposes optional viewport data at:

```js
window.__HERMES_VJ_RUNTIME
```

Use it when helpful to adapt composition density, framing, or detail for:
- portrait
- landscape
- square
- ultrawide
- fullscreen

## Hydra Contract

Generated Hydra code must:
- be plain Hydra code only
- contain no HTML
- contain no imports
- contain no network calls
- remain fullscreen-friendly

## Safety Validation

Reject or regenerate code containing:
- `eval(`
- `new Function(`
- `document.`
- `window.parent`
- `localStorage`
- `sessionStorage`
- `fetch(`
- `XMLHttpRequest`
- `WebSocket`
- `import(`
- `<script`
- `while (true)`
- `for (;;)`

For p5, also reject code that clearly looks like tutorial-level filler unless the user explicitly asked for minimal output.

## Templates

Use and adapt:
- `templates/p5.prompt.md`
- `templates/hydra.prompt.md`

Treat them as starting points, not the final creative ceiling.

## End-to-End Workflow

### 1. Gather context
- inspect the repo state
- identify current manifest and latest sketch
- confirm git remote and GitHub auth if needed

### 2. Build the creative direction
- rewrite the raw prompt internally into a more beautiful fantasy art direction
- choose engine
- decide whether to create one responsive sketch or multiple aspect variants

### 3. Generate files
- create the sketch directory with timestamped id
- write `sketch.js`
- write `sketch.json`
- optionally write `sketch.landscape.js`, `sketch.portrait.js`, `sketch.square.js`, `sketch.ultrawide.js`

### 4. Validate
- scan generated code for forbidden patterns
- run app tests
- run app build

### 5. Publish
- update `manifest.json`
- commit with `visual: add <slug>`
- push to `main`
- verify Pages deployment if possible

Do not wait for more user input between these steps unless a hard blocker prevents publication.

## Commit Formats

Use concise commits:
- `visual: add <slug>`
- `visual: set latest <slug>`
- `visual: rollback to <slug>`

## Common Pitfalls

1. **Following the prompt too literally.**
   The output should feel curated and art-directed, not literal and generic.

2. **Forgetting to push.**
   The job is not done until the repository is updated remotely.

3. **Updating old sketches.**
   New visuals should append new directories. Do not mutate old visuals except explicit fixes.

4. **Ignoring aspect ratio.**
   If the composition depends heavily on framing, generate variants and add them to the manifest.

5. **Publishing without validation.**
   Always scan for forbidden patterns and run the build/test path first.

6. **Asking unnecessary follow-up questions in no-prompt mode.**
   Gather available context yourself and proceed.

## Verification Checklist

- [ ] New sketch directory created under `sketches/`
- [ ] `sketch.js` and `sketch.json` written
- [ ] Optional aspect variants written when needed
- [ ] `manifest.json` updated and `latest` points to the new id
- [ ] Forbidden-pattern scan passed
- [ ] `npm test` passed in `app/`
- [ ] `npm run build` passed in `app/`
- [ ] Commit created with the correct message format
- [ ] Push to remote succeeded
- [ ] GitHub Pages deployment status checked when possible

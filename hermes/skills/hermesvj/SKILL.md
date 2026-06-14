---
name: hermesvj
description: Use when generating and publishing HermesVJ visuals from a prompt or inferred vibe. Inspect recent visuals, raise the art direction, generate the sketch, lint it, publish it, and stop.
version: 1.2.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hermesvj, visual-generation, p5js, hydra, github-pages, publishing]
    related_skills: [update-graphics, hermes-agent, github-repo-management]
---

# HermesVJ

## Overview

HermesVJ visuals should feel curated, cinematic, and display-ready.

The failure mode to avoid is obvious: a centered blob of translucent shapes with weak contrast, muddy layering, and motion where every element has the same visual weight. That can look pleasant, but not memorable.

The default workflow is still operationally cheap:
1. inspect recent visuals and the current repo state
2. raise the art direction internally
3. generate the sketch files
4. lint the new visual
5. publish it with the repo script
6. stop

Do not spend time on extra build verification or deployment polling unless the user asks.

## When to Use

Use when:
- the user says `create visual: ...`
- the user says `create p5 visual: ...`
- the user says `create hydra visual: ...`
- the user says `create visual`
- the user wants a promptless ambient visual
- the user wants a better-looking replacement for the current house style

Do not use when:
- the user is modifying the app itself
- the user wants native Android work
- the repository is missing

## Required Repo Paths

Work from the HermesVJ repo root:
- `manifest.json`
- `sketches/`
- `scripts/lint_visual.py`
- `scripts/publish_visual.py`
- `hermes/skills/hermesvj/templates/`

Optional but useful evidence paths:
- `promo_*.png`
- `full_*.png`
- `title_card.png`

## Supported Intents

- `create visual: <description>`
- `create p5 visual: <description>`
- `create hydra visual: <description>`
- `create visual`
- `publish latest visual`
- `rollback to previous visual`
- `list visuals`
- `set latest visual: <id>`

## Beauty Upgrade Rules

Before generating, derive a stronger internal art brief.

Always define:
- one dominant focal subject or silhouette
- one restrained palette family with one accent color
- clear foreground / midground / background separation
- one slow ambient motion layer plus one sharper accent motion layer
- a deliberate negative-space strategy so the frame can breathe
- a highlight zone where contrast peaks instead of spreading brightness everywhere

Avoid these weak patterns unless the user explicitly wants them:
- centered anonymous glow blobs
- same-opacity layers across the whole frame
- too many equal-strength curves or circles
- rainbow color drift without palette discipline
- text floating everywhere with no visual hierarchy
- motion where everything pulses at the same speed

## Visual Triage Before Generating

Inspect at least a few recent visuals or captures before creating a new one.

Specifically look for:
- muddy low-contrast overlays
- compositions with no clear hero element
- overuse of full-frame haze
- repetitive ring stacks without depth cues
- elegant ideas that need sharper framing and richer bloom

Then improve from there instead of repeating the same recipe.

## Engine Selection

- use `p5` for atmospheric scenes, layered geometry, particles, parallax, silhouettes, portals, flora, celestial structures, and painterly motion
- use `hydra` for club energy, feedback systems, kaleidoscopic modulation, and synth-like live visuals
- obey explicit engine requests

Default bias: if the prompt could become a beautiful scene, choose `p5`.

## Strong Composition Heuristics

### For p5

Bias toward:
- asymmetric framing with a hero shape slightly off center
- layered translucent strokes that imply glow without flattening the frame
- depth from parallax, scale changes, and occlusion
- soft bloom around a few bright structures, not everything
- 3-4 color families max
- a dark base with selective highlights
- motion that reads well from across the room

Good building blocks:
- halos with masked interiors
- ribbon fields with uneven density
- particle embers with brightness tapering by depth
- warped arches, gates, petals, moons, reefs, cathedrals, vortexes, or other recognizable fantasy silhouettes
- subtle film-grain or star-dust texture at low opacity

### For Hydra

Bias toward:
- one base oscillator or noise field
- one or two modulation sources, not five competing ones
- disciplined colorization after structure is established
- movement that feels musical rather than frantic
- large-scale motion first, detail second

## File Contract

For a new `<id>` create:
- `sketches/<id>/sketch.js`
- `sketches/<id>/sketch.json`

Optional variants when framing matters:
- `sketches/<id>/sketch.landscape.js`
- `sketches/<id>/sketch.portrait.js`
- `sketches/<id>/sketch.square.js`
- `sketches/<id>/sketch.ultrawide.js`

`sketch.json` must contain:
- `id`
- `title`
- `engine`
- `created_at`
- `prompt`
- `author`
- `status`

## Safety Rules

Generated code must not contain:
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

## Templates

Use and adapt:
- `templates/p5.prompt.md`
- `templates/hydra.prompt.md`

Treat them as a floor, not the ceiling.

## Minimal Publish Workflow

### For `create ...` intents

1. inspect the current manifest and at least a few recent visual captures or sketch files
2. choose engine
3. create timestamped visual id
4. write sketch files under `sketches/<id>/`
5. lint the visual:

```bash
python3 scripts/lint_visual.py <id>
```

6. if the repo has preview capture support, do one real preview pass before publish:

```bash
node scripts/capture_visual_preview.mjs <id>
```

Allow one refinement pass if the preview still reads as centered, muddy, low-contrast, or generic.

7. publish it:

```bash
python3 scripts/publish_visual.py <id>
```

8. stop

That publish script is responsible for:
- updating `manifest.json`
- setting `latest`
- adding files to git
- committing with `visual: add <slug>`
- pushing to `origin/main`

Do not separately update the manifest by hand if the script will do it.
Do not separately run tests, builds, or deployment checks unless explicitly requested.

### For `publish latest visual`

If the newest sketch directory exists locally but is not published yet:
1. lint it
2. run `python3 scripts/publish_visual.py <id>`
3. stop

## Rollback / Set Latest / List

- `list visuals`: read `manifest.json` and summarize ids, titles, engines, latest
- `set latest visual: <id>`: update only `manifest.json`, commit `visual: set latest <slug>`, push
- `rollback to previous visual`: point `latest` at the prior manifest entry, commit `visual: rollback to <slug>`, push

Keep these actions narrow. Do not rewrite old sketch files.

## Common Pitfalls

1. **Generating something pleasant but generic.**
   Beauty needs hierarchy: one hero, restrained palette, layered depth, selective highlights.

2. **Recycling the same ring-stack composition.**
   If the last visuals already leaned on concentric halos, shift silhouette, framing, and motion logic.

3. **Flooding the frame with haze.**
   Atmosphere should support the focal point, not bury it.

4. **Publishing before lint passes.**
   Always run `scripts/lint_visual.py` first.

5. **Mutating old visuals.**
   New visuals get new directories.

## Verification Checklist

- [ ] Recent repo visuals or captures were inspected before generating
- [ ] New visual has a clear focal subject, restrained palette, and depth separation
- [ ] New sketch directory exists under `sketches/`
- [ ] `sketch.js` and `sketch.json` were written
- [ ] `python3 scripts/lint_visual.py <id>` passed
- [ ] `node scripts/capture_visual_preview.mjs <id>` was run when available
- [ ] `python3 scripts/publish_visual.py <id>` succeeded

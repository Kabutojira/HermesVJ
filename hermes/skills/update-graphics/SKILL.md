---
name: update-graphics
description: Use when refreshing HermesVJ graphics quality or creating and publishing a new visual with a single repo-local command.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hermesvj, graphics, p5js, hydra, publishing, workflow]
    related_skills: [hermesvj, hermes-agent]
---

# Update Graphics

## Overview

This skill is the repo-local fast path for improving HermesVJ graphics without re-explaining the workflow every time.

Current quality findings from actual repo visuals:
- some p5 scenes are attractive but over-rely on a centered orb / halo stack
- some scenes spread small particles across the whole frame, which weakens hierarchy
- some Hydra/event results can collapse into sparse abstract noise if the composition brief is too loose
- the difference between "nice" and "stunning" here is mostly art direction and preview discipline, not more effect layers

Its job is simple:
1. inspect the current visual style
2. create a better-looking new visual
3. lint it
4. publish it
5. optionally capture proof if the user wants to see it

Use the helper command from the repo root:

```bash
./scripts/create_visual.sh "your prompt here"
```

## When to Use

Use when:
- the user wants a new HermesVJ visual
- the user wants the house style improved
- the user asks to refresh, update, or replace graphics
- the user wants one-command creation from the repo

Do not use when:
- the user is changing the player app itself
- the user wants non-HermesVJ artwork outside this repo

## Required Inputs

The user may provide:
- an explicit visual prompt
- a weak vibe prompt that needs improvement
- no prompt at all

If no prompt is provided, infer a fantasy-friendly art direction from local context and recent repo visuals.

## Mandatory Workflow

1. Read `manifest.json` and inspect a few recent visuals or captures.
2. Identify what looks merely nice instead of striking:
   - muddy overlays
   - weak focal hierarchy
   - over-centered composition
   - too many equal-strength layers
3. Rewrite the prompt internally into a stronger art brief.
4. Follow `hermes/skills/hermesvj/SKILL.md` for generation and publication.
5. Create the new sketch under `sketches/<id>/`.
6. Run:

```bash
python3 scripts/lint_visual.py <id>
python3 scripts/publish_visual.py <id>
```

7. If asked to show the result, render or capture the new visual.

If the repo has `scripts/capture_visual_preview.mjs`, use it before publishing as the cheap reality check:

```bash
node scripts/capture_visual_preview.mjs <id>
```

Do one preview pass and allow exactly one art-direction refinement if the result is still centered, muddy, low-contrast, or compositionally generic.

## Art Brief Standard

Before generating, lock these decisions:
- title / vibe
- engine choice
- dominant silhouette
- palette family
- depth plan
- motion hierarchy
- highlight zone
- whether aspect variants are worth it

Do not proceed without an explicit answer for all of these. Weak briefs produce weak visuals.

Strong defaults:
- push the hero off dead center unless symmetry is the point
- use one dominant hue family plus one accent, not three competing families
- keep the brightest region under roughly one quarter of the frame
- prefer one large memorable structure over many equal-strength motifs

## One-Command Repo Flow

The helper script `scripts/create_visual.sh` is the intended operator interface.
It should be preferred over retyping a long Hermes prompt manually.

Canonical operator command from the repo root:

```bash
./scripts/create_visual.sh "your prompt here"
```

## Common Pitfalls

1. **Generating before inspecting current output.**
   Do not improve blindly.

2. **Using the same composition recipe again.**
   Shift silhouette, framing, and depth logic.

3. **Treating the helper script as optional ceremony.**
   The script is the point: one simple command from repo root.

4. **Mistaking more particles or bloom for better art.**
   More visual noise usually makes the result cheaper, not richer.

5. **Skipping a real preview.**
   A valid sketch can still fail visually; capture one frame before publish when the preview script exists.

## Verification Checklist

- [ ] Current visuals were inspected first
- [ ] The new art brief is more specific than the raw prompt
- [ ] The visual was previewed once before publish when preview tooling was available
- [ ] The visual was linted
- [ ] The visual was published and pushed
- [ ] The user got the repo-local command for future runs

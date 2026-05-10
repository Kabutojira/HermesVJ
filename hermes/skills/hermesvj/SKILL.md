---
name: hermesvj
description: Generate, publish, and roll back HermesVJ visuals against the repository manifest contract.
version: 0.1.0
author: Hermes Agent
---

# HermesVJ skill

## Supported intents

- `create p5 visual: <description>`
- `create hydra visual: <description>`
- `create visual: <description>`
- `publish latest visual`
- `rollback to previous visual`
- `list visuals`
- `set latest visual: <id>`

## Engine defaults

- Use `p5` for generative art, geometry, particles, typography, and scenes.
- Use `hydra` for VJ, live event, synth-like, feedback-heavy visuals.

## Required validations

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

## Templates

- `templates/p5.prompt.md`
- `templates/hydra.prompt.md`

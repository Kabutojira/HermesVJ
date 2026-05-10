````md
# HermesVJ

HermesVJ is a Web/PWA visual display system for agent-generated live visuals.

Hermes Agent generates visual code, commits it to GitHub, and the client renders it through a browser-based runtime using p5.js and Hydra.

## Project goal

Build a simple, extensible visual pipeline:

```text
Prompt
  → Hermes Agent
  → generated visual code
  → GitHub commit
  → GitHub Pages
  → Web/PWA display
````

The first target is a browser/PWA client. Native Android is intentionally deferred unless kiosk, offline, or hardware integration becomes necessary.

## Architecture decisions

### Rendering

Use:

* `p5.js` for generative art, animation, particles, typography, geometry, and interactive canvas visuals.
* `Hydra` for VJ-style live visuals, video-synth effects, feedback loops, modulation, and music/event visuals.

Do not add Three.js, raw WebGL, GLSL, React Canvas, or native rendering in the MVP unless explicitly requested.

### Transport

Use GitHub as the source of truth.

Hermes Agent publishes visuals by committing files to the repository.

GitHub provides:

* version history
* rollback
* reviewable diffs
* broadcast distribution
* simple static hosting through GitHub Pages

Do not introduce a custom backend, database, queue, WebSocket server, Firebase, or Telegram transport in the MVP.

### Hosting

Use GitHub Pages.

The Web/PWA client must be deployable as static files.

The client fetches the latest visual manifest and loads the selected sketch.

### Client

Build Web/PWA first.

The client must:

* run in a normal browser
* support fullscreen display
* work well on Android browsers
* support manual refresh
* support auto-refresh/polling
* support gallery navigation
* render generated code inside a sandboxed iframe

Avoid native Android code in the first implementation.

## Repository structure

Preferred layout:

```text
/
  AGENTS.md
  README.md
  manifest.json

  app/
    package.json
    src/
      App.tsx
      main.tsx
      components/
        Gallery.tsx
        FullscreenPlayer.tsx
        EngineBadge.tsx
      runtime/
        p5-runtime.html
        hydra-runtime.html
      lib/
        manifest.ts
        sketch.ts
        polling.ts

  sketches/
    YYYY-MM-DD-HHMMSS-slug/
      sketch.json
      sketch.js

  hermes/
    skills/
      hermesvj/
        SKILL.md
        templates/
          p5.prompt.md
          hydra.prompt.md
```

## Manifest contract

The root `manifest.json` is the public index consumed by the client.

Format:

```json
{
  "version": 1,
  "latest": "2026-05-10-120000-neon-orbits",
  "sketches": [
    {
      "id": "2026-05-10-120000-neon-orbits",
      "title": "Neon Orbits",
      "engine": "p5",
      "path": "sketches/2026-05-10-120000-neon-orbits/sketch.js",
      "metadata": "sketches/2026-05-10-120000-neon-orbits/sketch.json",
      "created_at": "2026-05-10T12:00:00Z",
      "prompt": "slow neon orbital visuals for a dark room"
    }
  ]
}
```

Rules:

* `latest` must reference an existing sketch ID.
* `engine` must be `p5` or `hydra`.
* `path` must point to a JavaScript file under `sketches/`.
* New sketches are appended to `sketches`.
* Do not mutate old sketches except for explicit fixes.
* Rollback is done by changing `latest`.

## Sketch metadata contract

Each sketch directory must contain `sketch.json`.

Format:

```json
{
  "id": "2026-05-10-120000-neon-orbits",
  "title": "Neon Orbits",
  "engine": "p5",
  "created_at": "2026-05-10T12:00:00Z",
  "prompt": "slow neon orbital visuals for a dark room",
  "author": "hermes-agent",
  "status": "published"
}
```

## p5.js sketch contract

Hermes-generated p5.js code must export a default function.

Required shape:

```js
export default function sketch(p) {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(0);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}
```

Rules:

* Use instance mode only.
* Do not use global p5 mode.
* Do not access the parent DOM.
* Do not call external APIs.
* Do not fetch remote assets unless explicitly allowed.
* Do not use `eval`, `Function`, dynamic imports, or script injection.
* Keep code self-contained.
* Prefer procedural visuals over asset-heavy visuals.
* Must remain responsive to window resize.

## Hydra sketch contract

Hermes-generated Hydra code must be a plain Hydra program.

Example:

```js
osc(10, 0.1, 1.2)
  .kaleid(6)
  .modulate(noise(3), 0.2)
  .color(1.2, 0.7, 1.5)
  .out();
```

Rules:

* Do not include HTML.
* Do not include imports.
* Do not access the parent DOM.
* Do not use network calls.
* Do not use unbounded custom loops.
* Prefer compact, compositional Hydra chains.
* Visual output must be full-screen friendly.

## Runtime isolation

Generated code is untrusted.

The app must render sketches inside sandboxed iframes.

The parent app is responsible for:

* selecting the runtime
* passing the sketch URL or code to the iframe
* reloading the iframe when the sketch changes
* killing/replacing the iframe on error or timeout

The generated sketch must not directly modify the parent page.

## Client behavior

The Web/PWA client must support:

* latest visual mode
* gallery mode
* fullscreen mode
* manual previous/next
* refresh latest
* optional polling interval
* visible error state when a sketch fails
* engine label: `p5` or `hydra`

Default behavior:

```text
load manifest.json
  → read latest
  → load sketch metadata
  → select runtime by engine
  → render in sandboxed iframe
```

## Polling

The client may poll `manifest.json`.

Recommended default:

```text
poll every 30 seconds
```

Rules:

* If `latest` changes, reload the iframe.
* If manifest fetch fails, keep the current visual running.
* Do not hard-fail the display on transient network errors.

## Hermes Agent responsibilities

Hermes Agent is responsible for:

1. Reading the visual prompt.
2. Choosing `p5` or `hydra`.
3. Generating valid sketch code.
4. Creating a new sketch directory.
5. Writing `sketch.js`.
6. Writing `sketch.json`.
7. Updating root `manifest.json`.
8. Committing the change.
9. Pushing to GitHub.
10. Returning the GitHub Pages URL or repository URL.

## Hermes skill commands

The HermesVJ skill should support these intents:

```text
create p5 visual: <description>
create hydra visual: <description>
create visual: <description>
publish latest visual
rollback to previous visual
list visuals
set latest visual: <id>
```

Default engine selection:

* use `p5` for generative art, geometry, particles, typography, scenes
* use `hydra` for VJ, live events, abstract motion, feedback, synth-like visuals

## Validation rules

Before publishing, check generated code for obvious unsafe or unsupported patterns.

Reject or regenerate code containing:

```text
eval(
new Function(
document.
window.parent
localStorage
sessionStorage
fetch(
XMLHttpRequest
WebSocket
import(
<script
while (true)
for (;;)
```

This is not complete security. Runtime sandboxing is still mandatory.

## Commit format

Use concise commits.

Format:

```text
visual: add <slug>
visual: set latest <slug>
visual: rollback to <slug>
app: update renderer
runtime: update p5 runtime
runtime: update hydra runtime
```

Examples:

```text
visual: add neon-orbits
visual: add liquid-grid
visual: rollback to neon-orbits
```

## Development priorities

### Phase 1 — MVP

Implement:

* static Web/PWA app
* GitHub Pages deployment
* root `manifest.json`
* p5 runtime
* Hydra runtime
* fullscreen latest visual
* gallery navigation
* manual refresh
* Hermes skill for creating and publishing sketches

### Phase 2 — Better display

Add:

* auto-refresh polling
* visual loading transitions
* QR code for display URL
* mobile-first fullscreen controls
* local cache of last successful manifest
* better runtime error reporting

### Phase 3 — Live/VJ mode

Add only after MVP is stable:

* scene playlists
* timed rotation
* display profiles
* multiple channels/screens
* remote control commands
* audio-reactive templates
* optional WebSocket transport

## Non-goals for MVP

Do not implement in the MVP:

* native Android app
* custom backend
* authentication system
* Telegram bot transport
* real-time WebSocket transport
* database
* user accounts
* marketplace
* asset upload system
* complex editor UI
* arbitrary JavaScript app generation

## Coding guidelines

* Keep the app static-hosting compatible.
* Avoid server-only assumptions.
* Prefer simple TypeScript.
* Keep runtime pages minimal and isolated.
* Do not couple the app to Hermes internals.
* Treat GitHub-hosted files as the public API.
* Keep generated sketch contracts stable.
* Optimize for reliability over visual complexity.

## Design principle

HermesVJ should be a thin, robust display surface.

The intelligence belongs to Hermes Agent.

The repository is the source of truth.

The browser is the renderer.

Generated code is replaceable, isolated, and versioned.

```
```


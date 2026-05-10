import hydraRuntimeTemplate from '../runtime/hydra-runtime.html?raw';
import p5RuntimeTemplate from '../runtime/p5-runtime.html?raw';
import type { ManifestSketch } from './manifest';

function toAbsoluteUrl(path: string): string {
  return new URL(path, window.location.href).toString();
}

export function buildRuntimeDocument(sketch: ManifestSketch): string {
  const template = sketch.engine === 'hydra' ? hydraRuntimeTemplate : p5RuntimeTemplate;

  return template
    .replace(/__SKETCH_URL__/g, JSON.stringify(toAbsoluteUrl(sketch.path)))
    .replace(/__SKETCH_TITLE__/g, JSON.stringify(sketch.title));
}

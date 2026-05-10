import hydraRuntimeTemplate from '../runtime/hydra-runtime.html?raw';
import p5RuntimeTemplate from '../runtime/p5-runtime.html?raw';
import type { ManifestSketch, SketchVariant, SketchVariantAspect } from './manifest';

export interface RenderTarget {
  width: number;
  height: number;
  dpr: number;
  fullscreen: boolean;
}

interface SketchSelection {
  aspect: SketchVariantAspect;
  path: string;
  selectedVariant: SketchVariant | null;
}

function toAbsoluteUrl(path: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://example.com/';
  return new URL(path, baseUrl).toString();
}

export function classifyAspect(width: number, height: number): SketchVariantAspect {
  const safeHeight = Math.max(height, 1);
  const ratio = width / safeHeight;

  if (ratio >= 1.9) {
    return 'ultrawide';
  }
  if (ratio >= 1.15) {
    return 'landscape';
  }
  if (ratio <= 0.85) {
    return 'portrait';
  }

  return 'square';
}

function aspectRatioForVariant(variant: SketchVariant): number {
  return variant.width / Math.max(variant.height, 1);
}

export function selectSketchSource(sketch: ManifestSketch, target: RenderTarget): SketchSelection {
  const variants = sketch.variants ?? [];
  const aspect = classifyAspect(target.width, target.height);

  if (variants.length === 0) {
    return {
      aspect,
      path: sketch.path,
      selectedVariant: null,
    };
  }

  const viewportRatio = target.width / Math.max(target.height, 1);
  const sorted = [...variants].sort((left, right) => {
    const leftAspectPenalty = Math.abs(Math.log(viewportRatio / aspectRatioForVariant(left)));
    const rightAspectPenalty = Math.abs(Math.log(viewportRatio / aspectRatioForVariant(right)));

    if (leftAspectPenalty !== rightAspectPenalty) {
      return leftAspectPenalty - rightAspectPenalty;
    }

    const leftAreaPenalty = Math.abs(left.width * left.height - target.width * target.height);
    const rightAreaPenalty = Math.abs(right.width * right.height - target.width * target.height);
    return leftAreaPenalty - rightAreaPenalty;
  });

  const selectedVariant =
    sorted.find((variant) => variant.aspect === aspect) ??
    sorted[0];

  return {
    aspect,
    path: selectedVariant.path,
    selectedVariant,
  };
}

export function buildRuntimeDocument(sketch: ManifestSketch, target: RenderTarget): string {
  const template = sketch.engine === 'hydra' ? hydraRuntimeTemplate : p5RuntimeTemplate;
  const selection = selectSketchSource(sketch, target);
  const sketchUrl = toAbsoluteUrl(selection.path);
  const runtimeConfig = {
    dpr: target.dpr,
    fullscreen: target.fullscreen,
    sketchId: sketch.id,
    sketchTitle: sketch.title,
    sourcePath: selection.path,
    variant: selection.selectedVariant,
    viewport: {
      aspect: selection.aspect,
      height: target.height,
      width: target.width,
    },
  };

  return template
    .replace(/__SKETCH_URL__/g, JSON.stringify(sketchUrl))
    .replace(/__SKETCH_TITLE__/g, JSON.stringify(sketch.title))
    .replace(/__HERMES_VJ_RUNTIME__/g, JSON.stringify(runtimeConfig));
}

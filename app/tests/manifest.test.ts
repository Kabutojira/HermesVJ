import { describe, expect, it } from 'vitest';
import { normalizeManifest, resolveManifestUrl } from '../src/lib/manifest';
import { buildRuntimeDocument, classifyAspect, selectSketchSource, type RenderTarget } from '../src/lib/sketch';

describe('resolveManifestUrl', () => {
  it('builds the manifest URL from the Vite base path', () => {
    expect(resolveManifestUrl('/')).toBe('/manifest.json');
    expect(resolveManifestUrl('/HermesVJ/')).toBe('/HermesVJ/manifest.json');
  });
});

describe('normalizeManifest', () => {
  it('rejects a manifest whose latest id is missing from the sketch list', () => {
    expect(() =>
      normalizeManifest({
        version: 1,
        latest: 'missing-sketch',
        sketches: [],
      }),
    ).toThrow(/latest/);
  });

  it('accepts optional sketch variants', () => {
    const manifest = normalizeManifest({
      version: 1,
      latest: 'green-garden',
      sketches: [
        {
          id: 'green-garden',
          title: 'Green Garden',
          engine: 'p5',
          path: 'sketches/green-garden/sketch.js',
          metadata: 'sketches/green-garden/sketch.json',
          created_at: '2026-05-10T00:00:00Z',
          prompt: 'green joy',
          variants: [
            {
              name: 'portrait',
              path: 'sketches/green-garden/sketch.portrait.js',
              width: 1080,
              height: 1920,
              aspect: 'portrait',
            },
          ],
        },
      ],
    });

    expect(manifest.sketches[0].variants).toHaveLength(1);
    expect(manifest.sketches[0].variants?.[0].aspect).toBe('portrait');
  });
});

describe('runtime source selection', () => {
  const sketch = {
    id: 'green-garden',
    title: 'Green Garden',
    engine: 'p5' as const,
    path: 'sketches/green-garden/sketch.js',
    metadata: 'sketches/green-garden/sketch.json',
    created_at: '2026-05-10T00:00:00Z',
    prompt: 'green joy',
    variants: [
      {
        name: 'landscape',
        path: 'sketches/green-garden/sketch.landscape.js',
        width: 1920,
        height: 1080,
        aspect: 'landscape' as const,
      },
      {
        name: 'portrait',
        path: 'sketches/green-garden/sketch.portrait.js',
        width: 1080,
        height: 1920,
        aspect: 'portrait' as const,
      },
    ],
  };

  it('classifies viewport aspect buckets', () => {
    expect(classifyAspect(1920, 1080)).toBe('landscape');
    expect(classifyAspect(1080, 1920)).toBe('portrait');
    expect(classifyAspect(1080, 1080)).toBe('square');
    expect(classifyAspect(2560, 1080)).toBe('ultrawide');
  });

  it('prefers the best matching variant for the viewport', () => {
    const target: RenderTarget = { width: 1080, height: 1920, dpr: 2, fullscreen: true };
    const selection = selectSketchSource(sketch, target);
    expect(selection.selectedVariant?.name).toBe('portrait');
    expect(selection.path).toContain('portrait');
  });

  it('injects runtime configuration into the iframe document', () => {
    const target: RenderTarget = { width: 1080, height: 1920, dpr: 2, fullscreen: true };
    const documentHtml = buildRuntimeDocument(sketch, target);

    expect(documentHtml).toContain('window.__HERMES_VJ_RUNTIME');
    expect(documentHtml).toContain('"fullscreen":true');
    expect(documentHtml).toContain('portrait');
  });
});

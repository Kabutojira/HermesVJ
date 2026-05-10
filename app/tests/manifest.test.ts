import { describe, expect, it } from 'vitest';
import { normalizeManifest, resolveManifestUrl } from '../src/lib/manifest';

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
});

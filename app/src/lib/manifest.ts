export type SketchEngine = 'p5' | 'hydra';

export interface ManifestSketch {
  id: string;
  title: string;
  engine: SketchEngine;
  path: string;
  metadata: string;
  created_at: string;
  prompt: string;
}

export interface VisualManifest {
  version: number;
  latest: string;
  sketches: ManifestSketch[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Manifest field ${field} must be a non-empty string.`);
  }

  return value;
}

function assertEngine(value: unknown): SketchEngine {
  if (value === 'p5' || value === 'hydra') {
    return value;
  }

  throw new Error('Manifest field engine must be p5 or hydra.');
}

export function resolveManifestUrl(baseUrl: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}manifest.json`;
}

export function normalizeManifest(input: unknown): VisualManifest {
  if (!isRecord(input)) {
    throw new Error('Manifest payload must be an object.');
  }

  const sketchesInput = input.sketches;
  if (!Array.isArray(sketchesInput)) {
    throw new Error('Manifest field sketches must be an array.');
  }

  const sketches = sketchesInput.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Manifest sketch at index ${index} must be an object.`);
    }

    const path = assertString(entry.path, `sketches[${index}].path`);
    if (!path.startsWith('sketches/') || !path.endsWith('.js')) {
      throw new Error(`Manifest sketch path ${path} must point to a JavaScript file under sketches/.`);
    }

    return {
      id: assertString(entry.id, `sketches[${index}].id`),
      title: assertString(entry.title, `sketches[${index}].title`),
      engine: assertEngine(entry.engine),
      path,
      metadata: assertString(entry.metadata, `sketches[${index}].metadata`),
      created_at: assertString(entry.created_at, `sketches[${index}].created_at`),
      prompt: assertString(entry.prompt, `sketches[${index}].prompt`),
    } satisfies ManifestSketch;
  });

  const latest = assertString(input.latest, 'latest');
  if (!sketches.some((sketch) => sketch.id === latest)) {
    throw new Error(`Manifest latest value ${latest} must reference an existing sketch.`);
  }

  const version = input.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('Manifest field version must be a positive integer.');
  }

  return {
    version,
    latest,
    sketches,
  };
}

export async function fetchManifest(baseUrl = import.meta.env.BASE_URL): Promise<VisualManifest> {
  const response = await fetch(resolveManifestUrl(baseUrl), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Manifest fetch failed with status ${response.status}.`);
  }

  return normalizeManifest(await response.json());
}

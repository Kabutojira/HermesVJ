import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(appDir, '..');
const distDir = path.join(appDir, 'dist');

await mkdir(path.join(distDir, 'sketches'), { recursive: true });
await cp(path.join(repoRoot, 'manifest.json'), path.join(distDir, 'manifest.json'));
await cp(path.join(repoRoot, 'sketches'), path.join(distDir, 'sketches'), { recursive: true });

const indexHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
await writeFile(path.join(distDir, '404.html'), indexHtml);

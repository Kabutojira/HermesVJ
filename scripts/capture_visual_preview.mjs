#!/usr/bin/env node
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const requireFromApp = createRequire(path.join(repoRoot, 'app', 'package.json'));
const { chromium } = requireFromApp('playwright');
const visualId = process.argv[2];
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(repoRoot, `${visualId}_preview.png`);

if (!visualId) {
  console.error('usage: node scripts/capture_visual_preview.mjs <visual-id> [output.png]');
  process.exit(1);
}

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

async function startStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const requestedPath = decodeURIComponent(requestUrl.pathname);
      const safePath = path.normalize(requestedPath).replace(/^([.][.][/\\])+/, '');
      let filePath = path.join(rootDir, safePath);
      if (!filePath.startsWith(rootDir)) {
        send(res, 403, 'forbidden');
        return;
      }
      const stats = await fs.stat(filePath).catch(() => null);
      if (stats && stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      const content = await fs.readFile(filePath).catch(() => null);
      if (!content) {
        send(res, 404, 'not found');
        return;
      }
      const type = mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
      send(res, 200, content, type);
    } catch (error) {
      send(res, 500, error instanceof Error ? error.message : 'server error');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('failed to determine preview server port');
  }
  return { server, port: address.port };
}

async function main() {
  const sketchDir = path.join(repoRoot, 'sketches', visualId);
  const metadataPath = path.join(sketchDir, 'sketch.json');
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  const engine = metadata.engine;
  if (!['p5', 'hydra'].includes(engine)) {
    throw new Error(`unsupported engine: ${engine}`);
  }

  const runtimeTemplatePath = path.join(repoRoot, 'app', 'src', 'runtime', `${engine}-runtime.html`);
  const runtimeTemplate = await fs.readFile(runtimeTemplatePath, 'utf8');
  const runtimeConfig = {
    aspect: 'landscape',
    width: 1280,
    height: 720,
    dpr: 1,
    fullscreen: true,
    sketchId: visualId,
    sketchTitle: metadata.title,
    sourcePath: `/sketches/${visualId}/sketch.js`,
    variant: null,
    viewport: { aspect: 'landscape', width: 1280, height: 720 },
  };

  const previewHtml = runtimeTemplate
    .replace(/__SKETCH_TITLE__/g, metadata.title)
    .replace('__SKETCH_URL__', JSON.stringify(`/sketches/${visualId}/sketch.js`))
    .replace('__HERMES_VJ_RUNTIME__', JSON.stringify(runtimeConfig));

  const previewFilename = `tmp_preview_${visualId}.html`;
  const previewPath = path.join(repoRoot, previewFilename);
  await fs.writeFile(previewPath, previewHtml, 'utf8');

  const { server, port } = await startStaticServer(repoRoot);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });

  try {
    await page.goto(`http://127.0.0.1:${port}/${previewFilename}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(engine === 'hydra' ? 4500 : 2500);
    const statusVisible = await page.locator('#status').count();
    await page.screenshot({ path: outputPath });
    process.stdout.write(`${JSON.stringify({ ok: true, id: visualId, engine, output: outputPath, status_visible: statusVisible, console: consoleMessages }, null, 2)}\n`);
  } finally {
    await browser.close().catch(() => {});
    server.close();
    await fs.rm(previewPath, { force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

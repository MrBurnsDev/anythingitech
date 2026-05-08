/**
 * Prerender every URL in dist/sitemap.xml to a static HTML file.
 *
 * Why: this is a Vite SPA. Without prerender, Vercel serves dist/index.html
 * (the SPA shell) for every directory URL. Googlebot reads the shell's hardcoded
 * canonical (https://anythingitechmv.com/) and treats every directory page as a
 * duplicate of the homepage. That triggered the GSC "Page with redirect" spike
 * we're solving for.
 *
 * Pipeline:
 *   1. Spin up a local static server on PORT, proxying /api/* to live API
 *   2. For each URL in dist/sitemap.xml (concurrency = PRERENDER_CONCURRENCY):
 *      a. Puppeteer loads the URL
 *      b. Wait for React + SEO-component effects to flush
 *      c. Serialize document.documentElement.outerHTML
 *      d. Write to dist/{path}/index.html
 *      e. Validate <link rel="canonical"> matches the URL we rendered
 *
 * Invariants:
 *   - The sitemap is the single source of truth for what gets prerendered.
 *     Sitemap and prerender output stay in lockstep automatically.
 *   - Every prerendered page must declare a canonical tag matching its own URL.
 *     A mismatch is logged as a warning; investigate before deploy.
 *   - The output is consumed by Vercel via outputDirectory=dist. Don't write
 *     anywhere else — the deploy pipeline copies dist/ verbatim.
 *
 * Failure modes:
 *   - API proxy 502 → live API down/rate-limited; React hydrates with empty
 *     data; canonical may end up pointing at /marthas-vineyard fallback.
 *   - Canonical mismatch → SPA route detected the URL as invalid (e.g. town
 *     not in static exports) and redirected client-side. Fix by updating
 *     data/exports/towns.json or business-types.json.
 *
 * Run: `npm run build:prerender` (preferred) or `npm run prerender` (if dist
 * already populated). Tune concurrency via PRERENDER_CONCURRENCY env var.
 */

const puppeteer = require('puppeteer');
const { createServer } = require('http');
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { join, dirname } = require('path');

const DIST_DIR = join(__dirname, '..', 'dist');
const SITE_URL = 'https://anythingitechmv.com';

/**
 * Read all URLs from sitemap.xml and convert to local paths.
 * The sitemap is the single source of truth for what gets prerendered —
 * sitemap and prerender stay in lockstep automatically.
 */
function readSitemapPaths() {
  const sitemapPath = join(DIST_DIR, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    throw new Error(`sitemap.xml not found at ${sitemapPath}. Run scripts/generate-sitemap.cjs first.`);
  }
  const xml = readFileSync(sitemapPath, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  const paths = urls.map(url => {
    const u = new URL(url);
    return u.pathname || '/';
  });
  // Dedupe and sort (root first)
  return [...new Set(paths)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
}

const ROUTES = readSitemapPaths();
console.log(`Loaded ${ROUTES.length} routes from sitemap.xml`);

const PORT = 3456;
// Where to proxy /api/* during prerender — use prod by default since prerender
// runs after deploy or against the live API. Override with PRERENDER_API_BASE.
const API_PROXY_BASE = process.env.PRERENDER_API_BASE || 'https://anythingitechmv.com';

// Simple static file server with /api/* proxy to production for SPA data needs
function createStaticServer() {
  return createServer(async (req, res) => {
    // Proxy /api/* to the upstream so the React app can hydrate with real data
    if (req.url.startsWith('/api/')) {
      try {
        const upstream = await fetch(`${API_PROXY_BASE}${req.url}`, {
          headers: { 'User-Agent': 'prerender-proxy/1.0' },
        });
        const body = await upstream.arrayBuffer();
        const headers = {};
        upstream.headers.forEach((value, key) => {
          if (key !== 'transfer-encoding' && key !== 'content-encoding') {
            headers[key] = value;
          }
        });
        res.writeHead(upstream.status, headers);
        res.end(Buffer.from(body));
      } catch (err) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'proxy_failed', message: err.message }));
      }
      return;
    }

    let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
    if (!filePath.includes('.') || !existsSync(filePath)) {
      filePath = join(DIST_DIR, 'index.html');
    }

    try {
      const content = readFileSync(filePath);
      const ext = filePath.split('.').pop();
      const mimeTypes = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'xml': 'application/xml',
        'txt': 'text/plain',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(content);
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

const CONCURRENCY = parseInt(process.env.PRERENDER_CONCURRENCY || '4', 10);

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    // Small settle delay for any trailing async React effects (SEO writes, JSON-LD).
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 600)));

    const html = await page.content();
    const outputPath = route === '/'
      ? join(DIST_DIR, 'index.html')
      : join(DIST_DIR, route, 'index.html');
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);

    // Validation: extract canonical and verify it matches the route we just prerendered.
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    const expected = `${SITE_URL}${route}`;
    let warning = null;
    if (!canonical) {
      warning = 'no canonical tag';
    } else if (canonical !== expected) {
      warning = `canonical mismatch: got ${canonical}, expected ${expected}`;
    }
    return { route, canonical, warning };
  } finally {
    await page.close();
  }
}

async function prerender() {
  console.log('Starting pre-render process...');
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Static server running on http://localhost:${PORT}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let successCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  const errors = [];
  const warnings = [];
  let cursor = 0;

  async function worker(workerId) {
    while (true) {
      const idx = cursor++;
      if (idx >= ROUTES.length) return;
      const route = ROUTES[idx];
      try {
        const { warning } = await prerenderRoute(browser, route);
        successCount++;
        if (warning) {
          warningCount++;
          warnings.push({ route, warning });
        }
        if (idx % 25 === 0 || idx === ROUTES.length - 1) {
          process.stdout.write(`  [${idx + 1}/${ROUTES.length}] ${route}${warning ? ' ⚠ ' + warning : ''}\n`);
        }
      } catch (error) {
        errorCount++;
        errors.push({ route, error: error.message });
        process.stdout.write(`  ✗ ${route}: ${error.message}\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  await browser.close();
  server.close();

  console.log(`\nPre-render complete: ${successCount} ok, ${warningCount} warnings, ${errorCount} failed`);
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.slice(0, 20).forEach(w => console.log(`  ${w.route}: ${w.warning}`));
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.slice(0, 20).forEach(e => console.log(`  ${e.route}: ${e.error}`));
    if (errors.length > 20) console.log(`  ... and ${errors.length - 20} more`);
    process.exit(1);
  }
}

prerender().catch(err => {
  console.error('Pre-render failed:', err);
  process.exit(1);
});

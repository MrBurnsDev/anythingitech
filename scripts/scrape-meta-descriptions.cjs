#!/usr/bin/env node
/**
 * Scrape meta descriptions from each business's own website and store them
 * in the registry DB (`businesses.meta_description`). Also captures
 * `homepage_title` when available.
 *
 * Why: many businesses currently carry templated descriptions in
 * `short_description` (e.g. "X is a restaurant in Y, known for quality cuisine"),
 * which Google's quality systems treat as low-value auto-generated content.
 * The fix is to surface each business's own authored meta description in the
 * directory pages. This script populates the `meta_description` column; the
 * export pipeline (scripts/export-directory-data.js) prefers it over the
 * templated `short_description` when present.
 *
 * Usage:
 *   node scripts/scrape-meta-descriptions.cjs                # dry run, missing only
 *   node scripts/scrape-meta-descriptions.cjs --apply        # write to DB
 *   node scripts/scrape-meta-descriptions.cjs --apply --refresh  # re-scrape everything
 *   node scripts/scrape-meta-descriptions.cjs --limit 20     # only first 20 (testing)
 *
 * Report written to: data/exports/meta-scrape-report.json
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'mv_registry.db');
const REPORT_PATH = path.join(ROOT, 'data', 'exports', 'meta-scrape-report.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REFRESH = args.includes('--refresh');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? parseInt(args[i + 1], 10) : Infinity;
})();

const CONCURRENCY = 10;
const TIMEOUT_MS = 10000;
const MAX_LEN = 320;
// Use a real browser UA. A custom bot UA gets rejected (403, captcha, or
// served noindex stubs) by many small-business hosts — especially SiteGround,
// Wix, Squarespace, GoDaddy, and Cloudflare-fronted sites. Since we're only
// fetching the homepage HTML each site publishes to anyone with a browser
// and we identify ourselves in the X-Identify header below, this is fine.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
}

// Extract the content="..." value from a meta tag's attribute string,
// regardless of attribute order. Handles both single and double quotes.
function extractContentAttr(tag) {
  const m = tag.match(/\bcontent\s*=\s*"([^"]*)"/i) || tag.match(/\bcontent\s*=\s*'([^']*)'/i);
  return m ? m[1] : null;
}

function extractMetaByAttr(html, attrName, attrValue) {
  // Match <meta ... attrName="attrValue" ... > regardless of attribute order
  const re = new RegExp(
    `<meta\\b[^>]*\\b${attrName}\\s*=\\s*["']${attrValue}["'][^>]*>`,
    'gi'
  );
  for (const m of html.matchAll(re)) {
    const content = extractContentAttr(m[0]);
    if (content) return decodeEntities(content.trim());
  }
  return null;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

function normalizeWhitespace(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function looksLikeJunk(desc) {
  if (!desc) return true;
  const d = desc.trim();
  if (d.length < 20) return true;
  // Common defaults from CMS templates / parked pages
  const junkPatterns = [
    /just another wordpress site/i,
    /domain (is )?for sale/i,
    /this domain (is|may be) for sale/i,
    /buy this domain/i,
    /^under construction/i,
    /^coming soon/i,
    /^home$/i,
    /your wordpress home/i,
    /^website builder/i,
  ];
  return junkPatterns.some((p) => p.test(d));
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function normalizeUrl(raw) {
  if (!raw) return null;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try {
    // Validate
    return new URL(u).toString();
  } catch {
    return null;
  }
}

async function scrapeOne(business) {
  const url = normalizeUrl(business.website);
  if (!url) {
    return { id: business.id, status: 'skip', reason: 'invalid website url' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // Soft self-identification so site owners can identify and contact us
        'X-Identify': 'AnythingItechMV directory crawler; https://anythingitechmv.com/about',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { id: business.id, status: 'http_error', reason: `HTTP ${res.status}`, url };
    }

    // Reject if redirected to an obvious parking/for-sale page. Many real
    // businesses legitimately host on third-party platforms (Indielite,
    // Squarespace, Shopify, Square, Wix, etc.), so we only block known
    // domain-parking and reseller hosts, not every cross-domain hop.
    const finalHost = extractDomain(res.url) || '';
    const PARKED_HOSTS = [
      'sedo.com', 'sedoparking.com', 'godaddy.com', 'dan.com',
      'afternic.com', 'parkingcrew.net', 'bodis.com', 'hugedomains.com',
      'domain.com', 'namecheap.com',
    ];
    if (PARKED_HOSTS.some((h) => finalHost === h || finalHost.endsWith('.' + h))) {
      return {
        id: business.id,
        status: 'parked_domain',
        reason: `parked at ${finalHost}`,
        url,
      };
    }

    const ct = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(ct)) {
      return { id: business.id, status: 'not_html', reason: ct, url };
    }

    const html = await res.text();

    const metaDesc = extractMetaByAttr(html, 'name', 'description');
    const ogDesc = extractMetaByAttr(html, 'property', 'og:description');
    const twitterDesc = extractMetaByAttr(html, 'name', 'twitter:description');
    const title = extractTitle(html);

    let chosen = metaDesc || ogDesc || twitterDesc;
    if (chosen) chosen = normalizeWhitespace(chosen).slice(0, MAX_LEN);

    if (!chosen) {
      return { id: business.id, status: 'no_meta', url };
    }

    if (looksLikeJunk(chosen)) {
      return { id: business.id, status: 'junk_meta', meta: chosen, url };
    }

    return {
      id: business.id,
      status: 'ok',
      meta: chosen,
      source: metaDesc ? 'meta_description' : ogDesc ? 'og_description' : 'twitter_description',
      title: title ? normalizeWhitespace(title).slice(0, 200) : null,
      url,
    };
  } catch (err) {
    clearTimeout(timer);
    const msg = err.name === 'AbortError' ? 'timeout' : err.message || 'fetch error';
    return { id: business.id, status: 'fetch_error', reason: msg, url };
  }
}

async function runWithConcurrency(items, fn, limit) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  const total = items.length;

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
      done++;
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`  ...${done}/${total}\n`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

async function main() {
  console.log('='.repeat(64));
  console.log('Meta-description scraper');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY RUN'}${REFRESH ? ' + REFRESH' : ''}`);
  console.log('='.repeat(64));

  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found: ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: !APPLY });

  // Select candidates. Default: only rows that are publishable and missing meta.
  // --refresh: re-scrape even rows that already have meta_description.
  const where = [
    "website IS NOT NULL",
    "TRIM(website) != ''",
    "COALESCE(is_duplicate, 0) = 0",
    "COALESCE(suppress_from_directory, 0) = 0",
    "business_status IN ('active', 'uncertain', 'unknown')",
  ];
  if (!REFRESH) {
    where.push("(meta_description IS NULL OR TRIM(meta_description) = '')");
  }

  const sql = `SELECT id, business_name, website, meta_description
               FROM businesses
               WHERE ${where.join(' AND ')}
               ORDER BY id`;
  const rows = db.prepare(sql).all().slice(0, LIMIT);
  console.log(`Candidates: ${rows.length}`);
  if (rows.length === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  const t0 = Date.now();
  const results = await runWithConcurrency(rows, scrapeOne, CONCURRENCY);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nScraped ${rows.length} sites in ${elapsed}s`);

  // Summarize
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log('\nResults by status:');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  // Write updates
  const okResults = results.filter((r) => r.status === 'ok');
  if (APPLY && okResults.length > 0) {
    const upd = db.prepare(
      `UPDATE businesses
         SET meta_description = ?,
             homepage_title = COALESCE(?, homepage_title),
             updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );
    const tx = db.transaction((items) => {
      for (const r of items) upd.run(r.meta, r.title, r.id);
    });
    tx(okResults);
    console.log(`\nWrote ${okResults.length} rows to DB`);
  } else if (!APPLY) {
    console.log(`\nDry run — would update ${okResults.length} rows. Re-run with --apply to write.`);
  }

  // Write report
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const businessNameById = new Map(rows.map((r) => [r.id, r.business_name]));
  const report = {
    generated_at: new Date().toISOString(),
    apply: APPLY,
    refresh: REFRESH,
    counts,
    elapsed_seconds: parseFloat(elapsed),
    results: results.map((r) => ({
      id: r.id,
      name: businessNameById.get(r.id),
      ...r,
    })),
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

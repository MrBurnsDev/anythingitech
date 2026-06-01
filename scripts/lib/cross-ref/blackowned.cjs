/**
 * BlackOwnedMV directory parser.
 * https://blackownedmv.com
 *
 * The Wix front-end of blackownedmv.com is a JS-rendered SPA with no business
 * data in the SSR HTML. The publisher provides an annual PDF at
 *   https://www.blackownedmv.com/_files/ugd/48e65a_7944e4ae852d422b8e8acfd4c7d07554.pdf
 * which is the authoritative directory (the "BOB 2025" issue at the time of
 * writing).
 *
 * Parsing strategy:
 *   1. Download the PDF and extract its text with `pdftotext -layout`.
 *      pdftotext from poppler must be installed (brew install poppler).
 *   2. The first 3 pages are an INDEX listing every business name followed by
 *      a page number. We parse these to get the canonical business list.
 *   3. We then scan the rest of the document for website-shaped tokens
 *      (foo.com / foo.org / .net / .biz) and associate each website with the
 *      nearest preceding business name from the index. The association isn't
 *      perfect but is good enough to populate website for ~60% of entries,
 *      which is sufficient for Tier 1 matching against our DB.
 *
 * The PDF URL changes year-to-year (yearly issue). We hardcode the current
 * URL; bump it when a new issue is released. If the URL changes mid-cycle,
 * pass `--blackowned-pdf <url>` to the entry script.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_PDF_URL =
  'https://www.blackownedmv.com/_files/ugd/48e65a_7944e4ae852d422b8e8acfd4c7d07554.pdf';

const CACHE_DIR = path.join(__dirname, '..', '..', '..', 'data', 'imports', 'blackownedmv');

// Words that look like business names in the index but are actually category
// or section headers — filter them out.
const SECTION_HEADERS = new Set([
  'shop', 'eat', 'stay', 'art & culture', 'health, beauty & self care',
  'realtors', 'event/party planning', 'private chefs & catering',
  'home & interior', 'bipoc events', 'more to explore',
  'index',
  'shop‌', 'eat‌', 'stay‌',
]);

// Zero-width characters clutter the PDF text. Strip them.
// U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+FEFF BOM, U+00A0 NBSP
const ZW_RE = /[​‌‍﻿ ]/g;

function clean(s) {
  if (!s) return '';
  return s
    .replace(ZW_RE, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Same as clean but preserves multiple spaces (for index-line parsing where
// the 2+ spaces between name and page number are the separator).
function cleanPreserveSpaces(s) {
  if (!s) return '';
  return s
    .replace(ZW_RE, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\f/g, '')
    .replace(/[ \t]+/g, (m) => m) // keep runs
    .trimEnd();
}

async function downloadPdf(pdfUrl, dest) {
  // eslint-disable-next-line no-console
  console.log(`  blackowned: downloading PDF…`);
  const res = await fetch(pdfUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`PDF HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return dest;
}

function extractText(pdfPath, txtPath) {
  try {
    execSync(`pdftotext -layout ${JSON.stringify(pdfPath)} ${JSON.stringify(txtPath)}`, {
      stdio: 'pipe',
    });
  } catch (err) {
    throw new Error(
      `pdftotext failed. Install poppler with: brew install poppler\n${err.message}`
    );
  }
  return fs.readFileSync(txtPath, 'utf8');
}

// Parse an "index segment" like:
//   "Biscuits                                41"
//   "DaSilva, Jennifer B.                 26-27"
// into { name, page }. Operates on whitespace-preserved text (just ZW stripped).
function parseIndexSegment(segment) {
  // Strip only ZW chars; keep multi-space gaps.
  const s = segment.replace(ZW_RE, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\f/g, '').trimEnd();
  if (!s.trim()) return null;

  // Reject section header lines (collapsed compare).
  const collapsed = s.replace(/\s+/g, ' ').trim().toLowerCase();
  if (SECTION_HEADERS.has(collapsed)) return null;

  // <name><2+ spaces><page number>, where page may be like 26-27.
  const m = s.match(/^\s*(.+?)\s{2,}(\d{1,3}(?:-\d{1,3})?)\s*$/);
  if (!m) return null;

  const name = m[1].replace(/\s+/g, ' ').trim();
  const page = m[2];

  if (name.length < 3) return null;
  // Reject all-caps short banners (e.g. "SHOP", "EAT") but allow brand-style
  // mixed-case names with punctuation.
  if (/^[A-Z& ]+$/.test(name) && name.split(' ').length <= 3) return null;

  return { name, page };
}

// Match "<name>\s{2,}<page>" as it appears in the layout. Two-column lines
// contain two such matches. The right edge of a match (\s|$) lets us walk
// forward to the next name without splitting first.
const INDEX_MATCH_RE =
  /(?:^|\s{2,})([^\s\d][^\d]*?[A-Za-z.])\s{2,}(\d{1,3}(?:-\d{1,3})?)(?=\s|$)/g;

function parseIndexFromLines(lines) {
  const seen = new Set();
  const entries = [];

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const stripped = rawLine.replace(ZW_RE, '').replace(/\f/g, '');

    INDEX_MATCH_RE.lastIndex = 0;
    let m;
    while ((m = INDEX_MATCH_RE.exec(stripped)) !== null) {
      const name = m[1].replace(/\s+/g, ' ').trim();
      const page = m[2];

      if (name.length < 3) continue;
      // Skip all-caps short banners
      if (/^[A-Z& ,]+$/.test(name) && name.split(' ').length <= 4) continue;
      // Skip known section headers
      if (SECTION_HEADERS.has(name.toLowerCase())) continue;

      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ name, page });
    }
  }

  return entries;
}

// Sniff out website-shaped tokens. Capture position so we can associate by
// proximity later.
function extractWebsites(text) {
  // Match foo.com, foo.org, foo.net, foo.co — possibly preceded by www.,
  // possibly with hyphens. Reject very common non-business hits
  // (gmail.com, instagram.com) so they don't dominate.
  const re = /(?:https?:\/\/|www\.)?([a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\.(?:com|org|net|co|biz))\b/gi;
  const skip = new Set([
    'gmail.com', 'instagram.com', 'facebook.com', 'twitter.com',
    'x.com', 'youtube.com', 'tiktok.com',
    'mvy.com', 'vineyardgazette.com', 'gomarthasvineyard.com',
    'wix.com', 'wixsite.com', 'squarespace.com', 'compass.com',
  ]);
  const hits = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const host = m[1].toLowerCase();
    if (skip.has(host)) continue;
    // Skip if shorter than reasonable business domain (likely truncation)
    if (host.length < 6) continue;
    hits.push({ host, index: m.index });
  }
  return hits;
}

// For each business name, find the nearest website mention in the body text.
// Heuristic: search for the business name (or first word) starting from the
// END of the index section. The first website-token after that location is
// our candidate.
function associateWebsites(text, entries, bodyStartOffset) {
  const websites = extractWebsites(text);
  const bodyText = text.slice(bodyStartOffset);
  const offsetBase = bodyStartOffset;

  for (const e of entries) {
    e.website = null;

    // First-word match: find where the body first mentions the business name.
    // Use first 2 words for better specificity.
    const tokens = e.name.split(' ').filter((t) => t.length >= 3);
    if (tokens.length === 0) continue;
    const probe = tokens.slice(0, 2).join(' ');
    const escaped = probe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + escaped, 'i');
    const match = bodyText.match(re);
    if (!match) continue;
    const nameIdx = offsetBase + match.index;

    // Find first website hit after this index, within 800 chars.
    let bestIdx = Infinity;
    let bestHost = null;
    for (const w of websites) {
      if (w.index >= nameIdx && w.index - nameIdx < 800) {
        if (w.index < bestIdx) {
          bestIdx = w.index;
          bestHost = w.host;
        }
      }
    }
    if (bestHost) e.website = bestHost;
  }
}

async function crawl(opts = {}) {
  const pdfUrl = opts.pdfUrl || DEFAULT_PDF_URL;
  const filename = pdfUrl.split('/').pop().split('?')[0] || 'bob.pdf';
  const pdfPath = path.join(CACHE_DIR, filename);
  const txtPath = pdfPath.replace(/\.pdf$/i, '.txt');

  // Cache: skip download if already present and < 24h old. The PDF is large
  // (~400MB) and the publisher posts a new version yearly.
  let needDownload = !fs.existsSync(pdfPath);
  if (!needDownload) {
    const ageHours = (Date.now() - fs.statSync(pdfPath).mtimeMs) / 1000 / 3600;
    needDownload = ageHours > 24;
  }
  if (needDownload) {
    await downloadPdf(pdfUrl, pdfPath);
  }

  let text;
  if (fs.existsSync(txtPath) && fs.statSync(txtPath).mtimeMs >= fs.statSync(pdfPath).mtimeMs) {
    text = fs.readFileSync(txtPath, 'utf8');
  } else {
    text = extractText(pdfPath, txtPath);
  }

  // The index occupies the start of the document. Use the FOUNDER'S LETTER
  // marker (or "Founder's Letter") to find where the index ends.
  const founderRe = /FOUNDER'?S\s+LETTER/i;
  const fm = text.match(founderRe);
  const indexEnd = fm ? fm.index : Math.floor(text.length * 0.05);
  const indexText = text.slice(0, indexEnd);
  const bodyStartOffset = indexEnd;

  const lines = indexText.split(/\r?\n/);
  const entries = parseIndexFromLines(lines);

  associateWebsites(text, entries, bodyStartOffset);

  // BlackOwnedMV doesn't always tag towns on each listing — towns appear in
  // body text near each profile. We could parse them out heuristically but
  // the matcher already accepts no-town (just falls to Tier-2 review-queue),
  // and per the spec we WANT all blackowned non-website matches in review.
  // So we leave town null and let the matcher do the right thing.
  return entries.map((e) => ({
    source: 'blackOwned',
    name: e.name,
    town: null,
    website: e.website ? 'https://' + e.website : null,
    external_url: 'https://blackownedmv.com', // no per-business deep link
    page: e.page,
  }));
}

module.exports = { crawl };

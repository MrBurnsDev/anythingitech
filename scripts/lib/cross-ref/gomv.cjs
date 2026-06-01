/**
 * Go Martha's Vineyard directory crawler.
 * https://www.gomarthasvineyard.com/directory
 *
 * Drupal-based site. The /directory index links to ~20 leaf category pages
 * like /directory/accommodations/hotels-motels-resorts. Each leaf page lists
 * businesses inline with name, address, phone, and (when present) website.
 *
 * We:
 *   1. Fetch /directory index, harvest leaf category URLs (paths with 2 segments)
 *   2. Fetch each leaf page, extract listings from views-row-inner blocks
 *   3. Dedupe by detail URL or by name+town
 *
 * Listing structure (Drupal Views):
 *   <div class="views-row-inner">
 *     <div class="field-title"><a href="/directory/slug">Business Name</a></div>
 *     <div class="fr field-address"><i.../>123 Main St, Edgartown</div>
 *     <div class="fr field-telephone">...508-627-7000</div>
 *     <div class="fr field-website"><a href="https://example.com">...</a></div>
 *   </div>
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const INDEX_URL = 'https://www.gomarthasvineyard.com/directory';
const BASE = 'https://www.gomarthasvineyard.com';

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function harvestLeafCategoryUrls(html) {
  // /directory/<cat>/<subcat> patterns are the leaf pages with listings.
  // Top-level /directory/<cat> pages just link to subcategories.
  const re = /href="(\/directory\/[a-z0-9-]+\/[a-z0-9-]+)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return Array.from(set).map((p) => BASE + p);
}

function parseListings(html, sourceUrl) {
  // Split on views-row-inner: each chunk after the first is one listing.
  const chunks = html.split('<div class="views-row-inner">');
  const records = [];
  for (let i = 1; i < chunks.length; i++) {
    // Limit each chunk to a reasonable size to avoid bleeding into the next.
    const card = chunks[i].slice(0, 6000);

    // Title and detail URL
    const titleMatch = card.match(/field-title[\s\S]*?<a[^>]+href="(\/directory\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;
    const path = titleMatch[1];
    const name = stripTags(titleMatch[2]);
    if (!name) continue;

    // Address — strip leading icon span and split by comma; last segment usually the town
    let town = null;
    const addrMatch = card.match(/field-address[\s\S]*?<\/i>([^<]+)/);
    if (addrMatch) {
      const addr = stripTags(addrMatch[1]);
      const parts = addr.split(',').map((p) => p.trim()).filter(Boolean);
      // Listings here are island-only and use just "Street, Town" format.
      if (parts.length >= 2) town = parts[parts.length - 1];
    }

    // Website
    let website = null;
    const webMatch = card.match(/field-website[\s\S]*?<a[^>]+href="([^"]+)"/);
    if (webMatch) {
      // Strip the gomv referral query parameters
      const raw = webMatch[1].split('?')[0];
      if (!/^https?:\/\/(?:www\.)?gomarthasvineyard\.com|^https?:\/\/gomv\.com/i.test(raw)) {
        website = raw;
      }
    }

    // Phone
    let phone = null;
    const phoneMatch = card.match(/field-telephone[\s\S]*?<\/i>([^<]+)/);
    if (phoneMatch) {
      phone = stripTags(phoneMatch[1]).replace(/^\s*[+]?\s*/, '');
    }

    records.push({
      source: 'gomv',
      name,
      town,
      website,
      phone,
      external_url: BASE + path,
    });
  }
  return records;
}

async function crawl() {
  const indexHtml = await fetchHtml(INDEX_URL);
  const categories = harvestLeafCategoryUrls(indexHtml);
  const all = [];
  for (const catUrl of categories) {
    try {
      const html = await fetchHtml(catUrl);
      const records = parseListings(html, catUrl);
      all.push(...records);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`  gomv: skip ${catUrl}: ${err.message}`);
    }
  }

  // Dedupe by external_url (a business may appear in multiple subcategories).
  const seen = new Set();
  return all.filter((r) => {
    const key = r.external_url || `${r.name}|${r.town || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { crawl };

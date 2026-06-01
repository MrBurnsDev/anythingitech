/**
 * MV Chamber of Commerce member directory crawler.
 * https://business.mvy.com/memberdirectory  (GrowthZone CMS)
 *
 * The directory index page lists categories; each category page lists members
 * with deep links to per-business `Details/<slug>-<id>` pages.
 *
 * We:
 *   1. Fetch the category index page, harvest category URLs
 *   2. Fetch each category page, harvest member name/website/town from cards
 *   3. Dedupe by name+website
 *
 * We DON'T fetch each per-business Details page (would be ~1000 requests).
 * The category-listing card has enough data: name, town, member URL.
 *
 * NOTE: business.mvy.com returns HTTP 404 status code with valid HTML on the
 * directory index, a quirk of GrowthZone. We treat any response with HTML body
 * as a success regardless of status code.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const INDEX_URL = 'https://business.mvy.com/memberdirectory';
const BASE = 'https://business.mvy.com';

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
  // Ignore status: GrowthZone returns 404 with content. Trust the body.
  const text = await res.text();
  if (!text || text.length < 500) throw new Error(`Empty body from ${url}`);
  return text;
}

function harvestCategoryUrls(html) {
  // Category URLs look like:
  //   https://business.mvy.com/memberdirectory/Search/<slug>-<numericId>[?cid=<subcat>]
  // The `?cid=` variants are sub-category drilldowns whose listings are a
  // subset of the parent — fetching them all is wasteful and produces the
  // same memberships. Strip the query string and dedupe.
  const re = /href="(https?:\/\/business\.mvy\.com\/memberdirectory\/Search\/[^"#]+?)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const stripped = m[1].split('?')[0];
    set.add(stripped);
  }
  return Array.from(set);
}

// Each member card in the category page is roughly:
//   <li class="gz-listing ...">
//     <span class="mn-title"><a href="//business.mvy.com/memberdirectory/Details/slug-id">Business Name</a></span>
//     ...location...
//     <a class="mn-website-link" href="https://thebusiness.com">...</a>
//   </li>
// Each member is rendered as a GrowthZone "card" with schema.org microdata.
// We split the page on each card start so we can extract per-card cleanly.
// Cards begin at `<div class="card-header">` (one per business). Within each
// card, GrowthZone marks data with itemprop attributes:
//   itemprop="name"            -> business name
//   itemprop="addressLocality" -> town
//   itemprop="telephone"       -> phone
//   class="gz-card-website" anchor href -> website
//   detail URL: //business.mvy.com/memberdirectory/Details/<slug>
function parseCards(html) {
  const records = [];

  // Split into card-sized chunks. Use card-header sentinel; cards end at
  // either the next card-header or the categories list footer.
  const chunks = html.split('<div class="card-header">');
  for (let i = 1; i < chunks.length; i++) {
    // Cap each chunk at 4KB — cards aren't that big, and we don't want to
    // bleed into the next card if our delimiter regex misses something.
    const card = chunks[i].slice(0, 4000);

    // Name: prefer itemprop="name", fall back to detail-link text
    let name = null;
    const nameMatch = card.match(/itemprop="name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)
      || card.match(/itemprop="name"[^>]*>([\s\S]*?)</);
    if (nameMatch) name = stripTags(nameMatch[1]);
    if (!name) continue;

    // Detail URL
    let detailUrl = null;
    const detail = card.match(/href="(\/\/?business\.mvy\.com\/memberdirectory\/Details\/[^"#?]+)"/);
    if (detail) {
      detailUrl = detail[1].startsWith('//') ? 'https:' + detail[1] : detail[1];
    }

    // Town (addressLocality)
    let town = null;
    const townMatch = card.match(/itemprop="addressLocality"[^>]*>([^<]+)</);
    if (townMatch) town = stripTags(townMatch[1]);

    // Website: gz-card-website > a href
    let website = null;
    const webMatch = card.match(/gz-card-website[\s\S]*?<a[^>]+href="([^"]+)"/);
    if (webMatch) {
      const w = webMatch[1].trim();
      // Skip same-domain (chamber's internal redirector) URLs
      if (!/^https?:\/\/(?:www\.)?(?:business\.)?mvy\.com/i.test(w)) website = w;
    }

    records.push({
      source: 'chamber',
      name,
      town,
      website,
      external_url: detailUrl,
    });
  }

  return records;
}

async function crawl() {
  const indexHtml = await fetchHtml(INDEX_URL);
  const categories = harvestCategoryUrls(indexHtml);
  const all = [];
  // Sequential fetch — we're polite, ~25 category pages.
  for (const catUrl of categories) {
    try {
      const html = await fetchHtml(catUrl);
      const recs = parseCards(html);
      all.push(...recs);
    } catch (err) {
      // Skip individual category errors but continue.
      // eslint-disable-next-line no-console
      console.error(`  chamber: skip ${catUrl}: ${err.message}`);
    }
  }

  // Dedupe — businesses appear in multiple categories on the Chamber site.
  const seen = new Set();
  return all.filter((r) => {
    const key = r.external_url || `${r.name}|${r.website || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { crawl };

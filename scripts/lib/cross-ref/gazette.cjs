/**
 * Vineyard Gazette business directory crawler.
 * https://vineyardgazette.com/business-directory
 *
 * The Gazette is a Drupal site that renders every business on the directory
 * landing page itself, inside <ul> blocks of `<li class="views-row">` cards.
 * Town context comes from the nearest preceding `<h3>` (town name) within the
 * same category section.
 *
 * Each card looks like:
 *   <li class="views-row ...">
 *     <div class="views-field views-field-title">
 *       <h5 class="field-content">Aquila</h5>
 *     </div>
 *     <div class="views-field views-field-field-business-address">
 *       <div class="field-content">17 Aquinnah Cir, Aquinnah, MA 02535</div>
 *     </div>
 *     <div class="views-field views-field-field-website">
 *       <div class="field-content"><a href="https://aquilamv.square.site">...</a></div>
 *     </div>
 *     <div class="views-field views-field-field-phone">
 *       <div class="field-content"><a href="tel:+508-...">...</a></div>
 *     </div>
 *   </li>
 *
 * We extract: name, town (from address), website, phone. No external_url
 * exists for individual businesses — the Gazette doesn't deep-link.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const URL = 'https://vineyardgazette.com/business-directory';

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

// Pull town out of an address like "17 Aquinnah Cir, Aquinnah, MA 02535".
function townFromAddress(addr) {
  if (!addr) return null;
  const parts = addr.split(',').map((p) => p.trim());
  // Address shape: street, town, MA zip
  if (parts.length >= 2) return parts[parts.length - 2];
  return null;
}

async function fetchHtml() {
  const res = await fetch(URL, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Gazette HTTP ${res.status}`);
  return await res.text();
}

// Tokenize the page. The directory has two sections with different shapes:
//   1. "Restaurants" section — split by <h3>Town</h3> headers, cards under each
//   2. "Business Directory" (services) section — split by <h4>Category</h4>,
//      cards are island-wide and lack town context in their heading
// We track <h3> as town context for section 1, and <h4> as a *section reset*
// (clears town) so cards in section 2 fall back to parsing town from the
// address.
function tokenize(html) {
  const tokens = [];
  const re = /<h3>([^<]+)<\/h3>|<h4>([\s\S]*?)<\/h4>|<li class="views-row[^"]*">([\s\S]*?)<\/li>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) tokens.push({ kind: 'town', name: stripTags(m[1]) });
    else if (m[2]) tokens.push({ kind: 'sectionReset' });
    else tokens.push({ kind: 'card', html: m[3] });
  }
  return tokens;
}

function fieldBlock(card, field) {
  // Extract the inner HTML of <div class="views-field views-field-<field>">...</div>.
  // We use a depth-aware extractor to avoid the trailing </div> mismatch when
  // the field contains nested divs.
  const start = card.search(new RegExp(`views-field-${field}\\b`));
  if (start === -1) return null;
  // Walk forward and find the matching close of this div.
  let i = card.indexOf('>', start);
  if (i === -1) return null;
  let depth = 1;
  let j = i + 1;
  while (j < card.length && depth > 0) {
    const next = card.indexOf('<', j);
    if (next === -1) break;
    if (card.startsWith('<div', next)) {
      depth++;
      j = card.indexOf('>', next) + 1;
    } else if (card.startsWith('</div', next)) {
      depth--;
      j = card.indexOf('>', next) + 1;
    } else {
      j = next + 1;
    }
  }
  return card.slice(i + 1, j - '</div>'.length);
}

function parseCards(html) {
  const tokens = tokenize(html);
  const records = [];
  let currentTown = null;

  for (const tok of tokens) {
    if (tok.kind === 'town') {
      currentTown = tok.name;
      continue;
    }
    if (tok.kind === 'sectionReset') {
      currentTown = null;
      continue;
    }
    const card = tok.html;

    // Name from views-field-title > h5
    const titleBlock = fieldBlock(card, 'title');
    const name = (() => {
      if (!titleBlock) return null;
      const t = titleBlock.match(/<h5[^>]*>([\s\S]*?)<\/h5>/);
      return t ? stripTags(t[1]) : stripTags(titleBlock);
    })();
    if (!name) continue;

    // Address: try the explicit field first, then fall back to layout-2 form.
    let address = null;
    const addrBlock = fieldBlock(card, 'field-business-address');
    if (addrBlock) {
      address = stripTags(addrBlock);
    } else {
      // Layout 2: the card has bare <div><div>street, town, MA zip</div></div>
      // after the title. Use a heuristic: first all-text inner-div that
      // contains a comma and "MA".
      const bareDivRe = /<div>\s*<div>([^<]+)<\/div>\s*<\/div>/g;
      let mm;
      while ((mm = bareDivRe.exec(card)) !== null) {
        const txt = stripTags(mm[1]);
        if (/,\s*[A-Z][a-z]/.test(txt) && /\bMA\b/i.test(txt)) {
          address = txt;
          break;
        }
      }
    }

    // Website: scoped to the website field block; treat empty as null.
    const websiteBlock = fieldBlock(card, 'field-website');
    let website = null;
    if (websiteBlock) {
      const w = websiteBlock.match(/<a[^>]+href="([^"]+)"/);
      if (w && !/^tel:|^mailto:/i.test(w[1])) website = w[1].trim();
    }

    // Phone: scoped to phone field, tel: prefix.
    const phoneBlock = fieldBlock(card, 'field-phone');
    let phone = null;
    if (phoneBlock) {
      const p = phoneBlock.match(/href="tel:([^"]+)"/);
      if (p) phone = decodeURIComponent(p[1]).replace(/^\+/, '').trim();
    }

    // Prefer the address-parsed town when we have one, since it's always
    // correct. Fall back to the section header when address is missing.
    const addressTown = townFromAddress(address);
    records.push({
      source: 'gazette',
      name,
      town: addressTown || currentTown,
      website,
      phone,
      address,
      external_url: URL,
    });
  }

  // Dedupe by (name + town + website) — the Gazette lists the same business
  // under multiple categories.
  const seen = new Set();
  return records.filter((r) => {
    const key = `${r.name}|${r.town || ''}|${r.website || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function crawl() {
  const html = await fetchHtml();
  return parseCards(html);
}

module.exports = { crawl };

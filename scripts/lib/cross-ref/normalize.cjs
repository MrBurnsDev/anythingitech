/**
 * Normalization helpers shared by every directory crawler and the matcher.
 *
 * These intentionally throw away signal (case, punctuation, common suffixes)
 * so two strings that *should* identify the same business compare equal.
 * Conversely: do NOT add normalization rules that conflate genuinely distinct
 * businesses (e.g. don't strip numerals — "19 Prime" != "Prime").
 */

// Words appended to business names that don't help identify them.
// Order matters: longer phrases first so they match before single words.
const TRAILING_SUFFIXES = [
  /\bllc\b/i, /\binc\b/i, /\bincorporated\b/i, /\bcorp\b/i, /\bco\b/i,
  /\bltd\b/i, /\bpllc\b/i, /\bpc\b/i, /\bcompany\b/i,
];

const LOCATION_SUFFIXES = [
  /\bof\s+marthas?\s+vineyard\b/i,
  /\bof\s+the\s+vineyard\b/i,
  /\bmarthas?\s+vineyard\b/i,
  /\bvineyard\b\s*$/i,
  /\bmv\b/i,
];

const TOWN_NAMES_LOWER = new Set([
  'aquinnah', 'chilmark', 'edgartown', 'menemsha', 'oak bluffs',
  'tisbury', 'vineyard haven', 'west tisbury',
]);

// Map of various spellings/slugs to canonical town name.
const TOWN_ALIASES = {
  'aquinnah': 'Aquinnah',
  'chilmark': 'Chilmark',
  'edgartown': 'Edgartown',
  'menemsha': 'Menemsha',
  'oak bluffs': 'Oak Bluffs',
  'oakbluffs': 'Oak Bluffs',
  'ob': 'Oak Bluffs',
  'tisbury': 'Tisbury',
  'vineyard haven': 'Vineyard Haven',
  'vineyardhaven': 'Vineyard Haven',
  'vh': 'Vineyard Haven',
  'west tisbury': 'West Tisbury',
  'westtisbury': 'West Tisbury',
  'wt': 'West Tisbury',
};

/**
 * Normalize a business name for fuzzy comparison.
 * Strips:
 *   - case
 *   - punctuation (curly quotes too)
 *   - corporate suffixes (LLC, Inc, etc.)
 *   - "of Martha's Vineyard", trailing "MV", etc.
 * Returns the canonical comparison form (lowercase, single-spaced).
 */
function normalizeName(input) {
  if (!input) return '';
  let s = String(input);

  // Decode common entities/quotes
  s = s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'");

  s = s.toLowerCase();

  // Strip trademark/registration symbols
  s = s.replace(/[®©™]/g, '');

  // Strip location suffixes BEFORE punctuation strip (they may include punctuation)
  for (const re of LOCATION_SUFFIXES) s = s.replace(re, '');

  // Strip corporate suffixes
  for (const re of TRAILING_SUFFIXES) s = s.replace(re, '');

  // Replace " & " with " and " for comparability
  s = s.replace(/\s+&\s+/g, ' and ');
  s = s.replace(/\+/g, ' and ');

  // Strip punctuation, collapse whitespace
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Normalize a town name to its canonical form ("Vineyard Haven", "Oak Bluffs",
 * etc.) or return null if we don't recognize it.
 */
function normalizeTown(input) {
  if (!input) return null;
  const lower = String(input).toLowerCase().trim();
  // Direct alias hit
  if (TOWN_ALIASES[lower]) return TOWN_ALIASES[lower];
  // Try collapsing spaces/dashes
  const collapsed = lower.replace(/[\s-]+/g, '');
  if (TOWN_ALIASES[collapsed]) return TOWN_ALIASES[collapsed];
  // Look for any known town as a substring
  for (const town of TOWN_NAMES_LOWER) {
    if (lower.includes(town)) return TOWN_ALIASES[town] || null;
  }
  return null;
}

/**
 * Extract the registrable domain from a URL (e.g. "https://www.foo.com/bar"
 * → "foo.com"). Returns null on parse failure.
 *
 * Edge cases:
 *   - Squarespace/Wix/Square subdomains (`foo.squarespace.com`,
 *     `foo.square.site`) are kept verbatim — we don't reduce to the platform
 *     domain because that would collide unrelated businesses.
 *   - Generic www. prefix is stripped.
 *   - Trailing slashes/paths/queries dropped.
 */
function extractDomain(url) {
  if (!url) return null;
  let raw = String(url).trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try {
    const u = new URL(raw);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    return host || null;
  } catch {
    return null;
  }
}

// Free hosting platforms — these are NOT the business's owned domain. Matching
// on them would falsely collide every business on the same platform.
// Treat businesses with these as "unmatchable via domain" and fall back to
// name+town matching.
const SHARED_PLATFORM_HOSTS = new Set([
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'tripadvisor.com', 'yelp.com', 'google.com', 'maps.google.com',
  'tumblr.com', 'wordpress.com', 'blogspot.com',
  'wix.com', 'wixsite.com', 'squarespace.com', 'square.site',
  'shopify.com', 'myshopify.com', 'bigcartel.com',
  'eventbrite.com', 'meetup.com', 'linktr.ee', 'beacons.ai',
]);

function isSharedPlatformDomain(host) {
  if (!host) return false;
  for (const platform of SHARED_PLATFORM_HOSTS) {
    if (host === platform || host.endsWith('.' + platform)) return true;
  }
  return false;
}

/**
 * Domain that's safe to use as a matching key. Returns null if the URL
 * resolves to a shared platform (Facebook, Squarespace, etc.) — callers must
 * fall back to name+town matching for those.
 */
function matchableDomain(url) {
  const host = extractDomain(url);
  if (!host) return null;
  if (isSharedPlatformDomain(host)) return null;
  return host;
}

module.exports = {
  normalizeName,
  normalizeTown,
  extractDomain,
  matchableDomain,
  isSharedPlatformDomain,
};

/**
 * Canonical taxonomy for the directory section.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for:
 *   - which town slugs are valid
 *   - which category slugs are valid (the "modern" 17, not the WP legacy 8)
 *   - the human-readable mapping from category display name → slug
 *
 * Anything that emits URLs or writes JSON files used by the SPA — sitemap,
 * prerender, export-directory — MUST source from here. Keeping multiple
 * hardcoded taxonomies in sync by hand is what caused the regression that
 * broke /marthas-vineyard/{house-garden-and-pets,wedding-and-event-services,
 * automotive-and-marine,...} on 2026-05-31.
 *
 * If you find a hardcoded slug list anywhere else in scripts/, that's a bug.
 * Replace it with `require('./lib/taxonomy.cjs').<thing>`.
 */

const MV_TOWNS = [
  { name: 'Aquinnah', slug: 'aquinnah' },
  { name: 'Chilmark', slug: 'chilmark' },
  { name: 'Edgartown', slug: 'edgartown' },
  { name: 'Menemsha', slug: 'menemsha' },
  { name: 'Oak Bluffs', slug: 'oak-bluffs' },
  { name: 'Tisbury', slug: 'tisbury' },
  { name: 'Vineyard Haven', slug: 'vineyard-haven' },
  { name: 'West Tisbury', slug: 'west-tisbury' },
];

const VALID_TOWN_SLUGS = new Set(MV_TOWNS.map((t) => t.slug));

// The modern canonical category slugs. Order is the display order.
//
// 2026-06-25: `lodging-and-tourism` was split into standalone `lodging`
// because hotels/inns/B&Bs are a distinct vertical from tourism attractions.
// `lodging-and-tourism` is preserved as a LEGACY slug (vercel.json redirects
// it to /lodging) but is not a canonical category here. Add a `tourism`
// entry only when the directory actually contains tour/attraction businesses.
const CATEGORIES = [
  { name: 'Arts & Entertainment', slug: 'arts-and-entertainment' },
  { name: 'Automotive & Marine', slug: 'automotive-and-marine' },
  { name: 'Banking, Finance & Insurance', slug: 'banking-finance-and-insurance' },
  { name: 'Beauty & Wellness', slug: 'beauty-and-wellness' },
  { name: 'Building & Construction', slug: 'building-and-construction' },
  { name: 'Business & Professional Services', slug: 'business-and-professional-services' },
  { name: 'Family, Community & Government', slug: 'family-community-government' },
  { name: 'Home Services & Trades', slug: 'home-services-and-trades' },
  { name: 'House, Garden & Pets', slug: 'house-garden-and-pets' },
  { name: 'Lodging', slug: 'lodging' },
  { name: 'Medical Services & Providers', slug: 'medical-services-and-providers' },
  { name: 'Real Estate & Rentals', slug: 'real-estate-and-rentals' },
  { name: 'Restaurants, Food & Beverages', slug: 'restaurants-food-beverages' },
  { name: 'Shopping & Specialty Retail', slug: 'shopping-and-specialty-retail' },
  { name: 'Sports & Recreation', slug: 'sports-and-recreation' },
  { name: 'Transportation & Utilities', slug: 'transportation-and-utilities' },
  { name: 'Wedding & Event Services', slug: 'wedding-and-event-services' },
];

const VALID_CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

// Map from the human-readable category as it appears in the SQLite registry
// to its URL slug. Compared case-insensitively.
const CATEGORY_TO_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.name.toLowerCase(), c.slug])
);

// Sets of slugs that have shipped at some point but are NO LONGER valid. If
// any of these appears in an output file, the build fails. This catches the
// class of regression that motivated this module.
//
// NOTE: `lodging` was previously stale (the registry used `lodging-and-tourism`),
// but as of 2026-06-25 `lodging` is the new canonical slug. The previous
// combined slug `lodging-and-tourism` is now the legacy entry.
const LEGACY_LEGACY_SLUGS = new Set([
  // Stale slugs that used to live in scripts/export-directory-data.js
  'restaurants', 'shopping', 'health-wellness',
  'contractors', 'bars-nightlife', 'professional-services', 'community',
  // Other short-forms we 308-redirect away from in vercel.json
  'lodging-tourism', 'lodging-and-tourism',
  'shopping-retail', 'shopping-specialty-retail',
  'arts-entertainment', 'automotive', 'automotive-marine',
  'beauty-wellness', 'building-construction',
  'business-professional-services', 'banking-finance-insurance',
  'real-estate-rentals', 'sports-recreation', 'transportation-utilities',
  'wedding-event-services', 'home-services-trades', 'house-garden-pets',
  'medical-services-providers', 'restaurant', 'restaurants',
]);

/**
 * Throw if the given slug is recognized as legacy/stale. Use in writers.
 */
function assertModernCategorySlug(slug, context = 'unknown') {
  if (!slug) return;
  if (LEGACY_LEGACY_SLUGS.has(slug)) {
    throw new Error(
      `[taxonomy] Stale category slug "${slug}" emitted from ${context}. ` +
      `Use one of: ${[...VALID_CATEGORY_SLUGS].join(', ')}.`
    );
  }
}

module.exports = {
  MV_TOWNS,
  VALID_TOWN_SLUGS,
  CATEGORIES,
  VALID_CATEGORY_SLUGS,
  CATEGORY_TO_SLUG,
  LEGACY_LEGACY_SLUGS,
  assertModernCategorySlug,
};

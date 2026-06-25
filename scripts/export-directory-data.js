#!/usr/bin/env node
/**
 * Export directory data from SQLite to JSON for frontend consumption.
 * Run: npm run export-directory
 */

import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  CATEGORIES,
  CATEGORY_TO_SLUG,
  VALID_CATEGORY_SLUGS,
  assertModernCategorySlug,
} from './lib/taxonomy.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'data', 'mv_registry.db');
const EXPORTS_DIR = join(ROOT, 'data', 'exports');

mkdirSync(EXPORTS_DIR, { recursive: true });

const db = new Database(DB_PATH, { readonly: true });

// Town configuration with SEO-friendly data
const TOWNS = [
  { slug: 'vineyard-haven', name: 'Vineyard Haven', region: 'down-island', description: 'The commercial heart of Martha\'s Vineyard, home to the ferry terminal and a vibrant Main Street with local shops, restaurants, and services.' },
  { slug: 'edgartown', name: 'Edgartown', region: 'down-island', description: 'Historic whaling captain homes, upscale boutiques, waterfront dining, and professional services define this elegant village.' },
  { slug: 'oak-bluffs', name: 'Oak Bluffs', region: 'down-island', description: 'Colorful gingerbread cottages, the Flying Horses carousel, and a lively harbor scene with diverse local businesses.' },
  { slug: 'west-tisbury', name: 'West Tisbury', region: 'up-island', description: 'Rolling farmland, the beloved Farmers Market, artisan shops, and a quintessential New England town center.' },
  { slug: 'chilmark', name: 'Chilmark', region: 'up-island', description: 'Quiet country roads, Lucy Vincent Beach, farm stands, and the iconic fishing village of Menemsha.' },
  { slug: 'aquinnah', name: 'Aquinnah', region: 'up-island', description: 'Home to the Gay Head Cliffs, the Wampanoag Tribe, artisan shops, and dramatic ocean views.' },
];

// SEO/UI metadata for each modern category, keyed by canonical slug from
// scripts/lib/taxonomy.cjs. ALWAYS use the modern 17 slugs. If you find
// yourself wanting to add a new slug, add it to taxonomy.cjs first.
const BUSINESS_TYPE_METADATA = {
  'arts-and-entertainment': {
    pluralName: 'Arts & Entertainment',
    icon: 'palette',
    description: 'Galleries, performance venues, museums, and creative spaces across Martha\'s Vineyard.',
    shortDescription: 'Galleries, music, theatre, and creative spaces',
    seoDescription: 'Find arts & entertainment on Martha\'s Vineyard. Browse galleries, museums, music venues, and performance spaces across all island towns.',
  },
  'automotive-and-marine': {
    pluralName: 'Automotive & Marine',
    icon: 'truck',
    description: 'Auto repair, marine services, boatyards, and transportation businesses serving the island.',
    shortDescription: 'Auto repair, marinas, and boat services',
    seoDescription: 'Find automotive and marine services on Martha\'s Vineyard. Auto repair, boatyards, and marine specialists across the island.',
  },
  'banking-finance-and-insurance': {
    pluralName: 'Banking, Finance & Insurance',
    icon: 'landmark',
    description: 'Banks, financial advisors, and insurance providers serving residents and businesses.',
    shortDescription: 'Banks, financial planning, and insurance',
    seoDescription: 'Find banking, finance, and insurance services on Martha\'s Vineyard. Local banks, financial planners, and insurance providers.',
  },
  'beauty-and-wellness': {
    pluralName: 'Beauty & Wellness',
    icon: 'heart-pulse',
    description: 'Salons, spas, yoga studios, and wellness providers serving the island community.',
    shortDescription: 'Salons, spas, yoga, and wellness',
    seoDescription: 'Find beauty and wellness services on Martha\'s Vineyard. Browse salons, spas, and wellness providers across all island towns.',
  },
  'building-and-construction': {
    pluralName: 'Building & Construction',
    icon: 'hammer',
    description: 'Builders, contractors, and construction trades serving Martha\'s Vineyard homeowners and businesses.',
    shortDescription: 'Builders, contractors, and trades',
    seoDescription: 'Find building and construction services on Martha\'s Vineyard. Local builders, contractors, and skilled trades.',
  },
  'business-and-professional-services': {
    pluralName: 'Business & Professional Services',
    icon: 'briefcase',
    description: 'Legal, accounting, consulting, and business support services on Martha\'s Vineyard.',
    shortDescription: 'Legal, accounting, and business services',
    seoDescription: 'Find professional services on Martha\'s Vineyard. Legal, accounting, and business service providers across the island.',
  },
  'family-community-government': {
    pluralName: 'Family, Community & Government',
    icon: 'landmark',
    description: 'Community organizations, nonprofits, and government services on Martha\'s Vineyard.',
    shortDescription: 'Community, nonprofits, and government',
    seoDescription: 'Find community, family, and government resources on Martha\'s Vineyard. Nonprofits, civic services, and local organizations.',
  },
  'home-services-and-trades': {
    pluralName: 'Home Services & Trades',
    icon: 'hammer',
    description: 'Home maintenance, repair, and trade services for island homeowners.',
    shortDescription: 'Home maintenance and trade services',
    seoDescription: 'Find home services and trades on Martha\'s Vineyard. Local handymen, painters, electricians, plumbers, and specialty trades.',
  },
  'house-garden-and-pets': {
    pluralName: 'House, Garden & Pets',
    icon: 'home',
    description: 'Garden centers, home goods, and pet services on Martha\'s Vineyard.',
    shortDescription: 'Garden centers, home goods, and pet services',
    seoDescription: 'Find house, garden, and pet services on Martha\'s Vineyard. Nurseries, home goods, and pet care across the island.',
  },
  lodging: {
    pluralName: 'Lodging',
    icon: 'bed',
    description: 'Historic inns, boutique hotels, B&Bs, and vacation rentals across Martha\'s Vineyard.',
    shortDescription: 'Hotels, inns, B&Bs, and vacation rentals',
    seoDescription: 'Find lodging on Martha\'s Vineyard. Browse hotels, inns, bed & breakfasts, and vacation rentals across all island towns.',
  },
  'medical-services-and-providers': {
    pluralName: 'Medical Services & Providers',
    icon: 'stethoscope',
    description: 'Doctors, dentists, physical therapy, and medical providers serving the island.',
    shortDescription: 'Medical, dental, and health providers',
    seoDescription: 'Find medical services and providers on Martha\'s Vineyard. Doctors, dentists, urgent care, and specialty health providers.',
  },
  'real-estate-and-rentals': {
    pluralName: 'Real Estate & Rentals',
    icon: 'home',
    description: 'Real estate agents, brokerages, and rental services across Martha\'s Vineyard.',
    shortDescription: 'Real estate agents and rentals',
    seoDescription: 'Find real estate and rentals on Martha\'s Vineyard. Local real estate agents, brokerages, and property managers.',
  },
  'restaurants-food-beverages': {
    pluralName: 'Restaurants, Food & Beverages',
    icon: 'utensils',
    description: 'From waterfront seafood shacks to fine dining establishments, Martha\'s Vineyard offers exceptional dining for every taste and occasion.',
    shortDescription: 'Restaurants, cafes, and food purveyors',
    seoDescription: 'Find restaurants on Martha\'s Vineyard. Browse local dining options from casual seafood to fine dining across all island towns.',
  },
  'shopping-and-specialty-retail': {
    pluralName: 'Shopping & Specialty Retail',
    icon: 'shopping-bag',
    description: 'Local boutiques, galleries, and specialty shops offer island-made goods and unique finds across Martha\'s Vineyard.',
    shortDescription: 'Boutiques, gift shops, and specialty retail',
    seoDescription: 'Find shopping on Martha\'s Vineyard. Browse local boutiques, galleries, gift shops, and specialty retail stores.',
  },
  'sports-and-recreation': {
    pluralName: 'Sports & Recreation',
    icon: 'palette',
    description: 'Recreation programs, outdoor sports, and active-living businesses on Martha\'s Vineyard.',
    shortDescription: 'Sports, fitness, and recreation',
    seoDescription: 'Find sports and recreation on Martha\'s Vineyard. Active living, outdoor sports, fitness, and recreation programs.',
  },
  'transportation-and-utilities': {
    pluralName: 'Transportation & Utilities',
    icon: 'truck',
    description: 'Transportation services, ferries, and utility providers serving Martha\'s Vineyard.',
    shortDescription: 'Transportation and utilities',
    seoDescription: 'Find transportation and utility services on Martha\'s Vineyard. Ferries, taxis, transport, and utility providers.',
  },
  'wedding-and-event-services': {
    pluralName: 'Wedding & Event Services',
    icon: 'palette',
    description: 'Wedding planners, florists, caterers, and event vendors across Martha\'s Vineyard.',
    shortDescription: 'Weddings, events, and celebrations',
    seoDescription: 'Find wedding and event services on Martha\'s Vineyard. Planners, florists, caterers, and venues for island events.',
  },
};

// Optional historical display strings still present in some DB rows. New rows
// should always use the canonical CATEGORIES name; this list is for backward
// compatibility only. Anything not listed here AND not in CATEGORIES will
// fall to 'other' and won't generate a category index page.
//
// One alias = one canonical slug. Don't double-map; the lookup is first-match.
const DB_CATEGORY_ALIASES = {
  'restaurants-food-beverages': ['Restaurant', 'Bar'],
  // `Lodging & Tourism` is the historical Chamber combined name and still
  // appears on some older rows. Map both forms to the new standalone slug.
  lodging: ['Inn', 'Hotel', 'Vacation Rental', 'B&B', 'Lodging & Tourism'],
  'shopping-and-specialty-retail': [
    'Retail',
    'Shopping & Retail',
    'Shopping',
    'Boutique',
    'Gallery',
  ],
  'medical-services-and-providers': [
    'Medical',
    'Healthcare',
  ],
  'beauty-and-wellness': ['Health & Wellness', 'Wellness', 'Spa', 'Salon'],
  'building-and-construction': [
    'Building & Construction',
    'House & Garden',
    'Construction',
  ],
  'home-services-and-trades': ['Contractors', 'Home Services'],
  'family-community-government': [
    'Community & Government',
    'Community',
    'Camp',
    'Nonprofit',
  ],
  'business-and-professional-services': ['Professional Services'],
};

// Build the BUSINESS_TYPES list from the canonical taxonomy. Order matches
// CATEGORIES (from taxonomy.cjs). Each entry is assertion-checked at module
// load time so we fail loud if metadata and taxonomy drift apart.
const BUSINESS_TYPES = CATEGORIES.map((cat) => {
  const meta = BUSINESS_TYPE_METADATA[cat.slug];
  if (!meta) {
    throw new Error(
      `[export-directory-data] Missing metadata for category slug "${cat.slug}". ` +
      `Either add it to BUSINESS_TYPE_METADATA above, or remove "${cat.slug}" from CATEGORIES in scripts/lib/taxonomy.cjs.`
    );
  }
  assertModernCategorySlug(cat.slug, 'export-directory BUSINESS_TYPES');
  return {
    slug: cat.slug,
    name: cat.name,
    pluralName: meta.pluralName,
    icon: meta.icon,
    // dbCategories maps DB-side display strings to this slug. The DB stores
    // category as a display string ("Restaurants, Food & Beverages"), so the
    // canonical CATEGORIES entry's `name` is always one acceptable value.
    // Aliases for additional historical display strings are layered on below.
    dbCategories: [cat.name, ...(DB_CATEGORY_ALIASES[cat.slug] || [])],
    description: meta.description,
    shortDescription: meta.shortDescription,
    seoDescription: meta.seoDescription,
  };
});

// Clean string utility
function cleanString(str) {
  if (!str) return null;
  return str.trim().replace(/^\n+|\n+$/g, '');
}

// Clean and validate address - remove social media contamination
function cleanAddress(str) {
  if (!str) return null;

  // Remove common contamination
  let cleaned = str
    .replace(/^(twitter|instagram|facebook|linkedin|youtube)\s*/gi, '')
    .replace(/\s*(twitter|instagram|facebook|linkedin|youtube)\s*/gi, ' ')
    .replace(/follow us\s*/gi, '')
    .replace(/contact us\s*/gi, '')
    .replace(/^com\s*/i, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to extract just the address portion
  // Look for patterns like "123 Street Name, Town, MA 02XXX"
  const addressMatch = cleaned.match(/(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir)?),?\s*([A-Za-z\s]+),?\s*(?:MA|Massachusetts)\s*(\d{5})?/i);

  if (addressMatch) {
    const street = addressMatch[1].trim();
    let city = addressMatch[2].trim();
    const zip = addressMatch[3] || '';

    // Clean city name
    city = city.replace(/\s+(ma|massachusetts).*$/i, '').trim();

    // Verify it's not contaminated
    if (!/instagram|facebook|twitter|linkedin|youtube|contact|follow/i.test(city)) {
      return `${street}, ${city}, MA${zip ? ' ' + zip : ''}`.trim();
    }
  }

  // If contaminated and can't extract clean address, return null
  if (/instagram|facebook|twitter|linkedin|youtube|contact us|follow us/i.test(cleaned)) {
    return null;
  }

  return cleaned || null;
}

// Clean and validate email
function cleanEmail(str) {
  if (!str) return null;

  // Extract email from potentially contaminated string
  const emailMatch = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    const email = emailMatch[0].toLowerCase();
    // Validate it's a real email
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return email;
    }
  }

  return null;
}

// Clean and validate phone
function cleanPhone(str) {
  if (!str) return null;

  // Extract digits
  const digits = str.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return null;
}

// Check if business name is valid (not a URL)
function isValidBusinessName(name) {
  if (!name) return false;
  const lower = name.toLowerCase().trim();
  if (lower.match(/^(https?:\/\/|www\.)/)) return false;
  if (lower.match(/^[a-z0-9._-]+\.(com|net|org|site|business\.site|square\.site)\/?$/i) && !name.includes(' ')) {
    return false;
  }
  if (name.length < 3) return false;
  return true;
}

// Generate slug from string
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Map database category (display string) to business type slug.
// Lookup order:
//   1. CATEGORY_TO_SLUG (shared taxonomy, case-insensitive)
//   2. dbCategories alias on each BUSINESS_TYPE (back-compat for legacy rows)
// Falls back to 'other' only when no mapping exists.
function toBusinessTypeSlug(category) {
  if (!category) return 'other';
  const fromShared = CATEGORY_TO_SLUG[String(category).toLowerCase().trim()];
  if (fromShared) return fromShared;
  for (const type of BUSINESS_TYPES) {
    if (type.dbCategories.includes(category)) return type.slug;
  }
  return 'other';
}

// Query active, publishable businesses
// Phase 2: Stricter filtering - only Tier A and B are public, respect suppress flag
const businessesQuery = `
  SELECT
    b.id,
    b.business_name,
    b.slug,
    b.category,
    b.subcategory,
    b.short_description,
    b.meta_description,
    b.town,
    b.full_address,
    b.street_address,
    b.phone,
    b.email,
    b.website,
    b.hours,
    b.seasonal_indicator,
    b.latitude,
    b.longitude,
    b.business_status,
    b.confidence_score,
    b.completeness_score,
    b.publish_tier,
    b.name_quality,
    b.map_ready,
    b.facebook_url,
    b.instagram_url,
    b.yelp_url,
    b.tripadvisor_url
  FROM businesses b
  WHERE b.is_duplicate = 0
    AND COALESCE(b.suppress_from_directory, 0) = 0
    AND b.business_status IN ('active', 'uncertain', 'unknown')
    AND (
      -- Phase 2: Only Tier A and B are publicly visible
      (b.publish_tier IS NOT NULL AND b.publish_tier IN ('A', 'B'))
      OR
      -- Fallback for records not yet scored by Phase 2
      (b.publish_tier IS NULL AND b.name_quality IN ('good', 'acceptable') AND b.confidence_score >= 50)
      OR
      -- Legacy fallback before any tier system
      (b.publish_tier IS NULL AND b.name_quality IS NULL AND b.confidence_score >= 0.6)
    )
  ORDER BY
    CASE b.publish_tier WHEN 'A' THEN 1 WHEN 'B' THEN 2 ELSE 3 END,
    b.completeness_score DESC,
    b.confidence_score DESC,
    b.business_name
`;

const rawBusinesses = db.prepare(businessesQuery).all();

// --- Memberships (external directory associations) ---
// Load all confirmed memberships and the source catalog. We assemble the
// per-business `memberships` map + `verifiedLocalBusiness` flag downstream
// when shaping each business record.
//
// `business_memberships` and `membership_sources` are created by
// migrations/009-business-memberships.sql.
let MEMBERSHIPS_BY_BUSINESS = new Map();
let SOURCE_CATALOG = new Map();
try {
  const sources = db.prepare(
    `SELECT source, display_label, source_url, counts_for_local FROM membership_sources`
  ).all();
  for (const s of sources) SOURCE_CATALOG.set(s.source, s);

  const rows = db.prepare(
    `SELECT business_id, source, listed, last_verified_at, external_url, external_name
       FROM business_memberships
      WHERE listed = 1`
  ).all();
  for (const r of rows) {
    if (!MEMBERSHIPS_BY_BUSINESS.has(r.business_id)) MEMBERSHIPS_BY_BUSINESS.set(r.business_id, []);
    MEMBERSHIPS_BY_BUSINESS.get(r.business_id).push(r);
  }
} catch (err) {
  // Migration may not have been applied yet — log and continue with empty memberships.
  console.warn('memberships table not available (ok on first export):', err.message);
}

// Build the per-business memberships object in the public-facing shape:
//   { chamber: { listed: true, lastVerified: "…", externalUrl: "…", externalName: "…" }, … }
// Plus a derived verifiedLocalBusiness boolean.
function buildMembershipsFor(businessId) {
  const memberships = {};
  let verifiedLocal = false;
  const rows = MEMBERSHIPS_BY_BUSINESS.get(businessId) || [];
  for (const r of rows) {
    memberships[r.source] = {
      listed: true,
      lastVerified: r.last_verified_at,
      externalUrl: r.external_url || null,
      externalName: r.external_name || null,
    };
    const cat = SOURCE_CATALOG.get(r.source);
    if (cat && cat.counts_for_local) verifiedLocal = true;
  }
  return { memberships, verifiedLocalBusiness: verifiedLocal };
}

// Process businesses
const processedBusinesses = rawBusinesses
  .filter(b => {
    // If publish_tier is set, trust it (already validated)
    if (b.publish_tier && ['A', 'B', 'C'].includes(b.publish_tier)) {
      return true;
    }
    // Otherwise, validate the name
    return isValidBusinessName(b.business_name);
  })
  .map(b => ({
    id: b.id,
    name: cleanString(b.business_name),
    slug: b.slug || toSlug(b.business_name + '-' + b.town),
    category: b.category || 'Other',
    businessType: toBusinessTypeSlug(b.category),
    // Prefer the business's own meta description (scraped from their website)
    // over our templated short_description. Templated descriptions are a
    // negative quality signal to Google; real meta is authored content.
    description: cleanString(b.meta_description) || cleanString(b.short_description),
    town: b.town,
    townSlug: toSlug(b.town),
    address: cleanAddress(b.street_address) || cleanAddress(b.full_address),
    phone: cleanPhone(b.phone),
    email: cleanEmail(b.email),
    website: cleanString(b.website),
    hours: cleanString(b.hours),
    seasonal: cleanString(b.seasonal_indicator),
    coordinates: (b.latitude && b.longitude && b.map_ready) ? { lat: b.latitude, lng: b.longitude } : null,
    mapReady: b.map_ready === 1,
    status: b.business_status,
    confidence: b.confidence_score,
    completeness: b.completeness_score,
    tier: b.publish_tier || null,
    social: {
      facebook: cleanString(b.facebook_url),
      instagram: cleanString(b.instagram_url),
      yelp: cleanString(b.yelp_url),
      tripadvisor: cleanString(b.tripadvisor_url),
    },
    // External directory memberships (cross-references). See
    // scripts/cross-reference-directories.cjs and migration 009.
    ...buildMembershipsFor(b.id),
  }));

// Generate town stats
const townStats = TOWNS.map(town => {
  const townBusinesses = processedBusinesses.filter(b => b.townSlug === town.slug);
  const typeBreakdown = {};
  BUSINESS_TYPES.forEach(type => {
    const count = townBusinesses.filter(b => b.businessType === type.slug).length;
    if (count > 0) typeBreakdown[type.slug] = count;
  });
  return {
    ...town,
    businessCount: townBusinesses.length,
    businessTypes: typeBreakdown,
    categories: [...new Set(townBusinesses.map(b => b.category))].sort(),
  };
});

// Generate business type stats
const businessTypeStats = BUSINESS_TYPES.map(type => {
  const typeBusinesses = processedBusinesses.filter(b => type.dbCategories.includes(b.category));
  const byTown = {};
  TOWNS.forEach(town => {
    const count = typeBusinesses.filter(b => b.townSlug === town.slug).length;
    if (count > 0) byTown[town.slug] = count;
  });
  return {
    slug: type.slug,
    name: type.name,
    pluralName: type.pluralName,
    icon: type.icon,
    description: type.description,
    shortDescription: type.shortDescription,
    seoDescription: type.seoDescription,
    businessCount: typeBusinesses.length,
    byTown,
  };
}).filter(t => t.businessCount > 0); // Only include types with businesses

// --- Stale-slug validator ------------------------------------------------
// Fail loudly if any output references a legacy/short-form category slug.
// This catches the class of regression we hit on 2026-05-31, where the
// exporter's hardcoded list drifted away from the canonical taxonomy.
{
  const offenders = [];
  for (const b of processedBusinesses) {
    if (b.businessType && b.businessType !== 'other' && !VALID_CATEGORY_SLUGS.has(b.businessType)) {
      offenders.push({ where: `businesses.json id=${b.id}`, slug: b.businessType });
    }
  }
  for (const t of businessTypeStats) {
    if (!VALID_CATEGORY_SLUGS.has(t.slug)) {
      offenders.push({ where: `business-types.json`, slug: t.slug });
    }
  }
  if (offenders.length > 0) {
    console.error('[export-directory-data] Stale category slugs detected. Refusing to write.');
    offenders.slice(0, 20).forEach((o) => console.error(`  ${o.where}: "${o.slug}"`));
    if (offenders.length > 20) console.error(`  …and ${offenders.length - 20} more`);
    process.exit(1);
  }
}

// Write exports
writeFileSync(
  join(EXPORTS_DIR, 'businesses.json'),
  JSON.stringify(processedBusinesses, null, 2)
);

writeFileSync(
  join(EXPORTS_DIR, 'towns.json'),
  JSON.stringify(townStats, null, 2)
);

writeFileSync(
  join(EXPORTS_DIR, 'business-types.json'),
  JSON.stringify(businessTypeStats, null, 2)
);

// Write summary
const summary = {
  exportedAt: new Date().toISOString(),
  totalBusinesses: processedBusinesses.length,
  byTown: Object.fromEntries(townStats.map(t => [t.slug, t.businessCount])),
  byType: Object.fromEntries(businessTypeStats.map(c => [c.slug, c.businessCount])),
  skippedTypes: BUSINESS_TYPES.filter(t => !businessTypeStats.find(s => s.slug === t.slug)).map(t => t.slug),
};

writeFileSync(
  join(EXPORTS_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('Export complete:');
console.log(`  - ${processedBusinesses.length} businesses`);
console.log(`  - ${townStats.length} towns`);
console.log(`  - ${businessTypeStats.length} business types`);
console.log(`  - Files written to ${EXPORTS_DIR}`);

db.close();

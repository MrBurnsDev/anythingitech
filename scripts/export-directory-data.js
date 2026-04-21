#!/usr/bin/env node
/**
 * Export directory data from SQLite to JSON for frontend consumption.
 * Run: npm run export-directory
 */

import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

// Normalized business type configuration
// Maps database categories to URL-friendly slugs and SEO descriptions
const BUSINESS_TYPES = [
  {
    slug: 'restaurants',
    name: 'Restaurants',
    pluralName: 'Restaurants',
    icon: 'utensils',
    dbCategories: ['Restaurant'],
    description: 'From waterfront seafood shacks to fine dining establishments, Martha\'s Vineyard offers exceptional dining for every taste and occasion.',
    shortDescription: 'Local restaurants and dining establishments',
    seoDescription: 'Find restaurants on Martha\'s Vineyard. Browse local dining options from casual seafood to fine dining across all island towns.',
  },
  {
    slug: 'lodging',
    name: 'Lodging',
    pluralName: 'Lodging',
    icon: 'bed',
    dbCategories: ['Inn', 'Hotel', 'Vacation Rental', 'Lodging', 'Lodging & Tourism'],
    description: 'Historic inns, boutique hotels, and vacation rentals provide comfortable accommodations for visitors to Martha\'s Vineyard year-round.',
    shortDescription: 'Hotels, inns, and vacation rentals',
    seoDescription: 'Find lodging on Martha\'s Vineyard. Browse hotels, inns, bed & breakfasts, and vacation rentals across all island towns.',
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    pluralName: 'Shopping & Retail',
    icon: 'shopping-bag',
    dbCategories: ['Retail', 'Shopping & Retail', 'Boutique', 'Gallery'],
    description: 'Local boutiques, galleries, and specialty shops offer island-made goods, curated collections, and unique finds throughout Martha\'s Vineyard.',
    shortDescription: 'Boutiques, galleries, and retail shops',
    seoDescription: 'Find shopping on Martha\'s Vineyard. Browse local boutiques, galleries, gift shops, and retail stores across all island towns.',
  },
  {
    slug: 'health-wellness',
    name: 'Health & Wellness',
    pluralName: 'Health & Wellness',
    icon: 'heart-pulse',
    dbCategories: ['Wellness', 'Medical'],
    description: 'Medical providers, wellness centers, spas, and health services supporting the Martha\'s Vineyard community year-round.',
    shortDescription: 'Medical, wellness, and health services',
    seoDescription: 'Find health and wellness services on Martha\'s Vineyard. Browse medical providers, spas, and wellness centers across all island towns.',
  },
  {
    slug: 'contractors',
    name: 'Contractors',
    pluralName: 'Contractors & Construction',
    icon: 'hammer',
    dbCategories: ['Building & Construction', 'House & Garden'],
    description: 'Skilled contractors, builders, and home service professionals serving homeowners and businesses across Martha\'s Vineyard.',
    shortDescription: 'Builders, contractors, and home services',
    seoDescription: 'Find contractors on Martha\'s Vineyard. Browse builders, construction companies, and home service professionals across all island towns.',
  },
  {
    slug: 'bars-nightlife',
    name: 'Bars & Nightlife',
    pluralName: 'Bars & Nightlife',
    icon: 'wine',
    dbCategories: ['Bar'],
    description: 'Bars, pubs, and nightlife venues offering drinks and entertainment on Martha\'s Vineyard.',
    shortDescription: 'Bars, pubs, and nightlife',
    seoDescription: 'Find bars and nightlife on Martha\'s Vineyard. Browse local bars, pubs, and entertainment venues across all island towns.',
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    pluralName: 'Professional Services',
    icon: 'briefcase',
    dbCategories: ['Professional Services'],
    description: 'Professional service providers including legal, financial, and business services on Martha\'s Vineyard.',
    shortDescription: 'Legal, financial, and business services',
    seoDescription: 'Find professional services on Martha\'s Vineyard. Browse legal, financial, and business service providers across all island towns.',
  },
  {
    slug: 'community',
    name: 'Community',
    pluralName: 'Community & Government',
    icon: 'landmark',
    dbCategories: ['Community & Government', 'Camp', 'Nonprofit'],
    description: 'Community organizations, government services, and nonprofits serving the Martha\'s Vineyard community.',
    shortDescription: 'Community organizations and services',
    seoDescription: 'Find community organizations on Martha\'s Vineyard. Browse nonprofits, government services, and community resources across all island towns.',
  },
];

// Clean string utility
function cleanString(str) {
  if (!str) return null;
  return str.trim().replace(/^\n+|\n+$/g, '');
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

// Map database category to business type slug
function toBusinessTypeSlug(category) {
  if (!category) return 'other';
  for (const type of BUSINESS_TYPES) {
    if (type.dbCategories.includes(category)) {
      return type.slug;
    }
  }
  return 'other';
}

// Query active, publishable businesses
// Uses publish_tier if available, otherwise falls back to confidence_score + name validation
const businessesQuery = `
  SELECT
    b.id,
    b.business_name,
    b.slug,
    b.category,
    b.subcategory,
    b.short_description,
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
    b.publish_tier,
    b.name_quality,
    b.facebook_url,
    b.instagram_url,
    b.yelp_url,
    b.tripadvisor_url
  FROM businesses b
  WHERE b.is_duplicate = 0
    AND b.business_status IN ('active', 'uncertain', 'unknown')
    AND (
      -- Use publish_tier if set (A, B, C are publishable)
      (b.publish_tier IS NOT NULL AND b.publish_tier IN ('A', 'B', 'C'))
      OR
      -- Fallback: good name quality + reasonable confidence
      (b.publish_tier IS NULL AND b.name_quality = 'good' AND b.confidence_score >= 30)
      OR
      -- Legacy fallback: no tier system columns yet
      (b.publish_tier IS NULL AND b.name_quality IS NULL AND b.confidence_score >= 0.5)
    )
  ORDER BY
    CASE b.publish_tier WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
    b.confidence_score DESC,
    b.business_name
`;

const rawBusinesses = db.prepare(businessesQuery).all();

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
    description: cleanString(b.short_description),
    town: b.town,
    townSlug: toSlug(b.town),
    address: cleanString(b.street_address || b.full_address),
    phone: cleanString(b.phone),
    email: cleanString(b.email),
    website: cleanString(b.website),
    hours: cleanString(b.hours),
    seasonal: cleanString(b.seasonal_indicator),
    coordinates: (b.latitude && b.longitude) ? { lat: b.latitude, lng: b.longitude } : null,
    status: b.business_status,
    confidence: b.confidence_score,
    tier: b.publish_tier || null,
    social: {
      facebook: cleanString(b.facebook_url),
      instagram: cleanString(b.instagram_url),
      yelp: cleanString(b.yelp_url),
      tripadvisor: cleanString(b.tripadvisor_url),
    },
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

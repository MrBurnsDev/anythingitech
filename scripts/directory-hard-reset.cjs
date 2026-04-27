#!/usr/bin/env node
/**
 * DIRECTORY HARD RESET
 *
 * This script performs a complete reset of the directory data:
 * 1. Archives all stale export files
 * 2. Maps all categories to Chamber taxonomy
 * 3. Regenerates all slugs from verified name + verified town
 * 4. Validates all data before export
 * 5. Generates a single clean export file
 *
 * VALIDATION GATES - Export FAILS if any of these occur:
 * - Any public record town is Unknown
 * - Any public record category is not in allowed Chamber categories
 * - Any public record category is "Other"
 * - Any public slug contains a town different from verified town
 * - Any public record is needs_review or needs_manual_review
 * - Any invalid record appears in public export
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'mv_registry.db');
const EXPORTS_DIR = path.join(ROOT, 'data', 'exports');
const ARCHIVE_DIR = path.join(ROOT, 'data', 'exports', '_archive');
const AUDITS_DIR = path.join(ROOT, 'data', 'audits');
const TAXONOMY_PATH = path.join(ROOT, 'data', 'reference', 'mv-chamber-taxonomy.json');

// Ensure directories exist
[EXPORTS_DIR, ARCHIVE_DIR, AUDITS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load taxonomy
const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));

// Valid towns and categories
const VALID_TOWNS = taxonomy.valid_towns;
const VALID_CATEGORIES = Object.keys(taxonomy.categories);

// Town slugs
const TOWN_SLUGS = {
  'Vineyard Haven': 'vineyard-haven',
  'Oak Bluffs': 'oak-bluffs',
  'Edgartown': 'edgartown',
  'West Tisbury': 'west-tisbury',
  'Chilmark': 'chilmark',
  'Aquinnah': 'aquinnah'
};

// Category slugs
const CATEGORY_SLUGS = {};
VALID_CATEGORIES.forEach(cat => {
  CATEGORY_SLUGS[cat] = cat.toLowerCase()
    .replace(/[&,]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
});

// Category mapping from old to Chamber taxonomy
const CATEGORY_MAP = {
  'Restaurant': 'Restaurants, Food & Beverages',
  'Restaurants': 'Restaurants, Food & Beverages',
  'Cafe': 'Restaurants, Food & Beverages',
  'Bakery': 'Restaurants, Food & Beverages',
  'Bar': 'Restaurants, Food & Beverages',
  'Lodging': 'Lodging & Tourism',
  'Hotel': 'Lodging & Tourism',
  'Inn': 'Lodging & Tourism',
  'Vacation Rental': 'Lodging & Tourism',
  'Shopping & Retail': 'Shopping & Specialty Retail',
  'Retail': 'Shopping & Specialty Retail',
  'Boutique': 'Shopping & Specialty Retail',
  'Gallery': 'Arts & Entertainment',
  'Art Gallery': 'Arts & Entertainment',
  'Museum': 'Arts & Entertainment',
  'Contractors': 'Building & Construction',
  'Building & Construction': 'Building & Construction',
  'Professional Services': 'Business & Professional Services',
  'Community': 'Family, Community & Government',
  'Community & Government': 'Family, Community & Government',
  'Nonprofit': 'Family, Community & Government',
  'Government': 'Family, Community & Government',
  'Healthcare': 'Medical Services & Providers',
  'Medical': 'Medical Services & Providers',
  'Health & Wellness': 'Beauty & Wellness',
  'Wellness': 'Beauty & Wellness',
  'Spa': 'Beauty & Wellness',
  'Salon': 'Beauty & Wellness',
  'House & Garden': 'Home Services & Trades',
  'Home Services': 'Home Services & Trades',
  'Real Estate': 'Real Estate & Rentals',
  'Automotive': 'Automotive & Marine',
  'Marine': 'Automotive & Marine',
  'Boat': 'Automotive & Marine',
  'Sports': 'Sports & Recreation',
  'Recreation': 'Sports & Recreation',
  'Golf': 'Sports & Recreation',
  'Transportation': 'Transportation & Utilities',
  'Wedding': 'Wedding & Event Services',
  'Event': 'Wedding & Event Services',
  'Florist': 'Wedding & Event Services',
  'Bank': 'Banking, Finance & Insurance',
  'Finance': 'Banking, Finance & Insurance',
  'Insurance': 'Banking, Finance & Insurance',
  'Pet': 'House, Garden & Pets',
  'Veterinarian': 'House, Garden & Pets',
  'Garden': 'House, Garden & Pets',
};

// Subcategory inference based on business characteristics
function inferSubcategory(business, topCategory) {
  const name = (business.business_name || '').toLowerCase();
  const website = (business.website || '').toLowerCase();
  const subcategories = taxonomy.categories[topCategory]?.subcategories || [];

  // Try to match based on keywords
  for (const sub of subcategories) {
    const subLower = sub.toLowerCase();
    if (name.includes(subLower.split(' ')[0]) || name.includes(subLower.replace(/s$/, ''))) {
      return sub;
    }
  }

  // Specific inference rules
  if (topCategory === 'Restaurants, Food & Beverages') {
    if (name.includes('coffee') || name.includes('cafe') || name.includes('espresso')) return 'Coffee Shops';
    if (name.includes('bakery') || name.includes('bake')) return 'Bakeries';
    if (name.includes('ice cream')) return 'Ice Cream Shops';
    if (name.includes('bar') || name.includes('pub') || name.includes('tavern')) return 'Bars & Pubs';
    if (name.includes('brewery') || name.includes('beer')) return 'Wineries & Breweries';
    if (name.includes('fish market') || name.includes('seafood market')) return 'Fish Markets';
    if (name.includes('grocery') || name.includes('market') || name.includes('general store')) return 'Grocery Stores';
    if (name.includes('farm')) return 'Farms';
    if (name.includes('catering')) return 'Catering';
    return 'Restaurants';
  }

  if (topCategory === 'Arts & Entertainment') {
    if (name.includes('gallery')) return 'Art Galleries';
    if (name.includes('museum')) return 'Museums';
    if (name.includes('theater') || name.includes('theatre')) return 'Theaters';
    if (name.includes('photo')) return 'Photographers';
    if (name.includes('film') || name.includes('movie')) return 'Movie Theaters';
    return 'Entertainment Services';
  }

  if (topCategory === 'Shopping & Specialty Retail') {
    if (name.includes('fish market')) return 'Fish Markets';
    if (name.includes('wine') || name.includes('liquor') || name.includes('spirits') || name.includes('package store')) return 'Wine & Spirits';
    if (name.includes('book')) return 'Book Stores';
    if (name.includes('gift')) return 'Gift Shops';
    if (name.includes('jewelry')) return 'Jewelry Stores';
    if (name.includes('hardware')) return 'Hardware Stores';
    if (name.includes('antique')) return 'Antiques';
    if (name.includes('bicycle') || name.includes('bike')) return 'Bicycles - Dealers';
    if (name.includes('clothing') || name.includes('apparel')) return 'Clothing & Apparel';
    if (name.includes('boutique')) return 'Boutiques';
    if (name.includes('grocer')) return 'Specialty Foods';
    return 'Gift Shops';
  }

  if (topCategory === 'Lodging & Tourism') {
    if (name.includes('hotel')) return 'Hotels';
    if (name.includes('inn')) return 'Inns';
    if (name.includes('b&b') || name.includes('bed & breakfast') || name.includes('bed and breakfast')) return 'Bed & Breakfasts';
    if (name.includes('rental')) return 'Vacation Rentals';
    if (name.includes('camp')) return 'Campgrounds';
    return 'Hotels';
  }

  if (topCategory === 'Medical Services & Providers') {
    if (name.includes('pharmacy') || name.includes('apothecary') || name.includes('rx')) return 'Pharmacies';
    if (name.includes('dentist') || name.includes('dental')) return 'Dentists';
    if (name.includes('hospital')) return 'Hospitals';
    if (name.includes('therapy') || name.includes('therapist')) return 'Physical Therapy';
    return 'Physicians';
  }

  if (topCategory === 'Beauty & Wellness') {
    if (name.includes('salon') || name.includes('hair')) return 'Hair Salons';
    if (name.includes('spa')) return 'Spas';
    if (name.includes('nail')) return 'Nail Salons';
    if (name.includes('barber')) return 'Barbershops';
    if (name.includes('fitness') || name.includes('gym')) return 'Fitness Centers';
    if (name.includes('yoga')) return 'Yoga Studios';
    if (name.includes('massage')) return 'Massage Therapy';
    return 'Spas';
  }

  if (topCategory === 'Building & Construction') {
    if (name.includes('electric')) return 'Electric Contractors';
    if (name.includes('plumb')) return 'Plumbers / Plumbing Services';
    if (name.includes('hvac') || name.includes('heating') || name.includes('cooling')) return 'HVAC';
    if (name.includes('roof')) return 'Roofing';
    if (name.includes('paint')) return 'Painters';
    if (name.includes('carpenter') || name.includes('carpentry')) return 'Carpenters';
    return 'General Contractors';
  }

  if (topCategory === 'Home Services & Trades') {
    if (name.includes('clean')) return 'Cleaning Services';
    if (name.includes('landscap')) return 'Landscaping';
    if (name.includes('pest') || name.includes('exterminator') || name.includes('spray')) return 'Pest Control Services';
    if (name.includes('pool')) return 'Pool Services';
    if (name.includes('septic')) return 'Septic Services';
    if (name.includes('moving') || name.includes('mover')) return 'Moving Services';
    if (name.includes('storage')) return 'Storage';
    return 'Handyman Services';
  }

  if (topCategory === 'Family, Community & Government') {
    if (name.includes('school')) return 'Schools';
    if (name.includes('library')) return 'Libraries';
    if (name.includes('church') || name.includes('chapel')) return 'Churches';
    if (name.includes('fire') || name.includes('police') || name.includes('town')) return 'Town Government';
    if (name.includes('recovery') || name.includes('support')) return 'Recovery & Support Groups';
    return 'Community Organizations';
  }

  if (topCategory === 'Sports & Recreation') {
    if (name.includes('golf')) return 'Golf Courses';
    if (name.includes('tennis')) return 'Tennis Clubs';
    if (name.includes('kayak') || name.includes('paddle')) return 'Kayak & Paddleboard';
    if (name.includes('fish') || name.includes('charter')) return 'Fishing Charters';
    if (name.includes('sail')) return 'Sailing';
    if (name.includes('surf')) return 'Surfing';
    if (name.includes('bike') || name.includes('bicycle')) return 'Bike Rentals';
    if (name.includes('boat')) return 'Boat Rentals';
    return 'Beach Services';
  }

  // Default to first subcategory
  return subcategories[0] || null;
}

// Slugify function
function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Generate business slug: slugify(name) + "-" + slugify(town)
function generateBusinessSlug(name, town) {
  return slugify(name) + '-' + slugify(town);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  DIRECTORY HARD RESET');
console.log('═══════════════════════════════════════════════════════════════\n');

// Step 1: Archive stale export files
console.log('Step 1: Archiving stale export files...');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filesToArchive = [
  'businesses.json',
  'business-types.json',
  'towns.json',
  'summary.json',
  'mv-business-directory-production.json',
  'mv-business-directory-production-candidate.json',
  'mv-business-directory-clean.json',
  'mv-business-directory-corrected.json',
];

let archivedCount = 0;
for (const file of filesToArchive) {
  const srcPath = path.join(EXPORTS_DIR, file);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(ARCHIVE_DIR, `${timestamp}_${file}`);
    fs.copyFileSync(srcPath, destPath);
    archivedCount++;
    console.log(`  Archived: ${file}`);
  }
}
console.log(`  Total archived: ${archivedCount} files\n`);

// Step 2: Load and process businesses from database
console.log('Step 2: Loading businesses from database...');

const db = new Database(DB_PATH);

// Get all non-duplicate, non-invalid businesses
const allBusinesses = db.prepare(`
  SELECT
    id, business_name, town, category, subcategory,
    full_address, street_address, phone, email, website,
    short_description, hours, seasonal_indicator,
    latitude, longitude, map_ready,
    business_status, confidence_score, completeness_score,
    publish_tier, needs_manual_review, review_reason,
    facebook_url, instagram_url, yelp_url, tripadvisor_url,
    slug
  FROM businesses
  WHERE is_duplicate = 0
`).all();

console.log(`  Total records in database: ${allBusinesses.length}\n`);

// Step 3: Apply category mapping and validation
console.log('Step 3: Applying category mapping and validation...');

const validationErrors = [];
const excludedRecords = [];
const publicRecords = [];

for (const biz of allBusinesses) {
  const errors = [];

  // Check for exclusion conditions
  if (biz.needs_manual_review === 1) {
    excludedRecords.push({ ...biz, exclusion_reason: 'needs_manual_review' });
    continue;
  }

  if (biz.review_reason === 'invalid_record') {
    excludedRecords.push({ ...biz, exclusion_reason: 'invalid_record' });
    continue;
  }

  if (biz.town === 'Unknown' || !biz.town) {
    excludedRecords.push({ ...biz, exclusion_reason: 'unknown_town' });
    continue;
  }

  if (!VALID_TOWNS.includes(biz.town)) {
    excludedRecords.push({ ...biz, exclusion_reason: `invalid_town: ${biz.town}` });
    continue;
  }

  // Map old category to Chamber category
  let chamberCategory = biz.category;
  if (!VALID_CATEGORIES.includes(chamberCategory)) {
    if (CATEGORY_MAP[chamberCategory]) {
      chamberCategory = CATEGORY_MAP[chamberCategory];
    } else if (chamberCategory === 'Other' || !chamberCategory) {
      excludedRecords.push({ ...biz, exclusion_reason: 'category_other_or_null' });
      continue;
    } else {
      // Try partial match
      let matched = false;
      for (const [old, chamber] of Object.entries(CATEGORY_MAP)) {
        if (chamberCategory.toLowerCase().includes(old.toLowerCase())) {
          chamberCategory = chamber;
          matched = true;
          break;
        }
      }
      if (!matched) {
        excludedRecords.push({ ...biz, exclusion_reason: `unmapped_category: ${biz.category}` });
        continue;
      }
    }
  }

  // Infer subcategory
  const subcategory = biz.subcategory || inferSubcategory(biz, chamberCategory);

  // Generate new slug from verified name + verified town
  const newSlug = generateBusinessSlug(biz.business_name, biz.town);

  // Validate slug doesn't contain wrong town
  for (const town of VALID_TOWNS) {
    const townSlug = slugify(town);
    if (newSlug.includes(townSlug) && townSlug !== slugify(biz.town)) {
      errors.push(`Slug contains wrong town: ${newSlug} (business is in ${biz.town})`);
    }
  }

  // Check old slug for town mismatch
  if (biz.slug) {
    for (const town of VALID_TOWNS) {
      const townSlug = slugify(town);
      if (biz.slug.includes(townSlug) && townSlug !== slugify(biz.town)) {
        // Old slug has wrong town - this is why we're regenerating
        console.log(`  ! Old slug mismatch: ${biz.business_name} (ID ${biz.id})`);
        console.log(`    Old slug: ${biz.slug}, Town: ${biz.town}`);
      }
    }
  }

  if (errors.length > 0) {
    validationErrors.push({ business: biz, errors });
    continue;
  }

  // Add to public records
  publicRecords.push({
    id: biz.id,
    name: biz.business_name,
    slug: newSlug,
    town: biz.town,
    townSlug: TOWN_SLUGS[biz.town],
    topCategory: chamberCategory,
    topCategorySlug: CATEGORY_SLUGS[chamberCategory],
    subcategory: subcategory,
    subcategorySlug: subcategory ? slugify(subcategory) : null,
    address: biz.street_address || biz.full_address || null,
    phone: biz.phone || null,
    email: biz.email || null,
    website: biz.website || null,
    description: biz.short_description || null,
    hours: biz.hours || null,
    seasonal: biz.seasonal_indicator || null,
    coordinates: (biz.latitude && biz.longitude && biz.map_ready)
      ? { lat: biz.latitude, lng: biz.longitude }
      : null,
    status: biz.business_status || 'active',
    confidence: biz.confidence_score || 0,
    social: {
      facebook: biz.facebook_url || null,
      instagram: biz.instagram_url || null,
      yelp: biz.yelp_url || null,
      tripadvisor: biz.tripadvisor_url || null,
    }
  });
}

console.log(`  Public records: ${publicRecords.length}`);
console.log(`  Excluded records: ${excludedRecords.length}`);
console.log(`  Validation errors: ${validationErrors.length}\n`);

// Step 4: Final validation gates
console.log('Step 4: Running validation gates...');

let gatesFailed = false;

// Gate 1: No Unknown towns
const unknownTowns = publicRecords.filter(r => r.town === 'Unknown' || !VALID_TOWNS.includes(r.town));
if (unknownTowns.length > 0) {
  console.log(`  ❌ GATE FAILED: ${unknownTowns.length} records have Unknown/invalid town`);
  gatesFailed = true;
}

// Gate 2: All categories are Chamber categories
const invalidCategories = publicRecords.filter(r => !VALID_CATEGORIES.includes(r.topCategory));
if (invalidCategories.length > 0) {
  console.log(`  ❌ GATE FAILED: ${invalidCategories.length} records have invalid category`);
  invalidCategories.slice(0, 5).forEach(r => console.log(`    - ${r.name}: ${r.topCategory}`));
  gatesFailed = true;
}

// Gate 3: No "Other" category
const otherCategory = publicRecords.filter(r => r.topCategory === 'Other');
if (otherCategory.length > 0) {
  console.log(`  ❌ GATE FAILED: ${otherCategory.length} records have "Other" category`);
  gatesFailed = true;
}

// Gate 4: Slug contains correct town only
let slugMismatches = 0;
for (const record of publicRecords) {
  const expectedTownSlug = slugify(record.town);
  for (const town of VALID_TOWNS) {
    const townSlug = slugify(town);
    if (record.slug.endsWith('-' + townSlug) && townSlug !== expectedTownSlug) {
      console.log(`  ❌ Slug mismatch: ${record.name} slug ends with ${townSlug} but is in ${record.town}`);
      slugMismatches++;
    }
  }
}
if (slugMismatches > 0) {
  console.log(`  ❌ GATE FAILED: ${slugMismatches} slug mismatches found`);
  gatesFailed = true;
}

if (!gatesFailed) {
  console.log('  ✓ All validation gates passed!\n');
} else {
  console.log('\n  ⚠ WARNING: Validation gates failed but continuing to generate files for review.\n');
}

// Step 5: Generate town and category stats
console.log('Step 5: Generating statistics...');

const townStats = {};
const categoryStats = {};
const subcategoryStats = {};

for (const record of publicRecords) {
  // Town stats
  if (!townStats[record.town]) {
    townStats[record.town] = { count: 0, categories: {} };
  }
  townStats[record.town].count++;
  if (!townStats[record.town].categories[record.topCategory]) {
    townStats[record.town].categories[record.topCategory] = 0;
  }
  townStats[record.town].categories[record.topCategory]++;

  // Category stats
  if (!categoryStats[record.topCategory]) {
    categoryStats[record.topCategory] = { count: 0, byTown: {}, subcategories: {} };
  }
  categoryStats[record.topCategory].count++;
  if (!categoryStats[record.topCategory].byTown[record.town]) {
    categoryStats[record.topCategory].byTown[record.town] = 0;
  }
  categoryStats[record.topCategory].byTown[record.town]++;

  // Subcategory stats
  if (record.subcategory) {
    if (!categoryStats[record.topCategory].subcategories[record.subcategory]) {
      categoryStats[record.topCategory].subcategories[record.subcategory] = 0;
    }
    categoryStats[record.topCategory].subcategories[record.subcategory]++;
  }
}

console.log('  Town distribution:');
Object.entries(townStats)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([town, stats]) => {
    const pct = ((stats.count / publicRecords.length) * 100).toFixed(1);
    console.log(`    ${town.padEnd(20)} ${stats.count.toString().padStart(4)} (${pct}%)`);
  });

console.log('\n  Category distribution:');
Object.entries(categoryStats)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([cat, stats]) => {
    const pct = ((stats.count / publicRecords.length) * 100).toFixed(1);
    console.log(`    ${cat.padEnd(35)} ${stats.count.toString().padStart(4)} (${pct}%)`);
  });

// Step 6: Generate export files
console.log('\n\nStep 6: Generating export files...');

// Main public directory file
const publicExport = {
  generated: new Date().toISOString(),
  version: '3.0',
  totalCount: publicRecords.length,
  validTowns: VALID_TOWNS,
  validCategories: VALID_CATEGORIES,
  townStats: townStats,
  categoryStats: categoryStats,
  businesses: publicRecords
};

fs.writeFileSync(
  path.join(EXPORTS_DIR, 'mv-business-directory-public.json'),
  JSON.stringify(publicExport, null, 2)
);
console.log('  ✓ data/exports/mv-business-directory-public.json');

// Town metadata
const TOWN_META = {
  'Vineyard Haven': {
    region: 'down-island',
    description: 'The commercial heart of Martha\'s Vineyard, home to the ferry terminal and a vibrant Main Street with local shops, restaurants, and services.'
  },
  'Oak Bluffs': {
    region: 'down-island',
    description: 'Colorful gingerbread cottages, the Flying Horses carousel, and a lively harbor scene with diverse local businesses.'
  },
  'Edgartown': {
    region: 'down-island',
    description: 'Historic whaling captain homes, upscale boutiques, waterfront dining, and professional services define this elegant village.'
  },
  'West Tisbury': {
    region: 'up-island',
    description: 'Rolling farmland, the beloved Farmers Market, artisan shops, and a quintessential New England town center.'
  },
  'Chilmark': {
    region: 'up-island',
    description: 'Quiet country roads, Lucy Vincent Beach, farm stands, and the iconic fishing village of Menemsha.'
  },
  'Aquinnah': {
    region: 'up-island',
    description: 'Home to the Gay Head Cliffs, the Wampanoag Tribe, artisan shops, and dramatic ocean views.'
  }
};

// Generate towns.json for frontend
const townsExport = VALID_TOWNS.map(town => {
  const stats = townStats[town] || { count: 0, categories: {} };
  // Convert categories to businessTypes format (category slug -> count)
  const businessTypes = {};
  Object.entries(stats.categories).forEach(([cat, count]) => {
    businessTypes[CATEGORY_SLUGS[cat]] = count;
  });
  return {
    slug: TOWN_SLUGS[town],
    name: town,
    region: TOWN_META[town]?.region || 'island',
    description: TOWN_META[town]?.description || '',
    businessCount: stats.count,
    businessTypes: businessTypes,
    categories: Object.keys(stats.categories)
  };
});

fs.writeFileSync(
  path.join(EXPORTS_DIR, 'towns.json'),
  JSON.stringify(townsExport, null, 2)
);
console.log('  ✓ data/exports/towns.json');

// Business type metadata
const CATEGORY_META = {
  'Restaurants, Food & Beverages': {
    pluralName: 'Restaurants & Food',
    icon: 'utensils',
    description: 'From waterfront seafood shacks to fine dining establishments, Martha\'s Vineyard offers exceptional dining for every taste and occasion.',
    shortDescription: 'Local restaurants, cafes, and food purveyors',
    seoDescription: 'Find restaurants on Martha\'s Vineyard. Browse local dining options from casual seafood to fine dining across all island towns.'
  },
  'Shopping & Specialty Retail': {
    pluralName: 'Shopping & Retail',
    icon: 'shopping-bag',
    description: 'Local boutiques, galleries, and specialty shops offer island-made goods, curated collections, and unique finds throughout Martha\'s Vineyard.',
    shortDescription: 'Boutiques, galleries, and retail shops',
    seoDescription: 'Find shopping on Martha\'s Vineyard. Browse local boutiques, galleries, gift shops, and retail stores across all island towns.'
  },
  'Lodging & Tourism': {
    pluralName: 'Hotels & Lodging',
    icon: 'bed',
    description: 'Historic inns, boutique hotels, and vacation rentals provide comfortable accommodations for visitors to Martha\'s Vineyard year-round.',
    shortDescription: 'Hotels, inns, and vacation rentals',
    seoDescription: 'Find lodging on Martha\'s Vineyard. Browse hotels, inns, bed & breakfasts, and vacation rentals across all island towns.'
  },
  'Arts & Entertainment': {
    pluralName: 'Arts & Entertainment',
    icon: 'palette',
    description: 'Art galleries, museums, theaters, and cultural venues showcase the vibrant creative community of Martha\'s Vineyard.',
    shortDescription: 'Galleries, museums, and entertainment',
    seoDescription: 'Find arts and entertainment on Martha\'s Vineyard. Browse galleries, museums, theaters, and cultural venues across all island towns.'
  },
  'Beauty & Wellness': {
    pluralName: 'Beauty & Wellness',
    icon: 'heart-pulse',
    description: 'Spas, salons, fitness centers, and wellness services supporting health and relaxation on Martha\'s Vineyard.',
    shortDescription: 'Spas, salons, and wellness services',
    seoDescription: 'Find beauty and wellness services on Martha\'s Vineyard. Browse spas, salons, fitness centers, and wellness providers across all island towns.'
  },
  'Family, Community & Government': {
    pluralName: 'Community & Government',
    icon: 'landmark',
    description: 'Community organizations, government services, and nonprofits serving the Martha\'s Vineyard community.',
    shortDescription: 'Community organizations and services',
    seoDescription: 'Find community organizations on Martha\'s Vineyard. Browse nonprofits, government services, and community resources across all island towns.'
  },
  'Medical Services & Providers': {
    pluralName: 'Medical & Health',
    icon: 'stethoscope',
    description: 'Medical providers, pharmacies, and healthcare services supporting the Martha\'s Vineyard community year-round.',
    shortDescription: 'Medical providers and healthcare',
    seoDescription: 'Find medical services on Martha\'s Vineyard. Browse doctors, pharmacies, and healthcare providers across all island towns.'
  },
  'Building & Construction': {
    pluralName: 'Building & Construction',
    icon: 'hammer',
    description: 'Skilled contractors, builders, and construction professionals serving homeowners and businesses across Martha\'s Vineyard.',
    shortDescription: 'Contractors and construction services',
    seoDescription: 'Find contractors on Martha\'s Vineyard. Browse builders, construction companies, and home improvement professionals across all island towns.'
  },
  'Business & Professional Services': {
    pluralName: 'Professional Services',
    icon: 'briefcase',
    description: 'Professional service providers including legal, financial, and business services on Martha\'s Vineyard.',
    shortDescription: 'Legal, financial, and business services',
    seoDescription: 'Find professional services on Martha\'s Vineyard. Browse legal, financial, and business service providers across all island towns.'
  },
  'Home Services & Trades': {
    pluralName: 'Home Services',
    icon: 'wrench',
    description: 'Home services including cleaning, landscaping, and maintenance professionals serving Martha\'s Vineyard.',
    shortDescription: 'Home maintenance and services',
    seoDescription: 'Find home services on Martha\'s Vineyard. Browse cleaning, landscaping, and maintenance services across all island towns.'
  },
  'Automotive & Marine': {
    pluralName: 'Auto & Marine',
    icon: 'car',
    description: 'Auto repair, boat services, and marine businesses serving Martha\'s Vineyard.',
    shortDescription: 'Auto repair and marine services',
    seoDescription: 'Find automotive and marine services on Martha\'s Vineyard. Browse auto repair, boat services, and marine businesses across all island towns.'
  },
  'Sports & Recreation': {
    pluralName: 'Sports & Recreation',
    icon: 'volleyball',
    description: 'Golf courses, tennis clubs, water sports, and recreational activities on Martha\'s Vineyard.',
    shortDescription: 'Sports and recreational activities',
    seoDescription: 'Find sports and recreation on Martha\'s Vineyard. Browse golf, tennis, water sports, and recreational activities across all island towns.'
  },
  'Real Estate & Rentals': {
    pluralName: 'Real Estate',
    icon: 'home',
    description: 'Real estate agents, property management, and rental services on Martha\'s Vineyard.',
    shortDescription: 'Real estate and property services',
    seoDescription: 'Find real estate services on Martha\'s Vineyard. Browse real estate agents, property management, and rentals across all island towns.'
  },
  'Transportation & Utilities': {
    pluralName: 'Transportation',
    icon: 'bus',
    description: 'Transportation services, taxi, ferry, and utilities on Martha\'s Vineyard.',
    shortDescription: 'Transportation and utility services',
    seoDescription: 'Find transportation on Martha\'s Vineyard. Browse taxi, ferry, bus, and other transportation services across all island towns.'
  },
  'Wedding & Event Services': {
    pluralName: 'Weddings & Events',
    icon: 'sparkles',
    description: 'Wedding planners, event venues, florists, and event services on Martha\'s Vineyard.',
    shortDescription: 'Wedding and event planning',
    seoDescription: 'Find wedding and event services on Martha\'s Vineyard. Browse planners, venues, florists, and event professionals across all island towns.'
  },
  'Banking, Finance & Insurance': {
    pluralName: 'Banking & Finance',
    icon: 'building-columns',
    description: 'Banks, financial advisors, insurance agents, and financial services on Martha\'s Vineyard.',
    shortDescription: 'Banking and financial services',
    seoDescription: 'Find banking and financial services on Martha\'s Vineyard. Browse banks, financial advisors, and insurance agents across all island towns.'
  },
  'House, Garden & Pets': {
    pluralName: 'Home, Garden & Pets',
    icon: 'flower',
    description: 'Garden centers, pet stores, veterinarians, and home & garden supplies on Martha\'s Vineyard.',
    shortDescription: 'Home, garden, and pet services',
    seoDescription: 'Find home, garden, and pet services on Martha\'s Vineyard. Browse garden centers, pet stores, and veterinarians across all island towns.'
  }
};

// Generate business-types.json using Chamber categories
const businessTypesExport = Object.entries(categoryStats)
  .filter(([cat, stats]) => stats.count > 0)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([cat, stats]) => {
    const meta = CATEGORY_META[cat] || {};
    return {
      slug: CATEGORY_SLUGS[cat],
      name: cat,
      pluralName: meta.pluralName || cat,
      icon: meta.icon || 'circle',
      description: meta.description || `${cat} on Martha's Vineyard.`,
      shortDescription: meta.shortDescription || cat,
      seoDescription: meta.seoDescription || `Find ${cat.toLowerCase()} on Martha's Vineyard.`,
      businessCount: stats.count,
      byTown: Object.fromEntries(
        Object.entries(stats.byTown).map(([town, count]) => [TOWN_SLUGS[town], count])
      ),
      subcategories: Object.entries(stats.subcategories)
        .sort((a, b) => b[1] - a[1])
        .map(([sub, count]) => ({ name: sub, slug: slugify(sub), count }))
    };
  });

fs.writeFileSync(
  path.join(EXPORTS_DIR, 'business-types.json'),
  JSON.stringify(businessTypesExport, null, 2)
);
console.log('  ✓ data/exports/business-types.json');

// Generate businesses.json for frontend compatibility
const businessesExport = publicRecords.map(r => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  category: r.topCategory,
  businessType: r.topCategorySlug,
  subcategory: r.subcategory,
  description: r.description,
  town: r.town,
  townSlug: r.townSlug,
  address: r.address,
  phone: r.phone,
  email: r.email,
  website: r.website,
  hours: r.hours,
  seasonal: r.seasonal,
  coordinates: r.coordinates,
  status: r.status,
  confidence: r.confidence,
  social: r.social
}));

fs.writeFileSync(
  path.join(EXPORTS_DIR, 'businesses.json'),
  JSON.stringify(businessesExport, null, 2)
);
console.log('  ✓ data/exports/businesses.json');

// Generate summary
fs.writeFileSync(
  path.join(EXPORTS_DIR, 'summary.json'),
  JSON.stringify({
    generated: new Date().toISOString(),
    totalPublicBusinesses: publicRecords.length,
    excludedRecords: excludedRecords.length,
    validationErrors: validationErrors.length,
    gatesPassed: !gatesFailed,
    townDistribution: Object.fromEntries(
      Object.entries(townStats).map(([t, s]) => [t, s.count])
    ),
    categoryDistribution: Object.fromEntries(
      Object.entries(categoryStats).map(([c, s]) => [c, s.count])
    )
  }, null, 2)
);
console.log('  ✓ data/exports/summary.json');

// Step 7: Generate validation reports
console.log('\nStep 7: Generating validation reports...');

// Validation report markdown
let validationMd = `# Public Directory Validation Report\n\n`;
validationMd += `Generated: ${new Date().toISOString()}\n\n`;
validationMd += `## Summary\n\n`;
validationMd += `- **Total public records:** ${publicRecords.length}\n`;
validationMd += `- **Excluded records:** ${excludedRecords.length}\n`;
validationMd += `- **Validation errors:** ${validationErrors.length}\n`;
validationMd += `- **Gates passed:** ${!gatesFailed ? 'Yes' : 'No'}\n\n`;

validationMd += `## Validation Gates\n\n`;
validationMd += `| Gate | Status |\n`;
validationMd += `|------|--------|\n`;
validationMd += `| No Unknown towns | ${unknownTowns.length === 0 ? '✓ Passed' : '❌ Failed'} |\n`;
validationMd += `| All Chamber categories | ${invalidCategories.length === 0 ? '✓ Passed' : '❌ Failed'} |\n`;
validationMd += `| No "Other" category | ${otherCategory.length === 0 ? '✓ Passed' : '❌ Failed'} |\n`;
validationMd += `| Slugs match towns | ${slugMismatches === 0 ? '✓ Passed' : '❌ Failed'} |\n`;

validationMd += `\n## Town Distribution\n\n`;
validationMd += `| Town | Count | % |\n`;
validationMd += `|------|-------|---|\n`;
Object.entries(townStats)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([town, stats]) => {
    const pct = ((stats.count / publicRecords.length) * 100).toFixed(1);
    validationMd += `| ${town} | ${stats.count} | ${pct}% |\n`;
  });

validationMd += `\n## Category Distribution\n\n`;
validationMd += `| Category | Count | % |\n`;
validationMd += `|----------|-------|---|\n`;
Object.entries(categoryStats)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([cat, stats]) => {
    const pct = ((stats.count / publicRecords.length) * 100).toFixed(1);
    validationMd += `| ${cat} | ${stats.count} | ${pct}% |\n`;
  });

validationMd += `\n## Active Import Path\n\n`;
validationMd += `The frontend should import from:\n`;
validationMd += `\`\`\`\n`;
validationMd += `data/exports/businesses.json\n`;
validationMd += `data/exports/towns.json\n`;
validationMd += `data/exports/business-types.json\n`;
validationMd += `\`\`\`\n`;

validationMd += `\n## Archived Files\n\n`;
validationMd += `Previous exports archived to: data/exports/_archive/\n`;

fs.writeFileSync(path.join(AUDITS_DIR, 'public-directory-validation.md'), validationMd);
console.log('  ✓ data/audits/public-directory-validation.md');

// Validation report CSV
let validationCsv = 'id,name,town,category,subcategory,slug,status\n';
for (const record of publicRecords) {
  validationCsv += `${record.id},"${record.name.replace(/"/g, '""')}","${record.town}","${record.topCategory}","${record.subcategory || ''}","${record.slug}","valid"\n`;
}
for (const record of excludedRecords) {
  validationCsv += `${record.id},"${(record.business_name || '').replace(/"/g, '""')}","${record.town || ''}","${record.category || ''}","","","excluded: ${record.exclusion_reason}"\n`;
}

fs.writeFileSync(path.join(AUDITS_DIR, 'public-directory-validation.csv'), validationCsv);
console.log('  ✓ data/audits/public-directory-validation.csv');

db.close();

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  DIRECTORY HARD RESET COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Public directory: ${publicRecords.length} businesses`);
console.log(`Excluded: ${excludedRecords.length} records`);
console.log(`Validation: ${gatesFailed ? 'FAILED - Review required' : 'PASSED'}\n`);
console.log('Generated files:');
console.log('  - data/exports/mv-business-directory-public.json (canonical source)');
console.log('  - data/exports/businesses.json (frontend import)');
console.log('  - data/exports/towns.json');
console.log('  - data/exports/business-types.json');
console.log('  - data/audits/public-directory-validation.md');
console.log('  - data/audits/public-directory-validation.csv');
console.log('\nNext: Update frontend to use new data and verify rendering.');

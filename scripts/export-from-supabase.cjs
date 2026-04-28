#!/usr/bin/env node
/**
 * Export directory data from Supabase to JSON for frontend consumption.
 * This ensures the public site and admin dashboard use the same data source.
 *
 * Run: node scripts/export-from-supabase.cjs
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or environment
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');

// Town configuration
const TOWNS = [
  { slug: 'vineyard-haven', name: 'Vineyard Haven', region: 'down-island', description: 'The commercial heart of Martha\'s Vineyard, home to the ferry terminal and a vibrant Main Street.' },
  { slug: 'edgartown', name: 'Edgartown', region: 'down-island', description: 'Historic whaling captain homes, upscale boutiques, and waterfront dining.' },
  { slug: 'oak-bluffs', name: 'Oak Bluffs', region: 'down-island', description: 'Colorful gingerbread cottages, the Flying Horses carousel, and a lively harbor scene.' },
  { slug: 'west-tisbury', name: 'West Tisbury', region: 'up-island', description: 'Rolling farmland, the beloved Farmers Market, and artisan shops.' },
  { slug: 'chilmark', name: 'Chilmark', region: 'up-island', description: 'Quiet country roads, Lucy Vincent Beach, and the iconic fishing village of Menemsha.' },
  { slug: 'aquinnah', name: 'Aquinnah', region: 'up-island', description: 'Home to the Gay Head Cliffs and the Wampanoag Tribe.' },
];

// Business type configuration - maps Supabase categories to URL-friendly slugs
const BUSINESS_TYPE_CONFIG = {
  'Restaurants, Food & Beverages': {
    slug: 'restaurants-food-beverages',
    pluralName: 'Restaurants & Food',
    icon: 'utensils',
    description: 'From waterfront seafood shacks to fine dining establishments.',
    shortDescription: 'Local restaurants, cafes, and food purveyors',
    seoDescription: 'Find restaurants on Martha\'s Vineyard.',
  },
  'Shopping & Specialty Retail': {
    slug: 'shopping-and-specialty-retail',
    pluralName: 'Shopping & Retail',
    icon: 'shopping-bag',
    description: 'Local boutiques, galleries, and specialty shops.',
    shortDescription: 'Boutiques, galleries, and retail shops',
    seoDescription: 'Find shopping on Martha\'s Vineyard.',
  },
  'Lodging & Tourism': {
    slug: 'lodging-and-tourism',
    pluralName: 'Hotels & Lodging',
    icon: 'bed',
    description: 'Historic inns, boutique hotels, and vacation rentals.',
    shortDescription: 'Hotels, inns, and vacation rentals',
    seoDescription: 'Find lodging on Martha\'s Vineyard.',
  },
  'Beauty & Wellness': {
    slug: 'beauty-and-wellness',
    pluralName: 'Beauty & Wellness',
    icon: 'heart-pulse',
    description: 'Spas, salons, fitness centers, and wellness services.',
    shortDescription: 'Spas, salons, and wellness services',
    seoDescription: 'Find beauty and wellness services on Martha\'s Vineyard.',
  },
  'Arts & Entertainment': {
    slug: 'arts-and-entertainment',
    pluralName: 'Arts & Entertainment',
    icon: 'palette',
    description: 'Art galleries, museums, theaters, and cultural venues.',
    shortDescription: 'Galleries, museums, and entertainment',
    seoDescription: 'Find arts and entertainment on Martha\'s Vineyard.',
  },
  'Family, Community & Government': {
    slug: 'family-community-government',
    pluralName: 'Community & Government',
    icon: 'landmark',
    description: 'Community organizations, government services, and nonprofits.',
    shortDescription: 'Community organizations and services',
    seoDescription: 'Find community organizations on Martha\'s Vineyard.',
  },
  'Medical Services & Providers': {
    slug: 'medical-services-and-providers',
    pluralName: 'Medical & Health',
    icon: 'stethoscope',
    description: 'Medical providers, pharmacies, and healthcare services.',
    shortDescription: 'Medical providers and healthcare',
    seoDescription: 'Find medical services on Martha\'s Vineyard.',
  },
  'Building & Construction': {
    slug: 'building-and-construction',
    pluralName: 'Building & Construction',
    icon: 'hammer',
    description: 'Skilled contractors, builders, and construction professionals.',
    shortDescription: 'Contractors and construction services',
    seoDescription: 'Find contractors on Martha\'s Vineyard.',
  },
  'Business & Professional Services': {
    slug: 'business-and-professional-services',
    pluralName: 'Professional Services',
    icon: 'briefcase',
    description: 'Professional service providers including legal, financial, and business services.',
    shortDescription: 'Legal, financial, and business services',
    seoDescription: 'Find professional services on Martha\'s Vineyard.',
  },
};

// Town name to slug
function toTownSlug(townName) {
  const map = {
    'Vineyard Haven': 'vineyard-haven',
    'Tisbury': 'vineyard-haven', // Tisbury is Vineyard Haven
    'Edgartown': 'edgartown',
    'Oak Bluffs': 'oak-bluffs',
    'West Tisbury': 'west-tisbury',
    'Chilmark': 'chilmark',
    'Aquinnah': 'aquinnah',
  };
  return map[townName] || townName.toLowerCase().replace(/\s+/g, '-');
}

// Category to business type slug
function toBusinessTypeSlug(category) {
  const config = BUSINESS_TYPE_CONFIG[category];
  return config ? config.slug : category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function exportData() {
  console.log('Fetching businesses from Supabase...');

  // Fetch all active businesses
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_duplicate', false)
    .eq('business_status', 'active')
    .order('business_name');

  if (error) {
    console.error('Error fetching businesses:', error);
    process.exit(1);
  }

  console.log(`Found ${businesses.length} active businesses`);

  // Process businesses for public JSON
  const processedBusinesses = businesses.map(b => ({
    id: b.id,
    name: b.business_name,
    slug: b.slug,
    category: b.category || 'Other',
    businessType: toBusinessTypeSlug(b.category),
    subcategory: b.subcategory || null,
    description: b.short_description || null,
    town: b.town,
    townSlug: toTownSlug(b.town),
    address: b.full_address || b.street_address || null,
    phone: b.phone || null,
    email: b.email || null,
    website: b.website || null,
    hours: null,
    seasonal: null,
    coordinates: (b.latitude && b.longitude) ? { lat: b.latitude, lng: b.longitude } : null,
    status: b.business_status,
    confidence: b.confidence_score || 0,
    social: {
      facebook: b.facebook_url || null,
      instagram: b.instagram_url || null,
      yelp: b.yelp_url || null,
      tripadvisor: b.tripadvisor_url || null,
    },
  }));

  // Generate town stats
  const townStats = TOWNS.map(town => {
    const townBusinesses = processedBusinesses.filter(b => b.townSlug === town.slug);
    const businessTypes = {};

    for (const b of townBusinesses) {
      businessTypes[b.businessType] = (businessTypes[b.businessType] || 0) + 1;
    }

    return {
      ...town,
      businessCount: townBusinesses.length,
      businessTypes,
      categories: [...new Set(townBusinesses.map(b => b.category))].sort(),
    };
  });

  // Generate business type stats
  const categoryGroups = {};
  for (const b of processedBusinesses) {
    if (!categoryGroups[b.category]) {
      categoryGroups[b.category] = [];
    }
    categoryGroups[b.category].push(b);
  }

  const businessTypeStats = Object.entries(BUSINESS_TYPE_CONFIG)
    .map(([category, config]) => {
      const businesses = categoryGroups[category] || [];
      const byTown = {};

      for (const town of TOWNS) {
        const count = businesses.filter(b => b.townSlug === town.slug).length;
        if (count > 0) byTown[town.slug] = count;
      }

      // Get subcategories
      const subcategoryCounts = {};
      for (const b of businesses) {
        if (b.subcategory) {
          subcategoryCounts[b.subcategory] = (subcategoryCounts[b.subcategory] || 0) + 1;
        }
      }
      const subcategories = Object.entries(subcategoryCounts)
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        slug: config.slug,
        name: category,
        pluralName: config.pluralName,
        icon: config.icon,
        description: config.description,
        shortDescription: config.shortDescription,
        seoDescription: config.seoDescription,
        businessCount: businesses.length,
        byTown,
        subcategories,
      };
    })
    .filter(t => t.businessCount > 0);

  // Archive old exports
  const archiveDir = path.join(EXPORTS_DIR, '_archive');
  fs.mkdirSync(archiveDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  for (const file of ['businesses.json', 'towns.json', 'business-types.json', 'summary.json']) {
    const srcPath = path.join(EXPORTS_DIR, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(archiveDir, `${timestamp}_${file}`));
    }
  }

  // Write new exports
  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'businesses.json'),
    JSON.stringify(processedBusinesses, null, 2)
  );

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'towns.json'),
    JSON.stringify(townStats, null, 2)
  );

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'business-types.json'),
    JSON.stringify(businessTypeStats, null, 2)
  );

  // Write summary
  const summary = {
    exportedAt: new Date().toISOString(),
    source: 'supabase',
    totalBusinesses: processedBusinesses.length,
    byTown: Object.fromEntries(townStats.map(t => [t.slug, t.businessCount])),
    byType: Object.fromEntries(businessTypeStats.map(c => [c.slug, c.businessCount])),
  };

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\nExport complete:');
  console.log(`  - ${processedBusinesses.length} businesses`);
  console.log(`  - ${townStats.length} towns`);
  console.log(`  - ${businessTypeStats.length} business types`);
  console.log(`  - Files written to ${EXPORTS_DIR}`);
  console.log(`  - Old exports archived to ${archiveDir}`);
}

exportData().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});

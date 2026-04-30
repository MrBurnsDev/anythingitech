#!/usr/bin/env node
/**
 * Generate sitemap.xml and robots.txt for anythingitechmv.com
 *
 * STRICT VALIDATION: Only includes clean, valid public URLs
 *
 * Usage: node scripts/generate-sitemap.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://anythingitechmv.com';
const TODAY = new Date().toISOString().split('T')[0];

// ============================================================
// APPROVED TAXONOMY - Only these slugs are allowed in sitemap
// ============================================================

// Valid MV town slugs
const VALID_TOWN_SLUGS = new Set([
  'aquinnah',
  'chilmark',
  'edgartown',
  'menemsha',
  'oak-bluffs',
  'tisbury',
  'vineyard-haven',
  'west-tisbury',
]);

// Valid category slugs (Chamber-approved taxonomy)
const VALID_CATEGORY_SLUGS = new Set([
  'arts-and-entertainment',
  'automotive-and-marine',
  'banking-finance-and-insurance',
  'beauty-and-wellness',
  'building-and-construction',
  'business-and-professional-services',
  'family-community-government',
  'home-services-and-trades',
  'house-garden-and-pets',
  'lodging-and-tourism',
  'medical-services-and-providers',
  'real-estate-and-rentals',
  'restaurants-food-beverages',
  'shopping-and-specialty-retail',
  'sports-and-recreation',
  'transportation-and-utilities',
  'wedding-and-event-services',
]);

// Legacy/invalid category slugs to REJECT
const INVALID_CATEGORY_SLUGS = new Set([
  'restaurant',
  'restaurants',
  'shopping-retail',
  'health-wellness',
  'professional-services',
  'community',
  'automotive',
  'lodging',
  'other',
  'unknown',
  'contractors',
]);

// Invalid business slug patterns
const INVALID_SLUG_PATTERNS = [
  /^facebook/i,
  /^instagram/i,
  /^menu-/i,
  /menu-vineyard-haven/i,
  /redirecting/i,
  /-closed$/i,
  /^http/i,
  /http:/i,
  /^www\./i,
  /\.com$/i,
  /\.com-/i,
  /\.org$/i,
  /\.net$/i,
  /^securemy/i,
  /^campaign/i,
  /^subscribe/i,
  /^home-page/i,
  /^directories/i,
  /^welcome-/i,
  /^contact-us/i,
  /^about-us/i,
];

// ============================================================
// Static pages with their priorities
// ============================================================
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: 1.0, lastmod: TODAY },
  { path: '/services', changefreq: 'monthly', priority: 0.9, lastmod: TODAY },
  { path: '/services/apple-repair', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/wifi-network', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/smart-home', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/tv-audio', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/business-it', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/mv-app-design', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/about', changefreq: 'monthly', priority: 0.7, lastmod: TODAY },
  { path: '/contact', changefreq: 'monthly', priority: 0.7, lastmod: TODAY },
  { path: '/tech-tips', changefreq: 'weekly', priority: 0.8, lastmod: TODAY },
  { path: '/marthas-vineyard', changefreq: 'daily', priority: 0.9, lastmod: TODAY },
  { path: '/marthas-vineyard/submit', changefreq: 'monthly', priority: 0.5, lastmod: TODAY },
];

// Tech tip blog posts (validated real articles)
const TECH_TIP_SLUGS = [
  'why-i-built-is-the-ferry-running',
  'wi-fi-coverage-for-large-properties',
  'office-wireless-network-installation',
  'professional-wireless-network-installation',
  'future-proof-luxury-wireless-network-marthas-vineyard',
  'luxury-home-wireless-network-marthas-vineyard',
  'marthas-vineyard-network-installations',
  'common-quick-fixes',
  'something-broken-iphone-ya-gonna-call-louis-hall',
  'malicious-ios-popups',
  'anything-apple-jingle',
  'weekly-tip-start-taking-advantage-cloud',
  'year-louis-hall-anything-apple-marthas-vineyard',
  'the-end-of-an-era',
];

// MV Towns for town pages
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

// Categories for category index pages
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
  { name: 'Lodging & Tourism', slug: 'lodging-and-tourism' },
  { name: 'Medical Services & Providers', slug: 'medical-services-and-providers' },
  { name: 'Real Estate & Rentals', slug: 'real-estate-and-rentals' },
  { name: 'Restaurants, Food & Beverages', slug: 'restaurants-food-beverages' },
  { name: 'Shopping & Specialty Retail', slug: 'shopping-and-specialty-retail' },
  { name: 'Sports & Recreation', slug: 'sports-and-recreation' },
  { name: 'Transportation & Utilities', slug: 'transportation-and-utilities' },
  { name: 'Wedding & Event Services', slug: 'wedding-and-event-services' },
];

// Category name to slug mapping
const CATEGORY_TO_SLUG = {
  'arts & entertainment': 'arts-and-entertainment',
  'automotive & marine': 'automotive-and-marine',
  'banking, finance & insurance': 'banking-finance-and-insurance',
  'beauty & wellness': 'beauty-and-wellness',
  'building & construction': 'building-and-construction',
  'business & professional services': 'business-and-professional-services',
  'family, community & government': 'family-community-government',
  'home services & trades': 'home-services-and-trades',
  'house, garden & pets': 'house-garden-and-pets',
  'lodging & tourism': 'lodging-and-tourism',
  'medical services & providers': 'medical-services-and-providers',
  'real estate & rentals': 'real-estate-and-rentals',
  'restaurants, food & beverages': 'restaurants-food-beverages',
  'shopping & specialty retail': 'shopping-and-specialty-retail',
  'sports & recreation': 'sports-and-recreation',
  'transportation & utilities': 'transportation-and-utilities',
  'wedding & event services': 'wedding-and-event-services',
};

// ============================================================
// API Functions
// ============================================================

async function fetchBusinesses() {
  try {
    // Get auth token
    const authRes = await fetch('https://anythingitech.vercel.app/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'MV_Admin_2024!' })
    });
    const { token } = await authRes.json();

    // Fetch all businesses (paginate)
    let allBusinesses = [];
    let page = 1;

    while (true) {
      const res = await fetch(`https://anythingitech.vercel.app/api/admin/businesses?page=${page}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const businesses = data.businesses || [];

      if (businesses.length === 0) break;
      allBusinesses = allBusinesses.concat(businesses);
      if (businesses.length < 100) break;
      page++;
    }

    return allBusinesses;
  } catch (err) {
    console.error('Error fetching businesses:', err.message);
    return [];
  }
}

// ============================================================
// Validation Functions
// ============================================================

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategorySlug(category) {
  if (!category) return null;
  const normalized = category.toLowerCase().trim();
  return CATEGORY_TO_SLUG[normalized] || null;
}

function getTownSlug(town) {
  if (!town) return null;
  const slug = slugify(town);
  return VALID_TOWN_SLUGS.has(slug) ? slug : null;
}

function isValidBusinessSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length < 3 || slug.length > 100) return false;

  // Check against invalid patterns
  for (const pattern of INVALID_SLUG_PATTERNS) {
    if (pattern.test(slug)) return false;
  }

  return true;
}

function isValidBusiness(biz) {
  // Must have required fields
  if (!biz.slug || !biz.town || !biz.category) return false;

  // Must be active
  if (biz.business_status === 'inactive' || biz.business_status === 'closed') return false;

  // Must not need manual review
  if (biz.needs_manual_review === 1 || biz.needs_manual_review === true) return false;

  // Must not be a duplicate
  if (biz.is_duplicate === 1 || biz.is_duplicate === true) return false;

  // Town must be valid (not unknown)
  const townSlug = getTownSlug(biz.town);
  if (!townSlug) return false;

  // Category must be valid (not other/unknown)
  const categorySlug = getCategorySlug(biz.category);
  if (!categorySlug) return false;

  // Business slug must be valid
  if (!isValidBusinessSlug(biz.slug)) return false;

  return true;
}

// ============================================================
// Sitemap Generation
// ============================================================

function generateSitemap(businesses) {
  const urls = [];
  const rejected = [];

  // Add static pages
  STATIC_PAGES.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: page.lastmod,
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  // Add tech tips
  TECH_TIP_SLUGS.forEach(slug => {
    urls.push({
      loc: `${SITE_URL}/tech-tips/${slug}`,
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: 0.6
    });
  });

  // Add town pages
  MV_TOWNS.forEach(town => {
    urls.push({
      loc: `${SITE_URL}/marthas-vineyard/${town.slug}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // Add category pages
  CATEGORIES.forEach(cat => {
    urls.push({
      loc: `${SITE_URL}/marthas-vineyard/${cat.slug}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: 0.7
    });
  });

  // Add town+category combo pages (only for combinations that have businesses)
  const townCategoryCombos = new Set();

  // Add valid business pages
  businesses.forEach(biz => {
    if (!isValidBusiness(biz)) {
      rejected.push({
        slug: biz.slug,
        reason: getRejectReason(biz)
      });
      return;
    }

    const townSlug = getTownSlug(biz.town);
    const categorySlug = getCategorySlug(biz.category);
    const lastmod = biz.updated_at ? biz.updated_at.split('T')[0] : TODAY;

    // Track town+category combos
    townCategoryCombos.add(`${townSlug}/${categorySlug}`);

    urls.push({
      loc: `${SITE_URL}/marthas-vineyard/${townSlug}/${categorySlug}/${biz.slug}`,
      lastmod: lastmod,
      changefreq: 'weekly',
      priority: 0.6
    });
  });

  // Add town+category pages for valid combinations
  townCategoryCombos.forEach(combo => {
    urls.push({
      loc: `${SITE_URL}/marthas-vineyard/${combo}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: 0.7
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return { xml, count: urls.length, rejected };
}

function getRejectReason(biz) {
  if (!biz.slug) return 'missing slug';
  if (!biz.town) return 'missing town';
  if (!biz.category) return 'missing category';
  if (biz.business_status === 'inactive') return 'inactive';
  if (biz.business_status === 'closed') return 'closed';
  if (biz.needs_manual_review) return 'needs manual review';
  if (biz.is_duplicate) return 'duplicate';
  if (!getTownSlug(biz.town)) return `invalid town: ${biz.town}`;
  if (!getCategorySlug(biz.category)) return `invalid category: ${biz.category}`;
  if (!isValidBusinessSlug(biz.slug)) return `invalid slug pattern: ${biz.slug}`;
  return 'unknown';
}

function generateRobotsTxt() {
  return `# Robots.txt for anythingitechmv.com
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /api/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
Host: anythingitechmv.com
`;
}

// ============================================================
// Validation Check
// ============================================================

function validateSitemap(xml) {
  const errors = [];

  const FORBIDDEN_PATTERNS = [
    { pattern: /\/unknown\//g, desc: '/unknown/' },
    { pattern: /\/other\//g, desc: '/other/' },
    { pattern: /\/restaurant\//g, desc: '/restaurant/ (legacy)' },
    { pattern: /\/shopping-retail\//g, desc: '/shopping-retail/ (legacy)' },
    { pattern: /\/health-wellness\//g, desc: '/health-wellness/ (legacy)' },
    { pattern: /\/professional-services\//g, desc: '/professional-services/ (legacy)' },
    { pattern: /\/community\//g, desc: '/community/ (legacy)' },
    { pattern: /\/automotive\//g, desc: '/automotive/ (legacy)' },
    { pattern: /\/lodging\//g, desc: '/lodging/ (legacy)' },
    { pattern: /http:\/\/(?!www\.sitemaps\.org)/g, desc: 'http:// (should be https)' },
    { pattern: /facebook/gi, desc: 'facebook' },
    { pattern: /instagram/gi, desc: 'instagram' },
    { pattern: /menu-vineyard-haven/gi, desc: 'menu-vineyard-haven' },
    { pattern: /redirecting/gi, desc: 'redirecting' },
    { pattern: /phillips-hardware-closed/gi, desc: 'phillips-hardware-closed' },
    { pattern: /<script/gi, desc: '<script tag' },
  ];

  for (const { pattern, desc } of FORBIDDEN_PATTERNS) {
    const matches = xml.match(pattern);
    if (matches && matches.length > 0) {
      errors.push(`Found ${matches.length} occurrence(s) of ${desc}`);
    }
  }

  return errors;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Generating sitemap.xml and robots.txt');
  console.log('='.repeat(60));
  console.log('');

  // Fetch businesses
  console.log('Fetching businesses from API...');
  const businesses = await fetchBusinesses();
  console.log(`Found ${businesses.length} total businesses in database\n`);

  // Generate sitemap
  const { xml: sitemapXml, count: urlCount, rejected } = generateSitemap(businesses);

  // Validate sitemap
  console.log('Validating sitemap...');
  const validationErrors = validateSitemap(sitemapXml);

  if (validationErrors.length > 0) {
    console.error('\n❌ VALIDATION FAILED:');
    validationErrors.forEach(err => console.error(`   - ${err}`));
    console.error('\nSitemap NOT written. Fix the issues above.\n');
    process.exit(1);
  }

  console.log('✅ Validation passed\n');

  // Generate robots.txt
  const robotsTxt = generateRobotsTxt();

  // Write files
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const robotsPath = path.join(publicDir, 'robots.txt');

  fs.writeFileSync(sitemapPath, sitemapXml);
  fs.writeFileSync(robotsPath, robotsTxt);

  // Count business URLs
  const businessUrlCount = businesses.filter(b => isValidBusiness(b)).length;

  console.log('Files generated:');
  console.log(`  ${sitemapPath}`);
  console.log(`  ${robotsPath}`);
  console.log('');
  console.log(`Sitemap contains ${urlCount} URLs:`);
  console.log(`  - Static pages: ${STATIC_PAGES.length}`);
  console.log(`  - Tech tips: ${TECH_TIP_SLUGS.length}`);
  console.log(`  - Town pages: ${MV_TOWNS.length}`);
  console.log(`  - Category pages: ${CATEGORIES.length}`);
  console.log(`  - Town+Category pages: ${new Set(businesses.filter(b => isValidBusiness(b)).map(b => `${getTownSlug(b.town)}/${getCategorySlug(b.category)}`)).size}`);
  console.log(`  - Business pages: ${businessUrlCount}`);
  console.log('');
  console.log(`Rejected ${rejected.length} businesses:`);

  // Group rejections by reason
  const rejectionCounts = {};
  rejected.forEach(r => {
    const key = r.reason.split(':')[0];
    rejectionCounts[key] = (rejectionCounts[key] || 0) + 1;
  });
  Object.entries(rejectionCounts).sort((a, b) => b[1] - a[1]).forEach(([reason, count]) => {
    console.log(`  - ${reason}: ${count}`);
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Sitemap generation complete');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

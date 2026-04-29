#!/usr/bin/env node
/**
 * Generate sitemap.xml and robots.txt for anythingitechmv.com
 *
 * Usage: node scripts/generate-sitemap.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://anythingitechmv.com';
const TODAY = new Date().toISOString().split('T')[0];

// Static pages with their priorities
const STATIC_PAGES = [
  // Homepage
  { path: '/', changefreq: 'weekly', priority: 1.0, lastmod: TODAY },

  // Service pages
  { path: '/services', changefreq: 'monthly', priority: 0.9, lastmod: TODAY },
  { path: '/services/apple-repair', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/wifi-network', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/smart-home', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/tv-audio', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/business-it', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/services/mv-app-design', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },

  // Info pages
  { path: '/about', changefreq: 'monthly', priority: 0.7, lastmod: TODAY },
  { path: '/contact', changefreq: 'monthly', priority: 0.7, lastmod: TODAY },

  // Tech Tips (blog)
  { path: '/tech-tips', changefreq: 'weekly', priority: 0.8, lastmod: TODAY },

  // Directory index
  { path: '/marthas-vineyard', changefreq: 'daily', priority: 0.9, lastmod: TODAY },
  { path: '/marthas-vineyard/submit', changefreq: 'monthly', priority: 0.5, lastmod: TODAY },
];

// Tech tip blog posts from old site
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

// Martha's Vineyard towns
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

// Business categories (slugified)
const CATEGORIES = [
  { name: 'Arts & Entertainment', slug: 'arts-entertainment' },
  { name: 'Automotive & Marine', slug: 'automotive-marine' },
  { name: 'Banking, Finance & Insurance', slug: 'banking-finance-insurance' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness' },
  { name: 'Building & Construction', slug: 'building-construction' },
  { name: 'Business & Professional Services', slug: 'business-professional-services' },
  { name: 'Family, Community & Government', slug: 'family-community-government' },
  { name: 'Home Services & Trades', slug: 'home-services-trades' },
  { name: 'House, Garden & Pets', slug: 'house-garden-pets' },
  { name: 'Lodging & Tourism', slug: 'lodging-tourism' },
  { name: 'Medical Services & Providers', slug: 'medical-services-providers' },
  { name: 'Real Estate & Rentals', slug: 'real-estate-rentals' },
  { name: 'Restaurants, Food & Beverages', slug: 'restaurants-food-beverages' },
  { name: 'Shopping & Specialty Retail', slug: 'shopping-specialty-retail' },
  { name: 'Sports & Recreation', slug: 'sports-recreation' },
  { name: 'Transportation & Utilities', slug: 'transportation-utilities' },
  { name: 'Wedding & Event Services', slug: 'wedding-event-services' },
];

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSitemap(businesses) {
  const urls = [];

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

  // Add business pages
  businesses.forEach(biz => {
    if (!biz.slug || !biz.town || !biz.category) return;
    if (biz.business_status === 'inactive' || biz.business_status === 'closed') return;

    const townSlug = slugify(biz.town);
    const categorySlug = slugify(biz.category);
    const lastmod = biz.updated_at ? biz.updated_at.split('T')[0] : TODAY;

    urls.push({
      loc: `${SITE_URL}/marthas-vineyard/${townSlug}/${categorySlug}/${biz.slug}`,
      lastmod: lastmod,
      changefreq: 'weekly',
      priority: 0.6
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

  return { xml, count: urls.length };
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
`;
}

async function main() {
  console.log('Generating sitemap.xml and robots.txt...\n');

  // Fetch businesses
  console.log('Fetching businesses from API...');
  const businesses = await fetchBusinesses();
  console.log(`Found ${businesses.length} businesses\n`);

  // Generate sitemap
  const { xml: sitemapXml, count: urlCount } = generateSitemap(businesses);

  // Generate robots.txt
  const robotsTxt = generateRobotsTxt();

  // Write files
  const publicDir = path.join(__dirname, '..', 'public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const robotsPath = path.join(publicDir, 'robots.txt');

  fs.writeFileSync(sitemapPath, sitemapXml);
  fs.writeFileSync(robotsPath, robotsTxt);

  console.log('Files generated:');
  console.log(`  ${sitemapPath}`);
  console.log(`  ${robotsPath}`);
  console.log(`\nSitemap contains ${urlCount} URLs`);
  console.log(`  - Static pages: ${STATIC_PAGES.length}`);
  console.log(`  - Tech tips: ${TECH_TIP_SLUGS.length}`);
  console.log(`  - Town pages: ${MV_TOWNS.length}`);
  console.log(`  - Category pages: ${CATEGORIES.length}`);
  console.log(`  - Business pages: ${businesses.filter(b => b.slug && b.town && b.category && b.business_status !== 'inactive' && b.business_status !== 'closed').length}`);
}

main().catch(console.error);

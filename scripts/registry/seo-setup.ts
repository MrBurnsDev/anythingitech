#!/usr/bin/env npx tsx
/**
 * SEO Setup Script
 *
 * Generates:
 * 1. Canonical URL mappings with redirect rules
 * 2. Sitemap structure (XML)
 * 3. Index page data (towns, business types, combinations)
 * 4. Vercel redirect configuration
 * 5. Migration mapping from old cPanel URLs
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/mv_registry.db');
const EXPORT_PATH = path.join(__dirname, '../../data/exports');
const PUBLIC_PATH = path.join(__dirname, '../../public');

const SITE_URL = 'https://anythingitechmv.com';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface BusinessRecord {
  id: number;
  business_name: string;
  slug: string;
  canonical_slug: string;
  town: string;
  category: string;
  short_description: string | null;
  website: string | null;
  is_duplicate: number;
}

interface TownData {
  slug: string;
  name: string;
  businessCount: number;
  categories: string[];
}

interface CategoryData {
  slug: string;
  name: string;
  pluralName: string;
  businessCount: number;
  byTown: Record<string, number>;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

// ============================================================================
// PHASE 1: CANONICAL URL STRATEGY
// ============================================================================

function generateCanonicalMappings(db: Database.Database): Map<string, string> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 1: CANONICAL URL STRATEGY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const mappings = new Map<string, string>();

  // Get all slug redirects
  const redirectsPath = path.join(EXPORT_PATH, 'slug-redirects.json');
  if (fs.existsSync(redirectsPath)) {
    const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8')) as {
      old_slug: string;
      canonical_slug: string;
    }[];

    for (const r of redirects) {
      mappings.set(r.old_slug, r.canonical_slug);
    }
    console.log(`Loaded ${mappings.size} slug redirects`);
  }

  // Get all businesses with canonical slugs
  const businesses = db.prepare(`
    SELECT id, slug, canonical_slug, town, category
    FROM businesses
    WHERE is_duplicate = 0
      AND slug IS NOT NULL
      AND canonical_slug IS NOT NULL
  `).all() as { id: number; slug: string; canonical_slug: string; town: string; category: string }[];

  // Verify slug = canonical_slug for all active records
  let mismatchCount = 0;
  for (const b of businesses) {
    if (b.slug !== b.canonical_slug) {
      console.log(`  Mismatch ID ${b.id}: slug="${b.slug}" canonical="${b.canonical_slug}"`);
      mismatchCount++;
    }
  }

  if (mismatchCount === 0) {
    console.log('✓ All active business slugs match their canonical slugs');
  } else {
    console.log(`⚠️  ${mismatchCount} businesses have slug/canonical mismatch`);
  }

  console.log(`\nCanonical URL format: ${SITE_URL}/marthas-vineyard/{town}/{category}/{slug}`);

  return mappings;
}

// ============================================================================
// PHASE 2: REDIRECT INTEGRATION
// ============================================================================

function generateRedirectRules(db: Database.Database, canonicalMappings: Map<string, string>): RedirectRule[] {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 2: REDIRECT INTEGRATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const rules: RedirectRule[] = [];

  // Load existing vercel.json redirects
  const vercelPath = path.join(__dirname, '../../vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  const existingRedirects = new Set(
    (vercelConfig.redirects || []).map((r: RedirectRule) => r.source)
  );

  // Get business type mappings for building full paths
  const categoryToType: Record<string, string> = {
    'Restaurant': 'restaurants',
    'Lodging': 'lodging',
    'Hotel': 'lodging',
    'Inn': 'lodging',
    'Retail': 'shopping',
    'Wellness': 'health-wellness',
    'Health': 'health-wellness',
    'Contractor': 'contractors',
    'Services': 'professional-services',
    'Community': 'community',
    'Gallery': 'community',
    'Farm': 'shopping',
    'Market': 'shopping',
  };

  // Get duplicate records to find their canonical targets
  const duplicates = db.prepare(`
    SELECT d.id, d.slug, d.town, d.category, d.duplicate_of_id,
           c.slug as canonical_slug, c.town as canonical_town, c.category as canonical_category
    FROM businesses d
    JOIN businesses c ON d.duplicate_of_id = c.id
    WHERE d.is_duplicate = 1
      AND d.slug IS NOT NULL
  `).all() as {
    id: number;
    slug: string;
    town: string;
    category: string;
    duplicate_of_id: number;
    canonical_slug: string;
    canonical_town: string;
    canonical_category: string;
  }[];

  console.log(`Found ${duplicates.length} duplicate records needing redirects\n`);

  for (const dup of duplicates) {
    const townSlug = dup.town.toLowerCase().replace(/\s+/g, '-');
    const canonicalTownSlug = dup.canonical_town.toLowerCase().replace(/\s+/g, '-');

    const typeSlug = categoryToType[dup.category] || 'shopping';
    const canonicalTypeSlug = categoryToType[dup.canonical_category] || 'shopping';

    const oldPath = `/marthas-vineyard/${townSlug}/${typeSlug}/${dup.slug}`;
    const canonicalPath = `/marthas-vineyard/${canonicalTownSlug}/${canonicalTypeSlug}/${dup.canonical_slug}`;

    if (!existingRedirects.has(oldPath)) {
      rules.push({
        source: oldPath,
        destination: canonicalPath,
        permanent: true
      });
      console.log(`  ${oldPath} → ${canonicalPath}`);
    }
  }

  // Add redirects from canonical mappings (if slug was historically different)
  for (const [oldSlug, canonicalSlug] of canonicalMappings) {
    // Find the business to get town/category
    const business = db.prepare(`
      SELECT town, category FROM businesses WHERE slug = ?
    `).get(canonicalSlug) as { town: string; category: string } | undefined;

    if (business) {
      const townSlug = business.town.toLowerCase().replace(/\s+/g, '-');
      const typeSlug = categoryToType[business.category] || 'shopping';

      const oldPath = `/marthas-vineyard/${townSlug}/${typeSlug}/${oldSlug}`;
      const canonicalPath = `/marthas-vineyard/${townSlug}/${typeSlug}/${canonicalSlug}`;

      if (oldPath !== canonicalPath && !existingRedirects.has(oldPath)) {
        rules.push({
          source: oldPath,
          destination: canonicalPath,
          permanent: true
        });
      }
    }
  }

  console.log(`\nGenerated ${rules.length} new redirect rules`);
  return rules;
}

// ============================================================================
// PHASE 3: INDEX PAGE DATA
// ============================================================================

function generateIndexPageData(db: Database.Database): {
  towns: TownData[];
  categories: CategoryData[];
  combinations: { town: string; category: string; count: number }[];
} {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 3: INDEX PAGE DATA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Get town statistics
  const townStats = db.prepare(`
    SELECT town, COUNT(*) as count
    FROM businesses
    WHERE is_duplicate = 0
    GROUP BY town
    ORDER BY count DESC
  `).all() as { town: string; count: number }[];

  const towns: TownData[] = townStats.map(t => ({
    slug: t.town.toLowerCase().replace(/\s+/g, '-'),
    name: t.town,
    businessCount: t.count,
    categories: []
  }));

  // Get categories for each town
  for (const town of towns) {
    const categories = db.prepare(`
      SELECT DISTINCT category
      FROM businesses
      WHERE town = ? AND is_duplicate = 0 AND category IS NOT NULL
      ORDER BY category
    `).all(town.name) as { category: string }[];
    town.categories = categories.map(c => c.category);
  }

  console.log('Towns:');
  for (const t of towns) {
    console.log(`  ${t.name}: ${t.businessCount} businesses, ${t.categories.length} categories`);
  }

  // Category type mapping
  const categoryMapping: Record<string, { slug: string; name: string; plural: string }> = {
    'Restaurant': { slug: 'restaurants', name: 'Restaurant', plural: 'Restaurants' },
    'Lodging': { slug: 'lodging', name: 'Lodging', plural: 'Lodging' },
    'Hotel': { slug: 'lodging', name: 'Lodging', plural: 'Lodging' },
    'Inn': { slug: 'lodging', name: 'Lodging', plural: 'Lodging' },
    'Retail': { slug: 'shopping', name: 'Shopping', plural: 'Shopping' },
    'Wellness': { slug: 'health-wellness', name: 'Health & Wellness', plural: 'Health & Wellness' },
    'Health': { slug: 'health-wellness', name: 'Health & Wellness', plural: 'Health & Wellness' },
    'Contractor': { slug: 'contractors', name: 'Contractor', plural: 'Contractors' },
    'Services': { slug: 'professional-services', name: 'Professional Service', plural: 'Professional Services' },
    'Community': { slug: 'community', name: 'Community', plural: 'Community' },
    'Gallery': { slug: 'community', name: 'Community', plural: 'Community' },
    'Farm': { slug: 'shopping', name: 'Shopping', plural: 'Shopping' },
    'Market': { slug: 'shopping', name: 'Shopping', plural: 'Shopping' },
  };

  // Get category statistics aggregated by type
  const categoryStats = db.prepare(`
    SELECT category, town, COUNT(*) as count
    FROM businesses
    WHERE is_duplicate = 0 AND category IS NOT NULL
    GROUP BY category, town
  `).all() as { category: string; town: string; count: number }[];

  const typeMap = new Map<string, CategoryData>();

  for (const stat of categoryStats) {
    const mapping = categoryMapping[stat.category] || { slug: 'other', name: 'Other', plural: 'Other' };
    const townSlug = stat.town.toLowerCase().replace(/\s+/g, '-');

    if (!typeMap.has(mapping.slug)) {
      typeMap.set(mapping.slug, {
        slug: mapping.slug,
        name: mapping.name,
        pluralName: mapping.plural,
        businessCount: 0,
        byTown: {}
      });
    }

    const type = typeMap.get(mapping.slug)!;
    type.businessCount += stat.count;
    type.byTown[townSlug] = (type.byTown[townSlug] || 0) + stat.count;
  }

  const categories = Array.from(typeMap.values()).sort((a, b) => b.businessCount - a.businessCount);

  console.log('\nBusiness Types:');
  for (const c of categories) {
    console.log(`  ${c.pluralName}: ${c.businessCount} businesses`);
  }

  // Generate town+category combinations
  const combinations: { town: string; category: string; count: number }[] = [];

  for (const town of towns) {
    for (const cat of categories) {
      const count = cat.byTown[town.slug] || 0;
      if (count > 0) {
        combinations.push({
          town: town.slug,
          category: cat.slug,
          count
        });
      }
    }
  }

  console.log(`\nTown/Category combinations: ${combinations.length}`);

  return { towns, categories, combinations };
}

// ============================================================================
// PHASE 4: SITEMAP GENERATION
// ============================================================================

function generateSitemaps(
  db: Database.Database,
  indexData: ReturnType<typeof generateIndexPageData>
): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 4: SITEMAP GENERATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const today = new Date().toISOString().split('T')[0];

  // Core site pages
  const corePages: SitemapEntry[] = [
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'weekly', priority: 1.0 },
    { loc: `${SITE_URL}/services`, lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${SITE_URL}/services/apple-repair`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/services/wifi-network`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/services/smart-home`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/services/tv-audio`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/services/business-it`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/about`, lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: 'monthly', priority: 0.7 },
  ];

  // Directory index page
  const directoryPages: SitemapEntry[] = [
    { loc: `${SITE_URL}/marthas-vineyard`, lastmod: today, changefreq: 'weekly', priority: 0.9 },
  ];

  // Town pages
  for (const town of indexData.towns) {
    directoryPages.push({
      loc: `${SITE_URL}/marthas-vineyard/${town.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8
    });
  }

  // Business type pages (island-wide)
  for (const cat of indexData.categories) {
    directoryPages.push({
      loc: `${SITE_URL}/marthas-vineyard/${cat.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8
    });
  }

  // Town + type combination pages
  for (const combo of indexData.combinations) {
    directoryPages.push({
      loc: `${SITE_URL}/marthas-vineyard/${combo.town}/${combo.category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    });
  }

  // Business pages
  const businessPages: SitemapEntry[] = [];
  const categoryMapping: Record<string, string> = {
    'Restaurant': 'restaurants',
    'Lodging': 'lodging',
    'Hotel': 'lodging',
    'Inn': 'lodging',
    'Retail': 'shopping',
    'Wellness': 'health-wellness',
    'Health': 'health-wellness',
    'Contractor': 'contractors',
    'Services': 'professional-services',
    'Community': 'community',
    'Gallery': 'community',
    'Farm': 'shopping',
    'Market': 'shopping',
  };

  const businesses = db.prepare(`
    SELECT canonical_slug, town, category
    FROM businesses
    WHERE is_duplicate = 0
      AND canonical_slug IS NOT NULL
      AND town IS NOT NULL
      AND category IS NOT NULL
  `).all() as { canonical_slug: string; town: string; category: string }[];

  for (const b of businesses) {
    const townSlug = b.town.toLowerCase().replace(/\s+/g, '-');
    const typeSlug = categoryMapping[b.category] || 'shopping';

    businessPages.push({
      loc: `${SITE_URL}/marthas-vineyard/${townSlug}/${typeSlug}/${b.canonical_slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6
    });
  }

  console.log(`Core pages: ${corePages.length}`);
  console.log(`Directory pages: ${directoryPages.length}`);
  console.log(`Business pages: ${businessPages.length}`);

  // Generate sitemap XML files
  const allEntries = [...corePages, ...directoryPages, ...businessPages];

  // For large sitemaps, split into index + sub-sitemaps
  if (allEntries.length > 50000) {
    console.log('\nGenerating sitemap index with sub-sitemaps...');
    // Would split here for very large sites
  }

  // Generate single sitemap
  const sitemapXml = generateSitemapXml(allEntries);
  const sitemapPath = path.join(PUBLIC_PATH, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml);
  console.log(`\n✓ Sitemap saved to: ${sitemapPath}`);
  console.log(`  Total URLs: ${allEntries.length}`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# Block duplicate/historical slugs (handled by redirects)
Disallow: /marthas-vineyard/*/*/behind-the-bookstore-edgartown
Disallow: /marthas-vineyard/*/*/chilmark-tavern-chilmark
Disallow: /marthas-vineyard/*/*/edgartowndinercom-edgartown
Disallow: /marthas-vineyard/*/*/edgartownpizzacom-edgartown
Disallow: /marthas-vineyard/*/*/iconic-marthas-vineyard-hotel-edgartown
`;

  const robotsPath = path.join(PUBLIC_PATH, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log(`✓ robots.txt saved to: ${robotsPath}`);
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(e => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// PHASE 5: MIGRATION MAPPING
// ============================================================================

interface OldSiteUrl {
  path: string;
  type: 'page' | 'blog' | 'service' | 'unknown';
  newPath: string | null;
  status: 'mapped' | 'redirect_exists' | 'needs_mapping' | 'deprecated';
}

function analyzeMigration(): OldSiteUrl[] {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 5: MIGRATION MAPPING');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Known old cPanel URLs (from WordPress site)
  const oldUrls: OldSiteUrl[] = [
    // Service pages
    { path: '/iphone-repair', type: 'service', newPath: '/services/apple-repair', status: 'redirect_exists' },
    { path: '/mac-repair-services', type: 'service', newPath: '/services/apple-repair', status: 'redirect_exists' },
    { path: '/network-services-2', type: 'service', newPath: '/services/wifi-network', status: 'redirect_exists' },
    { path: '/remote-support', type: 'service', newPath: '/services/apple-repair', status: 'redirect_exists' },

    // About/Info pages
    { path: '/about-us', type: 'page', newPath: '/about', status: 'redirect_exists' },
    { path: '/happy-clients', type: 'page', newPath: '/about', status: 'redirect_exists' },
    { path: '/network-services', type: 'page', newPath: '/about', status: 'redirect_exists' },

    // Blog posts (currently pointing to /blog which may not exist)
    { path: '/tech-tips', type: 'blog', newPath: '/blog', status: 'needs_mapping' },
    { path: '/why-i-built-is-the-ferry-running', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/wi-fi-coverage-for-large-properties', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/office-wireless-network-installation', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/professional-wireless-network-installation', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/future-proof-luxury-wireless-network-marthas-vineyard', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/luxury-home-wireless-network-marthas-vineyard', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/marthas-vineyard-network-installations', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/common-quick-fixes', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/something-broken-iphone-ya-gonna-call-louis-hall', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/malicious-ios-popups', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/anything-apple-jingle', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/weekly-tip-start-taking-advantage-cloud', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/year-louis-hall-anything-apple-marthas-vineyard', type: 'blog', newPath: null, status: 'needs_mapping' },
    { path: '/the-end-of-an-era', type: 'blog', newPath: null, status: 'needs_mapping' },

    // Feed
    { path: '/feed', type: 'unknown', newPath: '/', status: 'redirect_exists' },

    // Home variants that may be hitting /home
    { path: '/home', type: 'page', newPath: '/', status: 'needs_mapping' },
    { path: '/index.php', type: 'page', newPath: '/', status: 'needs_mapping' },
    { path: '/index.html', type: 'page', newPath: '/', status: 'mapped' },
  ];

  // Analyze status
  const mapped = oldUrls.filter(u => u.status === 'mapped' || u.status === 'redirect_exists');
  const needsMapping = oldUrls.filter(u => u.status === 'needs_mapping');

  console.log(`Total old URLs tracked: ${oldUrls.length}`);
  console.log(`Already mapped/redirected: ${mapped.length}`);
  console.log(`Needs mapping: ${needsMapping.length}\n`);

  console.log('URLs needing attention:');
  for (const url of needsMapping) {
    console.log(`  ${url.path} (${url.type})`);
    if (url.type === 'blog') {
      // Suggest redirecting blog posts to services or about
      const suggestion = url.path.includes('network') || url.path.includes('wifi') || url.path.includes('wireless')
        ? '/services/wifi-network'
        : url.path.includes('iphone') || url.path.includes('apple')
        ? '/services/apple-repair'
        : '/about';
      console.log(`    → Suggested: ${suggestion}`);
    }
  }

  return oldUrls;
}

function generateVercelRedirects(
  existingRedirects: RedirectRule[],
  newRedirects: RedirectRule[],
  migrationUrls: OldSiteUrl[]
): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  GENERATING VERCEL REDIRECT CONFIG');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Load existing vercel.json
  const vercelPath = path.join(__dirname, '../../vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));

  // Get existing sources to avoid duplicates
  const existingSources = new Set(
    (vercelConfig.redirects || []).map((r: RedirectRule) => r.source)
  );

  // Add new redirects
  const addedRedirects: RedirectRule[] = [];

  for (const r of newRedirects) {
    if (!existingSources.has(r.source)) {
      addedRedirects.push(r);
      existingSources.add(r.source);
    }
  }

  // Add /home redirect if not present
  if (!existingSources.has('/home')) {
    addedRedirects.push({
      source: '/home',
      destination: '/',
      permanent: true
    });
  }

  // Add index.php redirect if not present
  if (!existingSources.has('/index.php')) {
    addedRedirects.push({
      source: '/index.php',
      destination: '/',
      permanent: true
    });
  }

  console.log(`Adding ${addedRedirects.length} new redirects to vercel.json\n`);

  // Update config
  vercelConfig.redirects = [
    ...(vercelConfig.redirects || []),
    ...addedRedirects.map(r => ({
      source: r.source,
      destination: r.destination,
      permanent: r.permanent
    }))
  ];

  // Save updated vercel.json
  fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
  console.log(`✓ Updated vercel.json with ${vercelConfig.redirects.length} total redirects`);

  // Save redirect rules to exports for reference
  const redirectsExportPath = path.join(EXPORT_PATH, 'all-redirects.json');
  fs.writeFileSync(redirectsExportPath, JSON.stringify(vercelConfig.redirects, null, 2));
  console.log(`✓ Saved redirect manifest to ${redirectsExportPath}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - SEO SETUP');
  console.log('═══════════════════════════════════════════════════════════════');

  const db = new Database(DB_PATH);

  // Phase 1: Canonical URL Strategy
  const canonicalMappings = generateCanonicalMappings(db);

  // Phase 2: Redirect Integration
  const redirectRules = generateRedirectRules(db, canonicalMappings);

  // Phase 3: Index Page Data
  const indexData = generateIndexPageData(db);

  // Save index data for frontend
  const indexDataPath = path.join(EXPORT_PATH, 'index-pages.json');
  fs.writeFileSync(indexDataPath, JSON.stringify(indexData, null, 2));
  console.log(`\n✓ Index page data saved to ${indexDataPath}`);

  // Phase 4: Sitemap Generation
  generateSitemaps(db, indexData);

  // Phase 5: Migration Mapping
  const migrationUrls = analyzeMigration();

  // Generate final Vercel config
  generateVercelRedirects([], redirectRules, migrationUrls);

  // Final summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  SEO SETUP SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Canonical mappings:     ${canonicalMappings.size}`);
  console.log(`  New redirect rules:     ${redirectRules.length}`);
  console.log(`  Town pages:             ${indexData.towns.length}`);
  console.log(`  Category pages:         ${indexData.categories.length}`);
  console.log(`  Town+Category combos:   ${indexData.combinations.length}`);
  console.log(`  Migration URLs tracked: ${migrationUrls.length}`);
  console.log('═══════════════════════════════════════════════════════════════');

  db.close();
}

main();

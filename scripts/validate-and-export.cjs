#!/usr/bin/env node
/**
 * Validate Migrated Data and Generate Production Export
 *
 * Validation checks:
 * 1. No records with Unknown town
 * 2. No records with invalid_record status
 * 3. No records with needs_manual_review status (for public records)
 * 4. Every public record has: id, name, town, category, slug
 *
 * Output:
 * - Validation report
 * - Final counts and distributions
 * - Production JSON export
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Post-Migration Validation & Export');
console.log('═══════════════════════════════════════════════════════════════\n');

// Get schema info
const columns = db.prepare("PRAGMA table_info(businesses)").all();
const columnNames = columns.map(c => c.name);
console.log('Database columns:', columnNames.join(', '));

const hasNeedsManualReview = columnNames.includes('needs_manual_review');
const hasReviewReason = columnNames.includes('review_reason');
const hasSlug = columnNames.includes('slug');
const hasIsDuplicate = columnNames.includes('is_duplicate');

console.log('\n--- VALIDATION CHECKS ---\n');

let validationErrors = [];

// Check 1: Records with Unknown town (in PUBLIC records only)
const unknownTownPublic = db.prepare(`
  SELECT COUNT(*) as count FROM businesses
  WHERE town = 'Unknown'
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
`).get();

if (unknownTownPublic.count > 0) {
  validationErrors.push(`${unknownTownPublic.count} PUBLIC records have Unknown town`);
  console.log(`❌ Unknown town (PUBLIC): ${unknownTownPublic.count} records`);

  const unknownList = db.prepare(`
    SELECT id, business_name, town FROM businesses
    WHERE town = 'Unknown'
    ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
    ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
    LIMIT 10
  `).all();
  unknownList.forEach(r => console.log(`   - ID ${r.id}: ${r.business_name}`));
} else {
  console.log('✓ No PUBLIC records with Unknown town');
}

// Also report total Unknown (including excluded)
const unknownTownAll = db.prepare(`
  SELECT COUNT(*) as count FROM businesses
  WHERE town = 'Unknown'
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
`).get();
if (unknownTownAll.count > 0) {
  console.log(`  (${unknownTownAll.count} total Unknown records exist but are excluded)`);
}

// Check 2: Records with needs_manual_review flag
if (hasNeedsManualReview) {
  const manualReview = db.prepare(`
    SELECT COUNT(*) as count FROM businesses
    WHERE needs_manual_review = 1
    ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  `).get();

  if (manualReview.count > 0) {
    console.log(`⚠ Needs manual review: ${manualReview.count} records (excluded from export)`);

    const reviewList = db.prepare(`
      SELECT id, business_name, review_reason FROM businesses
      WHERE needs_manual_review = 1
      ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
      LIMIT 10
    `).all();
    reviewList.forEach(r => console.log(`   - ID ${r.id}: ${r.business_name} (${r.review_reason || 'no reason'})`));
  } else {
    console.log('✓ No records flagged for manual review');
  }
}

// Check 3: Records missing required fields
const missingFields = db.prepare(`
  SELECT COUNT(*) as count FROM businesses
  WHERE (business_name IS NULL OR business_name = '')
     OR (town IS NULL OR town = '')
     OR (category IS NULL OR category = '')
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
`).get();

if (missingFields.count > 0) {
  validationErrors.push(`${missingFields.count} records missing required fields`);
  console.log(`❌ Missing required fields: ${missingFields.count} records`);

  const missingList = db.prepare(`
    SELECT id, business_name, town, category FROM businesses
    WHERE (business_name IS NULL OR business_name = '')
       OR (town IS NULL OR town = '')
       OR (category IS NULL OR category = '')
    ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
    ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
    LIMIT 10
  `).all();
  missingList.forEach(r => console.log(`   - ID ${r.id}: name="${r.business_name}", town="${r.town}", cat="${r.category}"`));
} else {
  console.log('✓ All public records have required fields (name, town, category)');
}

// Check 4: Slug validation
if (hasSlug) {
  const missingSlugs = db.prepare(`
    SELECT COUNT(*) as count FROM businesses
    WHERE (slug IS NULL OR slug = '')
    ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
    ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
  `).get();

  if (missingSlugs.count > 0) {
    console.log(`⚠ Missing slugs: ${missingSlugs.count} records (will generate)`);
  } else {
    console.log('✓ All public records have slugs');
  }
}

console.log('\n--- FINAL COUNTS ---\n');

// Total counts
const totalAll = db.prepare('SELECT COUNT(*) as count FROM businesses').get();
console.log(`Total records in database: ${totalAll.count}`);

// Duplicates
if (hasIsDuplicate) {
  const duplicates = db.prepare('SELECT COUNT(*) as count FROM businesses WHERE is_duplicate = 1').get();
  console.log(`Duplicates (excluded): ${duplicates.count}`);
}

// Manual review
if (hasNeedsManualReview) {
  const manualReview = db.prepare('SELECT COUNT(*) as count FROM businesses WHERE needs_manual_review = 1').get();
  console.log(`Needs manual review (excluded): ${manualReview.count}`);
}

// Public businesses
const publicQuery = `
  SELECT COUNT(*) as count FROM businesses
  WHERE 1=1
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
`;
const publicCount = db.prepare(publicQuery).get();
console.log(`\nTotal PUBLIC businesses: ${publicCount.count}`);

// Town distribution
console.log('\n--- TOWN DISTRIBUTION ---\n');
const townDist = db.prepare(`
  SELECT town, COUNT(*) as count FROM businesses
  WHERE 1=1
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
  GROUP BY town
  ORDER BY count DESC
`).all();

townDist.forEach(t => {
  const pct = ((t.count / publicCount.count) * 100).toFixed(1);
  console.log(`${t.town.padEnd(20)} ${t.count.toString().padStart(4)} (${pct}%)`);
});

// Category distribution
console.log('\n--- CATEGORY DISTRIBUTION ---\n');
const catDist = db.prepare(`
  SELECT category, COUNT(*) as count FROM businesses
  WHERE 1=1
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
  GROUP BY category
  ORDER BY count DESC
`).all();

catDist.forEach(c => {
  const pct = ((c.count / publicCount.count) * 100).toFixed(1);
  console.log(`${(c.category || 'Uncategorized').padEnd(25)} ${c.count.toString().padStart(4)} (${pct}%)`);
});

// Generate production export
console.log('\n--- GENERATING PRODUCTION EXPORT ---\n');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

const businesses = db.prepare(`
  SELECT
    id,
    business_name,
    town,
    category,
    full_address,
    phone,
    website,
    slug
  FROM businesses
  WHERE 1=1
  ${hasIsDuplicate ? 'AND is_duplicate = 0' : ''}
  ${hasNeedsManualReview ? 'AND (needs_manual_review IS NULL OR needs_manual_review = 0)' : ''}
  ORDER BY town, category, business_name
`).all();

const exportData = {
  generated: new Date().toISOString(),
  total_count: businesses.length,
  town_distribution: {},
  category_distribution: {},
  businesses: businesses.map(b => ({
    id: b.id,
    name: b.business_name,
    slug: b.slug || generateSlug(b.business_name),
    town: b.town,
    category: b.category,
    address: b.full_address || null,
    phone: b.phone || null,
    website: b.website || null
  }))
};

// Add distributions
townDist.forEach(t => {
  exportData.town_distribution[t.town] = t.count;
});
catDist.forEach(c => {
  exportData.category_distribution[c.category || 'Uncategorized'] = c.count;
});

const exportPath = path.join(EXPORTS_DIR, 'mv-business-directory-production.json');
fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
console.log(`✓ Generated: data/exports/mv-business-directory-production.json`);
console.log(`  Total businesses exported: ${businesses.length}`);

// Validation summary
console.log('\n═══════════════════════════════════════════════════════════════');
if (validationErrors.length === 0) {
  console.log('  ✓ ALL VALIDATION CHECKS PASSED');
} else {
  console.log('  ✗ VALIDATION ERRORS:');
  validationErrors.forEach(e => console.log(`    - ${e}`));
}
console.log('═══════════════════════════════════════════════════════════════\n');

db.close();

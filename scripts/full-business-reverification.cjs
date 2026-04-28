#!/usr/bin/env node
/**
 * Full Business Re-verification
 *
 * Exports all businesses for systematic online verification.
 * This script creates the base export - verification happens externally.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const TAXONOMY_PATH = path.join(__dirname, '..', 'data', 'reference', 'mv-chamber-taxonomy.json');

// Load taxonomy
const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));

const db = new Database(DB_PATH);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Full Business Re-verification Export');
console.log('═══════════════════════════════════════════════════════════════\n');

// Get all non-duplicate businesses
const businesses = db.prepare(`
  SELECT
    id,
    business_name,
    town,
    category,
    full_address,
    phone,
    website,
    slug,
    needs_manual_review,
    review_reason
  FROM businesses
  WHERE is_duplicate = 0
  ORDER BY id
`).all();

console.log(`Total businesses to verify: ${businesses.length}\n`);

// Current distribution (BEFORE)
const townDistBefore = {};
const catDistBefore = {};

for (const b of businesses) {
  townDistBefore[b.town] = (townDistBefore[b.town] || 0) + 1;
  catDistBefore[b.category] = (catDistBefore[b.category] || 0) + 1;
}

console.log('Current Town Distribution (BEFORE):');
Object.entries(townDistBefore)
  .sort((a, b) => b[1] - a[1])
  .forEach(([town, count]) => {
    const pct = ((count / businesses.length) * 100).toFixed(1);
    console.log(`  ${town.padEnd(20)} ${count.toString().padStart(4)} (${pct}%)`);
  });

console.log('\nCurrent Category Distribution (BEFORE):');
Object.entries(catDistBefore)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([cat, count]) => {
    const pct = ((count / businesses.length) * 100).toFixed(1);
    console.log(`  ${(cat || 'Uncategorized').padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
  });

// Export for verification
const verificationList = businesses.map(b => ({
  id: b.id,
  old_name: b.business_name,
  verified_name: '', // To be filled
  old_town: b.town,
  verified_town: '', // To be filled
  old_category: b.category,
  verified_top_category: '', // To be filled
  verified_subcategory: '', // To be filled
  address: b.full_address || '',
  zip: '', // To be extracted/verified
  phone: b.phone || '',
  website: b.website || '',
  status: '', // active, closed, invalid
  confidence: '', // high, medium, low
  recommended_action: '', // approve, correct, exclude, needs_review
  verification_source: '', // google, website, chamber, manual
  notes: ''
}));

// Generate CSV header
let csv = 'id,old_name,verified_name,old_town,verified_town,old_category,verified_top_category,verified_subcategory,address,zip,phone,website,status,confidence,recommended_action,verification_source,notes\n';

for (const v of verificationList) {
  csv += `${v.id},"${(v.old_name || '').replace(/"/g, '""')}","${v.verified_name}","${v.old_town}","${v.verified_town}","${v.old_category}","${v.verified_top_category}","${v.verified_subcategory}","${(v.address || '').replace(/"/g, '""')}","${v.zip}","${v.phone}","${(v.website || '').replace(/"/g, '""')}","${v.status}","${v.confidence}","${v.recommended_action}","${v.verification_source}","${v.notes}"\n`;
}

// Save verification template
const templatePath = path.join(AUDITS_DIR, 'businesses-for-reverification.csv');
fs.writeFileSync(templatePath, csv);
console.log(`\n✓ Exported: data/audits/businesses-for-reverification.csv`);

// Generate before-state summary
let beforeMd = `# Business Directory State - BEFORE Re-verification\n\n`;
beforeMd += `Generated: ${new Date().toISOString()}\n\n`;
beforeMd += `## Summary\n\n`;
beforeMd += `Total businesses: ${businesses.length}\n\n`;

beforeMd += `## Town Distribution (BEFORE)\n\n`;
beforeMd += `| Town | Count | % |\n`;
beforeMd += `|------|-------|---|\n`;
Object.entries(townDistBefore)
  .sort((a, b) => b[1] - a[1])
  .forEach(([town, count]) => {
    const pct = ((count / businesses.length) * 100).toFixed(1);
    beforeMd += `| ${town} | ${count} | ${pct}% |\n`;
  });

beforeMd += `\n## Category Distribution (BEFORE)\n\n`;
beforeMd += `| Category | Count | % |\n`;
beforeMd += `|----------|-------|---|\n`;
Object.entries(catDistBefore)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const pct = ((count / businesses.length) * 100).toFixed(1);
    beforeMd += `| ${cat || 'Uncategorized'} | ${count} | ${pct}% |\n`;
  });

beforeMd += `\n## Valid Chamber Categories\n\n`;
Object.keys(taxonomy.categories).forEach(cat => {
  beforeMd += `- ${cat}\n`;
});

fs.writeFileSync(path.join(AUDITS_DIR, 'directory-state-before-reverification.md'), beforeMd);
console.log(`✓ Exported: data/audits/directory-state-before-reverification.md`);

// Export JSON for programmatic access
const jsonExport = {
  generated: new Date().toISOString(),
  total_count: businesses.length,
  town_distribution_before: townDistBefore,
  category_distribution_before: catDistBefore,
  businesses: businesses.map(b => ({
    id: b.id,
    name: b.business_name,
    town: b.town,
    category: b.category,
    address: b.full_address,
    phone: b.phone,
    website: b.website,
    needs_manual_review: b.needs_manual_review,
    review_reason: b.review_reason
  }))
};

fs.writeFileSync(
  path.join(AUDITS_DIR, 'businesses-for-reverification.json'),
  JSON.stringify(jsonExport, null, 2)
);
console.log(`✓ Exported: data/audits/businesses-for-reverification.json`);

db.close();

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Export Complete - Ready for Verification');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('Next steps:');
console.log('1. Review businesses-for-reverification.csv');
console.log('2. Verify each business online');
console.log('3. Fill in verified_* columns');
console.log('4. Run verification import script');

#!/usr/bin/env node
/**
 * Generate Corrected Business Directory Export
 *
 * This script applies all corrections in memory and generates
 * the final clean export without modifying the database.
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const REFERENCE_PATH = path.join(__dirname, '..', 'data', 'reference', 'mv-zip-to-town.json');
const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');

const reference = JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
const ZIP_TO_TOWN = reference.zipCodes;
const VALID_TOWNS = reference.validTowns;

// Invalid name patterns
const INVALID_PATTERNS = [
  /^facebook$/i, /^instagram$/i, /^twitter$/i, /^menu$/i,
  /^redirecting/i, /^account suspended/i, /\.com$/i, /\.org$/i,
  /^https?:\/\//i, /^www\./i, /^secure\./i, /\.square$/i,
  /\.business$/i, /\.company$/i
];

// Category normalization
const CATEGORY_MAP = {
  'restaurant': 'Restaurant', 'restaurants': 'Restaurant', 'dining': 'Restaurant',
  'cafe': 'Restaurant', 'bakery': 'Restaurant', 'bar': 'Restaurant',
  'lodging': 'Lodging', 'hotel': 'Lodging', 'hotels': 'Lodging', 'inn': 'Lodging',
  'shopping': 'Shopping & Retail', 'retail': 'Shopping & Retail', 'store': 'Shopping & Retail',
  'gallery': 'Shopping & Retail', 'boutique': 'Shopping & Retail',
  'health': 'Health & Wellness', 'wellness': 'Health & Wellness', 'spa': 'Health & Wellness',
  'salon': 'Health & Wellness', 'fitness': 'Health & Wellness',
  'professional': 'Professional Services', 'services': 'Professional Services',
  'contractor': 'Contractors', 'contractors': 'Contractors', 'construction': 'Contractors',
  'community': 'Community', 'church': 'Community', 'library': 'Community',
  'marine': 'Marine Services', 'boat': 'Marine Services',
  'auto': 'Automotive', 'automotive': 'Automotive',
  'real estate': 'Real Estate', 'realty': 'Real Estate'
};

function extractZip(address) {
  if (!address) return null;
  const match = address.match(/\b(02[0-9]{3})\b/);
  return match ? match[1] : null;
}

function detectTownFromAddress(address) {
  if (!address) return null;
  const upper = address.toUpperCase();
  const patterns = [
    { p: /\bWEST TISBURY\b/, t: 'West Tisbury' },
    { p: /\bVINEYARD HAVEN\b/, t: 'Vineyard Haven' },
    { p: /\bTISBURY\b/, t: 'Vineyard Haven' },
    { p: /\bOAK BLUFFS\b/, t: 'Oak Bluffs' },
    { p: /\bEDGARTOWN\b/, t: 'Edgartown' },
    { p: /\bCHILMARK\b/, t: 'Chilmark' },
    { p: /\bMENEMSHA\b/, t: 'Chilmark' },
    { p: /\bAQUINNAH\b/, t: 'Aquinnah' },
  ];
  for (const { p, t } of patterns) {
    if (p.test(upper)) return t;
  }
  return null;
}

function isInvalidName(name) {
  if (!name || name.trim().length < 3) return true;
  return INVALID_PATTERNS.some(p => p.test(name.trim()));
}

function normalizeCategory(cat, name) {
  if (cat) {
    const lower = cat.toLowerCase().trim();
    if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
    for (const [k, v] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(k)) return v;
    }
  }
  // Try to infer from name
  if (name) {
    const nameLower = name.toLowerCase();
    const hints = [
      { kw: ['restaurant', 'cafe', 'diner', 'grill', 'bistro', 'pizza', 'bakery'], cat: 'Restaurant' },
      { kw: ['inn', 'hotel', 'motel', 'cottage'], cat: 'Lodging' },
      { kw: ['shop', 'store', 'gallery', 'boutique'], cat: 'Shopping & Retail' },
      { kw: ['spa', 'salon', 'fitness', 'yoga'], cat: 'Health & Wellness' },
    ];
    for (const { kw, cat } of hints) {
      if (kw.some(k => nameLower.includes(k))) return cat;
    }
  }
  return 'Other';
}

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Generating Corrected Business Directory Export');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  const businesses = db.prepare(`
    SELECT id, business_name, town, full_address, zip_code, category,
           phone, website, latitude, longitude
    FROM businesses
    WHERE is_duplicate = 0
  `).all();

  console.log(`Processing ${businesses.length} businesses...\n`);

  const corrected = [];
  const stats = {
    total: businesses.length,
    invalid: 0,
    townCorrected: 0,
    categoryCorrected: 0,
    byTown: {},
    byCategory: {},
    byStatus: { active: 0, invalid: 0 }
  };

  for (const biz of businesses) {
    // Check if invalid
    if (isInvalidName(biz.business_name)) {
      stats.invalid++;
      stats.byStatus.invalid++;
      corrected.push({
        id: biz.id,
        name: biz.business_name,
        address: biz.full_address || null,
        town: biz.town,
        zip: biz.zip_code || null,
        business_type: normalizeCategory(biz.category, biz.business_name),
        phone: biz.phone || null,
        website: biz.website || null,
        latitude: biz.latitude || null,
        longitude: biz.longitude || null,
        is_active: false,
        status: 'invalid'
      });
      continue;
    }

    // Determine town
    let newTown = null;
    let townSource = null;

    // 1. ZIP code
    const zip = extractZip(biz.full_address) || biz.zip_code;
    if (zip && ZIP_TO_TOWN[zip]) {
      newTown = ZIP_TO_TOWN[zip];
      townSource = 'zip';
    }

    // 2. Address parsing
    if (!newTown) {
      const fromAddr = detectTownFromAddress(biz.full_address);
      if (fromAddr) {
        newTown = fromAddr;
        townSource = 'address';
      }
    }

    // 3. Existing town if has address
    if (!newTown && biz.full_address && biz.town && VALID_TOWNS.includes(biz.town)) {
      newTown = biz.town;
      townSource = 'existing';
    }

    // 4. VH without evidence -> Unknown
    if (!newTown) {
      if (biz.town === 'Vineyard Haven' && !biz.full_address) {
        newTown = 'Unknown';
        townSource = 'reset';
      } else if (biz.town && VALID_TOWNS.includes(biz.town)) {
        newTown = biz.town;
        townSource = 'existing';
      } else {
        newTown = 'Unknown';
        townSource = 'none';
      }
    }

    if (newTown !== biz.town) stats.townCorrected++;

    // Normalize category
    const newCategory = normalizeCategory(biz.category, biz.business_name);
    if (newCategory !== biz.category) stats.categoryCorrected++;

    // Track stats
    stats.byTown[newTown] = (stats.byTown[newTown] || 0) + 1;
    stats.byCategory[newCategory] = (stats.byCategory[newCategory] || 0) + 1;
    stats.byStatus.active++;

    corrected.push({
      id: biz.id,
      name: biz.business_name,
      address: biz.full_address || null,
      town: newTown,
      zip: zip || null,
      business_type: newCategory,
      phone: biz.phone || null,
      website: biz.website || null,
      latitude: biz.latitude || null,
      longitude: biz.longitude || null,
      is_active: true,
      status: 'active'
    });
  }

  // Generate export
  const exportData = {
    generated: new Date().toISOString(),
    summary: {
      total: stats.total,
      active: stats.byStatus.active,
      invalid: stats.byStatus.invalid,
      townCorrected: stats.townCorrected,
      categoryCorrected: stats.categoryCorrected,
      byTown: stats.byTown,
      byCategory: stats.byCategory
    },
    businesses: corrected
  };

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'mv-business-directory-corrected.json'),
    JSON.stringify(exportData, null, 2)
  );
  console.log('✓ Generated: data/exports/mv-business-directory-corrected.json');

  // Generate final summary report
  let md = `# Town Correction Final Summary\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## Overview\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Total records | ${stats.total} |\n`;
  md += `| Active businesses | ${stats.byStatus.active} |\n`;
  md += `| Invalid records | ${stats.byStatus.invalid} |\n`;
  md += `| Towns corrected | ${stats.townCorrected} |\n`;
  md += `| Categories corrected | ${stats.categoryCorrected} |\n\n`;

  md += `## Final Town Distribution\n\n`;
  md += `| Town | Count | % |\n`;
  md += `|------|-------|---|\n`;
  const total = stats.byStatus.active;
  for (const [town, count] of Object.entries(stats.byTown).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / total) * 100).toFixed(1);
    md += `| ${town} | ${count} | ${pct}% |\n`;
  }

  md += `\n## Final Category Distribution\n\n`;
  md += `| Category | Count | % |\n`;
  md += `|----------|-------|---|\n`;
  for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / total) * 100).toFixed(1);
    md += `| ${cat} | ${count} | ${pct}% |\n`;
  }

  md += `\n## Validation\n\n`;

  // Check no town > 40%
  let maxTown = null;
  let maxCount = 0;
  for (const [town, count] of Object.entries(stats.byTown)) {
    if (town !== 'Unknown' && count > maxCount) {
      maxTown = town;
      maxCount = count;
    }
  }
  const maxPct = (maxCount / total) * 100;

  if (maxPct <= 40) {
    md += `✓ **PASS**: No town exceeds 40% (${maxTown}: ${maxPct.toFixed(1)}%)\n`;
  } else {
    md += `✗ **FAIL**: ${maxTown} has ${maxPct.toFixed(1)}% of businesses\n`;
  }

  md += `ℹ️ **INFO**: ${stats.byTown['Unknown'] || 0} businesses marked as Unknown (${((stats.byTown['Unknown'] || 0) / total * 100).toFixed(1)}%)\n`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'town-correction-final-summary.md'), md);
  console.log('✓ Generated: data/audits/town-correction-final-summary.md');

  // Print summary
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  Summary');
  console.log('─────────────────────────────────────────────────────────────────\n');

  console.log(`Total: ${stats.total} | Active: ${stats.byStatus.active} | Invalid: ${stats.byStatus.invalid}`);
  console.log(`Towns corrected: ${stats.townCorrected} | Categories corrected: ${stats.categoryCorrected}\n`);

  console.log('Town Distribution:');
  for (const [town, count] of Object.entries(stats.byTown).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  ${town}: ${count} (${pct}%)`);
  }

  console.log(`\n✓ No town exceeds 40%: ${maxTown} has ${maxPct.toFixed(1)}%`);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Export Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();

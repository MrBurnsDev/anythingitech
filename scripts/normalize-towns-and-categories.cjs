#!/usr/bin/env node
/**
 * Phase 2: Deterministic Town and Category Normalization
 *
 * This script corrects town assignments using deterministic rules:
 * 1. ZIP code mapping (highest priority)
 * 2. Address string parsing
 * 3. Geocoding fallback (if API key provided)
 * 4. Mark as "Unknown" if undetermined
 *
 * CRITICAL: Does NOT default to Vineyard Haven
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const REFERENCE_PATH = path.join(__dirname, '..', 'data', 'reference', 'mv-zip-to-town.json');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Load reference data
const reference = JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
const ZIP_TO_TOWN = reference.zipCodes;
const VALID_TOWNS = reference.validTowns;
const TOWN_ALIASES = reference.townAliases;

// Controlled category list
const CONTROLLED_CATEGORIES = [
  'Restaurant',
  'Lodging',
  'Shopping & Retail',
  'Health & Wellness',
  'Professional Services',
  'Contractors',
  'Community',
  'Marine Services',
  'Automotive',
  'Real Estate',
  'Healthcare',
  'Arts & Entertainment',
  'Other'
];

// Category mapping from various inputs to controlled categories
const CATEGORY_MAPPING = {
  // Restaurants
  'restaurant': 'Restaurant',
  'restaurants': 'Restaurant',
  'dining': 'Restaurant',
  'cafe': 'Restaurant',
  'coffee': 'Restaurant',
  'bakery': 'Restaurant',
  'bar': 'Restaurant',
  'pub': 'Restaurant',
  'food': 'Restaurant',
  'seafood': 'Restaurant',
  'pizza': 'Restaurant',
  'ice cream': 'Restaurant',
  'deli': 'Restaurant',
  'bistro': 'Restaurant',
  'tavern': 'Restaurant',
  'grill': 'Restaurant',

  // Lodging
  'lodging': 'Lodging',
  'hotel': 'Lodging',
  'hotels': 'Lodging',
  'inn': 'Lodging',
  'inns': 'Lodging',
  'motel': 'Lodging',
  'resort': 'Lodging',
  'b&b': 'Lodging',
  'bed and breakfast': 'Lodging',
  'cottage': 'Lodging',
  'cottages': 'Lodging',
  'rental': 'Lodging',
  'vacation rental': 'Lodging',
  'hostel': 'Lodging',
  'guest house': 'Lodging',

  // Shopping & Retail
  'shopping': 'Shopping & Retail',
  'retail': 'Shopping & Retail',
  'shopping & retail': 'Shopping & Retail',
  'store': 'Shopping & Retail',
  'shop': 'Shopping & Retail',
  'boutique': 'Shopping & Retail',
  'gallery': 'Shopping & Retail',
  'galleries': 'Shopping & Retail',
  'gifts': 'Shopping & Retail',
  'clothing': 'Shopping & Retail',
  'jewelry': 'Shopping & Retail',
  'antiques': 'Shopping & Retail',
  'books': 'Shopping & Retail',
  'bookstore': 'Shopping & Retail',
  'market': 'Shopping & Retail',
  'hardware': 'Shopping & Retail',

  // Health & Wellness
  'health': 'Health & Wellness',
  'wellness': 'Health & Wellness',
  'health & wellness': 'Health & Wellness',
  'spa': 'Health & Wellness',
  'salon': 'Health & Wellness',
  'fitness': 'Health & Wellness',
  'gym': 'Health & Wellness',
  'yoga': 'Health & Wellness',
  'massage': 'Health & Wellness',
  'therapy': 'Health & Wellness',
  'barber': 'Health & Wellness',

  // Healthcare
  'healthcare': 'Healthcare',
  'medical': 'Healthcare',
  'doctor': 'Healthcare',
  'dental': 'Healthcare',
  'dentist': 'Healthcare',
  'pharmacy': 'Healthcare',
  'clinic': 'Healthcare',
  'hospital': 'Healthcare',

  // Professional Services
  'professional': 'Professional Services',
  'professional services': 'Professional Services',
  'services': 'Professional Services',
  'law': 'Professional Services',
  'attorney': 'Professional Services',
  'legal': 'Professional Services',
  'accounting': 'Professional Services',
  'accountant': 'Professional Services',
  'insurance': 'Professional Services',
  'financial': 'Professional Services',
  'bank': 'Professional Services',
  'banking': 'Professional Services',
  'consulting': 'Professional Services',
  'photography': 'Professional Services',
  'photographer': 'Professional Services',

  // Contractors
  'contractor': 'Contractors',
  'contractors': 'Contractors',
  'construction': 'Contractors',
  'plumbing': 'Contractors',
  'plumber': 'Contractors',
  'electric': 'Contractors',
  'electrician': 'Contractors',
  'roofing': 'Contractors',
  'landscaping': 'Contractors',
  'landscaper': 'Contractors',
  'painting': 'Contractors',
  'painter': 'Contractors',
  'carpentry': 'Contractors',
  'carpenter': 'Contractors',
  'hvac': 'Contractors',
  'building': 'Contractors',

  // Real Estate
  'real estate': 'Real Estate',
  'realty': 'Real Estate',
  'property': 'Real Estate',

  // Automotive
  'automotive': 'Automotive',
  'auto': 'Automotive',
  'car': 'Automotive',
  'vehicle': 'Automotive',
  'mechanic': 'Automotive',
  'tire': 'Automotive',
  'gas station': 'Automotive',

  // Marine Services
  'marine': 'Marine Services',
  'boat': 'Marine Services',
  'sailing': 'Marine Services',
  'fishing': 'Marine Services',
  'charter': 'Marine Services',
  'marina': 'Marine Services',
  'yacht': 'Marine Services',

  // Arts & Entertainment
  'arts': 'Arts & Entertainment',
  'entertainment': 'Arts & Entertainment',
  'museum': 'Arts & Entertainment',
  'theater': 'Arts & Entertainment',
  'theatre': 'Arts & Entertainment',
  'music': 'Arts & Entertainment',
  'art': 'Arts & Entertainment',

  // Community
  'community': 'Community',
  'church': 'Community',
  'library': 'Community',
  'school': 'Community',
  'nonprofit': 'Community',
  'association': 'Community',
  'foundation': 'Community',
  'town': 'Community',
  'government': 'Community',

  // Other
  'other': 'Other',
  'unknown': 'Other',
  '': 'Other'
};

/**
 * Extract ZIP code from address string
 */
function extractZipCode(address) {
  if (!address) return null;

  // Match 5-digit ZIP, optionally with -4 extension
  const zipMatch = address.match(/\b(02[0-9]{3})(?:-\d{4})?\b/);
  if (zipMatch) {
    return zipMatch[1];
  }

  // Also check zip_code field format
  const altMatch = address.match(/\b(\d{5})\b/);
  if (altMatch && altMatch[1].startsWith('02')) {
    return altMatch[1];
  }

  return null;
}

/**
 * Detect town from address string
 */
function detectTownFromAddress(address) {
  if (!address) return null;

  const addressUpper = address.toUpperCase();

  // Check for exact town names (most specific first)
  const townPatterns = [
    { pattern: /\bVINEYARD HAVEN\b/, town: 'Vineyard Haven' },
    { pattern: /\bTISBURY\b/, town: 'Vineyard Haven' },
    { pattern: /\bWEST TISBURY\b/, town: 'West Tisbury' },
    { pattern: /\bOAK BLUFFS\b/, town: 'Oak Bluffs' },
    { pattern: /\bEDGARTOWN\b/, town: 'Edgartown' },
    { pattern: /\bCHILMARK\b/, town: 'Chilmark' },
    { pattern: /\bMENEMSHA\b/, town: 'Chilmark' },
    { pattern: /\bAQUINNAH\b/, town: 'Aquinnah' },
    { pattern: /\bGAY HEAD\b/, town: 'Aquinnah' },
  ];

  for (const { pattern, town } of townPatterns) {
    if (pattern.test(addressUpper)) {
      return town;
    }
  }

  return null;
}

/**
 * Normalize town name to controlled list
 */
function normalizeTownName(town) {
  if (!town) return 'Unknown';

  const townUpper = town.toUpperCase().trim();

  // Check aliases
  for (const [alias, normalized] of Object.entries(TOWN_ALIASES)) {
    if (townUpper === alias.toUpperCase()) {
      return normalized;
    }
  }

  // Check valid towns
  for (const validTown of VALID_TOWNS) {
    if (townUpper === validTown.toUpperCase()) {
      return validTown;
    }
  }

  return 'Unknown';
}

/**
 * Normalize category to controlled list
 */
function normalizeCategory(category, businessName) {
  if (!category) {
    // Try to infer from business name
    return inferCategoryFromName(businessName);
  }

  const categoryLower = category.toLowerCase().trim();

  // Direct mapping
  if (CATEGORY_MAPPING[categoryLower]) {
    return CATEGORY_MAPPING[categoryLower];
  }

  // Partial match
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (categoryLower.includes(key) && key.length > 2) {
      return value;
    }
  }

  // Check if it's already a controlled category
  for (const controlled of CONTROLLED_CATEGORIES) {
    if (categoryLower === controlled.toLowerCase()) {
      return controlled;
    }
  }

  return 'Other';
}

/**
 * Infer category from business name
 */
function inferCategoryFromName(name) {
  if (!name) return 'Other';

  const nameLower = name.toLowerCase();

  const nameHints = [
    { keywords: ['restaurant', 'cafe', 'diner', 'grill', 'bistro', 'tavern', 'kitchen', 'pizza', 'sushi', 'seafood', 'oyster', 'bakery'], category: 'Restaurant' },
    { keywords: ['inn', 'hotel', 'motel', 'resort', 'cottage', 'lodge', 'hostel'], category: 'Lodging' },
    { keywords: ['shop', 'store', 'boutique', 'gallery', 'gifts', 'market'], category: 'Shopping & Retail' },
    { keywords: ['spa', 'salon', 'fitness', 'yoga', 'gym', 'massage', 'barber'], category: 'Health & Wellness' },
    { keywords: ['law', 'attorney', 'accounting', 'insurance', 'bank', 'consulting'], category: 'Professional Services' },
    { keywords: ['construction', 'plumbing', 'electric', 'roofing', 'landscap', 'painting', 'carpentry'], category: 'Contractors' },
    { keywords: ['auto', 'car', 'tire', 'mechanic', 'vehicle'], category: 'Automotive' },
    { keywords: ['boat', 'marine', 'sailing', 'fishing', 'charter', 'marina'], category: 'Marine Services' },
    { keywords: ['church', 'library', 'museum', 'school', 'town hall'], category: 'Community' },
    { keywords: ['real estate', 'realty', 'property'], category: 'Real Estate' },
    { keywords: ['doctor', 'dental', 'clinic', 'medical', 'pharmacy', 'health center'], category: 'Healthcare' },
  ];

  for (const { keywords, category } of nameHints) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}

/**
 * Main normalization function
 */
function normalizeDatabase() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Phase 2: Deterministic Town and Category Normalization');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Get all non-duplicate businesses
  const businesses = db.prepare(`
    SELECT id, business_name, town, full_address, zip_code, category,
           phone, website, latitude, longitude
    FROM businesses
    WHERE is_duplicate = 0
  `).all();

  console.log(`Total businesses to process: ${businesses.length}\n`);

  // Track changes
  const changes = {
    townChanges: [],
    categoryChanges: [],
    byOriginalTown: {},
    byNewTown: {},
    byCategory: {}
  };

  // Initialize town counters
  for (const town of VALID_TOWNS) {
    changes.byOriginalTown[town] = 0;
    changes.byNewTown[town] = 0;
  }
  changes.byOriginalTown['Other'] = 0;

  // Process each business
  const corrections = [];

  for (const biz of businesses) {
    const original = {
      town: biz.town,
      category: biz.category
    };

    let newTown = null;
    let townSource = null;

    // Step 1: Try ZIP code (highest priority)
    const zipFromAddress = extractZipCode(biz.full_address);
    const zipFromField = biz.zip_code;
    const zip = zipFromAddress || zipFromField;

    if (zip && ZIP_TO_TOWN[zip]) {
      newTown = ZIP_TO_TOWN[zip];
      townSource = 'zip_code';
    }

    // Step 2: Try address parsing
    if (!newTown) {
      const townFromAddress = detectTownFromAddress(biz.full_address);
      if (townFromAddress) {
        newTown = townFromAddress;
        townSource = 'address_parsing';
      }
    }

    // Step 3: Normalize existing town name (if valid)
    if (!newTown && biz.town) {
      const normalized = normalizeTownName(biz.town);
      if (normalized !== 'Unknown') {
        // Only keep if it's NOT Vineyard Haven without supporting evidence
        if (normalized !== 'Vineyard Haven' || biz.full_address) {
          newTown = normalized;
          townSource = 'existing_normalized';
        }
      }
    }

    // Step 4: If still Vineyard Haven without address, mark as Unknown
    if (!newTown) {
      // Check if there's ANY evidence for Vineyard Haven
      if (biz.town === 'Vineyard Haven' && !biz.full_address) {
        newTown = 'Unknown';
        townSource = 'reset_default';
      } else if (biz.town) {
        newTown = normalizeTownName(biz.town);
        townSource = 'existing';
      } else {
        newTown = 'Unknown';
        townSource = 'no_data';
      }
    }

    // Normalize category
    const newCategory = normalizeCategory(biz.category, biz.business_name);

    // Track original town distribution
    const origTownKey = VALID_TOWNS.includes(biz.town) ? biz.town : 'Other';
    changes.byOriginalTown[origTownKey] = (changes.byOriginalTown[origTownKey] || 0) + 1;

    // Track new town distribution
    changes.byNewTown[newTown] = (changes.byNewTown[newTown] || 0) + 1;

    // Track category distribution
    changes.byCategory[newCategory] = (changes.byCategory[newCategory] || 0) + 1;

    // Record changes
    if (newTown !== biz.town || newCategory !== biz.category) {
      corrections.push({
        id: biz.id,
        business_name: biz.business_name,
        original_town: biz.town,
        new_town: newTown,
        town_source: townSource,
        original_category: biz.category,
        new_category: newCategory,
        address: biz.full_address,
        zip: zip
      });

      if (newTown !== biz.town) {
        changes.townChanges.push({
          id: biz.id,
          from: biz.town,
          to: newTown,
          source: townSource
        });
      }

      if (newCategory !== biz.category) {
        changes.categoryChanges.push({
          id: biz.id,
          from: biz.category,
          to: newCategory
        });
      }
    }
  }

  console.log('Processing complete.\n');

  // Generate reports
  generateSummaryReport(businesses.length, changes, corrections);
  generateMigrationSQL(corrections);
  generateCleanExport(db, corrections);

  // Run validation
  runValidation(changes, businesses.length);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Phase 2 Complete - Review files before applying migration');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Generate summary report
 */
function generateSummaryReport(total, changes, corrections) {
  console.log('Generating correction report...\n');

  let md = `# Town Corrections Summary\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## Overview\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Total businesses processed | ${total} |\n`;
  md += `| Town changes | ${changes.townChanges.length} |\n`;
  md += `| Category changes | ${changes.categoryChanges.length} |\n\n`;

  md += `## Original Town Distribution\n\n`;
  md += `| Town | Count | % |\n`;
  md += `|------|-------|---|\n`;
  for (const [town, count] of Object.entries(changes.byOriginalTown).sort((a, b) => b[1] - a[1])) {
    if (count > 0) {
      const pct = ((count / total) * 100).toFixed(1);
      md += `| ${town} | ${count} | ${pct}% |\n`;
    }
  }

  md += `\n## Corrected Town Distribution\n\n`;
  md += `| Town | Count | % |\n`;
  md += `|------|-------|---|\n`;
  for (const [town, count] of Object.entries(changes.byNewTown).sort((a, b) => b[1] - a[1])) {
    if (count > 0) {
      const pct = ((count / total) * 100).toFixed(1);
      md += `| ${town} | ${count} | ${pct}% |\n`;
    }
  }

  md += `\n## Category Distribution\n\n`;
  md += `| Category | Count | % |\n`;
  md += `|----------|-------|---|\n`;
  for (const [cat, count] of Object.entries(changes.byCategory).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / total) * 100).toFixed(1);
    md += `| ${cat} | ${count} | ${pct}% |\n`;
  }

  md += `\n## Town Changes Detail\n\n`;
  md += `| ID | Business | From | To | Source |\n`;
  md += `|----|----------|------|----|---------|\n`;

  for (const c of corrections.filter(c => c.original_town !== c.new_town).slice(0, 100)) {
    md += `| ${c.id} | ${c.business_name.substring(0, 30)} | ${c.original_town} | ${c.new_town} | ${c.town_source} |\n`;
  }

  if (changes.townChanges.length > 100) {
    md += `\n*... and ${changes.townChanges.length - 100} more changes*\n`;
  }

  md += `\n## Vineyard Haven Analysis\n\n`;
  const vhOriginal = changes.byOriginalTown['Vineyard Haven'] || 0;
  const vhCorrected = changes.byNewTown['Vineyard Haven'] || 0;
  const vhReduction = vhOriginal - vhCorrected;

  md += `- **Original Vineyard Haven count:** ${vhOriginal} (${((vhOriginal/total)*100).toFixed(1)}%)\n`;
  md += `- **Corrected Vineyard Haven count:** ${vhCorrected} (${((vhCorrected/total)*100).toFixed(1)}%)\n`;
  md += `- **Reduction:** ${vhReduction} businesses reassigned\n`;
  md += `- **Unknown count:** ${changes.byNewTown['Unknown'] || 0}\n`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'town-corrections-summary.md'), md);
  console.log('✓ Generated: data/audits/town-corrections-summary.md');
}

/**
 * Generate migration SQL
 */
function generateMigrationSQL(corrections) {
  console.log('Generating migration SQL...\n');

  let sql = `-- Town and Category Normalization Migration\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Total corrections: ${corrections.length}\n`;
  sql += `--\n`;
  sql += `-- IMPORTANT: Review this file before applying!\n`;
  sql += `-- Run with: sqlite3 data/mv_registry.db < migrations/normalize-towns-and-categories.sql\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  sql += `-- Town corrections\n`;
  for (const c of corrections.filter(c => c.original_town !== c.new_town)) {
    const town = c.new_town.replace(/'/g, "''");
    sql += `UPDATE businesses SET town = '${town}' WHERE id = ${c.id}; -- ${c.business_name.substring(0, 40)}: ${c.original_town} -> ${c.new_town} (${c.town_source})\n`;
  }

  sql += `\n-- Category corrections\n`;
  for (const c of corrections.filter(c => c.original_category !== c.new_category)) {
    const cat = c.new_category.replace(/'/g, "''");
    sql += `UPDATE businesses SET category = '${cat}' WHERE id = ${c.id}; -- ${c.original_category} -> ${c.new_category}\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(path.join(MIGRATIONS_DIR, 'normalize-towns-and-categories.sql'), sql);
  console.log('✓ Generated: migrations/normalize-towns-and-categories.sql');
}

/**
 * Generate clean export
 */
function generateCleanExport(db, corrections) {
  console.log('Generating clean export...\n');

  // Create a map of corrections
  const correctionMap = {};
  for (const c of corrections) {
    correctionMap[c.id] = c;
  }

  // Get all businesses and apply corrections in memory
  const businesses = db.prepare(`
    SELECT id, business_name, full_address, town, zip_code, category,
           phone, website, latitude, longitude
    FROM businesses
    WHERE is_duplicate = 0
  `).all();

  const cleanData = businesses.map(biz => {
    const correction = correctionMap[biz.id];
    return {
      id: biz.id,
      name: biz.business_name,
      address: biz.full_address || null,
      town: correction ? correction.new_town : biz.town,
      zip: biz.zip_code || null,
      business_type: correction ? correction.new_category : normalizeCategory(biz.category, biz.business_name),
      phone: biz.phone || null,
      website: biz.website || null,
      latitude: biz.latitude || null,
      longitude: biz.longitude || null,
      is_active: true
    };
  });

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'mv-business-directory-clean.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      total: cleanData.length,
      businesses: cleanData
    }, null, 2)
  );
  console.log('✓ Generated: data/exports/mv-business-directory-clean.json');
}

/**
 * Run validation checks
 */
function runValidation(changes, total) {
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  Validation Checks');
  console.log('─────────────────────────────────────────────────────────────────\n');

  let passed = 0;
  let failed = 0;

  // Check 1: No town has more than 40% of total
  const maxTownPct = 40;
  let maxTown = null;
  let maxCount = 0;

  for (const [town, count] of Object.entries(changes.byNewTown)) {
    if (count > maxCount && town !== 'Unknown') {
      maxCount = count;
      maxTown = town;
    }
  }

  const maxPct = (maxCount / total) * 100;
  if (maxPct <= maxTownPct) {
    console.log(`✓ PASS: No town exceeds ${maxTownPct}% (${maxTown}: ${maxPct.toFixed(1)}%)`);
    passed++;
  } else {
    console.log(`✗ FAIL: ${maxTown} has ${maxPct.toFixed(1)}% of businesses (max: ${maxTownPct}%)`);
    failed++;
  }

  // Check 2: Vineyard Haven reduction
  const vhOriginal = changes.byOriginalTown['Vineyard Haven'] || 0;
  const vhCorrected = changes.byNewTown['Vineyard Haven'] || 0;
  const vhOriginalPct = (vhOriginal / total) * 100;
  const vhCorrectedPct = (vhCorrected / total) * 100;

  if (vhCorrectedPct < vhOriginalPct) {
    console.log(`✓ PASS: Vineyard Haven reduced from ${vhOriginalPct.toFixed(1)}% to ${vhCorrectedPct.toFixed(1)}%`);
    passed++;
  } else {
    console.log(`✗ FAIL: Vineyard Haven not reduced (was ${vhOriginalPct.toFixed(1)}%, now ${vhCorrectedPct.toFixed(1)}%)`);
    failed++;
  }

  // Check 3: Unknown count reported
  const unknownCount = changes.byNewTown['Unknown'] || 0;
  console.log(`ℹ INFO: ${unknownCount} businesses marked as Unknown town (${((unknownCount/total)*100).toFixed(1)}%)`);

  // Check 4: All towns are valid
  const invalidTowns = Object.keys(changes.byNewTown).filter(t => !VALID_TOWNS.includes(t));
  if (invalidTowns.length === 0) {
    console.log(`✓ PASS: All towns are from controlled list`);
    passed++;
  } else {
    console.log(`✗ FAIL: Invalid towns found: ${invalidTowns.join(', ')}`);
    failed++;
  }

  // Check 5: All categories are controlled
  const invalidCats = Object.keys(changes.byCategory).filter(c => !CONTROLLED_CATEGORIES.includes(c));
  if (invalidCats.length === 0) {
    console.log(`✓ PASS: All categories are from controlled list`);
    passed++;
  } else {
    console.log(`✗ FAIL: Invalid categories found: ${invalidCats.join(', ')}`);
    failed++;
  }

  console.log(`\n─────────────────────────────────────────────────────────────────`);
  console.log(`  Validation: ${passed} passed, ${failed} failed`);
  console.log(`─────────────────────────────────────────────────────────────────\n`);
}

// Run
normalizeDatabase();

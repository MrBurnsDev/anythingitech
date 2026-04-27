#!/usr/bin/env node
/**
 * Sanity Review for Resolved Unknown Businesses
 *
 * Checks for:
 * 1. Truncated or malformed verified names
 * 2. Category mismatches
 * 3. Vague business names needing verification
 * 4. Records that should be invalid or inactive
 */

const fs = require('fs');
const path = require('path');

const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Load resolved records from CSV
const csvPath = path.join(AUDITS_DIR, 'unknown-business-google-verification.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));
  return values;
}

const records = lines.slice(1).map(line => {
  const values = parseCSVLine(line);
  return {
    id: parseInt(values[0]),
    original_name: values[1],
    verified_name: values[2],
    town: values[3],
    address: values[4],
    category: values[5],
    confidence: values[6],
    status: values[7]
  };
}).filter(r => r.status === 'resolved');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Sanity Review for Resolved Unknown Businesses');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Records to review: ${records.length}\n`);

// Issue detection patterns
const TRUNCATION_INDICATORS = [
  /[A-Za-z]\s*$/,  // Ends with single letter
  /:$/,            // Ends with colon
  /&$/,            // Ends with ampersand
  /\.\.\.$/,       // Ends with ellipsis
];

// Names that appear incomplete or truncated (check verified_name against these)
const TRUNCATED_NAMES = [
  // Exact matches for truncated names from the verification CSV
  { pattern: /^Martha'?s Vineyard Magazin$/i, correct: "Martha's Vineyard Magazine" },
  { pattern: /^Native Earth Teaching Far/i, correct: "Native Earth Teaching Farm" },
  { pattern: /^The La Choza Difference/i, correct: "La Choza" },
  { pattern: /^The Edgartown Council on/i, correct: "Edgartown Council on Aging" },
  { pattern: /^Martha'?s Vineyard Escape\s*$/i, correct: "Martha's Vineyard Escape Room" },
  { pattern: /^Vineyard Hearth Patio & S$/i, correct: "Vineyard Hearth Patio & Spa" },
  { pattern: /^Model Deli Is a Model of/i, correct: "Model Deli" },
  { pattern: /^The Vineyard'?s Drive$/i, correct: "Drive-In MV" },
  { pattern: /^MV Addiction, Narcotics A/i, correct: "MV Narcotics Anonymous" },
  { pattern: /^Revive by Sarka ~ Europea/i, correct: "Revive by Sarka" },
  // Additional truncated patterns
  { pattern: /Patio & S$/i, correct: null, issue: "Name ends abruptly with '& S'" },
  { pattern: /& Spa$/i, correct: null, skip: true }, // This is valid - "& Spa" is complete
  { pattern: /Model of Deliciousn$/i, correct: "Model Deli", issue: "Truncated at 'Deliciousn'" },
  { pattern: /Model of Delic$/i, correct: "Model Deli", issue: "Truncated name" },
  { pattern: /Native Earth Teaching Far$/i, correct: "Native Earth Teaching Farm" },
];

// Vague names that need verified official names
const VAGUE_NAMES = [
  'Larry',
  'Larsen',
  'Beach Road',
  'Sole',
  'Slip 77',
  'Fine Fettle',
  'Good Dog Goods',
  'Sea Bags',
  'Sea Legs',
  'Mikado',
  'Brunos',
  "Bruno's",
  'Brickman',
  "Brickman's",
  'Crossfitmarthas',
  'Airportfitness',
  'Cb Stark Jewelers',
  'Jardin Mahoney',
];

// Known proper full names for vague entries
const VAGUE_NAME_CORRECTIONS = {
  'Larry': { correct: "Larry's Tackle Shop", verified: true },
  'Larsen': { correct: "Larsen's Fish Market", verified: true },
  'Beach Road': { correct: "Beach Road Restaurant", verified: true },
  'Beach Road Restaurant': { correct: "Beach Road Restaurant", verified: true },
  'Sole': { correct: "Sole Boutique", needs_verification: true },
  'Slip 77': { correct: "Slip 77 Prime", needs_verification: true },
  'Fine Fettle': { correct: "Fine Fettle Dispensary", verified: true },
  'Good Dog Goods': { correct: "Good Dog Goods", verified: true }, // This is the full name
  'Sea Bags': { correct: "Sea Bags", verified: true }, // National brand, full name
  'Sea Legs': { correct: "Sea Legs Clothing", needs_verification: true },
  'Mikado': { correct: "Mikado", needs_verification: true }, // Could be just "Mikado"
  "Bruno's": { correct: "Bruno's", needs_verification: true },
  'Brunos': { correct: "Bruno's", needs_verification: true },
  "Brickman's": { correct: "Brickman's", verified: true }, // Department store
  'Brickman': { correct: "Brickman's", verified: true },
  'Crossfitmarthas': { correct: "CrossFit Martha's Vineyard", needs_verification: true },
  'Airportfitness': { correct: "Airport Fitness", needs_verification: true },
  'Cb Stark Jewelers': { correct: "C.B. Stark Jewelers", needs_verification: true },
  'Jardin Mahoney': { correct: "Jardin Mahoney", needs_verification: true },
};

// Category validation rules
const CATEGORY_RULES = {
  // Names that should NOT be Restaurant
  NOT_RESTAURANT: [
    { pattern: /gallery/i, correct: 'Shopping & Retail' },
    { pattern: /farm/i, correct: 'Community' },
    { pattern: /pottery/i, correct: 'Shopping & Retail' },
    { pattern: /photography|photographer/i, correct: 'Professional Services' },
    { pattern: /magazine/i, correct: 'Professional Services' },
    { pattern: /hotel|inn/i, correct: 'Lodging' },
    { pattern: /spa\s*salon/i, correct: 'Health & Wellness' },
    { pattern: /salon/i, correct: 'Health & Wellness' },
    { pattern: /jewelry/i, correct: 'Shopping & Retail' },
    { pattern: /tackle/i, correct: 'Shopping & Retail' },
    { pattern: /bicycles|bike/i, correct: 'Shopping & Retail' },
    { pattern: /surf/i, correct: 'Shopping & Retail' },
    { pattern: /boutique/i, correct: 'Shopping & Retail' },
    { pattern: /dispensary/i, correct: 'Shopping & Retail' },
    { pattern: /drive.*in/i, correct: 'Arts & Entertainment' },
    { pattern: /escape\s*room/i, correct: 'Arts & Entertainment' },
    { pattern: /fitness|gym|crossfit/i, correct: 'Health & Wellness' },
    { pattern: /yoga|vinyasa/i, correct: 'Health & Wellness' },
    { pattern: /council.*aging/i, correct: 'Community' },
    { pattern: /anonymous|recovery/i, correct: 'Community' },
  ],

  // Known restaurants that have ambiguous names
  VERIFIED_RESTAURANTS: [
    // 'Chicken Alley',      // Actually a thrift store, NOT a restaurant
    'Menemsha Blues',     // Is a restaurant
    'Larsen',             // Actually Larsen's Fish Market - sells fresh seafood (retail)
    'Menemsha Fish Market', // Sells fresh seafood - more retail than restaurant
    'Slip 77',            // Is a restaurant
    'La Strada',          // Italian restaurant
    "DaRosa's",           // Is a restaurant
    "Darosa's",           // Is a restaurant
    'Scottish Bakehouse', // Bakery/cafe
    'Mocha Mott\'s',      // Coffee shop
    'Bobby B\'s',         // Is a restaurant
    'Delicious MV',       // Is a restaurant
    'Mikado',             // Japanese restaurant
    "Bruno's",            // Pizza place
    'Rosie\'s Frozen Yogurt', // Is food service
    'Martha\'s Vineyard Pizza', // Is a pizzeria
    '9 Craft Kitchen & Bar', // Is a restaurant
    'Beach Road Restaurant', // Is a restaurant
    'Art Cliff Diner',    // Is a diner
    'Artcliff Diner',     // Is a diner
    'Model Deli',         // Is a deli
  ],

  // Names that are actually NOT restaurants (commonly miscategorized)
  NOT_ACTUALLY_RESTAURANTS: [
    { name: 'Larsen', correct_category: 'Shopping & Retail', reason: 'Fish market - seafood retail' },
    { name: "Larsen's Fish Market", correct_category: 'Shopping & Retail', reason: 'Fish market - seafood retail' },
    { name: 'Menemsha Fish Market', correct_category: 'Shopping & Retail', reason: 'Fish market - seafood retail' },
    { name: 'Native Earth Teaching Farm', correct_category: 'Community', reason: 'Farm/education - not restaurant' },
    { name: 'Merry Farm Pottery', correct_category: 'Shopping & Retail', reason: 'Pottery studio - not restaurant' },
    { name: 'Blanchard Photography', correct_category: 'Professional Services', reason: 'Photography - not restaurant' },
    { name: 'Chicken Alley', correct_category: 'Shopping & Retail', reason: 'Thrift store - not restaurant' },
  ]
};

// Records that might need to be invalid/inactive
const POTENTIAL_INVALID = [
  { pattern: /redirecting/i, reason: 'page_error' },
  { pattern: /suspended/i, reason: 'page_error' },
  { pattern: /closed/i, reason: 'business_closed' },
  { pattern: /instagram|facebook|twitter/i, reason: 'social_media_platform' },
  { pattern: /\.com\//i, reason: 'url_as_name' },
  { pattern: /\.gov\//i, reason: 'government_url' },
];

// Analysis results
const issues = [];

for (const record of records) {
  const recordIssues = [];
  let recommendedName = record.verified_name;
  let recommendedCategory = record.category;
  let recommendedAction = 'approve';

  // 1. Check for truncated names
  for (const { pattern, correct, issue } of TRUNCATED_NAMES) {
    if (pattern.test(record.verified_name)) {
      if (correct) {
        recordIssues.push(`Truncated name: "${record.verified_name}" → "${correct}"`);
        recommendedName = correct;
        recommendedAction = 'correct';
      } else if (issue) {
        recordIssues.push(`Truncated name: ${issue}`);
        recommendedAction = 'needs_manual_review';
      }
      break;
    }
  }

  // Check for names that look incomplete (common truncation patterns)
  const truncationChecks = [
    { test: record.verified_name.endsWith(' & S'), fix: 'Name ends with "& S" - likely truncated' },
    { test: record.verified_name.endsWith(' & '), fix: 'Name ends with "& " - likely truncated' },
    { test: record.verified_name.endsWith(' of '), fix: 'Name ends with "of " - likely truncated' },
    { test: record.verified_name.endsWith(' on '), fix: 'Name ends with "on " - likely truncated' },
    { test: record.verified_name.endsWith(' the '), fix: 'Name ends with "the " - likely truncated' },
    { test: record.verified_name.match(/[A-Za-z]n$/) && record.verified_name.length > 20, fix: 'Name may be truncated (ends abruptly)' },
    { test: record.verified_name.includes('Deliciousn'), fix: 'Name truncated at "Deliciousn"' },
  ];

  for (const check of truncationChecks) {
    if (check.test && !recordIssues.some(i => i.includes('Truncated'))) {
      recordIssues.push(`Truncated: ${check.fix}`);
      recommendedAction = 'needs_manual_review';
    }
  }

  // Also check if name looks truncated (ends abruptly)
  if (record.verified_name.length < 30) {
    for (const indicator of TRUNCATION_INDICATORS) {
      if (indicator.test(record.verified_name) && !record.verified_name.match(/[&'s]$/)) {
        // Could be truncated - flag if not already caught
        if (!recordIssues.some(i => i.includes('Truncated'))) {
          // Check against original name for more context
          if (record.original_name.length > record.verified_name.length + 3) {
            recordIssues.push(`Possibly truncated: "${record.verified_name}" (original: "${record.original_name}")`);
            recommendedAction = 'needs_manual_review';
          }
        }
      }
    }
  }

  // 2. Check for vague names
  const isVague = VAGUE_NAMES.some(v =>
    v.toLowerCase() === record.verified_name.toLowerCase() ||
    v.toLowerCase() === record.original_name.toLowerCase()
  );

  if (isVague) {
    const correction = VAGUE_NAME_CORRECTIONS[record.verified_name] ||
                       VAGUE_NAME_CORRECTIONS[record.original_name];
    if (correction) {
      if (correction.needs_verification) {
        recordIssues.push(`Vague name needs verification: "${record.verified_name}" → "${correction.correct}"?`);
        recommendedName = correction.correct;
        recommendedAction = 'needs_manual_review';
      } else if (correction.correct !== record.verified_name) {
        recordIssues.push(`Vague name should be: "${record.verified_name}" → "${correction.correct}"`);
        recommendedName = correction.correct;
        recommendedAction = 'correct';
      }
    } else {
      recordIssues.push(`Vague name needs official name verification: "${record.verified_name}"`);
      recommendedAction = 'needs_manual_review';
    }
  }

  // 3. Check for category mismatches
  if (record.category === 'Restaurant') {
    // Check if this should NOT be a restaurant
    for (const rule of CATEGORY_RULES.NOT_RESTAURANT) {
      if (rule.pattern.test(record.verified_name)) {
        // But first check if it's a verified restaurant
        const isVerifiedRestaurant = CATEGORY_RULES.VERIFIED_RESTAURANTS.some(
          r => r.toLowerCase() === record.verified_name.toLowerCase()
        );
        if (!isVerifiedRestaurant) {
          recordIssues.push(`Category mismatch: "${record.verified_name}" is listed as Restaurant but matches "${rule.pattern}" → ${rule.correct}`);
          recommendedCategory = rule.correct;
          recommendedAction = 'correct';
        }
        break;
      }
    }

    // Check explicit non-restaurant list
    const notRestaurant = CATEGORY_RULES.NOT_ACTUALLY_RESTAURANTS.find(
      r => r.name.toLowerCase() === record.verified_name.toLowerCase()
    );
    if (notRestaurant) {
      recordIssues.push(`Category error: "${record.verified_name}" is ${notRestaurant.reason}, not Restaurant → ${notRestaurant.correct_category}`);
      recommendedCategory = notRestaurant.correct_category;
      recommendedAction = 'correct';
    }
  }

  // 4. Check for invalid record indicators
  for (const { pattern, reason } of POTENTIAL_INVALID) {
    if (pattern.test(record.original_name) || pattern.test(record.verified_name)) {
      recordIssues.push(`Should be invalid: matches "${pattern}" (${reason})`);
      recommendedAction = 'invalid';
      break;
    }
  }

  if (recordIssues.length > 0) {
    issues.push({
      id: record.id,
      original_name: record.original_name,
      proposed_name: record.verified_name,
      proposed_town: record.town,
      proposed_category: record.category,
      proposed_address: record.address,
      issues: recordIssues,
      recommended_name: recommendedName,
      recommended_category: recommendedCategory,
      recommended_action: recommendedAction
    });
  }
}

console.log(`Found ${issues.length} records with potential issues\n`);

// Generate reports
// Markdown report
let md = `# Resolved Records Sanity Review\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;
md += `## Summary\n\n`;
md += `| Metric | Count |\n`;
md += `|--------|-------|\n`;
md += `| Total Resolved Records | ${records.length} |\n`;
md += `| Records with Issues | ${issues.length} |\n`;
md += `| Records Passing | ${records.length - issues.length} |\n\n`;

// Action breakdown
const actionCounts = { approve: 0, correct: 0, needs_manual_review: 0, invalid: 0 };
for (const issue of issues) {
  actionCounts[issue.recommended_action]++;
}
actionCounts.approve = records.length - issues.length;

md += `### Recommended Actions\n\n`;
md += `| Action | Count |\n`;
md += `|--------|-------|\n`;
md += `| Approve (no changes) | ${actionCounts.approve} |\n`;
md += `| Correct (fixable issues) | ${actionCounts.correct} |\n`;
md += `| Needs Manual Review | ${actionCounts.needs_manual_review} |\n`;
md += `| Invalid | ${actionCounts.invalid} |\n\n`;

// Issue categories
const issueCats = {
  truncated: issues.filter(i => i.issues.some(x => x.toLowerCase().includes('truncat'))),
  vague: issues.filter(i => i.issues.some(x => x.toLowerCase().includes('vague'))),
  category: issues.filter(i => i.issues.some(x => x.toLowerCase().includes('category'))),
  invalid: issues.filter(i => i.issues.some(x => x.toLowerCase().includes('invalid')))
};

md += `### Issues by Type\n\n`;
md += `| Issue Type | Count |\n`;
md += `|------------|-------|\n`;
md += `| Truncated/Malformed Names | ${issueCats.truncated.length} |\n`;
md += `| Vague Names | ${issueCats.vague.length} |\n`;
md += `| Category Mismatches | ${issueCats.category.length} |\n`;
md += `| Should Be Invalid | ${issueCats.invalid.length} |\n\n`;

if (issues.length > 0) {
  md += `## Records Requiring Attention\n\n`;

  // Group by action
  const byAction = {
    correct: issues.filter(i => i.recommended_action === 'correct'),
    needs_manual_review: issues.filter(i => i.recommended_action === 'needs_manual_review'),
    invalid: issues.filter(i => i.recommended_action === 'invalid')
  };

  if (byAction.correct.length > 0) {
    md += `### Correctable Issues (${byAction.correct.length})\n\n`;
    md += `These can be fixed with the recommended corrections:\n\n`;
    md += `| ID | Original Name | Proposed Name | Issues | Recommended Name | Recommended Category | Action |\n`;
    md += `|----|---------------|---------------|--------|------------------|---------------------|--------|\n`;
    for (const i of byAction.correct) {
      md += `| ${i.id} | ${i.original_name.substring(0, 25)} | ${i.proposed_name.substring(0, 25)} | ${i.issues.join('; ').substring(0, 40)} | ${i.recommended_name.substring(0, 25)} | ${i.recommended_category} | correct |\n`;
    }
    md += `\n`;
  }

  if (byAction.needs_manual_review.length > 0) {
    md += `### Needs Manual Review (${byAction.needs_manual_review.length})\n\n`;
    md += `These need human verification before proceeding:\n\n`;
    md += `| ID | Original Name | Proposed Name | Town | Issues | Suggested Name |\n`;
    md += `|----|---------------|---------------|------|--------|----------------|\n`;
    for (const i of byAction.needs_manual_review) {
      md += `| ${i.id} | ${i.original_name.substring(0, 25)} | ${i.proposed_name.substring(0, 25)} | ${i.proposed_town} | ${i.issues.join('; ').substring(0, 50)} | ${i.recommended_name.substring(0, 25)} |\n`;
    }
    md += `\n`;
  }

  if (byAction.invalid.length > 0) {
    md += `### Should Be Invalid (${byAction.invalid.length})\n\n`;
    md += `| ID | Name | Reason |\n`;
    md += `|----|------|--------|\n`;
    for (const i of byAction.invalid) {
      md += `| ${i.id} | ${i.original_name} | ${i.issues.join('; ')} |\n`;
    }
    md += `\n`;
  }
}

// All passed records
const passedRecords = records.filter(r => !issues.find(i => i.id === r.id));
md += `## Records Passing Review (${passedRecords.length})\n\n`;
md += `| ID | Verified Name | Town | Category |\n`;
md += `|----|---------------|------|----------|\n`;
for (const r of passedRecords) {
  md += `| ${r.id} | ${r.verified_name.substring(0, 35)} | ${r.town} | ${r.category} |\n`;
}
md += `\n`;

fs.writeFileSync(path.join(AUDITS_DIR, 'resolved-records-sanity-review.md'), md);
console.log('✓ Generated: data/audits/resolved-records-sanity-review.md');

// CSV report
let csv = 'id,original_name,proposed_name,proposed_town,proposed_category,issue,recommended_name,recommended_category,recommended_action\n';

// First add all passed records
for (const r of passedRecords) {
  csv += `${r.id},"${r.original_name.replace(/"/g, '""')}","${r.verified_name.replace(/"/g, '""')}","${r.town}","${r.category}","","${r.verified_name.replace(/"/g, '""')}","${r.category}","approve"\n`;
}

// Then add issues
for (const i of issues) {
  csv += `${i.id},"${i.original_name.replace(/"/g, '""')}","${i.proposed_name.replace(/"/g, '""')}","${i.proposed_town}","${i.proposed_category}","${i.issues.join('; ').replace(/"/g, '""')}","${i.recommended_name.replace(/"/g, '""')}","${i.recommended_category}","${i.recommended_action}"\n`;
}

fs.writeFileSync(path.join(AUDITS_DIR, 'resolved-records-sanity-review.csv'), csv);
console.log('✓ Generated: data/audits/resolved-records-sanity-review.csv');

// Generate revised SQL (only approved and corrected records)
let sql = `-- Resolve Unknown Businesses (Reviewed)\n`;
sql += `-- Generated: ${new Date().toISOString()}\n`;
sql += `-- After sanity review: Only includes approved and corrected records\n`;
sql += `-- Records needing manual review are EXCLUDED\n`;
sql += `-- DO NOT APPLY WITHOUT FINAL REVIEW\n\n`;
sql += `BEGIN TRANSACTION;\n\n`;

sql += `-- Approved records (passed sanity review)\n`;
for (const r of passedRecords) {
  const town = r.town.replace(/'/g, "''");
  const addr = r.address.replace(/'/g, "''");
  const cat = r.category.replace(/'/g, "''");
  const name = r.verified_name.replace(/'/g, "''");

  sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}', category = '${cat}'`;
  if (r.verified_name !== r.original_name) {
    sql += `, business_name = '${name}'`;
  }
  sql += ` WHERE id = ${r.id}; -- ${r.original_name.substring(0, 30)}\n`;
}

sql += `\n-- Corrected records\n`;
for (const i of issues.filter(x => x.recommended_action === 'correct')) {
  const town = i.proposed_town.replace(/'/g, "''");
  const addr = i.proposed_address.replace(/'/g, "''");
  const cat = i.recommended_category.replace(/'/g, "''");
  const name = i.recommended_name.replace(/'/g, "''");

  sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}', category = '${cat}', business_name = '${name}' WHERE id = ${i.id}; -- ${i.original_name.substring(0, 30)} (corrected)\n`;
}

sql += `\n-- Records flagged invalid\n`;
for (const i of issues.filter(x => x.recommended_action === 'invalid')) {
  sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = ${i.id}; -- ${i.original_name.substring(0, 30)}\n`;
}

sql += `\n-- EXCLUDED: The following records need manual review before inclusion:\n`;
for (const i of issues.filter(x => x.recommended_action === 'needs_manual_review')) {
  sql += `-- ID ${i.id}: ${i.original_name} → ${i.recommended_name} (${i.issues.join('; ')})\n`;
}

sql += `\nCOMMIT;\n`;

fs.writeFileSync(path.join(MIGRATIONS_DIR, 'resolve-unknown-businesses-reviewed.sql'), sql);
console.log('✓ Generated: migrations/resolve-unknown-businesses-reviewed.sql');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Sanity Review Complete');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\nSummary:`);
console.log(`  Approved (no changes needed): ${passedRecords.length}`);
console.log(`  Corrected: ${issues.filter(x => x.recommended_action === 'correct').length}`);
console.log(`  Needs Manual Review: ${issues.filter(x => x.recommended_action === 'needs_manual_review').length}`);
console.log(`  Invalid: ${issues.filter(x => x.recommended_action === 'invalid').length}`);
console.log(`\nReviewed SQL includes ${passedRecords.length + issues.filter(x => x.recommended_action === 'correct').length} records`);

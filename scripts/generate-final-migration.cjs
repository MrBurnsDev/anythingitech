#!/usr/bin/env node
/**
 * Generate Final Migration SQL
 *
 * Creates the final reviewed migration with:
 * - 41 approved records
 * - 10 corrected records
 * - Chicken Alley category fix (Shopping & Retail)
 * - 12 manual-review records excluded
 */

const fs = require('fs');
const path = require('path');

const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Load the sanity review CSV
const csvPath = path.join(AUDITS_DIR, 'resolved-records-sanity-review.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n');

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
    proposed_name: values[2],
    proposed_town: values[3],
    proposed_category: values[4],
    issue: values[5],
    recommended_name: values[6],
    recommended_category: values[7],
    recommended_action: values[8]
  };
});

// Load original verification CSV for addresses
const origCsvPath = path.join(AUDITS_DIR, 'unknown-business-google-verification.csv');
const origContent = fs.readFileSync(origCsvPath, 'utf8');
const origLines = origContent.trim().split('\n');
const origRecords = {};
origLines.slice(1).forEach(line => {
  const values = parseCSVLine(line);
  origRecords[parseInt(values[0])] = {
    address: values[4]
  };
});

// Apply Chicken Alley fix
const chickenAlleyRecord = records.find(r => r.id === 483);
if (chickenAlleyRecord) {
  chickenAlleyRecord.recommended_category = 'Shopping & Retail';
  if (chickenAlleyRecord.recommended_action === 'approve') {
    chickenAlleyRecord.recommended_action = 'correct';
    chickenAlleyRecord.issue = 'Category error: Chicken Alley is Thrift store - not restaurant → Shopping & Retail';
  }
}

// Separate by action
const approved = records.filter(r => r.recommended_action === 'approve');
const corrected = records.filter(r => r.recommended_action === 'correct');
const manualReview = records.filter(r => r.recommended_action === 'needs_manual_review');
const invalid = records.filter(r => r.recommended_action === 'invalid');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Generating Final Migration SQL');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Approved: ${approved.length}`);
console.log(`Corrected: ${corrected.length}`);
console.log(`Manual Review (excluded): ${manualReview.length}`);
console.log(`Invalid (excluded): ${invalid.length}`);

// Generate SQL
let sql = `-- Resolve Unknown Businesses (FINAL)
-- Generated: ${new Date().toISOString()}
--
-- This is the final reviewed migration ready for production.
-- Includes:
--   - ${approved.length} approved records (passed sanity review)
--   - ${corrected.length} corrected records (with fixes applied)
-- Excludes:
--   - ${manualReview.length} records needing manual review
--   - ${invalid.length} invalid records
--
-- APPROVED FOR APPLICATION

BEGIN TRANSACTION;

-- ============================================================
-- APPROVED RECORDS (${approved.length})
-- These passed sanity review with no changes needed
-- ============================================================
`;

for (const r of approved) {
  const town = r.proposed_town.replace(/'/g, "''");
  const addr = (origRecords[r.id]?.address || '').replace(/'/g, "''");
  const cat = r.recommended_category.replace(/'/g, "''");
  const name = r.recommended_name.replace(/'/g, "''");
  const origName = r.original_name.replace(/'/g, "''");

  sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}', category = '${cat}'`;
  if (r.recommended_name !== r.original_name) {
    sql += `, business_name = '${name}'`;
  }
  sql += ` WHERE id = ${r.id}; -- ${r.original_name.substring(0, 35)}\n`;
}

sql += `
-- ============================================================
-- CORRECTED RECORDS (${corrected.length})
-- These had issues that have been fixed
-- ============================================================
`;

for (const r of corrected) {
  const town = r.proposed_town.replace(/'/g, "''");
  const addr = (origRecords[r.id]?.address || '').replace(/'/g, "''");
  const cat = r.recommended_category.replace(/'/g, "''");
  const name = r.recommended_name.replace(/'/g, "''");

  sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}', category = '${cat}', business_name = '${name}' WHERE id = ${r.id}; -- ${r.original_name.substring(0, 30)} → ${r.recommended_name.substring(0, 25)}\n`;
}

sql += `
-- ============================================================
-- EXCLUDED: NEEDS MANUAL REVIEW (${manualReview.length})
-- These records are NOT included in this migration
-- ============================================================
`;

for (const r of manualReview) {
  sql += `-- ID ${r.id}: ${r.original_name} (${r.issue.substring(0, 50)}...)\n`;
}

sql += `
COMMIT;

-- Migration complete. Total records updated: ${approved.length + corrected.length}
`;

const outputPath = path.join(MIGRATIONS_DIR, 'resolve-unknown-businesses-final.sql');
fs.writeFileSync(outputPath, sql);
console.log(`\n✓ Generated: migrations/resolve-unknown-businesses-final.sql`);
console.log(`\nTotal records to update: ${approved.length + corrected.length}`);

#!/usr/bin/env node
/**
 * Generate Migration Files for Businesses 2 Import
 *
 * Creates SQL migration files and review CSVs based on the parsed businesses-2 data.
 * Following conservative import policies:
 * - Safe updates: fill missing phone/address/website/description only
 * - New businesses: staged as needs_review, is_public=false
 * - Conflicts: exported to CSV for manual review
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/imports/businesses-2');
const migrationsDir = path.join(__dirname, '../migrations');

function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf-8'));
}

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeCSV(str) {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function normalizeWebsite(url) {
  if (!url) return null;
  let normalized = url.trim();
  normalized = normalized.replace(/^http:\/\//, 'https://');
  normalized = normalized.replace(/\/+$/, '');
  if (!normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BUSINESSES 2 - MIGRATION GENERATOR');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const matches = loadJSON('matches.json');
  const newBusinesses = loadJSON('new-businesses.json');
  const conflicts = loadJSON('conflicts.json');
  const duplicates = loadJSON('duplicates.json');
  const summary = loadJSON('summary.json');

  console.log('Loaded data:');
  console.log(`  - Matches: ${matches.length}`);
  console.log(`  - New businesses: ${newBusinesses.length}`);
  console.log(`  - Conflicts: ${conflicts.length}`);
  console.log(`  - Duplicates: ${duplicates.length}`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // Generate Safe Updates SQL
  // ═══════════════════════════════════════════════════════════════

  const safeUpdates = [];
  const processedIds = new Set();

  for (const match of matches) {
    const { existing, parsed, fieldDiffs } = match;

    if (!existing || processedIds.has(existing.id)) continue;
    processedIds.add(existing.id);

    const setClauses = [];
    const changes = [];

    // Look for "fill" actions in fieldDiffs
    if (fieldDiffs && Array.isArray(fieldDiffs)) {
      for (const diff of fieldDiffs) {
        if (diff.action === 'fill') {
          const field = diff.field;
          const value = diff.parsed;

          if (field === 'phone' && value) {
            setClauses.push(`phone = ${escapeSQL(value)}`);
            changes.push(`phone: NULL → ${value}`);
          }
          if (field === 'address' && value) {
            setClauses.push(`full_address = ${escapeSQL(value)}`);
            changes.push(`address: NULL → ${value}`);
          }
          if (field === 'website' && value) {
            const normalized = normalizeWebsite(value);
            setClauses.push(`website = ${escapeSQL(normalized)}`);
            changes.push(`website: NULL → ${normalized}`);
          }
          if (field === 'description' && value) {
            setClauses.push(`description = ${escapeSQL(value)}`);
            changes.push(`description: filled`);
          }
        }
      }
    }

    if (setClauses.length > 0) {
      setClauses.push(`verification_source = 'businesses_2_import'`);
      setClauses.push(`last_verified_at = NOW()`);
      setClauses.push(`updated_at = NOW()`);

      safeUpdates.push({
        id: existing.id,
        name: existing.name || existing.business_name,
        sql: `UPDATE businesses SET ${setClauses.join(', ')} WHERE id = ${existing.id};`,
        changes
      });
    }
  }

  // Write safe updates SQL
  const safeUpdatesSql = [
    '-- Businesses 2 Safe Updates',
    '-- Generated: ' + new Date().toISOString(),
    '-- These updates ONLY fill in missing fields, never overwrite existing data',
    `-- Total updates: ${safeUpdates.length}`,
    '',
    'BEGIN;',
    '',
    ...safeUpdates.map(u => `-- ${u.name}: ${u.changes.join(', ')}\n${u.sql}`),
    '',
    'COMMIT;'
  ].join('\n');

  fs.writeFileSync(path.join(migrationsDir, 'businesses-2-safe-updates.sql'), safeUpdatesSql);
  console.log(`Generated: businesses-2-safe-updates.sql (${safeUpdates.length} updates)`);

  // ═══════════════════════════════════════════════════════════════
  // Generate New Businesses SQL (needs_review)
  // ═══════════════════════════════════════════════════════════════

  const validNewBusinesses = newBusinesses.filter(b =>
    b.name &&
    b.town &&
    !b.isDuplicateOfGazette
  );

  const newBusinessSql = [
    '-- Businesses 2 New Records (NEEDS REVIEW)',
    '-- Generated: ' + new Date().toISOString(),
    '-- All records are staged as needs_review with is_public=false',
    `-- Total new businesses: ${validNewBusinesses.length}`,
    '',
    'BEGIN;',
    ''
  ];

  for (const biz of validNewBusinesses) {
    const slug = generateSlug(biz.name);
    const website = normalizeWebsite(biz.website);

    newBusinessSql.push(`-- ${biz.name} (${biz.town})`);
    newBusinessSql.push(`INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  ${escapeSQL(biz.name)},
  ${escapeSQL(slug)},
  ${escapeSQL(biz.town)},
  ${escapeSQL(biz.address)},
  ${escapeSQL(biz.phone)},
  ${escapeSQL(website)},
  ${escapeSQL(biz.description)},
  ${escapeSQL(biz.businessType)},
  ${escapeSQL(biz.category)},
  ${escapeSQL(biz.subcategory)},
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);`);
    newBusinessSql.push('');
  }

  newBusinessSql.push('COMMIT;');

  fs.writeFileSync(path.join(migrationsDir, 'businesses-2-new-needs-review.sql'), newBusinessSql.join('\n'));
  console.log(`Generated: businesses-2-new-needs-review.sql (${validNewBusinesses.length} records)`);

  // ═══════════════════════════════════════════════════════════════
  // Generate Rollback SQL
  // ═══════════════════════════════════════════════════════════════

  const rollbackSql = [
    '-- Businesses 2 Import Rollback',
    '-- Generated: ' + new Date().toISOString(),
    '-- Use this to undo the businesses 2 import',
    '',
    '-- Remove newly added businesses',
    `DELETE FROM businesses WHERE verification_source = 'businesses_2_import' AND status = 'needs_review';`,
    '',
    '-- Note: Safe updates cannot be automatically rolled back',
    '-- You would need to restore from backup or manually revert each field'
  ].join('\n');

  fs.writeFileSync(path.join(migrationsDir, 'businesses-2-rollback.sql'), rollbackSql);
  console.log(`Generated: businesses-2-rollback.sql`);

  // ═══════════════════════════════════════════════════════════════
  // Generate Conflict Review CSVs
  // ═══════════════════════════════════════════════════════════════

  // Phone conflicts
  const phoneConflicts = conflicts.filter(c =>
    c.conflictDiffs && c.conflictDiffs.some(cf => cf.field === 'phone')
  );

  if (phoneConflicts.length > 0) {
    const csv = [
      'ID,Existing Name,Source Name,Existing Phone,Source Phone,Match Type,Action'
    ];
    for (const c of phoneConflicts) {
      const phoneConflict = c.conflictDiffs.find(cf => cf.field === 'phone');
      csv.push([
        c.existing.id,
        escapeCSV(c.existing.name || c.existing.business_name),
        escapeCSV(c.parsed?.name || c.source?.name || ''),
        escapeCSV(phoneConflict?.existing || ''),
        escapeCSV(phoneConflict?.parsed || phoneConflict?.source || ''),
        c.matchReason || c.matchType || '',
        ''
      ].join(','));
    }
    fs.writeFileSync(path.join(dataDir, 'phone-conflicts-review.csv'), csv.join('\n'));
    console.log(`Generated: phone-conflicts-review.csv (${phoneConflicts.length} records)`);
  }

  // Name conflicts (potential duplicates with different names)
  const nameConflicts = conflicts.filter(c =>
    c.conflictDiffs && c.conflictDiffs.some(cf => cf.field === 'name')
  );

  if (nameConflicts.length > 0) {
    const csv = [
      'ID,Existing Name,Source Name,Existing Website,Source Website,Match Type,Action'
    ];
    for (const c of nameConflicts) {
      csv.push([
        c.existing.id,
        escapeCSV(c.existing.name || c.existing.business_name),
        escapeCSV(c.parsed?.name || c.source?.name || ''),
        escapeCSV(c.existing.website || ''),
        escapeCSV(c.parsed?.website || c.source?.website || ''),
        c.matchReason || c.matchType || '',
        ''
      ].join(','));
    }
    fs.writeFileSync(path.join(dataDir, 'name-conflicts-review.csv'), csv.join('\n'));
    console.log(`Generated: name-conflicts-review.csv (${nameConflicts.length} records)`);
  }

  // Category conflicts
  const categoryConflicts = conflicts.filter(c =>
    c.conflictDiffs && c.conflictDiffs.some(cf => cf.field === 'category')
  );

  if (categoryConflicts.length > 0) {
    const csv = [
      'ID,Name,Existing Category,Source Category,Existing Type,Source Type,Action'
    ];
    for (const c of categoryConflicts) {
      const catConflict = c.conflictDiffs.find(cf => cf.field === 'category');
      csv.push([
        c.existing.id,
        escapeCSV(c.existing.name || c.existing.business_name),
        escapeCSV(catConflict?.existing || ''),
        escapeCSV(catConflict?.parsed || catConflict?.source || ''),
        escapeCSV(c.existing.business_type || c.existing.businessType || ''),
        escapeCSV(c.parsed?.businessType || c.source?.businessType || ''),
        ''
      ].join(','));
    }
    fs.writeFileSync(path.join(dataDir, 'category-conflicts-review.csv'), csv.join('\n'));
    console.log(`Generated: category-conflicts-review.csv (${categoryConflicts.length} records)`);
  }

  // Duplicates review
  if (duplicates.length > 0) {
    const csv = [
      'Source Name,Source Town,Source Phone,Matched In,Matched Name,Match Reason,Action'
    ];
    for (const d of duplicates) {
      const src = d.source || d.parsed || {};
      const mtch = d.matched || d.existing || {};
      csv.push([
        escapeCSV(src.name || ''),
        escapeCSV(src.town || ''),
        escapeCSV(src.phone || ''),
        d.matchedIn || d.matchSource || '',
        escapeCSV(mtch.name || mtch.business_name || ''),
        d.matchReason || '',
        ''
      ].join(','));
    }
    fs.writeFileSync(path.join(dataDir, 'duplicates-review.csv'), csv.join('\n'));
    console.log(`Generated: duplicates-review.csv (${duplicates.length} records)`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Audit Report
  // ═══════════════════════════════════════════════════════════════

  const report = `# Businesses 2 Import Audit Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Parsed | ${summary.totalParsed} |
| Matched to Existing | ${summary.matched} |
| New Businesses | ${summary.newBusinesses} (${validNewBusinesses.length} valid for import) |
| Conflicts | ${summary.conflicts} |
| Duplicates | ${summary.duplicates} |

## Safe Updates (Ready to Apply)

These updates ONLY fill missing fields - they never overwrite existing data.

| Type | Count |
|------|-------|
| Phone fills | ${safeUpdates.filter(u => u.changes.some(c => c.includes('phone'))).length} |
| Address fills | ${safeUpdates.filter(u => u.changes.some(c => c.includes('address'))).length} |
| Website fills | ${safeUpdates.filter(u => u.changes.some(c => c.includes('website'))).length} |
| Description fills | ${safeUpdates.filter(u => u.changes.some(c => c.includes('description'))).length} |
| **Total Safe Updates** | **${safeUpdates.length}** |

## New Businesses (Needs Review)

${validNewBusinesses.length} new businesses will be imported with:
- \`status = 'needs_review'\`
- \`is_public = false\`
- \`verification_source = 'businesses_2_import'\`

These will NOT appear on the public site until manually approved.

### By Town

| Town | Count |
|------|-------|
${Object.entries(summary.byTown || {}).map(([town, count]) => `| ${town} | ${count} |`).join('\n')}

### By Category

| Category | Count |
|----------|-------|
${Object.entries(summary.byCategory || {}).map(([cat, count]) => `| ${cat} | ${count} |`).join('\n')}

## Conflicts (Requires Manual Review)

| Type | Count | File |
|------|-------|------|
| Phone Conflicts | ${phoneConflicts.length} | phone-conflicts-review.csv |
| Name Conflicts | ${nameConflicts.length} | name-conflicts-review.csv |
| Category Conflicts | ${categoryConflicts.length} | category-conflicts-review.csv |
| Duplicates | ${duplicates.length} | duplicates-review.csv |

## Generated Files

### Migration SQL (in /migrations/)
- \`businesses-2-safe-updates.sql\` - ${safeUpdates.length} safe field fills
- \`businesses-2-new-needs-review.sql\` - ${validNewBusinesses.length} new businesses (staged)
- \`businesses-2-rollback.sql\` - Rollback script

### Review CSVs (in /data/imports/businesses-2/)
- \`phone-conflicts-review.csv\`
- \`name-conflicts-review.csv\`
- \`category-conflicts-review.csv\`
- \`duplicates-review.csv\`

## Next Steps

1. **Review conflicts** - Open the CSV files and decide on each conflict
2. **Apply safe updates** - Run \`businesses-2-safe-updates.sql\` via API
3. **Import new businesses** - Run \`businesses-2-new-needs-review.sql\` via API (they'll be hidden)
4. **Review staged records** - Use admin dashboard to approve/reject new businesses
5. **Regenerate exports** - Run export script after all changes are applied
`;

  fs.writeFileSync(path.join(dataDir, 'AUDIT-REPORT.md'), report);
  console.log(`Generated: AUDIT-REPORT.md`);

  // ═══════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  MIGRATION FILES GENERATED');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('SQL Migrations:');
  console.log(`  - businesses-2-safe-updates.sql (${safeUpdates.length} updates)`);
  console.log(`  - businesses-2-new-needs-review.sql (${validNewBusinesses.length} new records)`);
  console.log(`  - businesses-2-rollback.sql`);
  console.log('');
  console.log('Review CSVs:');
  console.log(`  - phone-conflicts-review.csv (${phoneConflicts.length})`);
  console.log(`  - name-conflicts-review.csv (${nameConflicts.length})`);
  console.log(`  - category-conflicts-review.csv (${categoryConflicts.length})`);
  console.log(`  - duplicates-review.csv (${duplicates.length})`);
  console.log('');
  console.log('Audit Report: AUDIT-REPORT.md');
  console.log('');
  console.log('NOTE: Migration files have been generated but NOT applied.');
  console.log('Review the audit report and conflict CSVs before applying.');
}

main();

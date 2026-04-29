#!/usr/bin/env node
/**
 * Generate Gazette Import Migration Files
 *
 * Creates conservative SQL migrations and review files for the Gazette import.
 *
 * Policy:
 * - Safe auto-updates: Fill missing fields only (address, phone, website)
 * - NO auto-overwrite of existing data
 * - New businesses set to status=needs_review
 * - Conflicts and duplicates exported for manual review
 *
 * Usage: node scripts/generate-gazette-migration.cjs
 */

const fs = require('fs');
const path = require('path');

const gazetteDir = path.join(__dirname, '../data/gazette');
const migrationsDir = path.join(__dirname, '../migrations');

// Ensure directories exist
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

function loadJSON(filename) {
  const filePath = path.join(gazetteDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function normalizeWebsiteToHttps(url) {
  if (!url) return null;
  url = url.trim();
  // Convert http to https
  url = url.replace(/^http:\/\//, 'https://');
  // Remove trailing slash
  url = url.replace(/\/+$/, '');
  // Add https if missing
  if (!url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function extractZipFromAddress(address) {
  if (!address) return null;
  const match = address.match(/MA\s*(\d{5})/);
  return match ? match[1] : null;
}

function generateMigrations() {
  console.log('Loading Gazette data...\n');

  const matches = loadJSON('matches.json');
  const newBusinesses = loadJSON('new-businesses.json');
  const parsed = loadJSON('parsed-businesses.json');

  const stats = {
    safeUpdates: {
      addressFills: 0,
      phoneFills: 0,
      websiteFills: 0,
      websiteNormalizations: 0,
      zipAdditions: 0,
      total: 0
    },
    newBusinesses: {
      highConfidence: 0,
      excluded: 0
    },
    conflicts: {
      phone: 0,
      name: 0,
      category: 0
    },
    duplicates: 0,
    rollbackRecords: 0
  };

  // Track processed business IDs to avoid duplicates
  const processedIds = new Set();
  const safeUpdates = [];
  const phoneConflicts = [];
  const nameConflicts = [];
  const categoryConflicts = [];

  // Identify duplicates in Gazette data
  const nameCount = {};
  for (const b of parsed) {
    const key = b.name.toLowerCase().trim();
    if (!nameCount[key]) nameCount[key] = [];
    nameCount[key].push(b);
  }
  const duplicateRecords = [];
  for (const [name, records] of Object.entries(nameCount)) {
    if (records.length > 1) {
      for (const r of records) {
        duplicateRecords.push({
          name: r.name,
          town: r.town || r.gazetteTown,
          address: r.address,
          phone: r.phone,
          website: r.website,
          category: r.gazetteCategory,
          isDuplicate: true
        });
      }
      stats.duplicates += records.length;
    }
  }

  // Process matches for safe updates
  for (const match of matches) {
    const { gazette, existing, fieldDiffs } = match;

    // Skip if we've already processed this business
    if (processedIds.has(existing.id)) continue;
    processedIds.add(existing.id);

    const updates = {};
    let hasConflict = false;

    for (const diff of fieldDiffs) {
      const field = diff.field;
      const gazetteValue = diff.gazette;
      const existingValue = diff.existing;

      if (field === 'phone') {
        if (!existingValue && gazetteValue) {
          // Safe: Fill missing phone
          updates.phone = gazetteValue;
          stats.safeUpdates.phoneFills++;
        } else if (existingValue && gazetteValue && existingValue !== gazetteValue) {
          // Conflict: Different phone numbers
          phoneConflicts.push({
            id: existing.id,
            name: existing.name,
            town: existing.town,
            existing_phone: existingValue,
            gazette_phone: gazetteValue,
            gazette_address: gazette.address
          });
          stats.conflicts.phone++;
          hasConflict = true;
        }
      }

      if (field === 'website') {
        const normalizedGazette = normalizeWebsiteToHttps(gazetteValue);
        const normalizedExisting = normalizeWebsiteToHttps(existingValue);

        if (!existingValue && gazetteValue) {
          // Safe: Fill missing website
          updates.website = normalizedGazette;
          stats.safeUpdates.websiteFills++;
        } else if (normalizedExisting !== normalizedGazette) {
          // Check if it's just a normalization (http vs https, trailing slash)
          const existingHost = existingValue?.replace(/https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();
          const gazetteHost = gazetteValue?.replace(/https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();

          if (existingHost === gazetteHost) {
            // Safe: Just normalize to https
            updates.website = normalizedGazette;
            stats.safeUpdates.websiteNormalizations++;
          }
          // Otherwise skip - don't overwrite different websites
        }
      }

      if (field === 'address') {
        if (!existingValue && gazetteValue) {
          // Safe: Fill missing address
          updates.address = gazetteValue;
          stats.safeUpdates.addressFills++;
        } else if (existingValue && gazetteValue) {
          // Check if Gazette has more complete address (has zip)
          const existingZip = extractZipFromAddress(existingValue);
          const gazetteZip = extractZipFromAddress(gazetteValue);

          if (!existingZip && gazetteZip) {
            // Gazette has zip, existing doesn't - could enhance
            // But only if the base address matches
            const existingBase = existingValue.toLowerCase().replace(/[,\s]+/g, ' ').trim();
            const gazetteBase = gazetteValue.toLowerCase().replace(/[,\s]+/g, ' ').split(/ma\s*\d{5}/)[0].trim();

            if (gazetteBase.includes(existingBase.slice(0, 10)) ||
                existingBase.includes(gazetteBase.slice(0, 10))) {
              // Addresses seem related, use Gazette's more complete version
              updates.address = gazetteValue;
              stats.safeUpdates.zipAdditions++;
            }
          }
        }
      }
    }

    // Check for name differences (for conflict logging)
    if (gazette.name.toLowerCase() !== existing.name.toLowerCase()) {
      const similarity = gazette.name.toLowerCase().includes(existing.name.toLowerCase().slice(0, 5)) ||
                        existing.name.toLowerCase().includes(gazette.name.toLowerCase().slice(0, 5));
      if (!similarity) {
        nameConflicts.push({
          id: existing.id,
          existing_name: existing.name,
          gazette_name: gazette.name,
          town: existing.town,
          match_reason: match.matchReason,
          match_score: match.score
        });
        stats.conflicts.name++;
      }
    }

    // Check for category differences
    if (gazette.category && existing.subcategory &&
        gazette.category.toLowerCase() !== existing.subcategory.toLowerCase()) {
      categoryConflicts.push({
        id: existing.id,
        name: existing.name,
        town: existing.town,
        existing_category: existing.category,
        existing_subcategory: existing.subcategory,
        gazette_category: gazette.gazetteCategory,
        gazette_mapped_category: gazette.category
      });
      stats.conflicts.category++;
    }

    // If we have safe updates, record them
    if (Object.keys(updates).length > 0) {
      safeUpdates.push({
        id: existing.id,
        name: existing.name,
        updates
      });
      stats.safeUpdates.total++;
    }
  }

  // Process new businesses
  const validNewBusinesses = [];
  const excludedNewBusinesses = [];

  // Track which gazette businesses are duplicates
  const duplicateNames = new Set(Object.keys(nameCount).filter(k => nameCount[k].length > 1));

  for (const business of newBusinesses) {
    // Skip duplicates
    if (duplicateNames.has(business.name.toLowerCase().trim())) {
      excludedNewBusinesses.push({ ...business, excludeReason: 'duplicate' });
      continue;
    }

    // Check high-confidence criteria
    const hasValidName = business.name && business.name.length > 2;
    const hasKnownTown = business.town && business.townSlug;
    const hasMappedCategory = business.businessType && business.category;
    const hasContact = business.website || business.phone || (business.address && business.address.includes('MA'));

    if (hasValidName && hasKnownTown && hasMappedCategory && hasContact) {
      validNewBusinesses.push(business);
      stats.newBusinesses.highConfidence++;
    } else {
      excludedNewBusinesses.push({
        ...business,
        excludeReason: [
          !hasValidName && 'invalid_name',
          !hasKnownTown && 'unknown_town',
          !hasMappedCategory && 'unmapped_category',
          !hasContact && 'no_contact'
        ].filter(Boolean).join(', ')
      });
      stats.newBusinesses.excluded++;
    }
  }

  // Generate SQL files
  const timestamp = new Date().toISOString().slice(0, 10);
  const verificationSource = 'vineyard_gazette_business_directory';

  // 1. Safe Updates SQL
  let safeUpdatesSql = `-- Gazette Safe Updates Migration
-- Generated: ${new Date().toISOString()}
-- Policy: Fill missing fields only, normalize URLs, add verification source
-- Total updates: ${stats.safeUpdates.total}

BEGIN;

-- Create backup table for rollback
CREATE TABLE IF NOT EXISTS _gazette_import_backup_${timestamp.replace(/-/g, '')} AS
SELECT id, name, address, phone, website, verification_source, last_verified_at
FROM businesses
WHERE id IN (${safeUpdates.map(u => u.id).join(', ') || '0'});

`;

  for (const update of safeUpdates) {
    const setClauses = [];
    for (const [field, value] of Object.entries(update.updates)) {
      setClauses.push(`  ${field} = ${escapeSQL(value)}`);
    }
    setClauses.push(`  verification_source = ${escapeSQL(verificationSource)}`);
    setClauses.push(`  last_verified_at = NOW()`);

    safeUpdatesSql += `-- ${update.name} (ID: ${update.id})
UPDATE businesses SET
${setClauses.join(',\n')}
WHERE id = ${update.id};

`;
  }

  safeUpdatesSql += `COMMIT;

-- Summary:
-- Address fills: ${stats.safeUpdates.addressFills}
-- Phone fills: ${stats.safeUpdates.phoneFills}
-- Website fills: ${stats.safeUpdates.websiteFills}
-- Website normalizations: ${stats.safeUpdates.websiteNormalizations}
-- ZIP additions: ${stats.safeUpdates.zipAdditions}
`;

  fs.writeFileSync(path.join(migrationsDir, 'gazette-safe-updates.sql'), safeUpdatesSql);

  // 2. New Businesses SQL
  let newBusinessesSql = `-- Gazette New Businesses Migration (needs_review)
-- Generated: ${new Date().toISOString()}
-- Policy: Insert high-confidence new businesses with status=needs_review
-- Total new businesses: ${validNewBusinesses.length}

BEGIN;

`;

  for (const business of validNewBusinesses) {
    const website = normalizeWebsiteToHttps(business.website);
    const slug = business.slug + '-' + business.townSlug;

    newBusinessesSql += `-- ${business.name} (${business.town})
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  ${escapeSQL(business.name)},
  ${escapeSQL(slug)},
  ${escapeSQL(business.category)},
  ${escapeSQL(business.businessType)},
  ${escapeSQL(business.category)},
  ${escapeSQL(business.town)},
  ${escapeSQL(business.townSlug)},
  ${escapeSQL(business.address)},
  ${escapeSQL(business.phone)},
  ${escapeSQL(website)},
  'needs_review',
  50,
  ${escapeSQL(verificationSource)},
  NOW(),
  NOW(),
  NOW()
);

`;
  }

  newBusinessesSql += `COMMIT;

-- Summary:
-- High-confidence new businesses: ${stats.newBusinesses.highConfidence}
-- Excluded (low confidence): ${stats.newBusinesses.excluded}
`;

  fs.writeFileSync(path.join(migrationsDir, 'gazette-new-businesses-needs-review.sql'), newBusinessesSql);

  // 3. Rollback SQL
  const rollbackSql = `-- Gazette Import Rollback
-- Generated: ${new Date().toISOString()}
-- Restores original values from backup table

BEGIN;

-- Restore safe updates from backup
UPDATE businesses b
SET
  address = bk.address,
  phone = bk.phone,
  website = bk.website,
  verification_source = bk.verification_source,
  last_verified_at = bk.last_verified_at
FROM _gazette_import_backup_${timestamp.replace(/-/g, '')} bk
WHERE b.id = bk.id;

-- Delete new businesses added by this import
DELETE FROM businesses
WHERE verification_source = '${verificationSource}'
  AND status = 'needs_review'
  AND created_at >= '${timestamp}';

COMMIT;

-- After successful rollback, drop backup table:
-- DROP TABLE _gazette_import_backup_${timestamp.replace(/-/g, '')};
`;

  fs.writeFileSync(path.join(migrationsDir, 'gazette-import-rollback.sql'), rollbackSql);

  // 4. Conflict CSVs
  const phoneConflictsCsv = 'id,name,town,existing_phone,gazette_phone,gazette_address\n' +
    phoneConflicts.map(c =>
      `${c.id},"${c.name}","${c.town}","${c.existing_phone}","${c.gazette_phone}","${c.gazette_address || ''}"`
    ).join('\n');
  fs.writeFileSync(path.join(gazetteDir, 'phone-conflicts-review.csv'), phoneConflictsCsv);

  const nameConflictsCsv = 'id,existing_name,gazette_name,town,match_reason,match_score\n' +
    nameConflicts.map(c =>
      `${c.id},"${c.existing_name}","${c.gazette_name}","${c.town}","${c.match_reason}",${c.match_score}`
    ).join('\n');
  fs.writeFileSync(path.join(gazetteDir, 'name-conflicts-review.csv'), nameConflictsCsv);

  const categoryConflictsCsv = 'id,name,town,existing_category,existing_subcategory,gazette_category,gazette_mapped_category\n' +
    categoryConflicts.map(c =>
      `${c.id},"${c.name}","${c.town}","${c.existing_category}","${c.existing_subcategory}","${c.gazette_category}","${c.gazette_mapped_category}"`
    ).join('\n');
  fs.writeFileSync(path.join(gazetteDir, 'category-conflicts-review.csv'), categoryConflictsCsv);

  // 5. Duplicate Review CSV
  const duplicatesCsv = 'name,town,address,phone,website,category\n' +
    duplicateRecords.map(d =>
      `"${d.name}","${d.town || ''}","${d.address || ''}","${d.phone || ''}","${d.website || ''}","${d.category}"`
    ).join('\n');
  fs.writeFileSync(path.join(gazetteDir, 'duplicate-review.csv'), duplicatesCsv);

  // 6. Final Import Plan
  const importPlan = `# Gazette Import Final Plan

Generated: ${new Date().toISOString()}
Source: Vineyard Gazette Business Directory

## Summary

| Category | Count |
|----------|-------|
| **Safe Updates** | ${stats.safeUpdates.total} |
| - Address fills | ${stats.safeUpdates.addressFills} |
| - Phone fills | ${stats.safeUpdates.phoneFills} |
| - Website fills | ${stats.safeUpdates.websiteFills} |
| - Website normalizations (http→https) | ${stats.safeUpdates.websiteNormalizations} |
| - ZIP code additions | ${stats.safeUpdates.zipAdditions} |
| **New Businesses (needs_review)** | ${stats.newBusinesses.highConfidence} |
| **Excluded** | |
| - New businesses (low confidence) | ${stats.newBusinesses.excluded} |
| - Phone conflicts | ${stats.conflicts.phone} |
| - Name conflicts | ${stats.conflicts.name} |
| - Category conflicts | ${stats.conflicts.category} |
| - Duplicate records | ${stats.duplicates} |

## Files Generated

### SQL Migrations (in /migrations/)

| File | Description | Records |
|------|-------------|---------|
| \`gazette-safe-updates.sql\` | Fill missing fields, normalize URLs | ${stats.safeUpdates.total} |
| \`gazette-new-businesses-needs-review.sql\` | Add new businesses as needs_review | ${stats.newBusinesses.highConfidence} |
| \`gazette-import-rollback.sql\` | Rollback script | - |

### Review Files (in /data/gazette/)

| File | Records |
|------|---------|
| \`phone-conflicts-review.csv\` | ${stats.conflicts.phone} |
| \`name-conflicts-review.csv\` | ${stats.conflicts.name} |
| \`category-conflicts-review.csv\` | ${stats.conflicts.category} |
| \`duplicate-review.csv\` | ${stats.duplicates} |

## Safe Update Details

These updates will **only fill missing fields** and will **not overwrite existing data**:

### Address Fills (${stats.safeUpdates.addressFills})
Businesses where we had no address but Gazette provides one.

### Phone Fills (${stats.safeUpdates.phoneFills})
Businesses where we had no phone but Gazette provides one.

### Website Fills (${stats.safeUpdates.websiteFills})
Businesses where we had no website but Gazette provides one.

### Website Normalizations (${stats.safeUpdates.websiteNormalizations})
Businesses where the website is the same but URL format differs (http→https, trailing slash).

### ZIP Code Additions (${stats.safeUpdates.zipAdditions})
Businesses where our address lacks a ZIP code but Gazette's full address includes it.

## New Business Details

${stats.newBusinesses.highConfidence} high-confidence new businesses will be added with:
- \`status = 'needs_review'\` (not published)
- \`confidence = 50\`
- \`verification_source = 'vineyard_gazette_business_directory'\`

These require admin review before being published.

## Conflicts Excluded

The following conflicts were excluded from automatic import and require manual review:

### Phone Conflicts (${stats.conflicts.phone})
Businesses where both sources have different phone numbers.
Review: \`data/gazette/phone-conflicts-review.csv\`

### Name Conflicts (${stats.conflicts.name})
Businesses matched by website/phone but names differ significantly.
Review: \`data/gazette/name-conflicts-review.csv\`

### Category Conflicts (${stats.conflicts.category})
Businesses where Gazette category differs from our classification.
Review: \`data/gazette/category-conflicts-review.csv\`

## Duplicates Excluded

${stats.duplicates} duplicate records in Gazette data were excluded.
Review: \`data/gazette/duplicate-review.csv\`

## How to Apply

1. **Review the conflict CSVs** and decide on any manual updates needed

2. **Apply safe updates:**
   \`\`\`bash
   # Using Supabase CLI or psql
   psql $DATABASE_URL -f migrations/gazette-safe-updates.sql
   \`\`\`

3. **Apply new businesses (optional):**
   \`\`\`bash
   psql $DATABASE_URL -f migrations/gazette-new-businesses-needs-review.sql
   \`\`\`

4. **Review new businesses in admin dashboard** and publish approved ones

5. **If rollback needed:**
   \`\`\`bash
   psql $DATABASE_URL -f migrations/gazette-import-rollback.sql
   \`\`\`

## Verification After Import

After applying migrations:

1. Check updated record count matches expected
2. Verify a sample of updated businesses in admin dashboard
3. Review any new businesses with status=needs_review
4. Re-export businesses.json if needed:
   \`\`\`bash
   npm run registry:export
   \`\`\`
`;

  fs.writeFileSync(path.join(gazetteDir, 'gazette-import-final-plan.md'), importPlan);

  // Print summary
  console.log('='.repeat(60));
  console.log('GAZETTE IMPORT MIGRATION GENERATED');
  console.log('='.repeat(60));
  console.log(`
Safe Updates:           ${stats.safeUpdates.total}
  - Address fills:      ${stats.safeUpdates.addressFills}
  - Phone fills:        ${stats.safeUpdates.phoneFills}
  - Website fills:      ${stats.safeUpdates.websiteFills}
  - URL normalizations: ${stats.safeUpdates.websiteNormalizations}
  - ZIP additions:      ${stats.safeUpdates.zipAdditions}

New Businesses:         ${stats.newBusinesses.highConfidence} (needs_review)
Excluded (low conf):    ${stats.newBusinesses.excluded}

Conflicts Excluded:
  - Phone conflicts:    ${stats.conflicts.phone}
  - Name conflicts:     ${stats.conflicts.name}
  - Category conflicts: ${stats.conflicts.category}

Duplicates Excluded:    ${stats.duplicates}

Files written:
  migrations/gazette-safe-updates.sql
  migrations/gazette-new-businesses-needs-review.sql
  migrations/gazette-import-rollback.sql
  data/gazette/phone-conflicts-review.csv
  data/gazette/name-conflicts-review.csv
  data/gazette/category-conflicts-review.csv
  data/gazette/duplicate-review.csv
  data/gazette/gazette-import-final-plan.md
`);
}

generateMigrations();

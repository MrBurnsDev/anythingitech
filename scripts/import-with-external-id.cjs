#!/usr/bin/env node
/**
 * Unified Import Script Using external_source_id
 *
 * This script demonstrates the correct way to import/update businesses
 * using external_source_id instead of numeric IDs.
 *
 * Usage:
 *   ADMIN_PASSWORD="..." node scripts/import-with-external-id.cjs --source gazette
 *   ADMIN_PASSWORD="..." node scripts/import-with-external-id.cjs --source businesses-2
 *   ADMIN_PASSWORD="..." node scripts/import-with-external-id.cjs --dry-run
 *
 * Matching Priority:
 *   1. external_source_id (exact match)
 *   2. slug (exact match)
 *   3. website domain
 *   4. phone number
 *   5. normalized name + town
 *
 * RULE: Never use numeric ID for cross-system matching.
 */

const fs = require('fs');
const path = require('path');
const {
  generateExternalSourceId,
  getAdminToken,
  fetchAllBusinesses,
  buildLookupMaps,
  findMatch,
  applyUpdate,
  apiRequest
} = require('./lib/import-helper.cjs');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sourceArg = args.find(a => a.startsWith('--source='))?.split('=')[1] ||
                  (args.includes('--source') ? args[args.indexOf('--source') + 1] : null);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD environment variable required');
  console.error('Usage: ADMIN_PASSWORD="your-password" node scripts/import-with-external-id.cjs --source gazette');
  process.exit(1);
}

async function loadSourceData(source) {
  const dataDir = path.join(__dirname, '..', 'data');

  if (source === 'gazette') {
    const matchesPath = path.join(dataDir, 'gazette', 'matches.json');
    if (!fs.existsSync(matchesPath)) {
      throw new Error(`File not found: ${matchesPath}`);
    }
    const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));
    return {
      source: 'gazette',
      records: matches.map(m => ({
        importData: m.gazette,
        fieldDiffs: m.fieldDiffs
      }))
    };
  }

  if (source === 'businesses-2') {
    const matchesPath = path.join(dataDir, 'imports', 'businesses-2', 'matches.json');
    if (!fs.existsSync(matchesPath)) {
      throw new Error(`File not found: ${matchesPath}`);
    }
    const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));
    return {
      source: 'businesses_2',
      records: matches.map(m => ({
        importData: m.imported || m.gazette || m,
        fieldDiffs: m.fieldDiffs || []
      }))
    };
  }

  throw new Error(`Unknown source: ${source}. Use --source gazette or --source businesses-2`);
}

function extractSafeUpdates(record, fieldDiffs) {
  const updates = {};
  const changes = [];
  const { importData } = record;

  for (const diff of fieldDiffs) {
    const field = diff.field;
    const importValue = diff.gazette || diff.imported || importData[field];
    const existingValue = diff.existing;

    // Only fill empty fields - never overwrite
    if (!existingValue && importValue) {
      // Map field names
      const dbField = field === 'address' ? 'full_address' : field;

      // Skip if importValue looks like a description (not a real address)
      if (dbField === 'full_address') {
        if (importValue.length > 100 ||
            importValue.toLowerCase().includes('serving') ||
            importValue.toLowerCase().includes('restaurant') ||
            importValue.toLowerCase().includes('offering')) {
          continue; // Skip - this is a description, not an address
        }
      }

      updates[dbField] = importValue;
      changes.push(`${dbField}: (empty) → ${importValue}`);
    }

    // Normalize website to https
    if (field === 'website' && existingValue && importValue) {
      const normalize = url => url?.replace(/^http:\/\//, 'https://').replace(/\/+$/, '');
      const normalizedExisting = normalize(existingValue);
      const normalizedImport = normalize(importValue);

      if (normalizedExisting !== normalizedImport) {
        const existingDomain = existingValue?.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
        const importDomain = importValue?.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();

        if (existingDomain === importDomain && existingValue.startsWith('http://')) {
          updates.website = normalizedImport;
          changes.push(`website: ${existingValue} → ${normalizedImport} (https upgrade)`);
        }
      }
    }
  }

  return { updates, changes };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  UNIFIED IMPORT USING EXTERNAL_SOURCE_ID');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (dryRun) {
    console.log('*** DRY RUN MODE - No changes will be made ***\n');
  }

  if (!sourceArg) {
    console.error('ERROR: --source argument required');
    console.error('Usage: ADMIN_PASSWORD="..." node scripts/import-with-external-id.cjs --source gazette');
    process.exit(1);
  }

  // Load source data
  console.log(`Loading source data: ${sourceArg}...`);
  const sourceData = await loadSourceData(sourceArg);
  console.log(`Loaded ${sourceData.records.length} records from ${sourceData.source}\n`);

  // Get admin token
  console.log('Getting admin token...');
  const token = await getAdminToken('admin', ADMIN_PASSWORD);
  console.log('Token obtained\n');

  // Fetch all businesses from production
  console.log('Fetching existing businesses...');
  const businesses = await fetchAllBusinesses(token);
  console.log(`Fetched ${businesses.length} businesses from production\n`);

  // Build lookup maps
  const lookups = buildLookupMaps(businesses);
  console.log('Built lookup maps:');
  console.log(`  - By external_source_id: ${lookups.byExternalSourceId.size}`);
  console.log(`  - By slug: ${lookups.bySlug.size}`);
  console.log(`  - By name+town: ${lookups.byNameTown.size}`);
  console.log(`  - By phone: ${lookups.byPhone.size}`);
  console.log(`  - By website domain: ${lookups.byWebsiteDomain.size}\n`);

  // Process records
  const stats = {
    matched: 0,
    unmatched: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    byMatchMethod: {}
  };

  const pendingUpdates = [];

  for (const record of sourceData.records) {
    const { importData, fieldDiffs } = record;

    // Find matching business
    const { match, method } = findMatch(importData, sourceData.source, lookups);

    if (!match) {
      stats.unmatched++;
      continue;
    }

    stats.matched++;
    stats.byMatchMethod[method] = (stats.byMatchMethod[method] || 0) + 1;

    // Extract safe updates
    const { updates, changes } = extractSafeUpdates(record, fieldDiffs);

    if (Object.keys(updates).length === 0) {
      stats.skipped++;
      continue;
    }

    // Add verification metadata
    updates.verification_source = sourceData.source;

    pendingUpdates.push({
      business: match,
      updates,
      changes,
      matchMethod: method
    });
  }

  console.log('Matching Results:');
  console.log(`  Matched: ${stats.matched}`);
  console.log(`  Unmatched: ${stats.unmatched}`);
  console.log(`  With updates: ${pendingUpdates.length}`);
  console.log(`  Skipped (no changes): ${stats.skipped}`);
  console.log('\nMatch Methods Used:');
  for (const [method, count] of Object.entries(stats.byMatchMethod)) {
    console.log(`  - ${method}: ${count}`);
  }

  if (pendingUpdates.length === 0) {
    console.log('\nNo updates to apply.');
    return;
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log('Updates to Apply:');
  console.log('─'.repeat(60));

  for (const { business, changes, matchMethod } of pendingUpdates.slice(0, 10)) {
    console.log(`\n${business.business_name} (${business.town})`);
    console.log(`  Matched by: ${matchMethod}`);
    console.log(`  Slug: ${business.slug}`);
    for (const change of changes) {
      console.log(`  ${change}`);
    }
  }

  if (pendingUpdates.length > 10) {
    console.log(`\n... and ${pendingUpdates.length - 10} more`);
  }

  if (dryRun) {
    console.log('\n*** DRY RUN - No changes made ***');
    return;
  }

  // Apply updates
  console.log(`\n${'─'.repeat(60)}`);
  console.log('Applying Updates...');
  console.log(`${'─'.repeat(60)}\n`);

  for (const { business, updates, changes } of pendingUpdates) {
    try {
      // Use slug for update (not ID!)
      await applyUpdate(token, business.slug, updates);
      stats.updated++;
      console.log(`✓ ${business.business_name}`);
    } catch (error) {
      stats.errors++;
      console.error(`✗ ${business.business_name}: ${error.message}`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nUpdated: ${stats.updated}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Skipped: ${stats.skipped}`);

  if (stats.errors === 0) {
    console.log('\n✓ All updates applied successfully!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

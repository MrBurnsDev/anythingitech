#!/usr/bin/env node
/**
 * Apply Gazette Safe Updates via Supabase API
 *
 * This script applies the safe updates from the Gazette import:
 * - Fill missing address fields
 * - Fill missing phone fields
 * - Normalize website URLs to https
 * - Add ZIP codes to incomplete addresses
 * - Add verification source metadata
 *
 * Usage: node scripts/apply-gazette-safe-updates.cjs
 *
 * Environment: Requires SUPABASE_SERVICE_ROLE_KEY to be set
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zrrinbeyiuiydalxiwii.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable required');
  console.error('Set it with: export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const gazetteDir = path.join(__dirname, '../data/gazette');

function loadJSON(filename) {
  const filePath = path.join(gazetteDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function normalizeWebsiteToHttps(url) {
  if (!url) return null;
  url = url.trim();
  url = url.replace(/^http:\/\//, 'https://');
  url = url.replace(/\/+$/, '');
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

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  GAZETTE SAFE UPDATES - APPLYING TO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const matches = loadJSON('matches.json');
  console.log(`Loaded ${matches.length} matched records\n`);

  // Track processed IDs and collect updates
  const processedIds = new Set();
  const updates = [];

  const stats = {
    addressFills: 0,
    phoneFills: 0,
    websiteNormalizations: 0,
    zipAdditions: 0,
    total: 0,
    errors: 0
  };

  // Process matches
  for (const match of matches) {
    const { gazette, existing, fieldDiffs } = match;

    if (processedIds.has(existing.id)) continue;
    processedIds.add(existing.id);

    const updateFields = {};
    const changes = [];

    for (const diff of fieldDiffs) {
      const field = diff.field;
      const gazetteValue = diff.gazette;
      const existingValue = diff.existing;

      if (field === 'phone') {
        if (!existingValue && gazetteValue) {
          updateFields.phone = gazetteValue;
          changes.push(`phone: (empty) → ${gazetteValue}`);
          stats.phoneFills++;
        }
        // Skip conflicts - don't overwrite existing phone
      }

      if (field === 'website') {
        const normalizedGazette = normalizeWebsiteToHttps(gazetteValue);
        const normalizedExisting = normalizeWebsiteToHttps(existingValue);

        if (!existingValue && gazetteValue) {
          updateFields.website = normalizedGazette;
          changes.push(`website: (empty) → ${normalizedGazette}`);
          stats.websiteFills = (stats.websiteFills || 0) + 1;
        } else if (normalizedExisting !== normalizedGazette) {
          const existingHost = existingValue?.replace(/https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();
          const gazetteHost = gazetteValue?.replace(/https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();

          if (existingHost === gazetteHost) {
            updateFields.website = normalizedGazette;
            changes.push(`website: ${existingValue} → ${normalizedGazette} (normalized)`);
            stats.websiteNormalizations++;
          }
        }
      }

      if (field === 'address') {
        if (!existingValue && gazetteValue) {
          updateFields.full_address = gazetteValue;
          changes.push(`full_address: (empty) → ${gazetteValue}`);
          stats.addressFills++;
        } else if (existingValue && gazetteValue) {
          const existingZip = extractZipFromAddress(existingValue);
          const gazetteZip = extractZipFromAddress(gazetteValue);

          if (!existingZip && gazetteZip) {
            const existingBase = existingValue.toLowerCase().replace(/[,\s]+/g, ' ').trim();
            const gazetteBase = gazetteValue.toLowerCase().replace(/[,\s]+/g, ' ').split(/ma\s*\d{5}/)[0].trim();

            if (gazetteBase.includes(existingBase.slice(0, 10)) ||
                existingBase.includes(gazetteBase.slice(0, 10))) {
              updateFields.full_address = gazetteValue;
              changes.push(`full_address: ${existingValue} → ${gazetteValue} (added ZIP)`);
              stats.zipAdditions++;
            }
          }
        }
      }
    }

    if (Object.keys(updateFields).length > 0) {
      // Add verification metadata
      updateFields.verification_source = 'vineyard_gazette_business_directory';
      updateFields.last_verified_at = new Date().toISOString();
      updateFields.updated_at = new Date().toISOString();

      updates.push({
        id: existing.id,
        name: existing.name || existing.business_name,
        updates: updateFields,
        changes
      });
      stats.total++;
    }
  }

  console.log(`Safe updates to apply: ${updates.length}\n`);
  console.log('Breakdown:');
  console.log(`  - Address fills: ${stats.addressFills}`);
  console.log(`  - Phone fills: ${stats.phoneFills}`);
  console.log(`  - Website normalizations: ${stats.websiteNormalizations}`);
  console.log(`  - ZIP additions: ${stats.zipAdditions}`);
  console.log('');

  // Create backup before applying
  console.log('Creating backup of affected records...');
  const backupIds = updates.map(u => u.id);
  const { data: backupData, error: backupError } = await supabase
    .from('businesses')
    .select('id, business_name, full_address, phone, website, verification_source, last_verified_at')
    .in('id', backupIds);

  if (backupError) {
    console.error('Failed to create backup:', backupError);
    process.exit(1);
  }

  const backupPath = path.join(gazetteDir, `backup-before-safe-updates-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Backup saved: ${backupPath}\n`);

  // Apply updates
  console.log('Applying updates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('businesses')
      .update(update.updates)
      .eq('id', update.id);

    if (error) {
      console.error(`✗ Error updating ID ${update.id} (${update.name}):`, error.message);
      errorCount++;
    } else {
      console.log(`✓ Updated ID ${update.id}: ${update.name}`);
      for (const change of update.changes) {
        console.log(`    ${change}`);
      }
      successCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nSuccessful updates: ${successCount}`);
  console.log(`Failed updates: ${errorCount}`);
  console.log(`\nBackup saved: ${backupPath}`);

  if (errorCount === 0) {
    console.log('\n✓ All safe updates applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify updates in admin dashboard');
    console.log('2. Regenerate exports: npm run registry:export');
    console.log('3. Test public directory');
  } else {
    console.log('\n⚠ Some updates failed. Check errors above.');
  }
}

main().catch(console.error);

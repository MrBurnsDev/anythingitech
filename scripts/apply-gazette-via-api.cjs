#!/usr/bin/env node
/**
 * Apply Gazette Safe Updates via Production API
 *
 * This script processes the Gazette matches and calls the production API
 * to apply safe updates. Requires admin authentication token.
 *
 * Usage:
 *   1. Get admin token: curl -s -X POST "https://anythingitech.vercel.app/api/admin/auth" \
 *        -H "Content-Type: application/json" -d '{"username":"admin","password":"YOUR_PASSWORD"}'
 *   2. Run: ADMIN_TOKEN="your_token" node scripts/apply-gazette-via-api.cjs
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('Error: ADMIN_TOKEN environment variable required');
  console.error('\nTo get a token:');
  console.error('  curl -s -X POST "https://anythingitech.vercel.app/api/admin/auth" \\');
  console.error('    -H "Content-Type: application/json" \\');
  console.error('    -d \'{"username":"admin","password":"YOUR_PASSWORD"}\'');
  console.error('\nThen run:');
  console.error('  ADMIN_TOKEN="your_token" node scripts/apply-gazette-via-api.cjs');
  process.exit(1);
}

const gazetteDir = path.join(__dirname, '../data/gazette');

function loadJSON(filename) {
  const filePath = path.join(gazetteDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function normalizeWebsiteToHttps(url) {
  if (!url) return null;
  let normalized = url.trim();
  normalized = normalized.replace(/^http:\/\//, 'https://');
  normalized = normalized.replace(/\/+$/, '');
  if (!normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

function extractZipFromAddress(address) {
  if (!address) return null;
  const match = address.match(/MA\s*(\d{5})/);
  return match ? match[1] : null;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  GAZETTE SAFE UPDATES - APPLYING VIA API');
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
    total: 0
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
      }

      if (field === 'website') {
        const normalizedGazette = normalizeWebsiteToHttps(gazetteValue);
        const normalizedExisting = normalizeWebsiteToHttps(existingValue);

        if (!existingValue && gazetteValue) {
          updateFields.website = normalizedGazette;
          changes.push(`website: (empty) → ${normalizedGazette}`);
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

  // Save backup of what we're about to send
  const backupPath = path.join(gazetteDir, `updates-to-apply-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates, null, 2));
  console.log(`Updates saved to: ${backupPath}\n`);

  // Apply updates in batches
  const BATCH_SIZE = 20;
  let successCount = 0;
  let failedCount = 0;

  console.log('Applying updates via API...\n');

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(updates.length / BATCH_SIZE);

    console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} updates)...`);

    // Process each update in the batch individually using PUT /api/admin/businesses
    for (const update of batch) {
      try {
        // Build the PUT body - use id to look up the record
        const putBody = {
          id: update.id,
          ...update.updates
        };

        const response = await fetch(`${API_BASE}/api/admin/businesses`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          },
          body: JSON.stringify(putBody)
        });

        const result = await response.json();

        if (response.ok) {
          successCount++;
          console.log(`  ✓ ID ${update.id}: ${update.name}`);
        } else {
          failedCount++;
          console.error(`  ✗ ID ${update.id}: ${result.error || response.statusText}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`  ✗ ID ${update.id}: Network error - ${error.message}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nSuccessful updates: ${successCount}`);
  console.log(`Failed updates: ${failedCount}`);

  if (failedCount === 0) {
    console.log('\n✓ All safe updates applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify updates in admin dashboard');
    console.log('2. Regenerate exports');
    console.log('3. Test public directory');
  } else {
    console.log('\n⚠ Some updates failed. Check errors above.');
  }
}

main().catch(console.error);

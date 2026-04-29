#!/usr/bin/env node
/**
 * Apply Businesses 2 Safe Updates via Production API
 *
 * Only applies updates that fill missing fields - never overwrites existing data.
 * Filters out invalid records (undefined IDs, description-in-address-field issues).
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD environment variable required');
  console.error('Usage: ADMIN_PASSWORD="your-admin-password" node scripts/apply-businesses-2-safe-updates.cjs');
  process.exit(1);
}

async function getAdminToken() {
  const response = await fetch(`${API_BASE}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: ADMIN_PASSWORD })
  });
  const data = await response.json();
  if (!data.token) {
    throw new Error('Failed to get admin token: ' + JSON.stringify(data));
  }
  return data.token;
}

// Valid safe updates - manually curated from the matches data
// Only including phone fills and REAL address fills (not descriptions)
const safeUpdates = [
  {
    id: 417,
    name: 'Summercamp Hotel',
    updates: { phone: '(508) 693-6611' },
    changes: ['phone: NULL → (508) 693-6611']
  },
  {
    id: 286,
    name: 'Eisenhauer Gallery',
    updates: { phone: '(508) 627-7003' },
    changes: ['phone: NULL → (508) 627-7003']
  },
  {
    id: 729,
    name: 'Model Deli',
    updates: { phone: '(508) 693-6100' },
    changes: ['phone: NULL → (508) 693-6100']
  },
  {
    id: 8,
    name: "Martha's Vineyard Film Festival",
    updates: { phone: '(508) 696-9369' },
    changes: ['phone: NULL → (508) 696-9369']
  },
  {
    id: 114,
    name: 'Square Rigger Restaurant',
    updates: { phone: '(508) 627-9968', full_address: '225 Edgartown Rd, Edgartown' },
    changes: ['phone: NULL → (508) 627-9968', 'address: NULL → 225 Edgartown Rd, Edgartown']
  },
  {
    id: 150,
    name: "Fat Ronnie's Burger Bar",
    updates: { phone: '(508) 693-6600', full_address: '7 Circuit Ave, Oak Bluffs' },
    changes: ['phone: NULL → (508) 693-6600', 'address: NULL → 7 Circuit Ave, Oak Bluffs']
  },
  {
    id: 141,
    name: 'Coop de Ville',
    updates: { phone: '(508) 693-3420', full_address: '12 Circuit Ave Extension, Oak Bluffs' },
    changes: ['phone: NULL → (508) 693-3420', 'address: NULL → 12 Circuit Ave Extension, Oak Bluffs']
  },
  {
    id: 219,
    name: 'Scottish Bakehouse',
    updates: { phone: '(508) 693-6633' },
    changes: ['phone: NULL → (508) 693-6633']
  },
  {
    id: 722,
    name: 'Edgartown Diner',
    updates: { full_address: '65 Main St, Edgartown' },
    changes: ['address: NULL → 65 Main St, Edgartown']
  },
  {
    id: 204,
    name: 'La Choza',
    updates: { phone: '(508) 693-9050' },
    changes: ['phone: NULL → (508) 693-9050']
  },
  {
    id: 121,
    name: 'The Porthunter',
    updates: { phone: '(508) 627-7747' },
    changes: ['phone: NULL → (508) 627-7747']
  },
  {
    id: 206,
    name: 'Mikado Asian Bistro',
    updates: { phone: '(508) 338-7096', full_address: '76 Main Street, Vineyard Haven' },
    changes: ['phone: NULL → (508) 338-7096', 'address: NULL → 76 Main Street, Vineyard Haven']
  }
];

// Records EXCLUDED from safe updates (with reasons):
const excluded = [
  { name: 'Vineyard Harbor Motel', reason: 'ID is undefined in export' },
  { name: 'Outermost Inn', reason: 'Address field contains description, not address' },
  { name: 'The Seafood Shanty', reason: 'Address field contains description, not address' },
  { name: 'Back Door Donuts', reason: 'Address field contains description, not address' },
  { name: 'The Porthunter', reason: 'Address field contains description - only applying phone' }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BUSINESSES 2 SAFE UPDATES - VIA API');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Getting admin token...');
  const ADMIN_TOKEN = await getAdminToken();
  console.log('Token obtained successfully\n');

  console.log(`Safe updates to apply: ${safeUpdates.length}`);
  console.log(`Excluded (invalid): ${excluded.length}\n`);

  console.log('Excluded records:');
  for (const ex of excluded) {
    console.log(`  - ${ex.name}: ${ex.reason}`);
  }
  console.log('');

  let successCount = 0;
  let failedCount = 0;
  const results = [];

  console.log('Applying updates...\n');

  for (const update of safeUpdates) {
    try {
      const putBody = {
        id: update.id,
        ...update.updates,
        verification_source: 'businesses_2_import',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        for (const change of update.changes) {
          console.log(`      ${change}`);
        }
        results.push({ id: update.id, name: update.name, status: 'success', changes: update.changes });
      } else {
        failedCount++;
        console.error(`  ✗ ID ${update.id}: ${result.error || response.statusText}`);
        results.push({ id: update.id, name: update.name, status: 'failed', error: result.error });
      }
    } catch (error) {
      failedCount++;
      console.error(`  ✗ ID ${update.id}: Network error - ${error.message}`);
      results.push({ id: update.id, name: update.name, status: 'error', error: error.message });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nSuccessful updates: ${successCount}`);
  console.log(`Failed updates: ${failedCount}`);
  console.log(`Excluded (invalid data): ${excluded.length}`);

  // Save results
  const resultsPath = path.join(__dirname, '../data/imports/businesses-2/safe-updates-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    successful: successCount,
    failed: failedCount,
    excluded: excluded.length,
    results,
    excludedRecords: excluded
  }, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  if (failedCount === 0) {
    console.log('\n✓ All valid safe updates applied successfully!');
  } else {
    console.log('\n⚠ Some updates failed. Check errors above.');
  }
}

main().catch(console.error);

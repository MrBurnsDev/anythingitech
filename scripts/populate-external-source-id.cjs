#!/usr/bin/env node
/**
 * Populate external_source_id via Admin API
 *
 * This script fetches all businesses and updates those without external_source_id.
 * Requires: ADMIN_TOKEN environment variable
 *
 * Pre-requisite: Run this SQL in Supabase Dashboard first:
 *
 * ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;
 * ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';
 * CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id ON businesses(external_source_id) WHERE external_source_id IS NOT NULL;
 */

const https = require('https');

const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('ERROR: ADMIN_TOKEN environment variable required');
  console.error('');
  console.error('Get a token:');
  console.error('  curl -s -X POST "https://anythingitech.vercel.app/api/admin/auth" \\');
  console.error('    -H "Content-Type: application/json" \\');
  console.error('    -d \'{"username":"admin","password":"YOUR_PASSWORD"}\'');
  console.error('');
  console.error('Usage:');
  console.error('  ADMIN_TOKEN="your-jwt-token" node scripts/populate-external-source-id.cjs');
  process.exit(1);
}

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fetchAllBusinesses() {
  const allBusinesses = [];
  let page = 1;
  const limit = 100;

  console.log('Fetching businesses...');

  while (true) {
    const data = await apiRequest('GET', `/api/admin/businesses?page=${page}&limit=${limit}`);
    const businesses = data.businesses || [];
    allBusinesses.push(...businesses);

    console.log(`  Page ${page}: ${businesses.length} businesses`);

    if (!data.pagination || page >= data.pagination.totalPages) break;
    page++;
  }

  return allBusinesses;
}

async function main() {
  console.log('='.repeat(60));
  console.log('POPULATE EXTERNAL_SOURCE_ID');
  console.log('='.repeat(60));
  console.log(`API: ${API_BASE}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  // Fetch all businesses
  const businesses = await fetchAllBusinesses();
  console.log(`\nTotal businesses: ${businesses.length}`);

  // Check if the column exists by looking at the first business
  if (businesses.length > 0) {
    const sample = businesses[0];
    const hasColumn = 'external_source_id' in sample;

    console.log(`\nColumn exists: ${hasColumn ? 'YES' : 'NO'}`);

    if (!hasColumn) {
      console.log('\n' + '!'.repeat(60));
      console.log('COLUMN MISSING - RUN THIS SQL IN SUPABASE DASHBOARD FIRST:');
      console.log('!'.repeat(60));
      console.log(`
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id ON businesses(external_source_id) WHERE external_source_id IS NOT NULL;
`);
      console.log('Then re-run this script.');
      process.exit(1);
    }
  }

  // Count how many need updating
  const needsUpdate = businesses.filter(b => !b.external_source_id);
  const alreadyHas = businesses.filter(b => b.external_source_id);

  console.log(`\nAlready have external_source_id: ${alreadyHas.length}`);
  console.log(`Need to populate: ${needsUpdate.length}`);

  if (needsUpdate.length === 0) {
    console.log('\nAll records already have external_source_id. Nothing to do.');
    return;
  }

  // Update records
  console.log('\nPopulating external_source_id...');
  let updated = 0;
  let failed = 0;
  const errors = [];

  for (const biz of needsUpdate) {
    const externalSourceId = `supabase:${biz.slug}`;
    const verificationSource = biz.verification_source || 'legacy';

    try {
      await apiRequest('PUT', '/api/admin/businesses', {
        id: biz.id,
        external_source_id: externalSourceId,
        verification_source: verificationSource
      });
      updated++;

      if (updated % 50 === 0) {
        console.log(`  Updated ${updated}/${needsUpdate.length}...`);
      }
    } catch (err) {
      failed++;
      errors.push({ name: biz.business_name, id: biz.id, error: err.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${businesses.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors.slice(0, 10)) {
      console.log(`  - ${e.name} (ID ${e.id}): ${e.error}`);
    }
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }

  // Verify
  console.log('\nVerifying...');
  const verifyData = await fetchAllBusinesses();
  const withId = verifyData.filter(b => b.external_source_id).length;
  const withoutId = verifyData.filter(b => !b.external_source_id).length;

  console.log(`With external_source_id: ${withId}`);
  console.log(`Without external_source_id: ${withoutId}`);

  if (withoutId === 0) {
    console.log('\n✓ All businesses now have external_source_id');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

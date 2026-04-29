#!/usr/bin/env node
/**
 * Apply External Source ID Migration via API
 *
 * Since we don't have direct Supabase access locally,
 * this script updates records via the admin API.
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('ERROR: ADMIN_TOKEN environment variable required');
  console.error('Usage: ADMIN_TOKEN="your-jwt-token" node scripts/apply-external-source-id-migration.cjs');
  process.exit(1);
}

// HTTP helper
function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    };

    const req = client.request(options, (res) => {
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

// Fetch all businesses
async function fetchAllBusinesses() {
  const allBusinesses = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const data = await apiRequest('GET', `/api/admin/businesses?page=${page}&limit=${limit}`);
    const businesses = data.businesses || [];
    allBusinesses.push(...businesses);

    if (!data.pagination || page >= data.pagination.totalPages) break;
    page++;
  }

  return allBusinesses;
}

// Generate external_source_id from slug
function generateExternalSourceId(business) {
  return `supabase:${business.slug || 'unknown'}`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('APPLY EXTERNAL SOURCE ID MIGRATION');
  console.log('='.repeat(60));
  console.log(`API: ${API_BASE}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Check if migration columns exist by trying to update a test record
  console.log('Checking if migration is needed...\n');

  // First, fetch all businesses
  console.log('Fetching all businesses...');
  const businesses = await fetchAllBusinesses();
  console.log(`Found ${businesses.length} businesses\n`);

  // Check first business for external_source_id field
  if (businesses.length > 0) {
    const sample = businesses[0];
    if (sample.external_source_id !== undefined) {
      console.log('external_source_id column already exists');

      // Count how many need updating
      const needsUpdate = businesses.filter(b => !b.external_source_id);
      console.log(`${needsUpdate.length} records need external_source_id populated`);

      if (needsUpdate.length === 0) {
        console.log('\nAll records already have external_source_id. Nothing to do.');
        return;
      }
    } else {
      console.log('WARNING: external_source_id column does not exist in API response');
      console.log('You need to run the SQL migration in Supabase first:');
      console.log('');
      console.log('  migrations/005-add-external-source-id.sql');
      console.log('');
      console.log('Run this in the Supabase SQL Editor, then re-run this script.');
      return;
    }
  }

  // Update records that don't have external_source_id
  console.log('\nUpdating records...');
  let updated = 0;
  let failed = 0;

  for (const business of businesses) {
    if (business.external_source_id) continue;

    const externalSourceId = generateExternalSourceId(business);

    try {
      await apiRequest('PUT', '/api/admin/businesses', {
        id: business.id,
        external_source_id: externalSourceId,
        verification_source: business.verification_source || 'legacy'
      });
      updated++;
      if (updated % 50 === 0) {
        console.log(`  Updated ${updated} records...`);
      }
    } catch (err) {
      console.error(`  Failed to update ${business.business_name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (already had ID): ${businesses.length - updated - failed}`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

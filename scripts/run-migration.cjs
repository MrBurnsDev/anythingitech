#!/usr/bin/env node
/**
 * Run directory migration via API
 *
 * This script calls the migration API endpoint to sync public JSON to Supabase.
 * The API runs on Vercel where the Supabase service key is available.
 *
 * Usage: node scripts/run-migration.cjs <admin-token> [api-url]
 *
 * Example:
 *   node scripts/run-migration.cjs eyJhbGciOiJIUzI1NiIsInR5... https://anythingitech.vercel.app
 */

const fs = require('fs');
const path = require('path');

const token = process.argv[2];
const baseUrl = process.argv[3] || 'https://anythingitech.vercel.app';

if (!token) {
  console.error('Usage: node scripts/run-migration.cjs <admin-token> [api-url]');
  console.error('');
  console.error('To get the admin token:');
  console.error('1. Open browser DevTools on the admin dashboard');
  console.error('2. Run: localStorage.getItem("admin_token")');
  console.error('3. Copy the token value');
  process.exit(1);
}

async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Running Directory Migration via API');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Load businesses from JSON
  const jsonPath = path.join(__dirname, '..', 'data', 'exports', 'businesses.json');
  const businesses = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${businesses.length} businesses from businesses.json\n`);

  // Call the migration API
  console.log(`Calling ${baseUrl}/api/admin/migrate-directory ...\n`);

  try {
    const response = await fetch(`${baseUrl}/api/admin/migrate-directory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ businesses }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Migration failed:', result);
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Migration Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Input:      ${result.stats.input} businesses`);
    console.log(`  Updated:    ${result.stats.updated}`);
    console.log(`  Inserted:   ${result.stats.inserted}`);
    console.log(`  Errors:     ${result.stats.errors.length}`);
    console.log(`  Final count: ${result.stats.finalCount} active businesses`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (result.stats.errors.length > 0) {
      console.log('Errors:');
      result.stats.errors.slice(0, 10).forEach(e => console.log(`  - ${e.name}: ${e.error}`));
      if (result.stats.errors.length > 10) {
        console.log(`  ... and ${result.stats.errors.length - 10} more`);
      }
      console.log('');
    }

    console.log('Verification:');
    result.verification.forEach(v => {
      const status = v.found ? '✓' : '❌';
      console.log(`  ${status} ${v.slug}${v.id ? ` (ID: ${v.id})` : ''}`);
    });

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('Request failed:', error);
    process.exit(1);
  }
}

runMigration();

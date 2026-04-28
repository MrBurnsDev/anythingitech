#!/usr/bin/env node
/**
 * Migrate public directory data to Supabase
 *
 * This script syncs the canonical public JSON (businesses.json) into Supabase,
 * establishing Supabase as the single source of truth.
 *
 * Run: node scripts/migrate-to-supabase.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase config - uses service role key for full access
const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY required');
  console.error('Set it in .env or pass as environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

// Stats tracking
const stats = {
  backed_up: 0,
  inserted: 0,
  updated: 0,
  skipped: 0,
  conflicts: [],
  errors: [],
};

async function backupSupabase() {
  console.log('📦 Backing up current Supabase businesses...');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .order('id');

  if (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `supabase-businesses-${timestamp}.json`);

  fs.writeFileSync(backupPath, JSON.stringify(businesses, null, 2));
  stats.backed_up = businesses.length;

  console.log(`   Backed up ${businesses.length} records to ${backupPath}`);
  return businesses;
}

async function loadPublicJSON() {
  console.log('📄 Loading public directory JSON...');

  const jsonPath = path.join(EXPORTS_DIR, 'businesses.json');
  const businesses = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`   Loaded ${businesses.length} businesses from businesses.json`);
  return businesses;
}

function normalizeForMatch(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function syncToSupabase(publicBusinesses, existingSupabase) {
  console.log('\n🔄 Syncing businesses to Supabase...\n');

  // Build lookup maps for existing Supabase records
  const supabaseBySlug = new Map();
  const supabaseByNameTown = new Map();

  for (const b of existingSupabase) {
    if (b.slug) {
      supabaseBySlug.set(b.slug.toLowerCase(), b);
    }
    const key = `${normalizeForMatch(b.business_name)}|${normalizeForMatch(b.town)}`;
    supabaseByNameTown.set(key, b);
  }

  for (const pub of publicBusinesses) {
    try {
      // Try to find existing record by slug first
      let existing = supabaseBySlug.get(pub.slug?.toLowerCase());

      // If not found by slug, try by name+town
      if (!existing) {
        const key = `${normalizeForMatch(pub.name)}|${normalizeForMatch(pub.town)}`;
        existing = supabaseByNameTown.get(key);
      }

      // Prepare the record for Supabase
      const record = {
        business_name: pub.name,
        slug: pub.slug,
        town: pub.town,
        category: pub.category,
        subcategory: pub.subcategory || null,
        short_description: pub.description || null,
        full_address: pub.address || null,
        phone: pub.phone || null,
        email: pub.email || null,
        website: pub.website || null,
        latitude: pub.coordinates?.lat || null,
        longitude: pub.coordinates?.lng || null,
        facebook_url: pub.social?.facebook || null,
        instagram_url: pub.social?.instagram || null,
        yelp_url: pub.social?.yelp || null,
        tripadvisor_url: pub.social?.tripadvisor || null,
        business_status: 'active',
        is_duplicate: false,
        needs_manual_review: false,
        confidence_score: pub.confidence || 70,
      };

      if (existing) {
        // Update existing record - preserve the Supabase ID
        const { error } = await supabase
          .from('businesses')
          .update(record)
          .eq('id', existing.id);

        if (error) {
          stats.errors.push({ business: pub.name, error: error.message });
          console.log(`   ❌ Error updating ${pub.name}: ${error.message}`);
        } else {
          stats.updated++;
          console.log(`   ✓ Updated: ${pub.name} (ID: ${existing.id})`);
        }
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('businesses')
          .insert(record)
          .select('id')
          .single();

        if (error) {
          // Check if it's a duplicate slug error
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            stats.conflicts.push({ business: pub.name, slug: pub.slug, error: error.message });
            console.log(`   ⚠️ Conflict: ${pub.name} (slug: ${pub.slug})`);
          } else {
            stats.errors.push({ business: pub.name, error: error.message });
            console.log(`   ❌ Error inserting ${pub.name}: ${error.message}`);
          }
        } else {
          stats.inserted++;
          console.log(`   + Inserted: ${pub.name} (ID: ${data.id})`);
        }
      }
    } catch (err) {
      stats.errors.push({ business: pub.name, error: err.message });
      console.log(`   ❌ Exception for ${pub.name}: ${err.message}`);
    }
  }
}

async function verifySync() {
  console.log('\n🔍 Verifying sync...');

  // Check specific businesses
  const testCases = [
    'la-choza-vineyard-haven',
    'the-black-dog-tavern-company-vineyard-haven',
    'catboat-coffee-co-vineyard-haven',
    'artcliff-diner-vineyard-haven',
    'mocha-motts-vineyard-haven',
    'bunch-of-grapes-bookstore-vineyard-haven',
  ];

  console.log('\n   Test cases:');
  for (const slug of testCases) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, business_name, slug, town')
      .eq('slug', slug)
      .single();

    if (data) {
      console.log(`   ✓ ${data.business_name} (ID: ${data.id})`);
    } else {
      console.log(`   ❌ Not found: ${slug}`);
    }
  }

  // Get final count
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('is_duplicate', false)
    .eq('business_status', 'active');

  console.log(`\n   Final active business count: ${count}`);
  return count;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migrate Public Directory to Supabase');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Backup existing Supabase data
  const existingSupabase = await backupSupabase();

  // Step 2: Load public JSON
  const publicBusinesses = await loadPublicJSON();

  // Step 3: Sync to Supabase
  await syncToSupabase(publicBusinesses, existingSupabase);

  // Step 4: Verify
  const finalCount = await verifySync();

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Backed up:  ${stats.backed_up} records`);
  console.log(`  Inserted:   ${stats.inserted} new records`);
  console.log(`  Updated:    ${stats.updated} existing records`);
  console.log(`  Conflicts:  ${stats.conflicts.length}`);
  console.log(`  Errors:     ${stats.errors.length}`);
  console.log(`  Final count: ${finalCount} active businesses`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (stats.conflicts.length > 0) {
    console.log('Conflicts:');
    stats.conflicts.forEach(c => console.log(`  - ${c.business}: ${c.error}`));
  }

  if (stats.errors.length > 0) {
    console.log('Errors:');
    stats.errors.forEach(e => console.log(`  - ${e.business}: ${e.error}`));
  }

  // Write report
  const reportPath = path.join(BACKUP_DIR, 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    finalCount,
  }, null, 2));
  console.log(`\nReport saved to ${reportPath}`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

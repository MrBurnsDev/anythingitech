#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zrrinbeyiuiydalxiwii.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanupDuplicates() {
  console.log('Fetching all active businesses...\n');

  // Get all active businesses
  const { data: allBusinesses, error: fetchError } = await supabase
    .from('businesses')
    .select('id, business_name, slug, town, business_status')
    .eq('business_status', 'active')
    .order('id');

  if (fetchError) {
    console.error('Failed to fetch businesses:', fetchError);
    process.exit(1);
  }

  console.log(`Found ${allBusinesses.length} active businesses\n`);

  // Group by normalized name + town
  const groups = new Map();

  for (const b of allBusinesses) {
    const key = `${(b.business_name || '').toLowerCase().trim()}|${(b.town || '').toLowerCase().trim()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(b);
  }

  // Find duplicate groups
  const duplicateGroups = [];
  for (const [key, businesses] of groups) {
    if (businesses.length > 1) {
      businesses.sort((a, b) => a.id - b.id);
      duplicateGroups.push({
        key,
        keep: businesses[0],
        remove: businesses.slice(1)
      });
    }
  }

  console.log(`Found ${duplicateGroups.length} duplicate groups\n`);

  if (duplicateGroups.length === 0) {
    console.log('No duplicates to clean up!');
    return;
  }

  let redirectsCreated = 0;
  let businessesMarked = 0;
  const errors = [];

  for (const group of duplicateGroups) {
    const keep = group.keep;
    console.log(`\nKeeping: ${keep.business_name} (ID: ${keep.id}, slug: ${keep.slug})`);

    for (const dup of group.remove) {
      console.log(`  Marking as duplicate: ${dup.business_name} (ID: ${dup.id}, slug: ${dup.slug})`);

      // Create redirect from old slug to canonical slug
      if (dup.slug && dup.slug !== keep.slug) {
        const { error: redirectError } = await supabase
          .from('slug_redirects')
          .upsert({
            old_slug: dup.slug,
            new_slug: keep.slug,
            business_id: keep.id,
            created_at: new Date().toISOString()
          }, { onConflict: 'old_slug' });

        if (redirectError) {
          errors.push(`Redirect for ${dup.slug}: ${redirectError.message}`);
        } else {
          redirectsCreated++;
          console.log(`    Created redirect: ${dup.slug} -> ${keep.slug}`);
        }
      }

      // Mark duplicate as inactive
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          is_duplicate: true,
          business_status: 'duplicate',
          notes: `Duplicate of ID ${keep.id} (${keep.slug})`
        })
        .eq('id', dup.id);

      if (updateError) {
        errors.push(`Mark duplicate ${dup.id}: ${updateError.message}`);
      } else {
        businessesMarked++;
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Duplicate groups found: ${duplicateGroups.length}`);
  console.log(`Businesses marked as duplicate: ${businessesMarked}`);
  console.log(`Redirects created: ${redirectsCreated}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log('\nDone!');
}

cleanupDuplicates().catch(console.error);

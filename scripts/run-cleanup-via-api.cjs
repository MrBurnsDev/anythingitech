#!/usr/bin/env node

/**
 * Cleanup duplicates via production API
 * First logs in to get JWT token, then calls cleanup endpoint
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD environment variable required');
  console.error('Usage: ADMIN_PASSWORD="your-admin-password" node scripts/run-cleanup-via-api.cjs');
  process.exit(1);
}

async function main() {
  console.log('Logging in to admin...');

  // Get auth token
  const authResponse = await fetch('https://anythingitech.vercel.app/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: ADMIN_PASSWORD
    })
  });

  const authData = await authResponse.json();

  if (!authResponse.ok || !authData.token) {
    console.error('Auth failed:', authData);
    process.exit(1);
  }

  console.log('Authenticated! Running cleanup...\n');

  // Call cleanup endpoint
  const cleanupResponse = await fetch('https://anythingitech.vercel.app/api/admin/cleanup-duplicates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  });

  const cleanupData = await cleanupResponse.json();

  if (!cleanupResponse.ok) {
    console.error('Cleanup failed:', cleanupData);
    process.exit(1);
  }

  console.log('=== Cleanup Summary ===');
  console.log(`Duplicate groups found: ${cleanupData.summary.duplicateGroupsFound}`);
  console.log(`Businesses marked as duplicate: ${cleanupData.summary.businessesMarkedDuplicate}`);
  console.log(`Redirects created: ${cleanupData.summary.redirectsCreated}`);
  console.log(`Errors: ${cleanupData.summary.errors}`);

  if (cleanupData.duplicates && cleanupData.duplicates.length > 0) {
    console.log('\n=== Duplicates Processed ===');
    for (const dup of cleanupData.duplicates) {
      console.log(`\nKept: ${dup.kept.name} (ID: ${dup.kept.id}, slug: ${dup.kept.slug})`);
      for (const removed of dup.removed) {
        console.log(`  Removed: ID ${removed.id}, slug: ${removed.slug}`);
      }
    }
  }

  if (cleanupData.errors && cleanupData.errors.length > 0) {
    console.log('\n=== Errors ===');
    for (const err of cleanupData.errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);

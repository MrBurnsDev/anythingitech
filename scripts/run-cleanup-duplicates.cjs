#!/usr/bin/env node

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
if (!secret) {
  console.error('No JWT secret found in .env.local');
  process.exit(1);
}

const token = jwt.sign(
  { userId: 1, username: 'admin', role: 'admin' },
  secret,
  { expiresIn: '1h' }
);

async function runCleanup() {
  console.log('Running duplicate cleanup...\n');

  const response = await fetch('https://anythingitech.vercel.app/api/admin/cleanup-duplicates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Cleanup failed:', data);
    process.exit(1);
  }

  console.log('=== Cleanup Summary ===');
  console.log(`Duplicate groups found: ${data.summary.duplicateGroupsFound}`);
  console.log(`Businesses marked as duplicate: ${data.summary.businessesMarkedDuplicate}`);
  console.log(`Redirects created: ${data.summary.redirectsCreated}`);
  console.log(`Errors: ${data.summary.errors}`);

  if (data.duplicates && data.duplicates.length > 0) {
    console.log('\n=== Duplicates Processed ===');
    for (const dup of data.duplicates) {
      console.log(`\nKept: ${dup.kept.name} (ID: ${dup.kept.id}, slug: ${dup.kept.slug})`);
      for (const removed of dup.removed) {
        console.log(`  Removed: ID ${removed.id}, slug: ${removed.slug}`);
      }
    }
  }

  if (data.errors && data.errors.length > 0) {
    console.log('\n=== Errors ===');
    for (const err of data.errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log('\nDone!');
}

runCleanup().catch(console.error);

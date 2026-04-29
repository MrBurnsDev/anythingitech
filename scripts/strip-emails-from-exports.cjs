#!/usr/bin/env node
/**
 * Strip email addresses from public export JSON files
 * This is a security/privacy measure to prevent email scraping
 *
 * Emails remain in the Supabase database and are only accessible
 * through authenticated admin endpoints.
 */

const fs = require('fs');
const path = require('path');

const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');

// Files to process
const FILES_TO_PROCESS = [
  'businesses.json',
  'mv-business-directory-public.json'
];

function stripEmailsFromArray(arr) {
  return arr.map(item => {
    const { email, ...rest } = item;
    return rest;
  });
}

function stripEmailsFromObject(obj) {
  if (Array.isArray(obj)) {
    return stripEmailsFromArray(obj);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'email') {
      // Skip email field entirely
      continue;
    }
    if (key === 'businesses' && Array.isArray(value)) {
      result[key] = stripEmailsFromArray(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = stripEmailsFromObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function processFile(filename) {
  const filepath = path.join(EXPORTS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⏭️  Skipping ${filename} (not found)`);
    return;
  }

  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);

    // Count emails before
    const emailsBefore = (content.match(/"email"\s*:/g) || []).length;

    // Strip emails
    const stripped = stripEmailsFromObject(data);

    // Write back
    const newContent = JSON.stringify(stripped, null, 2);
    fs.writeFileSync(filepath, newContent);

    // Count emails after
    const emailsAfter = (newContent.match(/"email"\s*:/g) || []).length;

    console.log(`✅ ${filename}: Removed ${emailsBefore - emailsAfter} email fields`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

console.log('🔒 Stripping email addresses from public export files...\n');

for (const file of FILES_TO_PROCESS) {
  processFile(file);
}

console.log('\n✅ Email stripping complete!');
console.log('📝 Note: Emails remain in database, only visible to authenticated admins.');

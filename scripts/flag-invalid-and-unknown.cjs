#!/usr/bin/env node
/**
 * Flag Invalid Records and Mark Unknown Towns
 *
 * This script:
 * 1. Identifies records with invalid names (Facebook, Instagram, URLs, etc.)
 * 2. Marks businesses without verifiable addresses as Unknown
 * 3. Generates a list for Google Places bulk verification
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const EXPORTS_DIR = path.join(__dirname, '..', 'data', 'exports');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

/**
 * Check if business name is invalid
 */
function isInvalidBusinessName(name) {
  if (!name) return { invalid: true, reason: 'empty_name' };

  const patterns = [
    { pattern: /^facebook$/i, reason: 'social_media_platform' },
    { pattern: /^instagram$/i, reason: 'social_media_platform' },
    { pattern: /^twitter$/i, reason: 'social_media_platform' },
    { pattern: /^linkedin$/i, reason: 'social_media_platform' },
    { pattern: /^yelp$/i, reason: 'social_media_platform' },
    { pattern: /^tripadvisor$/i, reason: 'social_media_platform' },
    { pattern: /^menu$/i, reason: 'generic_page_title' },
    { pattern: /^home\s*page$/i, reason: 'generic_page_title' },
    { pattern: /^contact$/i, reason: 'generic_page_title' },
    { pattern: /^about$/i, reason: 'generic_page_title' },
    { pattern: /^redirecting/i, reason: 'page_error' },
    { pattern: /^account suspended/i, reason: 'page_error' },
    { pattern: /^page not found/i, reason: 'page_error' },
    { pattern: /^error/i, reason: 'page_error' },
    { pattern: /\.com$/i, reason: 'domain_as_name' },
    { pattern: /\.org$/i, reason: 'domain_as_name' },
    { pattern: /\.net$/i, reason: 'domain_as_name' },
    { pattern: /^https?:\/\//i, reason: 'url_as_name' },
    { pattern: /^www\./i, reason: 'url_as_name' },
    { pattern: /^secure\./i, reason: 'url_as_name' },
    { pattern: /\.square$/i, reason: 'square_site' },
    { pattern: /\.business$/i, reason: 'generic_domain' },
    { pattern: /\.company$/i, reason: 'generic_domain' },
  ];

  for (const { pattern, reason } of patterns) {
    if (pattern.test(name.trim())) {
      return { invalid: true, reason };
    }
  }

  // Check for very short names (likely garbage)
  if (name.trim().length < 3) {
    return { invalid: true, reason: 'name_too_short' };
  }

  // Check for names that are just numbers
  if (/^\d+$/.test(name.trim())) {
    return { invalid: true, reason: 'numeric_only' };
  }

  return { invalid: false };
}

/**
 * Main processing function
 */
function processBusinesses() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Flagging Invalid Records and Finalizing Town Assignments');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Get all non-duplicate businesses
  const businesses = db.prepare(`
    SELECT id, business_name, town, full_address, zip_code, category, website, phone
    FROM businesses
    WHERE is_duplicate = 0
  `).all();

  console.log(`Total businesses: ${businesses.length}\n`);

  const results = {
    invalid: [],
    needsVerification: [],
    valid: []
  };

  for (const biz of businesses) {
    // Check for invalid business name
    const nameCheck = isInvalidBusinessName(biz.business_name);

    if (nameCheck.invalid) {
      results.invalid.push({
        id: biz.id,
        name: biz.business_name,
        reason: nameCheck.reason,
        town: biz.town
      });
      continue;
    }

    // Check if this is a VH record without supporting address
    const hasAddress = biz.full_address && biz.full_address.trim().length > 0;
    const hasZip = biz.zip_code && biz.zip_code.trim().length > 0;
    const isVH = biz.town === 'Vineyard Haven';

    if (isVH && !hasAddress && !hasZip) {
      results.needsVerification.push({
        id: biz.id,
        name: biz.business_name,
        town: biz.town,
        website: biz.website,
        phone: biz.phone
      });
    } else {
      results.valid.push({
        id: biz.id,
        name: biz.business_name,
        town: biz.town,
        address: biz.full_address
      });
    }
  }

  console.log(`Invalid records: ${results.invalid.length}`);
  console.log(`Needs verification: ${results.needsVerification.length}`);
  console.log(`Valid records: ${results.valid.length}\n`);

  // Generate reports
  generateInvalidReport(results);
  generateVerificationList(results);
  generateFinalMigration(results);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Processing Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Generate report of invalid records
 */
function generateInvalidReport(results) {
  let md = `# Invalid Business Records\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `These ${results.invalid.length} records should be flagged or removed.\n\n`;

  // Group by reason
  const byReason = {};
  for (const r of results.invalid) {
    if (!byReason[r.reason]) byReason[r.reason] = [];
    byReason[r.reason].push(r);
  }

  for (const [reason, records] of Object.entries(byReason)) {
    md += `## ${reason} (${records.length})\n\n`;
    md += `| ID | Name | Current Town |\n`;
    md += `|----|------|-------------|\n`;
    for (const r of records) {
      md += `| ${r.id} | ${r.name} | ${r.town} |\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'invalid-records.md'), md);
  console.log('✓ Generated: data/audits/invalid-records.md');
}

/**
 * Generate Google Maps verification list
 */
function generateVerificationList(results) {
  let md = `# Google Maps Verification List\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `These ${results.needsVerification.length} businesses need manual verification.\n\n`;
  md += `For each, search Google Maps and record the correct town.\n\n`;

  let csv = `id,business_name,current_town,website,phone,google_search_url,verified_town,verified_address\n`;

  for (const biz of results.needsVerification) {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(biz.name + ' Martha\'s Vineyard MA')}`;

    md += `### ${biz.name} (ID: ${biz.id})\n\n`;
    md += `- **Current Town:** ${biz.town}\n`;
    md += `- **Website:** ${biz.website || 'None'}\n`;
    md += `- **Phone:** ${biz.phone || 'None'}\n`;
    md += `- **🔍 [Search Google Maps](${searchUrl})**\n`;
    md += `- **Verified Town:** ________\n`;
    md += `- **Verified Address:** ________\n\n`;

    const name = biz.name.replace(/"/g, '""');
    csv += `${biz.id},"${name}","${biz.town}","${biz.website || ''}","${biz.phone || ''}","${searchUrl}",,\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'verification-list.md'), md);
  fs.writeFileSync(path.join(AUDITS_DIR, 'verification-list.csv'), csv);
  console.log('✓ Generated: data/audits/verification-list.md');
  console.log('✓ Generated: data/audits/verification-list.csv');
}

/**
 * Generate final migration SQL
 */
function generateFinalMigration(results) {
  let sql = `-- Final Town Corrections and Invalid Record Flagging\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `--\n`;
  sql += `-- This migration:\n`;
  sql += `-- 1. Flags ${results.invalid.length} invalid records\n`;
  sql += `-- 2. Marks ${results.needsVerification.length} unverified VH records as Unknown\n`;
  sql += `--\n`;
  sql += `-- Review before applying!\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  // Flag invalid records
  sql += `-- Flag invalid records\n`;
  for (const r of results.invalid) {
    const reason = r.reason.replace(/'/g, "''");
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: ${reason}' WHERE id = ${r.id};\n`;
  }

  // Mark unverified VH records as Unknown
  sql += `\n-- Mark unverified Vineyard Haven records as Unknown\n`;
  for (const biz of results.needsVerification) {
    sql += `UPDATE businesses SET town = 'Unknown' WHERE id = ${biz.id}; -- ${biz.name.substring(0, 40)}\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(path.join(MIGRATIONS_DIR, 'flag-invalid-mark-unknown.sql'), sql);
  console.log('✓ Generated: migrations/flag-invalid-mark-unknown.sql');
}

// Run
processBusinesses();

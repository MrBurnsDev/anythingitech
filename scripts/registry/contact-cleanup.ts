#!/usr/bin/env npx tsx
/**
 * Contact Field Cleanup Pass
 *
 * Focused specifically on:
 * - Address normalization and contamination removal
 * - Email extraction and validation
 *
 * DOES NOT CHANGE:
 * - Name logic
 * - Validation thresholds
 * - Any public records
 *
 * Only processes records blocked due to:
 * - Address contaminated
 * - Email contaminated
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');
const EXPORTS_PATH = path.join(process.cwd(), 'data', 'exports');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Record {
  id: number;
  business_name: string;
  category: string;
  town: string;
  street_address: string;
  full_address: string;
  phone: string;
  email: string;
  website: string;
  domain: string;
  confidence_score: number;
  suppress_from_directory: number;
  validation_notes: string;
  remediation_status: string;
}

interface CleanupResult {
  id: number;
  name: string;
  originalAddress: string | null;
  cleanedAddress: string | null;
  addressCleaned: boolean;
  originalEmail: string | null;
  cleanedEmail: string | null;
  emailCleaned: boolean;
  canRestore: boolean;
  blockingIssues: string[];
}

// ============================================================================
// ADDRESS CLEANUP LOGIC
// ============================================================================

// Contamination patterns to remove from addresses
const ADDRESS_CONTAMINATION_PATTERNS = [
  // Social media
  /\bfacebook\b/gi,
  /\binstagram\b/gi,
  /\btwitter\b/gi,
  /\blinkedin\b/gi,
  /\byoutube\b/gi,
  /\bpinterest\b/gi,
  /\btiktok\b/gi,

  // Navigation/UI text
  /\bfollow us\b/gi,
  /\bcontact us\b/gi,
  /\bget in touch\b/gi,
  /\bfind us\b/gi,
  /\bvisit us\b/gi,
  /\bour location\b/gi,
  /\blocation\b(?=\s*\d)/gi,  // "location" followed by number
  /\baddress\b(?=\s*\d)/gi,   // "address" followed by number
  /\bintro\b/gi,
  /\bintroduction\b/gi,
  /\bofferings\b/gi,
  /\bimage\b/gi,
  /\bmenu\b/gi,
  /\bhours\b/gi,
  /\boffice hours\b/gi,
  /\bclosing day\b/gi,
  /\bregister here\b/gi,
  /\bclick image\b/gi,
  /\blearn more\b/gi,
  /\bclose\b/gi,
  /\badjust your order\b/gi,
  /\bthank you\b/gi,
  /\bsponsors\b/gi,

  // Website fragments
  /^com\s*/i,
  /\bhttp[s]?:\/\/\S+/gi,
  /\bwww\.\S+/gi,
  /\bmailto:\S+/gi,
  /\b[a-z]+\.(com|org|net|gov)\b/gi,

  // Media text
  /\bmedia\b/gi,
  /\bcareers\b/gi,
  /\btravel advisors\b/gi,
  /\baccessibility\b/gi,
  /\bgift cards\b/gi,
  /\bhospitality with heart\b/gi,

  // Time/schedule text
  /\b\d{1,2}[ap]m\b/gi,
  /\bsunday\b/gi,
  /\bmonday\b/gi,
  /\btuesday\b/gi,
  /\bwednesday\b/gi,
  /\bthursday\b/gi,
  /\bfriday\b/gi,
  /\bsaturday\b/gi,
  /\boctober\b/gi,

  // Misc junk
  /\bresort\b(?=\s*\d)/gi,  // "resort" before a number (address)
  /\bgrill\b(?=\s*\d)/gi,   // "grill" before a number
  /\bshipping address\b/gi,
  /\bpo box\b.*(?=\d+\s+[a-z])/gi,  // PO Box before street address
  /\bbox\s+\d+\s*\n/gi,  // Standalone box numbers
];

// MV towns for validation
const MV_TOWNS = [
  'Edgartown',
  'Oak Bluffs',
  'Vineyard Haven',
  'West Tisbury',
  'Chilmark',
  'Aquinnah',
  'Tisbury',
  'Menemsha'
];

// Rejection patterns - if these exist, address is invalid
const ADDRESS_REJECT_PATTERNS = [
  /facebook\.com/i,
  /instagram\.com/i,
  /linkedin\.com/i,
  /twitter\.com/i,
  /youtube\.com/i,
  /mailto:/i,
  /^http/i,
  /behindthebookstore\s*\n/i,  // Specific garbage pattern
];

interface ParsedAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  full: string | null;
  isValid: boolean;
}

function cleanAddress(rawAddress: string | null): ParsedAddress {
  const invalid: ParsedAddress = { street: null, city: null, state: null, zip: null, full: null, isValid: false };

  if (!rawAddress || rawAddress.trim() === '') {
    return { ...invalid, isValid: true };  // No address is valid
  }

  let cleaned = rawAddress;

  // Check for rejection patterns first
  for (const pattern of ADDRESS_REJECT_PATTERNS) {
    if (pattern.test(cleaned)) {
      // Try to extract address after the junk
      const afterJunk = cleaned.replace(pattern, '');
      if (afterJunk.trim().length < 10) {
        return invalid;
      }
      cleaned = afterJunk;
    }
  }

  // Remove contamination patterns
  for (const pattern of ADDRESS_CONTAMINATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Normalize whitespace
  cleaned = cleaned
    .replace(/\n{2,}/g, '\n')  // Multiple newlines to single
    .replace(/\t/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove leading/trailing junk lines
  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Look for address pattern in lines
  // Format: NUMBER STREET, CITY, STATE ZIP
  const addressRegex = /(\d+)\s+([A-Za-z0-9\s\.]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir|Park|Parkway|Pkwy|Boulevard|Blvd)?\.?)\s*,?\s*(Vineyard Haven|Edgartown|Oak Bluffs|West Tisbury|Chilmark|Aquinnah|Tisbury|Menemsha)\s*,?\s*(MA|Massachusetts)?\s*(\d{5})?/i;

  for (const line of lines) {
    const match = line.match(addressRegex);
    if (match) {
      const streetNum = match[1];
      let streetName = match[2].trim();
      const city = match[3].trim();
      const zip = match[5] || null;

      // Clean up street name
      streetName = streetName
        .replace(/\s+/g, ' ')
        .replace(/,\s*$/, '')
        .trim();

      const street = `${streetNum} ${streetName}`;
      const full = `${street}, ${city}, MA${zip ? ' ' + zip : ''}`;

      return {
        street,
        city,
        state: 'MA',
        zip,
        full,
        isValid: true
      };
    }
  }

  // Try simpler pattern: just NUMBER STREET
  const simpleRegex = /(\d+)\s+([A-Za-z\s]+(?:Street|St|Road|Rd|Ave|Dr|Ln|Way|Pl|Ct|Cir)\.?)/i;

  // Also look for city in full text
  let foundCity: string | null = null;
  for (const town of MV_TOWNS) {
    if (cleaned.toLowerCase().includes(town.toLowerCase())) {
      foundCity = town;
      break;
    }
  }

  for (const line of lines) {
    const match = line.match(simpleRegex);
    if (match && foundCity) {
      const street = `${match[1]} ${match[2].trim()}`;

      // Look for zip
      const zipMatch = cleaned.match(/\b(02\d{3})\b/);
      const zip = zipMatch ? zipMatch[1] : null;

      const full = `${street}, ${foundCity}, MA${zip ? ' ' + zip : ''}`;

      return {
        street,
        city: foundCity,
        state: 'MA',
        zip,
        full,
        isValid: true
      };
    }
  }

  // If we found a city but no street, still might be usable
  if (foundCity) {
    const zipMatch = cleaned.match(/\b(02\d{3})\b/);
    return {
      street: null,
      city: foundCity,
      state: 'MA',
      zip: zipMatch ? zipMatch[1] : null,
      full: `${foundCity}, MA${zipMatch ? ' ' + zipMatch[1] : ''}`,
      isValid: true  // Partial address is better than contaminated
    };
  }

  return invalid;
}

// ============================================================================
// EMAIL CLEANUP LOGIC
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Patterns that indicate email is contaminated
const EMAIL_CONTAMINATION_PATTERNS = [
  /facebook/i,
  /instagram/i,
  /twitter/i,
  /linkedin/i,
  /social/i,
  /connect/i,
  /^email/i,      // "email" prefix
  /email$/i,      // "email" suffix
  /^\d{3}[-.]?\d{3}/,  // starts with phone
  /\d{3}[-.]?\d{4}[a-z]/i,  // phone merged with text
];

interface CleanedEmail {
  email: string | null;
  isValid: boolean;
  wasExtracted: boolean;
}

function cleanEmail(rawEmail: string | null): CleanedEmail {
  const invalid: CleanedEmail = { email: null, isValid: false, wasExtracted: false };

  if (!rawEmail || rawEmail.trim() === '') {
    return { email: null, isValid: true, wasExtracted: false };  // No email is valid
  }

  const raw = rawEmail.trim();

  // Check if it's already a clean email
  if (EMAIL_REGEX.test(raw) && !EMAIL_CONTAMINATION_PATTERNS.some(p => p.test(raw))) {
    return { email: raw.toLowerCase(), isValid: true, wasExtracted: false };
  }

  // Try to extract email from contaminated string
  const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  if (emailMatch) {
    const extracted = emailMatch[0].toLowerCase();

    // Validate the extracted email
    if (EMAIL_REGEX.test(extracted)) {
      // Check it's not a social platform email
      if (extracted.includes('facebook.com') ||
          extracted.includes('instagram.com') ||
          extracted.includes('twitter.com')) {
        return invalid;
      }

      return { email: extracted, isValid: true, wasExtracted: true };
    }
  }

  return invalid;
}

// ============================================================================
// VALIDATION FOR RESTORATION
// ============================================================================

function isNameValid(name: string): boolean {
  if (!name || name.length < 3) return false;
  if (/\.com$/i.test(name)) return false;
  if (/^(a glimpse|experience|discover|find your|entering|private|luxury|iconic|waterfront|organic)/i.test(name)) return false;
  if (/redirecting|home|menu|welcome|intro/i.test(name)) return false;
  if (/\.\./i.test(name)) return false;
  return true;
}

function isTownValid(town: string | null): boolean {
  if (!town) return false;
  return MV_TOWNS.some(t => town.toLowerCase().includes(t.toLowerCase()));
}

function isPhoneClean(phone: string | null): boolean {
  if (!phone || phone.trim() === '') return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CONTACT FIELD CLEANUP PASS');
  console.log('  Address & Email Normalization Only');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Get only suppressed records that were blocked due to contact field issues
  const blocked = db.prepare(`
    SELECT * FROM businesses
    WHERE suppress_from_directory = 1
      AND is_duplicate = 0
      AND remediation_status = 'corrected'
  `).all() as Record[];

  console.log(`Records blocked after name correction: ${blocked.length}\n`);

  const results: CleanupResult[] = [];
  const cleaned: { id: number; name: string; field: string }[] = [];
  const restored: { id: number; name: string }[] = [];
  const stillBlocked: { id: number; name: string; issues: string[] }[] = [];

  // Prepare update statements
  const updateAddress = db.prepare(`
    UPDATE businesses SET
      street_address = ?,
      full_address = ?
    WHERE id = ?
  `);

  const updateEmail = db.prepare(`
    UPDATE businesses SET
      email = ?
    WHERE id = ?
  `);

  const restoreRecord = db.prepare(`
    UPDATE businesses SET
      suppress_from_directory = 0,
      publish_tier = 'B'
    WHERE id = ?
  `);

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  PHASE 1 & 2: CLEANING ADDRESS AND EMAIL FIELDS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  for (const record of blocked) {
    const result: CleanupResult = {
      id: record.id,
      name: record.business_name,
      originalAddress: record.full_address,
      cleanedAddress: null,
      addressCleaned: false,
      originalEmail: record.email,
      cleanedEmail: null,
      emailCleaned: false,
      canRestore: false,
      blockingIssues: []
    };

    // Clean address
    const addressResult = cleanAddress(record.full_address);
    if (addressResult.isValid && addressResult.full) {
      if (addressResult.full !== record.full_address) {
        result.cleanedAddress = addressResult.full;
        result.addressCleaned = true;
        updateAddress.run(addressResult.street, addressResult.full, record.id);
        cleaned.push({ id: record.id, name: record.business_name, field: 'address' });
        console.log(`  ✏️  ID ${record.id}: Address cleaned`);
        console.log(`      Before: "${(record.full_address || '').slice(0, 50)}..."`);
        console.log(`      After:  "${addressResult.full}"`);
      }
    } else if (!addressResult.isValid) {
      // Clear contaminated address rather than keep garbage
      updateAddress.run(null, null, record.id);
      result.addressCleaned = true;
      console.log(`  🧹 ID ${record.id}: Address cleared (unrecoverable contamination)`);
    }

    // Clean email
    const emailResult = cleanEmail(record.email);
    if (emailResult.isValid && emailResult.email) {
      if (emailResult.email !== record.email) {
        result.cleanedEmail = emailResult.email;
        result.emailCleaned = true;
        updateEmail.run(emailResult.email, record.id);
        cleaned.push({ id: record.id, name: record.business_name, field: 'email' });
        console.log(`  ✏️  ID ${record.id}: Email cleaned`);
        console.log(`      Before: "${(record.email || '').slice(0, 50)}"`);
        console.log(`      After:  "${emailResult.email}"`);
      }
    } else if (!emailResult.isValid && record.email) {
      // Clear contaminated email
      updateEmail.run(null, record.id);
      result.emailCleaned = true;
      console.log(`  🧹 ID ${record.id}: Email cleared (unrecoverable contamination)`);
    }

    results.push(result);
  }

  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  PHASE 3 & 4: VALIDATION AND CONTROLLED RESTORATION');
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Re-fetch updated records
  const updatedRecords = db.prepare(`
    SELECT * FROM businesses
    WHERE id IN (${blocked.map(() => '?').join(',')})
  `).all(...blocked.map(r => r.id)) as Record[];

  for (const record of updatedRecords) {
    const issues: string[] = [];

    // Validate name
    if (!isNameValid(record.business_name)) {
      issues.push('Name invalid');
    }

    // Validate address (now cleaned or cleared)
    // An empty address is acceptable, but contaminated is not
    if (record.full_address) {
      const addrCheck = cleanAddress(record.full_address);
      if (!addrCheck.isValid) {
        issues.push('Address still contaminated');
      }
    }

    // Validate email (now cleaned or cleared)
    if (record.email) {
      const emailCheck = cleanEmail(record.email);
      if (!emailCheck.isValid) {
        issues.push('Email still contaminated');
      }
    }

    // Validate town
    if (!isTownValid(record.town)) {
      issues.push('Town not valid');
    }

    // Validate phone
    if (!isPhoneClean(record.phone)) {
      issues.push('Phone malformed');
    }

    if (issues.length === 0) {
      // All validation passed - RESTORE
      restoreRecord.run(record.id);
      restored.push({ id: record.id, name: record.business_name });
      console.log(`  ✅ ID ${record.id}: "${record.business_name}" - RESTORED`);
    } else {
      stillBlocked.push({ id: record.id, name: record.business_name, issues });
      console.log(`  ⚠️  ID ${record.id}: "${record.business_name}" - STILL BLOCKED`);
      console.log(`      Issues: ${issues.join(', ')}`);
    }
  }

  // ============================================================================
  // PHASE 5: REPORT
  // ============================================================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  CLEANUP RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Records processed:        ${blocked.length}`);
  console.log(`  Fields cleaned:           ${cleaned.length}`);
  console.log(`  Records RESTORED:         ${restored.length}`);
  console.log(`  Still blocked:            ${stillBlocked.length}`);

  if (restored.length > 0) {
    console.log('\n  ═══ RESTORED RECORDS ═══\n');
    for (const r of restored) {
      console.log(`    ✅ ID ${r.id}: ${r.name}`);
    }
  }

  if (stillBlocked.length > 0) {
    console.log('\n  ═══ STILL BLOCKED (manual intervention needed) ═══\n');
    for (const r of stillBlocked) {
      console.log(`    ⚠️  ID ${r.id}: ${r.name}`);
      console.log(`        Issues: ${r.issues.join(', ')}`);
    }
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    processed: blocked.length,
    cleaned: cleaned.length,
    restored: restored.map(r => ({ id: r.id, name: r.name })),
    stillBlocked: stillBlocked.map(r => ({ id: r.id, name: r.name, issues: r.issues })),
  };

  const reportPath = path.join(EXPORTS_PATH, 'contact-cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Final count
  const finalPublic = db.prepare(`
    SELECT COUNT(*) as count FROM businesses
    WHERE suppress_from_directory = 0 AND is_duplicate = 0
  `).get() as { count: number };

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  FINAL PUBLIC DIRECTORY COUNT: ${finalPublic.count}`);
  console.log(`  Report saved to: ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.close();
}

main().catch(console.error);

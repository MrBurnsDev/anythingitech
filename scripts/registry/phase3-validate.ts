#!/usr/bin/env npx tsx
/**
 * Phase 3 - Strict Field Validation & Data Integrity Audit
 *
 * This script:
 * 1. Validates every field with strict rules
 * 2. Detects contaminated data (social text in addresses, merged emails, etc.)
 * 3. Identifies marketing text used as business names
 * 4. Suppresses invalid records from public directory
 * 5. Generates detailed audit report
 *
 * NON-NEGOTIABLE: If ANY critical field fails validation, the record is suppressed.
 *
 * Usage:
 *   npx tsx scripts/registry/phase3-validate.ts           # Dry run
 *   npx tsx scripts/registry/phase3-validate.ts --apply   # Apply suppressions
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

// ============================================================================
// VALIDATION RULES - STRICT FIELD-LEVEL TRUST
// ============================================================================

// Email validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EMAIL_CONTAMINATION_PATTERNS = [
  /facebook/i,
  /instagram/i,
  /twitter/i,
  /linkedin/i,
  /social/i,
  /connect/i,
  /^email/i,      // starts with "email"
  /email$/i,      // ends with "email"
  /^\d{3}[-.]?\d{3}/,  // starts with phone number
  /\d{3}[-.]?\d{4}[a-z]/i,  // phone merged with text
];

interface EmailValidation {
  isValid: boolean;
  cleanedEmail: string | null;
  failureReason: string | null;
}

function validateEmail(email: string | null): EmailValidation {
  if (!email || email.trim() === '') {
    return { isValid: true, cleanedEmail: null, failureReason: null }; // Empty is OK
  }

  const raw = email.trim();

  // Check for contamination patterns
  for (const pattern of EMAIL_CONTAMINATION_PATTERNS) {
    if (pattern.test(raw)) {
      // Try to extract a valid email from contaminated string
      const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && EMAIL_REGEX.test(emailMatch[0])) {
        return {
          isValid: false,
          cleanedEmail: emailMatch[0],
          failureReason: `contaminated_email: extracted "${emailMatch[0]}" from "${raw.slice(0, 50)}"`
        };
      }
      return {
        isValid: false,
        cleanedEmail: null,
        failureReason: `contaminated_email: ${pattern.toString()}`
      };
    }
  }

  // Check if it's a valid email format
  if (!EMAIL_REGEX.test(raw)) {
    // Try to extract valid email
    const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && EMAIL_REGEX.test(emailMatch[0])) {
      return {
        isValid: false,
        cleanedEmail: emailMatch[0],
        failureReason: `malformed_email: extracted "${emailMatch[0]}"`
      };
    }
    return { isValid: false, cleanedEmail: null, failureReason: 'invalid_email_format' };
  }

  // Check for multiple @ symbols
  if ((raw.match(/@/g) || []).length > 1) {
    return { isValid: false, cleanedEmail: null, failureReason: 'multiple_at_symbols' };
  }

  // Check for spaces
  if (raw.includes(' ')) {
    return { isValid: false, cleanedEmail: raw.replace(/\s/g, ''), failureReason: 'email_contains_spaces' };
  }

  return { isValid: true, cleanedEmail: raw.toLowerCase(), failureReason: null };
}

// Address validation
const ADDRESS_CONTAMINATION_PATTERNS = [
  /^com/i,           // starts with "com"
  /instagram/i,
  /facebook/i,
  /twitter/i,
  /linkedin/i,
  /youtube/i,
  /follow us/i,
  /contact us/i,
  /social/i,
  /\bintro\b/i,
  /\bofferings\b/i,
  /\blocation\b.*\d/i,  // "location" followed by address
  /behindthe/i,
  /image/i,
];

const MA_TOWNS = [
  'edgartown', 'vineyard haven', 'oak bluffs', 'west tisbury',
  'chilmark', 'aquinnah', 'tisbury'
];

interface AddressValidation {
  isValid: boolean;
  cleanedAddress: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  failureReason: string | null;
}

function validateAddress(address: string | null): AddressValidation {
  if (!address || address.trim() === '') {
    return { isValid: true, cleanedAddress: null, streetAddress: null, city: null, state: null, zip: null, failureReason: null };
  }

  const raw = address.trim();

  // Check for contamination
  for (const pattern of ADDRESS_CONTAMINATION_PATTERNS) {
    if (pattern.test(raw)) {
      // Try to extract a clean address
      const cleaned = extractCleanAddress(raw);
      if (cleaned) {
        return {
          isValid: false,
          cleanedAddress: cleaned.full,
          streetAddress: cleaned.street,
          city: cleaned.city,
          state: cleaned.state,
          zip: cleaned.zip,
          failureReason: `contaminated_address: ${pattern.toString()}`
        };
      }
      return {
        isValid: false,
        cleanedAddress: null,
        streetAddress: null,
        city: null,
        state: null,
        zip: null,
        failureReason: `contaminated_address: ${pattern.toString()}`
      };
    }
  }

  // Try to parse the address
  const parsed = extractCleanAddress(raw);
  if (!parsed) {
    return {
      isValid: false,
      cleanedAddress: null,
      streetAddress: null,
      city: null,
      state: null,
      zip: null,
      failureReason: 'unparseable_address'
    };
  }

  return {
    isValid: true,
    cleanedAddress: parsed.full,
    streetAddress: parsed.street,
    city: parsed.city,
    state: parsed.state,
    zip: parsed.zip,
    failureReason: null
  };
}

function extractCleanAddress(raw: string): { full: string; street: string | null; city: string | null; state: string | null; zip: string | null } | null {
  // First, try to find a clean address substring by looking for patterns
  // Address format: NUMBER STREET, CITY, MA ZIP

  // Remove obvious contamination prefixes
  let cleaned = raw
    .replace(/^com\s*/i, '')
    .replace(/^(instagram|facebook|twitter|linkedin|youtube)\s*/gi, '')
    .replace(/follow us\s*/gi, '')
    .replace(/contact us\s*/gi, '')
    .replace(/\n+/g, ' ')
    .trim();

  // Look for MA address pattern: NUMBER STREET, CITY, MA ZIP
  const addressPattern = /(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir)\.?),?\s*([A-Za-z\s]+),?\s*(MA|Massachusetts)\s*(\d{5})?/i;

  const match = cleaned.match(addressPattern);
  if (match) {
    const street = match[1].trim();
    let city = match[2].trim();
    const state = 'MA';
    const zip = match[4] || null;

    // Clean up city - remove trailing junk
    city = city.replace(/\s+(ma|massachusetts).*$/i, '').trim();

    // Verify city is a valid MV town
    const cityLower = city.toLowerCase();
    const isValidTown = MA_TOWNS.some(t => cityLower.includes(t));

    // Also check the extracted city isn't garbage
    if (isValidTown && city.length < 30 && !/[0-9()]/.test(city)) {
      return {
        full: `${street}, ${city}, ${state}${zip ? ' ' + zip : ''}`,
        street,
        city,
        state,
        zip
      };
    }
  }

  // More specific pattern for MV addresses
  const mvPattern = /(\d+)\s+([A-Za-z\s]+(?:Street|St|Road|Rd|Ave|Dr|Ln|Way|Pl|Ct|Cir|Circle)?),?\s*(Vineyard Haven|Edgartown|Oak Bluffs|West Tisbury|Chilmark|Aquinnah|Tisbury|Menemsha),?\s*(?:MA|Massachusetts)?\s*(\d{5})?/i;

  const mvMatch = cleaned.match(mvPattern);
  if (mvMatch) {
    const street = `${mvMatch[1]} ${mvMatch[2].trim()}`;
    const city = mvMatch[3].trim();
    const zip = mvMatch[4] || null;

    return {
      full: `${street}, ${city}, MA${zip ? ' ' + zip : ''}`,
      street,
      city,
      state: 'MA',
      zip
    };
  }

  return null;
}

// Phone validation
const PHONE_REGEX = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

interface PhoneValidation {
  isValid: boolean;
  cleanedPhone: string | null;
  failureReason: string | null;
}

function validatePhone(phone: string | null): PhoneValidation {
  if (!phone || phone.trim() === '') {
    return { isValid: true, cleanedPhone: null, failureReason: null };
  }

  const raw = phone.trim();

  // Extract digits
  const digits = raw.replace(/\D/g, '');

  // Check length
  if (digits.length === 10) {
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return { isValid: true, cleanedPhone: formatted, failureReason: null };
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    const formatted = `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return { isValid: true, cleanedPhone: formatted, failureReason: null };
  }

  // Check for contamination (letters mixed in)
  if (/[a-zA-Z]/.test(raw)) {
    // Try to extract phone
    const phoneMatch = raw.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      const extractedDigits = phoneMatch[0].replace(/\D/g, '');
      if (extractedDigits.length === 10) {
        return {
          isValid: false,
          cleanedPhone: `(${extractedDigits.slice(0, 3)}) ${extractedDigits.slice(3, 6)}-${extractedDigits.slice(6)}`,
          failureReason: 'phone_contaminated_with_text'
        };
      }
    }
    return { isValid: false, cleanedPhone: null, failureReason: 'phone_contains_letters' };
  }

  return { isValid: false, cleanedPhone: null, failureReason: 'invalid_phone_format' };
}

// Business name validation - STRICT
const INVALID_NAME_PATTERNS = [
  // Marketing/promotional text
  /^a glimpse/i,
  /^experience\s/i,
  /^explore\s/i,
  /^discover\s/i,
  /^welcome\s/i,
  /^find your/i,
  /^your\s/i,
  /^our\s/i,
  /\.\.\s*$/,  // ends with ".."
  /redirecting/i,

  // Generic category titles (ONLY when they're clearly generic)
  // "Martha's Vineyard Hotels" is generic, "Harbor View Hotel" is specific
  /^martha'?s?\s*vineyard\s*(hotels?|restaurants?|shops?|lodging)/i,
  // Only match when PLURAL (restaurants, hotels, shops) - singular specific businesses like "Aquinnah Shop" are valid
  /^(oak bluffs|edgartown|vineyard haven|west tisbury|chilmark|aquinnah)\s*(hotels|restaurants|shops)/i,
  /^boutique hotels?$/i,
  /^iconic\s+/i,  // "Iconic Martha's Vineyard Hotel"

  // Descriptive phrases
  /artisanal.*studio.*shop/i,
  /organic products in/i,
  /behind the times/i,

  // URL-style names
  /\.com$/i,
  /^www\./i,
  /^http/i,

  // Navigation/page titles
  /^intro$/i,
  /^home$/i,
  /^about$/i,
  /^contact$/i,
  /^menu$/i,
  /^subscribe$/i,

  // Very short
  /^.{1,2}$/,
];

const SUSPICIOUS_NAME_PATTERNS = [
  // Names that look like page sections or captions
  /^[a-z]/,  // starts lowercase (suggests extracted text)
  /&\s*shop$/i,  // "Studio & Shop" pattern
  /grounds/i,
  /glimpse/i,
];

// URL-style names without dots (concatenated domain names)
const URL_STYLE_NAMES = [
  /^the[a-z]+inn$/i,  // "Theharborsideinn"
  /^[a-z]+hotels?$/i,  // "Larkhotels"
  /^[a-z]+arts$/i,  // "Pathwaysarts"
  /^[a-z]+mv$/i,  // various "XyzMv" patterns
];

// ============================================================================
// ENTITY NAME/DOMAIN MISMATCH DETECTION
// ============================================================================

/**
 * Extracts a likely business name from a domain.
 * e.g., "thecharlotteinn.com" -> "charlotte inn"
 */
function extractNameFromDomain(domain: string | null): string | null {
  if (!domain) return null;

  // Remove common prefixes/suffixes
  let name = domain
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|co|mv|us)$/, '')
    .replace(/mv$/, '')  // "lazyfrogmv" -> "lazyfrog"
    .replace(/^the/, ''); // "thecharlotteinn" -> "charlotteinn"

  // Split camelCase or concatenated words (heuristic)
  // Insert space before capital letters or common word boundaries
  name = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase
    .replace(/(inn|hotel|house|cafe|bar|shop|store|bakery|market|gallery|studio|yoga|arts)$/i, ' $1')
    .trim();

  return name.length > 2 ? name : null;
}

/**
 * Checks if the extracted business name reasonably matches the domain.
 * Returns a mismatch score (0 = perfect match, higher = worse mismatch)
 */
function checkNameDomainMismatch(bizName: string, domain: string | null): {
  hasMismatch: boolean;
  mismatchScore: number;
  domainName: string | null;
  reason: string | null;
} {
  if (!domain || !bizName) {
    return { hasMismatch: false, mismatchScore: 0, domainName: null, reason: null };
  }

  const domainName = extractNameFromDomain(domain);
  if (!domainName) {
    return { hasMismatch: false, mismatchScore: 0, domainName: null, reason: null };
  }

  const nameLower = bizName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();

  const domainLower = domainName.replace(/\s+/g, '');

  // Check 1: Name is completely different from domain
  // e.g., "A Glimpse of the Grounds" vs "charlotteinn"
  const nameWords = nameLower.split(' ').filter(w => w.length > 2);
  const domainChars = domainLower.replace(/\s/g, '');

  // Check if any significant word from the name appears in the domain
  const hasOverlap = nameWords.some(word =>
    domainChars.includes(word) || word.includes(domainChars.slice(0, 4))
  );

  if (!hasOverlap && nameWords.length > 0) {
    // Check for marketing/descriptive phrases that don't match domain
    const isDescriptivePhrase = /^(the best|a glimpse|experience|find your|discover|entering|private|luxury|iconic|waterfront|organic)/i.test(nameLower);

    if (isDescriptivePhrase) {
      return {
        hasMismatch: true,
        mismatchScore: 90,
        domainName,
        reason: `descriptive_phrase_not_business_name: "${bizName}" vs domain "${domain}"`
      };
    }

    // Generic mismatch
    return {
      hasMismatch: true,
      mismatchScore: 70,
      domainName,
      reason: `name_domain_mismatch: "${bizName}" vs "${domainName}" (from ${domain})`
    };
  }

  // Check 2: Name looks like a truncated page title
  if (bizName.endsWith('...') || bizName.endsWith('..') || bizName.length > 50) {
    return {
      hasMismatch: true,
      mismatchScore: 60,
      domainName,
      reason: `truncated_title: "${bizName.slice(0, 40)}..."`
    };
  }

  // Check 3: Name contains HTML entities (suggests raw title extraction)
  if (/&#\d+;|&[a-z]+;/i.test(bizName)) {
    return {
      hasMismatch: true,
      mismatchScore: 50,
      domainName,
      reason: `html_entities_in_name: "${bizName.slice(0, 40)}"`
    };
  }

  return { hasMismatch: false, mismatchScore: 0, domainName, reason: null };
}

interface NameValidation {
  isValid: boolean;
  confidence: number;
  failureReason: string | null;
}

function validateBusinessName(name: string | null): NameValidation {
  if (!name || name.trim() === '') {
    return { isValid: false, confidence: 0, failureReason: 'missing_name' };
  }

  const raw = name.trim();

  // Check invalid patterns
  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(raw)) {
      return { isValid: false, confidence: 0, failureReason: `invalid_name_pattern: ${pattern.toString()}` };
    }
  }

  // Check URL-style names (concatenated domain-like names)
  for (const pattern of URL_STYLE_NAMES) {
    if (pattern.test(raw) && !raw.includes(' ')) {
      return { isValid: false, confidence: 0, failureReason: `url_style_name: ${pattern.toString()}` };
    }
  }

  // Check suspicious patterns
  let confidence = 100;
  for (const pattern of SUSPICIOUS_NAME_PATTERNS) {
    if (pattern.test(raw)) {
      confidence -= 30;
    }
  }

  // Length checks
  if (raw.length < 3) {
    return { isValid: false, confidence: 0, failureReason: 'name_too_short' };
  }
  if (raw.length > 80) {
    confidence -= 20;
  }

  // All lowercase or all uppercase
  if (raw === raw.toLowerCase() || raw === raw.toUpperCase()) {
    confidence -= 10;
  }

  // Contains HTML entities
  if (/&#\d+;/.test(raw) || /&[a-z]+;/i.test(raw)) {
    confidence -= 20;
  }

  return {
    isValid: confidence >= 50,
    confidence: Math.max(0, confidence),
    failureReason: confidence < 50 ? 'low_name_confidence' : null
  };
}

// ============================================================================
// ENTITY CONSISTENCY VALIDATION
// ============================================================================

interface BusinessRecord {
  id: number;
  business_name: string;
  normalized_name: string;
  category: string;
  town: string;
  street_address: string;
  full_address: string;
  phone: string;
  email: string;
  website: string;
  domain: string;
  short_description: string;
  confidence_score: number;
  publish_tier: string;
  is_duplicate: number;
  suppress_from_directory: number;
  name_source: string;
  primary_source: string;
  homepage_title: string;
}

interface NameDomainMismatch {
  hasMismatch: boolean;
  mismatchScore: number;
  domainName: string | null;
  reason: string | null;
}

interface ValidationResult {
  id: number;
  business_name: string;
  website: string;
  domain: string;

  nameValidation: NameValidation;
  emailValidation: EmailValidation;
  addressValidation: AddressValidation;
  phoneValidation: PhoneValidation;
  nameDomainMismatch: NameDomainMismatch;

  overallValid: boolean;
  suppressionReasons: string[];
  cleanedFields: {
    email?: string;
    phone?: string;
    street_address?: string;
    full_address?: string;
  };
}

function validateRecord(biz: BusinessRecord): ValidationResult {
  const nameVal = validateBusinessName(biz.business_name);
  const emailVal = validateEmail(biz.email);
  const addressVal = validateAddress(biz.full_address);
  const phoneVal = validatePhone(biz.phone);
  const nameDomainMismatch = checkNameDomainMismatch(biz.business_name, biz.domain);

  const suppressionReasons: string[] = [];

  // Name validation is critical
  if (!nameVal.isValid) {
    suppressionReasons.push(`name: ${nameVal.failureReason}`);
  }

  // Name/domain mismatch with high score is critical
  if (nameDomainMismatch.hasMismatch && nameDomainMismatch.mismatchScore >= 80) {
    suppressionReasons.push(`entity_mismatch: ${nameDomainMismatch.reason}`);
  }

  // Email validation - contaminated email is a warning, we can clean it
  if (!emailVal.isValid && !emailVal.cleanedEmail) {
    suppressionReasons.push(`email: ${emailVal.failureReason}`);
  }

  // Address validation - contaminated address is a warning if we can clean it
  if (!addressVal.isValid && !addressVal.cleanedAddress) {
    suppressionReasons.push(`address: ${addressVal.failureReason}`);
  }

  // Phone validation - if contaminated but extractable, it's a warning
  if (!phoneVal.isValid && !phoneVal.cleanedPhone) {
    suppressionReasons.push(`phone: ${phoneVal.failureReason}`);
  }

  // If name is invalid OR high mismatch score, suppress
  const overallValid = nameVal.isValid &&
                       nameVal.confidence >= 50 &&
                       nameDomainMismatch.mismatchScore < 80;

  return {
    id: biz.id,
    business_name: biz.business_name,
    website: biz.website,
    domain: biz.domain,
    nameValidation: nameVal,
    emailValidation: emailVal,
    addressValidation: addressVal,
    phoneValidation: phoneVal,
    nameDomainMismatch,
    overallValid,
    suppressionReasons,
    cleanedFields: {
      email: emailVal.cleanedEmail || undefined,
      phone: phoneVal.cleanedPhone || undefined,
      street_address: addressVal.streetAddress || undefined,
      full_address: addressVal.cleanedAddress || undefined,
    }
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - PHASE 3 STRICT VALIDATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'APPLY CHANGES'}`);
  console.log('');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  // Get all non-duplicate, currently publishable records
  const businesses = db.prepare(`
    SELECT
      id, business_name, normalized_name, category, town,
      street_address, full_address, phone, email, website, domain,
      short_description, confidence_score, publish_tier, is_duplicate,
      suppress_from_directory, name_source, primary_source, homepage_title
    FROM businesses
    WHERE is_duplicate = 0
  `).all() as BusinessRecord[];

  console.log(`Scanning ${businesses.length} records...\n`);

  const stats = {
    total: businesses.length,
    alreadySuppressed: 0,
    newlyInvalid: 0,
    stillValid: 0,
    nameFailures: 0,
    nameDomainMismatches: 0,
    nameDomainSuppressed: 0,
    emailContamination: 0,
    addressContamination: 0,
    phoneContamination: 0,
    fieldsCleaned: 0,
  };

  const invalidRecords: ValidationResult[] = [];
  const cleanedRecords: ValidationResult[] = [];
  const validRecords: ValidationResult[] = [];

  // Prepare update statements
  const suppressRecord = db.prepare(`
    UPDATE businesses SET
      suppress_from_directory = 1,
      publish_tier = 'unpublishable',
      validation_notes = COALESCE(validation_notes, '') || ?
    WHERE id = ?
  `);

  const cleanFields = db.prepare(`
    UPDATE businesses SET
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      street_address = COALESCE(?, street_address),
      full_address = COALESCE(?, full_address),
      validation_notes = COALESCE(validation_notes, '') || ?
    WHERE id = ?
  `);

  for (const biz of businesses) {
    // Skip already suppressed
    if (biz.suppress_from_directory === 1) {
      stats.alreadySuppressed++;
      continue;
    }

    const result = validateRecord(biz);

    // Track stats
    if (!result.nameValidation.isValid) stats.nameFailures++;
    if (result.nameDomainMismatch.hasMismatch) stats.nameDomainMismatches++;
    if (result.nameDomainMismatch.mismatchScore >= 80) stats.nameDomainSuppressed++;
    if (!result.emailValidation.isValid) stats.emailContamination++;
    if (!result.addressValidation.isValid) stats.addressContamination++;
    if (!result.phoneValidation.isValid) stats.phoneContamination++;

    if (!result.overallValid) {
      invalidRecords.push(result);
      stats.newlyInvalid++;

      if (!dryRun) {
        const notes = ` | Phase3: ${result.suppressionReasons.join('; ')}`;
        suppressRecord.run(notes, biz.id);
      }
    } else {
      stats.stillValid++;
      validRecords.push(result);

      // Check if we can clean any fields
      const hasCleaning = result.cleanedFields.email ||
                          result.cleanedFields.phone ||
                          result.cleanedFields.street_address ||
                          result.cleanedFields.full_address;

      if (hasCleaning) {
        cleanedRecords.push(result);
        stats.fieldsCleaned++;

        if (!dryRun) {
          const notes = ' | Phase3: fields cleaned';
          cleanFields.run(
            result.cleanedFields.email || null,
            result.cleanedFields.phone || null,
            result.cleanedFields.street_address || null,
            result.cleanedFields.full_address || null,
            notes,
            biz.id
          );
        }
      }
    }
  }

  db.close();

  // =========================================================================
  // PRINT SUMMARY
  // =========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 3 VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total records scanned:      ${stats.total}`);
  console.log(`  Already suppressed:         ${stats.alreadySuppressed}`);
  console.log('');
  console.log('  VALIDATION FAILURES:');
  console.log(`    Name failures:            ${stats.nameFailures}`);
  console.log(`    Name/domain mismatches:   ${stats.nameDomainMismatches} (${stats.nameDomainSuppressed} suppressed)`);
  console.log(`    Email contamination:      ${stats.emailContamination}`);
  console.log(`    Address contamination:    ${stats.addressContamination}`);
  console.log(`    Phone contamination:      ${stats.phoneContamination}`);
  console.log('');
  console.log('  RESULTS:');
  console.log(`    Newly suppressed:         ${stats.newlyInvalid}`);
  console.log(`    Fields cleaned:           ${stats.fieldsCleaned}`);
  console.log(`    Still valid:              ${stats.stillValid}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (dryRun) {
    console.log('\n  This was a DRY RUN. No changes were made.');
    console.log('  Run with --apply to apply changes.\n');
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'data', 'exports', 'phase3-validation-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry_run' : 'applied',
    stats,
    invalidRecords: invalidRecords.map(r => ({
      id: r.id,
      name: r.business_name,
      website: r.website,
      domain: r.domain,
      reasons: r.suppressionReasons,
      nameConfidence: r.nameValidation.confidence,
      mismatchScore: r.nameDomainMismatch.mismatchScore,
      domainName: r.nameDomainMismatch.domainName,
    })),
    cleanedRecords: cleanedRecords.map(r => ({
      id: r.id,
      name: r.business_name,
      cleanedFields: r.cleanedFields,
    })),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // Print sample invalid records
  console.log('\n  SAMPLE INVALID RECORDS (suppressed):');
  for (const r of invalidRecords.slice(0, 15)) {
    console.log(`    ID ${r.id}: "${r.business_name.slice(0, 40)}"`);
    console.log(`      Reasons: ${r.suppressionReasons.join(', ')}`);
  }

  // Print sample cleaned records
  if (cleanedRecords.length > 0) {
    console.log('\n  SAMPLE CLEANED RECORDS:');
    for (const r of cleanedRecords.slice(0, 10)) {
      console.log(`    ID ${r.id}: "${r.business_name.slice(0, 30)}"`);
      if (r.cleanedFields.email) console.log(`      Email: ${r.cleanedFields.email}`);
      if (r.cleanedFields.phone) console.log(`      Phone: ${r.cleanedFields.phone}`);
      if (r.cleanedFields.full_address) console.log(`      Address: ${r.cleanedFields.full_address}`);
    }
  }
}

main().catch(console.error);

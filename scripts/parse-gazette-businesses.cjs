#!/usr/bin/env node
/**
 * Parse Vineyard Gazette Business Directory RTF
 *
 * This script parses the Vineyard Gazette business directory export
 * and matches businesses against our Supabase directory.
 *
 * Usage: node scripts/parse-gazette-businesses.cjs
 *
 * Outputs:
 * - data/gazette/parsed-businesses.json - All parsed records
 * - data/gazette/matches.json - Matched to existing businesses
 * - data/gazette/new-businesses.json - Potential new additions
 * - data/gazette/conflicts.json - Fields that differ from existing
 * - data/gazette/summary.json - Statistics and overview
 */

const fs = require('fs');
const path = require('path');

// Category mapping from Gazette to our taxonomy
const CATEGORY_MAP = {
  'Restaurants': {
    businessType: 'restaurants-food-beverages',
    category: 'Restaurants'
  },
  'Farm Market & Stands': {
    businessType: 'restaurants-food-beverages',
    category: 'Farms'
  },
  'Grocery Stores': {
    businessType: 'restaurants-food-beverages',
    category: 'Grocery Stores'
  },
  'Fish Markets': {
    businessType: 'restaurants-food-beverages',
    category: 'Fish Markets'
  },
  'Package Stores': {
    businessType: 'shopping-and-specialty-retail',
    category: 'Wine & Spirits'
  },
  'Pharmacies': {
    businessType: 'medical-services-and-providers',
    category: 'Pharmacies'
  },
  'Arts & Culture': {
    businessType: 'arts-and-entertainment',
    category: 'Arts & Culture'
  },
  'Outdoor Activities': {
    businessType: 'arts-and-entertainment',
    category: 'Outdoor Activities'
  },
  'Self Help Meetings': {
    businessType: 'family-community-government',
    category: 'Community Organizations'
  },
  'Health & Wellness': {
    businessType: 'beauty-and-wellness',
    category: 'Health & Wellness'
  },
  'Lodging': {
    businessType: 'lodging-and-tourism',
    category: 'Hotels'
  },
  'Transportation': {
    businessType: 'business-and-professional-services',
    category: 'Transportation'
  },
  'General Business Information': {
    businessType: 'shopping-and-specialty-retail',
    category: 'General Business'
  }
};

// Town name normalization
const TOWN_MAP = {
  'Aquinnah': { name: 'Aquinnah', slug: 'aquinnah' },
  'Chilmark': { name: 'Chilmark', slug: 'chilmark' },
  'Edgartown': { name: 'Edgartown', slug: 'edgartown' },
  'Oak Bluffs': { name: 'Oak Bluffs', slug: 'oak-bluffs' },
  'West Tisbury': { name: 'West Tisbury', slug: 'west-tisbury' },
  'Vineyard Haven': { name: 'Vineyard Haven', slug: 'vineyard-haven' },
  'Menemsha': { name: 'Chilmark', slug: 'chilmark' } // Menemsha is part of Chilmark
};

// Normalize website URL
function normalizeWebsite(url) {
  if (!url || url.trim() === '') return null;
  url = url.trim().toLowerCase();

  // Remove trailing slashes and whitespace
  url = url.replace(/\/+$/, '').trim();

  // Skip social media and internal links
  if (url.includes('facebook.com') || url.includes('instagram.com')) {
    return null; // We'll extract these separately
  }

  // Add https if no protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Normalize to https
  url = url.replace(/^http:\/\//, 'https://');

  // Remove www. for consistency
  url = url.replace('https://www.', 'https://');

  return url;
}

// Extract social media from website field
function extractSocial(url) {
  if (!url) return {};
  url = url.trim().toLowerCase();

  const social = {};

  if (url.includes('facebook.com')) {
    social.facebook = url.startsWith('http') ? url : 'https://' + url;
  }
  if (url.includes('instagram.com')) {
    social.instagram = url.startsWith('http') ? url : 'https://' + url;
  }

  return social;
}

// Normalize phone number
function normalizePhone(phone) {
  if (!phone || phone.trim() === '') return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Validate 10-digit US number
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }

  // Return original if can't normalize
  return phone.trim();
}

// Create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse town from address string
function extractTownFromAddress(address) {
  if (!address) return null;

  // Look for town names in address
  for (const [townName, townInfo] of Object.entries(TOWN_MAP)) {
    if (address.includes(townName)) {
      return townInfo;
    }
  }

  // Check for MA zip codes to identify town
  const zipMatch = address.match(/MA\s*(\d{5})/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const ZIP_TO_TOWN = {
      '02535': 'Chilmark', // Also Aquinnah
      '02539': 'Edgartown',
      '02557': 'Oak Bluffs',
      '02568': 'Vineyard Haven',
      '02575': 'West Tisbury',
      '02552': 'Chilmark' // Menemsha
    };
    const townName = ZIP_TO_TOWN[zip];
    if (townName && TOWN_MAP[townName]) {
      return TOWN_MAP[townName];
    }
  }

  return null;
}

// Parse a single business line
function parseBusinessLine(line, currentCategory, currentTown) {
  // Remove bullet point
  line = line.replace(/^[•\-\*]\s*/, '').trim();

  if (!line || line === 'Back to top ↑') return null;

  // Pattern: Name  Address    Website  Phone
  // Fields are separated by multiple spaces or tabs

  // Split by multiple whitespace (2+ spaces or tabs)
  const parts = line.split(/\s{2,}|\t+/).map(p => p.trim()).filter(p => p);

  if (parts.length === 0) return null;

  const business = {
    name: parts[0],
    gazetteCategory: currentCategory,
    gazetteTown: currentTown,
    address: null,
    website: null,
    phone: null,
    social: {}
  };

  // Parse remaining fields
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    // Check if it's a phone number
    if (/^\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$/.test(part.replace(/[^0-9]/g, '')) ||
        /^\d{3}[\-\.]\d{3}[\-\.]\d{4}$/.test(part)) {
      business.phone = normalizePhone(part);
    }
    // Check if it's a website/URL
    else if (part.includes('.') && !part.includes(',') &&
             (part.includes('.com') || part.includes('.org') || part.includes('.net') ||
              part.includes('.site') || part.includes('.us'))) {
      const social = extractSocial(part);
      if (Object.keys(social).length > 0) {
        business.social = { ...business.social, ...social };
      } else {
        business.website = normalizeWebsite(part);
      }
    }
    // Otherwise it's likely the address
    else if (part.includes('MA') || part.includes(',') || /\d+\s+[A-Za-z]/.test(part)) {
      business.address = part;
    }
  }

  // Try to extract town from address if not set from section header
  if (!currentTown && business.address) {
    const townInfo = extractTownFromAddress(business.address);
    if (townInfo) {
      business.gazetteTown = townInfo.name;
    }
  }

  // Apply category mapping
  const mapping = CATEGORY_MAP[currentCategory];
  if (mapping) {
    business.businessType = mapping.businessType;
    business.category = mapping.category;
  }

  // Generate slug
  business.slug = createSlug(business.name);

  // Set town info
  if (business.gazetteTown && TOWN_MAP[business.gazetteTown]) {
    const townInfo = TOWN_MAP[business.gazetteTown];
    business.town = townInfo.name;
    business.townSlug = townInfo.slug;
  }

  return business;
}

// Main parsing function
function parseGazetteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const businesses = [];
  let currentCategory = null;
  let currentTown = null;

  // Categories that have town subdivisions (Restaurants is organized by town)
  const categoriesWithTowns = ['Restaurants'];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Check if this is a category header (no bullet, starts with letter, followed by content on next lines)
    if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && /^[A-Z]/.test(trimmed)) {
      // Check if it's a known category
      if (CATEGORY_MAP[trimmed]) {
        currentCategory = trimmed;
        // Reset town for categories that aren't subdivided by town
        if (!categoriesWithTowns.includes(currentCategory)) {
          currentTown = null;
        }
        continue;
      }

      // Check if it's a town name (sub-header under Restaurants)
      if (TOWN_MAP[trimmed]) {
        currentTown = trimmed;
        continue;
      }
    }

    // Parse business line
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const business = parseBusinessLine(trimmed, currentCategory, currentTown);
      if (business && business.name) {
        businesses.push(business);
      }
    }
  }

  return businesses;
}

// Similarity score for matching (0-1)
function similarity(str1, str2) {
  if (!str1 || !str2) return 0;

  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();

  if (str1 === str2) return 1;

  // Check if one contains the other
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.8;
  }

  // Levenshtein-like simple comparison
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || (w1.length > 3 && w2.includes(w1)) || (w2.length > 3 && w1.includes(w2))) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

// Match gazette businesses to existing Supabase records
function matchBusinesses(gazetteBusinesses, existingBusinesses) {
  const matches = [];
  const newBusinesses = [];
  const conflicts = [];

  for (const gazette of gazetteBusinesses) {
    let bestMatch = null;
    let bestScore = 0;
    let matchReason = '';

    for (const existing of existingBusinesses) {
      // Try different matching strategies

      // 1. Exact name match
      if (gazette.name.toLowerCase() === existing.name.toLowerCase()) {
        bestMatch = existing;
        bestScore = 1;
        matchReason = 'exact_name';
        break;
      }

      // 2. Slug match
      if (gazette.slug === existing.slug) {
        bestMatch = existing;
        bestScore = 0.95;
        matchReason = 'slug_match';
        break;
      }

      // 3. Website match (strong indicator)
      if (gazette.website && existing.website) {
        const gazetteHost = gazette.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        const existingHost = existing.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        if (gazetteHost === existingHost) {
          bestMatch = existing;
          bestScore = 0.9;
          matchReason = 'website_match';
          break;
        }
      }

      // 4. Phone match (strong indicator)
      if (gazette.phone && existing.phone) {
        const gazetteDigits = gazette.phone.replace(/\D/g, '');
        const existingDigits = existing.phone.replace(/\D/g, '');
        if (gazetteDigits === existingDigits) {
          if (similarity(gazette.name, existing.name) > 0.3) {
            bestMatch = existing;
            bestScore = 0.85;
            matchReason = 'phone_match';
          }
        }
      }

      // 5. Fuzzy name match in same town
      if (gazette.townSlug === existing.townSlug) {
        const nameScore = similarity(gazette.name, existing.name);
        if (nameScore > 0.7 && nameScore > bestScore) {
          bestMatch = existing;
          bestScore = nameScore;
          matchReason = 'fuzzy_name_same_town';
        }
      }
    }

    if (bestMatch && bestScore >= 0.7) {
      // Found a match - check for field differences
      const fieldDiffs = [];

      if (gazette.phone && (!bestMatch.phone || gazette.phone !== bestMatch.phone)) {
        fieldDiffs.push({ field: 'phone', gazette: gazette.phone, existing: bestMatch.phone });
      }
      if (gazette.website && (!bestMatch.website || gazette.website !== bestMatch.website)) {
        fieldDiffs.push({ field: 'website', gazette: gazette.website, existing: bestMatch.website });
      }
      if (gazette.address && (!bestMatch.address || gazette.address !== bestMatch.address)) {
        fieldDiffs.push({ field: 'address', gazette: gazette.address, existing: bestMatch.address });
      }

      matches.push({
        gazette,
        existing: bestMatch,
        score: bestScore,
        matchReason,
        fieldDiffs
      });

      if (fieldDiffs.length > 0) {
        conflicts.push({
          gazette,
          existing: bestMatch,
          score: bestScore,
          matchReason,
          fieldDiffs
        });
      }
    } else {
      // No match - potential new business
      newBusinesses.push({
        ...gazette,
        suggestedSlug: gazette.slug,
        confidence: gazette.phone || gazette.website ? 'high' : 'low'
      });
    }
  }

  return { matches, newBusinesses, conflicts };
}

// Main execution
async function main() {
  console.log('Parsing Vineyard Gazette business directory...\n');

  const inputFile = '/tmp/mv_businesses.txt';

  if (!fs.existsSync(inputFile)) {
    console.error('Error: Input file not found. Run textutil first to convert RTF to TXT.');
    process.exit(1);
  }

  // Parse gazette file
  const gazetteBusinesses = parseGazetteFile(inputFile);
  console.log(`Parsed ${gazetteBusinesses.length} businesses from Gazette\n`);

  // Load existing businesses from Supabase export
  const existingPath = path.join(__dirname, '../data/exports/businesses.json');
  let existingBusinesses = [];

  if (fs.existsSync(existingPath)) {
    existingBusinesses = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
    console.log(`Loaded ${existingBusinesses.length} existing businesses\n`);
  } else {
    console.log('Warning: No existing businesses file found. Will output all as new.\n');
  }

  // Match businesses
  const { matches, newBusinesses, conflicts } = matchBusinesses(gazetteBusinesses, existingBusinesses);

  // Create output directory
  const outputDir = path.join(__dirname, '../data/gazette');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write outputs
  fs.writeFileSync(
    path.join(outputDir, 'parsed-businesses.json'),
    JSON.stringify(gazetteBusinesses, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, 'matches.json'),
    JSON.stringify(matches, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, 'new-businesses.json'),
    JSON.stringify(newBusinesses, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, 'conflicts.json'),
    JSON.stringify(conflicts, null, 2)
  );

  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    source: 'Vineyard Gazette Business Directory',
    stats: {
      totalParsed: gazetteBusinesses.length,
      matched: matches.length,
      newBusinesses: newBusinesses.length,
      conflicts: conflicts.length
    },
    byCategory: {},
    byTown: {},
    newByCategory: {},
    conflictsByField: {}
  };

  // Count by category
  for (const b of gazetteBusinesses) {
    summary.byCategory[b.gazetteCategory] = (summary.byCategory[b.gazetteCategory] || 0) + 1;
  }

  // Count by town
  for (const b of gazetteBusinesses) {
    if (b.town) {
      summary.byTown[b.town] = (summary.byTown[b.town] || 0) + 1;
    }
  }

  // New businesses by category
  for (const b of newBusinesses) {
    summary.newByCategory[b.gazetteCategory] = (summary.newByCategory[b.gazetteCategory] || 0) + 1;
  }

  // Conflicts by field
  for (const c of conflicts) {
    for (const d of c.fieldDiffs) {
      summary.conflictsByField[d.field] = (summary.conflictsByField[d.field] || 0) + 1;
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Print summary
  console.log('='.repeat(60));
  console.log('GAZETTE IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal businesses parsed: ${gazetteBusinesses.length}`);
  console.log(`Matched to existing:     ${matches.length}`);
  console.log(`Potential new:           ${newBusinesses.length}`);
  console.log(`With field conflicts:    ${conflicts.length}`);

  console.log('\nBy Gazette Category:');
  for (const [cat, count] of Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nBy Town:');
  for (const [town, count] of Object.entries(summary.byTown).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${town}: ${count}`);
  }

  if (newBusinesses.length > 0) {
    console.log('\nNew Businesses by Category:');
    for (const [cat, count] of Object.entries(summary.newByCategory).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count}`);
    }
  }

  if (conflicts.length > 0) {
    console.log('\nConflicts by Field:');
    for (const [field, count] of Object.entries(summary.conflictsByField).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${field}: ${count}`);
    }
  }

  console.log('\nOutput files written to: data/gazette/');
  console.log('  - parsed-businesses.json');
  console.log('  - matches.json');
  console.log('  - new-businesses.json');
  console.log('  - conflicts.json');
  console.log('  - summary.json');
  console.log('\nReview the conflicts and new-businesses files before applying changes.');
}

main().catch(console.error);

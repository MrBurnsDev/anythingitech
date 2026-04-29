#!/usr/bin/env node
/**
 * Parse Businesses 2 RTF File
 *
 * Parses the second businesses source file and matches against existing
 * Supabase records and previous Gazette import.
 *
 * Usage: node scripts/parse-businesses-2.cjs
 */

const fs = require('fs');
const path = require('path');

// Category mapping from file categories to our taxonomy
const CATEGORY_MAP = {
  'ACCOMMODATIONS': {
    businessType: 'lodging-and-tourism',
    category: 'Lodging & Tourism',
    subcategory: 'Hotels'
  },
  'ACTIVITIES & RECREATION': {
    businessType: 'arts-and-entertainment',
    category: 'Arts & Entertainment',
    subcategory: 'Outdoor Activities'
  },
  'MARTHA\'S VINEYARD ARTS, GALLERIES & ARTISTIC SERVICES': {
    businessType: 'arts-and-entertainment',
    category: 'Arts & Entertainment',
    subcategory: 'Art Galleries'
  },
  'MARTHA\'S VINEYARD BEAUTY SALONS, WELLNESS & FITNESS DIRECTORY': {
    businessType: 'beauty-and-wellness',
    category: 'Beauty & Wellness',
    subcategory: 'Spas'
  },
  'MARTHA\'S VINEYARD BUSINESS, LEGAL & FINANCIAL SERVICES DIRECTORY': {
    businessType: 'business-and-professional-services',
    category: 'Business & Professional Services',
    subcategory: 'Professional Services'
  },
  'MARTHA\'S VINEYARD CONSTRUCTION, GENERAL CONTRACTORS BUILDING SERVICES & SUPPLIES': {
    businessType: 'building-and-construction',
    category: 'Building & Construction',
    subcategory: 'General Contractors'
  },
  'MARTHA\'S VINEYARD ENTERTAINMENT & EVENTS DIRECTORY': {
    businessType: 'arts-and-entertainment',
    category: 'Arts & Entertainment',
    subcategory: 'Entertainment Services'
  },
  'MARTHA\'S VINEYARD FOOD, EAT & DRINK DINING DIRECTORY': {
    businessType: 'restaurants-food-beverages',
    category: 'Restaurants, Food & Beverages',
    subcategory: 'Restaurants'
  }
};

// Town detection from address
const TOWNS = {
  'Vineyard Haven': 'vineyard-haven',
  'Oak Bluffs': 'oak-bluffs',
  'Edgartown': 'edgartown',
  'West Tisbury': 'west-tisbury',
  'Chilmark': 'chilmark',
  'Aquinnah': 'aquinnah',
  'Menemsha': 'chilmark'
};

// Category header patterns
const CATEGORY_HEADERS = Object.keys(CATEGORY_MAP);

function detectTown(address) {
  if (!address) return null;
  const upperAddr = address.toUpperCase();

  for (const [townName, slug] of Object.entries(TOWNS)) {
    if (upperAddr.includes(townName.toUpperCase())) {
      return { name: townName, slug };
    }
  }
  return null;
}

function extractZip(address) {
  if (!address) return null;
  const match = address.match(/(\d{5})(?:-\d{4})?/);
  return match ? match[1] : null;
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

function normalizeWebsite(url) {
  if (!url) return null;
  url = url.trim();
  if (url.startsWith(' ')) url = url.trim();
  if (!url) return null;

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // Add https if no protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Normalize to https
  url = url.replace(/^http:\/\//, 'https://');

  return url;
}

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPhoneNumber(line) {
  return /^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(line.trim());
}

function isWebsite(line) {
  const trimmed = line.trim();
  return trimmed.includes('.') &&
         (trimmed.includes('.com') || trimmed.includes('.org') ||
          trimmed.includes('.net') || trimmed.includes('.us') ||
          trimmed.includes('.co') || trimmed.includes('.io'));
}

function isAddress(line) {
  const trimmed = line.trim();
  // Contains street number and street name, or MA/town name
  return (/^\d+\s+[A-Za-z]/.test(trimmed) ||
          /\b(Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Way|Drive|Dr|Circle|Cir)\b/i.test(trimmed) ||
          Object.keys(TOWNS).some(t => trimmed.toUpperCase().includes(t.toUpperCase())));
}

function isCategoryHeader(line) {
  const trimmed = line.trim();
  return CATEGORY_HEADERS.some(h => trimmed === h || trimmed.includes(h));
}

function isIgnoreLine(line) {
  const trimmed = line.trim().toLowerCase();
  return trimmed === '0' ||
         trimmed === 'book now' ||
         trimmed === 'learn more' ||
         trimmed === 'visit website' ||
         trimmed === 'call now' ||
         trimmed === 'view menu' ||
         trimmed === '' ||
         /^book\s*(now)?$/i.test(trimmed);
}

function parseBusinesses2(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const businesses = [];
  let currentCategory = null;
  let currentBusiness = null;
  let state = 'seeking_name'; // seeking_name, got_name, reading_description, reading_details

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines between businesses
    if (!trimmed) {
      if (currentBusiness && currentBusiness.name) {
        // Check if we have enough info to save this business
        if (state !== 'seeking_name') {
          businesses.push(currentBusiness);
          currentBusiness = null;
          state = 'seeking_name';
        }
      }
      continue;
    }

    // Check for category header
    if (isCategoryHeader(trimmed)) {
      // Save previous business if any
      if (currentBusiness && currentBusiness.name) {
        businesses.push(currentBusiness);
        currentBusiness = null;
      }

      // Find matching category
      for (const header of CATEGORY_HEADERS) {
        if (trimmed === header || trimmed.includes(header)) {
          currentCategory = header;
          break;
        }
      }
      state = 'seeking_name';
      continue;
    }

    // Skip ignored lines
    if (isIgnoreLine(trimmed)) {
      continue;
    }

    // State machine for parsing business blocks
    if (state === 'seeking_name') {
      // This should be a business name
      if (!isPhoneNumber(trimmed) && !isWebsite(trimmed) && !isAddress(trimmed)) {
        currentBusiness = {
          name: trimmed,
          description: null,
          sourceCategory: currentCategory,
          address: null,
          phone: null,
          website: null,
          source_file: 'businesses_2_rtf'
        };

        // Apply category mapping
        const mapping = CATEGORY_MAP[currentCategory];
        if (mapping) {
          currentBusiness.businessType = mapping.businessType;
          currentBusiness.category = mapping.category;
          currentBusiness.subcategory = mapping.subcategory;
        }

        state = 'reading_description';
      }
    } else if (state === 'reading_description') {
      // Could be description or start of details
      if (isPhoneNumber(trimmed)) {
        currentBusiness.phone = normalizePhone(trimmed);
        state = 'reading_details';
      } else if (isWebsite(trimmed)) {
        currentBusiness.website = normalizeWebsite(trimmed);
        state = 'reading_details';
      } else if (isAddress(trimmed)) {
        currentBusiness.address = trimmed;
        state = 'reading_details';
      } else {
        // It's the description
        currentBusiness.description = trimmed;
        state = 'reading_details';
      }
    } else if (state === 'reading_details') {
      // Parse phone, website, address
      if (isPhoneNumber(trimmed)) {
        currentBusiness.phone = normalizePhone(trimmed);
      } else if (isWebsite(trimmed)) {
        currentBusiness.website = normalizeWebsite(trimmed);
      } else if (isAddress(trimmed) && !currentBusiness.address) {
        currentBusiness.address = trimmed;
      }
      // Stay in reading_details state until we hit a new business or category
    }
  }

  // Don't forget the last business
  if (currentBusiness && currentBusiness.name) {
    businesses.push(currentBusiness);
  }

  // Post-process: extract town and zip, generate slug
  for (const business of businesses) {
    const townInfo = detectTown(business.address);
    if (townInfo) {
      business.town = townInfo.name;
      business.townSlug = townInfo.slug;
    }

    business.zip = extractZip(business.address);
    business.slug = createSlug(business.name);
    business.verification_source = 'businesses_2_rtf';
    business.last_verified_at = new Date().toISOString().slice(0, 10);
  }

  return businesses;
}

// Similarity function for matching
function similarity(str1, str2) {
  if (!str1 || !str2) return 0;
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();
  if (str1 === str2) return 1;
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;

  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  let matches = 0;
  for (const w1 of words1) {
    if (w1.length < 3) continue;
    for (const w2 of words2) {
      if (w2.length < 3) continue;
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(words1.length, words2.length);
}

function matchBusinesses(parsedBusinesses, existingBusinesses, gazetteBusinesses) {
  const matches = [];
  const newBusinesses = [];
  const conflicts = [];
  const duplicates = [];

  // Track seen names for duplicates
  const seenNames = {};

  for (const parsed of parsedBusinesses) {
    // Check for duplicates within parsed data
    const nameKey = parsed.name.toLowerCase();
    if (seenNames[nameKey]) {
      duplicates.push({
        ...parsed,
        duplicateOf: seenNames[nameKey]
      });
      continue;
    }
    seenNames[nameKey] = parsed.name;

    let bestMatch = null;
    let bestScore = 0;
    let matchReason = '';
    let matchSource = '';

    // Try matching against existing Supabase businesses
    for (const existing of existingBusinesses) {
      const existingName = existing.business_name || existing.name;

      // Exact name match
      if (parsed.name.toLowerCase() === existingName.toLowerCase()) {
        bestMatch = existing;
        bestScore = 1;
        matchReason = 'exact_name';
        matchSource = 'supabase';
        break;
      }

      // Website match
      if (parsed.website && existing.website) {
        const parsedHost = parsed.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
        const existingHost = existing.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
        if (parsedHost === existingHost) {
          bestMatch = existing;
          bestScore = 0.9;
          matchReason = 'website_match';
          matchSource = 'supabase';
          break;
        }
      }

      // Phone match
      if (parsed.phone && existing.phone) {
        const parsedDigits = parsed.phone.replace(/\D/g, '');
        const existingDigits = existing.phone.replace(/\D/g, '');
        if (parsedDigits === existingDigits && similarity(parsed.name, existingName) > 0.3) {
          bestMatch = existing;
          bestScore = 0.85;
          matchReason = 'phone_match';
          matchSource = 'supabase';
          break;
        }
      }

      // Fuzzy name match in same town
      if (parsed.townSlug === existing.townSlug || parsed.townSlug === existing.town_slug) {
        const nameScore = similarity(parsed.name, existingName);
        if (nameScore > 0.7 && nameScore > bestScore) {
          bestMatch = existing;
          bestScore = nameScore;
          matchReason = 'fuzzy_name_same_town';
          matchSource = 'supabase';
        }
      }
    }

    // Also check against Gazette businesses if no strong match yet
    if (bestScore < 0.8) {
      for (const gazette of gazetteBusinesses) {
        if (parsed.name.toLowerCase() === gazette.name.toLowerCase()) {
          if (bestScore < 1) {
            bestMatch = gazette;
            bestScore = 1;
            matchReason = 'exact_name';
            matchSource = 'gazette';
          }
          break;
        }

        if (parsed.website && gazette.website) {
          const parsedHost = parsed.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
          const gazetteHost = gazette.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
          if (parsedHost === gazetteHost && bestScore < 0.9) {
            bestMatch = gazette;
            bestScore = 0.9;
            matchReason = 'website_match';
            matchSource = 'gazette';
          }
        }
      }
    }

    if (bestMatch && bestScore >= 0.7) {
      // Found a match - check for field differences
      const fieldDiffs = [];
      const existingName = bestMatch.business_name || bestMatch.name;

      if (parsed.phone && !bestMatch.phone) {
        fieldDiffs.push({ field: 'phone', parsed: parsed.phone, existing: null, action: 'fill' });
      } else if (parsed.phone && bestMatch.phone && parsed.phone !== bestMatch.phone) {
        fieldDiffs.push({ field: 'phone', parsed: parsed.phone, existing: bestMatch.phone, action: 'conflict' });
      }

      if (parsed.website && !bestMatch.website) {
        fieldDiffs.push({ field: 'website', parsed: parsed.website, existing: null, action: 'fill' });
      } else if (parsed.website && bestMatch.website) {
        const parsedHost = parsed.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
        const existingHost = bestMatch.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
        if (parsedHost !== existingHost) {
          fieldDiffs.push({ field: 'website', parsed: parsed.website, existing: bestMatch.website, action: 'conflict' });
        }
      }

      if (parsed.address && !bestMatch.full_address && !bestMatch.address) {
        fieldDiffs.push({ field: 'address', parsed: parsed.address, existing: null, action: 'fill' });
      } else if (parsed.address && (bestMatch.full_address || bestMatch.address)) {
        const existingAddr = bestMatch.full_address || bestMatch.address;
        if (parsed.address.toLowerCase() !== existingAddr.toLowerCase()) {
          fieldDiffs.push({ field: 'address', parsed: parsed.address, existing: existingAddr, action: 'conflict' });
        }
      }

      if (parsed.description && !bestMatch.short_description && !bestMatch.description) {
        fieldDiffs.push({ field: 'description', parsed: parsed.description, existing: null, action: 'fill' });
      }

      matches.push({
        parsed,
        existing: bestMatch,
        score: bestScore,
        matchReason,
        matchSource,
        fieldDiffs
      });

      // Record conflicts separately
      const conflictDiffs = fieldDiffs.filter(d => d.action === 'conflict');
      if (conflictDiffs.length > 0) {
        conflicts.push({
          parsed,
          existing: bestMatch,
          score: bestScore,
          matchReason,
          matchSource,
          conflictDiffs
        });
      }
    } else {
      // No match - potential new business
      const hasValidName = parsed.name && parsed.name.length > 2;
      const hasKnownTown = parsed.town && parsed.townSlug;
      const hasMappedCategory = parsed.businessType && parsed.category;
      const hasContact = parsed.website || parsed.phone || (parsed.address && parsed.address.includes('MA'));

      newBusinesses.push({
        ...parsed,
        confidence: (hasValidName && hasKnownTown && hasMappedCategory && hasContact) ? 'high' : 'low',
        validForImport: hasValidName && hasKnownTown && hasMappedCategory && hasContact
      });
    }
  }

  return { matches, newBusinesses, conflicts, duplicates };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BUSINESSES 2 IMPORT - PARSING AND MATCHING');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const inputFile = '/tmp/businesses_2.txt';
  const outputDir = path.join(__dirname, '../data/imports/businesses-2');
  const gazetteDir = path.join(__dirname, '../data/gazette');
  const exportsDir = path.join(__dirname, '../data/exports');

  // Parse businesses 2 file
  console.log('Parsing businesses 2 file...');
  const parsedBusinesses = parseBusinesses2(inputFile);
  console.log(`Parsed ${parsedBusinesses.length} businesses\n`);

  // Load existing businesses from exports
  let existingBusinesses = [];
  const businessesPath = path.join(exportsDir, 'businesses.json');
  if (fs.existsSync(businessesPath)) {
    existingBusinesses = JSON.parse(fs.readFileSync(businessesPath, 'utf-8'));
    console.log(`Loaded ${existingBusinesses.length} existing businesses from exports\n`);
  }

  // Load Gazette businesses for cross-reference
  let gazetteBusinesses = [];
  const gazettePath = path.join(gazetteDir, 'parsed-businesses.json');
  if (fs.existsSync(gazettePath)) {
    gazetteBusinesses = JSON.parse(fs.readFileSync(gazettePath, 'utf-8'));
    console.log(`Loaded ${gazetteBusinesses.length} Gazette businesses for cross-reference\n`);
  }

  // Match businesses
  console.log('Matching against existing records...');
  const { matches, newBusinesses, conflicts, duplicates } = matchBusinesses(parsedBusinesses, existingBusinesses, gazetteBusinesses);

  // Generate statistics
  const stats = {
    timestamp: new Date().toISOString(),
    source: 'businesses_2_rtf',
    totalParsed: parsedBusinesses.length,
    matched: matches.length,
    newBusinesses: newBusinesses.length,
    validNewBusinesses: newBusinesses.filter(b => b.validForImport).length,
    conflicts: conflicts.length,
    duplicates: duplicates.length,
    byCategory: {},
    byTown: {},
    safeUpdates: {
      phoneFills: 0,
      websiteFills: 0,
      addressFills: 0,
      descriptionFills: 0
    }
  };

  // Count by category
  for (const b of parsedBusinesses) {
    stats.byCategory[b.sourceCategory || 'Unknown'] = (stats.byCategory[b.sourceCategory || 'Unknown'] || 0) + 1;
  }

  // Count by town
  for (const b of parsedBusinesses) {
    if (b.town) {
      stats.byTown[b.town] = (stats.byTown[b.town] || 0) + 1;
    }
  }

  // Count safe updates
  for (const m of matches) {
    for (const d of m.fieldDiffs) {
      if (d.action === 'fill') {
        if (d.field === 'phone') stats.safeUpdates.phoneFills++;
        if (d.field === 'website') stats.safeUpdates.websiteFills++;
        if (d.field === 'address') stats.safeUpdates.addressFills++;
        if (d.field === 'description') stats.safeUpdates.descriptionFills++;
      }
    }
  }

  // Write output files
  fs.writeFileSync(path.join(outputDir, 'parsed-businesses.json'), JSON.stringify(parsedBusinesses, null, 2));
  fs.writeFileSync(path.join(outputDir, 'matches.json'), JSON.stringify(matches, null, 2));
  fs.writeFileSync(path.join(outputDir, 'new-businesses.json'), JSON.stringify(newBusinesses, null, 2));
  fs.writeFileSync(path.join(outputDir, 'conflicts.json'), JSON.stringify(conflicts, null, 2));
  fs.writeFileSync(path.join(outputDir, 'duplicates.json'), JSON.stringify(duplicates, null, 2));
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(stats, null, 2));

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PARSING RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nTotal parsed:           ${stats.totalParsed}`);
  console.log(`Matched to existing:    ${stats.matched}`);
  console.log(`New businesses:         ${stats.newBusinesses} (${stats.validNewBusinesses} valid for import)`);
  console.log(`Conflicts:              ${stats.conflicts}`);
  console.log(`Duplicates:             ${stats.duplicates}`);

  console.log('\nBy Category:');
  for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nBy Town:');
  for (const [town, count] of Object.entries(stats.byTown).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${town}: ${count}`);
  }

  console.log('\nSafe Updates Available:');
  console.log(`  Phone fills:       ${stats.safeUpdates.phoneFills}`);
  console.log(`  Website fills:     ${stats.safeUpdates.websiteFills}`);
  console.log(`  Address fills:     ${stats.safeUpdates.addressFills}`);
  console.log(`  Description fills: ${stats.safeUpdates.descriptionFills}`);

  console.log(`\nOutput files written to: ${outputDir}`);
}

main().catch(console.error);

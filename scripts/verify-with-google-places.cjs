#!/usr/bin/env node
/**
 * Google Places Verification for Unknown Businesses
 *
 * Searches Google Places API for each unknown business to determine:
 * - Correct business name
 * - Correct address
 * - Correct town
 * - Category
 * - Status (open/closed)
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/verify-with-google-places.cjs
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const REFERENCE_PATH = path.join(__dirname, '..', 'data', 'reference', 'mv-zip-to-town.json');

const reference = JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
const ZIP_TO_TOWN = reference.zipCodes;

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// MV bounding box for filtering results
const MV_BOUNDS = {
  north: 41.5,
  south: 41.3,
  east: -70.4,
  west: -70.85
};

// Town detection from address
function detectTownFromAddress(address) {
  if (!address) return null;
  const upper = address.toUpperCase();

  const patterns = [
    { p: /\bWEST TISBURY\b/, t: 'West Tisbury' },
    { p: /\bVINEYARD HAVEN\b/, t: 'Vineyard Haven' },
    { p: /\bTISBURY\b/, t: 'Vineyard Haven' },
    { p: /\bOAK BLUFFS\b/, t: 'Oak Bluffs' },
    { p: /\bEDGARTOWN\b/, t: 'Edgartown' },
    { p: /\bCHILMARK\b/, t: 'Chilmark' },
    { p: /\bMENEMSHA\b/, t: 'Chilmark' },
    { p: /\bAQUINNAH\b/, t: 'Aquinnah' },
    { p: /\bGAY HEAD\b/, t: 'Aquinnah' },
  ];

  for (const { p, t } of patterns) {
    if (p.test(upper)) return t;
  }
  return null;
}

// Extract ZIP and map to town
function extractZipTown(address) {
  if (!address) return null;
  const match = address.match(/\b(02[0-9]{3})\b/);
  if (match && ZIP_TO_TOWN[match[1]]) {
    return ZIP_TO_TOWN[match[1]];
  }
  return null;
}

// Check if coordinates are on Martha's Vineyard
function isOnMV(lat, lng) {
  return lat >= MV_BOUNDS.south && lat <= MV_BOUNDS.north &&
         lng >= MV_BOUNDS.west && lng <= MV_BOUNDS.east;
}

// Map Google place types to our categories
function mapCategory(types) {
  if (!types || !types.length) return null;

  const mapping = {
    'restaurant': 'Restaurant',
    'food': 'Restaurant',
    'cafe': 'Restaurant',
    'bakery': 'Restaurant',
    'bar': 'Restaurant',
    'meal_takeaway': 'Restaurant',
    'meal_delivery': 'Restaurant',
    'lodging': 'Lodging',
    'hotel': 'Lodging',
    'store': 'Shopping & Retail',
    'clothing_store': 'Shopping & Retail',
    'jewelry_store': 'Shopping & Retail',
    'book_store': 'Shopping & Retail',
    'shopping_mall': 'Shopping & Retail',
    'art_gallery': 'Shopping & Retail',
    'spa': 'Health & Wellness',
    'beauty_salon': 'Health & Wellness',
    'hair_care': 'Health & Wellness',
    'gym': 'Health & Wellness',
    'health': 'Healthcare',
    'hospital': 'Healthcare',
    'doctor': 'Healthcare',
    'dentist': 'Healthcare',
    'pharmacy': 'Healthcare',
    'bank': 'Professional Services',
    'finance': 'Professional Services',
    'insurance_agency': 'Professional Services',
    'lawyer': 'Professional Services',
    'real_estate_agency': 'Real Estate',
    'car_repair': 'Automotive',
    'car_dealer': 'Automotive',
    'gas_station': 'Automotive',
    'church': 'Community',
    'library': 'Community',
    'local_government_office': 'Community',
    'movie_theater': 'Arts & Entertainment',
    'museum': 'Arts & Entertainment',
  };

  for (const type of types) {
    if (mapping[type]) return mapping[type];
  }

  return null;
}

// Search Google Places Text Search API
async function searchGooglePlaces(businessName, website) {
  const query = `${businessName} Martha's Vineyard MA`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return { success: false, reason: data.status || 'no_results' };
    }

    // Filter to results on Martha's Vineyard
    const mvResults = data.results.filter(r => {
      const loc = r.geometry?.location;
      return loc && isOnMV(loc.lat, loc.lng);
    });

    if (mvResults.length === 0) {
      // Check if any result exists but not on MV
      if (data.results.length > 0) {
        return { success: false, reason: 'not_on_mv' };
      }
      return { success: false, reason: 'no_results' };
    }

    const place = mvResults[0];
    const address = place.formatted_address || '';
    const lat = place.geometry?.location?.lat;
    const lng = place.geometry?.location?.lng;

    // Determine town
    let town = detectTownFromAddress(address);
    if (!town) town = extractZipTown(address);

    // Determine category
    const category = mapCategory(place.types);

    // Check business status
    const isClosed = place.business_status === 'CLOSED_PERMANENTLY' ||
                     place.business_status === 'CLOSED_TEMPORARILY';

    return {
      success: true,
      google_name: place.name,
      address: address,
      town: town,
      category: category,
      latitude: lat,
      longitude: lng,
      business_status: place.business_status || 'OPERATIONAL',
      is_closed: isClosed,
      place_id: place.place_id,
      confidence: mvResults.length === 1 ? 'high' : 'medium'
    };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

// Main verification function
async function verifyUnknownBusinesses() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Google Places Verification for Unknown Businesses');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!API_KEY) {
    console.log('ERROR: GOOGLE_PLACES_API_KEY environment variable not set.\n');
    console.log('Usage: GOOGLE_PLACES_API_KEY=your_key node scripts/verify-with-google-places.cjs\n');
    process.exit(1);
  }

  // Load verification list
  const csvPath = path.join(AUDITS_DIR, 'verification-list.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n').slice(1); // Skip header

  const businesses = lines.map(line => {
    // Parse CSV properly handling quoted fields
    const match = line.match(/^(\d+),"([^"]*)",/);
    if (!match) return null;
    return {
      id: parseInt(match[1]),
      name: match[2]
    };
  }).filter(Boolean);

  console.log(`Businesses to verify: ${businesses.length}\n`);

  const results = {
    resolved: [],
    closed: [],
    invalid: [],
    ambiguous: [],
    not_found: []
  };

  let processed = 0;

  for (const biz of businesses) {
    processed++;
    process.stdout.write(`\rProcessing: ${processed}/${businesses.length} - ${biz.name.substring(0, 30)}...`);

    // Check for obviously invalid names first
    const invalidPatterns = [
      /^personal\s*[&]\s*business\s*banking$/i,
      /^book\s*a\s*hostel$/i,
      /^smart\s*recovery$/i,
      /^refuge\s*recovery/i,
      /tisburyma\.gov/i,
      /entertainmentcinemas\.com/i,
      /\.gov\//i,
      /closed$/i,
    ];

    let isInvalid = false;
    for (const pattern of invalidPatterns) {
      if (pattern.test(biz.name)) {
        results.invalid.push({
          id: biz.id,
          name: biz.name,
          reason: 'invalid_name_pattern',
          status: 'invalid_record'
        });
        isInvalid = true;
        break;
      }
    }

    if (isInvalid) continue;

    // Search Google Places
    const result = await searchGooglePlaces(biz.name);
    await delay(200); // Rate limiting

    if (!result.success) {
      results.not_found.push({
        id: biz.id,
        name: biz.name,
        reason: result.reason,
        status: 'unknown'
      });
      continue;
    }

    if (result.is_closed) {
      results.closed.push({
        id: biz.id,
        name: biz.name,
        google_name: result.google_name,
        address: result.address,
        town: result.town,
        status: 'inactive_review'
      });
      continue;
    }

    if (!result.town) {
      results.ambiguous.push({
        id: biz.id,
        name: biz.name,
        google_name: result.google_name,
        address: result.address,
        reason: 'town_not_determined',
        status: 'unknown'
      });
      continue;
    }

    // Successfully resolved
    results.resolved.push({
      id: biz.id,
      original_name: biz.name,
      google_name: result.google_name,
      address: result.address,
      town: result.town,
      category: result.category,
      latitude: result.latitude,
      longitude: result.longitude,
      confidence: result.confidence,
      status: 'resolved'
    });
  }

  console.log('\n\n');

  // Generate reports
  generateReports(results);

  // Print summary
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  Summary');
  console.log('─────────────────────────────────────────────────────────────────\n');

  console.log(`✓ Resolved: ${results.resolved.length}`);
  console.log(`⚠ Closed/Inactive: ${results.closed.length}`);
  console.log(`✗ Invalid records: ${results.invalid.length}`);
  console.log(`? Ambiguous (town unclear): ${results.ambiguous.length}`);
  console.log(`✗ Not found: ${results.not_found.length}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Verification Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Generate output files
function generateReports(results) {
  // CSV Report
  let csv = 'id,original_name,google_name,address,town,category,latitude,longitude,confidence,status\n';

  for (const r of results.resolved) {
    csv += `${r.id},"${r.original_name.replace(/"/g, '""')}","${r.google_name.replace(/"/g, '""')}","${r.address.replace(/"/g, '""')}","${r.town}","${r.category || ''}",${r.latitude || ''},${r.longitude || ''},"${r.confidence}","resolved"\n`;
  }
  for (const r of results.closed) {
    csv += `${r.id},"${r.name.replace(/"/g, '""')}","${(r.google_name || '').replace(/"/g, '""')}","${(r.address || '').replace(/"/g, '""')}","${r.town || ''}","","","","","inactive_review"\n`;
  }
  for (const r of results.invalid) {
    csv += `${r.id},"${r.name.replace(/"/g, '""')}","","","","","","","","invalid_record"\n`;
  }
  for (const r of results.ambiguous) {
    csv += `${r.id},"${r.name.replace(/"/g, '""')}","${(r.google_name || '').replace(/"/g, '""')}","${(r.address || '').replace(/"/g, '""')}","","","","","","unknown"\n`;
  }
  for (const r of results.not_found) {
    csv += `${r.id},"${r.name.replace(/"/g, '""')}","","","","","","","","unknown"\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'unknown-business-google-verification.csv'), csv);
  console.log('✓ Generated: data/audits/unknown-business-google-verification.csv');

  // Markdown Report
  let md = `# Unknown Business Google Verification Results\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Resolved | ${results.resolved.length} |\n`;
  md += `| Closed/Inactive | ${results.closed.length} |\n`;
  md += `| Invalid Records | ${results.invalid.length} |\n`;
  md += `| Ambiguous | ${results.ambiguous.length} |\n`;
  md += `| Not Found | ${results.not_found.length} |\n`;
  md += `| **Total** | **${results.resolved.length + results.closed.length + results.invalid.length + results.ambiguous.length + results.not_found.length}** |\n\n`;

  if (results.resolved.length > 0) {
    md += `## Resolved Businesses (${results.resolved.length})\n\n`;
    md += `| ID | Original Name | Google Name | Town | Category | Confidence |\n`;
    md += `|----|--------------|-------------|------|----------|------------|\n`;
    for (const r of results.resolved) {
      md += `| ${r.id} | ${r.original_name.substring(0, 25)} | ${r.google_name.substring(0, 25)} | ${r.town} | ${r.category || '-'} | ${r.confidence} |\n`;
    }
    md += `\n`;
  }

  if (results.closed.length > 0) {
    md += `## Closed/Inactive (${results.closed.length})\n\n`;
    md += `| ID | Name | Google Name | Town |\n`;
    md += `|----|------|-------------|------|\n`;
    for (const r of results.closed) {
      md += `| ${r.id} | ${r.name.substring(0, 30)} | ${(r.google_name || '').substring(0, 30)} | ${r.town || '-'} |\n`;
    }
    md += `\n`;
  }

  if (results.invalid.length > 0) {
    md += `## Invalid Records (${results.invalid.length})\n\n`;
    md += `| ID | Name | Reason |\n`;
    md += `|----|------|--------|\n`;
    for (const r of results.invalid) {
      md += `| ${r.id} | ${r.name.substring(0, 40)} | ${r.reason} |\n`;
    }
    md += `\n`;
  }

  if (results.ambiguous.length > 0) {
    md += `## Ambiguous - Needs Manual Review (${results.ambiguous.length})\n\n`;
    md += `| ID | Name | Google Name | Address | Reason |\n`;
    md += `|----|------|-------------|---------|--------|\n`;
    for (const r of results.ambiguous) {
      md += `| ${r.id} | ${r.name.substring(0, 25)} | ${(r.google_name || '').substring(0, 25)} | ${(r.address || '').substring(0, 30)} | ${r.reason} |\n`;
    }
    md += `\n`;
  }

  if (results.not_found.length > 0) {
    md += `## Not Found (${results.not_found.length})\n\n`;
    md += `| ID | Name | Reason |\n`;
    md += `|----|------|--------|\n`;
    for (const r of results.not_found) {
      md += `| ${r.id} | ${r.name.substring(0, 40)} | ${r.reason} |\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'unknown-business-google-verification.md'), md);
  console.log('✓ Generated: data/audits/unknown-business-google-verification.md');

  // Migration SQL
  let sql = `-- Resolve Unknown Businesses from Google Places Verification\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- DO NOT APPLY WITHOUT REVIEW\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  sql += `-- Resolved businesses: Update town, address, coordinates\n`;
  for (const r of results.resolved) {
    const town = r.town.replace(/'/g, "''");
    const addr = r.address.replace(/'/g, "''");
    const name = r.google_name.replace(/'/g, "''");
    const cat = (r.category || '').replace(/'/g, "''");

    sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}'`;
    if (r.latitude && r.longitude) {
      sql += `, latitude = ${r.latitude}, longitude = ${r.longitude}`;
    }
    if (r.category) {
      sql += `, category = '${cat}'`;
    }
    sql += ` WHERE id = ${r.id}; -- ${r.original_name.substring(0, 30)}\n`;
  }

  sql += `\n-- Closed/Inactive: Flag for review\n`;
  for (const r of results.closed) {
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'closed_or_inactive' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\n-- Invalid records: Flag as invalid\n`;
  for (const r of results.invalid) {
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: ${r.reason}' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\n-- Still unknown: Keep as Unknown town\n`;
  for (const r of [...results.ambiguous, ...results.not_found]) {
    sql += `UPDATE businesses SET town = 'Unknown' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(path.join(MIGRATIONS_DIR, 'resolve-unknown-businesses.sql'), sql);
  console.log('✓ Generated: migrations/resolve-unknown-businesses.sql');
}

// Run
verifyUnknownBusinesses().catch(console.error);

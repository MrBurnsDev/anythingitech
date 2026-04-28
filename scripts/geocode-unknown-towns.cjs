#!/usr/bin/env node
/**
 * Geocode Unknown Towns
 *
 * For businesses that couldn't be assigned a town via ZIP or address parsing,
 * use geocoding services to determine location.
 *
 * Uses OpenStreetMap Nominatim (free, no API key required)
 * Optionally uses Google Places if GOOGLE_PLACES_API_KEY is set
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const REFERENCE_PATH = path.join(__dirname, '..', 'data', 'reference', 'mv-zip-to-town.json');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');

const reference = JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
const ZIP_TO_TOWN = reference.zipCodes;

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Search using OpenStreetMap Nominatim
 */
async function searchNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AnythingItechMV-DirectoryVerification/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      const address = result.address || {};

      // Extract town from various OSM address fields
      let town = address.town || address.city || address.village || address.hamlet;
      let postcode = address.postcode;

      // Normalize MV town names
      if (town) {
        town = normalizeTownName(town);
      }

      // If no town but we have postcode, use ZIP mapping
      if (!town && postcode && ZIP_TO_TOWN[postcode]) {
        town = ZIP_TO_TOWN[postcode];
      }

      return {
        success: true,
        source: 'nominatim',
        town: town || null,
        postcode: postcode || null,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name
      };
    }

    return { success: false, source: 'nominatim', reason: 'no_results' };
  } catch (error) {
    return { success: false, source: 'nominatim', reason: error.message };
  }
}

/**
 * Search using Google Places
 */
async function searchGooglePlaces(query) {
  if (!GOOGLE_API_KEY) {
    return { success: false, source: 'google', reason: 'no_api_key' };
  }

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=name,formatted_address,geometry&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const place = data.candidates[0];
      const address = place.formatted_address || '';

      // Extract town from address
      let town = detectTownFromAddress(address);

      // Extract ZIP and map to town
      const zipMatch = address.match(/\b(02[0-9]{3})\b/);
      if (!town && zipMatch && ZIP_TO_TOWN[zipMatch[1]]) {
        town = ZIP_TO_TOWN[zipMatch[1]];
      }

      return {
        success: true,
        source: 'google',
        town: town,
        address: address,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        name: place.name
      };
    }

    return { success: false, source: 'google', reason: 'no_results' };
  } catch (error) {
    return { success: false, source: 'google', reason: error.message };
  }
}

/**
 * Detect town from address string
 */
function detectTownFromAddress(address) {
  if (!address) return null;

  const addressUpper = address.toUpperCase();

  const patterns = [
    { pattern: /\bWEST TISBURY\b/, town: 'West Tisbury' },
    { pattern: /\bVINEYARD HAVEN\b/, town: 'Vineyard Haven' },
    { pattern: /\bTISBURY\b/, town: 'Vineyard Haven' },
    { pattern: /\bOAK BLUFFS\b/, town: 'Oak Bluffs' },
    { pattern: /\bEDGARTOWN\b/, town: 'Edgartown' },
    { pattern: /\bCHILMARK\b/, town: 'Chilmark' },
    { pattern: /\bMENEMSHA\b/, town: 'Chilmark' },
    { pattern: /\bAQUINNAH\b/, town: 'Aquinnah' },
    { pattern: /\bGAY HEAD\b/, town: 'Aquinnah' },
  ];

  for (const { pattern, town } of patterns) {
    if (pattern.test(addressUpper)) {
      return town;
    }
  }

  return null;
}

/**
 * Normalize town name
 */
function normalizeTownName(name) {
  if (!name) return null;

  const upper = name.toUpperCase().trim();
  const mapping = {
    'TISBURY': 'Vineyard Haven',
    'VINEYARD HAVEN': 'Vineyard Haven',
    'EDGARTOWN': 'Edgartown',
    'OAK BLUFFS': 'Oak Bluffs',
    'WEST TISBURY': 'West Tisbury',
    'CHILMARK': 'Chilmark',
    'MENEMSHA': 'Chilmark',
    'AQUINNAH': 'Aquinnah',
    'GAY HEAD': 'Aquinnah'
  };

  return mapping[upper] || null;
}

/**
 * Check if business name is likely invalid
 */
function isInvalidBusinessName(name) {
  if (!name) return true;

  const invalidPatterns = [
    /^facebook$/i,
    /^instagram$/i,
    /^twitter$/i,
    /^menu$/i,
    /^home\s*page$/i,
    /^contact$/i,
    /^about$/i,
    /^redirecting/i,
    /^account suspended/i,
    /\.com$/i,
    /\.org$/i,
    /\.net$/i,
    /^https?:\/\//i,
    /^www\./i,
    /^secure\./i,
    /\.square$/i,
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(name.trim())) {
      return true;
    }
  }

  return false;
}

/**
 * Main geocoding function
 */
async function geocodeUnknownBusinesses() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Geocoding Unknown Town Assignments');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Get businesses that would be marked as Unknown
  // These are VH assignments without supporting evidence
  const businesses = db.prepare(`
    SELECT id, business_name, town, full_address, website, phone
    FROM businesses
    WHERE is_duplicate = 0
      AND (full_address IS NULL OR full_address = '')
      AND town = 'Vineyard Haven'
  `).all();

  console.log(`Businesses needing geocoding: ${businesses.length}\n`);

  if (GOOGLE_API_KEY) {
    console.log('Using: OpenStreetMap Nominatim + Google Places\n');
  } else {
    console.log('Using: OpenStreetMap Nominatim only');
    console.log('(Set GOOGLE_PLACES_API_KEY for better results)\n');
  }

  const results = {
    resolved: [],
    invalid: [],
    unresolved: []
  };

  let processed = 0;

  for (const biz of businesses) {
    processed++;
    process.stdout.write(`\rProcessing: ${processed}/${businesses.length}`);

    // Check if name is invalid
    if (isInvalidBusinessName(biz.business_name)) {
      results.invalid.push({
        id: biz.id,
        name: biz.business_name,
        reason: 'invalid_name_pattern'
      });
      continue;
    }

    // Build search query
    const searchQuery = `${biz.business_name} Martha's Vineyard MA`;

    // Try Nominatim first
    let result = await searchNominatim(searchQuery);
    await delay(1100); // Nominatim requires 1 second between requests

    // If Nominatim failed and we have Google API, try Google
    if (!result.success || !result.town) {
      if (GOOGLE_API_KEY) {
        result = await searchGooglePlaces(searchQuery);
        await delay(200);
      }
    }

    if (result.success && result.town) {
      results.resolved.push({
        id: biz.id,
        name: biz.business_name,
        original_town: biz.town,
        new_town: result.town,
        source: result.source,
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.address || result.display_name
      });
    } else {
      results.unresolved.push({
        id: biz.id,
        name: biz.business_name,
        reason: result.reason || 'town_not_found'
      });
    }
  }

  console.log('\n\n');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  Results');
  console.log('─────────────────────────────────────────────────────────────────\n');

  console.log(`Resolved via geocoding: ${results.resolved.length}`);
  console.log(`Flagged as invalid: ${results.invalid.length}`);
  console.log(`Still unresolved: ${results.unresolved.length}`);

  // Generate reports
  generateGeocodeReport(results);
  generateGeocodeMigration(results);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Geocoding Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Generate geocode report
 */
function generateGeocodeReport(results) {
  let md = `# Geocoding Results\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Resolved | ${results.resolved.length} |\n`;
  md += `| Invalid records | ${results.invalid.length} |\n`;
  md += `| Unresolved | ${results.unresolved.length} |\n`;

  if (results.resolved.length > 0) {
    md += `\n## Resolved Businesses\n\n`;
    md += `| ID | Business | New Town | Source |\n`;
    md += `|----|----------|----------|--------|\n`;
    for (const r of results.resolved) {
      md += `| ${r.id} | ${r.name.substring(0, 30)} | ${r.new_town} | ${r.source} |\n`;
    }
  }

  if (results.invalid.length > 0) {
    md += `\n## Invalid Records (to flag)\n\n`;
    md += `| ID | Business | Reason |\n`;
    md += `|----|----------|--------|\n`;
    for (const r of results.invalid) {
      md += `| ${r.id} | ${r.name.substring(0, 30)} | ${r.reason} |\n`;
    }
  }

  if (results.unresolved.length > 0) {
    md += `\n## Unresolved (needs manual review)\n\n`;
    md += `| ID | Business | Reason |\n`;
    md += `|----|----------|--------|\n`;
    for (const r of results.unresolved) {
      md += `| ${r.id} | ${r.name.substring(0, 30)} | ${r.reason} |\n`;
    }
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'geocoding-results.md'), md);
  console.log('\n✓ Generated: data/audits/geocoding-results.md');
}

/**
 * Generate migration SQL for geocoded results
 */
function generateGeocodeMigration(results) {
  let sql = `-- Geocoding-Based Town Corrections\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  sql += `-- Resolved via geocoding\n`;
  for (const r of results.resolved) {
    const town = r.new_town.replace(/'/g, "''");
    sql += `UPDATE businesses SET town = '${town}'`;
    if (r.latitude && r.longitude) {
      sql += `, latitude = ${r.latitude}, longitude = ${r.longitude}`;
    }
    if (r.address) {
      const addr = r.address.replace(/'/g, "''").substring(0, 200);
      sql += `, full_address = '${addr}'`;
    }
    sql += ` WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\n-- Flag invalid records\n`;
  for (const r of results.invalid) {
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: ${r.reason}' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\n-- Mark unresolved as Unknown\n`;
  for (const r of results.unresolved) {
    sql += `UPDATE businesses SET town = 'Unknown' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'geocoding-corrections.sql'), sql);
  console.log('✓ Generated: data/audits/geocoding-corrections.sql');
}

// Run
geocodeUnknownBusinesses().catch(console.error);

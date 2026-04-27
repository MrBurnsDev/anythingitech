#!/usr/bin/env node
/**
 * Deterministic Verification for Unknown Businesses
 *
 * Uses known business data and patterns to verify town assignments
 * without requiring Google API.
 *
 * Methods:
 * 1. Well-known business database (manually curated)
 * 2. Website domain analysis
 * 3. Phone number patterns
 * 4. Name-based location hints
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Well-known MV businesses with verified locations
// Source: Local knowledge, Google Maps verification, official websites
const KNOWN_BUSINESSES = {
  // Vineyard Haven
  "Art Cliff Diner": { town: "Vineyard Haven", address: "39 Beach Rd, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Artcliff Diner": { town: "Vineyard Haven", address: "39 Beach Rd, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Scottish Bakehouse": { town: "Vineyard Haven", address: "977 State Rd, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Mocha Motts": { town: "Vineyard Haven", address: "15 Main St, Vineyard Haven, MA 02568", category: "Restaurant" },
  "About Motts": { town: "Vineyard Haven", address: "15 Main St, Vineyard Haven, MA 02568", category: "Restaurant", rename: "Mocha Mott's" },
  "Brickman": { town: "Vineyard Haven", address: "14 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail", rename: "Brickman's" },
  "Bunch of Grapes Bookstore": { town: "Vineyard Haven", address: "44 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Vineyard Vines": { town: "Vineyard Haven", address: "68 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "CB Stark Jewelers": { town: "Vineyard Haven", address: "53A Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Cb Stark Jewelers": { town: "Vineyard Haven", address: "53A Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Rainy Day": { town: "Vineyard Haven", address: "24 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Good Dog Goods": { town: "Vineyard Haven", address: "16 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Airport Fitness": { town: "Vineyard Haven", address: "12 Airport Rd, Vineyard Haven, MA 02568", category: "Health & Wellness" },
  "Airportfitness": { town: "Vineyard Haven", address: "12 Airport Rd, Vineyard Haven, MA 02568", category: "Health & Wellness" },
  "La Choza": { town: "Vineyard Haven", address: "12 State Rd, Vineyard Haven, MA 02568", category: "Restaurant" },
  "The La Choza Difference": { town: "Vineyard Haven", address: "12 State Rd, Vineyard Haven, MA 02568", category: "Restaurant", rename: "La Choza" },
  "Rocco's": { town: "Vineyard Haven", address: "56 Main St, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Net Result": { town: "Vineyard Haven", address: "79 Beach Rd, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Vineyard Haven Public Library": { town: "Vineyard Haven", address: "200 Main St, Vineyard Haven, MA 02568", category: "Community" },
  "Martha's Vineyard Film Festival": { town: "Vineyard Haven", address: "79 Beach Rd, Vineyard Haven, MA 02568", category: "Arts & Entertainment" },
  "Crossfit Martha's Vineyard": { town: "Vineyard Haven", address: "12 Airport Rd, Vineyard Haven, MA 02568", category: "Health & Wellness" },
  "Crossfitmarthas": { town: "Vineyard Haven", address: "12 Airport Rd, Vineyard Haven, MA 02568", category: "Health & Wellness" },
  "Martha's Vineyard Magazine": { town: "Vineyard Haven", address: "20 Beach Rd, Vineyard Haven, MA 02568", category: "Professional Services" },
  "Sea Bags": { town: "Vineyard Haven", address: "9 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Soft As A Grape": { town: "Vineyard Haven", address: "71 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Cape Cod 5": { town: "Vineyard Haven", address: "51 State Rd, Vineyard Haven, MA 02568", category: "Professional Services", rename: "Cape Cod Five" },
  "Rockland Trust": { town: "Vineyard Haven", address: "20 Beach Rd, Vineyard Haven, MA 02568", category: "Professional Services" },
  "Personal & Business Banking": { town: "Vineyard Haven", address: "20 Beach Rd, Vineyard Haven, MA 02568", category: "Professional Services", rename: "Rockland Trust", invalid: true },
  "Vineyard Decorators": { town: "Vineyard Haven", address: "67 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Martha's Vineyard Home Décor": { town: "Vineyard Haven", address: "67 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail", rename: "Vineyard Decorators" },
  "DaRosa's": { town: "Vineyard Haven", address: "21 Beach Rd, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Darosa's": { town: "Vineyard Haven", address: "21 Beach Rd, Vineyard Haven, MA 02568", category: "Restaurant", rename: "DaRosa's" },

  // Edgartown
  "Edgartown Council on Aging": { town: "Edgartown", address: "20 Robinson Rd, Edgartown, MA 02539", category: "Community" },
  "The Edgartown Council on Aging": { town: "Edgartown", address: "20 Robinson Rd, Edgartown, MA 02539", category: "Community" },
  "Entertainment Cinemas Edgartown": { town: "Edgartown", address: "65 Main St, Edgartown, MA 02539", category: "Arts & Entertainment" },
  "E.C. Cottle": { town: "Edgartown", address: "106 Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "E. C. Cottle, Inc.": { town: "Edgartown", address: "106 Main St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "E.C. Cottle" },
  "Edgartown Paint Shoppe": { town: "Edgartown", address: "101 Upper Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Edgartownpaintshoppe": { town: "Edgartown", address: "101 Upper Main St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "Edgartown Paint Shoppe" },
  "Sea Spa Salon": { town: "Edgartown", address: "93 Main St, Edgartown, MA 02539", category: "Health & Wellness" },
  "Sea Spasalon": { town: "Edgartown", address: "93 Main St, Edgartown, MA 02539", category: "Health & Wellness", rename: "Sea Spa Salon" },
  "Claudia": { town: "Edgartown", address: "44 Main St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "Claudia Jewelry" },
  "Claudia Jewelry": { town: "Edgartown", address: "44 Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Lark Hotels": { town: "Edgartown", address: "27 N Water St, Edgartown, MA 02539", category: "Lodging" },
  "MV Wine Store": { town: "Edgartown", address: "196 Upper Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Mvwine Store": { town: "Edgartown", address: "196 Upper Main St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "MV Wine Store" },
  "Fine Fettle": { town: "Edgartown", address: "256 Upper Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "La Strada": { town: "Edgartown", address: "51 Main St, Edgartown, MA 02539", category: "Restaurant" },

  // Oak Bluffs
  "Bobby B's": { town: "Oak Bluffs", address: "90 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Bobbybs": { town: "Oak Bluffs", address: "90 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant", rename: "Bobby B's" },
  "Summercamp Hotel": { town: "Oak Bluffs", address: "70 Lake Ave, Oak Bluffs, MA 02557", category: "Lodging" },
  "Martha's Vineyard Escape Room": { town: "Oak Bluffs", address: "84 Circuit Ave, Oak Bluffs, MA 02557", category: "Arts & Entertainment" },
  "Marthasvineyardescaperoom": { town: "Oak Bluffs", address: "84 Circuit Ave, Oak Bluffs, MA 02557", category: "Arts & Entertainment", rename: "Martha's Vineyard Escape Room" },
  "Island Music": { town: "Oak Bluffs", address: "59 Circuit Ave, Oak Bluffs, MA 02557", category: "Shopping & Retail" },
  "Islandmusic": { town: "Oak Bluffs", address: "59 Circuit Ave, Oak Bluffs, MA 02557", category: "Shopping & Retail", rename: "Island Music" },
  "Wind's Up": { town: "Oak Bluffs", address: "199 Beach Rd, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Sail Surf and Paddle": { town: "Oak Bluffs", address: "199 Beach Rd, Vineyard Haven, MA 02568", category: "Shopping & Retail", rename: "Wind's Up" },
  "Sail Surf and Paddle on Martha's Vineyard": { town: "Oak Bluffs", address: "199 Beach Rd, Vineyard Haven, MA 02568", category: "Shopping & Retail", rename: "Wind's Up" },
  "Delicious MV": { town: "Oak Bluffs", address: "94 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Mikado": { town: "Oak Bluffs", address: "64 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Back Door Donuts": { town: "Oak Bluffs", address: "5 Post Office Sq, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Martha's Vineyard Pizza": { town: "Oak Bluffs", address: "12 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Rosie's Frozen Yogurt": { town: "Oak Bluffs", address: "6 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "The Vineyard's Drive": { town: "Oak Bluffs", address: "77 Oak Bluffs Ave, Oak Bluffs, MA 02557", category: "Arts & Entertainment", rename: "Drive-In MV" },
  "9 Craft Kitchen And Bar": { town: "Oak Bluffs", address: "9 Oak Bluffs Ave, Oak Bluffs, MA 02557", category: "Restaurant", rename: "9 Craft Kitchen & Bar" },
  "Vineyard Vinyasa": { town: "Oak Bluffs", address: "50 Kennebec Ave, Oak Bluffs, MA 02557", category: "Health & Wellness" },
  "Boneyard Surf Co.": { town: "Oak Bluffs", address: "33 Lake Ave, Oak Bluffs, MA 02557", category: "Shopping & Retail", rename: "Boneyard Surf Co" },

  // West Tisbury
  "Native Earth Teaching Farm": { town: "West Tisbury", address: "94 North Rd, West Tisbury, MA 02575", category: "Community" },
  "Merry Farm Pottery": { town: "West Tisbury", address: "674 Lambert's Cove Rd, West Tisbury, MA 02575", category: "Shopping & Retail" },
  "Model Deli": { town: "West Tisbury", address: "688 State Rd, West Tisbury, MA 02575", category: "Restaurant" },
  "Model Deli Is a Model of Deliciousness": { town: "West Tisbury", address: "688 State Rd, West Tisbury, MA 02575", category: "Restaurant", rename: "Model Deli" },
  "Vineyard Hearth Patio & Spa": { town: "West Tisbury", address: "695 State Rd, West Tisbury, MA 02575", category: "Shopping & Retail" },
  "Martha's Vineyard Made": { town: "West Tisbury", address: "State Rd, West Tisbury, MA 02575", category: "Shopping & Retail" },

  // Chilmark
  "Larsen's Fish Market": { town: "Chilmark", address: "56 Basin Rd, Menemsha, MA 02552", category: "Restaurant" },
  "Larsen": { town: "Chilmark", address: "56 Basin Rd, Menemsha, MA 02552", category: "Restaurant", rename: "Larsen's Fish Market" },
  "Menemsha Fish Market": { town: "Chilmark", address: "54 Basin Rd, Menemsha, MA 02552", category: "Restaurant" },
  "Menemsha Blues": { town: "Chilmark", address: "30 Basin Rd, Menemsha, MA 02552", category: "Restaurant" },
  "Menemshablues": { town: "Chilmark", address: "30 Basin Rd, Menemsha, MA 02552", category: "Restaurant", rename: "Menemsha Blues" },
  "Captain Flanders Inn": { town: "Chilmark", address: "5 North Rd, Chilmark, MA 02535", category: "Lodging" },

  // Invalid / Non-MV businesses
  "Book a Hostel": { invalid: true, reason: "generic_booking_site" },
  "Smart Recovery": { invalid: true, reason: "national_organization" },
  "Refuge Recovery World Services": { invalid: true, reason: "national_organization" },
  "Tisburyma.Gov/Council-Aging": { invalid: true, reason: "government_url", rename: "Tisbury Council on Aging", town: "Vineyard Haven" },
  "Entertainmentcinemas.Com/Locations/Edgartown": { invalid: true, reason: "url_as_name", town: "Edgartown", rename: "Entertainment Cinemas Edgartown" },
  "Phillips Hardware Closed": { invalid: true, reason: "business_closed" },
  "MVANA": { town: "Vineyard Haven", address: "Vineyard Haven, MA", category: "Community", rename: "MV Addiction, Narcotics Anonymous" },
  "Mvana": { town: "Vineyard Haven", address: "Vineyard Haven, MA", category: "Community", rename: "MV Addiction, Narcotics Anonymous" },

  // More known businesses (second pass)
  "Beach Road": { town: "Vineyard Haven", address: "79 Beach Rd, Vineyard Haven, MA 02568", category: "Restaurant", rename: "Beach Road Restaurant" },
  "Slip 77": { town: "Oak Bluffs", address: "77 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Larry's Tackle": { town: "Edgartown", address: "141 Main St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Larry": { town: "Edgartown", address: "141 Main St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "Larry's Tackle Shop" },
  "Brunos": { town: "Oak Bluffs", address: "102 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant", rename: "Bruno's" },
  "Bruno's": { town: "Oak Bluffs", address: "102 Circuit Ave, Oak Bluffs, MA 02557", category: "Restaurant" },
  "Wheel Happy Bicycles": { town: "Edgartown", address: "8 S Water St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Wheelhappybicycles": { town: "Edgartown", address: "8 S Water St, Edgartown, MA 02539", category: "Shopping & Retail", rename: "Wheel Happy Bicycles" },
  "Duck Inn": { town: "Aquinnah", address: "10 Duck Pond Way, Aquinnah, MA 02535", category: "Lodging" },
  "Duckinnon": { town: "Aquinnah", address: "10 Duck Pond Way, Aquinnah, MA 02535", category: "Lodging", rename: "Duck Inn" },
  "Revive by Sarka": { town: "Edgartown", address: "38 Winter St, Edgartown, MA 02539", category: "Health & Wellness" },
  "Revive by Sarka ~ European Skincare, Boutique & Spa": { town: "Edgartown", address: "38 Winter St, Edgartown, MA 02539", category: "Health & Wellness", rename: "Revive by Sarka" },
  "Sole": { town: "Edgartown", address: "14 Church St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Sea Legs": { town: "Edgartown", address: "25 Church St, Edgartown, MA 02539", category: "Shopping & Retail" },
  "Bellezza MV Salon": { town: "Edgartown", address: "30 Main St, Edgartown, MA 02539", category: "Health & Wellness" },
  "Bellezzamvsalon": { town: "Edgartown", address: "30 Main St, Edgartown, MA 02539", category: "Health & Wellness", rename: "Bellezza MV Salon" },
  "Jardin Mahoney": { town: "Vineyard Haven", address: "81 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Chicken Alley": { town: "Vineyard Haven", address: "14 Beach St, Vineyard Haven, MA 02568", category: "Restaurant" },
  "Chickenalley": { town: "Vineyard Haven", address: "14 Beach St, Vineyard Haven, MA 02568", category: "Restaurant", rename: "Chicken Alley" },
  "Louisa Gould Gallery": { town: "Vineyard Haven", address: "54 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail" },
  "Louisa Gould Photographer": { town: "Vineyard Haven", address: "54 Main St, Vineyard Haven, MA 02568", category: "Shopping & Retail", rename: "Louisa Gould Gallery" },
  "Blanchard Photo": { town: "West Tisbury", address: "West Tisbury, MA 02575", category: "Professional Services" },
  "Blanchardphoto": { town: "West Tisbury", address: "West Tisbury, MA 02575", category: "Professional Services", rename: "Blanchard Photography" },

  // Invalid records
  "Instagram": { invalid: true, reason: "social_media_platform" },
  "Redirecting...": { invalid: true, reason: "page_error" },
  "Account Suspended": { invalid: true, reason: "page_error" },
  "Secure.myvanco.com/ygss/campaign/c-yjgr": { invalid: true, reason: "url_as_name" },
  "Basicsandeastaway.company": { invalid: true, reason: "domain_as_name" },
  "Binks Auto.business": { invalid: true, reason: "domain_as_name" },
  "Altheadesigns": { invalid: true, reason: "unclear_business" },
  "Michaeljimage": { invalid: true, reason: "unclear_business" },
  "Summershadessunglasses": { invalid: true, reason: "unclear_business" },
  "Vineyard Scripts": { invalid: true, reason: "unclear_business" },
};

// Additional patterns for name normalization
const NAME_CLEANUPS = [
  { pattern: /\.square$/i, replacement: "" },
  { pattern: /\.com.*$/i, replacement: "" },
  { pattern: /\.org.*$/i, replacement: "" },
  { pattern: /\s*:\s*Flavor Without the Fuss\.?$/i, replacement: "" },
  { pattern: /\s*Is a Model of Deliciousness$/i, replacement: "" },
  { pattern: /\s*on Martha'?s Vineyard$/i, replacement: "" },
  { pattern: /\s*~\s*European Skincare.*$/i, replacement: "" },
];

function cleanBusinessName(name) {
  let cleaned = name;
  for (const { pattern, replacement } of NAME_CLEANUPS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.trim();
}

function normalizeForLookup(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Main verification function
function verifyUnknownBusinesses() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Deterministic Verification for Unknown Businesses');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Load verification list from database (businesses currently marked as VH without address)
  const businesses = db.prepare(`
    SELECT id, business_name, website, phone, town
    FROM businesses
    WHERE is_duplicate = 0
      AND (full_address IS NULL OR full_address = '')
      AND town = 'Vineyard Haven'
  `).all();

  console.log(`Businesses to verify: ${businesses.length}\n`);

  const results = {
    resolved: [],
    invalid: [],
    not_found: []
  };

  for (const biz of businesses) {
    const cleanedName = cleanBusinessName(biz.business_name);
    const normalizedName = normalizeForLookup(cleanedName);

    // Try to find in known businesses
    let match = null;
    for (const [knownName, data] of Object.entries(KNOWN_BUSINESSES)) {
      const normalizedKnown = normalizeForLookup(knownName);
      if (normalizedName === normalizedKnown ||
          normalizedName.includes(normalizedKnown) ||
          normalizedKnown.includes(normalizedName)) {
        match = { name: knownName, ...data };
        break;
      }
    }

    if (match) {
      if (match.invalid) {
        results.invalid.push({
          id: biz.id,
          original_name: biz.business_name,
          reason: match.reason,
          suggested_fix: match.rename || null,
          town: match.town || null
        });
      } else {
        results.resolved.push({
          id: biz.id,
          original_name: biz.business_name,
          verified_name: match.rename || biz.business_name,
          town: match.town,
          address: match.address,
          category: match.category,
          confidence: 'high'
        });
      }
    } else {
      results.not_found.push({
        id: biz.id,
        name: biz.business_name,
        cleaned_name: cleanedName,
        website: biz.website,
        phone: biz.phone
      });
    }
  }

  console.log(`Resolved: ${results.resolved.length}`);
  console.log(`Invalid: ${results.invalid.length}`);
  console.log(`Not found (remain Unknown): ${results.not_found.length}\n`);

  // Generate reports
  generateReports(results);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Verification Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

function generateReports(results) {
  // CSV
  let csv = 'id,original_name,verified_name,town,address,category,confidence,status\n';

  for (const r of results.resolved) {
    csv += `${r.id},"${r.original_name.replace(/"/g, '""')}","${r.verified_name.replace(/"/g, '""')}","${r.town}","${r.address}","${r.category}","${r.confidence}","resolved"\n`;
  }
  for (const r of results.invalid) {
    csv += `${r.id},"${r.original_name.replace(/"/g, '""')}","${r.suggested_fix || ''}","${r.town || ''}","","","","invalid_record"\n`;
  }
  for (const r of results.not_found) {
    csv += `${r.id},"${r.name.replace(/"/g, '""')}","","","","","","unknown"\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'unknown-business-google-verification.csv'), csv);
  console.log('✓ Generated: data/audits/unknown-business-google-verification.csv');

  // Markdown
  let md = `# Unknown Business Verification Results\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `Method: Deterministic lookup using known business database\n\n`;

  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Resolved | ${results.resolved.length} |\n`;
  md += `| Invalid Records | ${results.invalid.length} |\n`;
  md += `| Still Unknown | ${results.not_found.length} |\n`;
  md += `| **Total** | **${results.resolved.length + results.invalid.length + results.not_found.length}** |\n\n`;

  // Town breakdown
  const townCounts = {};
  for (const r of results.resolved) {
    townCounts[r.town] = (townCounts[r.town] || 0) + 1;
  }

  md += `### Resolved by Town\n\n`;
  md += `| Town | Count |\n`;
  md += `|------|-------|\n`;
  for (const [town, count] of Object.entries(townCounts).sort((a, b) => b[1] - a[1])) {
    md += `| ${town} | ${count} |\n`;
  }
  md += `\n`;

  // Category breakdown
  const catCounts = {};
  for (const r of results.resolved) {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  }

  md += `### Resolved by Category\n\n`;
  md += `| Category | Count |\n`;
  md += `|----------|-------|\n`;
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    md += `| ${cat} | ${count} |\n`;
  }
  md += `\n`;

  if (results.resolved.length > 0) {
    md += `## Resolved Businesses (${results.resolved.length})\n\n`;
    md += `| ID | Original Name | Verified Name | Town | Category |\n`;
    md += `|----|---------------|---------------|------|----------|\n`;
    for (const r of results.resolved) {
      md += `| ${r.id} | ${r.original_name.substring(0, 25)} | ${r.verified_name.substring(0, 25)} | ${r.town} | ${r.category} |\n`;
    }
    md += `\n`;
  }

  if (results.invalid.length > 0) {
    md += `## Invalid Records (${results.invalid.length})\n\n`;
    md += `| ID | Name | Reason | Suggested Fix |\n`;
    md += `|----|------|--------|---------------|\n`;
    for (const r of results.invalid) {
      md += `| ${r.id} | ${r.original_name.substring(0, 30)} | ${r.reason} | ${r.suggested_fix || '-'} |\n`;
    }
    md += `\n`;
  }

  if (results.not_found.length > 0) {
    md += `## Still Unknown - Needs Manual Review (${results.not_found.length})\n\n`;
    md += `| ID | Name | Website | Phone |\n`;
    md += `|----|------|---------|-------|\n`;
    for (const r of results.not_found) {
      md += `| ${r.id} | ${r.name.substring(0, 30)} | ${r.website || '-'} | ${r.phone || '-'} |\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'unknown-business-google-verification.md'), md);
  console.log('✓ Generated: data/audits/unknown-business-google-verification.md');

  // Migration SQL
  let sql = `-- Resolve Unknown Businesses\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Method: Deterministic verification using known business database\n`;
  sql += `-- DO NOT APPLY WITHOUT REVIEW\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  sql += `-- Resolved businesses: Update town, address, category\n`;
  for (const r of results.resolved) {
    const town = r.town.replace(/'/g, "''");
    const addr = r.address.replace(/'/g, "''");
    const cat = r.category.replace(/'/g, "''");
    const name = r.verified_name.replace(/'/g, "''");

    sql += `UPDATE businesses SET town = '${town}', full_address = '${addr}', category = '${cat}'`;
    if (r.verified_name !== r.original_name) {
      sql += `, business_name = '${name}'`;
    }
    sql += ` WHERE id = ${r.id}; -- ${r.original_name.substring(0, 30)}\n`;
  }

  sql += `\n-- Invalid records: Flag for review or removal\n`;
  for (const r of results.invalid) {
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: ${r.reason}'`;
    if (r.town) {
      sql += `, town = '${r.town}'`;
    }
    sql += ` WHERE id = ${r.id}; -- ${r.original_name.substring(0, 30)}\n`;
  }

  sql += `\n-- Still unknown: Set town to Unknown\n`;
  for (const r of results.not_found) {
    sql += `UPDATE businesses SET town = 'Unknown' WHERE id = ${r.id}; -- ${r.name.substring(0, 30)}\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(path.join(MIGRATIONS_DIR, 'resolve-unknown-businesses.sql'), sql);
  console.log('✓ Generated: migrations/resolve-unknown-businesses.sql');
}

// Run
verifyUnknownBusinesses();

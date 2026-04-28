#!/usr/bin/env node
/**
 * Business Town/Category Verification Audit
 *
 * This script analyzes all businesses in the MV Registry database
 * and flags potential issues for manual review.
 *
 * Issues detected:
 * - Business name that looks like a URL/domain (scraping artifact)
 * - Business name that's a social media platform name
 * - Missing address when town is assigned
 * - Suspiciously low confidence score
 * - Category mismatches based on name keywords
 * - Vineyard Haven over-assignment (known data quality issue)
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');
const AUDITS_DIR = path.join(__dirname, '..', 'data', 'audits');

// Ensure audits directory exists
if (!fs.existsSync(AUDITS_DIR)) {
  fs.mkdirSync(AUDITS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Valid MV towns
const VALID_TOWNS = ['Vineyard Haven', 'Edgartown', 'Oak Bluffs', 'West Tisbury', 'Chilmark', 'Aquinnah'];

// Social media / invalid business names
const INVALID_NAME_PATTERNS = [
  /^facebook$/i,
  /^instagram$/i,
  /^twitter$/i,
  /^yelp$/i,
  /^tripadvisor$/i,
  /^google$/i,
  /^linkedin$/i,
  /\.com$/i,
  /\.org$/i,
  /\.net$/i,
  /^https?:\/\//i,
  /^www\./i,
  /\.square$/i,
  /^menu$/i,
  /^home\s*page$/i,
  /^contact$/i,
  /^about$/i,
];

// Category keyword hints
const CATEGORY_HINTS = {
  'Restaurant': ['restaurant', 'cafe', 'diner', 'grill', 'kitchen', 'bistro', 'tavern', 'bakery', 'pizza', 'sushi', 'bar', 'pub', 'seafood', 'oyster', 'fish market', 'food', 'ice cream', 'coffee'],
  'Lodging': ['inn', 'hotel', 'motel', 'resort', 'b&b', 'bed and breakfast', 'cottage', 'rental', 'lodge', 'guest house'],
  'Shopping & Retail': ['shop', 'store', 'boutique', 'gallery', 'market', 'gifts', 'clothing', 'jewelry', 'antiques', 'books', 'bookstore'],
  'Health & Wellness': ['spa', 'salon', 'fitness', 'yoga', 'massage', 'health', 'medical', 'doctor', 'dental', 'therapy', 'wellness', 'gym'],
  'Contractors': ['construction', 'plumbing', 'electric', 'roofing', 'landscap', 'painting', 'building', 'contractor', 'carpentry'],
  'Professional Services': ['law', 'attorney', 'accounting', 'real estate', 'insurance', 'bank', 'financial', 'consulting'],
  'Community': ['church', 'library', 'museum', 'town', 'school', 'nonprofit', 'association', 'foundation'],
};

function detectIssues(business) {
  const issues = [];
  const name = business.business_name || '';
  const nameLower = name.toLowerCase();

  // Check for invalid business names
  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(name)) {
      issues.push(`Invalid name pattern: appears to be a URL or social media platform`);
      break;
    }
  }

  // Check for very short names
  if (name.length < 3) {
    issues.push(`Name too short: "${name}"`);
  }

  // Check for names that are just numbers
  if (/^\d+$/.test(name.trim())) {
    issues.push(`Name is just numbers`);
  }

  // Check for missing address when assigned to a town
  if (business.town && !business.full_address) {
    issues.push(`Missing address for ${business.town} assignment`);
  }

  // Check for low confidence score
  if (business.confidence_score && business.confidence_score < 50) {
    issues.push(`Low confidence score: ${business.confidence_score}`);
  }

  // Check for Vineyard Haven over-assignment (flag for review)
  if (business.town === 'Vineyard Haven' && !business.full_address) {
    issues.push(`Vineyard Haven assignment without address - may be default assignment`);
  }

  // Check for category mismatch based on name keywords
  const currentCategory = business.category || '';
  for (const [category, keywords] of Object.entries(CATEGORY_HINTS)) {
    if (category !== currentCategory) {
      for (const keyword of keywords) {
        if (nameLower.includes(keyword)) {
          // Only flag if it's a strong indicator
          const strongIndicators = ['restaurant', 'inn', 'hotel', 'shop', 'store', 'gallery', 'spa', 'salon'];
          if (strongIndicators.includes(keyword)) {
            issues.push(`Possible category mismatch: name contains "${keyword}" but category is "${currentCategory}"`);
          }
          break;
        }
      }
    }
  }

  // Check for duplicate-looking slugs (like domain names)
  if (business.website) {
    try {
      const url = new URL(business.website.startsWith('http') ? business.website : `https://${business.website}`);
      const domain = url.hostname.replace('www.', '').split('.')[0];
      if (nameLower === domain || nameLower === url.hostname) {
        issues.push(`Business name appears to be scraped from domain name`);
      }
    } catch (e) {
      // Invalid URL, skip check
    }
  }

  return issues;
}

function generateReport() {
  console.log('Generating business audit report...\n');

  // Get all non-duplicate businesses
  const businesses = db.prepare(`
    SELECT
      id, business_name, town, full_address, category, subcategory,
      website, phone, confidence_score, primary_source,
      needs_review, review_reason, needs_manual_review, validation_notes
    FROM businesses
    WHERE is_duplicate = 0
    ORDER BY town, business_name
  `).all();

  console.log(`Total businesses: ${businesses.length}\n`);

  // Group by town
  const byTown = {};
  for (const town of [...VALID_TOWNS, 'Unknown']) {
    byTown[town] = [];
  }

  const issuesList = [];
  let totalIssues = 0;

  for (const biz of businesses) {
    const town = VALID_TOWNS.includes(biz.town) ? biz.town : 'Unknown';
    const issues = detectIssues(biz);

    const record = {
      ...biz,
      suspected_issues: issues,
      has_issues: issues.length > 0
    };

    byTown[town].push(record);

    if (issues.length > 0) {
      totalIssues++;
      issuesList.push(record);
    }
  }

  // Generate Markdown report
  let md = `# Martha's Vineyard Business Directory Audit\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Businesses | ${businesses.length} |\n`;
  md += `| With Issues | ${totalIssues} |\n`;
  md += `| Clean Records | ${businesses.length - totalIssues} |\n\n`;

  md += `### Distribution by Town\n\n`;
  md += `| Town | Count | With Issues |\n`;
  md += `|------|-------|-------------|\n`;
  for (const town of [...VALID_TOWNS, 'Unknown']) {
    const count = byTown[town].length;
    const withIssues = byTown[town].filter(b => b.has_issues).length;
    if (count > 0) {
      md += `| ${town} | ${count} | ${withIssues} |\n`;
    }
  }
  md += `\n`;

  // Detailed listing by town
  for (const town of [...VALID_TOWNS, 'Unknown']) {
    if (byTown[town].length === 0) continue;

    md += `---\n\n## ${town}\n\n`;
    md += `**${byTown[town].length} businesses**\n\n`;

    for (const biz of byTown[town]) {
      const issueFlag = biz.has_issues ? '⚠️ ' : '✓ ';
      md += `### ${issueFlag}${biz.business_name}\n\n`;
      md += `- **ID:** ${biz.id}\n`;
      md += `- **Category:** ${biz.category || 'Not set'}\n`;
      md += `- **Address:** ${biz.full_address || 'Not available'}\n`;
      md += `- **Phone:** ${biz.phone || 'Not available'}\n`;
      md += `- **Website:** ${biz.website || 'Not available'}\n`;
      md += `- **Confidence:** ${biz.confidence_score || 'N/A'}\n`;
      md += `- **Source:** ${biz.primary_source || 'Unknown'}\n`;

      if (biz.has_issues) {
        md += `- **⚠️ Suspected Issues:**\n`;
        for (const issue of biz.suspected_issues) {
          md += `  - ${issue}\n`;
        }
      }
      md += `\n`;
    }
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'businesses-by-current-town.md'), md);
  console.log('✓ Generated: businesses-by-current-town.md');

  // Generate needs-manual-review.md
  let reviewMd = `# Businesses Needing Manual Review\n\n`;
  reviewMd += `Generated: ${new Date().toISOString()}\n\n`;
  reviewMd += `**${issuesList.length} businesses flagged for review**\n\n`;

  // Group issues by type
  const issueTypes = {};
  for (const biz of issuesList) {
    for (const issue of biz.suspected_issues) {
      const type = issue.split(':')[0];
      if (!issueTypes[type]) issueTypes[type] = [];
      issueTypes[type].push(biz);
    }
  }

  reviewMd += `## Issues by Type\n\n`;
  for (const [type, bizList] of Object.entries(issueTypes)) {
    reviewMd += `### ${type} (${bizList.length})\n\n`;
    for (const biz of bizList) {
      reviewMd += `- **${biz.business_name}** (ID: ${biz.id}) - ${biz.town}\n`;
    }
    reviewMd += `\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'needs-manual-review.md'), reviewMd);
  console.log('✓ Generated: needs-manual-review.md');

  // Generate CSV
  let csv = 'id,business_name,town,full_address,category,website,phone,confidence_score,primary_source,has_issues,suspected_issues\n';
  for (const biz of businesses) {
    const issues = detectIssues(biz);
    const row = [
      biz.id,
      `"${(biz.business_name || '').replace(/"/g, '""')}"`,
      `"${biz.town || ''}"`,
      `"${(biz.full_address || '').replace(/"/g, '""')}"`,
      `"${biz.category || ''}"`,
      `"${biz.website || ''}"`,
      `"${biz.phone || ''}"`,
      biz.confidence_score || '',
      `"${biz.primary_source || ''}"`,
      issues.length > 0 ? 'TRUE' : 'FALSE',
      `"${issues.join('; ').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  }
  fs.writeFileSync(path.join(AUDITS_DIR, 'business-town-category-verification.csv'), csv);
  console.log('✓ Generated: business-town-category-verification.csv');

  // Generate JSON
  const jsonData = {
    generated: new Date().toISOString(),
    summary: {
      total: businesses.length,
      withIssues: totalIssues,
      clean: businesses.length - totalIssues,
      byTown: {}
    },
    businesses: businesses.map(biz => ({
      ...biz,
      suspected_issues: detectIssues(biz)
    }))
  };

  for (const town of [...VALID_TOWNS, 'Unknown']) {
    jsonData.summary.byTown[town] = {
      total: byTown[town].length,
      withIssues: byTown[town].filter(b => b.has_issues).length
    };
  }

  fs.writeFileSync(
    path.join(AUDITS_DIR, 'business-town-category-verification.json'),
    JSON.stringify(jsonData, null, 2)
  );
  console.log('✓ Generated: business-town-category-verification.json');

  // Generate recommended corrections SQL (DO NOT APPLY)
  let sql = `-- Recommended Corrections SQL\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- WARNING: DO NOT APPLY WITHOUT MANUAL REVIEW\n\n`;
  sql += `-- These are suggested fixes based on automated analysis.\n`;
  sql += `-- Each should be verified against Google Places or other sources.\n\n`;

  // Flag records needing review
  sql += `-- Mark records for manual review\n`;
  for (const biz of issuesList) {
    const reasons = biz.suspected_issues.join('; ').replace(/'/g, "''");
    sql += `UPDATE businesses SET needs_manual_review = 1, review_reason = '${reasons}' WHERE id = ${biz.id};\n`;
  }

  sql += `\n-- Delete clearly invalid records (social media platform names, etc.)\n`;
  const deleteables = issuesList.filter(b =>
    INVALID_NAME_PATTERNS.some(p => p.test(b.business_name))
  );
  for (const biz of deleteables) {
    sql += `-- DELETE FROM businesses WHERE id = ${biz.id}; -- "${biz.business_name}"\n`;
  }

  fs.writeFileSync(path.join(AUDITS_DIR, 'recommended-corrections.sql'), sql);
  console.log('✓ Generated: recommended-corrections.sql');

  // Print summary
  console.log('\n========================================');
  console.log('AUDIT SUMMARY');
  console.log('========================================\n');
  console.log(`Total businesses analyzed: ${businesses.length}`);
  console.log(`Records with issues: ${totalIssues} (${(totalIssues/businesses.length*100).toFixed(1)}%)`);
  console.log(`Clean records: ${businesses.length - totalIssues}\n`);

  console.log('Distribution by Town:');
  console.log('--------------------');
  for (const town of [...VALID_TOWNS, 'Unknown']) {
    const count = byTown[town].length;
    const pct = ((count / businesses.length) * 100).toFixed(1);
    const withIssues = byTown[town].filter(b => b.has_issues).length;
    if (count > 0) {
      console.log(`  ${town}: ${count} (${pct}%) - ${withIssues} with issues`);
    }
  }

  console.log('\n⚠️  NOTE: 71.7% of businesses are assigned to Vineyard Haven.');
  console.log('   This suggests many records may have been defaulted to Vineyard Haven');
  console.log('   when no address could be determined. Manual verification recommended.\n');

  console.log('Files generated in data/audits/:');
  console.log('  - businesses-by-current-town.md');
  console.log('  - needs-manual-review.md');
  console.log('  - business-town-category-verification.csv');
  console.log('  - business-town-category-verification.json');
  console.log('  - recommended-corrections.sql\n');
}

generateReport();
db.close();

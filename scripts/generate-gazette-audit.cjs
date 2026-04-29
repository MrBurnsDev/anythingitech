#!/usr/bin/env node
/**
 * Generate Human-Readable Audit Report for Gazette Import
 *
 * Creates a detailed markdown report reviewing all matches, conflicts,
 * and new businesses from the Gazette import.
 *
 * Usage: node scripts/generate-gazette-audit.cjs
 */

const fs = require('fs');
const path = require('path');

const gazetteDir = path.join(__dirname, '../data/gazette');

function loadJSON(filename) {
  const filePath = path.join(gazetteDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function generateAuditReport() {
  const summary = loadJSON('summary.json');
  const parsed = loadJSON('parsed-businesses.json');
  const matches = loadJSON('matches.json');
  const newBusinesses = loadJSON('new-businesses.json');
  const conflicts = loadJSON('conflicts.json');

  let report = `# Vineyard Gazette Business Import Audit

Generated: ${new Date().toISOString()}
Source: ${summary.source}

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Parsed | ${summary.stats.totalParsed} |
| Matched to Existing | ${summary.stats.matched} |
| Potential New Businesses | ${summary.stats.newBusinesses} |
| Records with Conflicts | ${summary.stats.conflicts} |

## By Gazette Category

| Category | Total | New |
|----------|-------|-----|
`;

  for (const [cat, count] of Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])) {
    const newCount = summary.newByCategory[cat] || 0;
    report += `| ${cat} | ${count} | ${newCount} |\n`;
  }

  report += `
## By Town

| Town | Count |
|------|-------|
`;

  for (const [town, count] of Object.entries(summary.byTown).sort((a, b) => b[1] - a[1])) {
    report += `| ${town} | ${count} |\n`;
  }

  // Identify duplicates in parsed data
  const nameCount = {};
  for (const b of parsed) {
    const key = b.name.toLowerCase();
    nameCount[key] = (nameCount[key] || 0) + 1;
  }
  const duplicates = Object.entries(nameCount).filter(([, c]) => c > 1);

  if (duplicates.length > 0) {
    report += `
## Duplicate Entries in Gazette Data

The following businesses appear multiple times in the Gazette data:

| Business Name | Count |
|---------------|-------|
`;
    for (const [name, count] of duplicates.sort((a, b) => b[1] - a[1])) {
      const original = parsed.find(b => b.name.toLowerCase() === name);
      report += `| ${original.name} | ${count} |\n`;
    }
  }

  // Conflicts summary
  report += `
## Field Conflict Summary

| Field | Conflicts |
|-------|-----------|
`;
  for (const [field, count] of Object.entries(summary.conflictsByField).sort((a, b) => b[1] - a[1])) {
    report += `| ${field} | ${count} |\n`;
  }

  // Sample conflicts for review
  report += `
## Sample Conflicts (First 20)

Review these to understand the nature of differences:

`;

  const uniqueConflicts = [];
  const seenExistingIds = new Set();
  for (const c of conflicts) {
    if (!seenExistingIds.has(c.existing.id)) {
      seenExistingIds.add(c.existing.id);
      uniqueConflicts.push(c);
    }
  }

  for (const c of uniqueConflicts.slice(0, 20)) {
    report += `### ${c.gazette.name} (ID: ${c.existing.id})
- **Match Reason:** ${c.matchReason} (score: ${c.score.toFixed(2)})
- **Town:** ${c.gazette.town || 'Unknown'}

| Field | Gazette | Existing |
|-------|---------|----------|
`;
    for (const d of c.fieldDiffs) {
      const gazetteVal = d.gazette || '(empty)';
      const existingVal = d.existing || '(empty)';
      report += `| ${d.field} | ${gazetteVal} | ${existingVal} |\n`;
    }
    report += '\n';
  }

  // New businesses by category
  report += `
## New Businesses to Add

These businesses from the Gazette are not in our directory:

`;

  const newByCategory = {};
  for (const b of newBusinesses) {
    const cat = b.gazetteCategory;
    if (!newByCategory[cat]) newByCategory[cat] = [];
    newByCategory[cat].push(b);
  }

  for (const [cat, businesses] of Object.entries(newByCategory).sort((a, b) => b[1].length - a[1].length)) {
    report += `### ${cat} (${businesses.length} new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
`;
    for (const b of businesses.slice(0, 15)) {
      const phone = b.phone || '-';
      const website = b.website ? `[link](${b.website})` : '-';
      const town = b.town || '-';
      report += `| ${b.name} | ${town} | ${phone} | ${website} | ${b.confidence} |\n`;
    }
    if (businesses.length > 15) {
      report += `| ... and ${businesses.length - 15} more | | | | |\n`;
    }
    report += '\n';
  }

  // Recommendations
  report += `
## Recommendations

### 1. Address Updates
${summary.conflictsByField.address || 0} businesses have better addresses in the Gazette data.
The Gazette includes full addresses with zip codes.

**Recommendation:** Update addresses from Gazette for businesses where our address is incomplete.

### 2. Website URL Normalization
${summary.conflictsByField.website || 0} website conflicts detected.
Most are minor differences (http vs https, trailing slashes).

**Recommendation:** Prefer https:// URLs and normalize format.

### 3. Phone Number Validation
${summary.conflictsByField.phone || 0} phone conflicts detected.

**Recommendation:** Review phone conflicts manually - some may be updated numbers.

### 4. Duplicate Handling
${duplicates.length} businesses appear multiple times in Gazette data.

**Recommendation:** Deduplicate before import.

### 5. New Business Review
${newBusinesses.length} potential new businesses identified.
- High confidence (has phone or website): ${newBusinesses.filter(b => b.confidence === 'high').length}
- Low confidence (no contact info): ${newBusinesses.filter(b => b.confidence === 'low').length}

**Recommendation:** Prioritize adding high-confidence businesses first.

## Next Steps

1. Review this audit report
2. Approve categories of updates to apply
3. Run the migration script with approved changes
4. Verify changes in admin dashboard
`;

  return report;
}

// Generate the report
const report = generateAuditReport();

// Write to file
const outputPath = path.join(gazetteDir, 'AUDIT-REPORT.md');
fs.writeFileSync(outputPath, report);

console.log(`Audit report generated: ${outputPath}`);
console.log('\nYou can view it with:');
console.log(`  cat "${outputPath}"`);
console.log('\nOr open in a markdown viewer.');

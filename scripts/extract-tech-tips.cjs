#!/usr/bin/env node

/**
 * Extract Tech Tips blog posts from WordPress SQL backup
 * Uses a simpler line-by-line extraction approach
 */

const fs = require('fs');
const path = require('path');

const SQL_FILE = '/Users/louis/Desktop/AiMV Website/Legacy files/ct_anyt_a2bja.sql';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'tech-tips.json');

function decodeHtmlEntities(str) {
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtmlToMarkdown(content) {
  let cleaned = content;

  // Remove WordPress shortcodes
  cleaned = cleaned.replace(/\[wolf_col_\d+[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/wolf_col_\d+\]/g, '');
  cleaned = cleaned.replace(/\[caption[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/caption\]/g, '');

  // Remove WordPress Gutenberg block comments
  cleaned = cleaned.replace(/<!-- wp:[^>]+-->/g, '');
  cleaned = cleaned.replace(/<!-- \/wp:[^>]+-->/g, '');

  // Convert headers
  cleaned = cleaned.replace(/<h1[^>]*>(.*?)<\/h1>/gis, '\n\n# $1\n\n');
  cleaned = cleaned.replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n\n## $1\n\n');
  cleaned = cleaned.replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n\n### $1\n\n');
  cleaned = cleaned.replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n\n#### $1\n\n');

  // Convert paragraphs
  cleaned = cleaned.replace(/<p[^>]*>/gi, '\n\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n\n');

  // Convert line breaks
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/\\r\\n/g, '\n');
  cleaned = cleaned.replace(/\\n/g, '\n');

  // Convert links - keep the text and URL
  cleaned = cleaned.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, '[$2]($1)');

  // Convert images to markdown
  cleaned = cleaned.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  cleaned = cleaned.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  cleaned = cleaned.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Convert lists
  cleaned = cleaned.replace(/<li[^>]*>/gi, '- ');
  cleaned = cleaned.replace(/<\/li>/gi, '\n');
  cleaned = cleaned.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  // Convert bold/italic
  cleaned = cleaned.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gis, '**$2**');
  cleaned = cleaned.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gis, '*$2*');

  // Remove divs, spans, centers
  cleaned = cleaned.replace(/<\/?div[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?center>/gi, '\n');
  cleaned = cleaned.replace(/<\/?blockquote[^>]*>/gi, '\n> ');

  // Remove horizontal rules
  cleaned = cleaned.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n');

  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);

  // Clean up whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

function extractExcerpt(content, maxLength = 200) {
  const stripped = stripHtmlToMarkdown(content);
  // Get first meaningful paragraph (not a heading)
  const paragraphs = stripped.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('!'));
  const firstPara = paragraphs[0] || '';

  if (firstPara.length <= maxLength) return firstPara;
  return firstPara.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// Extract a SQL string starting at index (after opening ')
function extractSqlString(sql, startIdx) {
  let value = '';
  let i = startIdx;

  while (i < sql.length) {
    const char = sql[i];

    if (char === '\\' && i + 1 < sql.length) {
      // Escaped character - take next char literally
      value += sql[i + 1];
      i += 2;
    } else if (char === "'" && sql[i + 1] === "'") {
      // SQL-style escaped quote
      value += "'";
      i += 2;
    } else if (char === "'") {
      // End of string
      return { value, endIdx: i };
    } else {
      value += char;
      i++;
    }
  }

  return null;
}

async function main() {
  console.log('Reading SQL file...');
  const sql = fs.readFileSync(SQL_FILE, 'utf8');

  const posts = [];

  // Find all published blog posts
  // Pattern: (ID, author, 'date', 'date_gmt', 'content', 'title', 'excerpt', 'publish', ...)
  // The key is finding rows that end with: 'post', '', 0)

  // Find positions of "'post', '', 0)" which marks blog posts
  const postMarker = "'post', '', 0)";
  let searchStart = 0;

  while (true) {
    const postIdx = sql.indexOf(postMarker, searchStart);
    if (postIdx === -1) break;

    searchStart = postIdx + postMarker.length;

    // Now search backwards to find the start of this row (the opening parenthesis)
    // We need to find the matching '(' but need to handle nested quotes
    let parenCount = 1; // We start with the closing )
    let rowStart = postIdx - 1;
    let inString = false;

    while (rowStart > 0 && parenCount > 0) {
      const char = sql[rowStart];

      if (char === "'" && sql[rowStart - 1] !== '\\' && sql[rowStart - 1] !== "'") {
        inString = !inString;
      }

      if (!inString) {
        if (char === ')') parenCount++;
        if (char === '(') parenCount--;
      }

      rowStart--;
    }

    if (parenCount !== 0) continue;

    // Extract the full row
    const row = sql.substring(rowStart + 1, postIdx + postMarker.length);

    // Check if this is a 'publish' status row
    if (!row.includes("'publish'")) continue;

    // Parse the row
    // Format: (ID, author, 'date', 'date_gmt', 'content', 'title', 'excerpt', 'publish', ...)

    // Extract ID
    const idMatch = row.match(/^\((\d+),\s*\d+,\s*'/);
    if (!idMatch) continue;

    const id = parseInt(idMatch[1]);
    let cursor = idMatch[0].length - 1; // Position at first '

    // Extract date
    const dateResult = extractSqlString(row, cursor);
    if (!dateResult) continue;
    const date = dateResult.value;
    cursor = dateResult.endIdx + 1;

    // Skip to next string (date_gmt) - find next '
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++; // Move past '

    const dateGmtResult = extractSqlString(row, cursor);
    if (!dateGmtResult) continue;
    cursor = dateGmtResult.endIdx + 1;

    // Skip to next string (content)
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++;

    const contentResult = extractSqlString(row, cursor);
    if (!contentResult) continue;
    const content = contentResult.value;
    cursor = contentResult.endIdx + 1;

    // Skip to next string (title)
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++;

    const titleResult = extractSqlString(row, cursor);
    if (!titleResult) continue;
    const title = titleResult.value;
    cursor = titleResult.endIdx + 1;

    // Skip excerpt
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++;
    const excerptResult = extractSqlString(row, cursor);
    if (!excerptResult) continue;
    cursor = excerptResult.endIdx + 1;

    // Skip status ('publish')
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++;
    const statusResult = extractSqlString(row, cursor);
    if (!statusResult || statusResult.value !== 'publish') continue;
    cursor = statusResult.endIdx + 1;

    // Skip comment_status, ping_status, post_password
    for (let skip = 0; skip < 3; skip++) {
      cursor = row.indexOf("'", cursor);
      if (cursor === -1) break;
      cursor++;
      const skipResult = extractSqlString(row, cursor);
      if (!skipResult) break;
      cursor = skipResult.endIdx + 1;
    }

    // Extract post_name (slug)
    cursor = row.indexOf("'", cursor);
    if (cursor === -1) continue;
    cursor++;
    const slugResult = extractSqlString(row, cursor);
    if (!slugResult) continue;
    const slug = slugResult.value;

    // Skip empty slugs
    if (!slug || slug === '') continue;

    posts.push({
      id,
      title: decodeHtmlEntities(title),
      slug,
      date,
      content,
      excerpt: extractExcerpt(content),
      contentMarkdown: stripHtmlToMarkdown(content)
    });
  }

  console.log(`Found ${posts.length} blog posts`);

  // Remove duplicates by ID
  const uniquePosts = [];
  const seenIds = new Set();
  for (const post of posts) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      uniquePosts.push(post);
    }
  }

  // Sort by date descending
  uniquePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniquePosts, null, 2));
  console.log(`\nWrote ${uniquePosts.length} posts to ${OUTPUT_FILE}`);

  // Print summary
  console.log('\n=== Posts Found ===');
  for (const post of uniquePosts) {
    console.log(`- ${post.title} (${post.date.split(' ')[0]})`);
    console.log(`  Slug: ${post.slug}`);
  }
}

main().catch(console.error);

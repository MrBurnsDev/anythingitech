#!/usr/bin/env node
/**
 * Crawl old anythingitechmv.com site and generate URL report
 *
 * Usage: node scripts/crawl-old-site.cjs
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.anythingitechmv.com';

// All discovered URLs from manual crawling
const DISCOVERED_URLS = [
  // Homepage
  '/',

  // Main service pages
  '/services/',
  '/iphone-repair/',
  '/mac-repair-services/',
  '/network-services-2/',
  '/network-services/',  // This is "The Team" page
  '/happy-clients/',
  '/about-us/',
  '/remote-support/',
  '/tech-tips/',
  '/contact/',

  // Blog posts - 2026
  '/why-i-built-is-the-ferry-running/',

  // Blog posts - 2024
  '/wi-fi-coverage-for-large-properties/',
  '/office-wireless-network-installation/',
  '/professional-wireless-network-installation/',
  '/future-proof-luxury-wireless-network-marthas-vineyard/',
  '/luxury-home-wireless-network-marthas-vineyard/',
  '/marthas-vineyard-network-installations/',

  // Blog posts - 2018
  '/common-quick-fixes/',

  // Blog posts - 2017
  '/something-broken-iphone-ya-gonna-call-louis-hall/',
  '/malicious-ios-popups/',
  '/anything-apple-jingle/',
  '/weekly-tip-start-taking-advantage-cloud/',
  '/year-louis-hall-anything-apple-marthas-vineyard/',
  '/the-end-of-an-era/',

  // Archive pages
  '/2026/01/',
  '/2024/10/',
  '/2018/02/',
  '/2017/06/',
  '/2017/05/',

  // Author pages
  '/author/louis/',
  '/author/louis/page/2/',

  // Category pages
  '/category/tech-talk-posts/',
  '/category/uncategorized/',

  // Resources
  '/feed/',

  // Legacy URLs to check (may 404)
  '/networking-services/',
];

function classifyPageType(url) {
  if (url === '/') return 'homepage';
  if (url === '/services/') return 'service-index';
  if (['/iphone-repair/', '/mac-repair-services/', '/network-services-2/'].includes(url)) return 'service-page';
  if (url === '/network-services/') return 'team-page';
  if (['/happy-clients/', '/about-us/', '/remote-support/', '/contact/'].includes(url)) return 'info-page';
  if (url === '/tech-tips/') return 'blog-index';
  if (url.match(/^\/\d{4}\/\d{2}\//)) return 'date-archive';
  if (url.startsWith('/author/')) return 'author-archive';
  if (url.startsWith('/category/')) return 'category-archive';
  if (url === '/feed/') return 'rss-feed';
  // Remaining are likely blog posts
  return 'blog-post';
}

async function fetchUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = BASE_URL + url;
    const client = fullUrl.startsWith('https') ? https : http;

    const req = client.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
        'Accept': 'text/html'
      },
      timeout: 10000
    }, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({
          url,
          statusCode: res.statusCode,
          title: '',
          canonical: res.headers.location,
          redirectTo: res.headers.location
        });
        return;
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Extract title
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract canonical URL
        const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                              data.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
        const canonical = canonicalMatch ? canonicalMatch[1] : '';

        resolve({
          url,
          statusCode: res.statusCode,
          title,
          canonical
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        statusCode: 0,
        title: '',
        canonical: '',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        title: '',
        canonical: '',
        error: 'timeout'
      });
    });
  });
}

async function main() {
  console.log('Crawling old site URLs...\n');
  console.log(`Checking ${DISCOVERED_URLS.length} URLs...\n`);

  const results = [];

  for (const url of DISCOVERED_URLS) {
    process.stdout.write(`Checking ${url}... `);
    const result = await fetchUrl(url);
    result.pageType = classifyPageType(url);
    results.push(result);
    console.log(`${result.statusCode} ${result.statusCode === 200 ? '✓' : result.statusCode === 404 ? '✗' : '→'}`);

    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 200));
  }

  // Generate CSV
  const csvHeader = 'url,page_type,status_code,title,canonical_url,notes';
  const csvRows = results.map(r => {
    const notes = r.error ? r.error : (r.redirectTo ? `Redirects to: ${r.redirectTo}` : '');
    return [
      BASE_URL + r.url,
      r.pageType,
      r.statusCode,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.canonical || '',
      `"${notes}"`
    ].join(',');
  });

  const csvContent = [csvHeader, ...csvRows].join('\n');

  const outputPath = path.join(__dirname, '..', 'data', 'seo', 'old-site-urls.csv');
  fs.writeFileSync(outputPath, csvContent);

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const statusCounts = {};
  results.forEach(r => {
    statusCounts[r.statusCode] = (statusCounts[r.statusCode] || 0) + 1;
  });

  console.log('\nStatus Code Distribution:');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
    console.log(`  ${code}: ${count} URLs`);
  });

  const typeCounts = {};
  results.filter(r => r.statusCode === 200).forEach(r => {
    typeCounts[r.pageType] = (typeCounts[r.pageType] || 0) + 1;
  });

  console.log('\nPage Types (200 OK only):');
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log(`\nResults saved to: ${outputPath}`);
  console.log(`Total URLs checked: ${results.length}`);
  console.log(`Live pages (200): ${results.filter(r => r.statusCode === 200).length}`);
  console.log(`Not found (404): ${results.filter(r => r.statusCode === 404).length}`);
  console.log(`Redirects (3xx): ${results.filter(r => r.statusCode >= 300 && r.statusCode < 400).length}`);
}

main().catch(console.error);

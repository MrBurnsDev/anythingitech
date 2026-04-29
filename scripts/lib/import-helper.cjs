/**
 * Import Helper Library
 *
 * Provides consistent matching logic for imports using external_source_id.
 * NEVER use numeric IDs for cross-system imports.
 */

const https = require('https');

const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';

/**
 * Generate external_source_id from source and record data
 * Format: {source}:{town-slug}:{name-slug}
 */
function generateExternalSourceId(source, name, town) {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  const townSlug = (town || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${source}:${townSlug}:${cleanName}`;
}

/**
 * Generate slug from name and town
 */
function generateSlug(name, town) {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);

  const townSlug = (town || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${cleanName}-${townSlug}`;
}

/**
 * Make API request
 */
function apiRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Get admin token
 */
async function getAdminToken(username = 'admin', password) {
  if (!password) {
    throw new Error('Password required - set ADMIN_PASSWORD env var');
  }

  const response = await apiRequest('POST', '/api/admin/auth', null, { username, password });
  if (!response.token) {
    throw new Error('Failed to get admin token');
  }
  return response.token;
}

/**
 * Fetch all businesses from API
 */
async function fetchAllBusinesses(token) {
  const allBusinesses = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const data = await apiRequest('GET', `/api/admin/businesses?page=${page}&limit=${limit}`, token);
    const businesses = data.businesses || [];
    allBusinesses.push(...businesses);

    if (!data.pagination || page >= data.pagination.totalPages) break;
    page++;
  }

  return allBusinesses;
}

/**
 * Build lookup maps for matching
 */
function buildLookupMaps(businesses) {
  const byExternalSourceId = new Map();
  const bySlug = new Map();
  const byNameTown = new Map();
  const byPhone = new Map();
  const byWebsiteDomain = new Map();

  for (const biz of businesses) {
    // By external_source_id
    if (biz.external_source_id) {
      byExternalSourceId.set(biz.external_source_id, biz);
    }

    // By slug
    if (biz.slug) {
      bySlug.set(biz.slug.toLowerCase(), biz);
    }

    // By normalized name + town
    const nameKey = normalizeForMatch(biz.business_name) + '|' + normalizeForMatch(biz.town);
    if (!byNameTown.has(nameKey)) {
      byNameTown.set(nameKey, biz);
    }

    // By phone
    if (biz.phone) {
      const cleanPhone = biz.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        byPhone.set(cleanPhone.slice(-10), biz);
      }
    }

    // By website domain
    if (biz.website) {
      const domain = extractDomain(biz.website);
      if (domain) {
        byWebsiteDomain.set(domain, biz);
      }
    }
  }

  return { byExternalSourceId, bySlug, byNameTown, byPhone, byWebsiteDomain };
}

/**
 * Normalize string for matching
 */
function normalizeForMatch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Find matching business using multiple strategies
 * Priority: external_source_id > slug > website domain > phone > name+town
 */
function findMatch(record, source, lookups) {
  const { byExternalSourceId, bySlug, byNameTown, byPhone, byWebsiteDomain } = lookups;

  // 1. Try external_source_id (best match)
  const extId = generateExternalSourceId(source, record.name, record.town);
  if (byExternalSourceId.has(extId)) {
    return { match: byExternalSourceId.get(extId), method: 'external_source_id' };
  }

  // 2. Try slug
  const slug = generateSlug(record.name, record.town);
  if (bySlug.has(slug)) {
    return { match: bySlug.get(slug), method: 'slug' };
  }

  // 3. Try website domain
  if (record.website) {
    const domain = extractDomain(record.website);
    if (domain && byWebsiteDomain.has(domain)) {
      return { match: byWebsiteDomain.get(domain), method: 'website_domain' };
    }
  }

  // 4. Try phone
  if (record.phone) {
    const cleanPhone = record.phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && byPhone.has(cleanPhone.slice(-10))) {
      return { match: byPhone.get(cleanPhone.slice(-10)), method: 'phone' };
    }
  }

  // 5. Try name + town
  const nameKey = normalizeForMatch(record.name) + '|' + normalizeForMatch(record.town);
  if (byNameTown.has(nameKey)) {
    return { match: byNameTown.get(nameKey), method: 'name_town' };
  }

  return { match: null, method: null };
}

/**
 * Apply update via API using slug (not ID)
 */
async function applyUpdate(token, slug, updates) {
  return apiRequest('PUT', '/api/admin/businesses', token, {
    lookup_slug: slug,
    ...updates
  });
}

/**
 * Apply update via API using external_source_id
 */
async function applyUpdateByExternalId(token, externalSourceId, updates) {
  // First fetch by external_source_id to get the slug
  try {
    const result = await apiRequest('GET', `/api/admin/businesses?external_source_id=${encodeURIComponent(externalSourceId)}`, token);
    if (result.business) {
      return applyUpdate(token, result.business.slug, updates);
    }
  } catch (e) {
    // Fall back to direct update if lookup fails
  }

  return apiRequest('PUT', '/api/admin/businesses', token, {
    external_source_id: externalSourceId,
    ...updates
  });
}

module.exports = {
  generateExternalSourceId,
  generateSlug,
  getAdminToken,
  fetchAllBusinesses,
  buildLookupMaps,
  normalizeForMatch,
  extractDomain,
  findMatch,
  applyUpdate,
  applyUpdateByExternalId,
  apiRequest,
  API_BASE
};

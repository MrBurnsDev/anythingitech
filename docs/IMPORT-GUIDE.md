# Business Data Import Guide

## Overview

This guide explains how to properly import business data into the MV Business Directory while maintaining data integrity across systems.

## Key Principle: Never Rely on Numeric IDs

**The numeric `id` field in Supabase is auto-generated and NOT stable across systems.**

Evidence from audit:
- Legacy export: IDs 1-730 (244 records)
- Supabase: IDs 1-389 (337 records)
- 222 records have mismatched IDs between systems
- Example: "Harbor View Hotel" is ID 4 in legacy, ID 52 in Supabase

## The `external_source_id` Field

Use `external_source_id` as the stable identifier for all imports.

### Format

```
{source}:{slug}
```

Or for import batches:
```
{source}:{town-slug}:{name-slug}
```

### Examples

| Record | external_source_id |
|--------|-------------------|
| Existing Supabase | `supabase:harbor-view-hotel-edgartown` |
| Gazette import | `gazette:edgartown:harbor-view-hotel` |
| Chamber import | `chamber:edgartown:harbor-view-hotel` |
| Manual entry | `manual:edgartown:harbor-view-hotel` |

## Import Script Template

```javascript
// Generate external_source_id for matching
function generateExternalSourceId(source, record) {
  const cleanName = (record.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  const town = (record.town || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `${source}:${town}:${cleanName}`;
}

// Match records using external_source_id
async function findExistingBusiness(externalSourceId, slug, name, town) {
  // 1. Try exact external_source_id match
  let match = await findByExternalSourceId(externalSourceId);
  if (match) return match;

  // 2. Try slug match
  match = await findBySlug(slug);
  if (match) return match;

  // 3. Try name + town match (fuzzy)
  match = await findByNameAndTown(name, town);
  if (match) return match;

  return null;
}

// Import with proper ID handling
async function importBusiness(record, source) {
  const externalSourceId = generateExternalSourceId(source, record);

  const existing = await findExistingBusiness(
    externalSourceId,
    record.slug,
    record.name,
    record.town
  );

  if (existing) {
    // UPDATE existing record
    await updateBusiness(existing.id, {
      ...mergeFields(existing, record),
      verification_source: source,
      // Keep original external_source_id if exists
      external_source_id: existing.external_source_id || externalSourceId
    });
  } else {
    // INSERT new record
    await insertBusiness({
      ...record,
      external_source_id: externalSourceId,
      verification_source: source,
      needs_manual_review: true,
      business_status: 'needs_review'
    });
  }
}
```

## Database Schema

```sql
-- Required columns for imports
external_source_id TEXT UNIQUE,  -- Stable cross-system identifier
verification_source TEXT,        -- Where the data came from

-- Indexes
CREATE UNIQUE INDEX idx_businesses_external_source_id
  ON businesses(external_source_id)
  WHERE external_source_id IS NOT NULL;
```

## Verification Sources

| Source | Description |
|--------|-------------|
| `manual` | Hand-entered by admin |
| `legacy` | Original pre-Supabase data |
| `gazette` | Vineyard Gazette directory |
| `chamber` | MV Chamber of Commerce |
| `google_places` | Google Places API verification |
| `import_2024_04` | Dated import batch |

## Import Workflow

1. **Parse source data** → `parsed-businesses.json`
2. **Match against existing** → `matches.json`, `new-businesses.json`
3. **Identify conflicts** → `conflicts.json`
4. **Generate migration**:
   - `safe-updates.sql` - Non-conflicting updates
   - `new-needs-review.sql` - New records needing review
5. **Apply migrations** via API
6. **Re-export** to verify changes

## Duplicate Detection

Check for duplicates using multiple strategies:

1. **Exact slug match** - Same slug = same business
2. **external_source_id match** - Same source ID = same record
3. **Name + Town match** - Likely duplicate, needs review
4. **Phone match** - Strong indicator of same business
5. **Website match** - Strong indicator of same business

## API Endpoints

```
GET  /api/admin/businesses?external_source_id=gazette:edgartown:harbor-view-hotel
PUT  /api/admin/businesses  { id, external_source_id, verification_source, ... }
POST /api/admin/businesses  { external_source_id, verification_source, ... }
```

## Migration Checklist

- [ ] Run SQL migration: `migrations/005-add-external-source-id.sql`
- [ ] Populate external_source_id for existing records
- [ ] Update import scripts to use external_source_id
- [ ] Add verification_source to all new imports
- [ ] Never use numeric IDs for cross-system matching

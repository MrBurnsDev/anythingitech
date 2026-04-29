# Gazette Import Final Plan

Generated: 2026-04-29T03:08:50.007Z
Source: Vineyard Gazette Business Directory

## Summary

| Category | Count |
|----------|-------|
| **Safe Updates** | 124 |
| - Address fills | 20 |
| - Phone fills | 29 |
| - Website fills | 0 |
| - Website normalizations (http→https) | 19 |
| - ZIP code additions | 78 |
| **New Businesses (needs_review)** | 137 |
| **Excluded** | |
| - New businesses (low confidence) | 9 |
| - Phone conflicts | 28 |
| - Name conflicts | 20 |
| - Category conflicts | 137 |
| - Duplicate records | 37 |

## Files Generated

### SQL Migrations (in /migrations/)

| File | Description | Records |
|------|-------------|---------|
| `gazette-safe-updates.sql` | Fill missing fields, normalize URLs | 124 |
| `gazette-new-businesses-needs-review.sql` | Add new businesses as needs_review | 137 |
| `gazette-import-rollback.sql` | Rollback script | - |

### Review Files (in /data/gazette/)

| File | Records |
|------|---------|
| `phone-conflicts-review.csv` | 28 |
| `name-conflicts-review.csv` | 20 |
| `category-conflicts-review.csv` | 137 |
| `duplicate-review.csv` | 37 |

## Safe Update Details

These updates will **only fill missing fields** and will **not overwrite existing data**:

### Address Fills (20)
Businesses where we had no address but Gazette provides one.

### Phone Fills (29)
Businesses where we had no phone but Gazette provides one.

### Website Fills (0)
Businesses where we had no website but Gazette provides one.

### Website Normalizations (19)
Businesses where the website is the same but URL format differs (http→https, trailing slash).

### ZIP Code Additions (78)
Businesses where our address lacks a ZIP code but Gazette's full address includes it.

## New Business Details

137 high-confidence new businesses will be added with:
- `status = 'needs_review'` (not published)
- `confidence = 50`
- `verification_source = 'vineyard_gazette_business_directory'`

These require admin review before being published.

## Conflicts Excluded

The following conflicts were excluded from automatic import and require manual review:

### Phone Conflicts (28)
Businesses where both sources have different phone numbers.
Review: `data/gazette/phone-conflicts-review.csv`

### Name Conflicts (20)
Businesses matched by website/phone but names differ significantly.
Review: `data/gazette/name-conflicts-review.csv`

### Category Conflicts (137)
Businesses where Gazette category differs from our classification.
Review: `data/gazette/category-conflicts-review.csv`

## Duplicates Excluded

37 duplicate records in Gazette data were excluded.
Review: `data/gazette/duplicate-review.csv`

## How to Apply

1. **Review the conflict CSVs** and decide on any manual updates needed

2. **Apply safe updates:**
   ```bash
   # Using Supabase CLI or psql
   psql $DATABASE_URL -f migrations/gazette-safe-updates.sql
   ```

3. **Apply new businesses (optional):**
   ```bash
   psql $DATABASE_URL -f migrations/gazette-new-businesses-needs-review.sql
   ```

4. **Review new businesses in admin dashboard** and publish approved ones

5. **If rollback needed:**
   ```bash
   psql $DATABASE_URL -f migrations/gazette-import-rollback.sql
   ```

## Verification After Import

After applying migrations:

1. Check updated record count matches expected
2. Verify a sample of updated businesses in admin dashboard
3. Review any new businesses with status=needs_review
4. Re-export businesses.json if needed:
   ```bash
   npm run registry:export
   ```

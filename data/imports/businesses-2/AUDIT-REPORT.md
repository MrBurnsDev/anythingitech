# Businesses 2 Import Audit Report

Generated: 2026-04-29T03:21:07.195Z

## Summary

| Metric | Count |
|--------|-------|
| Total Parsed | 320 |
| Matched to Existing | 91 |
| New Businesses | 202 (196 valid for import) |
| Conflicts | 82 |
| Duplicates | 27 |

## Safe Updates (Ready to Apply)

These updates ONLY fill missing fields - they never overwrite existing data.

| Type | Count |
|------|-------|
| Phone fills | 11 |
| Address fills | 9 |
| Website fills | 0 |
| Description fills | 1 |
| **Total Safe Updates** | **16** |

## New Businesses (Needs Review)

196 new businesses will be imported with:
- `status = 'needs_review'`
- `is_public = false`
- `verification_source = 'businesses_2_import'`

These will NOT appear on the public site until manually approved.

### By Town

| Town | Count |
|------|-------|
| Vineyard Haven | 112 |
| Edgartown | 99 |
| Oak Bluffs | 64 |
| Aquinnah | 5 |
| West Tisbury | 20 |
| Chilmark | 9 |
| Menemsha | 5 |

### By Category

| Category | Count |
|----------|-------|
| ACCOMMODATIONS | 44 |
| ACTIVITIES & RECREATION | 35 |
| MARTHA'S VINEYARD ARTS, GALLERIES & ARTISTIC SERVICES | 25 |
| MARTHA'S VINEYARD BEAUTY SALONS, WELLNESS & FITNESS DIRECTORY | 28 |
| MARTHA'S VINEYARD BUSINESS, LEGAL & FINANCIAL SERVICES DIRECTORY | 19 |
| MARTHA'S VINEYARD CONSTRUCTION, GENERAL CONTRACTORS BUILDING SERVICES & SUPPLIES | 44 |
| MARTHA'S VINEYARD ENTERTAINMENT & EVENTS DIRECTORY | 8 |
| MARTHA'S VINEYARD FOOD, EAT & DRINK DINING DIRECTORY | 117 |

## Conflicts (Requires Manual Review)

| Type | Count | File |
|------|-------|------|
| Phone Conflicts | 17 | phone-conflicts-review.csv |
| Name Conflicts | 0 | name-conflicts-review.csv |
| Category Conflicts | 0 | category-conflicts-review.csv |
| Duplicates | 27 | duplicates-review.csv |

## Generated Files

### Migration SQL (in /migrations/)
- `businesses-2-safe-updates.sql` - 16 safe field fills
- `businesses-2-new-needs-review.sql` - 196 new businesses (staged)
- `businesses-2-rollback.sql` - Rollback script

### Review CSVs (in /data/imports/businesses-2/)
- `phone-conflicts-review.csv`
- `name-conflicts-review.csv`
- `category-conflicts-review.csv`
- `duplicates-review.csv`

## Next Steps

1. **Review conflicts** - Open the CSV files and decide on each conflict
2. **Apply safe updates** - Run `businesses-2-safe-updates.sql` via API
3. **Import new businesses** - Run `businesses-2-new-needs-review.sql` via API (they'll be hidden)
4. **Review staged records** - Use admin dashboard to approve/reject new businesses
5. **Regenerate exports** - Run export script after all changes are applied

# Staged Records Review Plan

Generated: 2026-04-29

This document outlines all records that require manual review before being made public in the business directory.

---

## Summary of Import Sources

| Source | Safe Updates | New Records | Conflicts | Duplicates |
|--------|--------------|-------------|-----------|------------|
| Vineyard Gazette | 75 applied | 137 staged | 122 | 37 |
| Businesses 2 | 16 pending | 196 staged | 44 | 27 |
| **Total** | **91** | **333** | **166** | **64** |

---

## Section 1: Vineyard Gazette Import

### Status
- Safe updates: **75 applied** via production API
- 49 failed due to ID mismatch (IDs in local export differ from production Supabase)

### Files Location
`/data/gazette/`

### Pending Review

#### New Businesses (137 records)
- **File**: `gazette-new-businesses-needs-review.sql`
- **Status**: NOT YET APPLIED
- **Action**: These will be imported as `needs_review`, `is_public=false`

#### Conflicts to Review
| Type | Count | File |
|------|-------|------|
| Phone conflicts | 28 | `phone-conflicts-review.csv` |
| Name conflicts | 20 | `name-conflicts-review.csv` |
| Category conflicts | 137 | `category-conflicts-review.csv` |
| Duplicates | 37 | `duplicate-review.csv` |

---

## Section 2: Businesses 2 Import

### Status
- Safe updates: **16 pending** (not yet applied)
- All migration files generated, none applied

### Files Location
`/data/imports/businesses-2/`

### Pending Review

#### Safe Updates (16 records)
- **File**: `migrations/businesses-2-safe-updates.sql`
- **Type**: Fill missing phone (11), address (9), description (1)
- **Action**: Can be applied via API - these are non-destructive

#### New Businesses (196 records)
- **File**: `migrations/businesses-2-new-needs-review.sql`
- **Status**: NOT YET APPLIED
- **Action**: Will be imported as `needs_review`, `is_public=false`

#### Conflicts to Review
| Type | Count | File |
|------|-------|------|
| Phone conflicts | 17 | `phone-conflicts-review.csv` |
| Duplicates | 27 | `duplicates-review.csv` |

---

## Recommended Review Process

### Phase 1: Apply Safe Updates
These updates only fill missing fields and never overwrite existing data.

1. **Businesses 2 Safe Updates** (16 records)
   ```bash
   # Get admin token
   ADMIN_TOKEN=$(curl -s -X POST "https://anythingitech.vercel.app/api/admin/auth" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"YOUR_PASSWORD"}' | jq -r '.token')

   # Apply via API script
   ADMIN_TOKEN="$ADMIN_TOKEN" node scripts/apply-businesses-2-via-api.cjs
   ```

### Phase 2: Review Conflicts
Open each CSV file and review conflicts manually:

1. **Phone Conflicts** (45 total)
   - Compare existing phone with new source
   - Mark which phone number is correct
   - Update records as needed via admin dashboard

2. **Name Conflicts** (20 from Gazette)
   - Verify business name matches
   - May indicate duplicate or renamed business

3. **Duplicates** (64 total)
   - Confirm these are true duplicates
   - Mark for merge or skip

### Phase 3: Import New Businesses (Optional)
After conflicts are resolved, you can import new businesses:

1. Run new business migration via API
2. All new records will be `needs_review`, `is_public=false`
3. Review each in admin dashboard
4. Approve or reject individually

### Phase 4: Admin Dashboard Review
Use the admin dashboard to:
1. View all `needs_review` records
2. Verify business information
3. Approve (set `is_public=true`) or reject
4. Add any missing information

### Phase 5: Regenerate Exports
After all changes are applied:
```bash
node scripts/export-from-supabase.cjs
```

---

## Files Quick Reference

### Gazette Import
```
data/gazette/
├── parsed-businesses.json    # 398 parsed records
├── matches.json              # 238 matched to existing
├── new-businesses.json       # 160 new businesses
├── conflicts.json            # 236 conflict records
├── summary.json              # Import summary
├── AUDIT-REPORT.md           # Detailed report
├── phone-conflicts-review.csv
├── name-conflicts-review.csv
├── category-conflicts-review.csv
└── duplicate-review.csv

migrations/
├── gazette-safe-updates.sql      # 124 safe updates (75 applied)
├── gazette-new-businesses-needs-review.sql  # 137 new records
└── gazette-import-rollback.sql   # Rollback script
```

### Businesses 2 Import
```
data/imports/businesses-2/
├── parsed-businesses.json    # 320 parsed records
├── matches.json              # 91 matched to existing
├── new-businesses.json       # 202 new businesses
├── conflicts.json            # 82 conflict records
├── duplicates.json           # 27 duplicates
├── summary.json              # Import summary
├── AUDIT-REPORT.md           # Detailed report
├── phone-conflicts-review.csv
└── duplicates-review.csv

migrations/
├── businesses-2-safe-updates.sql     # 16 safe updates
├── businesses-2-new-needs-review.sql # 196 new records
└── businesses-2-rollback.sql         # Rollback script
```

---

## Notes

1. **Supabase is Source of Truth**: All operations preserve existing data
2. **Conservative Approach**: Never overwrite, only fill missing fields
3. **Manual Review Required**: New businesses must be approved before public
4. **Rollback Available**: Each import has a rollback SQL script
5. **ID Mismatch Issue**: Some Gazette updates failed due to ID differences between local export and production - use API-based approach for future imports

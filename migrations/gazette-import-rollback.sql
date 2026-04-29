-- Gazette Import Rollback
-- Generated: 2026-04-29T03:08:50.006Z
-- Restores original values from backup table

BEGIN;

-- Restore safe updates from backup
UPDATE businesses b
SET
  address = bk.address,
  phone = bk.phone,
  website = bk.website,
  verification_source = bk.verification_source,
  last_verified_at = bk.last_verified_at
FROM _gazette_import_backup_20260429 bk
WHERE b.id = bk.id;

-- Delete new businesses added by this import
DELETE FROM businesses
WHERE verification_source = 'vineyard_gazette_business_directory'
  AND status = 'needs_review'
  AND created_at >= '2026-04-29';

COMMIT;

-- After successful rollback, drop backup table:
-- DROP TABLE _gazette_import_backup_20260429;

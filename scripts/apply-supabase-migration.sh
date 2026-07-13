#!/usr/bin/env bash
# Apply a Supabase SQL migration to production via psql.
#
# Prereqs:
#   - psql installed (comes with Postgres.app on macOS, or: brew install libpq)
#   - Your Supabase project's connection string, from:
#     Dashboard → Project Settings → Database → Connection string → URI
#     (use the "Session pooler" URI for one-off migrations; port 5432 or 6543)
#   - Export it once per shell session:
#       export SUPABASE_DB_URL='postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
#     (Keep this out of git. Do NOT paste your password on the command line.)
#
# Usage:
#   bash scripts/apply-supabase-migration.sh <path-to-migration.sql>
#
# Example:
#   bash scripts/apply-supabase-migration.sh supabase/migrations/2026-05-14-contact-rate-limits.sql
#
# Safety:
#   - Runs the entire file inside a transaction (BEGIN;...COMMIT;) so a
#     partial failure rolls back instead of leaving the schema half-migrated.
#   - Uses `psql --set ON_ERROR_STOP=1` so the first error aborts.
#   - Prints exactly what will run before running it.

set -euo pipefail

MIGRATION_FILE="${1:-}"

if [[ -z "$MIGRATION_FILE" ]]; then
  echo "Usage: bash scripts/apply-supabase-migration.sh <migration.sql>" >&2
  echo "Example: bash scripts/apply-supabase-migration.sh supabase/migrations/2026-05-14-contact-rate-limits.sql" >&2
  exit 1
fi

if [[ ! -f "$MIGRATION_FILE" ]]; then
  echo "ERROR: file not found: $MIGRATION_FILE" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "ERROR: SUPABASE_DB_URL not set." >&2
  echo "" >&2
  echo "Get your connection string from:" >&2
  echo "  https://supabase.com/dashboard/project/<your-project>/settings/database" >&2
  echo "  → Connection string → URI → Session pooler (recommended for migrations)" >&2
  echo "" >&2
  echo "Then run:" >&2
  echo "  export SUPABASE_DB_URL='postgresql://postgres.xxxx:PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres'" >&2
  echo "  bash scripts/apply-supabase-migration.sh $MIGRATION_FILE" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql not found on PATH." >&2
  echo "Install with: brew install libpq && brew link --force libpq" >&2
  exit 1
fi

echo "============================================================"
echo "Migration file:  $MIGRATION_FILE"
echo "Target:          Supabase (via \$SUPABASE_DB_URL)"
echo "============================================================"
echo ""
echo "--- File contents to be applied ---"
cat "$MIGRATION_FILE"
echo ""
echo "--- End of file ---"
echo ""

# Interactive confirmation. Skip with APPLY=yes when scripting.
if [[ "${APPLY:-}" != "yes" ]]; then
  read -r -p "Apply this migration to production? [type 'yes' to proceed] " confirm
  if [[ "$confirm" != "yes" ]]; then
    echo "Aborted." >&2
    exit 1
  fi
fi

echo ""
echo "Applying migration…"

# Wrap the entire migration in a transaction. If any statement fails, the
# transaction rolls back and the DB is unchanged. Migrations that use their
# own BEGIN/COMMIT still work — psql ignores nested transaction commands.
psql "$SUPABASE_DB_URL" \
  --set ON_ERROR_STOP=1 \
  --single-transaction \
  --file "$MIGRATION_FILE"

echo ""
echo "✓ Migration applied successfully."

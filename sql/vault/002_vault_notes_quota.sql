-- Vault feature: Notes module -- adds the plan-quota column for the new
-- VaultEntryType.NOTE (3), mirroring wrMaxAccounts/wrMaxGroups from
-- 001_vault_feature_schema.sql. Safe to re-run.
--   psql "$DATABASE_URL" -f sql/vault/002_vault_notes_quota.sql

BEGIN;

ALTER TABLE public."tblPackages"
    ADD COLUMN IF NOT EXISTS "wrMaxNotes" integer; -- null = unlimited

COMMIT;

-- =========================================================================
-- New activity codes (app-level constants, see utilities/vaultConstants.js)
-- =========================================================================
-- 160 Note created
-- 161 Note updated
-- 162 Note deleted

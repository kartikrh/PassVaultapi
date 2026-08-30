-- Vault feature: adds email/password auth alongside the existing Google-only
-- flow. Nullable so Google-only clients are unaffected.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/002_client_password.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrPasswordHash" text;

COMMIT;

-- New activity codes (see utilities/vaultConstants.js VaultActivityCodes;
-- extends the list documented in 001_vault_feature_schema.sql)
-- 103 Email verification sent    106 Password reset requested
-- 104 Email verified             107 Password reset completed
-- 105 Password set

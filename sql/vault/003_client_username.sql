-- Vault feature: lets a client set a username on their profile. Nullable
-- (existing clients have none until they set one) and unique -- as a
-- case-insensitive unique index rather than a plain UNIQUE constraint, so
-- "Alex" and "alex" can't both be taken, scoped to active rows only so a
-- soft-deleted account's username can be reused.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/003_client_username.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrUsername" character varying(50);

CREATE UNIQUE INDEX IF NOT EXISTS "idxClientUsernameUnique"
    ON public."tblClient" (LOWER("wrUsername"))
    WHERE "wrIsDeleted" = false AND "wrUsername" IS NOT NULL;

COMMIT;

-- New activity codes (see utilities/vaultConstants.js VaultActivityCodes)
-- 108 Password changed    109 Profile updated (name/username)

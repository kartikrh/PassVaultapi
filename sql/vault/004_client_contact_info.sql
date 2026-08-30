-- Vault feature: lets a client add a mobile number and address to their
-- profile. Both nullable and settable any time (unlike wrUsername, these
-- carry no uniqueness constraint) -- see updateProfileService.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/004_client_contact_info.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrMobileNo" character varying(20),
    ADD COLUMN IF NOT EXISTS "wrAddress"  character varying(500);

COMMIT;

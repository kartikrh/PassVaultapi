-- Every login-completing event (password login, Google sign-in,
-- registration) now requires the client's browser GPS coordinates
-- (navigator.geolocation, gated client-side by a permission modal -- see
-- passvault-client's useGeolocation/LocationRequiredModal) and records them
-- alongside the device fingerprint already added in
-- 006_client_login_security.sql.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/007_client_login_geolocation.sql

BEGIN;

ALTER TABLE public."tblActivityLogs"
    ADD COLUMN IF NOT EXISTS "wrLatitude" double precision,
    ADD COLUMN IF NOT EXISTS "wrLongitude" double precision;

COMMIT;

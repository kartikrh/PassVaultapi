-- Client login hardening: tracks consecutive wrong-password attempts and
-- locks the account out for a period once a threshold is hit (enforced in
-- services/vaultAuth.js loginService), and records a device/browser
-- "fingerprint" (utilities/index.js deviceInfo -- IP, browser, OS, device
-- from the User-Agent header) alongside every login-related activity log
-- entry, success or failure.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/006_client_login_security.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrFailedLoginAttempts" integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "wrLockedUntil" timestamp with time zone;

ALTER TABLE public."tblActivityLogs"
    ADD COLUMN IF NOT EXISTS "wrDeviceInfo" text;

COMMIT;

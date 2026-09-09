-- Vault feature: package expiry / "days remaining" display. tblClient
-- previously only stored wrPackageId with no record of when that package
-- expires -- wrIntervalType/wrIntervalCount on tblPackages (Day/Month/Year
-- + count) were captured for a never-built Razorpay recurring-billing flow
-- and otherwise unused. This adds the expiry date, computed from those
-- fields at assignment time (signup's default package, and plan-upgrade
-- approval) -- see utilities/index.js's computePackageExpiryDate,
-- repository/TableClient.js's insertClientQuery/updateClientPackageQuery,
-- and services/vaultAuth.js's getClientPackageService (days-remaining calc
-- for passvault-client's /profile and /dashboard).
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/018_client_package_expiry.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrPackageExpiryDate" timestamp;

COMMIT;

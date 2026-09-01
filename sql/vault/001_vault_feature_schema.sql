-- Vault feature: Phase 01 (Foundation) schema migration.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS.
-- Run manually against the target Postgres database (no migration runner exists in this repo yet):
--   psql "$DATABASE_URL" -f sql/vault/001_vault_feature_schema.sql

BEGIN;

-- =========================================================================
-- New tables
-- =========================================================================

CREATE TABLE IF NOT EXISTS public."tblClient" (
    "wrClientId"            SERIAL PRIMARY KEY,
    "wrName"                character varying(200),
    "wrEmail"               character varying(200) UNIQUE NOT NULL,
    "wrGoogleId"            character varying(200) UNIQUE,
    "wrProvider"            integer DEFAULT 1, -- 1 = Google
    "wrIsEmailVerified"     boolean DEFAULT false,
    "wrPackageId"           integer REFERENCES "tblPackages"("wrId"),
    "wrDriveRefreshToken"   text, -- app-layer encrypted (utilities/index.js encrypt/decrypt)
    "wrIsActive"            boolean DEFAULT true,
    "wrIsDeleted"           boolean DEFAULT false,
    "wrDeletedAt"           timestamp with time zone,
    "wrCreatedAt"           timestamp with time zone DEFAULT now(),
    "wrUpdatedAt"           timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."tblClientVaultKey" (
    "wrKeyId"               SERIAL PRIMARY KEY,
    "wrClientId"            integer NOT NULL REFERENCES "tblClient"("wrClientId"),
    "wrWrappedKey"          text NOT NULL, -- vault key, wrapped with server master key (utilities/vaultCrypto.js)
    "wrKdfSalt"             character varying(200) NOT NULL,
    "wrKeyVersion"          integer DEFAULT 1,
    "wrIsActive"            boolean DEFAULT true,
    "wrRecoveredAt"         timestamp with time zone,
    "wrRecoveredCount"      integer DEFAULT 0,
    "wrCreatedAt"           timestamp with time zone DEFAULT now(),
    "wrUpdatedAt"           timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."tblClientVaultEntries" (
    "wrEntryId"             uuid PRIMARY KEY,
    "wrClientId"            integer NOT NULL REFERENCES "tblClient"("wrClientId"),
    "wrEntryType"           integer NOT NULL, -- 1 = account, 2 = group, 3 = note
    "wrIsDeleted"           boolean DEFAULT false,
    "wrCreatedAt"           timestamp with time zone DEFAULT now(),
    "wrUpdatedAt"           timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idxClientVaultKeyClientId" ON public."tblClientVaultKey" ("wrClientId") WHERE "wrIsActive" = true;
CREATE INDEX IF NOT EXISTS "idxClientVaultEntriesClientId" ON public."tblClientVaultEntries" ("wrClientId") WHERE "wrIsDeleted" = false;

-- =========================================================================
-- Extensions to existing tables
-- =========================================================================

ALTER TABLE public."tblPackages"
    ADD COLUMN IF NOT EXISTS "wrMaxAccounts" integer, -- null = unlimited
    ADD COLUMN IF NOT EXISTS "wrMaxGroups"   integer;

ALTER TABLE public."tblActivityLogs"
    ADD COLUMN IF NOT EXISTS "wrClientId" integer REFERENCES "tblClient"("wrClientId");

ALTER TABLE public."tblDevices"
    ADD COLUMN IF NOT EXISTS "wrBiometricEnrolled"       boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "wrLastSyncedDriveRevision" character varying(200);

COMMIT;

-- =========================================================================
-- New activity codes (app-level constants, see utilities/vaultConstants.js
-- -- there is no lookup table for activity types in this codebase, they are
-- plain integers written straight into "tblActivityLogs"."wrActivityType")
-- =========================================================================
-- 101 Client registered      120 Group created
-- 102 Client logged in       121 Group updated
-- 110 Account created        122 Group deleted
-- 111 Account updated        130 Vault key recovered
-- 112 Account deleted        131 Vault key rotated

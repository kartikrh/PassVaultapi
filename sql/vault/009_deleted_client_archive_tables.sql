-- Dedicated archive tables for self-service Delete Account (see
-- services/vaultAccountLifecycle.js's deleteAccountService). tblDeletedClients
-- (008) already keeps a JSONB snapshot for the admin "Deleted" list/detail
-- view; these three additionally hold the actual moved rows -- same columns
-- as their live counterparts -- so the client, vault, and account tables, and
-- vault key tables are never silently lost, only relocated. No FK back to
-- tblClient (that row is gone by the time these are written); wrClientId is
-- kept as a plain historical value, same convention as
-- tblDeletedClients.wrOriginalClientId.

CREATE TABLE IF NOT EXISTS public."tblDeletedClientActivityLogs" (
    "wrId"              integer NOT NULL,
    "wrActivityType"    integer NOT NULL,
    "wrRefID"           character varying(200),
    "wrIpAddress"       character varying(255) NOT NULL,
    "wrCreatedDate"     timestamp with time zone,
    "wrClientId"        integer NOT NULL,
    "wrDeviceInfo"      text,
    "wrLatitude"        double precision,
    "wrLongitude"       double precision,
    "wrDeletedClientId" integer NOT NULL REFERENCES "tblDeletedClients"("wrId"),
    "wrArchivedAt"      timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("wrId")
);
CREATE INDEX IF NOT EXISTS "idxDeletedClientActivityLogsDeletedClientId" ON public."tblDeletedClientActivityLogs" ("wrDeletedClientId");
CREATE INDEX IF NOT EXISTS "idxDeletedClientActivityLogsClientId" ON public."tblDeletedClientActivityLogs" ("wrClientId");

CREATE TABLE IF NOT EXISTS public."tblDeletedClientVaultEntries" (
    "wrEntryId"         uuid NOT NULL,
    "wrClientId"        integer NOT NULL,
    "wrEntryType"       integer NOT NULL,
    "wrIsDeleted"       boolean DEFAULT false,
    "wrCreatedAt"       timestamp with time zone,
    "wrUpdatedAt"       timestamp with time zone,
    "wrDeletedClientId" integer NOT NULL REFERENCES "tblDeletedClients"("wrId"),
    "wrArchivedAt"      timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("wrEntryId")
);
CREATE INDEX IF NOT EXISTS "idxDeletedClientVaultEntriesDeletedClientId" ON public."tblDeletedClientVaultEntries" ("wrDeletedClientId");
CREATE INDEX IF NOT EXISTS "idxDeletedClientVaultEntriesClientId" ON public."tblDeletedClientVaultEntries" ("wrClientId");

CREATE TABLE IF NOT EXISTS public."tblDeletedClientVaultKeys" (
    "wrKeyId"           integer NOT NULL,
    "wrClientId"        integer NOT NULL,
    "wrWrappedKey"      text NOT NULL,
    "wrKdfSalt"         character varying(200) NOT NULL,
    "wrKeyVersion"      integer,
    "wrIsActive"        boolean,
    "wrRecoveredAt"     timestamp with time zone,
    "wrRecoveredCount"  integer,
    "wrCreatedAt"       timestamp with time zone,
    "wrUpdatedAt"       timestamp with time zone,
    "wrDeletedClientId" integer NOT NULL REFERENCES "tblDeletedClients"("wrId"),
    "wrArchivedAt"      timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("wrKeyId")
);
CREATE INDEX IF NOT EXISTS "idxDeletedClientVaultKeysDeletedClientId" ON public."tblDeletedClientVaultKeys" ("wrDeletedClientId");
CREATE INDEX IF NOT EXISTS "idxDeletedClientVaultKeysClientId" ON public."tblDeletedClientVaultKeys" ("wrClientId");

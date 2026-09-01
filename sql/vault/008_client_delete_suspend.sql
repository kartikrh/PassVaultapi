-- Client self-service "Suspend Account" (pauses the account; logging back in
-- lifts it automatically -- see services/vaultAuth.js's reactivateIfSuspended)
-- and "Delete Account" (archives the client's row + vault-entry ledger +
-- activity log into tblDeletedClients, then hard-deletes the live rows and
-- both Google Drive vault files -- see deleteAccountService).
--
-- wrIsSelfSuspended/wrSelfSuspendedAt are DELIBERATELY separate from the
-- existing wrIsActive (a permanent, staff-only kill switch checked in
-- loginService/authorizeClient -- see repository/TableClientAdmin.js's
-- admin Clients screen): a self-suspended account must still be ALLOWED to
-- log back in, since that's what lifts the suspension, whereas
-- wrIsActive=false rejects login outright with no way back except a staff
-- action.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/008_client_delete_suspend.sql

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "wrIsSelfSuspended" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "wrSelfSuspendedAt" timestamp with time zone;

-- Snapshot columns are JSONB rather than exact-schema mirror tables --
-- this is a write-once, rarely-read audit/compliance record, not
-- operational data, so it doesn't need to track tblClient/
-- tblClientVaultEntries/tblActivityLogs's schemas forever. Never includes
-- wrPasswordHash or wrDriveRefreshToken -- no reason to retain live
-- credentials for a deleted account (see deleteAccountService, which builds
-- this snapshot explicitly field-by-field, not via SELECT *).
CREATE TABLE IF NOT EXISTS public."tblDeletedClients" (
    "wrId" serial PRIMARY KEY,
    "wrOriginalClientId" integer NOT NULL,
    "wrEmail" character varying(200) NOT NULL,
    "wrName" character varying(200),
    "wrUsername" character varying(50),
    "wrReason" text,
    "wrClientSnapshot" jsonb NOT NULL,
    "wrVaultEntriesSnapshot" jsonb,
    "wrActivityLogsSnapshot" jsonb,
    "wrDeletedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idxDeletedClientsOriginalClientId" ON public."tblDeletedClients" ("wrOriginalClientId");

COMMIT;

-- The client now sends an account/note/group's plaintext title alongside
-- its opaque entryId on create/update/delete (PUT /vault/data) and on
-- password reveal (POST /vault/auth/2fa/verify), so the Recent Activity
-- list/export can show which account/note a row was about even after it's
-- renamed or deleted -- entryId alone can't be resolved once that happens,
-- since the vault blob itself stays end-to-end encrypted and the server
-- never decrypts it. Deliberately just the title, nothing else (username/
-- password/notes body stay encrypted, never touch the server in the clear).
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/012_activity_log_entry_name.sql

BEGIN;

ALTER TABLE public."tblActivityLogs"
    ADD COLUMN IF NOT EXISTS "wrEntryName" character varying(200);

COMMIT;

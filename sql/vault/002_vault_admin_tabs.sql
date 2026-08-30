-- Vault feature: Phase 03 (Admin panel) tab/menu wiring.
-- Registers "Clients" and "History" under the existing "Administration" parent
-- tab (tblTabId 28, same parent as Roles/Users), following the exact shape the
-- app's own "Tabs" admin screen would produce (see repository/TableTabs.js).
--
-- wrParentId stores the PARENT tab's id run through this codebase's generic id
-- obfuscation table (tblEncryptedData): encrypt(28::text) with the app's
-- ENCRYPTION_KEY, already resolved below to 'cdf1845e2c5412c4b7163d3cb1fcbc9f'
-- (verified against this DB's tblEncryptedData -- Roles/Users use the same value).
--
-- Run manually, once, against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/002_vault_admin_tabs.sql
--
-- After running: log in as a non-super-admin staff role and grant view/edit
-- permission for "Clients" and "History" on the Roles screen -- brand-new tabs
-- start with zero permission rows, so only WrIsSuperAdmin users can see them
-- until a role is explicitly granted access.

BEGIN;

INSERT INTO public."tblTabs" (
  "wrTabName", "WrDisplayName", "wrDisplayType", "wrWebPage", "wrParentId",
  "wrIsActive", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrIsView",
  "wrAddWebpage", "wrIsMenu", "wrDisplayOrder"
)
SELECT 'Clients', 'Clients', 1, '/clients', 'cdf1845e2c5412c4b7163d3cb1fcbc9f',
       true, false, true, false, true,
       '/clientDetail', false,
       (SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 FROM "tblTabs" WHERE "wrParentId" = 'cdf1845e2c5412c4b7163d3cb1fcbc9f' AND "wrIsDeleted" = false)
WHERE NOT EXISTS (
  SELECT 1 FROM "tblTabs" WHERE "wrTabName" = 'Clients' AND "wrParentId" = 'cdf1845e2c5412c4b7163d3cb1fcbc9f' AND "wrIsDeleted" = false
);

INSERT INTO public."tblTabs" (
  "wrTabName", "WrDisplayName", "wrDisplayType", "wrWebPage", "wrParentId",
  "wrIsActive", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrIsView",
  "wrAddWebpage", "wrIsMenu", "wrDisplayOrder"
)
SELECT 'History', 'History & Audit Log', 1, '/history', 'cdf1845e2c5412c4b7163d3cb1fcbc9f',
       true, false, false, false, true,
       NULL, false,
       (SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 FROM "tblTabs" WHERE "wrParentId" = 'cdf1845e2c5412c4b7163d3cb1fcbc9f' AND "wrIsDeleted" = false)
WHERE NOT EXISTS (
  SELECT 1 FROM "tblTabs" WHERE "wrTabName" = 'History' AND "wrParentId" = 'cdf1845e2c5412c4b7163d3cb1fcbc9f' AND "wrIsDeleted" = false
);

COMMIT;

-- Note: this reuses the pre-generated tblEncryptedData id pool (wrKey -> encrypt(wrKey::text))
-- that already covers ids far beyond the current max tblTabId in this database, so no new
-- tblEncryptedData row needs to be inserted for the new tab ids themselves.

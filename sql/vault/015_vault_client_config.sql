-- Moves 4 vault client env vars into tblConfigs so they're editable at
-- runtime (via the admin Config screen or the /config API) without a
-- redeploy:
--   VAULT_MASTER_KEY               -> configConstants.VAULT_MASTER_KEY               ('VAULTMASTERKEY')
--   VAULT_CLIENT_SECRET_KEY_TOKEN  -> configConstants.VAULT_CLIENT_SECRET_KEY_TOKEN  ('VAULTCLIENTSECRETKEYTOKEN')
--   VAULT_CLIENT_TOKEN_EXPIRY_TIME -> configConstants.VAULT_CLIENT_TOKEN_EXPIRY_TIME ('VAULTCLIENTTOKENEXPIRYTIME')
--   VAULT_CLIENT_APP_URL           -> configConstants.VAULT_CLIENT_APP_URL           ('VAULTCLIENTAPPURL')
--
-- IMPORTANT: replace the four placeholder values below with the exact
-- values currently set in this environment's .env before running this --
-- VAULT_CLIENT_SECRET_KEY_TOKEN in particular signs every live client
-- session JWT; changing its value invalidates all currently-issued vault
-- client tokens (same as rotating the old env var would have). Only remove
-- these four vars from .env / docker-compose.yml after confirming the app
-- reads them correctly from tblConfigs.
--
-- CAUTION (same as sql/vault/014_encryption_key_config.sql): "wrIsForAdmin"
-- is metadata only -- nothing in services/config.js filters the admin
-- Config list/CRUD endpoints by it, so these values (including the JWT
-- signing secret and the vault master key) will be visible in plaintext to
-- any staff account that can load the Config screen.
--
-- Run manually, once, against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/015_vault_client_config.sql

BEGIN;

INSERT INTO public."tblConfigs" (
  "wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin",
  "wrCreatedDate", "wrIsDeleted"
)
SELECT * FROM (VALUES
  ('VAULTMASTERKEY', '<32_CHARACTER_VAULT_MASTER_KEY>', 'AES-256-GCM key that wraps every escrowed vault key (utilities/vaultCrypto.js). Sensitive -- do not expose in the admin Config screen. Must be exactly 32 characters.', true, true),
  ('VAULTCLIENTSECRETKEYTOKEN', '<VAULT_CLIENT_JWT_SECRET>', 'Signs/verifies vault client session + purpose JWTs (services/vaultAuth.js, controller/middleware/vaultAuth.js). Sensitive -- do not expose in the admin Config screen.', true, true),
  ('VAULTCLIENTTOKENEXPIRYTIME', '7d', 'Vault client session JWT expiry (e.g. 7d, 4h).', true, false),
  ('VAULTCLIENTAPPURL', 'http://localhost:3001', 'Base URL of the client-facing app (passvault-client), used to build verification/reset email links.', true, false)
) AS v("wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin")
WHERE NOT EXISTS (
  SELECT 1 FROM "tblConfigs" WHERE "wrKey" = v."wrKey" AND "wrIsDeleted" = false
);

COMMIT;

-- Note: no new tblEncryptedData row is needed for these configs' ids -- see
-- the comment in sql/vault/002_vault_admin_tabs.sql on the pre-generated id
-- pool.

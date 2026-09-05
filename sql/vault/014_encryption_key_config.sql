-- Moves the AES-256 key used by utilities/index.js encrypt()/decrypt()
-- (whitelabel Google/reCAPTCHA secrets, TOTP secrets) out of process.env
-- (ENCRYPTION_KEY) and into tblConfigs, under the key name
-- configConstants.ENCRYPTION_KEY = 'APPENCRYPTIONKEY'.
--
-- IMPORTANT: replace '<32_CHARACTER_ENCRYPTION_KEY>' below with the exact
-- value currently set as ENCRYPTION_KEY in this environment's .env before
-- running this -- any data already encrypted with that key (whitelabel
-- secrets, TOTP secrets) can only be decrypted with the same value. Only
-- remove ENCRYPTION_KEY from .env / docker-compose.yml after confirming the
-- app reads and decrypts correctly from tblConfigs.
--
-- CAUTION: "wrIsForAdmin" is metadata only -- nothing in services/config.js
-- filters the admin Config list/CRUD endpoints by it, so this key's plaintext
-- value will be visible to any staff account that can load the Config screen
-- (allCongifService returns every row's "value" unfiltered). If that's not
-- acceptable, add real filtering in services/config.js before relying on this.
--
-- Run manually, once, against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/014_encryption_key_config.sql

BEGIN;

INSERT INTO public."tblConfigs" (
  "wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin",
  "wrCreatedDate", "wrIsDeleted"
)
SELECT 'APPENCRYPTIONKEY', '<32_CHARACTER_ENCRYPTION_KEY>',
       'AES-256 key for whitelabel/TOTP secret encryption (utilities/index.js encrypt/decrypt). Sensitive -- do not expose in the admin Config screen.',
       true, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM "tblConfigs" WHERE "wrKey" = 'APPENCRYPTIONKEY' AND "wrIsDeleted" = false
);

COMMIT;

-- Note: no new tblEncryptedData row is needed for this config's id -- see the
-- comment in sql/vault/002_vault_admin_tabs.sql on the pre-generated id pool.

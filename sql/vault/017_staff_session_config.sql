-- Moves 4 more env vars into tblConfigs so they're editable at runtime
-- without a redeploy:
--   SECRET_KEY_TOKEN      -> configConstants.SECRET_KEY_TOKEN      ('SECRETKEYTOKEN')
--   TOKEN_EXPIRY_TIME     -> configConstants.TOKEN_EXPIRY_TIME     ('TOKENEXPIRYTIME')
--   SOCKET_ADMIN_USERNAME -> configConstants.SOCKET_ADMIN_USERNAME ('SOCKETADMINUSERNAME')
--   SOCKET_ADMIN_PASSWORD -> configConstants.SOCKET_ADMIN_PASSWORD ('SOCKETADMINPASSWORD')
--
-- IMPORTANT: replace the four placeholder values below with the exact
-- values currently set in this environment's .env before running this --
-- SECRET_KEY_TOKEN in particular signs every live staff/panel session JWT;
-- changing its value invalidates all currently-issued staff tokens (same as
-- rotating the old env var would have). Only remove these four vars from
-- .env / docker-compose.yml after confirming the app reads them correctly
-- from tblConfigs.
--
-- The Socket.IO admin UI's instrument() call was moved from synchronous
-- boot (app.js) into the post-data-load setImmediate block specifically so
-- it can read these two SOCKET_ADMIN_* values from tblConfigs -- see the
-- comment there.
--
-- CAUTION (same as sql/vault/014/015): "wrIsForAdmin" is metadata only --
-- nothing in services/config.js filters the admin Config list/CRUD
-- endpoints by it beyond the new reveal-password gate, so these values
-- (including the JWT signing secret and the socket admin password) will be
-- visible to any staff account that can load the Config screen and knows
-- LOADDATAPASSWORD.
--
-- Run manually, once, against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/017_staff_session_config.sql

BEGIN;

INSERT INTO public."tblConfigs" (
  "wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin",
  "wrCreatedDate", "wrIsDeleted"
)
SELECT v."wrKey", v."wrValue", v."wrDesc", v."wrIsActive", v."wrIsForAdmin", now(), false
FROM (VALUES
  ('SECRETKEYTOKEN', '<STAFF_JWT_SECRET>', 'Signs/verifies staff/panel session + purpose JWTs (utilities/tokenization.js, socketIo.js, services/middleware.js, services/user.js). Sensitive -- do not expose in the admin Config screen.', true, true),
  ('TOKENEXPIRYTIME', '4h', 'Staff/panel session JWT expiry (e.g. 4h, 30m, 1d).', true, false),
  ('SOCKETADMINUSERNAME', '<SOCKET_ADMIN_USERNAME>', 'Basic-auth username for the Socket.IO admin UI (app.js instrument()).', true, true),
  ('SOCKETADMINPASSWORD', '<SOCKET_ADMIN_PASSWORD>', 'Basic-auth password for the Socket.IO admin UI, hashed at use via bcrypt (app.js instrument()). Sensitive -- do not expose in the admin Config screen.', true, true)
) AS v("wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin")
WHERE NOT EXISTS (
  SELECT 1 FROM "tblConfigs" WHERE "wrKey" = v."wrKey" AND "wrIsDeleted" = false
);

COMMIT;

-- Note: no new tblEncryptedData row is needed for these configs' ids -- see
-- the comment in sql/vault/002_vault_admin_tabs.sql on the pre-generated id
-- pool.

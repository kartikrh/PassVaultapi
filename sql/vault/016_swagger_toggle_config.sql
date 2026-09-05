-- Adds a runtime on/off switch for the /documentation (swagger) routes --
-- see the onRequest hook in app.js and configConstants.IS_ENABLE_SWAGGER.
-- Defaults to 'true' to preserve today's behavior (swagger always served);
-- flip "wrValue" to 'false' here, or via the admin Config screen, to hide it.
--
-- Run manually, once, against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/016_swagger_toggle_config.sql

BEGIN;

INSERT INTO public."tblConfigs" (
  "wrKey", "wrValue", "wrDesc", "wrIsActive", "wrIsForAdmin",
  "wrCreatedDate", "wrIsDeleted"
)
SELECT 'ISENABLESWAGGER', 'true',
       'Shows/hides the /documentation swagger UI + JSON routes (app.js onRequest hook). Set to false to hide swagger entirely.',
       true, false, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM "tblConfigs" WHERE "wrKey" = 'ISENABLESWAGGER' AND "wrIsDeleted" = false
);

COMMIT;

-- Note: no new tblEncryptedData row is needed for this config's id -- see
-- the comment in sql/vault/002_vault_admin_tabs.sql on the pre-generated id
-- pool.

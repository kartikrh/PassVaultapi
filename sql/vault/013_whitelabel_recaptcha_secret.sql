-- White Label: server-side verification of the login page's reCAPTCHA needs
-- Google's *secret* key -- wrRecatchKey is only the public site key already
-- shipped to the browser widget (see passvault-client's LoginForm.js and
-- services/whitelabel.js's PUBLIC_WHITELABEL_FIELDS). This adds that secret
-- alongside it, encrypted at rest the same way wrGoogle_Secret is (see
-- services/whitelabel.js's createWhitelabelService/whitelabelByIdService),
-- and consumed server-side only, by services/vaultAuth.js's
-- requireRecaptcha during password login.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/013_whitelabel_recaptcha_secret.sql

BEGIN;

ALTER TABLE public."tblWhitelabel"
    ADD COLUMN IF NOT EXISTS "wrRecatchSecret" character varying;

COMMIT;

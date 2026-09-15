-- Adds mobile-specific Google Login / reCAPTCHA settings to tblWhitelabel,
-- separate from the existing web columns, so an operator can configure a
-- different Google OAuth client / reCAPTCHA site+secret pair for the mobile
-- app than the one used by the web client.
ALTER TABLE "tblWhitelabel"
  ADD COLUMN IF NOT EXISTS "wrIsGoogleLoginMobile" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "wrGoogleKeyMobile" character varying,
  ADD COLUMN IF NOT EXISTS "wrGoogleSecretMobile" text,
  ADD COLUMN IF NOT EXISTS "wrIsRecatchaEnableMobile" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "wrRecatchKeyMobile" character varying,
  ADD COLUMN IF NOT EXISTS "wrRecatchSecretMobile" character varying;

-- Backfill existing rows from the web columns so mobile keeps working with
-- today's Google client / reCAPTCHA config until an operator sets a
-- dedicated mobile value in the panel.
UPDATE "tblWhitelabel" SET
  "wrIsGoogleLoginMobile" = "wrIsGoogleLogin",
  "wrGoogleKeyMobile" = "wrGoogle_Key",
  "wrGoogleSecretMobile" = "wrGoogle_Secret",
  "wrIsRecatchaEnableMobile" = "wrIsRecatchaEnable",
  "wrRecatchKeyMobile" = "wrRecatchKey",
  "wrRecatchSecretMobile" = "wrRecatchSecret";

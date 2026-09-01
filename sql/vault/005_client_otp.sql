-- Vault Client Google Authenticator (TOTP) 2FA: same three columns as
-- sql/008_user_otp.sql, added to "tblClient" instead. Unlike the panel,
-- every client is opted into 2FA by default (WrOTPEnable default true,
-- WeOTPType default 1 = OTPType.GOOGLE_AUTHENTICATOR, see
-- utilities/otpConstants.js) -- a blank WrUuid is what tells
-- services/vaultAuth.js the client still needs to scan their QR code.
-- WrUuid holds the TOTP secret app-layer encrypted (utilities/index.js
-- encrypt/decrypt), same convention as tblClient's own wrDriveRefreshToken.
-- Run manually against the target Postgres database:
--   psql "$DATABASE_URL" -f sql/vault/005_client_otp.sql
--
-- Note: boolean (not Postgres's bit-string "bit" type) to match the rest of
-- tblClient's true/false columns (wrIsActive, wrIsEmailVerified, ...).

BEGIN;

ALTER TABLE public."tblClient"
    ADD COLUMN IF NOT EXISTS "WrOTPEnable" boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS "WeOTPType" int DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "WrUuid" varchar(1000);

COMMIT;

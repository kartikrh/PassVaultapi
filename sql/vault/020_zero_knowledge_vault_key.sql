-- Zero-knowledge vault key: the server stops holding (an escrowed copy of)
-- each client's vault key.
--
-- New model: the client derives the key from its vault password + wrKdfSalt
-- on every unlock and checks it locally against wrKeyCheck -- a tiny
-- AES-GCM ciphertext of a fixed marker string, encrypted with the vault key.
-- The server can't decrypt wrKeyCheck and can't recompute the key.
--
-- Existing clients keep their wrWrappedKey until their next unlock: POST
-- /vault/key/migrate confirms the password-derived key matches the escrowed
-- one, stores wrKeyCheck and sets wrWrappedKey to NULL. Rows where
-- wrWrappedKey IS NOT NULL are clients that haven't migrated yet.
ALTER TABLE "tblClientVaultKey"
  ADD COLUMN IF NOT EXISTS "wrKeyCheck" text,
  ALTER COLUMN "wrWrappedKey" DROP NOT NULL;

ALTER TABLE "tblDeletedClientVaultKeys"
  ADD COLUMN IF NOT EXISTS "wrKeyCheck" text,
  ALTER COLUMN "wrWrappedKey" DROP NOT NULL;

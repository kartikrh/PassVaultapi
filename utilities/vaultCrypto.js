// Wraps/unwraps a client's escrowed vault key with the server master key.
//
// This is the single most sensitive secret in the vault feature (see the
// technical spec's "Open items" section): VAULT_MASTER_KEY here is sourced
// from tblConfigs (configConstants.VAULT_MASTER_KEY) as an interim/dev
// measure. Before production launch it must move to real KMS/HSM custody
// (AWS KMS / GCP KMS) with this module swapped to call out to it instead of
// holding the key material in process memory -- storing it in the same
// database as the ciphertext it protects is weaker than an env var was.
const crypto = require("crypto");
const configConstants = require("./configConstants");
const { getConfigValue } = require("./index");

const ALGORITHM = "aes-256-gcm";

const getMasterKey = () => {
  const raw = getConfigValue(configConstants.VAULT_MASTER_KEY);
  if (!raw) {
    throw new Error("VAULT_MASTER_KEY config is not configured");
  }
  const key = Buffer.from(raw, "utf-8");
  if (key.length !== 32) {
    throw new Error("VAULT_MASTER_KEY must be exactly 32 bytes long");
  }
  return key;
};

// vaultKeyMaterial: the client-generated vault key, as sent by the client (utf-8/base64 string).
// Returns an opaque "iv:authTag:ciphertext" hex string safe to store in tblClientVaultKey.wrWrappedKey.
const wrapVaultKey = (vaultKeyMaterial) => {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(vaultKeyMaterial, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
};

// wrapped: the "iv:authTag:ciphertext" hex string from tblClientVaultKey.wrWrappedKey.
// Returns the original vault key material.
const unwrapVaultKey = (wrapped) => {
  const key = getMasterKey();
  const parts = String(wrapped).split(":");
  if (parts.length !== 3) {
    throw new Error("Malformed wrapped vault key");
  }
  const [ivHex, authTagHex, cipherTextHex] = parts;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherTextHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf-8");
};

module.exports = { wrapVaultKey, unwrapVaultKey };

const crypto = require("crypto");
const {
  findActiveVaultKeyByClientIdQuery,
  insertVaultKeyQuery,
  deactivateVaultKeyQuery,
  completeVaultKeyMigrationQuery,
} = require("../repository/TableClientVaultKey");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const { findClientByIdQuery } = require("../repository/TableClient");
const { unwrapVaultKey } = require("../utilities/vaultCrypto");
const { VaultActivityCodes } = require("../utilities/vaultConstants");
const { verifyOwnTotpCode } = require("./vaultAuth");

// Zero-knowledge model (sql/vault/020_zero_knowledge_vault_key.sql): the
// server never receives or stores the vault key. Clients derive it from the
// vault password + kdfSalt (PBKDF2) on every unlock and verify it locally
// against keyCheck -- an AES-GCM ciphertext of a fixed marker, encrypted with
// the vault key -- so a wrong password is caught before decrypting the vault.
// Forgetting the vault password therefore means the vault can't be opened;
// there is deliberately no server-side recovery.

const MAX_KEY_CHECK_LENGTH = 512;
const MAX_KDF_SALT_LENGTH = 200; // tblClientVaultKey.wrKdfSalt varchar(200)

const requireKeyMaterial = (body) => {
  const { kdfSalt, keyCheck } = body || {};
  if (typeof kdfSalt !== "string" || !kdfSalt || kdfSalt.length > MAX_KDF_SALT_LENGTH) {
    throw new Error("kdfSalt is required");
  }
  if (typeof keyCheck !== "string" || !keyCheck || keyCheck.length > MAX_KEY_CHECK_LENGTH) {
    throw new Error("keyCheck is required");
  }
  return { kdfSalt, keyCheck };
};

const logKeyActivity = (activityType, keyId, request, fastify) =>
  insertClientActivityLogQuery(
    {
      activityType,
      refId: String(keyId),
      ipAddress: request.ip,
      clientId: request.clientTokenInfo.WrClientId,
    },
    fastify
  );

// POST /vault/key/params -- everything a client needs to derive + verify its
// key, none of which lets the server (or a stolen session) decrypt anything.
// needsMigration: this client still has a legacy escrowed key and must
// confirm its vault password via /migrate on this unlock.
const getKeyParamsService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const activeKey = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  if (!activeKey) {
    return { exists: false };
  }
  return {
    exists: true,
    kdfSalt: activeKey.kdfSalt,
    keyCheck: activeKey.keyCheck || null,
    keyVersion: activeKey.keyVersion,
    needsMigration: !activeKey.keyCheck && !!activeKey.wrappedKey,
  };
};

// POST /vault/key/setup -- first-time setup. Only the salt and key check are
// sent; the key itself never leaves the device.
const setupKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { kdfSalt, keyCheck } = requireKeyMaterial(request.body);

  const existing = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  if (existing) {
    throw new Error("A vault key is already set up for this account");
  }

  const key = await insertVaultKeyQuery({ clientId: WrClientId, keyCheck, kdfSalt, keyVersion: 1 }, fastify);
  await logKeyActivity(VaultActivityCodes.VAULT_KEY_SET_UP, key.keyId, request, fastify);

  return { keyVersion: key.keyVersion };
};

// POST /vault/key/migrate -- one-time move off the legacy escrow. The client
// derives the key from the vault password it just typed (same password + salt
// as at setup, so the same key the server escrowed) and sends it once more
// with its new keyCheck. Matching the escrowed copy proves the password is
// right; the escrowed copy is then deleted, after which the server can no
// longer produce the key.
const migrateKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { vaultKey } = request.body || {};
  const { keyCheck } = requireKeyMaterial({ kdfSalt: "-", keyCheck: request.body?.keyCheck });
  if (typeof vaultKey !== "string" || !vaultKey) {
    throw new Error("vaultKey is required");
  }

  const activeKey = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  if (!activeKey || !activeKey.wrappedKey) {
    throw new Error("This vault key has already been migrated");
  }

  const escrowed = Buffer.from(unwrapVaultKey(activeKey.wrappedKey), "utf8");
  const submitted = Buffer.from(vaultKey, "utf8");
  const matches = escrowed.length === submitted.length && crypto.timingSafeEqual(escrowed, submitted);
  if (!matches) {
    throw new Error("Incorrect vault password");
  }

  await completeVaultKeyMigrationQuery(activeKey.keyId, keyCheck, fastify);
  await logKeyActivity(VaultActivityCodes.VAULT_KEY_MIGRATED, activeKey.keyId, request, fastify);

  return { keyVersion: activeKey.keyVersion };
};

// POST /vault/key/recover -- removed with the escrow. Kept as a route only so
// outdated app versions get an actionable message instead of a 404.
const recoverKeyService = async () => {
  throw new Error("This app version is out of date -- please update PassVault to unlock your vault");
};

// POST /vault/key/rotate -- vault password change. The client re-encrypts its
// Drive vault with the new key first, then registers the new salt + key
// check here. Requires a fresh 2FA code: the server can't verify the old
// vault password, and a stolen session replacing the key check would lock
// the real owner out of their vault.
const rotateKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { kdfSalt, keyCheck } = requireKeyMaterial(request.body);

  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client || !client.isActive) {
    throw new Error("Account not found");
  }
  await verifyOwnTotpCode(client, request.body?.code, fastify);

  const existing = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  const nextVersion = (existing?.keyVersion || 0) + 1;

  // One transaction: if the insert fails, the old key stays active instead
  // of leaving the client with no usable key check (and a locked vault).
  const key = await fastify.db.transaction(async (transaction) => {
    if (existing) {
      await deactivateVaultKeyQuery(existing.keyId, fastify, transaction);
    }
    return insertVaultKeyQuery(
      { clientId: WrClientId, keyCheck, kdfSalt, keyVersion: nextVersion },
      fastify,
      transaction
    );
  });

  await logKeyActivity(VaultActivityCodes.VAULT_KEY_ROTATED, key.keyId, request, fastify);

  return { keyVersion: key.keyVersion };
};

module.exports = { getKeyParamsService, setupKeyService, migrateKeyService, recoverKeyService, rotateKeyService };

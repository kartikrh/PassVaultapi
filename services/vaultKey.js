const {
  findActiveVaultKeyByClientIdQuery,
  insertVaultKeyQuery,
  deactivateVaultKeyQuery,
  markVaultKeyRecoveredQuery,
} = require("../repository/TableClientVaultKey");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const { wrapVaultKey, unwrapVaultKey } = require("../utilities/vaultCrypto");
const { VaultActivityCodes } = require("../utilities/vaultConstants");

// First-time escrow (POST /vault/key/setup) -- the client generates its vault key
// and KDF salt client-side and sends them once, over TLS, for the server to wrap
// with the master key and store. The plaintext key is never persisted unwrapped.
const setupKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { vaultKey, kdfSalt } = request.body || {};
  if (!vaultKey || !kdfSalt) {
    throw new Error("vaultKey and kdfSalt are required");
  }

  const existing = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  if (existing) {
    throw new Error("A vault key is already escrowed for this client -- use /vault/key/rotate instead");
  }

  const wrappedKey = wrapVaultKey(vaultKey);
  const key = await insertVaultKeyQuery(
    { clientId: WrClientId, wrappedKey, kdfSalt, keyVersion: 1 },
    fastify
  );

  return { keyVersion: key.keyVersion };
};

// Re-auth via Google already happened via authorizeClient (POST /vault/key/recover) --
// returns the escrowed key so the client can decrypt its existing Drive vault.
const recoverKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;

  const activeKey = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  if (!activeKey) {
    throw new Error("No escrowed vault key found for this client");
  }

  const vaultKey = unwrapVaultKey(activeKey.wrappedKey);
  await markVaultKeyRecoveredQuery(activeKey.keyId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.VAULT_KEY_RECOVERED,
      refId: String(activeKey.keyId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  return { vaultKey, kdfSalt: activeKey.kdfSalt, keyVersion: activeKey.keyVersion };
};

// Client changes its key (POST /vault/key/rotate) -- the client re-encrypts its
// Drive vault with a freshly generated key first, then re-escrows the new one here.
const rotateKeyService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { vaultKey, kdfSalt } = request.body || {};
  if (!vaultKey || !kdfSalt) {
    throw new Error("vaultKey and kdfSalt are required");
  }

  const existing = await findActiveVaultKeyByClientIdQuery(WrClientId, fastify);
  const nextVersion = (existing?.keyVersion || 0) + 1;

  if (existing) {
    await deactivateVaultKeyQuery(existing.keyId, fastify);
  }

  const wrappedKey = wrapVaultKey(vaultKey);
  const key = await insertVaultKeyQuery(
    { clientId: WrClientId, wrappedKey, kdfSalt, keyVersion: nextVersion },
    fastify
  );

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.VAULT_KEY_ROTATED,
      refId: String(key.keyId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  return { keyVersion: key.keyVersion };
};

module.exports = { setupKeyService, recoverKeyService, rotateKeyService };

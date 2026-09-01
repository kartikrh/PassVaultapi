const { errorLogger } = require("../utilities/logger");

const KEY_SELECT_COLUMNS = `
  "wrKeyId" as "keyId",
  "wrClientId" as "clientId",
  "wrWrappedKey" as "wrappedKey",
  "wrKdfSalt" as "kdfSalt",
  "wrKeyVersion" as "keyVersion",
  "wrIsActive" as "isActive",
  "wrRecoveredAt" as "recoveredAt",
  "wrRecoveredCount" as "recoveredCount",
  "wrCreatedAt" as "createdAt",
  "wrUpdatedAt" as "updatedAt"
`;

const findActiveVaultKeyByClientIdQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${KEY_SELECT_COLUMNS} FROM "tblClientVaultKey" WHERE "wrClientId" = $1 AND "wrIsActive" = true`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/findActiveVaultKeyByClientIdQuery");
    throw new Error(err.message);
  }
};

const insertVaultKeyQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblClientVaultKey" (
        "wrClientId", "wrWrappedKey", "wrKdfSalt", "wrKeyVersion"
      ) VALUES ($1, $2, $3, $4)
      RETURNING ${KEY_SELECT_COLUMNS}`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [data.clientId, data.wrappedKey, data.kdfSalt, data.keyVersion || 1],
      }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/insertVaultKeyQuery");
    throw new Error(err.message);
  }
};

const deactivateVaultKeyQuery = async (keyId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClientVaultKey" SET "wrIsActive" = false, "wrUpdatedAt" = now() WHERE "wrKeyId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [keyId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/deactivateVaultKeyQuery");
    throw new Error(err.message);
  }
};

const markVaultKeyRecoveredQuery = async (keyId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClientVaultKey" SET
        "wrRecoveredAt" = now(),
        "wrRecoveredCount" = "wrRecoveredCount" + 1,
        "wrUpdatedAt" = now()
      WHERE "wrKeyId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [keyId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/markVaultKeyRecoveredQuery");
    throw new Error(err.message);
  }
};

// Delete Account only -- see services/vaultAccountLifecycle.js's
// deleteAccountService. Moves every row for this client into
// tblDeletedClientVaultKeys (sql/vault/009_deleted_client_archive_tables.sql)
// in one atomic statement, then removes them from the live table. Called
// before hardDeleteClientQuery (FK: tblClientVaultKey.wrClientId ->
// tblClient, no ON DELETE CASCADE).
//
// Note this table still carries the wrapped vault key -- wrapped with the
// single server-side VAULT_MASTER_KEY (utilities/vaultCrypto.js), not
// anything derived from the client, so it's decryptable by anyone with DB +
// that key regardless of which table the row sits in. Archiving it (rather
// than the old behavior of dropping it entirely) was an explicit request;
// tblDeletedClientVaultKeys should be given the same access restrictions as
// tblClientVaultKey itself, not treated as inert history.
const moveVaultKeysToArchiveByClientQuery = async (clientId, deletedClientId, fastify) => {
  try {
    return await fastify.db.query(
      `WITH moved AS (
        DELETE FROM "tblClientVaultKey" WHERE "wrClientId" = $1 RETURNING *
      )
      INSERT INTO "tblDeletedClientVaultKeys" (
        "wrKeyId", "wrClientId", "wrWrappedKey", "wrKdfSalt", "wrKeyVersion",
        "wrIsActive", "wrRecoveredAt", "wrRecoveredCount", "wrCreatedAt", "wrUpdatedAt", "wrDeletedClientId"
      )
      SELECT "wrKeyId", "wrClientId", "wrWrappedKey", "wrKdfSalt", "wrKeyVersion",
             "wrIsActive", "wrRecoveredAt", "wrRecoveredCount", "wrCreatedAt", "wrUpdatedAt", $2
      FROM moved`,
      { type: fastify.db.QueryTypes.INSERT, bind: [clientId, deletedClientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/moveVaultKeysToArchiveByClientQuery");
    throw new Error(err.message);
  }
};

module.exports = {
  findActiveVaultKeyByClientIdQuery,
  insertVaultKeyQuery,
  deactivateVaultKeyQuery,
  markVaultKeyRecoveredQuery,
  moveVaultKeysToArchiveByClientQuery,
};

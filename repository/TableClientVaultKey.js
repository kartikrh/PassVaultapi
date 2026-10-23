const { errorLogger } = require("../utilities/logger");

const KEY_SELECT_COLUMNS = `
  "wrKeyId" as "keyId",
  "wrClientId" as "clientId",
  "wrWrappedKey" as "wrappedKey",
  "wrKdfSalt" as "kdfSalt",
  "wrKeyCheck" as "keyCheck",
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

const insertVaultKeyQuery = async (data, fastify, transaction) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblClientVaultKey" (
        "wrClientId", "wrKeyCheck", "wrKdfSalt", "wrKeyVersion"
      ) VALUES ($1, $2, $3, $4)
      RETURNING ${KEY_SELECT_COLUMNS}`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [data.clientId, data.keyCheck, data.kdfSalt, data.keyVersion || 1],
        transaction,
      }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/insertVaultKeyQuery");
    throw new Error(err.message);
  }
};

const deactivateVaultKeyQuery = async (keyId, fastify, transaction) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClientVaultKey" SET "wrIsActive" = false, "wrUpdatedAt" = now() WHERE "wrKeyId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [keyId], transaction }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/deactivateVaultKeyQuery");
    throw new Error(err.message);
  }
};

// Legacy escrow -> zero-knowledge (POST /vault/key/migrate): store the
// client's key check and drop the server's wrapped copy of the key for good.
const completeVaultKeyMigrationQuery = async (keyId, keyCheck, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClientVaultKey" SET
        "wrKeyCheck" = $2,
        "wrWrappedKey" = NULL,
        "wrUpdatedAt" = now()
      WHERE "wrKeyId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [keyId, keyCheck] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultKey/completeVaultKeyMigrationQuery");
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
// Rows from clients that never migrated (sql/vault/020) still carry the
// legacy wrapped key -- wrapped with the server-side VAULT_MASTER_KEY, so
// decryptable by anyone with DB + that key regardless of which table the row
// sits in. Migrated rows only hold the key check, which the server can't use.
const moveVaultKeysToArchiveByClientQuery = async (clientId, deletedClientId, fastify) => {
  try {
    return await fastify.db.query(
      `WITH moved AS (
        DELETE FROM "tblClientVaultKey" WHERE "wrClientId" = $1 RETURNING *
      )
      INSERT INTO "tblDeletedClientVaultKeys" (
        "wrKeyId", "wrClientId", "wrWrappedKey", "wrKeyCheck", "wrKdfSalt", "wrKeyVersion",
        "wrIsActive", "wrRecoveredAt", "wrRecoveredCount", "wrCreatedAt", "wrUpdatedAt", "wrDeletedClientId"
      )
      SELECT "wrKeyId", "wrClientId", "wrWrappedKey", "wrKeyCheck", "wrKdfSalt", "wrKeyVersion",
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
  completeVaultKeyMigrationQuery,
  moveVaultKeysToArchiveByClientQuery,
};

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

module.exports = {
  findActiveVaultKeyByClientIdQuery,
  insertVaultKeyQuery,
  deactivateVaultKeyQuery,
  markVaultKeyRecoveredQuery,
};

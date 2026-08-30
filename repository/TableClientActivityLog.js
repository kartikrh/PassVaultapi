// Writes into the shared "tblActivityLogs" table (extended with wrClientId, see
// sql/vault/001_vault_feature_schema.sql) without touching repository/TableActivityLog.js,
// which backs the pre-existing staff-facing activity log feature.
const { errorLogger } = require("../utilities/logger");

const insertClientActivityLogQuery = async (data, fastify) => {
  try {
    await fastify.db.query(
      `INSERT INTO "tblActivityLogs" (
        "wrActivityType", "wrRefID", "wrIpAddress", "wrClientId", "wrCreatedDate"
      ) VALUES ($1, $2, $3, $4, now())`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [data.activityType, data.refId || null, data.ipAddress || null, data.clientId],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientActivityLog/insertClientActivityLogQuery");
    throw new Error(err.message);
  }
};

module.exports = { insertClientActivityLogQuery };

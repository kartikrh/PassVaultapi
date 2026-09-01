// Writes into the shared "tblActivityLogs" table (extended with wrClientId, see
// sql/vault/001_vault_feature_schema.sql) without touching repository/TableActivityLog.js,
// which backs the pre-existing staff-facing activity log feature.
const { errorLogger } = require("../utilities/logger");

// deviceInfo (optional): the JSON string from utilities/index.js's
// deviceInfo(request) -- IP/browser/OS/device parsed from the User-Agent
// header. latitude/longitude (optional): the browser's GPS coordinates,
// required client-side before a login/signup attempt can even be submitted
// (see passvault-client's useGeolocation/LocationRequiredModal). Both are
// passed on every login-related event (success, failure, lockout) as the
// login "fingerprint"; omitted (null) for activity types that aren't about
// a login itself.
const insertClientActivityLogQuery = async (data, fastify) => {
  try {
    await fastify.db.query(
      `INSERT INTO "tblActivityLogs" (
        "wrActivityType", "wrRefID", "wrIpAddress", "wrClientId", "wrDeviceInfo", "wrLatitude", "wrLongitude", "wrCreatedDate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.activityType,
          data.refId || null,
          data.ipAddress || null,
          data.clientId,
          data.deviceInfo || null,
          data.latitude ?? null,
          data.longitude ?? null,
        ],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientActivityLog/insertClientActivityLogQuery");
    throw new Error(err.message);
  }
};

module.exports = { insertClientActivityLogQuery };

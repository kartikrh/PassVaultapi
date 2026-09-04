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
// a login itself. entryName (optional): the vault entry's plaintext title,
// sent by the client alongside its opaque refId on account/note/group
// create/update/delete and password-reveal rows (see services/vaultData.js,
// verifyStepUpOtpService) -- the only piece of a vault entry the server
// ever sees in the clear, kept solely so Recent Activity can still show
// which entry a row was about after it's renamed or deleted.
const insertClientActivityLogQuery = async (data, fastify) => {
  try {
    await fastify.db.query(
      `INSERT INTO "tblActivityLogs" (
        "wrActivityType", "wrRefID", "wrIpAddress", "wrClientId", "wrDeviceInfo", "wrLatitude", "wrLongitude", "wrEntryName", "wrCreatedDate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
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
          data.entryName || null,
        ],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientActivityLog/insertClientActivityLogQuery");
    throw new Error(err.message);
  }
};

module.exports = { insertClientActivityLogQuery };

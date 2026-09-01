// Staff-facing (PassVaultpanel) "History & audit log" queries -- activity + IP +
// entry reference only, per the technical spec (section 4, "History & audit log").
// Deliberately a live, filtered, paginated DB query -- tblActivityLogs is an
// unbounded append-only table, unsuitable for the in-memory global-cache pattern
// most other CMS modules in this codebase use for their small config tables.
const { errorLogger } = require("../utilities/logger");

const listClientActivityLogsQuery = async (filters, fastify) => {
  try {
    const { clientId, activityType, refId, dateFrom, dateTo, limit } = filters || {};
    const conditions = [`a."wrClientId" is not null`];
    const bind = [];

    if (clientId) {
      bind.push(clientId);
      conditions.push(`a."wrClientId" = $${bind.length}`);
    }
    if (activityType) {
      bind.push(activityType);
      conditions.push(`a."wrActivityType" = $${bind.length}`);
    }
    if (refId) {
      bind.push(refId);
      conditions.push(`a."wrRefID" = $${bind.length}`);
    }
    if (dateFrom) {
      bind.push(dateFrom);
      conditions.push(`a."wrCreatedDate" >= $${bind.length}`);
    }
    if (dateTo) {
      bind.push(dateTo);
      conditions.push(`a."wrCreatedDate" <= $${bind.length}`);
    }

    bind.push(limit && limit > 0 ? limit : 200);

    const result = await fastify.db.query(
      `SELECT
        a."wrId" as "activityLogId",
        a."wrActivityType" as "activityType",
        a."wrRefID" as "refId",
        a."wrIpAddress" as "ipAddress",
        a."wrClientId" as "clientId",
        c."wrEmail" as "clientEmail",
        c."wrName" as "clientName",
        a."wrLatitude" as "latitude",
        a."wrLongitude" as "longitude",
        a."wrCreatedDate" as "createdDate"
       FROM "tblActivityLogs" a
       LEFT JOIN "tblClient" c ON c."wrClientId" = a."wrClientId"
       WHERE ${conditions.join(" AND ")}
       ORDER BY a."wrCreatedDate" DESC
       LIMIT $${bind.length}`,
      { type: fastify.db.QueryTypes.SELECT, bind }
    );
    return result;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientHistory/listClientActivityLogsQuery");
    throw new Error(err.message);
  }
};

// Delete Account only -- see services/vaultAccountLifecycle.js's
// deleteAccountService, called after listClientActivityLogsQuery has already
// produced the archive snapshot. Moves every row for this client into
// tblDeletedClientActivityLogs (sql/vault/009_deleted_client_archive_tables.sql)
// in one atomic statement (including the CLIENT_SELF_DELETED row the service
// inserts right before calling this), then removes them from the live table.
// Called before hardDeleteClientQuery (FK: tblActivityLogs.wrClientId ->
// tblClient, no ON DELETE CASCADE).
const moveActivityLogsToArchiveByClientQuery = async (clientId, deletedClientId, fastify) => {
  try {
    return await fastify.db.query(
      `WITH moved AS (
        DELETE FROM "tblActivityLogs" WHERE "wrClientId" = $1 RETURNING *
      )
      INSERT INTO "tblDeletedClientActivityLogs" (
        "wrId", "wrActivityType", "wrRefID", "wrIpAddress", "wrCreatedDate",
        "wrClientId", "wrDeviceInfo", "wrLatitude", "wrLongitude", "wrDeletedClientId"
      )
      SELECT "wrId", "wrActivityType", "wrRefID", "wrIpAddress", "wrCreatedDate",
             "wrClientId", "wrDeviceInfo", "wrLatitude", "wrLongitude", $2
      FROM moved`,
      { type: fastify.db.QueryTypes.INSERT, bind: [clientId, deletedClientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientHistory/moveActivityLogsToArchiveByClientQuery");
    throw new Error(err.message);
  }
};

module.exports = { listClientActivityLogsQuery, moveActivityLogsToArchiveByClientQuery };

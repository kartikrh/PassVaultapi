// Staff-facing (PassVaultpanel) "History & audit log" queries -- activity + IP +
// entry reference only, per the technical spec (section 4, "History & audit log").
// Deliberately a live, filtered, paginated DB query -- tblActivityLogs is an
// unbounded append-only table, unsuitable for the in-memory global-cache pattern
// most other CMS modules in this codebase use for their small config tables.
const { errorLogger } = require("../utilities/logger");

const listClientActivityLogsQuery = async (filters, fastify) => {
  try {
    const { clientId, activityType, dateFrom, dateTo, limit } = filters || {};
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

module.exports = { listClientActivityLogsQuery };

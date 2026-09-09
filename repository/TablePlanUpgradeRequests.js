// Client-submitted plan-upgrade requests (QR/bank transfer + a unique
// reference code), reviewed by an admin. Deliberately a live, filtered,
// paginated DB query for the admin list -- same reasoning as
// TableClientHistory.js's listClientActivityLogsQuery: an unbounded,
// steadily-growing table, unsuitable for the in-memory global-cache pattern
// tblPackages/tblPaymentMethods use.
const { errorLogger } = require("../utilities/logger");

const REQUEST_SELECT_COLUMNS = `
  r."wrId" as "id",
  r."wrClientId" as "clientId",
  c."wrName" as "clientName",
  c."wrEmail" as "clientEmail",
  r."wrCurrentPackageId" as "currentPackageId",
  cp."wrName" as "currentPackageName",
  r."wrRequestedPackageId" as "requestedPackageId",
  rp."wrName" as "requestedPackageName",
  r."wrPaymentMethodId" as "paymentMethodId",
  pm."wrLabel" as "paymentMethodLabel",
  r."wrAmount" as "amount",
  r."wrCurrency" as "currency",
  r."wrTransferCode" as "transferCode",
  r."wrStatus" as "status",
  r."wrRejectionReason" as "rejectionReason",
  r."wrReviewedBy" as "reviewedBy",
  r."wrReviewedByName" as "reviewedByName",
  r."wrReviewedAt" as "reviewedAt",
  r."wrCreatedAt" as "createdAt"
`;

const REQUEST_FROM_JOIN = `
  FROM "tblPlanUpgradeRequests" r
  LEFT JOIN "tblClient" c ON c."wrClientId" = r."wrClientId"
  LEFT JOIN "tblPackages" cp ON cp."wrId" = r."wrCurrentPackageId"
  LEFT JOIN "tblPackages" rp ON rp."wrId" = r."wrRequestedPackageId"
  LEFT JOIN "tblPaymentMethods" pm ON pm."wrId" = r."wrPaymentMethodId"
`;

// Admin list -- filterable by status/client, paginated. totalCount rides
// along on every row via a window function, same trick
// listClientActivityLogsQuery uses, so paging doesn't need a second
// COUNT(*) round trip.
const getAllPlanUpgradeRequestsQuery = async (filters, fastify) => {
  try {
    const { status, clientId, limit, offset } = filters || {};
    const conditions = ["1 = 1"];
    const bind = [];

    if (status) {
      bind.push(status);
      conditions.push(`r."wrStatus" = $${bind.length}`);
    }
    if (clientId) {
      bind.push(clientId);
      conditions.push(`r."wrClientId" = $${bind.length}`);
    }

    bind.push(limit && limit > 0 ? limit : 50);
    const limitParamIndex = bind.length;
    bind.push(offset && offset > 0 ? offset : 0);
    const offsetParamIndex = bind.length;

    return await fastify.db.query(
      `SELECT ${REQUEST_SELECT_COLUMNS}, COUNT(*) OVER() as "totalCount"
       ${REQUEST_FROM_JOIN}
       WHERE ${conditions.join(" AND ")}
       ORDER BY r."wrCreatedAt" DESC
       LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      { type: fastify.db.QueryTypes.SELECT, bind }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/getAllPlanUpgradeRequestsQuery");
    throw new Error(err.message);
  }
};

const getPlanUpgradeRequestByIdQuery = async (id, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${REQUEST_SELECT_COLUMNS} ${REQUEST_FROM_JOIN} WHERE r."wrId" = $1`,
      { type: fastify.db.QueryTypes.SELECT, bind: [id] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/getPlanUpgradeRequestByIdQuery");
    throw new Error(err.message);
  }
};

// Used by requestPlanUpgradeService to give a friendly "you already have a
// pending request" error before hitting idxPlanUpgradeOnePendingPerClient.
const getPendingRequestByClientQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${REQUEST_SELECT_COLUMNS} ${REQUEST_FROM_JOIN}
       WHERE r."wrClientId" = $1 AND r."wrStatus" = 'PENDING'`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/getPendingRequestByClientQuery");
    throw new Error(err.message);
  }
};

const getLatestRequestByClientQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${REQUEST_SELECT_COLUMNS} ${REQUEST_FROM_JOIN}
       WHERE r."wrClientId" = $1
       ORDER BY r."wrCreatedAt" DESC
       LIMIT 1`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/getLatestRequestByClientQuery");
    throw new Error(err.message);
  }
};

const insertPlanUpgradeRequestQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
        INSERT INTO "tblPlanUpgradeRequests" (
          "wrClientId", "wrCurrentPackageId", "wrRequestedPackageId", "wrPaymentMethodId",
          "wrAmount", "wrCurrency", "wrTransferCode", "wrStatus", "wrCreatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', now())
        RETURNING *
      )
      SELECT "wrId" as "id" FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.clientId,
          data.currentPackageId ?? null,
          data.requestedPackageId,
          data.paymentMethodId ?? null,
          data.amount ?? null,
          data.currency ?? null,
          data.transferCode,
        ],
      }
    );
    return result[0]?.id;
  } catch (err) {
    // Postgres unique_violation -- surfaced as a friendly message rather
    // than a raw constraint error, for both indexes this table relies on.
    if (err.message?.includes("idxPlanUpgradeTransferCodeUnique")) {
      throw new Error("This transfer code has already been submitted");
    }
    if (err.message?.includes("idxPlanUpgradeOnePendingPerClient")) {
      throw new Error("You already have a pending plan upgrade request");
    }
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/insertPlanUpgradeRequestQuery");
    throw new Error(err.message);
  }
};

// type: QueryTypes.UPDATE + RETURNING gives back [rows, metadata] here (same
// as TablePackages.js's updatePackagesQuery) -- unwrap to null when the
// WHERE matched nothing (id not found, or already reviewed by someone else
// in a race) rather than an ambiguous empty/nested shape.
const approveRequestQuery = async (id, reviewer, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblPlanUpgradeRequests" SET
        "wrStatus" = 'APPROVED',
        "wrReviewedBy" = $1,
        "wrReviewedByName" = $2,
        "wrReviewedAt" = now()
      WHERE "wrId" = $3 AND "wrStatus" = 'PENDING'
      RETURNING "wrId"`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [reviewer.id, reviewer.name, id],
      }
    );
    return result[0]?.[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/approveRequestQuery");
    throw new Error(err.message);
  }
};

const rejectRequestQuery = async (id, reviewer, reason, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblPlanUpgradeRequests" SET
        "wrStatus" = 'REJECTED',
        "wrRejectionReason" = $1,
        "wrReviewedBy" = $2,
        "wrReviewedByName" = $3,
        "wrReviewedAt" = now()
      WHERE "wrId" = $4 AND "wrStatus" = 'PENDING'
      RETURNING "wrId"`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [reason, reviewer.id, reviewer.name, id],
      }
    );
    return result[0]?.[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePlanUpgradeRequests.js/rejectRequestQuery");
    throw new Error(err.message);
  }
};

module.exports = {
  getAllPlanUpgradeRequestsQuery,
  getPlanUpgradeRequestByIdQuery,
  getPendingRequestByClientQuery,
  getLatestRequestByClientQuery,
  insertPlanUpgradeRequestQuery,
  approveRequestQuery,
  rejectRequestQuery,
};

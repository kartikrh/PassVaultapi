const { listClientActivityLogsQuery } = require("../repository/TableClientHistory");
const { ACTIVITY_LABELS } = require("../utilities/vaultConstants");

// GET /vault/admin/history equivalent -- filterable by client / action / date,
// action + IP + entry reference only (never vault content).
const listHistoryAdminService = async (request, fastify) => {
  const { clientId, activityType, dateFrom, dateTo } = request.body || {};
  const rows = await listClientActivityLogsQuery({ clientId, activityType, dateFrom, dateTo, limit: 200 }, fastify);
  return rows.map((row) => ({ ...row, activityLabel: ACTIVITY_LABELS[row.activityType] || "Unknown" }));
};

module.exports = { listHistoryAdminService, ACTIVITY_LABELS };

const { listClientActivityLogsQuery } = require("../repository/TableClientHistory");
const { ACTIVITY_LABELS } = require("../utilities/vaultConstants");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 500;

// GET /vault/auth/activity -- the signed-in client's own "Recent activity"
// list (Profile screen). Always scoped to the authenticated client's own
// id, unlike the admin equivalent (services/adminVaultHistory.js), which
// takes clientId as a staff-supplied filter. Dates come back as the same
// UTC ISO timestamps (tblActivityLogs.wrCreatedDate is timestamptz) every
// other endpoint already returns -- rendering them in the viewer's local
// timezone is the frontend's job (new Date(...).toLocaleString()), not
// something to convert server-side.
const getRecentActivityService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const requestedLimit = Number(request.query?.limit);
  const limit = requestedLimit > 0 ? Math.min(requestedLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  const rows = await listClientActivityLogsQuery({ clientId: WrClientId, limit }, fastify);
  return {
    activity: rows.map((row) => ({
      activityLogId: row.activityLogId,
      activityType: row.activityType,
      activityLabel: ACTIVITY_LABELS[row.activityType] || "Activity",
      createdDate: row.createdDate,
    })),
  };
};

module.exports = { getRecentActivityService };

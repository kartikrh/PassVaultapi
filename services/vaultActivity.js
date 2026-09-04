const { listClientActivityLogsQuery } = require("../repository/TableClientHistory");
const { ACTIVITY_LABELS } = require("../utilities/vaultConstants");

const DEFAULT_PAGE_SIZE = 20;
// High enough to cover "export everything" in one request (matches the
// 5000-row cap services/vaultAccountLifecycle.js already uses for a
// client's full activity history) while still bounding the query -- the
// dedicated Recent Activity page (passvault-client) reuses this same
// endpoint for both its paged listing and its Export CSV button.
const MAX_PAGE_SIZE = 5000;

// GET /vault/auth/activity -- the signed-in client's own "Recent activity"
// page, paginated. Always scoped to the authenticated client's own id,
// unlike the admin equivalent (services/adminVaultHistory.js), which takes
// clientId as a staff-supplied filter. Dates come back as the same UTC ISO
// timestamps (tblActivityLogs.wrCreatedDate is timestamptz) every other
// endpoint already returns -- rendering them in the viewer's local timezone
// is the frontend's job (new Date(...).toLocaleString()), not something to
// convert server-side.
const getRecentActivityService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const requestedPageSize = Number(request.query?.pageSize);
  const pageSize = requestedPageSize > 0 ? Math.min(requestedPageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const requestedPage = Number(request.query?.page);
  const page = requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const rows = await listClientActivityLogsQuery(
    { clientId: WrClientId, limit: pageSize, offset: (page - 1) * pageSize },
    fastify
  );
  const total = rows[0]?.totalCount ? Number(rows[0].totalCount) : 0;

  return {
    activity: rows.map((row) => ({
      activityLogId: row.activityLogId,
      activityType: row.activityType,
      activityLabel: ACTIVITY_LABELS[row.activityType] || "Activity",
      // The page path for a PAGE_VIEWED row (see logPageViewService), an
      // entry id for account/note events, etc. -- was already selected by
      // listClientActivityLogsQuery, just wasn't passed through before.
      refId: row.refId,
      // Plaintext title as of the time of this row (see
      // sql/vault/012_activity_log_entry_name.sql) -- takes priority over
      // the frontend's best-effort current-entries lookup (useEntryNameLookup),
      // which can't resolve a renamed or deleted entry at all.
      entryName: row.entryName,
      ipAddress: row.ipAddress,
      // Only present on login-completing rows (login, google, register,
      // failed attempt, lockout -- see services/vaultAuth.js's
      // requireGeolocation); null for everything else (page views, account/
      // note edits, ...).
      latitude: row.latitude,
      longitude: row.longitude,
      createdDate: row.createdDate,
    })),
    page,
    pageSize,
    total,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
};

module.exports = { getRecentActivityService };

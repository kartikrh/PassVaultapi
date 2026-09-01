// Archive for self-service "Delete Account" (see
// services/vaultAccountLifecycle.js's deleteAccountService) -- a write-once
// audit record, separate from tblClient's own existing soft-delete
// (wrIsDeleted, used by the staff-facing admin Clients screen's own delete
// action, which keeps the row and vault data intact). This table exists
// because self-delete is destructive: the live tblClient/
// tblClientVaultEntries/tblActivityLogs rows are actually removed, and both
// Drive vault files are deleted too -- this is what's left to prove it
// happened and why.
const { errorLogger } = require("../utilities/logger");

const archiveDeletedClientQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblDeletedClients" (
        "wrOriginalClientId", "wrEmail", "wrName", "wrUsername", "wrReason",
        "wrClientSnapshot", "wrVaultEntriesSnapshot", "wrActivityLogsSnapshot"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING "wrId" as "id", "wrDeletedAt" as "deletedAt"`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.originalClientId,
          data.email,
          data.name || null,
          data.username || null,
          data.reason,
          JSON.stringify(data.clientSnapshot),
          JSON.stringify(data.vaultEntriesSnapshot || []),
          JSON.stringify(data.activityLogsSnapshot || []),
        ],
      }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableDeletedClients/archiveDeletedClientQuery");
    throw new Error(err.message);
  }
};

// Staff-facing "Deleted" tab on the admin Clients screen -- summary fields
// only (email/name/username/reason/deletedAt); the full snapshot is
// available via getDeletedClientByIdQuery for a detail view if ever needed.
const listDeletedClientsQuery = async (filters, fastify) => {
  try {
    const { search, limit } = filters || {};
    const conditions = [];
    const bind = [];

    if (search) {
      bind.push(`%${search}%`);
      conditions.push(`("wrEmail" ILIKE $${bind.length} OR "wrName" ILIKE $${bind.length} OR "wrUsername" ILIKE $${bind.length})`);
    }

    bind.push(limit && limit > 0 ? limit : 200);

    const result = await fastify.db.query(
      `SELECT
        "wrId" as "id",
        "wrOriginalClientId" as "originalClientId",
        "wrEmail" as "email",
        "wrName" as "name",
        "wrUsername" as "username",
        "wrReason" as "reason",
        "wrDeletedAt" as "deletedAt"
       FROM "tblDeletedClients"
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY "wrDeletedAt" DESC
       LIMIT $${bind.length}`,
      { type: fastify.db.QueryTypes.SELECT, bind }
    );
    return result;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableDeletedClients/listDeletedClientsQuery");
    throw new Error(err.message);
  }
};

const getDeletedClientByIdQuery = async (id, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT
        "wrId" as "id",
        "wrOriginalClientId" as "originalClientId",
        "wrEmail" as "email",
        "wrName" as "name",
        "wrUsername" as "username",
        "wrReason" as "reason",
        "wrClientSnapshot" as "clientSnapshot",
        "wrVaultEntriesSnapshot" as "vaultEntriesSnapshot",
        "wrActivityLogsSnapshot" as "activityLogsSnapshot",
        "wrDeletedAt" as "deletedAt"
       FROM "tblDeletedClients" WHERE "wrId" = $1`,
      { type: fastify.db.QueryTypes.SELECT, bind: [id] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableDeletedClients/getDeletedClientByIdQuery");
    throw new Error(err.message);
  }
};

module.exports = { archiveDeletedClientQuery, listDeletedClientsQuery, getDeletedClientByIdQuery };

const {
  listClientsAdminQuery,
  getClientByIdAdminQuery,
  updateClientStatusAdminQuery,
  deleteClientsAdminQuery,
  getClientDevicesAdminQuery,
} = require("../repository/TableClientAdmin");
const { listClientActivityLogsQuery } = require("../repository/TableClientHistory");
const { getClientPlanLimitsQuery } = require("../repository/TableClient");
const { countActiveEntriesByTypeQuery } = require("../repository/TableClientVaultEntries");
const { VaultEntryType } = require("../utilities/vaultConstants");
const { ACTIVITY_LABELS } = require("./adminVaultHistory");
const { listDeletedClientsQuery } = require("../repository/TableDeletedClients");

// GET /vault/admin/clients equivalent -- metadata-only list, search/filter by
// plan and status. This module intentionally deviates from this codebase's usual
// admin-endpoint shape (`/admin/<module>/all` POST against an in-memory global
// cache) because tblClient is real, growing end-customer data -- see the note atop
// repository/TableClientAdmin.js.
const listClientsAdminService = async (request, fastify) => {
  const { search, status, packageId, startDate, endDate } = request.body || {};
  return listClientsAdminQuery({ search, status, packageId, startDate, endDate }, fastify);
};

// GET /vault/admin/clients/:id equivalent -- profile, plan, usage, devices, activity
// history. No password/vault content anywhere, matching the spec's Clients detail view.
const getClientDetailAdminService = async (request, fastify) => {
  const { clientId } = request.body || {};
  if (!clientId) {
    throw new Error("clientId is required");
  }

  const client = await getClientByIdAdminQuery(clientId, fastify);
  if (!client) {
    throw new Error("Client not found");
  }

  const [accountCount, groupCount, noteCount, devices, activity] = await Promise.all([
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.ACCOUNT, fastify),
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.GROUP, fastify),
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.NOTE, fastify),
    getClientDevicesAdminQuery(clientId, fastify),
    listClientActivityLogsQuery({ clientId, limit: 20 }, fastify),
  ]);

  return {
    client,
    usage: {
      accounts: { used: accountCount, limit: client.maxAccounts },
      groups: { used: groupCount, limit: client.maxGroups },
      notes: { used: noteCount, limit: client.maxNotes },
    },
    devices,
    recentActivity: activity.map((row) => ({ ...row, activityLabel: ACTIVITY_LABELS[row.activityType] || "Unknown" })),
  };
};

// PATCH /vault/admin/clients/:id/status equivalent -- suspend or activate a client.
const updateClientStatusAdminService = async (request, fastify) => {
  const { clientId, isActive } = request.body || {};
  if (!clientId || typeof isActive !== "boolean") {
    throw new Error("clientId and isActive (boolean) are required");
  }

  const client = await getClientByIdAdminQuery(clientId, fastify);
  if (!client) {
    throw new Error("Client not found");
  }

  await updateClientStatusAdminQuery(clientId, isActive, fastify);
  return getClientByIdAdminQuery(clientId, fastify);
};

// DELETE /vault/admin/clients equivalent -- soft delete (wrIsDeleted), same
// semantics as the rest of this codebase's Delete actions (e.g. services/page.js),
// but never a hard delete here: this row's encrypted vault data stays intact.
const deleteClientsAdminService = async (request, fastify) => {
  const rawIds = request.body?.clientId;
  const clientIds = Array.isArray(rawIds) ? rawIds : [rawIds];
  if (clientIds.length === 0 || clientIds.some((id) => !id)) {
    throw new Error("clientId is required");
  }

  await deleteClientsAdminQuery(clientIds, fastify);
  return "Client(s) deleted successfully";
};

// GET /vault/admin/clients/:id/usage equivalent -- usage vs. plan limits for one client.
const getClientUsageAdminService = async (request, fastify) => {
  const { clientId } = request.body || {};
  if (!clientId) {
    throw new Error("clientId is required");
  }

  const [{ maxAccounts, maxGroups, maxNotes }, accountCount, groupCount, noteCount] = await Promise.all([
    getClientPlanLimitsQuery(clientId, fastify),
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.ACCOUNT, fastify),
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.GROUP, fastify),
    countActiveEntriesByTypeQuery(clientId, VaultEntryType.NOTE, fastify),
  ]);

  return {
    accounts: { used: accountCount, limit: maxAccounts },
    groups: { used: groupCount, limit: maxGroups },
    notes: { used: noteCount, limit: maxNotes },
  };
};

// "Deleted" tab on the same admin Clients screen -- a wholly separate self-
// service flow from this file's own deleteClientsAdminService (a staff
// action, soft-delete via wrIsDeleted, keeps the row and vault data
// intact). Self-delete (Profile > danger zone, see
// services/vaultAccountLifecycle.js) archives here and hard-deletes the
// live tblClient row, so there's nothing left to list except this table.
const listDeletedClientsAdminService = async (request, fastify) => {
  const { search } = request.body || {};
  return listDeletedClientsQuery({ search }, fastify);
};

module.exports = {
  listClientsAdminService,
  getClientDetailAdminService,
  updateClientStatusAdminService,
  deleteClientsAdminService,
  getClientUsageAdminService,
  listDeletedClientsAdminService,
};

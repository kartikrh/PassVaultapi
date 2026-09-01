// Profile > danger zone: self-service Suspend Account and Delete Account.
// A separate file from services/vaultAuth.js (which it imports from, one
// direction only, same pattern as services/vaultDrive.js) so this doesn't
// grow that already-large file further, and to avoid a circular require --
// vaultAuth.js can't import Drive helpers back from here.
const {
  findClientByIdQuery,
  suspendClientQuery,
  hardDeleteClientQuery,
  getClientDriveRefreshTokenQuery,
} = require("../repository/TableClient");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const {
  listEntriesByClientQuery,
  moveEntriesToArchiveByClientQuery,
} = require("../repository/TableClientVaultEntries");
const { moveVaultKeysToArchiveByClientQuery } = require("../repository/TableClientVaultKey");
const {
  listClientActivityLogsQuery,
  moveActivityLogsToArchiveByClientQuery,
} = require("../repository/TableClientHistory");
const { archiveDeletedClientQuery } = require("../repository/TableDeletedClients");
const { decrypt, deviceInfo } = require("../utilities/index");
const { getAccessTokenFromRefreshToken, findVaultFile, deleteVaultFile } = require("../utilities/googleDrive");
const { VaultActivityCodes, VaultFileKind } = require("../utilities/vaultConstants");
const { resolveWhitelabelFromRequest, verifyOwnTotpCode } = require("./vaultAuth");

// Same access-token resolution as services/vaultData.js's (private, not
// exported) getDriveAccessTokenForClient -- duplicated rather than shared
// to avoid vaultData.js <-> vaultAuth.js <-> here becoming a require cycle
// (vaultData.js already imports resolveWhitelabelFromRequest from
// vaultAuth.js; this file needs the same plus Drive delete, which vaultAuth.js
// itself has no reason to depend on).
const getDriveAccessToken = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const encryptedRefreshToken = await getClientDriveRefreshTokenQuery(WrClientId, fastify);
  if (!encryptedRefreshToken) return null;
  const whitelabel = resolveWhitelabelFromRequest(request);
  if (!whitelabel?.googleKey || !whitelabel?.googleSecret) return null;
  const refreshToken = decrypt(encryptedRefreshToken);
  return getAccessTokenFromRefreshToken(refreshToken, whitelabel.googleKey, decrypt(whitelabel.googleSecret));
};

// POST /vault/auth/suspendAccount -- authenticated, requires a fresh TOTP
// code entered right before this call (passvault-client's DangerZoneOtpModal
// collects it and submits it directly here -- there's no proof token from a
// prior /2fa/verify call to reuse, see verifyOwnTotpCode's own comment).
// Sets wrIsSelfSuspended, a flag wholly separate from the staff-only
// wrIsActive kill switch -- logging back in lifts this one automatically
// (services/vaultAuth.js's reactivateIfSuspended), it isn't permanent.
const suspendAccountService = async (request, fastify) => {
  const { code } = request.body || {};
  const { WrClientId } = request.clientTokenInfo;

  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  await verifyOwnTotpCode(client, code, fastify);

  await suspendClientQuery(WrClientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_SUSPENDED,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
      deviceInfo: deviceInfo(request),
    },
    fastify
  );

  return { suspended: true };
};

// POST /vault/auth/deleteAccount -- authenticated, requires a fresh TOTP
// code plus a reason. Archives the client's profile into tblDeletedClients
// (repository/TableDeletedClients.js) for the admin "Deleted" list/detail
// view, then MOVES (not just deletes) the live tblClientVaultEntries,
// tblClientVaultKey, and tblActivityLogs rows into their own dedicated
// tblDeletedClient* archive tables (sql/vault/009_deleted_client_archive_tables.sql)
// before finally hard-deleting the client row itself -- FK-safe order:
// dependents before tblClient, since none of those foreign keys cascade --
// and both Drive vault files. Drive cleanup is best-effort: a third-party
// hiccup must never block "delete my account" once the archive+DB delete
// already succeeded (mirrors utilities/vpnCheck.js's fail-open philosophy).
const deleteAccountService = async (request, fastify) => {
  const { code, reason } = request.body || {};
  const { WrClientId } = request.clientTokenInfo;

  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  await verifyOwnTotpCode(client, code, fastify);

  const trimmedReason = (reason || "").trim();
  if (!trimmedReason) {
    throw new Error("Please tell us why you're deleting your account");
  }

  // Written for real (not just appended to the JS snapshot below) now that
  // tblDeletedClientActivityLogs exists -- moveActivityLogsToArchiveByClientQuery
  // sweeps this row into the archive along with everything else, so the
  // permanent record ends with it instead of only the JSONB snapshot doing so.
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_SELF_DELETED,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
      deviceInfo: deviceInfo(request),
    },
    fastify
  );

  const [vaultEntriesSnapshot, activityLogsSnapshot] = await Promise.all([
    listEntriesByClientQuery(WrClientId, fastify),
    listClientActivityLogsQuery({ clientId: WrClientId, limit: 5000 }, fastify),
  ]);

  const { id: deletedClientId } = await archiveDeletedClientQuery(
    {
      originalClientId: WrClientId,
      email: client.email,
      name: client.name,
      username: client.username,
      reason: trimmedReason,
      clientSnapshot: client,
      vaultEntriesSnapshot,
      activityLogsSnapshot,
    },
    fastify
  );

  try {
    const accessToken = await getDriveAccessToken(request, fastify);
    if (accessToken) {
      for (const vaultType of Object.values(VaultFileKind)) {
        const file = await findVaultFile(accessToken, vaultType);
        if (file) await deleteVaultFile(accessToken, file.id);
      }
    }
  } catch (err) {
    console.log("deleteAccountService: Drive cleanup failed (continuing):", err.message);
  }

  await moveEntriesToArchiveByClientQuery(WrClientId, deletedClientId, fastify);
  await moveVaultKeysToArchiveByClientQuery(WrClientId, deletedClientId, fastify);
  await moveActivityLogsToArchiveByClientQuery(WrClientId, deletedClientId, fastify);
  await hardDeleteClientQuery(WrClientId, fastify);

  return { deleted: true };
};

module.exports = { suspendAccountService, deleteAccountService };

const { decrypt } = require("../utilities/index");
const {
  getAccessTokenFromRefreshToken,
  findVaultFile,
  getVaultFileContent,
  createVaultFile,
  updateVaultFile,
} = require("../utilities/googleDrive");
const { resolveWhitelabelFromRequest } = require("./vaultAuth");
const { getClientDriveRefreshTokenQuery, getClientPlanLimitsQuery } = require("../repository/TableClient");
const {
  countActiveEntriesByTypeQuery,
  upsertEntryQuery,
  softDeleteEntryQuery,
} = require("../repository/TableClientVaultEntries");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const {
  VaultEntryType,
  VaultChangeType,
  VaultFileKind,
  VAULT_FILE_KIND_BY_ENTRY_TYPE,
  getVaultEntryActivityCode,
} = require("../utilities/vaultConstants");

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

// Redeeming a refresh token requires the same Google OAuth client that
// issued it -- each White Label domain has its own (wrGoogle_Key/Secret,
// same client Sign-In and the original /connect call used), so this
// re-resolves it from the request rather than a single global client.
const getDriveAccessTokenForClient = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const encryptedRefreshToken = await getClientDriveRefreshTokenQuery(WrClientId, fastify);
  if (!encryptedRefreshToken) {
    throw makeError("Google Drive is not connected for this client -- call /vault/auth/drive/connect first", "DRIVE_NOT_CONNECTED");
  }
  const whitelabel = resolveWhitelabelFromRequest(request);
  if (!whitelabel?.googleKey || !whitelabel?.googleSecret) {
    throw makeError("Google Drive is not configured for this domain", "DRIVE_NOT_CONFIGURED");
  }
  const refreshToken = decrypt(encryptedRefreshToken);
  return getAccessTokenFromRefreshToken(refreshToken, whitelabel.googleKey, decrypt(whitelabel.googleSecret));
};

// Fetches the current encrypted blob and its Drive revision id (GET
// /vault/data?vaultType=accounts|notes). Accounts (+ Groups) and Notes live
// in two separate Drive files -- see utilities/vaultConstants.js's
// VaultFileKind -- so the caller says which one it wants.
// A client that has connected Drive but never written that file yet has no
// file -- that is not an error, it just means it's starting from empty.
const getVaultDataService = async (request, fastify) => {
  const { vaultType } = request.query || {};
  if (!Object.values(VaultFileKind).includes(vaultType)) {
    throw makeError("vaultType must be 'accounts' or 'notes'", "INVALID_INPUT");
  }

  const accessToken = await getDriveAccessTokenForClient(request, fastify);

  const file = await findVaultFile(accessToken, vaultType);
  if (!file) {
    return { blob: null, revisionId: null };
  }

  const blob = await getVaultFileContent(accessToken, file.id);
  return { blob, revisionId: file.headRevisionId };
};

const QUOTA_FIELD_BY_ENTRY_TYPE = {
  [VaultEntryType.ACCOUNT]: "maxAccounts",
  [VaultEntryType.GROUP]: "maxGroups",
  [VaultEntryType.NOTE]: "maxNotes",
};

// Uploads the re-encrypted blob (PUT /vault/data). The server never inspects the
// blob's contents -- entryId/entryType/changeType are declared by the client so the
// opaque-id ledger (tblClientVaultEntries) can enforce package quotas and the
// activity log can record what kind of change happened, without ever decrypting anything.
const putVaultDataService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { blob, entryId, entryType, changeType, expectedRevisionId, latitude, longitude, entryName } =
    request.body || {};

  if (!blob || !entryId) {
    throw makeError("blob and entryId are required", "INVALID_INPUT");
  }
  if (!Object.values(VaultEntryType).includes(entryType)) {
    throw makeError("entryType must be 1 (account), 2 (group), or 3 (note)", "INVALID_INPUT");
  }
  if (!Object.values(VaultChangeType).includes(changeType)) {
    throw makeError("changeType must be one of create, update, delete", "INVALID_INPUT");
  }

  if (changeType === VaultChangeType.CREATE) {
    const [planLimits, currentCount] = await Promise.all([
      getClientPlanLimitsQuery(WrClientId, fastify),
      countActiveEntriesByTypeQuery(WrClientId, entryType, fastify),
    ]);
    const limit = planLimits[QUOTA_FIELD_BY_ENTRY_TYPE[entryType]];
    if (limit != null && currentCount >= limit) {
      throw makeError(
        `Plan limit reached for ${QUOTA_FIELD_BY_ENTRY_TYPE[entryType]} (${limit}) -- upgrade to add more`,
        "QUOTA_EXCEEDED"
      );
    }
  }

  // Derived from entryType, never trusted from the client body directly --
  // this is what guarantees an account can never land in the notes file (or
  // vice versa) no matter what a caller sends.
  const vaultType = VAULT_FILE_KIND_BY_ENTRY_TYPE[entryType];

  const accessToken = await getDriveAccessTokenForClient(request, fastify);
  const existingFile = await findVaultFile(accessToken, vaultType);

  if (existingFile && expectedRevisionId && existingFile.headRevisionId !== expectedRevisionId) {
    throw makeError("The vault has changed since you last fetched it -- GET /vault/data and retry", "REVISION_CONFLICT");
  }

  const result = existingFile
    ? await updateVaultFile(accessToken, existingFile.id, blob)
    : await createVaultFile(accessToken, blob, vaultType);

  if (changeType === VaultChangeType.DELETE) {
    await softDeleteEntryQuery(entryId, WrClientId, fastify);
  } else {
    await upsertEntryQuery({ entryId, clientId: WrClientId, entryType }, fastify);
  }

  await insertClientActivityLogQuery(
    {
      activityType: getVaultEntryActivityCode(entryType, changeType),
      refId: entryId,
      ipAddress: request.ip,
      clientId: WrClientId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      // Plaintext title only -- see sql/vault/012_activity_log_entry_name.sql.
      // Client-supplied and unverifiable against the blob (the server never
      // decrypts it), same trust level entryId/entryType/changeType already
      // have here; worst case a wrong label on the client's own activity
      // row, not a security issue.
      entryName: entryName || null,
    },
    fastify
  );

  return { revisionId: result.headRevisionId };
};

module.exports = { getVaultDataService, putVaultDataService };

const { errorLogger } = require("../utilities/logger");

const CLIENT_SELECT_COLUMNS = `
  "wrClientId" as "clientId",
  "wrName" as "name",
  "wrUsername" as "username",
  "wrEmail" as "email",
  "wrMobileNo" as "mobileNo",
  "wrAddress" as "address",
  "wrGoogleId" as "googleId",
  "wrProvider" as "provider",
  "wrIsEmailVerified" as "isEmailVerified",
  ("wrPasswordHash" IS NOT NULL) as "hasPassword",
  "wrPackageId" as "packageId",
  "wrWhitelabelId" as "whitelabelId",
  "wrIsActive" as "isActive",
  "wrIsSelfSuspended" as "isSelfSuspended",
  "wrSelfSuspendedAt" as "selfSuspendedAt",
  "wrIsDeleted" as "isDeleted",
  "wrCreatedAt" as "createdAt",
  "wrUpdatedAt" as "updatedAt",
  "WrOTPEnable" as "otpEnabled",
  "WeOTPType" as "otpType",
  ("WrUuid" IS NOT NULL) as "hasOtpSecret",
  ("wrDriveRefreshToken" IS NOT NULL) as "driveConnected"
`;

const findClientByGoogleIdQuery = async (googleId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS} FROM "tblClient" WHERE "wrGoogleId" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [googleId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/findClientByGoogleIdQuery");
    throw new Error(err.message);
  }
};

const findClientByEmailQuery = async (email, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS} FROM "tblClient" WHERE "wrEmail" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [email] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/findClientByEmailQuery");
    throw new Error(err.message);
  }
};

const findClientByIdQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS} FROM "tblClient" WHERE "wrClientId" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/findClientByIdQuery");
    throw new Error(err.message);
  }
};

// Case-insensitive, matching the unique index in
// sql/vault/003_client_username.sql -- excludeClientId lets a client's own
// update check pass when they resubmit their current username unchanged.
const findClientByUsernameQuery = async (username, fastify, excludeClientId = null) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS} FROM "tblClient"
       WHERE LOWER("wrUsername") = LOWER($1) AND "wrIsDeleted" = false
       AND ($2::int IS NULL OR "wrClientId" != $2)`,
      { type: fastify.db.QueryTypes.SELECT, bind: [username, excludeClientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/findClientByUsernameQuery");
    throw new Error(err.message);
  }
};

const getDefaultPackageIdQuery = async (fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT "wrId" as "id" FROM "tblPackages" WHERE "wrIsDefault" = true AND "wrIsDeleted" = false LIMIT 1`,
      { type: fastify.db.QueryTypes.SELECT }
    );
    return result[0]?.id || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getDefaultPackageIdQuery");
    throw new Error(err.message);
  }
};

const insertClientQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblClient" (
        "wrName", "wrEmail", "wrGoogleId", "wrProvider", "wrIsEmailVerified", "wrPackageId", "wrWhitelabelId", "wrPackageExpiryDate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${CLIENT_SELECT_COLUMNS}`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.name || null,
          data.email,
          data.googleId,
          data.provider,
          data.isEmailVerified || false,
          data.packageId || null,
          data.whitelabelId || null,
          data.packageExpiryDate || null,
        ],
      }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/insertClientQuery");
    throw new Error(err.message);
  }
};

// Login/setPassword need the hash; CLIENT_SELECT_COLUMNS deliberately omits
// it everywhere else (admin listings, Google sign-in, activity lookups).
// failedLoginAttempts/lockedUntil are likewise only ever needed by
// loginService's own lockout check, never exposed to the frontend.
const getClientAuthByEmailQuery = async (email, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS}, "wrPasswordHash" as "passwordHash",
              "wrFailedLoginAttempts" as "failedLoginAttempts", "wrLockedUntil" as "lockedUntil"
       FROM "tblClient" WHERE "wrEmail" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [email] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientAuthByEmailQuery");
    throw new Error(err.message);
  }
};

// Same shape as getClientAuthByEmailQuery, for username+password login --
// case-insensitive, matching the unique index in sql/vault/003_client_username.sql.
const getClientAuthByUsernameQuery = async (username, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${CLIENT_SELECT_COLUMNS}, "wrPasswordHash" as "passwordHash",
              "wrFailedLoginAttempts" as "failedLoginAttempts", "wrLockedUntil" as "lockedUntil"
       FROM "tblClient" WHERE LOWER("wrUsername") = LOWER($1) AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [username] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientAuthByUsernameQuery");
    throw new Error(err.message);
  }
};

// Called on every wrong password, inside loginService. Atomic: the lockout
// decision (reaching maxAttempts) is made in the same UPDATE that increments
// the counter, so two concurrent wrong-password requests can't each see a
// stale pre-increment count and both fail to trip the lockout.
const incrementFailedLoginAttemptsQuery = async (clientId, maxAttempts, lockoutHours, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblClient" SET
         "wrFailedLoginAttempts" = "wrFailedLoginAttempts" + 1,
         "wrLockedUntil" = CASE
           WHEN "wrFailedLoginAttempts" + 1 >= $2 THEN now() + ($3 || ' hours')::interval
           ELSE "wrLockedUntil"
         END
       WHERE "wrClientId" = $1
       RETURNING "wrFailedLoginAttempts" as "failedLoginAttempts", "wrLockedUntil" as "lockedUntil"`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId, maxAttempts, lockoutHours] }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/incrementFailedLoginAttemptsQuery");
    throw new Error(err.message);
  }
};

// Called on every successful password login, clearing any prior lockout.
const resetFailedLoginAttemptsQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrFailedLoginAttempts" = 0, "wrLockedUntil" = NULL WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/resetFailedLoginAttemptsQuery");
    throw new Error(err.message);
  }
};

const updateClientPasswordHashQuery = async (clientId, passwordHash, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrPasswordHash" = $1, "wrUpdatedAt" = now() WHERE "wrClientId" = $2`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [passwordHash, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/updateClientPasswordHashQuery");
    throw new Error(err.message);
  }
};

// All fields optional -- COALESCE keeps whichever wasn't submitted
// unchanged, so a name-only or username-only update doesn't need to
// resend the others. mobileNo/address have no uniqueness constraint
// (unlike username) so they can be resubmitted/changed freely.
const updateClientProfileQuery = async (clientId, { name, username, mobileNo, address }, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient"
       SET "wrName" = COALESCE($1, "wrName"),
           "wrUsername" = COALESCE($2, "wrUsername"),
           "wrMobileNo" = COALESCE($3, "wrMobileNo"),
           "wrAddress" = COALESCE($4, "wrAddress"),
           "wrUpdatedAt" = now()
       WHERE "wrClientId" = $5`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [name ?? null, username ?? null, mobileNo ?? null, address ?? null, clientId],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/updateClientProfileQuery");
    throw new Error(err.message);
  }
};

const updateClientEmailVerifiedQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrIsEmailVerified" = true, "wrUpdatedAt" = now() WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/updateClientEmailVerifiedQuery");
    throw new Error(err.message);
  }
};

const touchClientUpdatedAtQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrUpdatedAt" = now() WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/touchClientUpdatedAtQuery");
    throw new Error(err.message);
  }
};

// Called only from approvePlanUpgradeRequestService once a
// tblPlanUpgradeRequests row is approved -- this is what actually moves the
// client onto the new plan. expiryDate is computed by the caller from the
// new package's wrIntervalType/wrIntervalCount (see utilities/index.js's
// computePackageExpiryDate).
const updateClientPackageQuery = async (clientId, packageId, expiryDate, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrPackageId" = $1, "wrPackageExpiryDate" = $2, "wrUpdatedAt" = now() WHERE "wrClientId" = $3`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [packageId, expiryDate || null, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/updateClientPackageQuery");
    throw new Error(err.message);
  }
};

const setClientDriveRefreshTokenQuery = async (clientId, encryptedRefreshToken, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrDriveRefreshToken" = $1, "wrUpdatedAt" = now() WHERE "wrClientId" = $2`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [encryptedRefreshToken, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/setClientDriveRefreshTokenQuery");
    throw new Error(err.message);
  }
};

const getClientDriveRefreshTokenQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT "wrDriveRefreshToken" as "driveRefreshToken" FROM "tblClient" WHERE "wrClientId" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0]?.driveRefreshToken || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientDriveRefreshTokenQuery");
    throw new Error(err.message);
  }
};

// null maxAccounts/maxGroups means unlimited, per tblPackages' "null = unlimited" convention.
const getClientPlanLimitsQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT p."wrMaxAccounts" as "maxAccounts", p."wrMaxGroups" as "maxGroups", p."wrMaxNotes" as "maxNotes"
       FROM "tblClient" c
       JOIN "tblPackages" p ON p."wrId" = c."wrPackageId"
       WHERE c."wrClientId" = $1`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || { maxAccounts: null, maxGroups: null, maxNotes: null };
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientPlanLimitsQuery");
    throw new Error(err.message);
  }
};

// Returns the client's subscribed package details (name/price/limits), or
// null if the client has no wrPackageId set yet. Distinct from
// getClientPlanLimitsQuery above, which only returns the bare numeric
// limits for the entry-count gate in services/vaultData.js -- this one is
// for display (passvault-client's /profile "Subscription" card).
const getClientPackageQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT p."wrId" as "packageId", p."wrName" as "name", p."wrDescription" as "description",
              p."wrPrice" as "price", p."wrCurrency" as "currency",
              p."wrIntervalType" as "intervalType", p."wrIntervalCount" as "intervalCount",
              p."wrTrialDays" as "trialDays",
              p."wrMaxAccounts" as "maxAccounts", p."wrMaxGroups" as "maxGroups", p."wrMaxNotes" as "maxNotes",
              c."wrPackageExpiryDate" as "expiryDate"
       FROM "tblClient" c
       JOIN "tblPackages" p ON p."wrId" = c."wrPackageId"
       WHERE c."wrClientId" = $1`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientPackageQuery");
    throw new Error(err.message);
  }
};

// Only used for an already-enrolled client (hasOtpSecret true) -- a
// brand-new, not-yet-confirmed secret instead travels inside the pending
// 2FA JWT itself (see services/vaultAuth.js beginTwoFactorChallenge) so an
// abandoned QR-scan never touches this column until verified.
const getClientOtpSecretQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT "WrUuid" as "otpSecret" FROM "tblClient" WHERE "wrClientId" = $1 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0]?.otpSecret || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/getClientOtpSecretQuery");
    throw new Error(err.message);
  }
};

// Persists a newly-enrolled TOTP secret (app-layer encrypted) once the
// client has verified their first code -- called from services/vaultAuth.js
// verifyOtpService, never before verification succeeds, so an abandoned
// QR-scan never leaves a half-enrolled secret in place.
const updateClientOtpSecretQuery = async (clientId, encryptedSecret, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "WrUuid" = $1, "wrUpdatedAt" = now() WHERE "wrClientId" = $2`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [encryptedSecret, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/updateClientOtpSecretQuery");
    throw new Error(err.message);
  }
};

// Clears a client's TOTP secret (self-service "reset 2FA" action, e.g.
// after a lost device) so their next sign-in re-issues a fresh QR code.
const resetClientOtpQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "WrUuid" = NULL, "wrUpdatedAt" = now() WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/resetClientOtpQuery");
    throw new Error(err.message);
  }
};

// Self-service "Suspend Account" (Profile > danger zone) -- deliberately
// separate from wrIsActive (the permanent, staff-only kill switch checked
// in loginService/authorizeClient): logging back in is what lifts THIS one
// (see services/vaultAuth.js's reactivateIfSuspended), not a staff action.
const suspendClientQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrIsSelfSuspended" = true, "wrSelfSuspendedAt" = now() WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/suspendClientQuery");
    throw new Error(err.message);
  }
};

// Called the moment a self-suspended client successfully completes a login.
const reactivateClientQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrIsSelfSuspended" = false, "wrSelfSuspendedAt" = NULL WHERE "wrClientId" = $1`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/reactivateClientQuery");
    throw new Error(err.message);
  }
};

// Permanent hard delete (Delete Account) -- only ever called from
// services/vaultAccountLifecycle.js's deleteAccountService, AFTER the row
// has already been archived into tblDeletedClients and every dependent
// table (tblClientVaultEntries, tblClientVaultKey, tblActivityLogs) has had
// its rows for this client removed first (their FKs to tblClient carry no
// ON DELETE CASCADE, so this would otherwise fail with a FK violation).
const hardDeleteClientQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(`DELETE FROM "tblClient" WHERE "wrClientId" = $1`, {
      type: fastify.db.QueryTypes.DELETE,
      bind: [clientId],
    });
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClient/hardDeleteClientQuery");
    throw new Error(err.message);
  }
};

module.exports = {
  findClientByGoogleIdQuery,
  findClientByEmailQuery,
  findClientByUsernameQuery,
  findClientByIdQuery,
  getClientAuthByEmailQuery,
  getClientAuthByUsernameQuery,
  getDefaultPackageIdQuery,
  insertClientQuery,
  touchClientUpdatedAtQuery,
  updateClientPackageQuery,
  updateClientPasswordHashQuery,
  updateClientProfileQuery,
  updateClientEmailVerifiedQuery,
  setClientDriveRefreshTokenQuery,
  getClientDriveRefreshTokenQuery,
  getClientPlanLimitsQuery,
  getClientPackageQuery,
  getClientOtpSecretQuery,
  updateClientOtpSecretQuery,
  resetClientOtpQuery,
  incrementFailedLoginAttemptsQuery,
  resetFailedLoginAttemptsQuery,
  suspendClientQuery,
  reactivateClientQuery,
  hardDeleteClientQuery,
};

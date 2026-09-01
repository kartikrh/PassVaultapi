// Staff-facing (PassVaultpanel) queries over tblClient -- metadata only, exactly
// like the client-facing repository/TableClient.js, but with search/filter/paging
// for the admin "Clients" screen. Deliberately NOT read from an in-memory global
// cache the way most other CMS modules in this codebase are (see services/packages.js,
// services/devices.js): tblClient is real end-customer data that grows unboundedly,
// unlike the small, mostly-static config tables (Packages, Roles, Tabs) that pattern fits.
const { errorLogger } = require("../utilities/logger");

const ADMIN_CLIENT_SELECT_COLUMNS = `
  c."wrClientId" as "clientId",
  c."wrName" as "name",
  c."wrEmail" as "email",
  c."wrProvider" as "provider",
  c."wrIsEmailVerified" as "isEmailVerified",
  c."wrPackageId" as "packageId",
  p."wrName" as "packageName",
  c."wrIsActive" as "isActive",
  c."wrCreatedAt" as "createdAt",
  c."wrUpdatedAt" as "updatedAt"
`;

const listClientsAdminQuery = async (filters, fastify) => {
  try {
    const { search, status, packageId, startDate, endDate } = filters || {};
    const conditions = [`c."wrIsDeleted" = false`];
    const bind = [];

    if (search) {
      bind.push(`%${search}%`);
      conditions.push(`(c."wrName" ILIKE $${bind.length} OR c."wrEmail" ILIKE $${bind.length})`);
    }
    if (status === "active") {
      conditions.push(`c."wrIsActive" = true`);
    } else if (status === "suspended") {
      conditions.push(`c."wrIsActive" = false`);
    }
    if (packageId) {
      bind.push(packageId);
      conditions.push(`c."wrPackageId" = $${bind.length}`);
    }
    if (startDate) {
      bind.push(startDate);
      conditions.push(`c."wrCreatedAt" >= $${bind.length}`);
    }
    if (endDate) {
      bind.push(endDate);
      conditions.push(`c."wrCreatedAt" <= $${bind.length}`);
    }

    const result = await fastify.db.query(
      `SELECT ${ADMIN_CLIENT_SELECT_COLUMNS}
       FROM "tblClient" c
       LEFT JOIN "tblPackages" p ON p."wrId" = c."wrPackageId"
       WHERE ${conditions.join(" AND ")}
       ORDER BY c."wrCreatedAt" DESC`,
      { type: fastify.db.QueryTypes.SELECT, bind }
    );
    return result;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientAdmin/listClientsAdminQuery");
    throw new Error(err.message);
  }
};

const getClientByIdAdminQuery = async (clientId, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT ${ADMIN_CLIENT_SELECT_COLUMNS},
        p."wrMaxAccounts" as "maxAccounts",
        p."wrMaxGroups" as "maxGroups",
        p."wrMaxNotes" as "maxNotes"
       FROM "tblClient" c
       LEFT JOIN "tblPackages" p ON p."wrId" = c."wrPackageId"
       WHERE c."wrClientId" = $1 AND c."wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
    return result[0] || null;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientAdmin/getClientByIdAdminQuery");
    throw new Error(err.message);
  }
};

const updateClientStatusAdminQuery = async (clientId, isActive, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrIsActive" = $1, "wrUpdatedAt" = now()
       WHERE "wrClientId" = $2 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [isActive, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientAdmin/updateClientStatusAdminQuery");
    throw new Error(err.message);
  }
};

// Soft delete only -- flips wrIsDeleted, same convention every other tblClient
// query already filters on. That alone is enough to hide the client from this
// list/detail (see the "wrIsDeleted" = false conditions above) and block their
// login (repository/TableClient.js's email/googleId lookups filter it too), with
// no cascade needed and no loss of their encrypted vault data.
const deleteClientsAdminQuery = async (clientIds, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClient" SET "wrIsDeleted" = true, "wrUpdatedAt" = now()
       WHERE "wrClientId" = ANY($1) AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [clientIds] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientAdmin/deleteClientsAdminQuery");
    throw new Error(err.message);
  }
};

const getClientDevicesAdminQuery = async (clientId, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT
        "wrDeviceId" as "deviceId",
        "wrName" as "name",
        "wrDeviceType" as "deviceType",
        "wrBiometricEnrolled" as "biometricEnrolled",
        "wrLastSyncedDriveRevision" as "lastSyncedDriveRevision",
        "wrCreatedDate" as "createdDate"
       FROM "tblDevices"
       WHERE "wrUserId" = $1 AND "wrIsDeleted" = false
       ORDER BY "wrCreatedDate" DESC`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientAdmin/getClientDevicesAdminQuery");
    throw new Error(err.message);
  }
};

module.exports = {
  listClientsAdminQuery,
  getClientByIdAdminQuery,
  updateClientStatusAdminQuery,
  deleteClientsAdminQuery,
  getClientDevicesAdminQuery,
};

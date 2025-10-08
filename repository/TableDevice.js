const { errorLogger } = require("../utilities/logger");

const getAllDevicesQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT
        "wrDeviceId" as "deviceId",
        "wrName" as "name",
        "wrPushEndpoint" as "pushEndpoint",
        "wrPushP256DH" as "pushP256DH",
        "wrPushAuth" as "pushAuth",
        "wrCreatedDate" as "createdDate",
        "wrUserId" as "userId",
        "wrUserType" as "userType",
        "wrDeviceType" as "deviceType",
        "wrMobileToken" as "mobileToken",
        "wrTempCId" as "tempCId"
      FROM "tblDevices"
      WHERE "wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/getAllDevicesQuery"
    );
    throw new Error(err.message);
  }
};

const insertDeviceQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblDevices" (
        "wrName",
        "wrPushEndpoint",
        "wrPushP256DH",
        "wrPushAuth",
        "wrCreatedDate",
        "wrUserId",
        "wrUserType",
        "wrDeviceType",
        "wrMobileToken"
      ) VALUES ($1, $2, $3, $4, now(), $5, $6,$7,$8)
      RETURNING "wrDeviceId" as "deviceId",
        "wrName" as "name",
        "wrPushEndpoint" as "pushEndpoint",
        "wrPushP256DH" as "pushP256DH",
        "wrPushAuth" as "pushAuth",
        "wrCreatedDate" as "createdDate",
        "wrUserId" as "userId",
        "wrUserType" as "userType",
        "wrDeviceType" as "deviceType",
        "wrMobileToken" as "mobileToken"`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.name,
          data.pushEndpoint || "",
          data.pushP256DH || "",
          data.pushAuth || "",
          data.userId || 0,
          data.userType || 0,
          data.deviceType || 0,
          data.mobileToken || ""
        ],
      }
    );

    return result[0][0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/insertDeviceQuery",
      request
    );
    throw new Error(err.message);
  }
};
const saveDeviceQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblDevices" (
        "wrName",
        "wrPushEndpoint",
        "wrPushP256DH",
        "wrPushAuth",
        "wrCreatedDate",
        "wrUserId",
        "wrUserType",
        "wrDeviceType",
        "wrMobileToken",
        "wrTempCId"
      ) VALUES ($1, $2, $3, $4, now(), $5, $6,$7,$8 ,$9)
      RETURNING "wrDeviceId" as "deviceId",
        "wrName" as "name",
        "wrPushEndpoint" as "pushEndpoint",
        "wrPushP256DH" as "pushP256DH",
        "wrPushAuth" as "pushAuth",
        "wrCreatedDate" as "createdDate",
        "wrUserId" as "userId",
        "wrUserType" as "userType",
        "wrDeviceType" as "deviceType",
        "wrMobileToken" as "mobileToken",
        "wrTempCId" as "tempCId"`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.name,
          data.pushEndpoint || "",
          data.pushP256DH || "",
          data.pushAuth || "",
          data.userId || 0,
          data.userType || 0,
          data.deviceType || 0,
          data.mobileToken || "",
          data.tempCId || 0
        ],
      }
    );

    return result[0][0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/saveDeviceQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateDeviceQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblDevices" SET
        "wrName" = $1,
        "wrPushEndpoint" = $2,
        "wrPushP256DH" = $3,
        "wrPushAuth" = $4,
        "wrCreatedDate" = now(),
        "wrUserId" = $5,
        "wrUserType" = $6
      WHERE "wrDeviceId" = $7`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.name,
          data.pushEndpoint,
          data.pushP256DH,
          data.pushAuth,
          data.userId || null,
          data.userType,
          data.deviceId
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/updateDeviceQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteDeviceQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblDevices" SET
          "wrIsDeleted" = true,
          "wrDeletedBy" = null,
          "wrDeletedAt" = now()
      WHERE "wrDeviceId" = $1`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/deleteDeviceQuery",
      request
    );
    throw new Error(err.message);
  }
};
const dltDeviceQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblDevices" SET
          "wrIsDeleted" = true,
          "wrDeletedBy" = null,
          "wrDeletedAt" = now()
      WHERE "wrDeviceId" IN ($1)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDevice/deleteDeviceQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  getAllDevicesQuery,
  insertDeviceQuery,
  updateDeviceQuery,
  deleteDeviceQuery,
  saveDeviceQuery,
  dltDeviceQuery
};

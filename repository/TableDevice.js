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
        "wrUserType" as "userType"
      FROM "tblDevices"`,
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
        "wrUserType"
      ) VALUES ($1, $2, $3, $4, now(), $5, $6)
      RETURNING *`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.name,
          data.pushEndpoint,
          data.pushP256DH,
          data.pushAuth,
          data.userId,
          data.userType
        ],
      }
    );

    return result[0];
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
          data.userId,
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
      `DELETE FROM "tblDevices" WHERE "wrDeviceId" = $1`,
      {
        type: fastify.db.QueryTypes.DELETE,
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
};

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

module.exports = {
  getAllDevicesQuery,
};

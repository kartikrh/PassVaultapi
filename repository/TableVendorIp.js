const { errorLogger } = require("../utilities/logger");

const getAllVendorIpsQuery = async (fastify) => {
  return fastify.db.query(
    `
        SELECT
            "wrId" as "vendorIpId",
            "wrVendorId" as "vendorId",
            "wrIpAddress" as "ipAddress",
            "wrIsActive" as "isActive",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy",
            tu."WrUserName" as "createdByName"
        FROM "tblVendorIps"
        LEFT JOIN "tblUsers" tu ON tu."WrUserId" = "tblVendorIps"."wrCreatedBy"
        ORDER BY "wrId" DESC
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const createVendorIpQuery = async (data, request, fastify) => {
  try {
    const query = `
        INSERT INTO "tblVendorIps"
        ("wrVendorId", "wrIpAddress", "wrIsActive", "wrCreatedDate", "wrCreatedBy")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            "wrId" as "vendorIpId",
            "wrVendorId" as "vendorId",
            "wrIpAddress" as "ipAddress",
            "wrIsActive" as "isActive",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy"
    `;
    const result = await fastify.db.query(query, {
      bind: [
        data.vendorId,
        data.ipAddress,
        data.hasOwnProperty("isActive") ? data.isActive : false,
        new Date(),
        request.userTokenInfo.WrUserId,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/createVendorQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteVendorIpQuery = async (vendorIpId, request, fastify) => {
    try {
        const query = `
            DELETE FROM "tblVendorIps"
            WHERE "wrId" = ANY($1)
        `;
        const result = await fastify.db.query(query, {
            bind: [vendorIpId],
            type : fastify.db.QueryTypes.SELECT
        });
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVendors/deleteVendorIpQuery",
            request
          );
          throw new Error(err.message);
    }
}
const updateIsActiveVendorIpQuery = async (data, request, fastify) => {
    try {
        const query = `
            UPDATE "tblVendorIps"
            SET "wrIsActive" = $1
            WHERE "wrId" = $2
        `;
        const result = await fastify.db.query(query, {
            bind: [data.isActive, data.vendorIpId],
            type : fastify.db.QueryTypes.SELECT
        });
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVendors/updateIsActiveVendorIpQuery",
            request
          );
          throw new Error(err.message);
    }
}
module.exports = {
  getAllVendorIpsQuery,
  createVendorIpQuery,
  deleteVendorIpQuery,
  updateIsActiveVendorIpQuery
};

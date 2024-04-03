const { errorLogger } = require("../utilities/logger");

const getAllVendorsQuery = async (fastify) => {
  return fastify.db.query(
    `
        SELECT  
            "wrId" as "vendorId",
            "wrName" as "name",
            "wrKey" as "key",
            "wrSubscriptionDate" as "subscriptionDate",
            "wrExpiryDate" as "expiryDate",
            "wrIsActive" as "isActive",
            "wrIsIPCheck" as "isIPCheck",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy",
            tu."WrUserName" as "createdByName"
        FROM "tblVendors"
        LEFT JOIN "tblUsers" tu ON tu."WrUserId" = "tblVendors"."wrCreatedBy"
        ORDER BY "wrId" DESC
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const createVendorQuery = async (data, request, fastify) => {
  try {
    const query = `
        INSERT INTO "tblVendors"
        ("wrName", "wrKey", "wrSubscriptionDate", "wrExpiryDate", "wrIsActive", "wrIsIPCheck", "wrCreatedDate", "wrCreatedBy")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING   
            "wrId" as "vendorId",
            "wrName" as "name",
            "wrKey" as "key",
            "wrSubscriptionDate" as "subscriptionDate",
            "wrExpiryDate" as "expiryDate",
            "wrIsActive" as "isActive",
            "wrIsIPCheck" as "isIPCheck",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy"
    `;
    const result = await fastify.db.query(query, {
      bind: [
        data.name,
        data.key,
        new Date(),
        new Date(data.expiryDate),
        data.isActive,
        data.isIPCheck || false,
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
const updateVendorQuery = async (data, request, fastify) => {
  try {
    const query = `
        UPDATE "tblVendors"
        SET "wrName" = $1, "wrKey" = $2, "wrSubscriptionDate" = $3, "wrExpiryDate" = $4, "wrIsActive" = $5, "wrIsIPCheck" = $6
        WHERE "wrId" = $7
        RETURNING   
            "wrId" as "vendorId",
            "wrName" as "name",
            "wrKey" as "key",
            "wrSubscriptionDate" as "subscriptionDate",
            "wrExpiryDate" as "expiryDate",
            "wrIsActive" as "isActive",
            "wrIsIPCheck" as "isIPCheck",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy"
    `;
    const result = await fastify.db.query(query, {
      bind: [
        data.name,
        data.key,
        data.subscriptionDate,
        new Date(data.expiryDate),
        data.isActive,
        data.isIPCheck || false,
        data.vendorId,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/updateVendorQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteVendorQuery = async (vendorId, request, fastify) => {
  try {
    const query1 = `DELETE FROM "tblVendorIps" WHERE "wrVendorId" = ANY($1)`;
    await fastify.db.query(query1, {
      bind: [vendorId],
      type: fastify.db.QueryTypes.SELECT,
    });
    const query2 = `
            DELETE FROM "tblVendors"
            WHERE "wrId" = ANY($1)
        `;
    return await fastify.db.query(query2, {
      bind: [vendorId],
      type: fastify.db.QueryTypes.SELECT,
    });
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/deleteVendorQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateIsActiveVendorQuery = async (data, request, fastify) => {
  try {
    const query = `
        UPDATE "tblVendors"
        SET "wrIsActive" = $1
        WHERE "wrId" = $2
        RETURNING   
            "wrId" as "vendorId",
            "wrName" as "name",
            "wrKey" as "key",
            "wrSubscriptionDate" as "subscriptionDate",
            "wrExpiryDate" as "expiryDate",
            "wrIsActive" as "isActive",
            "wrIsIPCheck" as "isIPCheck",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy"
    `;
    const result = await fastify.db.query(query, {
      bind: [data.isActive, data.vendorId],
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/updateIsActiveVendorQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateIsIPCheckQuery = async (data, request, fastify) => {
  try {
    const query = `
        UPDATE "tblVendors"
        SET "wrIsIPCheck" = $1
        WHERE "wrId" = $2
        RETURNING   
            "wrId" as "vendorId",
            "wrName" as "name",
            "wrKey" as "key",
            "wrSubscriptionDate" as "subscriptionDate",
            "wrExpiryDate" as "expiryDate",
            "wrIsActive" as "isActive",
            "wrIsIPCheck" as "isIPCheck",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy"
    `;
    const result = await fastify.db.query(query, {
      bind: [data.isIPCheck, data.vendorId],
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/updateIsIPCheckQuery",
      request
    );
  }
};
module.exports = {
  getAllVendorsQuery,
  createVendorQuery,
  updateVendorQuery,
  deleteVendorQuery,
  updateIsActiveVendorQuery,
  updateIsIPCheckQuery
};

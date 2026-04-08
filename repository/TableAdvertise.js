const { errorLogger } = require("../utilities/logger");

const getAllAdvertiseQuery = async (fastify) => {
  return await fastify.db.query(`
        SELECT
            ta."wrId" as "advertiseId",
            ta."wrTitle" as "title",
            ta."wrImage" as "image",
            ta."wrLink" as "link",
            ta."wrIsPermanent" as "isPermanent",
            ta."wrIsActive" as "isActive",
            ta."wrStartDate" as "startDate",
            ta."wrEndDate" as "endDate",
            ta."wrViewerCount" as "viewerCount",
            ta."wrWhitelabelId" as "whitelabelId",
            ed."wrValue" as "encryptWhitelabelId",
            twl."wrDomain" as "domain"
        FROM "tblAdvertise" ta
        LEFT JOIN "tblWhitelabel" twl 
            ON ta."wrWhitelabelId" = twl."wrId"
        LEFT JOIN "tblEncryptedData" ed 
            ON ta."wrWhitelabelId" = ed."wrKey"
        WHERE ta."wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const createAdvertiseQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      WITH insert_data AS (
        INSERT INTO "tblAdvertise"
        (
          "wrTitle",
          "wrImage",
          "wrLink",
          "wrIsPermanent",
          "wrIsActive",
          "wrStartDate",
          "wrEndDate",
          "wrCreatedBy",
          "wrViewerCount",
          "wrWhitelabelId"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      )
      SELECT
        ta."wrId" as "advertiseId",
        ta."wrTitle" as "title",
        ta."wrImage" as "image",
        ta."wrLink" as "link",
        ta."wrIsPermanent" as "isPermanent",
        ta."wrIsActive" as "isActive",
        ta."wrStartDate" as "startDate",
        ta."wrEndDate" as "endDate",
        ta."wrViewerCount" as "viewerCount",
        ta."wrWhitelabelId" as "whitelabelId",
        ed."wrValue" as "encryptWhitelabelId",
        twl."wrDomain" as "domain"
      FROM insert_data ta
      LEFT JOIN "tblWhitelabel" twl 
        ON ta."wrWhitelabelId" = twl."wrId"
      LEFT JOIN "tblEncryptedData" ed 
        ON ta."wrWhitelabelId" = ed."wrKey"
      `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.title || null,
          data.image || null,
          data.link || null,
          data.isPermanent || false,
          data.isActive || false,
          data.startDate ? new Date(data.startDate) : null,
          data.endDate ? new Date(data.endDate) : null,
          request.userTokenInfo.WrUserId,
          data?.viewerCount || null,
          data?.whitelabelId ?? null
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAdvertise/insertAdvertiseQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateAdvertiseQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      UPDATE "tblAdvertise"
      SET
        "wrTitle"=$1,
        "wrImage"=$2,
        "wrLink"=$3,
        "wrIsPermanent"=$4,
        "wrIsActive"=$5,
        "wrStartDate"=$6,
        "wrEndDate"=$7,
        "wrUpdatedBy"=$8,
        "wrUpdatedAt"=now(),
        "wrViewerCount"=$10,
        "wrWhitelabelId"=$11
      WHERE "wrId"=$9
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.title || null,
          data.image,
          data.link || null,
          data.isPermanent || false,
          data.isActive || false,
          data.startDate,
          data.endDate,
          request.userTokenInfo.WrUserId,
          data.advertiseId,
          data?.viewerCount || null,
          data?.whitelabelId ?? null
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAdvertise/updateAdvertiseQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteAdvertiseQuery = async (ids, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      UPDATE "tblAdvertise"
      SET
        "wrIsDeleted"=true,
        "wrDeletedBy"=$1,
        "wrDeletedAt"=now()
      WHERE "wrId" = ANY($2)
      `,
      {
        bind: [request.userTokenInfo.WrUserId, ids],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAdvertise/deleteAdvertiseQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveAdvertiseQuery = async (data, request, fastify) => {
  return await fastify.db.query(
    `
    UPDATE "tblAdvertise"
    SET "wrIsActive"=$1
    WHERE "wrId"=$2
    `,
    {
      bind: [data.isActive, data.advertiseId],
    }
  );
};

const advertiseViewersCountQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
        update "tblAdvertise" set
        "wrViewerCount" = COALESCE("wrViewerCount", 0) + 1
        where "wrId" = $1
      `,
      {
        bind: [data.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAdvertise/advertiseViewersCountQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateAdvertiseViewCountQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
        update "tblAdvertise" set
        "wrViewerCount" = COALESCE("wrViewerCount", 0) + 1
        where "wrId" = $1
      `,
      {
        bind: [data.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAdvertise/updateAdvertiseViewCountQuery",
      request
    );
    throw new Error(err.message);
  }
}

module.exports = {
  getAllAdvertiseQuery,
  createAdvertiseQuery,
  updateAdvertiseQuery,
  deleteAdvertiseQuery,
  activeInactiveAdvertiseQuery,
  advertiseViewersCountQuery,
  updateAdvertiseViewCountQuery
};
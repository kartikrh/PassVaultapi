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
            ta."wrWhitelabelId" as "whitelabelId",
            ta."wrDisplayOrder" as "displayOrder"
        FROM "tblAdvertise" ta
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
          "wrWhitelabelId",
          "wrDisplayOrder"
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,
          COALESCE(
            $10,
            (SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 
             FROM "tblAdvertise" 
             WHERE "wrIsDeleted" = false)
          )
        )
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
        ta."wrWhitelabelId" as "whitelabelId",
        ta."wrDisplayOrder" as "displayOrder"
      FROM insert_data ta
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
          data?.whitelabelId ?? null,
          data?.displayOrder ?? null
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
        "wrWhitelabelId"=$10,
        "wrDisplayOrder"=$11
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
          data?.whitelabelId ?? null,
          data?.displayOrder ?? null
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

const changeDisplayOrderQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      UPDATE "tblAdvertise"
      SET "wrDisplayOrder" = $1
      WHERE "wrId" = $2
      `,
      {
        bind: [data.displayOrder, data.advertiseId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> updateDisplayOrderAdvertiseQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllAdvertiseQuery,
  createAdvertiseQuery,
  updateAdvertiseQuery,
  deleteAdvertiseQuery,
  activeInactiveAdvertiseQuery,
  changeDisplayOrderQuery
};
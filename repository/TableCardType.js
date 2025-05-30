const { errorLogger } = require("../utilities/logger");

const getAllCardTypeQuery = async (fastify) => {
  const result = await fastify.db.query(
    `SELECT 
          "wrId" as "id",
          "wrEnum" as "enum",
          "wrImage" as "image",
          "wrImagePath" as "imagePath",
          "wrIsActive" as "isActive",
          "wrIsDeleted" as "isDeleted"
      FROM "tblCardType"
      WHERE "wrIsDeleted" = FALSE;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
  return result;
};

const insertCardTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
            INSERT INTO "tblCardType" (
            "wrEnum", "wrImage", "wrImagePath", "wrIsActive", "wrCreatedBy", "wrCreatedDate"
            ) 
            VALUES (
                $1, $2, $3, $4, $5 ,now()
            ) 
            RETURNING *
            )        
            SELECT 
                "wrId" as "id",
                "wrEnum" as "enum",
                "wrImage" as "image",
                "wrImagePath" as "imagePath",
                "wrIsActive" as "isActive"
            FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.enum || null,
          data.image || null,
          data.imagePath || null,
          data.isActive || false,
          data.userId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCardType.js/insertCardTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCardTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCardType" SET 
            "wrEnum" = $1,
            "wrImage" = $2,
            "wrImagePath" = $3,
            "wrIsActive" = $4,
            "wrModifiedBy" = $5,
            "wrModifiedDate" = now()
            WHERE "wrId" = $6
            RETURNING 
                "wrId" as "id",
                "wrEnum" as "enum",
                "wrImage" as "image",
                "wrImagePath" as "imagePath",
                "wrIsActive" as "isActive";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.enum,
            data.image,
            data.imagePath,
            data.isActive,
            data.userId,
            data.id,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCardType.js/updateCardTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCardTypeQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCardType" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedDate" = now()
      WHERE "wrId" = ANY($3);`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCardType.js/deleteCardTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveCardTypeQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCardType" SET "wrIsActive" = $1 WHERE "wrId" = $2`,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCardType.js/activeInactiveCardTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
    getAllCardTypeQuery,
    insertCardTypeQuery,
    updateCardTypeQuery,
    deleteCardTypeQuery,
    activeInactiveCardTypeQuery,
};

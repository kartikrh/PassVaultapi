const { errorLogger } = require("../utilities/logger");

const getAllHideEventsQuery = async (fastify) => {
  return await fastify.db.query(
    `
        SELECT
            "wrId" as "id",
            "wrWhitelabelId" as "whitelabelId",
            "wrType" as "type",
            "wrRefId" as "refId",
            "wrCreatedBy" as "createdBy",
            "wrCreatedAt" as "createdAt",
            "wrIsDeleted" as "isDeleted",
            "wrDeletedAt" as "deletedAt",
            "wrDeletedBy" as "deletedBy"
        FROM "tblHideEvents"
        WHERE "wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const hideEventsQuery = async (data, request, fastify) => {
  try {
    const query = `
        INSERT INTO "tblHideEvents" (
            "wrWhitelabelId",
            "wrType",
            "wrRefId",
            "wrCreatedBy"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING 
            "wrId" as "id",
            "wrWhitelabelId" as "whitelabelId",
            "wrType" as "type",
            "wrRefId" as "refId",
            "wrCreatedBy" as "createdBy",
            "wrCreatedAt" as "createdAt",
            "wrIsDeleted" as "isDeleted",
            "wrDeletedAt" as "deletedAt",
            "wrDeletedBy" as "deletedBy"
    `;

    const result = await fastify.db.query(query, {
      bind: [
        data.whitelabelId,
        data.type,
        data.refId,
        request.userTokenInfo.WrUserId,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableHideEvents.js/hideEventsQuery",
      request
    );
    throw new Error(error.message);
  }
};
const unHideEventQuery = async (data, request, fastify) => {
  try {
    const query = `
        UPDATE "tblHideEvents"
        SET
            "wrIsDeleted" = true,
            "wrDeletedAt" = NOW(),
            "wrDeletedBy" = $1
        WHERE
            "wrId" = $2
        RETURNING 
            "wrId" as "id"
    `;

    const result = await fastify.db.query(query, {
      bind: [request.userTokenInfo.WrUserId, data.hideEventId],
      type: fastify.db.QueryTypes.SELECT,
    });

    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableHideEvents.js/unHideEventQuery",
      request
    );
    throw new Error(error.message);
  }
};
module.exports = {
  getAllHideEventsQuery,
  hideEventsQuery,
  unHideEventQuery
};

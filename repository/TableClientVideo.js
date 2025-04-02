const { errorLogger } = require("../utilities/logger");

const allClientVideoQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrTitle" as "title",
            "wrURL" as "URL",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCredit" as "credit",
            "wrViewerCount" as "viewerCount",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt",
            "wrImagePath" as "imagePath"
            FROM "tblClientVideos"
            WHERE "wrIsDeleted" = false;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientVideo.js/allClientVideoQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertClientVideoQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblClientVideos" (
            "wrTitle", "wrURL", "wrImage", "wrIsActive", "wrCredit",
            "wrViewerCount", "wrCreatedAt", "wrCreatedBy", "wrImagePath"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, now(), $7, $8
            ) 
            RETURNING *
            )        
            SELECT 
            "wrId" as "id",
            "wrTitle" as "title",
            "wrURL" as "URL",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCredit" as "credit",
            "wrViewerCount" as "viewerCount",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt",
            "wrImagePath" as "imagePath"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.title,
                    data.URL,
                    data.image,
                    data.isActive || false,
                    data.credit,
                    data.viewerCount || 0,
                    request.userTokenInfo.WrUserId,
                    data.imagePath || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientVideo.js/insertClientVideoQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateClientVideoQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblClientVideos" SET 
            "wrTitle" = $1,
            "wrURL" = $2,
            "wrImage" = $3,
            "wrIsActive" = $4,
            "wrCredit" = $5,
            "wrModifiedBy" = $6,
            "wrModifiedAt" = now(),
            "wrViewerCount" = $7,
            "wrImagePath" = $9
            WHERE "wrId" = $8
            RETURNING 
            "wrId" as "id",
            "wrTitle" as "title",
            "wrURL" as "URL",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCredit" as "credit",
            "wrViewerCount" as "viewerCount",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt",
            "wrImagePath" as "imagePath";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.title,
                    data.URL,
                    data.image,
                    data.isActive || false,
                    data.credit,
                    request.userTokenInfo.WrUserId,
                    data.viewerCount,
                    data.id,
                    data.imagePath
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientVideo.js/updateClientVideoQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteClientVideosQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblClientVideos" SET
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
            WHERE "wrId" = ANY ($3)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [true, request.userTokenInfo.WrUserId, id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientVideo.js/deleteClientVideosQuery",
            request
        );
        throw new Error(err.message);
    }
};


const activeInactiveClientVideoQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  update "tblClientVideos" set
                  "wrIsActive" = $1
                  where "wrId" = $2
              `,
        {
          bind: [data.isActive, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableClientVideo.js/activeInactiveClientVideoQuery",
        request
      );
      throw new Error(err.message);
    }
  };

module.exports = {
    allClientVideoQuery,
    insertClientVideoQuery,
    updateClientVideoQuery,
    deleteClientVideosQuery,
    activeInactiveClientVideoQuery
};
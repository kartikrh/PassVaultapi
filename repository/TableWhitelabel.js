const { errorLogger } = require("../utilities/logger");

const getAllWhitelabelsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin"
            FROM "tblWhitelabel"
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/getAllWhitelabelsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertWhitelabelQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblWhitelabel" (
            "wrDomain", "wrImagepath", "wrIsActive", "wrCreatedAt", "wrCreatedBy"
            ) 
            VALUES (
                $1, $2, $3, NOW(), $4
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.domain,
                    data.imagePath || null,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/insertWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateWhitelabelQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblWhitelabel" SET 
                "wrDomain" = $1,
                "wrImagepath" = $2,
                "wrIsActive" = $3,
                "wrUpdatedBy" = $4,
                "wrUpdatedAt" = NOW()
            WHERE "wrId" = $5
            RETURNING 
                "wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.domain,
                    data.imagePath,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.id
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/updateWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteWhitelabelQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblWhitelabel" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrId" = ANY ($3)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [true, request.userTokenInfo.WrUserId, id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/deleteWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveWhitelabelQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblWhitelabel" SET
                    "wrIsActive" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isActive, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableWhitelabel.js/activeInactiveWhitelabelQuery",
        request
      );
      throw new Error(err.message);
    }
};

module.exports = {
    getAllWhitelabelsQuery,
    insertWhitelabelQuery,
    updateWhitelabelQuery,
    deleteWhitelabelQuery,
    activeInactiveWhitelabelQuery,
};
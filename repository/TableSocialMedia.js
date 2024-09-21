const { errorLogger } = require("../utilities/logger");

const allSocialMediaQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrName" as "name",
            "wrLink" as "link",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt"
            FROM "tblSocialMedias";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSocialMedia.js/allSocialMediaQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertSocialMediaQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblSocialMedias" (
            "wrName", "wrLink", "wrImage", "wrIsActive", "wrCreatedAt", "wrCreatedBy"
            ) 
            VALUES (
                $1, $2, $3, $4, now(), $5
            ) 
            RETURNING *
            )        
            SELECT 
            "wrId" as "id",
            "wrName" as "name",
            "wrLink" as "link",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.name,
                    data.link,
                    data.image || "",
                    data.isActive || false,
                    request.userTokenInfo.WrUserId
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSocialMedia.js/insertSocialMediaQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateSocialMediaQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblSocialMedias" SET 
            "wrName" = $1,
            "wrLink" = $2,
            "wrImage" = $3,
            "wrIsActive" = $4,
            "wrModifiedBy" = $5,
            "wrModifiedAt" = now()
            WHERE "wrId" = $6
            RETURNING 
            "wrId" as "id",
            "wrName" as "name",
            "wrLink" as "link",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedAt" as "modifiedAt";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.name,
                    data.link,
                    data.image,
                    data.isActive || false,
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
            "DB ERROR --> repository/TableSocialMedia.js/updateSocialMediaQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteSocialMediaQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `delete from "tblSocialMedias" where "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSocialMedia.js/deleteSocialMediaQuery",
            request
        );
        throw new Error(err.message);
    }
};


const activeInactiveSocialMediaQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  update "tblSocialMedias" set
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
        "DB ERROR --> repository/TableSocialMedia.js/activeInactiveSocialMediaQuery",
        request
      );
      throw new Error(err.message);
    }
  };

module.exports = {
    allSocialMediaQuery,
    insertSocialMediaQuery,
    updateSocialMediaQuery,
    deleteSocialMediaQuery,
    activeInactiveSocialMediaQuery
};
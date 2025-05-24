const { errorLogger } = require("../utilities/logger");

const getAllVenuesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrCountryId" as "countryId",
                "wrCity" as "city",
                "wrName" as "name",
                "wrTpId" as "tpId",
                "wrIsActive" as "isActive",
                "wrCapacity" as "capacity",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM "tblVenues"
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVenue.js/getAllVenuesQuery",
            null
        );
        throw new Error(err.message);
    }
};
const insertVenueQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblVenues" (
            "wrCountryId", "wrCity", "wrName", "wrTpId", "wrIsActive", "wrCapacity",
            "wrCreatedBy", "wrCreatedAt"
            ) 
            VALUES (
                $1, $2, $3,  $4, $5 ,$6, $7, NOW()
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrCountryId" as "countryId",
                "wrCity" as "city",
                "wrName" as "name",
                "wrTpId" as "tpId",
                "wrIsActive" as "isActive",
                "wrCapacity" as "capacity",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM insert_data
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.countryId,
                    data.city || null,
                    data.name || null,
                    data.tpId || null,
                    data.isActive,
                    data.capacity || null,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVenue.js/insertVenueQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateVenueQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblVenues" SET 
                "wrCountryId" = $1,
                "wrCity" = $2,
                "wrName" = $3,
                "wrTpId" = $4,
                "wrIsActive" = $5,
                "wrCapacity" = $6,
                "wrUpdatedBy" = $7,
                "wrUpdatedAt" = NOW()
            WHERE "wrId" = $8
            RETURNING 
                "wrId" as "id",
                "wrCountryId" as "countryId",
                "wrCity" as "city",
                "wrName" as "name",
                "wrTpId" as "tpId",
                "wrIsActive" as "isActive",
                "wrCapacity" as "capacity",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.countryId,
                    data.city,
                    data.name,
                    data.tpId,
                    data.isActive,
                    data.capacity,
                    request.userTokenInfo.WrUserId,
                    data.id,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVenue.js/updateVenueQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteVenueQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblVenues" SET
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
            "DB ERROR --> repository/TableVenue.js/deleteVenueQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveVenueQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblVenues" SET
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
        "DB ERROR --> repository/TableVenue.js/activeInactiveVenueQuery",
        request
      );
      throw new Error(err.message);
    }
};

module.exports = {
    getAllVenuesQuery,
    insertVenueQuery,
    updateVenueQuery,
    deleteVenueQuery,
    activeInactiveVenueQuery,
};
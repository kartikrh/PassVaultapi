const { errorLogger } = require("../utilities/logger");

const getAllVenuesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                tv."wrId" as "id",
                tv."wrCountryId" as "countryId",
                tcc."wrCountryName" as "countryName",
                tv."wrCity" as "city",
                tv."wrName" as "name",
                tv."wrTpId" as "tpId",
                tv."wrIsActive" as "isActive",
                tv."wrCapacity" as "capacity",
                tv."wrCreatedBy" as "createdBy",
                tv."wrCreatedAt" as "createdAt",
                tv."wrUpdatedBy" as "updatedBy",
                tv."wrUpdatedAt" as "updatedAt",
                tv."wrAvgInn1Score" as "avgInn1Score",
                tv."wrAvgInn2Score" as "avgInn2Score",
                tv."wrAvgInn3Score" as "avgInn3Score",
                tv."wrAvgInn4Score" as "avgInn4Score",
                tv."wrHighestTotalFullScore" as "highestTotalFullScore",
                tv."wrLowestTotalFullScore" as "lowestTotalFullScore",
                tv."wrSpinWicketsCount" as "spinWicketsCount",
                tv."wrPaceWicketsCount" as "paceWicketsCount"
            FROM "tblVenues" as tv
            LEFT JOIN "tblCountryCodes" tcc ON tcc."wrId" = tv."wrCountryId"
            WHERE tv."wrIsDeleted" = FALSE;`,
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
            "wrAvgInn1Score", "wrAvgInn2Score", "wrAvgInn3Score", "wrAvgInn4Score", "wrHighestTotalFullScore", "wrLowestTotalFullScore", "wrSpinWicketsCount", "wrPaceWicketsCount",
            "wrCreatedBy", "wrCreatedAt"
            ) 
            VALUES (
                $1, $2, $3,  $4, $5 ,$6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()
            )
            RETURNING *
            )
            SELECT 
                tv."wrId" as "id",
                tv."wrCountryId" as "countryId",
                tcc."wrCountryName" as "countryName",
                tv."wrCity" as "city",
                tv."wrName" as "name",
                tv."wrTpId" as "tpId",
                tv."wrIsActive" as "isActive",
                tv."wrCapacity" as "capacity",
                tv."wrCreatedBy" as "createdBy",
                tv."wrCreatedAt" as "createdAt",
                tv."wrUpdatedBy" as "updatedBy",
                tv."wrUpdatedAt" as "updatedAt",
                tv."wrAvgInn1Score" as "avgInn1Score",
                tv."wrAvgInn2Score" as "avgInn2Score",
                tv."wrAvgInn3Score" as "avgInn3Score",
                tv."wrAvgInn4Score" as "avgInn4Score",
                tv."wrHighestTotalFullScore" as "highestTotalFullScore",
                tv."wrLowestTotalFullScore" as "lowestTotalFullScore",
                tv."wrSpinWicketsCount" as "spinWicketsCount",
                tv."wrPaceWicketsCount" as "paceWicketsCount"
            FROM insert_data as tv
            LEFT JOIN "tblCountryCodes" tcc ON tcc."wrId" = tv."wrCountryId"`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.countryId || null,
                    data.city || null,
                    data.name || null,
                    data.tpId || null,
                    data.isActive,
                    data.capacity || null,
                    data.avgInn1Score || 0,
                    data.avgInn2Score || 0,
                    data.avgInn3Score || 0,
                    data.avgInn4Score || 0,
                    data.highestTotalFullScore || null,
                    data.lowestTotalFullScore || null,
                    data.spinWicketsCount || 0,
                    data.paceWicketsCount || 0,
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
            `WITH updated_data AS (
            UPDATE "tblVenues" SET 
                "wrCountryId" = $1,
                "wrCity" = $2,
                "wrName" = $3,
                "wrTpId" = $4,
                "wrIsActive" = $5,
                "wrCapacity" = $6,
                "wrAvgInn1Score" = $7,
                "wrAvgInn2Score" = $8,
                "wrAvgInn3Score" = $9,
                "wrAvgInn4Score" = $10,
                "wrHighestTotalFullScore" = $11,
                "wrLowestTotalFullScore" = $12,
                "wrSpinWicketsCount" = $13,
                "wrPaceWicketsCount" = $14,
                "wrUpdatedBy" = $15,
                "wrUpdatedAt" = NOW()
            WHERE "wrId" = $16
            RETURNING *
        )
            SELECT 
                tv."wrId" as "id",
                tv."wrCountryId" as "countryId",
                tcc."wrCountryName" as "countryName",
                tv."wrCity" as "city",
                tv."wrName" as "name",
                tv."wrTpId" as "tpId",
                tv."wrIsActive" as "isActive",
                tv."wrCapacity" as "capacity",
                tv."wrCreatedBy" as "createdBy",
                tv."wrCreatedAt" as "createdAt",
                tv."wrUpdatedBy" as "updatedBy",
                tv."wrUpdatedAt" as "updatedAt",
                tv."wrAvgInn1Score" as "avgInn1Score",
                tv."wrAvgInn2Score" as "avgInn2Score",
                tv."wrAvgInn3Score" as "avgInn3Score",
                tv."wrAvgInn4Score" as "avgInn4Score",
                tv."wrHighestTotalFullScore" as "highestTotalFullScore",
                tv."wrLowestTotalFullScore" as "lowestTotalFullScore",
                tv."wrSpinWicketsCount" as "spinWicketsCount",
                tv."wrPaceWicketsCount" as "paceWicketsCount"
            FROM updated_data tv
            LEFT JOIN "tblCountryCodes" tcc ON tcc."wrId" = tv."wrCountryId";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.countryId,
                    data.city,
                    data.name,
                    data.tpId,
                    data.isActive,
                    data.capacity,
                    data.avgInn1Score || 0,
                    data.avgInn2Score || 0,
                    data.avgInn3Score || 0,
                    data.avgInn4Score || 0,
                    data.highestTotalFullScore || null,
                    data.lowestTotalFullScore || null,
                    data.spinWicketsCount || 0,
                    data.paceWicketsCount || 0,
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
const getVenuesByIdsQuery = async (whereCondition = undefined, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                tv."wrId" as "id",
                tv."wrCountryId" as "countryId",
                tcc."wrCountryName" as "countryName",
                tv."wrCity" as "city",
                tv."wrName" as "name",
                tv."wrTpId" as "tpId",
                tv."wrIsActive" as "isActive",
                tv."wrCapacity" as "capacity",
                tv."wrCreatedBy" as "createdBy",
                tv."wrCreatedAt" as "createdAt",
                tv."wrUpdatedBy" as "updatedBy",
                tv."wrUpdatedAt" as "updatedAt",
                tv."wrAvgInn1Score" as "avgInn1Score",
                tv."wrAvgInn2Score" as "avgInn2Score",
                tv."wrAvgInn3Score" as "avgInn3Score",
                tv."wrAvgInn4Score" as "avgInn4Score",
                tv."wrHighestTotalFullScore" as "highestTotalFullScore",
                tv."wrLowestTotalFullScore" as "lowestTotalFullScore",
                tv."wrSpinWicketsCount" as "spinWicketsCount",
                tv."wrPaceWicketsCount" as "paceWicketsCount"
            FROM "tblVenues" as tv
            LEFT JOIN "tblCountryCodes" tcc ON tcc."wrId" = tv."wrCountryId"
            ${whereCondition ? `WHERE ${whereCondition}` : 'WHERE tv."wrIsDeleted" = FALSE'}`,
            { type: fastify.db.QueryTypes.SELECT }
        );
        return result[0];
    } catch (err) {
        console.log("venue error", err)
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableVenue.js/getVenuesByIdsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const getVenueByIds = async (data, request, fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            tv."wrId" as "id",
            tv."wrCountryId" as "countryId",
            tcc."wrCountryName" as "countryName",
            tv."wrCity" as "city",
            tv."wrName" as "name",
            tv."wrTpId" as "tpId",
            tv."wrIsActive" as "isActive",
            tv."wrCapacity" as "capacity",
            tv."wrCreatedBy" as "createdBy",
            tv."wrCreatedAt" as "createdAt",
            tv."wrUpdatedBy" as "updatedBy",
            tv."wrUpdatedAt" as "updatedAt",
            tv."wrAvgInn1Score" as "avgInn1Score",
            tv."wrAvgInn2Score" as "avgInn2Score",
            tv."wrAvgInn3Score" as "avgInn3Score",
            tv."wrAvgInn4Score" as "avgInn4Score",
            tv."wrHighestTotalFullScore" as "highestTotalFullScore",
            tv."wrLowestTotalFullScore" as "lowestTotalFullScore",
            tv."wrSpinWicketsCount" as "spinWicketsCount",
            tv."wrPaceWicketsCount" as "paceWicketsCount"
            FROM "tblVenues" as tv 
            LEFT JOIN "tblCountryCodes" tcc ON tcc."wrId" = tv."wrCountryId" 
        WHERE 
        tv."wrId" = ANY($1) AND 
        tv."wrIsDeleted" = false`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.venueIds
                ]
            }
        );
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableVenue.js/getVenueByIds",
            request
        );
        return true;
        // throw new Error(err.message);
    }
};

module.exports = {
    getAllVenuesQuery,
    insertVenueQuery,
    updateVenueQuery,
    deleteVenueQuery,
    activeInactiveVenueQuery,
    getVenuesByIdsQuery,
    getVenueByIds,
};
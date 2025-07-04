const { errorLogger } = require("../utilities/logger");

const getAllAutoImportDataQuery = async (request, fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrEventTypeId" as "eventTypeId",
                "wrCompetitionId" as "competitionId",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/getAllAutoImportDataQuery",
            request || null
        );
        throw new Error(err.message);
    }
};

const getAutoImportDataByIdQuery = async (whereCondition = undefined, request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrEventTypeId" as "eventTypeId",
                "wrCompetitionId" as "competitionId",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            { type: fastify.db.QueryTypes.SELECT }
        );
        return result[0]
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/getAutoImportDataByIdQuery",
            request || null
        );
        throw new Error(err.message);
    }
};
const insertAutoImportDataQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblAutoImportData" (
            "wrRefId", "wrRefType", "wrSourceId", "wrIsImported", "wrIsImportStart", "wrImportStartTime",
            "wrImportEndTime", "wrEventTypeId", "wrCompetitionId", "wrCreatedBy", "wrCreateDate"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrEventTypeId" as "eventTypeId",
                "wrCompetitionId" as "competitionId",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.refId || null,
                    data.refType || null,
                    data.sourceId || null,
                    true,
                    false,
                    null,
                    null,
                    data.eventTypeId ?? null,
                    data.competitionId ?? null,
                    request.userTokenInfo?.WrUserId || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/insertAutoImportDataQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateAutoImportDataQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH updated_data AS (
            UPDATE "tblAutoImportData" SET 
                "wrRefId" = $1,
                "wrRefType" = $2,
                "wrSourceId" = $3,
                "wrIsImported" = $4,
                "wrIsImportStart" = $5,
                "wrImportStartTime" = $6,
                "wrImportEndTime" = $7,
                "wrEventTypeId" = $9,
                "wrCompetitionId" = $10
            WHERE "wrId" = $8
            RETURNING *
        )
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrEventTypeId" as "eventTypeId",
                "wrCompetitionId" as "competitionId",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM updated_data;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.refId,
                    data.refType,
                    data.sourceId,
                    data.isImported,
                    data.isImportStart,
                    data.importStartTime,
                    data.importEndTime,
                    data.id,
                    data.eventTypeId,
                    data.competitionId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/updateAutoImportDataQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllAutoImportDataQuery,
    getAutoImportDataByIdQuery,
    insertAutoImportDataQuery,
    updateAutoImportDataQuery,
};
const { errorLogger } = require("../utilities/logger");

const getAllCompetitionStatisticsTypeQuery = async (fastify, request = null) => {
    try {
        let query = `
            SELECT
                tcst."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                tcst."wrEventTypeId" as "eventTypeId",
                tet."wrEventType" as "eventType",
                tcst."wrTypeId" as "typeId",
                tcst."wrName" as "name",
                tcst."wrEntityEnum" as "entityEnum",
                tcst."wrDisplayOrder" as "displayOrder",
                tcst."wrDescription" as "description",
                tcst."wrIsActive" as "isActive",
                tcst."wrCreatedBy" as "createdById",
                tu."WrName" as "createdBy"
            FROM "tblCompetitionStatisticsType" tcst
            INNER JOIN "tblEventTypes" tet on tcst."wrEventTypeId" = tet."wrEventTypeId"
            INNER JOIN "tblUsers" tu on tcst."wrCreatedBy" = tu."WrUserId"
            WHERE tcst."wrIsDeleted" = FALSE
        `;

        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCompetitionStatisticsType.js/getAllCompetitionStatisticsTypeQuery",
            request
        );
        throw new Error(error.message);
    }
}

const insertCompetitionStatisticsTypeQuery = async (data, fastify, request) => {
    try {
        const queryResult = await fastify.db.query(
            `
                WITH insert_data AS (
                  INSERT INTO "tblCompetitionStatisticsType"
                  ("wrEventTypeId", "wrTypeId", "wrName", "wrEntityEnum", "wrDisplayOrder", "wrDescription", "wrIsActive",
                   "wrCreatedBy", "wrIsDeleted")
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                  RETURNING *
                )
                SELECT
                    tcst."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                    tcst."wrEventTypeId" as "eventTypeId",
                    tet."wrEventType" as "eventType",
                    tcst."wrTypeId" as "typeId",
                    tcst."wrName" as "name",
                    tcst."wrEntityEnum" as "entityEnum",
                    tcst."wrDisplayOrder" as "displayOrder",
                    tcst."wrDescription" as "description",
                    tcst."wrIsActive" as "isActive",
                    tcst."wrCreatedBy" as "createdById",
                    tu."WrName" as "createdBy"
                FROM "insert_data" tcst
                INNER JOIN "tblEventTypes" tet on tcst."wrEventTypeId" = tet."wrEventTypeId"
                INNER JOIN "tblUsers" tu on tcst."wrCreatedBy" = tu."WrUserId"
                WHERE tcst."wrIsDeleted" = FALSE
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data?.eventTypeId ?? null,
                    data?.typeId ?? null,
                    data?.name ?? null,
                    data?.entityEnum ?? null,
                    data?.displayOrder ?? null,
                    data?.description ?? null,
                    data?.isActive ?? true,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    false
                ]
            }
        );

        return queryResult[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatisticsType.js/insertCompetitionStatisticsTypeQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateCompetitionStatisticsTypeByIdQuery = async (data, fastify, request) => {
    try {
        const queryResult = await fastify.db.query(
            `
                WITH update_data AS (
                    UPDATE "tblCompetitionStatisticsType"
                    SET
                        "wrEntityEnum" = $1,
                        "wrDisplayOrder" = $2,
                        "wrDescription" = $3,
                        "wrIsActive" = $4,
                        "wrUpdatedBy" = $5,
                        "wrUpdatedAt" = $6
                    WHERE "wrCompetitionStatisticsTypeId" = $7
                    RETURNING *
                )
                SELECT
                    tcst."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                    tcst."wrEventTypeId" as "eventTypeId",
                    tet."wrEventType" as "eventType",
                    tcst."wrTypeId" as "typeId",
                    tcst."wrName" as "name",
                    tcst."wrEntityEnum" as "entityEnum",
                    tcst."wrDisplayOrder" as "displayOrder",
                    tcst."wrDescription" as "description",
                    tcst."wrIsActive" as "isActive",
                    tcst."wrCreatedBy" as "createdById",
                    tu."WrName" as "createdBy"
                FROM "update_data" tcst
                INNER JOIN "tblEventTypes" tet on tcst."wrEventTypeId" = tet."wrEventTypeId"
                INNER JOIN "tblUsers" tu on tcst."wrCreatedBy" = tu."WrUserId"
                WHERE tcst."wrIsDeleted" = FALSE
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.entityEnum,
                    data.displayOrder,
                    data.description,
                    data.isActive,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    data.competitionStatisticsTypeId
                ]
            }
        );

        return queryResult[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatisticsType.js/updateCompetitionStatisticsTypeByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteCompetitionStatisticsTypeByIdQuery = async (competitionStatisticsTypeId, fastify, request) => {
    try {
        await fastify.db.query(
            `
                UPDATE "tblCompetitionStatisticsType"
                SET
                    "wrIsActive" = $1,
                    "wrIsDeleted" = $2,
                    "wrDeletedBy" = $3,
                    "wrDeletedAt" = $4
                WHERE "wrCompetitionStatisticsTypeId" = ANY($5)
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    false,
                    true,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    competitionStatisticsTypeId
                ]
            }
        );

        return true;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatisticsType.js/deleteCompetitionStatisticsTypeByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateCompetitionStatisticsTypeDisplayOrderQuery = async (body, request, fastify) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblCompetitionStatisticsType" SET "wrDisplayOrder" = $1 WHERE "wrCompetitionStatisticsTypeId" = $2`,
            {
                bind: [body.displayOrder, body.competitionStatisticsTypeId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatisticsType.js/updateCompetitionStatisticsTypeDisplayOrderQuery",
            request
        );
        throw new Error(err.message);
    }
}

module.exports = {
    getAllCompetitionStatisticsTypeQuery,
    insertCompetitionStatisticsTypeQuery,
    updateCompetitionStatisticsTypeByIdQuery,
    deleteCompetitionStatisticsTypeByIdQuery,
    updateCompetitionStatisticsTypeDisplayOrderQuery
};
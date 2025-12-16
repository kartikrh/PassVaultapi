const { errorLogger } = require("../utilities/logger");

const getAllCompetitionStatisticsQuery = async (fastify, request = null) => {
    try {
        let query = `
            SELECT
                tcs."wrCompetitionStatisticsId" as "competitionStatisticsId",
                tcs."wrEventTypeId" as "eventTypeId",
                tet."wrEventType" as "eventType",
                tcs."wrCompetitionId" as "competitionId",
                tc."wrCompetition" as "competition",
                tcs."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                tcst."wrName" as "name",
                tcs."wrTeamId" as "teamId",
                tt."wrTeamName" as "teamName",
                tcs."wrPlayerId" as "playerId",
                tp."wrPlayerName" as "playerName",
                tcs."wrDisplayOrder" as "displayOrder",
                tcs."wrValue" as "value",
                tcs."wrIsActive" as "isActive",
                tcs."wrCreatedBy" as "createdById",
                tu."WrName" as "createdBy"
            FROM "tblCompetitionStatistics" tcs
            LEFT JOIN "tblEventTypes" tet on tcs."wrEventTypeId" = tet."wrEventTypeId"
            LEFT JOIN "tblCompetitions" tc on tcs."wrCompetitionId" = tc."wrCompetitionId"
            LEFT JOIN "tblCompetitionStatisticsType" tcst on tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
            LEFT JOIN "tblTeams" tt on tcs."wrTeamId" = tt."wrTeamId"
            LEFT JOIN "tblPlayers" tp on tcs."wrPlayerId" = tp."wrPlayerId"
            LEFT JOIN "tblUsers" tu on tcs."wrCreatedBy" = tu."WrUserId"
            WHERE tcs."wrIsDeleted" = FALSE
        `;

        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCompetitionStatistics.js/getAllCompetitionStatisticsQuery",
            request
        );
        throw new Error(error.message);
    }
}

const insertCompetitionStatisticsQuery = async (data, fastify, request) => {
    try {
        const queryResult = await fastify.db.query(
            `
                WITH insert_data AS (
                  INSERT INTO "tblCompetitionStatistics"
                  ("wrEventTypeId", "wrCompetitionId", "wrCompetitionStatisticsTypeId", "wrTeamId", "wrPlayerId", "wrDisplayOrder", "wrValue",
                  "wrIsActive", "wrCreatedBy", "wrIsDeleted")
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                  RETURNING *
                )
                SELECT
                    tcs."wrCompetitionStatisticsId" as "competitionStatisticsId",
                    tcs."wrEventTypeId" as "eventTypeId",
                    tet."wrEventType" as "eventType",
                    tcs."wrCompetitionId" as "competitionId",
                    tc."wrCompetition" as "competition",
                    tcs."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                    tcst."wrName" as "name",
                    tcs."wrTeamId" as "teamId",
                    tt."wrTeamName" as "teamName",
                    tcs."wrPlayerId" as "playerId",
                    tp."wrPlayerName" as "playerName",
                    tcs."wrDisplayOrder" as "displayOrder",
                    tcs."wrValue" as "value",
                    tcs."wrIsActive" as "isActive",
                    tcs."wrCreatedBy" as "createdById",
                    tu."WrName" as "createdBy"
                FROM "insert_data" tcs
                LEFT JOIN "tblEventTypes" tet on tcs."wrEventTypeId" = tet."wrEventTypeId"
                LEFT JOIN "tblCompetitions" tc on tcs."wrCompetitionId" = tc."wrCompetitionId"
                LEFT JOIN "tblCompetitionStatisticsType" tcst on tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
                LEFT JOIN "tblTeams" tt on tcs."wrTeamId" = tt."wrTeamId"
                LEFT JOIN "tblPlayers" tp on tcs."wrPlayerId" = tp."wrPlayerId"
                LEFT JOIN "tblUsers" tu on tcs."wrCreatedBy" = tu."WrUserId"
                WHERE tcs."wrIsDeleted" = FALSE
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data?.eventTypeId ?? null,
                    data?.competitionId ?? null,
                    data?.competitionStatisticsTypeId ?? null,
                    data?.teamId ?? null,
                    data?.playerId ?? null,
                    data?.displayOrder ?? null,
                    data?.value ?? null,
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
            "DB ERROR --> repository/TableCompetitionStatistics.js/insertCompetitionStatisticsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateCompetitionStatisticsByIdQuery = async (data, fastify, request) => {
    try {
        const queryResult = await fastify.db.query(
            `
                WITH update_data AS (
                    UPDATE "tblCompetitionStatistics"
                    SET
                        "wrTeamId" = $1,
                        "wrPlayerId" = $2,
                        "wrValue" = $3,
                        "wrDisplayOrder" = $4,
                        "wrIsActive" = $5,
                        "wrUpdatedBy" = $6,
                        "wrUpdatedAt" = $7
                    WHERE "wrCompetitionStatisticsId" = $8
                    RETURNING *
                )
                SELECT
                    tcs."wrCompetitionStatisticsId" as "competitionStatisticsId",
                    tcs."wrEventTypeId" as "eventTypeId",
                    tet."wrEventType" as "eventType",
                    tcs."wrCompetitionId" as "competitionId",
                    tc."wrCompetition" as "competition",
                    tcs."wrCompetitionStatisticsTypeId" as "competitionStatisticsTypeId",
                    tcst."wrName" as "name",
                    tcs."wrTeamId" as "teamId",
                    tt."wrTeamName" as "teamName",
                    tcs."wrPlayerId" as "playerId",
                    tp."wrPlayerName" as "playerName",
                    tcs."wrDisplayOrder" as "displayOrder",
                    tcs."wrValue" as "value",
                    tcs."wrIsActive" as "isActive",
                    tcs."wrCreatedBy" as "createdById",
                    tu."WrName" as "createdBy"
                FROM "update_data" tcs
                LEFT JOIN "tblEventTypes" tet on tcs."wrEventTypeId" = tet."wrEventTypeId"
                LEFT JOIN "tblCompetitions" tc on tcs."wrCompetitionId" = tc."wrCompetitionId"
                LEFT JOIN "tblCompetitionStatisticsType" tcst on tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
                LEFT JOIN "tblTeams" tt on tcs."wrTeamId" = tt."wrTeamId"
                LEFT JOIN "tblPlayers" tp on tcs."wrPlayerId" = tp."wrPlayerId"
                LEFT JOIN "tblUsers" tu on tcs."wrCreatedBy" = tu."WrUserId"
                WHERE tcs."wrIsDeleted" = FALSE
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.teamId,
                    data.playerId,
                    data.value,
                    data.displayOrder,
                    data.isActive,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    data.competitionStatisticsId
                ]
            }
        );

        return queryResult[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatistics.js/updateCompetitionStatisticsByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteCompetitionStatisticsByIdQuery = async (competitionStatisticsId, fastify, request) => {
    try {
        await fastify.db.query(
            `
                UPDATE "tblCompetitionStatistics"
                SET
                    "wrIsActive" = $1,
                    "wrIsDeleted" = $2,
                    "wrDeletedBy" = $3,
                    "wrDeletedAt" = $4
                WHERE "wrCompetitionStatisticsId" = ANY($5)
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    false,
                    true,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    competitionStatisticsId
                ]
            }
        );

        return true;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatistics.js/deleteCompetitionStatisticsByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateCompetitionStatisticsDisplayOrderQuery = async (body, request, fastify) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblCompetitionStatistics" SET "wrDisplayOrder" = $1 WHERE "wrCompetitionStatisticsId" = $2`,
            {
                bind: [body.displayOrder, body.competitionStatisticsId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatistics.js/updateCompetitionStatisticsDisplayOrderQuery",
            request
        );
        throw new Error(err.message);
    }
}

module.exports = {
    getAllCompetitionStatisticsQuery,
    insertCompetitionStatisticsQuery,
    updateCompetitionStatisticsByIdQuery,
    deleteCompetitionStatisticsByIdQuery,
    updateCompetitionStatisticsDisplayOrderQuery
};
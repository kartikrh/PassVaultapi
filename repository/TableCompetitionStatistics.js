const { errorLogger } = require("../utilities/logger");

const getAllCompetitionStatisticsQuery = async (fastify, request = null) => {
    try {
        let query = `
            SELECT
                tcs."wrCompetitionStatisticsId" AS "competitionStatisticsId",
                tcs."wrEventTypeId" AS "eventTypeId",
                tet."wrEventType" AS "eventType",
                tcs."wrCompetitionId" AS "competitionId",
                tc."wrCompetition" AS "competition",
                tcs."wrMatchTypeId" AS "matchTypeId",
                tmt."wrMatchType" AS "matchType",
                tcs."wrCompetitionStatisticsTypeId" AS "competitionStatisticsTypeId",
                tcst."wrName" AS "name",
                tcs."wrTeamId" AS "teamId",
                tt."wrTeamName" AS "teamName",
                tt."wrTeamShortName" AS "teamShortName",
                tt."wrImage" AS "teamImage",
                tcs."wrPlayerId" AS "playerId",
                tp."wrPlayerName" AS "playerName",
                tp."wrDisplayName" AS "playerShortName",
                ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
                tcs."wrDisplayOrder" AS "displayOrder",
                tcs."wrValue" AS "value",
                tcs."wrInningsCount" AS "inningsCount",
                tcs."wrIsActive" AS "isActive",
                tcs."wrCreatedBy" AS "createdById",
                tu."WrName" AS "createdBy"
            FROM "tblCompetitionStatistics" tcs
            LEFT JOIN "tblEventTypes" tet 
                ON tcs."wrEventTypeId" = tet."wrEventTypeId"
            LEFT JOIN "tblCompetitions" tc 
                ON tcs."wrCompetitionId" = tc."wrCompetitionId"
            LEFT JOIN "tblCompetitionStatisticsType" tcst 
                ON tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
            LEFT JOIN "tblTeams" tt 
                ON tcs."wrTeamId" = tt."wrTeamId"
            LEFT JOIN "tblPlayers" tp 
                ON tcs."wrPlayerId" = tp."wrPlayerId"
            LEFT JOIN "tblMatchTypes" tmt 
                ON tcs."wrMatchTypeId" = tmt."wrMatchTypeId"

            -- SINGLE RECORD FROM tblTeamPlayers
            LEFT JOIN LATERAL (
                SELECT 
                    ttp."wrJerseyPlayerImage"
                FROM "tblTeamPlayers" ttp
                WHERE ttp."wrRefPlayerId" = tcs."wrPlayerId"
                  AND ttp."wrIsDeleted" = FALSE
                ORDER BY ttp."wrTeamPlayerId" DESC
                LIMIT 1
            ) ttp ON TRUE

            LEFT JOIN "tblUsers" tu 
                ON tcs."wrCreatedBy" = tu."WrUserId"
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
                  ("wrEventTypeId", "wrCompetitionId", "wrMatchTypeId", "wrCompetitionStatisticsTypeId", "wrTeamId", "wrPlayerId", "wrDisplayOrder", "wrValue",
                  "wrInningsCount", "wrIsActive", "wrCreatedBy", "wrIsDeleted")
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                  RETURNING *
                )
                SELECT
                    tcs."wrCompetitionStatisticsId" AS "competitionStatisticsId",
                    tcs."wrEventTypeId" AS "eventTypeId",
                    tet."wrEventType" AS "eventType",
                    tcs."wrCompetitionId" AS "competitionId",
                    tc."wrCompetition" AS "competition",
                    tcs."wrMatchTypeId" AS "matchTypeId",
                    tmt."wrMatchType" AS "matchType",
                    tcs."wrCompetitionStatisticsTypeId" AS "competitionStatisticsTypeId",
                    tcst."wrName" AS "name",
                    tcs."wrTeamId" AS "teamId",
                    tt."wrTeamName" AS "teamName",
                    tt."wrTeamShortName" AS "teamShortName",
                    tt."wrImage" AS "teamImage",
                    tcs."wrPlayerId" AS "playerId",
                    tp."wrPlayerName" AS "playerName",
                    tp."wrDisplayName" AS "playerShortName",
                    ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
                    tcs."wrDisplayOrder" AS "displayOrder",
                    tcs."wrValue" AS "value",
                    tcs."wrInningsCount" AS "inningsCount",
                    tcs."wrIsActive" AS "isActive",
                    tcs."wrCreatedBy" AS "createdById",
                    tu."WrName" AS "createdBy"
                FROM "insert_data" tcs
                LEFT JOIN "tblEventTypes" tet ON tcs."wrEventTypeId" = tet."wrEventTypeId"
                LEFT JOIN "tblCompetitions" tc ON tcs."wrCompetitionId" = tc."wrCompetitionId"
                LEFT JOIN "tblCompetitionStatisticsType" tcst ON tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
                LEFT JOIN "tblTeams" tt ON tcs."wrTeamId" = tt."wrTeamId"
                LEFT JOIN "tblPlayers" tp ON tcs."wrPlayerId" = tp."wrPlayerId"
                LEFT JOIN "tblMatchTypes" tmt ON tcs."wrMatchTypeId" = tmt."wrMatchTypeId"
                LEFT JOIN LATERAL (
                    SELECT 
                        ttp."wrJerseyPlayerImage"
                    FROM "tblTeamPlayers" ttp
                    WHERE ttp."wrRefPlayerId" = tcs."wrPlayerId"
                      AND ttp."wrIsDeleted" = FALSE
                    ORDER BY ttp."wrTeamPlayerId" DESC
                    LIMIT 1
                ) ttp ON TRUE
                LEFT JOIN "tblUsers" tu ON tcs."wrCreatedBy" = tu."WrUserId"
                WHERE tcs."wrIsDeleted" = FALSE
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data?.eventTypeId ?? null,
                    data?.competitionId ?? null,
                    data?.matchTypeId ?? null,
                    data?.competitionStatisticsTypeId ?? null,
                    data?.teamId ?? null,
                    data?.playerId ?? null,
                    data?.displayOrder ?? null,
                    data?.value ?? null,
                    data?.inningsCount ?? null,
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
                    tcs."wrCompetitionStatisticsId" AS "competitionStatisticsId",
                    tcs."wrEventTypeId" AS "eventTypeId",
                    tet."wrEventType" AS "eventType",
                    tcs."wrCompetitionId" AS "competitionId",
                    tc."wrCompetition" AS "competition",
                    tcs."wrMatchTypeId" AS "matchTypeId",
                    tmt."wrMatchType" AS "matchType",
                    tcs."wrCompetitionStatisticsTypeId" AS "competitionStatisticsTypeId",
                    tcst."wrName" AS "name",
                    tcs."wrTeamId" AS "teamId",
                    tt."wrTeamName" AS "teamName",
                    tt."wrTeamShortName" AS "teamShortName",
                    tt."wrImage" AS "teamImage",
                    tcs."wrPlayerId" AS "playerId",
                    tp."wrPlayerName" AS "playerName",
                    tp."wrDisplayName" AS "playerShortName",
                    ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
                    tcs."wrDisplayOrder" AS "displayOrder",
                    tcs."wrValue" AS "value",
                    tcs."wrInningsCount" AS "inningsCount",
                    tcs."wrIsActive" AS "isActive",
                    tcs."wrCreatedBy" AS "createdById",
                    tu."WrName" AS "createdBy"
                FROM "update_data" tcs
                LEFT JOIN "tblEventTypes" tet ON tcs."wrEventTypeId" = tet."wrEventTypeId"
                LEFT JOIN "tblCompetitions" tc ON tcs."wrCompetitionId" = tc."wrCompetitionId"
                LEFT JOIN "tblCompetitionStatisticsType" tcst ON tcs."wrCompetitionStatisticsTypeId" = tcst."wrCompetitionStatisticsTypeId"
                LEFT JOIN "tblTeams" tt ON tcs."wrTeamId" = tt."wrTeamId"
                LEFT JOIN "tblPlayers" tp ON tcs."wrPlayerId" = tp."wrPlayerId"
                LEFT JOIN "tblMatchTypes" tmt ON tcs."wrMatchTypeId" = tmt."wrMatchTypeId"
                LEFT JOIN LATERAL (
                    SELECT 
                        ttp."wrJerseyPlayerImage"
                    FROM "tblTeamPlayers" ttp
                    WHERE ttp."wrRefPlayerId" = tcs."wrPlayerId"
                      AND ttp."wrIsDeleted" = FALSE
                    ORDER BY ttp."wrTeamPlayerId" DESC
                    LIMIT 1
                ) ttp ON TRUE
                LEFT JOIN "tblUsers" tu ON tcs."wrCreatedBy" = tu."WrUserId"
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

const removeDeletedCompetitionStatisticsQuery = async (request, fastify) => {
    try {
        return await fastify.db.query(
            `
                DELETE FROM "tblCompetitionStatistics"
                WHERE "wrIsDeleted" = $1
                    AND "wrDeletedAt" < NOW() - INTERVAL '7 days';
            `, {
                bind: [
                    true
                ],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCompetitionStatistics.js/removeDeletedCompetitionStatisticsQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllCompetitionStatisticsQuery,
    insertCompetitionStatisticsQuery,
    updateCompetitionStatisticsByIdQuery,
    deleteCompetitionStatisticsByIdQuery,
    updateCompetitionStatisticsDisplayOrderQuery,
    removeDeletedCompetitionStatisticsQuery
};
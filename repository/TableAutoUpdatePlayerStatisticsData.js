const { errorLogger } = require("../utilities/logger");

const getAutoUpdatePlayerStatisticsDataQuery = async (fastify, request = null, whereCondition = null, orderType = null, limit = null) => {
    try {
        const result = await fastify.db.query(
            `
                SELECT 
                    "wrId" as "id",
                    "wrCommentaryId" as "commentaryId",
                    "wrCreatedDate" as "createdDate",
                    "wrCommentaryPlayerId" as "commentaryPlayerId",
                    "wrPlayerId" as "playerId",
                    "wrCreatedBy" as "createdById",
                    u."WrName" as "createdBy",
                    "wrIsUpdated" as "isUpdated",
                    "wrStartTime" as "startTime",
                    "wrEndTime" as "endTime"
                FROM "tblAutoUpdatePlayerStatisticsData" aud
                LEFT JOIN "tblUsers" u ON aud."wrCreatedBy" = u."WrUserId"
                ${whereCondition ? `WHERE ${whereCondition}` : ""}
                ORDER BY "wrId" ${orderType ? orderType : "DESC"}
                ${limit ? `LIMIT ${limit}` : ""}
            `,
            { type: fastify.db.QueryTypes.SELECT }
        );

        return result || [];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/getAutoUpdatePlayerStatisticsDataQuery",
            request
        );
        throw new Error(err.message);
    }
};

const insertAutoUpdatePlayerStatisticsDataQuery = async (request, fastify) => {
    try {
        const result = await fastify.db.query(
            `
                WITH insert_data AS (
                    INSERT INTO "tblAutoUpdatePlayerStatisticsData" (
                        "wrCommentaryId",
                        "wrCreatedBy"
                    ) VALUES (
                        $1,
                        $2 )
                    returning *
                )

                SELECT 
                    "wrId" as "id",
                    "wrCommentaryId" as "commentaryId",
                    "wrCreatedBy" as "createdBy"
                from insert_data
            `,
            {
                bind: [
                    request.body.commentaryId,
                    request.userTokenInfo?.WrUserId || null
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertAutoUpdatePlayerStatisticsDataQuery",
            null
        );
        throw new Error(err.message);
    }
};

const updateAutoUpdatePlayerStatisticsDataQuery = async (request, fastify) => {
    try {
        const { id, status = false, startTime = null, endTime = null } = request.body;
        return await fastify.db.query(
            `
            update "tblAutoUpdatePlayerStatisticsData" set
                "wrIsUpdated" = $1,
                "wrStartTime" = $2,
                "wrEndTime" = $3
            where "wrId" = $4
            RETURNING *
            `,
            {
                bind: [
                    status,
                    startTime,
                    endTime,
                    id
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/updateAutoUpdatePlayerStatisticsDataQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertMultipleCommentaryPlayersInAutoUpdatePlayerStatisticsQuery = async (request, fastify) => {
    try {
        const { commentaryId, playerIds } = request.body;
        const query = `
        INSERT INTO "tblAutoUpdatePlayerStatisticsData" (
            "wrCommentaryId",
            "wrCommentaryPlayerId",
            "wrCreatedBy"
        )
        SELECT 
            $1 AS "wrCommentaryId",
            UNNEST($3::int[]) AS "wrCommentaryPlayerId",
            $2 AS "wrCreatedBy"
        RETURNING 
            "wrId" AS "id",
            "wrCommentaryId" AS "commentaryId",
            "wrCommentaryPlayerId" AS "commentaryPlayerId",
            "wrCreatedBy" AS "createdBy",
            "wrCreatedDate" AS "createdDate";
        `;

        const result = await fastify.db.query(query, {
            bind: [
                commentaryId,
                request.userTokenInfo?.WrUserId || null,
                playerIds
            ],
            type: fastify.db.QueryTypes.INSERT,
        });

        return result;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertMultipleCommentaryPlayersInAutoUpdatePlayerStatisticsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const insertCommentaryPlayerInAutoUpdatePlayerStatisticsQuery = async (request, fastify) => {
    const { commentaryId, commentaryPlayerId, playerId } = request.body;
    try {
        const result = await fastify.db.query(
            `
                WITH insert_data AS (
                    INSERT INTO "tblAutoUpdatePlayerStatisticsData" (
                        "wrCommentaryId",
                        "wrCommentaryPlayerId",
                        "wrPlayerId",
                        "wrCreatedBy"
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4 )
                    returning *
                )

                SELECT 
                    "wrId" as "id",
                    "wrCommentaryId" as "commentaryId",
                    "wrCommentaryPlayerId" as "commentaryPlayerId",
                    "wrPlayerId" as "playerId",
                    "wrCreatedBy" as "createdBy"
                from insert_data
            `,
            {
                bind: [
                    commentaryId,
                    commentaryPlayerId,
                    playerId,
                    request?.userTokenInfo?.WrUserId || null
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertCommentaryPlayerInAutoUpdatePlayerStatisticsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery = async (request, fastify) => {
    try {
        const { matchTypeId, playerId, commentaryId } = request.body;
        const query = `
            SELECT
                COUNT(*)::INT as "count"
            FROM "tblCommPlayerBatHist"
            WHERE
                "wrMatchTypeId" = $1 AND
                "wrPlayerId" = $2 AND
                "wrCommentaryId" = $3 AND
                "wrIsDeleted" = FALSE;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                matchTypeId,
                playerId,
                commentaryId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result?.count || 0;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertCommentaryPlayerBattingHistoryQuery = async (data, fastify) => {
    try {
        const { playerId, matchTypeId, commentaryId, commentaryPlayerId, matchCount, inningsCount, notOut, totalRuns, highestScore, average, ballsFacedCount, strikeRate, countOf100, countOf50, countOf4, countOf6, catchCount, stumpCount, outCount, createdBy, fastest50Balls, fastest100Balls } = data;
        const query = `
            INSERT INTO "tblCommPlayerBatHist" (
            "wrPlayerId", "wrMatchTypeId", "wrCommentaryId", "wrCommentaryPlayerId", "wrMatchCount",
            "wrInningsCount", "wrNotOut", "wrTotalRuns", "wrHighestScore",
            "wrAverage", "wrBallsFacedCount", "wrStrikeRate", "wr100Count",
            "wr50Count", "wr4Count", "wr6Count", "wrCatchCount", "wrStumpCount",
            "wrOutCount", "wrCreatedBy", "wrCreatedAt", "wrFastest50Balls", "wrFastest100Balls"
            )
            VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, NOW(), $21, $22
            )
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                playerId,
                matchTypeId,
                commentaryId,
                commentaryPlayerId || 0,
                matchCount,
                inningsCount,
                notOut,
                totalRuns,
                highestScore,
                average,
                ballsFacedCount,
                strikeRate,
                countOf100,
                countOf50,
                countOf4,
                countOf6,
                catchCount,
                stumpCount,
                outCount,
                createdBy,
                fastest50Balls || 0,
                fastest100Balls || 0
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertCommentaryPlayerBattingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertPlayerBattingHistoryQuery = async (data, fastify) => {
    try {
        const { playerId, matchTypeId, matchTypeName, matchCount, inningsCount, notOut, totalRuns, highestScore, average, ballsFacedCount, strikeRate, countOf100, countOf50, countOf4, countOf6, catchCount, stumpCount, outCount, createdBy, fastest50Balls, fastest100Balls } = data;
        const query = `
            INSERT INTO "tblPlayerBattingHistory" (
            "wrPlayerId", "wrMatchTypeId", "wrMatchTypeName", "wrMatchCount",
            "wrInningsCount", "wrNotOut", "wrTotalRuns", "wrHighestScore",
            "wrAverage", "wrBallsFacedCount", "wrStrikeRate", "wr100Count",
            "wr50Count", "wr4Count", "wr6Count", "wrCatchCount", "wrStumpCount",
            "wrOutCount", "wrCreatedBy", "wrCreatedAt", "wrFastest50Balls", "wrFastest100Balls"
            )
            VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, NOW(), $20, $21
            )
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                playerId,
                matchTypeId,
                matchTypeName,
                matchCount,
                inningsCount,
                notOut,
                totalRuns,
                highestScore,
                average,
                ballsFacedCount,
                strikeRate,
                countOf100,
                countOf50,
                countOf4,
                countOf6,
                catchCount,
                stumpCount,
                outCount,
                createdBy,
                fastest50Balls || 0,
                fastest100Balls || 0
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertPlayerBattingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const updatePlayerBattingHistoryQuery = async (data, fastify) => {
    try {
        const { battingHistoryId, playerId, matchTypeId, matchTypeName, matchCount, inningsCount, notOut, totalRuns, highestScore, average, ballsFacedCount, strikeRate, countOf100, countOf50, countOf4, countOf6, catchCount, stumpCount, outCount, fastest50Balls, fastest100Balls } = data;
        const query = `
            UPDATE "tblPlayerBattingHistory"
            SET
                "wrMatchTypeId" = $1,
                "wrPlayerId" = $2,
                "wrMatchTypeName" = $3,
                "wrMatchCount" = $4,
                "wrInningsCount" = $5,
                "wrNotOut" = $6,
                "wrTotalRuns" = $7,
                "wrHighestScore" = $8,
                "wrAverage" = $9,
                "wrBallsFacedCount" = $10,
                "wrStrikeRate" = $11,
                "wr100Count" = $12,
                "wr50Count" = $13,
                "wr4Count" = $14,
                "wr6Count" = $15,
                "wrCatchCount" = $16,
                "wrStumpCount" = $17,
                "wrOutCount" = $18,
                "wrFastest50Balls" = $19,
                "wrFastest100Balls" = $20
            WHERE "wrBattingHistoryId" = $21
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                matchTypeId,
                playerId,
                matchTypeName,
                matchCount,
                inningsCount,
                notOut,
                totalRuns,
                highestScore,
                average,
                ballsFacedCount,
                strikeRate,
                countOf100,
                countOf50,
                countOf4,
                countOf6,
                catchCount,
                stumpCount,
                outCount,
                fastest50Balls || 0,
                fastest100Balls || 0,
                battingHistoryId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/updatePlayerBattingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const getCommentaryPlayerBowlingHistoryByCommentaryPlayerCountQuery = async (request, fastify) => {
    try {
        const { matchTypeId, playerId, commentaryId } = request.body;
        const query = `
            SELECT
                COUNT(*)::INT as "count"
            FROM "tblCommPlayerBowlHist"
            WHERE
                "wrMatchTypeId" = $1 AND
                "wrPlayerId" = $2 AND
                "wrCommentaryId" = $3 AND
                "wrIsDeleted" = FALSE;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                matchTypeId,
                playerId,
                commentaryId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result?.count || 0;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertCommentaryPlayerBowlingHistoryQuery = async (data, fastify) => {
    try {
        const { playerId, matchTypeId, commentaryId, commentaryPlayerId, matchCount, inningsCount, ballCount, runsFromBowler, wicketsCount, bowlerAverage, bestBowlingInInnings, bestBowlingInMatch, economy, bowlerStrikeRate, wickets4, wickets5, wickets10, createdBy, overCount, hattrickCount, expensiveOverRuns } = data;
        const query = `
            INSERT INTO "tblCommPlayerBowlHist" (
            "wrPlayerId", "wrMatchTypeId", "wrCommentaryId", "wrCommentaryPlayerId", "wrMatchCount", "wrInningsCount",
            "wrBallCount", "wrTotalRuns", "wrWicketsCount", "wrAverage", "wrBestBowlingInInnings",
            "wrBestBowlingInMatch", "wrEconomy", "wrStrikeRate", "wr4Wickets", "wr5Wickets",
            "wr10Wickets", "wrCreatedAt", "wrCreatedBy", "wrOverCount", "wrHattrickCount", "wrExpensiveOverRuns"
            )
            VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(),
            $18, $19, $20, $21
            )
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                playerId,
                matchTypeId,
                commentaryId,
                commentaryPlayerId || 0,
                matchCount,
                inningsCount,
                ballCount,
                runsFromBowler,
                wicketsCount,
                bowlerAverage,
                bestBowlingInInnings,
                bestBowlingInMatch,
                economy,
                bowlerStrikeRate,
                wickets4,
                wickets5,
                wickets10,
                createdBy,
                overCount || 0,
                hattrickCount || 0,
                expensiveOverRuns || 0
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertCommentaryPlayerBowlingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertPlayerBowlingHistoryQuery = async (data, fastify) => {
    try {
        const { playerId, matchTypeId, matchTypeName, matchCount, inningsCount, ballCount, runsFromBowler, wicketsCount, bowlerAverage, bestBowlingInInnings, bestBowlingInMatch, economy, bowlerStrikeRate, wickets4, wickets5, wickets10, createdBy, overCount, hattrickCount, expensiveOverRuns } = data;
        const query = `
            INSERT INTO "tblPlayerBowlingHistory" (
            "wrPlayerId", "wrMatchTypeId", "wrMatchTypeName", "wrMatchCount", "wrInningsCount",
            "wrBallCount", "wrTotalRuns", "wrWicketsCount", "wrAverage", "wrBestBowlingInInnings",
            "wrBestBowlingInMatch", "wrEconomy", "wrStrikeRate", "wr4Wickets", "wr5Wickets",
            "wr10Wickets", "wrCreatedAt", "wrCreatedBy", "wrOverCount", "wrHattrickCount", "wrExpensiveOverRuns"
            )
            VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, NOW(),
            $17, $18, $19, $20
            )
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                playerId,
                matchTypeId,
                matchTypeName,
                matchCount,
                inningsCount,
                ballCount,
                runsFromBowler,
                wicketsCount,
                bowlerAverage,
                bestBowlingInInnings,
                bestBowlingInMatch,
                economy,
                bowlerStrikeRate,
                wickets4,
                wickets5,
                wickets10,
                createdBy,
                overCount || 0,
                hattrickCount || 0,
                expensiveOverRuns || 0
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/insertPlayerBowlingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const updatePlayerBowlingHistoryQuery = async (data, fastify) => {
    try {
        const { bowlingHistoryId, playerId, matchTypeId, matchTypeName, matchCount, inningsCount, ballCount, runsFromBowler, wicketsCount, bowlerAverage, bestBowlingInInnings, bestBowlingInMatch, economy, bowlerStrikeRate, wickets4, wickets5, wickets10, overCount, hattrickCount, expensiveOverRuns } = data;
        const query = `
            UPDATE "tblPlayerBowlingHistory"
            SET
                "wrMatchTypeId" = $1,
                "wrPlayerId" = $2,
                "wrMatchTypeName" = $3,
                "wrMatchCount" = $4,
                "wrInningsCount" = $5,
                "wrBallCount" = $6,
                "wrTotalRuns" = $7,
                "wrWicketsCount" = $8,
                "wrAverage" = $9,
                "wrBestBowlingInInnings" = $10,
                "wrBestBowlingInMatch" = $11,
                "wrEconomy" = $12,
                "wrStrikeRate" = $13,
                "wr4Wickets" = $14,
                "wr5Wickets" = $15,
                "wr10Wickets" = $16,
                "wrOverCount" = $17,
                "wrHattrickCount" = $18,
                "wrExpensiveOverRuns" = $19
            WHERE "wrBowlingHistoryId" = $20
            RETURNING *;
        `;

        const result = await fastify.db.query(query, {
            bind: [
                matchTypeId,
                playerId,
                matchTypeName,
                matchCount,
                inningsCount,
                ballCount,
                runsFromBowler,
                wicketsCount,
                bowlerAverage,
                bestBowlingInInnings,
                bestBowlingInMatch,
                economy,
                bowlerStrikeRate,
                wickets4,
                wickets5,
                wickets10,
                overCount || 0,
                hattrickCount || 0,
                expensiveOverRuns || 0,
                bowlingHistoryId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdatePlayerStatisticsData.js/updatePlayerBowlingHistoryQuery",
            null
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAutoUpdatePlayerStatisticsDataQuery,
    insertAutoUpdatePlayerStatisticsDataQuery,
    updateAutoUpdatePlayerStatisticsDataQuery,
    insertMultipleCommentaryPlayersInAutoUpdatePlayerStatisticsQuery,
    insertCommentaryPlayerInAutoUpdatePlayerStatisticsQuery,
    getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery,
    insertCommentaryPlayerBattingHistoryQuery,
    insertPlayerBattingHistoryQuery,
    updatePlayerBattingHistoryQuery,
    getCommentaryPlayerBowlingHistoryByCommentaryPlayerCountQuery,
    insertCommentaryPlayerBowlingHistoryQuery,
    insertPlayerBowlingHistoryQuery,
    updatePlayerBowlingHistoryQuery
};
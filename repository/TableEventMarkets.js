const { errorLogger } = require("../utilities/logger");

const getAllEventMarketsQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsPreMatchOnly" as "isPreMatchOnly",
        "wrIsPreMatchMarket" as "isPreMatchMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerID" as "playerId",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrAutoOpenType" as "autoOpenType", 
        "wrAutoOpen" as "autoOpen",
        "wrAutoCloseType" as "autoCloseType",
        "wrBeforeAutoClose" as "beforeAutoClose",
        "wrAutoSuspendType" as "autoSuspendType",
        "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
        "wrIsBallStart" as "isBallStart",
        "wrIsAutoResultSet" as "isAutoResultSet",
        "wrAutoResultType" as "autoResultType",
        "wrAutoResultafterBall" as "autoResultafterBall",	
        "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
        "wrAfterWicketNotCreated" as "afterWicketNotCreated",
        tem."wrIsActive" as "isActive",	
        "wrIsAllow" as "isAllow",
        "wrCloseTime" as "closeTime",
        "wrOpenTime" as "openTime",
        "wrSettledTime" as "settledTime",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        "wrData" as "data"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"

    `,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

const createManyEventMarketQuery = async (data,request,fastify) => {
    try {
        const values = data.map((item) => {
            return `(
                ${item.commentaryId},
                '${item.eventRefId}',
                ${item.teamId},
                ${item.inningsId},
                '${item.marketName}',
                ${item.margin},
                ${item.status},
                ${item.isPredefineMarket},
                ${item.isPreMatchOnly},
                ${item.isPreMatchMarket},
                ${item.isOver},
                ${item.over},
                ${item.isPlayer},
                ${item.playerId},
                ${item.isAutoCancel},
                ${item.autoOpenType},
                ${item.autoOpen},
                ${item.autoCloseType},
                ${item.beforeAutoClose},
                ${item.autoSuspendType},
                ${item.beforeAutoSuspend},
                ${item.isBallStart},
                ${item.isAutoResultSet},
                ${item.autoResultType},
                ${item.autoResultafterBall},
                ${item.afterWicketAutoSuspend},
                ${item.afterWicketNotCreated},
                ${item.isActive},
                ${item.isAllow},
                now()::timestamp,
                '${item.data}'
            )`;
        }).join(',');

        const query = `INSERT INTO "tblEventMarkets"(
            "wrCommentaryId",
            "wrEventRefID",
            "wrTeamID",
            "wrInningsID",
            "wrMarketName",
            "wrMargin",
            "wrStatus",
            "wrIsPredefineMarket",
            "wrIsPreMatchOnly",
            "wrIsPreMatchMarket",
            "wrIsOver",
            "wrOver",
            "wrIsPlayer",
            "wrPlayerID",
            "wrIsAutoCancel",
            "wrAutoOpenType",
            "wrAutoOpen",
            "wrAutoCloseType",
            "wrBeforeAutoClose",
            "wrAutoSuspendType",
            "wrBeforeAutoSuspend",
            "wrIsBallStart",
            "wrIsAutoResultSet",
            "wrAutoResultType",
            "wrAutoResultafterBall",
            "wrAfterWicketAutoSuspend",
            "wrAfterWicketNotCreated",
            "wrIsActive",
            "wrIsAllow",
            "wrOpenTime",
            "wrData"
        ) VALUES ${values}`;
    
        return await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (err) {
        console.log(err);
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableEventmarket.js/createManyEventMarketQuery",
            request
          );
        throw new Error(err.message);
    }
}
const updateEventMarketQuery = async (data,request,fastify ) => {
    try {
       return await fastify.db.query(
            `
            UPDATE "tblEventMarkets"
            SET
            "wrCommentaryId" = $1,
            "wrEventRefID" = $2,
            "wrTeamID" = $3,
            "wrInningsID" = $4,
            "wrMarketName" = $5,
            "wrMargin" = $6,
            "wrStatus" = $7,
            "wrIsPredefineMarket" = $8,
            "wrIsPreMatchOnly" = $9,
            "wrIsPreMatchMarket" = $10,
            "wrIsOver" = $11,
            "wrOver" = $12,
            "wrIsPlayer" = $13,
            "wrPlayerID" = $14,
            "wrIsAutoCancel" = $15,
            "wrAutoOpenType" = $16,
            "wrAutoOpen" = $17,
            "wrAutoCloseType" = $18,
            "wrBeforeAutoClose" = $19,
            "wrAutoSuspendType" = $20,
            "wrBeforeAutoSuspend" = $21,
            "wrIsBallStart" = $22,
            "wrIsAutoResultSet" = $23,
            "wrAutoResultType" = $24,
            "wrAutoResultafterBall" = $25,
            "wrAfterWicketAutoSuspend" = $26,
            "wrAfterWicketNotCreated" = $27,
            "wrIsActive" = $28,
            "wrIsAllow" = $29,
            "wrData" = $30
            WHERE "wrID" = $31`,
            {
                bind: [
                    data.commentaryId,
                    data.eventRefId,
                    data.teamId,
                    data.inningsId,
                    data.marketName,
                    data.margin,
                    data.status,
                    data.isPredefineMarket,
                    data.isPreMatchOnly,
                    data.isPreMatchMarket,
                    data.isOver,
                    data.over,
                    data.isPlayer,
                    data.playerId,
                    data.isAutoCancel,
                    data.autoOpenType,
                    data.autoOpen,
                    data.autoCloseType,
                    data.beforeAutoClose,
                    data.autoSuspendType,
                    data.beforeAutoSuspend,
                    data.isBallStart,
                    data.isAutoResultSet,
                    data.autoResultType,
                    data.autoResultafterBall,
                    data.afterWicketAutoSuspend,
                    data.afterWicketNotCreated,
                    data.isActive,
                    data.isAllow,
                    data.data,
                    data.eventMarketId
                ],
                type: fastify.db.QueryTypes.SELECT
            });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/updateEventMarketQuery",
            request
          );
        throw new Error(error.message);
        
    }
}
const deleteEventMarketQuery = async (data,request,fastify) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblEventMarkets" WHERE "wrID" = ANY($1)`,
            {
                bind: [data],
                type: fastify.db.QueryTypes.SELECT
            });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/deleteEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const changeIsActiveEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `UPDATE "tblEventMarkets" SET "wrIsActive" = $1 WHERE "wrID" = $2`;
        return await fastify.db.query(query, {
            bind: [data.isActive, data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/changeIsActiveEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const changeIsAllowEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `UPDATE "tblEventMarkets" SET "wrIsAllow" = $1 WHERE "wrID" = $2`;
        return await fastify.db.query(query, {
            bind: [data.isAllow, data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/changeIsAllowEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
module.exports = {
    getAllEventMarketsQuery,
    createManyEventMarketQuery,
    updateEventMarketQuery,
    deleteEventMarketQuery,
    changeIsActiveEventMarketQuery,
    changeIsAllowEventMarketQuery
};

const { errorLogger } = require("../utilities/logger");

const getAllEventMarketsQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
        "wrID" AS "eventMarketId",
        "wrCommentaryId" AS "commentaryId",
        "wrEventRefID" AS "eventRefId",
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
        "wrIsActive" as "isActive",	
        "WrIsBetAllow" as "isBetAllow",
        "wrCloseTime" as "closeTime",
        "wrOpenTime" as "openTime",
        "wrSettledTime" as "settledTime",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        "wrOverCount" as "overCount",
        "wrYes" as "yes",
        "wrYesPoint" as "yesPoint",	
        "wrNo" as "no",
        "wrNoPoint" as "noPoint",
        "wrData" as "data"

    FROM "tblEventMarkets"`,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

module.exports = {
    getAllEventMarketsQuery,
};

const { errorLogger } = require("../utilities/logger");

const getAllEventMarketsQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
        "wrID" AS "marketId",
        "wrcommentaryid" AS "commentaryId",
        "wrEventID" AS "eventId",
        "wrTeamID" AS "teamId",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
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
        "WrIsBetAllow",
        "wrCloseTime",
        "wrOpenTime",
        "wrSettledTime",
        "wrResult",
        "wrIsResult"
    FROM "tblEventMarkets"`,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

module.exports = {
    getAllEventMarketsQuery,
};

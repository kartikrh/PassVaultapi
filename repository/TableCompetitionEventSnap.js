const { errorLogger } = require("../utilities/logger")

const getComEventSnapQuery = async (fastify) =>{
    return fastify.db.query(
        `
            SELECT 
                "wrId" as "id",
                "wrCompetitionId" as "competitionId",
                "wrEventTypeId" as "eventTypeId",
                "wrEventRefId" as "eventRefId",
                "wrCommentaryId" as "commentaryId",
                "wrTotalFour" as "totalFour",
                "wrTotalSix" as "totalSix",
                "wrTotalWicket" as "totalWicket",
                "wrTotalWideBall" as "totalWideBall",
                "wrTotalNoBall" as "totalNoBall",
                "wrTotalLegByesRun" as "totalLegByesRun",
                "wrTotalByesRun" as "totalByesRun",
                "wrTotal50" as "total50",
                "wrTotal100" as "total100",
                "wrUnder50" as "under50",
                "wrCreatedAt" as "createdAt"
            FROM "tblCompetitionEventSnap"
        `,
        {
            type : fastify.db.QueryTypes.SELECT
        }
    )

}
const setEventSnapQuery = async (data,request,fastify) =>{
    try {
        const result = await fastify.db.query(
            `CALL set_compEventSnap_proc($1,$2)`,
            {
                type : fastify.db.QueryTypes.SELECT,
                bind : [
                    data , null
                ]
            }
        )
        return result[0].compeventsnap_array;
    } catch (error) {
       errorLogger(
        fastify,
        error.message,
        "DB Error --> repository/TableCompetitionEventSnap.js/setEventSnapQuery",
        request
       ) 
       throw new Error(error)
    }
}
const getEventSnapByComQuery = async (data,request,fastify) =>{
    try {
        const result = await fastify.db.query(
            `
                SELECT 
                    tces."wrTotalFour" as "Total Four",
                    tces."wrTotalSix" as "Total Six",
                    tces."wrTotalWicket" as "Total Wicket",
                    tces."wrTotalWideBall" as "Total Wide ball",
                    tces."wrTotalNoBall" as "Total Noball",
                    tces."wrTotalLegByesRun" as "Total Leg ByesRun",
                    tces."wrTotalByesRun" as "Total ByesRun",
                    tces."wrTotal50" as "Total 50",
                    tces."wrTotal100" as "Total 100",
                    tces."wrUnder50" as "Under 50",
                    tces."wrMostDotBallBowlerName" as "Most Dotball By Bowler",
                    tces."wrMostDotBallCount" as "Most Dotball Count",
                    tces."wrHSPartnershipRun" as "Highest Run by Partnership",
                    tces."wrMostRunBowlerName" as "Most Runs Conceded by Bowler",
                    tces."wrMostBowlerRun" as "MostRun By Bowler",
                    tces."wrMostWicketBowlerName" as "Most Wicket By Bowler",
                    "wrMostBowlerWicket" as "Most Wicket Bowler",
                    tces."wrTotalMatchDuckOut" as "Total Match Duck Out",
                    tces."wrExtra" as "Extra Run",
                    tces."wrTotalCatchOut" as "Total CatchOut",
                    tces."wrTotalBowledOut" as "Total BowledOut",
                    tces."wrTotalRunOut" as "Total RunOut",
                    tces."wrTotalLBWOut" as "Total LBWOut",
                    tces."wrTotal30" as "Total 30",
                    tces."wrHSOverRun" as "Highest Run in Over",
                    tces."wrTopRunBatsmanName" as "Top Run By Batsman",
                    "wrTopBatsManRun" as "Top Run Batsman"
                FROM "tblCompetitionEventSnap" tces
                WHERE tces."wrCommentaryId" = $1
                
            `,
            //     tp1."wrPlayerName" as "Most Dotball By Bowler",
            //     tp2."wrPlayerName" as "Most Runs Conceded by Bowler",
            //     tp3."wrPlayerName" as "Most Wicket By Bowler",
            //     tp4."wrPlayerName" as "Top Run By Batsman",
            // LEFT JOIN "tblPlayers" tp1 on tp1."wrPlayerId" = tces."wrMostDotBallBowler"
            // LEFT JOIN "tblPlayers" tp2 on tp2."wrPlayerId" = tces."wrMostRunBowlerId"
            // LEFT JOIN "tblPlayers" tp3 on tp3."wrPlayerId" = tces."wrMostWicketBowlerId"
            // LEFT JOIN "tblPlayers" tp4 on tp4."wrPlayerId" = tces."wrTopRunBatsManId" 
            {
                type : fastify.db.QueryTypes.SELECT,
                bind : [
                    data.commentaryId
                ]
            }
        )
        return result[0];
        
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableCompetitionEventSnap.js/getEventSnapByComQuery",
            request
        )
        throw new Error(error)
    }
}

const getEventSnapByCompetitionIdQuery = async (competitionId, request, fastify) =>{
    try {
        const result = await fastify.db.query(
            `SELECT 
                tces."wrId" as "id",
                tces."wrCompetitionId" as "competitionId",
                tces."wrEventTypeId" as "eventTypeId",
                tces."wrEventRefId" as "eventRefId",
                tces."wrCommentaryId" as "commentaryId",
                tces."wrTotalFour" as "totalFour",
                tces."wrTotalSix" as "totalSix",
                tces."wrTotalWicket" as "totalWicket",
                tces."wrTotalWideBall" as "totalWideBall",
                tces."wrTotalNoBall" as "totalNoBall",
                tces."wrTotalLegByesRun" as "totalLegByesRun",
                tces."wrTotalByesRun" as "totalByesRun",
                tces."wrTotal50" as "total50",
                tces."wrTotal100" as "total100",
                tces."wrUnder50" as "under50",
                tces."wrMostDotBallBowler" as "mostDotBallBowler",
                tces."wrMostDotBallBowlerName" as "mostDotBallBowlerName",
                tces."wrMostDotBallCount" as "mostDotBallCount",
                tces."wrHSPartnershipRun" as "HSPartnershipRun",
                tces."wrHSPartnershipId" as "HSPartnershipId",
                tces."wrMostBowlerRun" as "mostBowlerRun",
                tces."wrMostRunBowlerId" as "mostRunBowlerId",
                tces."wrMostRunBowlerName" as "mostRunBowlerName",
                tces."wrMostBowlerWicket" as "mostBowlerWicket",
                tces."wrMostWicketBowlerId" as "mostWicketBowlerId",
                tces."wrMostWicketBowlerName" as "mostWicketBowlerName",
                tces."wrTotalMatchDuckOut" as "totalMatchDuckOut",
                tces."wrExtra" as "extras",
                tces."wrTotalCatchOut" as "totalCatchOut",
                tces."wrTotalBowledOut" as "totalBowledOut",
                tces."wrTotalRunOut" as "totalRunOut",
                tces."wrTotalLBWOut" as "totalLBWOut",
                tces."wrTotal30" as "total30",
                tces."wrHSOverRun" as "HSOverRun",
                tces."wrHSRunOverId" as "HSRunOverId",
                tces."wrTopBatsManRun" as "topBatsmanRun",
                tces."wrTopRunBatsManId" as "topRunBatsmanId",
                tces."wrTopRunBatsmanName" as "topRunBatsmanName"
            FROM "tblCompetitionEventSnap" tces
            LEFT JOIN "tblOvers" to1 on to1."wrOverId" = tces."wrHSRunOverId"
            WHERE tces."wrCompetitionId" = $1`,
            {
                type : fastify.db.QueryTypes.SELECT,
                bind : [competitionId]
            }
        )
        // tp1."wrPlayerName" as "mostDotBallBowlerName",
        // tp2."wrPlayerName" as "mostRunBowlerName",
        // tp3."wrPlayerName" as "mostWicketBowlerName",
        // tp4."wrPlayerName" as "topRunBatsmanName",
        // tces."wrMostDotBallBowlerName" as "Most Dotball Bowler Name",
        // tces."wrMostRunBowlerName" as "Most Runs Conceded Bowler Name",
        // tces."wrMostWicketBowlerName" as "Most Wickets Bowler Name",
        // tces."wrTopRunBatsmanName" as "Top Run Batsman Name"
        // LEFT JOIN "tblPlayers" tp1 on tp1."wrPlayerId" = tces."wrMostDotBallBowler"
        // LEFT JOIN "tblPlayers" tp2 on tp2."wrPlayerId" = tces."wrMostRunBowlerId"
        // LEFT JOIN "tblPlayers" tp3 on tp3."wrPlayerId" = tces."wrMostWicketBowlerId"
        // LEFT JOIN "tblPlayers" tp4 on tp4."wrPlayerId" = tces."wrTopRunBatsManId" 
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableCompetitionEventSnap.js/getEventSnapByCompetitionIdQuery",
            request
        )
        throw new Error(error)
    }
}

const updateEventSnapQuery = async (data, request, fastify) =>{
    try {
        const result = await fastify.db.query(
            `CALL update_competition_event_snap($1, $2)`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [data, null]
            }
        );
        return result[0]?.result_set;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableCompetitionEventSnap.js/updateEventSnapQuery",
            request
        )
        throw new Error(error)
    }
}

module.exports = {
    getComEventSnapQuery,
    setEventSnapQuery,
    getEventSnapByComQuery,
    getEventSnapByCompetitionIdQuery,
    updateEventSnapQuery,
}
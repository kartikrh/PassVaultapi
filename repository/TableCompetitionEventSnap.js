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
                    "wrId" as "id",
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
                    tces."wrCreatedAt" as "createdAt",
                    tces."wrMostDotBallBowler" as "mostDotBallBowler",
                    tp1."wrPlayerName" as "mostDotBallBowlerName",
                    tces."wrMostDotBallCount" as "mostDotBallCount",
                    tces."wrHSPartnershipRun" as "hsPartnershipRun",
                    tces."wrHSPartnershipId" as "hsPartnershipId",
                    tces."wrMostBowlerRun" as "mostBowlerRun",
                    tces."wrMostRunBowlerId" as "mostRunBowlerId",
                    tp2."wrPlayerName" as "mostRunBowlerName",
                    "wrMostBowlerWicket" as "mostBowlerWicket",
                    "wrMostWicketBowlerId" as "mostWicketBowlerId",
                    tp3."wrPlayerName" as "mostWicketBowlerName",
                    tces."wrTotalMatchDuckOut" as "totalMatchDuckOut",
                    tces."wrExtra" as "extra",
                    tces."wrTotalCatchOut" as "totalCatchOut",
                    tces."wrTotalBowledOut" as "totalBowledOut",
                    tces."wrTotalRunOut" as "totalRunOut",
                    tces."wrTotalLBWOut" as "totalLBWOut",
                    tces."wrTotal30" as "total30",
                    tces."wrHSOverRun" as "hsOverRun",
                    tces."wrHSRunOverId" as "hsRunOverId",
                    to1."wrOver" as "hsRunOver",
                    "wrTopBatsManRun" as "topBatsManRun",
                    "wrTopRunBatsManId" as "topRunBatsManId",
                    tp4."wrPlayerName" as "topRunBatsManName"
                FROM "tblCompetitionEventSnap" tces
                LEFT JOIN "tblPlayers" tp1 on tp1."wrPlayerId" = tces."wrMostDotBallBowler"
                LEFT JOIN "tblPlayers" tp2 on tp2."wrPlayerId" = tces."wrMostRunBowlerId"
                LEFT JOIN "tblPlayers" tp3 on tp3."wrPlayerId" = tces."wrMostWicketBowlerId"
                LEFT JOIN "tblPlayers" tp4 on tp4."wrPlayerId" = tces."wrTopRunBatsManId" 
                LEFT JOIN "tblOvers" to1 on to1."wrOverId" = tces."wrHSRunOverId"
                WHERE tces."wrCommentaryId" = $1
                
            `,
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
module.exports = {
    getComEventSnapQuery,
    setEventSnapQuery,
    getEventSnapByComQuery
}
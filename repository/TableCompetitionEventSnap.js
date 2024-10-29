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
module.exports = {
    getComEventSnapQuery,
    setEventSnapQuery
}
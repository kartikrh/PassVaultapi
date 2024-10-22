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
module.exports = {
    getComEventSnapQuery
}
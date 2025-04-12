const { errorLogger } = require("../utilities/logger")

const getCompEventByIdQuery = async (request,fastify) =>{
    try {
        const result = await fastify.db.query(
            `
                SELECT 
                    "wrId" as "id",
                    "wrCompetitionId" as "competitionId",
                    "wrCommentaryId" as "commentaryId"
                FROM "tblCompetitionEvent"
                WHERE "wrCompetitionId" = $1
            `,
            {
                bind :[
                    request.body.competitionId
                ],
                type : fastify.db.QueryTypes.SELECT,
            }
        )
        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableCompetitionEvent/getCompEventByIdQuery",
            request
        )
        throw new Error(error.message)
    }
}
module.exports = {
    getCompEventByIdQuery
}
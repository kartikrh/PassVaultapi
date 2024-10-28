const { errorLogger } = require("../utilities/logger");

const createTeamPointLogQuery = async (data, request , fastify) =>{
    try {
        const q1 = `
            INSERT INTO "tblTeamPointLogs"(
                "wrTeamId",
                "wrCompetitionId",
                "wrCommentaryId",
                "wrCreatedBy"
            )
            VALUES(
                $1,
                $2,
                $3,
                $4
            )
            RETURNING "wrId" as "id"
        `
        const result = await fastify.db.query(
            q1,
            {
                type : fastify.db.QueryTypes.SELECT,
                bind : [
                    data.teamId,
                    data.competitionId,
                    data.commentaryId,
                    request.userTokenInfo.WrUserId
                ]
            }
        )
        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableTeamPointLogs.js/createTeamPointLogQuery",
            request
        )
        throw new Error(error)
    }
}
const getLogByComIdQuery = async (data, request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrTeamId" as "teamId",
                "wrCompetitionId" as "competitionId",
                "wrCommentaryId" as "commentaryId",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM "tblTeamPointLogs"
            WHERE "wrCommentaryId" = $1`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [data.commentaryId]
            }
        )
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableTeamPointLogs.js/getLogByComIdQuery",
            request
        )
        throw new Error(error)
    }
}
module.exports = {
    createTeamPointLogQuery,
    getLogByComIdQuery
}
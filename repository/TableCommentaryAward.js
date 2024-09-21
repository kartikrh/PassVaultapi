const { errorLogger } = require("../utilities/logger")

const getAllCommentaryAwardQuery = async (fastify) => {
    return await fastify.db.query(
        `
            SELECT 
                "tblCommentaryAwards"."wrId" as "id",
                "tblCommentaryAwards"."wrCommentaryId" as "commentaryId",
                "wrAwardId" as "awardId",
                "tblCommentaryAwards"."wrTeamId" as "teamId",
                "tblCommentaryAwards"."wrPlayerId" as "playerId",
                "tblCommentaryAwards"."wrCreatedAt" as "createdAt",
                "tblCommentaryAwards"."wrCreatedBy" as "createdBy",
                "tblCommentaryAwards"."wrModifyAt" as "modifyAt",
                "tblCommentaryAwards"."wrModifyBy" as "modifyBy",
                "team"."wrTeamName" as "teamName",
                "player"."wrPlayerName" as "playerName"
            FROM "tblCommentaryAwards"
            LEFT JOIN "tblPlayers" as "player" on "player"."wrPlayerId" = "tblCommentaryAwards"."wrPlayerId"
            LEFT JOIN "tblTeams" as "team" on "team"."wrTeamId" = "tblCommentaryAwards"."wrTeamId"
            ORDER BY "wrId" DESC
        `,
        {
            type : fastify.db.QueryTypes.SELECT
        } 
    )
}
const addCommentaryAwardQuery = async (data,request,fastify) => {
    try {
        let query = `
            INSERT INTO "tblCommentaryAwards"
            (
                "wrCommentaryId",
                "wrAwardId",
                "wrTeamId",
                "wrPlayerId",
                "wrCreatedBy"
            )
            VALUES
            ($1 , $2 , $3 , $4 , $5)
            RETURNING 
            "wrId" as "id",
            "wrCommentaryId" as "commentaryId",
            "wrAwardId" as "awardId",
            "wrTeamId" as "teamId",
            "wrPlayerId" as "playerId",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifyAt" as "modifyAt",
            "wrModifyBy" as "modifyBy",
            "team"."wrTeamName" as "teamName",
            "player"."wrPlayerName" as "playerName"
            left join "tblPlayers" as "player" on "player"."wrId" = "tblCommentaryAwards"."wrPlayerId"
            left join "tblTeams" as "team" on "team"."wrId" = "tblCommentaryAwards"."wrTeamId"
        `;

        let values = [
            data.commentaryId,
            data.awardId,
            data.teamId || null,
            data.playerId || null,
            request.userTokenInfo.WrUserId
        ]

        const result = await fastify.db.query(query,{
            type : fastify.db.QueryTypes.SELECT,
            bind : values
        })

        return result[0];

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCommentaryAward/addCommentaryAward",
            request
        )
        throw new Error(error.message)
    }
}
const updateCommentaryAwardQuery = async (data,request,fastify) => {
    try {
        const query = `
            UPDATE "tblCommentaryAwards"
            SET
                "wrCommentaryId" = $1,
                "wrAwardId" = $2,
                "wrTeamId" = $3,
                "wrPlayerId" = $4,
                "wrModifyBy" = $5,
                "wrModifyAt" = now()
            WHERE
                "wrId" = $6
            RETURNING
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrAwardId" as "awardId",
                "wrTeamId" as "teamId",
                "wrPlayerId" as "playerId",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrModifyAt" as "modifyAt",
                "wrModifyBy" as "modifyBy"
        `;
        const values = [
            data.commentaryId,
            data.awardId,
            data.teamId || null,
            data.playerId || null,
            request.userTokenInfo.WrUserId,
            data.id
        ]
        const result = await fastify.db.query(query,{
            type : fastify.db.QueryTypes.SELECT,
            bind : values
        })
        return result[0];

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCommentaryAward/updateCommentaryAward",
            request
        )
        throw new Error(error.message)
    }   
}
const deleteCommentaryAwardQuery = async (request,fastify) => {
    try {
        const query = `
            DELETE FROM "tblCommentaryAwards"
            WHERE
                "wrId" = ANY($1)
        `;
        await fastify.db.query(query,{
            type : fastify.db.QueryTypes.SELECT,
            bind : [request.body.id]
        })
        return true;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCommentaryAward/deleteCommentaryAward",
            request
        )
        throw new Error(error.message)
    }
}
const assignAwardQuery = async(data,request,fastify) => {
    try {
        // i want to get value (), () like this
        let values = [];
        data.forEach((item) => {
            values.push(`(${item.commentaryId},${item.awardId},${item.teamId || null},${item.playerId || null},${request.userTokenInfo.WrUserId})`)
        })
        values = values.join(",");
        

        const query = `
                WITH inserted AS (
            INSERT INTO "tblCommentaryAwards"
                (
                    "wrCommentaryId",
                    "wrAwardId",
                    "wrTeamId",
                    "wrPlayerId",
                    "wrCreatedBy"
                )
                VALUES
                ${values}  -- This is where your dynamically generated values go
            RETURNING
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrAwardId" as "awardId",
                "wrTeamId" as "teamId",
                "wrPlayerId" as "playerId",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrModifyAt" as "modifyAt",
                "wrModifyBy" as "modifyBy"
        )
        SELECT 
            inserted.*,
            team."wrTeamName" as "teamName",
            player."wrPlayerName" as "playerName"
        FROM inserted
        LEFT JOIN "tblPlayers" player ON player."wrPlayerId" = inserted."playerId"
        LEFT JOIN "tblTeams" team ON team."wrTeamId" = inserted."teamId";
        `;  
        const result = await fastify.db.query(query,{
            type : fastify.db.QueryTypes.SELECT
        })
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableCommentaryAward/assignAward",
            request
        )
        throw new Error(error.message)
    }
}

module.exports = {
    getAllCommentaryAwardQuery,
    addCommentaryAwardQuery,
    updateCommentaryAwardQuery,
    deleteCommentaryAwardQuery,
    assignAwardQuery
}
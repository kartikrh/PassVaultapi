const { errorLogger } = require("../utilities/logger");

const getAllICCRankingQuery = async (fastify, request) => {
    try {
        const result = await fastify.db.query(
            `
            select 
            "wrId" as "id",
            "wrSportId" as "sportId",
            "wrMatchTypeId" as "matchTypeId",
            "wrType" as "type",
            "wrIsMen" as "isMen",
            "wrTeamId" as "teamId",
            "wrPlayerId" as "playerId",
            "wrPlayerTypeId" as "playerTypeId",
            "wrRating" as "rating",
            "wrPoint" as "point",
            "wrRank" as "rank",
            "wrPreRank" as "preRank",
            "wrRemark" as "remark",
            "wrIsActive" as "isActive",
            "wrCreateDate" as "createDate",
            "wrCreatedBy" as "createdBy",
            "wrModifyDate" as "modifyDate",
            "wrModifyBy" as "modifyBy" 
        from "tblICCRanking" 
        WHERE "wrIsDeleted" = false;`,
            {
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/getICCRankingByIdQuery",
            request
        );
        throw new Error(err.message);
    }
}

const getICCRankingByIdQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `
            select 
            "wrId" as "id",
            "wrSportId" as "sportId",
            "wrMatchTypeId" as "matchTypeId",
            "wrType" as "type",
            "wrIsMen" as "isMen",
            "wrTeamId" as "teamId",
            "wrPlayerId" as "playerId",
            "wrPlayerTypeId" as "playerTypeId",
            "wrRating" as "rating",
            "wrPoint" as "point",
            "wrRank" as "rank",
            "wrPreRank" as "preRank",
            "wrRemark" as "remark",
            "wrIsActive" as "isActive",
            "wrCreateDate" as "createDate",
            "wrCreatedBy" as "createdBy",
            "wrModifyDate" as "modifyDate",
            "wrModifyBy" as "modifyBy" 
        from "tblICCRanking 
        WHERE "wrId" = $1 AND "wrIsDeleted" = false`,
            {
                bind: [
                    data.id
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/getICCRankingByIdQuery",
            request
        );
        throw new Error(err.message);
    }
}

const insertICCRankingQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `
            WITH insert_data AS (
                INSERT INTO "tblICCRanking" ("wrSportId", "wrMatchTypeId", "wrType", "wrIsMen", "wrTeamId", "wrPlayerId", "wrPlayerTypeId", "wrRating", "wrPoint", "wrRank", "wrPreRank", "wrRemark", "wrIsActive", "wrCreatedBy", "wrIsDeleted") 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $13, false) 
                returning *
            )

            select 
                "wrId" as "id",
                "wrSportId" as "sportId",
                "wrMatchTypeId" as "matchTypeId",
                "wrType" as "type",
                "wrIsMen" as "isMen",
                "wrTeamId" as "teamId",
                "wrPlayerId" as "playerId",
                "wrPlayerTypeId" as "playerTypeId",
                "wrRating" as "rating",
                "wrPoint" as "point",
                "wrRank" as "rank",
                "wrPreRank" as "preRank",
                "wrRemark" as "remark",
                "wrIsActive" as "isActive",
                "wrCreateDate" as "createDate",
                "wrCreatedBy" as "createdBy",
                "wrModifyDate" as "modifyDate",
                "wrModifyBy" as "modifyBy"
            from insert_data`,
            {
                bind: [
                    data.sportId || null,
                    data.matchTypeId || null,
                    data.type || null,
                    data.isMen || false,
                    data.teamId || null,
                    data.playerId || null,
                    data.playerTypeId || null,
                    data.rating || 0,
                    data.point || 0,
                    data.rank || 0,
                    data.remark || null,
                    data.isActive || true,
                    request.userTokenInfo.WrUserId || null
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/insertICCRankingQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateICCRankingQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH updated_data AS (
            update "tblICCRanking" set 
                "wrSportId" = $1, "wrMatchTypeId" = $2,"wrType" = $3, "wrIsMen" = $4, "wrTeamId" = $5, "wrPlayerId" = $6, "wrPlayerTypeId" = $7, "wrRating" = $8, "wrPoint" = $9, "wrRank" = $10, "wrPreRank" = $11, "wrRemark" = $12, "wrIsActive" = $13, "wrModifyDate" = NOW(), "wrModifyBy" = $14 
            where "wrId" = $15 
            RETURNING *
            )
            select 
                "wrId" as "id",
                "wrSportId" as "sportId",
                "wrMatchTypeId" as "matchTypeId",
                "wrType" as "type",
                "wrIsMen" as "isMen",
                "wrTeamId" as "teamId",
                "wrPlayerId" as "playerId",
                "wrPlayerTypeId" as "playerTypeId",
                "wrRating" as "rating",
                "wrPoint" as "point",
                "wrRank" as "rank",
                "wrPreRank" as "preRank",
                "wrRemark" as "remark",
                "wrIsActive" as "isActive",
                "wrCreateDate" as "createDate",
                "wrCreatedBy" as "createdBy",
                "wrModifyDate" as "modifyDate",
                "wrModifyBy" as "modifyBy" 
            from updated_data`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.sportId,
                    data.matchTypeId,
                    data.type,
                    data.isMen,
                    data.teamId,
                    data.playerId,
                    data.playerTypeId,
                    data.rating,
                    data.point,
                    data.rank,
                    data.preRank,
                    data.remark,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.id
                ],
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/updateICCRankingQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteICCRankingByIdQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblICCRanking" SET 
                "wrIsActive" = $1,
                "wrIsDeleted" = $2,
                "wrDeletedBy" = $3,
                "wrDeletedAt" = NOW() 
            WHERE "wrId" =  ANY($4)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [false, true, request.userTokenInfo.WrUserId, id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/deleteICCRankingByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveICCRankingByIdQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
        `
            update "tblICCRanking" set
            "wrIsActive" = $1
            where "wrId" = $2
        `,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/tblICCRanking.js/activeInactiveICCRankingByIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteAllICCRankingQuery = async (request, fastify) => {
    try {
        return await fastify.db.query(
            `
                UPDATE "tblICCRanking" SET
                    "wrIsActive" = $1,
                    "wrIsDeleted" = $2,
                    "wrDeletedBy" = $3,
                    "wrDeletedAt" = NOW()
                WHERE "wrIsDeleted" = $4
            `, {
                bind: [
                    false,
                    true,
                    request?.userTokenInfo?.WrUserId,
                    false
                ],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/tblICCRanking.js/deleteAllICCRankingQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllICCRankingQuery,
    getICCRankingByIdQuery,
    insertICCRankingQuery,
    updateICCRankingQuery,
    deleteICCRankingByIdQuery,
    activeInactiveICCRankingByIdQuery,
    deleteAllICCRankingQuery
};

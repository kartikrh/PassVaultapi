const { errorLogger } = require("../utilities/logger");

const getAllAutoUpdateCommentaryDataQuery = async (whereCondition = undefined, fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrOffsetHour" as "offsetHour",
                "wrStatus" as "status",
                "wrMessage" as "message",
                "wrCreateDate" as "createDate",
                "wrUpdateDate" as "updateDate"
            FROM "tblAutoUpdateCommentaryData"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdateCommentaryData.js/getAllAutoUpdateCommentaryDataQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertAutoUpdateCommentaryDataQuery = async (data, fastify) => {
    try {
        const result = await fastify.db.query(
            `
            WITH insert_data AS (
              INSERT INTO "tblAutoUpdateCommentaryData" ("wrCommentaryId","wrOffsetHour","wrStatus", "wrMessage"
              ) VALUES (
                $1,
                $2,
                $3,
                $4
              ) returning *
            )

            SELECT 
              "wrId" as "id",
              "wrCommentaryId" as "commentaryId",
              "wrOffsetHour" as "offsetHour",
              "wrStatus" as "status",
              "wrMessage" as "message"
            from insert_data`,
            {
                bind: [
                    data.commentaryId,
                    data.offsetHour,
                    data.status,
                    data.message || null
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdateCommentaryData.js/insertAutoUpdateCommentaryDataQuery",
            null
        );
        throw new Error(err.message);
    }
};

const updateAutoUpdateCommentaryDataQuery = async (data, fastify) => {
    try {
        return await fastify.db.query(
            `
            update "tblAutoUpdateCommentaryData" set
                "wrStatus" = $1,
                "wrMessage" = $2,
                "wrUpdateDate" = now()
            where "wrId" = $3
            RETURNING *
            `,
            {
                bind: [
                    data.status,
                    data.message,
                    data.id
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoUpdateCommentaryData.js/updateAutoUpdateCommentaryDataQuery",
            null
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllAutoUpdateCommentaryDataQuery,
    insertAutoUpdateCommentaryDataQuery,
    updateAutoUpdateCommentaryDataQuery
};
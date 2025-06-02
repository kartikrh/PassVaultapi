const { errorLogger } = require("../utilities/logger");

const getAllPitchConditionsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrPitchCondition" as "pitchCondition",
                "wrBattingCondition" as "battingCondition",
                "wrPaceBowlingCondition" as "paceBowlingCondition",
                "wrSpineBowlingCondition" as "spineBowlingConniton"
            FROM "tblPitchCondition" 
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePitchCondition.js/getAllPitchConditionsQuery",
            null
        );
        throw new Error(err.message);
    }
};
const insertPitchConditionQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblPitchCondition" (
            "wrCommentaryId", "wrPitchCondition", "wrBattingCondition", "wrPaceBowlingCondition",
            "wrSpineBowlingCondition"
            ) 
            VALUES (
                $1, $2, $3, $4, $5
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrPitchCondition" as "pitchCondition",
                "wrBattingCondition" as "battingCondition",
                "wrPaceBowlingCondition" as "paceBowlingCondition",
                "wrSpineBowlingCondition" as "spineBowlingConniton"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.commentaryId || null,
                    data.pitchCondition || null,
                    data.battingCondition || null,
                    data.paceBowlingCondition || null,
                    data.spineBowlingConniton || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePitchCondition.js/insertPitchConditionQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updatePitchConditionQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH updated_data AS (
            UPDATE "tblPitchCondition" SET 
                "wrPitchCondition" = $1,
                "wrBattingCondition" = $2,
                "wrPaceBowlingCondition" = $3,
                "wrSpineBowlingCondition" = $4
            WHERE "wrId" = $5 AND "wrCommentaryId" = $6
            RETURNING *
        )
            SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrPitchCondition" as "pitchCondition",
                "wrBattingCondition" as "battingCondition",
                "wrPaceBowlingCondition" as "paceBowlingCondition",
                "wrSpineBowlingCondition" as "spineBowlingConniton"
            FROM updated_data;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.pitchCondition,
                    data.battingCondition,
                    data.paceBowlingCondition,
                    data.spineBowlingConniton,
                    data.id,
                    data.commentaryId,
                ],
            }
        );
        
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePitchCondition.js/updatePitchConditionQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deletePitchConditionWithCommIdQuery = async (commentaryId, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblPitchCondition" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrCommentaryId" = ANY($3)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [true, request.userTokenInfo.WrUserId, commentaryId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePitchCondition.js/deletePitchConditionWithCommIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllPitchConditionsQuery,
    insertPitchConditionQuery,
    updatePitchConditionQuery,
    deletePitchConditionWithCommIdQuery,
};
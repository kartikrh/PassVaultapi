const { errorLogger } = require("../utilities/logger");

const getAllMatchTypePredictorQuery = async (fastify) => {
    try {
        const query = `
            SELECT 
                "wrMatchTypePredictorId" as "matchTypePredictorId",
                "wrMatchTypeId" as "matchTypeId",
                "wrOver" as "over",
                "wrBall" as "ball",
                "wrRunPerBall" as "runPerBall",
                "wrOrder" as "order"
            FROM "tblMatchTypePredictors"
            WHERE "wrIsDeleted" = false
            
        `;

        const data = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.SELECT
            }
        );
        return data;

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableMenuItem/getAllMatchTypePredictorQuery",
            request
          );
        throw new Error(error.message); 
    }
}

const createMatchTypePredictorQuery = async (body,request, fastify) => {
    try {
        // insert many records
        const valuesToInsert = body.predictorData.map((item) => {
            return (
                `(
                    ${body.matchTypeId},
                    ${item.over},
                    ${item.ball},
                    ${item.runPerBall},
                    ${item.order}
                )`
            );
        }).join(',');
       
        const query = `
            INSERT INTO "tblMatchTypePredictors" 
            (
                "wrMatchTypeId",
                "wrOver",
                "wrBall",
                "wrRunPerBall",
                "wrOrder"
            )
            VALUES
            ${valuesToInsert}
            RETURNING 
            "wrMatchTypePredictorId" as "matchTypePredictorId",
            "wrMatchTypeId" as "matchTypeId",
            "wrOver" as "over",
            "wrBall" as "ball",
            "wrRunPerBall" as "runPerBall",
            "wrOrder" as "order"
        `;

        const data = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.INSERT
            }
        );


        return data[0];

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableMenuItem/createMenuItemQuery",
            request
          );
        throw new Error(error.message); 
    }
}
const deletePredictorByMatchTypeQuery = async (matchTypeId, fastify, request) => {
    try {
        const query = `
            UPDATE "tblMatchTypePredictors" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrMatchTypeId" = $3
        `;

        const data = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [true, request.userTokenInfo.WrUserId, matchTypeId],
            }
        );

        return data;

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableMenuItem/deleteMenuItemQuery",
            request
          );
        throw new Error(error.message); 
    }

}
const deletePredictorQuery = async (matchTypePredictorId, fastify, request) => {
    try {
       return fastify.db.query(
            `UPDATE "tblMatchTypePredictors" SET
                    "wrIsDeleted" = $1,
                    "wrDeletedBy" = $2,
                    "wrDeletedAt" = now()
            WHERE "wrMatchTypePredictorId" = ANY($3)`,
            {
                bind: [true, request.userTokenInfo.WrUserId, matchTypePredictorId],
                type: fastify.db.QueryTypes.UPDATE
            }
       )
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableMenuItem/deleteMenuItemQuery",
            request
          );
        throw new Error(error.message);
    }
}
module.exports = {
  createMatchTypePredictorQuery,
  getAllMatchTypePredictorQuery,
  deletePredictorByMatchTypeQuery,
  deletePredictorQuery
};
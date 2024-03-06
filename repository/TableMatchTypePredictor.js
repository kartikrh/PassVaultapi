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
            "wrRunPerBall" as "runPerBall"
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
const deletePredictorByMatchTypeQuery = async (matchTypeId, fastify) => {
    try {
        const query = `
            DELETE FROM "tblMatchTypePredictors" 
            WHERE "wrMatchTypeId" = ${matchTypeId}
        `;

        const data = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.DELETE
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
const deletePredictorQuery = async (matchTypePredictorId, fastify) => {
    try {
       return fastify.db.query(
            `DELETE FROM "tblMatchTypePredictors" WHERE "wrMatchTypePredictorId" = ANY($1)`,
            {
                bind: [matchTypePredictorId],
                type: fastify.db.QueryTypes.DELETE
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
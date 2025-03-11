const { errorLogger } = require("../utilities/logger");

const getAllMatchTypeBowlingPredictor = async (fastify) => {
    return await fastify.db.query(
       `
            SELECT
                "wrId" as "id",
                "wrMatchTypeId" as "matchTypeId",
                "wrBowlingTypeId" as "bowlingTypeId",
                "wrPossibility" as "possibility",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedAt" as "updatedAt",
                "wrUpdatedBy" as "updatedBy"
            FROM
                "tblMatchTypeBowlingPredictor"
       `,
       {
            type: fastify.db.QueryTypes.SELECT
       }
    );

}
const getByMatchTypeQuery = async (data, request, fastify) => {
    try {
        let result = `
            SELECT 
                cb."wrId" as "id",
                mt."wrMatchTypeId" as "matchTypeId",
                bt."wrBowlingTypeId" as "bowlingTypeId",
                COALESCE(cb."wrPossibility", NULL) AS "possibility",
                COALESCE(cb."wrCreatedAt", NULL) AS "createdAt",
                COALESCE(cb."wrCreatedBy", NULL) AS "createdBy",
                COALESCE(cb."wrUpdatedAt", NULL) AS "updatedAt",
                COALESCE(cb."wrUpdatedBy", NULL) AS "updatedBy",
                bt."wrBowlingType" as "bowlingType"
            FROM "tblMatchTypes" mt
            JOIN "tblBowlingTypes" bt ON TRUE AND bt."wrIsActive" = TRUE
            LEFT JOIN "tblMatchTypeBowlingPredictor" cb 
                ON cb."wrMatchTypeId" = mt."wrMatchTypeId" 
                AND cb."wrBowlingTypeId" = bt."wrBowlingTypeId"
            WHERE mt."wrMatchTypeId" = $1;
        `;

        return await fastify.db.query(
            result,
            {
                bind: [data.matchTypeId],
                type: fastify.db.QueryTypes.SELECT
            }
        );
    } catch (error) {
        errorLogger(
            fastify, 
            error.message, 
            "DB ERROR --> repository/TableMatchTypeBowlingPredictor.js/getByMatchTypeQuery", 
            request
        );
        throw new Error(error.message);

    }
}
const saveQuery = async (data,request,fastify)=>{
    try {
        const values = data?.map((i) => {
            return (
                `(
                    ${i.matchTypeId},
                    ${i.bowlingTypeId},
                    ${i.possibility},
                    now(),
                    ${request.userTokenInfo.WrUserId}
                )`
            );
        }).join(',');
       
        // console.log(values)
        const result = await fastify.db.query(`
                INSERT INTO "tblMatchTypeBowlingPredictor"
                ("wrMatchTypeId", "wrBowlingTypeId", "wrPossibility", "wrCreatedAt", "wrCreatedBy")
                VALUES
                ${values}
                RETURNING
                "wrId" as "id",
                "wrMatchTypeId" as "matchTypeId",
                "wrBowlingTypeId" as "bowlingTypeId",
                "wrPossibility" as "possibility",
                "wrCreatedAt" as "createdAt",
                "wrUpdatedAt" as "updatedAt",
                "wrUpdatedBy" as "updatedBy"
            `,
        {
            type: fastify.db.QueryTypes.SELECT,

        })
        return result;
    } catch (error) {
        errorLogger(
            fastify, 
            error.message, 
            "DB ERROR --> repository/TableMatchTypeBowlingPredictor.js/saveQuery", 
            request
        );
        throw new Error(error.message);
    }
}
const updateQuery = async (data,request,fastify) => {
    try {
        const result = []
        for (d of data){
            let r = await fastify.db.query(
                `
                    UPDATE "tblMatchTypeBowlingPredictor"
                    SET
                        "wrPossibility" = $1,
                        "wrUpdatedAt" = now()::timestamp,
                        "wrUpdatedBy" =$3
                    WHERE "wrId" = $2
                    RETURNING
                        "wrId" as "id",
                        "wrMatchTypeId" as "matchTypeId",
                        "wrBowlingTypeId" as "bowlingTypeId",
                        "wrPossibility" as "possibility",
                        "wrCreatedAt" as "createdAt",
                        "wrUpdatedAt" as "updatedAt",
                        "wrUpdatedBy" as "updatedBy"

                `,
                {
                    type: fastify.db.QueryTypes.SELECT,
                    bind : [
                        d.possibility,
                        d.id,
                        request.userTokenInfo.WrUserId
                    ] 
                }
            )
            result.push(r[0])
        }
        return result;
    } catch (error) {
        errorLogger(
            fastify, 
            error.message, 
            "DB ERROR --> repository/TableMatchTypeBowlingPredictor.js/updateQuery", 
            request
        );
        throw new Error(error.message);
    }
}
module.exports = {
    getAllMatchTypeBowlingPredictor,
    getByMatchTypeQuery,
    saveQuery,
    updateQuery
};
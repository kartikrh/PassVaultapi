const { EventMarketStatus } = require("../utilities");
const { errorLogger } = require("../utilities/logger")

const getRunnerByIdQuery = async(fastify, request , where = null)=>{
    try {
        let result = await fastify.db.query(
            `SELECT * 
            FROM "tblMarketRunners"
            ${where ? `WHERE ${where}` : ""}`,
            {
                type: fastify.db.QueryTypes.SELECT
            }
        )
        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableMarketRunner.js/getRunnerByIdQuery",
            request
        )
        throw new Error(error.message)
    }
}
const setResultInRunnerMarketQuery = async(data, request,fastify)=>{
    try {
        let q1 = `UPDATE "tblMarketRunners"
            SET "wrSelectionStatus" = $1
            WHERE "wrRunnerId" = $2
        `;
        await fastify.db.query(q1, {
            bind: [EventMarketStatus.WIN, data.result],
            type: fastify.db.QueryTypes.UPDATE
        });
        let q2 = `UPDATE "tblMarketRunners"
            SET "wrSelectionStatus" = $1
            WHERE "wrRunnerId" != $2 AND "wrEventMarketId" = $3
        `;
        await fastify.db.query(q2, {
            bind: [EventMarketStatus.LOSE, data.result, data.eventMarketId],
            type: fastify.db.QueryTypes.UPDATE
        });
        // set the status in wrData table
        let q3 = `SELECT 
          tem."wrID" as "marketId",
          tem."wrEventRefID" as "eventId",
          tem."wrMarketName" as "marketName",
          tem."wrStatus" as "status",
          tem."wrIsActive" as "isActive",
          tem."wrIsAllow" as "isAllow",
          json_agg(
              json_build_object(
                  'runnerId' , tmr."wrRunnerId",
                  'runner', tmr."wrRunner",
                  'status' , tmr."wrSelectionStatus",
                  'line', tmr."wrLine",
                  'overRate', tmr."wrOverRate",
                  'underRate', tmr."wrUnderRate",
                  'backPrice', tmr."wrBackPrice",
                  'layPrice', tmr."wrLayPrice",
                  'backSize', tmr."wrBackSize",
                  'laySize', tmr."wrLaySize"
              )
          ) as "runner"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
      WHERE tem."wrID" = $1
      GROUP BY tem."wrID"`;

    let data1 = await fastify.db.query(q3, {
            bind: [data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
    });

    let q4 = `UPDATE "tblEventMarkets"
        SET "wrData" = $1,
            "wrStatus" = $2,
            "wrResult" = $3,
            "wrIsResult" = $4,
            "wrSettledTime" = now()::timestamp,
            "wrLastUpdate" = now()::timestamp
        WHERE "wrID" = $5
        AND "wrCommentaryId" = $6
        AND "wrStatus" = $7
        AND "wrIsResult" = $8
        AND "wrResult" IS NULL

    `;
    
    await fastify.db.query(q4, {
        bind: [
            data1[0],
            EventMarketStatus.Settled,
            data.result,
            true,
            data.eventMarketId,
            data.commentaryId,
            EventMarketStatus.Close,
            false
        ],
        type: fastify.db.QueryTypes.UPDATE
    });


    return true;
    } catch (error) {
        console.log("error", error)
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableMarketRunner.js/setResultInRunnerMarketQuery",
            request
        )
        throw new Error(error.message) 
    }
}
const getRunnerByMarketQuery = async(request,fastify)=>{
    try {
        let q1 = `
            SELECT 
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runner",
                "wrSelectionStatus" as "status",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrEventMarketId" = $1
        `;
        let data = await fastify.db.query(q1, {
            bind: [request.body.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
        return data;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableMarketRunner.js/getRunnerByMarketQuery",
            request
        )
        throw new Error(error.message)
    }
}
module.exports = {
    getRunnerByIdQuery,
    setResultInRunnerMarketQuery,
    getRunnerByMarketQuery
}
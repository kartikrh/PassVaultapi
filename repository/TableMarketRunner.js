const { EventMarketStatus } = require("../utilities");
const { errorLogger } = require("../utilities/logger")
// const { getAllEventMarketsV2ByIdQuery } = require("./TableEventMarkets");

const getAllMarketRunnersQuery = async (fastify) => {
    return await fastify.db.query(
      `SELECT
          tmr."wrRunnerId" AS "runnerId",
          tmr."wrEventMarketId" AS "eventMarketId",
          tmr."wrRunner" AS "runner",
          tmr."wrLine" AS "line",
          tmr."wrOverRate" AS "overRate",
          tmr."wrUnderRate" AS "underRate",
          tmr."wrSelectionId" AS "selectionId",
          tmr."wrSelectionStatus" AS "selectionStatus",
          tmr."wrOrder" AS "order",
          tmr."wrBackPrice" AS "backPrice",
          tmr."wrBackSize" AS "backSize",
          tmr."wrLayPrice" AS "layPrice",
          tmr."wrLaySize" as "laySize",	
          tmr."wrTeamId" as "teamId",
          tmr."wrLastUpdate" as "lastUpdate"
      FROM "tblMarketRunners" tmr
      LEFT JOIN "tblEventMarkets" tem ON tmr."wrEventMarketId" = tem."wrID"
      LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
      WHERE tmr."wrIsDeleted" = false
        AND tc."wrIsDelete" = false
        AND (
            tc."wrCommentaryStatus" != 4 
            OR (tc."wrCommentaryStatus" = 4 AND tc."wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days')
        )
        AND tem."wrIsDeleted" = false 
        AND (
            tem."wrStatus" IN (1, 2, 3, 4)
            OR (tem."wrStatus" = 5 AND tem."wrIsResult" = FALSE)
        )`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
};

const getRunnerByIdQuery = async(fastify, request , where = null)=>{
    try {
        if(where == null){
            `"wrIsDeleted" = false`
        }
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

    let q4 = `UPDATE "tblEventMarkets"
        SET 
            "wrStatus" = $1,
            "wrResult" = $2,
            "wrIsResult" = $3,
            "wrSettledTime" = now()::timestamp,
            "wrLastUpdate" = now()::timestamp
        WHERE "wrID" = $4
        AND "wrCommentaryId" = $5
        AND "wrStatus" = $6
        AND "wrIsResult" = $7
        AND "wrResult" IS NULL

    `;
    
    await fastify.db.query(q4, {
        bind: [
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
        WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
        GROUP BY tem."wrID"`;

        let data1 = await fastify.db.query(q3, {
            bind: [data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });

        let q5 = `UPDATE "tblEventMarkets"
            SET "wrData" = $1,
            "wrLastUpdate" = now()::timestamp
            WHERE "wrID" = $2
            RETURNING
                "wrStatus" as "status",
                "wrResult" as "result",
                "wrIsResult" as "isResult",
                "wrSettledTime" as "settledTime",
                "wrData" as "data",
                "wrLastUpdate" as "lastUpdate"
        `;
        const result = await fastify.db.query(q5, {
            bind: [data1[0], data.eventMarketId],
            type: fastify.db.QueryTypes.UPDATE
        });
        // let whereCondition = ` tem."wrID" = ${data.eventMarketId}`
        // const result = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition)

        // return true;
        return result[0];
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
            WHERE "wrEventMarketId" = $1 AND "wrIsDeleted" = false
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

const getAllMarketRunnersV2ByIdQuery = async (fastify, whereCondition = null) => {
    try {
        return await fastify.db.query(
            `SELECT
                tmr."wrRunnerId" AS "runnerId",
                tmr."wrEventMarketId" AS "eventMarketId",
                tmr."wrRunner" AS "runner",
                tmr."wrLine" AS "line",
                tmr."wrOverRate" AS "overRate",
                tmr."wrUnderRate" AS "underRate",
                tmr."wrSelectionId" AS "selectionId",
                tmr."wrSelectionStatus" AS "selectionStatus",
                tmr."wrOrder" AS "order",
                tmr."wrBackPrice" AS "backPrice",
                tmr."wrBackSize" AS "backSize",
                tmr."wrLayPrice" AS "layPrice",
                tmr."wrLaySize" as "laySize",	
                tmr."wrTeamId" as "teamId",
                tmr."wrLastUpdate" as "lastUpdate"
            FROM "tblMarketRunners" tmr
            LEFT JOIN "tblEventMarkets" tem ON tmr."wrEventMarketId" = tem."wrID"
            LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
            ${whereCondition ? ` WHERE ${whereCondition}` : ""}`,
            {
              type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableMarketRunner.js/getAllMarketRunnersV2ByIdQuery",
            request
        )
        throw new Error(error.message)
    }
    
};

module.exports = {
    getRunnerByIdQuery,
    setResultInRunnerMarketQuery,
    getRunnerByMarketQuery,
    getAllMarketRunnersQuery,
    getAllMarketRunnersV2ByIdQuery,
}
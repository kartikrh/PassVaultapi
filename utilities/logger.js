const ResponseLog = require("../database/schema/responseLogger");
const { ISCOMMENTARYLOGGER } = require("./configConstants");

const errorLogger = async (fastify, errMessage, errStack, request) => {
  try {
    
    return await fastify.db.query(
      `INSERT INTO "tblErrorLogs" ("wrErrMessage", "wrErrStack", "wrDomain","wrUserId","wrUserIp", "wrCreatedDate" ,"wrApi", "wrRequestBody") VALUES ($1, $2, $3, $4, $5, $6 ,$7,$8)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          errMessage,
          errStack,
          request?.hostname || null,
          request?.userTokenInfo?.WrUserId || null,
          request?.ip || null,
          new Date(),
          request?.originalUrl || null,
          request?.body || null,
        ],
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const responseLogger = async (request) => {
  try {
    await ResponseLog.create({
      domain: request.hostname,
      path: request.originalUrl,
      responseTime: request.responseTime,
      userId: request?.userTokenInfo?.WrUserId,
      userIp: request.ip,
    });
  } catch (err) {
    console.log(err);
  }
};

const responseLogInDB = async (request, fastify) => {
  try {
    let addLog = global.tblConfigs.find((x) => x.key == ISCOMMENTARYLOGGER)?.value || "false";
    if (addLog == "false") {
      return true;
    }
    let data;
    if(request.errId !== undefined){
      data = await fastify.db.query(
        `UPDATE "tblResponseLogs"
        SET "wrResponseTime" = $1,
        "wrRequestEndTime" = $2,
        "wrRequestBody" = $3,
        "wrUserId" = $4
        WHERE "wrId" = $5
        RETURNING "wrId" as "errId"`,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            parseInt(request.responseTime),
            request.endTimeTimeStemp,
            request.body || null,
            request?.userTokenInfo?.WrUserId || null,
            request.errId
          ]
        }
      )
    } 
    else {
      data = await fastify.db.query(
        `INSERT INTO "tblResponseLogs" ("wrDomain", "wrPath", "wrResponseTime",
        "wrUserId", "wrUserIp", "wrRequestBody",
        "wrRequestStartTime", "wrRequestEndTime") VALUES ($1, $2, $3, $4, $5 ,$6,$7,$8)
        RETURNING "wrId" as "errId"`,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            request.hostname,
            request.originalUrl,
            parseInt(request.responseTime) || null,
            request?.userTokenInfo?.WrUserId || null,
            request.ip,
            request.body || null,
            request.startTimeTimeStemp,
            request.endTimeTimeStemp || null,
          ],
        }
      );
    }

    return data[0];
  } catch (err) {
    console.log(err);
  }
};
const marketLogger = async (data , request , fastify) => {
  const {
    eventMarketId,
    actionType,
    value,
    commentaryId,
    result
  } = data;
  try {
    return await fastify.db.query(
      `INSERT INTO "tblMarketLogs" ("wrEventMarketId", "wrActionType", "wrValue", "wrUserId", "wrCreatedDate" , "wrCommentaryId",
      "wrResult") VALUES ($1, $2, $3, $4, $5 ,$6 ,$7)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          eventMarketId || null,
          actionType,
          value,
          request.userTokenInfo.WrUserId,
          new Date(),
          commentaryId || null,
          result || null
        ],
      }
    );
  } catch (err) {
    console.log(err);
  }
}
const marketDataLogger = async (data , request , fastify) => {
  try {
    const {
      eventMarketId,
      commentaryId,
      dataTosave,
      updateType,
      lineDiff,
      isSendData
    } = data;

    return await fastify.db.query(
      `INSERT INTO "tblMarketDataLogs" ("wrEventMarketId", "wrCommentaryId", "wrData", "wrUpdateType", "wrCreatedDate",
      "wrLineDiff", "wrCreatedBy", "wrIsSendData") VALUES ($1, $2, $3, $4, $5 ,$6, $7 , $8)`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          eventMarketId,
          commentaryId,
          JSON.stringify(dataTosave),
          updateType,
          new Date(),
          lineDiff || 0,
          request?.userTokenInfo?.WrUserId || 0,
          isSendData || true
        ],
      }
    );
  } catch (error) {
    console.log(error);
  }
}

const tblPredictorAPILogger = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `INSERT INTO "tblPredictorAPILogs" ("wrEndpoint", "wrRequestBody", "wrRequestStartTime", "wrRequestEndTime", "wrResponse", "wrCommentaryId", "wrCreatedBy") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.endPoint,
          JSON.stringify(data.requestBody),
          data.requestStartTime,
          data.requestEndTime,
          JSON.stringify(data.response),
          data.requestBody.commentary_id || null,
          request?.userTokenInfo?.WrUserId || null,
        ],
      }
    );
  } catch (error) {
    console.log(error);
  }
}

const tblThirdPartyAPILogger = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `INSERT INTO "tblThirdPartyApiLogs" ("wrEndPoint", "wrRequestBody", "wrRequestStartTime", "wrRequestEndTime", "wrResponse", "wrCreatedBy") VALUES ($1, $2, $3, $4, $5, $6)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.endPoint,
          JSON.stringify(data.requestBody),
          data.requestStartTime,
          data.requestEndTime,
          JSON.stringify(data.response),
          request?.userTokenInfo?.WrUserId || null,
        ],
      }
    );
  } catch (error) {
    console.log(error);
  }
}

const commentaryLogger = async (data, request, fastify) => {
  try {
    let addLog = global.tblConfigs.find((x) => x.key == ISCOMMENTARYLOGGER)?.value || "false";
    if (addLog == "false") {
      return true;
    }
    let comment = request.body.deleteCommentaryBallByBallId || request.body.deleteOverId ? "delete" : null;
    const query = `
      INSERT INTO "tblCommentaryLogs"
      (
        "wrCommentaryId",
        "wrRequestBody",
        "wrResponse",
        "wrGlobal",
        "wrExtraData",
        "wrCreatedBy",
        "wrComment",
        "wrApiName",
        "wrReqStartTime"
      )
      VALUES ($1, $2, $3, $4, $5, $6,$7, $8,$9)
    `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.commentaryId,
        data.requestBody,
        data.response,
        data.global || null,
        data.extra || null,
        request?.userTokenInfo?.WrUserId || null,
        comment || null,
        data.apiName || null,
        data.reqStartTime || null
      ],  
    });

  } catch (error) {
    console.log(error);
    errorLogger(
      fastify,
      "Error in commentaryLogger",
      error,
      request
    )
  }
}


const updateWebRequestLogs = async (request, fastify) => {
  try {
    let data;
    if (request.wRId !== 0) {
      data = await fastify.db.query(
        `UPDATE "webRequestLogs"
        SET "response" = $1,
            "responseTime" = $2,
            "generatedFrom" = $3,
            "comment" = $4,
            "UserID" = $6
        WHERE "webRequestLogId" = $5
        RETURNING "webRequestLogId" as "wRId"`,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            request.response,
            request.responseTime,
            request.generatedFrom || null,
            request.comment,
            request?.userTokenInfo?.WrUserId || null,
            request.wRId
          ]
        }
      );
    } else {
      data = await fastify.db.query(
        `INSERT INTO "webRequestLogs" (
          "request", 
          "requestTime", 
          "generatedFrom", 
          "comment", 
          "response", 
          "responseTime",
          "UserID"
        ) VALUES ($1, $2, $3, $4, $5, $6,$7)
        RETURNING "webRequestLogId" as "wRId"`,
        {
          type: fastify.db.QueryTypes.INSERT,
          bind: [
            request.request,
            request.requestTime,
            request.generatedFrom || null,
            request.comment,
            request.response || null,
            request.responseTime,
            request?.userTokenInfo?.WrUserId || null,
          ]
        }
      );
    }

    return data[0];
  } catch (err) {
    console.log(err);
  }
};

const eventMarketLogger = async (data , request , fastify) => {
  try {
    const query = `
      	INSERT INTO "tblEventMarketLogs"
        (
          "wrCommentaryId",
          "wrRequestBody",
          "wrResponse",
          "wrError",
          "wrCreatedAt",
          "wrCreatedBy"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.commentaryId,
        JSON.stringify(data.requestBody),
        JSON.stringify(data.response ) || null,
        JSON.stringify(data.error) || null,
        new Date(),
        request?.userTokenInfo?.WrUserId || null,
      ],
    });
    return true;
  } catch (error) {
    console.log(error);
  }
}

const marektResultLogger = async (data, request, fastify) => {
  try {
    const query = `
      	INSERT INTO "tblResultLogs"
        (
          "wrResult",
          "wrMarketId",
          "wrCreatedAt",
          "wrCreatedBy"
        )
        VALUES ($1, $2, $3, $4)
    `;
    await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.result || null,
        data.marketId || null,
        new Date(),
        request?.userTokenInfo?.WrUserId || null,
      ],
    });
    return true;
  } catch (error) {
    console.log(error);
    errorLogger(
      fastify,
      "Error in marektResultLogger",
      error,
      request
    )
  }
}

module.exports = { errorLogger, responseLogger ,responseLogInDB , marketLogger ,
  marketDataLogger,tblPredictorAPILogger,tblThirdPartyAPILogger,commentaryLogger,updateWebRequestLogs,
  eventMarketLogger, marektResultLogger};

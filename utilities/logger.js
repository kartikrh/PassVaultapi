const ResponseLog = require("../database/schema/responseLogger");

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
          type: fastify.db.QueryTypes.INSERT,
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
    commentaryId
  } = data;
  try {
    return await fastify.db.query(
      `INSERT INTO "tblMarketLogs" ("wrEventMarketId", "wrActionType", "wrValue", "wrUserId", "wrCreatedDate" , "wrCommentaryId") VALUES ($1, $2, $3, $4, $5 ,$6)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          eventMarketId || null,
          actionType,
          value,
          request.userTokenInfo.WrUserId,
          new Date(),
          commentaryId || null,
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
      `INSERT INTO "tblPredictorAPILogs" ("wrEndpoint", "wrRequestBody", "wrRequestStartTime", "wrRequestEndTime", "wrResponse", "wrCommentaryId") VALUES ($1, $2, $3, $4, $5, $6)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.endPoint,
          JSON.stringify(data.requestBody),
          data.requestStartTime,
          data.requestEndTime,
          JSON.stringify(data.response),
          data.commentaryId || null,
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
      `INSERT INTO "tblThirdPartyApiLogs" ("wrEndPoint", "wrRequestBody", "wrRequestStartTime", "wrRequestEndTime", "wrResponse") VALUES ($1, $2, $3, $4, $5)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.endPoint,
          JSON.stringify(data.requestBody),
          data.requestStartTime,
          data.requestEndTime,
          JSON.stringify(data.response),
        ],
      }
    );
  } catch (error) {
    console.log(error);
  }
}
module.exports = { errorLogger, responseLogger ,responseLogInDB , marketLogger ,marketDataLogger,tblPredictorAPILogger,tblThirdPartyAPILogger};

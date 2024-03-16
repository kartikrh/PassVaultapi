const ResponseLog = require("../database/schema/responseLogger");

const errorLogger = async (fastify, errMessage, errStack, request) => {
  try {
    
    return await fastify.db.query(
      `INSERT INTO "tblErrorLogs" ("wrErrMessage", "wrErrStack", "wrDomain","wrUserId","wrUserIp", "wrCreatedDate" ,"wrApi") VALUES ($1, $2, $3, $4, $5, $6 ,$7)`,
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
    return await fastify.db.query(
      `INSERT INTO "tblResponseLogs" ("wrDomain", "wrPath", "wrResponseTime", "wrUserId", "wrUserIp", "wrRequestBody",
      "wrRequestStartTime", "wrRequestEndTime") VALUES ($1, $2, $3, $4, $5 ,$6,$7,$8)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          request.hostname,
          request.originalUrl,
          parseInt(request.responseTime),
          request?.userTokenInfo?.WrUserId || null,
          request.ip,
          request.body || null,
          request.startTimeTimeStemp,
          request.endTimeTimeStemp,
        ],
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = { errorLogger, responseLogger ,responseLogInDB};

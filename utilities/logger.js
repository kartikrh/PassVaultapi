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

module.exports = { errorLogger };

const { errorLogger } = require("../utilities/logger");

const getAllMarketTemplateQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
      "wrID" AS "marketTemplateId",
      "wrMatchTypeID" AS "matchTypeId",
      "wrTemplateName",
      "wrIsPredefineMarket",
      "wrIsPreMatchOnly",
      "wrIsPreMatchMarket",
      "wrIsOver",
      "wrOver",
      "wrIsPlayer",
      "wrPlayerID",
      "wrIsAutoCancel",
      "wrAutoOpenType",
      "wrAutoOpen",
      "wrAutoCloseType",
      "wrBeforeAutoClose",
      "wrAutoSuspendType",
      "wrBeforeAutoSuspend",
      "wrIsBallStart",
      "wrIsAutoResultSet",
      "wrAutoResultType",
      "wrAutoResultafterBall",
      "wrAfterWicketAutoSuspend",
      "wrAfterWicketNotCreated",
      "wrCreatedBy",
      "wrIsActive" as "isActive"
  FROM "tblMarketTemplate";
  `,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

const insertMarketTemplateQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `with insert_data as(
              insert into "tblMarketTemplate" ("wrTemplateName","wrMatchTypeID","wrIsPredefineMarket","wrIsPreMatchOnly","wrIsPreMatchMarket","wrIsOver","wrOver","wrIsPlayer","wrPlayerID","wrIsAutoCancel","wrAutoOpenType","wrAutoOpen","wrAutoCloseType","wrBeforeAutoClose","wrAutoSuspendType","wrBeforeAutoSuspend","wrIsBallStart","wrIsAutoResultSet","wrAutoResultType","wrAutoResultafterBall","wrAfterWicketAutoSuspend","wrAfterWicketNotCreated","wrCreatedBy","wrIsActive") values (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) returning *
          )        
          select 
        "wrTemplateName",
        "wrMatchTypeID" as "matchTypeID",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsPreMatchOnly" as "isPreMatchOnly",
        "wrIsPreMatchMarket" as "isPreMatchMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerID" as "playerID",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrAutoOpenType" as "autoOpenType",
        "wrAutoOpen" as "autoOpen",
        "wrAutoCloseType" as "autoCloseType",
        "wrBeforeAutoClose" as "beforeAutoClose",
        "wrAutoSuspendType" as "autoSuspendType",
        "wrBeforeAutoSuspend" as "beforeAutoSuspend",
        "wrIsBallStart" as "isBallStart",
        "wrIsAutoResultSet" as "isAutoResultSet",
        "wrAutoResultType" as "autoResultType",
        "wrAutoResultafterBall" as "autoResultafterBall",
        "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",
        "wrAfterWicketNotCreated" as "afterWicketNotCreated",
        "wrCreatedBy" as "createdBy",
        "wrIsActive" as "isActive"
         from insert_data`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.wrTemplateName || null,
                    data.matchTypeID || null,
                    data.isPredefineMarket || null,
                    data.isPreMatchOnly || null,
                    data.insertMarketTemplateQuerysPreMatchMarket || null,
                    data.isOver || null,
                    data.over || null,
                    data.isPlayer || null,
                    data.playerID || null,
                    data.isAutoCancel || null,
                    data.autoOpenType || null,
                    data.autoOpen || null,
                    data.autoCloseType || null,
                    data.beforeAutoClose || null,
                    data.autoSuspendType || null,
                    data.beforeAutoSuspend || null,
                    data.isBallStart || null,
                    data.isAutoResultSet || null,
                    data.autoResultType || null,
                    data.autoResultafterBall || null,
                    data.afterWicketAutoSuspend || null,
                    data.afterWicketNotCreated || null,
                    data.createdBy || null,
                    data.isActive || null
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMarketTemplate.js/insertMarketTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllMarketTemplateQuery,
    insertMarketTemplateQuery
};

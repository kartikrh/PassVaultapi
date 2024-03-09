const { errorLogger } = require("../utilities/logger");

const getAllMarketTemplateQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
      "wrID" AS "marketTemplateId",
      "wrMatchTypeID" AS "matchTypeID",
      tm."wrMatchType" as "matchType",
      "wrTemplateName" as "templateName",
      "wrIsPredefineMarket" as "isPredefineMarket",
      "wrIsPreMatchOnly" as "isPreMatchOnly",
      "wrIsPreMatchMarket" as "isPreMatchMarket",
      "wrIsOver" as "isOver",
      "wrOver" as "over",
      "wrIsPlayer" as "isPlayer",
      "wrPlayerName" as "playerName",
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
      tmt."wrCreatedBy" as "createdBy",
      "wrIsActive" as "isActive"
  FROM "tblMarketTemplates" tmt
  LEFT JOIN "tblMatchTypes" tm ON tmt."wrMatchTypeID" = "tm"."wrMatchTypeId"
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
              insert into "tblMarketTemplates" ("wrTemplateName","wrMatchTypeID","wrIsPredefineMarket","wrIsPreMatchOnly","wrIsPreMatchMarket","wrIsOver","wrOver","wrIsPlayer","wrPlayerName","wrIsAutoCancel","wrAutoOpenType","wrAutoOpen","wrAutoCloseType","wrBeforeAutoClose","wrAutoSuspendType","wrBeforeAutoSuspend","wrIsBallStart","wrIsAutoResultSet","wrAutoResultType","wrAutoResultafterBall","wrAfterWicketAutoSuspend","wrAfterWicketNotCreated","wrCreatedBy","wrIsActive") values (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) returning *
          )        
        select 
        "wrID" AS "marketTemplateId",
        "wrTemplateName" as "templateName",
        "wrMatchTypeID" as "matchTypeID",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsPreMatchOnly" as "isPreMatchOnly",
        "wrIsPreMatchMarket" as "isPreMatchMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerName" as "playerName",
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
                    data.templateName || null,
                    data.matchTypeID || null,
                    data.hasOwnProperty("isPredefineMarket") ? data.isPredefineMarket : null,
                    data.hasOwnProperty("isPreMatchOnly") ? data.isPreMatchOnly : null,
                    data.hasOwnProperty("isPreMatchMarket") ? data.isPreMatchMarket : null,
                    data.hasOwnProperty("isOver") ? data.isOver : null,
                    data.over || null,
                    data.hasOwnProperty("isPlayer") ? data.isPlayer : null,
                    data.playerName || null,
                    data.hasOwnProperty("isAutoCancel") ? data.isAutoCancel : null,
                    data.hasOwnProperty("autoOpenType") ? data.autoOpenType : null,
                    data.hasOwnProperty("autoOpen") ? data.autoOpen : null,
                    data.hasOwnProperty("autoCloseType") ? data.autoCloseType : null,
                    data.hasOwnProperty("beforeAutoClose") ? data.beforeAutoClose : null,
                    data.hasOwnProperty("autoSuspendType") ? data.autoSuspendType : null,
                    data.hasOwnProperty("beforeAutoSuspend") ? data.beforeAutoSuspend : null,
                    data.hasOwnProperty("isBallStart") ? data.isBallStart : null,
                    data.hasOwnProperty("isAutoResultSet") ? data.isAutoResultSet : null,
                    data.hasOwnProperty("autoResultType") ? data.autoResultType : null,
                    data.hasOwnProperty("autoResultafterBall") ? data.autoResultafterBall : null,
                    data.hasOwnProperty("afterWicketAutoSuspend") ? data.afterWicketAutoSuspend : null,
                    data.hasOwnProperty("afterWicketNotCreated") ? data.afterWicketNotCreated : null,
                    data.createdBy || null,
                    data.hasOwnProperty("isActive") ? data.isActive : null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMarketTemplate/insertMarketTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
};
const updateMarketTemplateQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `
               UPDATE "tblMarketTemplates"
                SET "wrTemplateName" = $1,
                "wrMatchTypeID" = $2,
                "wrIsPredefineMarket" = $3,
                "wrIsPreMatchOnly" = $4,
                "wrIsPreMatchMarket" = $5,
                "wrIsOver" = $6,
                "wrOver" = $7,
                "wrIsPlayer" = $8,
                "wrPlayerName" = $9,
                "wrIsAutoCancel" = $10,
                "wrAutoOpenType" = $11,
                "wrAutoOpen" = $12,
                "wrAutoCloseType" = $13,
                "wrBeforeAutoClose" = $14,
                "wrAutoSuspendType" = $15,
                "wrBeforeAutoSuspend" = $16,
                "wrIsBallStart" = $17,
                "wrIsAutoResultSet" = $18,
                "wrAutoResultType" = $19,
                "wrAutoResultafterBall" = $20,
                "wrAfterWicketAutoSuspend" = $21,
                "wrAfterWicketNotCreated" = $22,
                "wrIsActive" = $23
            WHERE "wrID" = $24
            `,
            {
                bind: [
                    data.templateName ,
                    data.matchTypeID ,
                    data.isPredefineMarket ,
                    data.isPreMatchOnly ,
                    data.isPreMatchMarket ,
                    data.isOver ,
                    data.over ,
                    data.isPlayer ,
                    data.playerName ,
                    data.isAutoCancel ,
                    data.autoOpenType ,
                    data.autoOpen ,
                    data.autoCloseType ,
                    data.beforeAutoClose ,
                    data.autoSuspendType ,
                    data.beforeAutoSuspend ,
                    data.isBallStart ,
                    data.isAutoResultSet ,
                    data.autoResultType ,
                    data.autoResultafterBall ,
                    data.afterWicketAutoSuspend ,
                    data.afterWicketNotCreated ,
                    data.isActive,
                    data.marketTemplateId
                ],
                type: fastify.db.QueryTypes.SELECT,
            })

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMarketTemplate/deleteMarketTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
}
const deleteMarketTemplateQuery = async (marketTemplateId, fastify, request) => {
    try {
        return await fastify.db.query(
            `delete from "tblMarketTemplates" where "wrID" = ANY ($1)`,
            {
                bind: [marketTemplateId],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMarketTemplate/deleteMarketTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
};
const updateStatusMarketTemplateQuery = async (request , fastify) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblMarketTemplates" SET "wrIsActive" = $1 WHERE "wrID" = $2`,
            {
                bind: [request.body.isActive, request.body.marketTemplateId],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMarketTemplate/deleteMarketTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
}
module.exports = {
    getAllMarketTemplateQuery,
    insertMarketTemplateQuery,
    deleteMarketTemplateQuery,
    updateMarketTemplateQuery,
    updateStatusMarketTemplateQuery
};

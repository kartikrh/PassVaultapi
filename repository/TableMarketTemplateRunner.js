const { errorLogger } = require("../utilities/logger");

const getAllMarketTemplateRunnerQuery = async (fastify) => {
    return await fastify.db.query(
        `
            SELECT  
                "wrId" as "marketTemplateRunnerId",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize",
                "wrPredefinedValue" as "predefinedValue"
            FROM "tblMarketTemplateRunners"
            WHERE "wrIsDeleted" = false;
        `,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    )
};
const createMarketTemplateRunnerQuery = async (request, fastify) => {
    try {
        const query = `
            with count_parent as (
                select count(*) as count from "tblMarketTemplateRunners" where "wrMarketTemplateId" = $1
            ),
            insert_data as (
                INSERT INTO "tblMarketTemplateRunners"
                (
                    "wrMarketTemplateId",
                    "wrRunner",
                    "wrLine",
                    "wrOverRate",
                    "wrUnderRate",
                    "wrLastUpdate",
                    "wrSelectionId",
                    "wrOrder",
                    "wrBackPrice",
                    "wrLayPrice",
                    "wrBackSize",
                    "wrLaySize",
                    "wrPredefinedValue"
                )
                select $1,$2,$3,$4,$5,now(),
                ($1 || '0' || ((SELECT count FROM count_parent) + 1)::TEXT),
                (select count from count_parent) + 1,
                $6,$7,$8,$9,$10
                RETURNING 
                    "wrId" as "marketTemplateRunnerId",
                    "wrMarketTemplateId" as "marketTemplateId",
                    "wrRunner" as "runner",
                    "wrLine" as "line",
                    "wrOverRate" as "overRate",
                    "wrUnderRate" as "underRate",
                    "wrLastUpdate" as "lastUpdate",
                    "wrSelectionId" as "selectionId",
                    "wrOrder" as "order",
                    "wrBackPrice" as "backPrice",
                    "wrLayPrice" as "layPrice",
                    "wrBackSize" as "backSize",
                    "wrLaySize" as "laySize",
                    "wrPredefinedValue" as "predefinedValue"
            )
            select * from insert_data  
        `;
        const result = await fastify.db.query(
            query,
            {
                bind: [
                    request.body.marketTemplateId,
                    request.body.runner,
                    request.body.line,
                    request.body.overRate,
                    request.body.underRate,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0,
                    request.body.predefinedValue || 0,

                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/createMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
};
const updateMarketTemplateRunnerQuery   = async (request, fastify) => {
    try {
        const query = `
            UPDATE "tblMarketTemplateRunners"	
            SET 
                "wrRunner" = $2,
                "wrLine" = $3,
                "wrOverRate" = $4,
                "wrUnderRate" = $5,
                "wrLastUpdate" = now(),
                "wrBackPrice" = $6,
                "wrLayPrice" = $7,
                "wrBackSize" = $8,
                "wrLaySize" = $9,
                "wrPredefinedValue" = $10
            WHERE "wrId" = $1
            RETURNING 
                "wrId" as "marketTemplateRunnerId",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize",
                "wrPredefinedValue" as "predefinedValue"
        `;

        const result = await fastify.db.query(
            query,
            {
                bind: [
                    request.body.marketTemplateRunnerId,
                    request.body.runner,
                    request.body.line,
                    request.body.overRate,
                    request.body.underRate,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0,
                    request.body.predefinedValue || 0,
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/createMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
};
const deleteMarketTemplateRunnerQuery = async (request, fastify) => {
    try {
        const query = `
            UPDATE "tblMarketTemplateRunners" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrId" = ANY($3)
        `;

        await fastify.db.query(
            query,
            {
                bind: [true, request.userTokenInfo.WrUserId, request.body.marketTemplateRunnerId],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/deleteMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
}
const getTemplateRunnerQuery = async (data,request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT
                cmtt."wrId" AS "commMatchTypeTemplateId",
                tmt."wrID" AS "marketTemplateId",
                tmt."wrMatchTypeID" AS "matchTypeID",
                tm."wrMatchType" AS "matchType",
                tmt."wrTemplateName" AS "templateName",
                tmt."wrIsPredefineMarket" AS "isPredefineMarket",
                tmt."wrIsOver" AS "isOver",
                tmt."wrOver" AS "over",
                tmt."wrIsPlayer" AS "isPlayer",
                tmt."wrPlayerName" AS "playerName",
                tmt."wrIsAutoCancel" AS "isAutoCancel",
                tmt."wrCreateType" AS "createType",
                tmt."wrCreate" AS "create",
                tmt."wrAutoOpenType" AS "autoOpenType",
                tmt."wrAutoOpen" AS "autoOpen",
                tmt."wrAutoCloseType" AS "autoCloseType",
                tmt."wrBeforeAutoClose" AS "beforeAutoClose",
                tmt."wrAutoSuspendType" AS "autoSuspendType",
                tmt."wrBeforeAutoSuspend" AS "beforeAutoSuspend",
                tmt."wrIsBallStart" AS "isBallStart",
                tmt."wrIsAutoResultSet" AS "isAutoResultSet",
                tmt."wrAutoResultType" AS "autoResultType",
                tmt."wrAutoResultafterBall" AS "autoResultafterBall",
                tmt."wrAfterWicketAutoSuspend" AS "afterWicketAutoSuspend",
                tmt."wrAfterWicketNotCreated" AS "afterWicketNotCreated",
                tmt."wrCreatedBy" AS "createdBy",
                tmt."wrIsActive" AS "isActive",
                tmt."wrActionType" AS "actionType",
                tmt."wrMarketTypeId" AS "marketTypeId",
                tmt."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
                tmt."wrMargin" AS "margin",
                tmt."wrCreateRefId" AS "createRefId",
                tmt."wrOpenRefId" AS "openRefId",
                tmt."wrIsPredefineRunnerValue" AS "isPredefineRunnerValue",
                tmt."wrTemplateType" AS "templateType",
                tmt."wrIsDefaultBetAllowed" AS "isDefaultBetAllowed",
                tmt."wrIsDefaultMarketActive" AS "isDefaultMarketActive",
                tmt."wrDelay" AS "delay",
                tmt."wrIsPerEvent" AS "isPerEvent",
                tmt."wrIsShowInAdvanceMarket" AS "isShowInAdvanceMarket",
                tmt."wrLineType" AS "lineType",
                tmt."wrDefaultBackSize" AS "defaultBackSize",
                tmt."wrDefaultLaySize" AS "defaultLaySize",
                tmt."wrBeforeSuspendMin" AS "beforeSuspendMin",
                tmt."wrBeforeCloseMin" AS "beforeCloseMin",
                tmt."wrDefaultIsSendData" AS "defaultIsSendData",
                tmt."wrHowManyOpenMarkets" AS "howManyOpenMarkets",
                tmt."wrRateDiff" AS "rateDiff",
                tmt."wrDevTemplateName" as "devTemplateName",
                tmt."wrAutoSuspendAfterChase" as "autoSuspendAfterChase",
                tmt."wrAutoNotCreateAfterChase" as "autoNotCreateAfterChase",
                tmt."wrIsDefaultSetResult" as "isDefaultSetResult",
                COALESCE(runner_data.runners, '[]') AS "runners"
            FROM "tblCommMatchTypeTemplate" AS cmtt
            LEFT JOIN "tblMarketTemplates" AS tmt ON tmt."wrID" = cmtt."wrMarketTemplateId"
            LEFT JOIN "tblMatchTypes" AS tm ON tmt."wrMatchTypeID" = tm."wrMatchTypeId"
            LEFT JOIN (
                SELECT
                    r."wrMarketTemplateId",
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'marketTemplateRunnerId', r."wrId",
                        'marketTemplateId', r."wrMarketTemplateId",
                        'runner', r."wrRunner",
                        'line', r."wrLine",
                        'overRate', r."wrOverRate",
                        'underRate', r."wrUnderRate",
                        'lastUpdate', r."wrLastUpdate",
                        'selectionId', r."wrSelectionId",
                        'order', r."wrOrder",
                        'backPrice', r."wrBackPrice",
                        'layPrice', r."wrLayPrice",
                        'backSize', r."wrBackSize",
                        'laySize', r."wrLaySize",
                        'predefinedValue', r."wrPredefinedValue"
                    ) ORDER BY r."wrId" ASC
                    ) AS runners
                FROM "tblMarketTemplateRunners" r
                GROUP BY r."wrMarketTemplateId"
            ) AS runner_data ON runner_data."wrMarketTemplateId" = tmt."wrID"
            WHERE cmtt."wrCommentaryId" = $1
            AND tmt."wrIsDeleted" = false
            ${data.ignoreMarkets.length > 0 ? `AND tmt."wrMarketTypeCategoryId" NOT IN (${data.ignoreMarkets})` : ""}
            ${data.where ? data.where : ""}
            ORDER BY tmt."wrTemplateName" ASC
            `
            , {
                bind: [
                    data.commentaryId,
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/getTemplateRunnerQuery",
            request
        );
        throw new Error(error.message);
    }
}
module.exports = {
    getAllMarketTemplateRunnerQuery,
    createMarketTemplateRunnerQuery,
    updateMarketTemplateRunnerQuery,
    deleteMarketTemplateRunnerQuery,
    getTemplateRunnerQuery
};


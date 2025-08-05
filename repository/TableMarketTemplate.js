const { errorLogger } = require("../utilities/logger");

const getAllMarketTemplateQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT
      "wrID" AS "marketTemplateId",
      "wrMatchTypeID" AS "matchTypeID",
      tm."wrMatchType" as "matchType",
      "wrTemplateName" as "templateName",
      "wrIsPredefineMarket" as "isPredefineMarket",
      "wrIsOver" as "isOver",
      "wrOver" as "over",
      "wrIsPlayer" as "isPlayer",
      "wrPlayerName" as "playerName",
      "wrIsAutoCancel" as "isAutoCancel",
      "wrCreateType" as "createType",
      "wrCreate" as "create",
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
      tmt."wrIsActive" as "isActive",
      tmt."wrActionType" as "actionType",
      tmt."wrMarketTypeId" as "marketTypeId",
      tmts."wrMarketTypeName" as "marketTypeName",
      tmt."wrMarketTypeCategoryId" as "marketTypeCategoryId",
      tmtc."wrCategoryName" as "categoryName",
      tmt."wrMargin" as "margin",
      tmt."wrCreateRefId" as "createRefId",
      tmt."wrOpenRefId" as "openRefId",
      tmt."wrIsPredefineRunnerValue" as "isPredefineRunnerValue",
      tmt."wrTemplateType" as "templateType",
      tmt."wrIsDefaultBetAllowed" as "isDefaultBetAllowed",
      tmt."wrIsDefaultMarketActive" as "isDefaultMarketActive",
      "wrDelay" as "delay",
      "wrIsPerEvent" as "isPerEvent",
      "wrIsShowInAdvanceMarket" as "isShowInAdvanceMarket",
      "wrLineType" as "lineType",
      "wrDefaultBackSize" as "defaultBackSize",
      "wrDefaultLaySize" as "defaultLaySize",
      "wrBeforeSuspendMin" as "beforeSuspendMin",
      "wrBeforeCloseMin" as "beforeCloseMin",
      "wrDefaultIsSendData" as "defaultIsSendData",
      "wrHowManyOpenMarkets" as "howManyOpenMarkets",
      "wrRateDiff" as "rateDiff",
      "wrNotIncludedOver" as "notIncludedOver",
      tmt."wrDevTemplateName" as "devTemplateName",
      tmt."wrAutoSuspendAfterChase" as "autoSuspendAfterChase",
      tmt."wrAutoNotCreateAfterChase" as "autoNotCreateAfterChase",
      tmt."wrIsNameInBall" as "isNameInBall",
      tmt."wrIsPython" as "isPython"
  FROM "tblMarketTemplates" tmt
  LEFT JOIN "tblMatchTypes" tm ON tmt."wrMatchTypeID" = "tm"."wrMatchTypeId"
  LEFT JOIN "tblMarketTypes" tmts ON tmt."wrMarketTypeId" = tmts."wrId"
  LEFT JOIN "tblMarketTypeCategories" tmtc ON tmt."wrMarketTypeCategoryId" =tmtc."wrId"
  WHERE tmt."wrIsDeleted" = false;
  `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
// const emptyToNull = (v) => v === undefined || v === null || v === "" ? null : v;
const insertMarketTemplateQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
              insert into "tblMarketTemplates" ("wrTemplateName","wrMatchTypeID","wrIsPredefineMarket","wrIsOver","wrOver","wrIsPlayer",
              "wrPlayerName","wrIsAutoCancel","wrCreateType","wrCreate","wrAutoOpenType","wrAutoOpen","wrAutoCloseType","wrBeforeAutoClose",
              "wrAutoSuspendType","wrBeforeAutoSuspend","wrIsBallStart","wrIsAutoResultSet","wrAutoResultType","wrAutoResultafterBall",
              "wrAfterWicketAutoSuspend","wrAfterWicketNotCreated","wrCreatedBy","wrIsActive" , "wrActionType",
              "wrMarketTypeId","wrMarketTypeCategoryId","wrMargin" , "wrCreateRefId" , "wrOpenRefId",
              "wrTemplateType", "wrDelay","wrIsDefaultBetAllowed","wrIsDefaultMarketActive", "wrIsPerEvent", "wrIsShowInAdvanceMarket",
              "wrLineType", "wrDefaultBackSize", "wrDefaultLaySize","wrBeforeSuspendMin","wrBeforeCloseMin", "wrDefaultIsSendData",
              "wrHowManyOpenMarkets", "wrRateDiff", "wrNotIncludedOver", "wrAutoSuspendAfterChase", "wrAutoNotCreateAfterChase", "wrIsPython",
              "wrDevTemplateName", "wrIsNameInBall"
              ) values (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26, $27, $28, $29, $30, $31, $32,$33,$34,$35,$36,
                $37, $38, $39 ,$40 ,$41, $42, $43, $44, $45, $46, $47, $48, $49, $50
                ) returning *
          )        
        select 
        "wrID" AS "marketTemplateId",
        "wrTemplateName" as "templateName",
        "wrMatchTypeID" as "matchTypeID",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerName" as "playerName",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrCreateType" as "createType",
        "wrCreate" as "create",
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
        "wrIsActive" as "isActive",
        "wrActionType" as "actionType",
        "wrMarketTypeId" as "marketTypeId",
        "wrMarketTypeCategoryId" as "marketTypeCategoryId",
        "wrMargin" as "margin",
        "wrCreateRefId" as "createRefId",
        "wrOpenRefId" as "openRefId",
        "wrIsPredefineRunnerValue" as "isPredefineRunnerValue",
        "wrTemplateType" as "templateType",
        "wrIsDefaultBetAllowed" as "isDefaultBetAllowed",
        "wrIsDefaultMarketActive" as "isDefaultMarketActive",
        "wrDelay" as "delay",
        "wrIsPerEvent" as "isPerEvent",
        "wrIsShowInAdvanceMarket" as "isShowInAdvanceMarket",
        "wrLineType" as "lineType",
        "wrDefaultBackSize" as "defaultBackSize",
        "wrDefaultLaySize" as "defaultLaySize",
        "wrBeforeSuspendMin" as "beforeSuspendMin",
        "wrBeforeCloseMin" as "beforeCloseMin",
        "wrDefaultIsSendData" as "defaultIsSendData",
        "wrHowManyOpenMarkets" as "howManyOpenMarkets",
        "wrRateDiff" as "rateDiff",
        "wrNotIncludedOver" as "notIncludedOver",
        "wrDevTemplateName" as "devTemplateName",
        "wrAutoSuspendAfterChase" as "autoSuspendAfterChase",
        "wrAutoNotCreateAfterChase" as "autoNotCreateAfterChase",
        "wrIsNameInBall" as "isNameInBall",
        "wrIsPython" as "isPython"
         from insert_data`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.templateName || null,
          data.matchTypeID === undefined ? null : data.matchTypeID,
          data.hasOwnProperty("isPredefineMarket")
            ? data.isPredefineMarket
            : null,
          // data.hasOwnProperty("isPreMatchOnly") ? data.isPreMatchOnly : null,
          // data.hasOwnProperty("isPreMatchMarket") ? data.isPreMatchMarket : null,
          data.hasOwnProperty("isOver") ? data.isOver : null,
          data.over || null,
          data.hasOwnProperty("isPlayer") ? data.isPlayer : null,
          data.playerName || null,
          data.hasOwnProperty("isAutoCancel") ? data.isAutoCancel : null,
          data.hasOwnProperty("createType") ? data.createType : null,
          data.hasOwnProperty("create") ? data.create : null,
          data.hasOwnProperty("autoOpenType") ? data.autoOpenType : null,
          data.hasOwnProperty("autoOpen") ? data.autoOpen : null,
          data.hasOwnProperty("autoCloseType") ? data.autoCloseType : null,
          data.hasOwnProperty("beforeAutoClose") ? data.beforeAutoClose : null,
          data.hasOwnProperty("autoSuspendType") ? data.autoSuspendType : null,
          data.hasOwnProperty("beforeAutoSuspend")
            ? data.beforeAutoSuspend
            : null,
          data.hasOwnProperty("isBallStart") ? data.isBallStart : null,
          data.hasOwnProperty("isAutoResultSet") ? data.isAutoResultSet : null,
          data.hasOwnProperty("autoResultType") ? data.autoResultType : null,
          data.hasOwnProperty("autoResultafterBall")
            ? data.autoResultafterBall
            : null,
          data.hasOwnProperty("afterWicketAutoSuspend")
            ? data.afterWicketAutoSuspend
            : null,
          data.hasOwnProperty("afterWicketNotCreated")
            ? data.afterWicketNotCreated
            : null,
          data.createdBy || null,
          data.hasOwnProperty("isActive") ? data.isActive : null,
          data.hasOwnProperty("actionType") ? data.actionType : 0,
          data.marketTypeId,
          data.marketTypeCategoryId,
          data.margin,
          data.createRefId || null,
          data.openRefId || null,
          data.templateType || null,
          data.delay || 0,
          data.isDefaultBetAllowed,
          data.isDefaultMarketActive,
          data.isPerEvent || false,
          data.isShowInAdvanceMarket || false,
          data.lineType || 1, // 1 => backlay, 2 => lay
          data.defaultBackSize || 100,
          data.defaultLaySize || 100,
          data.beforeSuspendMin === undefined ? null : parseInt(data.beforeSuspendMin),
          data.beforeCloseMin === undefined ? null : parseInt(data.beforeCloseMin),
          // emptyToNull(data.beforeSuspendMin),
          // emptyToNull(data.beforeCloseMin),
          data.hasOwnProperty("defaultIsSendData") ? data.defaultIsSendData : false,
          data.howManyOpenMarkets === undefined ? 1 : data.howManyOpenMarkets,
          data.rateDiff === undefined ? 1 : data.rateDiff,
          data.notIncludedOver === undefined ? null : data.notIncludedOver,
          data.autoSuspendAfterChase === undefined ? null : data.autoSuspendAfterChase,
          data.autoNotCreateAfterChase === undefined ? null : data.autoNotCreateAfterChase,
          data.isPython === undefined ? true : data.isPython,
          data.devTemplateName === undefined ? null : data.devTemplateName,
          data.isNameInBall === undefined ? false : data.isNameInBall,
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

const insertMarketTemplateInCloneQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
              insert into "tblMarketTemplates" ("wrTemplateName","wrMatchTypeID","wrIsPredefineMarket","wrIsOver","wrOver","wrIsPlayer",
              "wrPlayerName","wrIsAutoCancel","wrCreateType","wrCreate","wrAutoOpenType","wrAutoOpen","wrAutoCloseType","wrBeforeAutoClose",
              "wrAutoSuspendType","wrBeforeAutoSuspend","wrIsBallStart","wrIsAutoResultSet","wrAutoResultType","wrAutoResultafterBall",
              "wrAfterWicketAutoSuspend","wrAfterWicketNotCreated","wrCreatedBy","wrIsActive" , "wrActionType",
              "wrMarketTypeId","wrMarketTypeCategoryId","wrMargin" , "wrCreateRefId" , "wrOpenRefId",
              "wrTemplateType", "wrDelay","wrIsDefaultBetAllowed","wrIsDefaultMarketActive", "wrIsPerEvent", "wrIsPredefineRunnerValue", "wrIsShowInAdvanceMarket",
              "wrLineType", "wrDefaultBackSize", "wrDefaultLaySize"
               ,"wrBeforeSuspendMin","wrBeforeCloseMin", "wrDefaultIsSendData", "wrHowManyOpenMarkets", "wrRateDiff", "wrNotIncludedOver",
               "wrAutoSuspendAfterChase", "wrAutoNotCreateAfterChase", "wrIsPython", "wrDevTemplateName", "wrIsNameInBall"
              ) values (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26, $27, $28, $29, $30, $31, $32,$33,$34,$35,$36,$37,
                $38, $39, $40 ,$41 ,$42, $43, $44, $45, $46, $47, $48, $49, $50, $51
                ) returning *
          )        
        select 
        "wrID" AS "marketTemplateId",
        "wrTemplateName" as "templateName",
        "wrMatchTypeID" as "matchTypeID",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerName" as "playerName",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrCreateType" as "createType",
        "wrCreate" as "create",
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
        "wrIsActive" as "isActive",
        "wrActionType" as "actionType",
        "wrMarketTypeId" as "marketTypeId",
        "wrMarketTypeCategoryId" as "marketTypeCategoryId",
        "wrMargin" as "margin",
        "wrCreateRefId" as "createRefId",
        "wrOpenRefId" as "openRefId",
        "wrIsPredefineRunnerValue" as "isPredefineRunnerValue",
        "wrTemplateType" as "templateType",
        "wrIsDefaultBetAllowed" as "isDefaultBetAllowed",
        "wrIsDefaultMarketActive" as "isDefaultMarketActive",
        "wrDelay" as "delay",
        "wrIsPerEvent" as "isPerEvent",
        "wrIsShowInAdvanceMarket" as "isShowInAdvanceMarket",
        "wrLineType" as "lineType",
        "wrDefaultBackSize" as "defaultBackSize",
        "wrDefaultLaySize" as "defaultLaySize",
        "wrBeforeSuspendMin" as "beforeSuspendMin",
        "wrBeforeCloseMin" as "beforeCloseMin",
        "wrDefaultIsSendData" as "defaultIsSendData",
        "wrHowManyOpenMarkets" as "howManyOpenMarkets",
        "wrRateDiff" as "rateDiff",
        "wrNotIncludedOver" as "notIncludedOver",
        "wrDevTemplateName" as "devTemplateName",
        "wrIsNameInBall" as "isNameInBall",
        "wrAutoSuspendAfterChase" as "autoSuspendAfterChase",
        "wrAutoNotCreateAfterChase" as "autoNotCreateAfterChase",
        "wrIsPython" as "isPython"
         from insert_data`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.templateName || null,
          data.matchTypeID == undefined ? null : data.matchTypeID,
          data.hasOwnProperty("isPredefineMarket")
            ? data.isPredefineMarket
            : null,
          data.hasOwnProperty("isOver") ? data.isOver : null,
          data.over || null,
          data.hasOwnProperty("isPlayer") ? data.isPlayer : null,
          data.playerName || null,
          data.hasOwnProperty("isAutoCancel") ? data.isAutoCancel : null,
          data.hasOwnProperty("createType") ? data.createType : null,
          data.hasOwnProperty("create") ? data.create : null,
          data.hasOwnProperty("autoOpenType") ? data.autoOpenType : null,
          data.hasOwnProperty("autoOpen") ? data.autoOpen : null,
          data.hasOwnProperty("autoCloseType") ? data.autoCloseType : null,
          data.hasOwnProperty("beforeAutoClose") ? data.beforeAutoClose : null,
          data.hasOwnProperty("autoSuspendType") ? data.autoSuspendType : null,
          data.hasOwnProperty("beforeAutoSuspend")
            ? data.beforeAutoSuspend
            : null,
          data.hasOwnProperty("isBallStart") ? data.isBallStart : null,
          data.hasOwnProperty("isAutoResultSet") ? data.isAutoResultSet : null,
          data.hasOwnProperty("autoResultType") ? data.autoResultType : null,
          data.hasOwnProperty("autoResultafterBall")
            ? data.autoResultafterBall
            : null,
          data.hasOwnProperty("afterWicketAutoSuspend")
            ? data.afterWicketAutoSuspend
            : null,
          data.hasOwnProperty("afterWicketNotCreated")
            ? data.afterWicketNotCreated
            : null,
          data.createdBy || null,
          data.hasOwnProperty("isActive") ? data.isActive : null,
          data.hasOwnProperty("actionType") ? data.actionType : 0,
          data.marketTypeId,
          data.marketTypeCategoryId,
          data.margin,
          data.createRefId || null,
          data.openRefId || null,
          data.templateType || null,
          data.delay || 0,
          data.isDefaultBetAllowed,
          data.isDefaultMarketActive,
          data.isPerEvent || false,
          data.hasOwnProperty("isPredefineRunnerValue") ? data.isPredefineRunnerValue : null,
          data.isShowInAdvanceMarket,
          data.lineType,
          data.defaultBackSize,
          data.defaultLaySize,
          data.beforeSuspendMin || null,
          data.beforeCloseMin || null,
          data.hasOwnProperty("defaultIsSendData") ? data.defaultIsSendData : false,
          data.howManyOpenMarkets === undefined ? 1 : data.howManyOpenMarkets,
          data.rateDiff === undefined ? 1 : data.rateDiff,
          data.notIncludedOver === undefined ? null : data.notIncludedOver,
          data.autoSuspendAfterChase === undefined ? null : data.autoSuspendAfterChase,
          data.autoNotCreateAfterChase === undefined ? null : data.autoNotCreateAfterChase,
          data.isPython === undefined ? true : data.isPython,
          data.devTemplateName === undefined ? null : data.devTemplateName,
          data.isNameInBall === undefined ? false : data.isNameInBall,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate/insertMarketTemplateInCloneQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateMarketTemplateQuery = async (data, fastify, request) => {
  try {
    // const result = await fastify.db.query(
    //     `
    //        UPDATE "tblMarketTemplates"
    //         SET "wrTemplateName" = $1,
    //         "wrMatchTypeID" = $2,
    //         "wrIsPredefineMarket" = $3,
    //         "wrIsPreMatchOnly" = $4,
    //         "wrIsPreMatchMarket" = $5,
    //         "wrIsOver" = $6,
    //         "wrOver" = $7,
    //         "wrIsPlayer" = $8,
    //         "wrPlayerName" = $9,
    //         "wrIsAutoCancel" = $10,
    //         "wrCreateType" = $11,
    //         "wrCreate" = $12,
    //         "wrAutoOpenType" = $13,
    //         "wrAutoOpen" = $14,
    //         "wrAutoCloseType" = $15,
    //         "wrBeforeAutoClose" = $16,
    //         "wrAutoSuspendType" = $17,
    //         "wrBeforeAutoSuspend" = $18,
    //         "wrIsBallStart" = $19,
    //         "wrIsAutoResultSet" = $20,
    //         "wrAutoResultType" = $21,
    //         "wrAutoResultafterBall" = $22,
    //         "wrAfterWicketAutoSuspend" = $23,
    //         "wrAfterWicketNotCreated" = $24,
    //         "wrIsActive" = $25,
    //         "wrActionType" = $26,
    //         "wrMarketTypeId" = $27,
    //         "wrMarketTypeCategoryId" = $28,
    //         "wrMargin" = $29,
    //         "wrCreateRefId" = $30,
    //         "wrOpenRefId" = $31,
    //         "wrTemplateType" = $32,
    //         "wrDelay" = $33
    //     WHERE "wrID" = $34
    //     `,
    //     {
    //         bind: [
    //             data.templateName ,
    //             data.matchTypeID ,
    //             data.isPredefineMarket ,
    //             data.isPreMatchOnly ,
    //             data.isPreMatchMarket ,
    //             data.isOver ,
    //             data.over ,
    //             data.isPlayer ,
    //             data.playerName ,
    //             data.isAutoCancel ,
    //             data.createType,
    //             data.create,
    //             data.autoOpenType ,
    //             data.autoOpen ,
    //             data.autoCloseType ,
    //             data.beforeAutoClose ,
    //             data.autoSuspendType ,
    //             data.beforeAutoSuspend ,
    //             data.isBallStart ,
    //             data.isAutoResultSet ,
    //             data.autoResultType ,
    //             data.autoResultafterBall ,
    //             data.afterWicketAutoSuspend ,
    //             data.afterWicketNotCreated ,
    //             data.isActive,
    //             data.actionType,
    //             data.marketTypeId ,
    //             data.marketTypeCategoryId ,
    //             data.margin ,
    //             data.createRefId,
    //             data.openRefId,
    //             data.templateType,
    //             data.delay,
    //             data.marketTemplateId

    //         ],
    //         type: fastify.db.QueryTypes.SELECT,
    //     }
    // );

     const result = await fastify.db.query(
        `
           UPDATE "tblMarketTemplates"
            SET "wrTemplateName" = $1,
            "wrMatchTypeID" = $2,
            "wrIsPredefineMarket" = $3,
            "wrIsOver" = $4,
            "wrOver" = $5,
            "wrIsPlayer" = $6,
            "wrPlayerName" = $7,
            "wrIsAutoCancel" = $8,
            "wrCreateType" = $9,
            "wrCreate" = $10,
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
            "wrIsActive" = $23,
            "wrActionType" = $24,
            "wrMarketTypeId" = $25,
            "wrMarketTypeCategoryId" = $26,
            "wrMargin" = $27,
            "wrCreateRefId" = $28,
            "wrOpenRefId" = $29,
            "wrTemplateType" = $30,
            "wrDelay" = $31,
            "wrIsDefaultBetAllowed" = $33,
            "wrIsDefaultMarketActive"= $34,
            "wrIsPerEvent"= $35,
            "wrIsShowInAdvanceMarket" = $36,
            "wrLineType" = $37,
            "wrDefaultBackSize" = $38,
            "wrDefaultLaySize" = $39,
            "wrBeforeSuspendMin" = $40,
            "wrBeforeCloseMin" = $41,
            "wrDefaultIsSendData" = $42,
            "wrHowManyOpenMarkets" = $43,
            "wrRateDiff" = $44,
            "wrNotIncludedOver" = $45,
            "wrAutoSuspendAfterChase" = $46,
            "wrAutoNotCreateAfterChase" = $47,
            "wrIsPython" = $48,
            "wrDevTemplateName" = $49,
            "wrIsNameInBall" = $50
        WHERE "wrID" = $32
        `,
        {
            bind: [
                data.templateName ,
                data.matchTypeID ,
                data.isPredefineMarket ,
                data.isOver ,
                data.over ,
                data.isPlayer ,
                data.playerName ,
                data.isAutoCancel ,
                data.createType,
                data.create,
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
                data.actionType,
                data.marketTypeId ,
                data.marketTypeCategoryId ,
                data.margin ,
                data.createRefId,
                data.openRefId,
                data.templateType,
                data.delay,
                data.marketTemplateId,
                data.isDefaultBetAllowed,
                data.isDefaultMarketActive,
                data.isPerEvent,
                data.isShowInAdvanceMarket,
                data.lineType,
                data.defaultBackSize,
                data.defaultLaySize,
                data.beforeSuspendMin || null,
                data.beforeCloseMin || null,
                data.defaultIsSendData,
                data.howManyOpenMarkets,
                data.rateDiff,
                data.notIncludedOver,
                data.autoSuspendAfterChase,
                data.autoNotCreateAfterChase,
                data.isPython,
                data.devTemplateName,
                data.isNameInBall,
            ],
            type: fastify.db.QueryTypes.SELECT,
        }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate/updateMarketTemplateQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteMarketTemplateQuery = async (
  marketTemplateId,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `update "tblMarketTemplates" set
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
      where "wrID" = ANY ($3)`,
      {
        bind: [true, request.userTokenInfo.WrUserId, marketTemplateId],
        type: fastify.db.QueryTypes.UPDATE,
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
const updateStatusMarketTemplateQuery = async (request, fastify) => {
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
};
const getAllMarketTypeQuery = async (fastify) => {
  const result = await fastify.db.query(
    `
        SELECT
            "wrId" as "marketTypeId",
            "wrEnumId" as "enumId",
            "wrMarketTypeName" as "marketTypeName",
            "wrDisplayOrder" as "displayOrder",
            "wrIsActive" as "isActive",
            "wrDisplayName" as "displayName"	
        FROM "tblMarketTypes"
        ORDER BY "wrDisplayOrder" ASC
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );

  return result;
};

const getAllMarketTypeCategoriesQuery = async (fastify) => {
  const result = await fastify.db.query(
    `
        SELECT
            "wrId" as "marketTypeCategoryId",
            "wrMarketTypeId" as "marketTypeId",
            "wrCategoryName" as "categoryName",
            "wrDisplayOrder" as "displayOrder",
            "wrIsActive" as "isActive",
            "wrIsDefault" as "isDefault",
            "wrDisplayName" as "displayName"
        FROM "tblMarketTypeCategories"
        ORDER BY "wrDisplayOrder" ASC
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );

  return result;
};
const changePredefineRunnerQuery = async (request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblMarketTemplates" SET "wrIsPredefineRunnerValue" = $1 WHERE "wrID" = $2`,
      {
        bind: [
          request.body.isPredefineRunnerValue,
          request.body.marketTemplateId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate/changePredefineRunnerQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateIsPerEventStatusQuery = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblMarketTemplates" SET "wrIsPerEvent" = $1 WHERE "wrID" = $2`,
      {
        bind: [request.body.isPerEvent, request.body.marketTemplateId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate/updateIsPerEventStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};

const isShowInAdvanceMarketChangeStatusQuery = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblMarketTemplates" set
                "wrIsShowInAdvanceMarket" = $1
                where "wrID" = $2
            `,
      {
        bind: [request.body.isShowInAdvanceMarket, request.body.marketTemplateId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate.js/isShowInAdvanceMarketChangeStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};

const defaultIsSendDataChangeQuery = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblMarketTemplates" set
                "wrDefaultIsSendData" = $1
                where "wrID" = $2
            `,
      {
        bind: [request.body.defaultIsSendData, request.body.marketTemplateId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate.js/defaultIsSendDataChangeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommMatchTypeTemplatesQuery = async (commentaryId, whereCondition = null, request, fastify) => {
  try {
    return await fastify.db.query(
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
            tmt."wrHowManyOpenMarkets" as "howManyOpenMarkets",
            tmt."wrRateDiff" AS "rateDiff",
            tmt."wrDevTemplateName" as "devTemplateName",
            tmt."wrAutoSuspendAfterChase" as "autoSuspendAfterChase",
            tmt."wrIsNameInBall" as "isNameInBall",
            tmt."wrAutoNotCreateAfterChase" as "autoNotCreateAfterChase"
          FROM "tblCommMatchTypeTemplate" AS cmtt
          LEFT JOIN "tblMarketTemplates" AS tmt ON tmt."wrID" = cmtt."wrMarketTemplateId"
          LEFT JOIN "tblMatchTypes" AS tm ON tmt."wrMatchTypeID" = tm."wrMatchTypeId"
          WHERE cmtt."wrCommentaryId" = $1
            AND tmt."wrIsActive" = TRUE
            AND tmt."wrIsShowInAdvanceMarket" = TRUE
            ${whereCondition ? whereCondition : ""};`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId]
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMarketTemplate.js/getCommMatchTypeTemplatesQuery",
      request
    );
    throw new Error(error.message);
  }
}
const updateIsPythonChangeQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblMarketTemplates" SET "wrIsPython" = $1 WHERE "wrID" = $2`,
      {
        bind: [data.isPython, data.marketTemplateId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketTemplate/updateIsPythonChangeQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  getAllMarketTemplateQuery,
  insertMarketTemplateQuery,
  deleteMarketTemplateQuery,
  updateMarketTemplateQuery,
  updateStatusMarketTemplateQuery,
  getAllMarketTypeQuery,
  getAllMarketTypeCategoriesQuery,
  changePredefineRunnerQuery,
  updateIsPerEventStatusQuery,
  insertMarketTemplateInCloneQuery,
  isShowInAdvanceMarketChangeStatusQuery,
  defaultIsSendDataChangeQuery,
  getCommMatchTypeTemplatesQuery,
  updateIsPythonChangeQuery,
};

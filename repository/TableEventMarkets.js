const {
  MarketUpdateType,
  EventMarketStatus,
  ActionTypeForMarketCancel,
} = require("../utilities");
const { errorLogger, marketDataLogger } = require("../utilities/logger");
const { getPagination } = require("../utilities");

const getAllEventMarketsV2Query = async (fastify, whereCondition = null) => { 
  return await fastify.db.query(
    `SELECT
        tem."wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tem."wrTeamID" AS "teamId",
        tem."wrInningsID" AS "inningsId",
        tem."wrMarketName" AS "marketName",
        tem."wrMargin" AS "margin",
        tem."wrStatus" AS "status",
        tem."wrIsPredefineMarket" As "isPredefineMarket",
        tem."wrIsOver" As "isOver",
        tem."wrOver" As "over",
        tem."wrIsPlayer" As "isPlayer",
        tem."wrPlayerID" As "playerId",
        tem."wrIsAutoCancel" As "isAutoCancel",
        tem."wrAutoOpenType" As "autoOpenType",
        tem."wrAutoOpen" As "autoOpen",
        tem."wrAutoCloseType" As "autoCloseType",
        tem."wrBeforeAutoClose" As "beforeAutoClose",
        tem."wrAutoSuspendType" As "autoSuspendType",
        tem."wrBeforeAutoSuspend" As "beforeAutoSuspend",
        tem."wrIsBallStart" As "isBallStart",
        tem."wrIsAutoResultSet" As "isAutoResultSet",
        tem."wrAutoResultType" As "autoResultType",
        tem."wrAutoResultafterBall" As "autoResultafterBall",
        tem."wrAfterWicketAutoSuspend" As "afterWicketAutoSuspend",
        tem."wrAfterWicketNotCreated" As "afterWicketNotCreated",
        tem."wrIsActive" as "isActive",	
        tem."wrIsAllow" as "isAllow",
        tem."wrCloseTime" as "closeTime",
        tem."wrOpenTime" as "openTime",
        tem."wrSettledTime" as "settledTime",
        tem."wrOpenTime" as "openTime",
        tem."wrResult" as "result",
        tem."wrIsResult" as "isResult",
        tem."wrData" as "data",
        tem."wrLastUpdate" as "lastUpdate",
        tem."wrIsSendData" as "isSendData",
        tem."wrActionType" as "actionType",
        tem."wrMarketTemplateId" as "marketTemplateId",
        tem."wrMarketTypeId" as "marketTypeId",
        tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
        tem."wrCreateRefId" as "createRefId",
        tem."wrOpenRefId" as "openRefId",
        tem."wrCreateType" as "createType",
        tem."wrCreate" as "create",
        tem."wrTemplateType" as "templateType",
        tem."wrDelay" as "delay",
        tem."wrLineRatio" as "lineRatio",
        tem."wrOpenOdds" as "openOdds",
        tem."wrMinOdds" as "minOdds",
        tem."wrMaxOdds" as "maxOdds",
        tem."wrRateSource" as "rateSource",
        tem."wrRateSourceRefID" as "rateSourceRefID",
        tem."wrPredefinedValue" as "predefinedValue",
        tem."wrLineType" as "lineType",
        tem."wrDefaultBackSize" as "defaultBackSize",
        tem."wrDefaultLaySize" as "defaultLaySize",
        tem."wrAfterSuspendTime" as "afterSuspendTime",
        tem."wrAfterCloseTime" as "afterCloseTime",
        tem."wrDefaultIsSendData" as "wrDefaultIsSendData",
        tem."wrRateDiff" as "rateDiff",
        tem."wrWicketNo" as "wicketNo",
        tu."WrUserName" as "createdBy",
        tem."wrIsInningRun" as "isInningRun",
        tem."wrFavRatio" as "favRatio"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblUsers" tu ON tem."wrCreatedBy" = tu."WrUserId"
    WHERE tc."wrIsDelete" = false
      AND (
          tc."wrCommentaryStatus" != 4 
          OR (tc."wrCommentaryStatus" = 4 AND tc."wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days')
      )
      AND tem."wrIsDeleted" = false 
      AND (
          tem."wrStatus" IN (1, 2, 3, 4)
          OR (tem."wrStatus" = 5 AND tem."wrIsResult" = FALSE)
      ) ${whereCondition ? ` AND ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllEventMarketsQuery = async (fastify, whereCondition = null) => {
  if(whereCondition === null){
    whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tcom."wrIsDeleted" = false`
  }
  return await fastify.db.query(
    `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        tt."wrTeamName" AS "teamName",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        tem."wrIsActive" as "isActive",	
        "wrIsAllow" as "isAllow",
        tem."wrLastUpdate" as "lastUpdate",
        tem."wrDelay" as "delay",
        tem."wrLineRatio" as "lineRatio",
        tem."wrRateSource" as "rateSource",
        tem."wrRateSourceRefID" as "rateSourceRefID",
        tem."wrResult" as "result",
        tem."wrIsResult" as "isResult",
        tem."wrLineType" as "lineType",
        tem."wrDefaultBackSize" as "defaultBackSize",
        tem."wrDefaultLaySize" as "defaultLaySize",
        tem."wrAfterSuspendTime" as "afterSuspendTime",
        tmt."wrMarketTypeName" as "marketTypeName", 
        tem."wrMarketTypeId" as "marketTypeId",
        tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
        tmtc."wrCategoryName" as "categoryName",
        tem."wrIsDeleted" as "isDeleted",
        tmr."wrSelectionId" as "selectionId",
        tmr."wrRunner" as "runner",
        tem."wrCreatedBy" as "createdBy",
        tem."wrAfterCloseTime" as "afterCloseTime"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
    LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
    LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    LEFT JOIN "tblMarketTypes" tmt ON tmt."wrId" = tem."wrMarketTypeId"
    LEFT JOIN "tblMarketTypeCategories" tmtc ON tmtc."wrId" = tem."wrMarketTypeCategoryId"
    ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const getAllEventMarketsQueryV1 = async (fastify, whereCondition = null) => {
  return await fastify.db.query(
    `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        tt."wrTeamName" AS "teamName",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerID" as "playerId",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrAutoOpenType" as "autoOpenType", 
        "wrAutoOpen" as "autoOpen",
        "wrAutoCloseType" as "autoCloseType",
        "wrBeforeAutoClose" as "beforeAutoClose",
        "wrAutoSuspendType" as "autoSuspendType",
        "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
        "wrIsBallStart" as "isBallStart",
        "wrIsAutoResultSet" as "isAutoResultSet",
        "wrAutoResultType" as "autoResultType",
        "wrAutoResultafterBall" as "autoResultafterBall",	
        "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
        "wrAfterWicketNotCreated" as "afterWicketNotCreated",
        tem."wrIsActive" as "isActive",	
        "wrIsAllow" as "isAllow",
        "wrCloseTime" as "closeTime",
        "wrOpenTime" as "openTime",
        "wrSettledTime" as "settledTime",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        "wrData" as "data",
        tem."wrLastUpdate" as "lastUpdate",
        tem."wrIsSendData" as "isSendData",
        tem."wrActionType" as "actionType",
        tem."wrMarketTemplateId" as "marketTemplateId",
        tem."wrMarketTypeId" as "marketTypeId",
        tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
        tem."wrCreateRefId" as "createRefId",
        tem."wrOpenRefId" as "openRefId",
        tem."wrCreateType" as "createType",
        tem."wrCreate" as "create",
        tem."wrTemplateType" as "templateType",
        tem."wrDelay" as "delay",
        tem."wrLineRatio" as "lineRatio",
        tem."wrRateSource" as "rateSource",
        tem."wrRateSourceRefID" as "rateSourceRefID",
        tem."wrLineType" as "lineType",
        tem."wrDefaultBackSize" as "defaultBackSize",
        tem."wrDefaultLaySize" as "defaultLaySize",
        tem."wrAfterSuspendTime" as "afterSuspendTime",
        tem."wrAfterCloseTime" as "afterCloseTime",
        tem."wrRateDiff" as "rateDiff",
        tem."wrPredefinedValue" as "predefinedValue",
        tem."wrCreatedBy" as "createdBy",
        tem."wrIsInningRun" as "isInningRun",
        tem."wrWicketNo" as "wicketNo",
        COALESCE(runner_data."runners", '[]') as "runners"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
    LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
    LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
    LEFT JOIN LATERAL (
						SELECT jsonb_agg(
							jsonb_build_object(
								'runnerId', tmr."wrRunnerId",
								'runner', tmr."wrRunner",
								'line', tmr."wrLine",
								'overRate', tmr."wrOverRate",
								'underRate', tmr."wrUnderRate",
								'selectionId', tmr."wrSelectionId",
								'selectionStatus', tmr."wrSelectionStatus",
								'order', tmr."wrOrder",
								'backPrice', tmr."wrBackPrice",
								'layPrice', tmr."wrLayPrice",
								'backSize', tmr."wrBackSize",
								'laySize', tmr."wrLaySize",
								'teamId', tmr."wrTeamId"
							)
              ORDER BY tmr."wrRunnerId" ASC
						) AS "runners"
						FROM "tblMarketRunners" tmr
						WHERE tmr."wrEventMarketId" = tem."wrID" AND tmr."wrIsDeleted" = false
					) runner_data ON true
    ${whereCondition ? `WHERE ${whereCondition}` : ""}
    GROUP BY tem."wrID", tc."wrEventName", tc."wrEventDate", tcom."wrCompetition", tet."wrEventType", tt."wrTeamName", runner_data."runners"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const getEventMarketByIdsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT
            "wrID" AS "eventMarketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventRefId",
            tc."wrEventName" AS "eventName",
            tc."wrEventDate" AS "eventDate",
            tcom."wrCompetition" AS "competitionName",
            tet."wrEventType" AS "eventTypeName",
            "wrTeamID" AS "teamId",
            tt."wrTeamName" AS "teamName",
            "wrInningsID" AS "inningsId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrIsPredefineMarket" as "isPredefineMarket",
            "wrIsOver" as "isOver",
            "wrOver" as "over",
            "wrIsPlayer" as "isPlayer",
            "wrPlayerID" as "playerId",
            "wrIsAutoCancel" as "isAutoCancel",
            "wrAutoOpenType" as "autoOpenType", 
            "wrAutoOpen" as "autoOpen",
            "wrAutoCloseType" as "autoCloseType",
            "wrBeforeAutoClose" as "beforeAutoClose",
            "wrAutoSuspendType" as "autoSuspendType",
            "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
            "wrIsBallStart" as "isBallStart",
            "wrIsAutoResultSet" as "isAutoResultSet",
            "wrAutoResultType" as "autoResultType",
            "wrAutoResultafterBall" as "autoResultafterBall",	
            "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
            "wrAfterWicketNotCreated" as "afterWicketNotCreated",
            tem."wrIsActive" as "isActive",	
            "wrIsAllow" as "isAllow",
            "wrCloseTime" as "closeTime",
            "wrOpenTime" as "openTime",
            "wrSettledTime" as "settledTime",
            "wrResult" as "result",
            "wrIsResult" as "isResult",
            "wrData" as "data",
            tem."wrLastUpdate" as "lastUpdate",
            tem."wrIsSendData" as "isSendData",
            tem."wrActionType" as "actionType",
            tem."wrMarketTemplateId" as "marketTemplateId",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
            tem."wrCreateRefId" as "createRefId",
            tem."wrOpenRefId" as "openRefId",
            tem."wrCreateType" as "createType",
            tem."wrCreate" as "create",
            tem."wrTemplateType" as "templateType",
            tr."wrRunnerId" as "runnerId",
            tr."wrRunner" as "runner",
            tr."wrLine" as "line",
            tr."wrOverRate" as "overRate",
            tr."wrUnderRate" as "underRate",
            tr."wrBackPrice" as "backPrice",
            tr."wrLayPrice" as "layPrice",
            tr."wrBackSize" as "backSize",
            tr."wrLaySize" as "laySize",
            tr."wrLastUpdate" as "runnerLastUpdate",
            tr."wrSelectionId" as "selectionId",
            tr."wrSelectionStatus" as "selectionStatus",
            tr."wrOrder" as "order",
            tr."wrTeamId" as "teamId",
            tem."wrDelay" as "delay",
            tem."wrLineRatio" as "lineRatio",
            tem."wrRateSource" as "rateSource",
            tem."wrRateSourceRefID" as "rateSourceRefID",
            tem."wrAfterSuspendTime" as "afterSuspendTime",
            tem."wrCreatedBy" as "createdBy",
            tem."wrAfterCloseTime" as "afterCloseTime"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
        LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
        LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
        LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
        LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
        WHERE tem."wrID" = ANY($1) AND tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tr."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.eventMarketIds],
      }
    );
  } catch (error) {
    console.error(error);
  }

};
const createManyEventMarketQuery = async (data, request, fastify) => {
  try {
    const values = data
      .map((item) => {
        return `(
                ${item.commentaryId},
                '${item.eventRefId}',
                ${item.teamId},
                ${item.inningsId},
                '${item.marketName}',
                ${item.margin},
                ${item.status},
                ${item.isPredefineMarket},
                ${item.isPreMatchOnly},
                ${item.isPreMatchMarket},
                ${item.isOver},
                ${item.over},
                ${item.isPlayer},
                ${item.playerId},
                ${item.isAutoCancel},
                ${item.autoOpenType},
                ${item.autoOpen},
                ${item.autoCloseType},
                ${item.beforeAutoClose},
                ${item.autoSuspendType},
                ${item.beforeAutoSuspend},
                ${item.isBallStart},
                ${item.isAutoResultSet},
                ${item.autoResultType},
                ${item.autoResultafterBall},
                ${item.afterWicketAutoSuspend},
                ${item.afterWicketNotCreated},
                ${item.isActive},
                ${item.isAllow},
                now()::timestamp,
                '${item.data}',
                now()::timestamp,
                ${item.actionType},
                ${item.isSendData},
                ${item.marketTemplateId},
                ${item.delay}
            )`;
      })
      .join(",");

    const query = `INSERT INTO "tblEventMarkets"(
            "wrCommentaryId",
            "wrEventRefID",
            "wrTeamID",
            "wrInningsID",
            "wrMarketName",
            "wrMargin",
            "wrStatus",
            "wrIsPredefineMarket",
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
            "wrIsActive",
            "wrIsAllow",
            "wrOpenTime",
            "wrData",
            "wrLastUpdate",
            "wrActionType",
            "wrIsSendData",
            "wrMarketTemplateId",
            "wrDelay"
        ) VALUES ${values} 
        RETURNING "wrID" as "eventMarketId"`;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
    });
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventmarket.js/createManyEventMarketQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteEventMarketQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblEventMarkets" SET
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
      WHERE "wrID" = ANY($3)`,
      {
        bind: [true, request.userTokenInfo.WrUserId, data],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // delete market runners for this market
    const query2 = `UPDATE "tblMarketRunners" SET
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        WHERE "wrEventMarketId" = ANY($3)`;
    await fastify.db.query(query2, {
      bind: [true, request.userTokenInfo.WrUserId, data],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/deleteEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const changeIsActiveEventMarketQuery = async (data, request, fastify) => {
  try {
    const query = `UPDATE "tblEventMarkets" SET "wrIsActive" = $1 WHERE "wrID" = $2`;
    return await fastify.db.query(query, {
      bind: [data.isActive, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeIsActiveEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const changeIsAllowEventMarketQuery = async (data, request, fastify) => {
  try {
    const query = `UPDATE "tblEventMarkets" SET "wrIsAllow" = $1 WHERE "wrID" = $2`;
    return await fastify.db.query(query, {
      bind: [data.isAllow, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeIsAllowEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const changeIsResultEventMarketQuery = async (data, request, fastify) => {
  try {
    const query = `UPDATE "tblEventMarkets" SET "wrIsResult" = $1,
    "wrLastUpdate" = now()::timestamp
    WHERE "wrID" = $2 AND "wrIsDeleted" = false
    RETURNING 
      "wrID" AS "eventMarketId",
      "wrStatus" AS "status",
      "wrIsResult" AS "isResult",
      "wrLastUpdate" AS "lastUpdate"`;
    const result = await fastify.db.query(query, {
      bind: [data.isResult, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeIsResultEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketListByCIdQuery = async (data, request, fastify) => {
  try {
    const { commentaryId } = data;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            mtc."wrCategoryName" AS "categoryName",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrLineType" as "lineType", 
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
           (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName', "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
           
        FROM "tblEventMarkets" tem
        INNER JOIN "tblMarketTypeCategories" mtc ON tem."wrMarketTypeCategoryId" = mtc."wrId"
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrRateSource" = 1
        AND tem."wrIsDeleted" = false
        `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketListByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketByIdQuery = async (data, request, fastify) => {
  try {
    const { eventMarketId } = data;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            mtc."wrCategoryName" AS "categoryName",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrLineType" as "lineType", 
            tem."wrPredefinedValue" as "predefinedValue",
            tem."wrIsInningRun" as "isInningRun",
           (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName', "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
           
        FROM "tblEventMarkets" tem
        INNER JOIN "tblMarketTypeCategories" mtc ON tem."wrMarketTypeCategoryId" = mtc."wrId"
        WHERE tem."wrID" IN (Select unnest($1::int[]))
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrRateSource" = 1
        AND tem."wrIsDeleted" = false
        `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        eventMarketId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketListByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updateEventMarketRateQuery = async (data, request, fastify) => {
  try {
    await fastify.db.query(
      `
            UPDATE "tblEventMarkets"
            SET
                "wrMargin" = $1,
                "wrStatus" = $2,
                "wrIsActive" = $3,
                "wrIsAllow" = $4,
                "wrLastUpdate" = now()::timestamp,
                "wrIsSendData" = $5,
                "wrLineRatio" = $6
            WHERE "wrID" = $7 AND "wrIsDeleted" = false
            RETURNING "wrID" as "eventMarketId"`,
      {
        bind: [
          data.margin,
          data.status,
          data.isActive,
          data.isAllow,
          data.isSendData === undefined ? true : data.isSendData === null ? true : data.isSendData,
          data.lineRatio || 0,
          data.marketId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    // update market runners for this market
    for (let runner of data.runner) {
      // console.log(runner);
      // update market runners for this market
      await fastify.db.query(
        `UPDATE "tblMarketRunners" SET
                "wrLine" = $1,
                "wrOverRate" = $2,
                "wrUnderRate" = $3,
                "wrBackPrice" = $4,
                "wrLayPrice" = $5,
                "wrBackSize" = $6,
                "wrLaySize" = $7,
                "wrLastUpdate" = now()::timestamp,
                "wrSelectionStatus" = $8
                WHERE "wrRunnerId" = $9
                `,
        {
          bind: [
            runner.line || 0,
            runner.overRate || 0,
            runner.underRate || 0,
            runner.backPrice || 0,
            runner.layPrice || 0,
            runner.backSize || 0,
            runner.laySize || 0,
            runner.status,
            runner.runnerId,
          ],
          type: fastify.db.QueryTypes.SELECT,
        }
      );

      await fastify.db.query(
        `
            UPDATE "tblEventMarkets"
            SET "wrMinOdds" = CASE WHEN "wrMinOdds" < $1 THEN "wrMinOdds" ELSE $1 END,
                "wrMaxOdds" = CASE WHEN "wrMaxOdds" > $1 THEN "wrMaxOdds" ELSE $1 END
            WHERE "wrID" = $2
        `,
        {
          bind: [runner.line, data.marketId],
        }
      );
    }

    // get the runner market runner data
    const query3 = `
            SELECT 
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
            GROUP BY tem."wrID"

        `;

    const marketRunner = await fastify.db.query(query3, {
      bind: [data.marketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    // update eventmarket data with runner data
    const dataToStore = marketRunner[0];

    const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1, "wrLastUpdate" = now()::timestamp
     WHERE "wrID" = $2`;

    await fastify.db.query(query4, {
      bind: [dataToStore, data.marketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    const eventMarketData = await getEventMarketByIdsQuery(
      {
        eventMarketIds: [data.marketId],
      },
      request,
      fastify
    );
    return eventMarketData[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateEventMarketRateQuery",
      request
    );
    throw new Error(error.message);
  }
};

const changeMarketCancelQuery = async (data, request, fastify) => {
  try {
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = $2`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Cancel, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
    const query = `UPDATE "tblEventMarkets"
          SET "wrStatus" =$1,
          "wrIsResult" = true,
          "wrResult" = null,
          "wrSettledTime" = now()::timestamp,
          "wrData" = jsonb_set(
            jsonb_set("wrData"::jsonb, '{status}', '6'::jsonb, false),
            '{runner}', (
              SELECT jsonb_agg(
                jsonb_set(runner_elem, '{status}', '6'::jsonb, false)
              )
              FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
            ),
            false
          )::json,
          "wrLastUpdate" = now()::timestamp,
          "wrIsInningRun" =false
          WHERE "wrCommentaryId" = $2
          AND "wrID" = $3
          AND "wrStatus"  = $4
          RETURNING 
            "wrID" AS "eventMarketId"
            `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Cancel,
        data.commentaryId,
        data.eventMarketId,
        EventMarketStatus.Close,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    // const query3 = `SELECT 
    //       tem."wrID" as "marketId",
    //       tem."wrEventRefID" as "eventId",
    //       tem."wrMarketName" as "marketName",
    //       tem."wrStatus" as "status",
    //       tem."wrIsActive" as "isActive",
    //       tem."wrIsAllow" as "isAllow",
    //       json_agg(
    //           json_build_object(
    //               'runnerId' , tmr."wrRunnerId",
    //               'runner', tmr."wrRunner",
    //               'status' , tmr."wrSelectionStatus",
    //               'line', tmr."wrLine",
    //               'overRate', tmr."wrOverRate",
    //               'underRate', tmr."wrUnderRate",
    //               'backPrice', tmr."wrBackPrice",
    //               'layPrice', tmr."wrLayPrice",
    //               'backSize', tmr."wrBackSize",
    //               'laySize', tmr."wrLaySize"
    //           )
    //       ) as "runner"
    //   FROM "tblEventMarkets" tem
    //   LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    //   WHERE tem."wrID" = $1 AND tmr."wrIsDeleted" = false
    //   GROUP BY tem."wrID"`;

    // const marketRunner = await fastify.db.query(query3, {
    //   bind: [data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // // update eventmarket data with runner data
    // const dataToStore = marketRunner[0];

    // const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`;

    // await fastify.db.query(query4, {
    //   bind: [dataToStore, data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // return true;
    return result;

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeMarketCancelQuery",
      request
    );
    throw new Error(error.message);
  }
};
const changeMarketResultQuery = async (data, request, fastify) => {
  try {
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = $2`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Settled, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    const query = `UPDATE "tblEventMarkets"
        SET 
        "wrStatus" = $1,
        "wrResult" = $2,
        "wrIsResult" = $3,
        "wrSettledTime" = now()::timestamp,
        "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '5'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '5'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
        )::json,
        "wrLastUpdate" = now()::timestamp
        WHERE
          "wrID" = $4
        AND
          "wrCommentaryId" = $5
        AND
          "wrStatus" = $6
        AND 
          "wrIsResult" = $7
        AND 
          "wrResult" IS NULL
        RETURNING 
            "wrID" AS "eventMarketId",
            "wrStatus" AS "status",
            "wrIsResult" AS "isResult",
            "wrResult" AS "result",
            "wrSettledTime" AS "settledTime",
            "wrData" AS "data",
            "wrLastUpdate" AS "lastUpdate"
       `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Settled,
        data.result,
        true,
        data.eventMarketId,
        data.commentaryId,
        EventMarketStatus.Close,
        false,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

   
    // const query3 = `SELECT 
    //       tem."wrID" as "marketId",
    //       tem."wrEventRefID" as "eventId",
    //       tem."wrMarketName" as "marketName",
    //       tem."wrStatus" as "status",
    //       tem."wrIsActive" as "isActive",
    //       tem."wrIsAllow" as "isAllow",
    //       json_agg(
    //           json_build_object(
    //               'runnerId' , tmr."wrRunnerId",
    //               'runner', tmr."wrRunner",
    //               'status' , tmr."wrSelectionStatus",
    //               'line', tmr."wrLine",
    //               'overRate', tmr."wrOverRate",
    //               'underRate', tmr."wrUnderRate",
    //               'backPrice', tmr."wrBackPrice",
    //               'layPrice', tmr."wrLayPrice",
    //               'backSize', tmr."wrBackSize",
    //               'laySize', tmr."wrLaySize"
    //           )
    //       ) as "runner"
    //   FROM "tblEventMarkets" tem
    //   LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    //   WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
    //   GROUP BY tem."wrID"`;

    // const marketRunner = await fastify.db.query(query3, {
    //   bind: [data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // // update eventmarket data with runner data
    // const dataToStore = marketRunner[0];

    // const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`;

    // await fastify.db.query(query4, {
    //   bind: [dataToStore, data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // return true;
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeMarketResultService",
      request
    );
    throw new Error(error.message);
  }
};
const changeMarketCloseQuery = async (data, request, fastify) => {
  try {
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = $2`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Close, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    const query = `UPDATE "tblEventMarkets"
          SET "wrStatus" =$1,
          "wrCloseTime" = now()::timestamp,
          "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
           )::json,
          "wrLastUpdate" = now()::timestamp,
          "wrIsSendData" = true
          WHERE "wrCommentaryId" = $2
          AND "wrID" = $3 AND "wrIsDeleted" = false
          AND "wrStatus" NOT IN ($4, $5, $6)
          RETURNING 
            "wrID" AS "eventMarketId",
            "wrStatus" AS "status",
            "wrCloseTime" AS "closeTime",
            "wrData" AS "data",
            "wrLastUpdate" AS "lastUpdate",
            "wrIsSendData" AS "isSendData"
          `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Close,
        data.commentaryId,
        data.eventMarketId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
   
    // const query3 = `SELECT 
    //       tem."wrID" as "marketId",
    //       tem."wrEventRefID" as "eventId",
    //       tem."wrMarketName" as "marketName",
    //       tem."wrStatus" as "status",
    //       tem."wrIsActive" as "isActive",
    //       tem."wrIsAllow" as "isAllow",
    //       json_agg(
    //           json_build_object(
    //               'runnerId' , tmr."wrRunnerId",
    //               'runner', tmr."wrRunner",
    //               'status' , tmr."wrSelectionStatus",
    //               'line', tmr."wrLine",
    //               'overRate', tmr."wrOverRate",
    //               'underRate', tmr."wrUnderRate",
    //               'backPrice', tmr."wrBackPrice",
    //               'layPrice', tmr."wrLayPrice",
    //               'backSize', tmr."wrBackSize",
    //               'laySize', tmr."wrLaySize"
    //           )
    //       ) as "runner"
    //   FROM "tblEventMarkets" tem
    //   LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    //   WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
    //   GROUP BY tem."wrID"`;

    // const marketRunner = await fastify.db.query(query3, {
    //   bind: [data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // // update eventmarket data with runner data
    // const dataToStore = marketRunner[0];

    // const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`;

    // await fastify.db.query(query4, {
    //   bind: [dataToStore, data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // return true;
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/changeMarketCloseQuery",
      request
    );
    throw new Error(error.message);
  }
};
const suspendEventMarketQuery = async (data, request, fastify) => {
  try {
    const query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1
            WHERE "wrCommentaryId" = ANY($2)
            AND "wrStatus" NOT IN ($3, $4, $5)
            RETURNING "wrID" as "eventMarketId"
        `;

    const updatedData = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Suspend,
        data.commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    // return updatedData;

    // suspend the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [
        EventMarketStatus.Suspend,
        updatedData.map((e) => e.eventMarketId),
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    return updatedData;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/suspendEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const closeEventMarketByTeamIdQuery = async (data, request, fastify) => {
  try {
    const query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1 ,
             "wrCloseTime" = now()::timestamp, 
             "wrLastUpdate" = now()::timestamp , "wrIsSendData" = true
            WHERE "wrTeamID" = $2
            AND "wrCommentaryId" = $3
            AND "wrInningsID" = $4
            AND "wrActionType" IN ($5,$6)
            AND "wrStatus" NOT IN ($7,$8,$9)
            RETURNING "wrID" as "eventMarketId"
        `;

    let result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Close,
        data.teamId,
        data.commentaryId,
        data.inningsId,
        ActionTypeForMarketCancel.winClose,
        ActionTypeForMarketCancel.winCloseCancel,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    // close the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Close, result.map((e) => e.eventMarketId)],
      type: fastify.db.QueryTypes.SELECT,
    });

    for (market of result) {
      const query3 = `
          SELECT 
              tem."wrID" as "marketId",
              tem."wrEventRefID" as "eventId",
              tem."wrMarketName" as "marketName",
              tem."wrStatus" as "status",
              tem."wrIsActive" as "isActive",
              tem."wrIsAllow" as "isAllow",
              json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'status', tmr."wrSelectionStatus",	
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
          WHERE tem."wrID" = $1 AND tmr."wrIsDeleted" = false
          GROUP BY tem."wrID"

        `;

      const marketRunner = await fastify.db.query(query3, {
        bind: [market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      // update eventmarket data with runner data
      const dataToStore = marketRunner[0];

      const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1, 
      "wrLastUpdate" = now()::timestamp
      WHERE "wrID" = $2
      RETURNING "wrData" as "data"`;

      let udpatedData = await fastify.db.query(query4, {
        bind: [dataToStore, market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      market.data = udpatedData[0].data;

      marketDataLogger(
        {
          eventMarketId: market.eventMarketId,
          commentaryId: data.commentaryId,
          dataTosave: dataToStore,
          updateType: MarketUpdateType.marketInitilization,
          isSendData: true
        },
        request,
        fastify
      ).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> repository/TableEventmarket.js/closeEventMarketByTeamIdQuery",
          request
        );
      });
    }

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/closeEventMarketByTeamIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const setDelayEventMarketQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblEventMarkets"
            SET "wrDelay" = $1
            WHERE 
            "wrID" = ANY($2) AND "wrIsDeleted" = false
            AND
            "wrStatus" NOT IN ($3,$4,$5)
            RETURNING "wrID" as "eventMarketId"`,
      {
        bind: [
          data.delay,
          data.eventMarketId,
          EventMarketStatus.Settled,
          EventMarketStatus.Cancel,
          EventMarketStatus.Close,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/setDelayEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketLogsByCIdQuery = async (data, request, fastify) => {
  try {
    //get market logs by commentary id
    const query = `SELECT
            CAST(COUNT(*) as integer) FROM "tblMarketLogs"
            WHERE "wrCommentaryId" = $1
            AND "wrActionType" = $2
        `;

    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [data.commentaryId, data.actionType],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketLogsByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const cancelEventMarketByTeamIdQuery = async (data, request, fastify) => {
  try {
    let query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1,
            "wrSettledTime" = now()::timestamp,
            "wrLastUpdate" = now()::timestamp,
            "wrIsSendData" = true
            WHERE "wrTeamID" = $2
            AND "wrCommentaryId" = $3
            AND "wrInningsID" = $4
            AND "wrActionType" = $5
            RETURNING "wrID" as "eventMarketId"
        `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Cancel,
        data.teamId,
        data.commentaryId,
        data.inningsId,
        data.actionType,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    // cancel the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Cancel, result.map((e) => e.eventMarketId)],
      type: fastify.db.QueryTypes.SELECT,
    });

    for (market of result) {
      const query3 = `
      SELECT 
          tem."wrID" as "marketId",
          tem."wrEventRefID" as "eventId",
          tem."wrMarketName" as "marketName",
          tem."wrStatus" as "status",
          tem."wrIsActive" as "isActive",
          tem."wrIsAllow" as "isAllow",
          json_agg(
              json_build_object(
                  'runnerId', tmr."wrRunnerId",
                  'runner', tmr."wrRunner",
                  'status', tmr."wrSelectionStatus",
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
      GROUP BY tem."wrID"

    `;

      const marketRunner = await fastify.db.query(query3, {
        bind: [market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      // update eventmarket data with runner data
      const dataToStore = marketRunner[0];

      const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,
      "wrLastUpdate" = now()::timestamp
       WHERE "wrID" = $2
        RETURNING "wrData" as "data"`;

      let udpatedData = await fastify.db.query(query4, {
        bind: [dataToStore, market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      market.data = udpatedData[0].data;

      marketDataLogger({
        eventMarketId: market.eventMarketId,
        commentaryId: data.commentaryId,
        dataTosave: typeof(dataToStore) === 'string' ? JSON.parse(dataToStore) : dataToStore,
        updateType: MarketUpdateType.marketInitilization,
        isSendData: true
      },request,fastify).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> repository/TableEventmarket.js/closeEventMarketByTeamIdQuery",
          request
        );
      });
    }

    return result;
  } catch (error) {
    console.log("error from market",error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelEventMarketByTeamIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const upsertEventMarketSPQuery = async (data, request, fastify) => {
  try {
    const query = `
            CALL proc_save_eventmarket2($1,$2)
        `;
    const result = await fastify.db.query(query, {
      bind: [data ? JSON.stringify(data) : null, null],
      type: fastify.db.QueryTypes.SELECT,
    });

    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upsertEventMarketSPQuery",
      request
    );
    throw new Error(error.message);
  }
};
// const getDataLogsByMarketQuery = async (request, fastify) => {
//   try {
//     const { startDate, endDate, page, limit, eventMarketId } = request.body;
//     const { skip, take } = getPagination(page, limit);
    
//     let whereConditions = [];
    
//     if (startDate && endDate) {
//         whereConditions.push(`"wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'`);
//     }
    
//     if (eventMarketId) {
//         whereConditions.push(`"wrEventMarketId" = '${eventMarketId}'`);
//     }
    
//     const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
//     const query = `
//         SELECT
//             tmd."wrId" as "marketDataLogId",
//             tmd."wrCommentaryId" as "commentaryId",
//             tmd."wrEventMarketId" as "eventMarketId",
//             tem."wrMarketName" as "marketName",
//             tmd."wrData" as "data",
//             tmd."wrUpdateType" as "updateType",
//             tmd."wrCreatedDate" as "createdDate",
//             tmd."wrCreatedBy" as "createdBy",
//             tu."WrUserName" as "userName",
//             tmd."wrLineDiff" as "lineDiff",
//             tmd."wrIsSendData" as "isSendData"
//         FROM "tblMarketDataLogs" tmd
//         INNER JOIN "tblEventMarkets" tem ON tmd."wrEventMarketId" = tem."wrID" AND tem."wrIsDeleted" = false
//         LEFT JOIN "tblUsers" tu ON tmd."wrCreatedBy" = tu."WrUserId"
//         ${whereClause}
//         ORDER BY tmd."wrId" DESC
//         LIMIT $1 OFFSET $2;
//     `;
    
//     const data = await fastify.db.query(query, {
//         bind: [take, skip],
//         type: fastify.db.QueryTypes.SELECT
//     });
    
//     const totalRecordsQuery = `
//         SELECT COUNT(*) as "count"
//         FROM "tblMarketDataLogs" tmd
//         INNER JOIN "tblEventMarkets" tem ON tmd."wrEventMarketId" = tem."wrID" AND tem."wrIsDeleted" = false
//         ${whereClause}
//     `;
    
//     const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
//         type: fastify.db.QueryTypes.SELECT
//     });
    
//     const totalRecords = parseInt(totalRecordsResult[0].count, 10);
//     const totalPages = Math.ceil(totalRecords / take);
    
//     return {
//         totalRecords: totalRecords,
//         currentPage: page,
//         totalPages: totalPages,
//         data: data,
//     };
// } catch (error) {
//     errorLogger(
//         fastify,
//         error.message,
//         "DB ERROR --> repository/TableEventmarket.js/getDataLogsByMarketQuery",
//         request
//     );
//     throw new Error(error.message);
// }
// };
const getDataLogsByMarketQuery = async (request, fastify) => {
  try {
    const { startDate, endDate, page = 1, limit = 10, eventMarketId, createdType, isSendData } = request.body;
    const { skip, take } = getPagination(page, limit);
    
    let whereConditions = [];
    const replacements = { take, skip };

    if (startDate && endDate) {
        whereConditions.push(`"wrCreatedDate" BETWEEN :startDate AND :endDate`);
        replacements.startDate = startDate;
        replacements.endDate = endDate;
    }

    if (eventMarketId) {
        whereConditions.push(`"wrEventMarketId" = :eventMarketId`);
        replacements.eventMarketId = eventMarketId;
    }

    if (createdType == 1) {
        whereConditions.push(`tmd."wrCreatedBy" != 0`);
    }

    if (createdType == 2) {
        whereConditions.push(`tmd."wrCreatedBy" = 0`);
    }

    if (isSendData !== undefined && isSendData !== null) {
        whereConditions.push(`tmd."wrIsSendData" = :isSendData`);
        replacements.isSendData = isSendData;
    }
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        WITH MarketData AS (
            SELECT
                tmd."wrId" AS "marketDataLogId",
                tmd."wrCommentaryId" AS "commentaryId",
                tmd."wrEventMarketId" AS "eventMarketId",
                tem."wrMarketName" AS "marketName",
                tmd."wrData" AS "data",
                tmd."wrUpdateType" AS "updateType",
                tmd."wrCreatedDate" AS "createdDate",
                tmd."wrCreatedBy" AS "createdBy",
                tu."WrUserName" AS "userName",
                tmd."wrLineDiff" AS "lineDiff",
                tmd."wrIsSendData" AS "isSendData"
            FROM "tblMarketDataLogs" tmd
            INNER JOIN "tblEventMarkets" tem ON tmd."wrEventMarketId" = tem."wrID" AND tem."wrIsDeleted" = false
            LEFT JOIN "tblUsers" tu ON tmd."wrCreatedBy" = tu."WrUserId"
            ${whereClause}
            ORDER BY tmd."wrId" DESC
            LIMIT :take OFFSET :skip
        )
        SELECT * FROM MarketData;
    `;

    const data = await fastify.db.query(query, {
        replacements,
        type: fastify.db.QueryTypes.SELECT,
    });

    const totalRecordsQuery = `
        SELECT COUNT(*) AS "count"
        FROM "tblMarketDataLogs" tmd
        INNER JOIN "tblEventMarkets" tem ON tmd."wrEventMarketId" = tem."wrID" AND tem."wrIsDeleted" = false
        ${whereClause}
    `;
    
    const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
        replacements,
        type: fastify.db.QueryTypes.SELECT,
    });
    
    const totalRecords = parseInt(totalRecordsResult[0].count, 10);
    const totalPages = Math.ceil(totalRecords / take);

    return {
        totalRecords,
        currentPage: page,
        totalPages,
        data,
    };
} catch (error) {
    errorLogger(
        fastify,
        error.message,
        "DB ERROR --> repository/TableEventmarket.js/getDataLogsByMarketQuery",
        request
    );
    throw new Error(error.message);
}
};
const getStatusLogsByMarketQuery = async (request, fastify) => {
  try {
    const data = fastify.db.query(
      `
                SELECT
                    "wrId" as "logId",
                    tmd."wrCommentaryId" as "commentaryId",
                    tmd."wrEventMarketId" as "eventMarketId",
                    tem."wrMarketName" as "marketName",
                    tmd."wrActionType" as "actionType",
                    "wrValue" as "value",
                    "wrUserId" as "userId",
                    tu."WrUserName" as "userName",
                    tmd."wrCreatedDate" as "createdDate",
                    tmd."wrResult" as "result"
                FROM "tblMarketLogs" tmd
                LEFT JOIN "tblUsers" tu ON tmd."wrUserId" = tu."WrUserId"
                LEFT JOIN "tblEventMarkets"  tem ON tmd."wrEventMarketId" = tem."wrID"
                WHERE "wrEventMarketId" = $1 AND tem."wrIsDeleted" = false
                ORDER BY "wrId" desc
            `,
      {
        bind: [request.body.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return data;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upsertEventMarketSPQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getEventMarketRatioQuery = async (data, request, fastify) => {
  try {
    let query = `
            SELECT 
                ev."wrOver" as "over",
                mr."wrLineRatio" as "line_ratio"
            FROM "tblEventMarkets" ev
            JOIN "tblMarketRunners" mr ON mr."wrEventMarketId" = ev."wrID"
            WHERE ev."wrCommentaryId" = $1 AND mr."wrIsDeleted" = false
            AND ev."wrTeamID" = $2 AND ev."wrIsDeleted" = false

        `;
    return await fastify.db.query(query, {
      bind: [data.commentaryId, data.teamId],
      type: fastify.db.QueryTypes.SELECT,
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upsertEventMarketSPQuery",
      request
    );
    throw new Error(error.message);
  }
};
const setLineRatioEventMarketQuery = async (data, request, fastify) => {
  try {
    const query = `
            CALL update_lineratio_eventMarket($1,$2,$3)
        `;
    const result = await fastify.db.query(query, {
      bind: [data.matchTypeId, data.commentaryId, data.status],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/setLineRatioEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};

const getMarketDataByCIdQuery = async (request, fastify) => {
  try {
    let query = `
        SELECT 
          "wrTeamName" as "teamName",
          "wrData" as "data"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
        WHERE "wrCommentaryId" = $1
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND "wrData" IS NOT NULL AND tem."wrIsDeleted" = false
      `;

    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        request.body.commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketDataByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketsByCIdQuery = async (request, whereCondition, fastify) => {
  try {
    const query = `
      WITH result_market_data AS (
        SELECT 
            "wrID" as "marketId",
            "wrCommentaryId" as "commentaryId",
            "wrEventRefID" as "eventId",
            "wrTeamID" as "teamId",
            tt."wrTeamName" as "teamName",
            tt."wrTeamShortName" as "teamShortName",
            tt."wrImage" as "teamImage",
            "wrInningsID" as "inningsId",
            "wrMarketName" as "marketName",
            "wrMinOdds" as "minOdds",
            "wrMaxOdds" as "maxOdds",
            "wrStatus" as "status",
            "wrOpenOdds" as "openOdds",
            "wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrResult" as "result"
        FROM "tblEventMarkets"
        LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = "tblEventMarkets"."wrTeamID"
        WHERE "wrEventRefID" = $1 ${whereCondition}
        AND "wrStatus" = $2
        AND "wrRateSource" <> 2
        AND "tblEventMarkets"."wrIsDeleted" = false
    ),
    open_market_data AS (
        SELECT
            "wrID" as "marketId",
            "wrCommentaryId" as "commentaryId",
            "wrEventRefID" as "eventId",
            "wrTeamID" as "teamId",
            tt."wrTeamName" as "teamName",
            tt."wrTeamShortName" as "teamShortName",
            tt."wrImage" as "teamImage",
            "wrInningsID" as "inningsId",
            "wrMarketName" as "marketName",
            "wrOpenOdds" as "openOdds",
            "wrStatus" as "status",
            tmr."wrBackPrice" as "backPrice",
            tmr."wrLayPrice" as "layPrice",
            tmr."wrBackSize" as "backSize",
            "wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            tmr."wrLaySize" as "laySize"
        FROM "tblEventMarkets"
        LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = "tblEventMarkets"."wrTeamID"
        LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = "tblEventMarkets"."wrID"
        WHERE "wrEventRefID" = $1 ${whereCondition}
        AND "wrStatus" NOT IN ($2, $3, $4)
        AND "wrRateSource" <> 2
        AND "tblEventMarkets"."wrIsDeleted" = false
    )
    SELECT
        jsonb_build_object(
            'settledMarkets', (SELECT jsonb_agg(result_market_data) FROM result_market_data),
            'openMarkets', (SELECT jsonb_agg(open_market_data) FROM open_market_data)
        ) as result;
    `;

    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        request.body.eventId,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        EventMarketStatus.Close,
      ],
    });

    return result[0].result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketDataByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};

const createEventMarketMaunalQuery = async (data, request, fastify) => {
  try {

    let marketTypeId = 0;

    const marketTypeQuery = `
          SELECT "wrId" 
        FROM "tblMarketTypes" 
        WHERE "wrEnumId" = $1;
      `;
    const marketTypeResult = await fastify.db.query(marketTypeQuery, {
      bind: [data.marketType],
      type: fastify.db.QueryTypes.SELECT,
    });

    if (marketTypeResult.length > 0) {
      marketTypeId = marketTypeResult[0].wrId;
    }

    const query = `
    INSERT INTO "tblEventMarkets"(
      "wrEventRefID",
      "wrMarketName",
      "wrStatus",
      "wrIsActive",
      "wrIsAllow",
      "wrLastUpdate",
      "wrRateSource",
      "wrRateSourceRefID",
      "wrCommentaryId",
      "wrTeamID",
      "wrInningsID",
      "wrMarketTypeId",
      "wrMarketTypeCategoryId",
      "wrCreatedBy"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13,$14)
        RETURNING "wrID" as "eventMarketId"
    `;
    const result = await fastify.db.query(query, {
      bind: [
        data.eventID,
        data.marketName,
        data.marketStatus,
        true,
        false,
        new Date(),
        data.rateSource,
        data.marketID,
        data.commentaryId,
        0,
        0,
        marketTypeId,
        data.categoryType,
        request?.userTokenInfo?.WrUserId || null
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventmarket.js/createEventMarketMaunalQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateEventMarketMaunalQuery = async (data, request, fastify) => {

  try {
    const query = `
        UPDATE "tblEventMarkets"
        SET "wrEventRefID" = $1, "wrMarketName" = $2, "wrStatus" = $3, "wrIsActive" = $4, "wrIsAllow" = $5, "wrLastUpdate" = $6,"wrRateSource" = $7,"wrCommentaryId" = $9
        WHERE "wrRateSourceRefID" = $8
        RETURNING "wrID" as "eventMarketId".
          "wrMarketName" as "marketName",
          "wrStatus" as "status",
          "wrIsActive" as "isActive",
          "wrLastUpdate" as "lastUpdate",
          "wrRateSource" as "rateSource",
          "wrCommentaryId" as "commentaryId"
    `;
    const result = await fastify.db.query(query, {
      bind: [
        data.eventID,
        data.marketName,
        data.marketStatus,
        true,
        false,
        new Date(),
        data.rateSource,
        data.marketID,
        data.commentaryId
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/updateEventMarketMaunalQuery",
      request
    );
    throw new Error(err.message);
  }
};

const createOrUpdateEventRunnerMarketManualQuery = async (
  data,
  request,
  fastify
) => {
  try {
    const checkQuery = `
      SELECT "wrRunnerId"
      FROM "tblMarketRunners"
      WHERE "wrSelectionId" = $1 AND "wrEventMarketId" = $2 AND "wrIsDeleted" = false
    `;

    const checkResult = await fastify.db.query(checkQuery, {
      bind: [data.selectionID, data.marketID],
      type: fastify.db.QueryTypes.SELECT,
    });

    let query;
    let queryParams;

    if (checkResult.length > 0) {
      // Record exists, perform update
      query = `
        UPDATE "tblMarketRunners"
        SET "wrRunner" = $2, "wrSelectionId" = $3,"wrEventMarketId" = $4, "wrTeamId" = $5
        WHERE "wrRunnerId" = $1
        RETURNING "wrRunnerId" as "runnerId"
      `;
      queryParams = [
        checkResult[0].wrRunnerId,
        data.runnerName,
        data.selectionID,
        data.marketID,
        data.teamId,
      ];
    } else {
      // Record does not exist, perform insert
      query = `
        INSERT INTO "tblMarketRunners"(
          "wrEventMarketId",
          "wrRunner",
          "wrSelectionId",
          "wrTeamId"
        ) VALUES ($1, $2, $3, $4)
        RETURNING "wrRunnerId" as "runnerId"
      `;
      queryParams = [data.marketID, data.runnerName, data.selectionID, data.teamId];
    }

    const result = await fastify.db.query(query, {
      bind: queryParams,
      type: fastify.db.QueryTypes.SELECT,
    });

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventmarket.js/createOrUpdateEventRunnerMarketManualQuery",
      request
    );
    throw new Error(err.message);
  }
};
const closeEventMarketByCIdQuery = async (data, fastify) => {
  try {
    //   const query2 = `
    //   UPDATE "tblMarketRunners" SET
    //     "wrSelectionStatus" = $1
    //   WHERE "wrEventMarketId" = ANY($2)
    // `;

    // await fastify.db.query(query2, {
    //   bind: [EventMarketStatus.Close, marketId.map((e) => e.marketId)],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    const query = `
      UPDATE "tblEventMarkets" SET
        "wrStatus" = $1,
        "wrCloseTime" = now()::timestamp,
        "wrIsSendData" =true,
        "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
           )::json,
        "wrLastUpdate" = now()::timestamp
      WHERE "wrCommentaryId" = $2
      AND "wrStatus" NOT IN ($3, $4, $5)
      RETURNING 
            "wrID" as "marketId",
            "wrStatus" as "status",
            "wrCloseTime" as "closeTime",
            "wrData" as "data",
            "wrLastUpdate" as "lastUpdate",
            "wrIsSendData" as "isSendData"
    `;
    const marketId = await fastify.db.query(query, {
      bind: [EventMarketStatus.Close, data.commentaryId,
      EventMarketStatus.Close,
      EventMarketStatus.Settled,
      EventMarketStatus.Cancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    const query2 = `
    UPDATE "tblMarketRunners" SET
      "wrSelectionStatus" = $1
    WHERE "wrEventMarketId" = ANY($2)
  `;

  await fastify.db.query(query2, {
    bind: [EventMarketStatus.Close, marketId.map((e) => e.marketId)],
    type: fastify.db.QueryTypes.SELECT,
  });
    // update status in runner

   
    // for (let mar of marketId) {
    //   const query = `
    //         SELECT 
    //         tem."wrID" as "marketId",
    //         tem."wrEventRefID" as "eventId",
    //         tem."wrMarketName" as "marketName",
    //         tem."wrStatus" as "status",
    //         tem."wrIsActive" as "isActive",
    //         tem."wrIsAllow" as "isAllow",
    //         json_agg(
    //             json_build_object(
    //                 'runnerId', tmr."wrRunnerId",
    //                 'runner', tmr."wrRunner",
    //                 'status', tmr."wrSelectionStatus",
    //                 'line', tmr."wrLine",
    //                 'overRate', tmr."wrOverRate",
    //                 'underRate', tmr."wrUnderRate",
    //                 'backPrice', tmr."wrBackPrice",
    //                 'layPrice', tmr."wrLayPrice",
    //                 'backSize', tmr."wrBackSize",
    //                 'laySize', tmr."wrLaySize"
    //             )
    //         ) as "runner"
    //     FROM "tblEventMarkets" tem
    //     LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    //     WHERE tem."wrID" = $1 AND tmr."wrIsDeleted" = false
    //     GROUP BY tem."wrID"
    //   `;

    //   let data = await fastify.db.query(query, {
    //     bind: [mar.marketId],
    //     type: fastify.db.QueryTypes.SELECT,
    //   });

    //   const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2
    //     RETURNING "wrData" as "data"`;

    //   await fastify.db.query(query4, {
    //     bind: [data[0], mar.marketId],
    //     type: fastify.db.QueryTypes.SELECT,
    //   });
    // }


    // return true;
    return marketId;

  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventmarket.js/closeEventMarketByCIdQuery",
      // request
      null
    );
    throw new Error(err.message);
  }

}


const updateEventMarketRunnerMaunalQuery = async (data, fastify) => {
  try {
    // const query = `
    //     UPDATE "tblMarketRunners"
    //     SET "wrBackPrice" = $1
    //     ,"wrBackSize"= $2
    //     ,"wrLayPrice" = $3
    //     ,"wrLaySize" = $4
    //     WHERE "wrSelectionId" = $5
    //     RETURNING "wrEventMarketId" as "eventMarketId",
    //     "wrRunner" as "runner",
    //     "wrTeamId" as "teamId",
    //     "wrSelectionId" as "eventSelectionId"

    // `;
    const query = `
            WITH matched_markets AS (
            SELECT tem."wrID"
            FROM "tblEventMarkets" tem
            WHERE tem."wrRateSourceRefID" = $6
            )
            UPDATE "tblMarketRunners" tmr
            SET "wrBackPrice" = $1,
                "wrBackSize" = $2,
                "wrLayPrice" = $3,
                "wrLaySize" = $4
            FROM matched_markets
            WHERE tmr."wrSelectionId" = $5
            AND tmr."wrEventMarketId" = matched_markets."wrID"
            RETURNING 
              tmr."wrEventMarketId" as "eventMarketId",
              tmr."wrRunner" as "runner",
              tmr."wrTeamId" as "teamId",
              tmr."wrSelectionId" as "eventSelectionId";
        `;
    const result = await fastify.db.query(query, {
      bind: [
        data.backPrice,
        data.backSize,
        data.layPrice,
        data.laySize,
        data.selectionId,
        data.rateSourceRefID
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVendors/updateEventMarketRunnerMaunalQuery",
      null
    );
   // throw new Error(err.message);
   return err.message;
  }
};

const UpdateEventMarketByCIdFromSocketQuery = async (data, fastify) => {
  try {
    const query = `
            SELECT 
            tem."wrID" as "marketId",
            tem."wrEventRefID" as "eventId",
            tem."wrMarketName" as "marketName",
            tem."wrStatus" as "status",
            tem."wrIsActive" as "isActive",
            tem."wrIsAllow" as "isAllow",
            json_agg(
                json_build_object(
                    'runnerId', tmr."wrRunnerId",
                    'runner', tmr."wrRunner",
                    'status', tmr."wrSelectionStatus",
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
        WHERE tem."wrID" = $1 AND tmr."wrIsDeleted" = false
        GROUP BY tem."wrID"
      `;

    let _data = await fastify.db.query(query, {
      bind: [data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    const query2 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2
        RETURNING "wrID" as "eventMarketId"
          "wrData" as "data",
          "wrLastUpdate" as "lastUpdate"
        `;

    await fastify.db.query(query2, {
      bind: [_data[0], data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
    // return true;

    return query2

  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventmarket.js/UpdateEventMarketByCIdFromSocketQuery",
      null
    );
    throw new Error(err.message);
  }
};

const UpdateResulOrApproveEventMarketQuery = async (data, request, fastify) => {
  try {
    if (data.isResult && data.result != null) {
      const query = `UPDATE "tblEventMarkets" SET "wrIsResult" = $1, "wrResult" = $2 WHERE "wrID" = $3 AND "wrIsDeleted" = false`;
      return await fastify.db.query(query, {
        bind: [data.isResult, data.result, data.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });
    }
    if (!data.isResult && data.result != null) {
      const query = `UPDATE "tblEventMarkets" SET "wrResult" = $1 WHERE "wrID" = $2 AND "wrIsDeleted" = false`;
      return await fastify.db.query(query, {
        bind: [data.result, data.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/UpdateResulOrApproveEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updateResultMultiMarketQuery = async (data, request, fastify) => {
  try {
    if (data.isResult && data.result != null) {
      const query = `UPDATE "tblEventMarkets" SET "wrIsResult" = $1, "wrResult" = $2 WHERE "wrID" = $3`;
      await fastify.db.query(query, {
        bind: [data.isResult, data.result, data.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });
    }
    if (!data.isResult && data.result != null) {
      const query = `UPDATE "tblEventMarkets" SET "wrResult" = $1 WHERE "wrID" = $2`;
       await fastify.db.query(query, {
        bind: [data.result, data.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });
    }
    let q1 = `
      UPDATE "tblMarketRunners" SET
        "wrSelectionStatus" = $1
      WHERE "wrRunnerId" = $2
    `;
    await fastify.db.query(q1, {
      bind: [EventMarketStatus.WIN, data.result],
      type: fastify.db.QueryTypes.SELECT,
    });
    const q2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE
    "wrEventMarketId" = $2 AND 
    "wrRunnerId" != $3`;
    await fastify.db.query(q2, {
      bind: [EventMarketStatus.LOSE, data.eventMarketId, data.result],
      type: fastify.db.QueryTypes.SELECT,
    });
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/UpdateResulOrApproveEventMarketQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updateComInMarketQuery = async (data, request, fastify) => {
  try {
    let { eventRefId, commentaryId } = data;
    let query = `
      UPDATE "tblEventMarkets" SET
        "wrCommentaryId" = $1
      WHERE "wrEventRefID" = $2
      RETURNING "wrID" as "eventMarketId"
    `;

    const result = await fastify.db.query(query, {
      bind: [commentaryId, eventRefId],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateComInMarketQuery",
      request
    )
    throw new Error(error.message)
  }
};

const getMarketListWithCategoryNameByCIdQuery = async (data, request, fastify) => {
  try {
    const { commentaryId } = data;

    const query = `WITH MarketRunners_CTE AS (
    SELECT 
        "wrEventMarketId" AS "eventMarketId",
        "wrRunnerId" AS "runnerId",
        "wrLine" AS "line",
        "wrOverRate" AS "overRate",
        "wrUnderRate" AS "underRate",
        "wrSelectionId" AS "selectionId",
        "wrSelectionStatus" AS "status",
        "wrBackPrice" AS "backPrice",
        "wrLayPrice" AS "layPrice",
        "wrBackSize" AS "backSize",
        "wrLaySize" AS "laySize"
    FROM "tblMarketRunners"
    WHERE "wrIsDeleted" = false
),
EventMarkets_CTE AS (
    SELECT
        tem."wrID" AS "marketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventId",
        tem."wrTeamID" AS "teamId",
        tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
        mtc."wrCategoryName" AS "categoryName",
        tem."wrMarketName" AS "marketName",
        tem."wrMargin" AS "margin",
        tem."wrStatus" AS "status",
        tem."wrInningsID" AS "inningsId",
        tem."wrOver" AS "over",
        tem."wrIsActive" AS "isActive",
        tem."wrIsAllow" AS "isAllow",
        tem."wrIsSendData" AS "isSendData",
        tem."wrLineRatio" AS "lineRatio",
        (
            SELECT array_agg(row_to_json(MarketRunners_CTE))
            FROM MarketRunners_CTE
            WHERE MarketRunners_CTE."eventMarketId" = tem."wrID"
        ) AS "runner"
    FROM "tblEventMarkets" tem
    INNER JOIN "tblMarketTypeCategories" mtc ON tem."wrMarketTypeCategoryId" = mtc."wrId"
    WHERE tem."wrCommentaryId" = $1
    AND tem."wrStatus" NOT IN ($2,$3,$4)
    AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false
)
SELECT 
    "categoryName",
    "marketId",
    "commentaryId",
    "eventId",
    "teamId",
    "marketName",
    "margin",
    "status",
    "inningsId",
    "over",
    "isActive",
    "isAllow",
    "isSendData",
    "lineRatio",
    "runner"
FROM EventMarkets_CTE
ORDER BY "categoryName", "marketId";
`;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketListByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketsByCategoryQuery = async (data,request, fastify, )=>{
  try{
    let query = `
      SELECT 
        "wrID" as "eventMarketId"
      FROM "tblEventMarkets"
      WHERE "wrCommentaryId" = $1
      AND "wrStatus" = 1 AND "wrIsDeleted" = false
      AND "wrMarketTypeCategoryId" = ANY($2)
    `;

    let result = await fastify.db.query(
      query ,
      {
        bind: [data.commentaryId, data.categoryId],	
      }
    )

    return result[0];
  }catch(error){
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketsByCategoryQuery",
      request
    )
  }
}

const getMarketByGraphByRefIdQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `WITH RankedRunners AS (
            SELECT 
                mrb."wrCommentaryBallByBallId",
                ov."wrCurrentInnings",
                bb."wrOverCount",
                ov."wrOver",
                mrb."wrData",
                ROW_NUMBER() OVER (PARTITION BY mrb."wrCommentaryBallByBallId" ORDER BY mrb."wrCommentaryBallByBallId" DESC) AS rn
            FROM "tblMarketOddsBallByBall" mrb
            LEFT JOIN "tblCommentaries" cs ON mrb."wrCommentaryId" = cs."wrCommentaryId"
            LEFT JOIN "tblCompetitions" com ON com."wrCompetitionId" = cs."wrCompetitionId"
            LEFT JOIN "tblMatchTypes" mty ON mty."wrMatchTypeId" = cs."wrMatchTypeId"
            LEFT JOIN "tblCommentaryBallByBalls" bb ON mrb."wrCommentaryBallByBallId" = bb."w
          rCommentaryBallByBallId"
            LEFT JOIN "tblOvers" ov ON ov."wrOverId" = bb."wrOverId"
            WHERE mrb."wrCommentaryId" = $1 and mrb."wrIsDeleted" = false
        )
        SELECT 
            "wrCommentaryBallByBallId",
            "wrCurrentInnings",
            "wrOverCount",
            "wrOver",
            "wrData"
        FROM RankedRunners
        WHERE rn = 1
        ORDER BY 
            "wrCurrentInnings" DESC,   -- First, sort by innings in descending order
            "wrOver" DESC;             -- Then sort by over within each innings in descending order`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketByGraphByRefIdQuery",
      request
    )
  }
};

const updateMarketStatusFromSignalRQuery = async (data, request, fastify) => {
  try {
    let { rateSourceRefID, status } = data;
    let query = `
      UPDATE "tblEventMarkets" SET
        "wrStatus" = $1
      WHERE "wrRateSourceRefID" = $2
      RETURNING "wrID" as "eventMarketId"
    `;

    const result = await fastify.db.query(query, {
      bind: [status,rateSourceRefID],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateMarketStatusFromSignalRQuery",
      request
    )
    throw new Error(error.message)
  }
};
const closeMarketQuery = async (request, fastify) => {
  try {
    let query1 = `
      UPDATE "tblMarketRunners"
      set 
      "wrSelectionStatus" = $1
      where "wrSelectionStatus" NOT IN ($2,$3,$4)
    `
    await fastify.db.query(query1, {
      bind: [EventMarketStatus.Close, EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    let query2 = `
      UPDATE "tblEventMarkets"
    SET
      "wrStatus" = $1,
      "wrCloseTime" = now()::timestamp,
      "wrLastUpdate" = now()::timestamp,
      "wrData" = jsonb_set(
        jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
        '{runner}', (
          SELECT jsonb_agg(
            jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
          )
          FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
        ),
        false
      )::json,
      "wrIsSendData" = true
      where "wrStatus" NOT IN ($2,$3,$4)
      RETURNING 
            "wrID" AS "eventMarketId",
            "wrStatus" AS "status",
            "wrCloseTime" AS "closeTime",
            "wrData" AS "data",
            "wrLastUpdate" AS "lastUpdate",
            "wrIsSendData" AS "isSendData"`;
    const result = await fastify.db.query(query2, {
      bind: [EventMarketStatus.Close, EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    // return true;
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/closeMarketQuery",
      request
    )
    throw new Error(error.message)
  }
};

const cancelMarketQuery = async (request, fastify) => {
  try {
    let query1 = `
      UPDATE "tblMarketRunners"
      set
      "wrSelectionStatus" = $1
      where "wrSelectionStatus" = $2
    `;
    await fastify.db.query(query1, {
      bind: [EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    let query2 = `
      UPDATE "tblEventMarkets"
      set
        "wrStatus" = $1,
        "wrLastUpdate" = now()::timestamp,
        "wrSettledTime" = now()::timestamp,
       "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '6'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '6'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
        )::json,
        "wrIsResult" = true,
        "wrResult" = null
      where "wrStatus" = $2
      RETURNING 
        "wrID" AS "eventMarketId"
    `;
    const result = await fastify.db.query(query2, {
      bind: [EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    // return true;
    return result;
} catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getMarketsByComIdQuery = async (data,request, fastify) => {
  try {
    let query = `
      SELECT CAST(COUNT(*) as integer) as "marketCount"
      FROM "tblEventMarkets" 
      WHERE "wrCommentaryId" = $1 AND "wrIsDeleted" = false
      AND "wrStatus" NOT IN ($2,$3)
    `;
    const result = await fastify.db.query(query, {
      bind: [data.commentaryId, EventMarketStatus.Settled, EventMarketStatus.Cancel],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketsByComIdQuery",
      request
    )
    throw new Error(error.message)
  }
}

const getAllEventMarketsAndRunnersQuery = async (fastify, data) => {  
  return await fastify.db.query(
    `SELECT
        "wrEventMarketId" as "eventMarketId",
        "wrRunnerId" as "runnerId",
        "wrRunner" as "runner",
        "wrBackPrice" as "backPrice",
        "wrLayPrice" as "layPrice",
        "wrBackSize" as "backSize",
        "wrLaySize" as "laySize",
        "wrSelectionId" as "selectionId",
        "wrTeamId" as "teamId"
    FROM "tblMarketRunners"
    WHERE "wrEventMarketId" = $1 AND "wrIsDeleted" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [data.eventMarketId],
    }
  );
};

const getAllRateSourceEventMarketQuery = async (fastify, data) => {  
  return await fastify.db.query(
    `SELECT
        "wrID" as "eventMarketId",
        "wrEventRefID" as "eventRefId",
        "wrRateSource" as "rateSource",
        "wrCommentaryId" as "commentaryId"
    FROM "tblEventMarkets"
    WHERE "wrEventRefID" = $1 AND "wrRateSource" = 2 AND "wrIsDeleted" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [data.eventId],
    }
  );
};
const getEventMarketsQuery = async (fastify, whereCondition = null) => {
  try {
    return await fastify.db.query(
      `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId",
          tem."wrEventRefID" AS "eventRefId",
          tc."wrEventName" AS "eventName",
          tc."wrEventDate" AS "eventDate",
          tcom."wrCompetition" AS "competitionName",
          tet."wrEventType" AS "eventTypeName",
          "wrTeamID" AS "teamId",
          tt."wrTeamName" AS "teamName",
          "wrInningsID" AS "inningsId",
          "wrMarketName" AS "marketName",
          "wrMargin" AS "margin",
          "wrStatus" AS "status",
          tem."wrIsActive" as "isActive",
          tem."wrDelay" as "delay",
          "wrIsAllow" as "isAllow",
          "wrCloseTime" as "closeTime",
          "wrOpenTime" as "openTime",
          "wrSettledTime" as "settledTime",
          "wrResult" as "result",
          "wrIsResult" as "isResult",
          tem."wrLastUpdate" as "lastUpdate",
          tmt."wrMarketTypeName" as "marketTypeName", 
          tem."wrMarketTypeId" as "marketTypeId",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tmtc."wrCategoryName" as "categoryName",
          tem."wrAfterSuspendTime" as "afterSuspendTime",
          tem."wrAfterCloseTime" as "afterCloseTime",
          tem."wrCreatedBy" as "createdBy",
          tem."wrIsDeleted" as "isDeleted",
          tmr."wrRunner" as "resultRunner",
          tem."wrIsInningRun" as "isInningRun"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
      LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
      LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
      LEFT JOIN "tblMarketTypes" tmt ON tmt."wrId" = tem."wrMarketTypeId"
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrRunnerId" = CAST(tem."wrResult" AS INTEGER)
      LEFT JOIN "tblMarketTypeCategories" tmtc ON tmtc."wrId" = tem."wrMarketTypeCategoryId"
      ${whereCondition ? `WHERE ${whereCondition}` : ""}
      ORDER BY tem."wrID" DESC;
      `,
      {
      type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getEventMarketsQuery",
      null
    );
    throw new Error(error.message);
  }
};
const cancelSettledMarketQuery = async (data, request, fastify) => {
  try {
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = $2`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Cancel, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });
    const query = `UPDATE "tblEventMarkets"
          SET "wrStatus" =$1,
          "wrIsResult" = false,
          "wrResult" = null,
          "wrSettledTime" = now()::timestamp,
          "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '6'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '6'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
           )::json,
          "wrLastUpdate" = now()::timestamp
          WHERE "wrCommentaryId" = $2
          AND "wrID" = $3
          RETURNING 
            "wrID" AS "eventMarketId"
        `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Cancel,
        data.commentaryId,
        data.eventMarketId,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

   

    // const query3 = `SELECT 
    //       tem."wrID" as "marketId",
    //       tem."wrEventRefID" as "eventId",
    //       tem."wrMarketName" as "marketName",
    //       tem."wrStatus" as "status",
    //       tem."wrIsActive" as "isActive",
    //       tem."wrIsAllow" as "isAllow",
    //       json_agg(
    //           json_build_object(
    //               'runnerId' , tmr."wrRunnerId",
    //               'runner', tmr."wrRunner",
    //               'status' , tmr."wrSelectionStatus",
    //               'line', tmr."wrLine",
    //               'overRate', tmr."wrOverRate",
    //               'underRate', tmr."wrUnderRate",
    //               'backPrice', tmr."wrBackPrice",
    //               'layPrice', tmr."wrLayPrice",
    //               'backSize', tmr."wrBackSize",
    //               'laySize', tmr."wrLaySize"
    //           )
    //       ) as "runner"
    //   FROM "tblEventMarkets" tem
    //   LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
    //   WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
    //   GROUP BY tem."wrID"`;

    // const marketRunner = await fastify.db.query(query3, {
    //   bind: [data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // // update eventmarket data with runner data
    // const dataToStore = marketRunner[0];

    // const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`;

    // await fastify.db.query(query4, {
    //   bind: [dataToStore, data.eventMarketId],
    //   type: fastify.db.QueryTypes.SELECT,
    // });

    // return true;
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelSettledMarketQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const getEventMarketQueryV1 = async (fastify) => {
  return await fastify.db.query(
    `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId",
          tem."wrEventRefID" AS "eventRefId",
          tc."wrEventName" AS "eventName",
          tc."wrEventDate" AS "eventDate",
          "wrTeamID" AS "teamId",
          tt."wrTeamName" AS "teamName",
          "wrInningsID" AS "inningsId",
          "wrMarketName" AS "marketName",
          "wrMargin" AS "margin",
          "wrStatus" AS "status",
          "wrIsPredefineMarket" as "isPredefineMarket",
          "wrIsOver" as "isOver",
          "wrOver" as "over",
          "wrIsPlayer" as "isPlayer",
          "wrPlayerID" as "playerId",
          "wrIsAutoCancel" as "isAutoCancel",
          "wrAutoOpenType" as "autoOpenType", 
          "wrAutoOpen" as "autoOpen",
          "wrAutoCloseType" as "autoCloseType",
          "wrBeforeAutoClose" as "beforeAutoClose",
          "wrAutoSuspendType" as "autoSuspendType",
          "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
          "wrIsBallStart" as "isBallStart",
          "wrIsAutoResultSet" as "isAutoResultSet",
          "wrAutoResultType" as "autoResultType",
          "wrAutoResultafterBall" as "autoResultafterBall",	
          "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
          "wrAfterWicketNotCreated" as "afterWicketNotCreated",
          tem."wrIsActive" as "isActive",	
          "wrIsAllow" as "isAllow",
          "wrCloseTime" as "closeTime",
          "wrOpenTime" as "openTime",
          "wrSettledTime" as "settledTime",
          "wrResult" as "result",
          "wrIsResult" as "isResult",
          "wrData" as "data",
          tem."wrLastUpdate" as "lastUpdate",
          tem."wrIsSendData" as "isSendData",
          tem."wrActionType" as "actionType",
          tem."wrMarketTemplateId" as "marketTemplateId",
          tem."wrMarketTypeId" as "marketTypeId",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tem."wrCreateRefId" as "createRefId",
          tem."wrOpenRefId" as "openRefId",
          tem."wrCreateType" as "createType",
          tem."wrCreate" as "create",
          tem."wrTemplateType" as "templateType",
          tem."wrDelay" as "delay",
          tem."wrLineRatio" as "lineRatio",
          tem."wrCreatedBy" as "createdBy",
          tem."wrRateSource" as "rateSource",
          tem."wrRateSourceRefID" as "rateSourceRefID",
          json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'line', tmr."wrLine",
                      'overRate', tmr."wrOverRate",
                      'underRate', tmr."wrUnderRate",
                      'selectionId', tmr."wrSelectionId",
                      'selectionStatus', tmr."wrSelectionStatus",
                      'order', tmr."wrOrder",
                      'backPrice', tmr."wrBackPrice",
                      'layPrice', tmr."wrLayPrice",
                      'backSize', tmr."wrBackSize",
                      'laySize', tmr."wrLaySize"
                  )
            ) as "runners"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
      WHERE tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
      GROUP BY tem."wrID", tc."wrEventName", tc."wrEventDate", tt."wrTeamName"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );

};
const upsertEventMarketSPQueryV1 = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `CALL proc_save_eventmarket_v1($1, $2,$3)`,
      {
        bind: [
          data.singleRunnerMarket ? JSON.stringify(data.singleRunnerMarket) : null,
          null,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    const result2 = await fastify.db.query(
      `
      CALL proc_save_eventmarket_multirunner_v1($1, $2,$3)
      `,
      {
        bind: [
          data.multiRunnerMarket ? JSON.stringify(data.multiRunnerMarket) : null,
          null,
          null
        ],
        type : fastify.db.QueryTypes.SELECT
      }
    );
    const dataToreturn = [...result[0].marketdata_arr, ...result2[0].marketdata_arr];
    return dataToreturn;
  } catch (error) {
    console.log(error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upsertEventMarketSPQueryV1",
      request
    )
    throw new Error(error.message)
  }
}
const updateEventMarketRateQueryV1 = async (data, request, fastify) => {
  try {  
    
    const result =await fastify.db.query(
      `CALL proc_update_market_v1($1,$2,$3)`,
      {
        bind: [
          data.singleRunnerMarket ? JSON.stringify(data.singleRunnerMarket) : null,
          null,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    const result2 = await fastify.db.query(
      `CALL proc_update_multirunner_market_v1($1,$2,$3)`,
      {
        bind: [
          data.multiRunnerMarket ? JSON.stringify(data.multiRunnerMarket) : null,
          null,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return [...result[0].market_data_arr, ...result2[0].market_data_arr];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateEventMarketRateQueryV1",
      request
    );
    throw new Error(error.message);
  }
};
const getEventMarketByIdsQueryV1 = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId",
          tem."wrEventRefID" AS "eventRefId",
          tc."wrEventName" AS "eventName",
          tc."wrEventDate" AS "eventDate",
          "wrTeamID" AS "teamId",
          tt."wrTeamName" AS "teamName",
          "wrInningsID" AS "inningsId",
          "wrMarketName" AS "marketName",
          "wrMargin" AS "margin",
          "wrStatus" AS "status",
          "wrIsPredefineMarket" as "isPredefineMarket",
          "wrIsOver" as "isOver",
          "wrOver" as "over",
          "wrIsPlayer" as "isPlayer",
          "wrPlayerID" as "playerId",
          "wrIsAutoCancel" as "isAutoCancel",
          "wrAutoOpenType" as "autoOpenType", 
          "wrAutoOpen" as "autoOpen",
          "wrAutoCloseType" as "autoCloseType",
          "wrBeforeAutoClose" as "beforeAutoClose",
          "wrAutoSuspendType" as "autoSuspendType",
          "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
          "wrIsBallStart" as "isBallStart",
          "wrIsAutoResultSet" as "isAutoResultSet",
          "wrAutoResultType" as "autoResultType",
          "wrAutoResultafterBall" as "autoResultafterBall",	
          "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
          "wrAfterWicketNotCreated" as "afterWicketNotCreated",
          tem."wrIsActive" as "isActive",	
          "wrIsAllow" as "isAllow",
          "wrCloseTime" as "closeTime",
          "wrOpenTime" as "openTime",
          "wrSettledTime" as "settledTime",
          "wrResult" as "result",
          "wrIsResult" as "isResult",
          "wrData" as "data",
          tem."wrLastUpdate" as "lastUpdate",
          tem."wrIsSendData" as "isSendData",
          tem."wrActionType" as "actionType",
          tem."wrMarketTemplateId" as "marketTemplateId",
          tem."wrMarketTypeId" as "marketTypeId",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tem."wrCreateRefId" as "createRefId",
          tem."wrOpenRefId" as "openRefId",
          tem."wrCreateType" as "createType",
          tem."wrCreate" as "create",
          tem."wrTemplateType" as "templateType",
          tem."wrDelay" as "delay",
          tem."wrLineRatio" as "lineRatio",
          tem."wrRateSource" as "rateSource",
          tem."wrRateSourceRefID" as "rateSourceRefID",
          tem."wrLineType" as "lineType",
          tem."wrDefaultBackSize" as "defaultBackSize",
          tem."wrCreatedBy" as "createdBy",
          tem."wrIsInningRun" as "isInningRun",
          tem."wrDefaultLaySize" as "defaultLaySize",
          json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'line', tmr."wrLine",
                      'overRate', tmr."wrOverRate",
                      'underRate', tmr."wrUnderRate",
                      'selectionId', tmr."wrSelectionId",
                      'selectionStatus', tmr."wrSelectionStatus",
                      'order', tmr."wrOrder",
                      'backPrice', tmr."wrBackPrice",
                      'layPrice', tmr."wrLayPrice",
                      'backSize', tmr."wrBackSize",
                      'laySize', tmr."wrLaySize"
                  )
            ) as "runners"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
      WHERE tem."wrID" = ANY($1) AND tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
      GROUP BY tem."wrID", tc."wrEventName", tc."wrEventDate", tt."wrTeamName"
    `,
    {
      bind : [data.eventMarketIds],
      type: fastify.db.QueryTypes.SELECT,
    }
  );
   
  } catch (error) {
    console.error(error);
  }

};
const getMarketListByCIdQueryV1 = async (data, request, fastify) => {
  try {
    const { commentaryId } = data;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
            null as "playerScore",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrMarketTypeCategoryId" NOT IN ($5,$6,$7,$8)
        AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false
        `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        data.playerCategory,
        data.boundaryCategory,
        data.pbfCategory,
        data.wicket
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarketListByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMarketWithRunnerQuery = async (fastify, whereCondition) => {
  if(whereCondition === null){
    whereCondition = `tc."wrIsDelete" = false`
  }
  return await fastify.db.query(
    `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        tt."wrTeamName" AS "teamName",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        tem."wrDelay" AS "delay",
        tem."wrMarketTypeId" as "marketTypeId",
        tmt."wrMarketTypeName" as "marketTypeName", 
        tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
        tmtc."wrCategoryName" as "categoryName",
        tem."wrIsDeleted" as "isDeleted",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        tem."wrCreatedBy" as "createdBy",
        tmr."wrRunner" as "resultRunner",
        COALESCE(runner_data."runners", '[]') as "runners"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
    LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
    LEFT JOIN "tblMarketTypes" tmt ON tmt."wrId" = tem."wrMarketTypeId"
    LEFT JOIN "tblMarketTypeCategories" tmtc ON tmtc."wrId" = tem."wrMarketTypeCategoryId"
    LEFT JOIN "tblMarketRunners" tmr ON tmr."wrRunnerId" = tem."wrResult"
    LEFT JOIN LATERAL (
						SELECT jsonb_agg(
							jsonb_build_object(
								'runnerId', tmr."wrRunnerId",
								'runner', tmr."wrRunner",
								'line', tmr."wrLine",
								'overRate', tmr."wrOverRate",
								'underRate', tmr."wrUnderRate",
								'selectionId', tmr."wrSelectionId",
								'selectionStatus', tmr."wrSelectionStatus",
								'order', tmr."wrOrder",
								'backPrice', tmr."wrBackPrice",
								'layPrice', tmr."wrLayPrice",
								'backSize', tmr."wrBackSize",
								'laySize', tmr."wrLaySize",
								'teamId', tmr."wrTeamId"
							)
              ORDER BY tmr."wrRunnerId" ASC
						) AS "runners"
						FROM "tblMarketRunners" tmr
						WHERE tmr."wrEventMarketId" = tem."wrID"
					) runner_data ON true
    ${whereCondition ? `WHERE ${whereCondition}` : ""}
    GROUP BY tem."wrID", tc."wrEventName", tc."wrEventDate", tcom."wrCompetition", tet."wrEventType",
     tmt."wrMarketTypeName", tmtc."wrCategoryName", tt."wrTeamName", runner_data."runners" , tmr."wrRunner"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}
const closeMarketByATQuery = async (data, request, fastify) => {
  try {
    const query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1 , "wrCloseTime" = now()::timestamp, "wrLastUpdate" = now()::timestamp , "wrIsSendData" = true
            WHERE "wrCommentaryId" = $2
            AND "wrActionType" IN ($3,$4)
            AND "wrStatus" NOT IN ($5,$6,$7)
            RETURNING "wrID" as "eventMarketId"
        `;

    let result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Close,
        data.commentaryId,
        ActionTypeForMarketCancel.winMustClose,
        ActionTypeForMarketCancel.winMustCloseCancel,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    // close the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Close, result.map((e) => e.eventMarketId)],
      type: fastify.db.QueryTypes.SELECT,
    });

    for (market of result) {
      const query3 = `
          SELECT 
              tem."wrID" as "marketId",
              tem."wrEventRefID" as "eventId",
              tem."wrMarketName" as "marketName",
              tem."wrStatus" as "status",
              tem."wrIsActive" as "isActive",
              tem."wrIsAllow" as "isAllow",
              json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'status', tmr."wrSelectionStatus",	
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
          GROUP BY tem."wrID"

        `;

      const marketRunner = await fastify.db.query(query3, {
        bind: [market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      // update eventmarket data with runner data
      const dataToStore = marketRunner[0];

      const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,
      "wrLastUpdate" = now()::timestamp
       WHERE "wrID" = $2
        RETURNING "wrData" as "data"`;

      let udpatedData = await fastify.db.query(query4, {
        bind: [dataToStore, market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      market.data = udpatedData[0].data;

      marketDataLogger(
        {
          eventMarketId: market.eventMarketId,
          commentaryId: data.commentaryId,
          dataTosave: dataToStore,
          updateType: MarketUpdateType.marketInitilization,
          isSendData: true
        },
        request,
        fastify
      ).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> repository/TableEventmarket.js/closeEventMarketByTeamIdQuery",
          request
        );
      });
    }

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/closeMarketByATQuery",
      request
    );
    throw new Error(error.message);
  }
};
const cancelMarketByATQuery = async (data, request, fastify) => {
  try {
    let query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1,
            "wrSettledTime" = now()::timestamp,
            "wrLastUpdate" = now()::timestamp,
            "wrIsSendData" = true
            WHERE
             "wrCommentaryId" = $2
            AND "wrActionType" = $3
            RETURNING "wrID" as "eventMarketId"
        `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Cancel,
        data.commentaryId,
        ActionTypeForMarketCancel.winMustCloseCancel,
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    // cancel the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Cancel, result.map((e) => e.eventMarketId)],
      type: fastify.db.QueryTypes.SELECT,
    });

    for (market of result) {
      const query3 = `
      SELECT 
          tem."wrID" as "marketId",
          tem."wrEventRefID" as "eventId",
          tem."wrMarketName" as "marketName",
          tem."wrStatus" as "status",
          tem."wrIsActive" as "isActive",
          tem."wrIsAllow" as "isAllow",
          json_agg(
              json_build_object(
                  'runnerId', tmr."wrRunnerId",
                  'runner', tmr."wrRunner",
                  'status', tmr."wrSelectionStatus",
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
      GROUP BY tem."wrID"

    `;

      const marketRunner = await fastify.db.query(query3, {
        bind: [market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      // update eventmarket data with runner data
      const dataToStore = marketRunner[0];

      const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,
       "wrLastUpdate" = now()::timestamp
       WHERE "wrID" = $2
        RETURNING "wrData" as "data"`;

      let udpatedData = await fastify.db.query(query4, {
        bind: [dataToStore, market.eventMarketId],
        type: fastify.db.QueryTypes.SELECT,
      });

      market.data = udpatedData[0].data;

      marketDataLogger({
        eventMarketId: market.eventMarketId,
        commentaryId: data.commentaryId,
        dataTosave: typeof(dataToStore) === 'string' ? JSON.parse(dataToStore) : dataToStore,
        updateType: MarketUpdateType.marketInitilization,
        isSendData: true
      }, request,fastify).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> repository/TableEventmarket.js/closeEventMarketByTeamIdQuery",
          request
        );
      });
    }

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelEventMarketByTeamIdQuery",
      request
    );
    throw new Error(error.message);
  }
};

const getEventMarketRunnersQuery = async (refID, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        tt."wrTeamName" AS "teamName",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerID" as "playerId",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrAutoOpenType" as "autoOpenType", 
        "wrAutoOpen" as "autoOpen",
        "wrAutoCloseType" as "autoCloseType",
        "wrBeforeAutoClose" as "beforeAutoClose",
        "wrAutoSuspendType" as "autoSuspendType",
        "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
        "wrIsBallStart" as "isBallStart",
        "wrIsAutoResultSet" as "isAutoResultSet",
        "wrAutoResultType" as "autoResultType",
        "wrAutoResultafterBall" as "autoResultafterBall",	
        "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
        "wrAfterWicketNotCreated" as "afterWicketNotCreated",
        tem."wrIsActive" as "isActive",        
        "wrIsAllow" as "isAllow",
        "wrCloseTime" as "closeTime",
        "wrOpenTime" as "openTime",
        "wrSettledTime" as "settledTime",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        "wrData" as "data",
        tem."wrLastUpdate" as "lastUpdate",
        tem."wrIsSendData" as "isSendData",
        tem."wrActionType" as "actionType",
        tem."wrMarketTemplateId" as "marketTemplateId",
        tem."wrMarketTypeId" as "marketTypeId",
        tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
        tem."wrCreateRefId" as "createRefId",
        tem."wrOpenRefId" as "openRefId",
        tem."wrCreateType" as "createType",
        tem."wrCreate" as "create",
        tem."wrTemplateType" as "templateType",
        tr."wrRunnerId" as "runnerId",
        tr."wrRunner" as "runner",
        tr."wrLine" as "line",
        tr."wrOverRate" as "overRate",
        tr."wrUnderRate" as "underRate",
        tr."wrBackPrice" as "backPrice",
        tr."wrLayPrice" as "layPrice",
        tr."wrBackSize" as "backSize",
        tr."wrLaySize" as "laySize",
        tr."wrLastUpdate" as "runnerLastUpdate",
        tr."wrSelectionId" as "selectionId",
        tr."wrSelectionStatus" as "selectionStatus",
        tr."wrOrder" as "order",
        tr."wrTeamId" as "teamId",
        tem."wrLastUpdate" as "lastUpdate",
        tem."wrDelay" as "delay",
        tem."wrLineRatio" as "lineRatio",
        tem."wrRateSource" as "rateSource",
        tem."wrRateSourceRefID" as "rateSourceRefID",
        tem."wrResult" as "result",
        tem."wrIsResult" as "isResult",
        tem."wrLineType" as "lineType",
        tem."wrDefaultBackSize" as "defaultBackSize",
        tem."wrCreatedBy" as "createdBy",
        tem."wrDefaultLaySize" as "defaultLaySize"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
      LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
      LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
      LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
      WHERE tem."wrEventRefID" = $1 AND tem."wrRateSource" = 2 AND tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tr."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [refID],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getEventMarketRunnersQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getExtrenalMarketQuery = async(refID,fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT
        "wrID" AS "eventMarketId",
        "wrMarketName" AS "marketName",
        tr."wrRunnerId" as "runnerId",
        tr."wrRunner" as "runner",
        tr."wrTeamId" as "teamId",
        tr."wrSelectionId" as "selectionId"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
      WHERE tem."wrEventRefID" = $1 AND tem."wrRateSource" = 2 AND tem."wrIsDeleted" = false AND tr."wrIsDeleted" = false`,
      
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [refID],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getExtrenalMarketQuery",
      request
    );
    throw new Error(error.message);
    
  }
}

const updateEventMarketCloseSuspendTimeQuery = async (request, fastify) => {
  const data = request.body
  try {
    const updateTime = await fastify.db.query(
      `UPDATE "tblEventMarkets" SET
                "wrAfterSuspendTime" = $1,
                "wrAfterCloseTime" = $2
        WHERE "wrID" = $3 AND "wrIsDeleted" = false
        RETURNING 
        "wrAfterSuspendTime" as "afterSuspendTime",
        "wrAfterCloseTime" as "afterCloseTime"`,
      {
        bind: [
          data.afterSuspendTime || null,
          data.afterCloseTime || null,
          data.eventMarketId,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return updateTime[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateEventMarketCloseSuspendTimeQuery",
      request
    );
    throw new Error(error.message);
  }
};

const updateEventMarketCloseQuery = async (commentaryId, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `WITH update_tblEventMarkets AS (
          UPDATE "tblEventMarkets" SET
              "wrStatus" = $1,
              "wrCloseTime" = now()::timestamp,
              "wrLastUpdate" = now()::timestamp,
              "wrData" = jsonb_set(
                jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
                '{runner}', (
                  SELECT jsonb_agg(
                    jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
                  )
                  FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
                ),
                false
              )::json
          WHERE "wrCommentaryId" = ANY($2)
            AND "wrStatus" NOT IN ($3, $4, $5)
          RETURNING 
            "wrID" AS "eventMarketId",
            "wrStatus" AS "status",
            "wrCloseTime" AS "closeTime",
            "wrLastUpdate" AS "lastUpdate",
            "wrData" AS "data"
        )
        UPDATE "tblMarketRunners"
        SET "wrSelectionStatus" = $1
        WHERE "wrEventMarketId" IN (SELECT "eventMarketId" FROM update_tblEventMarkets);
        `,
      {
        bind: [
          EventMarketStatus.Close,
          commentaryId,
          EventMarketStatus.Settled,
          EventMarketStatus.Cancel,
          EventMarketStatus.Close
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateEventMarketCloseQuery",
      request
    );
    throw new Error(error.message);
  }
}

const closeEventMarketsQuery = async (eventMarketId, request, fastify) => {
  try {
    let query1 = `
      UPDATE "tblMarketRunners"
      set 
      "wrSelectionStatus" = $2
      where "wrEventMarketId" = any($1) and "wrSelectionStatus" NOT IN ($3,$4,$5)
    `
    await fastify.db.query(query1, {
      bind: [
        eventMarketId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        EventMarketStatus.Close
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    let query2 = `
      UPDATE "tblEventMarkets" SET
      "wrStatus" = $2,
      "wrCloseTime" = now()::timestamp,
      "wrLastUpdate" = now()::timestamp,
      "wrData" = jsonb_set(
        jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
        '{runner}', (
          SELECT jsonb_agg(
            jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
          )
          FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
        ),
        false
      )::json,
      "wrIsSendData" = true
      where "wrID" = any($1) and "wrStatus" NOT IN ($3,$4,$5)
      RETURNING 
            "wrID" AS "eventMarketId",
            "wrStatus" AS "status",
            "wrCloseTime" AS "closeTime",
            "wrLastUpdate" AS "lastUpdate",
            "wrData" AS "data",
            "wrIsSendData" AS "isSendData"
        `;
    const result = await fastify.db.query(query2, {
      bind: [
        eventMarketId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        EventMarketStatus.Close]
        ,
      type: fastify.db.QueryTypes.SELECT,
    });

    // return true;
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/closeEventMarketsQuery",
      request
    )
    throw new Error(error.message)
  }
};

const cancelEventMarketsQuery = async (eventMarketId, request, fastify) => {
  try {
    let query1 = `
      UPDATE "tblMarketRunners"
      set
      "wrSelectionStatus" = $2
      where "wrEventMarketId" = any($1) and "wrSelectionStatus" = $3
    `;
    await fastify.db.query(query1, {
      bind: [eventMarketId, EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    let query2 = `
      UPDATE "tblEventMarkets"
      set
        "wrStatus" = $2,
        "wrLastUpdate" = now()::timestamp,
        "wrSettledTime" = now()::timestamp,
       "wrData" = jsonb_set(
          jsonb_set("wrData"::jsonb, '{status}', '6'::jsonb, false),
          '{runner}', (
            SELECT jsonb_agg(
              jsonb_set(runner_elem, '{status}', '6'::jsonb, false)
            )
            FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
          ),
          false
        )::json,
        "wrIsResult" = true,
        "wrResult" = null
      where "wrID" = any($1) and "wrStatus" = $3
      RETURNING 
            "wrID" AS "eventMarketId"
    `;
    const result = await fastify.db.query(query2, {
      bind: [eventMarketId, EventMarketStatus.Cancel, EventMarketStatus.Close],
      type: fastify.db.QueryTypes.SELECT,
    });

    // return true;
    return result;
} catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelEventMarketsQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getOpenMarketByCIdQuery = async (data, request, fastify) => {	
  try {
     let result = await fastify.db.query(
      `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId"
        FROM "tblEventMarkets" tem
        WHERE tem."wrCommentaryId" = $1 AND tem."wrStatus" =$2 AND tem."wrIsDeleted" = false
        AND tem."wrRateSource" = 1
        AND tem."wrMarketTypeCategoryId" != ALL ($3);
      `,{
        bind : [
          data.commentaryId,
          EventMarketStatus.Open,
          data.categoryId
        ],
        type: fastify.db.QueryTypes.SELECT,
      });

      return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getOpenMarketByCIdQuery",
      request
    );
    throw new Error(error.message);
  }
}
const suspendMarketQuery = async (data, request, fastify) => {
  try{
    let query1 = `
    UPDATE "tblMarketRunners"
    set 
    "wrSelectionStatus" = $1
    where "wrSelectionStatus" NOT IN ($2,$3,$4,$5)
    AND "wrEventMarketId" = ANY ($6::int[])
  `
  await fastify.db.query(query1, {
    bind: [
      EventMarketStatus.Suspend,
      EventMarketStatus.Close,
      EventMarketStatus.Settled,
      EventMarketStatus.Cancel,
      EventMarketStatus.Suspend,
      [...data.eventMarketIds]
    ],
    type: fastify.db.QueryTypes.SELECT,
  });

  let query2 = `
    UPDATE "tblEventMarkets"
  SET
    "wrStatus" = $1,
    "wrLastUpdate" = now()::timestamp,
    "wrData" = jsonb_set(
      jsonb_set("wrData"::jsonb, '{status}', '3'::jsonb, false),
      '{runner}', (
        SELECT jsonb_agg(
          jsonb_set(runner_elem, '{status}', '3'::jsonb, false)
        )
        FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
      ),
      false
    )::json
    where "wrStatus" NOT IN ($2,$3,$4,$5)
    AND "wrID" = ANY($6)
      `;
  await fastify.db.query(query2, {
    bind: [
      EventMarketStatus.Suspend,
      EventMarketStatus.Close,
      EventMarketStatus.Settled,
      EventMarketStatus.Cancel,
      EventMarketStatus.Suspend,
      data.eventMarketIds
    ],
    type: fastify.db.QueryTypes.SELECT,
  });

  const markets = await fastify.db.query(
    `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        WHERE tem."wrID" = ANY($1)
        AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false`,
        {
          bind: [data.eventMarketIds],
          type: fastify.db.QueryTypes.SELECT
        }
  );
  return markets;

  // return true;
  }catch(error){
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/suspendMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getMarCountByComQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      SELECT COUNT("wrID") as "marketCount"
      FROM "tblEventMarkets"
      WHERE "wrCommentaryId" = $1

      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryId],
      }
    )
    console.log(result)
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMarCountByCom",
      request
    );
    throw new Error(error.message);
  }
}
const insertTimeLogs = async(commentaryId, fastify) => {
  try {
    const logsData = await fastify.db.query(
      `INSERT INTO "tblTimeLogs" ("wrCommentaryId", "wrRequestTime", "wrCode")
       VALUES ($1, NOW(), $2)
       RETURNING "wrId";`,
       {
        bind:[commentaryId, "optimized code"],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return logsData[0]
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/insertTimeLogs",
      null
    );
    throw new Error(error.message);
  }
}
const updateTimeLogs = async(id, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTimeLogs" 
    SET 
        "wrResponseTime" = NOW(),
        "wrTimeTaken" = NOW() - "wrRequestTime"
    WHERE "wrId" = $1;`,
    {
      bind:[id],
      type: fastify.db.QueryTypes.SELECT,
    }
  )
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updateTimeLogs",
      null
    );
    throw new Error(error.message);
  }
}
const updatePredefinedQuery = async (data, request, fastify) => {
  try {
    const query = `
    UPDATE "tblEventMarkets"
    SET "wrPredefinedValue" = $1
    WHERE "wrID" = $2
    
    `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [data.predefinedValue, data.eventMarketId],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/updatePredefinedQuery",
      request
    );
    throw new Error(error.message);
  }
}
const playerMarketQuery = async (data, request, fastify) => {
  try {
    const commentaryId = data.commentaryId;
    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
            tcp."wrBat_Run" as "playerScore",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblCommentaryPlayers" tcp ON tcp."wrCommentaryPlayerId" = tem."wrPlayerID"
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrMarketTypeCategoryId" = $5
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false`;

        return await fastify.db.query(query, {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            commentaryId,
            EventMarketStatus.Close,
            EventMarketStatus.Settled,
            EventMarketStatus.Cancel,
            data.marketTypeCategoryId
          ],
        });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/playerMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const boundaryMarketQuery = async (data, request, fastify) => {
  try {
    const commentaryId = data.commentaryId;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
            tcp."wrBat_FOUR" + tcp."wrBat_SIX" as "playerScore",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblCommentaryPlayers" tcp ON tcp."wrCommentaryPlayerId" = tem."wrPlayerID"
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrMarketTypeCategoryId" = $5
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false`;

        return await fastify.db.query(query, {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            commentaryId,
            EventMarketStatus.Close,
            EventMarketStatus.Settled,
            EventMarketStatus.Cancel,
            data.marketTypeCategoryId
          ],
        });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/boundaryMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const pbfMarketQuery = async (data, request, fastify) => {
  try {
    const commentaryId = data.commentaryId;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
            tcp."wrBat_Ball" as "playerScore",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblCommentaryPlayers" tcp ON tcp."wrCommentaryPlayerId" = tem."wrPlayerID"
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrMarketTypeCategoryId" = $5
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrRateSource" = 1 AND tem."wrIsDeleted" = false`;

        return await fastify.db.query(query, {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            commentaryId,
            EventMarketStatus.Close,
            EventMarketStatus.Settled,
            EventMarketStatus.Cancel,
            data.marketTypeCategoryId
          ],
        });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/pbfMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getEventMarketsByCommId = async (commentaryId, request, fastify) => {
  try {
    const query = 
    `SELECT 
          tem."wrID" as "eventMarketId",
          tem."wrEventRefID" as "eventId",
          tem."wrCommentaryId" as "commentaryId",
          tem."wrMarketName" as "marketName",
          tem."wrStatus" as "status",
          tem."wrMargin" as "margin",
          tem."wrCloseTime" as "closeTime",
          tem."wrOpenTime" as "openTime",
          tem."wrSettledTime" as "settledTime",
          tem."wrLastUpdate" as "lastUpdate",
          tem."wrRateSource" as "rateSource",
          tem."wrRateSourceRefID" as "rateSourceRefId",
          tem."wrMarketTypeId" as "marketTypeId",
          tmt."wrMarketTypeName" as "marketTypeName",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tmtc."wrCategoryName" as "categoryName",
          COALESCE(
              json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'status', tmr."wrSelectionStatus",
                      'line', tmr."wrLine",
                      'overRate', tmr."wrOverRate",
                      'underRate', tmr."wrUnderRate",
                      'selectionId', tmr."wrSelectionId",
                      'selectionStatus', tmr."wrSelectionStatus",
                      'order', tmr."wrOrder",
                      'lineRatio', tmr."wrLineRatio",
                      'backPrice', tmr."wrBackPrice",
                      'layPrice', tmr."wrLayPrice",
                      'backSize', tmr."wrBackSize",
                      'laySize', tmr."wrLaySize",
                      'teamId', tmr."wrTeamId",
                      'lastUpdate', tmr."wrLastUpdate"
                  ) 
              ) FILTER (WHERE tmr."wrRunnerId" IS NOT NULL), 
              '[]'::json
          ) as "runner"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID" AND tmr."wrIsDeleted" = false
      LEFT JOIN "tblMarketTypes" tmt ON tmt."wrId" = tem."wrMarketTypeId"
      LEFT JOIN "tblMarketTypeCategories" tmtc ON tmtc."wrId" = tem."wrMarketTypeCategoryId"
      WHERE tem."wrCommentaryId" = $1 AND tem."wrIsDeleted" = false
      AND tem."wrRateSource" = 2
      AND tem."wrStatus" NOT IN ($2 ,$3,$4)
      GROUP BY 
      tem."wrID",
      tmt."wrMarketTypeName",
      tmtc."wrCategoryName";
      `;

        return await fastify.db.query(query, {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            commentaryId,
            EventMarketStatus.Close,
            EventMarketStatus.Settled,
            EventMarketStatus.Cancel,
          ],
        });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getEventMarketsByCommId",
      request
    );
    throw new Error(error.message);
  }
}

const socketMarketRunnerDataQuery = async (eventId, fastify) => {
  try {
    const query = 
    `SELECT 
          tem."wrID" as "eventMarketId",
          tem."wrEventRefID" as "eventRefId",
          tem."wrStatus" as "status",
          COALESCE(
              json_agg(
                  json_build_object(
                      'runnerId', tmr."wrRunnerId",
                      'runner', tmr."wrRunner",
                      'selectionId', tmr."wrSelectionId",
                      'backPrice', tmr."wrBackPrice",
                      'layPrice', tmr."wrLayPrice",
                      'backSize', tmr."wrBackSize",
                      'laySize', tmr."wrLaySize",
                      'teamId', tmr."wrTeamId",
                      'teamName', tt."wrTeamName"
                  ) 
              ) FILTER (WHERE tmr."wrRunnerId" IS NOT NULL), 
              '[]'::json
          ) as "runner"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID" AND tmr."wrIsDeleted" = false
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tmr."wrTeamId" AND tmr."wrIsDeleted" = false
      WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false
      GROUP BY tem."wrID"`;

        return await fastify.db.query(query, {
          type: fastify.db.QueryTypes.SELECT,
          bind: [eventId],
        });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getEventMarketsByCommId",
      null
    );
    throw new Error(error.message);
  }
}
const getManualMarketDataQuery = async (data,request, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId",
          tem."wrEventRefID" AS "eventRefId",
          "wrTeamID" AS "teamId",
          "wrInningsID" AS "inningsId",
          "wrMarketName" AS "marketName",
          "wrMargin" AS "margin",
          "wrStatus" AS "status",
          "wrIsPredefineMarket" as "isPredefineMarket",
          "wrIsOver" as "isOver",
          "wrOver" as "over",
          "wrIsPlayer" as "isPlayer",
          "wrPlayerID" as "playerId",
          "wrIsAutoCancel" as "isAutoCancel",
          "wrAutoOpenType" as "autoOpenType", 
          "wrAutoOpen" as "autoOpen",
          "wrAutoCloseType" as "autoCloseType",
          "wrBeforeAutoClose" as "beforeAutoClose",
          "wrAutoSuspendType" as "autoSuspendType",
          "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
          "wrIsBallStart" as "isBallStart",
          "wrIsAutoResultSet" as "isAutoResultSet",
          "wrAutoResultType" as "autoResultType",
          "wrAutoResultafterBall" as "autoResultafterBall",	
          "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
          "wrAfterWicketNotCreated" as "afterWicketNotCreated",
          tem."wrIsActive" as "isActive",	
          "wrIsAllow" as "isAllow",
          "wrCloseTime" as "closeTime",
          "wrOpenTime" as "openTime",
          "wrSettledTime" as "settledTime",
          "wrResult" as "result",
          "wrIsResult" as "isResult",
          "wrData" as "data",
          tem."wrLastUpdate" as "lastUpdate",
          tem."wrIsSendData" as "isSendData",
          tem."wrActionType" as "actionType",
          tem."wrMarketTemplateId" as "marketTemplateId",
          tem."wrMarketTypeId" as "marketTypeId",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tem."wrCreateRefId" as "createRefId",
          tem."wrOpenRefId" as "openRefId",
          tem."wrCreateType" as "createType",
          tem."wrCreate" as "create",
          tem."wrTemplateType" as "templateType",
          tem."wrDelay" as "delay",
          tem."wrLineRatio" as "lineRatio",
          tem."wrRateSource" as "rateSource",
          tem."wrRateSourceRefID" as "rateSourceRefID",
          tem."wrLineType" as "lineType",
          tem."wrDefaultBackSize" as "defaultBackSize",
          tem."wrDefaultLaySize" as "defaultLaySize",
          tem."wrAfterSuspendTime" as "afterSuspendTime",
          tem."wrAfterCloseTime" as "afterCloseTime",
          tem."wrRateDiff" as "rateDiff",
          tem."wrPredefinedValue" as "predefinedValue",
          tem."wrWicketNo" as "wicketNo",
          tem."wrCreatedBy" as "createdBy",
          tem."wrFavRatio" as "favRatio",
          COALESCE(runner_data."runners", '[]') as "runners"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
      LEFT JOIN LATERAL (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'runnerId', tmr."wrRunnerId",
                  'runner', tmr."wrRunner",
                  'line', tmr."wrLine",
                  'overRate', tmr."wrOverRate",
                  'underRate', tmr."wrUnderRate",
                  'selectionId', tmr."wrSelectionId",
                  'selectionStatus', tmr."wrSelectionStatus",
                  'order', tmr."wrOrder",
                  'backPrice', tmr."wrBackPrice",
                  'layPrice', tmr."wrLayPrice",
                  'backSize', tmr."wrBackSize",
                  'laySize', tmr."wrLaySize",
                  'teamId', tmr."wrTeamId"
                )
                ORDER BY tmr."wrRunnerId" ASC
              ) AS "runners"
              FROM "tblMarketRunners" tmr
              WHERE tmr."wrEventMarketId" = tem."wrID" AND tmr."wrIsDeleted" = false
            ) runner_data ON true
            WHERE tem."wrMarketTypeId" = $1 AND "wrMarketTypeCategoryId" = $2 AND tem."wrCommentaryId" = $3 AND tem."wrStatus" NOT IN ($4, $5)
      GROUP BY tem."wrID",runner_data."runners"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.marketTypeId, data.marketTypeCategoryId, data.commentaryId, EventMarketStatus.Settled, EventMarketStatus.Cancel],
      }
    );

    return result.length > 0 ? result : null;
  
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getManualMarketDataQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getExtraMarketQuery = async (data,request, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT
          "wrID" AS "eventMarketId",
          tem."wrCommentaryId" AS "commentaryId",
          tem."wrEventRefID" AS "eventRefId",
          "wrTeamID" AS "teamId",
          "wrInningsID" AS "inningsId",
          "wrMarketName" AS "marketName",
          "wrMargin" AS "margin",
          "wrStatus" AS "status",
          "wrIsPredefineMarket" as "isPredefineMarket",
          "wrIsOver" as "isOver",
          "wrOver" as "over",
          "wrIsPlayer" as "isPlayer",
          "wrPlayerID" as "playerId",
          "wrIsAutoCancel" as "isAutoCancel",
          "wrAutoOpenType" as "autoOpenType", 
          "wrAutoOpen" as "autoOpen",
          "wrAutoCloseType" as "autoCloseType",
          "wrBeforeAutoClose" as "beforeAutoClose",
          "wrAutoSuspendType" as "autoSuspendType",
          "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
          "wrIsBallStart" as "isBallStart",
          "wrIsAutoResultSet" as "isAutoResultSet",
          "wrAutoResultType" as "autoResultType",
          "wrAutoResultafterBall" as "autoResultafterBall",	
          "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
          "wrAfterWicketNotCreated" as "afterWicketNotCreated",
          tem."wrIsActive" as "isActive",	
          "wrIsAllow" as "isAllow",
          "wrCloseTime" as "closeTime",
          "wrOpenTime" as "openTime",
          "wrSettledTime" as "settledTime",
          "wrResult" as "result",
          "wrIsResult" as "isResult",
          "wrData" as "data",
          tem."wrLastUpdate" as "lastUpdate",
          tem."wrIsSendData" as "isSendData",
          tem."wrActionType" as "actionType",
          tem."wrMarketTemplateId" as "marketTemplateId",
          tem."wrMarketTypeId" as "marketTypeId",
          tem."wrMarketTypeCategoryId" as "marketTypeCategoryId",
          tem."wrCreateRefId" as "createRefId",
          tem."wrOpenRefId" as "openRefId",
          tem."wrCreateType" as "createType",
          tem."wrCreate" as "create",
          tem."wrTemplateType" as "templateType",
          tem."wrDelay" as "delay",
          tem."wrLineRatio" as "lineRatio",
          tem."wrRateSource" as "rateSource",
          tem."wrRateSourceRefID" as "rateSourceRefID",
          tem."wrLineType" as "lineType",
          tem."wrDefaultBackSize" as "defaultBackSize",
          tem."wrDefaultLaySize" as "defaultLaySize",
          tem."wrAfterSuspendTime" as "afterSuspendTime",
          tem."wrAfterCloseTime" as "afterCloseTime",
          tem."wrRateDiff" as "rateDiff",
          tem."wrCreatedBy" as "createdBy",
          tem."wrPredefinedValue" as "predefinedValue",
          tem."wrWicketNo" as "wicketNo",
          tem."wrFavRatio" as "favRatio",
          COALESCE(runner_data."runners", '[]') as "runners"
      FROM "tblEventMarkets" tem
      LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"
      LEFT JOIN LATERAL (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'runnerId', tmr."wrRunnerId",
                  'runner', tmr."wrRunner",
                  'line', tmr."wrLine",
                  'overRate', tmr."wrOverRate",
                  'underRate', tmr."wrUnderRate",
                  'selectionId', tmr."wrSelectionId",
                  'selectionStatus', tmr."wrSelectionStatus",
                  'order', tmr."wrOrder",
                  'backPrice', tmr."wrBackPrice",
                  'layPrice', tmr."wrLayPrice",
                  'backSize', tmr."wrBackSize",
                  'laySize', tmr."wrLaySize",
                  'teamId', tmr."wrTeamId"
                )
                ORDER BY tmr."wrRunnerId" ASC
              ) AS "runners"
              FROM "tblMarketRunners" tmr
              WHERE tmr."wrEventMarketId" = tem."wrID" AND tmr."wrIsDeleted" = false
            ) runner_data ON true
            WHERE  tem."wrEventRefID" = $1 AND tem."wrRateSource" = 2 AND tem."wrIsDeleted" = false
      GROUP BY tem."wrID",runner_data."runners"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.eventRefId],
      }
    );

    return result.length > 0 ? result : null;
  
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getExtraMarketQuery",
      request
    );
    throw new Error(error.message);
  }
}
const saveManualMarketQuery = async (data, request, fastify) => {
  try {
    const mar = await fastify.db.query(
      `
        INSERT INTO "tblEventMarkets" (
          "wrCommentaryId",
          "wrEventRefID",
          "wrInningsID",
          "wrMarketName",
          "wrStatus",
          "wrIsPredefineMarket",
          "wrIsOver",
          "wrOver",
          "wrIsPlayer",
          "wrIsAutoCancel",
          "wrIsBallStart",
          "wrIsActive",
          "wrIsAllow",
          "wrMarketTypeId",
          "wrMarketTypeCategoryId",
          "wrDelay",
          "wrLineRatio",
          "wrRateSource",
          "wrRateSourceRefID",
          "wrDefaultBackSize",
          "wrDefaultLaySize",
          "wrRateDiff",
          "wrLastUpdate",
          "wrFavRatio"
      )
      VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22 , now()::timestamp,$23
      )
        RETURNING "wrID" as "eventMarketId";
      `,
      {
        bind: [
          data.commentaryId,
          data.eventRefId,
          data.inningsId,
          data.marketName,
          EventMarketStatus.Inactive,
          false,
          false,
          0,
          false,
          false,
          true,
          data.isActive,
          data.isAllow,
          data.marketTypeId,
          data.marketTypeCategoryId,
          data.delay,
          data.lineRatio,
          1,
          data.rateSourceRefID,
          10000,
          10000,
          data.rateDiff,
          data.favRatio || null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    )

    await fastify.db.query(
      `
        INSERT INTO "tblMarketRunners" (
          "wrEventMarketId",
          "wrRunner",
          "wrSelectionId",
          "wrSelectionStatus",
          "wrTeamId"
        )
        VALUES
        ${
          data.runners
            .map(
              (item) =>
                `(${mar[0].eventMarketId}, '${item.name}', ${item.selectionId}, ${EventMarketStatus.Inactive}, ${item.teamId || 'NULL'})`
            )
            .join(',')
        }
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    let wrData =  await fastify.db.query(
      `SELECT 
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
      GROUP BY tem."wrID"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [mar[0].eventMarketId],
      }
    )
    const dataToStore = wrData[0];

    const query4 = `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`;

    await fastify.db.query(query4, {
      bind: [dataToStore, mar[0].eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    let whereCondition = ` tem."wrID" = ${mar[0].eventMarketId}`
    const manualMarketData = await getAllEventMarketsV2Query(fastify, whereCondition)

    marketDataLogger(
      {
        eventMarketId: mar[0].eventMarketId,
        commentaryId: data.commentaryId,
        dataTosave: typeof (dataToStore) === "string" ? JSON.parse(dataToStore) : dataToStore,
        updateType: MarketUpdateType.marketInitilization,
        lineDiff: 0,
        isSendData: true
      },
      request,
      fastify
    ).catch((err) => {
      console.log("saveManualMarketQuery market data logger console:", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/eventMarket.js/saveManualMarketQuery",
        request
      );
    });
    // return true;
    return manualMarketData[0];

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/saveManualMarketQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const upManualMarketQuery = async (data, request, fastify) => {
  try {
  //   const mar = await fastify.db.query(
  //     `
  //       UPDATE "tblEventMarkets" SET
  //         "wrStatus" = $1,
  //         "wrIsActive" = $2,
  //         "wrIsAllow" = $3,
  //         "wrMargin" = $4,
  //         "wrRateDiff" = $5,
  //         "wrLastUpdate" = now()::timestamp,
  //         "wrPredefinedValue" = $7
  //       WHERE "wrID" = $6
  //     `,
  //     {
  //       bind: [
  //         data.status,
  //         data.isActive,
  //         data.isAllow,
  //         data.margin,
  //         data.rateDiff,
  //         data.eventMarketId,
  //         data.predefinedValue
  //       ],
  //       type: fastify.db.QueryTypes.SELECT,
  //     }
  //   )
  //   for (let run of data.runners) {
  //     await fastify.db.query(
  //       `
  //         UPDATE "tblMarketRunners" SET
  //           "wrSelectionStatus" = $1,
  //           "wrLine" = $2,
  //           "wrOverRate" = $3,
  //           "wrUnderRate" = $4,
  //           "wrBackPrice" = $5,
  //           "wrLayPrice" = $6,
  //           "wrBackSize" = $7,
  //           "wrLaySize" = $8
  //         WHERE "wrRunnerId" = $9
  //       `,
  //       {
  //         bind: [
  //           data.status,
  //           run.line,
  //           run.overRate,
  //           run.underRate,
  //           run.backPrice,
  //           run.layPrice,
  //           run.backSize,
  //           run.laySize,
  //           run.runnerId
  //         ],
  //         type: fastify.db.QueryTypes.SELECT,
  //       }
  //     )
  //   }
  //   // create wrData
  //  let dataToStore = await fastify.db.query(
  //     `SELECT 
  //         tem."wrID" as "marketId",
  //         tem."wrEventRefID" as "eventId",
  //         tem."wrMarketName" as "marketName",
  //         tem."wrStatus" as "status",
  //         tem."wrIsActive" as "isActive",
  //         tem."wrIsAllow" as "isAllow",
  //         json_agg(
  //             json_build_object(
  //                 'runnerId' , tmr."wrRunnerId",
  //                 'runner', tmr."wrRunner",
  //                 'status' , tmr."wrSelectionStatus",
  //                 'line', tmr."wrLine",
  //                 'overRate', tmr."wrOverRate",
  //                 'underRate', tmr."wrUnderRate",
  //                 'backPrice', tmr."wrBackPrice",
  //                 'layPrice', tmr."wrLayPrice",
  //                 'backSize', tmr."wrBackSize",
  //                 'laySize', tmr."wrLaySize"
  //             )
  //         ) as "runner"
  //     FROM "tblEventMarkets" tem
  //     LEFT JOIN "tblMarketRunners" tmr ON tmr."wrEventMarketId" = tem."wrID"
  //     WHERE tem."wrID" = $1 AND tem."wrIsDeleted" = false AND tmr."wrIsDeleted" = false
  //     GROUP BY tem."wrID"`,
  //     {
  //       type: fastify.db.QueryTypes.SELECT,
  //       bind: [data.eventMarketId],
  //     }
  //   )
  //   dataToStore = dataToStore[0];
  //   await fastify.db.query(
  //     `UPDATE "tblEventMarkets" SET "wrData" = $1,"wrLastUpdate" = now()::timestamp WHERE "wrID" = $2`,
  //     {
  //       bind: [dataToStore, data.eventMarketId],
  //       type: fastify.db.QueryTypes.SELECT,
  //     }
  //   );
    const result = await fastify.db.query(
      `
        CALL proc_manual_market_update($1, $2)
      `,
      {
        bind: [
          JSON.stringify(data) ? JSON.stringify(data) : null,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    result[0].updated_row.forEach(async (item) => {
      const result = await fastify.db.query(
        `
        SELECT "wrCommentaryId" AS "commentaryId"
        FROM "tblEventMarkets"
        WHERE "wrID" = ${item.marketId}`
      );
      

      marketDataLogger(
        {
          eventMarketId: item.marketId,
          commentaryId: result[0][0].commentaryId,
          dataTosave: typeof item === "string" ? JSON.parse(item) : item,
          updateType: MarketUpdateType.marketUpdateRate,
          lineDiff: 0,
          isSendData: true
        },
        request,
        fastify
      ).catch((err) => {
        console.log("upManualMarketQuery market data logger console:", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/eventMarket.js/upManualMarketQuery",
          request
        );
      });
    })
    // return true;
    return result[0];

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upManualMarketQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const openMarketScoketConnectionDataQuery = async (commentaryId, fastify) => {
  try {  
    const query = `SELECT 
        tem."wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tem."wrTeamID" AS "teamId",
        tt."wrTeamName" AS "teamName",
        tem."wrInningsID" AS "inningsId",
        tem."wrMarketName" AS "marketName",
        tem."wrMargin" AS "margin",
        tem."wrStatus" AS "status",
        tem."wrIsPredefineMarket" AS "isPredefineMarket",
        tem."wrIsOver" AS "isOver",
        tem."wrOver" AS "over",
        tem."wrIsPlayer" AS "isPlayer",
        tem."wrPlayerID" AS "playerId",
        tem."wrIsAutoCancel" AS "isAutoCancel",
        tem."wrAutoOpenType" AS "autoOpenType",
        tem."wrAutoOpen" AS "autoOpen",
        tem."wrAutoCloseType" AS "autoCloseType",
        tem."wrBeforeAutoClose" AS "beforeAutoClose",
        tem."wrAutoSuspendType" AS "autoSuspendType",
        tem."wrBeforeAutoSuspend" AS "beforeAutoSuspend",
        tem."wrIsBallStart" AS "isBallStart",
        tem."wrIsAutoResultSet" AS "isAutoResultSet",
        tem."wrAutoResultType" AS "autoResultType",
        tem."wrAutoResultafterBall" AS "autoResultafterBall",
        tem."wrAfterWicketAutoSuspend" AS "afterWicketAutoSuspend",
        tem."wrAfterWicketNotCreated" AS "afterWicketNotCreated",
        tem."wrIsActive" AS "isActive",
        tem."wrIsAllow" AS "isAllow",
        tem."wrOpenTime" AS "openTime",
        tem."wrData" AS "data",
        tem."wrLastUpdate" AS "lastUpdate",
        tem."wrIsSendData" AS "isSendData",
        tem."wrActionType" AS "actionType",
        tem."wrMarketTemplateId" AS "marketTemplateId",
        tem."wrMarketTypeId" AS "marketTypeId",
        tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
        tem."wrCreateRefId" AS "createRefId",
        tem."wrOpenRefId" AS "openRefId",
        tem."wrCreateType" AS "createType",
        tem."wrCreate" AS "create",
        tem."wrTemplateType" AS "templateType",
        tem."wrLineRatio" AS "lineRatio",
        tem."wrOpenOdds" AS "openOdds",
        tem."wrMinOdds" AS "minOdds",
        tem."wrMaxOdds" AS "maxOdds",
        tem."wrRateSource" AS "rateSource",
        tem."wrPredefinedValue" AS "predefinedValue",
        tem."wrAfterSuspendTime" AS "afterSuspendTime",
        tem."wrAfterCloseTime" AS "afterCloseTime",
        tem."wrLineType" AS "lineType",
        tem."wrDefaultBackSize" AS "defaultBackSize",
        tem."wrDefaultLaySize" AS "defaultLaySize",
        tc."wrEventDate" AS "eventDate",
        tc."wrEventName" AS "eventName",
        tet."wrEventType" AS "eventTypeName",
        tcom."wrCompetition" AS "competitionName",
        tem."wrDefaultIsSendData" AS "defaultIsSendData",
        tem."wrRateDiff" AS "rateDiff",
        tem."wrCreatedBy" AS "createdBy",
        tem."wrIsInningRun" AS "isInningRun",
        COALESCE(runner_data."runners", '[]') AS "runners"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = tem."wrTeamID"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'runnerId', tmr."wrRunnerId",
                'runner', tmr."wrRunner",
                'line', tmr."wrLine",
                'overRate', tmr."wrOverRate",
                'underRate', tmr."wrUnderRate",
                'selectionId', tmr."wrSelectionId",
                'selectionStatus', tmr."wrSelectionStatus",
                'order', tmr."wrOrder",
                'backPrice', tmr."wrBackPrice",
                'layPrice', tmr."wrLayPrice",
                'backSize', tmr."wrBackSize",
                'laySize', tmr."wrLaySize",
                'teamId', tmr."wrTeamId"
            )
        ) AS "runners"
        FROM "tblMarketRunners" tmr
        WHERE tmr."wrEventMarketId" = tem."wrID"
    ) runner_data ON true
    WHERE tem."wrCommentaryId" = $1
    AND tem."wrIsInningRun" = true
    AND tem."wrStatus" NOT IN ($2, $3, $4)
    AND tem."wrRateSource" = 1 
    AND tem."wrIsDeleted" = false
    GROUP BY 
        tem."wrID",
        tt."wrTeamName", 
        tc."wrEventDate",
        tc."wrEventName",
        tet."wrEventType",
        tcom."wrCompetition",
        runner_data."runners";
    `;

    return await fastify.db.query(query, {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
            commentaryId,
            EventMarketStatus.Close,
            EventMarketStatus.Settled,
            EventMarketStatus.Cancel
        ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/openMarketScoketConnectionDataQuery",
      null
    );
    throw new Error(error.message);
  }
};
const upIsInningRunMarketQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
        UPDATE "tblEventMarkets" SET
          "wrIsInningRun" = $1,
          "wrLastUpdate" = now()
        WHERE "wrID" = $2
        RETURNING 
            "wrID" AS "eventMarketId",
            "wrIsInningRun" AS "isInningRun",
            "wrLastUpdate" AS "lastUpdate"
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.isInningRun,
        data.eventMarketId
      ]
    })

    // return true;
    return result[0];

  } catch (error) {
    console.log(error)
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/upIsInningRunMarketQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const getTargetQyery = async (data, request, fastify) => {
  try {
    let result = await fastify.db.query(
      `
        SELECT "wrResult" as "target"
        FROM "tblEventMarkets"
        WHERE "wrCommentaryId" = $1
        AND "wrIsInningRun" = $2
        AND "wrStatus" = $3
        AND "wrIsDeleted" = false
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.commentaryId,
        true,
        EventMarketStatus.Settled
      ]
    })

    return result[0] ? result[0].target + 1: 0;
  } catch (error) {
    console.log(error)
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getTargetQyery",
      request
    );
    throw new Error(error.message);
    
  }
}
const closeMarketByATQuery1 = async (data, request, fastify) => {
  try {
    const query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1 , "wrCloseTime" = now()::timestamp , "wrIsSendData" = true,
             "wrData" = jsonb_set(
              jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
              '{runner}', (
                SELECT jsonb_agg(
                  jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
                )
                FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
              ),
              false
              )::json,
              "wrLastUpdate" = now()::timestamp
            WHERE "wrCommentaryId" = $2
            AND "wrActionType" IN ($3,$4)
            AND "wrStatus" NOT IN ($5,$6,$7)
            AND "wrTeamID" = ANY($8)
            AND "wrInningsID" = $9
            RETURNING "wrID" as "eventMarketId",
            "wrData" as "data"
        `;

    let result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Close,
        data.commentaryId,
        data.closeAT,
        data.cnAT,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        data.teamId,
        data.inningsId
      ],
      type: fastify.db.QueryTypes.SELECT,
    });

    // close the market runner for this market
    const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
    await fastify.db.query(query2, {
      bind: [EventMarketStatus.Close, result.map((e) => e.eventMarketId)],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/closeMarketByATQuery1",
      request
    );
    throw new Error(error.message);
  }
};
const cancelMarketByATQuery1 = async (data, request, fastify) => {
  try {
    let query = `
            UPDATE "tblEventMarkets"
            SET "wrStatus" = $1,
            "wrSettledTime" = now()::timestamp,
            "wrData" = jsonb_set(
              jsonb_set("wrData"::jsonb, '{status}', '6'::jsonb, false),
              '{runner}', (
                SELECT jsonb_agg(
                  jsonb_set(runner_elem, '{status}', '6'::jsonb, false)
                )
                FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
              ),
              false
              )::json,
            "wrLastUpdate" = now()::timestamp,
            "wrIsSendData" = true
            WHERE
             "wrCommentaryId" = $2
            AND "wrActionType" = $3
            AND "wrStatus" NOT IN ($4,$5)
            AND "wrTeamID" = ANY($6)
            AND "wrInningsID" = $7
            RETURNING "wrID" as "eventMarketId",
            "wrData" as "data"
        `;
    const result = await fastify.db.query(query, {
      bind: [
        EventMarketStatus.Cancel,
        data.commentaryId,
        data.actionType,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
        data.teamId,
        data.inningsId
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
        // cancel the market runner for this market
        const query2 = `UPDATE "tblMarketRunners" SET "wrSelectionStatus" = $1 WHERE "wrEventMarketId" = ANY($2)`;
        await fastify.db.query(query2, {
          bind: [EventMarketStatus.Cancel, result.map((e) => e.eventMarketId)],
          type: fastify.db.QueryTypes.SELECT,
        });
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/cancelEventMarketByTeamIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const getMnMarketByCId = async (data, fastify ,request = null) => {
  try {
    const { commentaryId } = data;

    const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runnerName",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "status",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketRunners"
            WHERE "wrIsDeleted" = false
            ORDER BY "wrRunnerId" ASC
        )
        SELECT
            "wrID" AS "marketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventId",
            tem."wrTeamID" AS "teamId",
            tem."wrMarketTypeCategoryId" AS "marketTypeCategoryId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrInningsID" as "inningsId",
            "wrOver" as "over",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrIsSendData" as "isSendData",
            tem."wrLineRatio" as "lineRatio",
            tem."wrMarketTypeId" as "marketTypeId",
            tem."wrLineType" as "lineType", 
            tem."wrRateDiff" as "rateDiff",
            tem."wrIsInningRun" as "isInningRun",
            tem."wrPredefinedValue" as "predefinedValue",
            (
                SELECT json_agg(
                  json_build_object(
                      'runnerId', "runnerId",
                      'runnerName' , "runnerName",
                      'line', "line",
                      'overRate', "overRate",
                      'underRate', "underRate",
                      'status', "status",
                      'backPrice', "backPrice",
                      'layPrice', "layPrice",
                      'backSize', "backSize",
                      'laySize', "laySize"
                  )
              )
              FROM "MarketRunners_CTE"
              WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "runner"
        FROM "tblEventMarkets" tem
        WHERE tem."wrCommentaryId" = $1
        AND tem."wrIsInningRun" = true
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        AND tem."wrIsDeleted" = false

        `;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        commentaryId,
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel
      ],
    });
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableEventmarket.js/getMnMarketByCId",
      null
    );
    throw new Error(error.message);
  }
};
module.exports = {
  getAllEventMarketsV2Query,
  getAllEventMarketsQuery,
  createManyEventMarketQuery,
  deleteEventMarketQuery,
  changeIsActiveEventMarketQuery,
  changeIsAllowEventMarketQuery,
  changeIsResultEventMarketQuery,
  getMarketListByCIdQuery,
  updateEventMarketRateQuery,
  changeMarketCancelQuery,
  changeMarketResultQuery,
  changeMarketCloseQuery,
  suspendEventMarketQuery,
  closeEventMarketByTeamIdQuery,
  getMarketLogsByCIdQuery,
  cancelEventMarketByTeamIdQuery,
  upsertEventMarketSPQuery,
  getEventMarketByIdsQuery,
  setDelayEventMarketQuery,
  getDataLogsByMarketQuery,
  getStatusLogsByMarketQuery,
  getEventMarketRatioQuery,
  setLineRatioEventMarketQuery,
  getMarketDataByCIdQuery,
  getMarketsByCIdQuery,
  createEventMarketMaunalQuery,
  updateEventMarketMaunalQuery,
  createOrUpdateEventRunnerMarketManualQuery,
  closeEventMarketByCIdQuery,
  updateEventMarketRunnerMaunalQuery,
  UpdateEventMarketByCIdFromSocketQuery,
  UpdateResulOrApproveEventMarketQuery,
  updateComInMarketQuery,
  getMarketListWithCategoryNameByCIdQuery,
  getMarketsByCategoryQuery,
  getMarketByGraphByRefIdQuery,
  updateMarketStatusFromSignalRQuery,
  closeMarketQuery,
  cancelMarketQuery,
  getMarketsByComIdQuery,
  getAllEventMarketsAndRunnersQuery,
  getAllRateSourceEventMarketQuery,
  getEventMarketsQuery,
  cancelSettledMarketQuery,
  getAllEventMarketsQueryV1,
  getEventMarketQueryV1,
  upsertEventMarketSPQueryV1,
  updateEventMarketRateQueryV1,
  getEventMarketByIdsQueryV1,
  getMarketListByCIdQueryV1,
  getMarketWithRunnerQuery,
  updateResultMultiMarketQuery,
  closeMarketByATQuery,
  cancelMarketByATQuery,
  getEventMarketRunnersQuery,
  updateEventMarketCloseSuspendTimeQuery,
  updateEventMarketCloseQuery,
  closeEventMarketsQuery,
  cancelEventMarketsQuery,
  getOpenMarketByCIdQuery,
  suspendMarketQuery,
  getMarCountByComQuery,
  insertTimeLogs,
  updateTimeLogs,
  updatePredefinedQuery,
  playerMarketQuery,
  boundaryMarketQuery,
  pbfMarketQuery,
  getExtrenalMarketQuery,
  getEventMarketsByCommId,
  socketMarketRunnerDataQuery,
  getManualMarketDataQuery,
  saveManualMarketQuery,
  getExtraMarketQuery,
  upManualMarketQuery,
  getMarketByIdQuery,
  openMarketScoketConnectionDataQuery,
  upIsInningRunMarketQuery,
  getTargetQyery,
  cancelMarketByATQuery1,
  closeMarketByATQuery1,
  getMnMarketByCId
}


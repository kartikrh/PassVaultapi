const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrCommentaryId" as "commentaryId",
    tc."wrMatchTypeId" as "matchTypeId",
    mt."wrMatchType" AS "matchType",
    tc."wrEventTypeId" as "eventTypeId",
    tet."wrEventType" as "eventType",
    tc."wrTeam1Id" as "team1Id",
    tc."wrTeam2Id" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    tc."wrCompetitionId" as "competitionId",
	  co."wrCompetition" as "competition",
    tc."wrEventId" as "eventId",
    "wrEventDate" as "eventDate",
    "wrEventName" as "eventName",
    "wrEventRefId" as "eventRefId",
    "wrLocation" as "location",
    "wrWeather" as "weather",
    "wrPitch" as "pitch",
    "wrHomeSideTeam" as "homeSideTeam",
    "wrTossWonBy" as "tossWonBy",
    "wrChoseTo" as "choseTo",
    "wrWinnerId" as "winnerId",
    "wrWinnerName" as "winnerName",
    "wrIsClientShow" as "isClientShow",
    "wrDisplayStatus" as "displayStatus",
    "wrRmk" as "rmk",
    "wrCommentaryUserId" as "commentaryUserId",
    "wrCommentaryStatus" as "commentaryStatus",
    "wrUpdateTime" as "updateTime",
    "wrIsMatchDraw" as "isMatchDraw",
    "wrTarget" as "target",
    "wrMarketID" as "marketId",
    "wrTpId" as "tpId",
    "isSignalROn" as "isSignalROn",
    "isMatchTypeUpdated" as "isMatchTypeUpdated",
    "wrCurrentInnings" as "currentInnings",
    "wrSystemPlayerCount" as "systemPlayerCount",
    "wrIsPlayersShow" as "isPlayersShow",
    "wrIsPredictMarket" as "isPredictMarket",
    tc."wrIsActive"  as "isActive",
    "wrDelay" as "delay",
    "wrLineRatio" as "lineRatio",
    tc."wrCommentaryResult" as "result",
    tc."wrCommentaryCloseTime" as "commentaryCloseTime",
    tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
    tu."WrUserName" as "createdBy",
    tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
    mt2."wrMatchType" AS "historyMatchType",
    tc."wrIsCountInPoint" as "isCountInPoint",
    "wrShotType" as "shotType",
    "wrIsWheelShow" as "isWheelShow"
    from "tblCommentaries" tc
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
    LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId"
    LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId"
	  LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
    LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
    WHERE (tc."wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
    AND tc."wrCommentaryStatus" = 4 AND tc."wrIsDelete" = false)
    OR tc."wrCommentaryStatus" != 4
    AND tc."wrIsDelete" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const getCommentariesDataQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrCommentaryId" as "commentaryId",
    tc."wrMatchTypeId" as "matchTypeId",
    mt."wrMatchType" AS "matchType",
    tc."wrEventTypeId" as "eventTypeId",
    tet."wrEventType" as "eventType",
    tc."wrTeam1Id" as "team1Id",
    tc."wrTeam2Id" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    tc."wrCompetitionId" as "competitionId",
	  co."wrCompetition" as "competition",
    tc."wrEventId" as "eventId",
    "wrEventDate" as "eventDate",
    "wrEventName" as "eventName",
    "wrEventRefId" as "eventRefId",
    "wrLocation" as "location",
    "wrWeather" as "weather",
    "wrPitch" as "pitch",
    "wrHomeSideTeam" as "homeSideTeam",
    "wrTossWonBy" as "tossWonBy",
    "wrChoseTo" as "choseTo",
    "wrWinnerId" as "winnerId",
    "wrWinnerName" as "winnerName",
    "wrIsClientShow" as "isClientShow",
    "wrDisplayStatus" as "displayStatus",
    "wrRmk" as "rmk",
    "wrCommentaryUserId" as "commentaryUserId",
    "wrCommentaryStatus" as "commentaryStatus",
    "wrUpdateTime" as "updateTime",
    "wrIsMatchDraw" as "isMatchDraw",
    "wrTarget" as "target",
    "wrMarketID" as "marketId",
    "wrTpId" as "tpId",
    "isSignalROn" as "isSignalROn",
    "isMatchTypeUpdated" as "isMatchTypeUpdated",
    "wrCurrentInnings" as "currentInnings",
    "wrSystemPlayerCount" as "systemPlayerCount",
    "wrIsPlayersShow" as "isPlayersShow",
    "wrIsPredictMarket" as "isPredictMarket",
    tc."wrIsActive"  as "isActive",
    "wrDelay" as "delay",
    "wrLineRatio" as "lineRatio",
    tc."wrCommentaryResult" as "result",
    tc."wrCommentaryCloseTime" as "commentaryCloseTime",
    tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
    tu."WrUserName" as "createdBy",
    tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
    mt2."wrMatchType" AS "historyMatchType",
    tc."wrIsCountInPoint" as "isCountInPoint",
    "wrShotType" as "shotType",
    "wrIsWheelShow" as "isWheelShow"
    from "tblCommentaries" tc
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
    LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId"
    LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId"
	LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
  LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
  WHERE "wrIsDelete" = false AND co."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertCommentaryQuery = async (request, fastify) => {
  try {
    const data = request.body;
    const result = await fastify.db.query(
      `
      with insert_data as(
        insert into "tblCommentaries" ("wrEventTypeId","wrMatchTypeId","wrCompetitionId","wrEventId",
        "wrEventDate","wrEventName","wrEventRefId","wrTeam1Id","wrTeam2Id","wrLocation","wrWeather","wrPitch","wrDisplayStatus","wrTarget","wrMarketID","wrTpId","isSignalROn","isMatchTypeUpdated" , "wrCreatedBy" , "wrCreatedDate","wrCommentaryStatus","wrCurrentInnings", "wrSystemPlayerCount","wrIsPredictMarket",
        "wrDelay", "wrIsActive", "wrIsClientShow","wrIsTeamPredictionOn", "wrHistoryMatchTypeId", "wrIsCountInPoint") values (
          $1,
          $2,
          $3,
          $4,
          $5,$6,$7,
          $8,
          $9,
          $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now(),1,
          1,
          $20,
          $21,
          $22,
          $23,
          $24,
          $25,
          $26,
          $27
        ) returning *         
      )

      select 
    "wrCommentaryId" as "commentaryId",
    tc."wrMatchTypeId" as "matchTypeId",
    mt."wrMatchType" AS "matchType",
    tc."wrEventTypeId" as "eventTypeId",
    tc."wrTeam1Id" as "team1Id",
    tc."wrTeam2Id" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    tc."wrCompetitionId" as "competitionId",
    co."wrCompetition" as "competition",
    tc."wrEventId" as "eventId",
    "wrEventDate" as "eventDate",
    "wrEventName" as "eventName",
    "wrEventRefId" as "eventRefId",
    "wrLocation" as "location",
    "wrWeather" as "weather",
    "wrPitch" as "pitch",
    tc."wrHomeSideTeam" as "homeSideTeam",
    tc."wrTossWonBy" as "tossWonBy",
    "wrChoseTo" as "choseTo",
    tc."wrWinnerId" as "winnerId",
    "wrWinnerName" as "winnerName",
    "wrIsClientShow" as "isClientShow",
    "wrDisplayStatus" as "displayStatus",
    "wrRmk" as "rmk",
    "wrCommentaryUserId" as "commentaryUserId",
    "wrCommentaryStatus" as "commentaryStatus",
    "wrUpdateTime" as "updateTime",
    "wrIsMatchDraw" as "isMatchDraw",
    "wrTarget" as "target",
    "wrMarketID" as "marketId",
    "wrTpId" as "tpId",
    "isSignalROn" as "isSignalROn",
    "isMatchTypeUpdated" as "isMatchTypeUpdated",
    "wrCurrentInnings" as "currentInnings",
    "wrSystemPlayerCount" as "systemPlayerCount",
    "wrIsPlayersShow" as "isPlayersShow",
    "wrIsPredictMarket" as "isPredictMarket",
    tc."wrIsActive"  as "isActive",
    tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
    tu."WrUserName" as "createdBy",
    "wrLineRatio" as "lineRatio",
    "wrDelay" as "delay",
    tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
    tc."wrIsCountInPoint" as "isCountInPoint",
    "wrShotType" as "shotType",
    "wrIsWheelShow" as "isWheelShow"
    from "insert_data" tc
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"  
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
    LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
    LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
      `,
      {
        
        bind: [
          data.eventTypeId || null,
          data.matchTypeId || null,
          data.competitionId || null,
          data.eventId || null,
          data.eventDate ? new Date(data.eventDate) : null,
          data.eventName || null,
          data.eventRefId.trim() || null,
          data.team1Id || null,
          data.team2Id || null,
          data.location || null,
          data.weather || null,
          data.pitch || null,
          "Toss Pending!!",
          null,
          data.marketId || null,
          data.tpId || null,
          data.isSignalROn || false,
          data.isMatchTypeUpdated || false,
          request.userTokenInfo.WrUserId,
          data.systemPlayerCount || null,
          data.isPredictMarket || false,
          data.delay || 0,
          data.isActive,
          data.isClientShow,
          true,
          data.matchTypeId || null,
          data.isCountInPoint
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertCommentaryTeams = async (request, fastify) => {
  
  try {
    const data = request.body;
    return await fastify.db.query(
      `
      insert into "tblCommentaryTeams" ("wrCommentaryId" , "wrTeamId","wrTeamCaptain","wrTeamKipper" , "wrShortName" , "wrTeamName","wrCurrentInnings","wrIsBattingComplete"
      , "wrTeamColor" , "wrBackgroundColor" , "wrTeamMaxOver", "wrDrsCount")
       values (
        $1,
        $2,
        $3,
        $4,
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = $2),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = $2),
        $8,
        false,
        (select "wrTeamColor" from "tblTeams" where "wrTeamId" = $2),
        (select "wrBackgroundColor" from "tblTeams" where "wrTeamId" = $2),
        $9,
        $10           
      )
      ,(
        $1,
        $5,
        $6,
        $7,
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = $5),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = $5),
        $8,
        false,
        (select "wrTeamColor" from "tblTeams" where "wrTeamId" = $5),
        (select "wrBackgroundColor" from "tblTeams" where "wrTeamId" = $5),
        $9,
        $10
      )
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.team1Id,
          data.team1Captain || null,
          data.team1Kipper || null,
          data.team2Id,
          data.team2Captain || null,
          data.team2Kipper || null,
          data.currentInnings,
          data.teamMaxOver || null,
          data.drsCount || 0,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertCommentaryPlayers = async (
  data,
  currentinning,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `
      WITH insert_data AS (
        insert into "tblCommentaryPlayers" ("wrCommentaryId" , "wrTeamId" , "wrPlayerId","wrPlayerName", "wrDisplayOrder","wrCurrentInnings",
        "wrBatsmanAverage", "wrBatsmanPreviousStrikeRate", "wrBowlerPreviousEconomy", "wrBowlerAverage")
        values (
          $1,
          $2,
          $3,
          (select "wrPlayerName" from "tblPlayers" where "wrPlayerId" = $3),
          $4,
          $5,
          COALESCE(
            (SELECT "wrAverage" FROM "tblPlayerBattingHistory" WHERE "wrPlayerId" = $3 AND "wrMatchTypeId" = $6),
            (SELECT "wrBatsmanAverage" FROM "tblPlayers" WHERE "wrPlayerId" = $3)
          ),
          (select "wrBatsmanStrikeRate" from "tblPlayers" where "wrPlayerId" =$3),
          COALESCE(
            (SELECT "wrEconomy" FROM "tblPlayerBowlingHistory" WHERE "wrPlayerId" = $3 AND "wrMatchTypeId" = $6),
            (SELECT "wrBowlerEconomy" FROM "tblPlayers" WHERE "wrPlayerId" = $3)
          ),
          (select "wrBowlerAverage" from "tblPlayers" where "wrPlayerId" =$3)
        )
        RETURNING *   
      ) 
      SELECT 
      "wrPlayerId" as "playerId", 
      "wrTeamId" as "teamId",
      "wrCommentaryId" as "commentaryId",
      "wrCommentaryPlayerId" as "commentaryPlayerId"
      FROM "insert_data"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.playerId,
          data.displayOrder,
          currentinning,
          data.matchTypeId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertCommentaryPlayersQuery = async (
  data,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `
      WITH insert_data AS (
        insert into "tblCommentaryPlayers" ("wrCommentaryId" , "wrTeamId" , "wrPlayerId","wrPlayerName", "wrDisplayOrder","wrCurrentInnings",
        "wrBatsmanAverage", "wrBatsmanPreviousStrikeRate", "wrBowlerPreviousEconomy", "wrBowlerAverage")
        values (
          $1,
          $2,
          $3,
          (select "wrPlayerName" from "tblPlayers" where "wrPlayerId" = $3),
          $4,
          $5,
          COALESCE(
            (SELECT "wrAverage" FROM "tblPlayerBattingHistory" WHERE "wrPlayerId" = $3 AND "wrMatchTypeId" = $6),
            (SELECT "wrBatsmanAverage" FROM "tblPlayers" WHERE "wrPlayerId" = $3)
          ),
          (select "wrBatsmanStrikeRate" from "tblPlayers" where "wrPlayerId" =$3),
          COALESCE(
            (SELECT "wrEconomy" FROM "tblPlayerBowlingHistory" WHERE "wrPlayerId" = $3 AND "wrMatchTypeId" = $6),
            (SELECT "wrBowlerEconomy" FROM "tblPlayers" WHERE "wrPlayerId" = $3)
          ),
          (select "wrBowlerAverage" from "tblPlayers" where "wrPlayerId" =$3)
        )
        RETURNING *   
      ) 
      SELECT 
      "wrPlayerId" as "playerId", 
      "wrTeamId" as "teamId",
      "wrCommentaryId" as "commentaryId",
      "wrCommentaryPlayerId" as "commentaryPlayerId"
      FROM "insert_data"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.playerId,
          data.displayOrder,
          data.currentInnings,
          data.matchTypeId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary.js/insertCommentaryPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};

const upsertCommentaryPlayers = async (
  data,
  currentinning,
  fastify,
  request
) => {
  try {
    const result = await fastify.db.query(
      `WITH upsert AS (
      UPDATE "tblCommentaryPlayers"
      SET
        "wrDisplayOrder" = $4
      WHERE
        "wrCommentaryId" = $1
        AND "wrTeamId" = $2
        AND "wrPlayerId" = $3
        AND "wrCurrentInnings" = $5
      RETURNING "wrCommentaryPlayerId" AS "commentaryPlayerId"
    )
    INSERT INTO "tblCommentaryPlayers" ("wrCommentaryId", "wrTeamId", "wrPlayerId", "wrPlayerName", "wrDisplayOrder", "wrCurrentInnings",
    "wrBatsmanAverage", "wrBatsmanPreviousStrikeRate", "wrBowlerPreviousEconomy", "wrBowlerAverage")
    SELECT
      $1,
      $2,
      $3,
      (SELECT "wrPlayerName" FROM "tblPlayers" WHERE "wrPlayerId" = $3),
      $4,
      $5,
      (SELECT "wrBatsmanAverage" FROM "tblPlayers" WHERE "wrPlayerId" = $3),
      (SELECT "wrBatsmanStrikeRate" FROM "tblPlayers" WHERE "wrPlayerId" = $3),
      (SELECT "wrBowlerEconomy" FROM "tblPlayers" WHERE "wrPlayerId" = $3),
      (SELECT "wrBowlerAverage" FROM "tblPlayers" WHERE "wrPlayerId" = $3)
    WHERE NOT EXISTS (SELECT 1 FROM upsert)
    RETURNING "wrCommentaryPlayerId" AS "commentaryPlayerId";
    
    
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.playerId,
          data.displayOrder,
          currentinning,
        ],
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/upsertCommentaryPlayers",
      request
    );
    throw new Error(error.message);
  }
};

const updateCommentaryQuery = async (request, fastify) => {
  try {
    const data = request.body;
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrEventTypeId" = $1,
      "wrMatchTypeId" =$2,
      "wrCompetitionId" = $3,
      "wrEventId" = $4,
      "wrEventDate" = $5,
      "wrEventName" = $6,
      "wrEventRefId" = $7,
      "wrTeam1Id" = $8,
      "wrTeam2Id" = $9,
      "wrLocation" = $10,
      "wrWeather" = $11,
      "wrPitch" = $12,
      "wrTarget" = $13 ,
      "isSignalROn" = $14,
      "isMatchTypeUpdated" = $15,
      "wrIsPredictMarket" = $17, 
      "wrModifyDate" = now(),
      "wrDelay"=$18,
      "wrIsActive" = $19,
      "wrIsClientShow" = $20,
      "wrIsCountInPoint" = $21
      where "wrCommentaryId" = $16 
      `,
      {
        bind: [
          data.eventTypeId || null,
          data.matchTypeId || null,
          data.competitionId || null,
          data.eventId || null,
          data.eventDate ? new Date(data.eventDate) : null,
          data.eventName || null,
          data.eventRefId.trim() || null,
          data.team1Id || null,
          data.team2Id || null,
          data.location || null,
          data.weather || null,
          data.pitch || null,
          data.target || null,
          data.isSignalROn,
          data.isMatchTypeUpdated || false,
          data.commentaryId,
          data.isPredictMarket,
          data.delay,
          data.isActive,
          data.isClientShow,
          data.isCountInPoint,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryTeams = async (request, fastify, data) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaryTeams" set
      "wrTeamCaptain" = $1,
      "wrTeamKipper" = $2,
      "wrShortName" = (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = $3),
      "wrTeamName" = (select "wrTeamName" from "tblTeams" where "wrTeamId" = $3),
      "wrCurrentInnings" = $5,
      "wrTeamBattingOrder" = $6
      where "wrCommentaryId" = $4 and "wrTeamId" = $3
      AND "wrCurrentInnings" = $5
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.teamCaptain,
          data.teamKipper,
          data.teamId,
          data.commentaryId,
          data.currentInnings,
          data.teamBattingOrder || null,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCommentaryPlayers = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `
      UPDATE "tblCommentaryPlayers" SET
        "wrIsDelete" = $1,
        "wrDeletedBy" = $2,
        "wrDeletedAt" = now()
      WHERE "wrCommentaryId" = $3
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [true, request.userTokenInfo.WrUserId, request.body.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteCommentaryPlayerById = async (data, request, fastify) => {
  try {
    // delete commentary player by id
    return await fastify.db.query(
      `UPDATE "tblCommentaryPlayers" SET
        "wrIsDelete" = $4,
        "wrDeletedAt" = now()
      where "wrPlayerId" = $1
      AND "wrCommentaryId" = $2
      AND "wrTeamId" = $3`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [data.playerId, data.commentaryId, data.teamId, true],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/deleteCommentaryPlayerById",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryPlayerById = async (data, request, fastify) => {
  try {
    // update commentary player by id
    return await fastify.db.query(
      `update "tblCommentaryPlayers"
      set "wrBatsmanAverage" = $1, 
      "wrBatsmanStrikeRate" = $2,
      "wrIsInPlayingEleven" = $3,
      "wrBoundary" = $7,
      "wrPlayerBallFaced" = $8
      where "wrPlayerId" = $4
      AND "wrCommentaryId" = $5
      AND "wrTeamId" = $6
      AND "wrCurrentInnings" = $9`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [
          data.batsmanAverage,
          data.batsmanStrikeRate,
          data.isInPlayingEleven,
          data.playerId,
          data.commentaryId,
          data.teamId,
          data.boundary || 0,
          data.playerBallFaced || 0,
          data.currentInnings,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryPlayerById",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentaryByIdQuery = async (request, fastify) => {
  try {
    const { commentaryId } = request.body;

    const result = await fastify.db.query(
      `
      select 
      "wrCommentaryId" as "commentaryId",
      tc."wrMatchTypeId" as "matchTypeId",
      mt."wrMatchType" AS "matchType",
      tc."wrEventTypeId" as "eventTypeId",
      tc."wrTeam1Id" as "team1Id",
      tc."wrTeam2Id"  as "team2Id",
      tt1."wrTeamName" as "team1Name",
      tt2."wrTeamName" as "team2Name",
      tc."wrCompetitionId" as "competitionId",
      co."wrCompetition" as "competition",
      tc."wrEventId" as "eventId",
      "wrEventDate" as "eventDate",
      "wrEventName" as "eventName",
      "wrEventRefId" as "eventRefId",
      "wrLocation" as "location",
      "wrWeather" as "weather",
      "wrPitch" as "pitch",
      tc."wrHomeSideTeam" as "homeSideTeam",
      tc."wrTossWonBy" as "tossWonBy",
      "wrChoseTo" as "choseTo",
      tc."wrWinnerId" as "winnerId",
      "wrWinnerName" as "winnerName",
      "wrIsClientShow" as "isClientShow",
      "wrDisplayStatus" as "displayStatus",
      "wrRmk" as "rmk",
      "wrCommentaryUserId" as "commentaryUserId",
    "wrCommentaryStatus" as "commentaryStatus",
      "wrUpdateTime" as "updateTime",
      "wrIsMatchDraw" as "isMatchDraw",
      "wrTarget" as "target",
      "wrMarketID" as "marketId",
      "wrTpId" as "tpId",
      "isSignalROn" as "isSignalROn",
      "isMatchTypeUpdated" as "isMatchTypeUpdated",
      "wrCurrentInnings" as "currentInnings",
      "wrSystemPlayerCount" as "systemPlayerCount",
      "wrIsPlayersShow" as "isPlayersShow",
      "wrIsPredictMarket" as "isPredictMarket",
      tc."wrIsActive"  as "isActive",
      "wrDelay" as "delay",
      tc."wrCommentaryResult" as "result",
      tc."wrCommentaryCloseTime" as "commentaryCloseTime",
      tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
      tu."WrUserName" as "createdBy",
      tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
      tc."wrLineRatio" as "lineRatio",
      tc."wrShotType" as "shotType",
      tc."wrIsWheelShow" as "isWheelShow",
      tc."wrIsCountInPoint" as "isCountInPoint"
      from "tblCommentaries" tc
      left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
      LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
      LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
      where "wrCommentaryId" = $1 and "wrIsDelete" = false
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/getConfigByIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentaryTeamsQuery = async (data, fastify, request) => {
  try {
    const { commentaryId, teamId } = data;

    const result = await fastify.db.query(
      `select 
      "wrTeamId" as "teamId",
      "wrTeamCaptain" as "teamCaptain",
      "wrTeamKipper" as "teamKipper",
      "wrTeamMaxOver" as "teamMaxOver",
      "wrDrsCount" as "drsCount"
      from "tblCommentaryTeams"
      where "wrCommentaryId" = $1 and "wrTeamId" = $2 and "wrIsDelete" = false
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId, teamId],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/getConfigByIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentaryPlayersQuery = async (data, fastify, request) => {
  try {
    const { commentaryId, teamId } = data;

    const result = await fastify.db.query(
      `
      select 
      "wrPlayerId" as "playerId",
      "wrDisplayOrder" as "displayOrder",
      "wrBatterOrder" as "batterOrder",
      "wrBowlerOrder" as "bowlerOrder",
      "wrPlayerName" as "playerName"
      from "tblCommentaryPlayers"
      where "wrCommentaryId" = $1 and "wrTeamId" = $2 and "wrIsDelete" = false
      order by "wrDisplayOrder"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId, teamId],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/getConfigByIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getPredictorLogsQuery = async (data, fastify, request) => {
  try {
    const { commentaryId } = data;

    const result = await fastify.db.query(
      `
      select * from "tblPredictorAPILogs"
      where "wrRequestBody" ->> 'commentary_id' = $1
      order by "wrId" desc
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getPredictorLogsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCommentryQuery = async (commentaryId, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      with delete_players as (
        UPDATE "tblCommentaryPlayers" SET 
          "wrIsDelete" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3
      ),
       delete_teams as (
        UPDATE "tblCommentaryTeams" SET
          "wrIsDelete" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3
      ),
      delete_overs as (
        UPDATE "tblOvers" SET
          "wrIsDelete" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3
      ),
      delete_ball_by_ball AS (
        UPDATE "tblCommentaryBallByBalls"
        SET "wrIsDeletedStatus" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3
      ),
      delete_partnership as (
        UPDATE "tblCommentaryPartnerships"
          SET "wrIsDelete" = $1,
            "wrDeletedBy" = $2,
            "wrIsActive" = $4,
            "wrDeletedAt" = now()
          WHERE "wrCommentaryId" = $3
      ),
      delete_wicket as (
        UPDATE "tblCommentaryWickets" SET
            "wrIsDeletedStatus" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3
      ),
      delete_com_log as (
        delete from "tblCommentaryLogs" where "wrCommentaryId" = $3
      ),
      delete_predict_logs as (
        delete from "tblPredictorAPILogs" where "wrCommentaryId" = $3
      ),
      delete_com_scoring_log as (
        delete from "tblComScoringLogs" where "wrCommentaryId" = $3
      )
      UPDATE "tblCommentaries"
        SET "wrIsDelete" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
        WHERE "wrCommentaryId" = $3;
      `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [true, request.userTokenInfo.WrUserId, commentaryId, false],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/deleteCommentryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteBallByBallCommentoriesQuery = async (id, request, fastify) => {
  try {
    return await fastify.db.query(
      `WITH delete_partnership AS (
          UPDATE "tblCommentaryPartnerships" SET
            "wrIsDelete" = $1,
            "wrDeletedBy" = $2,
            "wrIsActive" = $4,
            "wrDeletedAt" = now()
          WHERE "wrCommentaryBallByBallId" = $3
        ),
        delete_wicket AS (
          UPDATE "tblCommentaryWickets" SET
            "wrIsDeletedStatus" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
          WHERE "wrCommentaryBallByBallId" = $3
        )
      UPDATE "tblCommentaryBallByBalls"
        SET "wrIsDeletedStatus" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        WHERE "wrCommentaryBallByBallId" = $3`,
      { 
        bind: [true, request.userTokenInfo.WrUserId, id, false], 
        // type: fastify.db.QueryTypes.DELETE
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/deleteBallByBallCommentoriesQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteOverCommentoriesQuery = async (id, request, fastify) => {
  try {
    return await fastify.db.query(
      `WITH deleted_keys AS (
        UPDATE "tblOvers" SET
          "wrIsDelete" = $2,
          "wrDeletedBy" = $3,
          "wrDeletedAt" = now()
        WHERE "wrOverId" = $1
    
    )
      UPDATE "tblCommentaryBallByBalls"
        SET "wrIsDeletedStatus" = $2,
            "wrDeletedBy" = $3,
            "wrDeletedAt" = now()
        WHERE "wrOverId" = $1
      `,
      {
        // type: fastify.db.QueryTypes.DELETE,
        bind: [id, true, request.userTokenInfo.WrUserId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/deleteOverCommentoriesQuery",
      request
    );
    throw new Error(err.message);
  }
};
//get all query ---------------------------------------------

const getAllCommentaryTeamsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        tct."wrCommentaryTeamId" as "commentaryTeamId",
        tct."wrCommentaryId" as "commentaryId",
        tct."wrTeamId" as "teamId",
        tct."wrShortName" as "shortName",
        tct."wrTeamName" as "teamName",
        tct."wrTeamCaptain" as "teamCaptain",	
        tct."wrTeamKipper" as "teamKipper",
        tct."wrTeamScore" as "teamScore",
        tct."wrTeamOver" as "teamOver",
        tct."wrTeamWicket" as "teamWicket",
        COALESCE(CAST(tct."wrCrr" AS FLOAT), 0) AS "crr",
        COALESCE(CAST(tct."wrRrr" AS FLOAT), 0) AS "rrr",
        tct."wrTeamStatus" as "teamStatus",
        tct."wrTeamTrialRuns" as "teamTrialRuns",
        tct."wrTeamLeadRuns" as "teamLeadRuns",
        tct."wrTeamWideRuns" as "teamWideRuns",
        tct."wrTeamByRuns" as "teamByRuns",
        tct."wrTeamLegByRuns" as "teamLegByRuns",
        tct."wrTeamNoBallRuns" as "teamNoBallRuns",
        tct."wrTeamPenaltyRuns" as "teamPenaltyRuns",
        tct."wrIsWin" as "isWin",
        tct."wrTeamBattingOrder" as "teamBattingOrder",
        tct."wrCurrentInnings" as "currentInnings", 
        tct."wrIsBattingComplete" as "isBattingComplete",
        tct."wrCommentaryPlayerTeamCaptain" as "commentaryPlayerTeamCaptain",
        tct."wrCommentaryPlayerTeamKipper" as "commentaryPlayerTeamKipper",
        tct."wrTeamColor" as "teamColor",
        tct."wrBackgroundColor" as "backgroundColor",
        tct."wrTeamMaxOver" as "teamMaxOver",
        tct."wrIsSuperOver" as "isSuperOver",
        tct."wrTeamPredictionPercentage" as "teamPredictionPercentage",
        tct."wrDrsCount" as "drsCount",
        tct."wrNoOfAttempt" as "drsAttempt",
        tct."wrNoOfFail" as "drsFail"
    FROM "tblCommentaryTeams" AS tct
    WHERE tct."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
    )
    AND tct."wrIsDelete" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryTeamsDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select 
  "wrCommentaryTeamId" as "commentaryTeamId",
  "wrCommentaryId" as "commentaryId",
  "wrTeamId" as "teamId",
  "wrShortName" as "shortName",
  "wrTeamName" as "teamName",
  "wrTeamCaptain" as "teamCaptain",	
  "wrTeamKipper" as "teamKipper",
  "wrTeamScore" as "teamScore",
  "wrTeamOver" as "teamOver",
  "wrTeamWicket" as "teamWicket",
  COALESCE("wrCrr"::FLOAT, 0) AS "crr",
  COALESCE("wrRrr"::FLOAT, 0) AS "rrr",
  "wrTeamStatus" as "teamStatus",
  "wrTeamTrialRuns" as "teamTrialRuns",
  "wrTeamLeadRuns" as "teamLeadRuns",
  "wrTeamWideRuns" as "teamWideRuns",
  "wrTeamByRuns" as "teamByRuns",
  "wrTeamLegByRuns" as "teamLegByRuns",
  "wrTeamNoBallRuns" as "teamNoBallRuns",
  "wrTeamPenaltyRuns" as "teamPenaltyRuns",
  "wrIsWin" as "isWin",
  "wrTeamBattingOrder" as "teamBattingOrder",
  tct."wrCurrentInnings" as "currentInnings", 
  tct."wrIsBattingComplete" as "isBattingComplete",
  "wrCommentaryPlayerTeamCaptain" as "commentaryPlayerTeamCaptain",
  "wrCommentaryPlayerTeamKipper" as "commentaryPlayerTeamKipper",
  "wrTeamColor" as "teamColor",
  "wrBackgroundColor" as "backgroundColor",
  "wrTeamMaxOver" as "teamMaxOver",
  "wrIsSuperOver" as "isSuperOver",
  "wrTeamPredictionPercentage" as "teamPredictionPercentage",
  "wrDrsCount" as "drsCount",
  "wrNoOfAttempt" as "drsAttempt",
  "wrNoOfFail" as "drsFail"
  from "tblCommentaryTeams" tct 
  ${whereCondition ? `WHERE ${whereCondition}` : ""}
  `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );

  // return await fastify.db.query(`
  // select
  //   "wrCommentaryTeamId" as "commentaryTeamId",
  //   "wrCommentaryId" as "commentaryId",
  //   "wrTeamId" as "teamId",
  //   "wrShortName" as "shortName",
  //   "wrTeamName" as "teamName",
  //   "wrTeamCaptain" as "teamCaptain",
  //   "wrTeamKipper" as "teamKipper",
  //   "wrTeamScore" as "teamScore",
  //   "wrTeamOver" as "teamOver",
  //   "wrTeamWicket" as "teamWicket",
  //   "wrCrr" as "crr",
  //   "wrRrr" as "rrr",
  //   "wrTeamStatus" as "teamStatus",
  //   "wrIsWin" as "isWin",
  //   "wrCurrentInnings" as "currentInnings",
  //   "wrIsBattingComplete" as "isBattingComplete",
  //   "wrCommentaryPlayerTeamCaptain" as "commentaryPlayerTeamCaptain",
  //   "wrCommentaryPlayerTeamKipper" as "commentaryPlayerTeamKipper"
  // from "tblCommentaryTeams"
  // `,
  // {
  //   type: fastify.db.QueryTypes.SELECT,
  // })
};

const getAllCommentaryPlayerQuery = async (fastify) => {
  return await fastify.db.query(
    `select
        tcp."wrCommentaryPlayerId" as "commentaryPlayerId",
        tcp."wrCommentaryId" as "commentaryId",
        tcp."wrTeamId" as "teamId",
        tcp."wrPlayerId" as "playerId",
        tcp."wrPlayerName" as "playerName",
        tcp."wrDisplayOrder" as "displayOrder",
        tcp."wrBat_Status" as "batStatus",
        tcp."wrBat_Run" as "batRun",
        tcp."wrBat_Ball" as "batBall",
        tcp."wrBat_DotBall" as "batDotBall",
        tcp."wrBat_FOUR" as "batFour",
        tcp."wrBat_SIX" as "batSix",
        tcp."wrBat_SRR" as "batSrr",
        tcp."wrBat_BattingOrder" as "battingOrder",
        tcp."wrBat_IsPlay" as "isPlay",
        tcp."wrBat_OnStrike" as "onStrike",
        tcp."wrBat_WicketType" as "wicketType",
        tcp."wrBat_BowlerID" as "bowlerId",
        tcp."wrBat_FielderID1" as "fielderId1",
        tcp."wrBat_FielderID2" as "fielderId2",
        tcp."wrBowler_Over" as "bowlerOver",
        tcp."wrBowler_CurrentBall" as "bowlerCurrentBall",
        tcp."wrBowler_TotalBall" as "bowlerTotalBall",
        tcp."wrBowler_Run" as "bowlerRun",
        tcp."wrBowler_DotBall" as "bowlerDotBall",
        tcp."wrBowler_MaidenOver" as "bowlerMaidenOver",
        tcp."wrBowler_FOUR" as "bowlerFour",
        tcp."wrBowler_SIX" as "bowlerSix",
        tcp."wrBowler_WideBall" as "bowlerWideBall",
        tcp."wrBowler_NOBall" as "bowlerNoBall",
        tcp."wrBowler_ByeBall" as "bowlerByeBall",
        tcp."wrBowler_LegByeBall" as "bowlerLegByeBall",
        tcp."wrBowler_WideBallRun" as "bowlerWideBallRun",
        tcp."wrBowler_NOBallRun" as "bowlerNoBallRun",
        tcp."wrBowler_ByeBallRun" as "bowlerByeBallRun",
        tcp."wrBowler_LegByeBallRun" as "bowlerLegByeBallRun",
        tcp."wrBowler_TotalWicket" as "bowlerTotalWicket",
        tcp."wrBowler_Economy" as "bowlerEconomy",
        tcp."wrBowler_OnStrike" as "bowlerOnStrike",
        tcp."wrBowler_PeneltyRun" as "bowlerPeneltyRun",
        tcp."wrIsBatter_Out" as "isBatterOut",
        tcp."wrIsBatter_Retir" as "isBatterRetir",
        tcp."wrSwapName" as "swapName",
        tcp."wrBatsmanAverage" as "batsmanAverage",
        tcp."wrBatsmanStrikeRate" as "batsmanStrikeRate",
        tcp."wrBowlerEconomy" as "bowlerEconomy",
        tcp."wrBowlerAverage" as "bowlerAverage",
        tcp."wrCurrentInnings" as "currentInnings",
        tcp."wrBatterOrder" as "batterOrder",
        tcp."wrBowlerOrder" as "bowlerOrder",
        tcp."wrBatsmanPreviousStrikeRate"::DOUBLE PRECISION as "batsmanPreviousStrikeRate",
        tcp."wrBowlerPreviousEconomy"::DOUBLE PRECISION as "bowlerPreviousEconomy",
        tcp."wrIsInPlayingEleven" as "isInPlayingEleven",
        tcp."wrBoundary" as "boundary",
        tcp."wrPlayerBallFaced" as "playerBallFaced",
        tp."wrPlayerTypeId" as "playerTypeId",
        tpt."wrPlayerType" as "playerType",
        tcp."wrJerseyPlayerImage" as "jerseyPlayerImage"
    from "tblCommentaryPlayers" AS tcp
    LEFT JOIN "tblPlayers" AS tp ON tcp."wrPlayerId" = tp."wrPlayerId"
    LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    WHERE tcp."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
    )
    AND tcp."wrIsDelete" = false;
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryPlayerDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select
        tcp."wrCommentaryPlayerId" as "commentaryPlayerId",
        tcp."wrCommentaryId" as "commentaryId",
        tcp."wrTeamId" as "teamId",
        tcp."wrPlayerId" as "playerId",
        tcp."wrPlayerName" as "playerName",
        tcp."wrDisplayOrder" as "displayOrder",
        tcp."wrBat_Status" as "batStatus",
        tcp."wrBat_Run" as "batRun",
        tcp."wrBat_Ball" as "batBall",
        tcp."wrBat_DotBall" as "batDotBall",
        tcp."wrBat_FOUR" as "batFour",
        tcp."wrBat_SIX" as "batSix",
        tcp."wrBat_SRR" as "batSrr",
        tcp."wrBat_BattingOrder" as "battingOrder",
        tcp."wrBat_IsPlay" as "isPlay",
        tcp."wrBat_OnStrike" as "onStrike",
        tcp."wrBat_WicketType" as "wicketType",
        tcp."wrBat_BowlerID" as "bowlerId",
        tcp."wrBat_FielderID1" as "fielderId1",
        tcp."wrBat_FielderID2" as "fielderId2",
        tcp."wrBowler_Over" as "bowlerOver",
        tcp."wrBowler_CurrentBall" as "bowlerCurrentBall",
        tcp."wrBowler_TotalBall" as "bowlerTotalBall",
        tcp."wrBowler_Run" as "bowlerRun",
        tcp."wrBowler_DotBall" as "bowlerDotBall",
        tcp."wrBowler_MaidenOver" as "bowlerMaidenOver",
        tcp."wrBowler_FOUR" as "bowlerFour",
        tcp."wrBowler_SIX" as "bowlerSix",
        tcp."wrBowler_WideBall" as "bowlerWideBall",
        tcp."wrBowler_NOBall" as "bowlerNoBall",
        tcp."wrBowler_ByeBall" as "bowlerByeBall",
        tcp."wrBowler_LegByeBall" as "bowlerLegByeBall",
        tcp."wrBowler_WideBallRun" as "bowlerWideBallRun",
        tcp."wrBowler_NOBallRun" as "bowlerNoBallRun",
        tcp."wrBowler_ByeBallRun" as "bowlerByeBallRun",
        tcp."wrBowler_LegByeBallRun" as "bowlerLegByeBallRun",
        tcp."wrBowler_TotalWicket" as "bowlerTotalWicket",
        tcp."wrBowler_Economy" as "bowlerEconomy",
        tcp."wrBowler_OnStrike" as "bowlerOnStrike",
        tcp."wrBowler_PeneltyRun" as "bowlerPeneltyRun",
        tcp."wrIsBatter_Out" as "isBatterOut",
        tcp."wrIsBatter_Retir" as "isBatterRetir",
        tcp."wrSwapName" as "swapName",
        tcp."wrBatsmanAverage" as "batsmanAverage",
        tcp."wrBatsmanStrikeRate" as "batsmanStrikeRate",
        tcp."wrBowlerEconomy" as "bowlerEconomy",
        tcp."wrBowlerAverage" as "bowlerAverage",
        tcp."wrCurrentInnings" as "currentInnings",
        tcp."wrBatterOrder" as "batterOrder",
        tcp."wrBowlerOrder" as "bowlerOrder",
        tcp."wrBatsmanPreviousStrikeRate"::DOUBLE PRECISION as "batsmanPreviousStrikeRate",
        tcp."wrBowlerPreviousEconomy"::DOUBLE PRECISION as "bowlerPreviousEconomy",
        tcp."wrIsInPlayingEleven" as "isInPlayingEleven",
        tcp."wrBoundary" as "boundary",
        tcp."wrPlayerBallFaced" as "playerBallFaced",
        tp."wrPlayerTypeId" as "playerTypeId",
        tpt."wrPlayerType" as "playerType",
        tcp."wrJerseyPlayerImage" as "jerseyPlayerImage"
    from "tblCommentaryPlayers" AS tcp
    LEFT JOIN "tblPlayers" AS tp ON tcp."wrPlayerId" = tp."wrPlayerId"
    LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    ${whereCondition ? `WHERE ${whereCondition}` : ""}
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );

  // return await fastify.db.query(
  //   `select
  //   "wrCommentaryPlayerId" as "commentaryPlayerId",
  //   "wrCommentaryId" as "commentaryId",
  //   "wrTeamId" as "teamId",
  //   "wrPlayerId" as "playerId",
  //   "wrPlayerName" as "playerName",
  //   "wrDisplayOrder" as "displayOrder",
  //   "wrBat_Status" as "batStatus",
  //   "wrBat_Run" as "batRun",
  //   "wrBat_Ball" as "batBall",
  //   "wrBat_DotBall" as "batDotBall",
  //   "wrBat_FOUR" as "batFour",
  //   "wrBat_SIX" as "batSix",
  //   "wrBat_SRR" as "batSrr",
  //   "wrBat_BattingOrder" as "battingOrder",
  //   "wrBat_IsPlay" as "isPlay",
  //   "wrBat_OnStrike" as "onStrike",
  //   "wrBat_WicketType" as "wicketType",
  //   "wrBat_BowlerID" as "bowlerId",
  //   "wrBat_FielderID1" as "fielderId1",
  //   "wrBat_FielderID2" as "fielderId2",
  //   "wrBowler_Over" as "bowlerOver",
  //   "wrBowler_CurrentBall" as "bowlerCurrentBall",
  //   "wrBowler_TotalBall" as "bowlerTotalBall",
  //   "wrBowler_Run" as "bowlerRun",
  //   "wrBowler_DotBall" as "bowlerDotBall",
  //   "wrBowler_MaidenOver" as "bowlerMaidenOver",
  //   "wrBowler_FOUR" as "bowlerFour",
  //   "wrBowler_SIX" as "bowlerSix",
  //   "wrBowler_WideBall" as "bowlerWideBall",
  //   "wrBowler_NOBall" as "bowlerNoBall",
  //   "wrBowler_ByeBall" as "bowlerByeBall",
  //   "wrBowler_LegByeBall" as "bowlerLegByeBall",
  //   "wrBowler_WideBallRun" as "bowlerWideBallRun",
  //   "wrBowler_NOBallRun" as "bowlerNoBallRun",
  //   "wrBowler_ByeBallRun" as "bowlerByeBallRun",
  //   "wrBowler_LegByeBallRun" as "bowlerLegByeBallRun",
  //   "wrBowler_TotalWicket" as "bowlerTotalWicket",
  //   "wrBowler_Economy" as "bowlerEconomy",
  //   "wrBowler_OnStrike" as "bowlerOnStrike",
  //   "wrBowler_PeneltyRun" as "bowlerPeneltyRun",
  //   "wrIsBatter_Out" as "isBatterOut",
  //   "wrIsBatter_Retir" as "isBatterRetir",
  //   "wrSwapName" as "swapName",
  //   "wrBatsmanAverage" as "batsmanAverage",
  //   "wrBatsmanStrikeRate" as "batsmanStrikeRate",
  //   "wrBowlerEconomy" as "bowlerEconomy",
  //   "wrBowlerAverage" as "bowlerAverage",
  //   "wrCurrentInnings" as "currentInnings",
  //   "wrBatterOrder" as "batterOrder",
  //   "wrBowlerOrder" as "bowlerOrder",
  //   "wrBatsmanPreviousStrikeRate" as "batsmanPreviousStrikeRate",
  //   "wrBowlerPreviousEconomy" as "bowlerPreviousEconomy",
  //   "wrIsInPlayingEleven" as "isInPlayingEleven",
  //   "wrBoundary" as "boundary",
  //   "wrPlayerBallFaced" as "playerBallFaced"
  //   from "tblCommentaryPlayers"
  //   where "wrIsDelete" = false
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const getAllCommentaryBallByBallQuery = async (fastify) => {
  return await fastify.db.query(
    `select
        tcbb."wrCommentaryBallByBallId" as "commentaryBallByBallId",
        tcbb."wrCommentaryId" as "commentaryId",
        tcbb."wrTeamId" as "teamId",
        tcbb."wrOverId" as "overId",
        tcbb."wrOverCount" as "overCount",
        tcbb."wrCurrentOverBalls" as "currentOverBalls",
        tcbb."wrBowler_ID" as "bowlerId",
        tcbb."wrBat_StrikeID" as "batStrikeId",
        tcbb."wrBat_NONStrikeID" as "batNonStrikeId",
        tcbb."wrBall_IsCount" as "ballIsCount",
        tcbb."wrBall_Type" as "ballType",
        tcbb."wrBall_IsDot" as "ballIsDot",
        tcbb."wrBall_Run" as "ballRun",
        tcbb."wrBall_ExtraRun" as "ballExtraRun",
        tcbb."wrBall_isBoundry" as "ballIsBoundry",
        tcbb."wrBall_FOUR" as "ballFour",
        tcbb."wrBall_SIX" as "ballSix",
        tcbb."wrBall_IsWicket" as "ballIsWicket",
        tcbb."wrBall_WicketType" as "ballWicketType",
        tcbb."wrBall_PlayerID" as "ballPlayerId",
        tcbb."wrBall_BowlerID" as "ballBowlerId",
        tcbb."wrBall_FielderID1" as "ballFielderId1",
        tcbb."wrBall_FielderID2" as "ballFielderId2",
        tcbb."wrOver_isMaiden" as "overIsMaiden",
        tcbb."wrNextBat_StrikeID" as "nextBatStrikeId",
        tcbb."wrNextBat_NONStrikeID" as "nextBatNonStrikeId",
        tcbb."wrIsDelete" as "isDelete",
        tcbb."wrCurrentInnings" as "currentInnings",
        tcbb."wrCreatedDate" as "createdDate",
        tcbb."wrAutoStrikeBallCount" as "autoStrikeBallCount",
        tcbb."wrX2" as "x2",
        tcbb."wrY2" as "y2",
        tcbb."wrShortType" as "shortType",
        tcbb."wrCommentryRemark" as "commentryRemark",
        tcbb."wrCommentaryPartnershipId" as "commentaryPartnershipId"
    from "tblCommentaryBallByBalls" tcbb
    WHERE tcbb."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
    )
    AND tcbb."wrIsDeletedStatus" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryBallByBallDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select
    "wrCommentaryBallByBallId" as "commentaryBallByBallId",
    "wrCommentaryId" as "commentaryId",
    "wrTeamId" as "teamId",
    "wrOverId" as "overId",
    "wrOverCount" as "overCount",
    "wrCurrentOverBalls" as "currentOverBalls",
    "wrBowler_ID" as "bowlerId",
    "wrBat_StrikeID" as "batStrikeId",
    "wrBat_NONStrikeID" as "batNonStrikeId",
    "wrBall_IsCount" as "ballIsCount",
    "wrBall_Type" as "ballType",
    "wrBall_IsDot" as "ballIsDot",
    "wrBall_Run" as "ballRun",
    "wrBall_ExtraRun" as "ballExtraRun",
    "wrBall_isBoundry" as "ballIsBoundry",
    "wrBall_FOUR" as "ballFour",
    "wrBall_SIX" as "ballSix",
    "wrBall_IsWicket" as "ballIsWicket",
    "wrBall_WicketType" as "ballWicketType",
    "wrBall_PlayerID" as "ballPlayerId",
    "wrBall_BowlerID" as "ballBowlerId",
    "wrBall_FielderID1" as "ballFielderId1",
    "wrBall_FielderID2" as "ballFielderId2",
    "wrOver_isMaiden" as "overIsMaiden",
    "wrNextBat_StrikeID" as "nextBatStrikeId",
    "wrNextBat_NONStrikeID" as "nextBatNonStrikeId",
    "wrIsDelete" as "isDelete",
    "wrCurrentInnings" as "currentInnings",
    "wrCreatedDate" as "createdDate",
    "wrAutoStrikeBallCount" as "autoStrikeBallCount",
    "wrX2" as "x2",
    "wrY2" as "y2",
    "wrShortType" as "shortType",
    "wrCommentryRemark" as "commentryRemark",
    "wrCommentaryPartnershipId" as "commentaryPartnershipId"
    from "tblCommentaryBallByBalls"
    ${whereCondition ? `WHERE ${whereCondition}` : ""}
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
    
  );
  // return await fastify.db.query(
  //   `select
  //   "wrCommentaryBallByBallId" as "pId",
  //   te."wrValue" as "commentaryBallByBallId",
  //   te1."wrValue" as "commentaryId",
  //   te2."wrValue" as "teamId",
  //   te3."wrValue" as "overId",
  //   "wrOverCount" as "overCount",
  //   "wrCurrentOverBalls" as "currentOverBalls",
  //   te4."wrValue" as "bowlerId",
  //   te5."wrValue" as "batStrikeId",
  //   te6."wrValue" as "batNonStrikeId",
  //   "wrBall_IsCount" as "ballIsCount",
  //   "wrBall_Type" as "ballType",
  //   "wrBall_IsDot" as "ballIsDot",
  //   "wrBall_Run" as "ballRun",
  //   "wrBall_ExtraRun" as "ballExtraRun",
  //   "wrBall_isBoundry" as "ballIsBoundry",
  //   "wrBall_FOUR" as "ballFour",
  //   "wrBall_SIX" as "ballSix",
  //   "wrBall_IsWicket" as "ballIsWicket",
  //   "wrBall_WicketType" as "ballWicketType",
  //   te7."wrValue" as "ballPlayerId",
  //   te8."wrValue" as "ballBowlerId",
  //   te9."wrValue" as "ballFielderId1",
  //   te10."wrValue" as "ballFielderId2",
  //   "wrOver_isMaiden" as "overIsMaiden",
  //   te11."wrValue" as "nextBatStrikeId",
  //   te12."wrValue" as "nextBatNonStrikeId",
  //   "wrIsDelete" as "isDelete",
  //   "wrCurrentInnings" as "currentInnings"
  //   from "tblCommentaryBallByBalls" tcb
  //   left join "tblEncryptedData" te on tcb."wrCommentaryBallByBallId" = te."wrKey"
  //   left join "tblEncryptedData" te1 on tcb."wrCommentaryId" = te1."wrKey"
  //   left join "tblEncryptedData" te2 on tcb."wrTeamId" = te2."wrKey"
  //   left join "tblEncryptedData" te3 on tcb."wrOverId" = te3."wrKey"
  //   left join "tblEncryptedData" te4 on tcb."wrBowler_ID" = te4."wrKey"
  //   left join "tblEncryptedData" te5 on tcb."wrBat_StrikeID" = te5."wrKey"
  //   left join "tblEncryptedData" te6 on tcb."wrBat_NONStrikeID" = te6."wrKey"
  //   left join "tblEncryptedData" te7 on tcb."wrBall_PlayerID" = te7."wrKey"
  //   left join "tblEncryptedData" te8 on tcb."wrBall_BowlerID" = te8."wrKey"
  //   left join "tblEncryptedData" te9 on tcb."wrBall_FielderID1" = te9."wrKey"
  //   left join "tblEncryptedData" te10 on tcb."wrBall_FielderID2" = te10."wrKey"
  //   left join "tblEncryptedData" te11 on tcb."wrNextBat_StrikeID" = te11."wrKey"
  //   left join "tblEncryptedData" te12 on tcb."wrNextBat_NONStrikeID" = te12."wrKey"
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const getAllOversQuery = async (fastify) => {
  return await fastify.db.query(
    `
      select
          o."wrOverId" as "overId",
          o."wrCommentaryId" as "commentaryId",
          o."wrTeamId" as "teamId",	
          o."wrOver" as "over",
          o."wrBallCount" as "ballCount",
          o."wrBowlerId" as "bowlerId",
          o."wrTotalRun" as "totalRun",
          o."wrTotalFour" as "totalFour",
          o."wrTotalSix" as "totalSix",
          o."wrTotalWideBall" as "totalWideBall",
          o."wrTotalWideRun" as "totalWideRun",
          o."wrTotalNoball" as "totalNoball",
          o."wrTotalNoBallRun" as "totalNoBallRun",
          o."wrTotalByesRun" as "totalByesRun",
          o."wrTotalLegByesRun" as "totalLegByesRun",
          o."wrTotalPanelty" as "totalPanelty",
          o."wrTotalWicket" as "totalWicket",
          o."wrDotBall" as "dotBall",
          o."wrIsComplete" as "isComplete",
          o."wrPowerplay" as "powerplay",
          o."wrIsOverInPowerplay" as "isOverInPowerplay",
          o."wrPowerplayType" as "powerplayType",
          o."wrIsMaiden" as "isMaiden",
          o."wrDate" as "date",
          o."wrIsDelete" as "isDelete",
          o."wrCurrentInnings" as "currentInnings",
          o."wrTeamScore" as "teamScore",
          o."wrIsPowerPlay" as "isPowerPlay",
          o."wrPowerPlayName" as "powerPlayName"
      from "tblOvers" as o
      WHERE o."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
      )
      AND o."wrIsDelete" = false;
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllOversDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
      select
      "wrOverId" as "overId",
      "wrCommentaryId" as "commentaryId",
      "wrTeamId" as "teamId",	
      "wrOver" as "over",
      "wrBallCount" as "ballCount",
      "wrBowlerId" as "bowlerId",
      "wrTotalRun" as "totalRun",
      "wrTotalFour" as "totalFour",
      "wrTotalSix" as "totalSix",
      "wrTotalWideBall" as "totalWideBall",
      "wrTotalWideRun" as "totalWideRun",
      "wrTotalNoball" as "totalNoball",
      "wrTotalNoBallRun" as "totalNoBallRun",
      "wrTotalByesRun" as "totalByesRun",
      "wrTotalLegByesRun" as "totalLegByesRun",
      "wrTotalPanelty" as "totalPanelty",
      "wrTotalWicket" as "totalWicket",
      "wrDotBall" as "dotBall",
      "wrIsComplete" as "isComplete",
      "wrPowerplay" as "powerplay",
      "wrIsOverInPowerplay" as "isOverInPowerplay",
      "wrPowerplayType" as "powerplayType",
      "wrIsMaiden" as "isMaiden",
      "wrDate" as "date",
      "wrIsDelete" as "isDelete",
      "wrCurrentInnings" as "currentInnings",
      "wrTeamScore" as "teamScore",
      "wrIsPowerPlay" as "isPowerPlay",
      "wrPowerPlayName" as "powerPlayName"
      from "tblOvers" 
      ${whereCondition ? `WHERE ${whereCondition}` : ""}
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  // return await fastify.db.query(
  //   `
  //   select
  //   "wrOverId" as "pId",
  //   te."wrValue" as "overId",
  //   te1."wrValue" as "commentaryId",
  //   te2."wrValue" as "teamId",
  //   "wrOver" as "over",
  //   "wrBallCount" as "ballCount",
  //   te3."wrValue" as "bowlerId",
  //   "wrTotalRun" as "totalRun",
  //   "wrTotalFour" as "totalFour",
  //   "wrTotalSix" as "totalSix",
  //   "wrTotalWideBall" as "totalWideBall",
  //   "wrTotalWideRun" as "totalWideRun",
  //   "wrTotalNoball" as "totalNoball",
  //   "wrTotalNoBallRun" as "totalNoBallRun",
  //   "wrTotalByesRun" as "totalByesRun",
  //   "wrTotalLegByesRun" as "totalLegByesRun",
  //   "wrTotalPanelty" as "totalPanelty",
  //   "wrTotalWicket" as "totalWicket",
  //   "wrDotBall" as "dotBall",
  //   "wrIsComplete" as "isComplete",
  //   "wrPowerplay" as "powerplay",
  //   "wrIsOverInPowerplay" as "isOverInPowerplay",
  //   "wrPowerplayType" as "powerplayType",
  //   "wrIsMaiden" as "isMaiden",
  //   "wrDate" as "date",
  //   "wrIsDelete" as "isDelete",
  //   "wrCurrentInnings" as "currentInnings"
  //   from "tblOvers" tco
  //   left join "tblEncryptedData" te on tco."wrOverId" = te."wrKey"
  //   left join "tblEncryptedData" te1 on tco."wrCommentaryId" = te1."wrKey"
  //   left join "tblEncryptedData" te2 on tco."wrTeamId" = te2."wrKey"
  //   left join "tblEncryptedData" te3 on tco."wrBowlerId" = te3."wrKey"
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const getAllDisplayStatusQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select 
    "wrDisplayStatusId" as "displayStatusId",
    "wrDisplayStatus" as "displayStatus"
    from "tblDisplayStatuses"
    where "wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryWicketQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select 
        tcw."wrCommentaryWicketId" as "commentaryWicketId",
        tcw."wrCommentaryId" as "commentaryId",
        tcw."wrBowlerId" as "bowlerId",
        tcw."wrBowlerName" as "bowlerName",
        tcw."wrWicketType" as "wicketType",
        tcw."wrBatterId" as "batterId",
        tcw."wrBatterName" as "batterName",
        tcw."wrFieldPlayerId" as "fieldPlayerId",
        tcw."wrFieldPlayerName" as "fieldPlayerName",
        tcw."wrOverId" as "overId",
        tcw."wrOverCount" as "overCount",
        tcw."wrCommentaryBallByBallId" as "commentaryBallByBallId",
        tcw."wrTeamId" as "teamId",
        tcw."wrTeamScore" as "teamScore",
        tcw."wrPlayerRun" as "playerRun",
        tcw."wrPlayerBalls" as "playerBalls",
        tcw."wrWicketCount" as "wicketCount",
        tcw."wrBallCount" as "ballCount",
        tcw."wrCurrentInnings" as "currentInnings",
        tcw."wrCreatedDate" as "createdDate"
    from "tblCommentaryWickets" tcw
    WHERE tcw."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
    )
    AND tcw."wrIsDeletedStatus" = false;
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryWicketDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
    select 
    "wrCommentaryWicketId" as "commentaryWicketId",
    "wrCommentaryId" as "commentaryId",
    "wrBowlerId" as "bowlerId",
    "wrBowlerName" as "bowlerName",
    "wrWicketType" as "wicketType",
    "wrBatterId" as "batterId",
    "wrBatterName" as "batterName",
    "wrFieldPlayerId" as "fieldPlayerId",
    "wrFieldPlayerName" as "fieldPlayerName",
    "wrOverId" as "overId",
    "wrOverCount" as "overCount",
    "wrCommentaryBallByBallId" as "commentaryBallByBallId",
    "wrTeamId" as "teamId",
    "wrTeamScore" as "teamScore",
    "wrPlayerRun" as "playerRun",
    "wrPlayerBalls" as "playerBalls",
    "wrWicketCount" as "wicketCount",
    "wrBallCount" as "ballCount",
    "wrCurrentInnings" as "currentInnings",
    "wrCreatedDate" as "createdDate"
    from "tblCommentaryWickets" 
    ${whereCondition ? `WHERE ${whereCondition}` : ""}
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  // return await fastify.db.query(
  //   `
  //   select
  //   "wrCommentaryWicketId" as "pId",
  //   te."wrValue" as "commentaryWicketId",
  //   te1."wrValue" as "commentaryId",
  //   te2."wrValue" as "bowlerId",
  //   "wrBowlerName" as "bowlerName",
  //   "wrWicketType" as "wicketType",
  //   te3."wrValue" as "batterId",
  //   "wrBatterName" as "batterName",
  //   te4."wrValue" as "fieldPlayerId",
  //   "wrFieldPlayerName" as "fieldPlayerName",
  //   te5."wrValue" as "overId",
  //   "wrOverCount" as "overCount",
  //   te6."wrValue" as "commentaryBallByBallId",
  //   te7."wrValue" as "teamId",
  //   "wrTeamScore" as "teamScore",
  //   "wrPlayerRun" as "playerRun",
  //   "wrPlayerBalls" as "playerBalls",
  //   tcw."wrWicketCount" as "wicketCount",
  //   tcw."wrBallCount" as "ballCount",
  //   tcw."wrCurrentInnings" as "currentInnings"
  //   from "tblCommentaryWickets" tcw
  //   left join "tblEncryptedData" te on tcw."wrCommentaryWicketId" = te."wrKey"
  //   left join "tblEncryptedData" te1 on tcw."wrCommentaryId" = te1."wrKey"
  //   left join "tblEncryptedData" te2 on tcw."wrBowlerId" = te2."wrKey"
  //   left join "tblEncryptedData" te3 on tcw."wrBatterId" = te3."wrKey"
  //   left join "tblEncryptedData" te4 on tcw."wrFieldPlayerId" = te4."wrKey"
  //   left join "tblEncryptedData" te5 on tcw."wrOverId" = te5."wrKey"
  //   left join "tblEncryptedData" te6 on tcw."wrCommentaryBallByBallId" = te6."wrKey"
  //   left join "tblEncryptedData" te7 on tcw."wrTeamId" = te7."wrKey"
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const getAllCommentaryPartnershipQuery = async (fastify) => {
  return await fastify.db.query(
    `
      select 
          tcps."wrCommentaryPartnershipId" as "commentaryPartnershipId",
          tcps."wrCommentaryId" as "commentaryId",
          tcps."wrTeamId" as "teamId",
          tcps."wrBatter1Id" as "batter1Id",
          tcps."wrBatter1Name" as "batter1Name",
          tcps."wrBatter2Id" as "batter2Id",
          tcps."wrBatter2Name" as "batter2Name",
          tcps."wrTotalRuns" as "totalRuns",
          tcps."wrTotalBalls" as "totalBalls",
          tcps."wrExtras" as "extras",
          tcps."wrCurrentInnings" as "currentInnings",
          tcps."wrCommentaryBallByBallId" as "commentaryBallByBallId",
          tcps."wrBatter1Balls" as "batter1Balls",
          tcps."wrBatter2Balls" as "batter2Balls",
          tcps."wrBatter1Runs" as "batter1Runs",
          tcps."wrBatter2Runs" as "batter2Runs",
          tcps."wrCreatedDate" as "createdDate",
          tcps."wrTotalFour" as "totalFour",
          tcps."wrTotalSix" as "totalSix",
          tcps."wrTotalExtra" as "totalExtra",
          tcps."wrTotalWide" as "totalWide",
          tcps."wrTotalNoBall" as "totalNoBall",
          tcps."wrOrder" as "order",
          tcps."wrIsActive" as "isActive",
          tcps."wrP1Ball" as "p1Ball",
          tcps."wrP2Ball" as "p2Ball",
          tcps."wrP1Run" as "p1Run",
          tcps."wrP2Run" as "p2Run"
      from "tblCommentaryPartnerships" tcps
      WHERE tcps."wrCommentaryId" IN (
        SELECT "wrCommentaryId"
        FROM "tblCommentaries"
        WHERE 
            (
                "wrCommentaryCloseTime" >= NOW() - INTERVAL '7 days'
                AND "wrCommentaryStatus" = 4 AND "wrIsDelete" = FALSE
            )
            OR "wrCommentaryStatus" != 4 AND "wrIsDelete" = FALSE
      )
      AND tcps."wrIsDelete" = false;
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryPartnershipDataQuery = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
      select 
      "wrCommentaryPartnershipId" as "commentaryPartnershipId",
      "wrCommentaryId" as "commentaryId",
      "wrTeamId" as "teamId",
      "wrBatter1Id" as "batter1Id",
      "wrBatter1Name" as "batter1Name",
      "wrBatter2Id" as "batter2Id",
      "wrBatter2Name" as "batter2Name",
      "wrTotalRuns" as "totalRuns",
      "wrTotalBalls" as "totalBalls",
      "wrExtras" as "extras",
      "wrCurrentInnings" as "currentInnings",
      "wrCommentaryBallByBallId" as "commentaryBallByBallId",
      "wrBatter1Balls" as "batter1Balls",
      "wrBatter2Balls" as "batter2Balls",
      "wrBatter1Runs" as "batter1Runs",
      "wrBatter2Runs" as "batter2Runs",
      "wrCreatedDate" as "createdDate",
      "wrTotalFour" as "totalFour",
      "wrTotalSix" as "totalSix",
      "wrTotalExtra" as "totalExtra",
      "wrTotalWide" as "totalWide",
      "wrTotalNoBall" as "totalNoBall",
      "wrOrder" as "order",
      "wrIsActive" as "isActive",
      "wrP1Ball" as "p1Ball",
      "wrP2Ball" as "p2Ball",
      "wrP1Run" as "p1Run",
      "wrP2Run" as "p2Run"
      from "tblCommentaryPartnerships"
      ${whereCondition ? `WHERE ${whereCondition}` : ""}
      `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  
  // return await fastify.db.query(
  //   `
  //   select
  //   te."wrValue" as "commentaryPartnershipId",
  //   te1."wrValue" as "commentaryId",
  //   te2."wrValue" as "teamId",
  //   te3."wrValue" as "batter1Id",
  //   "wrBatter1Name" as "batter1Name",
  //   te4."wrValue" as "batter2Id",
  //   "wrBatter2Name" as "batter2Name",
  //   "wrTotalRuns" as "totalRuns",
  //   "wrTotalBalls" as "totalBalls",
  //   "wrExtras" as "extras",
  //   "wrCurrentInnings" as "currentInnings",
  //   te5."wrValue" as "commentaryBallByBallId"
  //   from "tblCommentaryPartnerships" tcw
  //   left join "tblEncryptedData" te on tcw."wrCommentaryPartnershipId" = te."wrKey"
  //   left join "tblEncryptedData" te1 on tcw."wrCommentaryId" = te1."wrKey"
  //   left join "tblEncryptedData" te2 on tcw."wrTeamId" = te2."wrKey"
  //   left join "tblEncryptedData" te3 on tcw."wrBatter1Id" = te3."wrKey"
  //   left join "tblEncryptedData" te4 on tcw."wrBatter2Id" = te4."wrKey"
  //   left join "tblEncryptedData" te5 on tcw."wrCommentaryBallByBallId" = te5."wrKey"

  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

// ---------------------------------------------

const createCommentaryPartnershipQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_partnership as (
        insert into "tblCommentaryPartnerships" ("wrCommentaryId", "wrTeamId", "wrBatter1Id", "wrBatter2Id", 
        "wrBatter1Name", "wrBatter2Name", "wrTotalRuns", "wrTotalBalls", "wrExtras" ,
         "wrCommentaryBallByBallId","wrCurrentInnings",
        "wrBatter1Balls", "wrBatter2Balls", "wrBatter1Runs", "wrBatter2Runs"
        ) values (
          $1,
          $2,
          $3,
          $4,
          $5,$6,$7,$8,$9,
         $10,
          $11,
          $12,
          $13,
          $14,
          $15
        ) 
        returning *
      )

      select 
    "wrCommentaryPartnershipId" as "commentaryPartnershipId",
    "wrCommentaryId" as "commentaryId",
    "wrTeamId" as "teamId",
    "wrBatter1Id" as "batter1Id",
    "wrBatter1Name" as "batter1Name",
    "wrBatter2Id" as "batter2Id",
    "wrBatter2Name" as "batter2Name",
    "wrTotalRuns" as "totalRuns",
    "wrTotalBalls" as "totalBalls",
    "wrExtras" as "extras",
    "wrCommentaryBallByBallId" as "commentaryBallByBallId",
    "wrCurrentInnings" as "currentInnings",
    "wrBatter1Balls" as "batter1Balls",
    "wrBatter2Balls" as "batter2Balls",
    "wrBatter1Runs" as "batter1Runs",
    "wrBatter2Runs" as "batter2Runs"
    from "insert_partnership"

      
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.batter1Id,
          data.batter2Id,
          data.batter1Name,
          data.batter2Name,
          data.totalRuns,
          data.totalBalls,
          data.extras,
          data.commentaryBallByBallId,
          data.currentInnings,
          data.batter1Balls || 0,
          data.batter2Balls || 0,
          data.batter1Runs || 0,
          data.batter2Runs || 0,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/createCommentaryPartnershipQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryPartnershipQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblCommentaryPartnerships" set
      "wrCommentaryId" =$1,
      "wrTeamId" =$2,
      "wrBatter1Id" =$3,
      "wrBatter2Id" = $4,
      "wrBatter1Name" = $5,
      "wrBatter2Name" = $6,
      "wrTotalRuns" = $7,
      "wrTotalBalls" = $8,
      "wrExtras" = $9,
      "wrCommentaryBallByBallId" =$10,
      "wrBatter1Balls" = $11,
      "wrBatter2Balls" = $12,
      "wrBatter1Runs" = $13,
      "wrBatter2Runs" = $14
      where "wrCommentaryPartnershipId" = $15
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.commentaryId,
          data.teamId,
          data.batter1Id,
          data.batter2Id,
          data.batter1Name,
          data.batter2Name,
          data.totalRuns,
          data.totalBalls,
          data.extras,
          data.commentaryBallByBallId,
          data.batter1Balls,
          data.batter2Balls,
          data.batter1Runs,
          data.batter2Runs,
          data.commentaryPartnershipId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryPartnershipQuery",
      request
    );
    throw new Error(err.message);
  }
};

const createOverQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_over as (
      insert into "tblOvers" ("wrCommentaryId", "wrTeamId", "wrOver", "wrBowlerId" , "wrBallCount" , "wrTotalRun" , 
      "wrTotalFour" , "wrTotalSix" , "wrTotalWideBall" , "wrTotalWideRun" , "wrTotalNoball" , "wrTotalNoBallRun" ,
      "wrTotalByesRun" , "wrTotalLegByesRun" , "wrTotalPanelty" , "wrTotalWicket" , "wrDotBall" , "wrIsComplete" ,
       "wrIsOverInPowerplay" , "wrPowerplayType" , "wrIsMaiden" , "wrDate", "wrCurrentInnings" 
      ) values (
        $1,
        $2,
        $3,
        $4 , 
        $5 , $6 , $7 , $8 , $9 , $10 , $11 , $12 , $13 , $14 , $15 , $16 , $17 , $18 , $19 , $20 , $21 , $22 , $23
        )
        returning * 
      )

      select
      "wrOverId" as "overId",
      "wrCommentaryId" as "commentaryId",
      "wrTeamId" as "teamId",
      "wrOver" as "over",
      "wrBallCount" as "ballCount",
      "wrBowlerId" as "bowlerId",
      "wrTotalRun" as "totalRun",
      "wrTotalFour" as "totalFour",
      "wrTotalSix" as "totalSix",
      "wrTotalWideBall" as "totalWideBall",
      "wrTotalWideRun" as "totalWideRun",
      "wrTotalNoball" as "totalNoball",
      "wrTotalNoBallRun" as "totalNoBallRun",
      "wrTotalByesRun" as "totalByesRun",
      "wrTotalLegByesRun" as "totalLegByesRun",
      "wrTotalPanelty" as "totalPanelty",
      "wrTotalWicket" as "totalWicket",
      "wrDotBall" as "dotBall",
      "wrIsComplete" as "isComplete",
      "wrPowerplay" as "powerplay",
      "wrIsOverInPowerplay" as "isOverInPowerplay",
      "wrPowerplayType" as "powerplayType",
      "wrIsMaiden" as "isMaiden",
      "wrDate" as "date",
      "wrIsDelete" as "isDelete",
      "wrCurrentInnings" as "currentInnings"
      from "insert_over"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.over,
          data.bowlerId,
          data.ballCount || 0,
          data.totalRun || 0,
          data.totalFour || 0,
          data.totalSix || 0,
          data.totalWideBall || 0,
          data.totalWideRun || 0,
          data.totalNoball || 0,
          data.totalNoBallRun || 0,
          data.totalByesRun || 0,
          data.totalLegByesRun || 0,
          data.totalPanelty || 0,
          data.totalWicket || 0,
          data.dotBall || 0,
          data.isComplete || false,
          data.isOverInPowerplay || false,
          data.powerplayType || 0,
          data.isMaiden || false,
          new Date(),
          data.currentInnings,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/createOverQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateOverQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblOvers" set
      "wrBallCount" = $1,
      "wrTotalRun" = $2,
      "wrTotalFour" = $3,
      "wrTotalSix" = $4,
      "wrTotalWideBall" = $5,
      "wrTotalWideRun" = $6,  
      "wrTotalNoball" = $7,
      "wrTotalNoBallRun" = $8,
      "wrTotalByesRun" = $9,
      "wrTotalLegByesRun" = $10,
      "wrTotalPanelty" = $11,
      "wrTotalWicket" = $12,
      "wrDotBall" = $13,
      "wrIsComplete" = $14,
      "wrIsOverInPowerplay" = $15,
      "wrPowerplayType" = $16,
      "wrIsMaiden" = $17,
      "wrDate" = $18,
      "wrBowlerId" = $19,
      "wrOver" = $20
      where "wrOverId" = $21
      AND "wrCurrentInnings" = $22
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.ballCount,
          data.totalRun,
          data.totalFour,
          data.totalSix,
          data.totalWideBall,
          data.totalWideRun,
          data.totalNoball,
          data.totalNoBallRun,
          data.totalByesRun,
          data.totalLegByesRun,
          data.totalPanelty,
          data.totalWicket,
          data.dotBall,
          data.isComplete,
          data.isOverInPowerplay,
          data.powerplayType,
          data.isMaiden,
          new Date(),
          data.bowlerId,
          data.over,
          data.overId,
          data.currentInnings,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateOverQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryDetailsQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrDisplayStatus" = $1,
        "wrModifyDate" = now(),
        "wrUpdateTime" = now(),
        "wrCommentaryStatus" = $3
        where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        bind: [data.displayStatus, data.commentaryId, data.commentaryStatus],
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateCommentaryDetailsQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateCommentaryStatusQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrDisplayStatus" = $1,
        "wrModifyDate" = now(),
        "wrUpdateTime" = now()
        where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        bind: [data.displayStatus, data.commentaryId],
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateCommentaryDetailsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryTeamsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaryTeams" set
       "wrShortName" = $1,
       "wrTeamName" = $2,
       "wrTeamCaptain" = $3,
       "wrTeamKipper" = $4,
       "wrTeamScore" = $5,
        "wrTeamOver" = $6,
        "wrTeamWicket" = $7,
        "wrCrr" = $8,
        "wrRrr" = $9,
        "wrTeamStatus" = $10,
        "wrIsWin" = $11,
        "wrCurrentInnings" = $12,
        "wrIsBattingComplete" = $13,
        "wrTeamWideRuns"  = $16,
        "wrTeamByRuns"  = $17,
        "wrTeamLegByRuns"  = $18,
        "wrTeamNoBallRuns"  = $19,
        "wrTeamPenaltyRuns"  = $20,
        "wrTeamBattingOrder" = $21
        where "wrCommentaryTeamId" = $14
        AND "wrCurrentInnings" = $15
      `,
      {
        bind: [
          data.shortName,
          data.teamName,
          data.teamCaptain,
          data.teamKipper,
          data.teamScore,
          data.teamOver,
          data.teamWicket,
          data.crr,
          data.rrr,
          data.teamStatus,
          data.isWin,
          data.currentInnings,
          data.isBattingComplete,
          data.commentaryTeamId,
          data.currentInnings,
          data.teamWideRuns,
          data.teamByRuns,
          data.teamLegByRuns,
          data.teamNoBallRuns,
          data.teamPenaltyRuns,
          data.teamBattingOrder || null,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateCommentaryTeamsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryPlayersQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblCommentaryPlayers" set
      "wrPlayerName" = $1,
      "wrDisplayOrder" = $2,
      "wrBat_Status" = $3,
      "wrBat_Run" = $4,
      "wrBat_Ball" = $5,
      "wrBat_DotBall" = $6,
      "wrBat_FOUR" = $7,
      "wrBat_SIX" = $8,
      "wrBat_SRR" = $9,
      "wrBat_BattingOrder" = $10,
      "wrBat_IsPlay" = $11,
      "wrBat_OnStrike" = $12,
      "wrBat_WicketType" = $13,
      "wrBat_BowlerID" = $14,
      "wrBat_FielderID1" = $15,
      "wrBat_FielderID2" =$16,
      "wrBowler_Over" = $18,
      "wrBowler_CurrentBall" = $19,
      "wrBowler_TotalBall" = $20,
      "wrBowler_Run" = $21,
      "wrBowler_DotBall" = $22,
      "wrBowler_MaidenOver" = $23,
      "wrBowler_FOUR" = $24,
      "wrBowler_SIX" = $25,
      "wrBowler_WideBall" = $26,
      "wrBowler_NOBall" = $27,
      "wrBowler_ByeBall" = $28,
      "wrBowler_LegByeBall" = $29,
      "wrBowler_WideBallRun" = $30,
      "wrBowler_NOBallRun" = $31,
      "wrBowler_ByeBallRun" = $32,
      "wrBowler_LegByeBallRun" = $33,
      "wrBowler_TotalWicket" = $34,
      "wrBowler_Economy" = $35,
      "wrBowler_OnStrike" = $36,
      "wrBowler_PeneltyRun" = $37,
      "wrIsBatter_Out" = $38,
      "wrIsBatter_Retir" = $39,
      "wrSwapName" = $40,
      "wrBatsmanAverage" = $41,
      "wrBatsmanStrikeRate" = $42,
      "wrBowlerEconomy" = $43,
      "wrBowlerAverage" = $44,
      "wrBatterOrder" = $45,
      "wrBowlerOrder" = $46
      where "wrCommentaryPlayerId" = $47
      AND "wrCurrentInnings" = $48
      `,
      {
        bind: [
          data.playerName,
          data.displayOrder,
          data.batStatus,
          data.batRun,
          data.batBall,
          data.batDotBall,
          data.batFour,
          data.batSix,
          data.batSrr,
          data.battingOrder,
          data.isPlay,
          data.onStrike,
          data.wicketType,
          data.bowlerId,
          data.fielderId1,
          data.fielderId2,
          0,
          data.bowlerOver,
          data.bowlerCurrentBall,
          data.bowlerTotalBall,
          data.bowlerRun,
          data.bowlerDotBall,
          data.bowlerMaidenOver,
          data.bowlerFour,
          data.bowlerSix,
          data.bowlerWideBall,
          data.bowlerNoBall,
          data.bowlerByeBall,
          data.bowlerLegByeBall,
          data.bowlerWideBallRun,
          data.bowlerNoBallRun,
          data.bowlerByeBallRun,
          data.bowlerLegByeBallRun,
          data.bowlerTotalWicket,
          data.bowlerEconomy,
          data.bowlerOnStrike,
          data.bowlerPeneltyRun,
          data.isBatterOut,
          data.isBatterRetir,
          data.swapName,
          data.batsmanAverage,
          data.batsmanStrikeRate,
          data.bowlerEconomy,
          data.bowlerAverage,
          data.batterOrder,
          data.bowlerOrder,
          data.commentaryPlayerId,
          data.currentInnings,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateCommentaryPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};

const createBallByBallCommentoriesQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
    with insert_data as (
      insert into "tblCommentaryBallByBalls" (
        "wrCommentaryId",
        "wrTeamId",
        "wrOverId",
        "wrOverCount",
        "wrCurrentOverBalls",
        "wrBowler_ID",
        "wrBat_StrikeID",
        "wrBat_NONStrikeID",
        "wrBall_IsCount",
        "wrBall_Type",
        "wrBall_IsDot",
        "wrBall_Run",
        "wrBall_ExtraRun",
        "wrBall_isBoundry",
        "wrBall_FOUR",
        "wrBall_SIX",
        "wrBall_IsWicket",
        "wrBall_WicketType",
        "wrBall_PlayerID",
        "wrBall_BowlerID",
        "wrBall_FielderID1",
        "wrBall_FielderID2",
        "wrOver_isMaiden",
        "wrNextBat_StrikeID",
        "wrNextBat_NONStrikeID",
        "wrIsDelete",
        "wrCurrentInnings" 
      ) values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        $23,
        $24,
        $25,
        $26,
        $27
        )
      returning 
      "wrCommentaryBallByBallId" as "commentaryBallByBallId",
      "wrIsDelete" as "isDelete"
    )
    select * from insert_data
    `,
      {
        bind: [
          data.commentaryId,
          data.teamId,
          data.overId,
          data.overCount,
          data.currentOverBalls,
          data.bowlerId,
          data.batStrikeId,
          data.batNonStrikeId,
          data.ballIsCount,
          data.ballType,
          data.ballIsDot,
          data.ballRun,
          data.ballExtraRun,
          data.ballIsBoundry,
          data.ballFour,
          data.ballSix,
          data.ballIsWicket,
          data.ballWicketType,
          data.ballPlayerId,
          data.ballBowlerId,
          data.ballFielderId1,
          data.ballFielderId2,
          data.overIsMaiden,
          data.nextBatStrikeId,
          data.nextBatNonStrikeId,
          data.isDelete || false,
          data.currentInnings,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/createBallByBallCommentoriesQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateBallByBallCommentoriesQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblCommentaryBallByBalls" set
      "wrTeamId" = $1,
      "wrOverId" =$2,
      "wrOverCount" = $3,
      "wrCurrentOverBalls" = $4,
      "wrBowler_ID" =$5,
      "wrBat_StrikeID" = $6,
      "wrBat_NONStrikeID" =$7,
      "wrBall_IsCount" = $8,
      "wrBall_Type" = $9,
      "wrBall_IsDot" = $10,
      "wrBall_Run" = $11,
      "wrBall_ExtraRun" = $12,
      "wrBall_isBoundry" = $13,
      "wrBall_FOUR" = $14,
      "wrBall_SIX" = $15,
      "wrBall_IsWicket" = $16,
      "wrBall_WicketType" = $17,
      "wrBall_PlayerID" = $18,
      "wrBall_BowlerID" = $19,
      "wrBall_FielderID1" = $20,
      "wrBall_FielderID2" = $21,
      "wrOver_isMaiden" = $22,
      "wrNextBat_StrikeID" =$23,
      "wrNextBat_NONStrikeID" = $24,
      "wrIsDelete" = $25
      where "wrCommentaryBallByBallId" = $26
      AND "wrCurrentInnings" = $27 AND "wrIsDeletedStatus" = false
      `,
      {
        bind: [
          data.teamId,
          data.overId,
          data.overCount,
          data.currentOverBalls,
          data.bowlerId,
          data.batStrikeId,
          data.batNonStrikeId,
          data.ballIsCount,
          data.ballType,
          data.ballIsDot,
          data.ballRun,
          data.ballExtraRun,
          data.ballIsBoundry,
          data.ballFour,
          data.ballSix,
          data.ballIsWicket,
          data.ballWicketType,
          data.ballPlayerId,
          data.ballBowlerId,
          data.ballFielderId1,
          data.ballFielderId2,
          data.overIsMaiden,
          data.nextBatStrikeId,
          data.nextBatNonStrikeId,
          data.isDelete || false,
          data.commentaryBallByBallId,
          data.currentInnings,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateBallByBallCommentoriesQuery",
      request
    );
    throw new Error(err.message);
  }
};

const createCommentaryWicketQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_data as (
        insert into "tblCommentaryWickets" (
          "wrCommentaryId",
          "wrBowlerId",
          "wrBowlerName",
          "wrWicketType",
          "wrBatterId",
          "wrBatterName",
          "wrFieldPlayerId",
          "wrFieldPlayerName",
          "wrOverId",
          "wrOverCount",
          "wrCommentaryBallByBallId",
          "wrTeamId",
          "wrTeamScore",
          "wrPlayerRun",
          "wrPlayerBalls",
          "wrIsDelete",
          "wrWicketCount",
          "wrBallCount",
          "wrCurrentInnings" 
        ) values (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18,
          $19      
        )
        returning *
      )
    select 
    "wrCommentaryWicketId" as "commentaryWicketId",
    "wrCommentaryId" as "commentaryId",
    "wrBowlerId" as "bowlerId",
    "wrBowlerName" as "bowlerName",
    "wrWicketType" as "wicketType",
    "wrBatterId" as "batterId",
    "wrBatterName" as "batterName",
    "wrFieldPlayerId" as "fieldPlayerId",
    "wrFieldPlayerName" as "fieldPlayerName",
    "wrOverId" as "overId",
    "wrOverCount" as "overCount",
    "wrCommentaryBallByBallId" as "commentaryBallByBallId",
    "wrTeamId" as "teamId",
    "wrTeamScore" as "teamScore",
    "wrPlayerRun" as "playerRun",
    "wrPlayerBalls" as "playerBalls",
    "wrWicketCount" as "wicketCount",
    "wrBallCount" as "ballCount",
    "wrCurrentInnings" as "currentInnings"
    from "insert_data"
      `,
      {
        bind: [
          data.commentaryId,
          data.bowlerId,
          data.bowlerName,
          data.wicketType,
          data.batterId,
          data.batterName,
          data.fieldPlayerId,
          data.fieldPlayerName,
          data.overId,
          data.overCount,
          data.commentaryBallByBallId,
          data.teamId,
          data.teamScore,
          data.playerRun,
          data.playerBalls,
          data.isDelete || false,
          data.wicketCount,
          data.ballCount,
          data.currentInnings,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/createCommentaryWicketQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryWicketQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblCommentaryWickets" set
      "wrBowlerId" = $1,
      "wrBowlerName" = $2,
      "wrWicketType" = $3,
      "wrBatterId" = $4,
      "wrBatterName" = $5,
      "wrFieldPlayerId" = $6,
      "wrFieldPlayerName" = $7,
      "wrOverId" = $8,
      "wrOverCount" = $9,
      "wrCommentaryBallByBallId" = $10,
      "wrTeamId" = $11,
      "wrTeamScore" = $12,
      "wrPlayerRun" = $13,
      "wrPlayerBalls" = $14,
      "wrIsDelete" = $15,
      "wrWicketCount" = $16,
      "wrBallCount" = $17
      where "wrCommentaryWicketId" = $18
      AND "wrCurrentInnings" = $19
      `,
      {
        bind: [
          data.bowlerId,
          data.bowlerName,
          data.wicketType,
          data.batterId,
          data.batterName,
          data.fieldPlayerId,
          data.fieldPlayerName,
          data.overId,
          data.overCount,
          data.commentaryBallByBallId,
          data.teamId,
          data.teamScore,
          data.playerRun,
          data.playerBalls,
          data.isDelete || false,
          data.wicketCount,
          data.ballCount,
          data.commentaryWicketId,
          data.currentInnings,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateCommentaryWicketQuery",
      request
    );
    throw new Error(err.message);
  }
};

const UpdateCommentaryTimeQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrUpdateTime" = now()
      where "wrCommentaryId" = $1 and "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/UpdateCommentaryTimeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentaryID_Socket = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT
      "tblEncryptedData"."wrValue" AS "CommentaryId",
      "wrEventRefId" AS "EventID",
      "wrMarketID" AS "MarketID"
    FROM
      "tblCommentaries"
      LEFT JOIN "tblEncryptedData"
      ON "tblCommentaries"."wrCommentaryId" = "tblEncryptedData"."wrKey"
      WHERE
      "wrUpdateTime" > (CURRENT_TIMESTAMP - INTERVAL '1 second' * $1) AND "wrIsDelete" = false;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [process.env.COMMANTRY_UPDATE_TIME],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getCommentaryID_Socket",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryPlayerIdInCommentaryTeams = async (
  data,
  fastify,
  request
) => {
  try {
    // update for team1
    const query1 = `
    update "tblCommentaryTeams" set
        "wrCommentaryPlayerTeamCaptain" = $1,
        "wrCommentaryPlayerTeamKipper" = $2
      where "wrTeamId" = $3
      AND "wrCommentaryId" = $4
      AND "wrCurrentInnings" = $5
      AND "wrIsDelete" = false
    
    `;

    // update for team2
    const query2 = `
    update "tblCommentaryTeams" set
      "wrCommentaryPlayerTeamCaptain" = $1,
      "wrCommentaryPlayerTeamKipper" = $2
      where "wrTeamId" = $3
      AND "wrCommentaryId" = $4
      AND "wrCurrentInnings" = $5
      AND "wrIsDelete" = false
    `;

    await fastify.db.query(query1, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        data.team1Captain || null,
        data.team1Kipper || null,
        data.team1Id,
        data.commentaryId,
        data.currentInnings,
      ],
    });

    await fastify.db.query(query2, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        data.team2Captain || null,
        data.team2Kipper || null,
        data.team2Id,
        data.commentaryId,
        data.currentInnings,
      ],
    });

    return true;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryPlayerIdInCommentaryTeams",
      request
    );
    throw new Error(err.message);
  }
};
const updateMatchTypeInCommentaryQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrMatchTypeId" = $1 WHERE
      "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.matchTypeId, data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateMatchTypeInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const changeBowlerInCommentary = async (data, request, fastify) => {
  try {
    // update bowler in tblOver
    const query1 = `
    update "tblOvers" set
      "wrBowlerId" =$1
    WHERE 
      "wrCommentaryId" =$2
      AND "wrOverId" =$3
      AND "wrCurrentInnings" = $4
      AND "wrIsDelete" = false
    RETURNING "wrOverId" as "overId"
    `;
    const query2 = `
    update "tblCommentaryBallByBalls" set
      "wrBowler_ID" =$1
    WHERE 
      "wrCommentaryId" =$2
      AND "wrOverId" =$3
      AND "wrCurrentInnings" = $4
      AND "wrIsDeletedStatus" = false
    RETURNING "wrCommentaryBallByBallId" as "commentaryBallByBallId"
    `;

    const query3 = `
    update "tblCommentaryWickets" set
      "wrBowlerId" = $1
    WHERE 
      "wrCommentaryId" = $2
      AND "wrOverId" =$3
      AND "wrCurrentInnings" = $4
      AND "wrIsDeletedStatus" = false
    RETURNING "wrCommentaryWicketId" as "commentaryWicketId"
    `;

    const params = [
      data.bowlerId,
      data.commentaryId,
      data.overId,
      data.currentInnings,
    ];

    const overs = await fastify.db.query(query1, {
      type: fastify.db.QueryTypes.SELECT,
      bind: params,
    });

    const ballByBall = await fastify.db.query(query2, {
      type: fastify.db.QueryTypes.SELECT,
      bind: params,
    });

    const wickets = await fastify.db.query(query3, {
      type: fastify.db.QueryTypes.SELECT,
      bind: params,
    });
    // global.tblOvers = await getAllOversQuery(fastify);
    // global.tblCommentaryBallByBall = await getAllCommentaryBallByBallQuery(
    //   fastify
    // );
    // global.tblCommentaryWickets = await getAllCommentaryWicketQuery(fastify)
    for (let ov of overs){
      let index = global.tblOvers.findIndex((o) => o.overId === ov.overId);
      if (index !== -1) {
        global.tblOvers[index].bowlerId = data.bowlerId;
      }
    }
    for (let ball of ballByBall){
      let index = global.tblCommentaryBallByBall.findIndex(
        (b) => b.commentaryBallByBallId === ball.commentaryBallByBallId
      );
      if (index !== -1) {
        global.tblCommentaryBallByBall[index].bowlerId = data.bowlerId;
      }
    }
    for (let wicket of wickets){
      let index = global.tblCommentaryWicket.findIndex(
        (w) => w.commentaryWicketId === wicket.commentaryWicketId
      );
      if (index !== -1) {
        global.tblCommentaryWicket[index].bowlerId = data.bowlerId;
      }
    }

    let commentaryBallByBall = global.tblCommentaryBallByBall.filter(
      (ball) =>
        ball.commentaryId === data.commentaryId && ball.overId === data.overId
    );

    let commentaryWickets = global.tblCommentaryWicket.filter(
      (wicket) => wicket.commentaryId === data.commentaryId
    );

    return {
      commentaryBallByBall,
      commentaryWickets,
    };
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/changeBowlerInCommentary",
      request
    );
    throw new Error(error.message);
  }
};
const getCommentaryBallByBallQuery = async (request, fastify) => {
  return await fastify.db.query(
    `
    SELECT
        "wrCommentaryBallByBallId" AS "commentaryBallByBallId",
        "wrCommentaryId" AS "commentaryId",
        "wrTeamId" AS "teamId",
        "wrOverId" AS "overId",
        "wrOverCount" AS "overCount",
        "wrCurrentOverBalls" AS "currentOverBalls",
        "wrBowler_ID" AS "bowlerId",
        "wrBat_StrikeID" AS "batStrikeId",
        "wrBat_NONStrikeID" AS "batNonStrikeId",
        "wrBall_IsCount" AS "ballIsCount",
        "wrBall_Type" AS "ballType",
        "wrBall_IsDot" AS "ballIsDot",
        "wrBall_Run" AS "ballRun",
        "wrBall_ExtraRun" AS "ballExtraRun",
        "wrBall_isBoundry" AS "ballIsBoundry",
        "wrBall_FOUR" AS "ballFour",
        "wrBall_SIX" AS "ballSix",
        "wrBall_IsWicket" AS "ballIsWicket",
        "wrBall_WicketType" AS "ballWicketType",
        "wrBall_PlayerID" AS "ballPlayerId",
        "wrBall_BowlerID" AS "ballBowlerId",
        "wrBall_FielderID1" AS "ballFielderId1",
        "wrBall_FielderID2" AS "ballFielderId2",
        "wrOver_isMaiden" AS "overIsMaiden",
        "wrNextBat_StrikeID" AS "nextBatStrikeId",
        "wrNextBat_NONStrikeID" AS "nextBatNonStrikeId",
        "wrIsDelete" AS "isDelete",
        "wrCurrentInnings" AS "currentInnings",
        "wrAutoStrikeBallCount" as "autoStrikeBallCount"
    FROM "tblCommentaryBallByBalls"
    WHERE "wrCommentaryId" = $1 AND "wrIsDeletedStatus" = false
    ORDER BY "wrCommentaryBallByBallId" ASC
    `,
    {

      type: fastify.db.QueryTypes.SELECT,
      bind: [request.body.commentaryId],
    }
  );
};

const getCommnertySquadPlayersList = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `WITH CommentaryDetails AS (
        SELECT "wrCommentaryId","wrTeam1Id", "wrTeam2Id", "wrCommentaryStatus","wrCurrentInnings"
        FROM "tblCommentaries"
        WHERE "wrCommentaryId" =  $1 AND "wrIsDelete" = false
    ),
    TeamPlayers AS (
      SELECT
      "tblCommentaryPlayers"."wrCommentaryPlayerId" AS pid,
      p."wrPlayerName" AS pn,
            p."wrImage" AS pim,
           
            "tblCommentaryPlayers"."wrBatterOrder"  AS bato,
		        "tblCommentaryPlayers"."wrBowlerOrder"  AS bowo,
             CASE
                 WHEN "wrPlayerTypeId" = 1 THEN 'BatsMan'
                 WHEN "wrPlayerTypeId" = 2 THEN 'Bowler'
                 WHEN "wrPlayerTypeId" = 3 THEN 'WicketKeeper'
                 WHEN "wrPlayerTypeId" = 4 THEN 'AllRounder'
             END AS pty,
             CASE
                 WHEN "wrIsKipper" = true THEN 'true'
                 WHEN "wrIsKipper" = false THEN 'false'
             END AS isKep
      FROM "tblTeamPlayers" t
      INNER JOIN "tblCommentaryPlayers" ON "tblCommentaryPlayers"."wrPlayerId" = t."wrRefPlayerId"
                                     AND "tblCommentaryPlayers"."wrTeamId" = t."wrTeamId"
      INNER JOIN "tblPlayers" p ON p."wrPlayerId" = t."wrRefPlayerId"
      INNER JOIN CommentaryDetails ON "tblCommentaryPlayers"."wrTeamId" =  $2
      WHERE "tblCommentaryPlayers"."wrTeamId" = $2 AND "wrIsDelete" = false
            AND "tblCommentaryPlayers"."wrCommentaryId" = CommentaryDetails."wrCommentaryId"
            AND p."wrIsActive" = true
            AND "tblCommentaryPlayers"."wrCurrentInnings" = CommentaryDetails."wrCurrentInnings"
  )
  SELECT * FROM TeamPlayers;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.CommentaryId, data.teamId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getCommnertySquadPlayersList",
      request
    );
    throw new Error(err.message);
  }
};
const updateShowClientQuery = async (data, request, fastify) => {
  try {
    // update query
    return await fastify.db.query(
      `update "tblCommentaries" set
      "wrIsClientShow" = $1,
      "wrUpdateTime" = now()
      where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.isClientShow, data.commentaryId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateShowClientQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updatePlayerShowQuery = async (data, request, fastify) => {
  try {
    // update query
    return await fastify.db.query(
      `update "tblCommentaries" set
      "wrIsPlayersShow" = $1
      where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.isPlayersShow, data.commentaryId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updatePlayerShowQuery",
      request
    );
    throw new Error(error.message);
  }
};

const updateisPredictMarketInCommentaryQuery = async (
  data,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrIsPredictMarket" = $1 WHERE
      "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.isPredictMarket, data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateMatchTypeInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateResultInCommentaryQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrCommentaryResult" = $1 WHERE
      "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.result, data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateResultInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const saveCommentaryDetailsAPIQuery = async (data, fastify, request) => {
  try {
    // call the sp to save the commentary details
    const {
      commentaryDetails,
      commentaryTeams,
      commentaryOvers,
      commentaryBallByBall,
      commentaryWickets,
      commentaryPartnership,
      commentaryPlayers,
    } = data;

    const result = await fastify.db.query(
      `
        CALL proc_update_commentarydetails($1, $2 ,$3 ,$4,$5,$6 ,$7)
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryWickets ? JSON.stringify(commentaryWickets) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
        ],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/saveCommentaryDetailsAPIQuery",
      request
    );
    throw new Error(err.message);
  }
};
const activeInactiveCommentaryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrIsActive" = $1
        where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        bind: [data.isActive, data.commentaryId],
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/activeInactiveCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const closeCommentaryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrCommentaryStatus" = $1,
        "wrCommentaryCloseTime" = now()
        where "wrCommentaryId" = ANY($2) AND "wrIsDelete" = false
      `,
      {
        bind: [4, data.commentaryId],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/closeCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteAllCommentaryQuery = async (fastify) => {
  try {
    const result = await fastify.db.query(`SELECT delete_all_commentary()`, {
      type: fastify.db.QueryTypes.SELECT,
    });

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/deleteAllCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateDelayInCommentaryQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrDelay" = $1 WHERE
      "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.delay, data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateDelayInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateEventRefIdInCommentaryQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrEventRefId" = $1 WHERE
      "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.eventRefId, data.commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateEventRefIdInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteCommentaryDataQuery = async (data, fastify, request) => {
  try {
    const isDelete = true;
    const deletedBy = request.userTokenInfo.WrUserId;
    const result = await fastify.db.query(
      `
        CALL proc_delete_commentary_data($1,$2,$3,$4,$5,$6)
      `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [
          data.deleteBallByBall || null,
          data.deleteOver || null,
          data.deleteWickets || null,
          data.deletePartnership || null,
          isDelete,
          deletedBy,
        ],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/deleteCommentaryDataQuery",
      request
    );
    throw new Error(err.message);
  }
};
const getCommentaryDetailByIdQuery = async (data, fastify) => {
  try {
    const commentary = await fastify.db.query(
      `
              SELECT 
              "wrCommentaryId" as "commentaryId",
              "wrEventRefId" as "eventId",
              "wrEventName" as "eventName",
              "wrEventDate" as "eventDate",
              "wrCommentaryStatus" as "status",
              tm."wrMatchType" as "matchType",
              te."wrEventType" as "eventType",
              tco."wrCompetition" as "competition",
              "wrIsPredictMarket" as "isPredictMarket",
              tc."wrCommentaryCloseTime" as "commentaryCloseTime"
          FROM "tblCommentaries" tc
          LEFT JOIN "tblMatchTypes" tm ON tc."wrMatchTypeId" = tm."wrMatchTypeId"
          LEFT JOIN "tblEventTypes" te ON tc."wrEventTypeId" = te."wrEventTypeId"
          LEFT JOIN "tblCompetitions" tco ON tc."wrCompetitionId" = tco."wrCompetitionId"
          WHERE "wrCommentaryId" = $1 AND "wrIsDelete" = false  
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryId],
      }
    );

    return commentary[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/getCommentaryDetailByIdQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updateMaxOverDetailQuery = async (data, fastify, request) => {
  try {
    const query = `
        update "tblCommentaryTeams" set
        "wrTeamMaxOver" = $1
        where "wrCommentaryId" = $2 AND "wrIsDelete" = false
    `;

    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [data.teamMaxOver, data.commentaryId],
    });

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateMaxOverDetailQuery",
      request
    );
    throw new Error(error.message);
  }
};
const upOverDLSQuery = async (data, fastify, request) => {
  try {
     const result = await fastify.db.query(
      `update "tblCommentaryTeams" SET
        "wrTeamMaxOver" = $1,
        "wrTeamTrialRuns" = $2
      WHERE "wrCommentaryTeamId" = $3 AND "wrIsDelete" = false
      `,
      {
        bind: [
          data.teamMaxOver,
          data.teamTrialRuns,
          data.commentaryTeamId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/upOverDLSQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const updateSuperOverCommentaryQuery = async (data, fastify) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrCurrentInnings" = $2
      ,"wrCommentaryStatus" = 2
      where "wrCommentaryId" = $1	and "wrIsDelete" = false
      `,
      {
        bind: [
          data.commentaryId || null,
          data.currentInnings || null,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertCommentarySuperOverTeams = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `
      insert into "tblCommentaryTeams" ("wrCommentaryId" , "wrTeamId","wrTeamCaptain","wrTeamKipper" , "wrShortName" , "wrTeamName","wrCurrentInnings","wrIsBattingComplete"
      , "wrTeamColor" , "wrBackgroundColor" , "wrTeamMaxOver", "wrIsSuperOver")
       values (
        $1,
        $2,
        $3,
        $4,
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = $2),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = $2),
        $8,
        false,
        (select "wrTeamColor" from "tblTeams" where "wrTeamId" = $2),
        (select "wrBackgroundColor" from "tblTeams" where "wrTeamId" = $2),
        $9,
        $10             
      )
      ,(
        $1,
        $5,
        $6,
        $7,
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = $5),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = $5),
        $8,
        false,
        (select "wrTeamColor" from "tblTeams" where "wrTeamId" = $5),
        (select "wrBackgroundColor" from "tblTeams" where "wrTeamId" = $5),
        $9,
        $10 
      )
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          request.body.data.commentaryId,
          request.body.data.team1Id,
          request.body.data.team1Captain || null,
          request.body.data.team1Kipper || null,
          request.body.data.team2Id,
          request.body.data.team2Captain || null,
          request.body.data.team2Kipper || null,
          request.body.data.currentInnings,
          request.body.data.teamMaxOver || null,
          true
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCommentaryBattingTeamQuery = async (data, fastify) => {
  try {

     await fastify.db.query(
      `update "tblCommentaryTeams" set 
      "wrTeamStatus" = 1
      where "wrCommentaryId" = $1 AND "wrCurrentInnings" = $2 AND "wrTeamId" = $3 AND "wrIsDelete" = false
      `,
      {
        bind: [
          data.commentaryId || null,
          data.currentInnings || null,
          data.battingTeamId || null,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );

    await fastify.db.query(
      `update "tblCommentaryTeams" set 
      "wrTeamStatus" = 2
      where "wrCommentaryId" = $1 AND "wrCurrentInnings" = $2 AND "wrTeamId" <> $3 AND "wrIsDelete" = false
      `,
      {
        bind: [
          data.commentaryId || null,
          data.currentInnings || null,
          data.battingTeamId || null,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    
    return { success: true };
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryBattingTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};
// const updateCommentaryTeamPredictionPrecentageQuery = async (data, fastify) => {
//   try {
//     return await fastify.db.query(
//       `update "tblCommentaryTeams" set 
//       "wrTeamPredictionPercentage" = $1
//       where "wrCommentaryTeamId" = $2
//       `,
//       {
//         bind: [
//           data.teamPredictionPercentage || null,
//           data.commentaryTeamId || null,
//         ],

//         type: fastify.db.QueryTypes.UPDATE,
//       }
//     );
//   } catch (err) {
//     errorLogger(
//       fastify,
//       err.message,
//       "DB ERROR --> repository/TableConfig/updateConfigQuery",
//       request
//     );
//     throw new Error(err.message);
//   }
// };

const updateCommentaryTeamPredictionPrecentageQuery = async (data, fastify) => {
  try {

     await fastify.db.query(
      `update "tblCommentaryTeams" set 
      "wrTeamPredictionPercentage" = $1
      where "wrCommentaryId" = $2 AND "wrCurrentInnings" = $3 AND "wrCommentaryTeamId" = $4 AND "wrIsDelete" = false
      `,
      {
        bind: [
          data.teamPredictionPercentage || null,
          data.commentaryId || null,
          data.currentInnings || null,
          data.commentaryTeamId || null,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    // await fastify.db.query(
    //   `update "tblCommentaryTeams" set 
    //   "wrTeamPredictionPercentage" = $1
    //   where "wrCommentaryId" = $2 AND "wrCurrentInnings" = $3 AND "wrCommentaryTeamId" <> $4
    //   `,
    //   {
    //     bind: [
    //       data.team2PredictionPercentage || null,
    //       data.commentaryId || null,
    //       data.currentInnings || null,
    //       data.commentaryTeamId || null,
    //     ],

    //     type: fastify.db.QueryTypes.UPDATE,
    //   }
    // );
    
    return { success: true };
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryTeamPredictionPrecentageQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTeamPrediction = async (request, fastify) => {
  const { commentaryId } = request.body;

  try {
    // Get wrTeam1Id, wrTeam2Id, and wrIsTeamPredictionOn from tblCommentaries
    const result = await fastify.db.query(
      `SELECT "wrTeam1Id", "wrTeam2Id", "wrIsTeamPredictionOn" FROM "tblCommentaries" WHERE "wrCommentaryId" = $1
      AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId],
      }
    );

    if (result.length === 0) {
      throw new Error("No commentary found with the given ID");
    }

    const { wrTeam1Id, wrTeam2Id, wrIsTeamPredictionOn } = result[0];

    // Toggle the value of wrIsTeamPredictionOn
    const newWrIsTeamPredictionOn = !wrIsTeamPredictionOn;

    // Update wrIsTeamPredictionOn in tblCommentaries
    await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrIsTeamPredictionOn" = $1 WHERE "wrCommentaryId" = $2 AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [newWrIsTeamPredictionOn, commentaryId],
      }
    );

    // If wrIsTeamPredictionOn is now false, update wrTeamPredictionPercentage
    if (!newWrIsTeamPredictionOn) {
      await fastify.db.query(
        `UPDATE "tblCommentaryTeams" SET "wrTeamPredictionPercentage" = NULL WHERE "wrTeamId" IN ($1, $2)`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [wrTeam1Id, wrTeam2Id],
        }
      );
    }
    
    return { message: "Update successful" };
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updatePlayerShowAndTeamPrediction",
      request
    );
    throw new Error(error.message);
  }
};
const updateAverageOfPlayerQuery = async (data, request,fastify) => {
  try {
    let result = await fastify.db.query(
      `update "tblCommentaryPlayers" set
      "wrBatsmanAverage" = $1
      where "wrCommentaryPlayerId" = $2
      `,
      {
        bind: [data.batsmanAverage, data.commentaryPlayerId],
      }
    );

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateAverageOfPlayerQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const updateBoundaryOfPlayerQuery = async (data, request,fastify) => {
  try {
    let result = await fastify.db.query(
      `update "tblCommentaryPlayers" set
      "wrBoundary" = $1
      where "wrCommentaryPlayerId" = $2
      `,
      {
        bind: [data.boundary, data.commentaryPlayerId],
      }
    );

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateAverageOfPlayerQuery",
      request
    );
    throw new Error(error.message);
    
  }
}

const updateLineRationQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaries" set
      "wrLineRatio" = $1
      where "wrCommentaryId" = $2 and "wrIsDelete" = false`,
      {
        bind: [data.lineRatio, data.commentaryId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateLineRationQuery",
      request
    );
    throw new Error(error.message);
  }
}
const updateLineRatioComQuery = async (data, request, fastify) => {
  try {
    // console.log(data);
    let query = `
      CALL update_lineratio_commentary($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.commentaryId,
        data.marketTypeId,
        data.marketTypeCategoryId,
        data.maxOver,
        data.sumOfRunPerBall,
        data.status,
        null ,
        null,
        null
      ],
    });

    // console.log(result);
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateLineRatioComQuery",
      request
    );
    throw new Error(error.message);
  }
}
const completedCommentaryStatusQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrCommentaryStatus" = $1
        where "wrCommentaryId" = ANY($2) AND "wrIsDelete" = false
      `,
      {
        bind: [5, data],
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/completedCommentaryStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};


const insertCommentaryConsoleFeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as (
        insert into "tblCommnetryConsoleFe" 
        (
         "over",
         "ballCount",
         "currentState",
         "temporaryState",
         "commentaryId", 
         "teamScore", 
         "createby", 
         "createdDate",
         "wrBallHistoryData"
        ) 
        values ($1, 
         $2,
         $3, 
         $4,
         $5,
         $6, 
         $7, 
         $8,$9) 
        returning *
      )
      select 
        "over",
        "ballCount",
        "teamScore",
        "createby",
        "createdDate"
      from "insert_data"
      `,
      {
        bind: [
          data.over || null,
          data.ballCount || null,
          data.currentState || null,
          data.temporaryState || null,
          data.commentaryId || null,
          data.teamScore || null,
          data.createby,
          new Date(),
          data.ballHistoryData || null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentaryConsoleFe/insertCommentaryConsoleFeQuery",
      request
    );
    throw new Error(err.message);
  }
};
const revertCommentaryQuery = async (data, fastify, request) => {
  try {
    let result = await fastify.db.query(
      ` 
        CALL proc_revert_commentary($1,$2,$3,$4)
      `,
      {
        bind: [data.commentaryId, null , null ,
          request.userTokenInfo.WrUserId
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/revertCommentaryQuery",
      request
    );
    throw new Error(error.message);
  }
}
const updatePbfOfPlayerQuery = async (data, request,fastify) => {
  try {
    let result = await fastify.db.query(
      `update "tblCommentaryPlayers" set
      "wrPlayerBallFaced" = $1
      where "wrCommentaryPlayerId" = $2
      `,
      {
        bind: [data.ballsFaced, data.commentaryPlayerId],
      }
    );

    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updatePbfOfPlayerQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const getTemplateByComIdQuery = async (data,request, fastify) => {
  try {
    let r1 = await fastify.db.query(
      `
        SELECT  
          tcm."wrId" as "id",
          "wrCommentaryId" as "commentaryId",
          "wrMarketTemplateId" as "marketTemplateId",
          tmt."wrTemplateName" as "templateName",
          tmt1."wrId" as "marketTypeId",
          tmc."wrId" as "marketTypeCategoryId",
          "wrMarketTypeName" as "marketTypeName",
          "wrCategoryName" as "categoryName"
        FROM "tblCommMatchTypeTemplate" tcm
        LEFT JOIN "tblMarketTemplates" tmt ON tcm."wrMarketTemplateId" = tmt."wrID"
        LEFT JOIN "tblMarketTypes" tmt1 ON tmt."wrMarketTypeId" = tmt1."wrId"
        LEFT JOIN "tblMarketTypeCategories" tmc ON tmt."wrMarketTypeCategoryId" = tmc."wrId"
        WHERE tcm."wrCommentaryId" = $1
        AND tmt."wrIsDeleted" = false
        AND tmt."wrIsActive" = true
        ORDER BY tmc."wrDisplayOrder" ASC, tmt."wrTemplateName" ASC;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryId],
      }
    );

    let r2 = await fastify.db.query(
      `
        SELECT 
          tmt."wrID" as "marketTemplateId",
          tmt."wrTemplateName" as "templateName",
          "wrMarketTypeName" as "marketTypeName",
          "wrCategoryName" as "categoryName",
          tmt1."wrId" as "marketTypeId",
          tmc."wrId" as "marketTypeCategoryId"
        FROM "tblMarketTemplates" tmt
        LEFT JOIN "tblMarketTypes" tmt1 ON tmt."wrMarketTypeId" = tmt1."wrId"
        LEFT JOIN "tblMarketTypeCategories" tmc ON tmt."wrMarketTypeCategoryId" = tmc."wrId"
        WHERE tmt."wrIsDeleted" = false
        AND tmt."wrMatchTypeID" = $1
        AND tmt."wrIsActive" = true
        AND tmt."wrID" NOT IN (
          SELECT "wrMarketTemplateId" FROM "tblCommMatchTypeTemplate" WHERE "wrCommentaryId"= $2
        ) 
        ORDER BY tmc."wrDisplayOrder" ASC, tmt."wrTemplateName" ASC;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.matchTypeId, data.commentaryId],
      }
    );

    return {
      assignedTemplates: r1,
      unassignedTemplates: r2,
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/getTemplateByComIdQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const saveComTemplateQuery = async (data, request, fastify) => {
  try {
    if(data.dltTemplate.length > 0) {
      await fastify.db.query(
        `
          DELETE FROM "tblCommMatchTypeTemplate" WHERE "wrId" = ANY($1)
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind : [data.dltTemplate]
        }
      );
   }

   if(data.saveTemplates.length > 0) {

      const existingTemp = await fastify.db.query(
        `
          SELECT "wrMarketTemplateId" as "marketTemplateId" FROM "tblCommMatchTypeTemplate" WHERE "wrCommentaryId" = $1
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [data.saveTemplates[0].commentaryId],
        }
      );

      let templateToSave = []
      if (existingTemp.length > 0) {
        templateToSave = data.saveTemplates.filter((item) => !existingTemp.map((temp) => temp.marketTemplateId).includes(item.marketTemplateId));
      } 
      else {
        templateToSave = data.saveTemplates;
      }
      if(templateToSave.length > 0) {
        	await fastify.db.query(
        `
          INSERT INTO "tblCommMatchTypeTemplate" ("wrCommentaryId", "wrMarketTemplateId", "wrCreatedBy", "wrCreatedAt")
          VALUES 
          ${templateToSave.map((item) => `(${item.commentaryId}, ${item.marketTemplateId}, ${request.userTokenInfo.WrUserId}, now())`).join(",")}
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
        }
      );
    }
    }

    return true;


  } catch (error) {
    console.log(error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/saveComTemplateQuery",
      request
    );
    throw new Error(error.message);
  }
}

const getCommentaryBallByBallByIdsQuery = async (commentaryBallByBallId, request, fastify) => {
  try {
    return await fastify.db.query(
      `select
      "wrCommentaryBallByBallId" as "commentaryBallByBallId",
      "wrCommentaryId" as "commentaryId",
      "wrTeamId" as "teamId",
      "wrOverId" as "overId",
      "wrOverCount" as "overCount",
      "wrCurrentOverBalls" as "currentOverBalls",
      "wrBowler_ID" as "bowlerId",
      "wrBat_StrikeID" as "batStrikeId",
      "wrBat_NONStrikeID" as "batNonStrikeId",
      "wrBall_IsCount" as "ballIsCount",
      "wrBall_Type" as "ballType",
      "wrBall_IsDot" as "ballIsDot",
      "wrBall_Run" as "ballRun",
      "wrBall_ExtraRun" as "ballExtraRun",
      "wrBall_isBoundry" as "ballIsBoundry",
      "wrBall_FOUR" as "ballFour",
      "wrBall_SIX" as "ballSix",
      "wrBall_IsWicket" as "ballIsWicket",
      "wrBall_WicketType" as "ballWicketType",
      "wrBall_PlayerID" as "ballPlayerId",
      "wrBall_BowlerID" as "ballBowlerId",
      "wrBall_FielderID1" as "ballFielderId1",
      "wrBall_FielderID2" as "ballFielderId2",
      "wrOver_isMaiden" as "overIsMaiden",
      "wrNextBat_StrikeID" as "nextBatStrikeId",
      "wrNextBat_NONStrikeID" as "nextBatNonStrikeId",
      "wrIsDelete" as "isDelete",
      "wrCurrentInnings" as "currentInnings",
      "wrCreatedDate" as "createdDate",
      "wrAutoStrikeBallCount" as "autoStrikeBallCount"
      from "tblCommentaryBallByBalls"
      WHERE "wrCommentaryBallByBallId" = ANY($1) AND "wrIsDeletedStatus" = false
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryBallByBallId]
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary.js/getCommentaryBallByBallByIdsQuery",
      request
    );
    throw new Error(error.message);
  }
}

const insertWagonWheelPositionQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCommentaryBallByBalls" SET 
              "wrX2" = $1,"wrY2" = $2,"wrShortType" = $3, "wrCommentryRemark" = $4
              where "wrCommentaryBallByBallId" = $5
          RETURNING 
              "wrX2" AS "x2",
              "wrY2" AS "y2",
              "wrShortType" AS "shortType",
              "wrCommentryRemark" AS "commentryRemark",
              "wrCommentaryBallByBallId" AS "commentaryBallByBallId";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.x2, data.y2, data.shortType || null, data.commentryRemark || null, data.commentaryBallByBallId],
      }
    );
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary.js/insertWagonWheelPositionQuery",
      request
    );
    throw new Error(error.message);
  }
}
const updateShotTypeQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE 
        "tblCommentaries" SET
        "wrShotType" = $1
        WHERE "wrCommentaryId" = $2
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.shotType, data.commentaryId],
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary.js/updateShotTypeQuery",
      request
    );
    throw new Error(error.message);
  }
}
const updateIsWheelShowQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE 
        "tblCommentaries" SET
        "wrIsWheelShow" = $1
        WHERE "wrCommentaryId" = $2
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.isWheelShow, data.commentaryId],
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary.js/updateIsWheelShowQuery",
      request
    );
    throw new Error(error.message);
  }
}

const cancelCommentaryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrCommentaryStatus" = $1,
        "wrCommentaryResult" = $2,
        "wrCommentaryCloseTime" = now()
        where "wrCommentaryId" = ANY($3) AND "wrIsDelete" = false
      `,
      {
        bind: [4, "Abandoned", data.commentaryId],
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/cancelCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentariesResultQuery = async (request, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT DISTINCT
      tc."wrCommentaryId" as "commentaryId",
      tc."wrTeam1Id" as "team1Id",
      tc."wrTeam2Id" as "team2Id",
      tt1."wrTeamName" as "team1Name",
      tt2."wrTeamName" as "team2Name",
      tc."wrCompetitionId" as "competitionId",
	    co."wrCompetition" as "competition",
      tc."wrEventId" as "eventId",
      tc."wrEventDate" as "eventDate",
      tc."wrEventName" as "eventName",
      tc."wrTossWonBy" as "tossWonBy",
      tt3."wrTeamName" as "tossWonTeam",
      tc."wrWinnerId" as "winnerId",
      tc."wrWinnerName" as "winnerName",
      tc."wrCommentaryResult" as "result",
      tct1."wrTeamScore" as "team1Score",
      tct1."wrTeamOver" as "team1Over",
      tct1."wrTeamWicket" as "team1Wicket",
      tct2."wrTeamScore" as "team2Score",
      tct2."wrTeamOver" as "team2Over",
      tct2."wrTeamWicket" as "team2Wicket",
      tc."wrIsCountInPoint" as "isCountInPoint"
      FROM "tblCommentaries" tc
      LEFT JOIN "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      LEFT JOIN "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      LEFT JOIN "tblTeams" tt3 on tt3."wrTeamId" = tc."wrTossWonBy"
	    LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
	    LEFT JOIN "tblCommentaryTeams" tct1 
        ON tc."wrCommentaryId" = tct1."wrCommentaryId" 
        AND tc."wrTeam1Id" = tct1."wrTeamId"
      LEFT JOIN "tblCommentaryTeams" tct2 
        ON tc."wrCommentaryId" = tct2."wrCommentaryId" 
        AND tc."wrTeam2Id" = tct2."wrTeamId"
      WHERE tc."wrIsDelete" = false 
      AND tc."wrIsActive" = true
      AND tc."wrIsCountInPoint" = true
      AND tc."wrCommentaryStatus" = 4`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getCommentariesResultQuery",
      request
    );
    throw new Error(err.message);
  }
};

const isCountInPOintCommentaryChangeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `update "tblCommentaries" set
        "wrIsCountInPoint" = $1
        where "wrCommentaryId" = $2 and "wrIsDelete" = false
      `,
      {
        bind: [data.isCountInPoint, data.commentaryId],
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/isCountInPOintCommentaryChangeQuery",
      request
    );
    throw new Error(err.message);
  }
};


const getAllCommentaryHistoryQuery = async (whereCondition, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT 
            tc."wrCommentaryId" as "commentaryId",
            tc."wrMatchTypeId" as "matchTypeId",
            mt."wrMatchType" AS "matchType",
            tc."wrEventTypeId" as "eventTypeId",
            tet."wrEventType" as "eventType",
            tc."wrTeam1Id" as "team1Id",
            tc."wrTeam2Id" as "team2Id",
            tt1."wrTeamName" as "team1Name",
            tt2."wrTeamName" as "team2Name",
            tc."wrCompetitionId" as "competitionId",
	          co."wrCompetition" as "competition",
            tc."wrEventId" as "eventId",
            tc."wrEventDate" as "eventDate",
            tc."wrEventName" as "eventName",
            tc."wrEventRefId" as "eventRefId",
            tc."wrLocation" as "location",
            tc."wrWeather" as "weather",
            tc."wrPitch" as "pitch",
            tc."wrHomeSideTeam" as "homeSideTeam",
            tc."wrTossWonBy" as "tossWonBy",
            tc."wrChoseTo" as "choseTo",
            tc."wrWinnerId" as "winnerId",
            tc."wrWinnerName" as "winnerName",
            tc."wrIsClientShow" as "isClientShow",
            tc."wrDisplayStatus" as "displayStatus",
            tc."wrRmk" as "rmk",
            tc."wrCommentaryUserId" as "commentaryUserId",
            tc."wrCommentaryStatus" as "commentaryStatus",
            tc."wrUpdateTime" as "updateTime",
            tc."wrIsMatchDraw" as "isMatchDraw",
            tc."wrTarget" as "target",
            tc."wrMarketID" as "marketId",
            tc."wrTpId" as "tpId",
            tc."isSignalROn" as "isSignalROn",
            tc."isMatchTypeUpdated" as "isMatchTypeUpdated",
            tc."wrCurrentInnings" as "currentInnings",
            tc."wrSystemPlayerCount" as "systemPlayerCount",
            tc."wrIsPlayersShow" as "isPlayersShow",
            tc."wrIsPredictMarket" as "isPredictMarket",
            tc."wrIsActive"  as "isActive",
            tc."wrDelay" as "delay",
            tc."wrLineRatio" as "lineRatio",
            tc."wrCommentaryResult" as "result",
            tc."wrCommentaryCloseTime" as "commentaryCloseTime",
            tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
            tu."WrUserName" as "createdBy",
            tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
            mt2."wrMatchType" AS "historyMatchType",
            tc."wrIsCountInPoint" as "isCountInPoint",
            tc."wrShotType" as "shotType",
            tc."wrIsWheelShow" as "isWheelShow"
      FROM "tblCommentaries" tc
      LEFT JOIN "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      LEFT JOIN "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
      LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId"
      LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId"
	    LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
      LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
      ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/isCountInPOintCommentaryChangeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCommentryHistoryQuery = async (commentaryId, request, fastify) => {
  try {
    return await fastify.db.query(`CALL proc_delete_commentary_data_and_related_data($1)`,
      {
        bind: [commentaryId], 
        type: fastify.db.QueryTypes.RAW,
      }
      );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/deleteCommentryHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommPlayersByCommentaryIdQuery = async (commentaryId, request, fastify) => {
  try {
    return await fastify.db.query(
      `select
          tcp."wrCommentaryPlayerId" as "commentaryPlayerId",
          tcp."wrCommentaryId" as "commentaryId",
          tcp."wrTeamId" as "teamId",
          tcp."wrPlayerId" as "playerId"
      from "tblCommentaryPlayers" AS tcp
      LEFT JOIN "tblPlayers" AS tp ON tcp."wrPlayerId" = tp."wrPlayerId"
      WHERE tcp."wrIsDelete" = FALSE AND tcp."wrIsInPlayingEleven" = TRUE
      AND "wrCommentaryId" = $1;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [commentaryId]
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getCommPlayersByCommentaryIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllCompletedCommentaryQuery = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
          CAST(ROW_NUMBER() OVER () AS INT) AS rno,
          tc."wrEventRefId" AS "eid",
          tet."wrEventType" AS "ety",
          mt."wrMatchType" AS "mtyp",
          mt2."wrMatchType" AS "hmtyp",
          COALESCE(co."wrCompetition", '') AS "com",
          tc."wrCompetitionId" AS "compId",
          tc."wrCurrentInnings" AS "ci",
          tc."wrEventName" AS "en",
          TO_CHAR(TIMEZONE('Asia/Kolkata', tc."wrEventDate"), 'DD/MM/YYYY') AS "ed",
          TO_CHAR(TIMEZONE('Asia/Kolkata', tc."wrEventDate"), 'HH12:MI:SS') AS "et",
          TO_CHAR(tc."wrEventDate" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS "utc",
          tct3."wrTeamName" AS "twonby",
          CASE
            WHEN tc."wrChoseTo" IS NULL THEN NULL
            WHEN tc."wrChoseTo" = 1 THEN 'BAT'
            ELSE 'BOWL'
          END AS "choseto",
          tt1."wrTeamName" AS "te1n",
          tt2."wrTeamName" AS "te2n",
          tct1."wrShortName" AS "s1n",
          tct2."wrShortName" AS "s2n",
          COALESCE(tt1."wrImage", '') AS "te1i",
          COALESCE(tt2."wrImage", '') AS "te2i",
          COALESCE(tt1."WrTeamJersey", '') AS "t1jr",
          COALESCE(tt2."WrTeamJersey", '') AS "t2jr",
          COALESCE(tc."wrLocation", '') AS "loc",
          false AS isrun,
          COALESCE(
            CASE 
              WHEN tct1."wrTeamScore" IS NOT NULL THEN 
                COALESCE(tct1."wrTeamScore"::TEXT, '0') || '/' || 
                COALESCE(tct1."wrTeamWicket"::TEXT, '0') || '(' || 
                COALESCE(tct1."wrTeamOver"::TEXT, '0') || ')'
              ELSE '0/0(0)'
            END, 
            '0/0(0)'
          ) AS t1s,
          COALESCE(
            CASE 
              WHEN tct2."wrTeamScore" IS NOT NULL THEN 
                COALESCE(tct2."wrTeamScore"::TEXT, '0') || '/' || 
                COALESCE(tct2."wrTeamWicket"::TEXT, '0') || '(' || 
                COALESCE(tct2."wrTeamOver"::TEXT, '0') || ')'
              ELSE '0/0(0)'
            END, 
            '0/0(0)'
          ) AS t2s,
          tc."wrDisplayStatus" AS "dis",
          COALESCE(tc."wrRmk", '') AS "rmk",
          COALESCE(CAST(tct1."wrCrr" AS FLOAT), 0) AS "te1crr",
          COALESCE(CAST(tct2."wrCrr" AS FLOAT), 0) AS "te2crr",
          COALESCE(CAST(tct1."wrRrr" AS FLOAT), 0) AS "te1rrr",
          COALESCE(CAST(tct2."wrRrr" AS FLOAT), 0) AS "te2rrr",
          0 AS crr,
          0 AS rrr,
          tc."wrCommentaryStatus" AS "cst",
          COALESCE(tc."wrCommentaryResult", '') AS "res",
          CASE 
              WHEN tc."wrCurrentInnings" > 1 
              THEN (
                  SELECT jsonb_agg(
                      jsonb_build_object(
                          'inning', t."wrCurrentInnings",
                          't1s', COALESCE(t1."wrTeamScore" || '/' || COALESCE(t1."wrTeamWicket"::TEXT, '0') || 
                                   '(' || COALESCE(t1."wrTeamOver"::TEXT, '0.0') || ')', '0/0(0.0)'),
                          't2s', COALESCE(t2."wrTeamScore" || '/' || COALESCE(t2."wrTeamWicket"::TEXT, '0') || 
                                   '(' || COALESCE(t2."wrTeamOver"::TEXT, '0.0') || ')', '0/0(0.0)')
                      )
                  ) 
                  FROM (
                      SELECT DISTINCT t."wrCommentaryId", t1."wrCurrentInnings", t."wrTeam1Id", t."wrTeam2Id"
                      FROM "tblCommentaries" t
                      JOIN "tblCommentaryTeams" t1 ON t."wrCommentaryId" = t1."wrCommentaryId"
                      WHERE t."wrCommentaryId" = tc."wrCommentaryId"
                        AND t1."wrCurrentInnings" <= tc."wrCurrentInnings"
                      ORDER BY t1."wrCurrentInnings" ASC
                  ) AS t
                  LEFT JOIN "tblCommentaryTeams" t1 ON t1."wrCommentaryId" = t."wrCommentaryId" 
                      AND t1."wrTeamId" = t."wrTeam1Id" 
                      AND t1."wrCurrentInnings" = t."wrCurrentInnings"
                  LEFT JOIN "tblCommentaryTeams" t2 ON t2."wrCommentaryId" = t."wrCommentaryId" 
                      AND t2."wrTeamId" = t."wrTeam2Id" 
                      AND t2."wrCurrentInnings" = t."wrCurrentInnings"
              ) 
              ELSE '[]'::jsonb 
          END AS tsi,
          tct1."wrBackgroundColor" AS "t1bg",
          tct2."wrBackgroundColor" AS "t2bg",
          tct1."wrTeamColor" AS "t1co",
          tct2."wrTeamColor" AS "t2co",
          NULL AS batid,
          NULL AS ballid,
          tc."wrTeam1Id" AS "t1id",
          tc."wrTeam2Id" AS "t2id",
          tc."wrIsPredictMarket" AS "isPr",
          tc."wrIsClientShow" AS "ics"
      FROM "tblCommentaries" tc
      LEFT JOIN "tblTeams" tt1 ON tt1."wrTeamId" = tc."wrTeam1Id" AND tt1."wrIsDeleted" = false
      LEFT JOIN "tblTeams" tt2 ON tt2."wrTeamId" = tc."wrTeam2Id" AND tt2."wrIsDeleted" = false
      LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId" AND mt."wrIsDeleted" = false
      LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId" AND mt2."wrIsDeleted" = false
      LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId" AND tet."wrIsDeleted" = false
      LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId" AND co."wrIsDeleted" = false
      LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
      LEFT JOIN "tblCommentaryTeams" tct1 ON tct1."wrCommentaryId" = tc."wrCommentaryId"
          AND tct1."wrTeamId" = tc."wrTeam1Id" 
          AND tct1."wrCurrentInnings" = tc."wrCurrentInnings" AND tct1."wrIsDelete" = false
      LEFT JOIN "tblCommentaryTeams" tct2 ON tct2."wrCommentaryId" = tc."wrCommentaryId"
          AND tct2."wrTeamId" = tc."wrTeam2Id" 
          AND tct2."wrCurrentInnings" = tc."wrCurrentInnings" AND tct2."wrIsDelete" = false
      LEFT JOIN "tblCommentaryTeams" tct3 ON tct3."wrCommentaryId" = tc."wrCommentaryId"
          AND tct3."wrTeamId" = tc."wrTossWonBy" 
          AND tct3."wrCurrentInnings" = tc."wrCurrentInnings" AND tct3."wrIsDelete" = false
      WHERE tc."wrCommentaryStatus" = 4 AND tc."wrIsDelete" = false;`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    console.log("error", err)
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getAllCompletedCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentariesDataByDifferentIdsQuery = async (whereCondition, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
          tc."wrCommentaryId" as "commentaryId",
          tc."wrMatchTypeId" as "matchTypeId",
          mt."wrMatchType" AS "matchType",
          tc."wrEventTypeId" as "eventTypeId",
          tet."wrEventType" as "eventType",
          tc."wrTeam1Id" as "team1Id",
          tc."wrTeam2Id" as "team2Id",
          tt1."wrTeamName" as "team1Name",
          tt2."wrTeamName" as "team2Name",
          tc."wrCompetitionId" as "competitionId",
	        co."wrCompetition" as "competition",
          tc."wrEventId" as "eventId",
          tc."wrEventDate" as "eventDate",
          tc."wrEventName" as "eventName",
          tc."wrEventRefId" as "eventRefId",
          tc."wrLocation" as "location",
          tc."wrWeather" as "weather",
          tc."wrPitch" as "pitch",
          tc."wrHomeSideTeam" as "homeSideTeam",
          tc."wrTossWonBy" as "tossWonBy",
          tc."wrChoseTo" as "choseTo",
          tc."wrWinnerId" as "winnerId",
          tc."wrWinnerName" as "winnerName",
          tc."wrIsClientShow" as "isClientShow",
          tc."wrDisplayStatus" as "displayStatus",
          tc."wrRmk" as "rmk",
          tc."wrCommentaryUserId" as "commentaryUserId",
          tc."wrCommentaryStatus" as "commentaryStatus",
          tc."wrUpdateTime" as "updateTime",
          tc."wrIsMatchDraw" as "isMatchDraw",
          tc."wrTarget" as "target",
          tc."wrMarketID" as "marketId",
          tc."wrTpId" as "tpId",
          tc."isSignalROn" as "isSignalROn",
          tc."isMatchTypeUpdated" as "isMatchTypeUpdated",
          tc."wrCurrentInnings" as "currentInnings",
          tc."wrSystemPlayerCount" as "systemPlayerCount",
          tc."wrIsPlayersShow" as "isPlayersShow",
          tc."wrIsPredictMarket" as "isPredictMarket",
          tc."wrIsActive"  as "isActive",
          tc."wrDelay" as "delay",
          tc."wrLineRatio" as "lineRatio",
          tc."wrCommentaryResult" as "result",
          tc."wrCommentaryCloseTime" as "commentaryCloseTime",
          tc."wrIsTeamPredictionOn" as "isTeamPredictionOn",
          tu."WrUserName" as "createdBy",
          tc."wrHistoryMatchTypeId" as "historyMatchTypeId",
          mt2."wrMatchType" AS "historyMatchType",
          tc."wrIsCountInPoint" as "isCountInPoint",
          tc."wrShotType" as "shotType",
          tc."wrIsWheelShow" as "isWheelShow"
      FROM "tblCommentaries" tc
      LEFT JOIN "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      LEFT JOIN "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
      LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId"
      LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId"
	    LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
      LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
      ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/getCommentariesDataByDifferentIdsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentariesDataQueryV1 = async (fastify) => {
  return await fastify.db.query(
    `select 
        tc."wrCommentaryId" as "cid",
        tc."wrMatchTypeId" as "mtypid",
        mt."wrMatchType" AS "mtyp",
        tc."wrEventTypeId" as "etypid",
        tet."wrEventType" as "etyp",
        tc."wrTeam1Id" as "t1id",
        tc."wrTeam2Id" as "t2id",
        tt1."wrTeamName" as "te1n",
        tt2."wrTeamName" as "te2n",
        tc."wrCompetitionId" as "compid",
	      co."wrCompetition" as "comp",
        tc."wrEventId" as "eid",
        tc."wrEventDate" as "ed",
        tc."wrEventName" as "en",
        tc."wrEventRefId" as "erefid",
        tc."wrLocation" as "loc",
        tc."wrWeather" as "weather",
        tc."wrPitch" as "pitch",
        tc."wrHomeSideTeam" as "homsidte",
        tc."wrTossWonBy" as "twonby",
        tc."wrChoseTo" as "choseto",
        tc."wrWinnerId" as "winid",
        tc."wrWinnerName" as "winn",
        tc."wrIsClientShow" as "icshow",
        tc."wrDisplayStatus" as "ds",
        tc."wrRmk" as "rmk",
        tc."wrCommentaryUserId" as "cuserid",
        tc."wrCommentaryStatus" as "cs",
        tc."wrUpdateTime" as "ut",
        tc."wrIsMatchDraw" as "imtdraw",
        tc."wrTarget" as "trg",
        tc."wrMarketID" as "mid",
        tc."wrTpId" as "tpId",
        tc."isSignalROn" as "isignon",
        tc."isMatchTypeUpdated" as "imtypup",
        tc."wrCurrentInnings" as "ci",
        tc."wrSystemPlayerCount" as "syplcnt",
        tc."wrIsPlayersShow" as "ips",
        tc."wrIsPredictMarket" as "ipm",
        tc."wrIsActive"  as "iact",
        tc."wrDelay" as "dly",
        tc."wrLineRatio" as "lr",
        tc."wrCommentaryResult" as "cres",
        tc."wrCommentaryCloseTime" as "cct",
        tc."wrIsTeamPredictionOn" as "itpo",
        tu."WrUserName" as "usern",
        tc."wrHistoryMatchTypeId" as "hmtypid",
        mt2."wrMatchType" AS "mtyp",
        tc."wrIsCountInPoint" as "icntinpnt",
        tc."wrShotType" as "styp",
        tc."wrIsWheelShow" as "iws"
    FROM "tblCommentaries" tc
    LEFT JOIN "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    LEFT JOIN "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
    LEFT JOIN "tblMatchTypes" mt2 ON tc."wrHistoryMatchTypeId" = mt2."wrMatchTypeId"
    LEFT JOIN "tblEventTypes" tet ON tc."wrEventTypeId" = tet."wrEventTypeId"
	  LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
    LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
    WHERE "wrIsDelete" = false AND co."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryTeamsDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select 
        "wrCommentaryTeamId" as "ctid",
        "wrCommentaryId" as "cid",
        "wrTeamId" as "tid",
        "wrShortName" as "shn",
        "wrTeamName" as "tn",
        "wrTeamCaptain" as "tecap",	
        "wrTeamKipper" as "tekip",
        "wrTeamScore" as "tescore",
        "wrTeamOver" as "teovr",
        "wrTeamWicket" as "tewic",
        COALESCE("wrCrr"::FLOAT, 0) AS "crr",
        COALESCE("wrRrr"::FLOAT, 0) AS "rrr",
        "wrTeamStatus" as "testa",
        "wrTeamTrialRuns" as "tetriruns",
        "wrTeamLeadRuns" as "teleadruns",
        "wrTeamWideRuns" as "tewidruns",
        "wrTeamByRuns" as "tebyruns",
        "wrTeamLegByRuns" as "telegbyruns",
        "wrTeamNoBallRuns" as "tenobalruns",
        "wrTeamPenaltyRuns" as "tepenlruns",
        "wrIsWin" as "isWin",
        "wrTeamBattingOrder" as "tebatord",
        tct."wrCurrentInnings" as "ci", 
        tct."wrIsBattingComplete" as "isbatcomplt",
        "wrCommentaryPlayerTeamCaptain" as "cpltecap",
        "wrCommentaryPlayerTeamKipper" as "cpltekip",
        "wrTeamColor" as "tecolor",
        "wrBackgroundColor" as "bgcolor",
        "wrTeamMaxOver" as "temaxovr",
        "wrIsSuperOver" as "issuperovr",
        "wrTeamPredictionPercentage" as "tepredictpercent",
        "wrDrsCount" as "drsCnt",
        "wrNoOfAttempt" as "drsAtmpt",
        "wrNoOfFail" as "drsFail"
    from "tblCommentaryTeams" tct 
    ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}

const getAllCommentaryPlayerDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select
        tcp."wrCommentaryPlayerId" as "cplid",
        tcp."wrCommentaryId" as "cid",
        tcp."wrTeamId" as "tid",
        tcp."wrPlayerId" as "plid",
        tcp."wrPlayerName" as "pln",
        tcp."wrDisplayOrder" as "do",
        tcp."wrBat_Status" as "bats",
        tcp."wrBat_Run" as "batrun",
        tcp."wrBat_Ball" as "batbal",
        tcp."wrBat_DotBall" as "bdb",
        tcp."wrBat_FOUR" as "batf",
        tcp."wrBat_SIX" as "bats",
        tcp."wrBat_SRR" as "batsrr",
        tcp."wrBat_BattingOrder" as "bato",
        tcp."wrBat_IsPlay" as "batiplay",
        tcp."wrBat_OnStrike" as "batonstrik",
        tcp."wrBat_WicketType" as "batwityp",
        tcp."wrBat_BowlerID" as "batbowlid",
        tcp."wrBat_FielderID1" as "batfielid1",
        tcp."wrBat_FielderID2" as "batfielid2",
        tcp."wrBowler_Over" as "bowlovr",
        tcp."wrBowler_CurrentBall" as "bowlcurbal",
        tcp."wrBowler_TotalBall" as "bowltotbal",
        tcp."wrBowler_Run" as "bowlrun",
        tcp."wrBowler_DotBall" as "bowldbal",
        tcp."wrBowler_MaidenOver" as "bowlmaidovr",
        tcp."wrBowler_FOUR" as "bowlf",
        tcp."wrBowler_SIX" as "bowls",
        tcp."wrBowler_WideBall" as "bowlwicbal",
        tcp."wrBowler_NOBall" as "bowlnobal",
        tcp."wrBowler_ByeBall" as "bowlbyebal",
        tcp."wrBowler_LegByeBall" as "bowllegbybal",
        tcp."wrBowler_WideBallRun" as "bowlwbalrun",
        tcp."wrBowler_NOBallRun" as "bowlnobalrun",
        tcp."wrBowler_ByeBallRun" as "bowlbyebalrun",
        tcp."wrBowler_LegByeBallRun" as "bowllegbyebalrun",
        tcp."wrBowler_TotalWicket" as "bowltotwi",
        tcp."wrBowler_Economy" as "bowleco",
        tcp."wrBowler_OnStrike" as "bowlonstrik",
        tcp."wrBowler_PeneltyRun" as "bowlpenltyrun",
        tcp."wrIsBatter_Out" as "ibatout",
        tcp."wrIsBatter_Retir" as "ibatretir",
        tcp."wrSwapName" as "swapn",
        tcp."wrBatsmanAverage" as "batavg",
        tcp."wrBatsmanStrikeRate" as "batstrik",
        tcp."wrBowlerEconomy" as "bowleco",
        tcp."wrBowlerAverage" as "bowlavg",
        tcp."wrCurrentInnings" as "ci",
        tcp."wrBatterOrder" as "batord",
        tcp."wrBowlerOrder" as "bowlord",
        tcp."wrBatsmanPreviousStrikeRate"::DOUBLE PRECISION as "batprevistrik",
        tcp."wrBowlerPreviousEconomy"::DOUBLE PRECISION as "bowlprevieco",
        tcp."wrIsInPlayingEleven" as "iiplay11",
        tcp."wrBoundary" as "bundry",
        tcp."wrPlayerBallFaced" as "playbalfaced",
        tp."wrPlayerTypeId" as "pltypid",
        tpt."wrPlayerType" as "pltyp",
        tcp."wrJerseyPlayerImage" as "jryPlyImg"
    from "tblCommentaryPlayers" AS tcp
    LEFT JOIN "tblPlayers" AS tp ON tcp."wrPlayerId" = tp."wrPlayerId"
    LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}

const getAllOversDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
      select
        "wrOverId" as "ovrid",
        "wrCommentaryId" as "cid",
        "wrTeamId" as "tid",	
        "wrOver" as "ovr",
        "wrBallCount" as "balcnt",
        "wrBowlerId" as "bowlid",
        "wrTotalRun" as "totrun",
        "wrTotalFour" as "totf",
        "wrTotalSix" as "tots",
        "wrTotalWideBall" as "totwidbal",
        "wrTotalWideRun" as "totwidrun",
        "wrTotalNoball" as "totnobal",
        "wrTotalNoBallRun" as "totnobalrun",
        "wrTotalByesRun" as "totbyesrun",
        "wrTotalLegByesRun" as "totlegbyesruns",
        "wrTotalPanelty" as "totpanlty",
        "wrTotalWicket" as "totwi",
        "wrDotBall" as "dotbal",
        "wrIsComplete" as "icomplt",
        "wrPowerplay" as "pp",
        "wrIsOverInPowerplay" as "ioinpp",
        "wrPowerplayType" as "pptype",
        "wrIsMaiden" as "imaiden",
        "wrDate" as "dt",
        "wrIsDelete" as "idlt",
        "wrCurrentInnings" as "ci",
        "wrTeamScore" as "tesco",
        "wrIsPowerPlay" as "ipp",
        "wrPowerPlayName" as "ppn"
      from "tblOvers" 
      ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}

const getAllCommentaryBallByBallDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `select
        "wrCommentaryBallByBallId" as "cbalbyid",
        "wrCommentaryId" as "cid",
        "wrTeamId" as "tid",
        "wrOverId" as "ovrid",
        "wrOverCount" as "ovrcnt",
        "wrCurrentOverBalls" as "curovrbal",
        "wrBowler_ID" as "bowlid",
        "wrBat_StrikeID" as "batstrikid",
        "wrBat_NONStrikeID" as "batnonstrikid",
        "wrBall_IsCount" as "balicnt",
        "wrBall_Type" as "baltyp",
        "wrBall_IsDot" as "balidot",
        "wrBall_Run" as "balrun",
        "wrBall_ExtraRun" as "balextrun",
        "wrBall_isBoundry" as "balibound",
        "wrBall_FOUR" as "balf",
        "wrBall_SIX" as "bals",
        "wrBall_IsWicket" as "baliwic",
        "wrBall_WicketType" as "balwictyp",
        "wrBall_PlayerID" as "balplid",
        "wrBall_BowlerID" as "balbowlid",
        "wrBall_FielderID1" as "balfieldid1",
        "wrBall_FielderID2" as "balfieldid2",
        "wrOver_isMaiden" as "ovrismaidn",
        "wrNextBat_StrikeID" as "nxtbatstrikid",
        "wrNextBat_NONStrikeID" as "nxtnonbatstrikid",
        "wrIsDelete" as "isdlt",
        "wrCurrentInnings" as "ci",
        "wrCreatedDate" as "crtd",
        "wrAutoStrikeBallCount" as "autstrikbalcnt",
        "wrX2" as "x2",
        "wrY2" as "y2",
        "wrShortType" as "styp",
        "wrCommentryRemark" as "crmk",
        "wrCommentaryPartnershipId" as "cpartsid"
    from "tblCommentaryBallByBalls"
    ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
    
  );
}

const getAllCommentaryWicketDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
    select 
        "wrCommentaryWicketId" as "cwiid",
        "wrCommentaryId" as "cid",
        "wrBowlerId" as "bowlid",
        "wrBowlerName" as "bowln",
        "wrWicketType" as "wityp",
        "wrBatterId" as "batid",
        "wrBatterName" as "batn",
        "wrFieldPlayerId" as "fieldplid",
        "wrFieldPlayerName" as "fieldpln",
        "wrOverId" as "ovrid",
        "wrOverCount" as "ovrcnt",
        "wrCommentaryBallByBallId" as "cbalbyid",
        "wrTeamId" as "tid",
        "wrTeamScore" as "tesco",
        "wrPlayerRun" as "plrun",
        "wrPlayerBalls" as "plbals",
        "wrWicketCount" as "wiccnt",
        "wrBallCount" as "balcnt",
        "wrCurrentInnings" as "ci",
        "wrCreatedDate" as "cratd"
    from "tblCommentaryWickets" 
    ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}

const getAllCommentaryPartnershipDataQueryV1 = async (whereCondition = null, fastify) => {
  return await fastify.db.query(
    `
      select 
          "wrCommentaryPartnershipId" as "cpartsid",
          "wrCommentaryId" as "cid",
          "wrTeamId" as "tid",
          "wrBatter1Id" as "bat1id",
          "wrBatter1Name" as "bat1n",
          "wrBatter2Id" as "bat2id",
          "wrBatter2Name" as "bat2n",
          "wrTotalRuns" as "totruns",
          "wrTotalBalls" as "totbals",
          "wrExtras" as "exts",
          "wrCurrentInnings" as "ci",
          "wrCommentaryBallByBallId" as "cbalbyid",
          "wrBatter1Balls" as "bat1bals",
          "wrBatter2Balls" as "bat2bals",
          "wrBatter1Runs" as "bat1runs",
          "wrBatter2Runs" as "bat2runs",
          "wrCreatedDate" as "cratd",
          "wrTotalFour" as "totf",
          "wrTotalSix" as "tots",
          "wrTotalExtra" as "totext",
          "wrTotalWide" as "totwid",
          "wrTotalNoBall" as "totnobal",
          "wrOrder" as "ord",
          "wrIsActive" as "iact",
          "wrP1Ball" as "p1bal",
          "wrP2Ball" as "p2bal",
          "wrP1Run" as "p1run",
          "wrP2Run" as "p2run"
      from "tblCommentaryPartnerships"
      ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
}

const updateCommentaryPlayerJerseyImageQuery = async (data, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaryPlayers" SET
        "wrJerseyPlayerImage" = $2
      WHERE
        "wrCommentaryPlayerId" = $1 AND "wrIsDelete" = FALSE`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryPlayerId, data.jerseyPlayerImage],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryPlayerJerseyImageQuery",
      null
    );
    throw new Error(error.message);
  }
};

const getCommentaryTeamsDRSQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT
        "wrCommentaryTeamId" as "commentaryTeamId",
        "wrCommentaryId" as "commentaryId",
        "wrTeamId" as "teamId",
        "wrDrsCount" as "drsCount",
        "wrNoOfAttempt" as "drsAttempt",
        "wrNoOfFail" as "drsFail"
      FROM "tblCommentaryTeams"
      WHERE "wrCommentaryTeamId" = $1
        AND "wrTeamId" = $2
        AND "wrCommentaryId" = $3
        AND "wrIsDelete" = FALSE`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.commentaryTeamId, data.teamId, data.commentaryId],
      }
    );
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/getCommentaryTeamsDRSQuery",
      null
    );
    throw new Error(error.message);
  }
};

const updateCommentaryTeamDrsAttemptsAndFailQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCommentaryTeams" SET
        "wrNoOfAttempt" = GREATEST(0, $1),
        "wrNoOfFail" = GREATEST(0, $2)
      WHERE
        "wrCommentaryTeamId" = $3 
        AND "wrTeamId" = $4
        AND "wrCommentaryId" = $5
        AND "wrIsDelete" = FALSE
        RETURNING 
            "wrCommentaryId" as "commentaryId",
            "wrCommentaryTeamId" as "commentaryTeamId",
            "wrDrsCount" as "drsCount",
            "wrNoOfAttempt" as "drsAttempt",
            "wrNoOfFail" as "drsFail";`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.drsAttempt, data.drsFail, data.commentaryTeamId, data.teamId, data.commentaryId],
      }
    );
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryTeamDrsAttemptsAndFailQuery",
      null
    );
    throw new Error(error.message);
  }
};

const updateCommentaryTeamDrsAttemptsQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCommentaryTeams" SET
        "wrNoOfAttempt" = GREATEST(0, $1)
      WHERE
        "wrCommentaryTeamId" = $2
        AND "wrTeamId" = $3
        AND "wrCommentaryId" = $4
        AND "wrIsDelete" = FALSE
        RETURNING 
            "wrCommentaryId" as "commentaryId",
            "wrCommentaryTeamId" as "commentaryTeamId",
            "wrDrsCount" as "drsCount",
            "wrNoOfAttempt" as "drsAttempt";`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.drsAttempt, data.commentaryTeamId, data.teamId, data.commentaryId],
      }
    );
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCommentary/updateCommentaryTeamDrsAttemptsQuery",
      null
    );
    throw new Error(error.message);
  }
};

module.exports = {
  getAllCommentaryQuery,
  insertCommentaryQuery,
  insertCommentaryTeams,
  insertCommentaryPlayers,
  updateCommentaryQuery,
  updateCommentaryTeams,
  deleteCommentaryPlayers,
  getCommentaryByIdQuery,
  getCommentaryTeamsQuery,
  getCommentaryPlayersQuery,
  getPredictorLogsQuery,
  deleteCommentryQuery,
  getAllCommentaryTeamsQuery,
  getAllCommentaryPlayerQuery,
  getAllCommentaryBallByBallQuery,
  getAllOversQuery,
  getAllDisplayStatusQuery,
  createOverQuery,
  updateOverQuery,
  getAllCommentaryWicketQuery,
  updateCommentaryDetailsQuery,
  updateCommentaryTeamsQuery,
  updateCommentaryPlayersQuery,
  createBallByBallCommentoriesQuery,
  updateBallByBallCommentoriesQuery,
  getAllCommentaryPartnershipQuery,
  createCommentaryWicketQuery,
  updateCommentaryWicketQuery,
  createCommentaryPartnershipQuery,
  updateCommentaryPartnershipQuery,
  deleteBallByBallCommentoriesQuery,
  deleteOverCommentoriesQuery,
  UpdateCommentaryTimeQuery,
  getCommentaryID_Socket,
  upsertCommentaryPlayers,
  updateCommentaryPlayerIdInCommentaryTeams,
  updateMatchTypeInCommentaryQuery,
  changeBowlerInCommentary,
  getCommentaryBallByBallQuery,
  getCommnertySquadPlayersList,
  updateShowClientQuery,
  updatePlayerShowQuery,
  deleteCommentaryPlayerById,
  updateCommentaryPlayerById,
  updateCommentaryStatusQuery,
  updateisPredictMarketInCommentaryQuery,
  updateResultInCommentaryQuery,
  saveCommentaryDetailsAPIQuery,
  activeInactiveCommentaryQuery,
  closeCommentaryQuery,
  deleteAllCommentaryQuery,
  updateDelayInCommentaryQuery,
  deleteCommentaryDataQuery,
  updateEventRefIdInCommentaryQuery,
  getCommentaryDetailByIdQuery,
  updateMaxOverDetailQuery,
  updateSuperOverCommentaryQuery,
  insertCommentarySuperOverTeams,
  updateCommentaryTeamPredictionPrecentageQuery,
  updateTeamPrediction,
  updateAverageOfPlayerQuery,
  updateCommentaryBattingTeamQuery,
  updateLineRationQuery,
  updateLineRatioComQuery,
  completedCommentaryStatusQuery,
  updateBoundaryOfPlayerQuery,
  insertCommentaryConsoleFeQuery,
  revertCommentaryQuery,
  updatePbfOfPlayerQuery,
  getTemplateByComIdQuery,
  saveComTemplateQuery,
  getCommentaryBallByBallByIdsQuery,
  insertWagonWheelPositionQuery,
  updateShotTypeQuery,
  updateIsWheelShowQuery,
  insertCommentaryPlayersQuery,
  cancelCommentaryQuery,
  getCommentariesResultQuery,
  isCountInPOintCommentaryChangeQuery,
  getAllCommentaryHistoryQuery,
  deleteCommentryHistoryQuery,
  getCommPlayersByCommentaryIdQuery,
  getAllCompletedCommentaryQuery,
  getCommentariesDataQuery,
  getAllCommentaryTeamsDataQuery,
  getAllCommentaryPlayerDataQuery,
  getAllCommentaryBallByBallDataQuery,
  getAllOversDataQuery,
  getAllCommentaryWicketDataQuery,
  getAllCommentaryPartnershipDataQuery,
  getCommentariesDataByDifferentIdsQuery,
  upOverDLSQuery,
  getCommentariesDataQueryV1,
  getAllCommentaryTeamsDataQueryV1,
  getAllCommentaryPlayerDataQueryV1,
  getAllOversDataQueryV1,
  getAllCommentaryBallByBallDataQueryV1,
  getAllCommentaryWicketDataQueryV1,
  getAllCommentaryPartnershipDataQueryV1,
  updateCommentaryPlayerJerseyImageQuery,
  updateCommentaryTeamDrsAttemptsAndFailQuery,
  updateCommentaryTeamDrsAttemptsQuery,
  getCommentaryTeamsDRSQuery,
};

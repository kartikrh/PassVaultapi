const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
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
    tc."wrHistoryMatchTypeId" as "historyMatchTypeId"
    from "tblCommentaries" tc
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
	LEFT JOIN "tblCompetitions" co ON tc."wrCompetitionId" = co."wrCompetitionId"
  LEFT JOIN "tblUsers" tu ON tc."wrCreatedBy" = tu."WrUserId"
  WHERE "wrIsDelete" = false`,
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
        "wrDelay", "wrIsActive", "wrIsClientShow","wrIsTeamPredictionOn", "wrHistoryMatchTypeId") values (
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
          $26
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
    tc."wrHistoryMatchTypeId" as "historyMatchTypeId"
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
      , "wrTeamColor" , "wrBackgroundColor" , "wrTeamMaxOver")
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
        $9             
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
        $9
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

const upsertCommentaryPlayers = async (
  data,
  currentinning,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `WITH upsert AS (
      UPDATE "tblCommentaryPlayers"
      SET
        "wrDisplayOrder" = $4
      WHERE
        "wrCommentaryId" = $1
        AND "wrTeamId" = $2
        AND "wrPlayerId" = $3
        AND "wrCurrentInnings" = $5
      RETURNING *
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
    WHERE NOT EXISTS (SELECT 1 FROM upsert);
    
    
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
      "wrIsClientShow" = $20
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
      "wrBoundary" = $7
      where "wrPlayerId" = $4
      AND "wrCommentaryId" = $5
      AND "wrTeamId" = $6`,
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
      tc."wrLineRatio" as "lineRatio"	
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
      "wrTeamMaxOver" as "teamMaxOver"
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
        bind: [true, request.userTokenInfo.WrUserId, commentaryId],
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
        bind: [true, request.userTokenInfo.WrUserId, id], 
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
  "wrCrr" as "crr",
  "wrRrr" as "rrr",
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
  "wrTeamPredictionPercentage" as "teamPredictionPercentage"
  from "tblCommentaryTeams" tct 
  where "wrIsDelete" = false
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
    "wrCommentaryPlayerId" as "commentaryPlayerId",
    "wrCommentaryId" as "commentaryId",
    "wrTeamId" as "teamId",
    "wrPlayerId" as "playerId",
    "wrPlayerName" as "playerName",
    "wrDisplayOrder" as "displayOrder",
    "wrBat_Status" as "batStatus",
    "wrBat_Run" as "batRun",
    "wrBat_Ball" as "batBall",
    "wrBat_DotBall" as "batDotBall",
    "wrBat_FOUR" as "batFour",
    "wrBat_SIX" as "batSix",
    "wrBat_SRR" as "batSrr",
    "wrBat_BattingOrder" as "battingOrder",
    "wrBat_IsPlay" as "isPlay",
    "wrBat_OnStrike" as "onStrike",
    "wrBat_WicketType" as "wicketType",
    "wrBat_BowlerID" as "bowlerId",
    "wrBat_FielderID1" as "fielderId1",
    "wrBat_FielderID2" as "fielderId2",
    "wrBowler_Over" as "bowlerOver",
    "wrBowler_CurrentBall" as "bowlerCurrentBall",
    "wrBowler_TotalBall" as "bowlerTotalBall",
    "wrBowler_Run" as "bowlerRun",
    "wrBowler_DotBall" as "bowlerDotBall",
    "wrBowler_MaidenOver" as "bowlerMaidenOver",
    "wrBowler_FOUR" as "bowlerFour",
    "wrBowler_SIX" as "bowlerSix",
    "wrBowler_WideBall" as "bowlerWideBall",
    "wrBowler_NOBall" as "bowlerNoBall",
    "wrBowler_ByeBall" as "bowlerByeBall",
    "wrBowler_LegByeBall" as "bowlerLegByeBall",
    "wrBowler_WideBallRun" as "bowlerWideBallRun",
    "wrBowler_NOBallRun" as "bowlerNoBallRun",
    "wrBowler_ByeBallRun" as "bowlerByeBallRun",
    "wrBowler_LegByeBallRun" as "bowlerLegByeBallRun",
    "wrBowler_TotalWicket" as "bowlerTotalWicket",
    "wrBowler_Economy" as "bowlerEconomy",
    "wrBowler_OnStrike" as "bowlerOnStrike",
    "wrBowler_PeneltyRun" as "bowlerPeneltyRun",
    "wrIsBatter_Out" as "isBatterOut",
    "wrIsBatter_Retir" as "isBatterRetir",
    "wrSwapName" as "swapName",
    "wrBatsmanAverage" as "batsmanAverage",
    "wrBatsmanStrikeRate" as "batsmanStrikeRate",
    "wrBowlerEconomy" as "bowlerEconomy",
    "wrBowlerAverage" as "bowlerAverage",
    "wrCurrentInnings" as "currentInnings",
    "wrBatterOrder" as "batterOrder",
    "wrBowlerOrder" as "bowlerOrder",
    "wrBatsmanPreviousStrikeRate" as "batsmanPreviousStrikeRate",
    "wrBowlerPreviousEconomy" as "bowlerPreviousEconomy",
    "wrIsInPlayingEleven" as "isInPlayingEleven",
    "wrBoundary" as "boundary"
    from "tblCommentaryPlayers"
    where "wrIsDelete" = false
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
  //   "wrBowler_Status" as "bowlerStatus",
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
  //   "wrBatsmanPreviousStrikeRate" as "batsmanPreviousStrikeRate",
  //   "wrBowlerPreviousEconomy" as "bowlerPreviousEconomy"
  //   from "tblCommentaryPlayers"
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const getAllCommentaryBallByBallQuery = async (fastify) => {
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
    WHERE "wrIsDeletedStatus" = false
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
      where "wrIsDelete" = false
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
    where "wrIsDeletedStatus" = false
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
      "wrP1Ball" as "p1Ball",
      "wrP2Ball" as "p2Ball",
      "wrP1Run" as "p1Run",
      "wrP2Run" as "p2Run"
      from "tblCommentaryPartnerships"
      WHERE "wrIsDelete" = false
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
};

const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    te7."wrValue" as "commentaryId",
    te."wrValue" as "matchTypeId",
    te1."wrValue" as "eventTypeId",
    te2."wrValue" as "team1Id",
    te3."wrValue" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    "wrCompetitionId" as "competitionId",
    "wrEventId" as "eventId",
    "wrEventDate" as "eventDate",
    "wrEventName" as "eventName",
    "wrEventRefId" as "eventRefId",
    "wrLocation" as "location",
    "wrWeather" as "weather",
    "wrPitch" as "pitch",
    te4."wrValue" as "homeSideTeam",
    te5."wrValue" as "tossWonBy",
    "wrChoseTo" as "choseTo",
    te6."wrValue" as "winnerId",
    "wrWinnerName" as "winnerName",
    "wrIsViewTable" as "isViewTable",
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
    "isMatchTypeUpdated" as "isMatchTypeUpdated"
    from "tblCommentaries" tc
    left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
    left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
    left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
    left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
    left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
    left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"    
        `,
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
        insert into "tblCommentaries" ("wrEventTypeId","wrMatchTypeId","wrCompetitionId","wrEventId","wrEventDate","wrEventName","wrEventRefId","wrTeam1Id","wrTeam2Id","wrLocation","wrWeather","wrPitch","wrDisplayStatus","wrTarget","wrMarketID","wrTpId","isSignalROn","isMatchTypeUpdated" , "wrCreatedBy" , "wrCreatedDate","wrCommentaryStatus") values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,$4,$5,$6,$7,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
          $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now(),1
        ) returning *         
      )

      select 
    te7."wrValue" as "commentaryId",
    te."wrValue" as "matchTypeId",
    te1."wrValue" as "eventTypeId",
    te2."wrValue" as "team1Id",
    te3."wrValue" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    "wrCompetitionId" as "competitionId",
    "wrEventId" as "eventId",
    "wrEventDate" as "eventDate",
    "wrEventName" as "eventName",
    "wrEventRefId" as "eventRefId",
    "wrLocation" as "location",
    "wrWeather" as "weather",
    "wrPitch" as "pitch",
    te4."wrValue" as "homeSideTeam",
    te5."wrValue" as "tossWonBy",
    "wrChoseTo" as "choseTo",
    te6."wrValue" as "winnerId",
    "wrWinnerName" as "winnerName",
    "wrIsViewTable" as "isViewTable",
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
    "isMatchTypeUpdated" as "isMatchTypeUpdated"
    from "insert_data" tc
    left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
    left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
    left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
    left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
    left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
    left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"  
      `,
      {
        bind: [
          data.eventTypeId || null,
          data.matchTypeId || null,
          data.competitionId || null,
          data.eventId || null,
          data.eventDate ? new Date(data.eventDate) : null,
          data.eventName || null,
          data.eventRefId || null,
          data.team1Id || null,
          data.team2Id || null,
          data.location || null,
          data.weather || null,
          data.pitch || null,
          data.displayStatus || null,
          data.target || 0,
          data.marketId || null,
          data.tpId || null,
          data.isSignalROn || false,
          data.isMatchTypeUpdated || false,
          request.userTokenInfo.WrUserId,
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
      insert into "tblCommentaryTeams" ("wrCommentaryId" , "wrTeamId","wrTeamCaptain","wrTeamKipper" , "wrShortName" , "wrTeamName")
       values (
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2))                
      ),(
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $5),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $6),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $7),
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5)),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5))
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

const insertCommentaryPlayers = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      insert into "tblCommentaryPlayers" ("wrCommentaryId" , "wrTeamId" , "wrPlayerId","wrPlayerName", "wrDisplayOrder")
       values (
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
        (select "wrPlayerName" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
        $4
      )
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId,
          data.teamId,
          data.playerId,
          data.displayOrder,
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

const updateCommentaryQuery = async (request, fastify) => {
  try {
    const data = request.body;
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrMatchTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrCompetitionId" = $3,
      "wrEventId" = $4,
      "wrEventDate" = $5,
      "wrEventName" = $6,
      "wrEventRefId" = $7,
      "wrTeam1Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
      "wrTeam2Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
      "wrLocation" = $10,
      "wrWeather" = $11,
      "wrPitch" = $12,
      "wrDisplayStatus" = $13,
      "wrTarget" = $14 ,
      "isSignalROn" = $15,
      "isMatchTypeUpdated" = $16, 
      "wrModifyDate" = now()        
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $17)
      `,
      {
        bind: [
          data.eventTypeId || null,
          data.matchTypeId || null,
          data.competitionId || null,
          data.eventId || null,
          data.eventDate ? new Date(data.eventDate) : null,
          data.eventName || null,
          data.eventRefId || null,
          data.team1Id || null,
          data.team2Id || null,
          data.location || null,
          data.weather || null,
          data.pitch || null,
          data.displayStatus || null,
          data.target || null,
          data.isSignalROn,
          data.isMatchTypeUpdated || false,
          data.commentaryId,
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
      `
      update "tblCommentaryTeams" set
      "wrTeamCaptain" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrTeamKipper" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrShortName" = (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
      "wrTeamName" = (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3))
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) and "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.teamCaptain,
          data.teamKipper,
          data.teamId,
          data.commentaryId,
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
      delete from "tblCommentaryPlayers" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [request.body.commentaryId],
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

const getCommentaryByIdQuery = async (request, fastify) => {
  try {
    const { commentaryId } = request.body;

    const result = await fastify.db.query(
      `
      select 
      te7."wrValue" as "commentaryId",
      te."wrValue" as "matchTypeId",
      te1."wrValue" as "eventTypeId",
      te2."wrValue" as "team1Id",
      te3."wrValue" as "team2Id",
      tt1."wrTeamName" as "team1Name",
      tt2."wrTeamName" as "team2Name",
      "wrCompetitionId" as "competitionId",
      "wrEventId" as "eventId",
      "wrEventDate" as "eventDate",
      "wrEventName" as "eventName",
      "wrEventRefId" as "eventRefId",
      "wrLocation" as "location",
      "wrWeather" as "weather",
      "wrPitch" as "pitch",
      te4."wrValue" as "homeSideTeam",
      te5."wrValue" as "tossWonBy",
      "wrChoseTo" as "choseTo",
      te6."wrValue" as "winnerId",
      "wrWinnerName" as "winnerName",
      "wrIsViewTable" as "isViewTable",
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
      "isMatchTypeUpdated" as "isMatchTypeUpdated"
      from "tblCommentaries" tc
      left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
      left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
      left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
      left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
      left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
      left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
      left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
      left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
      left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
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
      te."wrValue" as "teamId",
      te1."wrValue" as "teamCaptain",
      te2."wrValue" as "teamKipper"
      from "tblCommentaryTeams" tct
      left join "tblEncryptedData" te on tct."wrTeamId" = te."wrKey"
      left join "tblEncryptedData" te1 on tct."wrTeamCaptain" = te1."wrKey"
      left join "tblEncryptedData" te2 on tct."wrTeamKipper" = te2."wrKey"
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
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
      te."wrValue" as "playerId",
      "wrDisplayOrder" as "displayOrder",
      "wrPlayerName" as "playerName"
      from "tblCommentaryPlayers" tcp
      left join "tblEncryptedData" te on tcp."wrPlayerId" = te."wrKey"
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
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

const deleteCommentryQuery = async (commentaryId, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      with delete_players as (
        delete from "tblCommentaryPlayers" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      ),
       delete_teams as (
        delete from "tblCommentaryTeams" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      )
      delete from "tblCommentaries" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [commentaryId],
      }
    );
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

const getAllCommentaryTeamsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
  te."wrValue" as "commentaryTeamId",
  te1."wrValue" as "commentaryId",
  te2."wrValue" as "teamId",
  "wrShortName" as "shortName",
  "wrTeamName" as "teamName",
  te3."wrValue" as "teamCaptain",
  te4."wrValue" as "teamKipper",
  "wrTeamScore" as "teamScore",
  "wrTeamOver" as "teamOver",
  "wrTeamWicket" as "teamWicket",
  "wrCrr" as "crr",
  "wrRrr" as "rrr",
  "wrTeamStatus" as "teamStatus",
  "wrIsWin" as "isWin"
  from "tblCommentaryTeams" tct 
  left join "tblEncryptedData" te on tct."wrCommentaryTeamId" = te."wrKey"
  left join "tblEncryptedData" te1 on tct."wrCommentaryId" = te1."wrKey"
  left join "tblEncryptedData" te2 on tct."wrTeamId" = te2."wrKey"
  left join "tblEncryptedData" te3 on tct."wrTeamCaptain" = te3."wrKey"
  left join "tblEncryptedData" te4 on tct."wrTeamKipper" = te4."wrKey"

  `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryPlayerQuery = async (fastify) => {
  return await fastify.db.query(
    `select
    te."wrValue" as "commentaryPlayerId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    te3."wrValue" as "playerId",
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
    "wrBowler_Status" as "bowlerStatus",
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
    "wrBowlerAverage" as "bowlerAverage"
    from "tblCommentaryPlayers" tcp
    left join "tblEncryptedData" te on tcp."wrCommentaryPlayerId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcp."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcp."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcp."wrPlayerId" = te3."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllCommentaryBallByBallQuery = async (fastify) => {
  return await fastify.db.query(
    `select
    te."wrValue" as "commentaryBallByBallId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    te3."wrValue" as "overId",
    "wrOverCount" as "overCount",
    "wrCurrentOverBalls" as "currentOverBalls",
    te4."wrValue" as "bowlerId",
    te5."wrValue" as "batStrikeId",
    te6."wrValue" as "batNonStrikeId",
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
    te7."wrValue" as "ballPlayerId",
    te8."wrValue" as "ballBowlerId",
    te9."wrValue" as "ballFielderId1",
    te10."wrValue" as "ballFielderId2",
    "wrOver_isMaiden" as "overIsMaiden",
    te11."wrValue" as "nextBatStrikeId",
    te12."wrValue" as "nextBatNonStrikeId",
    "wrIsDelete" as "isDelete"
    from "tblCommentaryBallByBalls" tcb
    left join "tblEncryptedData" te on tcb."wrCommentaryBallByBallId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcb."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcb."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcb."wrOverId" = te3."wrKey"
    left join "tblEncryptedData" te4 on tcb."wrBowler_ID" = te4."wrKey"
    left join "tblEncryptedData" te5 on tcb."wrBat_StrikeID" = te5."wrKey"
    left join "tblEncryptedData" te6 on tcb."wrBat_NONStrikeID" = te6."wrKey"
    left join "tblEncryptedData" te7 on tcb."wrBall_PlayerID" = te7."wrKey"
    left join "tblEncryptedData" te8 on tcb."wrBall_BowlerID" = te8."wrKey"
    left join "tblEncryptedData" te9 on tcb."wrBall_FielderID1" = te9."wrKey"
    left join "tblEncryptedData" te10 on tcb."wrBall_FielderID2" = te10."wrKey"
    left join "tblEncryptedData" te11 on tcb."wrNextBat_StrikeID" = te11."wrKey"
    left join "tblEncryptedData" te12 on tcb."wrNextBat_NONStrikeID" = te12."wrKey"    
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllOversQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select
    te."wrValue" as "overId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    "wrOver" as "over",
    "wrBallCount" as "ballCount",
    te3."wrValue" as "bowlerId",
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
    "wrIsDelete" as "isDelete"
    from "tblOvers" tco
    left join "tblEncryptedData" te on tco."wrOverId" = te."wrKey"
    left join "tblEncryptedData" te1 on tco."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tco."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tco."wrBowlerId" = te3."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllDisplayStatusQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select 
    te."wrValue" as "displayStatusId",
    "wrDisplayStatus" as "displayStatus"
    from "tblDisplayStatuses" tds
    left join "tblEncryptedData" te on tds."wrDisplayStatusId" = te."wrKey"
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
    te."wrValue" as "commentaryWicketId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "bowlerId",
    "wrBowlerName" as "bowlerName",
    "wrWicketType" as "wicketType",
    te3."wrValue" as "batterId",
    "wrBatterName" as "batterName",
    te4."wrValue" as "fieldPlayerId",
    "wrFieldPlayerName" as "fieldPlayerName",
    te5."wrValue" as "overId",
    "wrOverCount" as "overCount",
    te6."wrValue" as "commentaryBallByBallId",
    te7."wrValue" as "teamId",
    "wrTeamScore" as "teamScore",
    "wrPlayerRun" as "playerRun",
    "wrPlayerBalls" as "playerBalls"
    from "tblCommentaryWickets" tcw
    left join "tblEncryptedData" te on tcw."wrCommentaryWicketId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcw."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcw."wrBowlerId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcw."wrBatterId" = te3."wrKey"
    left join "tblEncryptedData" te4 on tcw."wrFieldPlayerId" = te4."wrKey"
    left join "tblEncryptedData" te5 on tcw."wrOverId" = te5."wrKey"
    left join "tblEncryptedData" te6 on tcw."wrCommentaryBallByBallId" = te6."wrKey"
    left join "tblEncryptedData" te7 on tcw."wrTeamId" = te7."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const createOverQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_over as (
      insert into "tblOvers" ("wrCommentaryId", "wrTeamId", "wrOver", "wrBowlerId" , "wrBallCount" , "wrTotalRun" , 
      "wrTotalFour" , "wrTotalSix" , "wrTotalWideBall" , "wrTotalWideRun" , "wrTotalNoball" , "wrTotalNoBallRun" ,
      "wrTotalByesRun" , "wrTotalLegByesRun" , "wrTotalPanelty" , "wrTotalWicket" , "wrDotBall" , "wrIsComplete" ,
       "wrIsOverInPowerplay" , "wrPowerplayType" , "wrIsMaiden" , "wrDate"
      ) values (
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        $3,
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) , 
        $5 , $6 , $7 , $8 , $9 , $10 , $11 , $12 , $13 , $14 , $15 , $16 , $17 , $18 , $19 , $20 , $21 , $22 
        )
        returning * 
      )

      select
      te."wrValue" as "overId",
      te1."wrValue" as "commentaryId",
      te2."wrValue" as "teamId",
      "wrOver" as "over",
      "wrBallCount" as "ballCount",
      te3."wrValue" as "bowlerId",
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
      "wrIsDelete" as "isDelete"
      from "insert_over" tco
      left join "tblEncryptedData" te on tco."wrOverId" = te."wrKey"
      left join "tblEncryptedData" te1 on tco."wrCommentaryId" = te1."wrKey"
      left join "tblEncryptedData" te2 on tco."wrTeamId" = te2."wrKey"
      left join "tblEncryptedData" te3 on tco."wrBowlerId" = te3."wrKey"
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
      "wrBowlerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $19),
      "wrOver" = $20
      where "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $21)
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

//api for new flow

const updateCommentaryDetailsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrMatchTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrCompetitionId" = $3,
      "wrEventId" = $4,
      "wrEventDate" = $5,
      "wrEventName" = $6,
      "wrEventRefId" = $7,
      "wrTeam1Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
      "wrTeam2Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
      "wrLocation" = $10,
      "wrWeather" = $11,
      "wrPitch" = $12,
      "wrHomeSideTeam" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $13),
      "wrTossWonBy" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $14),
      "wrChoseTo" = $15,
      "wrWinnerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $16),
      "wrWinnerName" = $17,
      "wrIsViewTable" = $18,
      "wrDisplayStatus" = $19,
      "wrCommentaryStatus" = $20,
      "wrRmk" = $21,
      "wrCommentaryUserId" = $22,
      "wrUpdateTime" = $23,
      "wrModifyDate" = now(),
      "wrIsMatchDraw" = $24,
      "wrTarget" = $25,
      "wrMarketID" = $26,
      "wrTpId" = $27,
      "isSignalROn" = $28,
      "isMatchTypeUpdated" = $29
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $30)
      `,
      {
        bind: [
          data.eventTypeId,
          data.matchTypeId,
          data.competitionId,
          data.eventId,
          data.eventDate,
          data.eventName,
          data.eventRefId,
          data.team1Id,
          data.team2Id,
          data.location,
          data.weather,
          data.pitch,
          data.homeSideTeam,
          data.tossWonBy,
          data.choseTo,
          data.winnerId,
          data.winnerName,
          data.isViewTable,
          data.displayStatus,
          data.commentaryStatus,
          data.rmk,
          data.commentaryUserId,
          data.updateTime ? new Date(data.updateTime) : null,
          data.isMatchDraw,
          data.target,
          data.marketId,
          data.tpId,
          data.isSignalROn,
          data.isMatchTypeUpdated,
          data.commentaryId,
        ],

        type: fastify.db.QueryTypes.UPDATE,
      }
    );
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
       "wrTeamCaptain" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
       "wrTeamKipper" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
       "wrTeamScore" = $5,
        "wrTeamOver" = $6,
        "wrTeamWicket" = $7,
        "wrCrr" = $8,
        "wrRrr" = $9,
        "wrTeamStatus" = $10,
        "wrIsWin" = $11
        where "wrCommentaryTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $12)
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
          data.commentaryTeamId,
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
      "wrBat_BowlerID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $14),
      "wrBat_FielderID1" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $15),
      "wrBat_FielderID2" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $16),
      "wrBowler_Status" = $17,
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
      "wrBowlerAverage" = $44 
      where "wrCommentaryPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $45)
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
          data.bowlerStatus,
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
          data.commentaryPlayerId,
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
        "wrIsDelete"
      ) values (

        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
        $4,
        $5,
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $6),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $7),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
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
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $19),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $20),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $21),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $22),
        $23,
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $24),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $25),
        $26
        )

      returning *       
    )

    select
    te."wrValue" as "commentaryBallByBallId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    te3."wrValue" as "overId",
    "wrOverCount" as "overCount",
    "wrCurrentOverBalls" as "currentOverBalls",
    te4."wrValue" as "bowlerId",
    te5."wrValue" as "batStrikeId",
    te6."wrValue" as "batNonStrikeId",
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
    te7."wrValue" as "ballPlayerId",
    te8."wrValue" as "ballBowlerId",
    te9."wrValue" as "ballFielderId1",
    te10."wrValue" as "ballFielderId2",
    "wrOver_isMaiden" as "overIsMaiden",
    te11."wrValue" as "nextBatStrikeId",
    te12."wrValue" as "nextBatNonStrikeId",
    "wrIsDelete" as "isDelete"
    from "insert_data" tcb
    left join "tblEncryptedData" te on tcb."wrCommentaryBallByBallId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcb."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcb."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcb."wrOverId" = te3."wrKey"
    left join "tblEncryptedData" te4 on tcb."wrBowler_ID" = te4."wrKey"
    left join "tblEncryptedData" te5 on tcb."wrBat_StrikeID" = te5."wrKey"
    left join "tblEncryptedData" te6 on tcb."wrBat_NONStrikeID" = te6."wrKey"
    left join "tblEncryptedData" te7 on tcb."wrBall_PlayerID" = te7."wrKey"
    left join "tblEncryptedData" te8 on tcb."wrBall_BowlerID" = te8."wrKey"
    left join "tblEncryptedData" te9 on tcb."wrBall_FielderID1" = te9."wrKey"
    left join "tblEncryptedData" te10 on tcb."wrBall_FielderID2" = te10."wrKey"
    left join "tblEncryptedData" te11 on tcb."wrNextBat_StrikeID" = te11."wrKey"
    left join "tblEncryptedData" te12 on tcb."wrNextBat_NONStrikeID" = te12."wrKey"
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
};

const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    te7."wrValue" as "commentaryId",
    te."wrValue" as "matchTypeId",
    mt."wrMatchType" AS "matchType",
    te1."wrValue" as "eventTypeId",
    te2."wrValue" as "team1Id",
    te3."wrValue" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    te8."wrValue" as "competitionId",
    te9."wrValue" as "eventId",
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
    "isMatchTypeUpdated" as "isMatchTypeUpdated",
    "wrCurrentInnings" as "currentInnings",
    "wrSystemPlayerCount" as "systemPlayerCount"
    from "tblCommentaries" tc
    left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
    left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
    left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
    left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
    left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
    left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
    left join "tblEncryptedData" te8 on tc."wrCompetitionId" = te8."wrKey"
    left join "tblEncryptedData" te9 on tc."wrEventId" = te9."wrKey"
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"`,
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
        insert into "tblCommentaries" ("wrEventTypeId","wrMatchTypeId","wrCompetitionId","wrEventId","wrEventDate","wrEventName","wrEventRefId","wrTeam1Id","wrTeam2Id","wrLocation","wrWeather","wrPitch","wrDisplayStatus","wrTarget","wrMarketID","wrTpId","isSignalROn","isMatchTypeUpdated" , "wrCreatedBy" , "wrCreatedDate","wrCommentaryStatus","wrCurrentInnings", "wrSystemPlayerCount") values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
          $5,$6,$7,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
          $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now(),1,
          1,
          $20
        ) returning *         
      )

      select 
    te7."wrValue" as "commentaryId",
    te."wrValue" as "matchTypeId",
    mt."wrMatchType" AS "matchType",
    te1."wrValue" as "eventTypeId",
    te2."wrValue" as "team1Id",
    te3."wrValue" as "team2Id",
    tt1."wrTeamName" as "team1Name",
    tt2."wrTeamName" as "team2Name",
    te8."wrValue" as "competitionId",
    te9."wrValue" as "eventId",
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
    "isMatchTypeUpdated" as "isMatchTypeUpdated",
    "wrCurrentInnings" as "currentInnings"
    from "insert_data" tc
    left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
    left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
    left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
    left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
    left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
    left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
    left join "tblEncryptedData" te8 on tc."wrCompetitionId" = te8."wrKey"
    left join "tblEncryptedData" te9 on tc."wrEventId" = te9."wrKey"
    left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
    left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"  
    LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
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
          null,
          null,
          data.marketId || null,
          data.tpId || null,
          data.isSignalROn || false,
          data.isMatchTypeUpdated || false,
          request.userTokenInfo.WrUserId,
          data.systemPlayerCount || null,
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
      insert into "tblCommentaryTeams" ("wrCommentaryId" , "wrTeamId","wrTeamCaptain","wrTeamKipper" , "wrShortName" , "wrTeamName","wrCurrentInnings","wrIsBattingComplete")
       values (
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)),
        $8,
        false                
      )
      ,(
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $5),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $6),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $7),
        (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5)),
        (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5)),
        $8,
        false
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
        "wrBatsmanAverage", "wrBatsmanStrikeRate", "wrBowlerEconomy", "wrBowlerAverage")
        values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
          (select "wrPlayerName" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
          $4,
          $5,
          (select "wrBatsmanAverage" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
          (select "wrBatsmanStrikeRate" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
          (select "wrBowlerEconomy" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
          (select "wrBowlerAverage" from "tblPlayers" where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3))
        )
        RETURNING *   
      ) 
      SELECT 
      tp."wrValue" as "playerId", 
      tp1."wrValue" as "teamId",
      tp2."wrValue" as "commentaryId",
      tp3."wrValue" as "commentaryPlayerId"
      FROM "insert_data" id
      left join "tblEncryptedData" tp on id."wrPlayerId" = tp."wrKey"
      left join "tblEncryptedData" tp1 on id."wrTeamId" = tp1."wrKey"
      left join "tblEncryptedData" tp2 on id."wrCommentaryId" = tp2."wrKey"
      left join "tblEncryptedData" tp3 on id."wrCommentaryPlayerId" = tp3."wrKey"

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
        "wrCommentaryId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)
        AND "wrTeamId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $2)
        AND "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3)
        AND "wrCurrentInnings" = $5
      RETURNING *
    )
    INSERT INTO "tblCommentaryPlayers" ("wrCommentaryId", "wrTeamId", "wrPlayerId", "wrPlayerName", "wrDisplayOrder", "wrCurrentInnings",
    "wrBatsmanAverage", "wrBatsmanStrikeRate", "wrBowlerEconomy", "wrBowlerAverage")
    SELECT
      (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1),
      (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $2),
      (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3),
      (SELECT "wrPlayerName" FROM "tblPlayers" WHERE "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3)),
      $4,
      $5,
      (SELECT "wrBatsmanAverage" FROM "tblPlayers" WHERE "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3)),
      (SELECT "wrBatsmanStrikeRate" FROM "tblPlayers" WHERE "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3)),
      (SELECT "wrBowlerEconomy" FROM "tblPlayers" WHERE "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3)),
      (SELECT "wrBowlerAverage" FROM "tblPlayers" WHERE "wrPlayerId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3))
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
      "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrMatchTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrCompetitionId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
      "wrEventId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
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
      `update "tblCommentaryTeams" set
      "wrTeamCaptain" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrTeamKipper" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrShortName" = (select "wrTeamShortName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
      "wrTeamName" = (select "wrTeamName" from "tblTeams" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)),
      "wrCurrentInnings" = $5
      where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) and "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
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
      mt."wrMatchType" AS "matchType",
      te1."wrValue" as "eventTypeId",
      te2."wrValue" as "team1Id",
      te3."wrValue" as "team2Id",
      tt1."wrTeamName" as "team1Name",
      tt2."wrTeamName" as "team2Name",
      te8."wrValue" as "competitionId",
      te9."wrValue" as "eventId",
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
      "isMatchTypeUpdated" as "isMatchTypeUpdated",
      "wrCurrentInnings" as "currentInnings"	
      from "tblCommentaries" tc
      left join "tblEncryptedData" te on tc."wrMatchTypeId" = te."wrKey"
      left join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey"
      left join "tblEncryptedData" te2 on tc."wrTeam1Id" = te2."wrKey"
      left join "tblEncryptedData" te3 on tc."wrTeam2Id" = te3."wrKey"
      left join "tblEncryptedData" te4 on tc."wrHomeSideTeam" = te4."wrKey"
      left join "tblEncryptedData" te5 on tc."wrTossWonBy" = te5."wrKey"
      left join "tblEncryptedData" te6 on tc."wrWinnerId" = te6."wrKey"
      left join "tblEncryptedData" te7 on tc."wrCommentaryId" = te7."wrKey"
      left join "tblEncryptedData" te8 on tc."wrCompetitionId" = te8."wrKey"
      left join "tblEncryptedData" te9 on tc."wrEventId" = te9."wrKey"
      left join "tblTeams" tt1 on tt1."wrTeamId" = tc."wrTeam1Id"
      left join "tblTeams" tt2 on tt2."wrTeamId" = tc."wrTeam2Id"
      LEFT JOIN "tblMatchTypes" mt ON tc."wrMatchTypeId" = mt."wrMatchTypeId"
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
      ),
      delete_overs as (
        delete from "tblOvers" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      ),
      delete_ball_by_ball as (
        delete from "tblCommentaryBallByBalls" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      ),
      delete_partnership as (
        delete from "tblCommentaryPartnerships" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
      ),
      delete_wicket as (
        delete from "tblCommentaryWickets" where "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
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

const deleteBallByBallCommentoriesQuery = async (id, request, fastify) => {
  try {
    return await fastify.db.query(
      `WITH delete_partnership AS (
          DELETE FROM "tblCommentaryPartnerships" WHERE "wrCommentaryBallByBallId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)
        ),
        delete_wicket AS (
          DELETE FROM "tblCommentaryWickets" WHERE "wrCommentaryBallByBallId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)
        )
      DELETE FROM "tblCommentaryBallByBalls" WHERE "wrCommentaryBallByBallId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)`,
      { bind: [id], type: fastify.db.QueryTypes.DELETE }
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
        DELETE FROM "tblOvers"
        WHERE "wrOverId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)
    
    )
    DELETE FROM "tblCommentaryBallByBalls"
    WHERE "wrOverId" IN (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1);
      `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
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
  "wrIsWin" as "isWin",
  tct."wrCurrentInnings" as "currentInnings", 
  tct."wrIsBattingComplete" as "isBattingComplete",
  te5."wrValue" as "commentaryPlayerTeamCaptain",
  te6."wrValue" as "commentaryPlayerTeamKipper"
  from "tblCommentaryTeams" tct 
  left join "tblEncryptedData" te on tct."wrCommentaryTeamId" = te."wrKey"
  left join "tblEncryptedData" te1 on tct."wrCommentaryId" = te1."wrKey"
  left join "tblEncryptedData" te2 on tct."wrTeamId" = te2."wrKey"
  left join "tblEncryptedData" te3 on tct."wrTeamCaptain" = te3."wrKey"
  left join "tblEncryptedData" te4 on tct."wrTeamKipper" = te4."wrKey"
  left join "tblEncryptedData" te5 on tct."wrCommentaryPlayerTeamCaptain" = te5."wrKey"
  left join "tblEncryptedData" te6 on tct."wrCommentaryPlayerTeamKipper" = te6."wrKey"

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
    "wrBowlerAverage" as "bowlerAverage",
    "wrCurrentInnings" as "currentInnings"
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
    "wrIsDelete" as "isDelete",
    "wrCurrentInnings" as "currentInnings"
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
    "wrIsDelete" as "isDelete",
    "wrCurrentInnings" as "currentInnings"
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
    "wrPlayerBalls" as "playerBalls",
    tcw."wrWicketCount" as "wicketCount",
    tcw."wrBallCount" as "ballCount",
    tcw."wrCurrentInnings" as "currentInnings"
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

const getAllCommentaryPartnershipQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select 
    te."wrValue" as "commentaryPartnershipId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    te3."wrValue" as "batter1Id",
    "wrBatter1Name" as "batter1Name",
    te4."wrValue" as "batter2Id",
    "wrBatter2Name" as "batter2Name",
    "wrTotalRuns" as "totalRuns",
    "wrTotalBalls" as "totalBalls",
    "wrExtras" as "extras",
    "wrCurrentInnings" as "currentInnings",
    te5."wrValue" as "commentaryBallByBallId"
    from "tblCommentaryPartnerships" tcw
    left join "tblEncryptedData" te on tcw."wrCommentaryPartnershipId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcw."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcw."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcw."wrBatter1Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tcw."wrBatter2Id" = te4."wrKey"
    left join "tblEncryptedData" te5 on tcw."wrCommentaryBallByBallId" = te5."wrKey"  

    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

// ---------------------------------------------

const createCommentaryPartnershipQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_partnership as (
        insert into "tblCommentaryPartnerships" ("wrCommentaryId", "wrTeamId", "wrBatter1Id", "wrBatter2Id", "wrBatter1Name", "wrBatter2Name", "wrTotalRuns", "wrTotalBalls", "wrExtras" , "wrCommentaryBallByBallId","wrCurrentInnings") values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
          $5,$6,$7,$8,$9,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $10),
          $11
        ) 
        returning *
      )

      select 
    te."wrValue" as "commentaryPartnershipId",
    te1."wrValue" as "commentaryId",
    te2."wrValue" as "teamId",
    te3."wrValue" as "batter1Id",
    "wrBatter1Name" as "batter1Name",
    te4."wrValue" as "batter2Id",
    "wrBatter2Name" as "batter2Name",
    "wrTotalRuns" as "totalRuns",
    "wrTotalBalls" as "totalBalls",
    "wrExtras" as "extras",
    te5."wrValue" as "commentaryBallByBallId",
    tcw."wrCurrentInnings" as "currentInnings"
    from "insert_partnership" tcw
    left join "tblEncryptedData" te on tcw."wrCommentaryPartnershipId" = te."wrKey"
    left join "tblEncryptedData" te1 on tcw."wrCommentaryId" = te1."wrKey"
    left join "tblEncryptedData" te2 on tcw."wrTeamId" = te2."wrKey"
    left join "tblEncryptedData" te3 on tcw."wrBatter1Id" = te3."wrKey"
    left join "tblEncryptedData" te4 on tcw."wrBatter2Id" = te4."wrKey"
    left join "tblEncryptedData" te5 on tcw."wrCommentaryBallByBallId" = te5."wrKey"  
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
      "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrBatter1Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
      "wrBatter2Id" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
      "wrBatter1Name" = $5,
      "wrBatter2Name" = $6,
      "wrTotalRuns" = $7,
      "wrTotalBalls" = $8,
      "wrExtras" = $9,
      "wrCommentaryBallByBallId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $10)
      where "wrCommentaryPartnershipId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $11)
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
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        $3,
        (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) , 
        $5 , $6 , $7 , $8 , $9 , $10 , $11 , $12 , $13 , $14 , $15 , $16 , $17 , $18 , $19 , $20 , $21 , $22 , $23
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
      "wrIsDelete" as "isDelete",
      "wrCurrentInnings" as "currentInnings"
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
      "wrBowlerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $19),
      "wrOver" = $20
      where "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $21)
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
    return await fastify.db.query(
      `update "tblCommentaries" set 
      "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrMatchTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrCompetitionId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3),
      "wrEventId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
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
        "wrIsWin" = $11,
        "wrCurrentInnings" = $12,
        "wrIsBattingComplete" = $13
        where "wrCommentaryTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $14)
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
      AND "wrCurrentInnings" = $46
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
        $26,
        $27
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
    "wrIsDelete" as "isDelete",
    "wrCurrentInnings" as "currentInnings"
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
      "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
      "wrOverCount" = $3,
      "wrCurrentOverBalls" = $4,
      "wrBowler_ID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5),
      "wrBat_StrikeID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $6),
      "wrBat_NONStrikeID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7),
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
      "wrBall_PlayerID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $18),
      "wrBall_BowlerID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $19),
      "wrBall_FielderID1" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $20),
      "wrBall_FielderID2" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $21),
      "wrOver_isMaiden" = $22,
      "wrNextBat_StrikeID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $23),
      "wrNextBat_NONStrikeID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $24),
      "wrIsDelete" = $25
      where "wrCommentaryBallByBallId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $26)
      AND "wrCurrentInnings" = $27
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
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,
          $4,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $5),
          $6,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $7),
          $8,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
          $10,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $11),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $12),
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
    "wrPlayerBalls" as "playerBalls",
    tcw."wrWicketCount" as "wicketCount",
    tcw."wrBallCount" as "ballCount",
    tcw."wrCurrentInnings" as "currentInnings"
    from "insert_data" tcw
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
      "wrBowlerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrBowlerName" = $2,
      "wrWicketType" = $3,
      "wrBatterId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
      "wrBatterName" = $5,
      "wrFieldPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $6),
      "wrFieldPlayerName" = $7,
      "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
      "wrOverCount" = $9,
      "wrCommentaryBallByBallId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $10),
      "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $11),
      "wrTeamScore" = $12,
      "wrPlayerRun" = $13,
      "wrPlayerBalls" = $14,
      "wrIsDelete" = $15,
      "wrWicketCount" = $16,
      "wrBallCount" = $17
      where "wrCommentaryWicketId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $18)
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
      where "wrCommentaryId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)`,
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
      "wrUpdateTime" > (CURRENT_TIMESTAMP - INTERVAL '1 second' * $1);`,
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
        "wrCommentaryPlayerTeamCaptain" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        "wrCommentaryPlayerTeamKipper" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
      where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
      AND "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4)
      AND "wrCurrentInnings" = $5
    
    `;

    // update for team2
    const query2 = `
    update "tblCommentaryTeams" set
      "wrCommentaryPlayerTeamCaptain" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      "wrCommentaryPlayerTeamKipper" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
      where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
      AND "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4)
      AND "wrCurrentInnings" = $5
    `;

    await fastify.db.query(query1, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        data.team1Captain,
        data.team1Kipper,
        data.team1Id,
        data.commentaryId,
        data.currentInnings,
      ],
    });

    await fastify.db.query(query2, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        data.team2Captain,
        data.team2Kipper,
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
}
const updateMatchTypeInCommentaryQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCommentaries" SET "wrMatchTypeId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1) WHERE "wrCommentaryId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $2)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.matchTypeId, data.commentaryId],
      }
    )
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateMatchTypeInCommentaryQuery",
      request
    );
    throw new Error(err.message);
  }
}
const changeBowlerInCommentary = async (data, request,fastify) => {
  try {
    // update bowler in tblOver
    const query1 = `
    update "tblOvers" set
      "wrBowlerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    WHERE 
      "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
      AND "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
      AND "wrCurrentInnings" = $4
    `;
    const query2 = `
    update "tblCommentaryBallByBalls" set
      "wrBowler_ID" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    WHERE 
      "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
      AND "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
      AND "wrCurrentInnings" = $4
    `;

    const query3 = `
    update "tblCommentaryWickets" set
      "wrBowlerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    WHERE 
      "wrCommentaryId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)
      AND "wrOverId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)
      AND "wrCurrentInnings" = $4
    `;

    const params = [
      data.bowlerId,
      data.commentaryId,
      data.overId,
      data.currentInnings,
    ];

    await fastify.db.query(query1, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: params,
    });

    await fastify.db.query(query2, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: params,
    });

    await fastify.db.query(query3, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: params,
    });
    global.tblOvers = await getAllOversQuery(fastify);
    global.tblCommentaryBallByBall = await getAllCommentaryBallByBallQuery(fastify);
    global.tblCommentaryWickets = await getAllCommentaryWicketQuery(fastify);


    let commentaryBallByBall = global.tblCommentaryBallByBall.filter(
      (ball) =>
        ball.commentaryId === data.commentaryId &&
        ball.overId === data.overId
    );

    let commentaryWickets = global.tblCommentaryWickets.filter(
      (wicket) =>
        wicket.commentaryId === data.commentaryId
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
}
const getCommentaryBallByBallQuery = async (request,fastify) => {
  return await fastify.db.query(
    `
    WITH filtered_commentary AS (
        SELECT *
        FROM "tblCommentaryBallByBalls"
        WHERE "wrCommentaryId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $1)
    )
    SELECT
        te13."wrValue" AS "commentaryBallByBallId",
        te1."wrValue" AS "commentaryId",
        te2."wrValue" AS "teamId",
        te3."wrValue" AS "overId",
        "wrOverCount" AS "overCount",
        "wrCurrentOverBalls" AS "currentOverBalls",
        te4."wrValue" AS "bowlerId",
        te5."wrValue" AS "batStrikeId",
        te6."wrValue" AS "batNonStrikeId",
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
        te7."wrValue" AS "ballPlayerId",
        te8."wrValue" AS "ballBowlerId",
        te9."wrValue" AS "ballFielderId1",
        te10."wrValue" AS "ballFielderId2",
        "wrOver_isMaiden" AS "overIsMaiden",
        te11."wrValue" AS "nextBatStrikeId",
        te12."wrValue" AS "nextBatNonStrikeId",
        "wrIsDelete" AS "isDelete",
        "wrCurrentInnings" AS "currentInnings"
    FROM filtered_commentary fc
    LEFT JOIN "tblEncryptedData" te1 ON fc."wrCommentaryId" = te1."wrKey"
    LEFT JOIN "tblEncryptedData" te2 ON fc."wrTeamId" = te2."wrKey"
    LEFT JOIN "tblEncryptedData" te3 ON fc."wrOverId" = te3."wrKey"
    LEFT JOIN "tblEncryptedData" te4 ON fc."wrBowler_ID" = te4."wrKey"
    LEFT JOIN "tblEncryptedData" te5 ON fc."wrBat_StrikeID" = te5."wrKey"
    LEFT JOIN "tblEncryptedData" te6 ON fc."wrBat_NONStrikeID" = te6."wrKey"
    LEFT JOIN "tblEncryptedData" te7 ON fc."wrBall_PlayerID" = te7."wrKey"
    LEFT JOIN "tblEncryptedData" te8 ON fc."wrBall_BowlerID" = te8."wrKey"
    LEFT JOIN "tblEncryptedData" te9 ON fc."wrBall_FielderID1" = te9."wrKey"
    LEFT JOIN "tblEncryptedData" te10 ON fc."wrBall_FielderID2" = te10."wrKey"
    LEFT JOIN "tblEncryptedData" te11 ON fc."wrNextBat_StrikeID" = te11."wrKey"
    LEFT JOIN "tblEncryptedData" te12 ON fc."wrNextBat_NONStrikeID" = te12."wrKey"
    LEFT JOIN "tblEncryptedData" te13 ON fc."wrCommentaryBallByBallId" = te13."wrKey"
    ORDER BY fc."wrCommentaryBallByBallId" ASC
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [request.body.commentaryId],
    }
  );
}
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
  updateBallByBallCommentoriesQuery,
  getAllCommentaryPartnershipQuery,
  createCommentaryWicketQuery,
  updateCommentaryWicketQuery,
  createCommentaryPartnershipQuery,
  updateCommentaryPartnershipQuery,
  deleteBallByBallCommentoriesQuery,
  deleteOverCommentoriesQuery,
  //nitesh Updated
  UpdateCommentaryTimeQuery,
  getCommentaryID_Socket,
  upsertCommentaryPlayers,
  updateCommentaryPlayerIdInCommentaryTeams,
  updateMatchTypeInCommentaryQuery,
  changeBowlerInCommentary,
  getCommentaryBallByBallQuery
};

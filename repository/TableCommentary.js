const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        te."wrValue" as "commentaryId",
        "wrEventDate" as "eventDate",
        "wrEventName" as "eventName",
        "wrDisplayStatus" as "displayStatus",
        tt1."wrTeamName" as "team1Name",
        tt2."wrTeamName" as "team2Name"
        from "tblCommentaries" tc 
        left join "tblEncryptedData" te on tc."wrCommentaryId" = te."wrKey"
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
        insert into "tblCommentaries" ("wrEventTypeId","wrMatchTypeId","wrCompetitionId","wrEventId","wrEventDate","wrEventName","wrEventRefId","wrTeam1Id","wrTeam2Id","wrLocation","wrWeather","wrPitch","wrDisplayStatus","wrTarget","wrMarketID","wrTpId","isSignalROn","isMatchTypeUpdated" , "wrCreatedBy" , "wrCreatedDate") values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,$4,$5,$6,$7,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
          $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now()
        ) returning *         
      )

      select 
        te."wrValue" as "commentaryId",
        "wrEventDate" as "eventDate",
        "wrEventName" as "eventName",
        "wrDisplayStatus" as "displayStatus",
        tt1."wrTeamName" as "team1Name",
        tt2."wrTeamName" as "team2Name"
        from "insert_data" tc 
        left join "tblEncryptedData" te on tc."wrCommentaryId" = te."wrKey"
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
      te."wrValue" as "matchTypeId",
      te1."wrValue" as "eventTypeId",
      te2."wrValue" as "team1Id",
      te3."wrValue" as "team2Id",
      "wrCompetitionId" as "competitionId",
      "wrEventId" as "eventId",
      "wrEventDate" as "eventDate",
      "wrEventName" as "eventName",
      "wrEventRefId" as "eventRefId",
      "wrLocation" as "location",
      "wrWeather" as "weather",
      "wrPitch" as "pitch",
      "wrDisplayStatus" as "displayStatus",
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
      `
      select 
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
};

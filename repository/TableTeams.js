const { errorLogger } = require("../utilities/logger");

const allTeamQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
    "wrTeamId" as "teamId",
    tt."wrEventTypeId" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "WrTeamJersey" as "jersey",
    tt."wrImage" as "image",
    "wrCountry" as "country",
    et."wrEventType" AS "eventType",
    tt."wrTeamColor" AS "teamColor",
    tt."wrBackgroundColor" AS "backgroundColor"
     FROM "tblTeams" tt
      LEFT JOIN "tblEventTypes" et ON tt."wrEventTypeId" = et."wrEventTypeId"
      WHERE tt."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  // return await fastify.db.query(
  //   `SELECT
  //   "wrTeamId" as "pId",
  //   te."wrValue" as "teamId",
  //   te2."wrValue" as "eventTypeId",
  //   "wrTeamName" as "teamName",
  //   "wrTeamShortName" as "teamShortName",
  //   "WrTeamJersey" as "jersey",
  //   tt."wrImage" as "image",
  //   "wrCountry" as "country",
  //   et."wrEventType" AS "eventType"
  //    FROM "tblTeams" tt left join "tblEncryptedData" te on tt."wrTeamId" = te."wrKey"
  //     left join "tblEncryptedData" te2 on tt."wrEventTypeId" = te2."wrKey"
  //     LEFT JOIN "tblEventTypes" et ON tt."wrEventTypeId" = et."wrEventTypeId"`,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const insertTeamQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
      INSERT INTO "tblTeams" ("wrTeamName","wrTeamShortName", "wrImage", "wrCountry", "wrEventTypeId", "wrCreatedBy", "wrCreatedDate" , "WrTeamJersey","wrTeamColor", "wrBackgroundColor")
      VALUES ($1,$2,$3,$4,$5,$6,$7 , $8,$9 , $10)
      RETURNING *    
    )
    SELECT 
    "wrTeamId" as "teamId",
    tt."wrEventTypeId" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "WrTeamJersey" as "jersey",
    tt."wrImage" as "image",
    "wrCountry" as "country",
    "wrEventType" AS "eventType",
    "wrTeamColor" AS "teamColor",
    "wrBackgroundColor" AS "backgroundColor"
     FROM "insert_data" tt 
      INNER JOIN "tblEventTypes" evt ON tt."wrEventTypeId" = evt."wrEventTypeId" 
    `,
      {
        bind: [
          data.teamName || null,
          data.teamShortName || null,
          data.image || null,
          data.country || null,
          data.eventTypeId || null,
          data.userId,
          new Date(),
          data.jersey || null,
          data.teamColor || null,
          data.backgroundColor || null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/insertTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTeamQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTeams" SET "wrTeamName" = $1, "wrTeamShortName" = $2,"wrImage" = $3, "wrCountry" = $4, "wrEventTypeId" = $5, "wrModifyBy" = $6, 
      "wrModifyDate" = $7,"WrTeamJersey"=$8, "wrTeamColor" = $10, "wrBackgroundColor" = $11
        WHERE "wrTeamId" = $9`,
      {
        bind: [
          data.teamName,
          data.teamShortName,
          data.image,
          data.country,
          data.eventTypeId,
          data.userId,
          new Date(),
          data.jersey,
          data.teamId,
          data.teamColor,
          data.backgroundColor,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/updateTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTeams" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrTeamId" = ANY($3)`,
      {
        bind: [true, request.userTokenInfo.WrUserId, teamId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/deleteTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayersByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT      
      "wrRefPlayerId" as "playerId",
      "wrPlayerName" as "playerName",
      "wrBatsmanAverage" as "batsmanAverage",
      "wrBatsmanStrikeRate" as "batsmanStrikeRate",
      "wrIsKipper" as "isKipper"     
      FROM "tblTeamPlayers" tp 
      left join "tblPlayers" pl on tp."wrRefPlayerId" = pl."wrPlayerId" AND pl."wrIsDeleted" = false
      where tp."wrTeamId" = $1 and tp."wrIsDeleted" = false`,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getAllPlayersByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayersByCompetitionIdTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT     
          tp."wrRefPlayerId" as "playerId",
          pl."wrPlayerName" as "playerName",
          pl."wrPlayerTypeId" as "playerTypeId",
          tpt."wrPlayerType" as "playerType"
      FROM "tblTeamPlayers" tp 
      LEFT JOIN "tblPlayers" pl ON tp."wrRefPlayerId" = pl."wrPlayerId" AND pl."wrIsDeleted" = false
      LEFT JOIN "tblPlayerTypes" tpt ON pl."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      where tp."wrTeamId" = $1 AND tp."wrIsDeleted" = false`,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getAllPlayersByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllCompetitionByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT      
      "wrRefCompetitionId" as "competitionId",
      "wrCompetition" as "competition"
      FROM "tblTeamCompetition" tp 
      left join "tblCompetitions" pl on tp."wrRefCompetitionId" = pl."wrCompetitionId"
      where tp."wrTeamId" = $1 and tp."wrIsDeleted" = false and pl."wrIsDeleted" = false`,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getAllCompetitionByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayersByTeamIdAndMatchTypeIdQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT      
      "wrRefPlayerId" as "playerId",
      "wrPlayerName" as "playerName",
      "wrBatsmanAverage" as "batsmanAverage",
      "wrBatsmanStrikeRate" as "batsmanStrikeRate",
      "wrIsKipper" as "isKipper",
      COALESCE(pbh."wrBallsFacedCount", 0) as "ballsFacedCount",
      COALESCE(pbh."wr4Count", 0) + COALESCE(pbh."wr6Count", 0) as "boundary"
      FROM "tblTeamPlayers" tp 
      left join "tblPlayers" pl on tp."wrRefPlayerId" = pl."wrPlayerId" AND pl."wrIsDeleted" = false
      left join "tblPlayerBattingHistory" pbh on tp."wrRefPlayerId" = pbh."wrPlayerId" and pbh."wrMatchTypeId" = $2
      where tp."wrTeamId" = $1 and tp."wrIsDeleted" = false`,
      {
        bind: [data.teamId, data.matchTypeId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getAllPlayersByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allTeamQuery,
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
  getAllPlayersByTeamIdQuery,
  getAllCompetitionByTeamIdQuery,
  getAllPlayersByCompetitionIdTeamIdQuery,
  getAllPlayersByTeamIdAndMatchTypeIdQuery,
};

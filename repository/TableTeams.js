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
    et."wrEventType" AS "eventType",
    tt."wrTeamColor" AS "teamColor",
    tt."wrBackgroundColor" AS "backgroundColor",
    tt."wrImagePath" AS "imagePath",
    tt."wrJerseyPath" AS "jerseyPath",
    tt."wrTpId" AS "tpId",
    tt."wrCountryId" AS "countryId",
    tt."wrIsMen" AS "isMen",
    tt."wrIsInternational" AS "isInternational"
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
const getTeamsByIds = async (data,request,fastify) => {
  try {
      return await fastify.db.query(
    `SELECT 
    "wrTeamId" as "teamId",
    tt."wrEventTypeId" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "WrTeamJersey" as "jersey",
    tt."wrImage" as "image",
    et."wrEventType" AS "eventType",
    tt."wrTeamColor" AS "teamColor",
    tt."wrBackgroundColor" AS "backgroundColor",
    tt."wrImagePath" AS "imagePath",
    tt."wrJerseyPath" AS "jerseyPath",
    tt."wrTpId" AS "tpId",
    tt."wrCountryId" AS "countryId",
    tt."wrIsMen" AS "isMen",
    tt."wrIsInternational" AS "isInternational"
     FROM "tblTeams" tt
      LEFT JOIN "tblEventTypes" et ON tt."wrEventTypeId" = et."wrEventTypeId"
      WHERE 
      tt."wrTeamId" = ANY($1) AND
      tt."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind : [
        data.teamIds
      ]
    }
  );
  } catch (error) {
     errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableTeams/getTeamsByIds",
      request
    );
    return true;
    // throw new Error(err.message);
  }
};
const insertTeamQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
      INSERT INTO "tblTeams" ("wrTeamName","wrTeamShortName", "wrImage", "wrEventTypeId", "wrCreatedBy", "wrCreatedDate" , "WrTeamJersey","wrTeamColor", "wrBackgroundColor", "wrImagePath", "wrJerseyPath", "wrTpId", "wrCountryId", "wrIsMen", "wrIsInternational")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *    
    )
    SELECT 
    "wrTeamId" as "teamId",
    tt."wrEventTypeId" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "WrTeamJersey" as "jersey",
    tt."wrImage" as "image",
    "wrEventType" AS "eventType",
    "wrTeamColor" AS "teamColor",
    "wrBackgroundColor" AS "backgroundColor",
    tt."wrImagePath" AS "imagePath",
    tt."wrJerseyPath" AS "jerseyPath",
    tt."wrTpId" AS "tpId",
    tt."wrCountryId" AS "countryId",
    tt."wrIsMen" AS "isMen",
    tt."wrIsInternational" AS "isInternational"
     FROM "insert_data" tt 
      INNER JOIN "tblEventTypes" evt ON tt."wrEventTypeId" = evt."wrEventTypeId" 
    `,
      {
        bind: [
          data.teamName || null,
          data.teamShortName || null,
          data.image || null,
          data.eventTypeId || null,
          data.userId,
          new Date(),
          data.jersey || null,
          data.teamColor || null,
          data.backgroundColor || null,
          data.imagePath || null,
          data.jerseyPath || null,
          data.tpId || null,
          data.countryId || null,
          data?.isMen ?? true,
          data?.isInternational ?? false
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
const updateExchangeTeamQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `WITH update_data AS (
        UPDATE "tblTeams" SET
        "wrModifyBy" = $1,
        "wrModifyDate" = $2,
        "wrTpId" = $3
        WHERE "wrTeamId" = $4
        AND "wrIsDeleted" = false
        RETURNING *
      )
      SELECT 
        tt."wrTeamId" AS "teamId",
        tt."wrEventTypeId" AS "eventTypeId",
        tt."wrTeamName" AS "teamName",
        tt."wrTeamShortName" AS "teamShortName",
        tt."WrTeamJersey" AS "jersey",
        tt."wrImage" AS "image",
        tt."wrCountry" AS "country",
        evt."wrEventType" AS "eventType",
        tt."wrTeamColor" AS "teamColor",
        tt."wrBackgroundColor" AS "backgroundColor",
        tt."wrImagePath" AS "imagePath",
        tt."wrJerseyPath" AS "jerseyPath",
        tt."wrTpId" AS "tpId",
        tt."wrIsMen" AS "isMen",
        tt."wrIsInternational" AS "isInternational"
      FROM update_data tt
      INNER JOIN "tblEventTypes" evt ON tt."wrEventTypeId" = evt."wrEventTypeId"
      `,
      {
        bind: [
          data.userId,
          new Date(),
          data.tpId,
          data.teamId
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/updateExchangeTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};


const updateTeamQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `WITH update_data AS (
        UPDATE "tblTeams" SET "wrTeamName" = $1, "wrTeamShortName" = $2,"wrImage" = $3, "wrEventTypeId" = $4, "wrModifyBy" = $5, 
          "wrModifyDate" = $6,"WrTeamJersey"=$7, "wrTeamColor" = $9, "wrBackgroundColor" = $10, "wrImagePath" = $11, "wrJerseyPath" = $12, "wrTpId" = $13, "wrCountryId" = $14, "wrIsMen" = $15, "wrIsInternational" = $16
        WHERE "wrTeamId" = $8
        returning *
      )
      SELECT 
        "wrTeamId" as "teamId",
        tt."wrEventTypeId" as "eventTypeId",
        "wrTeamName" as "teamName",
        "wrTeamShortName" as "teamShortName",
        "WrTeamJersey" as "jersey",
        tt."wrImage" as "image",
        "wrEventType" AS "eventType",
        "wrTeamColor" AS "teamColor",
        "wrBackgroundColor" AS "backgroundColor",
        tt."wrImagePath" AS "imagePath",
        tt."wrJerseyPath" AS "jerseyPath",
        tt."wrTpId" AS "tpId",
        tt."wrCountryId" AS "countryId",
        tt."wrIsMen"::boolean AS "isMen",
        tt."wrIsInternational"::boolean AS "isInternational"
      FROM "update_data" tt 
      INNER JOIN "tblEventTypes" evt ON tt."wrEventTypeId" = evt."wrEventTypeId"
      `,
      {
        bind: [
          data.teamName,
          data.teamShortName,
          data.image,
          data.eventTypeId,
          data.userId,
          new Date(),
          data.jersey,
          data.teamId,
          data.teamColor,
          data.backgroundColor,
          data.imagePath,
          data.jerseyPath,
          data.tpId,
          data.countryId || null,
          data?.isMen ?? true,
          data?.isInternational ?? false
        ],
        type: fastify.db.QueryTypes.SELECT,
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
      "wrJerseyPlayerImage" as "jerseyPlayerImage",
      "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
      pl."wrTpId" as "tpId",
      "wrPlayerName" as "playerName",
      "wrPlayerOrder" as "playerOrder",
      "wrTeamId" as "teamId",
      "wrHomeTeam" as "homeTeam",
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
      `SELECT DISTINCT ON (tp."wrRefPlayerId")
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
      "wrCompetition" as "competition",
      tp."wrTpId" as "tpId"
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
      tp."wrHomeTeam" as "homeTeam",
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
const getTeamPlayerTournamentQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
        `SELECT      
      tp."wrPlayerId" as "playerId",
      pl."wrPlayerName" as "playerName",
      "wrBatsmanAverage" as "batsmanAverage",
      "wrBatsmanStrikeRate" as "batsmanStrikeRate",
      "wrIsKipper" as "isKipper",
      COALESCE(pbh."wrBallsFacedCount", 0) as "ballsFacedCount",
      COALESCE(pbh."wr4Count", 0) + COALESCE(pbh."wr6Count", 0) as "boundary"
      FROM "tblTournamentTeamPlayers" tp 
      left join "tblPlayers" pl on tp."wrPlayerId" = pl."wrPlayerId" AND pl."wrIsDeleted" = false
      left join "tblPlayerBattingHistory" pbh on tp."wrPlayerId" = pbh."wrPlayerId" and pbh."wrMatchTypeId" = $1
      where tp."wrTeamId" = $2 and tp."wrCompetitionId" = $3 and tp."wrIsDeleted" = false`,
      {
        bind: [data.matchTypeId,data.teamId, data.competitionId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getTeamPlayerTournamentQuery",
      request
    );
    throw new Error(err.message);
  }
};
const getAllTeamsByIdsQuery = async (whereCondition = undefined, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
          "wrTeamId" as "teamId",
          tt."wrEventTypeId" as "eventTypeId",
          "wrTeamName" as "teamName",
          "wrTeamShortName" as "teamShortName",
          "WrTeamJersey" as "jersey",
          tt."wrImage" as "image",
          et."wrEventType" AS "eventType",
          tt."wrTeamColor" AS "teamColor",
          tt."wrBackgroundColor" AS "backgroundColor",
          tt."wrImagePath" AS "imagePath",
          tt."wrJerseyPath" AS "jerseyPath",
          tt."wrTpId" AS "tpId",
          tt."wrCountryId" AS "countryId",
          tt."wrIsMen" AS "isMen",
          tt."wrIsInternational" AS "isInternational"
      FROM "tblTeams" tt
      LEFT JOIN "tblEventTypes" et ON tt."wrEventTypeId" = et."wrEventTypeId"
      ${whereCondition ? `WHERE ${whereCondition}` : 'WHERE tt."wrIsDeleted" = false'}`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    console.log("teams error", err)
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams/getAllTeamsByIdsQuery",
      null
    );
    throw new Error(err.message);
  }
}

const activeInactiveTeamQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `WITH update_data AS (
        UPDATE "tblTeams" SET
          "wrIsMen" = $1,
          "wrIsInternational" = $2,
          "wrModifyBy" = $3,
          "wrModifyDate" = $4
        WHERE "wrTeamId" = $5
        returning *
      )
      SELECT 
        "wrTeamId" as "teamId",
        tt."wrEventTypeId" as "eventTypeId",
        "wrTeamName" as "teamName",
        "wrTeamShortName" as "teamShortName",
        "WrTeamJersey" as "jersey",
        tt."wrImage" as "image",
        "wrEventType" AS "eventType",
        "wrTeamColor" AS "teamColor",
        "wrBackgroundColor" AS "backgroundColor",
        tt."wrImagePath" AS "imagePath",
        tt."wrJerseyPath" AS "jerseyPath",
        tt."wrTpId" AS "tpId",
        tt."wrCountryId" AS "countryId",
        tt."wrIsMen" AS "isMen",
        tt."wrIsInternational" AS "isInternational"
      FROM "update_data" tt 
      INNER JOIN "tblEventTypes" evt ON tt."wrEventTypeId" = evt."wrEventTypeId"
      `,
      {
        bind: [
          data?.isMen ?? null,
          data?.isInternational ?? null,
          request?.userTokenInfo?.WrUserId,
          new Date(),
          data.teamId
        ],
        type: fastify.db.QueryTypes.UPDATE
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeams.js/activeInactiveTeamQuery",
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
  getAllTeamsByIdsQuery,
  getTeamsByIds,
  updateExchangeTeamQuery,
  getTeamPlayerTournamentQuery,
  activeInactiveTeamQuery
};

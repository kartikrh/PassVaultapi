const { errorLogger } = require("../utilities/logger");

const getAllPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `Select 
        te."wrValue" as "playerId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "playerTypeId",
        te4."wrValue" as "bowlingTypeId",
        tet."wrEventType" as "eventType",
        tbt."wrBowlingType" as "bowlingStyle",
        tpt."wrPlayerType" as "playerType",
        "wrCountry" as "country",
        "wrPlayerName" as "playerName",
        tp."wrImage" as "image",
        tp."wrIsActive" as "isActive",
        "wrIsKipper" as "isKipper",
        "wrIsLeftHandedBatting" as "isLeftHandedBatting",
        "wrIsLeftArmFielding" as "isLeftArmFielding",
        "wrBatsmanAverage"  as "batsmanAverage",
        "wrBatsmanStrikeRate"  as "batsmanStrikeRate",
        "wrBowlerAverage" as "bowlerAverage",
        "wrBowlerEconomy"  as "bowlerEconomy",
        "wrDisplayName"   as "displayName"
     from "tblPlayers" tp left join "tblEncryptedData" te on tp."wrPlayerId" = te."wrKey"
     left join "tblEncryptedData" te2 on tp."wrEventTypeId" = te2."wrKey"
     left join "tblEncryptedData" te3 on tp."wrPlayerTypeId" = te3."wrKey"
     left join "tblEncryptedData" te4 on tp."wrBowlingStyle" = te4."wrKey"
     left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
     left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      left join "tblBowlingTypes" tbt on tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
     `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertPlayerQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as (
      insert into "tblPlayers" ("wrPlayerName","wrCountry","wrImage","wrBowlingStyle","wrIsActive","wrIsKipper","wrIsLeftHandedBatting","wrIsLeftArmFielding","wrBatsmanAverage","wrBatsmanStrikeRate","wrBowlerAverage","wrBowlerEconomy","wrDisplayName" ,"wrEventTypeId","wrPlayerTypeId" ,"wrCreatedDate","wrCreatedBy")
      values($1,$2,$3,(select "wrKey" from "tblEncryptedData" where "wrValue" = $4),$5,$6,$7,$8,$9,$10,$11,$12,$13,(select "wrKey" from "tblEncryptedData" where "wrValue" = $14),(select "wrKey" from "tblEncryptedData" where "wrValue" = $15),$16,$17)
      returning *
    )

    Select 
        te."wrValue" as "playerId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "playerTypeId",
        te4."wrValue" as "bowlingTypeId",
        tet."wrEventType" as "eventType",
        tbt."wrBowlingType" as "bowlingStyle",
        tpt."wrPlayerType" as "playerType",
        "wrCountry" as "country",
        "wrPlayerName" as "playerName",
        tp."wrImage" as "image",
        tp."wrIsActive" as "isActive",
        "wrIsKipper" as "isKipper",
        "wrIsLeftHandedBatting" as "isLeftHandedBatting",
        "wrIsLeftArmFielding" as "isLeftArmFielding",
        "wrBatsmanAverage"  as "batsmanAverage",
        "wrBatsmanStrikeRate"  as "batsmanStrikeRate",
        "wrBowlerAverage" as "bowlerAverage",
        "wrBowlerEconomy"  as "bowlerEconomy",
        "wrDisplayName"   as "displayName"
     from "insert_data" tp left join "tblEncryptedData" te on tp."wrPlayerId" = te."wrKey"
     left join "tblEncryptedData" te2 on tp."wrEventTypeId" = te2."wrKey"
     left join "tblEncryptedData" te3 on tp."wrPlayerTypeId" = te3."wrKey"
     left join "tblEncryptedData" te4 on tp."wrBowlingStyle" = te4."wrKey"
     left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
     left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      left join "tblBowlingTypes" tbt on tp."wrBowlingStyle" = tbt."wrBowlingTypeId"

    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.playerName || null,
          data.country || null,
          data.image || null,
          data.bowlingTypeId || 0,
          data.isActive || false,
          data.isKipper || false,
          data.isLeftHandedBatting || false,
          data.isLeftArmFielding || false,
          data.batsmanAverage || 0,
          data.batsmanStrikeRate || 0,
          data.bowlerAverage || 0,
          data.bowlerEconomy || 0,
          data.displayName || null,
          data.eventTypeId || null,
          data.playerTypeId || null,
          new Date(),
          data.userId,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/insertPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePlayerQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblPlayers" set "wrPlayerName" = $1,"wrCountry" = $2,"wrImage" = $3,"wrBowlingStyle" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),"wrIsActive" = $5,"wrIsKipper" = $6,"wrIsLeftHandedBatting" = $7,"wrIsLeftArmFielding" = $8,"wrBatsmanAverage" = $9,"wrBatsmanStrikeRate" = $10,"wrBowlerAverage" = $11,"wrBowlerEconomy" = $12,"wrDisplayName" = $13,"wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $14),"wrPlayerTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $15),"wrModifyDate" = $16,"wrModifyBy" = $17 where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $18) `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.playerName,
          data.country,
          data.image,
          data.bowlingTypeId,
          data.isActive,
          data.isKipper,
          data.isLeftHandedBatting,
          data.isLeftArmFielding,
          data.batsmanAverage,
          data.batsmanStrikeRate,
          data.bowlerAverage,
          data.bowlerEconomy,
          data.displayName,
          data.eventTypeId,
          data.playerTypeId,
          new Date(),
          data.userId,
          data.playerId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/updatePlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePlayerStatsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      ` UPDATE "tblPlayers"
      SET "wrBatsmanAverage" = $1,
          "wrBatsmanStrikeRate" = $2,
          "wrBowlerAverage" = $3,
         "wrBowlerEconomy" = $4,
          "wrModifyDate" = $5,
          "wrModifyBy" = $6
      WHERE "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.batsmanAverage,
          data.batsmanStrikeRate,
          data.bowlerAverage,
          data.bowlerEconomy,
          new Date(),
          data.userId,
          data.playerId,
        ],
      }
    );
    // const updateQuery = `
    //   UPDATE "tblPlayers"
    //   SET "wrBatsmanAverage" = $1,
    //       "wrBatsmanStrikeRate" = $2,
    //       "wrBowlerAverage" = $3,
    //      "wrBowlerEconomy" = $4,
    //       "wrModifyDate" = $5,
    //       "wrModifyBy" = 6$
    //   WHERE "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7)
    // `;

    // const bindValues = [
    //   data.batsmanAverage,
    //   data.batsmanStrikeRate,
    //   data.bowlerAverage,
    //   data.bowlerEconomy,
    //   new Date(),
    //   data.userId,
    //   data.playerId,
    // ];

    // return await fastify.db.query(updateQuery, {
    //   type: fastify.db.QueryTypes.UPDATE,
    //   bind: bindValues,
    // });
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/updatePlayerStatsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePlayerQuery = async (playerId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblPlayers" where "wrPlayerId" in 
    (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/deletePlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayerTypeQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `select 
      "wrValue" as "playerTypeId",
      "wrPlayerType" as "playerType"
       from "tblPlayerTypes" tp left join "tblEncryptedData" te on tp."wrPlayerTypeId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getAllPlayerType",
      null
    );
    throw new Error(err.message);
  }
};

const getAllBowlingTypeQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `select 
      "wrValue" as "bowlingTypeId",
      "wrBowlingType" as "bowlingType"
       from "tblBowlingTypes" tp left join "tblEncryptedData" te on tp."wrBowlingTypeId" = te."wrKey"
       where "wrIsActive" = true`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getAllBowlingTypeQuery",
      null
    );
    throw new Error(err.message);
  }
};

const getAllTeamsByPlayerIdQuery = async (playerId, fastify, request) => {
  try {
    return await fastify.db.query(
      `select 
      "wrValue" as "teamId",
      "wrTeamName" as "teamName"
       from "tblTeamPlayers" tp left join "tblEncryptedData" te on tp."wrTeamId" = te."wrKey"
       left join "tblTeams" tt on tp."wrTeamId" = tt."wrTeamId"
       where "wrRefPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getAllTeamsByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllPlayersQuery,
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
  getAllPlayerTypeQuery,
  getAllBowlingTypeQuery,
  getAllTeamsByPlayerIdQuery,
  updatePlayerStatsQuery,
};

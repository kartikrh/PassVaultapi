const { errorLogger } = require("../utilities/logger");

const getAllPlayersQuery = async (fastify) => {
   return await fastify.db.query(
    `SELECT 
    "wrPlayerId" AS "playerId",
    tp."wrEventTypeId" AS "eventTypeId",
    tp."wrPlayerTypeId" AS "playerTypeId",
    tp."wrBowlingStyle" AS "bowlingTypeId",
    tet."wrEventType" AS "eventType",
    tbt."wrBowlingType" AS "bowlingStyle",
    tpt."wrPlayerType" AS "playerType",
    tp."wrCountry" AS "country",
    tp."wrPlayerName" AS "playerName",
    tp."wrImage" AS "image",
    tp."wrIsActive" AS "isActive",
    tp."wrIsKipper" AS "isKipper",
    tp."wrIsLeftHandedBatting" AS "isLeftHandedBatting",
    tp."wrIsLeftArmFielding" AS "isLeftArmFielding",
    tp."wrBatsmanAverage" AS "batsmanAverage",
    tp."wrBatsmanStrikeRate" AS "batsmanStrikeRate",
    tp."wrBowlerAverage" AS "bowlerAverage",
    tp."wrBowlerEconomy" AS "bowlerEconomy",
    tp."wrDisplayName" AS "displayName",
    tp."wrIsSystemPlayer" AS "isSystemPlayer"
FROM 
    "tblPlayers" tp
    LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
    LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
    WHERE tp."wrIsDeleted" = false;

     `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  // return await fastify.db.query(
  //   `Select 
  //       "wrPlayerId" as "pId",
  //       te."wrValue" as "playerId",
  //       te2."wrValue" as "eventTypeId",
  //       te3."wrValue" as "playerTypeId",
  //       te4."wrValue" as "bowlingTypeId",
  //       tet."wrEventType" as "eventType",
  //       tbt."wrBowlingType" as "bowlingStyle",
  //       tpt."wrPlayerType" as "playerType",
  //       "wrCountry" as "country",
  //       "wrPlayerName" as "playerName",
  //       tp."wrImage" as "image",
  //       tp."wrIsActive" as "isActive",
  //       "wrIsKipper" as "isKipper",
  //       "wrIsLeftHandedBatting" as "isLeftHandedBatting",
  //       "wrIsLeftArmFielding" as "isLeftArmFielding",
  //       "wrBatsmanAverage"  as "batsmanAverage",
  //       "wrBatsmanStrikeRate"  as "batsmanStrikeRate",
  //       "wrBowlerAverage" as "bowlerAverage",
  //       "wrBowlerEconomy"  as "bowlerEconomy",
  //       "wrDisplayName"   as "displayName",
  //       "wrIsSystemPlayer" as "isSystemPlayer"
  //    from "tblPlayers" tp left join "tblEncryptedData" te on tp."wrPlayerId" = te."wrKey"
  //    left join "tblEncryptedData" te2 on tp."wrEventTypeId" = te2."wrKey"
  //    left join "tblEncryptedData" te3 on tp."wrPlayerTypeId" = te3."wrKey"
  //    left join "tblEncryptedData" te4 on tp."wrBowlingStyle" = te4."wrKey"
  //    left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
  //    left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
  //     left join "tblBowlingTypes" tbt on tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
  //    `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const insertPlayerQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as (
      insert into "tblPlayers" ("wrPlayerName","wrCountry","wrImage","wrBowlingStyle","wrIsActive","wrIsKipper","wrIsLeftHandedBatting","wrIsLeftArmFielding","wrBatsmanAverage","wrBatsmanStrikeRate","wrBowlerAverage","wrBowlerEconomy","wrDisplayName" ,"wrEventTypeId","wrPlayerTypeId" ,"wrCreatedDate","wrCreatedBy","wrIsSystemPlayer")
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, $18)
      returning *
    )

    Select 
        "wrPlayerId" as "playerId",
        tp."wrEventTypeId" as "eventTypeId",
        tp."wrPlayerTypeId" as "playerTypeId",
        tp."wrBowlingStyle" as "bowlingTypeId",
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
        "wrDisplayName"   as "displayName",
        "wrIsSystemPlayer" as "isSystemPlayer"	
     from "insert_data" tp 
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
          data.isSystemPlayer || false,
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
      `update "tblPlayers" set "wrPlayerName" = $1,"wrCountry" = $2,"wrImage" = $3,"wrBowlingStyle" = 
      $4,"wrIsActive" = $5,"wrIsKipper" = $6,"wrIsLeftHandedBatting" = $7,"wrIsLeftArmFielding" = $8,"wrBatsmanAverage" = $9,"wrBatsmanStrikeRate" = $10,"wrBowlerAverage" = $11,"wrBowlerEconomy" = $12,"wrDisplayName" = $13,"wrEventTypeId" = $14,"wrPlayerTypeId" =$15,"wrModifyDate" = $16,"wrModifyBy" = $17,"wrIsSystemPlayer" = $18 where "wrPlayerId" = $19 `,
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
          data.isSystemPlayer,
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
      WHERE "wrPlayerId" = $7 AND "wrIsDeleted" = false`,
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
      `UPDATE "tblPlayers" SET
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
      WHERE "wrPlayerId" =  ANY($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, playerId],
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
      "wrPlayerTypeId" as "playerTypeId",
      "wrPlayerType" as "playerType"
       from "tblPlayerTypes"`,
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
      "wrBowlingTypeId" as "bowlingTypeId",
      "wrBowlingType" as "bowlingType"
       from "tblBowlingTypes"
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
      tp."wrTeamId" as "teamId",
      "wrTeamName" as "teamName"
       from "tblTeamPlayers" tp
       left join "tblTeams" tt on tp."wrTeamId" = tt."wrTeamId"
       where "wrRefPlayerId" = $1`,
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
const updateIsSystemPlayerQuery = async (data, fastify, request) => {
  try {
    
    const query = `update "tblPlayers" set "wrIsSystemPlayer" = $1 where "wrPlayerId" = $2`;
    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [data.isSystemPlayer, data.playerId],
    });

  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/updateIsSystemPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
}
module.exports = {
  getAllPlayersQuery,
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
  getAllPlayerTypeQuery,
  getAllBowlingTypeQuery,
  getAllTeamsByPlayerIdQuery,
  updatePlayerStatsQuery,
  updateIsSystemPlayerQuery
};

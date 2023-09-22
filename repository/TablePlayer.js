const { errorLogger } = require("../utilities/logger");

const getAllPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `Select 
        te."wrValue" as "playerId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "teamId",
        "wrCountry" as "country",
        "wrPlayerName" as "playerName",
        "wrImage" as "image",
        "wrBowlingStyle" as "bowlingStyle",
        "wrIsActive" as "isActive",
        "wrIsKipper" as "isKipper",
        "wrIsLeftHandedBatting" as "isLeftHandedBatting",
        "wrIsLeftArmFielding" as "isLeftArmFielding",
        "wrPlayerType" as "playerType",
        "wrImageUrl" as "imageUrl",
        "wrBatsmanAverage"  as "batsmanAverage",
        "wrBatsmanStrikeRate"  as "batsmanStrikeRate",
        "wrBowlerAverage" as "bowlerAverage",
        "wrBowlerEconomy"  as "bowlerEconomy",
        "wrDisplayName"   as "displayName"
     from "tblPlayers" tp left join "tblEncryptedData" te on tp."wrPlayerId" = te."wrKey"
     left join "tblEncryptedData" te2 on tp."wrEventTypeId" = te2."wrKey"
     left join "tblEncryptedData" te3 on tp."wrTeamId" = te3."wrKey"
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
      insert into "tblPlayers" ("wrPlayerName","wrCountry","wrImage","wrBowlingStyle","wrIsActive","wrIsKipper","wrIsLeftHandedBatting","wrIsLeftArmFielding","wrPlayerType","wrImageUrl","wrBatsmanAverage","wrBatsmanStrikeRate","wrBowlerAverage","wrBowlerEconomy","wrDisplayName" ,"wrEventTypeId","wrTeamId" ,"wrCreatedDate","wrCreatedBy")
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,(select "wrKey" from "tblEncryptedData" where "wrValue" = $16),(select "wrKey" from "tblEncryptedData" where "wrValue" = $17),$18,$19)
      returning *
    )

    Select 
        te."wrValue" as "playerId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "teamId",
        "wrCountry" as "country",
        "wrPlayerName" as "playerName",
        "wrImage" as "image",
        "wrBowlingStyle" as "bowlingStyle",
        "wrIsActive" as "isActive",
        "wrIsKipper" as "isKipper",
        "wrIsLeftHandedBatting" as "isLeftHandedBatting",
        "wrIsLeftArmFielding" as "isLeftArmFielding",
        "wrPlayerType" as "playerType",
        "wrImageUrl" as "imageUrl",
        "wrBatsmanAverage"  as "batsmanAverage",
        "wrBatsmanStrikeRate"  as "batsmanStrikeRate",
        "wrBowlerAverage" as "bowlerAverage",
        "wrBowlerEconomy"  as "bowlerEconomy",
        "wrDisplayName"   as "displayName"
     from "insert_data" tp left join "tblEncryptedData" te on tp."wrPlayerId" = te."wrKey"
     left join "tblEncryptedData" te2 on tp."wrEventTypeId" = te2."wrKey"
     left join "tblEncryptedData" te3 on tp."wrTeamId" = te3."wrKey"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.playerName || null,
          data.country || null,
          data.image || null,
          data.bowlingStyle || null,
          data.isActive || false,
          data.isKipper || false,
          data.isLeftHandedBatting || false,
          data.isLeftArmFielding || false,
          data.playerType || null,
          data.imageUrl || null,
          data.batsmanAverage || null,
          data.batsmanStrikeRate || null,
          data.bowlerAverage || null,
          data.bowlerEconomy || null,
          data.displayName || null,
          data.eventTypeId || null,
          data.teamId || null,
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
      `update "tblPlayers" set "wrPlayerName" = $1,"wrCountry" = $2,"wrImage" = $3,"wrBowlingStyle" = $4,"wrIsActive" = $5,"wrIsKipper" = $6,"wrIsLeftHandedBatting" = $7,"wrIsLeftArmFielding" = $8,"wrPlayerType" = $9,"wrImageUrl" = $10,"wrBatsmanAverage" = $11,"wrBatsmanStrikeRate" = $12,"wrBowlerAverage" = $13,"wrBowlerEconomy" = $14,"wrDisplayName" = $15,"wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $16),"wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $17),"wrModifyDate" = $18,"wrModifyBy" = $19 where "wrPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $20) `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.playerName,
          data.country,
          data.image,
          data.bowlingStyle,
          data.isActive,
          data.isKipper,
          data.isLeftHandedBatting,
          data.isLeftArmFielding,
          data.playerType,
          data.imageUrl,
          data.batsmanAverage,
          data.batsmanStrikeRate,
          data.bowlerAverage,
          data.bowlerEconomy,
          data.displayName,
          data.eventTypeId,
          data.teamId,
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

module.exports = {
  getAllPlayersQuery,
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
};

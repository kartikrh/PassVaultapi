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
    tp."wrIsSystemPlayer" AS "isSystemPlayer",
    tp."wrImagePath" AS "imagePath",
    tp."wrTpId" AS "tpId",
    tp."wrCountryId" AS "countryId"
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
const getPlyByIdQuery = async (data ,request ,fastify) => {
  try {
    return await fastify.db.query(
        `SELECT 
        "wrPlayerId" AS "playerId",
        tp."wrEventTypeId" AS "eventTypeId",
        tp."wrPlayerTypeId" AS "playerTypeId",
        tp."wrBowlingStyle" AS "bowlingTypeId",
        tet."wrEventType" AS "eventType",
        tbt."wrBowlingType" AS "bowlingStyle",
        tpt."wrPlayerType" AS "playerType",
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
        tp."wrIsSystemPlayer" AS "isSystemPlayer",
        tp."wrImagePath" AS "imagePath",
        tp."wrTpId" AS "tpId",
        tp."wrCountryId" AS "countryId"
    FROM 
        "tblPlayers" tp
        LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
        LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
        LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
        WHERE tp."wrIsDeleted" = false
        AND tp."wrPlayerId" = ANY($1)

     `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind : [
        data.playerIds
      ]
    }
  );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getPlyByIdQuery",
      request
    );
    return true;
    // throw new Error(err.message);
  }
  
};

const insertPlayerQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as (
      insert into "tblPlayers" ("wrPlayerName","wrImage","wrBowlingStyle","wrIsActive","wrIsKipper","wrIsLeftHandedBatting","wrIsLeftArmFielding","wrBatsmanAverage","wrBatsmanStrikeRate","wrBowlerAverage","wrBowlerEconomy","wrDisplayName" ,"wrEventTypeId","wrPlayerTypeId" ,"wrCreatedDate","wrCreatedBy","wrIsSystemPlayer", "wrImagePath", "wrTpId", "wrCountryId")
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, $18, $19, $20)
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
        "wrIsSystemPlayer" as "isSystemPlayer",
        tp."wrImagePath" AS "imagePath",
        tp."wrTpId" AS "tpId",
        tp."wrCountryId" AS "countryId"
     from "insert_data" tp 
     left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
     left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      left join "tblBowlingTypes" tbt on tp."wrBowlingStyle" = tbt."wrBowlingTypeId"

    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.playerName || null,
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
          data.imagePath || null,
          data.tpId || null,
          data.countryId || null,
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
      `update "tblPlayers" set "wrPlayerName" = $1,"wrImage" = $2,"wrBowlingStyle" = 
      $3,"wrIsActive" = $4,"wrIsKipper" = $5,"wrIsLeftHandedBatting" = $6,"wrIsLeftArmFielding" = $7,"wrBatsmanAverage" = $8,"wrBatsmanStrikeRate" = $9,"wrBowlerAverage" = $10,"wrBowlerEconomy" = $11,"wrDisplayName" = $12,"wrEventTypeId" = $13,"wrPlayerTypeId" =$14,"wrModifyDate" = $15,"wrModifyBy" = $16,"wrIsSystemPlayer" = $17, "wrImagePath" = $19, "wrTpId" = $20, "wrCountryId" = $21
      where "wrPlayerId" = $18`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.playerName,
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
          data.imagePath,
          data.tpId,
          data.countryId,
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
       where "wrRefPlayerId" = $1 and tp."wrIsDeleted" = false and tt."wrIsDeleted" = false`,
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
const getTeamPlayerQuery = async (data, fastify, request) => {
  try {
    const query = `    
      SELECT 
        ttm."wrTeamId" as "teamId",
        ttm."wrRefPlayerId" as "playerId",
        ttm."wrTeamPlayerId" as "teamPlayerId",
                tt."WrTeamJersey" as "teamJersey",
        tp."wrImage" as "playerImage",
        tt."wrTeamName" as "teamName",
        tp."wrPlayerName" as "playerName",
        ttm."wrTpId" as "tpId"
      FROM
        "tblTeamPlayers" ttm
      LEFT JOIN
        "tblPlayers" tp ON tp."wrPlayerId" = ttm."wrRefPlayerId"
      LEFT JOIN
        "tblTeams" tt ON tt."wrTeamId" = ttm."wrTeamId"
      WHERE
        ttm."wrJerseyPlayerImage" is null
        AND ttm."wrIsDeleted" = false
      ORDER BY ttm."wrTeamPlayerId" DESC 
    `;

    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [],
    });

  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getTeamPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
}
const getAllPlayersByIdsQuery = async (whereCondition = undefined, fastify) => {
   try {
    const result = await fastify.db.query(
      `SELECT 
          tp."wrPlayerId" AS "playerId",
          tp."wrEventTypeId" AS "eventTypeId",
          tp."wrPlayerTypeId" AS "playerTypeId",
          tp."wrBowlingStyle" AS "bowlingTypeId",
          tet."wrEventType" AS "eventType",
          tbt."wrBowlingType" AS "bowlingStyle",
          tpt."wrPlayerType" AS "playerType",
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
          tp."wrIsSystemPlayer" AS "isSystemPlayer",
          tp."wrImagePath" AS "imagePath",
          tp."wrTpId" AS "tpId",
          tp."wrCountryId" AS "countryId"
      FROM "tblPlayers" tp
      LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
      LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
      ${whereCondition ? `WHERE ${whereCondition}` : 'WHERE tp."wrIsDeleted" = false'};`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
   } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getAllPlayersByIdsQuery",
      null
    );
    throw new Error(err.message);
   }
}
const activeInactivePlayerQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `UPDATE "tblPlayers" SET
            "wrIsActive" = $1
          WHERE "wrPlayerId" = $2`,
        {
          bind: [data.isActive, data.playerId],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TablePlayer.js/activeInactivePlayerQuery",
        request
      );
      throw new Error(err.message);
    }
};
const getPlayerByIdQuery = async (whereCondition = undefined, request, fastify) => {
  try {
    const result = await fastify.db.query(
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
    tp."wrIsSystemPlayer" AS "isSystemPlayer",
    tp."wrImagePath" AS "imagePath",
    tp."wrTpId" AS "tpId"
  FROM 
    "tblPlayers" tp
    LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
    LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
    WHERE tp."wrIsDeleted" = false
   ${whereCondition ? `AND ${whereCondition}` : ""}`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    ); return result[0]
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getPlayerByIdQuery",
      request
    );
    throw new Error(err.message);
  }
}
const updateExchangePlayerQuery = async (data, fastify, request) => {
  try {
  const result = await fastify.db.query(
  `
  WITH update_data AS (
    UPDATE "tblPlayers" 
    SET 
      "wrTpId" = $1,
      "wrModifyDate" = $3,
      "wrModifyBy" = $4
    WHERE "wrPlayerId" = $2
    AND "wrIsDeleted" = false
    RETURNING *
  )
  SELECT 
    tp."wrPlayerId" AS "playerId",
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
    tp."wrIsSystemPlayer" AS "isSystemPlayer",
    tp."wrImagePath" AS "imagePath",
    tp."wrTpId" AS "tpId"
  FROM update_data tp
  LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
  LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
  LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
  `,
  {
    type: fastify.db.QueryTypes.SELECT, // SELECT is correct here, since you're fetching updated + joined data
    bind: [
      data.tpId,
      data.playerId,
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
      "DB ERROR --> repository/TablePlayer/updatePlayerQuery",
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
  updateIsSystemPlayerQuery,
  getTeamPlayerQuery,
  getAllPlayersByIdsQuery,
  getPlyByIdQuery,
  activeInactivePlayerQuery,
  getPlayerByIdQuery,
  updateExchangePlayerQuery
};

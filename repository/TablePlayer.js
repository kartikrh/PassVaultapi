const { errorLogger } = require("../utilities/logger");

const getAllPlayersQuery = async (fastify) => {
   return await fastify.db.query(
    `SELECT 
    "wrPlayerId" AS "playerId",
    tp."wrEventTypeId" AS "eventTypeId",
    tp."wrPlayerTypeId" AS "playerTypeId",
    tp."wrBowlingStyle" AS "bowlingStyleId",
    tet."wrEventType" AS "eventType",
    tp."wrBowlingType" AS "bowlingTypeId",
    tbt."wrBowlingType" AS "bowlingType",
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
    tp."wrCountryId" AS "countryId",
    tp."wrIsMen" AS "isMen",
    tp."wrBirthDate" AS "birthDate",
    tcc."wrCountryName" AS "countryName",
    tp."wrBirthPlace" AS "birthPlace"
FROM 
    "tblPlayers" tp
    LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
    LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingType" = tbt."wrBowlingTypeId"
    LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
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
        tp."wrBowlingStyle" AS "bowlingStyleId",
        tet."wrEventType" AS "eventType",
        tp."wrBowlingType" AS "bowlingTypeId",
        tbt."wrBowlingType" AS "bowlingType",
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
        tp."wrCountryId" AS "countryId",
        tp."wrIsMen" AS "isMen",
        tp."wrBirthDate" AS "birthDate",
        tcc."wrCountryName" AS "countryName",
        tp."wrBirthPlace" AS "birthPlace"
    FROM 
        "tblPlayers" tp
        LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
        LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
        LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingType" = tbt."wrBowlingTypeId"
        LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
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
      insert into "tblPlayers" ("wrPlayerName","wrImage","wrBowlingStyle","wrIsActive","wrIsKipper","wrIsLeftHandedBatting","wrIsLeftArmFielding","wrBatsmanAverage","wrBatsmanStrikeRate","wrBowlerAverage","wrBowlerEconomy","wrDisplayName" ,"wrEventTypeId","wrPlayerTypeId" ,"wrCreatedDate","wrCreatedBy","wrIsSystemPlayer", "wrImagePath", "wrTpId", "wrCountryId", "wrBowlingType", "wrIsMen", "wrBirthDate", "wrBirthPlace")
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, $18, $19, $20, $21, $22, $23, $24)
      returning *
    )

    Select 
        "wrPlayerId" as "playerId",
        tp."wrEventTypeId" as "eventTypeId",
        tp."wrPlayerTypeId" as "playerTypeId",
        tp."wrBowlingStyle" as "bowlingStyleId",
        tet."wrEventType" as "eventType",
        tp."wrBowlingType" as "bowlingTypeId",
        tbt."wrBowlingType" AS "bowlingType",
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
        tp."wrCountryId" AS "countryId",
        tp."wrIsMen" AS "isMen",
        tp."wrBirthDate" AS "birthDate",
        tcc."wrCountryName" AS "countryName",
        tp."wrBirthPlace" AS "birthPlace"
     from "insert_data" tp 
     left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
     left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      left join "tblBowlingTypes" tbt on tp."wrBowlingType" = tbt."wrBowlingTypeId"
      LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"

    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.playerName || null,
          data.image || null,
          data.bowlingStyleId || 0,
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
          data.bowlingTypeId || null,
          data?.isMen ?? false,
          data?.birthDate || null,
          data?.birthPlace ?? null
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
      `WITH update_data AS (
        update "tblPlayers" set "wrPlayerName" = $1,"wrImage" = $2,"wrBowlingStyle" = 
          $3,"wrIsActive" = $4,"wrIsKipper" = $5,"wrIsLeftHandedBatting" = $6,"wrIsLeftArmFielding" = $7,"wrBatsmanAverage" = $8,"wrBatsmanStrikeRate" = $9,"wrBowlerAverage" = $10,"wrBowlerEconomy" = $11,"wrDisplayName" = $12,"wrEventTypeId" = $13,"wrPlayerTypeId" =$14,"wrModifyDate" = $15,"wrModifyBy" = $16,"wrIsSystemPlayer" = $17, "wrImagePath" = $19, "wrTpId" = $20, "wrCountryId" = $21, "wrBowlingType" = $22, "wrIsMen" = $23, "wrBirthDate" = $24, "wrBirthPlace" = $25
        where "wrPlayerId" = $18
        returning *
      )
      Select 
        "wrPlayerId" as "playerId",
        tp."wrEventTypeId" as "eventTypeId",
        tp."wrPlayerTypeId" as "playerTypeId",
        tp."wrBowlingStyle" as "bowlingStyleId",
        tet."wrEventType" as "eventType",
        tp."wrBowlingType" as "bowlingTypeId",
        tbt."wrBowlingType" AS "bowlingType",
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
        tp."wrCountryId" AS "countryId",
        tp."wrIsMen" AS "isMen",
        tp."wrBirthDate" AS "birthDate",
        tcc."wrCountryName" AS "countryName",
        tp."wrBirthPlace" AS "birthPlace"
      from "update_data" tp 
      left join "tblEventTypes" tet on tp."wrEventTypeId" = tet."wrEventTypeId"
      left join "tblPlayerTypes" tpt on tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      left join "tblBowlingTypes" tbt on tp."wrBowlingType" = tbt."wrBowlingTypeId"
      LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.playerName,
          data.image,
          data.bowlingStyleId,
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
          data.bowlingTypeId,
          data?.isMen ?? false,
          data?.birthDate || null,
          data?.birthPlace ?? null
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
      "wrTeamName" as "teamName",
      tt."wrImage" as "teamLogo",
      tp."wrHomeTeam" as "homeTeam",
      tp."wrJerseyPlayerImage" as "jerseyPlayerImage"
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

const getPlayerCreatedDetailsQuery = async (playerId, fastify, request) => {
  try {
    const query = `
      SELECT
        tp."wrPlayerId" AS "playerId",
        tp."wrPlayerName" AS "playerName",
        tp."wrCreatedDate" AS "createdDate",
        CASE
          WHEN tp."wrCreatedBy" = -2 THEN 'Entity'
          ELSE u."WrName"
        END                    AS "createdBy",
        tp."wrCreatedBy" AS "createdById"
      FROM "tblPlayers" tp
      LEFT JOIN "tblUsers" u
        ON tp."wrCreatedBy" = u."WrUserId"
      WHERE tp."wrPlayerId" = $1
        AND tp."wrIsDeleted" = false
    `;

    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [playerId],
    });

    return result[0] || null;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getPlayerCreatedDetailsQuery",
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
        ttm."wrHomeTeam" as "homeTeam",
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
          tp."wrBowlingStyle" AS "bowlingStyleId",
          tet."wrEventType" AS "eventType",
          tp."wrBowlingType" AS "bowlingTypeId",
          tbt."wrBowlingType" AS "bowlingType",
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
          tp."wrCountryId" AS "countryId",
          tp."wrIsMen" AS "isMen",
          tp."wrBirthDate" AS "birthDate",
          tcc."wrCountryName" AS "countryName",
          tp."wrBirthPlace" AS "birthPlace"
      FROM "tblPlayers" tp
      LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
      LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
      LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
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
    tp."wrBowlingStyle" AS "bowlingStyleId",
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
    tp."wrTpId" AS "tpId",
    tp."wrIsMen" AS "isMen",
    tp."wrBirthDate" AS "birthDate",
    tcc."wrCountryName" AS "countryName",
    tp."wrBirthPlace" AS "birthPlace"
  FROM 
    "tblPlayers" tp
    LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
    LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
    LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingType" = tbt."wrBowlingTypeId"
    LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
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
    tp."wrBowlingStyle" AS "bowlingStyleId",
    tet."wrEventType" AS "eventType",
    tp."wrBowlingType" AS "bowlingTypeId",
    tbt."wrBowlingType" AS "bowlingType",
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
    tp."wrTpId" AS "tpId",
    tp."wrIsMen" AS "isMen",
    tp."wrBirthDate" AS "birthDate",
    tcc."wrCountryName" AS "countryName",
    tp."wrBirthPlace" AS "birthPlace"
  FROM update_data tp
  LEFT JOIN "tblEventTypes" tet ON tp."wrEventTypeId" = tet."wrEventTypeId"
  LEFT JOIN "tblPlayerTypes" tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
  LEFT JOIN "tblBowlingTypes" tbt ON tp."wrBowlingStyle" = tbt."wrBowlingTypeId"
  LEFT JOIN "tblCountryCodes" tcc ON tp."wrCountryId" = tcc."wrId"
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
}
const getAllDuplicatePlayersQuery = async (request, fastify) => {
    try {
      // return await fastify.db.query(
      //   `SELECT 
      //       TRIM(LOWER("wrPlayerName")) AS "playerName", 
      //       MIN("wrDisplayName") AS "displayName",
			//       COUNT(*) AS total,
      //  		  MIN("wrPlayerId") AS "Min",
      //  		  MAX("wrPlayerId") AS "Max",
      //  		  MAX("wrCreatedDate") AS "Date"
      //   FROM "tblPlayers"
		  //   WHERE "wrIsDeleted" = false
		  //   GROUP BY TRIM(LOWER("wrPlayerName"))
		  //   HAVING COUNT(*) > 1
      //   ORDER BY "Date" DESC`,
      //   {
      //     type: fastify.db.QueryTypes.SELECT,
      //   }
      // );

      let res = await fastify.db.query(
        `
            CALL proc_get_duplicate_data($1)
        `,
        
        {
            type : fastify.db.QueryTypes.SELECT,
            bind : [null]
        }    
    )
    return res[0].result;
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TablePlayer.js/getAllDuplicatePlayersQuery",
        request
      );
      throw new Error(err.message);
    }
};

const getPlayersWithoutTeamQuery = async (request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      SELECT 
          tp."wrPlayerId" AS "playerId",
          tp."wrPlayerName" AS "playerName",
          tp."wrDisplayName" AS "displayName",
          tp."wrImage" AS "image",
          tp."wrIsActive" AS "isActive"
      FROM "tblPlayers" tp
      WHERE tp."wrIsDeleted" = false
      AND NOT EXISTS (
          SELECT 1 
          FROM "tblTeamPlayers" ttp
          WHERE ttp."wrRefPlayerId" = tp."wrPlayerId"
          AND ttp."wrIsDeleted" = false
      );
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer.js/getPlayersWithoutTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getPlayersWithoutHomeTeamQuery = async (request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      SELECT 
          tp."wrPlayerId" AS "playerId",
          tp."wrPlayerName" AS "playerName",
          tp."wrDisplayName" AS "displayName",
          tp."wrImage" AS "image",
          tp."wrIsActive" AS "isActive"
      FROM "tblPlayers" tp
      WHERE tp."wrIsDeleted" = false
      AND EXISTS (
          -- Player has at least one team entry
          SELECT 1
          FROM "tblTeamPlayers" ttp
          WHERE ttp."wrRefPlayerId" = tp."wrPlayerId"
            AND ttp."wrIsDeleted" = false
      )
      AND NOT EXISTS (
          -- Player should NOT have any homeTeam = true entry
          SELECT 1
          FROM "tblTeamPlayers" ttp2
          WHERE ttp2."wrRefPlayerId" = tp."wrPlayerId"
            AND ttp2."wrIsDeleted" = false
            AND ttp2."wrHomeTeam" = true
      );
      `,
      {
        type: fastify.db.QueryTypes.SELECT
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer.js/getPlayersWithoutHomeTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTeamPlayerJerseyByPlayerIdQuery = async (playerId, fastify, request) => {
  try {
    const sql = `
      SELECT 
        ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
        ttp."wrJerseyPlayerImagePath" AS "jerseyPlayerImagePath"
      FROM "tblTeamPlayers" ttp
      WHERE ttp."wrRefPlayerId" = $1
        AND ttp."wrHomeTeam" = true
        AND ttp."wrIsDeleted" = false
      LIMIT 1;
    `;

    const result = await fastify.db.query(sql, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [playerId],
    });

    return result[0] || null;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer/getTeamPlayerJerseyByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getPlayerCompetitionListByPlayerIdQuery = async (request, fastify) => {
  try {
    const playerId = request.body.playerId;

    const returnColumn = `
      COALESCE(json_agg(
        json_build_object(
          'refID', c."wrRefID",
          'competitionId', c."wrCompetitionId",
          'competition', c."wrCompetition",
          'tpId', c."wrTpId",
          'startDate', c."wrStartDate",
          'endDate', c."wrEndDate",
          'matchTypeId', c."wrMatchTypeId",
          'matchType', mt."wrMatchType",
          'eventTypeId', c."wrEventTypeId",
          'eventType', et."wrEventType"
        )
      )`;

    const result = await fastify.db.query(
      `
      SELECT json_build_object(
        'ended', ${returnColumn} FILTER (WHERE c."wrStatus" IN (3,4)), '[]'::json),
        'notEnded', ${returnColumn} FILTER (WHERE c."wrStatus" IN (1,2)), '[]'::json)
      ) AS competitions_json
      FROM "tblCompetitions" c
      LEFT JOIN "tblMatchTypes" mt ON c."wrMatchTypeId" = mt."wrMatchTypeId"
      LEFT JOIN "tblEventTypes" et ON c."wrEventTypeId" = et."wrEventTypeId"
      WHERE c."wrStatus" IN (1,2,3,4)
        AND EXISTS (
          SELECT 1
          FROM "tblTournamentTeamPlayers" ttp
          JOIN "tblCommentaryPlayers" cp
            ON ttp."wrPlayerId" = cp."wrPlayerId"
          WHERE ttp."wrCompetitionId" = c."wrCompetitionId"
            AND ttp."wrPlayerId" = $1
            AND cp."wrIsInPlayingEleven" = true
        );
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );

    return result[0].competitions_json;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayer.js/getPlayerCompetitionListByPlayerIdQuery",
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
  updateExchangePlayerQuery,
  getAllDuplicatePlayersQuery,
  getPlayerCompetitionListByPlayerIdQuery,
  getPlayersWithoutTeamQuery,
  getPlayersWithoutHomeTeamQuery,
  getTeamPlayerJerseyByPlayerIdQuery,
  getPlayerCreatedDetailsQuery,
};

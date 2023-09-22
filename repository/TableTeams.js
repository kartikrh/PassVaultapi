const { errorLogger } = require("../utilities/logger");

const allTeamQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
    te."wrValue" as "teamId",
    te2."wrValue" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "wrImageUrl" as "imageUrl",
    "wrImage" as "image",
    "wrCountry" as "country"
     FROM "tblTeams" tt left join "tblEncryptedData" te on tt."wrTeamId" = te."wrKey"
      left join "tblEncryptedData" te2 on tt."wrEventTypeId" = te2."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertTeamQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
      INSERT INTO "tblTeams" ("wrTeamName","wrTeamShortName", "wrImageUrl", "wrImage", "wrCountry", "wrEventTypeId", "wrCreatedBy", "wrCreatedDate")
      VALUES ($1,$2,$3,$4,$5,(select "wrKey" from "tblEncryptedData" where "wrValue" = $6),$7,$8)
      RETURNING *    
    )
    SELECT 
    te."wrValue" as "teamId",
    te2."wrValue" as "eventTypeId",
    "wrTeamName" as "teamName",
    "wrTeamShortName" as "teamShortName",
    "wrImageUrl" as "imageUrl",
    "wrImage" as "image",
    "wrCountry" as "country"
     FROM "insert_data" tt left join "tblEncryptedData" te on tt."wrTeamId" = te."wrKey"
      left join "tblEncryptedData" te2 on tt."wrEventTypeId" = te2."wrKey"    
    `,
      {
        bind: [
          data.teamName || null,
          data.teamShortName || null,
          data.imageUrl || null,
          data.image || null,
          data.country || null,
          data.eventTypeId || null,
          data.userId,
          new Date(),
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
      `UPDATE "tblTeams" SET "wrTeamName" = $1, "wrTeamShortName" = $2, "wrImageUrl" = $3, "wrImage" = $4, "wrCountry" = $5, "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $6), "wrModifyBy" = $7, "wrModifyDate" = $8 WHERE "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $9)`,
      {
        bind: [
          data.teamName,
          data.teamShortName,
          data.imageUrl,
          data.image,
          data.country,
          data.eventTypeId,
          data.userId,
          new Date(),
          data.teamId,
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
      `DELETE FROM "tblTeams" WHERE "wrTeamId" in  (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.DELETE,
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

module.exports = {
  allTeamQuery,
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
};

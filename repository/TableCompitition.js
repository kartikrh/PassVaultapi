const { errorLogger } = require("../utilities/logger");

const getAllCompititionQuery = async (fastify) => {
  return await fastify.db.query(
    `
    select 
    "wrCompetitionId" as "competitionId",
    "wrCompetition" as "competition",
    tc."wrEventTypeId" as "eventTypeId",
    "wrEventType" as "eventType",
    tc."wrRefID" as "refId",
    tc."wrImage" as "image",
    tc."wrIsActive" as "isActive",
    tc."wrDisplayOrder" as "displayOrder",
    tc."wrIsTrending" as "isTrending"
    from "tblCompetitions" tc 
    inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  // return await fastify.db.query(
  //   `
  //   select 
  //   "wrCompetitionId" as "pId",
  //   te."wrValue" as "competitionId",
  //   "wrCompetition" as "competition",
  //   te1."wrValue" as "eventTypeId",
  //   "wrEventType" as "eventType",
  //   tc."wrRefID" as "refId",
  //   tc."wrImage" as "image",
  //   tc."wrIsActive" as "isActive",
  //   tc."wrDisplayOrder" as "displayOrder"
  //   from "tblCompetitions" tc 
  //   inner join "tblEncryptedData" te on tc."wrCompetitionId" = te."wrKey"
  //   inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
  //   inner join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey" 
  //   `,
  //   {
  //     type: fastify.db.QueryTypes.SELECT,
  //   }
  // );
};

const insertCompetitionQuery = async (request, fastify) => {
  try {
    const data = request.body;

    const result = await fastify.db.query(
      `
        with display as (
            select max("wrDisplayOrder") as "display_order" from "tblCompetitions" where "wrEventTypeId" =  (
               $2
            )
        ),
        inser_data as (
            
            insert into "tblCompetitions" ("wrCompetition" , "wrEventTypeId" , "wrRefID" , "wrImage" ,"wrIsActive" , "wrCreatedBy" , "wrCreatedDate","wrDisplayOrder", "wrIsTrending" ) values ($1 ,
                 $2,
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1, $7
                 ) returning *
        )

        select 
        "wrCompetitionId" as "competitionId",
        "wrCompetition" as "competition",
        tc."wrEventTypeId" as "eventTypeId",
        "wrEventType" as "eventType",
        tc."wrRefID" as "refId",
        tc."wrImage" as "image",
        tc."wrIsActive" as "isActive",
        tc."wrDisplayOrder" as "displayOrder",
        tc."wrIsTrending" as "isTrending"
        from "inser_data" tc
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
    `,
      {
        bind: [
          data.competition,
          data.eventTypeId,
          data.refId,
          data.image || null,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.isTrending || false,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition/insertCompetitionQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCompetitionQuery = async (request, fastify) => {
  try {
    return await fastify.db.query(
      `delete from "tblCompetitions" where "wrCompetitionId" = ANY ($1)`,
      {
        bind: [request.body.competitionId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition/deleteCompetitionQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCompititionQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblCompetitions" set
        "wrCompetition" = $1,
        "wrEventTypeId" = $2,
        "wrRefID" = $3,
        "wrImage" = $4,
        "wrIsActive" = $5,
        "wrModifyBy" = $6,
        "wrModifyDate" = now(),
        "wrIsTrending" = $7
        where "wrCompetitionId" = $8
        `,
      {
        bind: [
          data.competition,
          data.eventTypeId,
          data.refId,
          data.image || null,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.isTrending || false,
          data.competitionId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition/updateCompititionQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateDisplayOrderQuery = async (data, fastify, request) => {
  try {
    const updateDisplayOrder = await fastify.db.query(
      `
      WITH updated AS (
        UPDATE "tblCompetitions"
        SET "wrDisplayOrder" = $2
        WHERE "wrCompetitionId" = $1
        RETURNING *
      )
      SELECT 
        u."wrCompetitionId" AS "competitionId",
        u."wrCompetition" AS "competition",
        u."wrEventTypeId" AS "eventTypeId",
        et."wrEventType" AS "eventType",
        u."wrRefID" AS "refId",
        u."wrImage" AS "image",
        u."wrIsActive" AS "isActive",
        u."wrDisplayOrder" AS "displayOrder",
        u."wrIsTrending" AS "isTrending"
      FROM updated u
      INNER JOIN "tblEventTypes" et ON u."wrEventTypeId" = et."wrEventTypeId"
      `,
      {
        bind: [data.competitionId, data.displayOrder],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    
    return updateDisplayOrder[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition/updateDisplayOrderQuery",
      request
    );
    throw new Error(err.message);
  }
};

const isTrendingChangeStatusQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrIsTrending" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.isTrending, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/isTrendingChangeStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllCompititionQuery,
  insertCompetitionQuery,
  deleteCompetitionQuery,
  updateCompititionQuery,
  updateDisplayOrderQuery,
  isTrendingChangeStatusQuery
};

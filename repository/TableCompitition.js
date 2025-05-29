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
    tc."wrIsTrending" as "isTrending",
    tc."wrIsEventSnap" as "isEventSnap",
    tc."wrIsPointTable" as "isPointTable",
    tc."wrMatchTypeId" as "matchTypeId",
    tc."wrWinPoint" as "winPoint",
    tc."wrTiePoint" as "tiePoint",
    tc."wrCancelPoint" as "cancelPoint",
    tc."wrLossPoint" as "lossPoint",
    tc."wrDrsCount" as "drsCount",
    tc."wrImagePath" as "imagePath",
    tc."wrIsMen" as "isMen",
    tc."wrType" as "type",
    tc."wrIsVirtual" as "isVirtual",
    tc."wrStatus" as "status",
    tc."wrStartDate" as "startDate",
    tc."wrEndDate" as "endDate"
    from "tblCompetitions" tc 
    inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
    where tc."wrIsDeleted" = false and tev."wrIsDeleted" = false
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
            
            insert into "tblCompetitions" (
            "wrCompetition" , "wrEventTypeId" , "wrRefID" , "wrImage" ,"wrIsActive" ,
             "wrCreatedBy" , "wrCreatedDate","wrDisplayOrder", "wrIsTrending", "wrIsEventSnap", "wrIsPointTable", "wrMatchTypeId",
             "wrWinPoint", "wrTiePoint", "wrCancelPoint", "wrLossPoint","wrDrsCount", "wrImagePath", "wrIsMen", "wrType", "wrIsVirtual", "wrStatus", "wrStartDate", "wrEndDate")
            values ($1 ,
                 $2,
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1, $7, $8, $9, $10,
                 $11, $12, $13, $14,$15, $16, $17, $18, $19, $20, $21, $22
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
        tc."wrIsTrending" as "isTrending",
        tc."wrIsEventSnap" as "isEventSnap",
        tc."wrIsPointTable" as "isPointTable",
        tc."wrMatchTypeId" as "matchTypeId",
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount",
        tc."wrImagePath" as "imagePath",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrStatus" as "status",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate"
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
          data.isEventSnap || false,
          data.isPointTable || false,
          data.matchTypeId || null,
          data.winPoint === undefined ? null : data.winPoint,
          data.tiePoint === undefined ? null : data.tiePoint,
          data.cancelPoint === undefined ? null : data.cancelPoint,
          data.lossPoint === undefined ? null : data.lossPoint,
          data.drsCount === undefined ? 0 : data.drsCount,
          data.imagePath || null,
          data.isMen || null,
          data.type || null,
          data.isVirtual || false,
          data.status,
          data.startDate,
          data.endDate,
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
      `update "tblCompetitions" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
      where "wrCompetitionId" = ANY ($3)`,
      {
        bind: [true, request.userTokenInfo.WrUserId, request.body.competitionId],
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
        "wrIsTrending" = $7,
        "wrIsEventSnap" = $8,
        "wrIsPointTable" = $9,
        "wrMatchTypeId" = $11,
        "wrWinPoint" = $12,
        "wrTiePoint" = $13,
        "wrCancelPoint" = $14,
        "wrLossPoint" = $15,
        "wrDrsCount" = $16,
        "wrImagePath" = $17,
        "wrIsMen" = $18,
        "wrType" = $19,
        "wrIsVirtual" = $20,
        "wrStatus" = $21,
        "wrStartDate" = $22,
        "wrEndDate" = $23
        where "wrCompetitionId" = $10
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
          data.isEventSnap || false,
          data.isPointTable || false,
          data.competitionId,
          data.matchTypeId,
          data.winPoint,
          data.tiePoint,
          data.cancelPoint,
          data.lossPoint,
          data.drsCount,
          data.imagePath,
          data.isMen,
          data.type,
          data.isVirtual,
          data.status,
          data.startDate,
          data.endDate,
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
        u."wrIsTrending" AS "isTrending",
        u."wrIsEventSnap" as "isEventSnap",
        u."wrIsPointTable" as "isPointTable",
        u."wrMatchTypeId" as "matchTypeId",
        u."wrWinPoint" as "winPoint",
        u."wrTiePoint" as "tiePoint",
        u."wrCancelPoint" as "cancelPoint",
        u."wrLossPoint" as "lossPoint",
        u."wrImagePath" as "imagePath",
        u."wrIsMen" as "isMen",
        u."wrType" as "type",
        u."wrIsVirtual" as "isVirtual",
        u."wrStatus" as "status",
        u."wrStartDate" as "startDate",
        u."wrEndDate" as "endDate"
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

const isEventSnapCompetitionQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrIsEventSnap" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.isEventSnap, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/isEventSnapCompetitionQuery",
      request
    );
    throw new Error(err.message);
  }
};

const isPointTableCompetitionQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrIsPointTable" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.isPointTable, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/isPointTableCompetitionQuery",
      request
    );
    throw new Error(err.message);
  }
};
const isMenChangeStatusQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrIsMen" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.isMen, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/isMenChangeStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};
const getTemplateByCompetitionIdQuery = async (data,request, fastify) => {
  try {
    let assignedMarketTemplates = await fastify.db.query(
      `
        SELECT  
          tcm."wrId" as "id",
          tcm."wrCompetitionId" as "competitionId",
          tcm."wrMarketTemplateId" as "marketTemplateId",
          tmt."wrTemplateName" as "templateName",
          tmt1."wrId" as "marketTypeId",
          tmc."wrId" as "marketTypeCategoryId",
          "wrMarketTypeName" as "marketTypeName",
          "wrCategoryName" as "categoryName"
        FROM "tblCompMarketTemplate" tcm
        LEFT JOIN "tblMarketTemplates" tmt ON tcm."wrMarketTemplateId" = tmt."wrID"
        LEFT JOIN "tblMarketTypes" tmt1 ON tmt."wrMarketTypeId" = tmt1."wrId"
        LEFT JOIN "tblMarketTypeCategories" tmc ON tmt."wrMarketTypeCategoryId" = tmc."wrId"
        WHERE tcm."wrCompetitionId" = $1
        AND tmt."wrIsDeleted" = false
        AND tmt."wrIsActive" = true
        ORDER BY tmc."wrDisplayOrder" ASC, tmt."wrTemplateName" ASC;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.competitionId],
      }
    );

    let unAssignedMarketTemplates = await fastify.db.query(
      `
        SELECT 
          tmt."wrID" as "marketTemplateId",
          tmt."wrTemplateName" as "templateName",
          "wrMarketTypeName" as "marketTypeName",
          "wrCategoryName" as "categoryName",
          tmt1."wrId" as "marketTypeId",
          tmc."wrId" as "marketTypeCategoryId"
        FROM "tblMarketTemplates" tmt
        LEFT JOIN "tblMarketTypes" tmt1 ON tmt."wrMarketTypeId" = tmt1."wrId"
        LEFT JOIN "tblMarketTypeCategories" tmc ON tmt."wrMarketTypeCategoryId" = tmc."wrId"
        WHERE tmt."wrIsDeleted" = false
        AND tmt."wrMatchTypeID" = $1
        AND tmt."wrIsActive" = true
        AND tmt."wrID" NOT IN (
          SELECT "wrMarketTemplateId" FROM "tblCompMarketTemplate" WHERE "wrCompetitionId"= $2
        ) 
        ORDER BY tmc."wrDisplayOrder" ASC, tmt."wrTemplateName" ASC;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.matchTypeId, data.competitionId],
      }
    );

    return {
      assignedTemplates: assignedMarketTemplates,
      unassignedTemplates: unAssignedMarketTemplates,
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCompitition/getTemplateByCompetitionIdQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const saveCompMarketTemplateQuery = async (data, request, fastify) => {
  try {
    if(data.dltTemplate.length > 0) {
      await fastify.db.query(
        `
          DELETE FROM "tblCompMarketTemplate" WHERE "wrId" = ANY($1)
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind : [data.dltTemplate]
        }
      );
   }

   if(data.saveTemplates.length > 0) {
      const existingTemp = await fastify.db.query(
        `
          SELECT "wrMarketTemplateId" as "marketTemplateId" FROM "tblCompMarketTemplate" WHERE "wrCompetitionId" = $1
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [data.saveTemplates[0].competitionId],
        }
      );

      let templateToSave = []
      if (existingTemp.length > 0) {
        templateToSave = data.saveTemplates.filter((item) => !existingTemp.map((temp) => temp.marketTemplateId).includes(item.marketTemplateId));
      } 
      else {
        templateToSave = data.saveTemplates;
      }
      if(templateToSave.length > 0) {
        	await fastify.db.query(
        `
          INSERT INTO "tblCompMarketTemplate" ("wrCompetitionId", "wrMarketTemplateId", "wrCreatedBy", "wrCreatedAt")
          VALUES 
          ${templateToSave.map((item) => `(${item.competitionId}, ${item.marketTemplateId}, ${request.userTokenInfo.WrUserId}, now())`).join(",")}
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
        }
      );
     }
    }

    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCompitition/saveCompMarketTemplateQuery",
      request
    );
    throw new Error(error.message);
  }
}
const isVirtualCompetitionQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrIsVirtual" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.isVirtual, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/isVirtualCompetitionQuery",
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
  isTrendingChangeStatusQuery,
  isEventSnapCompetitionQuery,
  isPointTableCompetitionQuery,
  isMenChangeStatusQuery,
  getTemplateByCompetitionIdQuery,
  saveCompMarketTemplateQuery,
  isVirtualCompetitionQuery,
};

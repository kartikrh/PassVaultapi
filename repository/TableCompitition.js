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
    tmt."wrMatchType" as "matchType",
    tc."wrWinPoint" as "winPoint",
    tc."wrTiePoint" as "tiePoint",
    tc."wrCancelPoint" as "cancelPoint",
    tc."wrLossPoint" as "lossPoint",
    tc."wrDrsCount" as "drsCount",
    tc."wrImagePath" as "imagePath",
    tc."wrIsMen" as "isMen",
    tc."wrType" as "type",
    tc."wrIsVirtual" as "isVirtual",
    tc."wrStatus" as "commStatus",
    tc."wrStartDate" as "startDate",
    tc."wrEndDate" as "endDate",
    tc."wrTpId" as "tpId",
    tc."wrPythonId" as "pythonId",
    tc."wrCountryId" as "countryId",
    tpa."wrDeveloperName" as "developerName",
    tc."wrSetOfRules" as "setOfRules"
    from "tblCompetitions" tc 
    inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
    LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
    LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
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
             "wrWinPoint", "wrTiePoint", "wrCancelPoint", "wrLossPoint","wrDrsCount", "wrImagePath", "wrIsMen", "wrType", "wrIsVirtual", "wrStatus", "wrStartDate", "wrEndDate",
             "wrTpId", "wrPythonId", "wrCountryId", "wrSetOfRules"
            )
            values ($1 ,
                 $2,
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1, $7, $8, $9, $10,
                 $11, $12, $13, $14,$15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
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
        tmt."wrMatchType" as "matchType",
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount",
        tc."wrImagePath" as "imagePath",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrStatus" as "commStatus",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate",
        tc."wrTpId" as "tpId",
        tc."wrCountryId" as "countryId",
        tc."wrPythonId" as "pythonId",
        tpa."wrDeveloperName" as "developerName",
        tc."wrSetOfRules" as "setOfRules"
        from "inser_data" tc
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
        LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
        LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
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
          data.winPoint || null,
          data.tiePoint || null,
          data.cancelPoint || null,
          data.lossPoint || null,
          data.drsCount || null,
          data.imagePath || null,
          data.isMen || null,
          data.type || null,
          data.isVirtual || false,
          data.commStatus || null,
          data.startDate || null,
          data.endDate || null,
          data.tpId || null,
          data.pythonId || null,
          data.countryId || null,
          data?.setOfRules || null,
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
const updateTpIdCompQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      WITH update_data AS (
        UPDATE "tblCompetitions" SET
          "wrModifyBy" = $1,
          "wrModifyDate" = NOW(),
          "wrTpId" = $2
        WHERE "wrCompetitionId" = $3
        AND "wrIsDeleted" = false
        RETURNING *
      )
      SELECT 
        ud."wrCompetitionId" AS "competitionId",
        ud."wrCompetition" AS "competition",
        ud."wrEventTypeId" AS "eventTypeId",
        tev."wrEventType" AS "eventType",
        ud."wrRefID" AS "refId",
        ud."wrImage" AS "image",
        ud."wrIsActive" AS "isActive",
        ud."wrDisplayOrder" AS "displayOrder",
        ud."wrIsTrending" AS "isTrending",
        ud."wrIsEventSnap" AS "isEventSnap",
        ud."wrIsPointTable" AS "isPointTable",
        ud."wrMatchTypeId" AS "matchTypeId",
        tmt."wrMatchType" as "matchType",
        ud."wrWinPoint" AS "winPoint",
        ud."wrTiePoint" AS "tiePoint",
        ud."wrCancelPoint" AS "cancelPoint",
        ud."wrLossPoint" AS "lossPoint",
        ud."wrDrsCount" AS "drsCount",
        ud."wrImagePath" AS "imagePath",
        ud."wrIsMen" AS "isMen",
        ud."wrType" AS "type",
        ud."wrIsVirtual" AS "isVirtual",
        ud."wrStatus" AS "commStatus",
        ud."wrStartDate" AS "startDate",
        ud."wrEndDate" AS "endDate",
        ud."wrTpId" AS "tpId"
      FROM update_data ud
      INNER JOIN "tblEventTypes" tev ON ud."wrEventTypeId" = tev."wrEventTypeId"
      LEFT JOIN "tblMatchTypes" tmt ON ud."wrMatchTypeId" = tmt."wrMatchTypeId"
      `,
      {
        bind: [
          data.modifiedBy || request.userTokenInfo?.WrUserId || null,
          data.tpId,
          data.competitionId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition/updateExchangeCompititionQuery",
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
      `WITH update_data AS (
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
          "wrEndDate" = $23,
          "wrTpId" = $24,
          "wrPythonId" = $25,
          "wrCountryId" = $26,
          "wrSetOfRules" = $27
        where "wrCompetitionId" = $10
        returning *
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
        tmt."wrMatchType" as "matchType",
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount",
        tc."wrImagePath" as "imagePath",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrStatus" as "commStatus",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate",
        tc."wrTpId" as "tpId",
        tc."wrCountryId" as "countryId",
        tc."wrPythonId" as "pythonId",
        tpa."wrDeveloperName" as "developerName",
        tc."wrSetOfRules" as "setOfRules"
      from "update_data" tc
      inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
      LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
      LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
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
          data.type || null,
          data.isVirtual,
          data.commStatus || null,
          data.startDate,
          data.endDate,
          data.tpId === undefined ? null : data.tpId,
          data.pythonId,
          data.countryId,
          data?.setOfRules,
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
        tmt."wrMatchType" as "matchType",
        u."wrWinPoint" as "winPoint",
        u."wrTiePoint" as "tiePoint",
        u."wrCancelPoint" as "cancelPoint",
        u."wrLossPoint" as "lossPoint",
        u."wrImagePath" as "imagePath",
        u."wrIsMen" as "isMen",
        u."wrType" as "type",
        u."wrIsVirtual" as "isVirtual",
        u."wrStatus" as "commStatus",
        u."wrStartDate" as "startDate",
        u."wrEndDate" as "endDate",
        u."wrTpId" as "tpId",
        u."wrCountryId" as "countryId",
        u."wrPythonId" as "pythonId",
        tpa."wrDeveloperName" as "developerName"
      FROM updated u
      INNER JOIN "tblEventTypes" et ON u."wrEventTypeId" = et."wrEventTypeId"
      LEFT JOIN "tblMatchTypes" tmt on u."wrMatchTypeId" = tmt."wrMatchTypeId"
      LEFT JOIN "tblPythonAPI" tpa on u."wrPythonId" = tpa."wrId"
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
                "wrIsPointTable" = $1,
                "wrWinPoint" = $2,
                "wrTiePoint" = $3,
                "wrCancelPoint" = $4,
                "wrLossPoint" = $5
                where "wrCompetitionId" = $6
            `,
      {
        bind: [
          data.isPointTable,
          data.winPoint,
          data.tiePoint,
          data.cancelPoint,
          data.lossPoint,
          data.competitionId
        ],
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
const getTemplateByCompetitionIdQuery = async (data, request, fastify) => {
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
          tmt."wrIsDefaultSetResult" as "isDefaultSetResult",
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
          tmt."wrIsDefaultSetResult" as "isDefaultSetResult",
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
    };
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
const insertCompetitionWithImportQuery = async (data, request, fastify) => {
  try {
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
             "wrWinPoint", "wrTiePoint", "wrCancelPoint", "wrLossPoint","wrDrsCount", "wrImagePath", "wrIsMen", "wrType", "wrIsVirtual", "wrStatus", "wrStartDate", "wrEndDate",
             "wrTpId", "wrPythonId", "wrCountryId"
            )
            values ($1 ,
                 $2,
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1, $7, $8, $9, $10,
                 $11, $12, $13, $14,$15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
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
        tmt."wrMatchType" as "matchType",
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount",
        tc."wrImagePath" as "imagePath",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrStatus" as "commStatus",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate",
        tc."wrTpId" as "tpId",
        tc."wrCountryId" as "countryId",
        tc."wrPythonId" as "pythonId",
        tpa."wrDeveloperName" as "developerName"
        from "inser_data" tc
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
        LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
        LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
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
          data.isMen === undefined ? null : data.isMen,
          data.type || null,
          data.isVirtual || false,
          data.commStatus,
          data.startDate,
          data.endDate,
          data.tpId || null,
          data.pythonId || null,
          data.countryId || null,
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
const deleteCompMarketTemplateQuery = async (templateIds, request, fastify) => {
  try {
    await fastify.db.query(
      `
        DELETE FROM "tblCompMarketTemplate" WHERE "wrId" = ANY($1)
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind : [templateIds]
      }
    );

    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCompitition/deleteCompMarketTemplateQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getAssignedTemplateByCompetitionIdQuery = async (competitionId, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
        SELECT  
          "wrId" as "id",
          "wrCompetitionId" as "competitionId",
          "wrMarketTemplateId" as "marketTemplateId"
        FROM "tblCompMarketTemplate"
        WHERE "wrCompetitionId" = $1;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [competitionId],
      }
    );

    return result
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableCompitition/getAssignedTemplateByCompetitionIdQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const upStatusQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblCompetitions" set
                "wrStatus" = $1
                where "wrCompetitionId" = $2
            `,
      {
        bind: [data.commStatus, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/upStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};
const getAllCompetitionByIdsQuery = async (whereCondition = undefined, fastify) => {
  try {
      const result = await fastify.db.query(
      `SELECT 
          tc."wrCompetitionId" as "competitionId",
          tc."wrCompetition" as "competition",
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
          tmt."wrMatchType" as "matchType",
          tc."wrWinPoint" as "winPoint",
          tc."wrTiePoint" as "tiePoint",
          tc."wrCancelPoint" as "cancelPoint",
          tc."wrLossPoint" as "lossPoint",
          tc."wrDrsCount" as "drsCount",
          tc."wrImagePath" as "imagePath",
          tc."wrIsMen" as "isMen",
          tc."wrType" as "type",
          tc."wrIsVirtual" as "isVirtual",
          tc."wrStatus" as "commStatus",
          tc."wrStartDate" as "startDate",
          tc."wrEndDate" as "endDate",
          tc."wrTpId" as "tpId",
          tc."wrCountryId" as "countryId",
          tc."wrPythonId" as "pythonId",
          tpa."wrDeveloperName" as "developerName"
      FROM "tblCompetitions" tc 
      INNER JOIN "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
      LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
      LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
      ${whereCondition ? `WHERE ${whereCondition}` : 'WHERE tc."wrIsDeleted" = false and tev."wrIsDeleted" = false'}`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    ); 
    return result[0]; 
  } catch (err) {
    console.log("comprtitoes error", err)
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/getAllCompetitionByIdsQuery",
      null
    );
    throw new Error(err.message);
  }
}
const getCompetitionByIdsQuery = async (data , request , fastify)=>{
  try {
  
    let competitions = await fastify.db.query(
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
        tmt."wrMatchType" as "matchType",
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount",
        tc."wrImagePath" as "imagePath",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrStatus" as "commStatus",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate",
        tc."wrTpId" as "tpId",
        tc."wrCountryId" as "countryId",
        tc."wrPythonId" as "pythonId",
        tpa."wrDeveloperName" as "developerName"
        from "tblCompetitions" tc 
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
        LEFT JOIN "tblMatchTypes" tmt on tc."wrMatchTypeId" = tmt."wrMatchTypeId"
        LEFT JOIN "tblPythonAPI" tpa on tc."wrPythonId" = tpa."wrId"
        where tc."wrIsDeleted" = false and tev."wrIsDeleted" = false
        AND tc."wrCompetitionId" = ANY($1)
        `,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind : [
            data.competitionIds
          ]
        }
      );
    return competitions;
  } catch (error) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/getCompetitionByIdsQuery",
      request
    );
    // throw new Error(err.message);
  }
}
const getMatchTypeTemplateByCompetitionIdQuery = async (data,request, fastify) => {
  try {
    let assignedMarketTemplates = await fastify.db.query(
      `
        SELECT  
          tcm."wrId" as "id",
          tcm."wrMarketTemplateId" as "marketTemplateId",
          tcm."wrCompetitionId" as "competitionId",
          tmt."wrDevTemplateName" as "devTemplateName",
          tmt."wrTemplateName" as "templateName",
          tmt1."wrId" as "marketTypeId",
          tmt1."wrMarketTypeName" as "marketTypeName",
          tmc."wrId" as "marketTypeCategoryId",
          tmt."wrIsDefaultSetResult" as "isDefaultSetResult",
          tmc."wrCategoryName" as "categoryName"
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
          tmtt."wrMarketTemplateId" as "marketTemplateId",
          tmt."wrDevTemplateName" as "devTemplateName",
          tmt."wrTemplateName" as "templateName",
          tmt1."wrId" as "marketTypeId",
          tmt1."wrMarketTypeName" as "marketTypeName",
          tmc."wrId" as "marketTypeCategoryId",
          tmt."wrIsDefaultSetResult" as "isDefaultSetResult",
          tmc."wrCategoryName" as "categoryName"
        FROM "tblMatchTypeTemplates" tmtt
        LEFT JOIN "tblMarketTemplates" tmt ON tmt."wrID" = tmtt."wrMarketTemplateId"
        LEFT JOIN "tblMarketTypes" tmt1 ON tmt."wrMarketTypeId" = tmt1."wrId"
        LEFT JOIN "tblMarketTypeCategories" tmc ON tmt."wrMarketTypeCategoryId" = tmc."wrId"
        WHERE tmt."wrIsDeleted" = false
        AND tmtt."wrMatchTypeId" = $1
        AND tmt."wrIsActive" = true
        AND tmtt."wrMarketTemplateId" NOT IN (
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

const updateCompititionDateByCompetitionIdQuery = async (data, fastify, request) => {
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.startDate !== undefined) {
      fields.push(`"wrStartDate" = $${idx++}`);
      values.push(data.startDate);
    }

    if (data.endDate !== undefined) {
      fields.push(`"wrEndDate" = $${idx++}`);
      values.push(data.endDate);
    }

    fields.push(`"wrModifyBy" = $${idx++}`);
    values.push(request?.userTokenInfo?.WrUserId);

    fields.push(`"wrModifyDate" = NOW()`);

    values.push(data.competitionId);
    const competitionIdParam = `$${idx}`;

    const sql = `
      WITH update_data AS (
        UPDATE "tblCompetitions"
        SET ${fields.join(", ")}
        WHERE "wrCompetitionId" = ${competitionIdParam}
        RETURNING *
      )
      SELECT 
        tc."wrCompetitionId" AS "competitionId",
        tc."wrCompetition"   AS "competition",
        tc."wrEventTypeId"   AS "eventTypeId",
        tev."wrEventType"    AS "eventType",
        tc."wrRefID"         AS "refId",
        tc."wrImage"         AS "image",
        tc."wrIsActive"      AS "isActive",
        tc."wrDisplayOrder"  AS "displayOrder",
        tc."wrIsTrending"    AS "isTrending",
        tc."wrIsEventSnap"   AS "isEventSnap",
        tc."wrIsPointTable"  AS "isPointTable",
        tc."wrMatchTypeId"   AS "matchTypeId",
        tmt."wrMatchType"    AS "matchType",
        tc."wrWinPoint"      AS "winPoint",
        tc."wrTiePoint"      AS "tiePoint",
        tc."wrCancelPoint"   AS "cancelPoint",
        tc."wrLossPoint"     AS "lossPoint",
        tc."wrDrsCount"      AS "drsCount",
        tc."wrImagePath"     AS "imagePath",
        tc."wrIsMen"         AS "isMen",
        tc."wrType"          AS "type",
        tc."wrIsVirtual"     AS "isVirtual",
        tc."wrStatus"        AS "commStatus",
        tc."wrStartDate"     AS "startDate",
        tc."wrEndDate"       AS "endDate",
        tc."wrTpId"          AS "tpId",
        tc."wrCountryId"     AS "countryId",
        tc."wrPythonId"      AS "pythonId",
        tpa."wrDeveloperName" AS "developerName",
        tc."wrSetOfRules"    AS "setOfRules"
      FROM update_data tc
      INNER JOIN "tblEventTypes" tev ON tc."wrEventTypeId" = tev."wrEventTypeId"
      LEFT JOIN "tblMatchTypes" tmt ON tc."wrMatchTypeId" = tmt."wrMatchTypeId"
      LEFT JOIN "tblPythonAPI" tpa ON tc."wrPythonId" = tpa."wrId"
    `;

    const result = await fastify.db.query(sql, {
      bind: values,
      type: fastify.db.QueryTypes.SELECT,
    });

    return result?.[0] || null;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCompitition.js/updateCompititionDateByCompetitionIdQuery",
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
  insertCompetitionWithImportQuery,
  deleteCompMarketTemplateQuery,
  getAssignedTemplateByCompetitionIdQuery,
  upStatusQuery,
  getAllCompetitionByIdsQuery,
  getCompetitionByIdsQuery,
  getMatchTypeTemplateByCompetitionIdQuery,
  updateTpIdCompQuery,
  updateCompititionDateByCompetitionIdQuery
};

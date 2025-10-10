const { QueryTypes } = require("sequelize");
const { errorLogger } = require("../utilities/logger");

const insertEventTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
            insert into "tblEventTypes" ("wrEventType","wrRefId","wrImage","wrIsActive","wrDisplayOrder","wrRemark","wrIsHighlight","wrCreatedDate","wrCreatedBy") values (
              $1,$2,$3,$4,(select COALESCE(max("wrDisplayOrder") , 0) as result from "tblEventTypes") + 1,$5,$6,$7,$8) returning *
        )        
        select 
        "wrEventTypeId" as "eventTypeId",
        "wrEventType" as "eventType",
        "wrRefId" as "refId",
        "wrImage" as "image",
        "wrIsActive" as "isActive",
        "wrDisplayOrder" as "displayOrder",
        "wrRemark" as "remark",
        "wrIsHighlight" as "isHighlight"
         from insert_data id`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.eventTypeName || null,
          data.eventTypeId || null,
          data.image || null,
          data.isActive || false,
          data.remark || null,
          data.isHighlight || false,
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
      "DB ERROR --> repository/TableEventType.js/insertEventTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateEventTypeQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `Update "tblEventTypes" set "wrEventType" = $1,"wrRefId" = $2,"wrImage" = $3,"wrIsActive" = $4,"wrRemark" = $5,"wrIsHighlight" = $6,"wrModifyDate" = $7,"wrModifyBy" = $8 where "wrEventTypeId" = $9`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.eventType,
          data.refId,
          data.image,
          data.isActive,
          data.remark,
          data.isHighlight,
          new Date(),
          data.userId,
          data.eventTypeId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventType.js/updateEventTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertCompetitionQuery = async (request, fastify) => {
  try {
    const data = request.body;

    const result = await fastify.db.query(
      `
        with display as (
            select max("wrDisplayOrder") as "display_order" from "tblCompetitions" where "wrEventTypeId" = $2
        ),
        inser_data as (
            insert into "tblCompetitions" ("wrCompetition" , "wrEventTypeId" , "wrRefID" , "wrImage" ,"wrIsActive" , "wrCreatedBy" , "wrCreatedDate","wrDisplayOrder", "wrDrsCount", "wrPythonId" ) values ($1 ,
                $2,
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1,
                  $7, $8
                 ) returning *
        )
        select 
        "wrCompetitionId" as "competitionId",
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
        tc."wrWinPoint" as "winPoint",
        tc."wrTiePoint" as "tiePoint",
        tc."wrCancelPoint" as "cancelPoint",
        tc."wrLossPoint" as "lossPoint",
        tc."wrDrsCount" as "drsCount", 
        tc."wrImagePath" as "imagePath",
        tc."wrStatus" as "commStatus",
        tc."wrStartDate" as "startDate",
        tc."wrEndDate" as "endDate",
        tc."wrTpId" as "tpId",
        tc."wrIsMen" as "isMen",
        tc."wrType" as "type",
        tc."wrIsVirtual" as "isVirtual",
        tc."wrCountryId" as "countryId",
        tc."wrPythonId" as "pythonId"
        from "inser_data" tc 
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
    `,
      {
        bind: [
          data.competitionName,
          data.eventTypeId,
          data.competitionId,
          data.image || null,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.drsCount !== undefined ? data.drsCount : 0,
          data.pythonId !== undefined ? data.pythonId : null,
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
        "wrModifyDate" = now()
        where "wrCompetitionId" = $7
        `,
      {
        bind: [
          data.competition,
          data.eventTypeId,
          data.refId,
          data.image || null,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
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

const insertEventQuery = async (request, fastify) => {
  try {
    const data = request.body;

    const result = await fastify.db.query(
      `
    with insert_data as (
        insert into "tblEvents" (
            "wrEventTypeId",
            "wrCompetitionId",
            "wrEventName",
            "wrEventDate",
            "wrRefID",
            "wrIsActive",
            "wrCreatedBy",
            "wrCreatedDate",
            "wrCountryCode",
            "wrTimeZone",
            "wrVenue"
        ) values (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            now(),
            $8,
            $9,
            $10
        ) returning *
        
    )

    select 
    te."wrEventId" as "eventId",
    te."wrEventTypeId" as "eventTypeId",
    te."wrCompetitionId" as "competitionId",
    tet."wrEventType" as "eventType",
    tc."wrCompetition" as "competition",
    te."wrEventName" as "eventName",
    te."wrEventDate" as "eventDate",
    te."wrRefID" as "refId",
    te."wrIsActive" as "isActive",
    te."wrCountryCode" as "countryCode",
    te."wrTimeZone" as "timeZone",
    te."wrCreatedBy" as "createdBy",
    te."wrVenue" as "venue"
    from "insert_data" te
    left join "tblEventTypes" tet on te."wrEventTypeId" = tet."wrEventTypeId"
    left join "tblCompetitions" tc on te."wrCompetitionId" = tc."wrCompetitionId"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.eventTypeId,
          data.competitionId,
          data.eventName,
          data.openDate ? new Date(data.openDate) : null,
          data.eventId,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.countryCode || "",
          data.timeZone || "",
          data.venue || "",
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEvent/insertEventQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateEventQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
        update "tblEvents" set
        "wrEventTypeId" = $1,
        "wrCompetitionId" = $2,
        "wrEventName" = $3,
        "wrEventDate" = $4,
        "wrRefID" = $5,
        "wrIsActive" = $6,
        "wrModifyBy" = $7,
        "wrModifyDate" = now(),
        "wrCountryCode" = $8,
        "wrTimeZone" = $9,
        "wrVenue" = $10
        where "wrEventId" = $11
        returning *
        `,
      {
        bind: [
          data.eventTypeId,
          data.competitionId,
          data.eventName,
          data.eventDate ? new Date(data.eventDate) : null,
          data.refId,
          data.isActive,
          request.userTokenInfo.WrUserId,
          data.countryCode,
          data.timeZone,
          data.venue,
          data.eventId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEvent/updateEventQuery",
      request
    );
    throw new Error(err.message);
  }
};

async function AddUpdateMarket(request, fastify) {
  try {
    const data = await fastify.db.query(
      `
    DO $$ 
    DECLARE
        ETID integer;
        DID integer;
        CID integer;
        CDID integer;
        EID integer;
    BEGIN
        -- Check EventType is not exists insert
        SELECT "wrEventTypeId" INTO ETID FROM "tblEventTypes" WHERE "wrRefId" = $1;
        ETID := COALESCE(ETID, 0);
        IF ETID = 0 THEN
            SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 INTO DID FROM "tblEventTypes";
          WITH inserted_EventTypes AS (
            INSERT INTO "tblEventTypes"("wrEventType", "wrRefId", "wrImage", "wrIsActive", "wrDisplayOrder", "wrCreatedBy", "wrCreatedDate")
            VALUES ($2, $1, 'fa-soccer-ball-o', true, DID, $11, CURRENT_DATE)
    		RETURNING "wrEventTypeId"
    	  )
    	  SELECT "wrEventTypeId" INTO ETID FROM inserted_EventTypes;
        ELSE
            UPDATE "tblEventTypes"
            SET "wrEventType" = $2, "wrRefId"  = $1, "wrCreatedDate" = CURRENT_DATE
            WHERE "wrEventTypeId" = ETID;
        END IF;
    
        -- Check Competition is not exists insert
        SELECT "wrCompetitionId" INTO CID FROM "tblCompetitions"
        WHERE "wrEventTypeId" = ETID AND "wrRefID" = $3;
    	 CID := COALESCE(CID, 0);
        IF CID = 0 THEN
            SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 INTO CDID FROM "tblCompetitions" WHERE "wrEventTypeId" = ETID;
        WITH inserted_Competitions AS (
            INSERT INTO "tblCompetitions"("wrCompetition", "wrEventTypeId", "wrRefID", "wrImage", "wrIsActive", "wrDisplayOrder", "wrCreatedBy", "wrCreatedDate")
            VALUES ($4, ETID, $3, 'fa-soccer-ball-o', true, CDID, 1, CURRENT_DATE)
    		RETURNING "wrCompetitionId"
    	 )
    	  SELECT "wrCompetitionId" INTO ETID FROM inserted_Competitions;
        ELSE
            UPDATE "tblCompetitions"
            SET "wrCompetition" = $4,"wrRefID" = $3, "wrModifyBy"  = $11, "wrModifyDate" = CURRENT_DATE
            WHERE "wrCompetitionId" = CID;
        END IF;
    
        -- Check Event is not exists insert or update
        SELECT "wrEventId" INTO EID FROM "tblEvents"
        WHERE "wrCompetitionId" = CID AND "wrRefID" = $5;
        EID := COALESCE(EID, 0);
        IF EID <> 0 THEN
            UPDATE "tblEvents"
            SET "wrEventName" = $6,
                "wrCountryCode" = $7,
                "wrTimeZone" = $8,
                "wrVenue" = $9,
                "wrEventDate" = $10
            WHERE "wrEventId" = EID;
        ELSE
            INSERT INTO "tblEvents"("wrRefID", "wrCompetitionId", "wrEventTypeId", "wrEventName", "wrCountryCode", "wrTimeZone", "wrVenue", "wrEventDate")
            VALUES ($5, CID, ETID, $6, $7, $8, $9, $10);
        END IF;
    END
    $$;
    `,
      {
        type: QueryTypes.SELECT,
        bind: [
          request.body.eventTypeId,
          request.body.eventTypeName,
          request.body.compititionId,
          request.body.comtitionName,
          request.body.eventId,
          request.body.eventName,
          request.body.countryCode,
          request.body.timeZome,
          request.body.venue,
          request.body.openDate,
          request.userTokenInfo.WrUserId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableImportMarket/AddUpdateMarket",
      request
    );
    throw new Error(err.message);
  }
}

// const updateMarketRunnerTeambySelectionId = async (fastify, request) => {
//   try {
//     const data = request.body;
//     const queries = data.map(({ selectionId, teamId }) => ({
//       query: `UPDATE "tblMarketRunners" SET "wrTeamId" = $1 WHERE "wrSelectionId" = $2`,
//       values: [teamId, selectionId],
//     }));

//     await fastify.db.transaction(async (t) => {
//       for (const { query, values } of queries) {
//         await fastify.db.query(query, {
//           type: fastify.db.QueryTypes.UPDATE,
//           bind: values,
//           transaction: t,
//         });
//       }
//     });
//   } catch (err) {
//     errorLogger(
//       fastify,
//       err.message,
//       "DB ERROR --> repository/TableMarketRunners.js/updateMarketRunnerTeambySelectionId",
//       request
//     );
//     throw new Error(err.message);
//   }
// };

const updateMarketRunnerTeambySelectionId = async (fastify, request) => {
  try {
    const data = request.body;
    const notFoundSelectionIds = [];

    const queries = await Promise.all(data.map(async ({ selectionId, teamId , runnerId}) => {
      // Check if selectionId exists in tblMarketRunners
      const selectionExists = await fastify.db.query(
        `SELECT COUNT(*) FROM "tblMarketRunners" WHERE "wrRunnerId" = $1 AND "wrIsDeleted" = false`,
        {
          bind: [runnerId],
          type: fastify.db.QueryTypes.SELECT,
        }
      );

      if (selectionExists[0].count > 0) {
        let index = global.tblMarketRunnerV2.findIndex((elem) => 
          elem.runnerId === runnerId
        );
        if(index !== -1){
          global.tblMarketRunnerV2[index].teamId = teamId
        }
        // If exists, prepare update query
        return {
          query: `UPDATE "tblMarketRunners" SET "wrTeamId" = $1 WHERE "wrRunnerId" = $2`,
          values: [teamId, runnerId],
        };
      } else {
        // If not found, store selectionId in notFoundSelectionIds array
        notFoundSelectionIds.push(selectionId);
        return null; // Return null or undefined for items not to be updated
      }
    }));

    // Remove null values from queries array
    const validQueries = queries.filter(query => query !== null);

    // Execute updates in transaction
    await fastify.db.transaction(async (t) => {
      for (const { query, values } of validQueries) {
        await fastify.db.query(query, {
          type: fastify.db.QueryTypes.UPDATE,
          bind: values,
          transaction: t,
        });
      }
    });
    
     // Update local variable global.tblEventMarkets
     data.forEach(({ selectionId, teamId }) => {
       global.tblEventMarkets = global.tblEventMarkets.map(event => {
         if (event.selectionId === selectionId) {
           return { ...event, teamId };
         }
         return event;
       });
     });


    // Format response message
    let responseMessage = '';
    if (notFoundSelectionIds.length > 0) {
      responseMessage = `${notFoundSelectionIds.join(', ')} these selection IDs not found`;
    } else {
      responseMessage = 'Team Id is successfully updated in Runners Table';
    }

    // Return formatted response
    return responseMessage;

  } catch (err) {
    console.log("set runner error..", err)
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketRunners.js/updateMarketRunnerTeambySelectionId",
      request
    );
    throw new Error(err.message);
  }
};


module.exports = {
  AddUpdateMarket,
  insertEventTypeQuery,
  updateEventTypeQuery,
  insertCompetitionQuery,
  updateCompititionQuery,
  insertEventQuery,
  updateEventQuery,
  updateMarketRunnerTeambySelectionId,
};

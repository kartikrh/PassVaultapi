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
        "wrValue" as "eventTypeId",
        "wrEventType" as "eventType",
        "wrRefId" as "refId",
        "wrImage" as "image",
        "wrIsActive" as "isActive",
        "wrDisplayOrder" as "displayOrder",
        "wrRemark" as "remark",
        "wrIsHighlight" as "isHighlight"
         from insert_data id left join "tblEncryptedData" ed on id."wrEventTypeId" = ed."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.eventTypeName || null,
          data.eventTypeID || null,
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
      `Update "tblEventTypes" set "wrEventType" = $1,"wrRefId" = $2,"wrImage" = $3,"wrIsActive" = $4,"wrRemark" = $5,"wrIsHighlight" = $6,"wrModifyDate" = $7,"wrModifyBy" = $8 where "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $9)`,
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
            select max("wrDisplayOrder") as "display_order" from "tblCompetitions" where "wrEventTypeId" =  (
                select "wrKey" from "tblEncryptedData" where "wrValue" = $2
            )
        ),
        inser_data as (
            
            insert into "tblCompetitions" ("wrCompetition" , "wrEventTypeId" , "wrRefID" , "wrImage" ,"wrIsActive" , "wrCreatedBy" , "wrCreatedDate","wrDisplayOrder" ) values ($1 ,
              (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
                 $3,$4,$5,$6,now(),(select COALESCE("display_order" , 0) from "display") + 1
                 ) returning *
        )

        select 
        te."wrValue" as "competitionId",
        "wrCompetition" as "competition",
        te1."wrValue" as "eventTypeId",
        "wrEventType" as "eventType",
        tc."wrRefID" as "refId",
        tc."wrImage" as "image",
        tc."wrIsActive" as "isActive",
        tc."wrDisplayOrder" as "displayOrder"
        from "inser_data" tc 
        inner join "tblEncryptedData" te on tc."wrCompetitionId" = te."wrKey"
        inner join "tblEventTypes" tev on tc."wrEventTypeId" = tev."wrEventTypeId"
        inner join "tblEncryptedData" te1 on tc."wrEventTypeId" = te1."wrKey" 
    `,
      {
        bind: [
          data.competitionName,
          data.eventTypeId,
          data.competitionID,
          data.image || null,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
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
        "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        "wrRefID" = $3,
        "wrImage" = $4,
        "wrIsActive" = $5,
        "wrModifyBy" = $6,
        "wrModifyDate" = now()
        where "wrCompetitionId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7)
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
           (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
              (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
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
    ted."wrValue" as "eventId",
    ted1."wrValue" as "eventTypeId",
    ted2."wrValue" as "competitionId",
    tet."wrEventType" as "eventType",
    tc."wrCompetition" as "competition",
    te."wrEventName" as "eventName",
    te."wrEventDate" as "eventDate",
    te."wrRefID" as "refId",
    te."wrIsActive" as "isActive",
    te."wrCountryCode" as "countryCode",
    te."wrTimeZone" as "timeZone",
    te."wrVenue" as "venue"
    from "insert_data" te 
    left join "tblEncryptedData" ted on te."wrEventId" = ted."wrKey"
    left join "tblEncryptedData" ted1 on te."wrEventTypeId" = ted1."wrKey"
    left join "tblEncryptedData" ted2 on te."wrCompetitionId" = ted2."wrKey"
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
          data.eventID,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.countryCode,
          data.timeZone,
          data.venue,
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
        "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
        "wrCompetitionId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
        "wrEventName" = $3,
        "wrEventDate" = $4,
        "wrRefID" = $5,
        "wrIsActive" = $6,
        "wrModifyBy" = $7,
        "wrModifyDate" = now(),
        "wrCountryCode" = $8,
        "wrTimeZone" = $9,
        "wrVenue" = $10
        where "wrEventId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $11)
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
          request.body.eventTypeID,
          request.body.eventTypeName,
          request.body.compititionID,
          request.body.comtitionName,
          request.body.eventID,
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

module.exports = {
  AddUpdateMarket,
  insertEventTypeQuery,
  updateEventTypeQuery,
  insertCompetitionQuery,
  updateCompititionQuery,
  insertEventQuery,
  updateEventQuery,
};

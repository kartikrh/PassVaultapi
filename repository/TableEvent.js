const { errorLogger } = require("../utilities/logger");

const getAllEventsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
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
     from "tblEvents" te 
     left join "tblEncryptedData" ted on te."wrEventId" = ted."wrKey"
     left join "tblEncryptedData" ted1 on te."wrEventTypeId" = ted1."wrKey"
     left join "tblEncryptedData" ted2 on te."wrCompetitionId" = ted2."wrKey"
     left join "tblEventTypes" tet on te."wrEventTypeId" = tet."wrEventTypeId"
     left join "tblCompetitions" tc on te."wrCompetitionId" = tc."wrCompetitionId"
     `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
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
          data.eventDate ? new Date(data.eventDate) : null,
          data.refId,
          data.isActive,
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

const deleteEventQuery = async (eventId, fastify, request) => {
  try {
    return await fastify.db.query(
      `
            delete from "tblEvents" where "wrEventId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))
            `,
      {
        bind: [eventId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEvent/deleteEventQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllEventsQuery,
  insertEventQuery,
  updateEventQuery,
  deleteEventQuery,
};

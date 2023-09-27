const { errorLogger } = require("../utilities/logger");

const allEventTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrValue" as "eventTypeId",
    "wrEventType" as "eventType",
    "wrRefId" as "refId",
    "wrImage" as "image",
    "wrIsActive" as "isActive",
    "wrDisplayOrder" as "displayOrder",
    "wrRemark" as "remark",
      "wrIsHighlight" as "isHighlight"
     from "tblEventTypes" te left join "tblEncryptedData" ed on te."wrEventTypeId" = ed."wrKey"
     order by "wrDisplayOrder" asc`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

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
          data.eventType || null,
          data.refId || null,
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

const deleteEventTypeQuery = async (eventTypeIds, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblEventTypes" where "wrEventTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [eventTypeIds],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventType.js/deleteEventTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateDisplayOrder = async (body, fastify) => {
  try {
    return await fastify.db.query(
      `update "tblEventTypes" set "wrDisplayOrder" = $1 where "wrEventTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $2) `,
      {
        bind: [body.displayOrder, body.eventTypeId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableEventType.js/updateDisplayOrder",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allEventTypesQuery,
  insertEventTypeQuery,
  updateEventTypeQuery,
  deleteEventTypeQuery,
  updateDisplayOrder,
};

const allEventTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrValue" as "eventTypeId",
    "wrEventType" as "eventType",
    "wrRefId" as "refId",
    "wrImage" as "image",
    "wrIsActive" as "isActive",
    "wrIcon" as "icon",
    "wrDisplayOrder" as "displayOrder",
    "wrRemark" as "remark",
    "wrEEventTypeId" as "eEventTypeId",
    "wrERefId" as "eRefId",
    "wrDisplayType" as "displayType",
    "wrIsHighlight" as "isHighlight"
     from "tblEventTypes" te left join "tblEncryptedData" ed on te."wrEventTypeId" = ed."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertEventTypeQuery = async (data, fastify) => {
  const result = await fastify.db.query(
    `with insert_data as(
            insert into "tblEventTypes" ("wrEventType","wrRefId","wrImage","wrIsActive","wrIcon","wrDisplayOrder","wrRemark","wrEEventTypeId","wrERefId","wrDisplayType","wrIsHighlight","wrCreatedDate","wrCreatedBy") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *
        )
        
        select 
        "wrValue" as "eventTypeId",
        "wrEventType" as "eventType",
        "wrRefId" as "refId",
        "wrImage" as "image",
        "wrIsActive" as "isActive",
        "wrIcon" as "icon",
        "wrDisplayOrder" as "displayOrder",
        "wrRemark" as "remark",
        "wrEEventTypeId" as "eEventTypeId",
        "wrERefId" as "eRefId",
        "wrDisplayType" as "displayType",
        "wrIsHighlight" as "isHighlight"
         from insert_data id left join "tblEncryptedData" ed on id."wrEventTypeId" = ed."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.eventType || null,
        data.refId || null,
        data.image || null,
        data.isActive || false,
        data.icon || null,
        data.displayOrder || 0,
        data.remark || null,
        data.eEventTypeId || null,
        data.eRefId || null,
        data.displayType || null,
        data.isHighlight || false,
        new Date(),
        data.userId,
      ],
    }
  );
  return result[0];
};

const updateEventTypeQuery = async (data, fastify) => {
  return await fastify.db.query(
    `Update "tblEventTypes" set "wrEventType" = $1,"wrRefId" = $2,"wrImage" = $3,"wrIsActive" = $4,"wrIcon" = $5,"wrDisplayOrder" = $6,"wrRemark" = $7,"wrEEventTypeId" = $8,"wrERefId" = $9,"wrDisplayType" = $10,"wrIsHighlight" = $11,"wrModifyDate" = $12,"wrModifyBy" = $13 where "wrEventTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $14)`,
    {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        data.eventType,
        data.refId,
        data.image,
        data.isActive,
        data.icon,
        data.displayOrder || 0,
        data.remark,
        data.eEventTypeId,
        data.eRefId,
        data.displayType,
        data.isHighlight,
        new Date(),
        data.userId,
        data.eventTypeId,
      ],
    }
  );
};

const deleteEventTypeQuery = async (eventTypeIds, fastify) => {
  return await fastify.db.query(
    `delete from "tblEventTypes" where "wrEventTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [eventTypeIds],
    }
  );
};

module.exports = {
  allEventTypesQuery,
  insertEventTypeQuery,
  updateEventTypeQuery,
  deleteEventTypeQuery,
};

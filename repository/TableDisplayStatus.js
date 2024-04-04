const { errorLogger } = require("../utilities/logger");

const allDisplayStatusesQuery = async (fastify) => {
  return await fastify.db.query(
    ` select 
    "wrDisplayStatusId" as "displayStatusId",
    "wrDisplayStatus" as "displayStatus",
    "wrIsActive" as "isActive"
    from "tblDisplayStatuses"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertDisplayStatusesQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
          insert into "tblDisplayStatuses" ("wrDisplayStatus","wrIsActive") values ($1,$2) returning *
      )
      select 
      "wrDisplayStatusId" as "displayStatusId",
      "wrDisplayStatus" as "displayStatus",
      "wrIsActive" as "isActive"
      from "insert_data"
      `,
      {
        bind: [data.displayStatus, data.isActive || false],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDisplayStatus/insertDisplayStatusesQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateDisplayStatusesQuery = async (data, fastify, request) => {
  try {
    await fastify.db.query(
      `update "tblDisplayStatuses" set "wrDisplayStatus" = $1, "wrIsActive" = $2 where "wrDisplayStatusId" = $3`,
      {
        bind: [data.displayStatus, data.isActive, data.displayStatusId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDisplayStatus/updateDisplayStatusesQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteDisplayStatusesQuery = async (
  displayStatusId,
  fastify,
  request
) => {
  try {
    return await fastify.db.query(
      `delete from "tblDisplayStatuses" where "wrDisplayStatusId" = ANY($1)`,
      {
        bind: [displayStatusId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableDisplayStatus/deleteDisplayStatusesQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  allDisplayStatusesQuery,
  insertDisplayStatusesQuery,
  updateDisplayStatusesQuery,
  deleteDisplayStatusesQuery,
};

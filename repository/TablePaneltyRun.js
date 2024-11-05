const { errorLogger } = require("../utilities/logger");

const allPaneltyRunsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
      "wrPaneltyId" as "paneltyId",
      "wrRun" as "run",
      "wrDesc" as "desc",
      "wrIsActive" as "isActive"
      from "tblPaneltyRuns"
      where "wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertPaneltyRunQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
        insert into "tblPaneltyRuns" ("wrRun","wrDesc","wrIsActive","wrCreatedDate","wrCreatedBy") values ($1,$2,$3,$4,$5) returning *
    )
    select 
    "wrPaneltyId" as "paneltyId",
    "wrRun" as "run",
    "wrDesc" as "desc",
    "wrIsActive" as "isActive"
    from "insert_data"
    `,
      {
        bind: [
          data.run,
          data.desc || null,
          data.isActive || false,
          new Date(),
          data.userId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePaneltyRun/insertPaneltyRunQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePaneltyRunQuery = async (data, fastify, request) => {
  try {
    await fastify.db.query(
      `update "tblPaneltyRuns" set "wrRun" = $1, "wrDesc" = $2, "wrIsActive" = $3, "wrModifyDate" = $4, "wrModifyBy" = $5 where "wrPaneltyId" = $6`,
      {
        bind: [
          data.run,
          data.desc,
          data.isActive,
          new Date(),
          data.userId,
          data.paneltyId,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePaneltyRun/updatePaneltyRunQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePaneltyRunQuery = async (paneltyId, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblPaneltyRuns" set
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now() 
      where "wrPaneltyId" = ANY($3)`,
      {
        bind: [true, request.userTokenInfo.WrUserId, paneltyId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePaneltyRun/deletePaneltyRunQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allPaneltyRunsQuery,
  insertPaneltyRunQuery,
  updatePaneltyRunQuery,
  deletePaneltyRunQuery,
};

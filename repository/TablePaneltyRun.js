const allPaneltyRunsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
      "wrValue" as "paneltyId",
      "wrRun" as "run",
      "wrDesc" as "desc",
      "wrIsActive" as "isActive"
      from "tblPaneltyRuns" tb inner join "tblEncryptedData" te on tb."wrPaneltyId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertPaneltyRunQuery = async (data, fastify) => {
  const result = await fastify.db.query(
    `with insert_data as(
        insert into "tblPaneltyRuns" ("wrRun","wrDesc","wrIsActive","wrCreatedDate","wrCreatedBy") values ($1,$2,$3,$4,$5) returning *
    )
    select 
    "wrValue" as "paneltyId",
    "wrRun" as "run",
    "wrDesc" as "desc",
    "wrIsActive" as "isActive"
    from "insert_data" tb inner join "tblEncryptedData" te on tb."wrPaneltyId" = te."wrKey"
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
};

const updatePaneltyRunQuery = async (data, fastify) => {
  await fastify.db.query(
    `update "tblPaneltyRuns" set "wrRun" = $1, "wrDesc" = $2, "wrIsActive" = $3, "wrModifyDate" = $4, "wrModifyBy" = $5 where "wrPaneltyId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $6)`,
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
};

const deletePaneltyRunQuery = async (paneltyId, fastify) => {
  return await fastify.db.query(
    `delete from "tblPaneltyRuns" where "wrPaneltyId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      bind: [paneltyId],
      type: fastify.db.QueryTypes.DELETE,
    }
  );
};

module.exports = {
  allPaneltyRunsQuery,
  insertPaneltyRunQuery,
  updatePaneltyRunQuery,
  deletePaneltyRunQuery,
};

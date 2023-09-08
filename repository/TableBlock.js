const getAllBlocksQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT
    "wrValue" as "blockId",
    "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrControlId" as "controlId"
    FROM "tblBlocks" tb inner join "tblEncryptedData" te on tb."wrBlockId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getBlockByIdQuery = async (blockId, fastify) => {
  const data = await fastify.db.query(
    `SELECT
    "wrKey" as "id",
    "wrValue" as "blockId",
    "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrControlId" as "controlId"
    FROM "tblBlocks" tb inner join "tblEncryptedData" te on tb."wrBlockId" = te."wrKey" where "wrValue" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [blockId],
    }
  );

  return data[0];
};

const checkBlockByName = async (body, fastify, option) => {
  let query = `SELECT * FROM "tblBlocks" WHERE "wrBlockName" ilike $1`;
  let params = [body.blockName];

  if (option === "update") {
    query += ` and not "wrBlockId" = $2`;
    params.push(body.wrBlockId);
  }

  const data = await fastify.db.query(query, {
    type: fastify.db.QueryTypes.SELECT,
    bind: params,
  });

  return !!data.length;
};

const insertBlockQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `with insert_data as (
      Insert into "tblBlocks"("wrBlockName","wrIsShowContent","wrContent","wrControlId" , "wrCreatedDate","wrCreatedBy") values ($1,$2,$3,$4,$5,$6) returning *
    )
    select 
    "wrValue" as "blockId",
    "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrControlId" as "controlId" from insert_data tb inner join "tblEncryptedData" te on tb."wrBlockId" = te."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.blockName,
        body.isShowContent,
        body.content || null,
        body.controlId || null,
        new Date(),
        body.userId,
      ],
    }
  );

  return data[0];
};

const updateBlockQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `UPDATE "tblBlocks" set "wrBlockName"=$1 , "wrIsShowContent" = $2 , "wrContent"=$3 , "wrControlId" = $4 where "wrBlockId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5) returning  "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrControlId" as "controlId"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.blockName,
        body.isShowContent,
        body.content,
        body.controlId,
        body.blockId,
      ],
    }
  );

  return data[0];
};

const validateBlockQuery = async (blockId, fastify) => {
  const data = await fastify.db.query(
    `select "wrBlockName" from "tblMenuTypes" left join "tblBlocks" on "tblBlocks"."wrBlockId" = "tblMenuTypes"."wrBlockId"  where "tblMenuTypes"."wrBlockId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and "wrIsActive" = true
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [blockId],
    }
  );

  return data[0];
};

const deleteBlockQuery = async (blockIds, fastify) => {
  return await fastify.db.query(
    `delete from "tblBlocks" where "wrBlockId" in 
    (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1::text[]))`,
    {
      type: fastify.db.Sequelize.QueryTypes.DELETE,
      bind: [blockIds],
    }
  );
};

module.exports = {
  getAllBlocksQuery,
  checkBlockByName,
  insertBlockQuery,
  getBlockByIdQuery,
  updateBlockQuery,
  validateBlockQuery,
  deleteBlockQuery,
};

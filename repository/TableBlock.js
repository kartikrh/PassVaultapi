const { errorLogger } = require("../utilities/logger");

const getAllBlocksQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT
    "wrValue" as "blockId",
    "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrContainerId" as "containerId"
    FROM "tblBlocks" tb inner join "tblEncryptedData" te on tb."wrBlockId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertBlockQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with insert_data as (
      Insert into "tblBlocks"("wrBlockName","wrIsShowContent","wrContent","wrContainerId" , "wrCreatedDate","wrCreatedBy") values ($1,$2,$3,$4,$5,$6) returning *
    )
    select 
    "wrValue" as "blockId",
    "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrContainerId" as "containerId" from insert_data tb inner join "tblEncryptedData" te on tb."wrBlockId" = te."wrKey"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.blockName,
          body.isShowContent,
          body.content || null,
          body.containerId || null,
          new Date(),
          body.userId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBlock.js/insertBlockQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateBlockQuery = async (body, fastify) => {
  try {
    const data = await fastify.db.query(
      `UPDATE "tblBlocks" set "wrBlockName"=$1 , "wrIsShowContent" = $2 , "wrContent"=$3 , "wrContainerId" = $4 where "wrBlockId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5) returning  "wrBlockName" as "blockName",
    "wrIsShowContent" as "isShowContent",
    "wrContent" as "content",
    "wrContainerId" as "containerId"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.blockName,
          body.isShowContent,
          body.content,
          body.containerId,
          body.blockId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBlock.js/updateBlockQuery",
      request
    );
    throw new Error(err.message);
  }
};

const validateBlockQuery = async (blockId, fastify) => {
  try {
    const data = await fastify.db.query(
      `select "wrBlockName" from "tblMenuTypes" left join "tblBlocks" on "tblBlocks"."wrBlockId" = "tblMenuTypes"."wrBlockId"  where "tblMenuTypes"."wrBlockId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and "wrIsActive" = true
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [blockId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBlock.js/validateBlockQuery",
      request
    );

    throw new Error(err.message);
  }
};

const deleteBlockQuery = async (blockIds, fastify) => {
  try {
    return await fastify.db.query(
      `delete from "tblBlocks" where "wrBlockId" in 
    (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1::text[]))`,
      {
        type: fastify.db.Sequelize.QueryTypes.DELETE,
        bind: [blockIds],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBlock.js/deleteBlockQuery",
      request
    );

    throw new Error(err.message);
  }
};

module.exports = {
  getAllBlocksQuery,
  insertBlockQuery,
  updateBlockQuery,
  validateBlockQuery,
  deleteBlockQuery,
};

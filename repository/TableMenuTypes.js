const { errorLogger } = require("../utilities/logger");

const getAllMenuTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT
    te."wrValue" as "menuTypeId",
    t."wrValue" as "blockId",	
    "wrMenuTypeName" as "menuTypeName",
    "wrIsActive" as "isActive",
    "wrNoOfLevel" as "noOfLevel"
    FROM "tblMenuTypes" mt 
    inner join "tblEncryptedData" te on mt."wrMenuTypeId" = te."wrKey"
    inner join "tblEncryptedData" t on mt."wrBlockId" = t."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertMenuTypeQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with insert_data as (
        Insert into "tblMenuTypes"("wrMenuTypeName","wrIsActive","wrNoOfLevel","wrBlockId" , "wrCreatedDate","wrCreatedBy") 
        select $1,$2,$3,(select "wrKey" from "tblEncryptedData" where "wrValue" = $4),$5,$6 returning *
      )
      select 
      "wrValue" as "menuTypeId",
      "wrMenuTypeName" as "menuTypeName",
      "wrIsActive" as "isActive",
      "wrNoOfLevel" as "noOfLevel"
       from insert_data tb inner join "tblEncryptedData" te on tb."wrMenuTypeId" = te."wrKey"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.menuTypeName,
          body.isActive,
          body.noOfLevel,
          body.blockId,
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
      "DB ERROR --> repository/TableMenuType/insertMenuTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatetMenuTypeQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `UPDATE "tblMenuTypes" set "wrMenuTypeName"=$1 , "wrIsActive" = $2 , "wrNoOfLevel"=$3 , "wrBlockId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) , "wrModifyBy"=$5 , "wrModifyDate" = $6 where "wrMenuTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7) returning  
    "wrMenuTypeName" as "menuTypeName",
      "wrIsActive" as "isActive",
      "wrNoOfLevel" as "noOfLevel"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.menuTypeName,
          body.isActive,
          body.noOfLevel,
          body.blockId,
          body.userId,
          new Date(),
          body.menuTypeId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuType/updatetMenuTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const validatMenuTypeQuery = async (menuTypeId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select "wrMenuTypeName" from "tblMenuItems" mi left join "tblMenuTypes" mt on mt."wrMenuTypeId" = mi."wrMenuTypeId"  where mi."wrMenuTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsActive" = true
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [menuTypeId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuType/validatMenuTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteMenuTypeQuery = async (menuTypeIds, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblMenuTypes" where "wrMenuTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1::text[]))
      `,
      {
        type: fastify.db.Sequelize.QueryTypes.DELETE,
        bind: [menuTypeIds],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuType/deleteMenuTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllMenuTypesQuery,
  insertMenuTypeQuery,
  updatetMenuTypeQuery,
  validatMenuTypeQuery,
  deleteMenuTypeQuery,
};

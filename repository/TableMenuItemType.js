const { errorLogger } = require("../utilities/logger");

const getAllMenuItemTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        "wrValue" as "menuItemTypeId",
        "wrMenuItemType" as "menuItemType",
        "wrIsActive" as "isActive"
         from "tblMenuItemTypes" tb inner join "tblEncryptedData" te on tb."wrMenuItemTypeId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertMenuItemTypeQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with insert_data as (
            Insert into "tblMenuItemTypes"("wrMenuItemType","wrIsActive","wrCreatedDate","wrCreatedBy") 
            select $1,$2,$3,$4 returning *
        )
        select 
        "wrValue" as "menuItemTypeId",
        "wrMenuItemType" as "menuItemType",
        "wrIsActive" as "isActive"
         from insert_data tb inner join "tblEncryptedData" te on tb."wrMenuItemTypeId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [body.menuItemType, body.isActive, new Date(), body.userId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuItemType/insertMenuItemTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateMenuItemTypeQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with update_data as (
            Update "tblMenuItemTypes" set "wrMenuItemType" = $1,"wrIsActive" = $2,"wrModifyDate" = $3,"wrModifyBy" = $4 where "wrMenuItemTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $5) returning *
        )
        select 
        "wrValue" as "menuItemTypeId",
        "wrMenuItemType" as "menuItemType",
        "wrIsActive" as "isActive"
         from update_data tb inner join "tblEncryptedData" te on tb."wrMenuItemTypeId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.menuItemType,
          body.isActive,
          new Date(),
          body.userId,
          body.menuItemTypeId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuItemType/updateMenuItemTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const validateMenuItemTypeQuery = async (id, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select mit.* from "tblMenuItems" mi left join "tblMenuItemTypes" mit on mi."wrMenuItemTypeId" = mit."wrMenuItemTypeId"
    where mi."wrMenuItemTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsActive" = true`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [id],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuItemType/validateMenuItemTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteMenuItemTypeQuery = async (ids, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblMenuItemTypes" where "wrMenuItemTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [ids],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuItemType/deleteMenuItemTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllMenuItemTypesQuery,
  insertMenuItemTypeQuery,
  updateMenuItemTypeQuery,
  validateMenuItemTypeQuery,
  deleteMenuItemTypeQuery,
};

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

const menuItemTypeQueryById = async (id, fastify) => {
  const data = await fastify.db.query(
    `select 
            "wrKey" as "id",
            "wrValue" as "menuItemTypeId",
            "wrMenuItemType" as "menuItemType",
            "wrIsActive" as "isActive"
             from "tblMenuItemTypes" tb inner join "tblEncryptedData" te on tb."wrMenuItemTypeId" = te."wrKey" where te."wrValue" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [id],
    }
  );

  return data[0];
};

const checkMenuItemTypeByName = async (body, fastify, option) => {
  let query = `SELECT * FROM "tblMenuItemTypes" WHERE "wrMenuItemType" ilike $1`;
  let params = [body.menuItemType];

  if (option === "update") {
    query += ` and not "wrMenuItemTypeId" = $2`;
    params.push(body.menuItemTypeId);
  }

  const data = await fastify.db.query(query, {
    type: fastify.db.QueryTypes.SELECT,
    bind: params,
  });

  return !!data.length;
};

const insertMenuItemTypeQuery = async (body, fastify) => {
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
};

const updateMenuItemTypeQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `with update_data as (
            Update "tblMenuItemTypes" set "wrMenuItemType" = $1,"wrIsActive" = $2,"wrModifyDate" = $3,"wrModifyBy" = $4 where "wrMenuItemTypeId" = $5 returning *
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
};

const validateMenuItemTypeQuery = async (id, fastify) => {
  const data = await fastify.db.query(
    `select mit.* from "tblMenuItems" mi left join "tblMenuItemTypes" mit on mi."wrMenuItemTypeId" = mit."wrMenuItemTypeId"
    where mi."wrMenuItemTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsActive" = true`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [id],
    }
  );

  return data[0];
};

const deleteMenuItemTypeQuery = async (ids, fastify) => {
  return await fastify.db.query(
    `update "tblMenuItemTypes" set "wrIsActive"=false where "wrMenuItemTypeId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [ids],
    }
  );
};

module.exports = {
  getAllMenuItemTypesQuery,
  menuItemTypeQueryById,
  checkMenuItemTypeByName,
  insertMenuItemTypeQuery,
  updateMenuItemTypeQuery,
  validateMenuItemTypeQuery,
  deleteMenuItemTypeQuery,
};

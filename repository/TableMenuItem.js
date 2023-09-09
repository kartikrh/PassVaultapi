const allMenuItemsQuery = async (fastify) => {
  return await fastify.db.query(
    `Select
    et."wrValue" as "menuItemId",
    et2."wrValue" as "menuTypeId",
    et3."wrValue" as "pageId",
    et4."wrValue" as "parentId",
    "wrMenuItem" as "menuItem",
    "wrDisplayOrder" as "displayOrder",
    "wrIsActive" as "isActive",
    et5."wrValue" as "menuItemTypeId"
     from "tblMenuItems" mi 
    left join "tblEncryptedData" et on mi."wrMenuItemId"=et."wrKey" 
    left join "tblEncryptedData" et2 on mi."wrMenuTypeId"=et2."wrKey"
    left join "tblEncryptedData" et3 on mi."wrPageId"=et3."wrKey"
    left join "tblEncryptedData" et4 on mi."wrParentId"=et4."wrKey"
    left join "tblEncryptedData" et5 on mi."wrMenuItemTypeId"=et5."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const menuItemByIdQuery = async (menuItemId, fastify) => {
  const data = await fastify.db.query(
    `Select
        et."wrKey" as "id",
        et."wrValue" as "menuItemId",
        et2."wrValue" as "menuTypeId",
        et3."wrValue" as "pageId",
        et4."wrValue" as "parentId",
        et4."wrKey" as "pId",
        "wrMenuItem" as "menuItem",
        "wrDisplayOrder" as "displayOrder",
        "wrIsActive" as "isActive",
        et5."wrValue" as "menuItemTypeId"
         from "tblMenuItems" mi 
        left join "tblEncryptedData" et on mi."wrMenuItemId"=et."wrKey" 
        left join "tblEncryptedData" et2 on mi."wrMenuTypeId"=et2."wrKey"
        left join "tblEncryptedData" et3 on mi."wrPageId"=et3."wrKey"
        left join "tblEncryptedData" et4 on mi."wrParentId"=et4."wrKey"
        left join "tblEncryptedData" et5 on mi."wrMenuItemTypeId"=et5."wrKey" where et."wrValue"= $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [menuItemId],
    }
  );

  return data[0];
};

const createMenuItemQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `
  with count_parent as (
    select count(*) as count from "tblMenuItems" where "wrParentId" = (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3), 0))
  ),
  add_data as (
    INSERT INTO "tblMenuItems" ("wrMenuTypeId" , "wrMenuItem","wrParentId","wrPageId","wrMenuItemTypeId","wrDisplayOrder","wrIsActive","wrCreatedBy","wrCreatedDate") values(
      (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      $2,
      (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3), 0)),
      (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
      (select "wrKey" from "tblEncryptedData" where "wrValue" = $5),
      (select count from count_parent)+1,$6,$7,$8 
    ) RETURNING *
  )

  select 
    et."wrValue" as "menuItemId",
    et2."wrValue" as "menuTypeId",
    et3."wrValue" as "pageId",
    et4."wrValue" as "parentId",
    "wrMenuItem" as "menuItem",
    "wrDisplayOrder" as "displayOrder",
    "wrIsActive" as "isActive",
    et5."wrValue" as "menuItemTypeId"
     from add_data mi 
    left join "tblEncryptedData" et on mi."wrMenuItemId"=et."wrKey" 
    left join "tblEncryptedData" et2 on mi."wrMenuTypeId"=et2."wrKey"
    left join "tblEncryptedData" et3 on mi."wrPageId"=et3."wrKey"
    left join "tblEncryptedData" et4 on mi."wrParentId"=et4."wrKey"
    left join "tblEncryptedData" et5 on mi."wrMenuItemTypeId"=et5."wrKey"
  `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.menuTypeId,
        body.menuItem,
        body.parentId,
        body.pageId,
        body.menuItemTypeId,
        body.isActive,
        body.userId,
        new Date(),
      ],
    }
  );

  return data[0];
};

const updateMenuItemQuery = async (body, fastify) => {
  return await fastify.db.query(
    `
    Update "tblMenuItems" set "wrMenuItem" = $1 , 
                          "wrMenuTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2) ,
                           "wrPageId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3) , 
                           "wrMenuItemTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $4) , 
                           "wrParentId" =  (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $5), 0)) ,
                           "wrIsActive" = $6, "wrModifyBy" = $7 , "wrModifyDate" = $8 where "wrMenuItemId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $9) RETURNING *`,
    {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [
        body.menuItem,
        body.menuTypeId,
        body.pageId,
        body.menuItemTypeId,
        body.parentId,
        body.isActive,
        body.userId,
        new Date(),
        body.menuItemId,
      ],
    }
  );
};

const validateMenuItemQuery = async (menuItemId, fastify) => {
  const data = await fastify.db.query(
    `select mi.* from "tblPageAliases" pa left join "tblMenuItems" mi on pa."wrMenuItemId" = mi."wrMenuItemId" where pa."wrMenuItemId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [menuItemId],
    }
  );

  return data[0];
};

const findMenuItemByParentId = async (parentId, fastify) => {
  const data = await fastify.db.query(
    `select mi.* from "tblMenuItems" mi where mi."wrParentId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [parentId],
    }
  );

  return !!data.lenght;
};

const deleteMenuItemQuery = async (menuItemId, fastify) => {
  return await fastify.db.query(
    `
    delete from "tblMenuItems" where "wrMenuItemId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY ($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [menuItemId],
    }
  );
};

module.exports = {
  allMenuItemsQuery,
  menuItemByIdQuery,
  createMenuItemQuery,
  updateMenuItemQuery,
  validateMenuItemQuery,
  deleteMenuItemQuery,
  findMenuItemByParentId,
};

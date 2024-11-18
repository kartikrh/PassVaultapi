const { errorLogger } = require("../utilities/logger");

const allMenuItemsQuery = async (fastify) => {
  return await fastify.db.query(
    `WITH ChildCount AS (
      SELECT 
        "wrParentId" as "parentId",
        CAST(COUNT(*) AS INTEGER) as "childCount"
      FROM 
        "tblMenuItems"
      WHERE "wrIsDeleted" = false
      GROUP BY "wrParentId"
    )
    SELECT 
      et."wrValue" as "menuItemId",
      et2."wrValue" as "menuTypeId",
      et3."wrValue" as "pageId",
      COALESCE(et4."wrValue" , '0') AS "parentId",
      "wrMenuItem" as "menuItem",
      "wrDisplayOrder" as "displayOrder",
      "wrIsActive" as "isActive",
      COALESCE(cc."childCount", 0) as "childCount"
    FROM
      "tblMenuItems" mi
    LEFT JOIN 
      "tblEncryptedData" et ON mi."wrMenuItemId" = et."wrKey"
    LEFT JOIN
      "tblEncryptedData" et2 ON mi."wrMenuTypeId" = et2."wrKey"
    LEFT JOIN
      "tblEncryptedData" et3 ON mi."wrPageId" = et3."wrKey"
    LEFT JOIN
      "tblEncryptedData" et4 ON mi."wrParentId" = et4."wrKey"
    LEFT JOIN
      ChildCount cc ON mi."wrMenuItemId" = cc."parentId"    
    WHERE mi."wrIsDeleted" = false
    ORDER BY "wrDisplayOrder" ASC
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const updateDisplayOrderQuery = async (data, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblMenuItems" SET "wrDisplayOrder" = $1 WHERE "wrMenuItemId" = (SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $2)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.displayOrder, data.menuItemId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuItem/updateDisplayOrderQuery",
      request
    );
    throw new Error(err.message);
  }
}
const menuItemByIdQuery = async (menuItemId, fastify, request) => {
  try {
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
        left join "tblEncryptedData" et5 on mi."wrMenuItemTypeId"=et5."wrKey" 
        where et."wrValue"= $1 and mi."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [menuItemId],
      }
    );

    return data[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/menuItemByIdQuery",
      request
    );
    throw new Error(error);
  }
};

const createMenuItemQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `
  with count_parent as (
    select count(*) as count from "tblMenuItems" where 
    "wrParentId" = (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3), 0))
    AND
    "wrMenuTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) 
    AND "wrIsDeleted" = false
  ),
  add_data as (
    INSERT INTO "tblMenuItems" ("wrMenuTypeId" , "wrMenuItem","wrParentId","wrPageId","wrDisplayOrder","wrIsActive","wrCreatedBy","wrCreatedDate") values(
      (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
      $2,
      (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $3), 0)),
      (select "wrKey" from "tblEncryptedData" where "wrValue" = $4),
      (select count from count_parent)+1,$5,$6,$7
    ) RETURNING *
  )

  select 
    et."wrValue" as "menuItemId",
    et2."wrValue" as "menuTypeId",
    et3."wrValue" as "pageId",
    COALESCE(et4."wrValue", '0') as "parentId",
    "wrMenuItem" as "menuItem",
    "wrDisplayOrder" as "displayOrder",
    "wrIsActive" as "isActive"
     from add_data mi 
    left join "tblEncryptedData" et on mi."wrMenuItemId"=et."wrKey" 
    left join "tblEncryptedData" et2 on mi."wrMenuTypeId"=et2."wrKey"
    left join "tblEncryptedData" et3 on mi."wrPageId"=et3."wrKey"
    left join "tblEncryptedData" et4 on mi."wrParentId"=et4."wrKey"

  `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.menuTypeId,
          body.menuItem,
          body.parentId,
          body.pageId || null,
          // body.menuItemTypeId,
          body.isActive || false,
          body.userId,
          new Date(),
        ],
      }
    );

    return data[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/createMenuItemQuery",
      request
    );
    throw new Error(error.message);
  }
};

const updateMenuItemQuery = async (body, fastify, request) => {
  try {
    return await fastify.db.query(
      `
    Update "tblMenuItems" set "wrMenuItem" = $1 , 
                          "wrMenuTypeId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2) ,
                           "wrPageId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3) , 
                           "wrParentId" =  (SELECT COALESCE((SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = $4), 0)) ,
                           "wrIsActive" = $5, "wrModifyBy" = $6 , "wrModifyDate" = now() where "wrMenuItemId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7) RETURNING *`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          body.menuItem,
          body.menuTypeId,
          body.pageId,
          body.parentId,
          body.isActive,
          body.userId,
          body.menuItemId
        ],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/updateMenuItemQuery",
      request
    );
    throw new Error(error.message);
  }
};

const validateMenuItemQuery = async (menuItemId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select mi.* from "tblPageAliases" pa left join "tblMenuItems" mi on pa."wrMenuItemId" = mi."wrMenuItemId" 
      where pa."wrMenuItemId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and pa."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [menuItemId],
      }
    );

    return data[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/validateMenuItemQuery",
      request
    );
    throw new Error(error.message);
  }
};

const findMenuItemByParentId = async (parentId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select mi.* from "tblMenuItems" mi 
      where mi."wrParentId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [parentId],
      }
    );
    return data.length > 0 ? true : false;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/findMenuItemByParentId",
      request
    );
    throw new Error(error.message);
  }
};

const deleteMenuItemQuery = async (menuItemId, fastify, request) => {
  try {
    return await fastify.db.query(
      `
    update "tblMenuItems" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
    where "wrMenuItemId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY ($3))`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, menuItemId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableMenuItem/deleteMenuItemQuery",
      request
    );
    throw new Error(error.message);
  }
};
const updateMenuItemStatusQuery = async (data,request,fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblMenuItems" set "wrIsActive" = $1 , "wrModifyBy"=$2 , "wrModifyDate" = now()
       where "wrMenuItemId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $3)`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.isActive,
          data.userId,
          data.menuItemId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMenuType/updateMenuItemStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  allMenuItemsQuery,
  menuItemByIdQuery,
  createMenuItemQuery,
  updateMenuItemQuery,
  validateMenuItemQuery,
  deleteMenuItemQuery,
  findMenuItemByParentId,
  updateMenuItemStatusQuery,
  updateDisplayOrderQuery
};

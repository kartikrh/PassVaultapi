async function createTabsQuery(body, fastify) {
  const data = await fastify.db.query(
    `
      with count_parent as (
        select count(*) as count from "tblTabs" where "wrParentId" = $5 and "wrIsDeleted" = false
      ),
      add_data as (
        INSERT INTO "tblTabs" ("wrTabName", "WrDisplayName", "wrDisplayType", "wrWebPage", "wrParentId", "wrIsActive", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrIsView", "wrAddWebpage", "wrIsMenu", "wrIconName", "wrDisplayOrder")
        select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, (select count from count_parent)+1 returning * 
      )

      select
      et."wrValue" as "encryptedTabId",
      "wrTabName" as "tabName",
      "WrDisplayName" as  "displayName",
      "wrDisplayType" as "displayType",
      "wrWebPage" as "webPage",
      "wrParentId" as "parentId",
      "wrIsActive" as "isActive",
      "wrIsAdd" as "isAdd",
      "wrIsEdit" as "isEdit",
      "wrIsDelete" as "isDelete",
      "wrIsView" as "isView",
      "wrAddWebpage" as "addWebpage",
      "wrIsMenu" as "isMenu",
      "wrIconName" as "iconName",
      "wrDisplayOrder" as "displayOrder"
      from add_data a inner join "tblEncryptedData" et on a."wrTabId"=et."wrKey"
     `,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [
        body.wrTabName,
        body.WrDisplayName,
        body.wrDisplayType,
        body.wrWebPage,
        body.wrParentId,
        body.wrIsActive,
        body.wrIsAdd,
        body.wrIsEdit,
        body.wrIsDelete,
        body.wrIsView,
        body.wrAddWebpage,
        body.wrIsMenu,
        body.wrIconName,
      ],
    }
  );

  return data[0];
}

async function getTabsQuery(fastify, body) {
  return await fastify.db.query(
    `with disable_tab as (
      select et."wrValue" from "tblEncryptedData" et
       left join "tblTabs" t on  t."wrTabId" = et."wrKey" where "wrIsActive" = false
     )
     SELECT 
           t."wrTabName" as "tabName",
           t."WrDisplayName" as  "displayName",
           t."wrDisplayType" as "displayType",
           t."wrWebPage" as "webPage",
           t."wrParentId" as "parentId",
           t."wrIsActive" as "isActive",
           t."wrIsAdd" as "isAdd",
           t."wrIsEdit" as "isEdit",
           t."wrIsDelete" as "isDelete",
           t."wrIsView" as "isView",
           t."wrAddWebpage" as "addWebpage",
           t."wrIsMenu" as "isMenu",
           t."wrIconName" as "iconName",
           t."wrDisplayOrder" as "displayOrder",
           et."wrValue" as "encryptedTabId"
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey" 
           left join (select * from "tblPermissions" where "wrRoleId" = $2) p on p."wrTabId" = t."wrTabId"
         where t."wrIsActive" = true 
         and t."wrParentId" not in ( select * from disable_tab) 
         and t."wrDisplayType" = ANY($1)
         and p."wrIsView" = true
         and t."wrIsDeleted" = false
         `,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [body.displayType, body.roleId],
    }
  );
}

async function getTabsByRoleIDQuery(fastify, body) {
  return await fastify.db.query(
    `with disable_tab as (
      select et."wrValue" from "tblEncryptedData" et
       left join "tblTabs" t on  t."wrTabId" = et."wrKey" where "wrIsActive" = false
     )
     SELECT 
           t."wrTabName" as "tabName",
           t."WrDisplayName" as  "displayName",
           t."wrDisplayType" as "displayType",
           t."wrWebPage" as "webPage",
           t."wrParentId" as "parentId",
           t."wrIsActive" as "isActive",
           t."wrIsAdd" as "isAdd",
           t."wrIsEdit" as "isEdit",
           t."wrIsDelete" as "isDelete",
           t."wrIsView" as "isView",
           t."wrAddWebpage" as "addWebpage",
           t."wrIsMenu" as "isMenu",
           t."wrIconName" as "iconName",
           t."wrDisplayOrder" as "displayOrder",
           et."wrValue" as "encryptedTabId"
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey" 
           left join (select * from "tblPermissions" where "wrRoleId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)) p on p."wrTabId" = t."wrTabId"
         where t."wrIsActive" = $3 AND t."wrParentId" not in ( select * from disable_tab) 
         and t."wrDisplayType" = ANY($1) and t."wrIsDeleted" = false
         `,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [body.displayType, body.roleId, body.isActive],
    }
  );
}
async function getTabsByPerentIdQuery(fastify, body) {
  return await fastify.db.query(
    `SELECT 
     t."wrTabName" as "tabName",
     t."WrDisplayName" as  "displayName",
     t."wrDisplayType" as "displayType",
     t."wrWebPage" as "webPage",
     t."wrParentId" as "parentId",
     t."wrIsActive" as "isActive",
     t."wrIsAdd" as "isAdd",
     t."wrIsEdit" as "isEdit",
     t."wrIsDelete" as "isDelete",
     t."wrIsView" as "isView",
     t."wrAddWebpage" as "addWebpage",
     t."wrIsMenu" as "isMenu",
     t."wrIconName" as "iconName",
     t."wrDisplayOrder" as "displayOrder",
     et."wrValue" as "encryptedTabId"
     from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey" 
     left join (select * from "tblPermissions" where "wrRoleId" = $4) p on p."wrTabId" = t."wrTabId"
     where t."wrIsActive" = $3 AND t."wrParentId" = $2
     and t."wrDisplayType" = ANY($1) and t."wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [body.displayType, body.parentId, body.isActive, body.roleId],
    }
  );
}
async function getAllActiveInactiveTabsQuery(fastify) {
  return await fastify.db.query(
    `SELECT 
           t."wrTabName" as "tabName",
           t."WrDisplayName" as  "displayName",
           t."wrDisplayType" as "displayType",
           t."wrWebPage" as "webPage",
           t."wrParentId" as "parentId",
           t."wrIsActive" as "isActive",
           t."wrIsAdd" as "isAdd",
           t."wrIsEdit" as "isEdit",
           t."wrIsDelete" as "isDelete",
           t."wrIsView" as "isView",
           t."wrAddWebpage" as "addWebpage",
           t."wrIsMenu" as "isMenu",
           t."wrIconName" as "iconName",
           t."wrDisplayOrder" as "displayOrder",
           et."wrValue" as "encryptedTabId"
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"
           where t."wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
    }
  );
}

async function getDisplayTabsQuery(type, fastify) {
  return await fastify.db.query(
    `SELECT 
           t."wrTabName" as "tabName",
           t."WrDisplayName" as  "displayName",
           t."wrDisplayType" as "displayType",
           t."wrWebPage" as "webPage",
           t."wrParentId" as "parentId",
           t."wrIsActive" as "isActive",
           t."wrIsAdd" as "isAdd",
           t."wrIsEdit" as "isEdit",
           t."wrIsDelete" as "isDelete",
           t."wrIsView" as "isView",
           t."wrAddWebpage" as "addWebpage",
           t."wrIsMenu" as "isMenu",
           t."wrIconName" as "iconName",
           t."wrDisplayOrder" as "displayOrder",
           et."wrValue" as "encryptedTabId"
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where t."wrDisplayType" = $1
           and t."wrIsDeleted" = false
         `,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [type],
    }
  );
}

async function hasAssociatedChildern(Id, fastify) {
  const data = await fastify.db.query(
    `with table_data as (
      SELECT * from "tblTabs"
       t inner join "tblEncryptedData" et 
       on t."wrTabId"=et."wrKey" where "wrParentId" = $1 and "wrIsActive" = true and t."wrIsDeleted" = false
     )
     select "tblTabs"."wrTabName" from "tblEncryptedData"
     inner join "tblTabs" on "tblTabs"."wrTabId"="tblEncryptedData"."wrKey" where 
     "wrValue" in (select "wrParentId" from table_data )`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data;
}

async function deleteTabsQuery(Id, fastify, request) {
  await fastify.db.query(
    `update "tblTabs" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
    where "wrTabId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($3))
    `,
    {
      type: fastify.db.Sequelize.QueryTypes.UPDATE,
      bind: [true, request.userTokenInfo.WrUserId, Id],
    }
  );
}

async function getSpecificTabsQuery(Id, fastify) {
  const data = await fastify.db.query(
    `SELECT 
    t."wrTabName" as "tabName",
    t."WrDisplayName" as  "displayName",
    t."wrDisplayType" as "displayType",
    t."wrWebPage" as "webPage",
    t."wrParentId" as "parentId",
    t."wrIsActive" as "isActive",
    t."wrIsAdd" as "isAdd",
    t."wrIsEdit" as "isEdit",
    t."wrIsDelete" as "isDelete",
    t."wrIsView" as "isView",
    t."wrAddWebpage" as "addWebpage",
    t."wrIsMenu" as "isMenu",
    t."wrIconName" as "iconName",
    t."wrDisplayOrder" as "displayOrder",
    et."wrValue" as "encryptedTabId"
    from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where et."wrValue" = $1 and t."wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data[0];
}

async function getTabInfoQuery(Id, fastify) {
  const data = await fastify.db.query(
    `SELECT t.* from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where et."wrValue" = $1 and t."wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data[0];
}

async function updateTabQuery(tabId, req, fastify) {
  const columnMapping = {
    tabName: "wrTabName",
    displayName: "WrDisplayName",
    displayType: "wrDisplayType",
    webPage: "wrWebPage",
    parentId: "wrParentId",
    isActive: "wrIsActive",
    isAdd: "wrIsAdd",
    isEdit: "wrIsEdit",
    isDelete: "wrIsDelete",
    isView: "wrIsView",
    addWebpage: "wrAddWebpage",
    isMenu: "wrIsMenu",
    iconName: "wrIconName",
    displayOrder: "wrDisplayOrder",
  };

  const updateColumns = [];
  const updateValues = [];

  for (const key in req.body) {
    if (columnMapping[key] !== undefined) {
      updateColumns.push(
        `"${columnMapping[key]}" = $${updateColumns.length + 1}`
      );
      updateValues.push(req.body[key]);
    }
  }

  updateValues.push(tabId);

  const data = await fastify.db.query(
    `UPDATE "tblTabs" SET ${updateColumns.join(", ")} WHERE "wrTabId" = $${
      updateValues.length
    } RETURNING 
    "wrTabId" as "encryptedTabId",
    "wrTabName" as "tabName",
    "WrDisplayName" as  "displayName",
    "wrDisplayType" as "displayType",
    "wrWebPage" as "webPage",
    "wrParentId" as "parentId",
    "wrIsActive" as "isActive",
    "wrIsAdd" as "isAdd",
    "wrIsEdit" as "isEdit",
    "wrIsDelete" as "isDelete",
    "wrIsView" as "isView",
    "wrAddWebpage" as "addWebpage",
    "wrIsMenu" as "isMenu",
    "wrIconName" as "iconName",
    "wrDisplayOrder" as "displayOrder"`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: updateValues,
    }
  );

  return data[0];
}

async function changeDisplayOrderOfMovingTabQuery(body, fastify) {
  return await fastify.db.query(
    `update "tblTabs" set "wrDisplayOrder" = $1 where "wrTabId" = $2 `,
    {
      bind: [body.order, body.tabId],
    }
  );
}

async function validateTabByNameQuery(body, fastify, option) {
  let query = `select * from "tblTabs" where "wrParentId" = $1 and "wrTabName" ilike $2 and "wrIsDeleted" = false`;
  let params = [body.wrParentId, body.wrTabName];

  if (option === "update") {
    query += ` and not "wrTabId" = $3`;
    params.push(body.wrTabId);
  }

  return await fastify.db.query(query, {
    type: fastify.db.Sequelize.QueryTypes.SELECT,
    bind: params,
  });
}

async function getMaxDispalyOrderByParent(parentId, fastify) {
  const data = await fastify.db.query(
    `SELECT MAX("wrDisplayOrder") from "tblTabs" where "wrParentId" = $1 AND "wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [parentId],
    }
  );

  return data?.[0]?.max || 0;
}

async function validateAllTabIdsQuery(body, fastify) {
  return await fastify.db.query(
    `SELECT t.* from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where et."wrValue" = ANY($1::varchar[]) AND t."wrIsDeleted" = false`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [body],
    }
  );
}

async function updateDisplayOrder(body, fastify) {
  return await fastify.db.query(
    `update "tblTabs" set "wrDisplayOrder" = $1 where "wrTabId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $2) `,
    {
      bind: [body.displayOrder, body.tabId],
    }
  );
}

async function getUserWisePermisionQuery(fastify, body) {
  return await fastify.db.query(
    `SELECT
    et."wrValue" as "encryptedPermissionId",
    T."wrTabName" AS "tabName",
    T."WrDisplayName" AS   "displayName",
    T."wrDisplayType" as "displayType",
    T."wrWebPage" as "webPage",
    T."wrParentId" as "parentId",
    P."wrIsAdd" AS "isAdd",
    P."wrIsEdit" AS "isEdit",
    P."wrIsDelete" AS "isDelete",
    P."wrIsView" AS "isView",
    T."wrAddWebpage" as "addWebpage",
    T."wrIsMenu" as "isMenu",
    T."wrIconName" as "iconName",
    T."wrDisplayOrder" as "displayOrder"
      FROM "tblPermissions" P
      INNER JOIN "tblEncryptedData" et on P."wrPermissionId" = et."wrKey" 
      INNER JOIN "tblTabs" T ON P."wrTabId" = T."wrTabId"
      WHERE
          P."wrRoleId" = $1
          AND P."wrIsView" = TRUE
          AND P."wrIsDeleted" = false
          AND T."wrIsDeleted" = false;`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [body.roleId],
    }
  );
}

async function getChildCountQuery(body ,fastify) {
  return await fastify.db.query(
    `SELECT 
    "wrParentId",
    CAST(COUNT("wrTabId") as integer) AS childCount
    FROM
        "tblTabs"
    WHERE
        "wrIsActive" = true
            AND "wrParentId" = ANY ($1) AND "wrIsDeleted" = false
    GROUP BY "wrParentId";`,
        {
          type: fastify.db.Sequelize.QueryTypes.SELECT,
          bind: [body.ids],
        }
  );
}
module.exports = {
  getTabsQuery,
  createTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  getDisplayTabsQuery,
  hasAssociatedChildern,
  changeDisplayOrderOfMovingTabQuery,
  validateTabByNameQuery,
  getMaxDispalyOrderByParent,
  getAllActiveInactiveTabsQuery,
  validateAllTabIdsQuery,
  updateDisplayOrder,
  getTabsByRoleIDQuery,
  getTabsByPerentIdQuery,
  getUserWisePermisionQuery,
  getChildCountQuery
};

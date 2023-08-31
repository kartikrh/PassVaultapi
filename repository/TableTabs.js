async function createTabsQuery(body, fastify) {
  const data = await fastify.db.query(
    `
      with count_parent as (
        select count(*) as count from "tblTabs" where "wrParentId" = $5
      ),
      add_data as (
        INSERT INTO "tblTabs" ("wrTabName", "WrDisplayName", "wrDisplayType", "wrWebPage", "wrParentId", "wrIsActive", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrIsView", "wrAddWebpage", "wrIsMenu", "wrIconName", "wrDisplayOrder")
        select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, (select count from count_parent)+1 returning * 
      )

      select
      et."wrValue" as "tabId",
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

async function getTabsQuery(fastify) {
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
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where t."wrIsActive" = true 
         and t."wrParentId" not in ( select * from disable_tab)`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
    }
  );
}

async function getDisplayTabsQuery(type, fastify) {
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
           from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where t."wrIsActive" = true 
         and t."wrParentId" not in ( select * from disable_tab)
         and t."wrDisplayType" = $1
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
       on t."wrTabId"=et."wrKey" where "wrParentId" = $1 and "wrIsActive" = true
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

async function deleteTabsQuery(Id, fastify) {
  await fastify.db.query(
    `
    with tab_id as (
      select "wrKey" from "tblEncryptedData" where "wrValue" = $1
    )

    update "tblTabs" set "wrIsActive" = false where "wrTabId" in (select "wrKey" from tab_id)
    `,
    {
      type: fastify.db.Sequelize.QueryTypes.UPDATE,
      bind: [Id],
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
    from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where t."wrIsActive" = true and et."wrValue" = $1`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data[0];
}

async function getTabInfoQuery(Id, fastify) {
  const data = await fastify.db.query(
    `SELECT t.* from "tblTabs" t inner join "tblEncryptedData" et on t."wrTabId"=et."wrKey"  where et."wrValue" = $1`,
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
    "wrTabId" as "tabId",
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
async function findTabsByParentId(parentId, fastify) {
  return await fastify.db.query(
    ` SELECT * from "tblTabs" where "wrIsActive" = true and "wrParentId" = $1 order by "wrDisplayOrder" asc`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [parentId],
    }
  );
}

async function validateTabByNameQuery(body, fastify, option) {
  let query = `select * from "tblTabs" where "wrParentId" = $1 and "wrTabName" ilike $2`;
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
    `SELECT MAX("wrDisplayOrder") from "tblTabs" where "wrParentId" = $1`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [parentId],
    }
  );

  return data?.[0]?.max || 0;
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
  findTabsByParentId,
  validateTabByNameQuery,
  getMaxDispalyOrderByParent,
};

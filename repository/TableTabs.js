async function createTabsQuery(body, fastify) {
  const data = await fastify.db.query(
    `
      with count_parent as (
        select count(*) as count from "tblTabs" where "wrParentId" = $5
      )
      INSERT INTO "tblTabs" ("wrTabName", "WrDisplayName", "wrDisplayType", "wrWebPage", "wrParentId", "wrIsActive", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrIsView", "wrAddWebpage", "wrIsMenu", "wrIconName", "wrDisplayOrder")
      select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, (select count from count_parent)+1 returning 
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

async function encryptTabsQuery(body, fastify) {
  await fastify.db.query(
    `INSERT INTO "tblEncryptedTabs" ("wrTabId", "wrEncryptedTabId","createdAt","updatedAt") VALUES ($1, $2,$3,$3)`,
    {
      type: fastify.db.Sequelize.QueryTypes.INSERT,
      bind: [body.wrTabId, body.wrEncryptedTabId, new Date()],
    }
  );
}

async function getTabsQuery(fastify) {
  return await fastify.db.query(
    `with disable_tab as (
      select et."wrEncryptedTabId" from "tblEncryptedTabs" et
       left join "tblTabs" t on  t."wrTabId" = et."wrTabId" where "wrIsActive" = false
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
           et."wrEncryptedTabId" as "encryptedTabId"
           from "tblTabs" t left join "tblEncryptedTabs" et on t."wrTabId"=et."wrTabId"  where t."wrIsActive" = true 
         and t."wrParentId" not in ( select * from disable_tab)`,
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
      et."wrEncryptedTabId" as "encryptedTabId"
      from "tblTabs" t left join "tblEncryptedTabs" et on t."wrTabId"=et."wrTabId"  where t."wrIsActive" = true
      and t."wrDisplayType" = $1
       and t."wrParentId" not in (SELECT "wrEncryptedTabId" from "tblEncryptedTabs" where t."wrIsActive" = false )`,
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
       t left join "tblEncryptedTabs" et 
       on t."wrTabId"=et."wrTabId" where "wrParentId" = $1 and "wrIsActive" = true
     )
     select "tblTabs"."wrTabName" from "tblEncryptedTabs"
     left join "tblTabs" on "tblTabs"."wrTabId"="tblEncryptedTabs"."wrTabId" where 
     "wrEncryptedTabId" in (select "wrParentId" from table_data )`,
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
      select "wrTabId" from "tblEncryptedTabs" where "wrEncryptedTabId" = $1
    )

    update "tblTabs" set "wrIsActive" = false where "wrTabId" in (select "wrTabId" from tab_id)
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
    et."wrEncryptedTabId" as "encryptedTabId"
    from "tblTabs" t left join "tblEncryptedTabs" et on t."wrTabId"=et."wrTabId"  where t."wrIsActive" = true and et."wrEncryptedTabId" = $1`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data[0];
}

async function getTabInfoQuery(Id, fastify) {
  const data = await fastify.db.query(
    `SELECT t.* from "tblTabs" t left join "tblEncryptedTabs" et on t."wrTabId"=et."wrTabId"  where t."wrIsActive" = true and et."wrEncryptedTabId" = $1`,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [Id],
    }
  );

  return data[0];
}

async function updateTabQuery(tabId, req, fastify) {
  const data = await fastify.db.query(
    `UPDATE "tblTabs" SET "wrTabName" = $1, "WrDisplayName" = $2, "wrDisplayType" = $3, "wrWebPage" = $4, "wrParentId" = $5, "wrIsActive" = $6, "wrIsAdd" = $7, "wrIsEdit" = $8, "wrIsDelete" = $9, "wrIsView" = $10, "wrAddWebpage" = $11, "wrIsMenu" = $12, "wrIconName" = $13  WHERE "wrTabId" = $14 RETURNING 
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
    "wrDisplayOrder" as "displayOrder"
    `,
    {
      type: fastify.db.Sequelize.QueryTypes.SELECT,
      bind: [
        req.body.tabName,
        req.body.displayName,
        req.body.displayType,
        req.body.webPage,
        req.body.parentId,
        req.body.isActive,
        req.body.isAdd,
        req.body.isEdit,
        req.body.isDelete,
        req.body.isView,
        req.body.addWebpage,
        req.body.isMenu,
        req.body.iconName,
        tabId,
      ],
    }
  );

  return data[0];
}

module.exports = {
  getTabsQuery,
  createTabsQuery,
  encryptTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  getDisplayTabsQuery,
  hasAssociatedChildern,
};

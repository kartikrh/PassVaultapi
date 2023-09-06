const allPageAliases = async (fastify) => {
  return await fastify.db.query(
    `select 
    et."wrValue" as "pageAliasId",
    et2."wrValue" as "menuItemId",
    et3."wrValue" as "pageId",
    et."wrKey" as "id",
    "wrPageName" as "pageName",
    "wrPageTitle" as "pageTitle",
    "wrAlias" as "alias"
    from "tblPageAliases" pa 
    left join "tblEncryptedData" et on pa."wrPageAliasId"=et."wrKey" 
    left join "tblEncryptedData" et2 on pa."wrMenuItemId"=et2."wrKey" 
    left join "tblEncryptedData" et3 on pa."wrPageId"=et3."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const pageAliasById = async (pageAliasId, fastify) => {
  const data = await fastify.db.query(
    `select 
        et."wrValue" as "pageAliasId",
        et2."wrValue" as "menuItemId",
        et3."wrValue" as "pageId",
        et."wrKey" as "id",
        "wrPageName" as "pageName",
        "wrPageTitle" as "pageTitle",
        "wrAlias" as "alias"
        from "tblPageAliases" pa 
        left join "tblEncryptedData" et on pa."wrPageAliasId"=et."wrKey" 
        left join "tblEncryptedData" et2 on pa."wrMenuItemId"=et2."wrKey" 
        left join "tblEncryptedData" et3 on pa."wrPageId"=et3."wrKey" where et."wrValue" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [pageAliasId],
    }
  );

  return data[0];
};

const insertPageAliasQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `with insert_data as (
            INSERT INTO "tblPageAliases" ("wrMenuItemId","wrPageId" , "wrPageTitle" ,"wrPageName" , "wrCreatedDate","wrCreatedBy","wrAlias") values ($1,$2,$3,$4,$5,$6,$7) returning *
        )
        select 
        et."wrValue" as "pageAliasId",
        et2."wrValue" as "menuItemId",
        et3."wrValue" as "pageId",
        "wrPageName" as "pageName",
        "wrPageTitle" as "pageTitle",
        "wrAlias" as "alias"
        from insert_data pa 
        left join "tblEncryptedData" et on pa."wrPageAliasId"=et."wrKey" 
        left join "tblEncryptedData" et2 on pa."wrMenuItemId"=et2."wrKey" 
        left join "tblEncryptedData" et3 on pa."wrPageId"=et3."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.menuItemId || null,
        body.pageId || null,
        body.pageTitle || null,
        body.pageName || null,
        new Date(),
        body.userId,
        body.alias || null,
      ],
    }
  );

  return data[0];
};

const updatePageAliasQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `update "tblPageAliases" set 
    "wrMenuItemId"=(select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
    "wrPageId"=(select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
    "wrPageTitle"=$3,
    "wrPageName"=$4,
    "wrAlias"=$5,
    "wrModifyDate"=$6,
    "wrModifyBy"=$7 where "wrPageAliasId" = $8 returning *`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.menuItemId || null,
        body.pageId || null,
        body.pageTitle || null,
        body.pageName || null,
        body.alias || null,
        new Date(),
        body.userId,
        body.pageAliasId,
      ],
    }
  );

  return data[0];
};

const deletePageAliasQuery = async (pageAliasId, fastify) => {
  return await fastify.db.query(
    `delete from "tblPageAliases" where "wrPageAliasId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [pageAliasId],
    }
  );
};

module.exports = {
  allPageAliases,
  pageAliasById,
  insertPageAliasQuery,
  updatePageAliasQuery,
  deletePageAliasQuery,
};

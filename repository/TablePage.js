const allPageQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    ed."wrValue" as "pageId",
    "wrPageTitle" as "pageTitle",
    "wrPageHeading" as "pageHeading",
    "wrPageName" as "pageName",
    "wrAlias" as "alias",
    "wrIsLink" as "isLink",
    "wrLinkURL" as "linkURL",
    tpf."wrValue" as "pageFormatId",
    "wrIsOpenInNewTab" as "isOpenInNewTab",
    "wrPageContent" as "pageContent",
    "wrSEOWord" as "seoWord",
    "wrSEODescription" as "seoDescription",
    "wrIsDefault" as "isDefault",
    "wrDynamicParameters" as "dynamicParameters"
     from "tblPages" tp left join "tblEncryptedData" ed on tp."wrPageId" = ed."wrKey"
     left join "tblEncryptedData" tpf on tp."wrPageFormatId" = tpf."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const pageByIdQuery = async (pageId, fastify) => {
  const data = await fastify.db.query(
    `select 
    ed."wrKey" as "id",
    ed."wrValue" as "pageId",
    "wrPageTitle" as "pageTitle",
    "wrPageHeading" as "pageHeading",
    "wrPageName" as "pageName",
    "wrAlias" as "alias",
    "wrIsLink" as "isLink",
    "wrLinkURL" as "linkURL",
    tpf."wrValue" as "pageFormatId",
    "wrIsOpenInNewTab" as "isOpenInNewTab",
    "wrPageContent" as "pageContent",
    "wrSEOWord" as "seoWord",
    "wrSEODescription" as "seoDescription",
    "wrIsDefault" as "isDefault",
    "wrDynamicParameters" as "dynamicParameters"
     from "tblPages" tp left join "tblEncryptedData" ed on tp."wrPageId" = ed."wrKey"
     left join "tblEncryptedData" tpf on tp."wrPageFormatId" = tpf."wrKey" where ed."wrValue" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [pageId],
    }
  );

  return data[0];
};

const insertPageQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `
    with insert_data as (
        INSERT INTO "tblPages"(
            "wrPageTitle", "wrPageHeading", "wrPageName", "wrAlias", "wrIsLink", "wrLinkURL", "wrPageFormatId", "wrIsOpenInNewTab", "wrPageContent", "wrSEOWord", "wrSEODescription", "wrIsDefault", "wrDynamicParameters" ,"wrCreatedDate", "wrCreatedBy")
            VALUES ($1, $2, $3, $4, $5, $6, (select "wrKey" from "tblEncryptedData" where "wrValue" = $7), $8, $9, $10, $11, $12, $13,$14,$15) returning *
    )

    select
    ed."wrValue" as "pageId",
    "wrPageTitle" as "pageTitle",
    "wrPageHeading" as "pageHeading",
    "wrPageName" as "pageName",
    "wrAlias" as "alias",
    "wrIsLink" as "isLink",
    "wrLinkURL" as "linkURL",
    tpf."wrValue" as "pageFormatId",
    "wrIsOpenInNewTab" as "isOpenInNewTab",
    "wrPageContent" as "pageContent",
    "wrSEOWord" as "seoWord",
    "wrSEODescription" as "seoDescription",
    "wrIsDefault" as "isDefault",
    "wrDynamicParameters" as "dynamicParameters"
     from insert_data tb left join "tblEncryptedData" ed on tb."wrPageId" = ed."wrKey"
     left join "tblEncryptedData" tpf on tb."wrPageFormatId" = tpf."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.pageTitle,
        body.pageHeading,
        body.pageName,
        body.alias || null,
        body.isLink || false,
        body.linkURL || null,
        body.pageFormatId || null,
        body.isOpenInNewTab || false,
        body.pageContent || null,
        body.seoWord || null,
        body.seoDescription || null,
        body.isDefault || false,
        body.dynamicParameters || null,
        new Date(),
        body.userId,
      ],
    }
  );

  return data[0];
};

const updatePageQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `UPDATE "tblPages" set "wrPageTitle"=$1 , "wrPageHeading" = $2 , "wrPageName"=$3 , "wrAlias" = $4 , "wrIsLink" = $5 , "wrLinkURL" = $6 , "wrPageFormatId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7) , "wrIsOpenInNewTab" = $8 , "wrPageContent" = $9 , "wrSEOWord" = $10 , "wrSEODescription" = $11 , "wrIsDefault" = $12 , "wrDynamicParameters" = $13, "wrModifyBy" = $14 , "wrModifyDate" = $15 where "wrPageId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $16)
     returning  "wrPageTitle" as "pageTitle",
        "wrPageHeading" as "pageHeading",
        "wrPageName" as "pageName",
        "wrAlias" as "alias",
        "wrIsLink" as "isLink",
        "wrLinkURL" as "linkURL",
        "wrIsOpenInNewTab" as "isOpenInNewTab",
        "wrPageContent" as "pageContent",
        "wrSEOWord" as "seoWord",
        "wrSEODescription" as "seoDescription",
        "wrIsDefault" as "isDefault",
        "wrDynamicParameters" as "dynamicParameters"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.pageTitle,
        body.pageHeading,
        body.pageName,
        body.alias,
        body.isLink,
        body.linkURL,
        body.pageFormatId,
        body.isOpenInNewTab,
        body.pageContent,
        body.seoWord,
        body.seoDescription,
        body.isDefault,
        body.dynamicParameters,
        body.userId,
        new Date(),
        body.pageId,
      ],
    }
  );

  return data[0];
};

const validatePageIdInMenuItem = async (pageId, fastify) => {
  const data = await fastify.db.query(
    `select tp.* from "tblMenuItems" mi left join "tblPages" tp on tp."wrPageId" = mi."wrPageId" where mi."wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsActive" = true`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [pageId],
    }
  );

  return data[0];
};

const validatePageIdInPageAlias = async (pageId, fastify) => {
  const data = await fastify.db.query(
    `select tp.* from "tblPageAliases" pa left join "tblPages" tp on tp."wrPageId" = pa."wrPageId" where pa."wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [pageId],
    }
  );

  return data[0];
};

const deletePageQuery = async (pageId, fastify) => {
  const data = await fastify.db.query(
    `delete from "tblPages" where "wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [pageId],
    }
  );

  return data[0];
};

module.exports = {
  allPageQuery,
  pageByIdQuery,
  insertPageQuery,
  updatePageQuery,
  validatePageIdInMenuItem,
  validatePageIdInPageAlias,
  deletePageQuery,
};

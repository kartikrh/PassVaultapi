const { errorLogger } = require("../utilities/logger");

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
    "wrDynamicParameters" as "dynamicParameters",
    "wrIsStatic" as "isStatic",
    tpwl."wrValue" as "whiteLabelId"
     from "tblPages" tp 
     left join "tblEncryptedData" ed on tp."wrPageId" = ed."wrKey"
     left join "tblEncryptedData" tpf on tp."wrPageFormatId" = tpf."wrKey"
     left join "tblEncryptedData" tpwl on tp."wrWhiteLabelId" = tpwl."wrKey"
     where tp."wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertPageQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `
    with insert_data as (
        INSERT INTO "tblPages"(
            "wrPageTitle", "wrPageHeading", "wrPageName", "wrAlias", "wrIsLink", "wrLinkURL", "wrPageFormatId",
             "wrIsOpenInNewTab", "wrPageContent", "wrSEOWord", "wrSEODescription", 
            "wrIsDefault", "wrDynamicParameters", "wrIsStatic", "wrWhiteLabelId","wrCreatedBy","wrCreatedDate")
            VALUES ($1, $2, $3, $4, $5, $6, (select "wrKey" from "tblEncryptedData" where "wrValue" = $7), $8, $9, $10, $11, $12, $13,$14,(select "wrKey" from "tblEncryptedData" where "wrValue" = $15), $16,now()) 
            returning *
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
    "wrDynamicParameters" as "dynamicParameters",
    "wrIsStatic" as "isStatic",
    tpwl."wrValue" as "whiteLabelId"
     from insert_data tb left join "tblEncryptedData" ed on tb."wrPageId" = ed."wrKey"
     left join "tblEncryptedData" tpf on tb."wrPageFormatId" = tpf."wrKey"
     left join "tblEncryptedData" tpwl on tb."wrWhiteLabelId" = tpwl."wrKey"
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
          body.isStatic || false,
          body.whiteLabelId || null,
          body.userId,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePage/insertPageQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePageQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `UPDATE "tblPages" set "wrPageTitle"=$1 , "wrPageHeading" = $2 , "wrPageName"=$3 , "wrAlias" = $4 , "wrIsLink" = $5 , "wrLinkURL" = $6 , "wrPageFormatId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7) , "wrIsOpenInNewTab" = $8 , "wrPageContent" = $9 , "wrSEOWord" = $10 , "wrSEODescription" = $11 , "wrIsDefault" = $12 , "wrDynamicParameters" = $13, "wrModifyBy" = $14 , "wrModifyDate" = now(),
       "wrIsStatic" = $15, "wrWhiteLabelId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $16)
       where "wrPageId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $17)
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
        "wrDynamicParameters" as "dynamicParameters",
        "wrIsStatic" as "isStatic"
        `,
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
          body.isStatic,
          body.whiteLabelId,
          body.pageId
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePage/updatePageQuery",
      request
    );
    throw new Error(err.message);
  }
};

const validatePageIdInMenuItem = async (pageId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select tp.* from "tblMenuItems" mi left join "tblPages" tp on tp."wrPageId" = mi."wrPageId" 
      where mi."wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and mi."wrIsActive" = true
      and mi."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [pageId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePage/validatePageIdInMenuItem",
      request
    );
    throw new Error(err.message);
  }
};

const validatePageIdInPageAlias = async (pageId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select tp.* from "tblPageAliases" pa left join "tblPages" tp on tp."wrPageId" = pa."wrPageId" 
      where pa."wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) and pa."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [pageId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePage/validatePageIdInPageAlias",
      request
    );
    throw new Error(err.message);
  }
};

const deletePageQuery = async (pageId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `update "tblPages" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
      where "wrPageId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($3))`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, pageId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePage/deletePageQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allPageQuery,
  insertPageQuery,
  updatePageQuery,
  validatePageIdInMenuItem,
  validatePageIdInPageAlias,
  deletePageQuery,
};

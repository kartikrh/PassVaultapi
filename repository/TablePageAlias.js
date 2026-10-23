const allPageAliases = async (fastify) => {
  return await fastify.db.query(
    `select 
    et."wrValue" as "pageAliasId",
    et2."wrValue" as "menuItemId",
    et3."wrValue" as "pageId",
    "wrPageName" as "pageName",
    "wrPageTitle" as "pageTitle",
    "wrAlias" as "alias"
    from "tblPageAliases" pa 
    left join "tblEncryptedData" et on pa."wrPageAliasId"=et."wrKey" 
    left join "tblEncryptedData" et2 on pa."wrMenuItemId"=et2."wrKey" 
    left join "tblEncryptedData" et3 on pa."wrPageId"=et3."wrKey"
    where pa."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  allPageAliases,
};

const getAllMenuItemTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        "wrValue" as "menuItemTypeId",
        "wrMenuItemType" as "menuItemType",
        "wrIsActive" as "isActive"
         from "tblMenuItemTypes" tb inner join "tblEncryptedData" te on tb."wrMenuItemTypeId" = te."wrKey"
         where tb."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  getAllMenuItemTypesQuery,
};

const getAllRolesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
        e."wrValue" as "roleId",
        r."wrRoleName" as "roleName",
        r."wrDescription" as "description",
        r."wrDisplayType" as "displayType"
     FROM "tblRoles" r inner join "tblEncryptedData" e on r."wrRoleId" = e."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const roleByDisplayTypeQuery = async (displayType, fastify) => {
  return await fastify.db.query(
    `SELECT 
            e."wrValue" as "roleId",
            r."wrRoleName" as "roleName",
            r."wrDescription" as "description",
            r."wrDisplayType" as "displayType"
         FROM "tblRoles" r inner join "tblEncryptedData" e on r."wrRoleId" = e."wrKey"
         where r."wrDisplayType" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [displayType],
    }
  );
};

const valideRoleId = async (roleId, fastify) => {
  const data = await fastify.db.query(
    `select * from "tblUsers" where "WrRoleId" in (select "wrRoleId" from "tblRoles" r inner join "tblEncryptedData" e  on r."wrRoleId" = e."wrKey" and e."wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [roleId],
    }
  );

  return data.length > 0;
};

const deleteRoleQuery = async (roleId, fastify) => {
  return await fastify.db.query(
    `delete from "tblRoles" where "wrRoleId" in (
        select "wrRoleId" from 
        "tblRoles" r
        inner join "tblEncryptedData" e  on r."wrRoleId" = e."wrKey" and e."wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [roleId],
    }
  );
};

module.exports = {
  getAllRolesQuery,
  valideRoleId,
  deleteRoleQuery,
  roleByDisplayTypeQuery,
};

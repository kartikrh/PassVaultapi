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

const createRoleQuery = async (body, fastify) => {
  const roleData = await fastify.db.query(
    `
    with role_add as (
    INSERT INTO "tblRoles" ("wrRoleName", "wrDescription", "wrDisplayType" , "wrCreatedBy" , "wrCreatedDate") VALUES ($1, $2, $3,$4,$5) RETURNING *
    )
    
    select "wrValue" as "roleId" , "wrRoleName" as "roleName" , "wrDescription" as "description" , "wrDisplayType" as "displayType" from role_add r inner join "tblEncryptedData" e on r."wrRoleId" = e."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.roleName,
        body.description,
        body.displayType,
        body.userId || 0,
        new Date(),
      ],
    }
  );

  return roleData[0];
};

const updateOrCreatePermissionQuery = async (body, fastify) => {
  return await fastify.db.query(
    `
    DO $$
DECLARE
    item jsonb;
    role_key int;
    tab_key int;
BEGIN
  UPDATE "tblRoles"
  SET "wrRoleName" = :roleName, "wrDescription" = :description, "wrDisplayType" = :dispayType,"wrModifyDate" = now() , "wrModifyBy" = :userId
  WHERE "wrRoleId" IN (
      SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = :roleId
  );
    FOR item IN
        SELECT * FROM jsonb_array_elements(:permission::jsonb)
    LOOP
        SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = (item->>'roleId') INTO role_key;
        SELECT "wrKey" FROM "tblEncryptedData" WHERE "wrValue" = (item->>'tabId') INTO tab_key;

        IF role_key IS NOT NULL AND tab_key IS NOT NULL THEN
            UPDATE "tblPermissions"
            SET 
                "wrIsView" = (item->>'isView')::boolean,
                "wrIsAdd" = (item->>'isAdd')::boolean,
                "wrIsEdit" = (item->>'isEdit')::boolean,
                "wrIsDelete" = (item->>'isDelete')::boolean
            WHERE "wrRoleId" = role_key AND "wrTabId" = tab_key;

            INSERT INTO "tblPermissions" ("wrRoleId", "wrTabId", "wrIsView", "wrIsAdd", "wrIsEdit", "wrIsDelete", "wrCreatedBy", "wrCreatedDate")
            SELECT 
                role_key, 
                tab_key,
                (item->>'isView')::boolean,
                (item->>'isAdd')::boolean,
                (item->>'isEdit')::boolean,
                (item->>'isDelete')::boolean,
                :userId,
                now()

            WHERE NOT EXISTS (
                SELECT 1 FROM "tblPermissions" WHERE "wrRoleId" = role_key AND "wrTabId" = tab_key
            );
        END IF;
    END LOOP;
END;
$$;
`,
    {
      type: fastify.db.QueryTypes.SELECT,
      replacements: {
        roleId: body.roleId,
        roleName: body.roleName,
        description: body.description,
        dispayType: body.displayType,
        userId: body.userId || 0,
        permission: JSON.stringify(body.permissions),
      },
    }
  );
};

module.exports = {
  getAllRolesQuery,
  valideRoleId,
  deleteRoleQuery,
  roleByDisplayTypeQuery,
  createRoleQuery,
  updateOrCreatePermissionQuery,
};

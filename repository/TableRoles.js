const getAllRolesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
        e."wrValue" as "roleId",
        r."wrRoleName" as "roleName",
        r."wrDescription" as "description",
        r."wrDisplayType" as "displayType",
        r."wrCreatedBy" as  "createdBy"
     FROM "tblRoles" r inner join "tblEncryptedData" e on r."wrRoleId" = e."wrKey"
     AND r."wrIsDeleted" = false;`,
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
         where r."wrDisplayType" = $1 AND r."wrIsDeleted" = false;`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [displayType],
    }
  );
};

const valideRoleId = async (roleId, fastify) => {
  const data = await fastify.db.query(
    `select * from "tblUsers" where 
    "WrRoleId" in (select "wrRoleId" from "tblRoles" r inner join "tblEncryptedData" e  on r."wrRoleId" = e."wrKey" and e."wrValue" = $1)
    AND "WrIsDelete" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [roleId],
    }
  );

  return data.length > 0;
};

const deleteRoleQuery = async (roleId, fastify, request) => {
  return await fastify.db.query(
    `update "tblRoles" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
    where "wrRoleId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($3))`,
    {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [true, request.userTokenInfo.WrUserId, roleId],
    }
  );
};
const deletePermissionQuery = async (roleId, fastify, request) => {
  return await fastify.db.query(
    `update "tblPermissions" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
    where "wrRoleId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($3))`,
    {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [true, request.userTokenInfo.WrUserId, roleId],
    }
  );
};

const createRoleQuery = async (body, fastify) => {
  const roleData = await fastify.db.query(
    `
    with role_add as (
    INSERT INTO "tblRoles" ("wrRoleName", "wrDescription", "wrDisplayType" , "wrCreatedBy" , "wrCreatedDate") VALUES ($1, $2, $3,$4,$5) RETURNING *
    )
    
    select "wrValue" as "roleId" , "wrRoleName" as "roleName" , "wrDescription" as "description" , "wrDisplayType" as "displayType" , "wrCreatedBy" as  "createdBy" from role_add r inner join "tblEncryptedData" e on r."wrRoleId" = e."wrKey"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.roleName,
        body.description,
        body.displayType,
        body.userId,
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

const roleByIdQuery = async (data, parentRoleId, isSuperAdmin, fastify) => {
  if (isSuperAdmin) {
    return await fastify.db.query(
      `select 
    te."wrValue" as "tabId", 
    tt."WrDisplayName" as "displayName", 
    "wrParentId" as "parentId",
    COALESCE(tt."wrIsAdd",false) as "isAdd",
    COALESCE(tt."wrIsEdit",false) as "isEdit",
    COALESCE(tt."wrIsDelete",false) as "isDelete",
     COALESCE(tp."wrIsAdd",false) as "isAddPermission",
    COALESCE(tp."wrIsEdit",false) as "isEditPermission",
    COALESCE(tp."wrIsDelete",false) as "isDeletePermission",
    COALESCE(tp."wrIsView",false) as "isViewPermission",
    tt."wrDisplayOrder" as "displayOrder"
    from "tblTabs" tt 
    left join (
      select * from "tblPermissions" where "wrRoleId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    ) as tp on tt."wrTabId" = tp."wrTabId"
    left join "tblEncryptedData" te on te."wrKey" = tt."wrTabId"
    where tt."wrIsActive" = true and tt."wrDisplayType" = $2 and tt."wrIsDeleted" = false
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.roleId, data.displayType],
      }
    );
  } else {
    return await fastify.db.query(
      `select 
    te."wrValue" as "tabId", 
    tt."WrDisplayName" as "displayName", 
    "wrParentId" as "parentId",
    COALESCE(tpp."wrIsAdd",false) as "isAdd",
    COALESCE(tpp."wrIsEdit",false) as "isEdit",
    COALESCE(tpp."wrIsDelete",false) as "isDelete",
     COALESCE(tp."wrIsAdd",false) as "isAddPermission",
    COALESCE(tp."wrIsEdit",false) as "isEditPermission",
    COALESCE(tp."wrIsDelete",false) as "isDeletePermission",
    COALESCE(tp."wrIsView",false) as "isViewPermission"
    from "tblTabs" tt 
    INNER join (
      select * from "tblPermissions" where "wrRoleId" = $3
    ) as tpp on tt."wrTabId" = tpp."wrTabId"
    left join (
      select * from "tblPermissions" where "wrRoleId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    ) as tp on tt."wrTabId" = tp."wrTabId"
    left join "tblEncryptedData" te on te."wrKey" = tt."wrTabId"
    where tt."wrIsActive" = true and tt."wrDisplayType" = $2 AND tpp."wrIsView" = true AND tt."wrIsDeleted" = false
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.roleId, data.displayType, parentRoleId],
      }
    );
  }
};

const permissionByRoleIdQuery = async (data, fastify) => {
  return await fastify.db.query(
    `select   
     COALESCE(tp."wrIsAdd",false) as "isAddPermission",
    COALESCE(tp."wrIsEdit",false) as "isEditPermission",
    COALESCE(tp."wrIsDelete",false) as "isDeletePermission",
    COALESCE(tp."wrIsView",false) as "isViewPermission"
    from "tblTabs" tt 
    left join (
      select * from "tblPermissions" where "wrRoleId" = $1
    ) as tp on tt."wrTabId" = tp."wrTabId"
    left join "tblEncryptedData" te on te."wrKey" = tt."wrTabId"
    where tt."wrDisplayType" = $2 and tt."wrTabName" ilike $3 and tt."wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [data.roleId, data.displayType, data.tabName],
    }
  );
};

const permissionByRoleQuery = async (data, fastify) => {
  return await fastify.db.query(
    `select   
     COALESCE(tp."wrIsAdd",false) as "isAddPermission",
    COALESCE(tp."wrIsEdit",false) as "isEditPermission",
    COALESCE(tp."wrIsDelete",false) as "isDeletePermission",
    COALESCE(tp."wrIsView",false) as "isViewPermission"
    from "tblTabs" tt 
    left join (
      select * from "tblPermissions" where "wrRoleId" = $1
    ) as tp on tt."wrTabId" = tp."wrTabId"
    left join "tblEncryptedData" te on te."wrKey" = tt."wrTabId"
    where tt."wrDisplayType" = $2 and tt."wrTabName" = ANY($3) and tt."wrIsDeleted" = false
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [data.roleId, data.displayType, data.tabName],
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
  deletePermissionQuery,
  roleByIdQuery,
  permissionByRoleIdQuery,
  permissionByRoleQuery,
};

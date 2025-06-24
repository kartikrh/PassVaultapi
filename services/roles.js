const {
  valideRoleId,
  deleteRoleQuery,
  createRoleQuery,
  updateOrCreatePermissionQuery,
  deletePermissionQuery,
  roleByIdQuery,
  permissionByRoleIdQuery,
  permissionByRoleQuery,
} = require("../repository/TableRoles");

const allRolesService = async (request) => {
  if (request.userTokenInfo.WrIsSuperAdmin) {
    return global.tblRoles;
  } else {
    return global.tblRoles.filter(
      (item) => item.createdBy == request.userTokenInfo.WrUserId
    );
  }
};

const roleByDisplayTypeService = async (request, fastify) => {
  const { displayType } = request.body;
  const result = global.tblRoles.filter(
    (item) => item.displayType === displayType
  );
  return result || [];
};

const roleCreateService = async (request, fastify) => {
  let role_id = request.body.roleId;

  if (request.body.roleId === "0") {
    const checkRoleName = global.tblRoles.find(
      (item) => item.roleName === request.body.roleName
    );

    if (checkRoleName) {
      throw new Error("Role name already exists");
    }

    const createRole = await createRoleQuery(
      { ...request.body, userId: request.userTokenInfo.WrUserId },
      fastify
    );
    role_id = createRole.roleId;
    global.tblRoles.push(createRole);
  }

  const checkRoleName = global.tblRoles.find(
    (item) => item.roleName === request.body.roleName && item.roleId !== role_id
  );

  if (checkRoleName) {
    throw new Error("Role name already exists");
  }

  request.body.permissions = request.body.permissions.map((item) => {
    return {
      roleId: role_id,
      ...item,
    };
  });

  await updateOrCreatePermissionQuery(request.body, fastify);

  const getRoleById = global.tblRoles.find((item) => item.roleId === role_id);

  const updateRoleData = {
    roleId: role_id,
    roleName: request.body.roleName || getRoleById.roleName,
    description: request.body.description || getRoleById.description,
    displayType: request.body.displayType || getRoleById.displayType,
    createdBy: getRoleById.createdBy,
  };

  const index = global.tblRoles.findIndex((item) => item.roleId === role_id);

  global.tblRoles[index] = updateRoleData;

  return { roleId: role_id };
};

const deleteRoleService = async (request, fastify) => {
  const { roleIds } = request.body;

  for (let i = 0; i < roleIds.length; i++) {
    const checkValidRoleId = await valideRoleId(roleIds[i], fastify);

    if (checkValidRoleId) {
      const role = global.tblRoles.find((item) => item.roleId === roleIds[i]);
      console.log("role", role)
      throw new Error(
        `Role Id ${role.roleName} is assigned to user(s), skiping delete......`
      );
    }
  }
  await deleteRoleQuery(roleIds, fastify, request);
  await deletePermissionQuery(roleIds, fastify, request);

  global.tblRoles = global.tblRoles.filter(
    (item) => !roleIds.includes(item.roleId)
  );

  return "Role successfully deleted";
};

const roleByIdService = async (request, fastify) => {
  const permissionData = await roleByIdQuery(
    request.body,
    request.userTokenInfo.WrRoleId,
    request.userTokenInfo.WrIsSuperAdmin,
    fastify
  );
  const roleData = global.tblRoles.find(
    (item) => item.roleId === request.body.roleId
  );

  return {
    ...roleData,
    permissions: permissionData,
  };
};

const roleByTabService = async (request, fastify, tabName = undefined) => {
  if (request.userTokenInfo.WrIsSuperAdmin) {
    return {
      isAddPermission: true,
      isEditPermission: true,
      isDeletePermission: true,
      isViewPermission: true,
    };
  }

  const permissionData = await permissionByRoleIdQuery(
    {
      roleId: request.userTokenInfo.WrRoleId || null,
      displayType: request.userTokenInfo.WrUserType || null,
      tabName: tabName || request.body.tabName,
    },
    fastify
  );

  if (!permissionData.length) {
    return {
      isAddPermission: false,
      isEditPermission: false,
      isDeletePermission: false,
      isViewPermission: false,
    };
  } else {
    return permissionData[0];
  }
};


const commentaryRoleService = async (request, fastify, tabName) => {
  if (request.userTokenInfo.WrIsSuperAdmin) {
    return {
      isAddPermission: true,
      isEditPermission: true,
      isDeletePermission: true,
      isViewPermission: true,
    };
  }
  const tabNames = [tabName, request.body?.tabName || "Commentary List"];
  const permissionData = await permissionByRoleQuery(
    {
      roleId: request.userTokenInfo.WrRoleId || null,
      displayType: request.userTokenInfo.WrUserType || null,
      tabName: tabNames,
    },
    fastify
  );
  let combinedPermissions = {
    isAddPermission: false,
    isEditPermission: false,
    isDeletePermission: false,
    isViewPermission: false,
  };

  for (const permission of permissionData) {
    combinedPermissions.isAddPermission ||= permission.isAddPermission;
    combinedPermissions.isEditPermission ||= permission.isEditPermission;
    combinedPermissions.isDeletePermission ||= permission.isDeletePermission;
    combinedPermissions.isViewPermission ||= permission.isViewPermission;
  }
  return combinedPermissions;
};

module.exports = {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
  roleCreateService,
  roleByIdService,
  roleByTabService,
  commentaryRoleService,
};

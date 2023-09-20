const {
  valideRoleId,
  deleteRoleQuery,
  createRoleQuery,
  updateOrCreatePermissionQuery,
  deletePermissionQuery,
  roleByIdQuery,
  permissionByRoleIdQuery,
} = require("../repository/TableRoles");

const allRolesService = async (fastify) => {
  return global.tblRoles;
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
    const createRole = await createRoleQuery(request.body, fastify);
    role_id = createRole.roleId;
    global.tblRoles.push(createRole);
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
      throw new Error(
        `Role Id ${roleIds[i]} is assigned to user(s), skiping delete`
      );
    }
  }
  await deleteRoleQuery(roleIds, fastify);
  await deletePermissionQuery(roleIds, fastify);

  global.tblRoles = global.tblRoles.filter(
    (item) => !roleIds.includes(item.roleId)
  );

  return "Role successfully deleted";
};

const roleByIdService = async (request, fastify) => {
  const permissionData = await roleByIdQuery(request.body, fastify);
  const roleData = global.tblRoles.find(
    (item) => item.roleId === request.body.roleId
  );

  return {
    ...roleData,
    permissions: permissionData,
  };
};

const roleByTabService = async (request, fastify) => {
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
      tabName: request.body.tabName,
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

module.exports = {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
  roleCreateService,
  roleByIdService,
  roleByTabService,
};

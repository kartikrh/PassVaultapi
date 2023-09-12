const {
  valideRoleId,
  deleteRoleQuery,
  createRoleQuery,
  updateOrCreatePermissionQuery,
  deletePermissionQuery,
  roleByIdQuery,
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

  return "Role successfully updated";
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

module.exports = {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
  roleCreateService,
  roleByIdService,
};

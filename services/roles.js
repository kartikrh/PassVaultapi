const {
  getAllRolesQuery,
  valideRoleId,
  deleteRoleQuery,
  roleByDisplayTypeQuery,
  createRoleQuery,
  updateOrCreatePermissionQuery,
} = require("../repository/TableRoles");

const allRolesService = async (fastify) => {
  const result = await getAllRolesQuery(fastify);
  return result;
};

const roleByDisplayTypeService = async (request, fastify) => {
  const { displayType } = request.body;
  const result = await roleByDisplayTypeQuery(displayType, fastify);
  return result;
};

const roleCreateService = async (request, fastify) => {
  let role_id = request.body.roleId;

  if (request.body.roleId === "0") {
    const createRole = await createRoleQuery(request.body, fastify);
    role_id = createRole.roleId;
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

  let invalidRoleIds = [];

  for (let i = 0; i < roleIds.length; i++) {
    const checkValidRoleId = await valideRoleId(roleIds[i], fastify);

    if (checkValidRoleId) {
      invalidRoleIds.push(roleIds[i]);
    } else {
      await deleteRoleQuery(roleIds[i], fastify);
    }
  }

  if (invalidRoleIds.length > 0) {
    return `Role Id(s) ${invalidRoleIds.join(
      ","
    )} stil assigned to user(s), skiping delete`;
  } else {
    return `Role Id(s) deleted successfully`;
  }
};

module.exports = {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
  roleCreateService,
};

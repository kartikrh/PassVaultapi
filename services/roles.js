const {
  getAllRolesQuery,
  valideRoleId,
  deleteRoleQuery,
  roleByDisplayTypeQuery,
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
};

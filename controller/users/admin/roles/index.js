const {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
} = require("../../../../services/roles");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllRoles = async (request, reply, fastify) => {
  try {
    const result = await allRolesService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getRolesByDisplayType = async (request, reply, fastify) => {
  try {
    const result = await roleByDisplayTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteRoles = async (request, reply, fastify) => {
  try {
    const result = await deleteRoleService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllRoles,
  deleteRoles,
  getRolesByDisplayType,
};

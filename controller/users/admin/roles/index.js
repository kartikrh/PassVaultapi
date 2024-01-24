const {
  allRolesService,
  deleteRoleService,
  roleByDisplayTypeService,
  roleCreateService,
  roleByIdService,
  roleByTabService,
} = require("../../../../services/roles");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/roles/index";

const getAllRoles = async (request, reply, fastify) => {
  try {
    const result = await allRolesService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllRoles", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getRoleList = async (request, reply, fastify) => {
  try {
    let result = await allRolesService(request);
    result = result.map((item) => {
      return {
        roleId: item.roleId,
        roleName: item.roleName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getRoleList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getRolesByDisplayType = async (request, reply, fastify) => {
  try {
    const result = await roleByDisplayTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getRolesByDisplayType",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const createRole = async (request, reply, fastify) => {
  try {
    const result = await roleCreateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/createRole", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteRoles = async (request, reply, fastify) => {
  try {
    const result = await deleteRoleService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteRoles", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getRoleById = async (request, reply, fastify) => {
  try {
    const result = await roleByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getRoleById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPermissionByTab = async (request, reply, fastify) => {
  try {
    const result = await roleByTabService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPermissionByTab",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllRoles,
  deleteRoles,
  getRolesByDisplayType,
  createRole,
  getRoleById,
  getPermissionByTab,
  getRoleList
};

const {
  allMenuTypeService,
  deleteMenuTypeService,
  menuTypeByIdService,
  saveMenuTypeService,
} = require("../../../../services/menuType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/menuType/index";

const getAllMenuTypes = async (request, reply, fastify) => {
  try {
    const result = await allMenuTypeService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllMenuTypes", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getMenuTypeById = async (request, reply, fastify) => {
  try {
    const result = await menuTypeByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMenuTypeById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const saveMenuType = async (request, reply, fastify) => {
  try {
    const result = await saveMenuTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMenuType", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteMenuType = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteMenuType", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMenuTypes,
  getMenuTypeById,
  saveMenuType,
  deleteMenuType,
};

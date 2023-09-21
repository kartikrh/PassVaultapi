const {
  allMenuItemTypeService,
  menuItemTypeByIdService,
  deleteMenuItemTypeService,
  saveMenuItemTypeService,
} = require("../../../../services/menuItemtype");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/menuItemType/index";
const getAllMenuItemTypes = async (request, reply, fastify) => {
  try {
    const result = await allMenuItemTypeService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllMenuItemTypes",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getMenuItemTypeById = async (request, reply, fastify) => {
  try {
    const result = await menuItemTypeByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getMenuItemTypeById",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const saveMenuItemType = async (request, reply, fastify) => {
  try {
    const result = await saveMenuItemTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/saveMenuItemType",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteMenuItemType = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuItemTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteMenuItemType",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMenuItemTypes,
  getMenuItemTypeById,
  saveMenuItemType,
  deleteMenuItemType,
};

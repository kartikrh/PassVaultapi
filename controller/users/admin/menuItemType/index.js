const {
  allMenuItemTypeService,
  menuItemTypeByIdService,
  createMenuItemTypeService,
  updateMenuItemTypeService,
  deleteMenuItemTypeService,
} = require("../../../../services/menuItemtype");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllMenuItemTypes = async (request, reply, fastify) => {
  try {
    const result = await allMenuItemTypeService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getMenuItemTypeById = async (request, reply, fastify) => {
  try {
    const result = await menuItemTypeByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createMenuItemType = async (request, reply, fastify) => {
  try {
    const result = await createMenuItemTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updateMenuItemType = async (request, reply, fastify) => {
  try {
    const result = await updateMenuItemTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteMenuItemType = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuItemTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMenuItemTypes,
  getMenuItemTypeById,
  createMenuItemType,
  updateMenuItemType,
  deleteMenuItemType,
};

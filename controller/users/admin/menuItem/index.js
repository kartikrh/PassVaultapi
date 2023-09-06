const {
  allMenuItemService,
  menuItemByIdService,
  createMenuItemService,
  updateMenuItemService,
  deleteMenuItemService,
} = require("../../../../services/menuItem");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllMenuItems = async (request, reply, fastify) => {
  try {
    const result = await allMenuItemService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getMenuItemById = async (request, reply, fastify) => {
  try {
    const result = await menuItemByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createMenuItem = async (request, reply, fastify) => {
  try {
    const result = await createMenuItemService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updateMenuItem = async (request, reply, fastify) => {
  try {
    const result = await updateMenuItemService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteMenuItem = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuItemService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};

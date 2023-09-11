const {
  allMenuItemService,
  menuItemByIdService,
  saveMenuItemService,
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

const saveMenuItem = async (request, reply, fastify) => {
  try {
    const result = await saveMenuItemService(request, fastify);
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
  saveMenuItem,
  deleteMenuItem,
};

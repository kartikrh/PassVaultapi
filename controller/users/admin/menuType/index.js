const {
  allMenuTypeService,
  createMenuTypeService,
  deleteMenuTypeService,
  menuTypeByIdService,
  updateMenuTypeService,
} = require("../../../../services/menuType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllMenuTypes = async (request, reply, fastify) => {
  try {
    const result = await allMenuTypeService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getMenuTypeById = async (request, reply, fastify) => {
  try {
    const result = await menuTypeByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createMenuType = async (request, reply, fastify) => {
  try {
    const result = await createMenuTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updateMenuType = async (request, reply, fastify) => {
  try {
    const result = await updateMenuTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteMenuType = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMenuTypes,
  getMenuTypeById,
  createMenuType,
  updateMenuType,
  deleteMenuType,
};

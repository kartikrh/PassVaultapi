const {
  allGroupsService,
  groupByIdService,
  saveGroupService,
  deleteGroupService,
  activeInactiveGroupService,
} = require("../../../../services/groups");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/groups/index.js";

const getAllGroups = async (request, reply, fastify) => {
  try {
    const result = await allGroupsService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllGroups", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getGroupById = async (request, reply, fastify) => {
  try {
    const result = await groupByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getGroupById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveGroup = async (request, reply, fastify) => {
  try {
    const result = await saveGroupService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveGroup", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteGroup = async (request, reply, fastify) => {
  try {
    const result = await deleteGroupService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteGroup", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveGroup = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveGroupService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveGroup", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  saveGroup,
  deleteGroup,
  activeInactiveGroup,
};
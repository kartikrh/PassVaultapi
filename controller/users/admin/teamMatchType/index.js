const { getTeamMatchTypeByTeamService, saveTeamMatchTypeByTeamService, updateTeamMatchTypeDataByTeamService, activeInactiveTeamMatchDataTypeByTeamIdService, deleteTeamMatchTypeByTeamIdService, getPlayersForTeamMatchTypeByTeamIdService } = require("../../../../services/teamMatchType");
const { success, error, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/teamMatchType/";

const getTeamMatchTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await getTeamMatchTypeByTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "getTeamMatchTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTeamMatchTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await saveTeamMatchTypeByTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "saveTeamMatchTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateTeamMatchDataTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await updateTeamMatchTypeDataByTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "updateTeamMatchDataTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveTeamMatchDataTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTeamMatchDataTypeByTeamIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "activeInactiveTeamMatchDataTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteTeamMatchTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await deleteTeamMatchTypeByTeamIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "deleteTeamMatchTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPlayersForTeamMatchTypeByTeamId = async (request, reply, fastify) => {
  try {
    const result = await getPlayersForTeamMatchTypeByTeamIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "getPlayersForTeamMatchTypeByTeamId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getTeamMatchTypeByTeamId,
    saveTeamMatchTypeByTeamId,
    updateTeamMatchDataTypeByTeamId,
    activeInactiveTeamMatchDataTypeByTeamId,
    deleteTeamMatchTypeByTeamId,
    getPlayersForTeamMatchTypeByTeamId
}
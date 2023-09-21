const {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
} = require("../../../../services/player");
const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

let commonPath = "controller/users/admin/teamsAndPlayer/players";

const getAllPlayers = async (request, reply, fastify) => {
  try {
    const result = await allPlayerService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPlayers", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPlayerById = async (request, reply, fastify) => {
  try {
    const result = await playerByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPlayerById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const savePlayer = async (request, reply, fastify) => {
  try {
    const result = await savePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePlayer", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePlayer = async (request, reply, fastify) => {
  try {
    const result = await deletePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deletePlayer", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
};

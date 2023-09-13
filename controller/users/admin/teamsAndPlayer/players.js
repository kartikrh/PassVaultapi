const {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
} = require("../../../../services/player");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllPlayers = async (request, reply, fastify) => {
  try {
    const result = await allPlayerService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPlayerById = async (request, reply, fastify) => {
  try {
    const result = await playerByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const savePlayer = async (request, reply, fastify) => {
  try {
    const result = await savePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePlayer = async (request, reply, fastify) => {
  try {
    const result = await deletePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
};

const {
  allTeamPlayerService,
  teamPlayerByIdService,
  allTeamPlayerByTeamIdService,
  saveTeamPlayerService,
  deleteTeamPlayerService,
} = require("../../../../services/teamPlayer");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllTeamPlayers = async (request, reply, fastify) => {
  try {
    const result = await allTeamPlayerService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getTeamPlayersByTeamId = async (request, reply, fastify) => {
  try {
    const result = await allTeamPlayerByTeamIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getTeamPlayerById = async (request, reply, fastify) => {
  try {
    const result = await teamPlayerByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const saveTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await saveTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deleteTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await deleteTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllTeamPlayers,
  getTeamPlayerById,
  getTeamPlayersByTeamId,
  saveTeamPlayer,
  deleteTeamPlayer,
};

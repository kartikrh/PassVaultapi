const {
  allTeamPlayerService,
  teamPlayerByIdService,
  allTeamPlayerByTeamIdService,
  saveTeamPlayerService,
  deleteTeamPlayerService,
} = require("../../../../services/teamPlayer");
const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

let commonPath = "controller/users/admin/teamsAndPlayer/teamPlayers";

const getAllTeamPlayers = async (request, reply, fastify) => {
  try {
    const result = await allTeamPlayerService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllTeamPlayers",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getTeamPlayersByTeamId = async (request, reply, fastify) => {
  try {
    const result = await allTeamPlayerByTeamIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getTeamPlayersByTeamId",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getTeamPlayerById = async (request, reply, fastify) => {
  try {
    const result = await teamPlayerByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getTeamPlayerById",
      request
    );
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
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteTeamPlayer",
      request
    );
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

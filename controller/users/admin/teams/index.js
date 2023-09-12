const {
  allTeamsService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
} = require("../../../../services/teams");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllTeams = async (request, reply, fastify) => {
  try {
    const result = await allTeamsService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getTeamById = async (request, reply, fastify) => {
  try {
    const result = await teamByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const saveTeam = async (request, reply, fastify) => {
  try {
    const result = await saveTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteTeam = async (request, reply, fastify) => {
  try {
    const result = await deleteTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
};

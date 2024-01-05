const {
  allTeamsService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
} = require("../../../../services/teams");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/teamsAndPlayer/teams";

const getAllTeams = async (request, reply, fastify) => {
  try {
    const result = await allTeamsService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTeams", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getTeamById = async (request, reply, fastify) => {
  try {
    const result = await teamByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTeamById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTeam = async (request, reply, fastify) => {
  try {
    const result = await saveTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveTeam", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteTeam = async (request, reply, fastify) => {
  try {
    const result = await deleteTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteTeam", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
};

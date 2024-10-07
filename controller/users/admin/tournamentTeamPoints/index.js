const {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService
} = require("../../../../services/tournamentTeamPoints");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/tournamentTeamPoints/index.js";

const getAllTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await allTournamentTeamPointsService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await saveTournamentTeamPointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await deleteTournamentTeamPointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTournamentTeamPointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllTournamentTeamPoints,
  saveTournamentTeamPoints,
  deleteTournamentTeamPoints,
  activeInactiveTournamentTeamPoints
};

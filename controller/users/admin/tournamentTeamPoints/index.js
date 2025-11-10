const {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService,
  saveTblTournamentTeamPointsService,
  teamsListService,
  netRunRateRe_calculationService,
  getAllTournamentTeamPointsService,
} = require("../../../../services/tournamentTeamPoints");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/tournamentTeamPoints/index.js";

const getAllTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await allTournamentTeamPointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await saveTblTournamentTeamPointsService(request, fastify);
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

const teamsList = async (request, reply, fastify) => {
  try {
    const result = await teamsListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/teamsList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const netRunRateRecalculation = async (request, reply, fastify) => {
  try {
    const result = await netRunRateRe_calculationService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/netRunRateRecalculation", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTournamentTeamPoints = async (request, reply, fastify) => {
  try {
    const result = await getAllTournamentTeamPointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    // console.log("err", err)
    errorLogger(fastify, err.message, commonPath + "/getAllTournamentTeamPoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllTournamentTeamPoints,
  saveTournamentTeamPoints,
  deleteTournamentTeamPoints,
  activeInactiveTournamentTeamPoints,
  teamsList,
  netRunRateRecalculation,
  getTournamentTeamPoints
};

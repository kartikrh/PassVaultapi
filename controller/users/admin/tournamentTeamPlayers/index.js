const {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
} = require("../../../../services/tournamentTeamPlayers");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/tournamentTeamPlayers/index.js";

const getAllTournamentTeamPlayers = async (request, reply, fastify) => {
  try {
    const result = await allTournamentTeamPlayersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTournamentTeamPlayers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTournamentTeamPlayers = async (request, reply, fastify) => {
  try {
    const result = await addTournamentTeamPlayersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveTournamentTeamPlayers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};


module.exports = {
  getAllTournamentTeamPlayers,
  saveTournamentTeamPlayers,
};

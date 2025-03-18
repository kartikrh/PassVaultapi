const {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
  allBowlingTypeService,
  allPlayerTypeService,
  allPlayerByTeamService,
  updatePlayerStatsService,
  updateIsSystemPlayerService,
  allPlayerByCompetitionAndTeamService,
  mergePlayerImageAndJerseyService,
  setTeamPlayerImgService,
} = require("../../../../services/player");
const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

let commonPath = "controller/users/admin/teamsAndPlayer/players";

const getAllPlayers = async (request, reply, fastify) => {
  try {
    const result = await allPlayerService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPlayers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllPlayerList = async (request, reply, fastify) => {
  try {
    let result = await allPlayerService(request);
    result = result.map((item) => {
      return {
        playerId: item.playerId,
        playerName: item.playerName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPlayerList",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllPlayerByTeam = async (request, reply, fastify) => {
  try {
    const result = await allPlayerByTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPlayerByTeam",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllPlayerByCompetitionAndTeam = async (request, reply, fastify) => {
  try {
    const result = await allPlayerByCompetitionAndTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPlayerByCompetitionAndTeam", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPlayerById = async (request, reply, fastify) => {
  try {
    const result = await playerByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPlayerById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllPlayerType = async (request, reply, fastify) => {
  try {
    const result = await allPlayerTypeService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/allPlayerTypeService",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllBowlingType = async (request, reply, fastify) => {
  try {
    const result = await allBowlingTypeService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllBowlingType",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const savePlayer = async (request, reply, fastify) => {
  try {
    const result = await savePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateIsSystemPlayer = async (request, reply, fastify) => {
  try {
    const result = await updateIsSystemPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateIsSystemPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deletePlayer = async (request, reply, fastify) => {
  try {
    const result = await deletePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deletePlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const UpdatePlayerStats = async (request, reply, fastify) => {
  try {
    const result = await updatePlayerStatsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const mergePlayerImageAndJersey = async (request, reply, fastify) => {
  try {
    const result = await mergePlayerImageAndJerseyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/mergePlayerImageAndJersey", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const setTeamPlayerImg = async (request, reply, fastify) => {
  try {
    const result = await setTeamPlayerImgService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/setTeamPlayerImg", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
  getAllBowlingType,
  getAllPlayerType,
  getAllPlayerByTeam,
  getAllPlayerList,
  UpdatePlayerStats,
  updateIsSystemPlayer,
  getAllPlayerByCompetitionAndTeam,
  mergePlayerImageAndJersey,
  setTeamPlayerImg
};

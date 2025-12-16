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
  getTeamListPlayerIdService,
  activeInactivePlayerService,
  UpdatePlayerFromEntityService,
  allPlayersMergeImageService,
  mergePlayerNullImageService,
  updatePlayerHomeTeamService,
  getPlayerCompetitionListByIdService,
  getPlayerPlayInCommentaryListByIdService,
  getPlayerCreatedDetailsService,
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

const getPlayerCreatedDetails = async (request, reply, fastify) => {
  try {
    const result = await getPlayerCreatedDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPlayerCreatedDetails", request);
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
const getTeamListByPlayerId = async (request, reply, fastify) => {
  try {
    const result = await getTeamListPlayerIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTeamListByPlayerId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactivePlayer = async (request, reply, fastify) => {
  try {
    const result = await activeInactivePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactivePlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const UpdatePlayerFromEntity = async (request, reply, fastify) => {
  try {
    const result = await UpdatePlayerFromEntityService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/UpdatePlayerFromEntity", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const allPlayersMergeImage = async (request, reply, fastify) => {
  try {
    const result = await allPlayersMergeImageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/allPlayersMergeImage", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const mergePlayerNullImage = async (request, reply, fastify) => {
  try {
    const result = await mergePlayerNullImageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/mergePlayerNullImage", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updatePlayerHomeTeam = async (request, reply, fastify) => {
  try {
    const result = await updatePlayerHomeTeamService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updatePlayerHomeTeam", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPlayerCompetitionListById = async (request, reply, fastify) => {
  try {
    const result = await getPlayerCompetitionListByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPlayerCompetitionListById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPlayerPlayInCommentaryListById = async (request, reply, fastify) => {
  try {
    const result = await getPlayerPlayInCommentaryListByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPlayerPlayInCommentaryListById", request);
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
  setTeamPlayerImg,
  getTeamListByPlayerId,
  activeInactivePlayer,
  UpdatePlayerFromEntity,
  allPlayersMergeImage,
  mergePlayerNullImage,
  updatePlayerHomeTeam,
  getPlayerCompetitionListById,
  getPlayerPlayInCommentaryListById,
  getPlayerCreatedDetails,
};

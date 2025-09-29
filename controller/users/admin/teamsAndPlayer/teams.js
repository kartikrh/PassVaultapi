const {
  allTeamsService,
  allteamByEventTypeIdService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
  getTeamPointService,
  mergeTeamJerseyAndPlayerImageService,
  UpdateTeamFromEntityService,
} = require("../../../../services/teams");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/teamsAndPlayer/teams";

const getAllTeams = async (request, reply, fastify) => {
  try {
    const result = await allteamByEventTypeIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTeams", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTeamList = async (request, reply, fastify) => {
  try {
    let result = await allteamByEventTypeIdService(request);
    result = result.map((item) => {
      return {
        teamId: item.teamId,
        teamName: item.teamName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTeamList", request);
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
const getTeamPoint = async (request, reply, fastify) => {
  try {
    const result = await getTeamPointService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTeamPoint", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const mergeTeamJerseyAndPlayerImage = async (request, reply, fastify) => {
  try {
    const result = await mergeTeamJerseyAndPlayerImageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/mergeTeamJerseyAndPlayerImage", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const UpdateTeamFromEntity = async (request, reply, fastify) => {
  try {
    const result = await UpdateTeamFromEntityService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/UpdateTeamFromEntity", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
  getTeamList,
  getTeamPoint,
  mergeTeamJerseyAndPlayerImage,
  UpdateTeamFromEntity
};

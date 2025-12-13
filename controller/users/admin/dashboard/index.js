const {
    getAllNullImagePlayersService,
    getAllNullImageTeamsService,
    getAllDuplicatePlayersService,
    getAllNullImageTeamsAndPlayersService,
    getPlayersWithoutTeamService,
    getPlayersWithoutHomeTeamService,
} = require("../../../../services/dashboard");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/dashboard/index.js";

const getAllNullImagePlayers = async (request, reply, fastify) => {
    try {
        const result = await getAllNullImagePlayersService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllNullImagePlayers", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllNullImageTeams = async (request, reply, fastify) => {
    try {
        const result = await getAllNullImageTeamsService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllNullImageTeams", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllNullImageTeamsAndPlayers = async (request, reply, fastify) => {
    try {
        const result = await getAllNullImageTeamsAndPlayersService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllNullImageTeamsAndPlayers", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllDuplicatePlayers = async (request, reply, fastify) => {
    try {
        const result = await getAllDuplicatePlayersService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllDuplicatePlayers", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getPlayersWithoutTeam = async (request, reply, fastify) => {
    try {
        const result = await getPlayersWithoutTeamService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getPlayersWithoutTeam", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getPlayersWithoutHomeTeam = async (request, reply, fastify) => {
    try {
        const result = await getPlayersWithoutHomeTeamService(fastify, request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getPlayersWithoutHomeTeam", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllNullImagePlayers,
    getAllNullImageTeams,
    getAllDuplicatePlayers,
    getAllNullImageTeamsAndPlayers,
    getPlayersWithoutTeam,
    getPlayersWithoutHomeTeam,
};

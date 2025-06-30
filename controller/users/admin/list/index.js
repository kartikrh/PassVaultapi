const {
    allEventTypesService,
} = require("../../../../services/eventTypes");
const {
    allteamByEventTypeIdService,
} = require("../../../../services/teams");
const {
    allPlayerService,
    allBowlingTypeService,
    allPlayerTypeService,
} = require("../../../../services/player");
const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

let commonPath = "controller/users/admin/list/index.js";

const getEventTypeList = async (request, reply, fastify) => {
    try {
        let result = await allEventTypesService(request);
        result = result.map((item) => ({
            eventTypeId: item.eventTypeId,
            eventType: item.eventType,
        }));
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getEventTypeList", request);
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
const getAllPlayerType = async (request, reply, fastify) => {
    try {
        const result = await allPlayerTypeService();
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger( fastify, err.message, commonPath + "/allPlayerTypeService", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getAllBowlingType = async (request, reply, fastify) => {
    try {
        const result = await allBowlingTypeService();
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger( fastify, err.message, commonPath + "/getAllBowlingType", request);
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
        errorLogger( fastify, err.message, commonPath + "/getAllPlayerList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
module.exports = {
    getEventTypeList,
    getTeamList,
    getAllPlayerType,
    getAllBowlingType,
    getAllPlayerList,
}
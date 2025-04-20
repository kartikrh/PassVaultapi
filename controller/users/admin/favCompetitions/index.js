const {
    allFavCompetitionsService,
    createFavCompetitionsService,
    deleteFavCompetitionsService,
    updateDisplayOrderService,
} = require("../../../../services/favCompetitions");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/favCompetitions/index.js";

const getAllFavCompetitions = async (request, reply, fastify) => {
    try {
        const result = await allFavCompetitionsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllFavCompetitions", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveFavCompetition = async (request, reply, fastify) => {
    try {
        const result = await createFavCompetitionsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveFavCompetition", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteFavCompetition = async (request, reply, fastify) => {
    try {
        const result = await deleteFavCompetitionsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteFavCompetition", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const updateDisplayOrder = async (request, reply, fastify) => {
    try {
        const result = await updateDisplayOrderService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/updateDisplayOrder", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllFavCompetitions,
    saveFavCompetition,
    deleteFavCompetition,
    updateDisplayOrder
};

const {
    allFavCommentaryService,
    saveFavCommentaryService,
    deleteFavCommentaryService,
} = require("../../../../services/clientFavCommentary");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/clientFavCommentary/index.js";

const allFavCommentary = async (request, reply, fastify) => {
    try {
        const result = await allFavCommentaryService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allFavCommentary", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveFavCommentary = async (request, reply, fastify) => {
    try {
        const result = await saveFavCommentaryService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveFavCommentary", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteFavCommentary = async (request, reply, fastify) => {
    try {
        const result = await deleteFavCommentaryService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteFavCommentary", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};


module.exports = {
    allFavCommentary,
    saveFavCommentary,
    deleteFavCommentary,
};

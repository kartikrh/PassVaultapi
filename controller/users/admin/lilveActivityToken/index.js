const {
    registerLiveActivityTokenService,
    unRegisterLiveActivityTokenService,
    deleteExpiredLiveActivityTokenService,
    getAllLiveActivityTokensByCommentaryService,
    deleteLiveActivityTokenByIdService,
} = require("../../../../services/liveActivityToken")
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/liveActivityToken/index.js";

const registerLiveActivityToken = async (request, reply, fastify) => {
    try {
        const result = await registerLiveActivityTokenService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/registerLiveActivityToken", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const unRegisterLiveActivityToken = async (request, reply, fastify) => {
    try {
        const result = await unRegisterLiveActivityTokenService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/unRegisterLiveActivityToken", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllLiveActivityTokensByCommentary = async (request, reply, fastify) => {
    try {
        const result = await getAllLiveActivityTokensByCommentaryService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllLiveActivityTokensByCommentary", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteExpiredLiveActivityToken = async (request, reply, fastify) => {
    try {
        const result = await deleteExpiredLiveActivityTokenService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteExpiredLiveActivityToken", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteLiveActivityTokenById = async (request, reply, fastify) => {
    try {
        const result = await deleteLiveActivityTokenByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteLiveActivityTokenById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    registerLiveActivityToken,
    unRegisterLiveActivityToken,
    getAllLiveActivityTokensByCommentary,
    deleteExpiredLiveActivityToken,
    deleteLiveActivityTokenById,
}
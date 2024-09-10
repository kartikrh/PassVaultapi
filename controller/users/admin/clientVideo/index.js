const {
    allClientVideosService,
    clientVideoByIdService,
    createClientVideoService,
    deleteClientVideoService,
    activeInactiveClientVideoService
} = require("../../../../services/clientVideo");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/clientVideo/index.js";

const getAllClientVideos = async (request, reply, fastify) => {
    try {
        const result = await allClientVideosService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllClientVideos", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const clientVideoById = async (request, reply, fastify) => {
    try {
        const result = await clientVideoByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/clientVideoById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveClientVideo = async (request, reply, fastify) => {
    try {
        const result = await createClientVideoService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveClientVideo", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteClientVideos = async (request, reply, fastify) => {
    try {
        const result = await deleteClientVideoService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteClientVideos", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};


const activeInactiveClientVideo = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveClientVideoService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveClientVideo", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllClientVideos,
    clientVideoById,
    saveClientVideo,
    deleteClientVideos,
    activeInactiveClientVideo
};

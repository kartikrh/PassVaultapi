const {
    allWhitelabelsService,
    whitelabelByIdService,
    createWhitelabelService,
    deleteWhitelabelService,
    activeInactiveWhitelabelService,
    demoClientEnableInIOSWhitelabelService,
} = require("../../../../services/whitelabel");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/whitelabel/index.js";

const getAllWhitelabels = async (request, reply, fastify) => {
    try {
        const result = await allWhitelabelsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllWhitelabels", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const whitelabelById = async (request, reply, fastify) => {
    try {
        const result = await whitelabelByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/whitelabelById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveWhitelabel = async (request, reply, fastify) => {
    try {
        const result = await createWhitelabelService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveWhitelabel", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteWhitelabel = async (request, reply, fastify) => {
    try {
        const result = await deleteWhitelabelService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteWhitelabel", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const activeInactiveWhitelabel = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveWhitelabelService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveWhitelabel", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const demoClientEnableInIOSWhitelabel = async (request, reply, fastify) => {
    try {
        const result = await demoClientEnableInIOSWhitelabelService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/demoClientEnableInIOSWhitelabel", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllWhitelabels,
    whitelabelById,
    saveWhitelabel,
    deleteWhitelabel,
    activeInactiveWhitelabel,
    demoClientEnableInIOSWhitelabel,
};

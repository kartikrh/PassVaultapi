const { ERROR_CODES, error, success } = require("../../../utilities/index");
const { errorLogger } = require("../../../utilities/logger");
const {
    signInAgentServices,
    signOutAgentServices,
    getInitConfigDetails,
    changeAgentPasswordService,
} = require("../../../services/agent");

let commonPath = "controller/agent/index.js";

async function signInAgent(request, reply, fastify) {
    try {
        const result = await signInAgentServices(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/signInAgent", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

async function signOutAgent(request, reply, fastify) {
    try {
        const result = await signOutAgentServices(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/signOutAgent", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

const getInitConfig = async (request, reply, fastify) => {
    try {
        const result = await getInitConfigDetails(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getInitConfig", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

const changeAgentPassword = async (request, reply, fastify) => {
    try {
        const result = await changeAgentPasswordService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/changeAgentPassword", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

module.exports = {
    signInAgent,
    signOutAgent,
    getInitConfig,
    changeAgentPassword,
}
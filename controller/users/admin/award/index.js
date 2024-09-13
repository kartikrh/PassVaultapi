const { getAllAwardService,
    getAwardByIdService,
    saveAwardService,
    deleteAwardService,
    activeInactiveAwardService,
    updateDisplayOrderService } = require("../../../../services/award");
const { error, success, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/award/index.js";

const getAllAward = async (request, reply, fastify) => {
    try {
        const result = await getAllAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getAwardById = async (request, reply, fastify) => {
    try {
        const result = await getAwardByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAwardById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const saveAward = async (request, reply, fastify) => {
    try {
        const result = await saveAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const deleteAward = async (request, reply, fastify) => {
    try {
        const result = await deleteAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const activeInactiveAward = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const updateDisplayOrder = async (request, reply, fastify) => {
    try {
        const result = await updateDisplayOrderService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/updateDisplayOrder", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
module.exports = {
    getAllAward,
    getAwardById,
    saveAward,
    deleteAward,
    activeInactiveAward,
    updateDisplayOrder
}

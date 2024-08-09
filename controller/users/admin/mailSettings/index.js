const {
    allMailSettings,
    mailSettingsById,
    createMailSettings,
    deleteMailSettings,
    changeIsDefaultStage
} = require("../../../../services/mailSettings");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/mailSettings/index.js";

const getAllMailSettings = async (request, reply, fastify) => {
    try {
        const result = await allMailSettings(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllMailSettings", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const singleGetMailSettings = async (request, reply, fastify) => {
    try {
        const result = await mailSettingsById(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/singleGetMailSettings", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveMailSettings = async (request, reply, fastify) => {
    try {
        const result = await createMailSettings(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveMailSettings", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteMailSetting = async (request, reply, fastify) => {
    try {
        const result = await deleteMailSettings(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteMailSetting", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const isDefaultStage = async (request, reply, fastify) => {
    try {
        const result = await changeIsDefaultStage(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteMailSetting", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllMailSettings,
    singleGetMailSettings,
    saveMailSettings,
    deleteMailSetting,
    isDefaultStage
};

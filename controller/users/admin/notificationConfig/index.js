const {
    allNotificationConfigService,
    notificationCofigByIdService,
    createNotificationService,
    deleteNotificationConfigService,
    activeInactiveNotificationConfigService
} = require("../../../../services/notificationConfig");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/notificationConfig/index.js";

const getAllNotificationConfigs = async (request, reply, fastify) => {
    try {
        const result = await allNotificationConfigService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllNotificationConfigs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const NotificationConfigById = async (request, reply, fastify) => {
    try {
        const result = await notificationCofigByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/NotificationConfigById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveNotificationConfig = async (request, reply, fastify) => {
    try {
        const result = await createNotificationService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveNotificationConfig", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deletNotificationConfig = async (request, reply, fastify) => {
    try {
        const result = await deleteNotificationConfigService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deletNotificationConfig", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};


const activeInactiveNotificationConfig = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveNotificationConfigService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveNotificationConfig", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllNotificationConfigs,
    NotificationConfigById,
    saveNotificationConfig,
    deletNotificationConfig,
    activeInactiveNotificationConfig
};

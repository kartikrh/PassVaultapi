const {
    allPackageService,
    packageByIdService,
    createPackageService,
    deletePackageService,
    activeInactivePackageService,
    isDefaultChangeService,
    updateDisplayOrderService,
} = require("../../../../services/packages");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/packages/index.js";

const allPackages = async (request, reply, fastify) => {
    try {
        const result = await allPackageService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allPackages", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const packageById = async (request, reply, fastify) => {
    try {
        const result = await packageByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/packageById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const savePackage = async (request, reply, fastify) => {
    try {
        const result = await createPackageService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/savePackage", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deletePackage = async (request, reply, fastify) => {
    try {
        const result = await deletePackageService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deletePackage", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const activeInactivePackage = async (request, reply, fastify) => {
    try {
        const result = await activeInactivePackageService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactivePackage", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const isDefaultChange = async (request, reply, fastify) => {
    try {
        const result = await isDefaultChangeService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/isDefaultChange", request);
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
    allPackages,
    packageById,
    savePackage,
    deletePackage,
    activeInactivePackage,
    isDefaultChange,
    updateDisplayOrder,
};

const {
    getAllAutoImportDataService,
    getAutoImportDataByIdService,
    insertAutoImportDataService,
    deleteAutoImportDataService,
    updateAutoImportDataService,
    allAutoImportDataLogsService,
} = require("../../../../services/autoImportData");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/autoImportData/index.js";

const getAllAutoImportData = async (request, reply, fastify) => {
    try {
        const result = await getAllAutoImportDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllAutoImportData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getAutoImportDataById = async (request, reply, fastify) => {
    try {
        const result = await getAutoImportDataByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAutoImportDataById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const insertAutoImportData = async (request, reply, fastify) => {
    try {
        const result = await insertAutoImportDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/insertAutoImportData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const updateAutoImportData = async (request, reply, fastify) => {
    try {
        const result = await updateAutoImportDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/updateAutoImportData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const deleteAutoImportData = async (request, reply, fastify) => {
    try {
        const result = await deleteAutoImportDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteAutoImportData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const allAutoImportDataLogs = async (request, reply, fastify) => {
    try {
        const result = await allAutoImportDataLogsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allAutoImportDataLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllAutoImportData,
    insertAutoImportData,
    updateAutoImportData,
    deleteAutoImportData,
    allAutoImportDataLogs,
    getAutoImportDataById,
}
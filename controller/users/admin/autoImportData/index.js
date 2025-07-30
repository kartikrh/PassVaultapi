const {
    getAllAutoImportDataService,
    insertAutoImportDataService
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

const insertAutoImportData = async (request, reply, fastify) => {
    try {
        const result = await insertAutoImportDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/insertAutoImportData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllAutoImportData,
    insertAutoImportData
}
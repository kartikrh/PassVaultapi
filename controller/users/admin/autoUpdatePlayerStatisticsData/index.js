const { getAllAutoUpdatePlayerStatisticsDataService, insertAutoUpdatePlayerStatisticsDataService, updateAutoUpdatePlayerStatisticsDataService } = require("../../../../services/autoUpdatePlayerStatisticsData");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/autoUpdatePlayerStatisticsData/index.js";

const getAllAutoUpdatePlayerStatisticsData = async (request, reply, fastify) => {
    try {
        const result = await getAllAutoUpdatePlayerStatisticsDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllAutoUpdatePlayerStatisticsData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const insertAutoUpdatePlayerStatisticsData = async (request, reply, fastify) => {
    try {
        const result = await insertAutoUpdatePlayerStatisticsDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/insertAutoUpdatePlayerStatisticsData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const updateAutoUpdatePlayerStatisticsData = async (request, reply, fastify) => {
    try {
        const result = await updateAutoUpdatePlayerStatisticsDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/updateAutoUpdatePlayerStatisticsData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllAutoUpdatePlayerStatisticsData,
    insertAutoUpdatePlayerStatisticsData,
    updateAutoUpdatePlayerStatisticsData
}
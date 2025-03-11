const { saveMatchTypeService } = require("../../../../services/matchType");
const { getByMatchTypeService, saveMatchTypeDataService } = require("../../../../services/matchTypeBowlingPredictor");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

const commonPath = "controller/users/admin/matchTypeBowlingPredictor/index.js";

const getByMatchType = async (request, reply, fastify) => {
    try {
        const result = await getByMatchTypeService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getByMatchType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

const saveMatchTypeData = async (request, reply, fastify) => {
    try {
        const result = await saveMatchTypeDataService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveMatchType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
module.exports = {
    getByMatchType,
    saveMatchTypeData
};
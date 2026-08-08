const { success, error, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");
const { getAllLiveActivityTokensService } = require("../../../../services/liveActivityToken");

let commonPath = "controller/users/admin/liveActivityToken/index.js/";

const getAllLiveActivityTokens = async (request, reply, fastify) => {
    try {
        const result = await getAllLiveActivityTokensService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "getAllLiveActivityTokens", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllLiveActivityTokens
}
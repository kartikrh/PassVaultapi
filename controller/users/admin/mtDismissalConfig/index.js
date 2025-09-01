const {
    getAllMTDismissalConfigService,
} = require("../../../../services/mtDismissalConfig");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/mtDismissal/index.js";

const getAllMTDismissalConfig = async (request, reply, fastify) => {
    try {
        const result = await getAllMTDismissalConfigService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllMTDismissalConfig", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllMTDismissalConfig
};

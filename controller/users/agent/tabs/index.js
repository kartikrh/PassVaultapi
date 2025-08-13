const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const { getTabsService, getAgentWisePermissionService } = require("../../../../services/agent");

let commonPath = "controller/agent/tabs/index.js";

async function getTabs(request, reply, fastify) {
    try {
        const result = await getTabsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getTabs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

async function getAgentWisePermission(request, reply, fastify) {
    try {
        const result = await getAgentWisePermissionService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAgentWisePermission", request);
        reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
    }
}

module.exports = {
    getTabs,
    getAgentWisePermission,
}
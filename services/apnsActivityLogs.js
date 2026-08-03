const { insertAPNSActivityLogsQuery, getAllAPNSActivityLogsQuery } = require("../repository/TableAPNSActivityLogs");

const insertAPNSActivityLogsService = async (request, fastify) => {
    const result = await insertAPNSActivityLogsQuery(request, fastify);
    return result;
}

const getAllAPNSActivityLogsService = async (request, fastify) => {
    const result = await getAllAPNSActivityLogsQuery(request, fastify);
    return result;
}

module.exports = {
    insertAPNSActivityLogsService,
    getAllAPNSActivityLogsService
}
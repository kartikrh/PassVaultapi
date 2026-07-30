const { insertAPNSActivityLogsQuery } = require("../repository/TableAPNSActivityLogs");

const insertAPNSActivityLogsService = async (request, fastify) => {
    const result = await insertAPNSActivityLogsQuery(request, fastify);
    return result;
}

module.exports = {
    insertAPNSActivityLogsService
}
const { insertAPNSActivityLogsQuery, getAllAPNSActivityLogsQuery, deleteAPNSActivityLogsByIdQuery } = require("../repository/TableAPNSActivityLogs");

const insertAPNSActivityLogsService = async (request, fastify) => {
    const result = await insertAPNSActivityLogsQuery(request, fastify);
    return result;
}

const getAllAPNSActivityLogsService = async (request, fastify) => {
    const result = await getAllAPNSActivityLogsQuery(request, fastify);
    return result;
}

const deleteAPNSActivityLogsByIdService = async (request, fastify) => {
    await deleteAPNSActivityLogsByIdQuery(request, fastify);
    return `APNS Activity Logs successfully deleted`;
}

module.exports = {
    insertAPNSActivityLogsService,
    getAllAPNSActivityLogsService,
    deleteAPNSActivityLogsByIdService
}
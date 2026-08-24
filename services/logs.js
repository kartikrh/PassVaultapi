const {
    allErrorLogsQuery,
} = require("../repository/TableLogs");

const allErrorLogs = async (request, fastify) => {
    return await allErrorLogsQuery(request.body || {},request, fastify);
};

module.exports = {
    allErrorLogs,
};

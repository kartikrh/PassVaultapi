const {insertCommentaryScoringLogsQuery, allCommentaryScoringLogsQuery} = require("../repository/TableCommentaryScoringLogs");


const allCommentaryScoringLogs = async (request, fastify) => {
    return await allCommentaryScoringLogsQuery(request.body || {}, request, fastify);
};

const saveCommentaryScoringLogs = async (request, fastify) => {
    const body = request.body
    return await insertCommentaryScoringLogsQuery(body, fastify, request);
};


module.exports = {
    allCommentaryScoringLogs,
    saveCommentaryScoringLogs
};
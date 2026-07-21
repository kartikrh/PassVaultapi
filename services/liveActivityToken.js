const {
    upsertLiveActivityTokenQuery,
    deleteLiveActivityTokensQuery,
    getAllLiveActivityTokensByCommentaryQuery,
    deleteExpiredLiveActivityTokensQuery,
    deleteLiveActivityTokenByIdQuery,
} = require("../repository/TableLiveActivityToken");

const registerLiveActivityTokenService = async (request, fastify) => {
    const validateUser = global.tblClient.find((user) => user.clientId === request.body.userId);
    if (!validateUser) {
        throw new Error("User not existed");
    }

    const validateCommentary = global.tblCommentaries.find((com) => com.commentaryId === request.body.commentaryId);
    if (!validateCommentary) {
        throw new Error("Commentary not existed");
    }

    const data = await upsertLiveActivityTokenQuery(request, fastify);
    return data;
}

const unRegisterLiveActivityTokenService = async (request, fastify) => {
    const { userId, commentaryId } = request.body;
    await deleteLiveActivityTokensQuery({ userId, commentaryId }, fastify, request);
    return `Live Activity Token(s) deleted successfully`;
}

const getAllLiveActivityTokensByCommentaryService = async (request, fastify) => {
    const commentaryLiveActivityData = await getAllLiveActivityTokensByCommentaryQuery(request, fastify);
    return commentaryLiveActivityData;
}

const deleteExpiredLiveActivityTokenService = async (request, fastify) => {
    await deleteExpiredLiveActivityTokensQuery(fastify, request);
    return `Expired Live Activity Token(s) deleted successfully`;
}

const deleteLiveActivityTokenByIdService = async (request, fastify) => {
    const { id } = request.body;
    await deleteLiveActivityTokenByIdQuery(id, fastify, request);
    return `Live Activity Token deleted successfully`;
}

module.exports = {
    registerLiveActivityTokenService,
    unRegisterLiveActivityTokenService,
    getAllLiveActivityTokensByCommentaryService,
    deleteExpiredLiveActivityTokenService,
    deleteLiveActivityTokenByIdService
}
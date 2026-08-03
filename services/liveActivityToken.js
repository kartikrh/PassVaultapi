const {
    upsertLiveActivityTokenQuery,
    deleteLiveActivityTokensQuery,
    getAllLiveActivityTokensByCommentaryQuery,
    deleteExpiredLiveActivityTokensQuery,
    deleteLiveActivityTokenByIdQuery,
    getAllLiveActivityTokensQuery,
} = require("../repository/TableLiveActivityToken");
const { getIdByValue } = require("../repository/TableUser")

const registerLiveActivityTokenService = async (request, fastify) => {
    const checkExist = await getIdByValue({ clientId: request.body.userId }, request, fastify);
    if (!checkExist) {
        throw new Error("Invalid UserId");
    }
    request.body.userId = checkExist.clientId;

    const validateCommentary = global.tblCommentaries.find((com) => com.commentaryId === request.body.commentaryId);
    if (!validateCommentary) {
        throw new Error("Commentary not existed");
    }

    const data = await upsertLiveActivityTokenQuery(request, fastify);
    return data;
}

const unRegisterLiveActivityTokenService = async (request, fastify) => {
    const checkExist = await getIdByValue({ clientId: request.body.userId }, request, fastify);
    if (!checkExist) {
        throw new Error("Invalid UserId");
    }
    await deleteLiveActivityTokensQuery({ userId: checkExist.clientId, commentaryId: request.body.commentaryId, clientSocketId: request.body.clientSocketId }, fastify, request);
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

const getAllLiveActivityTokensService = async (request, fastify) => {
    const commentaryLiveActivityData = await getAllLiveActivityTokensQuery(request, fastify);
    return commentaryLiveActivityData;
}

module.exports = {
    registerLiveActivityTokenService,
    unRegisterLiveActivityTokenService,
    getAllLiveActivityTokensByCommentaryService,
    deleteExpiredLiveActivityTokenService,
    deleteLiveActivityTokenByIdService,
    getAllLiveActivityTokensService
}
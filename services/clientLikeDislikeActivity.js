const { getByClientTypeRefIdQuery, insertClientLikeDislikeActivityQuery, updateClientLikeDislikeActivityQuery, getlikeDislikeByTypeRefIdQuery } = require("../repository/TableClientLikeDislikeActivity");
const { getOriginalIdFromEncryptedId } = require("../repository/TableUser");

const checkClientService = async (request, fastify) => {
    const clientId = request.body.clientId;
    let getClientId = await getOriginalIdFromEncryptedId(clientId, fastify);
    if (!getClientId) {
        throw new Error(`Client with this encrypted id ${clientId} not found!`);
    }

    const checkExist = global.tblClient.find(item => item.clientId === getClientId && item.isActive === true);
    if (!checkExist) {
        throw new Error(`Client with this id ${getClientId} not found!`);
    }

    return checkExist;
}

const getByClientTypeRefIdService = async (request, fastify) => {
    const client = await checkClientService(request, fastify);
    request.body.clientId = client.clientId;
    return await getByClientTypeRefIdQuery(request, fastify);
};

const saveClientLikeDislikeActivityService = async (request, fastify) => {
    let result = null;
    const client = await checkClientService(request, fastify);
    request.body.clientId = client.clientId;
    let exists = await getByClientTypeRefIdQuery(request, fastify);
    exists = exists?.[0];
    if (exists) {
        const newBody = {
            id: exists.id,
            isLike: request.body.isLike
        };
        result = await updateClientLikeDislikeActivityQuery({
            ...request,
            body: newBody
        }, fastify);
    } else {
        result = await insertClientLikeDislikeActivityQuery(request, fastify);
    }
    result = result?.[0];

    let response = null;
    if (result?.type === 1) {
        const index = global.tblVideoLibrary.findIndex(item => item.id === result.refId);
        if (index !== -1) {
            const getLatest = await getlikeDislikeByTypeRefIdQuery({
                ...request,
                body: {
                    type: result.type,
                    refId: global.tblVideoLibrary[index].id
                }
            }, fastify);
            global.tblVideoLibrary[index].likeCount = getLatest?.[0].likeCount || 0;
            global.tblVideoLibrary[index].dislikeCount = getLatest?.[0].dislikeCount || 0;
            response = {
                ...global.tblVideoLibrary[index],
                likeDislikeType: 1
            };
            global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => item.id !== global.tblVideoLibrary[index].id);
        }
    }

    return response;
};

module.exports = {
    getByClientTypeRefIdService,
    saveClientLikeDislikeActivityService
}
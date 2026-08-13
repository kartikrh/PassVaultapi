const { getByClientTypeRefIdQuery, insertClientLikeDislikeActivityQuery, updateClientLikeDislikeActivityQuery, getlikeDislikeByTypeRefIdQuery } = require("../repository/TableClientLikeDislikeActivity");
const { getOriginalIdFromEncryptedId } = require("../repository/TableUser");
const { checkDataSendToClient, callClientAPI, APIEndpointModuleType, ViewerType } = require("../utilities");

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
    if (request.body.whitelabelId) {
        request.body.whitelabelId = global.tblWhitelabels.find(twl => twl.whitelabelId === request.body.whitelabelId)?.id;
    }
    const result = await getByClientTypeRefIdQuery(request, fastify);
    return result?.[0];
};

const saveClientLikeDislikeActivityService = async (request, fastify) => {
    let result = null, response = null;
    const client = await checkClientService(request, fastify);
    request.body.clientId = client.clientId;
    if (request.body.whitelabelId) {
        request.body.whitelabelId = global.tblWhitelabels.find(twl => twl.whitelabelId === request.body.whitelabelId)?.id;
    }
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

    if (result?.type === ViewerType.VIDEO_LIBRARY) {
        const index = global.tblVideoLibrary.findIndex(item => item.id === result.refId);
        if (index !== -1) {
            const getLatest = await getlikeDislikeByTypeRefIdQuery({
                ...request,
                body: {
                    type: result.type,
                    refId: global.tblVideoLibrary[index].id,
                    whitelabelId: [request.body.whitelabelId]
                }
            }, fastify);
            global.tblVideoLibrary[index].whitelabelId = global.tblVideoLibrary[index].whitelabelId?.map(wid => {
                if (request.body.whitelabelId === wid.id) {
                    return {
                        ...wid,
                        likeCount: getLatest?.[0].likeCount || 0,
                        dislikeCount: getLatest?.[0].dislikeCount || 0
                    }
                }
                return wid;
            })
            response = {
                ...global.tblVideoLibrary[index],
                activityType: ViewerType.VIDEO_LIBRARY
            };
        }
    }

    return response;
};

module.exports = {
    getByClientTypeRefIdService,
    saveClientLikeDislikeActivityService
}
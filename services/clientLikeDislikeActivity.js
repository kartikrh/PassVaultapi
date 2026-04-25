const { getByClientTypeRefIdQuery, insertClientLikeDislikeActivityQuery, updateClientLikeDislikeActivityQuery, getlikeDislikeByTypeRefIdQuery } = require("../repository/TableClientLikeDislikeActivity");
const { ServiceType, APIEndpointModuleType, callClientAPI } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const getByClientTypeRefIdService = async (request, fastify) => {
    return await getByClientTypeRefIdQuery(request, fastify);
};

const saveClientLikeDislikeActivityService = async (request, fastify) => {
    let result = null;
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
            result = global.tblVideoLibrary[index];
            global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => item.id !== global.tblVideoLibrary[index].id);

            callClientAPI(
                {
                    serviceType: ServiceType.clientAPI,
                    moduleType: APIEndpointModuleType.updateSeoModule,
                    data: {
                        module: 'videoLibrary',
                        type: "update",
                        data: global.tblVideoLibrary[index]
                    }
                }, request, fastify)
                .catch((err) => {
                    errorLogger(
                        fastify,
                        err.message,
                        "services/clientLikeDislikeActivity.js/saveClientLikeDislikeActivityService - callClientAPI",
                        request
                    );
                });
        }
    }

    return result;
};

module.exports = {
    getByClientTypeRefIdService,
    saveClientLikeDislikeActivityService
}
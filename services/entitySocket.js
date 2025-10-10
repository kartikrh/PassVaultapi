const {
    createEntitySocketQuery,
    updateEntitySocketQuery,
    deleteEntitySocketQuery,
    updateActiveInactiveEntitySocketQuery,
    updateEntityActionTypeQuery,
    isAutoScoreUpdateEntitySocketQuery,
    isAutoUpdateCommentaryEntitySocketQuery,
} = require("../repository/TableEntitySockets");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { storeImageOnServer, removeImageFromServer, generateImageName } = require("../utilities/Images");
const { 
    connectEntitySport,
    disconnectEntitySports, 
    disconnectInactiveEntityClients,
    disconnectIsAutoScoreUpdateFalseEntityClients,
} = require("../sockets/enitySport");
const { clientSocketActionType } = require("../utilities");

const getAllEntitySocketService = async (request, fastify) => {
    const { isActive } = request.body;
    if (isActive === undefined) {
        return global.tblEntitySockets || [];
    }
    return global.tblEntitySockets.filter((item) => item.isActive === isActive) || [];
}

const getEntitySocketByIdService = async (request, fastify) => {
    let result = global.tblEntitySockets.find((item) =>
        item.entitySocketId === request.body.entitySocketId
    );
    return result || null;
}

const saveEntitySocketService = async (request, fastify) => {
    const { entitySocketId } = request.body;
    if (entitySocketId === 0) {
        return await createEntitySocketService(request, fastify);
    } else {
        return await updateEntitySocketService(request, fastify);
    }
}

const createEntitySocketService = async (request, fastify) => {
    const { url } = request.body;
    let result = global.tblEntitySockets.find((item) => item.url.toLowerCase() === url.toLowerCase());
    if (result) {
        throw new Error("This Entity Url already exists");
    }

    const projectConfig = global.tblConfigs.find(
        (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase()
    );
    const projectName = projectConfig?.value;
    if (!projectName) {
        throw new Error("Project name not found in configuration");
    }

    const processImage = async (imageArray, moduleConfig) => {
        const imgName = generateImageName({
            // name: request.body.serverName
            name: request.body.serverName.replace(/\s+/g, '')
        });

        const { fullPath, imagePath } = await storeImageOnServer({
            image: imageArray[0],
            name: imgName,
            project: projectName,
            ...moduleConfig,
        });

        return { fullPath, imagePath };
    };

    if (request.body.defaultPlayerImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultPlayerImage,
            ImgModuleConfig.Players
        );
        request.body.defaultPlayerImage = fullPath;
        request.body.defaultPlayerImagePath = imagePath;
    }

    if (request.body.defaultTeamImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultTeamImage,
            ImgModuleConfig.Teams
        );
        request.body.defaultTeamImage = fullPath;
        request.body.defaultTeamImagePath = imagePath;
    }

    if (request.body.defaultJerseyImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultJerseyImage,
            ImgModuleConfig.Teams
        );
        request.body.defaultJerseyImage = fullPath;
        request.body.defaultJerseyImagePath = imagePath;
    }

    const data = await createEntitySocketQuery(
        {
            ...request.body,
            url: url.trim()
        },
        request,
        fastify
    )

    global.tblEntitySockets.push(data);
    return data;
}

const updateEntitySocketService = async (request, fastify) => {
    const { entitySocketId, url } = request.body;
    const result = global.tblEntitySockets.find((item) => item.entitySocketId === entitySocketId);
    if (!result) {
        throw new Error("Entity with this id not found");
    }

    const body = {
        entitySocketId: entitySocketId,
        url: url.trim(),
        isActive: request.body.hasOwnProperty("isActive") ? request.body.isActive : result.isActive,
        serverName: request.body.serverName || result.serverName,
        status: request.body.status || result.status,
        reconnectDelay: request.body.reconnectDelay || result.reconnectDelay,
        reconnectAttempts: request.body.reconnectAttempts || result.reconnectAttempts,
        reconnectMaxDelay: request.body.reconnectMaxDelay || result.reconnectMaxDelay,
        reconnectCount: request.body.reconnectCount || result.reconnectCount,
        actionType: request.body.actionType || result.actionType,
        isAutoUpdateCommentary: request.body.isAutoUpdateCommentary || result.isAutoUpdateCommentary,
        defaultPlayerImage: result.defaultPlayerImage,
        defaultPlayerImagePath: result.defaultPlayerImagePath,
        defaultTeamImage: result.defaultTeamImage,
        defaultTeamImagePath: result.defaultTeamImagePath,
        defaultJerseyImage: result.defaultJerseyImage,
        defaultJerseyImagePath: result.defaultJerseyImagePath,
        isAutoScoreUpdate: request.body.isAutoScoreUpdate || result.isAutoScoreUpdate,
    }
    const projectConfig = global.tblConfigs.find(
        (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase()
    );
    const projectName = projectConfig?.value;
    if (!projectName) {
        throw new Error("Project name not found in configuration");
    }

    const processImage = async (imageArray, moduleConfig) => {
        const imgName = generateImageName({
            name: request.body.serverName.replace(/\s+/g, '')
        });

        const { fullPath, imagePath } = await storeImageOnServer({
            image: imageArray[0],
            name: imgName,
            project: projectName,
            ...moduleConfig,
        });

        return { fullPath, imagePath };
    };

    if (request.body.defaultPlayerImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultPlayerImage,
            ImgModuleConfig.Players
        );
        body.defaultPlayerImage = fullPath;
        body.defaultPlayerImagePath = imagePath;
    }

    if (request.body.defaultTeamImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultTeamImage,
            ImgModuleConfig.Teams
        );
        body.defaultTeamImage = fullPath;
        body.defaultTeamImagePath = imagePath;
    }

    if (request.body.defaultJerseyImage?.length) {
        const { fullPath, imagePath } = await processImage(
            request.body.defaultJerseyImage,
            ImgModuleConfig.Teams
        );
        body.defaultJerseyImage = fullPath;
        body.defaultJerseyImagePath = imagePath;
    }

    const data = await updateEntitySocketQuery(
        body,
        request,
        fastify
    )
    const index = global.tblEntitySockets.findIndex((item) => item.entitySocketId === entitySocketId);
    if (index !== -1) {
        global.tblEntitySockets[index] = data
    }

    return data;
}

const deleteEntitySocketService = async (request, fastify) => {
    const { entitySocketId } = request.body;

    for (const id of entitySocketId) {
      const validateId = global.tblEntitySockets.find((item) => item.entitySocketId === id);
      if (validateId) {
        if (validateId.defaultPlayerImage) {
          await removeImageFromServer({ path: validateId.defaultPlayerImage });
        }

        if (validateId.defaultTeamImage) {
          await removeImageFromServer({ path: validateId.defaultTeamImage });
        }

        if (validateId.defaultJerseyImage) {
          await removeImageFromServer({ path: validateId.defaultJerseyImage });
        }
      }
    }
  
    await deleteEntitySocketQuery(
        entitySocketId,
        request,
        fastify
    )

    global.tblEntitySockets = global.tblEntitySockets.filter((item) =>
        !entitySocketId.includes(item.entitySocketId)
    );
    return `Entity Socket(s) deleted successfully`
}

const changeEntityActionTypeService = async (request, fastify) => {
    const { entitySocketId } = request.body;
    let indexOfId = [];
    for (id of entitySocketId) {
        let index = global.tblEntitySockets.findIndex((item) => item.entitySocketId === id);
        if (index === -1) {
            throw new Error(`Entity with id ${id} not found`);
        }
        indexOfId.push(index);
    }
    await updateEntityActionTypeQuery(
        {
            entitySocketId: entitySocketId,
            actionType: request.body.actionType
        },
        request,
        fastify
    )

    for (index of indexOfId) {
        global.tblEntitySockets[index].actionType = request.body.actionType;
    }
    if (request.body.actionType === clientSocketActionType.connect) {
        connectEntitySport(fastify);
    }
    else if (request.body.actionType === clientSocketActionType.disconnect) {
        disconnectEntitySports(fastify);
    }

    return `Entity Socket updated successfully`;
}

const activeInactiveEntitySocketService = async (request, fastify) => {
    const { entitySocketId, isActive } = request.body;
    let index = global.tblEntitySockets.findIndex((item) => item.entitySocketId === entitySocketId);
    if (index === -1) {
        throw new Error(`Entity with this id not found`);
    }
    await updateActiveInactiveEntitySocketQuery(
        request,
        fastify
    );
    global.tblEntitySockets[index].isActive = isActive;

    if (isActive === true) {
        connectEntitySport(fastify);
        disconnectEntitySports(fastify);
    } else {
        disconnectInactiveEntityClients(fastify);
    }

    return `Entity Socket updated successfully`;
}

const isAutoScoreUpdateEntitySocketService = async (request, fastify) => {
    const { entitySocketId, isAutoScoreUpdate } = request.body;
    let index = global.tblEntitySockets.findIndex((item) => item.entitySocketId === entitySocketId);
    if (index === -1) {
        throw new Error(`Entity with this id not found`);
    }
    await isAutoScoreUpdateEntitySocketQuery(request, fastify);
    
    global.tblEntitySockets[index].isAutoScoreUpdate = isAutoScoreUpdate;

    if (isAutoScoreUpdate == true) {
        connectEntitySport(fastify);
        disconnectEntitySports(fastify);
    } else {
        disconnectIsAutoScoreUpdateFalseEntityClients(fastify);
    }

    return `Entity Socket updated successfully`;
}

const isAutoUpdateCommentaryEntitySocketService = async (request, fastify) => {
    const { entitySocketId, isAutoUpdateCommentary } = request.body;
    let index = global.tblEntitySockets.findIndex((item) => item.entitySocketId === entitySocketId);
    if (index === -1) {
        throw new Error(`Entity with this id not found`);
    }
    await isAutoUpdateCommentaryEntitySocketQuery(request, fastify);

    global.tblEntitySockets[index].isAutoUpdateCommentary = isAutoUpdateCommentary;
    return `Entity Socket updated successfully`;
}

module.exports = {
    getAllEntitySocketService,
    getEntitySocketByIdService,
    saveEntitySocketService,
    deleteEntitySocketService,
    changeEntityActionTypeService,
    activeInactiveEntitySocketService,
    isAutoScoreUpdateEntitySocketService,
    isAutoUpdateCommentaryEntitySocketService,
}
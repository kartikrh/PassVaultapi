const { 
    createClientSocketQuery,
    updateClientSocketQuery,
    deleteClientSocketQuery,
    updateActionTypeQuery,
    updateActiveInactiveClientSocketQuery,
    changeIsUpdateViewClientSocketQuery,
    resetAllClientSocketReconnectCountQuery,
    disconnectAllClientSocketQuery,
} = require("../repository/TableClientSocket");
// const { connectClients2, disconnectClients, disconnectInactiveClients,connectClients } = require("../sockets");
const { 
    clientSocketActionType, 
    callSocketCountClientAPI,
    APIEndpointModuleType, 
    clientSocketStatus,
 } = require("../utilities");
const { connectClients: newConnectClients, disconnectClientSockets } = require("../sockets/client");

const getAllClientSocketService = async (request, fastify) => {
    const {isActive} = request.body;
    if(isActive === undefined){
        return global.tblClientSocket || [];
    }
    return global.tblClientSocket.filter((item) => item.isActive === isActive) || [];
}
const getClientSocketByIdService = async (request, fastify) => {
    let result = global.tblClientSocket.find((item) => item.clientSocketId === request.body.clientSocketId);
    return result || {};
}
const saveClientSocketService = async (request, fastify) => {
    const {clientSocketId} = request.body;
    if(clientSocketId === 0){
       return await createClientSocketService(request, fastify);
    }
    else{
        return await updateClientSocketService(request, fastify);
    }
}
const createClientSocketService = async (request, fastify) => {
    // validate if url is unique
    const {url} = request.body;
    let result = global.tblClientSocket.find((item) => item.url.toLowerCase() === url.toLowerCase());
    if(result){
        throw new Error("This Client Url already exists");
    }
    const data = await createClientSocketQuery(
        {
            ...request.body,
            url : url.trim()
        },
        request,
        fastify
    )

    global.tblClientSocket.push(data);
    return data;

}
const socketCountService = async (request, fastify) => {
  try {
    const socketClientCount = await callSocketCountClientAPI(request, fastify);

    return {
      totalCount: socketClientCount.totalCount,
      rooms: socketClientCount.rooms,
      clients: socketClientCount.clients
    };
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "SERVICE ERROR --> services/clientSocket.js/socketCountService",
      request
    );
    return { totalCount: 0, rooms: {}, clients: [] };
  }
};

const updateClientSocketService = async (request, fastify) => {
    // validate id exists
    const {clientSocketId , url} = request.body;
    let result = global.tblClientSocket.find((item) => item.clientSocketId === clientSocketId);
    if(!result){
        throw new Error("Client with this id not found");
    }
    // // validate if url is unique
    // const urlData = global.tblClientSocket.find((item) => item.url.toLowerCase() === url.toLowerCase()
    // && item.clientSocketId !== clientSocketId);
    // if(urlData){
    //     throw new Error("This Client Url already exists");
    // }
    const body = {
        clientSocketId : clientSocketId,
        url : url.trim(),
        isActive : request.body.hasOwnProperty("isActive") ? request.body.isActive : result.isActive,
        serverName : request.body.serverName || result.serverName,
        status : request.body.status || result.status,
        reconnectDelay : request.body.reconnectDelay || result.reconnectDelay,
        reconnectAttempts : request.body.reconnectAttempts || result.reconnectAttempts,
        reconnectMaxDelay : request.body.reconnectMaxDelay || result.reconnectMaxDelay,
        reconnectCount : request.body.reconnectCount || result.reconnectCount,
        actionType : request.body.actionType || result.actionType,
        isUpdateView : request.body.hasOwnProperty("isUpdateView") ? request.body.isUpdateView : result.isUpdateView,
        updateInterval : request.body.updateInterval || result.updateInterval,
    }
    const data = await updateClientSocketQuery(
        body,
        request,
        fastify
    )
    // update the global variable
    global.tblClientSocket[
        global.tblClientSocket.findIndex((item) => item.clientSocketId === clientSocketId)
    ] = data;
    
    return data;
    

}

const deleteClientSocketService = async (request, fastify) => {
    const {clientSocketId} = request.body;

    await deleteClientSocketQuery(
        clientSocketId,
        request,
        fastify
    )

    global.tblClientSocket =
    global.tblClientSocket.filter((item) => !clientSocketId.includes(item.clientSocketId));
    return `Client Socket(s) deleted successfully`
}
const changeActionTypeService = async (request, fastify) => {
    //validate id exists
    const {clientSocketId} = request.body;
    // arr of id
    let indexOfId = [];
    for (id of clientSocketId){
        let index = global.tblClientSocket.findIndex((item) => item.clientSocketId === id);
        if(index === -1){
            throw new Error(`Client with id ${id} not found`);
        }
        indexOfId.push(index);
    }
    await updateActionTypeQuery(
        {
            clientSocketId : clientSocketId,
            actionType : request.body.actionType
        },
        request,
        fastify
    )

    for (index of indexOfId){
        global.tblClientSocket[index].actionType = request.body.actionType;
        const clientSocketId = global.tblClientSocket[index]?.clientSocketId
        if(request.body.actionType === clientSocketActionType.connect) {
            await newConnectClients(fastify, clientSocketId);
        } else if(request.body.actionType === clientSocketActionType.disconnect){
            await disconnectClientSockets(fastify, clientSocketId);
        }
    }
    // if(request.body.actionType === clientSocketActionType.connect){
    //     connectClients(fastify);
    // }
    // else if(request.body.actionType === clientSocketActionType.disconnect){
    //     disconnectClients(fastify);
    // }
    

    return `Client Socket updated successfully`;

}

const activeInactiveClientSocketService = async (request, fastify) => {
    const { clientSocketId, isActive } = request.body;
    //validate id exists
    let index = global.tblClientSocket.findIndex((item) => item.clientSocketId === clientSocketId);
    if (index === -1) {
        throw new Error(`Client with this id not found`);
    }
    await updateActiveInactiveClientSocketQuery(
        request,
        fastify
    )
    global.tblClientSocket[index].isActive = isActive;

    if (isActive) {
        await newConnectClients(fastify, clientSocketId);
    } else {
        await disconnectClientSockets(fastify, clientSocketId);
    }

    return `Client Socket updated successfully`;
}

const changeIsUpdateViewClientSocketService = async (request, fastify) => {
    const {clientSocketId, isUpdateView} = request.body;
    let index = global.tblClientSocket.findIndex((item) => item.clientSocketId === clientSocketId);
    if(index === -1){
        throw new Error(`Client with this id not found`);
    }
    await changeIsUpdateViewClientSocketQuery({clientSocketId, isUpdateView}, request, fastify)    
    global.tblClientSocket[index].isUpdateView = isUpdateView;

    return `Client Socket updated successfully`;
}

const resetAllClientSocketReconnectCountService = async (request, fastify) => {
    const result = await resetAllClientSocketReconnectCountQuery(request, fastify);
    for (const id of result) {
        const index = global.tblClientSocket.findIndex(item => item.clientSocketId === id.clientSocketId);
        if (index !== -1) {
            global.tblClientSocket[index].reconnectCount = 0;
        }
    }
    return result;
}

const disconnectAllClientSocketService = async (request, fastify) => {
    const result = await disconnectAllClientSocketQuery(request, fastify);
    for (const id of result) {
        const index = global.tblClientSocket.findIndex(item => item.clientSocketId === id.clientSocketId);
        if (index !== -1) {
            global.tblClientSocket[index].status = clientSocketStatus.disconnected;
        }
    }
    return result;
}

module.exports = {
    getAllClientSocketService,
    getClientSocketByIdService,
    saveClientSocketService,
    deleteClientSocketService,
    changeActionTypeService,
    activeInactiveClientSocketService,
    socketCountService,
    changeIsUpdateViewClientSocketService,
    resetAllClientSocketReconnectCountService,
    disconnectAllClientSocketService
}
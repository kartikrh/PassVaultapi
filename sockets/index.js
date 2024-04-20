
global.clientSocketIo = [];
const { io } = require("socket.io-client");
const { clientSocketActionType, clientSocketStatus } = require("../utilities");
const { updateClientSocketStatusQuery, updateReconnectCountQuery } = require("../repository/TableClientSocket");

const connectClients = async (fastify) => {
  try {
    const clientUrls = global.tblClientSocket.filter(
      (c) => c.isActive === true && c.actionType == clientSocketActionType.connect && c.status !== clientSocketStatus.connected
    );
    const promises = clientUrls.map(async (urlConfig) => {
      console.log(`Connecting to ${urlConfig.url}...`);
      const client = io(urlConfig.url, {
        transport: ["websocket"],
        query: { source: "admin-panel"},
        transportOptions: {
          polling: {
            extraHeaders: {
              Origin: 'http://localhost:3001'
            }
          }
        },
        reconnection: true,
        reconnectionDelay: urlConfig.reconnectDelay,
        reconnectionDelayMax: urlConfig.reconnectMaxDelay,
        reconnectionAttempts: urlConfig.reconnectAttempts,
      });

      // Attach event listeners for connection events
      client.on("connect", () => {
        updateClientSocketStatusQuery({
          clientSocketId : [urlConfig.clientSocketId],
          status : clientSocketStatus.connected
        },fastify);
        
        global.clientSocketIo.push({
            ...urlConfig,
            client,
        });
        // update status in global.tblClientSocket
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        global.tblClientSocket[index].status = clientSocketStatus.connected;      
      });
      client.on("connect_error", (error) => {
        console.log(`Connection error: ${error}`);
      });
      client.on("disconnect", () => {
        global.clientSocketIo = global.clientSocketIo.filter(
          (c) => c.client !== client
        );
        updateClientSocketStatusQuery({
          clientSocketId : [urlConfig.clientSocketId],
          status : clientSocketStatus.disconnected
        },fastify);
        
        // update status in global.tblClientSocket
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        global.tblClientSocket[index].status = clientSocketStatus.disconnected;
      });
      client.io.on("reconnect_attempt", (attemptNumber) => {
        updateReconnectCountQuery({
          clientSocketId : urlConfig.clientSocketId,
          reconnectCount : attemptNumber
        },fastify);

        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        global.tblClientSocket[index].reconnectCount = attemptNumber;
      });
      // client.io.on("reconnect", (attemptNumber) => {
      //   console.log(`Reconnected after ${attemptNumber} attempts`);
      //   updateClientSocketStatusQuery({
      //     clientSocketId : [urlConfig.clientSocketId],
      //     status : clientSocketStatus.reconnected
      //   },fastify);
        
      //   let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
      //   global.tblClientSocket[index].status = clientSocketStatus.reconnected;
      // });
    });

    // Wait for all client connections to be established
    await Promise.all(promises);
  } catch (error) {
    console.log("Error connecting clients:", error);
    // console.error("Error connecting clients:", error);
  }
};
const disconnectClients = async (fastify) => {
  try {
    const disconnectClientUrls = global.tblClientSocket.filter(
      (c) => c.isActive === true && c.actionType == clientSocketActionType.disconnect && c.status !== clientSocketStatus.disconnected
    );
    const promises = disconnectClientUrls?.map((client) => {
       const clientInstance = global.clientSocketIo.find((c) => c.clientSocketId === client.clientSocketId);
       clientInstance.client.disconnect();
    });
    await Promise.all(promises);
    const clientIds = disconnectClientUrls.map((c) => c.clientSocketId);
    updateClientSocketStatusQuery({
      clientSocketId : clientIds,
      status : clientSocketStatus.disconnected
    },fastify);
    // update in global.tblClientSocket
    global.tblClientSocket.forEach((c) => {
      if (clientIds.includes(c.clientSocketId)) {
        c.status = clientSocketStatus.disconnected;
      }
    });
    global.clientSocketIo = global.clientSocketIo.filter((c) => !disconnectClientUrls.includes(c.clientSocketId));
  } catch (error) {
    console.log("Error disconnecting clients:", error);
  }
}
const disconnectInactiveClients = async (fastify) => {
  try {
    // check if client is inactive and connected
    const inactiveClients = global.tblClientSocket.filter(
      (c) => c.isActive === false && c.status === clientSocketStatus.connected
    );
    const promises = inactiveClients?.map((client) => {
      const clientInstance = global.clientSocketIo.find((c) => c.clientSocketId === client.clientSocketId);
      clientInstance.client.disconnect();
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.log("Error disconnecting inactive clients:", error);
  }
}
module.exports = { connectClients ,disconnectClients,disconnectInactiveClients };


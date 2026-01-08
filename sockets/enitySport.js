global.entitySportSocketIo = [];
const { io } = require("socket.io-client");
const { clientSocketActionType, clientSocketStatus } = require("../utilities");
const {
  updateEntitySocketStatusQuery,
  updateReconnectCountQuery,
} = require("../repository/TableEntitySockets");
const { errorLogger } = require("../utilities/logger");
const { setEntityCom2Service } = require("../services/entitySport");
const { updateCommentaryPlayersFromEntityService } = require("../services/commentry");
const configConstants = require("../utilities/configConstants");
const { createDataQuery } = require("../repository/TableEntityDataLog");
const commentaryQueue = new Map();
let isProcessingQueue = false;

function addToQueue(payload, fastify) {
  if (!payload?.response?.match_id) return;let resul
  const matchId = payload.response.match_id;

  // Replace existing queued item if same matchId (avoid duplicates)
  commentaryQueue.set(matchId, { payload, fastify });
  processTimeout = setTimeout(() => {
    // console.log("addToQueue----")
    if (!isProcessingQueue) processQueue();
  }, 100);

}
async function processQueue() {
  if (isProcessingQueue) return; // Prevent multiple loops
  isProcessingQueue = true;

  while (commentaryQueue.size > 0) {
    const [matchId, { payload, fastify }] = commentaryQueue.entries().next().value;
    commentaryQueue.delete(matchId);

    try {
      // console.log("processQueue,,,,,")
      const request = { body: payload };
      await setEntityCom2Service(request, fastify);
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "Sockets/entitySports.js/processQueue",
        null,
        payload
      )
      console.error(`Error processing matchId ${matchId}:`, err);
    }

    // Optional small delay to ease DB load
    await new Promise((r) => setTimeout(r, 50));
  }

  isProcessingQueue = false;
}

const connectEntitySport = async (fastify, entitySocketId = undefined) => {
  try {
    // const entitySports = global.tblEntitySockets.filter(
    //   (c) => c.isActive === true 
    //     && c.actionType == clientSocketActionType.connect 
    //     && c.status !== clientSocketStatus.connected
    //     && c.isAutoScoreUpdate == true
    // );
    let entitySports;
    if (entitySocketId !== undefined) {
      entitySports = global.tblEntitySockets.filter(
        (c) => c.isActive === true && c.entitySocketId == entitySocketId
          && c.actionType == clientSocketActionType.connect 
          && c.status !== clientSocketStatus.connected
          && c.isAutoScoreUpdate == true
      );
    } else {
      entitySports = global.tblEntitySockets.filter(
        (c) => c.isActive === true 
          && c.actionType == clientSocketActionType.connect 
          && c.status !== clientSocketStatus.connected
          && c.isAutoScoreUpdate == true
      );
    }
    const promises = entitySports.map(async (urlConfig) => {
      const existing = global.entitySportSocketIo.find(
        (c) => c.url === urlConfig.url
      );
      
      // Check if existing connection is still active and connected
      const isConnected = existing && existing.client && 
        (existing.client.connected === true || 
         (existing.client.io && existing.client.io.connected === true));

      if (isConnected) {
        console.log(`Entity connection to ${urlConfig.url} already exists and is connected, skipping reconnection`);
        return; // Skip reconnection if already connected
      }

      // If existing but disconnected, clean it up properly
      if (existing) {
        const connectionState = existing.client ? 
          (existing.client.io ? existing.client.io.readyState : 'unknown') : 'no-client';
        const wasConnected = existing.client && existing.client.connected;
        
        console.log(`Cleaning up existing disconnected entity connection to ${urlConfig.url} (state: ${connectionState}, wasConnected: ${wasConnected})`);
        
        try {
          if (existing.client) {
            // Only disconnect if not already disconnected to avoid unnecessary operations
            if (existing.client.connected || (existing.client.io && existing.client.io.connected)) {
              existing.client.removeAllListeners();
              existing.client.disconnect(true);
            } else {
              // Already disconnected, just clean up listeners
              existing.client.removeAllListeners();
            }
          }
        } catch (err) {
          console.log(`Error cleaning up existing entity connection: ${err.message}`);
        }
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.url !== urlConfig.url
        );
      }
      const client = io(urlConfig.url, {
        transport: ["websocket"],
        query: { source: "admin-panel-entity" },
        reconnection: true,
        reconnectionDelay: urlConfig.reconnectDelay || 1000,
        reconnectionDelayMax: urlConfig.reconnectMaxDelay || 5000,
        reconnectionAttempts: urlConfig.reconnectAttempts || Infinity,
        timeout: 20000,
        pingInterval: 25000,
        pingTimeout: 60000,
        forceNew: true, // Force new connection to avoid reuse issues
        autoConnect: true,
      });

      // Attach event listeners for connection events
      client.on("connect", () => {
        global.socketIo.emit("entitysocketconnect", `Connected to entitySport - ${urlConfig.url}`);
        console.log(`Connected to entitySport - ${urlConfig.url}`);
        updateEntitySocketStatusQuery(
          {
            entitySocketId: [urlConfig.entitySocketId],
            status: clientSocketStatus.connected,
          },
          fastify
        ).catch((error) => {
          console.log("Error updating entity socket status:", error);
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/entitySports/connectEntitySport/connect",
            null
          );
        });
        // Remove any old socket just in case
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.url !== urlConfig.url
        );
        global.entitySportSocketIo.push({
          ...urlConfig,
          client,
        });
        // update status in global.tblEntitySockets
        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].status = clientSocketStatus.connected;
        } else {
          console.log(`Warning: Entity socket ${urlConfig.entitySocketId} not found in global.tblEntitySockets`);
        }

        client.on("entityScoreData", async (payload) => {
          try {
            // console.log("Received entity data from Backend A:", payload);
            const request = { body: payload };
            if (payload.api_type && payload.api_type == "match_push_obj") {
              let isLog = global.tblConfigs.find((c) => c.key == configConstants.ISENTITYDATALOG)?.value || "false";
              if(isLog == "false") { return true; }
              await createDataQuery({data : payload, matchId : payload.response.match_id}, fastify);
              // await setEntityCom2Service(request, fastify);
              console.log("entityScoreData.....")
              addToQueue(payload, fastify);
            } else if (
              payload?.response?.ball_event &&
              payload.response.ball_event.toLowerCase() == "playing-11 update"
            ) {
              const request = { body: payload };
              await updateCommentaryPlayersFromEntityService(request, fastify);
              let isLog = global.tblConfigs.find((c) => c.key == configConstants.ISENTITYDATALOG)?.value || "false";
              if(isLog == "false") { return true; }
              await createDataQuery({data : payload, matchId : payload.response.match_id}, fastify);
            } else {
              return true;
            }
          } catch (err) {
            console.error("Error saving entity data:", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> socketIo.js/entitySports/entityScoreDatahandler",
              null,
              payload
            );
          }
        });
      });
      client.on("connect_error", (error) => {
        console.log(`Entity Connection error ${urlConfig.url}: ${error.message || error} at ${new Date().toISOString()}`);
      });
      client.on("entitywebsocketconnect", (message) => {
        global.socketIo.emit("entitywebsocketconnect", message);
        errorLogger(
          fastify,
          message,
          "Entity Web Socket --> socketIo.js/entitySports/connectEntitySport - entitywebsocketconnect",
          null
        );
      })
      client.on("entitywebsocketdisconnect", (message) => {
        const newMessage = `Entity web socket disconnected, code: ${message.code} ${message?.reason !== "" ? `reason: ${message.reason}`: ""} at ${new Date().toISOString()}`;
        global.socketIo.emit("entitywebsocketdisconnect", newMessage);
        errorLogger(
          fastify,
          newMessage,
          "Entity Web Socket --> socketIo.js/entitySports/connectEntitySport - entitywebsocketdisconnect",
          null
        );
      })
      client.on("disconnect", (reason) => {
        const message = `Entity socket disconnected from ${urlConfig.url}, reason: ${reason} at ${new Date().toISOString()}`;
        global.socketIo.emit("entitydisconnect", message);
        errorLogger(
          fastify,
          message,
          "Entity Socket --> socketIo.js/entitySports/connectEntitySport - disconnect",
          null
        );
        
        // Log disconnect reason for debugging
        if (reason === "transport close") {
          console.log(`  → Transport closed (network issue or server closed connection)`);
        } else if (reason === "transport error") {
          console.log(`  → Transport error (network failure)`);
        } else if (reason === "ping timeout") {
          console.log(`  → Ping timeout (server not responding to pings)`);
        } else if (reason === "io server disconnect") {
          console.log(`  → Server initiated disconnect`);
        } else if (reason === "io client disconnect") {
          console.log(`  → Client initiated disconnect`);
        }
        
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.client !== client && c.url !== urlConfig.url
        );
        updateEntitySocketStatusQuery(
          {
            entitySocketId: [urlConfig.entitySocketId],
            status: clientSocketStatus.disconnected,
          },
          fastify
        ).catch((error) => {
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/entitySports/connectEntitySport",
            null
          );
        });

        // update status in global.tblEntitySockets
        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].status =
            clientSocketStatus.disconnected;
        }
      });
      client.io.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Entity Reconnect attempt: ${attemptNumber} for ${urlConfig.url} at ${new Date().toISOString()}`);
        updateReconnectCountQuery(
          {
            entitySocketId: urlConfig.entitySocketId,
            reconnectCount: attemptNumber,
          },
          fastify
        ).catch((error) => {
          console.log("Error updating entity reconnect count:", error);
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/entitySports/connectEntitySport/reconnect_attempt",
            null
          );
        });

        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].reconnectCount = attemptNumber;
        } else {
          console.log(`Warning: Entity socket ${urlConfig.entitySocketId} not found in global.tblEntitySockets during reconnect attempt`);
        }
      });

      client.io.on("reconnect", (attemptNumber) => {
        console.log(`Entity Reconnected to ${urlConfig.url} after ${attemptNumber} attempts at ${new Date().toISOString()}`);

        // Update database status on reconnect
        updateEntitySocketStatusQuery(
          {
            entitySocketId: [urlConfig.entitySocketId],
            status: clientSocketStatus.connected,
          },
          fastify
        ).catch((error) => {
          console.log("Error updating entity socket status on reconnect:", error);
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/entitySports/connectEntitySport/reconnect",
            null
          );
        });

        // Update status in global.tblEntitySockets
        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].status = clientSocketStatus.connected;
          global.tblEntitySockets[index].reconnectCount = 0;
        } else {
          console.log(`Warning: Entity socket ${urlConfig.entitySocketId} not found in global.tblEntitySockets on reconnect`);
        }

        // Ensure socket is in global.entitySportSocketIo array
        const existingInArray = global.entitySportSocketIo.findIndex(c => c.url === urlConfig.url);
        if (existingInArray === -1) {
          // Socket not in array, add it
          global.entitySportSocketIo.push({
            ...urlConfig,
            client,
          });
        } else {
          // Socket exists, update it with new client instance
          global.entitySportSocketIo[existingInArray] = {
            ...urlConfig,
            client,
          };
        }
      });

      client.io.on("reconnect_error", (error) => {
        console.log(`Entity Reconnect error ${urlConfig.url}: ${error.message || error} at ${new Date().toISOString()}`);
      });

      client.io.on("reconnect_failed", () => {
        console.log(`Entity Reconnect failed for ${urlConfig.url} after all attempts at ${new Date().toISOString()}`);
        // Clean up entry when all reconnection attempts are exhausted
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.client !== client && c.url !== urlConfig.url
        );
        
        // Persist status change to DB and reset reconnect count
        updateEntitySocketStatusQuery(
          {
            entitySocketId: [urlConfig.entitySocketId],
            status: clientSocketStatus.disconnected,
          },
          fastify
        ).catch((error) => {
          console.log("Error updating entity socket status on reconnect_failed:", error);
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/entitySports/connectEntitySport/reconnect_failed",
            null
          );
        });

        // Update status in global.tblEntitySockets
        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].status = clientSocketStatus.disconnected;
        }

        setTimeout(() => {
          console.log(`Retrying connection to ${urlConfig.url} after final failure...`);
          connectEntitySport(fastify, urlConfig.entitySocketId);
        }, 60000); // retry in 60 seconds
      });
    });

    // Wait for all client connections to be established
    await Promise.all(promises);
  } catch (error) {
    console.log("Entity Error connecting clients:", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/entitySports/connectEntitySport",
      null
    );
    // console.error("Error connecting clients:", error);
  }
};
const disconnectEntitySports = async (fastify, entitySocketId = undefined) => {
  try {
    // const disconnectClientUrls = global.tblEntitySockets.filter(
    //   (c) =>
    //     c.isActive === true &&
    //     c.actionType == clientSocketActionType.disconnect &&
    //     c.status !== clientSocketStatus.disconnected
    // );
    let disconnectClientUrls;
    if (entitySocketId !== undefined) {
      disconnectClientUrls = global.tblEntitySockets.filter(
        (c) =>
          c.isActive === true && c.entitySocketId === entitySocketId &&
          c.actionType == clientSocketActionType.disconnect &&
          c.status !== clientSocketStatus.disconnected
      );
    } else {
      disconnectClientUrls = global.tblEntitySockets.filter(
        (c) =>
          c.isActive === true &&
          c.actionType == clientSocketActionType.disconnect &&
          c.status !== clientSocketStatus.disconnected
      );
    }
    const promises = disconnectClientUrls?.map((client) => {
      const clientInstance = global.entitySportSocketIo.find(
        (c) => c.entitySocketId === client.entitySocketId
      );
      clientInstance?.client.disconnect();
    });
    await Promise.all(promises);
    const clientIds = disconnectClientUrls.map((c) => c.entitySocketId);
    updateEntitySocketStatusQuery(
      {
        entitySocketId: clientIds,
        status: clientSocketStatus.disconnected,
      },
      fastify
    ).catch((error) => {
      errorLogger(
        fastify,
        error.message,
        "DB Error --> socketIo.js/entitySports/disconnectEntitySports",
        null
      );
    });
    // update in global.tblEntitySockets
    global.tblEntitySockets.forEach((c) => {
      if (clientIds.includes(c.entitySocketId)) {
        c.status = clientSocketStatus.disconnected;
      }
    });
    global.entitySportSocketIo = global.entitySportSocketIo.filter(
      (c) => !disconnectClientUrls.includes(c.entitySocketId)
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/entitySports/disconnectEntitySports",
      null
    );
    console.log("Entity Error disconnecting clients:", error);
  }
};
const disconnectInactiveEntityClients = async (fastify) => {
  try {
    // check if client is inactive and connected
    const inactiveClients = global.tblEntitySockets.filter(
      (c) => c.isActive === false && c.status === clientSocketStatus.connected
    );
    const promises = inactiveClients?.map((client) => {
      const clientInstance = global.entitySportSocketIo.find(
        (c) => c.entitySocketId === client.entitySocketId
      );
      clientInstance.client.disconnect();
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.log("Entity Error disconnecting inactive clients:", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/entitySports/disconnectInactiveEntityClients",
      null
    );
  }
}
const disconnectIsAutoScoreUpdateFalseEntityClients = async (fastify) => {
  try {
    // check if client is inactive and connected
    const inactiveClients = global.tblEntitySockets.filter(
      (c) => c.isActive === true && c.status === clientSocketStatus.connected
        && c.isAutoScoreUpdate === false
    );
    const promises = inactiveClients?.map((client) => {
      const clientInstance = global.entitySportSocketIo.find((c) => c.entitySocketId === client.entitySocketId);
      clientInstance.client.disconnect();
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.log("Entity Error disconnecting isAutoScoreUpdate clients:", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/entitySports/disconnectIsAutoScoreUpdateFalseEntityClients",
      null
    );
  }
}
module.exports = { 
  connectEntitySport,
  disconnectEntitySports,
  disconnectInactiveEntityClients,
  disconnectIsAutoScoreUpdateFalseEntityClients,
};

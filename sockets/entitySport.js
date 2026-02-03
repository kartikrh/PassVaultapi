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
const commentaryQueue = new Map(); // {matchId: {payload, fastify}}
const matchIdLocks = new Map(); // {matchId: Promise} - ensures serial processing per matchId
let processTimeout = null;

/**
 * Per-matchId lock mechanism
 * Allows multiple matchIds to process in parallel
 * But ensures serial processing within each matchId (no duplicates)
 */
function getOrCreateLock(matchId) {
  if (!matchIdLocks.has(matchId)) {
    matchIdLocks.set(matchId, Promise.resolve()); // Start with resolved promise
  }
  return matchIdLocks.get(matchId);
}

function setLock(matchId, promise) {
  matchIdLocks.set(matchId, promise);
}

/**
 * Add payload to queue - only latest data per matchId is kept
 * Debounced processing with per-matchId locks
 */
function addToQueue(payload, fastify) {
  if (!payload?.response?.match_id) return;
  const matchId = payload.response.match_id;

  // Replace existing queued item with latest data (avoid duplicates)
  commentaryQueue.set(matchId, { payload, fastify });

  // Schedule processing if not already scheduled
  if (!processTimeout) {
    processTimeout = setTimeout(() => {
      processTimeout = null;
      processQueue();
    }, 500); // 300ms debounce to batch updates
  }
}

/**
 * Process queue - multiple matchIds in parallel, but serialized per matchId
 * Each matchId processes one at a time via locks
 */
async function processQueue() {
  if (commentaryQueue.size === 0) return;

  const processPromises = Array.from(commentaryQueue.entries()).map(
    ([matchId, { payload, fastify }]) => {
      // Remove from queue immediately
      commentaryQueue.delete(matchId);

      // Get existing lock for this matchId (creates new if doesn't exist)
      const currentLock = getOrCreateLock(matchId);

      // Chain new processing to the lock
      const newLock = currentLock.then(async () => {
        try {
          const request = { body: payload };
          await setEntityCom2Service(request, fastify);
          // console.log(`✓ Processed matchId ${matchId}`);
        } catch (err) {
          errorLogger(
            fastify,
            err.message,
            "Sockets/entitySports.js/processQueue",
            null,
            payload
          );
          // console.error(`✗ Error processing matchId ${matchId}:`, err.message);
        }
        // Small delay to ease DB load
        await new Promise((r) => setTimeout(r, 50));
      });

      // Update lock for this matchId
      setLock(matchId, newLock);

      // Cleanup: Delete lock after processing completes (prevents memory leak)
      newLock.finally(() => {
        // Only delete if no newer lock replaced it
        if (matchIdLocks.get(matchId) === newLock) {
          matchIdLocks.delete(matchId);
          // console.log(`🗑 Cleaned up lock for matchId ${matchId}`);
        }
      });

      return newLock;
    }
  );

  // Wait for all matchIds to complete their processing
  await Promise.all(processPromises);
}

const connectEntitySport = async (fastify, entitySocketId = undefined) => {
  try {
    let entitySports;
    if (entitySocketId) {
      entitySports = global.tblEntitySockets.filter(
        (c) => c.isActive === true && c.entitySocketId == entitySocketId
      );
    } else {
      entitySports = global.tblEntitySockets.filter(
        (c) => c.isActive === true
      );
    }

    const promisies = entitySports.map(async (urlConfig) => {
      if (urlConfig.status === clientSocketStatus.connected) {
        errorLogger(
          fastify,
          `Entity connection to ${urlConfig.url} already connected, skipping reconnection`,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - status - connected",
          null
        );
        return;
      }

      if (urlConfig.isAutoScoreUpdate === false) {
        errorLogger(
          fastify,
          `Auto score update is not active for ${urlConfig.url}`,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - isAutoScoreUpdate - false",
          null
        );
        return;
      }

      if (urlConfig.actionType === clientSocketStatus.disconnected) {
        errorLogger(
          fastify,
          `Entity sport action type is not connect for ${urlConfig.url}`,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - actionType - false",
          null
        );
        return;
      }

      const client = io(urlConfig.url, {
        transports: ["websocket"],
        query: { source: `admin-panel-entity-${urlConfig.serverName}` },
        reconnection: true,
        reconnectionDelay: urlConfig.reconnectDelay || 1000,
        reconnectionDelayMax: urlConfig.reconnectMaxDelay || 5000,
        reconnectionAttempts: urlConfig.reconnectAttempts || Infinity,
        timeout: 20000,
        pingInterval: 18000,
        pingTimeout: 10000,
      });

      client.on("connect", async () => {
        global.connectedEntitySocketClients.push({
          urlConfig,
          client,
          connectedAt: new Date()
        });
        global.socketIo.emit("entitysocketconnect", `Connected to entitySport - ${urlConfig.url} at ${new Date().toISOString()}`);

        try {
          await updateEntitySocketStatusQuery(
            {
              entitySocketId: [urlConfig.entitySocketId],
              status: clientSocketStatus.connected,
            },
            fastify
          );
        } catch (error) {
          errorLogger(
            fastify,
            error.message,
            "Entity Socket --> sockets/entitySports.js/connectEntitySport - connect - updateEntitySocketStatusQuery",
            null
          );
        }
      });

      client.on("disconnect", async (reason) => {
        global.connectedEntitySocketClients = global.connectedEntitySocketClients.filter(item => item.urlConfig.entitySocketId !== urlConfig.entitySocketId);
        global.socketIo.emit("entitysocketdisconnect", `Entity socket disconnected from ${urlConfig.url}, reason: ${reason} at ${new Date().toISOString()}`);

        try {
          await updateEntitySocketStatusQuery(
            {
              entitySocketId: [urlConfig.entitySocketId],
              status: clientSocketStatus.disconnected,
            },
            fastify
          );
        } catch (error) {
          errorLogger(
            fastify,
            error.message,
            "Entity Socket --> sockets/entitySports.js/connectEntitySport - disconnect - updateEntitySocketStatusQuery",
            null
          );
        }
      });

      client.on("entitywebsocketconnect", (message) => {
        global.socketIo.emit("entitywebsocketconnect", message);
      });

      client.on("entitywebsocketdisconnect", (message) => {
        global.socketIo.emit("entitywebsocketdisconnect", `Entity web socket disconnected, code: ${message.code} ${message?.reason !== "" ? `reason: ${message.reason}` : ""} at ${new Date().toISOString()}`);
      });

      client.io.on("reconnect_attempt", (attemptNumber) => {
        const reconnectCounts = global.tblEntitySockets.find(c => c.entitySocketId === urlConfig.entitySocketId)?.reconnectCount;
        updateReconnectCountQuery(
          {
            entitySocketId: urlConfig.entitySocketId,
            reconnectCount: Number(reconnectCounts ?? 0) + 1
          },
          fastify
        ).catch((error) => {
          errorLogger(
            fastify,
            error.message,
            "DB Error --> sockets/entitySports.js/connectEntitySport - reconnect_attempt - updateReconnectCountQuery",
            null
          );
        });
      });

      client.io.on("reconnect_error", (error) => {
        errorLogger(
          fastify,
          error.message,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - reconnect_error",
          null
        );
      });

      client.io.on("reconnect_failed", () => {
        errorLogger(
          fastify,
          null,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - reconnect_failed",
          null
        );
      });

      client.on("entityScoreData", async (payload) => {
        // console.log("🚀 ~ connectEntitySport ~ payload")
        try {
          // console.log("Received entity data from Backend A:", payload);
          const request = { body: payload };
          if (payload.api_type && payload.api_type == "match_push_obj") {
            let isLog = global.tblConfigs.find((c) => c.key == configConstants.ISENTITYDATALOG)?.value || "false";
            if (isLog == "false") { return true; }
            await createDataQuery({ data: payload, matchId: payload.response.match_id }, fastify);
            // await setEntityCom2Service(request, fastify);
            // console.log("entityScoreData.....")
            addToQueue(payload, fastify);
          } else if (
            payload?.response?.ball_event &&
            payload.response.ball_event.toLowerCase() == "playing-11 update"
          ) {
            const request = { body: payload };
            await updateCommentaryPlayersFromEntityService(request, fastify);
            let isLog = global.tblConfigs.find((c) => c.key == configConstants.ISENTITYDATALOG)?.value || "false";
            if (isLog == "false") { return true; }
            await createDataQuery({ data: payload, matchId: payload.response.match_id }, fastify);
          } else {
            return true;
          }
        } catch (err) {
          console.error("Error saving entity data:", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> sockets/entitySports.js/connectEntitySport - entityScoreData",
            null,
            payload
          );
        }
      });
    });

    await Promise.all(promisies);
  } catch (error) {
    console.log("Entity Error connecting clients:", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> sockets/entitySports.js/connectEntitySport",
      null
    );
    // console.error("Error connecting clients:", error);
  }
};
const disconnectEntitySports = async (fastify, entitySocketId = undefined) => {
  try {
    let disconnectClientUrls;
    if (entitySocketId) {
      disconnectClientUrls = global.tblEntitySockets.filter(
        (c) => c.entitySocketId === entitySocketId
      );
    } else {
      disconnectClientUrls = global.tblEntitySockets;
    }
    const promises = disconnectClientUrls?.map(async (client) => {
      const entitySocket = global.connectedEntitySocketClients.find(item => item.urlConfig.entitySocketId === client.entitySocketId);
      if (entitySocket) {
        entitySocket?.client?.disconnect(true);
        entitySocket?.client?.removeAllListeners();
      }

      try {
        await updateEntitySocketStatusQuery(
          {
            entitySocketId: [client.entitySocketId],
            status: clientSocketStatus.disconnected,
          },
          fastify
        );
      } catch (error) {
        errorLogger(
          fastify,
          error.message,
          "DB Error --> sockets/entitySports.js/disconnectEntitySports - updateEntitySocketStatusQuery",
          null
        );
      }
    });
    await Promise.all(promises);
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> sockets/entitySports.js/disconnectEntitySports",
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

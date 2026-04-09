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
const { default: pLimit } = require("p-limit");
const Sentry = require("@sentry/node");
const commentaryQueue = new Map(); // {matchId: {payload, fastify}}
const matchIdLocks = new Map(); // {matchId: {promise, lastActivity}} - combined lock + activity tracking
let processTimeout = null;

// Memory management constants
const MAX_QUEUE_SIZE = 200; // Prevent unbounded queue growth
const LOCK_CLEANUP_INTERVAL = 60000; // Clean stale locks every 60s
const LOCK_IDLE_TIMEOUT = 30000; // Remove locks idle for 30s
const CONCURRENCY_LIMIT = 10;
const limit = pLimit(CONCURRENCY_LIMIT);


/**
 * Cleanup stale locks periodically to prevent memory leak
 * Uses single Map instead of separate activity tracking
 */
setInterval(() => {
  const now = Date.now();
  let removedCount = 0;
  for (const [matchId, lockData] of matchIdLocks.entries()) {
    if (now - lockData.lastActivity > LOCK_IDLE_TIMEOUT) {
      matchIdLocks.delete(matchId);
      removedCount++;
    }
  }
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} stale locks. Current locks: ${matchIdLocks.size}, Queue size: ${commentaryQueue.size}`);
  }
}, LOCK_CLEANUP_INTERVAL);

/**
 * Per-matchId lock mechanism
 * Allows multiple matchIds to process in parallel
 * But ensures serial processing within each matchId (no duplicates)
 */
function getOrCreateLock(matchId) {
  if (!matchIdLocks.has(matchId)) {
    matchIdLocks.set(matchId, {
      promise: Promise.resolve(),
      lastActivity: Date.now()
    });
  } else {
    // Update activity time
    matchIdLocks.get(matchId).lastActivity = Date.now();
  }
  return matchIdLocks.get(matchId).promise;
}

function setLock(matchId, promise) {
  matchIdLocks.set(matchId, {
    promise: promise,
    lastActivity: Date.now()
  });
}

/**
 * Add payload to queue - only latest data per matchId is kept
 * Debounced processing with per-matchId locks
 */
function addToQueue(payload, fastify) {
  if (!payload?.response?.match_id) return;
  const matchId = payload.response.match_id;

  // Prevent unbounded queue growth
  if (commentaryQueue.size >= MAX_QUEUE_SIZE) {
    console.warn(`Queue size exceeded ${MAX_QUEUE_SIZE}. Dropping oldest items.`);
    // Drop first item to make room
    const firstKey = commentaryQueue.keys().next().value;
    if (firstKey) {
      commentaryQueue.delete(firstKey);
    }
  }

  commentaryQueue.set(matchId, {
    payload,
    enqueuedAt: Date.now(),
  });

  // Schedule processing if not already scheduled
  if (!processTimeout) {
    processTimeout = setTimeout(() => {
      processTimeout = null;
      processQueue(fastify);
    }, 500); // 300ms debounce to batch updates
  }
}

/**
 * Process queue - multiple matchIds in parallel, but serialized per matchId
 * Each matchId processes one at a time via locks
 */
async function processQueue(fastify) {
  if (commentaryQueue.size === 0) return;

  const entries = Array.from(commentaryQueue.entries());
  commentaryQueue.clear(); // clear immediately to free memory

  for (const [matchId, { payload, enqueuedAt }] of entries) {
    const currentLock = getOrCreateLock(matchId);

    const newLock = currentLock
      .then(() =>
        limit(async () => {
          let transaction;
          let processSpan;
          try {
            if (process.env.ENABLE_SENTRY === "TRUE") {
              transaction = Sentry.startTransaction({
                name: `entityScoreData:${matchId}`,
                op: "queue.process",
                description: "Process entityScoreData payload from queue",
              });
              transaction.setData("matchId", matchId);
              transaction.setData("api_type", payload?.api_type || null);
              transaction.setData("queueDelayMs", Date.now() - enqueuedAt);

              processSpan = transaction.startChild({
                op: "service.call",
                description: "Execute setEntityCom2Service",
              });
            }

            const request = {
              body: payload,
              userTokenInfo: { WrUserId: -2 },
            };

            await setEntityCom2Service(request, fastify);

            if (processSpan) {
              processSpan.setStatus("ok");
              processSpan.finish();
            }
            if (transaction) {
              transaction.setStatus("ok");
            }
          } catch (err) {
            if (processSpan) {
              processSpan.setStatus("internal_error");
              processSpan.finish();
            }
            if (transaction) {
              transaction.setStatus("internal_error");
              Sentry.captureException(err);
            }
            errorLogger(
              fastify,
              err.message,
              "Sockets/entitySports.js/processQueue",
              null,
              payload
            );
          } finally {
            if (transaction) {
              transaction.finish();
            }
          }

          // small delay (reduced)
          await new Promise((r) => setTimeout(r, 5));
        })
      )
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "Lock processing error",
          null
        );
      });

    setLock(matchId, newLock);

    // IMPORTANT: no Promise.all → prevents memory spike
    newLock
    .catch(() => {})
    .finally(() => {
      // cleanup lock safely
      if (matchIdLocks.get(matchId)?.promise === newLock) {
        matchIdLocks.delete(matchId);
      }
    });
  }

  console.log(
    `Processed batch. Active locks: ${matchIdLocks.size}, Queue: ${commentaryQueue.size}`
  );
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
          `Entity connection to ${urlConfig.serverName} already connected, skipping reconnection`,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - status - connected",
          null
        );
        return;
      }

      if (urlConfig.isAutoScoreUpdate === false) {
        errorLogger(
          fastify,
          `Auto score update is not active for ${urlConfig.serverName}`,
          "Entity Socket --> sockets/entitySports.js/connectEntitySport - isAutoScoreUpdate - false",
          null
        );
        return;
      }

      if (urlConfig.actionType === clientSocketStatus.disconnected) {
        errorLogger(
          fastify,
          `Entity sport action type is not connect for ${urlConfig.serverName}`,
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

      // Clean up any existing socket listeners to prevent accumulation
      client.removeAllListeners("connect");
      client.removeAllListeners("disconnect");
      client.removeAllListeners("entitywebsocketconnect");
      client.removeAllListeners("entitywebsocketdisconnect");
      client.removeAllListeners("entityScoreData");

      client.on("connect", async () => {
        global.connectedEntitySocketClients.push({
          urlConfig,
          client,
          connectedAt: new Date()
        });
        global.socketIo.emit("entitysocketconnect", `Connected to entitySport - ${urlConfig.serverName} at ${new Date().toISOString()}`);

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
        global.socketIo.emit("entitysocketdisconnect", `Entity socket disconnected from ${urlConfig.serverName}, reason: ${reason} at ${new Date().toISOString()}`);

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

      // Clean up any existing reconnect listeners to prevent accumulation during reconnection
      client.io.removeAllListeners("reconnect_attempt");
      client.io.removeAllListeners("reconnect_error");
      client.io.removeAllListeners("reconnect_failed");

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
          `${urlConfig.serverName} Error: ${error.message}`,
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
        // let transaction;
        // if (process.env.ENABLE_SENTRY === "TRUE") {
        //   transaction = Sentry.startTransaction({
        //     name: `entityScoreData:event:${payload.response?.match_id || 'unknown'}`,
        //     op: "socket.event",
        //     description: "Handle entityScoreData socket event",
        //   });
        //   transaction.setData("api_type", payload?.api_type);
        //   transaction.setData("matchId", payload.response?.match_id);
        // }

        try {
          // console.log("🚀 ~ connectEntitySport ~ payload")
          // console.log("Received entity data from Backend A:", payload);
          const request = { body: payload };
          if (payload.api_type && payload.api_type == "match_push_obj") {
            let exist = global.tblCommentaries?.some(c => c.tpId == payload.response.match_id) || null;
            if(!exist) {
              return true;
            }
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
            const request = { body: payload, userTokenInfo: { WrUserId: -2 } };
            await updateCommentaryPlayersFromEntityService(request, fastify);
            let isLog = global.tblConfigs.find((c) => c.key == configConstants.ISENTITYDATALOG)?.value || "false";
            if (isLog == "false") { return true; }
            await createDataQuery({ data: payload, matchId: payload.response.match_id }, fastify);
          } else {
            return true;
          }

          // if (transaction) {
          //   transaction.setStatus("ok");
          // }
        } catch (err) {
          console.error("Error saving entity data:", err);
          // if (transaction) {
          //   transaction.setStatus("internal_error");
          //   Sentry.captureException(err);
          // }
          errorLogger(
            fastify,
            err.message,
            "ERROR --> sockets/entitySports.js/connectEntitySport - entityScoreData",
            null,
            payload
          );
        } finally {
          // if (transaction) {
          //   transaction.finish();
          // }
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

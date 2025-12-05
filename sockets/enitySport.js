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
      if (existing) {
        existing.client.disconnect(true);
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.url !== urlConfig.url
        );
      }
      const client = io(urlConfig.url, {
        transport: ["websocket"],
        query: { source: "admin-panel-entity" },
        reconnection: true,
        reconnectionDelay: urlConfig.reconnectDelay,
        reconnectionDelayMax: urlConfig.reconnectMaxDelay,
        reconnectionAttempts: urlConfig.reconnectAttempts,
      });

      // Attach event listeners for connection events
      client.on("connect", () => {
        console.log(`Connected to entitySport - ${urlConfig.url}`);
        updateEntitySocketStatusQuery(
          {
            entitySocketId: [urlConfig.entitySocketId],
            status: clientSocketStatus.connected,
          },
          fastify
        ).catch((error) => {
          console.log("Error updating entity socket status:", error);
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
        global.tblEntitySockets[index].status = clientSocketStatus.connected;

        client.on("entityScoreData", async (payload) => {
          try {
            // console.log("Received entity data from Backend A:", payload);
            const request = { body: payload };
            console.log("-------------")
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
        console.log(`Entity Connection error: ${error}`);
      });
      client.on("disconnect", () => {
        console.log(`Entity Disconnected from ${urlConfig.url}`);
        global.entitySportSocketIo = global.entitySportSocketIo.filter(
          (c) => c.client !== client
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
        console.log(`Entity Reconnect attempt: ${attemptNumber}`);
        updateReconnectCountQuery(
          {
            entitySocketId: urlConfig.entitySocketId,
            reconnectCount: attemptNumber,
          },
          fastify
        );

        let index = global.tblEntitySockets.findIndex(
          (c) => c.entitySocketId === urlConfig.entitySocketId
        );
        if (index !== -1) {
          global.tblEntitySockets[index].reconnectCount = attemptNumber;
        }
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

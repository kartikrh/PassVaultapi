const { io } = require("socket.io-client");
const cron = require("node-cron");
const { clientSocketStatus, clientSocketActionType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { updateClientSocketStatusQuery, updateReconnectCountQuery } = require("../repository/TableClientSocket");
const { updateCommentaryViewsQuery } = require("../repository/TableCommentary");

const cleanupSocket = (clientSocketId) => {
  const index = global.clientSocketIo.findIndex(
    c => c.clientSocketId === clientSocketId
  );

  if (index === -1) return;

  const socket = global.clientSocketIo[index];
  socket.cronJob?.stop();
  socket.client.disconnect(true);
  socket.client.removeAllListeners();

  global.clientSocketIo.splice(index, 1);
};

const connectClients = async (fastify, clientSocketId) => {
  try {
    let clientConfigs = global.tblClientSocket.filter(c => c.isActive === true);
    if (clientSocketId) {
      clientConfigs = clientConfigs.filter(c => c.clientSocketId === clientSocketId);
    }

    await Promise.allSettled(
      clientConfigs.map(async (config) => {
        if (
          config.status === clientSocketStatus.connected ||
          config.actionType !== clientSocketActionType.connect
        ) {
          return;
        }

        const existingIndex = global.clientSocketIo.findIndex(
          c => c.clientSocketId === config.clientSocketId
        );

        if (existingIndex !== -1) {
          return;
        }

        const client = io(config.url, {
          transports: ["websocket"],
          query: { source: `admin-panel` },
          reconnection: true,
          reconnectionDelay: config.reconnectDelay || 1000,
          reconnectionDelayMax: config.reconnectMaxDelay || 5000,
          reconnectionAttempts: config.reconnectAttempts || Infinity,
          timeout: 20000,
          pingInterval: 18000,
          pingTimeout: 10000,
        });

        const socketObj = { ...config, client, cronJob: null };
        global.clientSocketIo.push(socketObj);

        client.on("connect", async () => {
          errorLogger(
            fastify,
            `Client socket connected to ${config.url}`,
            "Client Socket --> sockets/client.js/connectClients - connect",
            null
          );
          try {
            await updateClientSocketStatusQuery(
              {
                clientSocketId: [config.clientSocketId],
                status: clientSocketStatus.connected,
              },
              fastify
            );
          } catch (err) {
            errorLogger(fastify, err.message, "DB connect update error", null);
          }

          if (socketObj.isUpdateView && !socketObj.cronJob) {
            const interval = Number(socketObj.updateInterval) || 5;
            socketObj.cronJob = cron.schedule(`*/${interval} * * * *`, () => {
              if (!client.connected) return;
              client.emit("updateRoomUserCount", { message: "Send me user counts" });
            });
          }
        });

        client.on("countData", async (data) => {
          try {
            const updates = [];

            for (const elem of data) {
              const increment = Number(elem.count) || 0;
              if (!elem.commentaryId || increment <= 0) continue;

              const index = global.tblCommentaries.findIndex(
                i => i.commentaryId == elem.commentaryId
              );
              if (index === -1) continue;

              global.tblCommentaries[index].views =
                (Number(global.tblCommentaries[index].views) || 0) + increment;

              updates.push(
                updateCommentaryViewsQuery(
                  { views: increment, commentaryId: elem.commentaryId },
                  fastify
                )
              );
            }

            await Promise.all(updates);
            client.emit("updateCommentaryCounts", data);
          } catch (err) {
            console.error("countData handler error:", err);
          }
        });

        client.on("disconnect", async () => {
          errorLogger(
            fastify,
            `Client socket disconnected to ${config.url}`,
            "Client Socket --> sockets/client.js/connectClients - disconnect",
            null
          );
          cleanupSocket(config.clientSocketId);

          try {
            await updateClientSocketStatusQuery(
              {
                clientSocketId: [config.clientSocketId],
                status: clientSocketStatus.disconnected,
              },
              fastify
            );
          } catch (err) {
            errorLogger(fastify, err.message, "DB disconnect update error", null);
          }
        });

        client.io.on("reconnect_attempt", (attempt) => {
          updateReconnectCountQuery(
            {
              clientSocketId: config.clientSocketId,
              reconnectCount: attempt,
            },
            fastify
          ).catch(err =>
            errorLogger(fastify, err.message, "Reconnect count error", null)
          );
        });
      })
    );
  } catch (err) {
    errorLogger(fastify, err.message, "connectClients fatal error", null);
  }
};

const disconnectClientSockets = async (fastify, clientSocketId) => {
  try {
    let clientConfigs = global.tblClientSocket;
    if (clientSocketId) {
      clientConfigs = clientConfigs.filter(c => c.clientSocketId === clientSocketId);
    }

    await Promise.allSettled(
      clientConfigs.map(async (client) => {
        cleanupSocket(client.clientSocketId);

        await updateClientSocketStatusQuery(
          {
            clientSocketId: [client.clientSocketId],
            status: clientSocketStatus.disconnected,
          },
          fastify
        );
      })
    );
  } catch (err) {
    errorLogger(fastify, err.message, "disconnectClientSockets error", null);
  }
};

module.exports = {
  connectClients,
  disconnectClientSockets
};
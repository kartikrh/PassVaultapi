const { io } = require("socket.io-client");
const cron = require("node-cron");
const { clientSocketStatus, clientSocketActionType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { updateClientSocketStatusQuery, updateReconnectCountQuery } = require("../repository/TableClientSocket");
const { updateCommentaryViewsQuery } = require("../repository/TableCommentary");
const { withSentryCronProfiling } = require("../utilities/sentryCron");

global.clientSocketIo = [];

const connectClients = async (fastify, clientSocketId) => {
  try {
    let clientConfigs = global.tblClientSocket.filter(c => c.isActive === true);
    if (clientSocketId) {
      clientConfigs = clientConfigs.filter(c => c.clientSocketId === clientSocketId);
    }

    const promises = clientConfigs.map(async (config) => {
      if (
        config.status === clientSocketStatus.connected ||
        config.actionType !== clientSocketActionType.connect
      ) {
        return;
      }

      const client = io(config.url, {
        transports: ["websocket"],
        query: { source: `admin-panel` },
        reconnection: true,
        reconnectionDelay: config.reconnectDelay || 1000,
        reconnectionDelayMax: config.reconnectMaxDelay || 5000,
        reconnectionAttempts: config.reconnectAttempts || 10,
        timeout: 20000,
        pingInterval: 18000,
        pingTimeout: 10000,
      });

      client.on("connect", async () => {
        const prior = global.clientSocketIo.filter(
          (item) => item.clientSocketId === config.clientSocketId
        );
        for (const p of prior) {
          if (p.cronJob) {
            try {
              p.cronJob.stop();
            } catch (_) {}
            p.cronJob = null;
          }
        }
        global.clientSocketIo = global.clientSocketIo.filter(
          (item) => item.clientSocketId !== config.clientSocketId
        );

        const socketObj = { ...config, client, cronJob: null };
        global.clientSocketIo.push(socketObj);
        errorLogger(
          fastify,
          `Client socket connected to ${config.serverName}`,
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
          errorLogger(
            fastify,
            err.message,
            "Client Socket --> sockets/client.js/connectClients - connect - updateClientSocketStatusQuery",
            null
          );
        }

        if (socketObj.isUpdateView && !socketObj.cronJob) {
          const interval = Number(socketObj.updateInterval) || 5;
          const cronExpression = `*/${interval} * * * *`;
          socketObj.cronJob = cron.schedule(cronExpression, withSentryCronProfiling(`client-socket-view-refresh-${config.clientSocketId}`, cronExpression, () => {
            if (!client.connected) return;
            client.emit("updateRoomUserCount", { message: "Send me user counts" });
          }));
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

      client.on("disconnect", async (reason) => {
        errorLogger(
          fastify,
          `Client socket disconnected to ${config.serverName}. reason: ${reason}`,
          "Client Socket --> sockets/client.js/connectClients - disconnect",
          null
        );

        const socket = global.clientSocketIo.find(
          (item) => item.clientSocketId === config.clientSocketId
        );
        if (socket?.cronJob) {
          try {
            socket.cronJob.stop();
          } catch (_) {}
          socket.cronJob = null;
        }

        global.clientSocketIo = global.clientSocketIo.filter(
          (item) => item.clientSocketId !== config.clientSocketId
        );
        try {
          await updateClientSocketStatusQuery(
            {
              clientSocketId: [config.clientSocketId],
              status: clientSocketStatus.disconnected,
            },
            fastify
          );
        } catch (err) {
          errorLogger(
            fastify,
            err.message,
            "Client Socket --> sockets/client.js/connectClients - disconnect - updateClientSocketStatusQuery",
            null
          );
        }
      });

      client.io.on("reconnect_attempt", (attempt) => {
        const reconnectCounts = global.tblClientSocket.find(c => c.clientSocketId === config.clientSocketId)?.reconnectCount;
        updateReconnectCountQuery(
          {
            clientSocketId: config.clientSocketId,
            reconnectCount: attempt
          },
          fastify
        ).catch(err =>
          errorLogger(
            fastify,
            err.message,
            "Client Socket --> sockets/client.js/connectClients - reconnect_attempt - updateReconnectCountQuery",
            null
          )
        );
      });

      client.io.on("reconnect_error", (error) => {
        errorLogger(
          fastify,
          `${config.serverName} Error: ${error.message}`,
          "Client Socket --> sockets/client.js/connectClients - reconnect_error",
          null
        );
      });

      client.io.on("reconnect_failed", () => {
        errorLogger(
          fastify,
          null,
          "Client Socket --> sockets/client.js/connectClients - reconnect_failed",
          null
        );
      });
    })

    await Promise.all(promises);
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

    const promises = clientConfigs?.map(async (client) => {
      const clientSocket = global.clientSocketIo.find(
        (item) => item.clientSocketId === client.clientSocketId
      );
      if (clientSocket) {
        if (clientSocket.cronJob) {
          try {
            clientSocket.cronJob.stop();
          } catch (_) {}
          clientSocket.cronJob = null;
        }
        try {
          clientSocket.client?.removeAllListeners();
          clientSocket.client?.disconnect(true);
        } catch (_) {}
        global.clientSocketIo = global.clientSocketIo.filter(
          (item) => item.clientSocketId !== client.clientSocketId
        );
      }

      try {
        await updateClientSocketStatusQuery(
          {
            clientSocketId: [client.clientSocketId],
            status: clientSocketStatus.disconnected,
          },
          fastify
        );
      } catch (error) {
        errorLogger(
          fastify,
          error.message,
          "DB Error --> sockets/client.js/disconnectClientSockets- updateEntitySocketStatusQuery",
          null
        );
      }
    });
    await Promise.all(promises);
  } catch (err) {
    errorLogger(fastify, err.message, "disconnectClientSockets error", null);
  }
};

module.exports = {
  connectClients,
  disconnectClientSockets
};
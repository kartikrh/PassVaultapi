
global.clientSocketIo = [];
const { io } = require("socket.io-client");
const { clientSocketActionType, clientSocketStatus } = require("../utilities");
const { updateClientSocketStatusQuery, updateReconnectCountQuery } = require("../repository/TableClientSocket");
const { errorLogger } = require("../utilities/logger");
const { updateCommentaryViewsQuery } = require("../repository/TableCommentary");
const cron = require('node-cron');
const { clientSocketCountService } = require("../services/commentry")

const connectClients = async (fastify, clientSocketId = undefined) => {
  try {
    // const clientUrls = global.tblClientSocket.filter(
    //   (c) => c.isActive === true && c.actionType == clientSocketActionType.connect && c.status !== clientSocketStatus.connected
    // );
    let clientUrls;
    if (clientSocketId !== undefined) {
      clientUrls = global.tblClientSocket.filter(
        (c) => c.clientSocketId == clientSocketId && c.isActive === true && c.actionType == clientSocketActionType.connect
          && c.status !== clientSocketStatus.connected
      );
    } else {
      clientUrls = global.tblClientSocket.filter(
        (c) => c.isActive === true && c.actionType == clientSocketActionType.connect && c.status !== clientSocketStatus.connected
      );
    }
    const promises = clientUrls.map((urlConfig) => {
      return new Promise((resolve) => {
        const existing = global.clientSocketIo.find(c => c.url === urlConfig.url);

        // Check if existing connection is still active and connected
        if (existing && existing.client && existing.client.connected) {
          console.log(`Connection to ${urlConfig.url} already exists and is connected, skipping reconnection`);
          resolve();
          return;
        }

        // If existing but disconnected, clean it up properly
        if (existing) {
          console.log(`Cleaning up existing disconnected connection to ${urlConfig.url}`);
          try {
            if (existing.client) {
              existing.client.removeAllListeners();
              existing.client.disconnect(true);
            }
          } catch (err) {
            console.log(`Error cleaning up existing connection: ${err.message}`);
          }
          global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);
        }

        // Add a small delay to prevent immediate reconnection issues
        setTimeout(() => {
          const client = io(urlConfig.url, {
            transports: ["websocket"],
            query: { source: "admin-panel" },
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
          let isConnected = false;
          let reconnectAttempts = 0;

          client.on("connect", () => {
            if (isConnected) {
              console.log(`Already connected to ${urlConfig.url}, ignoring duplicate connect event`);
              return;
            }

            isConnected = true;
            reconnectAttempts = 0;
            console.log(`Connected to ${urlConfig.url} at ${new Date().toISOString()}`);

            updateClientSocketStatusQuery({
              clientSocketId: [urlConfig.clientSocketId],
              status: clientSocketStatus.connected
            }, fastify).catch((error) => {
              console.log("Error updating client socket status:", error);
            });

            // Remove any old socket just in case
            global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);
            global.clientSocketIo.push({
              ...urlConfig,
              client,
            });
            const socketObj = { ...urlConfig, client };
            // update status in global.tblClientSocket
            let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
            if (index !== -1) {
              global.tblClientSocket[index].status = clientSocketStatus.connected;
            }
            if (socketObj && socketObj?.isUpdateView == true) {
              const intervalMinutes = Number(socketObj.updateInterval) || 5;
              const cronExpression = `*/${intervalMinutes} * * * *`;

              socketObj.cronJob = cron.schedule(cronExpression, async () => {
                try {
                  if (!socketObj.client || !socketObj.client.connected) {
                    return;
                  }
                  socketObj.client.emit("updateRoomUserCount", { message: "Send me user counts" });
                  socketObj.client.removeAllListeners("countData");
                  socketObj.client.once("countData", async (data) => {
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

                    socketObj.client.emit("updateCommentaryCounts", data);
                  });
                } catch (error) {
                  console.error(new Date(), "Error during scheduled task:", error);
                }
              });
            }
          });
          client.on("connect_error", (error) => {
            console.log(`Connection error ${urlConfig.url}: ${error.message || error} at ${new Date().toISOString()}`);
            isConnected = false;
          });

          client.on("disconnect", (reason) => {
            isConnected = false;
            console.log(`Disconnected from ${urlConfig.url}, reason: ${reason} at ${new Date().toISOString()}`);

            // Only update status if it's not a manual disconnect or server restart
            if (reason !== "io client disconnect" && reason !== "io server disconnect") {
              global.clientSocketIo = global.clientSocketIo.filter(
                (c) => c.client !== client
              );
              updateClientSocketStatusQuery({
                clientSocketId: [urlConfig.clientSocketId],
                status: clientSocketStatus.disconnected
              }, fastify)
                .catch((error) => {
                  errorLogger(
                    fastify,
                    error.message,
                    "DB Error --> socketIo.js/connectClients",
                    null
                  );
                });

              // update status in global.tblClientSocket
              let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
              if (index !== -1) {
                global.tblClientSocket[index].status = clientSocketStatus.disconnected;
              }
            }
          });

          client.io.on("reconnect_attempt", (attemptNumber) => {
            reconnectAttempts = attemptNumber;
            console.log(`Reconnect attempt ${urlConfig.url}: ${attemptNumber} at ${new Date().toISOString()}`);
            updateReconnectCountQuery({
              clientSocketId: urlConfig.clientSocketId,
              reconnectCount: attemptNumber
            }, fastify).catch((error) => {
              console.log("Error updating reconnect count:", error);
            });

            let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
            if (index !== -1) {
              global.tblClientSocket[index].reconnectCount = attemptNumber;
            }
          });

          client.io.on("reconnect", (attemptNumber) => {
            console.log(`Reconnected to ${urlConfig.url} after ${attemptNumber} attempts at ${new Date().toISOString()}`);
            isConnected = true;
            reconnectAttempts = 0;

            // Update database status on reconnect
            updateClientSocketStatusQuery({
              clientSocketId: [urlConfig.clientSocketId],
              status: clientSocketStatus.connected
            }, fastify).catch((error) => {
              console.log("Error updating client socket status on reconnect:", error);
              errorLogger(
                fastify,
                error.message,
                "DB Error --> socketIo.js/connectClients/reconnect",
                null
              );
            });

            // Update status in global.tblClientSocket
            let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
            if (index !== -1) {
              global.tblClientSocket[index].status = clientSocketStatus.connected;
            }

            // Ensure socket is in global.clientSocketIo array
            const existingInArray = global.clientSocketIo.findIndex(c => c.url === urlConfig.url);
            if (existingInArray === -1) {
              // Socket not in array, add it
              global.clientSocketIo.push({
                ...urlConfig,
                client,
              });
            } else {
              // Socket exists, update it with new client instance
              global.clientSocketIo[existingInArray] = {
                ...urlConfig,
                client,
              };
            }
          });

          client.io.on("reconnect_error", (error) => {
            console.log(`Reconnect error ${urlConfig.url}: ${error.message || error} at ${new Date().toISOString()}`);
          });

          client.io.on("reconnect_failed", () => {
            console.log(`Reconnect failed for ${urlConfig.url} after all attempts at ${new Date().toISOString()}`);
            isConnected = false;
          });

          resolve();
        }, 100); // Small delay to prevent race conditions
      });
      // client.on("updatedEventMarket", async (data) => {
      //   try {
      //     let MarketArr = [];
      //     //console.log("marketData", data);
      //     const { commentaryId, marketData } = data;
      //     const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
      //     if (clientInRoom?.size) {
      //       global.socketIo.to(commentaryId).emit("updateMarketData", marketData );
      //     }
      //     let ballbybllId;
      //     let marketIdArr = marketData.map((item) =>{
      //       let mark = JSON.parse(item);
      //       MarketArr.push(mark);
      //       ballbybllId = mark.ballByBallId;
      //       return mark.marketId;
      //     });
      //     let marketToUpdate = await getEventMarketByIdsQuery(
      //       {
      //         eventMarketIds: marketIdArr
      //       },
      //       null,
      //       fastify
      //     )
      //     const marketOdd = [];
      //     for (let data of marketToUpdate) {
      //       let index = global.tblEventMarkets.findIndex((market) => market.eventMarketId === data.eventMarketId);
      //       if(index != -1){
      //         global.tblEventMarkets[index] = data;
      //       }
      //       else {
      //         global.tblEventMarkets.push(data);
      //       }
      //       if (ballbybllId) {
      //         let ballData = await createMarketOddsBallByBallBYIDFromSocketIo(ballbybllId, data, fastify);
      //         if (ballData) {
      //           global.tblMarketOddsBallByBall.push(bal  lData);
      //           marketOdd.push(ballData);
      //         }
      //       }
      //     }
      //     let commentaryData = global.tblCommentaries.find((commentary) => commentary.commentaryId === commentaryId);
      //     const sendDataForSocketUpdate = {};
      //     sendDataForSocketUpdate.commentaryId = commentaryId;
      //     sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
      //     sendDataForSocketUpdate.dataToUpdate = [
      //       {
      //         module: "marketOddsBallByBall",
      //         data: marketOdd,
      //         type : "create"
      //       }
      //     ];
      //     global.clientSocketIo.forEach((socket) => {
      //       socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      //     });
      //     console.log("Event Market Updated successfully");
      //     return true;

      //   // let marketDataToUpdate = marketData;

      //   // // console.log("marketDataToUpdate", marketDataToUpdate);
      //   // let runnerData = [];
      //   // let marketDataLog = [];

      //   // for (let data of marketDataToUpdate) {
      //   //   data = JSON.parse(data);
      //   //   runnerData.push(...data.runner);
      //   //   marketDataLog.push({
      //   //     commentaryId,
      //   //     eventMarketId: data.id,
      //   //     data: data,
      //   //     updateType: MarketUpdateType.predictMarket
      //   //   });

      //   // }
      //   //   await fastify.db.query(
      //   //     `CALL proc_update_eventmarket_runner(
      //   //       $1, $2, $3
      //   //     )`,
      //   //     {
      //   //       bind: [
      //   //         JSON.stringify(runnerData),
      //   //         JSON.stringify(marketDataLog),
      //   //         null
      //   //       ]
      //   //     }
      //   //   );
      //   } catch (error) {
      //     errorLogger(
      //       fastify,
      //       error.message,
      //       "ERROR --> socketIo.js/updatedEventMarket",
      //       null
      //     );
      //     console.error("error:", error);
      //   }
      // });
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
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/connectClients",
      null
    );
    // console.error("Error connecting clients:", error);
  }
};
const disconnectClients = async (fastify, clientSocketId = undefined) => {
  try {
    // const disconnectClientUrls = global.tblClientSocket.filter(
    //   (c) => c.isActive === true && c.actionType == clientSocketActionType.disconnect && c.status !== clientSocketStatus.disconnected
    // );
    let disconnectClientUrls;
    if (clientSocketId !== undefined) {
      disconnectClientUrls = global.tblClientSocket.filter(
        (c) => c.clientSocketId == clientSocketId && c.isActive === true && c.actionType == clientSocketActionType.disconnect
          && c.status !== clientSocketStatus.disconnected
      );
    } else {
      disconnectClientUrls = global.tblClientSocket.filter(
        (c) => c.isActive === true && c.actionType == clientSocketActionType.disconnect && c.status !== clientSocketStatus.disconnected
      );
    }
    const promises = disconnectClientUrls?.map((client) => {
      const clientInstance = global.clientSocketIo.find((c) => c.clientSocketId === client.clientSocketId);
      clientInstance?.client.disconnect();
    });
    await Promise.all(promises);
    const clientIds = disconnectClientUrls.map((c) => c.clientSocketId);
    updateClientSocketStatusQuery({
      clientSocketId: clientIds,
      status: clientSocketStatus.disconnected
    }, fastify)
      .catch((error) => {
        errorLogger(
          fastify,
          error.message,
          "DB Error --> socketIo.js/disconnectClients",
          null
        );
      });
    // update in global.tblClientSocket
    global.tblClientSocket.forEach((c) => {
      if (clientIds.includes(c.clientSocketId)) {
        c.status = clientSocketStatus.disconnected;
      }
    });
    global.clientSocketIo = global.clientSocketIo.filter((c) => !disconnectClientUrls.includes(c.clientSocketId));
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/disconnectClients",
      null
    )
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
    errorLogger(
      fastify,
      error.message,
      "ERROR --> socketIo.js/disconnectInactiveClients",
      null
    );
  }
}
module.exports = { connectClients, disconnectClients, disconnectInactiveClients };


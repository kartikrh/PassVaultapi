
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
        // Check both client.connected and io.connected for more accurate state
        const isConnected = existing && existing.client && 
          (existing.client.connected === true || 
           (existing.client.io && existing.client.io.connected === true));

        if (isConnected) {
          console.log(`Connection to ${urlConfig.url} already exists and is connected, skipping reconnection`);
          resolve();
          return;
        }

        // If existing but disconnected, clean it up properly
        if (existing) {
          // Check connection state for better logging
          const connectionState = existing.client ? 
            (existing.client.io ? existing.client.io.readyState : 'unknown') : 'no-client';
          const wasConnected = existing.client && existing.client.connected;
          
          console.log(`Cleaning up existing disconnected connection to ${urlConfig.url} (state: ${connectionState}, wasConnected: ${wasConnected})`);
          
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
            console.log(`Error cleaning up existing connection: ${err.message}`);
          }
          // Remove from array regardless of cleanup success
          if (existing.cronJob) {
            existing.cronJob.stop();
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
            // Match server pingInterval (20s) to keep connection alive and prevent load balancer timeouts
            // Use slightly less than server to ensure we send pings before server expects them
            pingInterval: 18000, // 18 seconds (less than server's 20s to ensure timely pings)
            pingTimeout: 10000,  // 10 seconds (should be less than pingInterval, and match server expectations)
            forceNew: true, // Force new connection to avoid reuse issues
            autoConnect: true,
          });

          // Attach event listeners for connection events
          let isConnected = false;
          let reconnectAttempts = 0;
          let isReconnecting = false; // Track if we're in a reconnection flow

          client.on("connect", () => {
            // If already connected and not in reconnection flow, it's a duplicate
            if (isConnected && !isReconnecting) {
              const emitMessage = `Already connected to ${urlConfig.url}, ignoring duplicate connect event`;
              global.socketIo.emit("clientsocketconnect", emitMessage);
              errorLogger(
                fastify,
                emitMessage,
                "Client Socket --> sockets/index.js/connectClients - clientsocketconnect",
                null
              );
              console.log(emitMessage);
              return;
            }

            // Determine if this is a reconnection or initial connection
            const wasReconnecting = isReconnecting;
            isConnected = true;
            isReconnecting = false; // Reset reconnection flag
            reconnectAttempts = 0;
            
            // Log connection message - distinguish between initial and reconnection
            const emitMessage = wasReconnecting 
              ? `Reconnected to ${urlConfig.url} at ${new Date().toISOString()}`
              : `Connected to ${urlConfig.url} at ${new Date().toISOString()}`;
            
            global.socketIo.emit("clientsocketconnect", emitMessage);
            errorLogger(
              fastify,
              emitMessage,
              "Client Socket --> sockets/index.js/connectClients - clientsocketconnect",
              null
            );
            console.log(emitMessage);

            updateClientSocketStatusQuery({
              clientSocketId: [urlConfig.clientSocketId],
              status: clientSocketStatus.connected
            }, fastify).catch((error) => {
              console.log("Error updating client socket status:", error);
            });

            // Remove any old socket just in case
            const existingInArray = global.clientSocketIo.find(c => c.url === urlConfig.url);
            if (existingInArray && existingInArray.cronJob) {
              existingInArray.cronJob.stop();
            }
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
            // Set reconnection flag if it's not a manual disconnect
            if (reason !== "io client disconnect" && reason !== "io server disconnect") {
              isReconnecting = true;
            }
            const message = `Client socket disconnected from ${urlConfig.url}, reason: ${reason} at ${new Date().toISOString()}`;
            global.socketIo.emit("clientsocketdisconnect", message);
            errorLogger(
              fastify,
              message,
              "Client Socket --> sockets/index.js/connectClients - disconnected",
              null
            );

            // Log disconnect reason for debugging
            if (reason === "transport close") {
              console.log(`  → Transport closed (network issue or server closed connection)`);
            } else if (reason === "transport error") {
              console.log(`  → Transport error (network failure)`);
            } else if (reason === "ping timeout") {
              console.log(`  → Ping timeout (server not responding to pings - check pingInterval/pingTimeout settings)`);
            } else if (reason === "io server disconnect") {
              console.log(`  → Server initiated disconnect`);
            } else if (reason === "io client disconnect") {
              console.log(`  → Client initiated disconnect`);
            }

            // Always remove from global array to prevent stale entries
            // This ensures cleanup happens regardless of disconnect reason
            const clientObj = global.clientSocketIo.find(c => c.client === client || c.url === urlConfig.url);
            if (clientObj?.cronJob) {
              clientObj.cronJob.stop();
            }

            global.clientSocketIo = global.clientSocketIo.filter(
              (c) => c.client !== client && c.url !== urlConfig.url
            );

            // Only update status if it's not a manual disconnect or server restart
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

            // Forcefully reconnect when ScoreClientAPI disconnects (server-initiated or network issues)
            // Clean up the old client connection completely
            try {
              if (client && client.io) {
                // Disable the built-in reconnection to prevent duplicate reconnect_attempt logs
                client.io.opts.reconnection = false;
                // Also disconnect the old client completely to prevent it from trying to reconnect
                client.removeAllListeners();
                client.disconnect(true);
              }
            } catch (err) {
              console.log(`Error disabling reconnection on old client: ${err.message}`);
            }

            // Forcefully reconnect after a short delay
            const reconnectDelay = urlConfig.reconnectDelay || 1000;
            console.log(`Forcefully reconnecting to ${urlConfig.url} in ${reconnectDelay}ms...`);

            setTimeout(() => {
              // Check if socket is still supposed to be active before reconnecting
              const socketConfig = global.tblClientSocket.find(
                (c) => c.clientSocketId === urlConfig.clientSocketId
              );

              if (socketConfig && socketConfig.isActive === true && socketConfig.actionType === clientSocketActionType.connect) {
                // Check if there's already a connection attempt in progress
                const existingConnection = global.clientSocketIo.find(c => c.url === urlConfig.url);
                const isAlreadyConnected = existingConnection && existingConnection.client &&
                  (existingConnection.client.connected === true ||
                    (existingConnection.client.io && existingConnection.client.io.connected === true));

                if (!isAlreadyConnected) {
                  console.log(`Initiating forceful reconnection to ${urlConfig.url}...`);
                  // Clean up any stale connection first
                  if (existingConnection && existingConnection.client) {
                    try {
                      // Disable reconnection on stale connection too
                      if (existingConnection.client.io) {
                        existingConnection.client.io.opts.reconnection = false;
                      }
                      existingConnection.client.removeAllListeners();
                      existingConnection.client.disconnect(true);
                    } catch (err) {
                      console.log(`Error cleaning up stale connection: ${err.message}`);
                    }
                  }

                  // Remove from global array before reconnecting
                  global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);

                  // Forcefully reconnect
                  connectClients(fastify, urlConfig.clientSocketId).catch((err) => {
                    console.error(`Error during forceful reconnection to ${urlConfig.url}:`, err);
                    errorLogger(
                      fastify,
                      err.message,
                      "ERROR --> socketIo.js/connectClients - forceful reconnect",
                      null
                    );
                  });
                } else {
                  console.log(`Skipping forceful reconnection to ${urlConfig.url} - already connected or connecting`);
                }
              } else {
                console.log(`Skipping reconnection to ${urlConfig.url} - socket is inactive or should be disconnected`);
              }
            }, reconnectDelay);
          });

          client.io.on("reconnect_attempt", (attemptNumber) => {
            isReconnecting = true; // Mark that we're attempting to reconnect
            reconnectAttempts = attemptNumber;
            const message = `Reconnect attempt ${urlConfig.url}: ${attemptNumber} at ${new Date().toISOString()}`;
            console.log(message);
            errorLogger(
              fastify,
              message,
              "Client Socket --> sockets/index.js/connectClients - reconnect_attempt",
              null
            );
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
            isReconnecting = true; // Ensure flag is set before connect event
            const emitMessage = `Reconnected to ${urlConfig.url} after ${attemptNumber} attempts at ${new Date().toISOString()}`;
            console.log(emitMessage);
            global.socketIo.emit("clientsocketreconnect", emitMessage);
            errorLogger(
              fastify,
              emitMessage,
              "Client Socket --> sockets/index.js/connectClients - clientsocketreconnect",
              null
            );
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
            isReconnecting = false; // Reset flag since reconnection failed
            const message = `Reconnect failed for ${urlConfig.url} after all attempts at ${new Date().toISOString()}`;
            console.log(message);
            errorLogger(
              fastify,
              message,
              "Client Socket --> sockets/index.js/connectClients - reconnect_failed",
              null
            );
            isConnected = false;
            // Clean up entry when all reconnection attempts are exhausted
            const clientObj = global.clientSocketIo.find(c => c.client === client || c.url === urlConfig.url);
            if (clientObj?.cronJob) {
              clientObj.cronJob.stop();
            }
            global.clientSocketIo = global.clientSocketIo.filter(
              (c) => c.client !== client && c.url !== urlConfig.url
            );
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

const connectClients2 = async (fastify, clientSocketId = undefined)=>{
  try {
    const clientUrls = global.tblClientSocket.filter(c => {
      if (clientSocketId !== undefined) {
        return (
          c.clientSocketId == clientSocketId &&
          c.isActive === true &&
          c.actionType === clientSocketActionType.connect
        );
      }
      return (
        c.isActive === true &&
        c.actionType === clientSocketActionType.connect
      );
    });

    await Promise.all(
      clientUrls.map(async (urlConfig) => {
        // ---- cleanup old socket if exists ----
        const old = global.clientSocketIo.find(c => c.url === urlConfig.url);
        if (old?.client) {
          try {
            old.client.removeAllListeners();
            old.client.disconnect(true);
          } catch (_) {}
          global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);
        }

        // ---- create socket ----
        const client = io(urlConfig.url, {
          transports: ["websocket"],
          query: { source: "admin-panel" },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 8000,
          timeout: 20000,
          // transport-level ping
          pingInterval: 15000,
          pingTimeout: 4000,
          forceNew: true,
          autoConnect: true
        });


        let heartbeatTimer = null;
        let lastPongAt = Date.now();

        // ---- custom heartbeat ----
        const startHeartbeat = () => {
          stopHeartbeat();

          heartbeatTimer = setInterval(() => {
            if (!client.connected) return;

            // send custom ping
            client.emit("ping");

            // if no pong for 2 intervals → force reconnect
            if (Date.now() - lastPongAt > 15000) {
              console.log(`Heartbeat timeout → reconnecting ${urlConfig.url}`);
              client.disconnect();
              client.connect();
            }
          }, 10000);
        };

        const stopHeartbeat = () => {
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        };

        // ---- socket events ----
        client.on("connect", () => {
          console.log(`Connected → ${urlConfig.url}`);
          errorLogger(
            fastify,
            `Connected to ${urlConfig.url}`,
            "Client Socket --> sockets/index.js/connectClients2",
            null
          );

          lastPongAt = Date.now();
          startHeartbeat();

          updateClientSocketStatusQuery(
            { clientSocketId: [urlConfig.clientSocketId], status: clientSocketStatus.connected },
            fastify
          ).catch(() => {});

          global.clientSocketIo.push({ ...urlConfig, client });

          const index = global.tblClientSocket.findIndex(
            c => c.clientSocketId === urlConfig.clientSocketId
          );
          if (index !== -1) {
            global.tblClientSocket[index].status = clientSocketStatus.connected;
          }
          const socketObj = { ...urlConfig, client };
          if (socketObj.cronJob) {
            socketObj.cronJob.stop();
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
            const existing = global.clientSocketIo.find(
              c => c.clientSocketId === urlConfig.clientSocketId
            );
            if (existing) {
              existing.cronJob = socketObj.cronJob;
            }
          }
        });

        // ---- custom pong ----
        client.on("pong", () => {
          lastPongAt = Date.now();
        });

        // ---- example TP data event (KEEP YOUR REAL EVENTS HERE) ----
        client.on("message", (data) => {
          // process incoming TP data
          // console.log("TP data:", data);
        });

        client.on("disconnect", (reason) => {
          console.log(`Disconnected → ${urlConfig.url} | ${reason}`);

          stopHeartbeat();

          const disconnected = global.clientSocketIo.find(
            (c) => c.url === urlConfig.url
          );
          if (disconnected?.cronJob) {
            try {
              disconnected.cronJob.stop();
            } catch (_) {}
            disconnected.cronJob = null;
          }

          global.clientSocketIo = global.clientSocketIo.filter(
            (c) => c.url !== urlConfig.url
          );

          updateClientSocketStatusQuery(
            { clientSocketId: [urlConfig.clientSocketId], status: clientSocketStatus.disconnected },
            fastify
          ).catch(() => {});

          const index = global.tblClientSocket.findIndex(
            c => c.clientSocketId === urlConfig.clientSocketId
          );
          if (index !== -1) {
            global.tblClientSocket[index].status = clientSocketStatus.disconnected;
          }

          const message = `Client socket disconnected from ${urlConfig.url}, reason: ${reason} at ${new Date().toISOString()}`;
          // global.socketIo.emit("clientsocketdisconnect", message);
          errorLogger(
            fastify,
            message,
            "Client Socket --> sockets/index.js/connectClients2 - disconnected",
            null
          );
        });

        client.io.on("reconnect_attempt", (attempt) => {
          console.log(`Reconnect attempt ${attempt} → ${urlConfig.url}`);

          updateReconnectCountQuery(
            { clientSocketId: urlConfig.clientSocketId, reconnectCount: attempt },
            fastify
          ).catch(() => {});
        });

        client.io.on("reconnect", () => {
          console.log(`Reconnected → ${urlConfig.url}`);
          lastPongAt = Date.now();
          startHeartbeat();
        });

        client.io.on("reconnect_failed", () => {
          console.log(`Reconnect failed → ${urlConfig.url}`);
          stopHeartbeat();
        });
        client.io.on("reconnect_error", (error) => {
          console.log(`Reconnect error ${urlConfig.url}: ${error.message || error} at ${new Date().toISOString()}`);
        });
      })
    )
  } catch (err) {
    console.error("connectClients2 error:", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> socketIo.js/connectClients2",
      null
    );

  }
}
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
      if (clientInstance?.cronJob) { // Stop cron job if exists
        clientInstance.cronJob.stop();
      }
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
module.exports = { connectClients, disconnectClients, disconnectInactiveClients ,connectClients2};


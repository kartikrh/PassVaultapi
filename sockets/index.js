
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
      const existing = global.clientSocketIo.find(c => c.url === urlConfig.url);
      if (existing) {
        existing.client.disconnect(true);
        global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);
      }
      const client = io(urlConfig.url, {
        transport: ["websocket"],
        query: { source: "admin-panel"},
        reconnection: true,
        reconnectionDelay: urlConfig.reconnectDelay,
        reconnectionDelayMax: urlConfig.reconnectMaxDelay,
        reconnectionAttempts: urlConfig.reconnectAttempts,
      });

      // Attach event listeners for connection events
      client.on("connect", () => {
        console.log(`Connected to ${urlConfig.url}`);
        updateClientSocketStatusQuery({
          clientSocketId : [urlConfig.clientSocketId],
          status : clientSocketStatus.connected
        },fastify).catch((error) => {
          console.log("Error updating client socket status:", error);
        })
        // Remove any old socket just in case
        global.clientSocketIo = global.clientSocketIo.filter(c => c.url !== urlConfig.url);
        global.clientSocketIo.push({
            ...urlConfig,
            client,
        });
        const socketObj = { ...urlConfig, client };
        // update status in global.tblClientSocket
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        global.tblClientSocket[index].status = clientSocketStatus.connected;      
        if(socketObj && socketObj?.isUpdateView == true) {
          const intervalMinutes = Number(socketObj.updateInterval) || 5;
          const cronExpression = `*/${intervalMinutes} * * * *`;
          
          socketObj.cronJob = cron.schedule(cronExpression, async () => {
            try {
              socketObj.client.emit("updateRoomUserCount", { message: "Send me user counts" });
              socketObj.client.removeAllListeners("countData");
              socketObj.client.once("countData", async (data) => {
                for (const elem of data) {
                  const currentCount = Number(elem.count) || 0;
                  if (elem.commentaryId) {
                    const index = global.tblCommentaries.findIndex(i => i.commentaryId == elem.commentaryId);
                    if(index == -1){
                      errorLogger(
                        fastify,
                        "CommentaryId not found in global  socketObj.cronJob",
                        "sockets/index.js/connectClients",
                        null,
                        elem
                      )
                      continue;
                    }
                    // console.log("elem.commentaryId",elem)
                    await updateCommentaryViewsQuery({ views: currentCount, commentaryId: elem.commentaryId }, fastify);
                    if (index !== -1) {
                      // const oldCount = Number(global.tblCommentaries[index].views) || 0;
                      // global.tblCommentaries[index].views = oldCount + currentCount;
                      const newCount = Number(elem.totalCount) + currentCount
                      global.tblCommentaries[index].views = newCount;
                    }
                  }
                }
                socketObj.client.emit("updateCommentaryCounts", data);
              });
            } catch (error) {
              console.error(new Date(), "Error during scheduled task:", error);
            }
          });
        }
      });
      client.on("connect_error", (error) => {
        console.log(`Connection error ${urlConfig.url}: ${error}`);
      });
      client.on("disconnect", () => {
        console.log(`Disconnected from ${urlConfig.url}`);
        global.clientSocketIo = global.clientSocketIo.filter(
          (c) => c.client !== client
        );
        updateClientSocketStatusQuery({
          clientSocketId : [urlConfig.clientSocketId],
          status : clientSocketStatus.disconnected
        },fastify)
        .catch((error) => {
          errorLogger(
            fastify,
            error.message,
            "DB Error --> socketIo.js/connectClients",
            null
        )
       })
        
        // update status in global.tblClientSocket
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        if(index !== -1){
        global.tblClientSocket[index].status = clientSocketStatus.disconnected;
        }
      });
      client.io.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnect attempt ${urlConfig.url}: ${attemptNumber}`);
        updateReconnectCountQuery({
          clientSocketId : urlConfig.clientSocketId,
          reconnectCount : attemptNumber
        },fastify);

        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === urlConfig.clientSocketId);
        if(index !== -1){
        global.tblClientSocket[index].reconnectCount = attemptNumber;
        }
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
        (c) => c.clientSocketId == clientSocketId &&  c.isActive === true && c.actionType == clientSocketActionType.disconnect 
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
      clientSocketId : clientIds,
      status : clientSocketStatus.disconnected
    },fastify)
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
module.exports = { connectClients ,disconnectClients,disconnectInactiveClients };


const jwt = require("jsonwebtoken");
const { errorLogger } = require("./utilities/logger");
const { getEventMarketByIdsQuery, insertTimeLogs, updateTimeLogs, socketMarketRunnerDataQuery, openMarketScoketConnectionDataQuery } = require("./repository/TableEventMarkets");
const { MarketActionType, callTPAPI } = require("./utilities");
const {createMarketOddsBallByBallBYIDFromSocketIo,createMarketOddsBallInSaveDetails,CheckAndCreateMarketOddsBallInSaveDetails} = require("./repository/TableMarketOddsBallByBall")
const configConstants = require('./utilities/configConstants');
const { getAllEventMarketsV2Query } = require("./repository/TableEventMarkets");
const { getAllMarketRunnersQuery } = require("./repository/TableMarketRunner");

global.socketData = []
global.marketData = []
global.MarketArr = []

const connection = (socket , fastify) => {
  const { userId, allowMultipleLogin, wrToken } = socket;
  if (userId) {
    const user = global.tblUsers.find((user) => user.userId === userId);

    // Check if token is not of latest login and multiple login is false
    if (wrToken !== user?.loginToken && !allowMultipleLogin) {
      global.socketIo
        .to(socket.id)
        .emit("logout", "You have been removed from the room.");
    } else {
      socket.join(userId); 
    }
  }
  socket.on("updatedEventMarket", async (data) => {
    try {
      global.socketData.push(data)
      const MarketArr = [];
      const { commentaryId, marketData } = data;
      global.marketData.push(marketData)
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
      if (clientInRoom?.size) {
        global.socketIo.to(commentaryId).emit("updateMarketData", marketData);
      }
      const inninRunData = marketData.filter((item) => item?.isInningRun === true);
      const roomName = `market-${commentaryId}`;
      const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(roomName);
      if (clientsInRoom?.size && inninRunData.length > 0) {
        global.socketIo.to(commentaryId).emit("inningsRunData", inninRunData);
      }
      const timeLogs = await insertTimeLogs(commentaryId, fastify)

      
  
      const marketIdArr = marketData.map((item) => {
        const mark = JSON.parse(item);
        MarketArr.push(mark);
        return mark.marketId;
      });
  
      const marketToUpdatePromise = getEventMarketByIdsQuery(
        { eventMarketIds: marketIdArr },
        null,
        fastify
      );
  
      let LDOMARKETSIDS;
      try {
        LDOMARKETSIDS = global.tblConfigs
          .find((item) => item.key === configConstants.LDOMARKET)
          .value.split(",");
      } catch {
        LDOMARKETSIDS = ["26", "27", "28", "6"];
      }
      global.MarketArr.push(marketIdArr)
      let whereCondition = ` tem."wrID" ANY(${marketIdArr})`;
      const eventMarketData = await getAllEventMarketsV2Query(fastify, whereCondition)
      if(eventMarketData.length > 0){
        eventMarketData.forEach((updatedItem) => {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.eventMarketId
          );
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
        });
      }
      let whereClause = ` tmr."wrEventMarketId" ANY(${marketIdArr})`;
      const runnerData = await getAllMarketRunnersQuery(fastify, whereClause);
      if(runnerData.length > 0){
        runnerData.forEach((runner) => {
          let index = global.tblMarketRunnerV2.findIndex(
            (item) => item.eventMarketId === runner.eventMarketId
          );
            global.tblMarketRunnerV2[index] = {
              ...global.tblMarketRunnerV2[index],
              ...runner,
            };
        });
      }

      const marketToUpdate = await marketToUpdatePromise;
  
      marketToUpdate.forEach((data) => {
        const index = global.tblEventMarkets.findIndex(
          (market) => market.eventMarketId === data.eventMarketId
        );
        if (index !== -1) {
          global.tblEventMarkets[index] = data;
        } else {
          global.tblEventMarkets.push(data);
        }
      });
  
      const filteredMarkets = marketToUpdate.filter(
        (market) =>
          !LDOMARKETSIDS.includes(market.marketTypeCategoryId.toString()) &&
          market.status === 1
      );
  
      if (filteredMarkets.length > 0) {
        const result = [];
  
        filteredMarkets.forEach((item) => {
          const runnerData = {
            teamId: item.teamId,
            RunnerId: item.runnerId,
            BackPrice: item.backPrice,
            LayPrice: item.layPrice,
            BackSize: item.backSize,
            LaySize: item.laySize,
            RunnerName: item.runner,
            selectionId: item.selectionId,
            timestamp: new Date().toISOString(),
          };
  
          const existingEvent = result.find(
            (event) => event.eventMarketId === item.eventMarketId
          );
  
          if (existingEvent) {
            existingEvent.data.push(runnerData);
          } else {
            result.push({
              commentaryId: item.commentaryId,
              commentaryBallByBallId: item.ballByBallId || null,
              eventMarketId: item.eventMarketId,
              marketStatus: item.status,
              marketName: item.marketName,
              data: [runnerData],
            });
          }
        });
  
        // Convert data to JSON strings
        result.forEach((event) => {
          event.data = JSON.stringify(event.data);
        });
  
        for (const res of result) {
          CheckAndCreateMarketOddsBallInSaveDetails(res, fastify)
            .then((savedData) => {
              const tblMarketOddsIndex = global.tblMarketOddsBallByBall.findIndex(
                (item) =>
                  item.commentaryId === savedData.commentaryId &&
                  item.eventMarketId === savedData.eventMarketId &&
                  item.commentaryBallByBallId === savedData.commentaryBallByBallId
              );
  
              if (tblMarketOddsIndex !== -1) {
                global.tblMarketOddsBallByBall[tblMarketOddsIndex] = savedData;
              } else {
                global.tblMarketOddsBallByBall.push(savedData);
              }
            })
            .catch((error) => {
              errorLogger(
                fastify,
                error.message,
                "ERROR --> CheckAndCreateMarketOddsBallInSaveDetails",
                null
              );
            });
        }
      }
  
      const commentaryData = global.tblCommentaries.find(
        (commentary) => commentary.commentaryId === commentaryId
      );
      const sendDataForSocketUpdate = {
        commentaryId,
        eventRefId: commentaryData.eventRefId,
        dataToUpdate: [
          {
            module: "marketOddsBallByBall",
            data: [],
            type: "create",
          },
        ],
      };
  
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
      await updateTimeLogs(timeLogs.wrId, fastify);
      console.log("Event Market Updated successfully");
      return true;
    } catch (error) {
      errorLogger(
        fastify,
        error.message,
        "ERROR --> socketIo.js/updatedEventMarket",
        null
      );
      console.error("error:", error);
    }
  });
  
  socket.on("marketRunnerConnection", (eventIds) => {
    try {
      if (eventIds) {
        eventIds.forEach(async (eventId) => {
          const roomName = `runnerRoom-${eventId}`;
          socket.join(roomName);
          const runnerDetails = await socketMarketRunnerDataQuery(eventId, fastify);
          if (runnerDetails && runnerDetails.length > 0) {          
            socket.emit('marketRunners', runnerDetails);
          } else {
            socket.emit('marketRunners', []);
          }
        });
      }
    } catch (err) {
      console.log("Error in marketRunnerConnection", err?.message || err);
    }
  });

  socket.on("marketRunnerUpdate", (data) => {
    try {
      data.forEach((item) => {
        const roomName = `runnerRoom-${item.eventMarketId}`;
        const clientsInRoom =
          global.socketIo.sockets.adapter.rooms.get(roomName);

        if (clientsInRoom?.size) {
          global.socketIo.to(roomName).emit("marketRunners", [item]);
        }
      });
    } catch (error) {
      console.log("Error in updatedRunnersData:", error?.message || error);
    }
  });

  socket.on("marketRunnerDisconnect", (eventIds)=>{
    try {
      if(eventIds.length > 0){
        // remove this socket from runner room
        for (let e of eventIds){
          const roomName = `runnerRoom-${e}`;
          socket.leave(roomName)
        }
      }
    } catch (error) {
      console.log("Error in marketRunnerDisconnect",error)
    }
  })

  socket.on("isInningsConnection", async(commentaryId) => {
    try {
          const roomName = `market-${commentaryId}`;
          socket.join(roomName);
          // const runnerDetails = await openMarketScoketConnectionDataQuery(commentaryId, fastify);
          // if (runnerDetails && runnerDetails.length > 0) {          
          //   socket.emit("inningsRunData", runnerDetails);
          // } else {
          //   socket.emit("inningsRunData", []);
          // }
    } catch (err) {
      console.log("Error in isInningsConnection", err?.message || err);
    }
  });

  // socket.on("updatedEventMarket", async (data) => {
  //   try {
  //     let MarketArr = [];
  //     //console.log("marketData", da1a);
  //     const { commentaryId, marketData } = data;
  //     const timeLogs = await insertTimeLogs(commentaryId, fastify)
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
  //       // if (ballbybllId) {
  //       //   let ballData = await createMarketOddsBallByBallBYIDFromSocketIo(ballbybllId, data, fastify);
  //       //   if (ballData) {
  //       //     global.tblMarketOddsBallByBall.push(ballData);
  //       //     marketOdd.push(ballData);
  //       //   }
  //       // }
  //     } 

  //     let LDOMARKETSIDS 
  //     try {
  //       LDOMARKETSIDS = global.tblConfigs.find((item) => item.key === configConstants.LDOMARKET).value.split(',');
  //     } catch (error) {LDOMARKETSIDS = ['26', '27', '28','6'];}

  //      // Filter out markets that have marketTypeCategoryId present in LDOMARKETSIDS
  //     const filteredMarkets = marketToUpdate.filter(
  //       (market) => !LDOMARKETSIDS.includes(market.marketTypeCategoryId.toString()) && market.status === 1
  //     );

  //     if(ballbybllId && filteredMarkets.length > 0)
  //     {
  //       const result = [];

  //       filteredMarkets.forEach(item => {
  //         // Find if the eventMarketId already exists in the result array
  //         let existingEvent = result.find(event => event.EventMarketId === item.eventMarketId);
        
  //         const runnerData = {
  //           teamId: item.teamId,
  //           RunnerId: item.runnerId,
  //           BackPrice: item.backPrice,
  //           LayPrice: item.layPrice,
  //           BackSize: item.backSize,
  //           LaySize: item.laySize,
  //           RunnerName: item.runner,
  //           selectionId: item.selectionId,
  //           timestamp: new Date().toISOString()
  //         };
        
  //         if (existingEvent) {
  //           // If the eventMarketId exists, just push the new runner data into the Data field
  //           existingEvent.Data.push(runnerData);
  //         } else {
  //           // If not, create a new entry for this eventMarketId
  //           const newEvent = {
  //             commentaryId: item.commentaryId,
  //             commentaryBallByBallId: ballbybllId || null, // Adjust as needed
  //             eventMarketId: item.eventMarketId,
  //             marketStatus: item.status,
  //             marketName: item.marketName,
  //             data: [runnerData] // Initialize with the first runner's data
  //           };
  //           result.push(newEvent);
  //         }
  //       });

  //       // Convert Data array to JSON strings
  //       result.forEach(event => {
  //         event.data = JSON.stringify(event.data);
  //       });

  //       for (let index = 0; index < result.length; index++) {
  //         let res;
  //         try {
  //           res = await CheckAndCreateMarketOddsBallInSaveDetails(result[index], fastify);
  //         } catch (error) {
  //           errorLogger(
  //             fastify,
  //             error.message,
  //             "ERROR --> CheckAndCreateMarketOddsBallInSaveDetails",
  //             request
  //           );
  //         }

  //         const tblMarketOddsIndex = global.tblMarketOddsBallByBall.findIndex(item => item.commentaryId === res.commentaryId
  //           && item.eventMarketId === res.eventMarketId
  //           && item.commentaryBallByBallId === res.commentaryBallByBallId
  //         );

  //         if (tblMarketOddsIndex !== -1) {
  //           global.tblMarketOddsBallByBall[tblMarketOddsIndex] = res;
  //         } else {
  //           global.tblMarketOddsBallByBall.push(res);
  //         }

  //         const marketOddIndex  = marketOdd.findIndex(item => item.commentaryId === res.commentaryId
  //           && item.eventMarketId === res.eventMarketId
  //           && item.commentaryBallByBallId === res.commentaryBallByBallId
  //         );  

  //         if (marketOddIndex !== -1) {
  //           marketOdd[marketOddIndex] = res;
  //         } else {
  //           marketOdd.push(res);
  //         }
  //       }
  //     }

  //     let commentaryData = global.tblCommentaries.find((commentary) => commentary.commentaryId === commentaryId);
  //     const sendDataForSocketUpdate = {};
  //     sendDataForSocketUpdate.commentaryId = commentaryId;
  //     sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;

  //     if(marketOdd.length > 0) {
  //       sendDataForSocketUpdate.dataToUpdate = [
  //         {
  //           module: "marketOddsBallByBall",
  //           data: marketOdd,
  //           type : "create"
  //         }
  //       ];
  //       global.clientSocketIo.forEach((socket) => {
  //         socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  //       });
  //     }
      
  //     // if(commentaryId){
  //     //   let marketRunner = global.tblEventMarkets.filter((item) => item.commentaryId == commentaryId && item.rateSource === 2)
  //     //   marketRunner = marketRunner.map((item) => {
  //     //     let teamNameData
  //     //     if(item.teamId){
  //     //     teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
  //     //     }
  //     //     if(!item.teamId){
  //     //         teamNameData = global.tblCommentaryTeams.find((t) => 
  //     //             t.teamName.toLowerCase() == item.runner?.toLowerCase())
  //     //     }
  //     //     return {
  //     //         runnerId: item.runnerId,
  //     //         runner: item.runner,
  //     //         selectionId: item.selectionId,
  //     //         backSize: item.backSize,
  //     //         laySize: item.laySize,
  //     //         backPrice: item.backPrice,
  //     //         layPrice: item.layPrice,
  //     //         teamId: item.teamId,
  //     //         teamName: teamNameData?.teamName || null
  //     //     }
  //     //   });
  //     //   // sendDataForSocketUpdate.dataToUpdate.push({
  //     //   //   module: "marketRunner",
  //     //   //   type: "update",
  //     //   //   data: marketRunner,
  //     //   // });
  //     //   global.clientSocketIo.forEach((socket) => {
  //     //     socket.client.emit("updateRunnerData", marketRunner);
  //     //   });
  //     // }
      
  //     // global.clientSocketIo.forEach((socket) => {
  //     //   socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  //     // });
  //     await updateTimeLogs(timeLogs.wrId, fastify);
  //     console.log("Event Market Updated successfully");
  //     return true;
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

  socket.on("ping" , () =>{
    socket.emit("pong")
  })
  

  socket.on("connectEventMarket", (data) => {
    const { commentaryId } = data;
    socket.join(commentaryId);
  });
  // connect for scoring page
  socket.on("conCommentary", (data) => {
    const { commentaryId ,eventRefId } = data;
    socket.join(`score-${commentaryId}`);
  });
  socket.on("betAllow", async (data) => {
    const { commentaryId, betAllow ,eventRefId } = data;
    // console.log("betAllow", betAllow);
    // await callTPAPI(data , fastify);
    //emit the batallow 
    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(`score-${commentaryId}`);
    if(clientInRoom?.size){
      global.socketIo.to(`score-${commentaryId}`).emit("upBetAllow", {
        commentaryId : commentaryId,
        eventRefId : eventRefId,
        betAllow : betAllow
      });
    }
  });
  
  socket.on("comUpdate", (data) => {
    const {ballStatus , eventRefId , commentaryId } = data;
    if(ballStatus?.toLowerCase() === "ballstart"){
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(`score-${commentaryId}`);
      if(clientInRoom?.size){
        global.socketIo.to(`score-${commentaryId}`).emit("updateBallStatus", {
          commentaryId : commentaryId,
          eventRefId : eventRefId,
          ballStatus : "ballstart"
        });
      }
    }
    if(ballStatus?.toLowerCase() === "scoring"){
      //emit the other socket to update the ball status
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(`score-${commentaryId}`);
      if(clientInRoom?.size){
        global.socketIo.to(`score-${commentaryId}`).emit("updateBallStatus", {
          commentaryId : commentaryId,
          eventRefId : eventRefId,
          ballStatus : "scoring"
        });
      }
    }
  })
  socket.on("disconnectCom", (data)=>{
    try {
      const {commentaryId} = data;
      const roomName = `score-${commentaryId}`
      socket.leave(roomName)
    } catch (error) {
      console.log("error in disconnectCom",error)
    }
  })
  socket.on("updateMarketDisconnect", (commentaryId)=>{
    try {
      if (!commentaryId) return;
      socket.leave(commentaryId);
    } catch (error) {
      console.log("error in updateMarketDisconnect",error)
    }
  });
  socket.on("disconnect", () => {
  });
};

const socketMiddleware = async (socket, next) => {
  let token = null;
  try {
    token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error("Token Not Found"));
    }
    const PYTHONSOCKETKEY = global.tblConfigs.find(config => config.key === "PYTHONSOCKETKEY")?.value;

    if (!PYTHONSOCKETKEY || PYTHONSOCKETKEY !== token) {
      const verifyToken = jwt.verify(
        token,
        process.env.SECRET_KEY_TOKEN,
        (err, decoded) => {
          if (err) {
            return next(new Error(err.message));
          }
          return decoded;
        }
      );

      if (!verifyToken || !verifyToken.WrUserId) {
        return next(new Error("Invalid Token"));
      }

      socket.userId = verifyToken?.WrEId;
      socket.allowMultipleLogin = verifyToken?.WrAllowMultipleLogin;
      socket.wrToken = verifyToken?.wrToken
    }

    return next();
  } catch (error) {
    return next(new Error(error.message));
  }
};

module.exports = { connection, socketMiddleware };

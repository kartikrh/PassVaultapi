const jwt = require("jsonwebtoken");
const { errorLogger, pythonSocketLogger } = require("./utilities/logger");
const { getEventMarketByIdsQuery, insertTimeLogs, updateTimeLogs, socketMarketRunnerDataQuery, openMarketScoketConnectionDataQuery, getMnMarketByCId, getMarketByComIdQuery } = require("./repository/TableEventMarkets");
const { MarketActionType, callTPAPI } = require("./utilities");
const {createMarketOddsBallByBallBYIDFromSocketIo,createMarketOddsBallInSaveDetails,CheckAndCreateMarketOddsBallInSaveDetails} = require("./repository/TableMarketOddsBallByBall")
const configConstants = require('./utilities/configConstants');
const { getAllEventMarketsV2ByIdQuery } = require("./repository/TableEventMarkets");
const { getAllMarketRunnersV2ByIdQuery } = require("./repository/TableMarketRunner");

global.sessionData = []
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
      const MarketArr = [];
      const { commentaryId, marketData } = data;
      pythonSocketLogger(
        {
          ...data,
          socketId: socket.id ,
          createdAt : new Date()
        },
        fastify
      )
      let ballbybllId;
      global.sessionData.push({type: "before socket", data: marketData})
      const marketIdArr = marketData.map((item) => {
        const mark = JSON.parse(item);
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
      if (clientInRoom?.size) {
        global.socketIo.to(commentaryId).emit("updateMarketData", marketData);
      }
     
        MarketArr.push(mark);
        ballbybllId = mark.ballByBallId;
        return mark.marketId;
      });
      global.sessionData.push({type: "after socket", data: marketIdArr})
      const inninRunData = MarketArr.filter((item) => item?.isInningRun === true);
      const roomName = `mnMarket-${commentaryId}`;
      const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(roomName);
      if (clientsInRoom?.size && inninRunData.length > 0) {
        global.socketIo.to(roomName).emit("upMnMarket", inninRunData);
      }
      // const timeLogs = await insertTimeLogs(commentaryId, fastify)

      const marketToUpdate = await getEventMarketByIdsQuery(
        { eventMarketIds: marketIdArr },
        null,
        fastify
      );
  
      // const marketToUpdate = await marketToUpdatePromise;
      const marketOdd = [];
      for (const data of marketToUpdate) {
        const index = global.tblEventMarkets.findIndex(
          (market) => market.eventMarketId === data.eventMarketId
        );
        if (index !== -1) {
          global.tblEventMarkets[index] = data;
        } else {
          global.tblEventMarkets.push(data);
        }
      };
  
      const eventMarketIds = marketIdArr.flat().map(Number);
      if (eventMarketIds?.length > 0){
      let whereCondition = ` tem."wrID" IN(${eventMarketIds})`;
      const eventMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition)
      if(eventMarketData.length > 0){
        for (const updatedItem of eventMarketData) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId == updatedItem.eventMarketId
          );
    
          if (index !== -1) {
            if(updatedItem.status === 6 || updatedItem.status === 5 && updatedItem.isResult === true){
              global.tblEventMarketsV2.splice(index, 1);
            } else {
              global.tblEventMarketsV2[index] = updatedItem;
            }
            
          } else {
            global.tblEventMarketsV2.push(updatedItem);
          }
        }
      }
      let whereClause = ` tmr."wrEventMarketId" IN(${eventMarketIds})`;
      const runnerData = await getAllMarketRunnersV2ByIdQuery(fastify, whereClause);
      if(runnerData?.length > 0){
        for (const runner of runnerData) {
          let index = global.tblMarketRunnerV2.findIndex(
            (item) => item.eventMarketId === runner.eventMarketId
          );
          let eventMarketData = global.tblEventMarketsV2.find((item) => 
            item.eventMarketId === runner.eventMarketId
          )
          if (index !== -1) {
            if(runner.selectionStatus === 6 || runner.selectionStatus === 5 && 
              eventMarketData.status === 5 && eventMarketData.isResult === true
            ){
              global.tblMarketRunnerV2.splice(index, 1);
            } else {
              global.tblMarketRunnerV2[index] = runner;
            }
          } else {
            global.tblMarketRunnerV2.push(runner);
          }
        }
      }
    }

      global.sessionData.push({type: "marketToUpdate", data: marketToUpdate})
      let LDOMARKETSIDS;
      try {
        LDOMARKETSIDS = global.tblConfigs
          .find((item) => item.key === configConstants.LDOMARKET)
          .value.split(",");
      } catch {
        LDOMARKETSIDS = ["26", "27", "28", "6"];
      }
  
      const filteredMarkets = marketToUpdate.filter(
        (market) =>
          !LDOMARKETSIDS.includes(market.marketTypeCategoryId.toString()) &&
          market.status === 1
      );
      global.sessionData.push({type: "filteredMarkets", data: filteredMarkets})
      if (ballbybllId && filteredMarkets.length > 0) {
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
  
          let existingEvent = result.find(
            (event) => event.eventMarketId === item.eventMarketId
          );
  
          if (existingEvent) {
            existingEvent.data.push(runnerData);
          } else {
            result.push({
              commentaryId: item.commentaryId,
              commentaryBallByBallId: ballbybllId || null,
              eventMarketId: item.eventMarketId,
              marketStatus: item.status,
              marketName: item.marketName,
              data: [runnerData],
            });
          }
        });
        global.sessionData.push({type: "Result", data: result})
        // Convert data to JSON strings
        result.forEach((event) => {
          event.data = JSON.stringify(event.data);
        });
  
        for (let index = 0; index < result.length; index++) {
          let res;
          try {
            res = await CheckAndCreateMarketOddsBallInSaveDetails(result[index], fastify);
          } catch (error) {
            errorLogger(
              fastify,
              error.message,
              "ERROR --> CheckAndCreateMarketOddsBallInSaveDetails",
              request
            );
          }

          const tblMarketOddsIndex = global.tblMarketOddsBallByBall.findIndex(item => item.commentaryId === res.commentaryId
            && item.eventMarketId === res.eventMarketId
            && item.commentaryBallByBallId === res.commentaryBallByBallId
          );

          if (tblMarketOddsIndex !== -1) {
            global.tblMarketOddsBallByBall[tblMarketOddsIndex] = res;
          } else {
            global.tblMarketOddsBallByBall.push(res);
          }

          const marketOddIndex  = marketOdd.findIndex(item => item.commentaryId === res.commentaryId
            && item.eventMarketId === res.eventMarketId
            && item.commentaryBallByBallId === res.commentaryBallByBallId
          );  

          if (marketOddIndex !== -1) {
            marketOdd[marketOddIndex] = res;
          } else {
            marketOdd.push(res);
          }
        }
      }
  
      const commentaryData = global.tblCommentaries.find(
        (commentary) => commentary.commentaryId === commentaryId
      );
      const sendDataForSocketUpdate = {
        commentaryId,
        eventRefId: commentaryData?.eventRefId,
        dataToUpdate: [
          {
            module: "marketOddsBallByBall",
            data: marketOdd,
            type: "create",
          },
        ],
      };
      // let sendDataForSocketUpdate = {};
      // sendDataForSocketUpdate.commentaryId = commentaryId;
      // sendDataForSocketUpdate.eventRefId = commentaryData?.eventRefId;

      // if(marketOdd.length > 0) {
      //   sendDataForSocketUpdate.dataToUpdate = [
      //     {
      //       module: "marketOddsBallByBall",
      //       data: marketOdd,
      //       type : "create"
      //     }
      //   ];
      // }
  
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
      // await updateTimeLogs(timeLogs.wrId, fastify);
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
          const runnerDetails = await getMnMarketByCId(commentaryId, fastify);
          if (runnerDetails && runnerDetails.length > 0) {          
            socket.emit("inningsRunData", runnerDetails);
          } else {
            socket.emit("inningsRunData", []);
          }
    } catch (err) {
      console.log("Error in isInningsConnection", err?.message || err);
    }
  });
  
  socket.on("conMnMarket", async(commentaryId) => {
    try {
          const roomName = `mnMarket-${commentaryId}`;
          socket.join(roomName);
          const markets = await getMnMarketByCId({commentaryId}, fastify);
          if (markets && markets.length > 0) {          
            socket.emit("upMnMarket", markets);
          } else {
            socket.emit("upMnMarket", []);
          }
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> socketIo.js/conMnMarket",
        null
      );
      console.log("Error in conMnMarket", err?.message || err);
    }
  });
  socket.on("disConMnMarket", (commentaryId) => {
    try {
      const roomName = `mnMarket-${commentaryId}`;
      socket.leave(roomName);
    } catch (error) {
      errorLogger(
        fastify,
        error.message,
        "ERROR --> socketIo.js/disConMnMarket",
        null
      );
    }
  });


  socket.on("ping" , () =>{
    socket.emit("pong")
  })
  
  socket.on("connectEventMarket", async (data) => {
    const { commentaryId } = data;
    socket.join(commentaryId);
    const markets = await getMarketByComIdQuery({commentaryId : commentaryId}, fastify);
    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
    if (clientInRoom?.size) {
      global.socketIo.to(commentaryId).emit("updateMarket", markets);
    }

  });
  // connect for scoring page
  socket.on("conCommentary", (data) => {
    const { commentaryId ,eventRefId } = data;
    socket.join(`score-${commentaryId}`);
    socket.emit("commentaryJoined",{
      commentaryId : commentaryId
    })

  });
  socket.on("betAllow", async (data) => {
    const { commentaryId, betAllow ,eventRefId } = data;
    // console.log("betAllow", betAllow);
    callTPAPI(data , fastify);
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

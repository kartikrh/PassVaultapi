const jwt = require("jsonwebtoken");
const { errorLogger } = require("./utilities/logger");
const { getEventMarketByIdsQuery } = require("./repository/TableEventMarkets");
const { MarketActionType } = require("./utilities");
const {createMarketOddsBallByBallBYIDFromSocketIo,createMarketOddsBallInSaveDetails} = require("./repository/TableMarketOddsBallByBall")

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
      socket.join(userId); // Join the specified room
    }
  }
  socket.on("updatedEventMarket", async (data) => {
    try {
      let MarketArr = [];
      //console.log("marketData", data);
      const { commentaryId, marketData } = data;
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
      if (clientInRoom?.size) {
        global.socketIo.to(commentaryId).emit("updateMarketData", marketData );
      }
      let ballbybllId;
      let marketIdArr = marketData.map((item) =>{
        let mark = JSON.parse(item);
        MarketArr.push(mark);
        ballbybllId = mark.ballByBallId;
        return mark.marketId;
      });
      let marketToUpdate = await getEventMarketByIdsQuery(
        {
          eventMarketIds: marketIdArr
        },
        null,
        fastify
      )
      const marketOdd = [];
      for (let data of marketToUpdate) {
        let index = global.tblEventMarkets.findIndex((market) => market.eventMarketId === data.eventMarketId);
        if(index != -1){
          global.tblEventMarkets[index] = data;
        }
        else {
          global.tblEventMarkets.push(data);
        }
        // if (ballbybllId) {
        //   let ballData = await createMarketOddsBallByBallBYIDFromSocketIo(ballbybllId, data, fastify);
        //   if (ballData) {
        //     global.tblMarketOddsBallByBall.push(ballData);
        //     marketOdd.push(ballData);
        //   }
        // }
      }

      if(ballbybllId)
      {
        const result = [];

        marketToUpdate.forEach(item => {
          // Find if the eventMarketId already exists in the result array
          let existingEvent = result.find(event => event.EventMarketId === item.eventMarketId);
        
          const runnerData = {
            teamId: item.teamId,
            RunnerId: item.runnerId,
            BackPrice: item.backPrice,
            LayPrice: item.layPrice,
            BackSize: item.backSize,
            LaySize: item.laySize,
            RunnerName: item.runner,
            selectionId: item.selectionId,
            timestamp: new Date().toISOString()
          };
        
          if (existingEvent) {
            // If the eventMarketId exists, just push the new runner data into the Data field
            existingEvent.Data.push(runnerData);
          } else {
            // If not, create a new entry for this eventMarketId
            const newEvent = {
              commentaryId: item.commentaryId,
              commentaryBallByBallId: ballbybllId || null, // Adjust as needed
              eventMarketId: item.eventMarketId,
              marketStatus: item.status,
              marketName: item.marketName,
              data: [runnerData] // Initialize with the first runner's data
            };
            result.push(newEvent);
          }
        });

        // Convert Data array to JSON strings
        result.forEach(event => {
          event.data = JSON.stringify(event.data);
        });

        for (let index = 0; index < result.length; index++) {
          let res;
          try {
            res = await createMarketOddsBallInSaveDetails(result[index], fastify);
          } catch (error) {
            errorLogger(
              fastify,
              error.message,
              "ERROR --> createMarketOddsBallInSaveDetails",
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

      let commentaryData = global.tblCommentaries.find((commentary) => commentary.commentaryId === commentaryId);
      const sendDataForSocketUpdate = {};
      sendDataForSocketUpdate.commentaryId = commentaryId;
      sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;

      if(marketOdd.length > 0) {
        sendDataForSocketUpdate.dataToUpdate = [
          {
            module: "marketOddsBallByBall",
            data: marketOdd,
            type : "create"
          }
        ];
        global.clientSocketIo.forEach((socket) => {
          socket.client.emit("updateFullscore", sendDataForSocketUpdate);
        });
      }
      
      // if(commentaryId){
      //   let marketRunner = global.tblEventMarkets.filter((item) => item.commentaryId == commentaryId && item.rateSource === 2)
      //   marketRunner = marketRunner.map((item) => {
      //     let teamNameData
      //     if(item.teamId){
      //     teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
      //     }
      //     if(!item.teamId){
      //         teamNameData = global.tblCommentaryTeams.find((t) => 
      //             t.teamName.toLowerCase() == item.runner?.toLowerCase())
      //     }
      //     return {
      //         runnerId: item.runnerId,
      //         runner: item.runner,
      //         selectionId: item.selectionId,
      //         backSize: item.backSize,
      //         laySize: item.laySize,
      //         backPrice: item.backPrice,
      //         layPrice: item.layPrice,
      //         teamId: item.teamId,
      //         teamName: teamNameData?.teamName || null
      //     }
      //   });
      //   // sendDataForSocketUpdate.dataToUpdate.push({
      //   //   module: "marketRunner",
      //   //   type: "update",
      //   //   data: marketRunner,
      //   // });
      //   global.clientSocketIo.forEach((socket) => {
      //     socket.client.emit("updateRunnerData", marketRunner);
      //   });
      // }
      
      // global.clientSocketIo.forEach((socket) => {
      //   socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      // });

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

  socket.on("ping" , () =>{
    socket.emit("pong")
  })
  

  socket.on("connectEventMarket", (data) => {
    const { commentaryId } = data;
    socket.join(commentaryId);
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

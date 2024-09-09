const jwt = require("jsonwebtoken");
const { errorLogger } = require("./utilities/logger");
const { getEventMarketByIdsQuery } = require("./repository/TableEventMarkets");
const { MarketActionType } = require("./utilities");
const {createMarketOddsBallByBallBYIDFromSocketIo} = require("./repository/TableMarketOddsBallByBall")

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
        if (ballbybllId) {
          let ballData = await createMarketOddsBallByBallBYIDFromSocketIo(ballbybllId, data, fastify);
          if (ballData) {
            global.tblMarketOddsBallByBall.push(ballData);
            marketOdd.push(ballData);
          }
        }
      }
      let commentaryData = global.tblCommentaries.find((commentary) => commentary.commentaryId === commentaryId);
      const sendDataForSocketUpdate = {};
      sendDataForSocketUpdate.commentaryId = commentaryId;
      sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
      sendDataForSocketUpdate.dataToUpdate = [
        {
          module: "marketOddsBallByBall",
          data: marketOdd,
          type : "create"
        }
      ];
      
      if(commentaryId){
        let marketRunner = global.tblEventMarkets.filter((item) => item.commentaryId == commentaryId && item.rateSource === 2)
        marketRunner = marketRunner.map((item) => {
          return {
              runnerId: item.runnerId,
              runner: item.runner,
              selectionId: item.selectionId,
              backSize: item.backSize,
              laySize: item.laySize,
              teamId: item.teamId,
              teamName: item.teamName
          }
      });
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "marketRunner",
          type: "update",
          data: marketRunner,
        });
      }
      
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
      console.log("Event Market Updated successfully");
      return true;
  
    // let marketDataToUpdate = marketData;

    // // console.log("marketDataToUpdate", marketDataToUpdate);
    // let runnerData = [];
    // let marketDataLog = [];
  
    // for (let data of marketDataToUpdate) {
    //   data = JSON.parse(data);
    //   runnerData.push(...data.runner);
    //   marketDataLog.push({
    //     commentaryId,
    //     eventMarketId: data.id,
    //     data: data,
    //     updateType: MarketUpdateType.predictMarket
    //   });
      
    // }
    //   await fastify.db.query(
    //     `CALL proc_update_eventmarket_runner(
    //       $1, $2, $3
    //     )`,
    //     {
    //       bind: [
    //         JSON.stringify(runnerData),
    //         JSON.stringify(marketDataLog),
    //         null
    //       ]
    //     }
    //   );
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

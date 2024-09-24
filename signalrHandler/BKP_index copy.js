const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource,MarketUpdateType} = require('../utilities/index');
const { marketLogger, marketDataLogger } = require("../utilities/logger");
const {updateEventMarketRunnerMaunalQuery,getEventMarketByIdsQuery,UpdateEventMarketByCIdFromSocketQuery} = require('../repository/TableEventMarkets');
const {updateCommentaryTeamPredictionPrecentageQuery} = require('../repository/TableCommentary');
const {updateLatestMarketOddsBallByBall} = require('../repository/TableMarketOddsBallByBall');

const configConstants = require('../utilities/configConstants');
let connection;
global.rateSourceRefIDSet = new Set();
global.isAdminStoppedSignalR = false;
let intervalId;
let _fastify;
let checkConfigIntervalId;

async function startSignalR(fastify) {
  try {
    const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
    if(isSON && isSON == 'true'){
      if(fastify){
       _fastify = fastify;
      }
      const _SignalRURL = global.tblConfigs.find((item) => item.key === configConstants.MARKETRTETHIRDPARTY).value;
      const _SignalRInterwal = global.tblConfigs.find((item) => item.key === configConstants.INTERVAL_MarketTHIRDPARTY).value;
      if(_SignalRURL){
        connection = new signalR.HubConnectionBuilder()
          .withUrl(_SignalRURL)
          .build();
        try {
          await connection.start();
          console.log('SignalR Connected');
          global.isAdminStoppedSignalR = false;
          global.SignalRData = [];
          global.selectionData = {};
          // Function to check and invoke ConnectMarketRate if new IDs are added
          const checkAndUpdateMarketRate = async (_fastify) => {
            let _MarketsIds = global.tblEventMarkets.filter(
              (item) => item.rateSource === EventMarketRateSource.Manual && item.status != EventMarketStatus.NotOpen && item.status != EventMarketStatus.Close
            );
          
            let _newIDs = [];
            _MarketsIds.forEach((item) => {
              if (!global.rateSourceRefIDSet.has(item.rateSourceRefID)) {
                global.rateSourceRefIDSet.add(item.rateSourceRefID);
                _newIDs.push(item.rateSourceRefID);
              }
            });
          
            if (_newIDs.length > 0) {
              const newRateSourceRefIDs  =  _newIDs.join(',');
              try {
                await connection.invoke('ConnectMarketRate', newRateSourceRefIDs);
                _newIDs = [];
                //console.log(`Invoked ConnectMarketRate with arguments "${newRateSourceRefIDs}"`);
              } catch (invokeErr) {
                console.error('Error invoking ConnectMarketRate:', invokeErr);
              }
            }
          };
        
        
          intervalId = setInterval(checkAndUpdateMarketRate, _SignalRInterwal || 10000);
        
          connection.on('Rate', async (message) => {
            try {
              let _message = message;
              let commentary;
              if(_message.rt){
                //console.log("Get Rates");
                const data = _message;
              
                const EventsMarketobj = global.tblEventMarkets.find(
                  (item) => item.rateSourceRefID === data.mi
                );
                if(EventsMarketobj)
                { 
                  const groupedRates = {};
                  if(data.rt.length >= 12){
                    data.rt.forEach(rate => {
                        const selectionId = rate.si;
                        if (!groupedRates[selectionId]) {
                            groupedRates[selectionId] = { back: [], lay: [] };
                        }
                      
                        // Separate into back and lay rates where pr is 0
                        if (rate.pr === 0) {
                            if (rate.ib) {
                                groupedRates[selectionId].back.push(rate);
                            } else {
                                groupedRates[selectionId].lay.push(rate);
                            }
                        }
                    });
                }
                else{
                  data.rt.forEach(rate => {
                    const selectionId = rate.si;
                    if (!groupedRates[selectionId]) {
                        groupedRates[selectionId] = { back: [], lay: [] };
                    }
                  
                    // Separate into back and lay rates where pr is 0
                    if (rate.pr === 1) {
                        if (rate.ib) {
                            groupedRates[selectionId].back.push(rate);
                        } else {
                            groupedRates[selectionId].lay.push(rate);
                        }
                    }
                  });
                }
                  // Create the desired output structure
                  const _blrbsids = [];
                  const currentTime = new Date().toISOString();
                  Object.keys(groupedRates).forEach(selectionId => {
                      const rates = groupedRates[selectionId];
                      const backRates = rates.back.length ? rates.back : [{ rv: null, re: null }];
                      const layRates = rates.lay.length ? rates.lay : [{ rv: null, re: null }];
                  
                      backRates.forEach(backRate => {
                          layRates.forEach(layRate => {
                            _blrbsids.push({
                                  backPrice: backRate.rv,
                                  backSize: backRate.re,
                                  layPrice: layRate.rv,
                                  laySize: layRate.re,
                                  selectionId: parseInt(selectionId, 10),
                                  timestamp: currentTime // Add timestamp here
                              });
                          });
                      });
                  });
                
                  //console.log(_blrbsids);
                  if(_blrbsids && _blrbsids.length)
                  {
                     let marketId;
                     
                     for (const items of _blrbsids) {
                      let _time = items.timestamp;
                      const _selectionidData = global.tblEventMarkets.find(
                        (e) => e.selectionId == items.selectionId
                      );
                      if (_selectionidData && _selectionidData.runner !== 'The Draw') {
                        try {
                          //console.log('updateEventMarketRunnerMaunalQuery');
                          let _data2 = await updateEventMarketRunnerMaunalQuery(items, _fastify);
                          if(_selectionidData.commentaryId != 0){
                            try {
                              let _updateData= {};
                              _updateData.EventMarketId = _selectionidData.eventMarketId;
                              _updateData.RunnerId = _selectionidData.runnerId;
                              _updateData.MarketStatus = _selectionidData.status;
                              _updateData.BackPrice = items.backPrice;
                              _updateData.LayPrice = items.layPrice;
                              _updateData.BackSize = items.backSize;
                              _updateData.LaySize = items.laySize;
                              _updateData.MarketName = _selectionidData.marketName;
                              _updateData.RunnerName = _selectionidData.runner;
                              _updateData.commentaryId = _selectionidData.commentaryId;
                              _updateData.selectionId = _selectionidData.selectionId;
                            
                              commentary = await global.tblCommentaries.find(
                                (item) => item.commentaryId === _selectionidData.commentaryId
                              );
                              if(commentary.isTeamPredictionOn)
                              {
                                let teams;
                                teams = global.tblCommentaryTeams.find(
                                  (item) =>
                                    item.commentaryId === commentary.commentaryId &&
                                    item.currentInnings === commentary.currentInnings && 
                                    item.teamName === _data2.teamId
                                );
                                if(!teams){
                                  teams = global.tblCommentaryTeams.find(
                                    (item) =>
                                      item.commentaryId === commentary.commentaryId &&
                                      item.currentInnings === commentary.currentInnings && 
                                      item.teamName === _data2.runner
                                  );
                                }
                                if(teams){
                                  _updateData.teamId = teams.teamId;
                                  const { EventMarketId,selectionId } = _updateData;
                                  const key = `${EventMarketId}_${selectionId}`;
                                  if (global.SignalRData[key]) {
                                    // Update the existing entry
                                    global.SignalRData[key] = {
                                        ...global.SignalRData[key], // Preserve other properties if needed
                                        commentaryId: _updateData.commentaryId,
                                        teamId: _updateData.teamId,
                                        MarketStatus: _updateData.MarketStatus,
                                        BackPrice: _updateData.BackPrice,
                                        LayPrice: _updateData.LayPrice,
                                        BackSize: _updateData.BackSize,
                                        LaySize: _updateData.LaySize,
                                        MarketName: _updateData.MarketName,
                                        RunnerName: _updateData.RunnerName,
                                        timestamp: _time,
                                    };
                                  } else {
                                      // Create a new entry
                                      global.SignalRData[key] = {
                                          commentaryId: _updateData.commentaryId,
                                          teamId: _updateData.teamId,
                                          EventMarketId:_updateData.EventMarketId,
                                          RunnerId:_updateData.RunnerId,
                                          MarketStatus: _updateData.MarketStatus,
                                          BackPrice: _updateData.BackPrice,
                                          LayPrice: _updateData.LayPrice,
                                          BackSize: _updateData.BackSize,
                                          LaySize: _updateData.LaySize,
                                          MarketName: _updateData.MarketName,
                                          selectionId:_updateData.selectionId,
                                          timestamp: _time
                                      };
                                    }
                                }
                                //await updateLatestMarketOddsBallByBall(_updateData,_fastify,_selectionidData.commentaryId);
                                //console.log('Updated latest ball');
                              }
                            } catch (error) {console.log('Error after Updated latest ball',error);}
                            try {
                              if (!global.selectionData[items.selectionId]) {
                                global.selectionData[items.selectionId] = {
                                    backSize: [],
                                    laySize: []
                                };
                               }
                             
                               if (items.backSize !== undefined) {
                                global.selectionData[items.selectionId].backSize.push(items.backSize);
                               }
                               if (items.laySize !== undefined) {
                                global.selectionData[items.selectionId].laySize.push(items.laySize);
                              }
                            
                              let selection = global.selectionData[items.selectionId];
                              let _minRate;
                              if (selection && selection.laySize.length > 0) {
                                _minRate = Math.min(...selection.laySize);
                              } else {
                                  return 0; // or some other value indicating no prices are available
                              }
                              if(_minRate != 0){
                                let vRatesTeam = (1 / parseFloat(_minRate)) * 100;
                                // vRatesTeam = parseInt(vRatesTeam.toFixed(0));
                                vRatesTeam = Math.round(vRatesTeam);
                                let teams;
                                let commentary = await global.tblCommentaries.find(
                                  (item) => item.commentaryId === _selectionidData.commentaryId
                                );

                                teams = global.tblCommentaryTeams.find(
                                  (item) =>
                                    item.commentaryId === commentary.commentaryId &&
                                    item.currentInnings === commentary.currentInnings && 
                                    item.teamName === _data2.teamId
                                );
                                if(!teams){
                                  teams = global.tblCommentaryTeams.find(
                                    (item) =>
                                      item.commentaryId === commentary.commentaryId &&
                                      item.currentInnings === commentary.currentInnings && 
                                      item.teamName === _data2.runner
                                  );
                                }
                                if(teams){
                                  if(commentary.isTeamPredictionOn){
                                    le = {};
                                    _update.commentaryTeamId = teams.commentaryTeamId;
                                    _update.teamPredictionPercentage = vRatesTeam;
                                    _update.team2PredictionPercentage = 100 - parseInt(_update.teamPredictionPercentage);
                                    _update.currentInnings = commentary.currentInnings;
                                    _update.commentaryId = _selectionidData.commentaryId;

                                    const index = global.tblCommentaryTeams.findIndex(
                                      (item) =>
                                        item.commentaryId === commentary.commentaryId &&
                                        item.commentaryTeamId === teams.commentaryTeamId
                                    );
                                    global.tblCommentaryTeams[index].teamPredictionPercentage  = _update.teamPredictionPercentage;
                                  
                                    const _index = global.tblCommentaryTeams.findIndex(
                                      (item) =>
                                        item.commentaryId === commentary.commentaryId &&
                                        item.commentaryTeamId !== teams.commentaryTeamId && 
                                        item.currentInnings === commentary.currentInnings
                                    );
                                    global.tblCommentaryTeams[_index].teamPredictionPercentage  = parseInt(_update.team2PredictionPercentage);
                                    await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);
                                    //console.log('updateCommentaryTeamPredictionPrecentageQuery');
                                  }
                                } 
                              }
                            } catch (error) {
                              console.error(error.message);
                            }
                          }
                        } catch (error) {
                          console.error('updateEventMarketRunnerMaunalQuery:', error);
                        }
                      }
                    }
                    // let _isThreadDone = await  UpdateEventMarketByCIdFromSocketQuery({eventMarketId:EventsMarketobj.eventMarketId},_fastify);
                    // if(_isThreadDone){
                    //   const dataOfmarkets = await  getEventMarketByIdsQuery(
                    //    {
                    //      eventMarketIds: [EventsMarketobj.eventMarketId],
                    //    },
                    //    null,
                    //    _fastify
                    //    );
                    //    for (let item of dataOfmarkets) {
                    //     let index = global.tblEventMarkets.findIndex(
                    //       (e) => e.selectionId == item.selectionId
                    //     );
                    //     if (index === -1) {
                    //       global.tblEventMarkets.push(item);
                    //       marketDataLogger(
                    //         {
                    //           eventMarketId: item.eventMarketId,
                    //           commentaryId: item.commentaryId,
                    //           dataTosave: JSON.parse(item.data),
                    //           updateType: MarketUpdateType.marketInitilization,
                    //         },
                    //         null,
                    //         _fastify
                    //       );
                    //     } else {
                    //       let previousLine = global.tblEventMarkets[index].line;
                    //       global.tblEventMarkets[index] = item;
                    //       marketDataLogger(
                    //         {
                    //           eventMarketId: item.eventMarketId,
                    //           commentaryId: item.commentaryId,
                    //           dataTosave: JSON.parse(item.data),
                    //           updateType: MarketUpdateType.marketInitilization,
                    //           lineDiff: item.line - (previousLine || 0),
                    //         },
                    //         null,
                    //         _fastify
                    //       );
                    //     }
                    //   }
                    // }
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          });
        } catch (err) {
          console.error('Error connecting to SignalR:', err);
          setTimeout(startSignalR, 300000); 
          throw new Error(err);
        }
      }
    } else{
      await stopSignalR();
    } 
    if (!checkConfigIntervalId) {
      try {
        checkConfigIntervalId = setInterval(async () => {
          const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
          if (isSON === 'true') {
            if (!global.isAdminStoppedSignalR && (!connection || connection.state !== signalR.HubConnectionState.Connected)) {
              global.rateSourceRefIDSet = new Set();
              await startSignalR(_fastify);
            }
          } else {
            await stopSignalR();
          }
        }, 300000); // 5 minutes 300000
      } catch (error) {
        //console.error('Error disconnecting from SignalR:', error);
        throw new Error(error);
      }
    }
  } catch (error) { 
    //console.error('Error disconnecting from SignalR:');
    throw new Error(error);
  }
}

async function stopSignalR(fastify) {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR Disconnected');
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      global.isAdminStoppedSignalR = true;
      global.rateSourceRefIDSet = new Set();
      global.selectionData = {};
    } catch (err) {
      console.error('Error disconnecting from SignalR:', err);
      throw new Error(err);
    }
  }
}

function isSignalRStarted(fastify) {
  return connection && connection.state === signalR.HubConnectionState.Connected;
}

const syncCommentaryStatsWithAPIAndSocket = async (request, fastify) => {
  // check sp
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryOvers,
      commentaryBallByBall,
      commentaryWicket,
      commentaryPartnership,
      commentaryDetails,
      deleteCommentaryBallByBallId,
      deleteOverId,
      commentaryId,
      isEndInnings
    } = request.body;

    let commentaryIndex,
      overIndex,
      ballByBallIndex,
      wicketIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let _resFromPredictAPI;
    let callPredictions = [];
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
    }

    let previousCommentaryStatus, statusToUpdate, balltypeOfdeleteBall;
    // validate CommentaryId
    if (commentaryDetails) {
      commentaryIndex = global.tblCommentaries.findIndex(
        (item) => item.commentaryId === commentaryDetails.commentaryId
      );
      if (commentaryIndex === -1) {
        throw new Error("Commentary with this id not Found");
      }
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
    }
    // check if delete ballByBall
    if (deleteCommentaryBallByBallId) {
      let deleteBallIndex = global.tblCommentaryBallByBall.findIndex(
        (item) => item.commentaryBallByBallId === deleteCommentaryBallByBallId
      );
      if (deleteBallIndex === -1) {
        throw new Error("Delete BallByBall with this id not Found");
      }
      balltypeOfdeleteBall = global.tblCommentaryBallByBall[deleteBallIndex].ballType;
    }
    if (deleteOverId) {
      let deleteOverIndex = global.tblOvers.findIndex(
        (item) => item.overId === deleteOverId
      );
      if (deleteOverIndex === -1) {
        throw new Error("Delete Over with this id not Found");
      }
    }
    // validate commentaryTeams
    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      });
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter((player) => player.commentaryPlayerId != null || player.commentaryPlayerId != undefined);
      commentaryPlayers.forEach((player) => {
        if(player.commentaryPlayerId){
          const index = global.tblCommentaryPlayers.findIndex(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId
          );
          if (index === -1) {
            throw new Error("Commentary Player with this id not Found");
          }
        }
      });
    }
    //validate over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        overIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryOvers.commentaryId
        );

        if (overIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
        const indexTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId
        );

        if (indexTeam === -1) {
          throw new Error("Team with this id not Found");
        }
        const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
          return (
            item.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId &&
            item.commentaryPlayerId === commentaryOvers.bowlerId
          );
        });

        if (indexBowler === -1) {
          throw new Error("Bowler with this id not Found");
        }
      } else {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
        if (overIndex === -1) {
          throw new Error("Over with this id not Found");
        }
      }
    }
    //validate ballByBall
    if (commentaryBallByBall) {
      if (commentaryBallByBall.commentaryBallByBallId == 0) {
        ballByBallIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryBallByBall.commentaryId
        );
        if (ballByBallIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ===
            commentaryBallByBall.commentaryBallByBallId
        );
        if (ballByBallIndex === -1) {
          throw new Error("BallByBall with this id not Found");
        }
      }
    }
    //validate wicket
    if (commentaryWicket) {
      if (commentaryWicket.commentaryWicketId == 0) {
        wicketIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryWicket.commentaryId
        );
        if (wicketIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId === commentaryWicket.commentaryWicketId
        );
        if (wicketIndex === -1) {
          throw new Error("Wicket with this id not Found");
        }
      }
    }
    //validate partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        partnershipIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryPartnership.commentaryId
        );
        if (partnershipIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_setcommentary(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13,$14 ,$15
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? commentaryOvers : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryWicket ? JSON.stringify(commentaryWicket) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          deleteCommentaryBallByBallId ? deleteCommentaryBallByBallId : null,
          deleteOverId ? deleteOverId : null,
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          null, // commentaryWicketDetails,
          null, // commentaryPartnershipDetails,
          null, // commentaryDetailsDetails,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // if got object then push in global obj else update the global
    updatedData = updatedData[0];
    const response = {};

    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
        currentInnings: commentaryDetails.currentInnings,
      };
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
        currentInnings: commentaryDetails.currentInnings,
        isPredict: commentaryDetails.isPredictMarket
      };
      if (
        previousCommentaryStatus != statusToUpdate
      ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type : statusToUpdate == 4 ? "close" : "update"
          },
          fastify
        ).catch((err) => {
          console.log("call Data Provider console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      if (previousCommentaryStatus != statusToUpdate) {
        const cData = await getMatchDataByCId({
          commentaryId: commentaryId,
        },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData
          },
          request,
          fastify
        ).catch((err) => {
          console.log("call client api console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = team;
      });
      try {
        commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
          }
        });
      } catch (error) {

      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: commentaryTeams,
      });
    }
    if (deleteCommentaryBallByBallId) {
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      try {
        _deleteBallID = {}
        _deleteBallID.commentaryBallByBallId = deleteCommentaryBallByBallId;
        _deleteBallID.commentaryId = commentaryId;
        await deleteMarketOddsBallByBall(_deleteBallID, fastify, request)
      } catch (error) {
        console.log("delete market odds ball by ball console", error);
        errorLogger(
          fastify,
          error.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      }

      if (commentaryBallByBall) {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ===
            commentaryBallByBall.commentaryBallByBallId
        );
      }
      if (commentaryPartnership) {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
      }
      if (commentaryWicket) {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId ===
            commentaryWicket.commentaryWicketId
        );
      }
      // call predictscore
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item.commentaryId === commentaryId && item.teamStatus === 1
      );
      const previousBall = global.tblCommentaryBallByBall
        .filter(
          (item) =>
            item.commentaryId === commentaryId &&
            item.ballType > 0 &&
            item.currentInnings === commentaryData.currentInnings &&
            item.teamId === strikeTeam.teamId
        )
        .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0];
      if (balltypeOfdeleteBall > 0 && previousBall) {
        if (commentaryData.isPredictMarket) {
          //_resFromPredictAPI = null;
          const decimalOverCount = parseFloat(previousBall.overCount);
          const _wkt = previousBall.ballIsWicket;
          //_resFromPredictAPI = await 
          callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: decimalOverCount,
              run: previousBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
              wicket: _wkt === true ? 1 : 0,
              total_wicket: strikeTeam.teamWicket,
            },
            "/api/v1/undoscore",
            fastify,
            request
          ).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
              request
            );
          });
          // let callPrediction = {};
          // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
          //   callPrediction.predictioonAPI = "undoscore"
          //   callPrediction.predictioncallSuccess = false;
          //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
          //   callPrediction.endPoint = '/api/v1/undoscore';
          //   callPredictions.push(callPrediction);
          // }
        }
      }
    }
    if (deleteOverId) {
      global.tblOvers = global.tblOvers.filter(
        (item) => item.overId !== deleteOverId
      );
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.overId !== deleteOverId
      );
      if (commentaryOvers) {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
      }
      if (commentaryBallByBall) {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) => item.overId === commentaryBallByBall.overId
        );
      }
    }
    if (commentaryPlayers) {
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        global.tblCommentaryPlayers[index] = player;
      });

      let _plyers = commentaryPlayers.filter((_fil) => _fil.isPlay === true && _fil.onStrike !== null);
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || '0';
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayers.push(_sendPrePlayer);
      });
      try {
        commentaryPlayers.forEach(async (player) => {
          if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
            player.bowlerOver = player.bowlerOver.toString();
          }
          if (player.bowlerEconomy === "NaN") {
            player.bowlerEconomy = null;
          }
          const _player = global.tblPlayers.filter((item) => item.playerId === player.playerId);
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) {

      }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: commentaryPlayers,
      });
    }
    if (commentaryOvers) {
      if (updatedData.overDetails) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      } else {
        if (!deleteOverId) {
          if (overIndex !== -1) {
            global.tblOvers[overIndex] = commentaryOvers;
          }
        }
        if (deleteOverId && commentaryOvers.overId !== deleteOverId) {
          if (overIndex !== -1) {
            global.tblOvers[overIndex] = commentaryOvers;
          }
        }
        response.overdetails = commentaryOvers;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    if (commentaryBallByBall) {
      if (updatedData.commentaryBallByBallDetails) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;

        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "create",
          data: { ...response.commentaryBallByBallDetails, overCount: response.commentaryBallByBallDetails.overCount !== null ? response.commentaryBallByBallDetails.overCount.toString() : null },
        });

        if(updatedData.commentaryBallByBallDetails.ballType > 0){
          let _results = [];
          let result = await addinMarketBallbyballOdds(commentaryId,updatedData.commentaryBallByBallDetails, fastify).catch((err) => {
              errorLogger(
                fastify,
                err.message,
                "ERROR --> services/commentary.js/addinMarketBallbyballOdds",
                request
              );
            });
            if(result)
            {
              _results.push(result);
              if(_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type : "create"
                });
              }
            }
        }
        // try {
        //     const filteredCid = global.tblEventMarkets.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);

        //     if (filteredCid.length > 0 && updatedData.commentaryBallByBallDetails.ballType > 0) {
        //       // Iterate over tblEventMarkets to build the final structure
        //       const _dataForOds = filteredCid.reduce((acc, entry) => {
        //         const mapKey = `${entry.eventMarketId}_${entry.selectionId}`;
              
        //         //console.log("global.SignalRData:", global.SignalRData);
        //         // Check if the mapKey exists in SignalRData
        //         if (global.SignalRData[mapKey]) {
        //           const matchedItem = global.SignalRData[mapKey];
              
        //           // Create the runner data structure
        //           const runnerData = {
        //             teamId: matchedItem.teamId,
        //             RunnerId: matchedItem.RunnerId,
        //             BackPrice: matchedItem.BackPrice,
        //             LayPrice: matchedItem.LayPrice,
        //             BackSize: matchedItem.BackSize,
        //             LaySize: matchedItem.LaySize,
        //             RunnerName: matchedItem.RunnerName,
        //             selectionId: matchedItem.selectionId,
        //             timestamp: matchedItem.timestamp
        //           };
        //           //console.log("runnerDAta:", runnerData);
              
        //           // Check if EventMarketId already exists in acc
        //           if (!acc[entry.eventMarketId]) {
        //             // Initialize a new object for this EventMarketId
        //             acc[entry.eventMarketId] = {
        //               commentaryId: commentaryId,
        //               commentaryBallByBallId: updatedData.commentaryBallByBallDetails.commentaryBallByBallId,
        //               EventMarketId: entry.eventMarketId,
        //               MarketStatus: entry.status,
        //               MarketName: entry.marketName,
        //               Data: [] // Initialize Data array
        //             };
        //           }
              
        //           // Push the runner data into the Data array
        //           acc[entry.eventMarketId].Data.push(runnerData);
        //         }
              
        //         return acc;
        //       }, {});
              
        //       // Convert the result into an array if needed
        //       const resultArray = Object.values(_dataForOds);
              
        //       // Optionally stringify the Data array within each EventMarketId object
        //       resultArray.forEach(obj => {
        //         obj.Data = JSON.stringify(obj.Data);
        //       });
              
        //       try {
        //         await createMarketOddsBallInSaveDetails(resultArray[0], fastify, request);
        //         sendDataForSocketUpdate.dataToUpdate.push({
        //           module: "marketOddsBallByBall",
        //           data: resultArray,
        //           type : "create"
        //         });
        //       } catch (error) {
        //         console.log("create market odds ball by ball by id console", error);
        //         errorLogger(
        //           fastify,
        //           error.message,
        //           "ERROR --> createMarketOddsBallInSaveDetails",
        //           request
        //         );
        //       }
        //     }
        // } catch (error) {
        //   console.log("error in console", error)
        //   errorLogger(
        //     fastify,
        //     error.message,
        //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        //     request
        //   );
        // }

        // call the predictor market
        if (
          commentaryData.isPredictMarket &&
          updatedData.commentaryBallByBallDetails.ballType > 0
        ) {
          let strikeTeam = global.tblCommentaryTeams.find(
            (item) =>
              item.commentaryId === commentaryBallByBall.commentaryId &&
              item.teamStatus === 1
          );

          let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          //_resFromPredictAPI = null;
          //_resFromPredictAPI = await 
         callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: decimalOverCount,
              run: commentaryBallByBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
              wicket: _wkt === true ? 1 : 0,
              total_wicket: strikeTeam.teamWicket,
            },
            "/api/v1/predictscore",
            fastify,
            request
          ).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket/callpredaictorMarket",
              request
            );
          });
          // let callPrediction = {};
          // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
          //   callPrediction.predictioonAPI = "predictscore"
          //   callPrediction.predictioncallSuccess = false;
          //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
          //   callPrediction.endPoint = '/api/v1/predictscore';
          //   callPredictions.push(callPrediction);
          // }
        }
      } else {
        // if(ballByBallIndex !== -1){
        //   global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
        // }
        if (!deleteCommentaryBallByBallId) {
          // ballByBallIndex !== -1
          //   ? (global.tblCommentaryBallByBall[ballByBallIndex] =
          //       commentaryBallByBall)
          //   : null;
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryBallByBall.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
          }
        }
        response.commentaryBallByBallDetails = commentaryBallByBall;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: { ...response.commentaryBallByBallDetails, overCount: response.commentaryBallByBallDetails.overCount !== null ? response.commentaryBallByBallDetails.overCount.toString() : null },
        });
      }
      // call Third Party API
      if (response.commentaryBallByBallDetails.ballType > 0) {
        try {
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          const isFDS = global.tblConfigs.find((item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI).value;
          if (isFDS && isFDS == 'true') {
            if (_wkt || _bory) {
               callfds(
                {
                  Id: 0,
                  EventId: parseInt(commentaryData.eventRefId),
                  BWDateTime: '',
                  Type: _bory === true ? "2" : _wkt === true ? "1" : ""
                },
                "/api/transactions/SaveBoundryWicket",
                fastify,
                request
              ).catch((err) => {
                errorLogger(
                  fastify,
                  err.message,
                  "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
                  request
                );
              });
            }
          }
        } catch (error) {
          console.log("error in console:", error)
          errorLogger(
            fastify,
            error.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
      }
    }
    if (commentaryWicket) {
      if (commentaryWicket.commentaryWicketId == 0) {
        global.tblCommentaryWicket.push(updatedData.commentaryWicketDetails);
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "create",
          data: response.commentaryWicketDetails,
        });
      } else {
        // global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
        // response.commentaryWicketDetails = commentaryWicket;
        // sendDataForSocketUpdate.dataToUpdate.push({
        //   module: "commentaryWicket",
        //   type: "update",
        //   data: response.commentaryWicketDetails,
        // });
        if (!deleteCommentaryBallByBallId) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] = updatedData.commentaryWicketDetails;
          }
        }
        if (deleteCommentaryBallByBallId && commentaryWicket.commentaryBallByBallId !== deleteCommentaryBallByBallId) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] = updatedData.commentaryWicketDetails;
          }
        }
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        if (deleteCommentaryBallByBallId != commentaryWicket.commentaryBallByBallId) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryWicket",
            type: "update",
            data: response.commentaryWicketDetails,
          });
        }
      }
    }
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image = _player1[0].playerimage;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image = _player2[0].playerimage;
            }
          } catch (error) {

          }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails = updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image = _player1[0].playerimage;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image = _player2[0].playerimage;
            }
          } catch (error) {

          }
        }

        // sendDataForSocketUpdate.dataToUpdate.push({
        //   module: "commentaryPartnership",
        //   type: "update",
        //   data: response.commentaryPartnershipDetails,
        // });
        if (!deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
          }
        }
        if (deleteCommentaryBallByBallId && commentaryPartnership.commentaryBallByBallId !== deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
          }
        }
        response.commentaryPartnershipDetails = updatedData.commentaryPartnershipDetails;
        if (deleteCommentaryBallByBallId != commentaryPartnership.commentaryBallByBallId) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPartnership",
            type: "update",
            data: response.commentaryPartnershipDetails,
          });
        }
      }
    }
    if (deleteCommentaryBallByBallId) {
      response.deleteCommentaryBallByBallId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        // module: "deleteCommentaryBallByBallId",
        // type: "delete",
        // data: deleteCommentaryBallByBallId,
        module: "commentaryBallByBall",
        type: "delete",
        data: { commentaryBallByBallId: deleteCommentaryBallByBallId },
      });
    }
    if (deleteOverId) {
      response.deleteOverId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        // module: "deleteOverId",
        // type: "delete",
        // data: deleteOverId,
        module: "commentaryOvers",
        type: "delete",
        data: { overId: deleteOverId },
      });
    }
    if (
      commentaryDetails &&
      commentaryData.isPredictMarket == true &&
      previousCommentaryStatus == 1 &&
      statusToUpdate == 2
    ) {
      handleMarketCloseService(
        {
          commentaryId: commentaryDetails.commentaryId,
          inningsId: commentaryDetails.currentInnings,
        },
        request,
        fastify
      ).catch((err) => {
        console.log("handle market closes services console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
          match_type_id: commentaryDetails.matchTypeId,
          event_id: commentaryDetails.eventRefId,
        },
        "/api/v1/loadcommentary",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "loadcommentary"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/loadcommentary';
      //   callPredictions.push(callPrediction);
      // }
    }

    if (
      commentaryDetails &&
      commentaryData.isPredictMarket == true &&
      statusToUpdate == 4
    ) {
      await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "endcommentary"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/endcommentary';
      //   callPredictions.push(callPrediction);
      // }
    }

    // call the getscore and emit the event data
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: commentaryData.eventRefId,
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
        
      })

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
      // });
      //   sendDataForSocketUpdate.dataToUpdate.push({
      //     module: "marketRunner",
      //     type: "update",
      //     data: marketRunner,
      //   });
      // }

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }

    if (global.wss) {
      let res = {};
      res.eventname = "ShortScore";
      res.connectionID = "";
      let _ShortCommentry = setShortCommenrty(commentaryData.eventRefId);
      _ShortCommentry = JSON.stringify(_ShortCommentry);
      res.data = _ShortCommentry;
      // Iterate over all connected clients and send the update
      global.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(res));
        }
      });
    }

    let strikeTeam;
    if (
      commentaryDetails && _sendPrePlayers &&
      commentaryData.isPredictMarket == true &&
      previousCommentaryStatus == 3 &&
      updatedData.commentaryBallByBallDetails
    ) {
      strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item.commentaryId === commentaryData.commentaryId &&
          item.teamStatus === 1
      );
      let decimalOverCount;
      try {
        decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      }
      catch (error) {
        decimalOverCount = 0;
      }
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
     callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount,
          player_details: _sendPrePlayers
        },
        "/api/v1/playerpredictscore",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "playerpredictscore"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/playerpredictscore';
      //   callPredictions.push(callPrediction);
      // }
    }
    if (isEndInnings && isEndInnings == true) {
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await 
      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          strike_team_id: strikeTeam.teamId,
        },
        "/api/v1/endinnings",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "endinnings"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/endinnings';
      //   callPredictions.push(callPrediction);
      // }
    }
    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: response,
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item.commentaryId === commentaryId
          ),
        },
        extra: {
          ballByBall : global.tblCommentaryBallByBall.filter(
            (item) => item.commentaryId === commentaryId
          ),
        },
        apiName : "/saveDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        request
      );
    });
    response.callPredictions = callPredictions;
    return response;
  } catch (error) {
    console.log("console value 7418596", error);
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall : global.tblCommentaryBallByBall.filter(
            (item) => item.commentaryId === request.body.commentaryId
          ),
        },
        apiName : "/saveDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        request
      );
    });
    throw error;
  }
};

const addinMarketBallbyballOdds = async (commentaryId, objball,fastify) =>{
  let _resultArray;
  try {
      const filteredCid = global.tblEventMarkets.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);

      if (filteredCid.length > 0 && objball.ballType > 0) {
        // Iterate over tblEventMarkets to build the final structure
        const _dataForOds = filteredCid.reduce((acc, entry) => {
          const mapKey = `${entry.eventMarketId}_${entry.selectionId}`;
        
          //console.log("global.SignalRData:", global.SignalRData);
          // Check if the mapKey exists in SignalRData
          if (global.SignalRData[mapKey]) {
            const matchedItem = global.SignalRData[mapKey];
        
            // Create the runner data structure
            const runnerData = {
              teamId: matchedItem.teamId,
              RunnerId: matchedItem.RunnerId,
              BackPrice: matchedItem.BackPrice,
              LayPrice: matchedItem.LayPrice,
              BackSize: matchedItem.BackSize,
              LaySize: matchedItem.LaySize,
              RunnerName: matchedItem.RunnerName,
              selectionId: matchedItem.selectionId,
              timestamp: matchedItem.timestamp
            };
            //console.log("runnerDAta:", runnerData);
        
            // Check if EventMarketId already exists in acc
            if (!acc[entry.eventMarketId]) {
              // Initialize a new object for this EventMarketId
              acc[entry.eventMarketId] = {
                commentaryId: commentaryId,
                commentaryBallByBallId: objball.commentaryBallByBallId,
                eventMarketId: entry.eventMarketId,
                marketStatus: entry.status,
                marketName: entry.marketName,
                data: [] // Initialize Data array
              };
            }
        
            // Push the runner data into the Data array
            acc[entry.eventMarketId].data.push(runnerData);
          }
        
          return acc;
        }, {});
        
        // Convert the result into an array if needed
       _resultArray = Object.values(_dataForOds);
        
        // Optionally stringify the Data array within each EventMarketId object
        _resultArray.forEach(obj => {
          obj.data = JSON.stringify(obj.data);
        });
        let res;
        try {
          res = await createMarketOddsBallInSaveDetails(_resultArray[0], fastify, null);
          global.tblMarketOddsBallByBall.push(res);
        } catch (error) {
          console.log("create market odds ball by ball by id console", error);
          errorLogger(
            fastify,
            error.message,
            "ERROR --> createMarketOddsBallInSaveDetails",
            null
          );
        }
        return res;
        // Create a map for SignalRData entries
        // const signalRDataMap = new Map();
        // for (const key in global.SignalRData) {
        //   const entry = global.SignalRData[key];
        //   const mapKey = `${entry.EventMarketId}_${entry.selectionId}`;
        //   signalRDataMap.set(mapKey, entry);
        // }

        // for (const _ifFindCid of filteredCid) {
        //   const { eventMarketId, selectionId } = _ifFindCid;
        //   const mapKey = `${eventMarketId}_${selectionId}`;
        //   const entry = signalRDataMap.get(mapKey);

        //   if (entry) {
        //     const currentTime = new Date();
        //     const entryTime = new Date(entry.timestamp);
        //     const timeDifference = (currentTime - entryTime) / 1000;
        //     if (timeDifference <= 25) {

        //       const _dataForOds = {
        //         commentaryId: commentaryId,
        //         commentaryBallByBallId: updatedData.commentaryBallByBallDetails.commentaryBallByBallId,
        //         teamId: entry.teamId,
        //         EventMarketId: entry.EventMarketId,
        //         RunnerId: entry.RunnerId,
        //         MarketStatus: entry.MarketStatus,
        //         BackPrice: entry.BackPrice,
        //         LayPrice: entry.LayPrice,
        //         BackSize: entry.BackSize,
        //         LaySize: entry.LaySize,
        //         MarketName: entry.MarketName,
        //         RunnerName: entry.RunnerName,
        //         selectionId: entry.selectionId
        //       };

        //       try {
        //         await createMarketOddsBallByBallBYID(_dataForOds, fastify, request);
        //       } catch (error) {
        //         console.log("create market odds ball by ball by id console", error);
        //         errorLogger(
        //           fastify,
        //           error.message,
        //           "ERROR --> createMarketOddsBallByBallBYID",
        //           request
        //         );
        //       }
        //     }
        //   }
        // }
      }
  } catch (error) {
    console.log("error in console", error)
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/commentary.js/addinMarketBallbyballOdds",
      request
    );
    return null;
  }
};

module.exports = {
  startSignalR,
  stopSignalR,
  isSignalRStarted
};

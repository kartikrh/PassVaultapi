const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource,MarketUpdateType} = require('../utilities/index');
const { marketLogger, marketDataLogger } = require("../utilities/logger");
const {updateEventMarketRunnerMaunalQuery,getEventMarketByIdsQuery,UpdateEventMarketByCIdFromSocketQuery,updateMarketStatusFromSignalRQuery} = require('../repository/TableEventMarkets');
const {updateCommentaryTeamPredictionPrecentageQuery} = require('../repository/TableCommentary');
const {updateLatestMarketOddsBallByBall} = require('../repository/TableMarketOddsBallByBall');
const { commentaryDetailsByEventIdService } = require('../services/commentry');
const { ERROR_CODES, error, success } = require("../utilities/index");
const { errorLogger } = require("../utilities/logger");
const { updateThirdPartyApisQuery } = require('../repository/TableThirdPartyApis');
const { thirdPartyApiType } = require('../utilities/index');

const configConstants = require('../utilities/configConstants');
let connection,_fastify,updateMarketRateIntervalId,checkConfigIntervalId,IntervalId;
let connectionCount =0;
// Initialize a global queue
global.rateSourceRefIDSet = new Set();
global.isAdminStoppedSignalR = false;
global.rateQueue = [];
global.SignalRData = [];

//Method for Start Signa
async function startSignalR(fastify) {
  try {
    const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
    if(isSON && isSON == 'true'){
      if(fastify){
        _fastify = fastify;
      }
      const _SignalRURLs = global.tblThirdPartyApis.filter((item) => item.isActive === true && item.type === thirdPartyApiType.Socket && item.isDefault === true);
      const _SignalRInterwal = global.tblConfigs.find((item) => item.key === configConstants.INTERVAL_MarketTHIRDPARTY)?.value || 10000;
      
      let _RateUpdate;
      try {
        _RateUpdate = global.tblConfigs.find((item) => item.key === configConstants.RATEUPDATEINTERWAL)?.value || 500;
      } catch (error) {
        _RateUpdate = 500;
      }
     
      if(_SignalRURLs.length > 0){
      for (const thirdParty of _SignalRURLs) {
        const _SignalRURL = thirdParty.url;
        if (_SignalRURL) {
        connectionCount++;
        connection = new signalR.HubConnectionBuilder()
        .withUrl(_SignalRURL)
        .build();
        await connection.start();
        console.log('SignalR Connected');
        global.isAdminStoppedSignalR = false;

        await checkAndUpdateMarketRate();

        //? Here We Update To Globale Data For SignalR Values
        connection.on('Rate', async (message, request) => {
          try {
            if(message.mi){
              // Find if the market ID already exists in the rateQueue
              const existingIndex = global.rateQueue.findIndex((item) => item.mi === message.mi);
              if (existingIndex !== -1) {
                // Update the existing entry
                global.rateQueue[existingIndex] = message;
              } else {
                // Add a new entry
                global.rateQueue.push(message);
              }
              // Remove entries where item.ms !== 1
              global.rateQueue = global.rateQueue.filter((item) => item.ms === 1);
              await createUpdateGlobalSignalRData(message, request);
              thirdParty.isConnect = true
              await updateConnectionStatus(thirdParty, fastify);
            }
          } catch (error) {
            errorLogger(
              _fastify,
              error,
              "Error SignalrR --> signalrHandler/startSignalR/ConnectionEvent_Rate",
              null
            );
          }
        });
        //? Function For Intervals
        updateMarketRateIntervalId = setInterval(checkAndUpdateMarketRate, _SignalRInterwal || 10000);
        IntervalId = setInterval(await processRateQueue, _RateUpdate); // Process the queue every 5 Seconds
        if (!checkConfigIntervalId) {
          checkConfigIntervalId = setInterval(reConnectSignalR, 300000);// 5 minutes 300000
            }
          }
        }
      }
    }
  } catch (err) {
    errorLogger(
      _fastify,
      err.message,
      "Error SignalrR --> signalrHandler/startSignalR",
      null
    );
    await reConnectSignalR();
  }
}
//Method For Stopped Connection
async function stopSignalR(fastify) {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR Disconnected');
      if (updateMarketRateIntervalId) {
        clearInterval(updateMarketRateIntervalId);
        updateMarketRateIntervalId = null;
      }
      if (IntervalId) {
        clearInterval(IntervalId);
        IntervalId = null;
      }
      global.isAdminStoppedSignalR = true;
      global.rateSourceRefIDSet = new Set();

      const _SignalRURLs = global.tblThirdPartyApis.filter((item) => item.isActive === true && item.type === thirdPartyApiType.Socket && item.isConnect === true);
      if(_SignalRURLs.length > 0){
        for (const thirdParty of _SignalRURLs) {
          thirdParty.isConnect = false
          await updateConnectionStatus(thirdParty, fastify)
        }
      }
    } catch (err) {
      errorLogger(
        _fastify,
        err,
        "Error SignalrR --> signalrHandler/stopSignalR",
        null
      );
    }
  }
}
//Get IF SignalR is connection is Connected
function isSignalRStarted(fastify)  {
  return connection && connection.state === signalR.HubConnectionState.Connected;
} 

//reconnections SignalR is connection is NotConnected
const reConnectSignalR = async () => {
  const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
  const SrCount = global.tblConfigs.find((item) => item.key === configConstants.SIGNALRRECONNECTCOUNT).value;
  if (isSON === 'true') {
    if(connectionCount == SrCount){
        clearInterval(checkConfigIntervalId);
        checkConfigIntervalId = null;
        return;
    }
    const _SignalRURLs = global.tblThirdPartyApis.filter((item) => item.isActive === true && item.type === thirdPartyApiType.Socket && item.isDefault === true);
    if (_SignalRURLs.length > 0) {
      for (const thirdParty of _SignalRURLs) {
        if (!global.isAdminStoppedSignalR && (!connection || connection.state !== signalR.HubConnectionState.Connected)) {
          global.rateSourceRefIDSet = new Set();
          const connectionExists = connection && connection.state === signalR.HubConnectionState.Connected;
          if (!connectionExists) {
            await startSignalR(_fastify);
          }
      }
    }
  }
  } else {
    await stopSignalR();
  }
}

//for a Reate Update Queue to Update DB and Globale
const processRateQueue = async () => {
  while (global.rateQueue.length > 0) {
    const message = global.rateQueue.shift();
    if (!message.rt) {
      continue; // Skip messages without rate data
    }

    const data = message;
    const EventsMarketobj = global.tblEventMarkets.find(
      (item) => item.rateSourceRefID === data.mi
    );
    if (EventsMarketobj) {
      // Group by selection ID where isBack is false
      const layRatesGroupedBySelectionId = data.rt
        .filter((item) => item.ib === false)
        .reduce((acc, item) => {
          if (!acc[item.si]) {
            acc[item.si] = [];
          }
          acc[item.si].push(item.re);
          return acc;
        }, {});

      // Calculate minimum lay value and win percentage
      const winPerList = Object.keys(layRatesGroupedBySelectionId).map((si) => {
        const minLayValue = Math.min(...layRatesGroupedBySelectionId[si]);
        const winPer = Math.round((1 / minLayValue) * 100);
        return {
          selectionid: parseInt(si, 10),
          rate: minLayValue,
          winper: winPer
        };
      });
      //console.log('\n================================')
      // Process the winPerList and update the market
      for (const winPer of winPerList) {
        try {
          //console.log(`Selection ID: ${winPer.selectionid}, Min Lay Value: ${winPer.rate}, Win Percentage: ${winPer.winper}`);
          const _selectionidData = global.tblEventMarkets.find(
            (e) => e.selectionId == winPer.selectionid
          );

          if (_selectionidData) {
            //console.log(`Runner Name : ${_selectionidData.runner} , Win Percentage: ${winPer.winper}`);
            let teams;
            let commentary = global.tblCommentaries.find(
              (item) => item.commentaryId == _selectionidData.commentaryId
            );

          let _isThreadDone = await UpdateEventMarketByCIdFromSocketQuery({eventMarketId: EventsMarketobj.eventMarketId}, _fastify);
          if(_isThreadDone){
            const dataOfmarkets = await getEventMarketByIdsQuery(
             {
               eventMarketIds: [EventsMarketobj.eventMarketId],
             },
             null,
             _fastify
             );
             for (let item of dataOfmarkets) {
              let index = global.tblEventMarkets.findIndex(
                (e) => e.selectionId == item.selectionId
              );
              if (index === -1) {
                global.tblEventMarkets.push(item);               
                marketDataLogger(
                  {
                    eventMarketId: item.eventMarketId,
                    commentaryId: item.commentaryId,
                    dataTosave: JSON.parse(item.data),
                    updateType: MarketUpdateType.marketInitilization,
                  },
                  null,
                  _fastify
                );
              } else {
                let previousLine = global.tblEventMarkets[index].line;
                global.tblEventMarkets[index] = item;               
                marketDataLogger(
                  {
                    eventMarketId: item.eventMarketId,
                    commentaryId: item.commentaryId,
                    dataTosave: JSON.parse(item.data),
                    updateType: MarketUpdateType.marketInitilization,
                    lineDiff: item.line - (previousLine || 0),
                  },
                  null,
                  _fastify
                );
              }
            }            
          }

            if (commentary) {
              teams = global.tblCommentaryTeams.find(
                (item) =>
                  item.commentaryId === commentary.commentaryId &&
                  item.currentInnings === commentary.currentInnings &&
                  item.teamId == _selectionidData.teamId
              );

              if (!teams) {
                teams = global.tblCommentaryTeams.find(
                  (item) =>
                    item.commentaryId === commentary.commentaryId &&
                    item.currentInnings === commentary.currentInnings &&
                    item.teamName.toLowerCase() == _selectionidData.runner.toLowerCase()
                );
              }

              if (teams && commentary.isTeamPredictionOn) {
                const _update = {
                  commentaryTeamId: teams.commentaryTeamId,
                  teamPredictionPercentage: winPer.winper,
                  currentInnings: commentary.currentInnings,
                  commentaryId: _selectionidData.commentaryId
                };

                const index = global.tblCommentaryTeams.findIndex(
                  (item) =>
                    item.commentaryId === commentary.commentaryId &&
                    item.commentaryTeamId === teams.commentaryTeamId
                );
                global.tblCommentaryTeams[index].teamPredictionPercentage  = parseInt(_update.teamPredictionPercentage);

                await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);
              }
            }
          }
        } catch (error) {
          errorLogger(_fastify, error, "Error in processRateQueue while updating market", null);
        }
      }
    }
  }
};

//check Update method for New MarketIDs To envoe that New IDs
const checkAndUpdateMarketRate = async (_fastify) => {
  try {
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
      if(connection || connection.state === signalR.HubConnectionState.Connected){
        await connection.invoke('ConnectMarketRate', newRateSourceRefIDs);
      }
    }
  } catch (error) {
    errorLogger(
      _fastify,
      error,
      "Error SignalrR --> signalrHandler/checkAndUpdateMarketRate",
      null
    );
  }
};
 
const createUpdateGlobalSignalRData = async (message, request) => {
  try {
      const data = message;
      let commentary;
      const EventsMarketobj = global.tblEventMarkets.filter(
          (item) => item.rateSourceRefID === data.mi
      );
      if(EventsMarketobj.length > 0 && data.ms !== EventMarketStatus.Open)
      {
        global.tblEventMarkets = global.tblEventMarkets.map(item => {
          if (item.rateSourceRefID === data.mi) {
              // Update the status of the matched item
              return {
                  ...item,
                  status: EventMarketStatus.Suspend
              };
          }
          return item; // Return the item unchanged if it doesn't match
        });
        let _data = {};
        _data.rateSourceRefID = parseInt(data.mi);
        _data.status = parseInt(data.ms);
        await updateMarketStatusFromSignalRQuery(_data, request, _fastify);
        for (var i = 0; i < EventsMarketobj.length; i++) {
          let _runner = {};
          _runner = EventsMarketobj[i];
          if(_runner.commentaryId != '0'){
            let commentary = global.tblCommentaries.find(
                (item) => item.commentaryId == _runner.commentaryId
            );
            if (commentary) {
              let teams;
              teams = global.tblCommentaryTeams.find(
                (item) =>
                  item.commentaryId === commentary.commentaryId &&
                  item.currentInnings === commentary.currentInnings &&
                  item.teamName == _runner.teamId
              );

              if (!teams) {
                teams = global.tblCommentaryTeams.find(
                  (item) =>
                    item.commentaryId === commentary.commentaryId &&
                    item.currentInnings === commentary.currentInnings &&
                    item.teamName.toLowerCase() == _runner.runner.toLowerCase().trim()
                );
              }
              if (teams && commentary.isTeamPredictionOn) {
                const _update = {
                  commentaryTeamId: teams.commentaryTeamId,
                  teamPredictionPercentage: "0",
                  currentInnings: commentary.currentInnings,
                  commentaryId: _runner.commentaryId
                };

                const index = global.tblCommentaryTeams.findIndex(
                  (item) =>
                    item.commentaryId === commentary.commentaryId &&
                    item.commentaryTeamId === teams.commentaryTeamId
                );
                global.tblCommentaryTeams[index].teamPredictionPercentage  = parseInt(_update.teamPredictionPercentage);

                await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);
              }
            }
          }
        }
      }
      else if (EventsMarketobj && data.rt !== null && data.ms == EventMarketStatus.Open) {
          let _data = {};
          _data.rateSourceRefID = parseInt(data.mi);
          _data.status = parseInt(data.ms);
          await updateMarketStatusFromSignalRQuery(_data, request, _fastify);

          const groupedRates = {};

          data.rt.forEach(rate => {
              const selectionId = rate.si;

              if (!groupedRates[selectionId]) {
                  groupedRates[selectionId] = {
                      back: [],
                      lay: []
                  };
              }

              // If pr is 0, process it and skip further pr === 1 checks
              if (rate.pr === 0) {
                  if (rate.ib) {
                      groupedRates[selectionId].back.push(rate);
                  } else {
                      groupedRates[selectionId].lay.push(rate);
                  }
                  groupedRates[selectionId].hasPr0 = true;
              }
          });

          data.rt.forEach(rate => {
              const selectionId = rate.si;
              if (rate.pr === 1 && !groupedRates[selectionId].hasPr0) {
                  if (rate.ib) {
                      groupedRates[selectionId].back.push(rate);
                  } else {
                      groupedRates[selectionId].lay.push(rate);
                  }
              }
          });

          Object.keys(groupedRates).forEach(selectionId => {
              delete groupedRates[selectionId].hasPr0;
          });

          const _blrbsids = []; //Back and Lay Rates by SelectionIds  blrbsids
          const currentTime = new Date().toISOString();
          Object.keys(groupedRates).forEach(selectionId => {
              const rates = groupedRates[selectionId];
              const backRates = rates.back.length ? rates.back : [{
                  rv: null,
                  re: null
              }];
              const layRates = rates.lay.length ? rates.lay : [{
                  rv: null,
                  re: null
              }];

              backRates.forEach(backRate => {
                  layRates.forEach(layRate => {
                      _blrbsids.push({
                          backSize: backRate.rv,
                          backPrice : backRate.re,
                          laySize: layRate.rv,
                          layPrice: layRate.re,
                          selectionId: parseInt(selectionId, 10),
                          timestamp: currentTime // Add timestamp here
                      });
                  });
              });
          });
          if (_blrbsids && _blrbsids.length) {
              for (const items of _blrbsids) {
                  let _time = items.timestamp;
                  const _selectionidData = global.tblEventMarkets.find(
                      (e) => e.selectionId == items.selectionId
                  );
                  // console.log(items);

                  const sendDataForSocketUpdate = {};
                  sendDataForSocketUpdate.commentaryId = _selectionidData.commentaryId;
                  sendDataForSocketUpdate.eventRefId = _selectionidData.eventRefId;
                  sendDataForSocketUpdate.dataToUpdate = [];

                  let marketRunner = global.tblEventMarkets.filter(
                      (item) => item.eventRefId == _selectionidData.eventRefId && item.rateSource === 2
                  );
                  marketRunner = marketRunner.map((item) => {
                      let teamNameData
                      if (item.teamId) {
                          teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
                      }
                      if (!item.teamId) {
                          teamNameData = global.tblCommentaryTeams.find((t) =>
                              t.teamName.toLowerCase() == item.runner.toLowerCase())
                      }
                      return {
                          runnerId: item.runnerId,
                          runner: item.runner,
                          selectionId: item.selectionId,
                          backSize: item.backSize,
                          laySize: item.laySize,
                          teamId: item.teamId,
                          teamName: teamNameData?.teamName || null
                      };
                  });

                  sendDataForSocketUpdate.dataToUpdate.push({
                      module: "marketRunner",
                      type: "update",
                      data: marketRunner,
                  });

                  if (
                      global?.clientSocketIo !== undefined &&
                      global?.clientSocketIo.length > 0
                  ) {
                      await commentaryDetailsByEventIdService({
                              ...request,
                              body: {
                                  eventId: _selectionidData.eventRefId,
                              },
                          },
                          _fastify,
                          "runnersFromSocket"
                      ).catch((err) => {
                          errorLogger(
                              _fastify,
                              err.message,
                              "ERROR --> signalrHandler/MockSignalR.js/createUpdateGlobalSignalRData",
                              request
                          );
                      });

                      global.clientSocketIo.forEach((socket) => {
                          socket.client.emit("updateFullscore", sendDataForSocketUpdate);
                      });
                  }


                  await updateEventMarketRunnerMaunalQuery(items, _fastify);

                  let _updateData = {};
                  if (_selectionidData && _selectionidData.commentaryId != 0) {
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
                  }
                  if (_selectionidData.teamId) {
                      _updateData.teamId = _selectionidData.teamId;
                  } else {
                      commentary = await global.tblCommentaries.find(
                          (item) => item.commentaryId === _selectionidData.commentaryId
                      );
                      if (commentary && commentary.isTeamPredictionOn) {
                          let teams;
                          teams = global.tblCommentaryTeams.find(
                              (item) =>
                              item.commentaryId === commentary.commentaryId &&
                              item.currentInnings === commentary.currentInnings &&
                              item.teamName === _selectionidData.runner
                          );

                          if (teams) {
                              _updateData.teamId = teams.teamId;
                          }
                      }
                     // await updateLatestMarketOddsBallByBall(_updateData, _fastify);
                  }

                  const {
                      EventMarketId,
                      selectionId
                  } = _updateData;
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
                          EventMarketId: _updateData.EventMarketId,
                          RunnerId: _updateData.RunnerId,
                          MarketStatus: _updateData.MarketStatus,
                          BackPrice: _updateData.BackPrice,
                          LayPrice: _updateData.LayPrice,
                          BackSize: _updateData.BackSize,
                          LaySize: _updateData.LaySize,
                          MarketName: _updateData.MarketName,
                          selectionId: _updateData.selectionId,
                          timestamp: _time
                      };
                  }
              }
          }
      }
  } catch (error) {
      errorLogger(
          _fastify,
          error,
          "Error SignalrR --> signalrHandler/CreateUpdateSignalRData",
          null
      );
  }
}

const updateConnectionStatus = async(data, fastify) => {
  try {
    const index = global.tblThirdPartyApis.findIndex(
      (item) => item.id === data.id
    );
  
    if (index !== -1) {
      global.tblThirdPartyApis[index].isConnect = data.isConnect;
    }
    const updateData = {
      providerName: data.providerName,
      url:  data.url,
      type: data.type,
      isActive: data.isActive,
      isDefault: data.isDefault,
      isConnect: data.isConnect,
      id: data.id,
    };
    await updateThirdPartyApisQuery(updateData, fastify);
  } catch (error) {
    errorLogger(
      _fastify,
      error,
      "Error SignalrR --> signalrHandler/updateConnectionStatus",
      null
    );
  }
}

module.exports = {
  startSignalR,
  stopSignalR,
  isSignalRStarted
};
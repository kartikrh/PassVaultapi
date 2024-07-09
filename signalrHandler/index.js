const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource,MarketUpdateType} = require('../utilities/index');
const { marketLogger, marketDataLogger } = require("../utilities/logger");
const {updateEventMarketRunnerMaunalQuery,getEventMarketByIdsQuery,UpdateEventMarketByCIdFromSocketQuery} = require('../repository/TableEventMarkets');
const {updateCommentaryTeamPredictionPrecentageQuery} = require('../repository/TableCommentary');
const {updateLatestMarketOddsBallByBall} = require('../repository/TableMarketOddsBallByBall');

const configConstants = require('../utilities/configConstants');
let connection;
global.rateSourceRefIDSet = new Set();
let intervalId;
let _fastify;
let checkConfigIntervalId = null;

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
              if(_message.rt){
                //console.log(_message);
                const data = _message;
              
                const EventsMarketobj = global.tblEventMarkets.find(
                  (item) => item.rateSourceRefID === data.mi
                );
                if(EventsMarketobj)
                { 
                  const groupedRates = {};
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
                
                  // Create the desired output structure
                  const _blrbsids = [];
                  Object.keys(groupedRates).forEach(selectionId => {
                      const rates = groupedRates[selectionId];
                      const backRates = rates.back;
                      const layRates = rates.lay;
                  
                      backRates.forEach(backRate => {
                          layRates.forEach(layRate => {
                            _blrbsids.push({
                                  backPrice: backRate.rv,
                                  backSize: backRate.re,
                                  layPrice: layRate.rv,
                                  laySize: layRate.re,
                                  selectionId: parseInt(selectionId, 10)
                              });
                          });
                      });
                  });
                
                  //console.log(_blrbsids);
                  if(_blrbsids && _blrbsids.length)
                  {
                     let marketId;
                     for (const items of _blrbsids) {
                      const _selectionidData = global.tblEventMarkets.find(
                        (e) => e.selectionId == items.selectionId
                      );
                      if (_selectionidData && _selectionidData.runner !== 'The Draw') {
                        try {
                          let _data2 = await updateEventMarketRunnerMaunalQuery(items, _fastify);
                          if(_selectionidData.commentaryId != 0){
                            try {
                              let _updateData= {};
                              _updateData.EventMarketId = _selectionidData.eventMarketId;
                              _updateData.RunnerId = _selectionidData.runnerId;
                              _updateData.MarketStatus = _selectionidData.status;
                              _updateData.BackPrice = _selectionidData.backPrice;
                              _updateData.LayPrice = _selectionidData.layPrice;
                              _updateData.BackSize = _selectionidData.backSize;
                              _updateData.LaySize = _selectionidData.laySize;
                              _updateData.MarketName = _selectionidData.marketName;
                              _updateData.RunnerName = _selectionidData.runner;
                              _updateData.commentaryId = _selectionidData.commentaryId;
                              _updateData.selectionId = _selectionidData.selectionId;
                            
                              let commentary = await global.tblCommentaries.find(
                                (item) => item.commentaryId === _selectionidData.commentaryId
                              );
                              let teams = global.tblCommentaryTeams.find(
                                (item) =>
                                  item.commentaryId === commentary.commentaryId &&
                                  item.currentInnings === commentary.currentInnings && 
                                  item.teamName === _data2.runner
                              );
                              _updateData.teamId = teams.teamId;
                            
                              await updateLatestMarketOddsBallByBall(_updateData,_fastify,_selectionidData.commentaryId);
                            } catch (error) {}
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
                              
                                let commentary = await global.tblCommentaries.find(
                                  (item) => item.commentaryId === _selectionidData.commentaryId
                                );
                                let teams = global.tblCommentaryTeams.find(
                                  (item) =>
                                    item.commentaryId === commentary.commentaryId &&
                                    item.currentInnings === commentary.currentInnings && 
                                    item.teamName === _data2.runner
                                );
                              
                                let _update = {};
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
                    let _isThreadDone = await  UpdateEventMarketByCIdFromSocketQuery({eventMarketId:EventsMarketobj.eventMarketId},_fastify);
                    if(_isThreadDone){
                      const dataOfmarkets = await  getEventMarketByIdsQuery(
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
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          });
        } catch (err) {
          console.error('Error connecting to SignalR:', err);
          setTimeout(startSignalR, 5000); 
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
            if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
              await startSignalR(_fastify);
            }
          } else {
            await stopSignalR();
          }
        }, 300000); // 5 minutes
      } catch (error) {
        
      }
    }
  } catch (error) { }
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
      global.rateSourceRefIDSet = new Set();
      global.selectionData = {};
    } catch (err) {
      console.error('Error disconnecting from SignalR:', err);
    }
  }
}

function isSignalRStarted(fastify) {
  return connection && connection.state === signalR.HubConnectionState.Connected;
}

module.exports = {
  startSignalR,
  stopSignalR,
  isSignalRStarted
};

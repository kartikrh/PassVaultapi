const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource,MarketUpdateType} = require('../utilities/index');
const {marketDataLogger} = require("../utilities/logger");
const {updateEventMarketRunnerMaunalQuery,getEventMarketByIdsQuery,
    UpdateEventMarketByCIdFromSocketQuery,updateMarketStatusFromSignalRQuery, getAllEventMarketsV2Query} = require('../repository/TableEventMarkets');
const {updateCommentaryTeamPredictionPrecentageQuery} = require('../repository/TableCommentary');
const {errorLogger} = require("../utilities/logger");
const {updateThirdPartyApisQuery} = require('../repository/TableThirdPartyApis');
const {thirdPartyApiType} = require('../utilities/index');
const configConstants = require('../utilities/configConstants');

/**
 * This function establishes a SignalR connection to the event service, allowing us to receive live rates.
 * 
 * The startSignalR function is initiated to check for available markets. If markets are found, data is retrieved
 * from the event service and added to global.rateQueue. The data is then used to update the global.SignalRData data and 
 * initiate a runner that updates the database.
 * 
 * Next, the processRateQueue function is invoked to calculate prediction percentages, update team information,
 * and updates market ,log market data to the database.
 * 
 * Finally, Socket.IO emits the updated rates from the local data to the client side.
 */

let connection, _fastify, updateMarketRateIntervalId, checkConfigIntervalId, IntervalRunner, IntervalId,_SignalRInterwal,_RateUpdate,_SignalRURLs;
let connectionCount = 0;
// Initialize a global queue
global.rateSourceRefIDSet = new Set();
global.isAdminStoppedSignalR = false;
global.rateQueue = [];
global.SignalRData = [];
global.signalRConnections = [];

//Method for Start Signa
async function startSignalR(fastify) {
    try {
        const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
        if (isSON && isSON == 'true') {
            if (fastify) {
                _fastify = fastify;
            }
            _SignalRURLs = global.tblThirdPartyApis.filter((item) => item.isActive === true && item.type === thirdPartyApiType.Socket && item.isDefault === true && item.adminDisconnected === false);
            _SignalRInterwal = global.tblConfigs.find((item) => item.key === configConstants.INTERVAL_MarketTHIRDPARTY)?.value || 10000;
            try {
                _RateUpdate = global.tblConfigs.find((item) => item.key === configConstants.RATEUPDATEINTERWAL)?.value || 500;
            } catch (error) {
                _RateUpdate = 500;
            }

            if (_SignalRURLs && _SignalRURLs.length > 0) {
                for (const thirdParty of _SignalRURLs) {
                    if (global.signalRConnections.some((conn) => conn.id === thirdParty.id)) {
                        continue; // Skip if already connected
                    }
                    const _SignalRURL = thirdParty.url;
                    if (_SignalRURL) {
                        connectionCount++;
                        const newConnection = new signalR.HubConnectionBuilder()
                            .withUrl(_SignalRURL)
                            .withAutomaticReconnect([0, 2000, 10000, 30000])
                            .build();
                        await newConnection.start();
                        global.isSignalRStopped = false;
                        global.isAdminStoppedSignalR = false;
                        thirdParty.isConnect = true
                        thirdParty.adminDisconnected = false;
                        console.log('SignalR Connected');

                        //? Attach handlers for 'close' and 'error' events
                        newConnection.onclose(async (error) => {
                            const updatedThirdParty = _SignalRURLs.find(item => item.id === thirdParty.id);
                            if (updatedThirdParty && updatedThirdParty?.adminDisconnected === false) {
                            global.isSignalRStopped = true;
                            errorLogger(
                                _fastify,
                                error?.message || "signalR onClose newConnection",
                                "MockSignalR onClose --> signalrHandler/startSignalR",
                                null
                            );
                            await reConnectScoreHub();
                          }
                        });

                        newConnection.on("error", async (error) => {
                          global.isSignalRStopped = true;
                          errorLogger(
                            _fastify,
                            error?.message || "SignalR connection error",
                            "MockSignalR error --> signalrHandler/startSignalR",
                            null
                        );
                          await reConnectScoreHub();
                        });

                        //? Here We Update To Globale Data For SignalR Values
                        newConnection.on('Rate', async (message, request) => {
                            try {
                                if (message.mi) {
                                    await createUpdateGlobalSignalRData(message, request);
                                    // Find if the market ID already exists in the rateQueue
                                    const existingIndex = global.rateQueue.findIndex((item) => item.mi === message.mi);
                                    if (existingIndex !== -1) {
                                        global.rateQueue[existingIndex] = message;
                                    } else {
                                        global.rateQueue.push(message);
                                    }
                                    global.rateQueue = global.rateQueue.filter((item) => item.ms === 1);
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

                        //? Function And Intervals
                        await updateConnectionStatus(thirdParty, _fastify);
                        await subScribeConnectMarketRate(_fastify);

                        updateMarketRateIntervalId = setInterval(() => {
                          subScribeConnectMarketRate(_fastify);
                        }, _SignalRInterwal || 10000); // 10 seconds interval

                        IntervalId = setInterval(async () => {
                          await processRateQueue();
                        }, _RateUpdate);

                        global.signalRConnections.push({ id: thirdParty.id, connection: newConnection });
                        errorLogger(
                            _fastify,
                            "SignalR connected succssfully",
                            "MockSignalR --> signalrHandler/startSignalR",
                            null
                        );
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
        global.isSignalRStopped = true;
        await reConnectScoreHub();
    }
}

// //?Method For Stopped Connection
// async function stopSignalR(fastify) {
//     if (connection) {
//         try {
//             await connection.stop();
//             console.log('SignalR Disconnected');
//             if (updateMarketRateIntervalId) {
//                 clearInterval(updateMarketRateIntervalId);
//                 updateMarketRateIntervalId = null;
//             }
//             if (IntervalId) {
//                 clearInterval(IntervalId);
//                 IntervalId = null;
//                 clearInterval(IntervalRunner);
//                 IntervalRunner = null;
//             }
//             global.isAdminStoppedSignalR = true;
//             global.rateSourceRefIDSet = new Set();
//             global.isSignalRStopped = true;
//             if (_SignalRURLs && _SignalRURLs.length > 0) {
//                 for (const thirdParty of _SignalRURLs) {
//                     thirdParty.isConnect = false
//                     await updateConnectionStatus(thirdParty, fastify)
//                 }
//             }
//         } catch (err) {
//             errorLogger(
//                 _fastify,
//                 err,
//                 "Error SignalrR --> signalrHandler/stopSignalR",
//                 null
//             );
//         }
//     }
// }

//?Method For Stopped Connection
async function stopSignalR(fastify) {
    try {
        // Set adminDisconnected to true for all URLs to prevent unnecessary reconnections
        // (If we update only 1 url value then reconnection will call for other urls)
        if (_SignalRURLs && _SignalRURLs.length > 0) {
            for (const thirdParty of _SignalRURLs) {
                thirdParty.isConnect = false;
                thirdParty.adminDisconnected = true;
                await updateConnectionStatus(thirdParty, fastify);
            }
        }

        for (const connectionData of global.signalRConnections) {
            const { connection, id } = connectionData;

            if (connection && connection.state === signalR.HubConnectionState.Connected) {
                await connection.stop();
            }
        }

        if (updateMarketRateIntervalId) {
            clearInterval(updateMarketRateIntervalId);
            updateMarketRateIntervalId = null;
        }
        if (IntervalId) {
            clearInterval(IntervalId);
            IntervalId = null;
            clearInterval(IntervalRunner);
            IntervalRunner = null;
        }
        global.isAdminStoppedSignalR = true;
        global.rateSourceRefIDSet = new Set();
        global.isSignalRStopped = true;
        global.signalRConnections = [];
        console.log('SignalR connections stopped successfully.');
        errorLogger(
            _fastify,
            "SignalR all urls stoped succssfully",
            "MockSignalR --> signalrHandler/stopSignalR",
            null
        );
    } catch (err) {
        errorLogger(
            fastify,
            err,
            "Error SignalR --> signalrHandler/stopSignalR",
            null
        );
    }
}

async function stopCustomSignalR(request, fastify) {
    const { id } = request.body;
    const connectionIndex = global.signalRConnections.findIndex((item) => item.id === id);

    if (connectionIndex !== -1) {
        const connectionData = global.signalRConnections[connectionIndex];
        try {
            if (connectionData?.connection) {
                let thirdPartyIndex = _SignalRURLs.findIndex((item) => item.id === id);
                if (thirdPartyIndex !== -1) {
                    let thirdPartyData = _SignalRURLs[thirdPartyIndex];
                    thirdPartyData.isConnect = false;
                    thirdPartyData.adminDisconnected = true;
                    _SignalRURLs[thirdPartyIndex] = thirdPartyData;
                    await updateConnectionStatus(thirdPartyData, fastify);
                }

                await connectionData.connection.stop();
                global.signalRConnections.splice(connectionIndex, 1);

                if (global.signalRConnections.length === 0) {
                    global.isAdminStoppedSignalR = true;
                    global.isSignalRStopped = true;
                }
                global.rateSourceRefIDSet = new Set();
                console.log(`SignalR Disconnected: ${id}`);
                errorLogger(
                    _fastify,
                    "SignalR stoped succssfully",
                    "MockSignalR --> signalrHandler/stopCustomSignalR",
                    null
                );
            }
        } catch (err) {
            errorLogger(
                fastify,
                err,
                "Error SignalrR --> stopCustomSignalR",
                request
            );
        }
    }
}


function isCustomSignalRStarted(request, fastify) {
    try {
        const { id } = request.body;
        return global.signalRConnections.some((item) => item.id === id && item.connection?.state === signalR.HubConnectionState.Connected);
    } catch (err) {
        errorLogger(
            fastify,
            err,
            "Error SignalrR --> isCustomSignalRStarted",
            request
        );
    }
}

// //?Get IF SignalR is connection is Connected
// function isSignalRStarted(fastify) {
//     try {
//         return connection && connection.state === signalR.HubConnectionState.Connected;
//     } catch (err) {
//         errorLogger(
//             _fastify,
//             err,
//             "Error SignalrR --> signalrHandler/isSignalRStarted",
//             null
//         );
//     }
// }

function isSignalRStarted(fastify) {
    try {
        return global.signalRConnections.some(
            (connectionData) => connectionData.connection && connectionData.connection.state === signalR.HubConnectionState.Connected
        );
    } catch (err) {
        errorLogger(
            fastify,
            err,
            "Error SignalR --> signalrHandler/isSignalRStarted",
            null
        );
        return false;
    }
}

// //reconnections SignalR is connection is NotConnected
// const reConnectScoreHub = async () => {
//     console.log("Reconnecting...")
//     try {
//         const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON)?.value;
//         const sRCount = global.tblConfigs.find((item) => item.key === configConstants.SIGNALRRECONNECTCOUNT)?.value;
//         const signalRURLs = global.tblThirdPartyApis.filter((item) => item.isActive === true && item.type === thirdPartyApiType.Socket && item.isDefault === true && item.adminDisconnected === false);
//         if (isSON !== 'true' || global.isAdminStoppedSignalR === true) {
//             await stopSignalR(_fastify);
//             return;
//         }
//         if (isSON === 'true' && global.isAdminStoppedSignalR === false) {
//             let retryCount = 0;
//             const maxRetries = parseInt(sRCount, 10);

//             while (retryCount < maxRetries) {
//                 global.rateSourceRefIDSet = new Set();
//                 if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
//                     try {
//                         await connection.start();
//                         await subScribeConnectMarketRate(_fastify);
//                         global.isSignalRStopped = false;
    
//                         if (signalRURLs && signalRURLs.length > 0) {
//                             for (const thirdParty of signalRURLs) {
//                                 thirdParty.isConnect = true;
//                                 thirdParty.adminDisconnected = false
//                                 await updateConnectionStatus(thirdParty, _fastify);
//                             }
//                         }
//                         console.log("SignalR Re-Connected.");
//                         return;
//                     } catch (err) {
//                         retryCount++;
//                         await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (2 ** retryCount), 30000)));
//                     }
//                 } else {
//                     return;
//                 }
//             }
//         }
//     } catch (err) {
//         errorLogger(
//             _fastify,
//             err,
//             "Error SignalrR --> signalrHandler/reConnectScoreHub",
//             null
//         );
//     }
// };

//reconnections SignalR is connection is NotConnected
const reConnectScoreHub = async () => {
    try {
      const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON)?.value;
      const sRCount = global.tblConfigs.find((item) => item.key === configConstants.SIGNALRRECONNECTCOUNT)?.value;
      const signalRURLs = global.tblThirdPartyApis.filter(
        (item) =>
          item.isActive === true &&
          item.type === thirdPartyApiType.Socket &&
          item.isDefault === true &&
          item.adminDisconnected === false
      );
  
      if (isSON !== "true" || global.isAdminStoppedSignalR === true) {
        await stopSignalR(_fastify);
        return;
      }
  
      if (isSON === "true" && global.isAdminStoppedSignalR === false) {
        let retryCount = 0;
        const maxRetries = parseInt(sRCount, 10);
  
        while (retryCount < maxRetries) {
          let allConnected = true;
  
          for (const connectionData of global.signalRConnections) {
            const { connection, id } = connectionData;
  
            if (connection || connection.state !== signalR.HubConnectionState.Connected) {
              try {
                await connection.start();
                global.rateSourceRefIDSet = new Set();
                await subScribeConnectMarketRate(_fastify);
                global.isSignalRStopped = false;
  
                let thirdParty = signalRURLs.find((item) => item.id === id);
                if (thirdParty) {
                  thirdParty.isConnect = true;
                  thirdParty.adminDisconnected = false;
                  await updateConnectionStatus(thirdParty, _fastify);
                }
  
                console.log("SignalR Re-Connected");
              } catch (err) {
                allConnected = false;
              }
            }
          }
  
          if (allConnected) {
            console.log("SignalR Re-Connected");
            return;
          }
  
            errorLogger(
              _fastify,
              "SignalR Re-connected succssfully",
              "MockSignalR --> signalrHandler/reConnectScoreHub",
              null
            );
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** retryCount, 30000)));
        }
      }
    } catch (err) {
      errorLogger(
        _fastify,
        err,
        "Error SignalR --> signalrHandler/reConnectScoreHub",
        null
      );
    }
  };

// //reconnections SignalR is connection is NotConnected
// const reConnectScoreHub = async () => {
//     console.log("re-connect");
//     try {
//         const isSON = global.tblConfigs.find((item) => item.key === configConstants.ISMARKETOODS_SIGNALRON).value;
//         const sRCount = global.tblConfigs.find((item) => item.key === configConstants.SIGNALRRECONNECTCOUNT).value;
//         if (isSON === 'true') {
//             if (connectionCount == sRCount) {
//                 await stopSignalR();
//                 return;
//             }
//             if (!global.isAdminStoppedSignalR) {
//                 global.rateSourceRefIDSet = new Set();
//                 if (connection && connection.state !== signalR.HubConnectionState.Connected) {
//                   await connection.start();
//                   await subScribeConnectMarketRate(_fastify);
//                   global.isSignalRStopped = false;
//                   console.log("SignalR Re-Connected.");
//                 }
//             }
//         } else {
//             await stopSignalR();
//         }
//     } catch (err) {
//         errorLogger(
//             _fastify,
//             err,
//             "Error SignalrR --> signalrHandler/reConnectScoreHub",
//             null
//         );
//     }
// }

//for a Reate Update Queue to Update DB and Globale
const processRateQueue = async () => {
    while (global.rateQueue.length > 0) {
        const message = global.rateQueue.shift();
        if (!message.rt) {
            continue; // Skip messages without rate data
        }

        const data = message;
        // const EventsMarketobj = global.tblEventMarkets.find(
        //     (item) => item.rateSourceRefID === data.mi
        // );
        const EventsMarketobj = global.tblEventMarketsV2.find(
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
            // console.log('\n================================')
            // Process the winPerList and update the market
            for (const winPer of winPerList) {
                try {
                    //console.log(`Selection ID: ${winPer.selectionid}, Min Lay Value: ${winPer.rate}, Win Percentage: ${winPer.winper}`);
                    
                    //  _selectionidData = global.tblEventMarkets.find(
                    //     (e) => e.selectionId == winPer.selectionid
                    // );
                    const _selectionidData = global.tblMarketRunnerV2.find(
                        (e) => e.selectionId == winPer.selectionid
                    );

                    if (_selectionidData) {
                        // console.log(`Runner Name : ${_selectionidData.runner} , Win Percentage: ${winPer.winper}`);
                        let _eventMarketData = global.tblEventMarkets.find(
                            (elem) => elem.eventMarketId == _selectionidData.eventMarketId
                        );
                        let teams;
                        let commentary = global.tblCommentaries.find(
                            (item) => item.commentaryId == _eventMarketData?.commentaryId
                        );

                        let _isThreadDone = await UpdateEventMarketByCIdFromSocketQuery({
                            eventMarketId: EventsMarketobj.eventMarketId
                        }, _fastify);
                        if (_isThreadDone) {
                            let index = global.tblEventMarketsV2.findIndex(
                              (item) => item.eventMarketId === _isThreadDone.eventMarketId
                            );
                            if (index !== -1) {
                              global.tblEventMarketsV2[index] = {
                                ...global.tblEventMarketsV2[index],
                                ..._isThreadDone,
                              };
                            }
                            const dataOfmarkets = await getEventMarketByIdsQuery({
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
                                    marketDataLogger({
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
                                    marketDataLogger({
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
                            let whereCondition = ` tem."wrID" = ${EventsMarketobj.eventMarketId}`
                            let eventMarkets = await getAllEventMarketsV2Query(_fastify, whereCondition);
                            eventMarkets = eventMarkets[0];
                            let eventIndex = global.tblEventMarketsV2.findIndex(
                                (e) => e.eventMarketId == eventMarkets.eventMarketId
                            );
                            if (eventIndex === -1) {
                                global.tblEventMarketsV2.push(eventMarkets);
                                marketDataLogger({
                                        eventMarketId: eventMarkets.eventMarketId,
                                        commentaryId: eventMarkets.commentaryId,
                                        dataTosave: JSON.parse(eventMarkets.data),
                                        updateType: MarketUpdateType.marketInitilization,
                                    },
                                    null,
                                    _fastify
                                );
                            } else {
                                let previousLine = global.tblEventMarketsV2[eventIndex].line;
                                global.tblEventMarketsV2[eventIndex] = eventMarkets;
                                marketDataLogger({
                                        eventMarketId: eventMarkets.eventMarketId,
                                        commentaryId: eventMarkets.commentaryId,
                                        dataTosave: JSON.parse(eventMarkets.data),
                                        updateType: MarketUpdateType.marketInitilization,
                                        lineDiff: eventMarkets.line - (previousLine || 0),
                                    },
                                    null,
                                    _fastify
                                );
                            }
                        }

                        if (commentary) {
                            teams = global.tblCommentaryTeams.find(
                                (item) =>
                                item.commentaryId === commentary.commentaryId &&
                                item.currentInnings === commentary.currentInnings &&
                                item.teamId == _selectionidData?.teamId
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
                                    commentaryId: _eventMarketData?.commentaryId
                                };

                                const index = global.tblCommentaryTeams.findIndex(
                                    (item) =>
                                    item.commentaryId === commentary.commentaryId &&
                                    item.commentaryTeamId === teams.commentaryTeamId
                                );
                                await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);
                                global.tblCommentaryTeams[index].teamPredictionPercentage = parseInt(_update.teamPredictionPercentage);
                            }
                        }
                    }
                } catch (error) {
                    errorLogger(_fastify, error, "Error in processRateQueue while updating market", null);
                }
            }
        }
        await updateMarketRunnerDataOnSocket(data);
    }
};

// //check Update method for New MarketIDs To envoe that New IDs
// const subScribeConnectMarketRate = async (_fastify) => {
//     try {
//         let _MarketsIds = global.tblEventMarkets.filter(
//             (item) => item.rateSource === EventMarketRateSource.Manual && item.status != EventMarketStatus.NotOpen && item.status != EventMarketStatus.Close
//         );

//         let _newIDs = [];
//         _MarketsIds.forEach((item) => {
//             if (!global.rateSourceRefIDSet.has(item.rateSourceRefID)) {
//                 global.rateSourceRefIDSet.add(item.rateSourceRefID);
//                 _newIDs.push(item.rateSourceRefID);
//             }
//         });

//         if (_newIDs.length > 0) {
//             const newRateSourceRefIDs = _newIDs.join(',');
//             if (connection || connection.state === signalR.HubConnectionState.Connected) {
//                 await connection.invoke('ConnectMarketRate', newRateSourceRefIDs);
//             }
//         }
//     } catch (error) {
//         errorLogger(
//             _fastify,
//             error,
//             "Error SignalrR --> signalrHandler/SubScribeConnectMarketRate",
//             null
//         );
//     }
// };

//check Update method for New MarketIDs To envoe that New IDs
const subScribeConnectMarketRate = async (_fastify) => {
    try {
        for (const connData of global.signalRConnections) {
            // if (connData.connection && connData.connection.state !== signalR.HubConnectionState.Connected) {
            //     continue;
            // }

            // let _MarketsIds = global.tblEventMarkets.filter(
            //     (item) => item.rateSource === EventMarketRateSource.Manual && item.status !== EventMarketStatus.NotOpen && item.status !== EventMarketStatus.Close
            // );

            let _MarketsIds = global.tblEventMarketsV2.filter(
                (item) => item.rateSource === EventMarketRateSource.Manual && item.status !== EventMarketStatus.NotOpen && item.status !== EventMarketStatus.Close
            );

            let _newIDs = [];
            _MarketsIds.forEach((item) => {
                if (!global.rateSourceRefIDSet.has(item.rateSourceRefID)) {
                    global.rateSourceRefIDSet.add(item.rateSourceRefID);
                    _newIDs.push(item.rateSourceRefID);
                }
            });

            if (_newIDs.length > 0) {
                const newRateSourceRefIDs = _newIDs.join(',');
                if (connData.connection || connData.connection.state === signalR.HubConnectionState.Connected) {
                    await connData.connection.invoke('ConnectMarketRate', newRateSourceRefIDs);
                }
            }
        }
    } catch (error) {
        errorLogger(
            _fastify,
            error,
            "Error SignalrR --> signalrHandler/SubScribeConnectMarketRate",
            null
        );
    }
};

//create and Update Local Market Rate
const createUpdateGlobalSignalRData = async (message, request) => {
    try {
        const data = message;
        let commentary;
        // const EventsMarketobj = global.tblEventMarkets.filter(
        //     (item) => item.rateSourceRefID === data.mi
        // );
        const EventsMarketobj = global.tblEventMarketsV2.filter(
            (item) => item.rateSourceRefID === data.mi
        );
        let isCalled = false;
        if (EventsMarketobj.length > 0 && data.rt !== null && data.ms !== EventMarketStatus.Open) {
            isCalled = true;
            global.tblEventMarketsV2 = global.tblEventMarketsV2.map(item => {
                if (item.rateSourceRefID === data.mi) {
                    // Update the status of the matched item
                    return {
                        ...item,
                        status: parseInt(data.ms) || 0
                    };
                }
                return item; // Return the item unchanged if it doesn't match
            });
            let _data = {};
            _data.rateSourceRefID = parseInt(data.mi);
            _data.status = parseInt(data.ms);
            await updateMarketStatusFromSignalRQuery(_data, request, _fastify);
            let index = global.tblEventMarketsV2.findIndex(
                (item) => item.rateSourceRefID === _data.rateSourceRefID
              );
              if (index !== -1) {
                  global.tblEventMarketsV2[index].status = _data.status
                if(_data.status === EventMarketStatus.Cancel || 
                    _data.status === EventMarketStatus.Settled && global.tblEventMarketsV2[index].isResult === true){
                    global.tblEventMarketsV2.splice(index, 1);
                }
            }
            for (var i = 0; i < EventsMarketobj.length; i++) {
                let _runner = {};
                _runner = EventsMarketobj[i];
                if (_runner.commentaryId != '0') {
                    const runnerRate = global.tblMarketRunnerV2.filter((item) => 
                        item.eventMarketId === _runner?.eventMarketId
                    )
                    for(const marketRunner of runnerRate) {
                    let commentary = global.tblCommentaries.find(
                        (item) => item.commentaryId == _runner.commentaryId
                    );
                    if (commentary) {
                        let teams;
                        teams = global.tblCommentaryTeams.find(
                            (item) =>
                            item.commentaryId === commentary.commentaryId &&
                            item.currentInnings === commentary.currentInnings &&
                            item.teamName == marketRunner?.teamId
                        );

                        if (!teams) {
                            teams = global.tblCommentaryTeams.find(
                                (item) =>
                                item.commentaryId === commentary.commentaryId &&
                                item.currentInnings === commentary.currentInnings &&
                                item.teamName.toLowerCase() == marketRunner?.runner.toLowerCase().trim()
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
                            
                            await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);
                            global.tblCommentaryTeams[index].teamPredictionPercentage = parseInt(_update.teamPredictionPercentage);
                        }
                    }
                  }
                }
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
                                backPrice: backRate.re,
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
                        // const _selectionidData = global.tblEventMarkets.find(
                        //     (e) => e.selectionId == items.selectionId
                        // );

                        let eventRunnerData = {
                            backSize: items.backSize,
                            backPrice: items.backPrice,
                            laySize: items.laySize,
                            layPrice: items.layPrice,
                            selectionId: items.selectionId,
                            rateSourceRefID: data.mi,
                            timestamp: items.timestamp,
                        }

                        const ratesData = await updateEventMarketRunnerMaunalQuery(eventRunnerData, _fastify);
                        let index = global.tblMarketRunnerV2.findIndex(
                            (item) => item.selectionId === ratesData.selectionId
                          );
                          if (index !== -1) {
                            global.tblMarketRunnerV2[index] = {
                                ...global.tblMarketRunnerV2[index],
                                ...ratesData
                            }
                          }
                    }
                }
            }
        } else if (EventsMarketobj && data.rt !== null && data.ms == EventMarketStatus.Open) {
            isCalled = true;
            let _data = {};
            _data.rateSourceRefID = parseInt(data.mi);
            _data.status = parseInt(data.ms);
            await updateMarketStatusFromSignalRQuery(_data, request, _fastify);
            let index = global.tblEventMarketsV2.findIndex(
                (item) => item.rateSourceRefID === _data.rateSourceRefID
              );
              if (index !== -1) {
                  global.tblEventMarketsV2[index].status = _data.status
                if(_data.status === EventMarketStatus.Cancel || 
                    _data.status === EventMarketStatus.Settled && global.tblEventMarketsV2[index].isResult === true){
                    global.tblEventMarketsV2.splice(index, 1);
                }
            }
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
                            backPrice: backRate.re,
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
                    // const _selectionidData = global.tblEventMarkets.find(
                    //     (e) => e.selectionId == items.selectionId
                    // );
                    const runnerData = global.tblMarketRunnerV2.find(
                        (e) => e.selectionId == items.selectionId
                    );
                    const eventMarketData = global.tblEventMarketsV2.find(
                        (e) => e.eventMarketId == runnerData.eventMarketId
                    );

                    let EventRunnerData = {
                        backSize: items.backSize,
                        backPrice: items.backPrice,
                        laySize: items.laySize,
                        layPrice: items.layPrice,
                        selectionId: items.selectionId,
                        rateSourceRefID: data.mi,
                        timestamp: items.timestamp,
                    }

                    const ratesData = await updateEventMarketRunnerMaunalQuery(EventRunnerData, _fastify);
                    let index = global.tblMarketRunnerV2.findIndex(
                        (item) => item.selectionId === ratesData.selectionId
                      );
                      if (index !== -1) {
                        global.tblMarketRunnerV2[index] = {
                            ...global.tblMarketRunnerV2[index],
                            ...ratesData
                        }
                      }

                    let _updateData = {};
                    // if (_selectionidData && _selectionidData.commentaryId != 0) {
                    if (eventMarketData && eventMarketData.commentaryId != 0) {
                        _updateData.EventMarketId = eventMarketData.eventMarketId;
                        // _updateData.RunnerId = _selectionidData.runnerId;
                        _updateData.RunnerId = runnerData.runnerId;
                        _updateData.MarketStatus = eventMarketData.status;
                        _updateData.BackPrice = items.backPrice;
                        _updateData.LayPrice = items.layPrice;
                        _updateData.BackSize = items.backSize;
                        _updateData.LaySize = items.laySize;
                        // _updateData.MarketName = _selectionidData.marketName;
                        _updateData.MarketName = eventMarketData.marketName;
                        // _updateData.RunnerName = _selectionidData.runner;
                        _updateData.RunnerName = runnerData.runner;
                        // _updateData.commentaryId = _selectionidData.commentaryId;
                        // _updateData.selectionId = _selectionidData.selectionId;
                        _updateData.commentaryId = eventMarketData.commentaryId;
                        _updateData.selectionId = runnerData.selectionId;
                    }
                    // if (_selectionidData.teamId) {
                    //     _updateData.teamId = _selectionidData.teamId;
                    if (runnerData.teamId) {
                        _updateData.teamId = runnerData.teamId;
                    } else {
                        commentary = await global.tblCommentaries.find(
                            // (item) => item.commentaryId === _selectionidData.commentaryId
                            (item) => item.commentaryId === eventMarketData.commentaryId
                        );
                        if (commentary && commentary.isTeamPredictionOn) {
                            let teams;
                            teams = global.tblCommentaryTeams.find(
                                (item) =>
                                item.commentaryId === commentary.commentaryId &&
                                item.currentInnings === commentary.currentInnings &&
                                // item.teamName === _selectionidData.runner
                                item.teamName === runnerData.runner
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

        if(!isCalled && data.rt === null && EventsMarketobj.length > 0 && data.ms !== EventMarketStatus.Open){
            try {
                // global.tblEventMarkets = global.tblEventMarkets.map(item => {
                global.tblEventMarketsV2 = global.tblEventMarketsV2.map(item => {
                    if (item.rateSourceRefID === data.mi) {
                        // Update the status of the matched item
                        return {
                            ...item,
                            status: parseInt(data.ms) || 0
                        };
                    }
                    return item; // Return the item unchanged if it doesn't match
                });
                let _data = {};
                _data.rateSourceRefID = parseInt(data.mi);
                _data.status = parseInt(data.ms);
                await updateMarketStatusFromSignalRQuery(_data, request, _fastify);
                let index = global.tblEventMarketsV2.findIndex(
                    (item) => item.rateSourceRefID === _data.rateSourceRefID
                  );
                  if (index !== -1) {
                      global.tblEventMarketsV2[index].status = _data.status
                    if(_data.status === EventMarketStatus.Cancel || 
                        _data.status === EventMarketStatus.Settled && global.tblEventMarketsV2[index].isResult === true){
                        global.tblEventMarketsV2.splice(index, 1);
                    }
                }
                for (var i = 0; i < EventsMarketobj.length; i++) {
                    let _runner = {};
                    _runner = EventsMarketobj[i];
                    if (_runner.commentaryId != '0') {
                        const runnerRate = global.tblMarketRunnerV2.filter((item) => 
                            item.eventMarketId === _runner?.eventMarketId
                        )
                        for(const marketRunner of runnerRate) {
                        let commentary = global.tblCommentaries.find(
                            (item) => item.commentaryId == _runner.commentaryId
                        );
                        if (commentary) {
                            let teams;
                            teams = global.tblCommentaryTeams.find(
                                (item) =>
                                item.commentaryId === commentary.commentaryId &&
                                item.currentInnings === commentary.currentInnings &&
                                item.teamName == marketRunner?.teamId
                            );
    
                            if (!teams) {
                                teams = global.tblCommentaryTeams.find(
                                    (item) =>
                                    item.commentaryId === commentary.commentaryId &&
                                    item.currentInnings === commentary.currentInnings &&
                                    item.teamName.toLowerCase() == marketRunner?.runner.toLowerCase().trim()
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
                                await updateCommentaryTeamPredictionPrecentageQuery(_update, _fastify);

                                global.tblCommentaryTeams[index].teamPredictionPercentage = parseInt(_update.teamPredictionPercentage);
                            }
                        }
                      }
                    }
                }
            } catch (error) {
                // Ignore
            }
        }
    } catch (error) {
        console.log("wrrorororr", error)
        errorLogger(
            _fastify,
            error,
            "Error SignalrR --> signalrHandler/CreateUpdateSignalRData",
            null
        );
    }
}

//Update SignalR Connection Object
const updateConnectionStatus = async (data, fastify) => {
    try {
        const index = global.tblThirdPartyApis.findIndex(
            (item) => item.id === data.id
        );

        const updateData = {
            providerName: data.providerName,
            url: data.url,
            type: data.type,
            isActive: data.isActive,
            isDefault: data.isDefault,
            isConnect: data.isConnect,
            id: data.id,
            adminDisconnected: data.adminDisconnected,
        };
        if (index !== -1) {
            global.tblThirdPartyApis[index] = updateData;
          }
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

//? Update Event Market Runner Maunal
const updateMarketRunnerDataOnSocket = async (message) => {
    try {
        const data = message;
        const marketDataMap = new Map();

        // const _runnersData = global.tblEventMarkets.filter(
        //     (item) => item.rateSourceRefID === data.mi
        // );

        const eventMarket = global.tblEventMarketsV2.find(elem =>
            elem.rateSourceRefID == data.mi
        );
        const _runnersData = global.tblMarketRunnerV2.filter(elem =>
            elem.eventMarketId == eventMarket.eventMarketId
        );

        _runnersData.forEach((item) => {
            const runnerIndex = global.tblMarketRunnerV2.findIndex(elem =>
                elem.selectionId == item.selectionId && elem.eventMarketId == eventMarket.eventMarketId
            );
            let teamNameData = null;

            if (item.teamId) {
                teamNameData = global.tblCommentaryTeams.find(
                    (elem) => elem?.teamId === item?.teamId
                );
            }
            if (!item.teamId) {
                teamNameData = global.tblCommentaryTeams.find(
                    (t) => t.teamName?.toLowerCase() === item?.runner?.toLowerCase()
                );
            }

            const runner = {
                runnerId: global.tblMarketRunnerV2[runnerIndex].runnerId,
                runner: global.tblMarketRunnerV2[runnerIndex].runner,
                selectionId: global.tblMarketRunnerV2[runnerIndex].selectionId,
                backPrice: global.tblMarketRunnerV2[runnerIndex].backPrice,
                backSize: global.tblMarketRunnerV2[runnerIndex].backSize,
                layPrice: global.tblMarketRunnerV2[runnerIndex].layPrice,
                laySize: global.tblMarketRunnerV2[runnerIndex].laySize,
                teamId: global.tblMarketRunnerV2[runnerIndex].teamId,
                eventRefId: eventMarket.eventRefId,
                status: eventMarket.status,
                teamName: teamNameData?.teamName || null,
            };

            if (marketDataMap.has(item.eventMarketId)) {
                const existingMarket = marketDataMap.get(item.eventMarketId);
                const existingRunnerIndex = existingMarket.runners.findIndex(
                    (r) => r.selectionId === item.selectionId
                );

                if (existingRunnerIndex === -1) {
                    existingMarket.runners.push(runner);
                } else {
                    existingMarket.runners[existingRunnerIndex] = runner;
                }
            } else {
                marketDataMap.set(item.eventMarketId, {
                    eventMarketId: item.eventMarketId,
                    eventRefId: eventMarket.eventRefId,
                    status: eventMarket.status,
                    runners: [runner]
                });
            }
        });

        const runnerValues = Array.from(marketDataMap.values());

        if (
            global?.clientSocketIo !== undefined &&
            global?.clientSocketIo.length > 0
        ) {
            global.clientSocketIo.forEach((socket) => {
                socket.client.emit("updateRunnerData", runnerValues);
            });
        }
        runnerValues.forEach((market) => {
            const roomName = `runnerRoom-${market.eventMarketId}`;
            const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(roomName);

            if (clientsInRoom?.size) {
                global.socketIo.to(roomName).emit("marketRunners", [market]);
            }
        });
    } catch (error) {
        errorLogger(
            _fastify,
            error,
            "Error SignalrR --> signalrHandler/updateMarketRunnerDataOnSocket",
            null
        );
    }
}

module.exports = {
    startSignalR,
    stopSignalR,
    isSignalRStarted,
    stopCustomSignalR,
    isCustomSignalRStarted,
};
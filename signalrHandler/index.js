const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource,MarketUpdateType} = require('../utilities/index');
const { marketLogger, marketDataLogger } = require("../utilities/logger");
const {updateEventMarketRunnerMaunalQuery,getEventMarketByIdsQuery} = require('../repository/TableEventMarkets');

const configConstants = require('../utilities/configConstants');
let connection;
global.rateSourceRefIDSet = new Set();
let intervalId;

async function startSignalR() {

  const _SignalRURL = global.tblConfigs.find((item) => item.key === configConstants.MARKETRTETHIRDPARTY).value;
  const _SignalRInterwal = global.tblConfigs.find((item) => item.key === configConstants.INTERVAL_MarketTHIRDPARTY).value;
  if(_SignalRURL){
    connection = new signalR.HubConnectionBuilder()
      .withUrl(_SignalRURL)
      .build();

    try {
      await connection.start();
      console.log('SignalR Connected');

      // Function to check and invoke ConnectMarketRate if new IDs are added
      const checkAndUpdateMarketRate = async () => {
        let _MarketsIds = global.tblEventMarkets.filter(
          (item) => item.rateSource === EventMarketRateSource.Manual && item.status > EventMarketStatus.NotOpen && item.status < EventMarketStatus.Close
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
        //console.log(`Received Rate message: ${JSON.stringify(message)}`);
        //this following code is not permanemt its just modle exmple i will remove this
        try {
          // let _getMessage = '{"mi":3917979,"ms":1,"tm":670.12,"ip":false,"ia":true,"rt":[{"si":11439862,"lpt":"2.74","ib":true,"re":2.68,"rv":12,"pr":0,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":true,"re":2.6,"rv":99,"pr":1,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":true,"re":2.54,"rv":24,"pr":2,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.74,"rv":44,"pr":0,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.76,"rv":70,"pr":1,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.8,"rv":230,"pr":2,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.58,"rv":6,"pr":0,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.57,"rv":102,"pr":1,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.56,"rv":250,"pr":2,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.6,"rv":20,"pr":0,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.63,"rv":158,"pr":1,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.65,"rv":232,"pr":2,"pt":0,"rd":null}]}';
          // let _message = JSON.parse(_getMessage);
          let _getMessage = message;
          let _message = _getMessage;
          if(_message.rt){
            const data = message;

            const EventsMarketobj = global.tblEventMarkets.find(
              (item) => item.rateSourceRefID === data.mi
            );
            if(EventsMarketobj)
            { 
              const groupedRates = {};

              // Grouping rates by selectionId
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

              console.log(_blrbsids);
              if(_blrbsid && _blrbsid.length)
              {
                 let marketId;
                 for (const items of _blrbsids) {
                  const _selectionidData = global.tblEventMarkets.find(
                    (item) => item.selectionId === items.selectionId
                  );
                  if (_selectionidData) {
                    await updateEventMarketRunnerMaunalQuery(items, fastify);
                  }
                }
                let _eventMarketId = await  UpdateEventMarketByCIdFromSocketQuery({eventMarketId:EventsMarketobj.eventMarketId});
                 
                const dataOfmarkets = await  getEventMarketByIdsQuery(
                   {
                     eventMarketIds: [_eventMarketId],
                   },
                   request,
                   fastify
                 );
                
                 for (let item of dataOfmarkets) {
                   let index = global.tblEventMarkets.findIndex(
                     (e) => e.eventMarketId === item.eventMarketId
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
                       request,
                       fastify
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
                         lineDiff: item.line - previousLine,
                       },
                       request,
                       fastify
                     );
                   }
                }
              }

            }
          }
        } catch (error) {

        }
      });
    } catch (err) {
      console.error('Error connecting to SignalR:', err);
      setTimeout(startSignalR, 5000); 
    }
  }
}

async function stopSignalR() {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR Disconnected');
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      global.rateSourceRefIDSet.clear(); // Clear the set
    } catch (err) {
      console.error('Error disconnecting from SignalR:', err);
    }
  }
}

function isSignalRStarted() {
  return connection && connection.state === signalR.HubConnectionState.Connected;
}

module.exports = {
  startSignalR,
  stopSignalR,
  isSignalRStarted
};

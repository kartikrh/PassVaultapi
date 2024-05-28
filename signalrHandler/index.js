const signalR = require('@microsoft/signalr');
const {EventMarketStatus, EventMarketRateSource} = require('../utilities/index');

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

      connection.on('Rate', (message) => {
        //console.log(`Received Rate message: ${JSON.stringify(message)}`);
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

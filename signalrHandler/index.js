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
        //this following code is not permanemt its just modle exmple i will remove this
        let _getMessage = '{"mi":3917979,"ms":1,"tm":670.12,"ip":false,"ia":true,"rt":[{"si":11439862,"lpt":"2.74","ib":true,"re":2.68,"rv":12,"pr":0,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":true,"re":2.6,"rv":99,"pr":1,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":true,"re":2.54,"rv":24,"pr":2,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.74,"rv":44,"pr":0,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.76,"rv":70,"pr":1,"pt":0,"rd":null},{"si":11439862,"lpt":"2.74","ib":false,"re":2.8,"rv":230,"pr":2,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.58,"rv":6,"pr":0,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.57,"rv":102,"pr":1,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":true,"re":1.56,"rv":250,"pr":2,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.6,"rv":20,"pr":0,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.63,"rv":158,"pr":1,"pt":0,"rd":null},{"si":9433864,"lpt":"1.58","ib":false,"re":1.65,"rv":232,"pr":2,"pt":0,"rd":null}]}';
        let _message = JSON.parse(_getMessage);
        let _rates = _message.rt;

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

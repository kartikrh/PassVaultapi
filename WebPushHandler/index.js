const configConstants = require('../utilities/configConstants');

async function _sendNotification(title, message, url, image, icon) {
    const payload = JSON.stringify({ title, message, url, image, icon });
  
    try {
      // Get subscriptions from global.tblDevices
      const subscriptions = global.tblDevices
      .filter(device => device.deviceType === 1)
      .map(device => ({
        endpoint: device.pushEndpoint,
        keys: {
          p256dh: device.pushP256DH,
          auth: device.pushAuth
        }
      }));
  
      // Send notifications
      subscriptions.forEach(subscription => {
        global.webPush.sendNotification(subscription, payload).catch(error => {
          console.error("Error sending notification:", error);
        });
      });
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  }

  async function webPushset(webpush){
    try {
        const publicVapidKey = global.tblConfigs.find((item) => item.key === configConstants.PUBLIC_VAPID_KEY)?.value;
        const privateVapidKey = global.tblConfigs.find((item) => item.key === configConstants.PRIVATE_VAPID_KEY)?.value;
        if(!publicVapidKey || !privateVapidKey){
            console.error("Vapid key is not set");
            return;
        }

        webpush?.setVapidDetails(
          'mailto:nitesh@ziwotech.com',
          publicVapidKey,
          privateVapidKey
        );
        global.webPush = webpush;
    }
    catch (error) {
        console.error("Error WebPush notification: ", error);
    }
  }

  module.exports = {
    webPushset,
  };

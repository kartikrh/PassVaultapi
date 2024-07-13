const configConstants = require('../utilities/configConstants');
const { default: axios } = require("axios");
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

  async function sendMobileNotifications(title, message, url, image, icon) {
    const payload = {
      notification: {
        title,
        body: message,
      },
    };
  
    try {
       const MobilwNotificationurl = global.tblConfigs.find((item) => item.key === configConstants.MOBILE_NOTIFICATION_URL).value;
       const Authorization = global.tblConfigs.find((item) => item.key === configConstants.AUTHORIZATION_KEY).value;
        
      // Get devices from global.tblDevices whose deviceType is 2
      const mobileDevices = global.tblDevices.filter(device => device.deviceType === 2);
  
      // Send notifications
      const promises = mobileDevices.map(device => {
        const notificationPayload = { ...payload, to: device.mobileToken };
        return axios.post(MobilwNotificationurl, notificationPayload, {
          headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json',
          },
        }).catch(error => {
          console.error("Error sending mobile notification:", error);
        });
      });
  
      await Promise.all(promises);
    } catch (error) {
      console.error("Error sending mobile notifications: ", error);
    }
  }

async function sendNotification(title, message, url, image, icon) {
  const payload = JSON.stringify({ title, message, url, image, icon });
  const webPushPayload = JSON.stringify({ title, message, url, image, icon });
  const mobilePayload = {
    notification: {
      title,
      body: message,
      image,
    },
  };

  try {
    const subscriptions = global.tblDevices.map(device => {
      if (device.deviceType === 1) {
        return {
          type: 'web',
          subscription: {
            endpoint: device.pushEndpoint,
            keys: {
              p256dh: device.pushP256DH,
              auth: device.pushAuth
            }
          }
        };
      } else if (device.deviceType === 2) {
        return {
          type: 'mobile',
          token: device.mobileToken
        };
      }
    });

    const MobilwNotificationurl = global.tblConfigs.find((item) => item.key === configConstants.MOBILE_NOTIFICATION_URL).value;
    const Authorization = global.tblConfigs.find((item) => item.key === configConstants.AUTHORIZATION_KEY).value;

    const promises = subscriptions.map(device => {
      if (device.type === 'web') {
        return global.webPush.sendNotification(device.subscription, webPushPayload).catch(error => {
          console.error("Error sending web notification:", error);
        });
      } else if (device.type === 'mobile') {
        const notificationPayload = { ...mobilePayload, to: device.token };
        return axios.post(MobilwNotificationurl, notificationPayload, {
          headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json',
          },
        }).catch(error => {
          console.error("Error sending mobile notification:", error);
        });
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending notifications: ", error);
  }
}

  async function webPushset(webpush){
    try {
        const publicVapidKey = global.tblConfigs.find((item) => item.key === configConstants.PUBLIC_VAPID_KEY).value;
        const privateVapidKey = global.tblConfigs.find((item) => item.key === configConstants.PRIVATE_VAPID_KEY).value;

        webpush.setVapidDetails(
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
    sendNotification,
    webPushset,
    sendMobileNotifications
  };
  
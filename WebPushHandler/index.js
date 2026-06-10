const configConstants = require('../utilities/configConstants');
const { default: axios } = require("axios");
const {JWT} = require('google-auth-library');

function loadServiceAccountKeys() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON env var:', err.message);
    }
  }
  try {
    return require('../jwt.keys.json');
  } catch (err) {
    console.warn('jwt.keys.json not found and GOOGLE_SERVICE_ACCOUNT_JSON not set; mobile push disabled');
    return null;
  }
}
const Json_keys = loadServiceAccountKeys();

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
      //const Authorization = global.tblConfigs.find((item) => item.key === configConstants.AUTHORIZATION_KEY).value;
      const accessToken = await getAccessToken();
      //MobilwNotificationurl = 'https://fcm.googleapis.com/v1/projects/ogin-ee30d/messages:send';
      // Get devices from global.tblDevices whose deviceType is 2
      const mobileDevices = global.tblDevices.filter(device => device.deviceType === 2);
  
      // Send notifications
      const promises = mobileDevices.map(device => {
        let _Resjson = {}
        _Resjson.message = mobilePayload;
        _Resjson.message.token = device.token
        const notificationPayload = { ..._Resjson };
        //const notificationPayload = { ...payload, to: device.mobileToken };
        return axios.post(MobilwNotificationurl, notificationPayload, {
          headers: {
            'Authorization': 'Bearer ' + accessToken,
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

// async function sendNotification(title, message, url, image, icon) {
//   const payload = JSON.stringify({ title, message, url, image, icon });
//   const webPushPayload = JSON.stringify({ title, message, url, image, icon });
//   const mobilePayload = {
//     notification: {
//       title,
//       body: message,
//       image,
//     },
//   };

//   try {
//     const subscriptions = global.tblDevices.map(device => {
//       if (device.deviceType === 1) {
//         return {
//           type: 'web',
//           subscription: {
//             endpoint: device.pushEndpoint,
//             keys: {
//               p256dh: device.pushP256DH,
//               auth: device.pushAuth
//             }
//           }
//         };
//       } else if (device.deviceType === 2) {
//         return {
//           type: 'mobile',
//           token: device.mobileToken
//         };
//       }
//     });
//     //const Authorization = global.tblConfigs.find((item) => item.key === configConstants.AUTHORIZATION_KEY).value;
//     //MobilwNotificationurl = 'https://fcm.googleapis.com/v1/projects/login-ee30d/messages:send';
//     const MobilwNotificationurl = global.tblConfigs.find((item) => item.key === configConstants.MOBILE_NOTIFICATION_URL).value;
//     const accessToken = await getAccessToken();
//     //const accessToken = "";
//     const promises = subscriptions.map(device => {
//       if (device.type === 'web') {
//         return global.webPush.sendNotification(device.subscription, webPushPayload).catch(error => {
//           console.error("Error sending web notification:", error);
//         });
//       } else if (device.type === 'mobile') {
//         let _Resjson = {}
//         _Resjson.message = mobilePayload;
//         _Resjson.message.token = device.token
//         const notificationPayload = { ..._Resjson };
//         return axios.post(MobilwNotificationurl, notificationPayload, {
//           headers: {
//             'Authorization': 'Bearer ' + accessToken,
//             'Content-Type': 'application/json',
//           },
//         }).catch(error => {
//           console.error("Error sending mobile notification:", error);
//         });
//       }
//     });

//     await Promise.all(promises);
//   } catch (error) {
//     console.error("Error sending notifications: ", error);
//   }
// }
async function sendNotification(title, message, url, image, icon, commentaryId) {
  const payload = JSON.stringify({ title, message, url, image, icon });
  const webPushPayload = JSON.stringify({ title, message, url, image, icon });
  let content  = message
    .replace(/<[^>]*>/g, '')      // Remove HTML tags
    .replace(/&nbsp;/gi, ' ')     // Replace &nbsp; with space
    .replace(/&[a-z0-9#]+;/gi, ''); // Remove other HTML entities
    
  const mobilePayload = {
      title,
      body: content,
      ...(image ? { image } : {})
  };
  const topic = `match_${commentaryId}`
  try {
    // const webSubscriptions = global.tblDevices.filter(
    //   (device) => device.deviceType === 1
    // );
    // const webPromises = webSubscriptions.map((device) => {
    //   const subscription = {
    //     endpoint: device.pushEndpoint,
    //     keys: {
    //       p256dh: device.pushP256DH,
    //       auth: device.pushAuth,
    //     },
    //   };
    //   return global.webPush
    //     .sendNotification(subscription, webPushPayload)
    //     .catch((error) => {
    //       console.error(
    //         "Error sending web notification:",
    //         error
    //       );
    //     });
    // });
    const mobileNotificationUrl =
      global.tblConfigs.find(
        (item) =>
          item.key === configConstants.MOBILE_NOTIFICATION_URL
      ).value;
    const accessToken = await getAccessToken(); 
    // console.log("accessToken",accessToken)
    const notificationPayload = {
      message: {
        topic,
        notification : mobilePayload,
        data : {
          type : "match",
          matchId : String(commentaryId)
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      },
    };
    // console.log("NotificationPayload",notificationPayload )
    const mobilePromise = await axios.post(
      mobileNotificationUrl,
      notificationPayload,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    );
  

    console.log("Notifications sent successfully");
  } catch (error) {
    console.error("Error sending notifications: ", error);
  }
}
async function sendNewsNotification(data) {
  try {
    const topic = `news`
    const mobileNotificationUrl =
      global.tblConfigs.find(
        (item) =>
          item.key === configConstants.MOBILE_NOTIFICATION_URL
      ).value;
    const accessToken = await getAccessToken(); 
    const newsPayload = {
      message: {
        topic,
        notification : {
          title: data.title,
          body: data.SEODescription,
        },
        data : {
          type : "news",
          newsId : String(data.newsId),
          image: data?.image ?? ""
        },
        android: {
          priority: "high",

          notification: {
            sound: "default",
            image: data?.image ?? ""
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
              mutableContent: true,
            },
          },
          fcm_options: {
            image: data?.image ?? "",
          },
        },
      },
    };

    const mobilePromise = axios.post(
      mobileNotificationUrl,
      newsPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("News notification sent successfully");
  } catch (error) {
    console.error("Error sending notifications: ", error);
  }
}
async function sendVideoNotification(data) {
  try {
    const topic = `videos`
    const mobileNotificationUrl =
      global.tblConfigs.find(
        (item) =>
          item.key === configConstants.MOBILE_NOTIFICATION_URL
      ).value;
    const accessToken = await getAccessToken(); 
    const videoPayload = {
      message: {
        topic,
        notification : {
          title: data.title,
          body: data.description,
        },
        data : {
          type : "videos",
          videoId : String(data.id)
        },
        android: {
          priority: "high",

          notification: {
            sound: "default",
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
              mutableContent: true,
            },
          },
        },
      },
    };

    const mobilePromise = axios.post(
      mobileNotificationUrl,
      videoPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Video notification sent successfully");
  } catch (error) {
    console.error("Error sending notifications: ", error);
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

  function getAccessToken() {
    return new Promise(function(resolve, reject) {
      if (!Json_keys) {
        reject(new Error('Service-account credentials not configured (set GOOGLE_SERVICE_ACCOUNT_JSON)'));
        return;
      }
      const jwtClient = new JWT(
        Json_keys.client_email,
        null,
        Json_keys.private_key,
        ['https://www.googleapis.com/auth/cloud-platform'],
        null
      );
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  }
  module.exports = {
    sendNotification,
    webPushset,
    sendMobileNotifications,
    sendNewsNotification,
    sendVideoNotification,
  };
  
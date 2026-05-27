const uaParser = require("ua-parser-js");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const pLimit = require("p-limit").default;
const { mergeAndSaveImage } = require("./imageMerge");
const configConstants = require("./configConstants");
const {
  errorLogger,
  tblPredictorAPILogger,
  tblThirdPartyAPILogger,
} = require("./logger");
const {
  getCommentaryDetailByIdQuery,
} = require("../repository/TableCommentary");
const { sendNotification, sendNewsNotification, sendVideoNotification } = require("../WebPushHandler");
const { entityConstant, nullTeamtpIds } = require("./entityConst");
const {
  AllTeamPlayersQuery,
  AllTeamPlayersNullImageQuery,
} = require("../repository/TableTeamPlayer");
const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  SERVER_ERROR: "SERVER_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_TOKEN: "INVALID_TOKEN",
};

// Function to generate an error response object
const error = (message, errorCode, status) => {
  return {
    success: false,
    status: status,
    error: {
      code: errorCode,
      message: message || "Internal Server Error",
    },
  };
};
const virtualError = (message, errorCode, status) => {
  return {
    success: false,
    status: status,
    // return
    // error: {
    //   code: errorCode,
    //   message: message || "Internal Server Error",
    // },
    message: message || "Internal Server Error",
    data: null,
  };
};

// Function to generate a success response object
const success = (result, status) => {
  return {
    success: true,
    status: status,
    result: result,
  };
};
const virtualSuccess = (result, status) => {
  return {
    success: true,
    status: status,
    data: result,
    message: "Success",
  };
};

const deviceInfo = (request) => {
  const parsedUA = uaParser(request.headers["user-agent"]);
  return JSON.stringify({
    browserInfo: {
      ip: request.ip,
      browser: {
        name: parsedUA.browser.name,
        version: parsedUA.browser.version,
      },
      os: {
        name: parsedUA.os.name,
        version: parsedUA.os.version,
      },
      device: {
        model: parsedUA.device.model,
        type: parsedUA.device.type,
        vendor: parsedUA.device.vendor,
      },
    },
  });
};

const hashFunction = (value) => {
  const hash = crypto.createHash("sha256");
  hash.update(value.toString() + process.env.SECRET_HASH_KEY_TABID.toString()); // Convert to string before hashing
  return hash.digest("hex");
};

const encryptedObject = (value, enVal) => {
  return {
    wrTabId: value,
    wrEncryptedTabId: enVal,
  };
};

const convertStringToBuffer = (str) => {
  const buf = Buffer.alloc(32); // 256-bit buffer
  buf.write(str, "utf-8"); // Fill buffer with string
  return buf;
};

const key = convertStringToBuffer(process.env.ENCRYPTION_KEY); // 256-bit key for AES-256
const algorithm = "aes-256-ecb"; // ECB mode (not recommended for most cases)

function encrypt(input) {
  const cipher = crypto.createCipheriv(algorithm, key, Buffer.alloc(0)); // Using ECB mode, so IV is empty
  let encrypted = cipher.update(input, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.alloc(0)); // Using ECB mode, so IV is empty
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// const generateFileName = () => {
//   let timestamp = new Date().toISOString().replace(/[-:.]/g, "");
//   let random = ("" + Math.random()).substring(2, 8);
//   return timestamp + random;
// };

const isJson = (json) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};

const getTitle = (str) => {
  try {
    str = str.split("?")[0];
    if (str === "signin") return "Sign In";
    else if (str === "signout") return "Sign Out";
    else if (str === "signup") return "Sign Up";
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  } catch (err) {
    console.log(`Error while generating title for ${str}`);
    return "";
  }
};

const getMessage = (payload, code, type) => {
  const sendErrorMessage = (defaultMessage) => {
    let message =
      typeof payload?.error === "string"
        ? payload.error
        : payload?.error?.message;
    if (!message) message = defaultMessage;
    return message;
  };
  const generateMessage = (title, action = "") => {
    const isError = payload?.error;
    return isError
      ? sendErrorMessage(`${title}${" " + action} failed`)
      : `${title}${" " + action} successfully`;
  };
  switch (code) {
    case 500:
      return sendErrorMessage(`Internal Server Error`);
    case 200:
      let message =
        typeof payload?.result === "string"
          ? payload.result
          : payload?.result?.message;
      if (payload?.error) {
        message = sendErrorMessage("Something Went Wrong");
      }
      if (!message) {
        if (type === "signin" || type === "signup") {
          message = generateMessage(payload.title);
        } else if (
          type === "save" ||
          type === "create" ||
          type === "saveDetails"
        ) {
          message = generateMessage(payload.title, "saved");
        } else if (type.includes("delete")) {
          message = generateMessage(`${payload.title}(s)`, "delete");
        } else {
          message = generateMessage(payload.title, "fetched");
        }
      }
      return message;
    case 400:
      return sendErrorMessage(`Invalid Request`);
    case 403:
      return sendErrorMessage(`Unauthorized Access`);
    default:
      return sendErrorMessage(`Something Went Wrong with status ${code}`);
  }
};

function getUserChildIds(parentId, data) {
  const result = [];

  function findChildren(currentId) {
    const children = data
      .filter((item) => item.parentId === currentId)
      .map((item) => item.userId);

    children.forEach((child) => {
      result.push(child);
      findChildren(child);
    });
  }

  findChildren(parentId);
  return result;
}
const convertDate = (date, format) => {
  if (date) {
    if (format) return moment(date).local().format(format);
    return moment(date).local().format("DD/MM/YYYY hh:mm:ss a");
  }
  return "";
};
const wicketType = {
  1: "Bold",
  2: "Catch",
  3: "Stump",
  4: "Hit Wicket",
  5: "LBW",
  6: "Run Out",
  7: "Retired Out",
  8: "Timed Out",
  9: "Hit Ball Twice",
  10: "Obstruct the Fielding",
};
const pushSessionData = (data) => {
  const MAX_SESSION_DATA = 100;
  if (!global.sessionData) {
    global.sessionData = [];
  }
  global.sessionData.push(data);
  if (global.sessionData.length > MAX_SESSION_DATA) {
    global.sessionData.shift();
  }
};

const BALL_TYPE = {
  OVER_COMPLETE: 0,
  REGULAR: 1,
  WIDE: 2,
  BYE: 3,
  LEG_BYE: 4,
  NO_BALL: 5,
  NO_BALL_BYE: 6,
  NO_BALL_LEG_BYE: 7,
  PANELTY_RUN: 8,
  RETIRED_HURT: 9,
  BOWLER_RETIRED_HURT: 10,
};
const decryptEncryptionId = async (encryptionKey, fastify) => {
  try {
    const data = await fastify.db.query(
      `SELECT "wrKey" from "tblEncryptedData" where "wrValue" = $1`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [encryptionKey],
      }
    );

    return data[0].wrKey;
  } catch (error) {
    throw new Error(error);
  }
};
const EventMarketStatus = {
  NotOpen: 0,
  Open: 1,
  Inactive: 2,
  Suspend: 3,
  Close: 4,
  Settled: 5,
  Cancel: 6,
  WIN: 7,
  LOSE: 8,
};

const EventMarketRateSource = {
  Manual: 2,
};
const MarketActionType = {
  isresultSet: 1,
  setResult: 2,
  marketCancel: 3,
  closeMarket: 4,
  closeMarketOnTossWin: 5,
  setAndFinalizeResult: 6,
  setResultAndIsResultFalse: 7,
  allMarketClose: 8,
  dlsMarketClose: 9,
  dlsMarketCloseCancel: 10,
  closeMarketOnDLSChange: 11,
  virtualMarketCancel: 12,
};
const callPredictorMarket = async (
  data,
  endpoint,
  fastify,
  request,
  pythonURI = null
) => {
  let requestStartTime = new Date();
  let loggerConfig = global.tblConfigs.find(
    (item) => item.key === configConstants.ISPREDICTORLOGGER
  ).value;
  try {
    // let predictorURL = global.tblConfigs.find((item) => item.key === configConstants.MARKET_PREDICTOR)?.value;
    // if(isVirtual == true){
    //   // If commentary is virtual, use the virtual predictor URL
    //   predictorURL = global.tblConfigs.find((item) => item.key === configConstants.VIRTUALMARKETPREDICTOR)?.value;
    // }
    let predictorURL = pythonURI;
    if (!predictorURL) {
      errorLogger(
        fastify,
        "Predictor URL not found",
        "DB ERROR --> utilities/index/callPredictorMarket",
        request
      );
      return true;
    }
    const url = `${predictorURL}${endpoint}`;
    const result = await axios.post(url, {
        ...data,
      },
      {
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
          Connection: "keep-alive",
        },
      }
    );

    if (loggerConfig == "true") {
      tblPredictorAPILogger(
        {
          endPoint: endpoint,
          requestBody: data,
          requestStartTime: requestStartTime,
          requestEndTime: new Date(),
          response: result.data,
        },
        request,
        fastify
      );
    }
    return result;
  } catch (error) {
    if (loggerConfig == "true") {
      tblPredictorAPILogger(
        {
          endPoint: endpoint,
          requestBody: data,
          requestStartTime: requestStartTime,
          requestEndTime: new Date(),
          response: {
            error: error.message,
            type: "error",
          },
        },
        request,
        fastify
      );
      return true;
    }
    return true;
    // throw new Error(error.message);
  }
};

//fraud check Api
const callfds = async (data, endpoint, fastify, request) => {
  let requestStartTime = new Date();
  try {
    const now = new Date();
    let formattedDate;
    try {
      const offset = global.tblConfigs.find(
        (item) => item.key === configConstants.SERVER_OFFSET_TIMEZONE
      ).value;
      if (offset) {
        formattedDate = formatDateToISOStringwithOffset(now, offset);
      } else {
        formattedDate = formatDateToISOString(now);
      }
    } catch (error) {
      formattedDate = formatDateToISOString(now);
    }
    data.BWDateTime = formattedDate.toString();
    const fdsURL = global.tblConfigs.find(
      (item) => item.key === configConstants.FRAUDDET_DECTIONAPI
    ).value;
    if (fdsURL) {
      const url = `${fdsURL}${endpoint}`;
      const result = await axios.post(url, {
        ...data,
      });

      await tblThirdPartyAPILogger(
        {
          endPoint: endpoint,
          requestBody: data,
          requestStartTime: requestStartTime,
          requestEndTime: new Date(),
          response: result.data,
        },
        request,
        fastify
      );

      return result;
    }
  } catch (error) {
    //console.error(error.message);
    await tblThirdPartyAPILogger(
      {
        endPoint: endpoint,
        requestBody: data,
        requestStartTime: requestStartTime,
        requestEndTime: new Date(),
        response: error.message,
      },
      request,
      fastify
    );
    // throw new Error(error.message);
  }
};

const formatDateToISOString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const formatDateToISOStringwithOffset = (date, offset) => {
  // Parse the offset to extract hours and minutes
  const sign = offset[0] === "-" ? -1 : 1;
  const [hours, minutes] = offset.slice(1).split(":").map(Number);
  const totalOffsetMilliseconds = sign * (hours * 60 + minutes) * 60 * 1000;

  // Adjust the date by the total offset in milliseconds
  const adjustedDate = new Date(date.getTime() + totalOffsetMilliseconds);

  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
  const day = String(adjustedDate.getDate()).padStart(2, "0");
  const hoursStr = String(adjustedDate.getHours()).padStart(2, "0");
  const minutesStr = String(adjustedDate.getMinutes()).padStart(2, "0");
  const seconds = String(adjustedDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hoursStr}:${minutesStr}:${seconds}`;
};

const MarketUpdateType = {
  marketInitilization: 1,
  predictMarket: 2,
  marketViewer: 3,
  marketUpdateRate: 4,
  isSendDataUpdate: 5,
};
const ActionTypeForMarketCancel = {
  winClose: 1,
  winCloseCancel: 2,
  winMustClose: 3,
  winMustCloseCancel: 4,
  dlsCloseMarket: 5,
  dlsCloseCancelMarket: 6,
};
const genrateKey = () => {
  // Define the format pattern
  const format = "XXXX-XXXX-XXXX-XXXX";
  const key = format.replace(/[^\d-]/g, () => Math.floor(Math.random() * 10));
  return key;
};
const clientSocketStatus = {
  none: 0,
  connected: 1,
  disconnected: 2,
  reconnected: 3,
};
const clientSocketActionType = {
  connect: 1,
  disconnect: 2,
  reconnect: 3,
};
const fetchDataForClient = async (fastify, reply) => {
  const clientUrl = global.tblConfigs.find(
    (item) => item.key === configConstants.SCORECLIENTAPIURL
  ).value;
  if (!clientUrl) return "Client URL not found";
  const result = await axios.post(`${clientUrl}/loadData`, {});
  console.log(result.data);
  return result.data;
};
const callDataProvider = async (data, fastify) => {
  try {
    // return true;
    /// find the service which have the type of dataProviderAPI
    let services = global.tblAPIs.filter(
      (item) => item.type == data.serviceType && item.isActive == true
    );
    for (ser of services) {
      // find the endpoint for the service and module
      let endpoint = global.tblAPIEndpoints.find(
        (item) =>
          item.serviceType == ser.type &&
          item.moduleType == data.moduleType &&
          item.isActive == true
      );
      if (endpoint) {
        let url = `${ser.api}${endpoint.endPoint}`;
        let dataTosend = {};
        if (
          data.moduleType == APIEndpointModuleType.commentaryUpdate &&
          data.serviceType == ServiceType.dataProviderAPI
        ) {
          if (data.type == "delete") {
            dataTosend = {
              commentaryId: data.commentaryId,
            };
          } else if(data.type == "close"){
            dataTosend = await getCommentaryDetailByIdQuery(data, fastify);
            if(dataTosend){
              dataTosend = {
                ...dataTosend,
                status : commentaryStatus.COMPLETED
              }
          }

          } else{
            dataTosend = await getCommentaryDetailByIdQuery(data, fastify);
          }
          dataTosend = {
            ...dataTosend,
            type: data.type,
          };
        } else if (
          (data.moduleType == APIEndpointModuleType.vendorUpdate &&
            data.serviceType == ServiceType.dataProviderAPI) ||
          (data.moduleType == APIEndpointModuleType.vendorIpUpdate &&
            data.serviceType == ServiceType.dataProviderAPI)
        ) {
          dataTosend = {
            ...data.data,
            type: data.type,
          };
        }

        const result = await axios.post(url, {
          ...dataTosend,
        });
        return result;
      } else {
        console.log(
          "Endpoint not found for service type : ",
          ser.type,
          " and module type : ",
          data.moduleType
        );
        return;
      }
    }

    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callDataProvider",
      null
    );

    console.log("error From callDataProvider", error);
  }
};
// const callClientAPI = async (data, request, fastify) => {
//   try {
//     let clientServices = global.tblAPIs.filter(
//       (item) => item.type == data.serviceType && item.isActive == true
//     );
//     if (clientServices.length == 0) {
//       return true;
//     }
//     for (ser of clientServices) {
//       let endPoint = global.tblAPIEndpoints.find(
//         (item) =>
//           item.serviceType == ser.type &&
//           item.moduleType == data.moduleType &&
//           item.isActive == true
//       );
//       if (endPoint) {
//         let url = `${ser.api}${endPoint.endPoint}`;
//         let dataTosend = data.data;
//         const result = await axios.post(url, {
//           ...dataTosend,
//         });
//         // return result;
//       } else {
//         console.log(
//           "Endpoint not found for service type : ",
//           ser.type,
//           " and module type : ",
//           data.moduleType
//         );
//         // return;
//       }
//     }
//     return true;
//   } catch (error) {
//     errorLogger(
//       fastify,
//       error.message,
//       "DB ERROR --> utilities/index/callClientAPI",
//       request
//     );
//     // throw new Error(error.message);
//   }
// }

const callClientAPI = async (data, request, fastify, route) => {
  const clientServices = global.tblClientSocket.filter(
    (item) => item.isActive
  );

  if (clientServices.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    clientServices.map((ser) => {
      const endPoint = global.tblAPIEndpoints.find(
        (item) =>
          item.serviceType === ServiceType.clientAPI &&
          item.moduleType === data.moduleType &&
          item.isActive
      );

      if (!endPoint) {
        request.log.warn(
          `Endpoint not found for service type: ClientAPI, module: ${data.moduleType}`
        );

        // Return a rejected promise so it shows in allSettled
        return Promise.reject(
          new Error(`Missing endpoint for ClientAPI`)
        );
      }

      const url = `${ser.url}${endPoint.endPoint}`;

      // IMPORTANT: return the promise
      return axios.post(url, data.data, { timeout: 5000 });
    })
  );

  // Format response
  return results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return {
        api: clientServices[i].serverName,
        success: true,
        data: r.value.data
      };
    } else {
      // log error properly
      errorLogger(
        fastify,
        r.reason.message,
        `CallClientAPI Error --> ${clientServices[i].serverName}`,
        request,
        r.reason.response?.data || null
      );

      return {
        api: clientServices[i].serverName,
        success: false,
        error: r.reason.message
      };
    }
  });
};

const callSocketCountClientAPI = async (request, fastify) => {
  try {
    const clientUrls = global.tblClientSocket.filter((c) => c.isActive === true);

    if (clientUrls.length === 0) {
      return { totalCount: 0, rooms: {}, clients: [] };
    }

    const endPoint = global.tblAPIEndpoints.find(
      (item) =>
        item.serviceType === ServiceType.clientAPI &&
        item.moduleType === APIEndpointModuleType.getSocketCount &&
        item.isActive === true
    );

    if (!endPoint) {
      console.log(
        "Endpoint not found for service type:",
        ServiceType.clientAPI,
        "and module type:",
        APIEndpointModuleType.getSocketCount
      );
      return { totalCount: 0, rooms: {}, clients: [] };
    }

    const urlCalls = clientUrls.map((ser) => {
      const url = `${ser.url}${endPoint.endPoint}`;
      return axios
        .post(url, {})
        .then((result) => ({
          clientSocketId: ser.clientSocketId,
          serverName: ser.serverName,
          data: result.data
        }))
        .catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "API ERROR --> utilities/index/callClientAPI for socketCount",
            request
          );
          return {
            clientSocketId: ser.clientSocketId,
            serverName: ser.serverName,
            data: { totalCount: 0, rooms: {} }
          };
        });
    });

    const results = await Promise.all(urlCalls);

    let totalCount = 0;
    const rooms = {};
    const clients = [];

    for (const res of results) {
      const clientTotal = res.data?.totalCount || 0;
      const clientRooms = res.data?.rooms || {};

      totalCount += clientTotal;

      for (const [room, count] of Object.entries(clientRooms)) {
        rooms[room] = (rooms[room] || 0) + count;
      }

      clients.push({
        clientSocketId: res.clientSocketId,
        serverName: res.serverName,
        totalCount: clientTotal,
        rooms: clientRooms
      });
    }

    return { totalCount, rooms, clients };
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "UTIL ERROR --> utilities/index/callClientAPI",
      request
    );
    return { totalCount: 0, rooms: {}, clients: [] };
  }
};

const ServiceType = {
  clientAPI : 1,
  dataProviderAPI : 2,
  entitySport : 3,
}

const APIEndpointModuleType = {
  commentaryUpdate: 1,
  vendorUpdate: 2,
  vendorIpUpdate: 3,
  updateConfig: 4,
  updateBanner: 5,
  updateSeoModule: 6,
  updateMenuList: 7,
  configUpdate: 8,
  getICCRankingData: 9,
  insertTeam: 10,
  insertPlayer: 11,
  getSocketCount: 12,
  getCompetitionDataByIdFromEntity: 13,
  getTeamDataByIdFromEntity: 14,
  getPlayerDataByIdFromEntity: 15,
  getMatchDataByIdFromEntity: 16,
  getCompetitionMatchDataByIdFromEntity: 17,
  getCompetitionSquadDataByIdFromEntity: 18,
  searchPlayerDataFromEntity: 19,
  getCommentaryInningDataFromEntity: 20,
  upsertAdvertiseDataToClient: 21
}

const NotificationSendType = {
  all: 1,
  onlyLoggedInUser: 2,
  pushNotification: 3,
};
const sendNotificationByType = async (data, request, fastify) => {
  try {
    let eventName;
    switch (data.sendType) {
      case NotificationSendType.all:
        eventName = "onSendNotificationToAll";
        break;
      case NotificationSendType.onlyLoggedInUser:
        eventName = "onSendNotificationToLoggedInUser";
        break;
      case NotificationSendType.pushNotification:
        // eventName = "onSendPushNotification";
        if (data.type == "news") {
          sendNewsNotification(
            data.newsId,
            data.title,
            data.news,
            data.image,
          );
          return true;
        }
        if (data.type == "video") {
          sendVideoNotification(
            data.id,
            data.title,
            data.description,
            data.video,
            data.videoURL,
          );
          return true;
        }
        sendNotification(
          data.title,
          data.description,
          data.url,
          data.image,
          data.icon,
          data.commentaryId
        );
        return true;
        break;
    }
    // saveNotificationLogsQuery(data,request, fastify);
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit(eventName, data);
      });
    } else {
      console.log("Client Socket Not Found");
    }

    return true;
  } catch (error) {
    console.log("error From sendNotificationByType", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/sendNotificationByType",
      request
    );
    // throw new Error(error.message);
  }
};
const pageLimit = {
  notifcationLog: {
    limit: 20,
  },
};
const getPagination = (page = 1, size = 20) => {
  if (page < 1 || size < 1) {
    throw new Error("Page number and page size must be greater than zero.");
  }
  const skip = (page - 1) * size;
  const take = size;

  return {
    skip,
    take,
  };
};
const clientProvider = {
  Manual: 1,
  Google: 2,
  Facebook: 3,
};
const typesOfServices = {
  GmailService: "gmail",
  SmtpService: "smtp",
};

const templateModel = {
  MobileNo: 1,
  Email: 2,
};
const templateType = {
  Welcome: 1,
  Verify: 2,
  NewsLetter: 3,
};
const newsType = {
  news: 1,
  article: 2,
};
const getIpAddress = (req) => {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"] ||
    request.raw.connection.remoteAddress;
  return ip;
};
const thirdPartyApiType = {
  Socket: 1,
  API: 2,
};
const commentaryStatus = {
  OPEN: 1,
  TOSSDONE: 2,
  INPROGRESS: 3,
  COMPLETED: 4,
  INNINGCHANGE: 5,
  CANCELLED: 10,
  ABANDONED: 11
};
const EntityCommentaryStatus = {
  DEFAULT : 0,
  OPEN: 1,
  TOSSDONE: 2,
  INPROGRESS: 3,
  COMPLETED: 4,
  INNINGCHANGE: 6,
  STUMPS: 7,
  CANCELLED: 10,

};
const LineType = {
  BackLay: 1,
  Lay: 2,
};
const VideoLibraryType = {
  OUR: 1,
  YOUTUBE: 2,
};
const MarketTypeId = {
  Market: 1,
  Bookmarkers: 3,
  ManualOdds: 5,
  Fancy: 2,
  LineMarket: 4,
  MeterPari: 6,
  Sportbook: 7,
};
const MarketTypeCategories = {
  MARKET: 5,
  WINTOSS: 6,
  BOOKMAKERS: 7,
  MANUALODDS: 8,
  ADVFANCY: 9,
  OVERSESSION: 10,
  ONLYOVER: 11,
  PLAYER: 12,
  WICKET: 13,
  BOWLERSESSION: 14,
  PREMIUMODDS: 15,
  TIE: 16,
  LINEMARKET: 17,
  OVERUNDER: 18,
  PLAYERODDS: 20,
  BOUNDARYODDS: 21,
  OTHERODDS: 22,
  SESSION: 23,
  EXTRAODDS: 24,
  SPECIALODDS: 25,
  FANCYLDO: 26,
  ONLYOVERLDO: 27,
  LASTDIGITNUMBER: 28,
  PLAYERBOUNDARIES: 29,
  PLAYERBALLSFACED: 30,
  FALLOFWICKET: 31,
  PARTNERSHIPBOUNDARIES: 32,
  WICKETLOSTBALLS: 33,
  ODDEVEN: 35,
  TOTALEVENTRUN: 36,
  TOPBOWLER: 37,
  TOPBATSMAN: 38,
  MIDSESSION: 39,
};

const EntityInningsStatus = {
  Scheduled: 1,
  Completed: 2,
  Live: 3,
  Abandoned: 4,
};

const ModuleTypes = {
  Commentary: 1,
  Players: 2,
  Teams: 3,
  PenaltyRuns: 4,
  MatchTypes: 5,
  MarketTemplate: 6,
  DisplayStatus: 7,
  News: 8,
  Banners: 9,
  Awards: 10,
  MarketTypes: 11,
  PhotoLibrary: 12,
  VideoLibrary: 13,
  ShotTypes: 14,
  EventTypes: 15,
  Competition: 16,
  Events: 17,
  Template: 18,
  SendMailConfig: 19,
  Clients: 20,
  PageFormat: 21,
  MenuList: 22,
  Blocks: 23,
  Pages: 24,
  Tabs: 25,
  SocialMedia: 26,
  Subscribers: 27,
  Config: 28,
  Roles: 29,
  Users: 30,
  ClientScokets: 31,
  API: 32,
  APIEndpoints: 33,
  ThirdPartyApis: 34,
  Notifications: 35,
  Vendors: 36,
  CountryCode: 37,
  NotificationConfig: 38,
  Packages: 39,
  Whitelabel: 40,
  Venue: 41,
  CommentaryById: 42,
  PythonAPI: 43,
  EntitySocket: 44,
  CompetitionStatisticsType: 45,
  CompetitionStatistics: 46,
  Advertise: 47
};
const callTPAPI = async (data, fastify) => {
  try {
    // check if the third party api is enabled or not
    let isCallThirdParty = global.tblConfigs.find(
      (item) =>
        item.key.toLowerCase() ===
        configConstants.ISCALLEVENTALLOWORDERAPI.toLowerCase()
    )?.value;
    if (isCallThirdParty == undefined) {
      return true;
    }
    if (isCallThirdParty == "false") {
      return true;
    }
    if (isCallThirdParty == "true") {
      const thirdPartyAPI = global.tblConfigs.find(
        (item) =>
          item.key.toLowerCase() ===
          configConstants.EVENTALLOWORDERAPI.toLowerCase()
      )?.value;
      if (thirdPartyAPI == undefined) {
        return true;
      }
      // const header = global.tblConfigs.find((item) => item.key === configConstants.THIRDPARTYKEY)?.value;
      // if(header == undefined){
      //   return true;
      // }
      await axios.post(thirdPartyAPI, {
        eventID: data.eventRefId,
        isAllow: data.betAllow,
      });
      return true;
    }

    return true;
  } catch (error) {
    console.log("error from callTPAPI", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callTPAPI",
      null
    );
  }
};
const clientProcessStatus = {
  ADDUSERDETAIL: 1,
  MOEMAILVERIFIED: 2,
  PASSWORDSET: 3,
};
const sendOtpToMobile = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find(
      (item) => item.id === data.id
    )?.mobileOTPSendUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPURL.toLowerCase())?.value;
    if (!url) return "OTP URL not found";
    // call this otp url to send otp to mobile
    // replace {mobile} with the mobile number
    //remove + from country code
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.post(url);
    console.log(result);
    if (result.data.type == "success") {
      return true;
    } else {
      errorLogger(
        fastify,
        result.data.message,
        "DB ERROR --> utilities/index/sendOtpToMobile",
        request
      );
      return false;
    }
  } catch (error) {
    console.log("error from sendOtpToMobile", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/sendOtpToMobile",
      request
    );
    throw new Error(error.message);
  }
};
const verifyOTP = async (data, request, fastify) => {
  try {
    let config = global.tblWhitelabels.find((item) => item.id === data.id);
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPVERIFY.toLowerCase())?.value;
    // let otpAuthKey = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPAUTHKEY.toLowerCase())?.value;
    if (!config || !config.mobileOTPVerify || !config.mobileOTPAuthKey)
      return "OTP Verify URL not found";
    let cc = data.countryCode.replace("+", "");
    const mobileNumber = cc + data.mobileNo;
    // url = url.replace("{otp}", data.otp);
    // url = url.replace("{mobile}", cc + data.mobileNo);
    let otpUrl = config.mobileOTPVerify
      .replace("{otp}", encodeURIComponent(data.otp))
      .replace("{mobile}", encodeURIComponent(mobileNumber));
    const result = await axios.get(otpUrl, {
      headers: { authkey: config.mobileOTPAuthKey },
    });
    if (result.data.type == "success") {
      return true;
    } else {
      errorLogger(
        fastify,
        result.data.message,
        "DB ERROR --> utilities/index/verifyOTP",
        request
      );
      return false;
    }
  } catch (error) {
    console.log("error from verifyOTP", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/verifyOTP",
      request
    );
    throw new Error(error.message);
  }
};
const forgotPasswordOTP = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find(
      (item) => item.id === data.id
    )?.mobileOTPForgotUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPFORGOTURL.toLowerCase())?.value;
    if (!url) return "OTP URL not found";
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.post(url);
    if (result.data.type == "success") {
      return true;
    } else {
      errorLogger(
        fastify,
        result.data.message,
        "DB ERROR --> utilities/index/forgotPasswordOTP",
        request
      );
      return false;
    }
  } catch (error) {
    console.log("error from forgotPasswordOTP", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/forgotPasswordOTP",
      request
    );
    throw new Error(error.message);
  }
};
const resendOTP = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find(
      (item) => item.id === data.id
    )?.mobileOTPResendUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPRESEND.toLowerCase())?.value;
    if (!url) return "OTP URL not found";
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.get(url, { headers: {} });
    if (result.data.type == "success") {
      return true;
    } else {
      errorLogger(
        fastify,
        result.data.message,
        "DB ERROR --> utilities/index/resendOTP",
        request
      );
      return false;
    }
  } catch (error) {
    console.log("error from resendOTP", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/resendOTP",
      request
    );
    throw new Error(error.message);
  }
};

const IntervalType = {
  DAY: 1,
  MONTHLY: 2,
  YEARLY: 3,
};
const EventName = {
  COMMINGSOON: 1,
  WINTOSS: 2,
  EVENTSTART: 3,
  INNINGCOMPLETED: 4,
  BOUNDARY: 5,
  WICKET: 6,
  EVENTCOMPLETED: 7,
};
const generateEventId = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, "0")}${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${d.getFullYear().toString().slice(-2)}${d
    .getHours()
    .toString()
    .padStart(2, "0")}${d.getMinutes().toString().padStart(2, "0")}`;
};

const ClientInfoLoginType = {
  SUCCESS: 1,
  FAILED: 2,
};
const CompetitionType = {
  INTERNATIONAL: 1,
  DOMESTIC: 2,
};
const Weather = {
  RANDOM: 1,
  COLD: 2,
  WARM: 3,
  HOT: 4,
  MILD: 5,
};
const PitchCracks = {
  NONE: 1,
  LIGHT: 2,
  HEAVY: 3,
};

const PitchWareSpeed = {
  NORMAL: 1,
  SLOW: 2,
  FAST: 3,
};
const PitchHardness = {
  SOFT: 1,
  VERYSOFT: 2,
  HARD: 3,
  MEDIUM: 4,
};
const PitchType = {
  1: "Dry",
  2: "Grassy/Dusty",
  3: "Grassy/Dry",
  4: "Grassy",
  5: "Dusty",
  6: "Standard",
};
const LawnStriping = {
  1: "Cross hatch",
  2: "Stripe",
  3: "Vertical",
  4: "None",
  5: "Diamond",
};

const PitchAge = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};
const playerSwitchObj = {
  SWITCH_BOWLER: "SWITCH_BOWLER",
  CHANGE_BOWLER: "CHANGE_BOWLER",
  BATTER_SWITCH: "BATTER_SWITCH",
};
const wicketTypeObj = {
  BOLD: 1,
  BOLD_LABEL: "Bowled",
  CATCH: 2,
  CATCH_LABEL: "Catch",
  STUMP: 3,
  STUMP_LABEL: "Stump",
  HIT_WICKET: 4,
  HIT_WICKET_LABEL: "Hit Wicket",
  LBW: 5,
  LBW_LABEL: "LBW",
  RUN_OUT: 6,
  RUN_OUT_LABEL: "Run Out",
  RETIRED_OUT: 7,
  RETIRED_OUT_LABEL: "Retired Out",
  TIMED_OUT: 8,
  TIMED_OUT_LABEL: "Timed Out",
  HIT_BALL_TWICE: 9,
  HIT_BALL_TWICE_LABEL: "Hit B. Twice",
  OBSTRACT_THE_FIELDING: 10,
  OBSTRACT_THE_FIELDING_LABEL: "Obst. Field",
};
const inningSwitch = {
  EXTRAS: "EXTRAS",
  OVER: "OVER",
  OVER_ENDED: "OVER_ENDED",
  WICKET: "WICKET",
  RUN: "RUN",
  ALL: "ALL",
};
const playerType = {
  CURRENT_BOWLER: "CURRENT_BOWLER",
  BATTING_TEAM: "BATTING_TEAM",
  BOWLING_TEAM: "BOWLING_TEAM",
  ON_STRIKE: "ON_STRIKE",
  NON_STRIKE: "NON_STRIKE",
};
const teamStatus = {
  BAT_TEAM_STATUS: 1,
  BOWL_TEAM_STATUS: 2,
};
const Cards = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  10: 0,
  J: -1,
  K: -2,
};
const HideEventType = {
  eventType: 1,
  competition: 2,
  commentary: 3,
};
const callEntitySportAPI = async (url, request, fastify) => {
  try {
    let checkEntitySportIsActive = global.tblEntitySockets.find(item => item.isActive == true);
    if (!checkEntitySportIsActive) {
      throw new Error("Entity Sport API is not active");
    }

    const result = await axios.get(`${checkEntitySportIsActive.url}${url}`);
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callEntitySportAPI",
      request
    );
    throw new Error(error.message);
  }
};
const comCardType = {
  Heart: 1,
  Diamond: 2,
  Clubs: 3,
  Spades: 4,
};
const EntityEnums = {
  ODI: 1,
  TEST: 2,
  T20I: 3,
  LimitedOverDomesticMatch: 4,
  FirstClass: 5,
  T20: 6, //Domestic
  WomenODI: 7,
  WomenT20: 8,
  YouthODI: 9,
  YouthT20: 10,
  Other: 11,
  OtherListA: 12,
  Other1stClass: 13,
  OtherT20: 14,
  YouthTest: 15,
  WomanTest: 16,
  T10: 17,
  T100: 18,
  WomenT100: 19,
  TB10: 20,
  MIXED: null
};
const compStatus = {
  upcoming: 1,
  started: 2,
  completed: 3,
  stopped: 4,
  "fixture": 1,
  "live": 2,
  "result": 3,
};
// const callCardCricket = async (data, request, fastify) => {
//   "upcoming": 1,
//   "started": 2,
//   "completed": 3,
//   "stopped": 4,
//   "fixture": 1,
//   "live": 2,
//   "result": 3,
// }
const callCardCricket = async (data ,request , fastify) =>{
  try {
    // console.log("callCardCricket", data);
    // return true;
    let cardUrl = global.tblConfigs.find(
      (item) => item.key === configConstants.CARDCRICKETURL
    )?.value;
    if (!cardUrl) return "Card Cricket URL not found";
    // call this card cricket url to send data
    const result = await axios.post(cardUrl, {
      ...data,
    });
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callCardCricket",
      request
    );
    // throw new Error(error.message);
  }
};
const GlobalModuleType = {
  Commentary: 1,
  CommenaryTeams: 2,
  CommentaryPlayers: 3,
  Players: 4,
  Teams: 5,
  TeamCompetiton: 6,
  MatchTypes: 7,
  Competition: 8,
  CountryCode: 9,
  Venue: 10,
  Weather: 11,
  PitchConditon: 12,
};
const StoreTypes = {
  Insert: 1,
  Update: 2,
};
const trimTextData = async (data, request, fastify) => {
  try {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return;
    }
    const trimmedData = {};
    for (const [key, value] of Object.entries(data)) {
      trimmedData[key] =
        typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;
    }
    return trimmedData;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index.js/trimTextData",
      request
    );
  }
};
const callVirtualPredictorMarket = async (
  data,
  endpoint,
  fastify,
  request,
  pythonURI = null
) => {
  let requestStartTime = new Date();
  let loggerConfig = global.tblConfigs.find(
    (item) => item.key === configConstants.ISPREDICTORLOGGER
  ).value;
  try {
    let predictorURL = pythonURI;
    if (!predictorURL) {
      errorLogger(
        fastify,
        "Predictor URL not found",
        "DB ERROR --> utilities/index/callPredictorMarket",
        request
      );
      throw new Error("Predictor URL not found");
    }
    const url = `${predictorURL}${endpoint}`;
    const result = await axios.post(url, {
      ...data,
    });

    if (loggerConfig == "true") {
      tblPredictorAPILogger(
        {
          endPoint: endpoint,
          requestBody: data,
          requestStartTime: requestStartTime,
          requestEndTime: new Date(),
          response: result.data,
        },
        request,
        fastify
      );
    }
    return result;
  } catch (error) {
    if (loggerConfig == "true") {
      tblPredictorAPILogger(
        {
          endPoint: endpoint,
          requestBody: data,
          requestStartTime: requestStartTime,
          requestEndTime: new Date(),
          response: {
            error: error.message,
            type: "error",
          },
        },
        request,
        fastify
      );
      throw new Error(error.message);
    }
    // throw new Error(error.message);
  }
};
const matchTypesEntity = {
  ODI: 1,
  TEST: 2,
  T20I: 3,
  "List A": 4,
  "First Class": 5,
  T20: 6,
  "Women ODI": 7,
  "Women T20": 8,
  "Youth ODI": 9,
  "Youth T20": 10,
  Other: 11,
  "Other List A": 12,
  "Other 1st Class": 13,
  "Other T20": 14,
  "Youth Test": 15,
  "Woman Test": 16,
  T10: 17,
  T100: 18,
  "Women T100": 19,
  "TB-10": 20,
  "Women T20I": 21,
  "Women T10": 22
};
const matchStatusEntity = {
  Scheduled: 1,
  Completed: 2,
  Live: 3,
  "Abandoned, canceled, no result": 4,
};
const entityCompetition = {
  1: "fixture",
  2: "result",
  3: "live",
};
const ScoringTypes = {
  Panel: 1, // Manual
  Entity: 2,
};
const RefType = {
  Cricket: 1,
  Competition: 2,
  Match: 3,
  Team: 4,
  Player: 5,
  TeamUpdate: 6,
  PlayerUpdate: 7,
  tournamentTeamPointUpdate: 8,
  ICCRanking: 9,
  CompetitionStatistics: 10,
  CompetitionUpdate: 11,
  InningDataUpdate: 12,
};
const SourceID = {
  Prediction: 1,
  Betfair: 2,
  EntitySport: 3,
};

const ICCRankingType = {
  Team: 1,
  Player: 2,
};

const ICCMatchType = {
  men: {
    odis: matchTypesEntity.ODI,
    tests: matchTypesEntity.TEST,
    t20s: matchTypesEntity.T20I,
    odi: matchTypesEntity.ODI,
    t20i: matchTypesEntity.T20I,
    t20: matchTypesEntity.T20,
    lista: matchTypesEntity["List A"],
    t10: matchTypesEntity.T10,
    firstclass: matchTypesEntity["First Class"],
    test: matchTypesEntity.TEST
  },
  women: {
    odis: matchTypesEntity["Women ODI"],
    t20s: matchTypesEntity["Women T20"],
    test: matchTypesEntity["Woman Test"],
    odi: matchTypesEntity["Women ODI"],
    t20i: matchTypesEntity["Women T20"],
    t10: matchTypesEntity["TB-10"],
  },
};

const ICCRankingPlayerType = {
  batsmen: "BatsMan",
  bowlers: "Bowler",
  "all-rounders": "AllRounder",
};

const ICCRankingPlayerTypeById = {
  Batsman: 1,
  Bowler: 2,
  AllRounder: 3,
};
const inningStatus = {
  Scheduled: 1,
  Completed: 2,
  Live: 3,
  Abandoned: 4,
};
const commentaryEvents = {
  1: "Players Enter",
  2: "New Batter",
  3: "New Bowler",
  4: "Catch Drop",
  5: "Misfield",
  6: "Boundary Check",
  7: "3rd umpire",
  8: "3rd umpire out",
  9: "3rd umpire not out",
  10: "Review",
  11: "Injured",
  12: "Maiden over",
  13: "Wicket Check",
  14: "Stump Check",
  15: "Catch Check",
  16: "1st Bounce",
  17: "2nd Bounce",
  18: "Fast Bowler",
  19: "Spin Bowler",
  20: "Appeal",
  21: "Ball In Air",
  22: "Bowler Stop",
  23: "Over",
  24: "Ball Chalu",
  25: "Wicket",
  26: "Dot",
  27: "Wide",
  28: "No Ball",
  29: "Bye",
  30: "Leg Bye",
  31: "Four",
  32: "Six",
  34: "Retired Hurt",
  35: "1 run",
  36: "2 run",
  37: "3 run",
  38: "4 run",
  39: "5 run",
  40: "6 run",
  41: "7 run",
  42: "Bowled",
  43: "Caught",
  44: "LBW",
  45: "Stumped",
  46: "Run Out",
  47: "Hit Wicket",
  48: "Retired Out",
  49: "Obstructing The Field",
  50: "Timed Out",
  51: "Toss",
  52: "Delayed",
  53: "Drinks Break",
  54: "Inning Break",
  55: "Stumps",
  56: "Lunch Break",
  57: "Tea Break",
  58: "Match Start Delay",
  59: "Rain Delay",
  60: "Dinner",
  61: "Strategic Timeout",
  62: "Technical Issue",
  63: "Bad Light",
  64: "Match Interrupted",
  65: "Toss Update",
  66: "Playing-11 Update",
  67: "Match End",
  68: "Fielder Injured",
  69: "Batter Injured",
  70: "Bowler Injured",
  71: "Runout Check",
  72: "Free Hit",
  73: "Overthrow",
  74: "No Ball Check",
  75: "Wide Ball Check",
  76: "LBW Check",
  77: "Batting Review",
  78: "Bowling Review",
};

const exchangeMatchinfoAPI = async (data, request, fastify) => {
  try {
    let url = entityConstant.EXCHANGEMATCHINFOAPI;
    if (!url) return "Match info URL not found";

    const authToken = global.tblConfigs.find(
      (item) => item.key === configConstants.ENTITYEXCHAUTHTOKEN
    )?.value;
    if (!authToken) {
      throw new Error("Auth token not found in config");
    }

    if (!data?.mid) {
      throw new Error("Match ID is required");
    }

    url = url
      .replace("{token}", authToken)
      .replace("{match_id}", data?.mid || "");

    const result = await axios.get(url, { headers: {} });
    return result.data;
  } catch (error) {
    console.log("error from exchangeMatchInfoAPI", error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/exchangeMatchInfoAPI",
      request
    );
    return (
      error.response?.data || {
        status: "failed",
        response: error.message,
        api_version: "3.0",
      }
    );
  }
};

const UndoReportType = {
  commentary: 1,
  user: 2,
};

const teamRemarkType = {
  Q: "Q",
  E: "E"
}

const extractGroupDataFromArray = (tournamentTamPoint) => {
  const orderWiseData = tournamentTamPoint
    .sort((a, b) => a.round.order - b.round.order)
    .map(group => ({
      groupId: group.round.order,
      groupName: group.round.name.trim(),
      standings: group.standings
        .filter(team => !nullTeamtpIds.includes(Number(team.team_id)))
        .map(team => ({
          teamTpId: Number(team.team_id),
          totalMatches: Number(team.played),
          totalWin: Number(team.win),
          totalLose: Number(team.loss),
          totalTie: Number(team.draw),
          noResult: Number(team.nr),
          totalPoint: Math.round(Number(team.points)),
          netRunRate: Number(team.netrr),
          qualified: team.quality === "true",
          eliminated: team.eliminate === "true",
          ...(team.quality === "true" ? {
            position: teamRemarkType.Q
          } : {}),
          ...(team.eliminate === "true" ? {
            position: teamRemarkType.E
          } : {}),
        }))
    }));

  return orderWiseData;
}

const EntityPlayerType = {
  bat: 1,
  bowl: 2,
  all: 4,
  wk: 3,
  wkbat: 3
}

const EntityBowlingStyleType = {
  pace: 1,
  spin: 2
}

const extractBowlingStyle = (bowlingType, bowlingStyle) => {
  if (!bowlingType || !bowlingStyle || global.tblBowlingTypes.length < 1) return null;

  const normalizedStyle = bowlingStyle
    .replace(/left arm |right arm /i, '')
    .replace(/\s/g, '')
    .toLowerCase();

  const match = global.tblBowlingTypes.find(item =>
    item.bowlingType.replace(/\s/g, '').toLowerCase() === normalizedStyle
  );

  return match?.bowlingTypeId || null;
};

const EventType = {
   Cricket: 1,
   Soccer: 2,
}

const parseUmpires = (umpiresString) => {
    const umpires = [];
    let current = '';
    let level = 0;

    for (const char of umpiresString) {
        if (char === '(') level++;
        else if (char === ')') level--;

        if (char === ',' && level === 0) {
            umpires.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current) umpires.push(current.trim());

    const onFieldUmpires = [];
    let thirdUmpire = null;

    for (const umpire of umpires) {
        if (umpire.toLowerCase().includes('tv')) {
            thirdUmpire = umpire;
        } else if (onFieldUmpires.length < 2) {
            onFieldUmpires.push(umpire);
        }
    }

    return { onFieldUmpires, thirdUmpire };
};

const playersMergeImageService = async (type, request, fastify) => {
  const startTime = new Date().toISOString();
  const startMessage =
    type === 1
      ? `All players merge image process started - ${startTime}`
      : `All players null image update process started - ${startTime}`;

  await errorLogger(
    fastify,
    startMessage,
    `services/player.js/playersMergeImageService`,
    null
  );

  (async () => {
    const limit = pLimit(10);

    try {
      const teamPlayersData =
        type === 1
          ? await AllTeamPlayersQuery(fastify, request)
          : await AllTeamPlayersNullImageQuery(fastify, request);

      const total = teamPlayersData.length;
      let processed = 0;

      const batchSize = 5000;
      for (let i = 0; i < total; i += batchSize) {
        const batch = teamPlayersData.slice(i, i + batchSize);
        const mergeTasks = batch.map((playerData) =>
          limit(async () => {
            try {
              const player = global.tblPlayers.find(
                (item) => item.playerId == playerData.refPlayerId
              );
              const team = global.tblTeams.find(
                (item) => item.teamId == playerData.teamId
              );

              if (player?.image && team?.jersey) {
                await mergeAndSaveImage(
                  {
                    playerImage: player.image,
                    jersey: team.jersey,
                    playerName: player.playerName,
                    teamName: team.teamName,
                    teamPlayerId: playerData.teamPlayerId,
                    commentaryPlayerId: null,
                    commentaryId: null,
                  },
                  fastify
                );
              }
            } catch (err) {
              await errorLogger(
                fastify,
                `Error merging playerId ${playerData.refPlayerId} - ${err.message}`,
                `services/player.js/playersMergeImageService`,
                null
              );
            }
          })
        );

        await Promise.allSettled(mergeTasks);

        processed += batch.length;
        if (processed % 5000 === 0 || processed >= total) {
          await errorLogger(
            fastify,
            `Progress: ${processed}/${total} player images processed`,
            `services/player.js/playersMergeImageService`,
            null
          );
        }
      }

      const endTime = new Date().toISOString();
      const endMessage =
        type === 1
          ? `All players merge image process completed - ${endTime}`
          : `All players null image update process completed - ${endTime}`;

      await errorLogger(
        fastify,
        endMessage,
        `services/player.js/playersMergeImageService`,
        null
      );
    } catch (err) {
      await errorLogger(
        fastify,
        `Fatal error in playersMergeImageService - ${err.message}`,
        `services/player.js/playersMergeImageService`,
        err.stack
      );
    }
  })();

  return "All Player image(s) and Jersey image(s) merge process started";
};

const roundToNearestMinutes = async (minutes) => {
    const date = new Date();
    const ms = 1000 * 60 * minutes;
    return new Date(Math.round(date.getTime() / ms) * ms);
};

const GAME_STATUS = {
  "Default": 0,
  "Starts Shortly": 1,
  "Toss": 2,
  "Play Ongoing": 3,
  "Delayed": 4,
  "Drinks Break": 5,
  "Innings Break": 6,
  "Stumps": 7,
  "Lunch Break": 8,
  "Tea Break": 9,
  "Match Start Delay": 10,
  "Rain Delay": 11,
  "Dinner": 12,
  "Strategic Timeout": 13,
  "Technical Issue": 14,
  "Bad Light": 15,
  "Match Interrupted": 16
};

const CompetitionStatisticsType = {
  batting: {
    "Most Runs": {
      key: "batting_most_runs",
      enum: 1,
      valueKey: "runs"
    },
    "Highest Individual Score": {
      key: "batting_most_runs_innings",
      enum: 2,
      valueKey: "runs"
    },
    "Highest Strike Rates": {
      key: "batting_highest_strikerate",
      enum: 3,
      valueKey: "strike"
    },
    "Highest Strike Rates (Innings)": {
      key: "batting_highest_strikerate_innings",
      enum: 4,
      valueKey: "average"
    },
    "Highest Average": {
      key: "batting_highest_average",
      enum: 5,
      valueKey: "average"
    },
    "Most Centuries": {
      key: "batting_most_run100",
      enum: 6,
      valueKey: "run100"
    },
    "Most Fifties": {
      key: "batting_most_run50",
      enum: 7,
      valueKey: "run50"
    },
    "Most Sixes": {
      key: "batting_most_run6",
      enum: 8,
      valueKey: "run6"
    },
    "Most Sixes (Innings)": {
      key: "batting_most_run6_innings",
      enum: 9,
      valueKey: "run6"
    },
    "Most Fours": {
      key: "batting_most_run4",
      enum: 10,
      valueKey: "run4"
    },
    "Most Fours (Innings)": {
      key: "batting_most_run4_innings",
      enum: 11,
      valueKey: "run4"
    }
  },
  bowling: {
    "Top Wicket Takers": {
      key: "bowling_top_wicket_takers",
      enum: 12,
      valueKey: "wickets"
    },
    "Best Economy Rates": {
      key: "bowling_best_economy_rates",
      enum: 13,
      valueKey: "econ"
    },
    "Best Economy Rates (Innings)": {
      key: "bowling_best_economy_rates_innings",
      enum: 14,
      valueKey: "econ"
    },
    "Best Bowling Figures": {
      key: "bowling_best_bowling_figures",
      enum: 15,
      valueKey: ""
    },
    "Best Strike Rates": {
      key: "bowling_best_strike_rates",
      enum: 16,
      valueKey: "strike"
    },
    "Best Strike Rates (Innings)": {
      key: "bowling_best_strike_rates_innings",
      enum: 17,
      valueKey: "strike"
    },
    "Best Averages": {
      key: "bowling_best_averages",
      enum: 18,
      valueKey: "average"
    },
    "Most runs conceded in an innings": {
      key: "bowling_most_runs_conceded_innings",
      enum: 19,
      valueKey: ""
    },
    "Four Wickets": {
      key: "bowling_four_wickets",
      enum: 20,
      valueKey: "wicket4i"
    },
    "Five Wickets": {
      key: "bowling_five_wickets",
      enum: 21,
      valueKey: "wicket5i"
    },
    "Maidens": {
      key: "bowling_maidens",
      enum: 22,
      valueKey: "maidens"
    }
  },
  team: {
    "Total Runs": {
      key: "team_total_runs",
      enum: 23,
      valueKey: "runs"
    },
    "Most Centuries": {
      key: "team_total_run100",
      enum: 24,
      valueKey: "run100"
    },
    "Most Fifties": {
      key: "team_total_run50",
      enum: 25,
      valueKey: "run50"
    },
    "Total Wickets": {
      key: "team_total_wickets",
      enum: 26,
      valueKey: "wickets"
    }
  }
};
// const etWicketObj = {
//   "caught" : wicketTypeObj.CATCH,
//   "bowled" : wicketTypeObj.BOLD,
//   "lbw" : wicketTypeObj.LBW,
//   "stumped" : wicketTypeObj.STUMP,
//   "run out" : wicketTypeObj.RUN_OUT,
//   "hit wicket" : wicketTypeObj.HIT_WICKET,
//   "retired hurt" : wicketTypeObj.RETIRED_OUT,
//   "timed out" : wicketTypeObj.TIMED_OUT,
//   "hit the ball twice" : wicketTypeObj.HIT_BALL_TWICE,
//   "obstructing the field" : wicketTypeObj.OBSTRACT_THE_FIELDING,
// }
const etWicketObj = {
  "caught" : wicketTypeObj.CATCH,
  "bowled" : wicketTypeObj.BOLD,
  "lbw" : wicketTypeObj.LBW,
  "stumped" : wicketTypeObj.STUMP,
  "runout" : wicketTypeObj.RUN_OUT,
  "hitwicket" : wicketTypeObj.HIT_WICKET,
  "retiredout" : wicketTypeObj.RETIRED_OUT,
  "retired" : wicketTypeObj.RETIRED_OUT,
  "timedout" : wicketTypeObj.TIMED_OUT,
  "hittheballtwice" : wicketTypeObj.HIT_BALL_TWICE,
  "fieldobstruction" : wicketTypeObj.OBSTRACT_THE_FIELDING,
}

const getKeyAndValueKey = async (enumValue) => {
  let result = Object.values(CompetitionStatisticsType)
    .flatMap(category => Object.values(category))
    .find(stat => stat.enum === enumValue);

  if (result) {
    return { key: result.key, valueKey: result.valueKey };
  } else {
    return null;
  }
}

const competitionMatchTypeEnum = {
  men: {
    odi: 1,
    test: 2,
    t20i: 3,
    firstclass: 5,
    lista: 4,
    t20: 6,
    t10: 17
  },
  women: {
    odi: 7,
    womenodi: 7,
    woment20: 8,
    t20i: 21
  }
}

const EntityMatchStatus = {
  SCHEDULED: 1,
  COMPLETED: 2,
  LIVE: 3,
  ABANDONED: 4,
  CANCELLED: 4,
  NO_RESULT: 4
};

const awardTypes = {
  MAN_OF_THE_MATCH: 6
};

const lowerEntityMatchTypesEnums = () => {
  const entityEnumsLowercase = Object.fromEntries(
    Object.entries(EntityEnums).map(([key, value]) => [
      key.toLowerCase(),
      value
    ])
  );
  return entityEnumsLowercase;
}

const getInningWiseDataFromEntity = (moduleType) => {
  try {
    let entityData = global.tblAPIEndpoints.find(item => item.serviceType == ServiceType.entitySport && item.isActive == true && item.moduleType === moduleType);
    if (!entityData) {
      return {
        message: `Entity Sport API module ${moduleType} is not active`,
        data: null
      };
    }
    return {
      data: entityData?.endPoint
    };
  } catch (error) {
    return {
      message: error.message,
      data: null
    };
  }
}
const comWeatherAndPitchData = async (commentaryId) => {
  const commentaryData = global.tblCommentaries.find(item => item.commentaryId == commentaryId);
  const pitchData = global.tblPitchConditions.find(elem => elem.commentaryId == commentaryId);
  const weatherDetails = global.tblWeather.find(elem => elem.commentaryId == commentaryId);

  return {
    onfieldUmpires: commentaryData?.onfieldUmpires || "",
    matchReferee: commentaryData?.matchReferee || "",
    thirdUmpire: commentaryData?.thirdUmpire || "",
    difficulty: commentaryData?.difficulty || 0,
    pitchHardness: commentaryData?.pitchHardness || 0,
    pitchCracks: commentaryData?.pitchCracks || 0,
    pitchWareSpeed: commentaryData?.pitchWareSpeed || 0,
    pitchType: commentaryData?.pitchType || 0,
    lawnStriping: commentaryData?.lawnStriping || 0,
    pitchAge: commentaryData?.pitchAge || 0,
    session: commentaryData?.session || "",
    battingCondition: pitchData?.battingCondition || "",
    pitchCondition: pitchData?.pitchCondition || "",
    paceBowlingCondition: pitchData?.paceBowlingCondition || "",
    spineBowlingConniton: pitchData?.spineBowlingConniton || "",
    weatherCondition: weatherDetails?.weatherCondition || "",
    // description: weatherDetails?.description || "",
    temp: weatherDetails?.temp || null,
    humidity: weatherDetails?.humidity || null,
    visibility: weatherDetails?.visibility || null,
    windSpeed: weatherDetails?.windSpeed || null,
    clouds: weatherDetails?.clouds || null,
  }
} 
const getComDataByCId = async (data, request, fastify) => {
  let com = global.tblCommentaries.find(
    (item) => item?.commentaryId === data.commentaryId
  );
  if (!com) {
    throw new Error("Commentary with this id not Found");
  }
  let rno = 0;
  let type = null;
  let status = com.commentaryStatus;
  if (status != 4 && status != 1 && status != 10) {
    type = "live";
  } else if (status == 4 || status == 10) {
    type = "completed";
  } else if (status == 1) {
    type = "scheduled";
  }
  const isRun = type == "scheduled" || "completed" ? false : true;
  let crr, rrr, batid, ballid;
  let eventType = await global.tblEventTypes.find(
    (e) => e.eventTypeId == com.eventTypeId
  );
  let competition = await global.tblCompetitions.find(
    (c) => c.competitionId == com.competitionId
  );
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.find(
    (team) =>
      team.commentaryId === com.commentaryId &&
      team.teamId === com.team1Id &&
      team.currentInnings === com.currentInnings
  );

  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (team) =>
      team.commentaryId === com.commentaryId &&
      team.teamId === com.team2Id &&
      team.currentInnings === com.currentInnings
  );
  let teamScore1, teamScore2, t1bg, t1co, t2bg, t2co;
  if (commentaryTeamsOne) {
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    t1bg = commentaryTeamsOne.backgroundColor || "";
    t1co = commentaryTeamsOne.teamColor || "";
  }

  if (commentaryTeamsTwo) {
    t2sn = commentaryTeamsTwo.shortName;
    t2n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsTwo.teamWicket === null
        ? 0
        : commentaryTeamsTwo.teamWicket;
    const overs1 =
      commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    t2bg = commentaryTeamsTwo.backgroundColor || "";
    t2co = commentaryTeamsTwo.teamColor || "";
  }
  const team1 = await global.tblTeams.find(
    (team) => team.teamId == com.team1Id
  );
  const team2 = await global.tblTeams.find(
    (team) => team.teamId == com.team2Id
  );
  if (type == "scheduled") {
    crr = 0;
    rrr = 0;
  } else {
    if (commentaryTeamsOne.teamStatus == 1) {
      crr = parseFloat(commentaryTeamsOne.crr);
      rrr = parseFloat(commentaryTeamsTwo.rrr);
      batid = commentaryTeamsOne.teamId;
      ballid = commentaryTeamsTwo.teamId;
    } else {
      crr = parseFloat(commentaryTeamsTwo.crr);
      rrr = parseFloat(commentaryTeamsTwo.rrr);
      batid = commentaryTeamsTwo.teamId;
      ballid = commentaryTeamsOne.teamId;
    }
  }
  const TossTeamName = await global.tblCommentaryTeams.find(
    (t) =>
      t.commentaryId == com.commentaryId &&
      t.teamId == com.tossWonBy &&
      t.currentInnings == com.currentInnings
  );
  let toss = "";
  if (com.choseTo) {
    toss = com.choseTo == 1 ? "BAT" : "BOWL";
  }
  const weatherAndPitchData = await comWeatherAndPitchData(com.commentaryId);
  let comDetails = {
    rno: rno,
    cid : com.commentaryId,
    eid: com.eventRefId || "",
    ety: eventType?.eventType || "",
    matchTypeId: com.matchTypeId || null,
    mtyp: com.matchType || "",
    hmtyp: com.historyMatchType || "",
    com: competition?.competition || "",
    ci: com.currentInnings,
    en: com.eventName || "",
    ed: convertDate(com.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(com.eventDate, "hh:mm:ss") || "",
    utc: com.eventDate,
    twonby: TossTeamName?.teamName || null,
    choseto: toss || null,
    te1n: commentaryTeamsOne?.teamName || "",
    te2n: commentaryTeamsTwo?.teamName || "",
    s1n: commentaryTeamsOne?.shortName || "",
    s2n: commentaryTeamsTwo?.shortName || "",
    te1i: team1?.image || "",
    te2i: team2?.image || "",
    t1jr: team1?.jersey || "",
    t2jr: team2?.jersey || "",
    nte1i: team1?.imagePath || "",
    nt1jr: team1?.jerseyPath || "",
    nte2i: team2?.imagePath || "",
    nt2jr: team2?.jerseyPath || "",
    loc: com.location || "",
    isrun: isRun,
    t1s: teamScore1 || "",
    t2s: teamScore2 || "",
    dis: com.displayStatus || "",
    rmk: com.rmk || "",
    winRmk: com.winRmk || "",
    cardType: com.cardType,
    tossRmk: com.tossRmk || "",
    winNm: com?.winnerName || "",
    winId: com?.winnerId || 0,
    te1crr: parseFloat(commentaryTeamsOne.crr) || 0,
    te2crr: parseFloat(commentaryTeamsTwo.crr) || 0,
    te1rrr: parseFloat(commentaryTeamsOne.rrr) || 0,
    te2rrr: parseFloat(commentaryTeamsTwo.rrr) || 0,
    crr: crr || 0,
    rrr: rrr || 0,
    cst: com.commentaryStatus,
    res: com.result || "",
    type,
    batid: batid || null,
    ballid: ballid || null,
    t1id: com.team1Id || null,
    t2id: com.team2Id || null,
    t1bg: t1bg || "",
    t1co: t1co || "",
    t2bg: t2bg || "",
    t2co: t2co || "",
    compId: competition?.competitionId || 0,
    isPr: com.isPredictMarket,
    ics: com.isClientShow,
    isTest: com.isTest,
    isActive: com.isActive,
    etyId: eventType?.eventTypeId,
    eventNo: com?.eventNo,
    ...weatherAndPitchData,
  };
  return comDetails;
};

const getCombineFullScore = (score = null, overs = null) => {
  if (!score || !overs) return "";
  const newScore = score.split("/");
  return `${newScore[0]}-${newScore[1]} (${overs})`;
}

const oversToBalls = (overs) => {
  const [over, balls] = String(overs || "0").split(".").map(Number);
  const validBalls = (balls >= 0 && balls <= 6) ? balls : 0; // safety check
  return (over * 6) + validBalls;
};

const ClientAPIType = {
  Insert: 1,
  Update: 2,
  Delete: 3,
  ChangeDisplayOrder: 4,
}

const normalizeText = (value) => {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // collapse multiple spaces
};

const normalizeCompetitionSeasonName = (competitionName) => {
  return normalizeText(competitionName).replace(/\s*\(?\d{4}([-/]\d{2,4})?\)?$/, "");
};

const getOverCalculation = (totalOvers) => {
  totalOvers = Number(totalOvers);
  if (!totalOvers) return null;
  if (totalOvers === 10) {
    return {
      powerplay: [0, 2],
      middle: [3, 5],
      death: [6, 9]
    };
  } else if (totalOvers === 20) {
    return {
      powerplay: [0, 5],
      middle: [6, 14],
      death: [15, 19]
    };
  } else if (totalOvers === 50) {
    return {
      powerplay: [0, 9],
      middle: [10, 39],
      death: [40, 49]
    };
  } else if (totalOvers === 100) {
    return {
      powerplay: [0, 24],
      middle: [25, 74],
      death: [75, 99]
    };
  } else {
    return null;
  }
}

const getDataFromTime = (data, globalType, startDate = "startDate", endDate = "endDate") => {
  const now = Date.now();
  return data.filter(item => {
    if (item.isPermanent) return true;

    const start = new Date(item[startDate]).getTime();
    const end = new Date(item[endDate]).getTime();
    const result = start <= now && end >= now;

    if (!result) {
      global[globalType].push(item);
    }

    return result;
  });
}

const checkDataSendToClient = (data, startDate = "startDate", endDate = "endDate") => {
  if (!data?.isActive) return false;

  if (data.isPermanent) return true;

  const now = Date.now();

  return (
    new Date(data[startDate]).getTime() <= now &&
    new Date(data[endDate]).getTime() >= now
  );
}

const getGlobalMemoryDataService = async (request, fastify) => {
  const { keyname, ...rest } = request.body;
  if (!keyname) {
    throw new Error("Keyname is required");
  }

  console.log("🚀 ~ getGlobalMemoryDataService ~ rest:", rest, Object.keys(rest).length === 0)
  if (Object.keys(rest).length === 0) {
    return {
      message: global[keyname] ? "Data retrieved successfully" : "No data found for the provided keyname",
      length: global[keyname]?.length || 0,
      data: global[keyname] || null
    };
  }

  const filteredData = (global[keyname] || []).filter(item => {
    return Object.entries(rest).every(([filterKey, filterValue]) => {
      if (filterValue === undefined || filterValue === null) return true;
      return item[filterKey] === filterValue;
    });
  });

  return {
    message: filteredData.length > 0 ? "Data retrieved successfully" : "No data found for the provided keyname and filters",
    length: filteredData.length,
    data: filteredData
  };
}

module.exports = {    
  ERROR_CODES,
  error,
  success,
  deviceInfo,

  hashFunction,
  encryptedObject,
  encrypt,
  decrypt,
  // generateFileName,
  isJson,
  getTitle,
  getMessage,
  getUserChildIds,
  convertDate,
  wicketType,
  decryptEncryptionId,
  EventMarketStatus,
  callPredictorMarket,
  MarketActionType,
  MarketUpdateType,
  ActionTypeForMarketCancel,
  genrateKey,
  clientSocketStatus,
  clientSocketActionType,
  fetchDataForClient,
  callDataProvider,
  ServiceType,
  APIEndpointModuleType,
  EventMarketRateSource,
  callfds,
  formatDateToISOString,
  formatDateToISOStringwithOffset,
  callClientAPI,
  NotificationSendType,
  sendNotificationByType,
  pageLimit,
  getPagination,
  clientProvider,
  typesOfServices,
  templateModel,
  templateType,
  getIpAddress,
  thirdPartyApiType,
  commentaryStatus,
  LineType,
  MarketTypeId,
  newsType,
  VideoLibraryType,
  ModuleTypes,
  callTPAPI,
  MarketTypeCategories,
  clientProcessStatus,
  sendOtpToMobile,
  verifyOTP,
  forgotPasswordOTP,
  resendOTP,
  IntervalType,
  EventName,
  generateEventId,
  ClientInfoLoginType,
  CompetitionType,
  Weather,
  PitchCracks,
  PitchWareSpeed,
  PitchHardness,
  PitchType,
  LawnStriping,
  PitchAge,
  BALL_TYPE,
  playerSwitchObj,
  wicketTypeObj,
  inningSwitch,
  playerType,
  teamStatus,
  Cards,
  HideEventType,
  virtualSuccess,
  virtualError,
  callEntitySportAPI,
  comCardType,
  EntityEnums,
  compStatus,
  callCardCricket,
  GlobalModuleType,
  StoreTypes,
  trimTextData,
  matchTypesEntity,
  callVirtualPredictorMarket,
  matchStatusEntity,
  entityCompetition,
  ScoringTypes,
  RefType,
  SourceID,
  exchangeMatchinfoAPI,
  ICCRankingType,
  ICCRankingPlayerType,
  UndoReportType,
  callSocketCountClientAPI,
  ICCRankingPlayerTypeById,
  inningStatus,
  EntityCommentaryStatus,
  teamRemarkType,
  extractGroupDataFromArray,
  EntityPlayerType,
  EntityBowlingStyleType,
  extractBowlingStyle,
  EventType,
  parseUmpires,
  ICCMatchType,
  playersMergeImageService,
  roundToNearestMinutes,
  GAME_STATUS,
  CompetitionStatisticsType,
  etWicketObj,
  getKeyAndValueKey,
  competitionMatchTypeEnum,
  EntityMatchStatus,
  awardTypes,
  lowerEntityMatchTypesEnums,
  getInningWiseDataFromEntity,
  getComDataByCId,
  getCombineFullScore,
  EntityInningsStatus,
  oversToBalls,
  ClientAPIType,
  normalizeText,
  normalizeCompetitionSeasonName,
  getOverCalculation,
  getDataFromTime,
  pushSessionData,
  checkDataSendToClient,
  getGlobalMemoryDataService
};

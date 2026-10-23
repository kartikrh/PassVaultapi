const uaParser = require("ua-parser-js");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const configConstants = require("./configConstants");
const { errorLogger } = require("./logger");
const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  SERVER_ERROR: "SERVER_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_TOKEN: "INVALID_TOKEN",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  REVISION_CONFLICT: "REVISION_CONFLICT",
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
// Function to generate a success response object
const success = (result, status) => {
  return {
    success: true,
    status: status,
    result: result,
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

const convertStringToBuffer = (str) => {
  const buf = Buffer.alloc(32); // 256-bit buffer
  buf.write(str, "utf-8"); // Fill buffer with string
  return buf;
};

const algorithm = "aes-256-ecb"; // ECB mode (not recommended for most cases)

// Looked up lazily (not at module load) because global.tblConfigs is only
// populated after fetchAllDataFromDb() runs at startup -- reading it eagerly
// would run before that data exists. Also picks up admin edits to the
// Config screen without a restart.
const getConfigValue = (key) => {
  return global.tblConfigs?.find((item) => item.key === key)?.value;
};

const getEncryptionKey = () => {
  const value = getConfigValue(configConstants.ENCRYPTION_KEY);
  if (!value) {
    throw new Error(
      `Encryption key config "${configConstants.ENCRYPTION_KEY}" not found in tblConfigs`
    );
  }
  return convertStringToBuffer(value);
};

function encrypt(input) {
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), Buffer.alloc(0)); // Using ECB mode, so IV is empty
  let encrypted = cipher.update(input, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, getEncryptionKey(), Buffer.alloc(0)); // Using ECB mode, so IV is empty
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
  onlyLoggedOutUser: 4,
  pushNotificationAndOnlyLoggedInUser: 5,
  pushNotificationAndOnlyLoggedOutUser: 6,
  onlyLoggedInUserAndLoggedOutUser: 7,
};
const SOCKET_EVENTS = {
  ALL: "onSendNotificationToAll",
  LOGGED_IN: "onSendNotificationToLoggedInUser",
  LOGGED_OUT: "onSendNotificationToLoggedOutUser",
  LOGGED_IN_AND_LOGGED_OUT: "onSendNotificationToLoggedInAndLoggedOutUser",
};
const sendNotificationByType = async (data, request, fastify) => {
  try {
    let eventName;
    switch (data.sendType) {
      case NotificationSendType.all:
        eventName = SOCKET_EVENTS.ALL;
        break;
      case NotificationSendType.onlyLoggedInUser:
        eventName = SOCKET_EVENTS.LOGGED_IN;
        break;
      case NotificationSendType.onlyLoggedOutUser:
        eventName = SOCKET_EVENTS.LOGGED_OUT;
        break;
      case NotificationSendType.onlyLoggedInUserAndLoggedOutUser:
        eventName = SOCKET_EVENTS.LOGGED_IN_AND_LOGGED_OUT;
        break;
      case NotificationSendType.pushNotificationAndOnlyLoggedInUser:
        eventName = SOCKET_EVENTS.LOGGED_IN;
        break;
      case NotificationSendType.pushNotificationAndOnlyLoggedOutUser:
        eventName = SOCKET_EVENTS.LOGGED_OUT;
        break;
      case NotificationSendType.pushNotification:
        // eventName = "onSendPushNotification";
        // Mobile/FCM push notifications (news, video, and generic) removed
        // along with GOOGLE_SERVICE_ACCOUNT_JSON. Browser Web Push (the other
        // half of what used to be WebPushHandler/) was removed too -- neither
        // had a live caller.
        return true;
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
const templateModel = {
  MobileNo: 1,
  Email: 2,
};
// Email sub-types for templateModel.Email rows -- see PassVaultpanel's
// AddTemplate.jsx (Template Type = Email -> Type dropdown) and
// utilities/templateMailer.js (looks these up in global.tblTemplate to
// build the actual outbound emails for registration/sign-in/2FA reset).
const templateType = {
  Welcome: 1,
  SignIn: 2,
  Reset2FA: 3,
  DayEndActivity: 4,
};
const newsType = {
  news: 1,
  article: 2,
};
// request.ip already resolves X-Forwarded-For through app.js's trustProxy;
// reading the header directly would let clients spoof their IP.
const getIpAddress = (req) => req.ip || req.raw?.socket?.remoteAddress;
const commentaryStatus = {
  OPEN: 1,
  TOSSDONE: 2,
  INPROGRESS: 3,
  COMPLETED: 4,
  INNINGCHANGE: 5,
  CANCELLED: 10,
  ABANDONED: 11
};
const VideoLibraryType = {
  OUR: 1,
  YOUTUBE: 2,
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
  Advertise: 47,
  Viewers: 48,
  PaymentMethods: 49
};
const IntervalType = {
  DAY: 1,
  MONTHLY: 2,
  YEARLY: 3,
};

// A package's wrIntervalType/wrIntervalCount (e.g. MONTHLY x 3) doubles as
// its validity length -- this is how long a client's assignment to that
// package lasts, computed from the moment it's assigned. See
// repository/TableClient.js's insertClientQuery/updateClientPackageQuery.
const computePackageExpiryDate = (intervalType, intervalCount, fromDate = new Date()) => {
  const unit =
    intervalType === IntervalType.DAY ? "days" : intervalType === IntervalType.YEARLY ? "years" : "months";
  return moment(fromDate).add(Number(intervalCount) || 0, unit).toDate();
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
const EventType = {
   Cricket: 1,
   Soccer: 2,
}

const ClientAPIType = {
  Insert: 1,
  Update: 2,
  Delete: 3,
  ChangeDisplayOrder: 4,
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
  encrypt,
  decrypt,
  getConfigValue,
  isJson,
  getTitle,
  getMessage,
  getUserChildIds,
  wicketType,
  clientSocketStatus,
  clientSocketActionType,
  ServiceType,
  APIEndpointModuleType,
  callClientAPI,
  NotificationSendType,
  sendNotificationByType,
  pageLimit,
  getPagination,
  templateModel,
  templateType,
  getIpAddress,
  commentaryStatus,
  newsType,
  VideoLibraryType,
  ModuleTypes,
  IntervalType,
  computePackageExpiryDate,
  GlobalModuleType,
  StoreTypes,
  callSocketCountClientAPI,
  EventType,
  ClientAPIType,
  getDataFromTime,
  checkDataSendToClient,
  getGlobalMemoryDataService,
};

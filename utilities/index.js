const uaParser = require("ua-parser-js");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const configConstants = require("./configConstants");
const { errorLogger, tblPredictorAPILogger ,tblThirdPartyAPILogger} = require("./logger");
const { getCommentaryDetailByIdQuery } = require("../repository/TableCommentary");
const { sendNotification } = require("../WebPushHandler");
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

const generateFileName = () => {
  let timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  let random = ("" + Math.random()).substring(2, 8);
  return timestamp + random;
};

const isJson = (json) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
}

const getTitle = (str) => {
  try {
    str = str.split("?")[0]
    if (str === "signin") return "Sign In"
    else if (str === "signout") return "Sign Out"
    else if (str === "signup") return "Sign Up"
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase())
  } catch (err) {
    console.log(`Error while generating title for ${str}`);
    return "";
  }
}

const getMessage = (payload, code, type) => {
  const sendErrorMessage = (defaultMessage) => {
    let message = typeof payload?.error === "string" ? payload.error : payload?.error?.message;
    if (!message) message = defaultMessage;
    return message;
  }
  const generateMessage = (title, action = "") => {
    const isError = payload?.error;
    return isError ? sendErrorMessage(`${title}${" " + action} failed`) : `${title}${" " + action} successfully`
  }
  switch (code) {
    case 500:
      return sendErrorMessage(`Internal Server Error`)
    case 200:
      let message = typeof payload?.result === "string" ? payload.result : payload?.result?.message;
      if (payload?.error) {
        message = sendErrorMessage("Something Went Wrong");
      }
      if (!message) {
        if (type === "signin" || type === "signup") {
          message = generateMessage(payload.title);
        } else if (type === "save" || type === "create" || type === "saveDetails") {
          message = generateMessage(payload.title, "saved");
        } else if (type.includes('delete')) {
          message = generateMessage(`${payload.title}(s)`, "delete");
        } else {
          message = generateMessage(payload.title, "fetched");
        }
      }
      return message
    case 400:
      return sendErrorMessage(`Invalid Request`)
    case 403:
      return sendErrorMessage(`Unauthorized Access`)
    default:
      return sendErrorMessage(`Something Went Wrong with status ${code}`)
  }
}

function getUserChildIds(parentId, data) {
  const result = [];

  function findChildren(currentId) {
    const children = data
      .filter(item => item.parentId === currentId)
      .map(item => item.userId);

    children.forEach(child => {
      result.push(child);
      findChildren(child);
    });
  }

  findChildren(parentId);
  return result;
}
const convertDate = (date, format) =>{
  if (date) {
    if (format) return moment(date).local().format(format);
    return  moment(date).local().format("DD/MM/YYYY hh:mm:ss a");
  }
  return "";
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
  10: "Obstruct the Fielding"
}
const decryptEncryptionId = async (encryptionKey , fastify) =>{
 try {
  const data = await fastify.db.query(`SELECT "wrKey" from "tblEncryptedData" where "wrValue" = $1`,
  {
    type: fastify.db.QueryTypes.SELECT,
    bind: [encryptionKey]
  })

  return data[0].wrKey;
 } catch (error) {
  throw new Error(error);
 }
}
const EventMarketStatus = {
  NotOpen :	0,
  Open:	1,
  Inactive:	2,
  Suspend:	3,
  Close:	4,
  Settled	:5,
  Cancel:	6,
  WIN : 7,
  LOSE : 8,
}

const EventMarketRateSource = {
  Manual :	2,
}
const MarketActionType = {
  isresultSet : 1,
  setResult : 2,
  marketCancel : 3,
  closeMarket : 4,
  closeMarketOnTossWin : 5,
  setAndFinalizeResult:6,
  setResultAndIsResultFalse :7,
  allMarketClose : 8,
  dlsMarketClose : 9,
  dlsMarketCloseCancel : 10,
  closeMarketOnDLSChange : 11,
}
const callPredictorMarket = async (data , endpoint ,fastify ,request) =>{
  let requestStartTime = new Date();
  let loggerConfig = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICTORLOGGER).value;
  try {
    const predictorURL = global.tblConfigs.find((item) => item.key === configConstants.MARKET_PREDICTOR).value;
    const url = `${predictorURL}${endpoint}`;
    const result = await axios.post(url, {
      ...data
    });

    if (loggerConfig == "true"){
      tblPredictorAPILogger(
        {
          endPoint : endpoint,
          requestBody : data,
          requestStartTime : requestStartTime,
          requestEndTime : new Date(),
          response : result.data
        },
        request,
        fastify
      );
    }
    return result;
  } catch (error) {
    if(loggerConfig == "true"){
      tblPredictorAPILogger(
        {
          endPoint : endpoint,
          requestBody : data,
          requestStartTime : requestStartTime,
          requestEndTime : new Date(),
          response : error.message
        },
        request,
        fastify
      );
      return error.message;
    }
    // throw new Error(error.message);
  }

}

//fraud check Api
const callfds = async (data , endpoint ,fastify ,request) =>{
  let requestStartTime = new Date();
  try {
    const now = new Date();
    let formattedDate;
    try {
      const offset = global.tblConfigs.find((item) => item.key === configConstants.SERVER_OFFSET_TIMEZONE).value;
      if(offset){
        formattedDate = formatDateToISOStringwithOffset(now, offset);
      }
      else{
        formattedDate = formatDateToISOString(now);  
      }
    } catch (error) {
      formattedDate = formatDateToISOString(now);  
    }
    data.BWDateTime = formattedDate.toString();
    const fdsURL = global.tblConfigs.find((item) => item.key === configConstants.FRAUDDET_DECTIONAPI).value;
    if(fdsURL){
      const url = `${fdsURL}${endpoint}`;
      const result = await axios.post(url, {
        ...data
      });

      await tblThirdPartyAPILogger(
        {
          endPoint : endpoint,
          requestBody : data,
          requestStartTime : requestStartTime,
          requestEndTime : new Date(),
          response : result.data
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
        endPoint : endpoint,
        requestBody : data,
        requestStartTime : requestStartTime,
        requestEndTime : new Date(),
        response : error.message
      },
      request,
      fastify
    );
    // throw new Error(error.message);
  }
}

const formatDateToISOString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const formatDateToISOStringwithOffset = (date, offset) => {
  // Parse the offset to extract hours and minutes
  const sign = offset[0] === '-' ? -1 : 1;
  const [hours, minutes] = offset.slice(1).split(':').map(Number);
  const totalOffsetMilliseconds = sign * (hours * 60 + minutes) * 60 * 1000;
  
  // Adjust the date by the total offset in milliseconds
  const adjustedDate = new Date(date.getTime() + totalOffsetMilliseconds);

  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
  const day = String(adjustedDate.getDate()).padStart(2, '0');
  const hoursStr = String(adjustedDate.getHours()).padStart(2, '0');
  const minutesStr = String(adjustedDate.getMinutes()).padStart(2, '0');
  const seconds = String(adjustedDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hoursStr}:${minutesStr}:${seconds}`;
};

const MarketUpdateType = {
  marketInitilization : 1,
  predictMarket : 2,
  marketViewer : 3,
  marketUpdateRate : 4,
  isSendDataUpdate : 5,
}
const ActionTypeForMarketCancel ={
  winClose : 1,
  winCloseCancel : 2,
  winMustClose : 3,
  winMustCloseCancel : 4,
  dlsCloseMarket : 5,
  dlsCloseCancelMarket : 6
}
const genrateKey = () => {
  // Define the format pattern
  const format = "XXXX-XXXX-XXXX-XXXX";
  const key = format.replace(/[^\d-]/g, () => Math.floor(Math.random() * 10));
  return key;
}
const clientSocketStatus = {
  none : 0,
  connected : 1,
  disconnected : 2,
  reconnected : 3
}
const clientSocketActionType = {
  connect : 1,
  disconnect : 2,
  reconnect : 3,
}
const fetchDataForClient = async (fastify, reply) => {
  const clientUrl = global.tblConfigs.find((item) => item.key === configConstants.SCORECLIENTAPIURL).value;
  if(!clientUrl) return 'Client URL not found';
  const result = await axios.post(`${clientUrl}/loadData` ,{}) ;
  console.log(result.data);
  return result.data;
}
const callDataProvider = async (data, fastify) =>{
  try {
    // return true;
    /// find the service which have the type of dataProviderAPI
    let services = global.tblAPIs.filter((item) => item.type == data.serviceType && item.isActive == true);
    for (ser of services){
      // find the endpoint for the service and module
      let endpoint = global.tblAPIEndpoints.find((item)=>
        item.serviceType == ser.type && item.moduleType == data.moduleType && item.isActive == true
      ) 
      if(endpoint){
        let url = `${ser.api}${endpoint.endPoint}`;
        let dataTosend = {};
        if(data.moduleType == APIEndpointModuleType.commentaryUpdate && data.serviceType == ServiceType.dataProviderAPI){
          if(data.type == "delete"){
            dataTosend = {
              commentaryId : data.commentaryId
            }
          }
          else {
            dataTosend = await getCommentaryDetailByIdQuery(data, fastify);
          }

          dataTosend = {
            ...dataTosend,
            type : data.type
          };
        }
        else if(data.moduleType == APIEndpointModuleType.vendorUpdate && data.serviceType == ServiceType.dataProviderAPI
          || data.moduleType == APIEndpointModuleType.vendorIpUpdate && data.serviceType == ServiceType.dataProviderAPI)
        {
          dataTosend = {
            ...data.data,
            type : data.type
          };
        }
        
        const result = await axios.post(url, {
          ...dataTosend
        });
        return result;
      }
      else {
        console.log("Endpoint not found for service type : ", ser.type, " and module type : ", data.moduleType);
        return;
      }
    }

    return true  
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callDataProvider",
      null
    );
    
    console.log("error From callDataProvider", error);
  }
}
const callClientAPI = async (data,request, fastify) =>{
  try {
    let clientServices = global.tblAPIs.filter((item) => item.type == data.serviceType && item.isActive == true);
    if(clientServices.length == 0){
      return true;
    }
    for (ser of clientServices){
      let endPoint = global.tblAPIEndpoints.find((item)=> item.serviceType == ser.type && item.moduleType == data.moduleType &&
        item.isActive == true)
      if(endPoint){
        let url = `${ser.api}${endPoint.endPoint}`;
        let dataTosend = data.data;
        const result = await axios.post(url, {
          ...dataTosend
        });
        return result;
      }
      else {
        console.log("Endpoint not found for service type : ", ser.type, " and module type : ", data.moduleType);
        return;
      }
    }
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callClientAPI",
      request
    );
    // throw new Error(error.message);
  }
}
const ServiceType = {
  clientAPI : 1,
  dataProviderAPI : 2,
}
const APIEndpointModuleType = {
  commentaryUpdate : 1,
  vendorUpdate : 2,
  vendorIpUpdate : 3,
  updateConfig : 4,	
  updateBanner: 5,
  updateSeoModule : 6,
  updateMenuList : 7,
}
const NotificationSendType = {
  all : 1,
  onlyLoggedInUser : 2,
  pushNotification : 3
}
const sendNotificationByType =async (data , request , fastify) =>{
  try {
    let eventName;
    switch(data.sendType){
      case NotificationSendType.all:
        eventName = "onSendNotificationToAll";
        break;
      case NotificationSendType.onlyLoggedInUser:
        eventName = "onSendNotificationToLoggedInUser";
        break;
      case NotificationSendType.pushNotification:
        // eventName = "onSendPushNotification";
        sendNotification(
          data.title,
          data.description,
          data.url,
          data.image,
          data.icon
        );
        return true;
        break;
    }
    // saveNotificationLogsQuery(data,request, fastify);
    if( 
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ){
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit(eventName, data);
      });
    }
    else {
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
}
const pageLimit = {
  notifcationLog : {
      limit : 20
  }
}
const getPagination = (page = 1, size = 20) => {
  if (page < 1 || size < 1) {
    throw new Error("Page number and page size must be greater than zero.");
  }
  const skip = (page - 1) * size;
  const take = size;

  return {
    skip ,
    take 
  }
}
const clientProvider = {
  Manual : 1,
  Google : 2,
  Facebook : 3,
}
const typesOfServices = {
  GmailService: 'gmail',
  SmtpService: 'smtp',
}

const templateModel = {
  MobileNo : 1,
  Email : 2,
}
const templateType = {
  Welcome : 1,
  Verify : 2,
  NewsLetter : 3
}
const newsType = {
  news : 1,
  article : 2,
}
const getIpAddress = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || request.raw.connection.remoteAddress;
  return ip;
}
const thirdPartyApiType = {
  Socket : 1,
  API : 2
}
const commentaryStatus = {
  OPEN : 1,
  TOSSDONE : 2,
  INPROGRESS : 3,
  COMPLETED : 4,
}
const LineType = {
  BackLay:	1,
  Lay: 2,
}
const VideoLibraryType = {
  OUR:	1,
  YOUTUBE: 2,
}
const MarketTypeId = {
  "Market": 1,
  "Bookmarkers" : 3,
  "ManualOdds" : 5,
  "Fancy" : 2,
  "LineMarket" : 4,
  "MeterPari" : 6,
  "Sportbook" : 7,
}
const MarketTypeCategories = {
  "MARKET": 5,
  "WINTOSS": 6,
  "BOOKMAKERS": 7,
  "MANUALODDS": 8,
  "ADVFANCY": 9,
  "OVERSESSION": 10,
  "ONLYOVER": 11,
  "PLAYER": 12,
  "WICKET": 13,
  "BOWLERSESSION": 14,
  "PREMIUMODDS": 15,
  "TIE": 16,
  "LINEMARKET": 17,
  "OVERUNDER": 18,
  "PLAYERODDS": 20,
  "BOUNDARYODDS": 21,
  "OTHERODDS": 22,
  "SESSION": 23,
  "EXTRAODDS": 24,
  "SPECIALODDS": 25,
  "FANCYLDO": 26,
  "ONLYOVERLDO": 27,
  "LASTDIGITNUMBER": 28,
  "PLAYERBOUNDARIES": 29,
  "PLAYERBALLSFACED": 30,
  "FALLOFWICKET": 31,
  "PARTNERSHIPBOUNDARIES": 32,
  "WICKETLOSTBALLS": 33,
  "ODDEVEN": 35,
  "TOTALEVENTRUN": 36
}

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
}
const callTPAPI = async (data ,fastify) =>{
  try {
    // check if the third party api is enabled or not
    let isCallThirdParty = global.tblConfigs.find((item) => item.key === configConstants.ISCALLTHIRDPARTY)?.value;
    if(isCallThirdParty == undefined){
      return true;
    }
    if(isCallThirdParty == "false"){
      return true;
    }
    if(isCallThirdParty == "true"){
      const thirdPartyAPI = global.tblConfigs.find((item) => item.key === configConstants.THIRDPARTYAPIENDPOINT)?.value;
      if(thirdPartyAPI == undefined){
        return true;
      }
      const header = global.tblConfigs.find((item) => item.key === configConstants.THIRDPARTYKEY)?.value;
      if(header == undefined){
        return true;
      }
      await axios.post(thirdPartyAPI, {
        eventRefId : data.eventRefId,
        betAllow : data.betAllow,
      },{
        headers: {
          'Authorization': header
        }
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
  generateFileName,
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
  MarketTypeCategories
};

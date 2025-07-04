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
const virtualError = (message, errorCode, status) => {
  return {
    success: false,
    status: status,
    // error: {
    //   code: errorCode,
    //   message: message || "Internal Server Error",
    // },
    message: message || "Internal Server Error",
    data: null
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
    message : "Success",
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
  virtualMarketCancel : 12,
}
const callPredictorMarket = async (data , endpoint ,fastify ,request, pythonURI = null) =>{
  let requestStartTime = new Date();
  let loggerConfig = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICTORLOGGER).value;
  try {
    // let predictorURL = global.tblConfigs.find((item) => item.key === configConstants.MARKET_PREDICTOR)?.value;
    // if(isVirtual == true){
    //   // If commentary is virtual, use the virtual predictor URL
    //   predictorURL = global.tblConfigs.find((item) => item.key === configConstants.VIRTUALMARKETPREDICTOR)?.value;
    // }
    let predictorURL = pythonURI;
    if(!predictorURL){
      errorLogger(
        fastify,
        "Predictor URL not found",
        "DB ERROR --> utilities/index/callPredictorMarket",
        request
      )
      return true
    }
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
          response : {
            error : error.message,
            type : "error"
          }
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
  entitySport : 3,
}
const APIEndpointModuleType = {
  commentaryUpdate : 1,
  vendorUpdate : 2,
  vendorIpUpdate : 3,
  updateConfig : 4,	
  updateBanner: 5,
  updateSeoModule : 6,
  updateMenuList : 7,
  configUpdate: 8,
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
  INNINGCHANGE : 5,
  CANCELLED : 10
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
  "TOTALEVENTRUN": 36,
  "TOPBOWLER": 37,
  "TOPBATSMAN": 38,
  "MIDSESSION": 39,
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
  CountryCode: 37,
  NotificationConfig: 38,
  Packages: 39,
  Whitelabel: 40,
  Venue: 41,
  CommentaryById: 42,
  PythonAPI: 43,
}
const callTPAPI = async (data ,fastify) =>{
  try {
    // check if the third party api is enabled or not
    let isCallThirdParty = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.ISCALLEVENTALLOWORDERAPI.toLowerCase())?.value;
    if(isCallThirdParty == undefined){
      return true;
    }
    if(isCallThirdParty == "false"){
      return true;
    }
    if(isCallThirdParty == "true"){
      const thirdPartyAPI = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.EVENTALLOWORDERAPI.toLowerCase())?.value;
      if(thirdPartyAPI == undefined){
        return true;
      }
      // const header = global.tblConfigs.find((item) => item.key === configConstants.THIRDPARTYKEY)?.value;
      // if(header == undefined){
      //   return true;
      // }
      await axios.post(thirdPartyAPI, {
        eventID : data.eventRefId,
        isAllow : data.betAllow,
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
const clientProcessStatus = {
  ADDUSERDETAIL : 1,
  MOEMAILVERIFIED : 2,
  PASSWORDSET : 3,
}
const sendOtpToMobile = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find((item) => item.id === data.id)?.mobileOTPSendUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPURL.toLowerCase())?.value;
    if(!url) return 'OTP URL not found';
    // call this otp url to send otp to mobile
    // replace {mobile} with the mobile number
    //remove + from country code
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.post(url);
    console.log(result)
    if(result.data.type == "success"){
      return true;
    }
    else {
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
}
const verifyOTP = async (data, request, fastify) => {
  try {
    let config = global.tblWhitelabels.find((item) => item.id === data.id);
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPVERIFY.toLowerCase())?.value;
    // let otpAuthKey = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPAUTHKEY.toLowerCase())?.value;
    if(!config || !config.mobileOTPVerify || !config.mobileOTPAuthKey) return 'OTP Verify URL not found';
    let cc = data.countryCode.replace("+", "");
    const mobileNumber = cc + data.mobileNo;
    // url = url.replace("{otp}", data.otp);
    // url = url.replace("{mobile}", cc + data.mobileNo);
    let otpUrl = config.mobileOTPVerify
      .replace("{otp}", encodeURIComponent(data.otp))
      .replace("{mobile}", encodeURIComponent(mobileNumber));
    const result = await axios.get(otpUrl, { headers: { authkey: config.mobileOTPAuthKey }});
    if(result.data.type == "success"){
      return true;
    }
    else {
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
}
const forgotPasswordOTP = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find((item) => item.id === data.id)?.mobileOTPForgotUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPFORGOTURL.toLowerCase())?.value;
    if(!url) return 'OTP URL not found';
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.post(url);
    if(result.data.type == "success"){
      return true;
    }
    else {
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
}
const resendOTP = async (data, request, fastify) => {
  try {
    let url = global.tblWhitelabels.find((item) => item.id === data.id)?.mobileOTPResendUrl;
    // let url = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.OTPRESEND.toLowerCase())?.value;
    if(!url) return 'OTP URL not found';
    let cc = data.countryCode.replace("+", "");
    url = url.replace("{mobile}", cc + data.mobileNo);
    const result = await axios.get(url, { headers: {} });
    if(result.data.type == "success"){
      return true;
    }
    else {
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
}

const IntervalType = {
  DAY:	1,
  MONTHLY: 2,
  YEARLY: 3
}
const EventName = {
  COMMINGSOON: 1,
  WINTOSS: 2,
  EVENTSTART: 3,
  INNINGCOMPLETED: 4,
  BOUNDARY: 5,
  WICKET: 6,
  EVENTCOMPLETED: 7
}
const generateEventId = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getFullYear().toString().slice(-2)}${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
};

const ClientInfoLoginType = {
  SUCCESS: 1,
  FAILED: 2,
}
const CompetitionType = {
  INTERNATIONAL: 1,
  DOMESTIC: 2,
}
const Weather = {
  RANDOM: 1,
  COLD : 2,
  WARM : 3,
  HOT : 4,
  MILD : 5, 
  
}
const PitchCracks = {
  NONE: 1,
  LIGHT: 2,
  HEAVY: 3,
}

const PitchWareSpeed = {
  NORMAL: 1,
  SLOW: 2,
  FAST: 3,
}
const PitchHardness = {
  SOFT: 1,
  VERYSOFT: 2,
  HARD: 3,
  MEDIUM: 4,
}
const PitchType = {
  1 : "Dry",
  2 : "Grassy/Dusty",
  3 : "Grassy/Dry",
  4 : "Grassy",
  5 : "Dusty",
  6 : "Standard"
}
const LawnStriping = {
  1 : "Cross hatch",
  2 : "Stripe",
  3 : "Vertical",
  4 : "None",
  5 : "Diamond"
}

const PitchAge = {
  1 : "Day 1",
  2 : "Day 2", 
  3 : "Day 3", 
  4 : "Day 4", 
  5 : "Day 5"
}
const playerSwitchObj = {
  SWITCH_BOWLER : "SWITCH_BOWLER",
  CHANGE_BOWLER : "CHANGE_BOWLER",
  BATTER_SWITCH : "BATTER_SWITCH"
}
const wicketTypeObj = {
  BOLD : 1,
  BOLD_LABEL : "Bowled",
  CATCH : 2,
  CATCH_LABEL : "Catch",
  STUMP : 3,
  STUMP_LABEL : "Stump",
  HIT_WICKET : 4,
  HIT_WICKET_LABEL : "Hit Wicket",
  LBW : 5,
  LBW_LABEL : "LBW",
  RUN_OUT : 6,
  RUN_OUT_LABEL : "Run Out",
  RETIRED_OUT : 7,
  RETIRED_OUT_LABEL : "Retired Out",
  TIMED_OUT : 8,
  TIMED_OUT_LABEL : "Timed Out",
  HIT_BALL_TWICE : 9,
  HIT_BALL_TWICE_LABEL : "Hit B. Twice",
  OBSTRACT_THE_FIELDING : 10,
  OBSTRACT_THE_FIELDING_LABEL : "Obst. Field"
}
const inningSwitch = {
   EXTRAS : "EXTRAS",
   OVER : "OVER",
   OVER_ENDED : "OVER_ENDED",
   WICKET : "WICKET",
   RUN : "RUN",
   ALL : "ALL"
}
const playerType = {
  CURRENT_BOWLER : "CURRENT_BOWLER",
  BATTING_TEAM : "BATTING_TEAM",
  BOWLING_TEAM : "BOWLING_TEAM",
  ON_STRIKE :"ON_STRIKE",
  NON_STRIKE : "NON_STRIKE"
}
const teamStatus = {
  BAT_TEAM_STATUS : 1,
  BOWL_TEAM_STATUS :2
}
const Cards = {
  "A" : 1,
  "2" : 2,
  "3" : 3,
  "4" : 4,
  "5" : 5,
  "6" : 6,
  "10" : 0,
  "J" : -1,
  "K" : -2
}
const HideEventType = {
  eventType : 1,
  competition : 2,
  commentary : 3,
}
const callEntitySportAPI = async (data, request, fastify) =>{
  try {
    let competitionServices = global.tblAPIs.filter((item) => item.type == data.serviceType && item.isActive == true);
    if(competitionServices.length == 0){
      return true;
    }
    for (ser of competitionServices){
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
      "DB ERROR --> utilities/index/callEntitySportAPI",
      request
    );
    // throw new Error(error.message);
  }
}
const comCardType = {
  "Heart" : 1,
  "Diamond" :2,
  "Clubs" : 3,
  "Spades" : 4
}
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
    TB10: 20
}
const compStatus = {
  "upcoming" : 1,
  "started" : 2,
  "completed" : 3,
  "stopped" : 4,
}
const callCardCricket = async (data ,request , fastify) =>{
  try {
    // console.log("callCardCricket", data);
    // return true;
    let cardUrl = global.tblConfigs.find((item) => item.key === configConstants.CARDCRICKETURL)?.value;
    if(!cardUrl) return 'Card Cricket URL not found';
    // call this card cricket url to send data
    const result = await axios.post(cardUrl, {
      ...data
    });
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index/callCardCricket",
      request
    )
    // throw new Error(error.message);
  }

}
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
}
const StoreTypes = {
  Insert: 1,
  Update: 2
}
const trimTextData = async (data, request, fastify) => {
  try {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return;
    }
    const trimmedData = {};
    for (const [key, value] of Object.entries(data)) {
      trimmedData[key] = typeof value === "string" ? value.trim() : value;
    }
    return trimmedData
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> utilities/index.js/trimTextData",
      request
    )
  }
}
const callVirtualPredictorMarket = async (data , endpoint ,fastify ,request, pythonURI = null) =>{
  let requestStartTime = new Date();
  let loggerConfig = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICTORLOGGER).value;
  try {
    let predictorURL = pythonURI;
    if(!predictorURL){
      errorLogger(
        fastify,
        "Predictor URL not found",
        "DB ERROR --> utilities/index/callPredictorMarket",
        request
      )
      throw new Error("Predictor URL not found")
    }
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
          response : {
            error : error.message,
            type : "error"
          }
        },
        request,
        fastify
      );
      throw new Error(error.message);
    }
    // throw new Error(error.message);
  }

}
const matchTypesEntity = {
  "ODI": 1,
  "TEST": 2,
  "T20I": 3,
  "List A": 4,
  "First Class": 5,
  "T20": 6,
  "Women ODI": 7,
  "Women T20": 8,
  "Youth ODI": 9,
  "Youth T20": 10,
  "Other": 11,
  "Other List A": 12,
  "Other 1st Class": 13,
  "Other T20": 14,
  "Youth Test": 15,
  "Woman Test": 16,
  "T10": 17,
  "T100": 18,
  "Women T100": 19,
  "TB-10": 20
};
const matchStatusEntity = {
  1 : "Scheduled",
  2 : "Completed",
  3 : "Live",
  4 : "Abandoned/canceled/No Result"
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
  matchStatusEntity
};

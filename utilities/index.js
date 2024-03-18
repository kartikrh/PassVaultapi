const uaParser = require("ua-parser-js");
const crypto = require("crypto");
const moment = require("moment");
const { default: axios } = require("axios");
const configConstants = require("./configConstants");
const { errorLogger, tblPredictorAPILogger } = require("./logger");
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
    const message = typeof payload?.error === "string" ? payload.error : payload?.error?.message;
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
  Cancel:	6
}

const MarketActionType = {
  isresultSet : 1,
  setResult : 2,
  marketCancel : 3,
  closeMarket : 4
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
    }
    // throw new Error(error.message);
  }

}
const MarketUpdateType = {
  marketInitilization : 1,
  predictMarket : 2,
  marketViewer : 3,
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
  MarketUpdateType
};

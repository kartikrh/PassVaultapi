const uaParser = require('ua-parser-js');
const crypto = require("crypto");

const ERROR_CODES = {
    INVALID_INPUT: "INVALID_INPUT",
    SERVER_ERROR: "SERVER_ERROR",
    AUTH_ERROR: "AUTH_ERROR",
    INVALID_TOKEN:"INVALID_TOKEN"
};

// Function to generate an error response object
const error=(message, errorCode, status) =>{
    return {
        success: false,
        status: status,
        error: {
            code: errorCode,
            message: message
        }
    };
}

// Function to generate a success response object
const success=(result, status)=> {
    return {
        success: true,
        status: status,
        result: result,
    };
}

const deviceInfo = (request) =>{
  const parsedUA =uaParser(request.headers['user-agent']);
    return JSON.stringify({
        'browserInfo':{
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
        }
    })

}

const hashFunction = (value) =>{
  console.log(value,'..beofre hash..')
  const hash = crypto.createHash("sha256");
  hash.update((value.toString()+process.env.SECRET_HASH_KEY_TABID.toString())); // Convert to string before hashing
  return hash.digest("hex");
}

const encryptedObject = (value,enVal) =>{
  return {
    'wrTabId': value,
    'wrEncryptedTabId': enVal,
  }
}

module.exports={
    ERROR_CODES,
    error,
    success,
    deviceInfo,
    hashFunction,
    encryptedObject
}
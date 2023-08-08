const uaParser = require('ua-parser-js');

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

module.exports={
    ERROR_CODES,
    error,
    success,
    deviceInfo
}
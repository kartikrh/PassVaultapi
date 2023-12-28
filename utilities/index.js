const uaParser = require("ua-parser-js");
const crypto = require("crypto");

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

const toFirstLetterUpperCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    }
  );
}

const getMessage = (payload, code, type) => {
  switch (code) {
    case 500:
      return payload?.error?.message || `Internal Server Error`
    case 200:
      let message = typeof payload?.result === "string" ? payload.result : payload?.result?.message;
      if (!message) {
        if (type === "signin" || type === "signup") {
          message = `${type} successfully`;
        } else if (type === "save" || type === "create") {
          message = `${payload.title} saved successfully`;
        } else if (type.includes('delete')) {
          message = `${payload.title}(s) delete successfully`;
        } else {
          message = `${payload.title} Data fetched successfully`;
        }
      }
      return message
    case 403:
      return payload?.error?.message || `Unauthorized Access`
    default:
      return `Something Went Wrong with status ${code}`
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
  toFirstLetterUpperCase,
  getMessage
};

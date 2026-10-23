const os = require('os');
const { getCurrentDateTime } = require('./datetime');

const errorLogger = async (fastify, errMessage, errStack, request , data = null) => {
  try {
    
    return await fastify.db.query(
      `INSERT INTO "tblErrorLogs" ("wrErrMessage", "wrErrStack", "wrDomain","wrUserId","wrUserIp", "wrCreatedDate" ,"wrApi", "wrRequestBody", "wrData") VALUES ($1, $2, $3, $4, $5, $6 ,$7,$8 ,$9)`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          errMessage,
          errStack,
          request?.hostname || null,
          request?.userTokenInfo?.WrUserId || null,
          request?.ip || null,
          new Date(),
          request?.originalUrl || null,
          request?.body || null,
          data ?? null
        ],
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const oomLogger = async (fastify, reason, detail = null, data = null) => {
  try {
    if (!fastify || !fastify.db) {
      console.warn("oomLogger: fastify.db not available, skipping DB write", reason, detail);
      return;
    }
    return await errorLogger(
      fastify,
      reason,
      detail || "Server memory usage warning near OOM",
      null,
      data ?? JSON.stringify({ reason, detail, timestamp: new Date() })
    );
  } catch (err) {
    console.warn("oomLogger failed:", err?.message || err);
  }
};

const originalLog = console.log;
const originalLogError = console.error;
const originalLogWarn = console.warn;

const createLogPrefix = (originalFn) => {
  return (...args) => originalFn(`[${getCurrentDateTime()}]`, ...args);
}

console.log = createLogPrefix(originalLog);
console.error = createLogPrefix(originalLogError);
console.warn = createLogPrefix(originalLogWarn);

const getMemoryStatus = () => {
  const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);
  const mem = process.memoryUsage();

  const systemTotal = os.totalmem();
  const systemFree = os.freemem();
  const systemUsed = systemTotal - systemFree;

  return {
    process: {
      rss: `${toMB(mem.rss)} MB`,
      heapTotal: `${toMB(mem.heapTotal)} MB`,
      heapUsed: `${toMB(mem.heapUsed)} MB`,
    },
    system: {
      total: `${toMB(systemTotal)} MB`,
      used: `${toMB(systemUsed)} MB`,
      free: `${toMB(systemFree)} MB`,
    }
  }
}

module.exports = {
  errorLogger,
  oomLogger,
  getMemoryStatus,
};

const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { getVaultDataService, putVaultDataService } = require("../../services/vaultData");

const commonPath = "controller/vault/data";

const ERROR_CODE_TO_STATUS = {
  DRIVE_NOT_CONNECTED: { code: ERROR_CODES.INVALID_INPUT, status: 409 },
  DRIVE_REAUTH_REQUIRED: { code: ERROR_CODES.AUTH_ERROR, status: 409 },
  QUOTA_EXCEEDED: { code: ERROR_CODES.QUOTA_EXCEEDED, status: 403 },
  REVISION_CONFLICT: { code: ERROR_CODES.REVISION_CONFLICT, status: 409 },
  INVALID_INPUT: { code: ERROR_CODES.INVALID_INPUT, status: 200 },
};

const sendVaultDataError = (reply, err) => {
  const mapped = ERROR_CODE_TO_STATUS[err.code] || { code: ERROR_CODES.SERVER_ERROR, status: 200 };
  // DRIVE_REAUTH_REQUIRED has to survive to the client as-is rather than
  // folding into the generic AUTH_ERROR bucket every other auth failure here
  // uses -- the UI needs to tell "your Drive grant died, reconnect" apart
  // from "your session died, log back in" to show the right recovery action.
  const responseCode = err.code === "DRIVE_REAUTH_REQUIRED" ? err.code : mapped.code;
  reply.status(200).send(error(err.message, responseCode, mapped.status));
};

const getVaultData = async (request, reply, fastify) => {
  try {
    const result = await getVaultDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getVaultData", request);
    sendVaultDataError(reply, err);
  }
};

const putVaultData = async (request, reply, fastify) => {
  try {
    const result = await putVaultDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/putVaultData", request);
    sendVaultDataError(reply, err);
  }
};

module.exports = { getVaultData, putVaultData };

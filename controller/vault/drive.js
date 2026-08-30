const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { connectDriveService, getDriveStatusService } = require("../../services/vaultDrive");

const commonPath = "controller/vault/drive";

const connectDrive = async (request, reply, fastify) => {
  try {
    const result = await connectDriveService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/connectDrive", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const getDriveStatus = async (request, reply, fastify) => {
  try {
    const result = await getDriveStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getDriveStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

module.exports = { connectDrive, getDriveStatus };

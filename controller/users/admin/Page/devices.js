const {
  allDevicesService,
  deviceByIdService,
  saveDeviceService,
  deleteDeviceService,
} = require("../../../../services/devices");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/page/device";

const getAllDevices = async (request, reply, fastify) => {
  try {
    const result = await allDevicesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllDevices", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getDeviceById = async (request, reply, fastify) => {
  try {
    const result = await deviceByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getDeviceById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveDevice = async (request, reply, fastify) => {
  try {
    const result = await saveDeviceService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveDevice", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteDevice = async (request, reply, fastify) => {
  try {
    const result = await deleteDeviceService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteDevice", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  saveDevice,
  deleteDevice,
};

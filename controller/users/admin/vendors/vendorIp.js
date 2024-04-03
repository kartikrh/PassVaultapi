const {
  getByVendorIdervice,
  getByVendorIpIdService,
  saveVendorIpService,
  deleteVendorIpService,
  activeInactiveVendorIpService,
  getAllVendorIpervice,
} = require("../../../../services/vendorIp");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/vendors/vendorIp";

const getAllVendorIp = async (request, reply, fastify) => {
  try {
    const result = await getAllVendorIpervice(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllVendorIp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getByVendorId = async (request, reply, fastify) => {
  try {
    const result = await getByVendorIdervice(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getByVendorId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getByVendorIpId = async (request, reply, fastify) => {
  try {
    const result = await getByVendorIpIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getByVendorIpId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveVendorIp = async (request, reply, fastify) => {
  try {
    const result = await saveVendorIpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveVendorIp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteVendorIp = async (request, reply, fastify) => {
  try {
    const result = await deleteVendorIpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteVendorIp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveVendorIp = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveVendorIpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveVendorIp",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getByVendorId,
  getByVendorIpId,
  saveVendorIp,
  deleteVendorIp,
  activeInactiveVendorIp,
  getAllVendorIp
};

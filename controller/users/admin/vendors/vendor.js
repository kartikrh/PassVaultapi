const { getAllVendorService, getVendorByIdService, saveVendorService, deleteVendorService, activeInactiveVendorService, updateIsIPCheckService } = require("../../../../services/vendor");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/vendors/vendor";
const getAllVendors = async (request, reply, fastify) => {
  try {
    const result = await getAllVendorService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllVendors", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getVendorById = async (request, reply, fastify) => {
  try {
    const result = await getVendorByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getVendorById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveVendor = async (request, reply, fastify) => {
  try {
    const result = await saveVendorService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveVendor", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteVendor = async (request, reply, fastify) => {
  try {
    const result = await deleteVendorService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteVendor", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveVendor = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveVendorService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveVendor", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateIsIPCheck = async (request, reply, fastify) => {
  try {
    const result = await updateIsIPCheckService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateIsIPCheck", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllVendors,
    getVendorById,
    saveVendor,
    deleteVendor,
    activeInactiveVendor,
    updateIsIPCheck
};

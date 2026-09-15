const {
  savePaymentMethodEntryService,
  allPaymentMethodsService,
  paymentMethodByIdService,
  deletePaymentMethodService,
  activeInactivePaymentMethodService,
  isDefaultChangeService,
} = require("../../../../services/paymentMethods");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

const commonPath = "controller/users/admin/paymentMethod/index.js";

const allPaymentMethods = async (request, reply, fastify) => {
  try {
    const result = await allPaymentMethodsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/allPaymentMethods", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const paymentMethodById = async (request, reply, fastify) => {
  try {
    const result = await paymentMethodByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/paymentMethodById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const savePaymentMethod = async (request, reply, fastify) => {
  try {
    const result = await savePaymentMethodEntryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePaymentMethod", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deletePaymentMethod = async (request, reply, fastify) => {
  try {
    const result = await deletePaymentMethodService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deletePaymentMethod", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactivePaymentMethod = async (request, reply, fastify) => {
  try {
    const result = await activeInactivePaymentMethodService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactivePaymentMethod", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const isDefaultChange = async (request, reply, fastify) => {
  try {
    const result = await isDefaultChangeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/isDefaultChange", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  allPaymentMethods,
  paymentMethodById,
  savePaymentMethod,
  deletePaymentMethod,
  activeInactivePaymentMethod,
  isDefaultChange,
};

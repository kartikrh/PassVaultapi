const {
  allCountryCodeService,
  countryCodeByIdService,
  createCountryCodeService,
  deleteCountryCodeService,
} = require("../../../../services/countryCode");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/countryCode/index.js";

const getAllCountryCode = async (request, reply, fastify) => {
  try {
    const result = await allCountryCodeService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllCountryCode", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const countryCodeById = async (request, reply, fastify) => {
  try {
    const result = await countryCodeByIdService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/countryCodeById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveCountryCode = async (request, reply, fastify) => {
  try {
    const result = await createCountryCodeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveCountryCode", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteCountryCodes = async (request, reply, fastify) => {
  try {
    const result = await deleteCountryCodeService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteCountryCodes", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getAllCountryCode,
    countryCodeById,
    saveCountryCode,
    deleteCountryCodes,
};

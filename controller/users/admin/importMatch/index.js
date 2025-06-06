const {
    importMatchService,
    importCompetitionService,
} = require("../../../../services/importMatch");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/importMarket";

const importMatch = async (request, reply, fastify) => {
  try {
    const result = await importMatchService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/importMatch", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const importCompetition = async (request, reply, fastify) => {
  try {
    const result = await importCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/importCompetition", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

module.exports = {
    importMatch,
    importCompetition,
}
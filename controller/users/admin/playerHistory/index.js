const {
  createPlayerBattingHistoryService,
  createPlayerBowlingHistoryService,
  getAllPlayersHistoryService,
  deleteBattingHistoryService,
  deleteBowlingHistoryService,
  exportPlayerHistoryService,
  importPlayerHistoryService,
  getPlayerHistDataService,
  getPlayerBallHistDataService,
  upPlayerHistDataService,
  upPlayerBallHistDataService,
  calculationOfCommPlayerBatHistService,
  calculationOfCommPlayerBowlHistService,
  playerBattingHistSummarycalculationService,
  playerBowlHistSummaryCalculationService,
} = require("../../../../services/playerHistory");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/playerHistory/index.js";

const savePlayerBattingHistory = async (request, reply, fastify) => {
  try {
    const result = await createPlayerBattingHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savePlayerBattingHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const savePlayerBowlingHistory = async (request, reply, fastify) => {
  try {
    const result = await createPlayerBowlingHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savePlayerBowlingHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllPlayersHistory = async (request, reply, fastify) => {
  try {
    const result = await getAllPlayersHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPlayersHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const exportPlayerHistory = async (request, reply, fastify) => {
  try {
    const buffer = await exportPlayerHistoryService(fastify, request);
    // reply.status(200).send(success(buffer, 200));
    reply
    .status(200)
    .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .header('Content-Disposition', `attachment; filename="Players_history_${new Date().toISOString()}.xlsx"`)
    .send(buffer);
  } catch (err) {    
    errorLogger(
      fastify,
      err.message,
      commonPath + "/exportPlayerHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const importPlayerHistory = async (request, reply, fastify) => {
  try {
    const result = await importPlayerHistoryService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/importPlayerHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteBattingHistory = async (request, reply, fastify) => {
  try {
      const result = await deleteBattingHistoryService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/deleteBattingHistory", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteBowlingHistory = async (request, reply, fastify) => {
  try {
      const result = await deleteBowlingHistoryService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/deleteBowlingHistory", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPlayerHistData = async (request, reply, fastify) => {
  try {
      const result = await getPlayerHistDataService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getPlayerHistData", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upPlayerHistData = async (request, reply, fastify) => {
  try {
      const result = await upPlayerHistDataService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/upPlayerHistData", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upPlayerBallHistData = async (request, reply, fastify) => {
  try {
      const result = await upPlayerBallHistDataService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/upPlayerBallHistData", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPlayerBallHistData = async (request, reply, fastify) => {
  try {
      const result = await getPlayerBallHistDataService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getPlayerBallHistData", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const calculationOfCommPlayerBatHist = async (request, reply, fastify) => {
  try {
      const result = await calculationOfCommPlayerBatHistService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/calculationOfCommPlayerBatHist", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const calculationOfCommPlayerBowlHist = async (request, reply, fastify) => {
  try {
      const result = await calculationOfCommPlayerBowlHistService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/calculationOfCommPlayerBowlHist", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const playerBatSummarycalculation = async (request, reply, fastify) => {
  try {
      const result = await playerBattingHistSummarycalculationService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/playerBatSummarycalculation", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const playerBowlSummarycalculation = async (request, reply, fastify) => {
  try {
      const result = await playerBowlHistSummaryCalculationService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/playerBowlSummarycalculation", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  savePlayerBattingHistory,
  savePlayerBowlingHistory,
  getAllPlayersHistory,
  deleteBattingHistory,
  deleteBowlingHistory,
  exportPlayerHistory,
  importPlayerHistory,
  getPlayerHistData,
  getPlayerBallHistData,
  upPlayerHistData,
  upPlayerBallHistData,
  calculationOfCommPlayerBatHist,
  calculationOfCommPlayerBowlHist,
  playerBatSummarycalculation,
  playerBowlSummarycalculation,
};

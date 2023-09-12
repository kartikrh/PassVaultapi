const {
  allPaneltyRunsService,
  paneltyRunByIdService,
  savePaneltyRunService,
  deletePaneltyRunService,
} = require("../../../../services/paneltyRun");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllPaneltyRun = async (request, reply, fastify) => {
  try {
    const result = await allPaneltyRunsService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPaneltyRunById = async (request, reply, fastify) => {
  try {
    const result = await paneltyRunByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const savePaneltyRun = async (request, reply, fastify) => {
  try {
    const result = await savePaneltyRunService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePaneltyRun = async (request, reply, fastify) => {
  try {
    const result = await deletePaneltyRunService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPaneltyRun,
  getPaneltyRunById,
  savePaneltyRun,
  deletePaneltyRun,
};

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const {
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  getDisplayTabsService,
  changeDisplayOrderService,
  getAllTabsService,
  saveTabService,
  getTabsByRoleIDService,
  getTabsByParentIdService,
} = require("../../../../services/admin.js");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/tabs/index";

async function getTabs(request, reply, fastify) {
  try {
    const result = await getTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTabs", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getTabsByRoleId(request, reply, fastify) {
  try {
    const result = await getTabsByRoleIDService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTabsByRoleId", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getTabsList(request, reply, fastify) {
  try {
    const result = await getTabsByParentIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTabsList", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getAllTabsData(request, reply, fastify) {
  try {
    const result = await getAllTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTabsData", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getDisplayTabs(request, reply, fastify) {
  try {
    const result = await getDisplayTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getDisplayTabs", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function deleteTab(request, reply, fastify) {
  try {
    const result = await deleteTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteTab", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getSpecificTab(request, reply, fastify) {
  try {
    const result = await getSpecificTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getSpecificTab", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function saveTabData(request, reply, fastify) {
  try {
    const result = await saveTabService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err?.message, commonPath + "/saveTabData", request);
    reply.status(500).send(error(err?.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function changeDisplayOrder(request, reply, fastify) {
  try {
    const result = await changeDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err?.message,
      commonPath + "/changeDisplayOrder",
      request
    );
    reply.status(500).send(error(err?.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

module.exports = {
  getTabs,
  deleteTab,
  getSpecificTab,
  saveTabData,
  deleteTab,
  getDisplayTabs,
  changeDisplayOrder,
  getAllTabsData,
  getTabsByRoleId,
  getTabsList,
};

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const {
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  getDisplayTabsService,
  changeDisplayOrderService,
  getAllTabsService,
  saveTabService,
} = require("../../../../services/admin.js");

async function getTabs(request, reply, fastify) {
  try {
    const result = await getTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getAllTabsData(request, reply, fastify) {
  try {
    const result = await getAllTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getDisplayTabs(request, reply, fastify) {
  try {
    const result = await getDisplayTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function deleteTab(request, reply, fastify) {
  try {
    const result = await deleteTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(
        error(
          err.message || "Internal server error",
          ERROR_CODES.SERVER_ERROR,
          500
        )
      );
  }
}

async function getSpecificTab(request, reply, fastify) {
  try {
    const result = await getSpecificTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function saveTabData(request, reply, fastify) {
  try {
    const result = await saveTabService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(
        error(
          err?.message || "Internal server error",
          ERROR_CODES.SERVER_ERROR,
          500
        )
      );
  }
}

async function changeDisplayOrder(request, reply, fastify) {
  try {
    const result = await changeDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(
        error(
          err?.message || "Internal server error",
          ERROR_CODES.SERVER_ERROR,
          500
        )
      );
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
};

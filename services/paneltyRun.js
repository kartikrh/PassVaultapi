const {
  insertPaneltyRunQuery,
  updatePaneltyRunQuery,
  deletePaneltyRunQuery,
} = require("../repository/TablePaneltyRun");

const allPaneltyRunsService = async () => {
  return global.tblPaneltyRuns;
};

const paneltyRunByIdService = async (request) => {
  const { paneltyId } = request.body;
  const result = global.tblPaneltyRuns.find(
    (item) => item.paneltyId === paneltyId
  );
  return result || null;
};

const insertPaneltyRunService = async (request, fastify) => {
  const result = await insertPaneltyRunQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblPaneltyRuns.push(result);
  return result;
};

const updatePaneltyRunService = async (request, fastify) => {
  const checkId = global.tblPaneltyRuns.find(
    (item) => item.paneltyId === request.body.paneltyId
  );

  if (!checkId) {
    throw new Error("Panelty Run with this id not Found");
  }

  const body = {
    run: checkId.run,
    desc: request.body.desc || checkId.desc,
    paneltyId: request.body.paneltyId,
    userId: request.userTokenInfo.WrUserId,
    isActive: checkId.isActive,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  }
  if ("run" in request.body) {
    body.run = request.body.run;
  }

  await updatePaneltyRunQuery(body, fastify, request);

  const index = global.tblPaneltyRuns.findIndex(
    (item) => item.paneltyId === body.paneltyId
  );

  global.tblPaneltyRuns[index] = body;

  return body;
};

const savePaneltyRunService = async (request, fastify) => {
  const { paneltyId } = request.body;

  if (paneltyId === "0") {
    return await insertPaneltyRunService(request, fastify);
  } else {
    return await updatePaneltyRunService(request, fastify);
  }
};

const deletePaneltyRunService = async (request, fastify) => {
  const { paneltyId } = request.body;

  for (let id of paneltyId) {
    //validate id if required
  }

  await deletePaneltyRunQuery(paneltyId, fastify, request);

  global.tblPaneltyRuns = global.tblPaneltyRuns.filter(
    (item) => !paneltyId.includes(item.paneltyId)
  );

  return `Panelty Run(s) deleted successfully`;
};

module.exports = {
  allPaneltyRunsService,
  paneltyRunByIdService,
  savePaneltyRunService,
  deletePaneltyRunService,
};

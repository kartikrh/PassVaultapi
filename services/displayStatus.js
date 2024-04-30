const {
  allDisplayStatusesQuery,
  insertDisplayStatusesQuery,
  updateDisplayStatusesQuery,
  deleteDisplayStatusesQuery,
} = require("../repository/TableDisplayStatus");

const allDisplayStatusesService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblDisplayStatus.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblDisplayStatus.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const displayStatusesIdService = async (request) => {
  const { displayStatusId } = request.body;
  const result = global.tblDisplayStatus.find(
    (item) => item.displayStatusId === displayStatusId
  );
  return result || null;
};

const insertdisplayStatusesService = async (request, fastify) => {
  const result = await insertDisplayStatusesQuery(
    { ...request.body },
    fastify,
    request
  );

  global.tblDisplayStatus.push(result);
  return result;
};

const updatedisplayStatusesService = async (request, fastify) => {
  const checkId = global.tblDisplayStatus.find(
    (item) => item.displayStatusId === request.body.displayStatusId
  );

  if (!checkId) {
    throw new Error("Display Status with this id not Found");
  }

  const body = {
    displayStatus: request.body.displayStatus || checkId.displayStatus,
    isActive: request.body.isActive,
    displayStatusId: request.body.displayStatusId,
  };

  await updateDisplayStatusesQuery(body, fastify, request);

  const index = global.tblDisplayStatus.findIndex(
    (item) => item.displayStatusId === body.displayStatusId
  );

  global.tblDisplayStatus[index] = body;

  return body;
};

const savedisplayStatusesService = async (request, fastify) => {
  const { displayStatusId } = request.body;

  if (displayStatusId === 0) {
    return await insertdisplayStatusesService(request, fastify);
  } else {
    return await updatedisplayStatusesService(request, fastify);
  }
};

const deletedisplayStatusesService = async (request, fastify) => {
  const { displayStatusId } = request.body;

  await deleteDisplayStatusesQuery(displayStatusId, fastify, request);

  global.tblDisplayStatus = global.tblDisplayStatus.filter(
    (item) => !displayStatusId.includes(item.displayStatusId)
  );

  return `DisplayStatus(s) deleted successfully`;
};

module.exports = {
  allDisplayStatusesService,
  displayStatusesIdService,
  savedisplayStatusesService,
  deletedisplayStatusesService,
};

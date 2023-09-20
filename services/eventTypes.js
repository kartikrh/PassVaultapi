const {
  insertEventTypeQuery,
  updateEventTypeQuery,
  deleteEventTypeQuery,
} = require("../repository/TableEventType");

const allEventTypesService = async () => {
  return global.tblEventTypes;
};

const eventTypeByIdService = async (request) => {
  const { eventTypeId } = request.body;
  const result = global.tblEventTypes.find(
    (item) => item.eventTypeId === eventTypeId
  );
  return result || null;
};

const createEventTypeService = async (request, fastify) => {
  const data = await insertEventTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblEventTypes.push(data);
  return data;
};

const updateEventTypeService = async (request, fastify) => {
  const checkId = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!checkId) {
    throw new Error("EventType with this id not Found");
  }

  const data = {
    eventTypeId: request.body.eventTypeId,
    eventType: request.body.eventType || checkId.eventType,
    refId: request.body.refId || checkId.refId,
    image: request.body.image || checkId.image,
    isActive: checkId.isActive,
    icon: request.body.icon || checkId.icon,
    displayOrder: request.body.displayOrder || checkId.displayOrder,
    remark: request.body.remark || checkId.remark,
    eEventTypeId: request.body.eEventTypeId || checkId.eEventTypeId,
    eRefId: request.body.eRefId || checkId.eRefId,
    displayType: request.body.displayType || checkId.displayType,
    isHighlight: checkId.isHighlight,
    userId: request.userTokenInfo.WrUserId,
  };
  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  if ("isHighlight" in request.body) {
    data.isHighlight = request.body.isHighlight;
  }

  await updateEventTypeQuery(data, fastify, request);

  const index = global.tblEventTypes.findIndex(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  delete data.userId;
  global.tblEventTypes[index] = data;

  return data;
};

const saveEventTypeService = async (request, fastify) => {
  const { eventTypeId } = request.body;

  if (eventTypeId === "0") {
    return await createEventTypeService(request, fastify);
  } else {
    return await updateEventTypeService(request, fastify);
  }
};

const deleteEventTypeService = async (request, fastify) => {
  const { eventTypeId } = request.body;

  for (const eventType of eventTypeId) {
    //validate eventTypeId in tblPlayer and tblTeaam
  }

  await deleteEventTypeQuery(eventTypeId, fastify, request);

  global.tblEventTypes = global.tblEventTypes.filter(
    (item) => !eventTypeId.includes(item.eventTypeId)
  );

  return `EventType(s) deleted successfully`;
};

module.exports = {
  allEventTypesService,
  eventTypeByIdService,
  saveEventTypeService,
  deleteEventTypeService,
};

const {
  allEventTypesQuery,
  insertEventTypeQuery,
  updateEventTypeQuery,
  deleteEventTypeQuery,
  updateDisplayOrder,
} = require("../repository/TableEventType");
const { storeImage, removeImage } = require("../utilities/Images");

const allEventTypesService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblEventTypes.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblEventTypes.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const eventTypeByIdService = async (request) => {
  const { eventTypeId } = request.body;
  const result = global.tblEventTypes.find(
    (item) => item.eventTypeId === eventTypeId
  );
  return result || null;
};

const createEventTypeService = async (request, fastify) => {
  const { image } = request.body;

  const validateEventTypeName = global.tblEventTypes.find(
    (item) =>
      item?.eventType?.toLowerCase() === request?.body?.eventType?.toLowerCase()
  );

  if (validateEventTypeName) {
    throw new Error("EventType already exists");
  }

  if (image && image.length > 0) {
    const data = await storeImage(image[0]);
    request.body.image = data;
  }

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
    image: checkId.image,
    isActive: checkId.isActive,
    remark: request.body.remark || checkId.remark,
    displayOrder: checkId.displayOrder,
    isHighlight: checkId.isHighlight,
    userId: request.userTokenInfo.WrUserId,
  };
  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  if ("isHighlight" in request.body) {
    data.isHighlight = request.body.isHighlight;
  }

  const validateEventTypeName = global.tblEventTypes.find(
    (item) =>
      item?.eventType?.toLowerCase() === data?.eventType?.toLowerCase() &&
      item.eventTypeId !== data.eventTypeId
  );

  if (validateEventTypeName) {
    throw new Error("EventType already exists");
  }

  if (request.body.image && request.body.image.length > 0) {
    if (checkId.image) {
      await removeImage(checkId.image);
    }
    const result = await storeImage(request.body.image[0]);
    data.image = result;
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
    const validateIdInPlayer = global.tblPlayers.find(
      (item) => item.eventTypeId === eventType
    );

    const validateIdInTeam = global.tblTeams.find(
      (item) => item.eventTypeId === eventType
    );

    if (validateIdInPlayer || validateIdInTeam) {
      const eventTypeData = global.tblEventTypes.find(
        (item) => item.eventTypeId === eventType
      );

      throw new Error(
        `EventType ${eventTypeData.eventType} is used in Player or Team`
      );
    }
  }

  await deleteEventTypeQuery(eventTypeId, fastify, request);

  global.tblEventTypes = global.tblEventTypes.filter(
    (item) => !eventTypeId.includes(item.eventTypeId)
  );

  return `EventType(s) deleted successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await updateDisplayOrder(item, fastify);
  }

  global.tblEventTypes = await allEventTypesQuery(fastify);

  return `Display order updated successfully`;
};

module.exports = {
  allEventTypesService,
  eventTypeByIdService,
  saveEventTypeService,
  deleteEventTypeService,
  updateDisplayOrderService,
};

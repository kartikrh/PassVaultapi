const {
  insertNotificationConfigQuery,
  updateNotificationConfigQuery,
  deleteNotificationConfigQuery,
  activeInactiveNotificationConfigQuery,
} = require("../repository/TableNotificationConfig");

const saveNotificationConfigService = async (request, fastify) => {
  const saveData = await insertNotificationConfigQuery(request.body, fastify, request);
  global.tblNotificationConfig.push(saveData);
  return saveData;
};

const editNotificationConfigService = async (request, fastify) => {
  const validateId = global.tblNotificationConfig.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Notification config data with this Id not found");
  }

  const updateData = {
    eventName: request.body.eventName ?? validateId.eventName,
    content: request.body.content ?? validateId.content,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateNotificationConfigQuery(updateData, fastify, request);

  const index = global.tblNotificationConfig.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblNotificationConfig[index] = modifiedData[0];
  }

  return modifiedData[0];
};

const allNotificationConfigService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblNotificationConfig.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblNotificationConfig.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const notificationCofigByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblNotificationConfig.find((item) => item.id === id);
  return result || null;
};

const createNotificationService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveNotificationConfigService(request, fastify, request);
  } else {
    return await editNotificationConfigService(request, fastify, request);
  }
};

const deleteNotificationConfigService = async (request, fastify) => {
  const { id } = request.body;
  await deleteNotificationConfigQuery(id, fastify, request);
  global.tblNotificationConfig = global.tblNotificationConfig.filter(
    (item) => !id.includes(item.id)
  );

  return `Notification config(s) data deleted successfully`;
};

const activeInactiveNotificationConfigService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblNotificationConfig.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Notification config with this Id not found");
  }
  await activeInactiveNotificationConfigQuery({ id, isActive }, request, fastify);
  const index = global.tblNotificationConfig.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblNotificationConfig[index].isActive = isActive;
  }

  return `Notification Config data updated successfully`;
};

module.exports = {
  createNotificationService,
  allNotificationConfigService,
  notificationCofigByIdService,
  deleteNotificationConfigService,
  activeInactiveNotificationConfigService,
};

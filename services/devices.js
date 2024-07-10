const {
  insertDeviceQuery,
  updateDeviceQuery,
  deleteDeviceQuery,
  getAllDevicesQuery,
} = require("../repository/TableDevice");

const allDevicesService = async (request, fastify) => {
    return global.tblDevices;
};

const deviceByIdService = async (request) => {
  const { deviceId } = request.body;
  const devices = global.tblDevices || [];
  const result = devices.find((item) => item.wrDeviceId === deviceId);
  return result || null;
};

const createDeviceService = async (request, fastify) => {
  const devices = global.tblDevices || [];
  const checkName = devices.find((item) => item.name.toLowerCase() === request.body.name.trim().toLowerCase());
  if (checkName) {
    throw new Error("Device with this name already exists");
  }

  const data = await insertDeviceQuery(
    {
      ...request.body
    },
    fastify,
    request
  );

  global.tblDevices.push(data);
  return data;
};

const updateDeviceService = async (request, fastify) => {
  const { deviceId } = request.body;
  const devices = global.tblDevices || [];
  const checkId = devices.find((item) => item.wrDeviceId === deviceId);

  if (!checkId) {
    throw new Error("Device with this ID not found");
  }
  const checkName = devices.find((item) => item.wrName.toLowerCase() === request.body.name.trim().toLowerCase() && item.wrDeviceId !== deviceId);
  if (checkName) {
    throw new Error("Device with this name already exists");
  }

  const data = {
    wrDeviceId: request.body.deviceId,
    wrName: request.body.name || checkId.wrName,
    wrPushEndpoint: request.body.pushEndpoint || checkId.wrPushEndpoint,
    wrPushP256DH: request.body.pushP256DH || checkId.wrPushP256DH,
    wrPushAuth: request.body.pushAuth || checkId.wrPushAuth,
    wrCreatedDate: checkId.wrCreatedDate,
    wrUserId: request.body.userId || checkId.wrUserId,
    wrUserType: request.body.userType || checkId.wrUserType,
  };

  await updateDeviceQuery(
    {
      ...data,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );

  const index = devices.findIndex((item) => item.wrDeviceId === deviceId);
  devices[index] = data;

  return data;
};

const saveDeviceService = async (request, fastify) => {
  const { deviceId } = request.body;

  if (deviceId === "0") {
    return await createDeviceService(request, fastify);
  } else {
    return await updateDeviceService(request, fastify);
  }
};

const deleteDeviceService = async (request, fastify) => {
  const { deviceIds } = request.body;

  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    throw new Error("deviceIds must be a non-empty array");
  }

  for (let deviceId of deviceIds) {
    await deleteDeviceQuery(deviceId, fastify, request);
  }

  global.tblDevices = global.tblDevices.filter((item) => !deviceIds.includes(item.wrDeviceId));

  return `Device(s) deleted successfully`;
};


module.exports = {
  allDevicesService,
  deviceByIdService,
  saveDeviceService,
  deleteDeviceService,
};

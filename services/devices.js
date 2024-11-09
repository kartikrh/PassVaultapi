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
  const result = devices.find((item) => item.deviceId === deviceId);
  return result || null;
};

const createDeviceService = async (request, fastify) => {
  const devices = global.tblDevices || [];
  if(request.body.deviceType == 1){
   const checkpushP256DH = devices.find((item) => item.pushP256DH === request.body.pushP256DH && item.pushP256DH !== '');
   if (checkpushP256DH) {
     return checkpushP256DH;
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
 }
 if(request.body.deviceType == 2){
  const checkmobileToken = devices.find((item) => item.mobileToken === request.body.mobileToken && item.mobileToken !== '');
  if (checkmobileToken) {
    return checkmobileToken;
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
}
};

const updateDeviceService = async (request, fastify) => {
  const deviceId = parseInt(request.body.deviceId);
  const devices = global.tblDevices || [];
  const checkId = devices.find((item) => item.deviceId == deviceId);

  if (!checkId) {
    throw new Error("Device with this ID not found");
  }
  const checkName = devices.find((item) => item.name.toLowerCase() === request.body.name.trim().toLowerCase() && item.deviceId != deviceId);
  if (checkName) {
    throw new Error("Device with this name already exists");
  }

  const data = {
    deviceId: deviceId,
    name: request.body.name || checkId.name,
    pushEndpoint: request.body.pushEndpoint || checkId.pushEndpoint,
    pushP256DH: request.body.pushP256DH || checkId.pushP256DH,
    pushAuth: request.body.pushAuth || checkId.pushAuth,
    userType: request.body.userType || checkId.userType,
    userId: request.body.userId || checkId.userId,
    createdDate: checkId.createdDate,
  };

  await updateDeviceQuery(
    {
      ...data,
    },
    fastify,
    request
  );
  const index = devices.findIndex((item) => item.deviceId == deviceId);
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

  global.tblDevices = global.tblDevices.filter((item) => !deviceIds.includes(item.deviceId));

  return `Device(s) deleted successfully`;
};


module.exports = {
  allDevicesService,
  deviceByIdService,
  saveDeviceService,
  deleteDeviceService,
};

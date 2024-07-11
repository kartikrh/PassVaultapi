const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllDevices,
  getDeviceById,
  saveDevice,
  deleteDevice,
} = require("../../../controller/users/admin/Page/devices");
const { Devices } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "devices",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getAllDevices(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Devices.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "devices",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getDeviceById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Devices.save.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "devices",
    //       mode: request.body.deviceId === "0" ? "add" : "edit",
    //     }),
    // ],
    handler: (request, reply) => saveDevice(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Devices.delete.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "devices",
    //       mode: "delete",
    //     }),
    // ],
    handler: (request, reply) => deleteDevice(request, reply, fastify),
  });
};

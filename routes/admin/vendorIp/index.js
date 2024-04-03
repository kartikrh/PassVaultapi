const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getByVendorId,
  getByVendorIpId,
  saveVendorIp,
  deleteVendorIp,
  activeInactiveVendorIp,
  getAllVendorIp,
} = require("../../../controller/users/admin/vendors/vendorIp");
const { VendorIp } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: VendorIp.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllVendorIp(request, reply, fastify),
  });
  fastify.post("/getByVendorId", {
    schema: VendorIp.getByVendorId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getByVendorId(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: VendorIp.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getByVendorIpId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: VendorIp.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "add",
        }),
    ],
    handler: (request, reply) => saveVendorIp(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: VendorIp.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteVendorIp(request, reply, fastify),
  });
  fastify.post("/activeInactive", {
    schema: VendorIp.activeInactive.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Vendors",
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      activeInactiveVendorIp(request, reply, fastify),
  });
// fastify.post("/getById", {
//     schema: VendorIp.getById.schema,
//     preHandler: [
//       (request, reply) => authorize(request, reply, fastify),
//       (request, reply) =>
//         checkPermission(request, reply, fastify, {
//           tabName: "Vendors",
//           mode: "view",
//         }),
//     ],
//     handler: (request, reply) => getByVendorIpId(request, reply, fastify),
//   });
//   fastify.post("/save", {
//     schema: VendorIp.save.schema,
//     preHandler: [
//       (request, reply) => authorize(request, reply, fastify),
//       (request, reply) =>
//         checkPermission(request, reply, fastify, {
//           tabName: "Vendors",
//           mode: "add",
//         }),
//     ],
//     handler: (request, reply) => saveVendorIp(request, reply, fastify),
//   });
//   fastify.post("/delete", {
//     schema: VendorIp.delete.schema,
//     preHandler: [
//       (request, reply) => authorize(request, reply, fastify),
//       (request, reply) =>
//         checkPermission(request, reply, fastify, {
//           tabName: "Vendors",
//           mode: "delete",
//         }),
//     ],
//     handler: (request, reply) => deleteVendorIp(request, reply, fastify),
//   });

//   fastify.post("/activeInactive", {
//     schema: VendorIp.activeInactive.schema,
//     preHandler: [
//       (request, reply) => authorize(request, reply, fastify),
//       (request, reply) =>
//         checkPermission(request, reply, fastify, {
//           tabName: "Vendors",
//           mode: "edit",
//         }),
//     ],
//     handler: (request, reply) =>
//       activeInactiveVendorIp(request, reply, fastify),
//   });
};

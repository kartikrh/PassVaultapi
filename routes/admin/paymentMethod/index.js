const { authorize } = require("../../../controller/middleware");
const {
  allPaymentMethods,
  paymentMethodById,
  savePaymentMethod,
  deletePaymentMethod,
  activeInactivePaymentMethod,
  isDefaultChange,
} = require("../../../controller/users/admin/paymentMethod");
const { PaymentMethods } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PaymentMethods.getAll.schema,
    handler: (request, reply) => allPaymentMethods(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: PaymentMethods.getById.schema,
    handler: (request, reply) => paymentMethodById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: PaymentMethods.save.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => savePaymentMethod(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: PaymentMethods.delete.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deletePaymentMethod(request, reply, fastify),
  });
  fastify.post("/activeInactive", {
    schema: PaymentMethods.activeInactiveApi.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => activeInactivePaymentMethod(request, reply, fastify),
  });
  fastify.post("/isDefault", {
    schema: PaymentMethods.isDefaultChange.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => isDefaultChange(request, reply, fastify),
  });
};

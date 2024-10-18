const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  savePlayerBattingHistory,
  savePlayerBowlingHistory,
  getAllPlayersHistory,
  deleteBattingHistory,
  deleteBowlingHistory
} = require("../../../controller/users/admin/playerHistory");
const { PlayerHistory } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PlayerHistory.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPlayersHistory(request, reply, fastify),
  });

  fastify.post("/saveBattingHistory", {
    schema: PlayerHistory.saveBattingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "add",
        }),
    ],
    handler: (request, reply) => savePlayerBattingHistory(request, reply, fastify),
  });

  fastify.post("/saveBowlingHistory", {
    schema: PlayerHistory.saveBowlingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "add",
        }),
    ],
    handler: (request, reply) => savePlayerBowlingHistory(request, reply, fastify),
  });

  fastify.post("/deleteBattingHistory", {
    schema: PlayerHistory.deleteBattingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteBattingHistory(request, reply, fastify),
  });

  fastify.post("/deleteBowlingHistory", {
    schema: PlayerHistory.deleteBowlingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteBowlingHistory(request, reply, fastify),
  });
};

const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllCommentaryPlayersHistory,
  deleteCommBattingHistory,
  deleteCommBowlingHistory,
} = require("../../../controller/users/admin/commPlayerHistory");
const { CommentaryPlayerHistory } = require("../../../swaggerSchema/groupTags/schema");


module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: CommentaryPlayerHistory.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCommentaryPlayersHistory(request, reply, fastify),
  });

  fastify.post("/deleteBatHis", {
    schema: CommentaryPlayerHistory.deleteCommBattingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommBattingHistory(request, reply, fastify),
  });

  fastify.post("/deleteBowlHis", {
    schema: CommentaryPlayerHistory.deleteCommBowlingHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommBowlingHistory(request, reply, fastify),
  });
 
};

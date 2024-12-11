const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  savePlayerBattingHistory,
  savePlayerBowlingHistory,
  getAllPlayersHistory,
  deleteBattingHistory,
  deleteBowlingHistory,
  exportPlayerHistory,
  importPlayerHistory,
  getPlayerHistData,
  getPlayerBallHistData,
  upPlayerHistData,
  upPlayerBallHistData,
} = require("../../../controller/users/admin/playerHistory");
const { PlayerHistory } = require("../../../swaggerSchema/groupTags/schema");
const multer = require("fastify-multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PlayerHistory.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
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
          tabName: "Players",
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
          tabName: "Players",
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
          tabName: "Players",
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
          tabName: "Players",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteBowlingHistory(request, reply, fastify),
  });
  fastify.post("/export", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => exportPlayerHistory(request, reply, fastify),
  });
  fastify.register(upload.contentParser);
  fastify.post("/import", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "edit",
        }),
        upload.single('file')
    ],
    handler: (request, reply) => importPlayerHistory(request, reply, fastify),
  });
  fastify.post("/getPlayerBatHist", {
    schema : PlayerHistory.getPlayerHist.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPlayerHistData(request, reply, fastify),
  })
  fastify.post("/upPlayerBatHist", {
    schema : PlayerHistory.upPlayerBatHist.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => upPlayerHistData(request, reply, fastify),
  })
  fastify.post("/upPlayerBallHist", {
    schema : PlayerHistory.upPlayerBallHist.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => upPlayerBallHistData(request, reply, fastify),
  })
  fastify.post("/getPlayerBallHist", {
    schema : PlayerHistory.getPlayerHist.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPlayerBallHistData(request, reply, fastify),
  })
};

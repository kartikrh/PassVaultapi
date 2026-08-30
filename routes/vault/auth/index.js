const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const {
  googleSignIn,
  refresh,
  logout,
  register,
  verifyEmail,
  setPassword,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} = require("../../../controller/vault/auth");
const { connectDrive, getDriveStatus } = require("../../../controller/vault/drive");
const { getActivity } = require("../../../controller/vault/activity");

module.exports = async (fastify, opts) => {
  fastify.post("/google", {
    handler: (request, reply) => googleSignIn(request, reply, fastify),
  });

  fastify.post("/register", {
    handler: (request, reply) => register(request, reply, fastify),
  });

  fastify.post("/verifyEmail", {
    handler: (request, reply) => verifyEmail(request, reply, fastify),
  });

  fastify.post("/setPassword", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => setPassword(request, reply, fastify),
  });

  fastify.post("/login", {
    handler: (request, reply) => login(request, reply, fastify),
  });

  fastify.post("/forgotPassword", {
    handler: (request, reply) => forgotPassword(request, reply, fastify),
  });

  fastify.post("/resetPassword", {
    handler: (request, reply) => resetPassword(request, reply, fastify),
  });

  fastify.post("/refresh", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => refresh(request, reply, fastify),
  });

  fastify.post("/logout", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => logout(request, reply, fastify),
  });

  fastify.post("/drive/connect", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => connectDrive(request, reply, fastify),
  });

  fastify.get("/drive/status", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getDriveStatus(request, reply, fastify),
  });

  fastify.get("/profile", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getProfile(request, reply, fastify),
  });

  fastify.put("/profile", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => updateProfile(request, reply, fastify),
  });

  fastify.post("/changePassword", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => changePassword(request, reply, fastify),
  });

  fastify.get("/activity", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getActivity(request, reply, fastify),
  });
};

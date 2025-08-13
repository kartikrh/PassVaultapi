const { 
  signInAgent,
  signOutAgent,
  getInitConfig, 
  changeAgentPassword,
} = require("../../controller/users/agent/index");
const { Agent } = require("../../swaggerSchema/groupTags/schema");
const { authorize } = require("../../controller/middleware/index");

module.exports = async (fastify, opts) => {
  fastify.post("/signin", {
    schema: Agent.signIn.schema,
    handler: (request, reply) => signInAgent(request, reply, fastify),
  });
  fastify.post("/signout", {
    schema: Agent.signOut.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => signOutAgent(request, reply, fastify),
  });
  fastify.post("/loadInitData", {
    schema: Agent.signOut.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getInitConfig(request, reply, fastify),
  });
  fastify.post("/changePassword", {
    schema: Agent.changePassword.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => changeAgentPassword(request, reply, fastify),
  });
};
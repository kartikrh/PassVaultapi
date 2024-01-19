const { authorize } = require("../../../controller/middleware");
const {
  importMarketController,
  ListEventTypesAPIcontroller,
} = require("../../../controller/users/admin/ImportMarket/index");
const { ImportMarket } = require("../../../swaggerSchema/groupTags/schema");
const configConstants = require("../../../utilities/configConstants");

module.exports = async function (fastify, opts) {
  fastify.post("/importEvent", {
    schema: ImportMarket.setMarket.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      importMarketController(request, reply, fastify),
  });

  fastify.post("/marketList", {
    schema: ImportMarket.getMarket.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: async (request, reply) => {
      let keyTofind = configConstants.IMPORTMARKET_API;
      const apiUrl = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === keyTofind.toLowerCase()
      ).value;
      try {
        if (request.body.refID === "0") {
          const postData = {
            isaustralian: request.body.isAustralian,
          };
          // Making a POST request to the external API using fetch
          const response = await fetch(apiUrl + "/listEventTypes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          // Checking if the response status is OK (200)
          if (response.ok) {
            const responseData = await response.json();
            // Process the responseData as needed
            reply.send({ responseData });
          } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            reply.code(response.status).send({ result: "POST request failed" });
          }
        } else if (request.body.refID !== "0" && request.body.isCompitition) {
          const postData = {
            isaustralian: request.body.isAustralian,
            refID: request.body.refID,
          };
          // Making a POST request to the external API using fetch
          const response = await fetch(
            apiUrl + "/EventTypes_listCompititions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postData),
            }
          );

          // Checking if the response status is OK (200)
          if (response.ok) {
            const responseData = await response.json();
            // Process the responseData as needed
            reply.send({ responseData });
          } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            reply.code(response.status).send({ result: "POST request failed" });
          }
        } else if (request.body.refID !== "0" && request.body.isEvent) {
          const postData = {
            isaustralian: request.body.isAustralian,
            refID: request.body.refID,
          };
          // Making a POST request to the external API using fetch
          const response = await fetch(apiUrl + "/Compititions_listEvents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          // Checking if the response status is OK (200)
          if (response.ok) {
            const responseData = await response.json();
            // Process the responseData as needed
            reply.send({ responseData });
          } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            reply.code(response.status).send({ result: "POST request failed" });
          }
        }
      } catch (error) {
        console.error("Error:", error.message);
        reply.code(500).send({ result: "Internal server error" });
      }
    },
  });
};

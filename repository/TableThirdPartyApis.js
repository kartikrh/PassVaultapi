const { errorLogger } = require("../utilities/logger");

const allThirdPartyApisQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
            "wrId" as "id",
            "wrProviderName" as "providerName",
            "wrUrl" as "url",
            "wrType" as "type",
            "wrIsActive" as "isActive",
            "wrIsConnect" as "isConnect"
            FROM "tblThirdPartyApis" ORDER BY "wrId" asc;`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableThirdPartyApis.js/allThirdPartyApisQuery",
      null
    );
    throw new Error(err.message);
  }
};

const insertThirdPartyApisQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
            INSERT INTO "tblThirdPartyApis" (
            "wrProviderName", "wrUrl", "wrType", "wrIsActive", "wrIsConnect"
            ) 
            VALUES (
                $1, $2, $3, $4, $5
            ) 
            RETURNING *
            )        
            SELECT 
            "wrId" AS "id",
            "wrProviderName" AS "providerName",
            "wrUrl" AS "url",
            "wrType" AS "type",
            "wrIsActive" AS "isActive",
            "wrIsConnect" AS "isConnect"
            FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.providerName,
          data.url,
          data.type,
          data.isActive || false,
          data.isConnect || false,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableThirdPartyApis.js/insertThirdPartyApisQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateThirdPartyApisQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `Update "tblThirdPartyApis" set 
            "wrProviderName" = $1,"wrUrl" = $2,"wrType" = $3,"wrIsActive" = $4,
            "wrIsConnect" = $5
            where "wrId" = $6;`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.providerName,
          data.url,
          data.type,
          data.isActive || false,
          data.isConnect || false,
          data.id,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableThirdPartyApis.js/updateThirdPartyApisQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteThirdPartApisQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblThirdPartyApis" where "wrId" = ANY ($1)`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableThirdPartyApis.js/deletproviderNameSettingsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveThirdPartyApisQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                  update "tblThirdPartyApis" set
                  "wrIsActive" = $1
                  where "wrId" = $2
              `,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableThirdPartyApis.js/activeInactiveThirdPartyApisQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allThirdPartyApisQuery,
  insertThirdPartyApisQuery,
  updateThirdPartyApisQuery,
  deleteThirdPartApisQuery,
  activeInactiveThirdPartyApisQuery,
};

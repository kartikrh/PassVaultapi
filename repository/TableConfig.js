const { errorLogger } = require("../utilities/logger");

const getAllCongigQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT
    te."wrValue" as "id",
    tc."wrKey" as "key",
    tc."wrValue" as "value",
    tc."wrIsActive" as "isActive",
    tc."wrDesc" as "desc"
    FROM "tblConfigs" tc inner join "tblEncryptedData" te on tc."wrId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertConfigQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with insert_data as(
              insert into "tblConfigs" ("wrKey","wrValue","wrDesc","wrIsActive") values ($1,$2,$3,$4) returning *
          )        
          SELECT
    te."wrValue" as "id",
    tc."wrKey" as "key",
    tc."wrValue" as "value",
    tc."wrIsActive" as "isActive",
    tc."wrDesc" as "desc"
    FROM "insert_data" tc inner join "tblEncryptedData" te on tc."wrId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.key || null,
          data.value || null,
          data.desc || null,
          data.isActive || false,
        ],
      }
    );

    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateConfigQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblConfigs" set "wrKey" = $1,"wrValue" = $2,"wrDesc" = $3,"wrIsActive" = $4 where "wrId" = (
            select "wrKey" from "tblEncryptedData" where "wrValue" = $5)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.key, data.value, data.desc, data.isActive, data.id],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteConfigQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblConfigs" where "wrId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/deleteConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllCongigQuery,
  insertConfigQuery,
  updateConfigQuery,
  deleteConfigQuery,
};

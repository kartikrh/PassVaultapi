const { errorLogger } = require("../utilities/logger");

const getAllShotTypesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
              "wrId" AS "id",
              "wrName" AS "name",
              "wrImage" AS "image",
              "wrIsActive" AS "isActive",
              "wrDisplayOrder" AS "displayOrder"
            FROM "tblShotType"
          WHERE "wrIsDeleted" = FALSE;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
};

const insertShotTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH count_parent AS (
            SELECT COUNT(*) AS count
            FROM "tblShotType"
            WHERE "wrIsDeleted" = false
          ),
          add_data AS (
            INSERT INTO "tblShotType" ("wrName", "wrImage", "wrIsActive", "wrDisplayOrder")
            SELECT 
              $1, 
              $2, 
              $3, 
              (SELECT count FROM count_parent) + 1
            RETURNING *
          )
          SELECT 
              "wrId" AS "id",
              "wrName" AS "name",
              "wrImage" AS "image",
              "wrIsActive" AS "isActive",
              "wrDisplayOrder" AS "displayOrder"
          FROM add_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.name, data.image || null, data.isActive || false],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableShotType.js/insertShotTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateShotTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `Update "tblShotType" set 
              "wrName" = $1,"wrImage" = $2,"wrIsActive" = $3
              where "wrId" = $4
          RETURNING 
              "wrId" AS "id",
              "wrName" AS "name",
              "wrImage" AS "image",
              "wrIsActive" AS "isActive",
              "wrDisplayOrder" AS "displayOrder";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.name, data.image || null, data.isActive || false, data.id],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableShotType.js/updateShotTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteShotTypeQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblShotType" set
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        where "wrId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableShotType.js/deleteShotTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

async function changeDisplayOrderQuery(body, request, fastify) {
  try {
    return await fastify.db.query(
      `update "tblShotType" set "wrDisplayOrder" = $1 where "wrId" = $2 `,
      {
        bind: [body.displayOrder, body.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableShotType.js/changeDisplayOrderQuery",
      request
    );
    throw new Error(err.message);
  }
}

const isActiveInactiveChangeQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `update "tblShotType" set "wrIsActive" = $1 where "wrId" = $2`,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableShotType.js/isActiveInactiveChangeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllShotTypesQuery,
  insertShotTypeQuery,
  updateShotTypeQuery,
  deleteShotTypeQuery,
  changeDisplayOrderQuery,
  isActiveInactiveChangeQuery,
};

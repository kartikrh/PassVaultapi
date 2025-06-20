const { errorLogger } = require("../utilities/logger");

const getAllPythonAPIsQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT 
              "wrId" AS "id",
              "wrDeveloperName" AS "developerName",
              "wrURI" AS "URI",
              "wrIsActive" AS "isActive",
              "wrIsDefault" AS "isDefault",
              "wrCreatedBy" AS "createdBy",
              "wrCreatedAt" AS "createdAt",
              "wrUpdatedBy" AS "updatedBy",
              "wrUpdatedAt" AS "updatedAt"
          FROM "tblPythonAPI"`,
        { type: fastify.db.QueryTypes.SELECT }
    );
};

const insertPythonAPIQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
              INSERT INTO "tblPythonAPI" (
              "wrDeveloperName", "wrURI", "wrIsActive", "wrIsDefault", "wrCreatedBy", "wrCreatedAt"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, NOW()
              ) 
              RETURNING *
              )        
              SELECT 
                "wrId" AS "id",
                "wrDeveloperName" AS "developerName",
                "wrURI" AS "URI",
                "wrIsActive" AS "isActive",
                "wrIsDefault" AS "isDefault",
                "wrCreatedBy" AS "createdBy",
                "wrCreatedAt" AS "createdAt",
                "wrUpdatedBy" AS "updatedBy",
                "wrUpdatedAt" AS "updatedAt"
              FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.developerName || null,
                    data.URI || null,
                    data.isActive || false,
                    data.isDefault || false,
                    request.userTokenInfo.WrUserId || null
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePythonAPI.js/insertPythonAPIQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updatePythonAPIQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `Update "tblPythonAPI" set 
            "wrDeveloperName" = $1,
            "wrURI" = $2,
            "wrIsActive" = $3,
            "wrIsDefault" = $4,
            "wrUpdatedBy" = $5, 
            "wrUpdatedAt" = NOW()
            where "wrId" = $6
            RETURNING 
                "wrId" AS "id",
                "wrDeveloperName" AS "developerName",
                "wrURI" AS "URI",
                "wrIsActive" AS "isActive",
                "wrIsDefault" AS "isDefault",
                "wrCreatedBy" AS "createdBy",
                "wrCreatedAt" AS "createdAt",
                "wrUpdatedBy" AS "updatedBy",
                "wrUpdatedAt" AS "updatedAt"`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.developerName,
                    data.URI,
                    data.isActive,
                    data.isDefault,
                    request.userTokenInfo.WrUserId || null,
                    data.id,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePythonAPI.js/updatePythonAPIQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deletePythonAPIQuery = async (ids, fastify, request) => {
    try {
        await fastify.db.query(
            `DELETE FROM "tblPythonAPI"
            WHERE "wrId" = ANY($1)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [ids],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePythonAPI.js/deletePythonAPIQuery",
            request
        );
        throw new Error(err.message);
    }
};
const activeInactivePythonAPIQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblPythonAPI" SET
                    "wrIsActive" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isActive, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TablePythonAPI.js/activeInactivePythonAPIQuery",
        request
      );
      throw new Error(err.message);
    }
};
const isDefaultChangeQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblPythonAPI" SET "wrIsDefault" = $1 where "wrId" = $2`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [data.isDefault, data.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePythonAPI.js/isDefaultChangeQuery",
            request
        );
        throw new Error(err.message);
    }
};

const isDefaultFalseQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblPythonAPI" SET "wrIsDefault" = $1 WHERE "wrId" != $2`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [false, data.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePythonAPI.js/isDefaultFalseQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllPythonAPIsQuery,
    insertPythonAPIQuery,
    updatePythonAPIQuery,
    activeInactivePythonAPIQuery,
    deletePythonAPIQuery,
    isDefaultChangeQuery,
    isDefaultFalseQuery,
};

const { errorLogger } = require("../utilities/logger");

const getAllNotificationConfigsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrEventName" as "eventName",
                "wrContent" as "content",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM "tblNotificationConfig";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableNotificationConfig.js/getAllNotificationConfigsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertNotificationConfigQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblNotificationConfig" (
            "wrEventName", "wrContent", "wrIsActive", "wrCreatedAt", "wrCreatedBy"
            ) 
            VALUES (
                $1, $2, $3, NOW(), $4
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrEventName" as "eventName",
                "wrContent" as "content",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.eventName,
                    data.content,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableNotificationConfig.js/insertNotificationConfigQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateNotificationConfigQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblNotificationConfig" SET 
                "wrEventName" = $1,
                "wrContent" = $2,
                "wrIsActive" = $3,
                "wrUpdatedBy" = $4,
                "wrUpdatedAt" = NOW()
            WHERE "wrId" = $5
            RETURNING 
                "wrId" as "id",
                "wrEventName" as "eventName",
                "wrContent" as "content",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.eventName,
                    data.content,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.id
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableNotificationConfig.js/updateNotificationConfigQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteNotificationConfigQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblNotificationConfig" 
            WHERE "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableNotificationConfig.js/deleteNotificationConfigQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveNotificationConfigQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `UPDATE "tblNotificationConfig" SET
          "wrIsActive" = $1
        WHERE "wrId" = $2`,
        {
          bind: [data.isActive, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableNotificationConfig.js/activeInactiveNotificationConfigQuery",
        request
      );
      throw new Error(err.message);
    }
};

const getNotificationConfigsByEventNameQuery = async (eventName, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrEventName" as "eventName",
                "wrContent" as "content",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM "tblNotificationConfig"
            WHERE "wrEventName" = $1;`,
            { 
                type: fastify.db.QueryTypes.SELECT,
                bind: [eventName]
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableNotificationConfig.js/getAllNotificationConfigsQuery",
            null
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllNotificationConfigsQuery,
    insertNotificationConfigQuery,
    updateNotificationConfigQuery,
    deleteNotificationConfigQuery,
    activeInactiveNotificationConfigQuery,
    getNotificationConfigsByEventNameQuery,
};
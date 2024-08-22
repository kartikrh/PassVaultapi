const { errorLogger } = require("../utilities/logger");

const allMailSettingsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrEmail" as "email",
            "wrUserName" as "userName",
            "wrPassword" as "password",
            "wrMailType" as "mailType",
            "wrSmtpAddress" as "smtpAddress",
            "wrPortNumber" as "portNumber",
            "wrIsEnableSSL" as "isEnableSSL",
            "wrIsActive" as "isActive",
            "wrIsDefault" as "isDefault",
            "wrCreatedBy" as "createdBy",
            "wrCreatedDate" as "createdDate",
            "wrModifiedBy" as "modifiedBy",
            "wrModifiedDate" as "modifiedDate"
            FROM "tblMailSettings" ORDER BY "wrId" asc;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/allMailSettingsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertMailSettingsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblMailSettings" (
            "wrEmail", "wrUserName", "wrPassword", "wrMailType", "wrSmtpAddress",
            "wrPortNumber", "wrIsEnableSSL", "wrIsActive", "wrIsDefault", "wrCreatedDate", "wrCreatedBy"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10
            ) 
            RETURNING *
            )        
            SELECT 
            "wrId" AS "id",
            "wrEmail" AS "email",
            "wrUserName" AS "userName",
            "wrPassword" AS "password",
            "wrMailType" AS "mailType",
            "wrSmtpAddress" AS "smtpAddress",
            "wrPortNumber" AS "portNumber",
            "wrIsEnableSSL" AS "isEnableSSL",
            "wrIsActive" AS "isActive",
            "wrIsDefault" AS "isDefault",
            "wrCreatedDate" AS "createdDate",
            "wrCreatedBy" AS "createdBy"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.email,
                    data.userName,
                    data.password,
                    data.mailType,
                    data.smtpAddress || null,
                    data.portNumber || null,
                    data.isEnableSSL || false,
                    data.isActive || false,
                    data.isDefault || false,
                    data.userId
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/insertMailSettingsQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateMailSettingsQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `Update "tblMailSettings" set 
            "wrEmail" = $1,"wrUserName" = $2,"wrPassword" = $3,"wrMailType" = $4,
            "wrSmtpAddress" = $5,"wrPortNumber" = $6,"wrIsEnableSSL" = $7, "wrIsActive" = $8, "wrIsDefault" = $9, "wrModifiedDate" = now(), "wrModifiedBy" = $10
            where "wrId" = $11;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.email,
                    data.userName,
                    data.password,
                    data.mailType,
                    data.smtpAddress,
                    data.portNumber,
                    data.isEnableSSL,
                    data.isActive,
                    data.isDefault || false,
                    data.userId,
                    data.id
                ],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/updateMailSettingsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteMailSettingsQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `delete from "tblMailSettings" where "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/deleteMailSettingsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const isDefaultChangeQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblMailSettings" SET "wrIsDefault" = $1 where "wrId" = $2`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [data.isDefault, data.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/deleteMailSettingsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const isDefaultFalseQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblMailSettings" SET "wrIsDefault" = $1 WHERE "wrId" != $2 AND "wrMailType" = $3`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [false, data.id, data.mailType],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMailSettings.js/deleteMailSettingsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveMailSettingsQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  update "tblMailSettings" set
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
        "DB ERROR --> repository/TableMailSettings.js/activeInactiveMailSettingsQuery",
        request
      );
      throw new Error(err.message);
    }
  };

module.exports = {
    allMailSettingsQuery,
    insertMailSettingsQuery,
    updateMailSettingsQuery,
    deleteMailSettingsQuery,
    isDefaultChangeQuery,
    isDefaultFalseQuery,
    activeInactiveMailSettingsQuery
};

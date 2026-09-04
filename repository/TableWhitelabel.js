const { errorLogger } = require("../utilities/logger");

const getAllWhitelabelsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT
                tw."wrId" as "id",
                ed."wrValue" as "whitelabelId",
                tw."wrDomain" as "domain",
                tw."wrImagepath" as "imagePath",
                tw."wrLogo" as "logo",
                tw."wrFavicon" as "favicon",
                tw."wrIsActive" as "isActive",
                tw."wrCreatedAt" as "createdAt",
                tw."wrCreatedBy" as "createdBy",
                tw."wrUpdatedBy" as "updatedBy",
                tw."wrUpdatedAt" as "updatedAt",
                tw."wrIsDemoClientLogin" as "isDemoClientLogin",
                tw."wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                tw."wrIsRecatchaEnable" as "isRecatchEnable",
                tw."wrRecatchKey" as "recatchKey",
                tw."wrRecatchSecret" as "recatchSecret",
                tw."wrIsGoogleLogin" as "isGoogleLogin",
                tw."wrGoogle_Key" as "googleKey",
                tw."wrGoogle_Secret" as "googleSecret",
                tw."wrClientOTP" as "clientOTP",
                tw."wrIsDefault" as "isDefault",
                tw."wrMailSettingId" as "mailSettingId",
                ms."wrEmail" as "mailSettingEmail",
                ed."wrValue" as "encryptedWhitelabelId"
            FROM "tblWhitelabel" tw
            LEFT JOIN "tblEncryptedData" ed ON tw."wrId" = ed."wrKey"
            LEFT JOIN "tblMailSettings" ms ON tw."wrMailSettingId" = ms."wrId"
            WHERE tw."wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/getAllWhitelabelsQuery",
            null
        );
        throw new Error(err.message);
    }
};
const insertWhitelabelQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblWhitelabel" (
            "wrDomain", "wrImagepath", "wrLogo", "wrFavicon", "wrIsActive", "wrCreatedAt", "wrCreatedBy", "wrIsDemoClientEnableInIOS", "wrIsDemoClientLogin",
            "wrIsRecatchaEnable", "wrRecatchKey", "wrRecatchSecret", "wrIsGoogleLogin", "wrGoogle_Key", "wrGoogle_Secret", "wrClientOTP", "wrIsDefault", "wrMailSettingId"
            )
            VALUES (
                $1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            )
            RETURNING *
            )
            SELECT
                insert_data."wrId" as "id",
                "wrValue" as "whitelabelId",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrLogo" as "logo",
                "wrFavicon" as "favicon",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrRecatchSecret" as "recatchSecret",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrGoogle_Secret" as "googleSecret",
                "wrClientOTP" as "clientOTP",
                "wrIsDefault" as "isDefault",
                "wrMailSettingId" as "mailSettingId",
                ed."wrValue" as "encryptedWhitelabelId"
            FROM insert_data
            LEFT JOIN "tblEncryptedData" ed ON insert_data."wrId" = ed."wrKey"
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.domain,
                    data.imagePath || null,
                    data.logo || null,
                    data.favicon || null,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.isDemoClientEnableInIOS || false,
                    data.isDemoClientLogin || false,
                    data.isRecatchEnable || false,
                    data.recatchKey || null,
                    data.recatchSecret || null,
                    data.isGoogleLogin || false,
                    data.googleKey || null,
                    data.googleSecret || null,
                    data.clientOTP || null,
                    data.isDefault || false,
                    data.mailSettingId || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/insertWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateWhitelabelQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblWhitelabel" SET
                "wrDomain" = $1,
                "wrImagepath" = $2,
                "wrLogo" = $16,
                "wrFavicon" = $17,
                "wrIsActive" = $3,
                "wrUpdatedBy" = $4,
                "wrUpdatedAt" = NOW(),
                "wrIsDemoClientEnableInIOS" = $6,
                "wrIsDemoClientLogin" = $7,
                "wrIsRecatchaEnable" = $8,
                "wrRecatchKey" = $9,
                "wrIsGoogleLogin" = $10,
                "wrGoogle_Key" = $11,
                "wrGoogle_Secret" = $12,
                "wrClientOTP" = $13,
                "wrIsDefault" = $14,
                "wrMailSettingId" = $15,
                "wrRecatchSecret" = $18
            WHERE "wrId" = $5
            RETURNING
                "wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrLogo" as "logo",
                "wrFavicon" as "favicon",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrRecatchSecret" as "recatchSecret",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrGoogle_Secret" as "googleSecret",
                "wrClientOTP" as "clientOTP",
                "wrIsDefault" as "isDefault",
                "wrMailSettingId" as "mailSettingId";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.domain,
                    data.imagePath,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.id,
                    data.isDemoClientEnableInIOS || false,
                    data.isDemoClientLogin || false,
                    data.isRecatchEnable,
                    data.recatchKey,
                    data.isGoogleLogin,
                    data.googleKey,
                    data.googleSecret,
                    data.clientOTP,
                    data.isDefault,
                    data.mailSettingId || null,
                    data.logo || null,
                    data.favicon || null,
                    data.recatchSecret || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/updateWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteWhitelabelQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblWhitelabel" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrId" = ANY ($3)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [true, request.userTokenInfo.WrUserId, id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/deleteWhitelabelQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactiveWhitelabelQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblWhitelabel" SET
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
        "DB ERROR --> repository/TableWhitelabel.js/activeInactiveWhitelabelQuery",
        request
      );
      throw new Error(err.message);
    }
};
const demoClientEnableInIOSWhitelabelQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblWhitelabel" SET
                    "wrIsDemoClientEnableInIOS" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isDemoClientEnableInIOS, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableWhitelabel.js/demoClientEnableInIOSWhitelabelQuery",
        request
      );
      throw new Error(err.message);
    }
};
const isDemoClientLoginQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblWhitelabel" SET
                    "wrIsDemoClientLogin" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isDemoClientLogin, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableWhitelabel.js/isDemoClientLoginQuery",
        request
      );
      throw new Error(err.message);
    }
};
const getAllEncryptWhitelabelsQuery = async (fastify, whereCondition = null) => {
    try {
        return await fastify.db.query(
            `SELECT
                ed."wrValue" as "whitelabelId",
                tw."wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrLogo" as "logo",
                "wrFavicon" as "favicon",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrRecatchSecret" as "recatchSecret",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrGoogle_Secret" as "googleSecret",
                "wrClientOTP" as "clientOTP",
                tw."wrIsDefault" as "isDefault",
                tw."wrMailSettingId" as "mailSettingId",
                ed."wrValue" as "encryptedWhitelabelId"
            FROM "tblWhitelabel" tw
            left join "tblEncryptedData" ed on tw."wrId" = ed."wrKey"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            {
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWhitelabel.js/getAllEncryptWhitelabelsQuery",
            null
        );
        throw new Error(err.message);
    }
};
const getEncryptWhitelabelQuery = async (id, request, fastify)=>{
    try {
      const res = await fastify.db.query(
            `
              SELECT "wrKey" as "id"
              FROM "tblEncryptedData"
              WHERE "wrValue" = $1
            `,
            {
              type: fastify.db.QueryTypes.SELECT,
              bind: [id],
            }
          );
          return res[0];
    } catch (error) {
      errorLogger(
        fastify,
        error.message,
        "DB ERROR --> repository/TableWhitelabel.js/getEncryptWhitelabelQuery",
        request
      );
      throw new Error(error.message);
    }
}
const isDefaultUpQuery = async (data, request, fastify) => {
    try {
      if (data.isDefault) {
        await fastify.db.query(
          `
                  UPDATE "tblWhitelabel" SET
                    "wrIsDefault" = FALSE
                  WHERE "wrIsDefault" = TRUE
                  AND "wrId" != $1
                  AND "wrIsDeleted" = FALSE
              `,
          {
            type: fastify.db.QueryTypes.UPDATE,
            bind: [data.id],
          }
        );
        await fastify.db.query(
          `
                  UPDATE "tblWhitelabel" SET
                    "wrIsDefault" = TRUE
                  WHERE "wrId" = $1
              `,
          {
            type: fastify.db.QueryTypes.UPDATE,
            bind: [data.id],
          }
        );
        return true;
      }

      return await fastify.db.query(
        `
                  UPDATE "tblWhitelabel" SET
                    "wrIsDefault" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isDefault ,data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TableWhitelabel.js/isDefaultUpQuery",
        request
      );
      throw new Error(err.message);
    }
};
module.exports = {
    getAllWhitelabelsQuery,
    insertWhitelabelQuery,
    updateWhitelabelQuery,
    deleteWhitelabelQuery,
    activeInactiveWhitelabelQuery,
    demoClientEnableInIOSWhitelabelQuery,
    isDemoClientLoginQuery,
    getAllEncryptWhitelabelsQuery,
    getEncryptWhitelabelQuery,
    isDefaultUpQuery
};

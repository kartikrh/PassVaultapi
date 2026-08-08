const { errorLogger } = require("../utilities/logger");

const getAllWhitelabelsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                tw."wrId" as "id",
                "wrValue" as "whitelabelId",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrIsFacebookLogin" as "isFacebookLogin",
                "wrFacebook_Key" as "facebookKey",
                "wrMobilegoogleFirebase_Key" as "mobileGoogleFirebaseKey",
                "wrMobilegoogleFirebase_Url" as "mobileGoogleFirebaseUrl",
                "wrIsSendMobileOTP" as "isSendMobileOTP",
                "wrSendMobileOTPType" as "sendMobileOTPType",
                "wrSendMobileOTP_MaxSendlimit" as "sendMobileOTPMaxSendLimit",
                "wrMobileOTP_AUTHKEY" as "mobileOTPAuthKey",
                "wrMobileOTP_EXPIRED" as "mobileOTPExpired",
                "wrMobileOTP_SendURL" as "mobileOTPSendUrl",
                "wrMobileOTP_RESENDURL" as "mobileOTPResendUrl",
                "wrMobileOTP_FORGOTURL" as "mobileOTPForgotUrl",
                "wrMobileSemlessOTP_Key" as "mobileSemlessOTPKey",
                "wrIsSendMailOTP" as "isSendMailOTP",
                "wrSendMailType" as "sendMailType",
                "wrMobileOTPVerify" as "mobileOTPVerify",
                "wrSendMail_MaxSendlimit" as "sendMailMaxSendLimit",
                "wrClientOTP" as "clientOTP",
                "wrIsDefault" as "isDefault",
                ed."wrValue" as "encryptedWhitelabelId"
            FROM "tblWhitelabel" tw
            LEFT JOIN "tblEncryptedData" ed ON tw."wrId" = ed."wrKey"
            WHERE "wrIsDeleted" = FALSE;`,
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
            "wrDomain", "wrImagepath", "wrIsActive", "wrCreatedAt", "wrCreatedBy", "wrIsDemoClientEnableInIOS" , "wrIsDemoClientLogin",
            "wrIsRecatchaEnable", "wrRecatchKey", "wrIsGoogleLogin", "wrGoogle_Key", "wrIsFacebookLogin", 
            "wrFacebook_Key", "wrMobilegoogleFirebase_Key", "wrMobilegoogleFirebase_Url", "wrIsSendMobileOTP",
            "wrSendMobileOTPType", "wrSendMobileOTP_MaxSendlimit", "wrMobileOTP_AUTHKEY", "wrMobileOTP_EXPIRED", 
            "wrMobileOTP_SendURL", "wrMobileOTP_RESENDURL", "wrMobileOTP_FORGOTURL", "wrMobileSemlessOTP_Key", 
            "wrIsSendMailOTP", "wrSendMailType", "wrSendMail_MaxSendlimit", "wrMobileOTPVerify", "wrClientOTP", "wrIsDefault"
            ) 
            VALUES (
                $1, $2, $3, NOW(), $4, $5 ,$6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
            )
            RETURNING *
            )
            SELECT 
                insert_data."wrId" as "id",
                "wrValue" as "whitelabelId",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrIsFacebookLogin" as "isFacebookLogin",
                "wrFacebook_Key" as "facebookKey",
                "wrMobilegoogleFirebase_Key" as "mobileGoogleFirebaseKey",
                "wrMobilegoogleFirebase_Url" as "mobileGoogleFirebaseUrl",
                "wrIsSendMobileOTP" as "isSendMobileOTP",
                "wrSendMobileOTPType" as "sendMobileOTPType",
                "wrSendMobileOTP_MaxSendlimit" as "sendMobileOTPMaxSendLimit",
                "wrMobileOTP_AUTHKEY" as "mobileOTPAuthKey",
                "wrMobileOTP_EXPIRED" as "mobileOTPExpired",
                "wrMobileOTP_SendURL" as "mobileOTPSendUrl",
                "wrMobileOTP_RESENDURL" as "mobileOTPResendUrl",
                "wrMobileOTP_FORGOTURL" as "mobileOTPForgotUrl",
                "wrMobileSemlessOTP_Key" as "mobileSemlessOTPKey",
                "wrIsSendMailOTP" as "isSendMailOTP",
                "wrSendMailType" as "sendMailType",
                "wrMobileOTPVerify" as "mobileOTPVerify",
                "wrSendMail_MaxSendlimit" as "sendMailMaxSendLimit",
                "wrClientOTP" as "clientOTP",
                "wrIsDefault" as "isDefault",
                ed."wrValue" as "encryptedWhitelabelId"
            FROM insert_data
            LEFT JOIN "tblEncryptedData" ed ON insert_data."wrId" = ed."wrKey"
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.domain,
                    data.imagePath || null,
                    data.isActive,
                    request.userTokenInfo.WrUserId,
                    data.isDemoClientEnableInIOS || false,
                    data.isDemoClientLogin || false,
                    data.isRecatchEnable || false,
                    data.recatchKey || null,
                    data.isGoogleLogin || false,
                    data.googleKey || null,
                    data.isFacebookLogin || false,
                    data.facebookKey || null,
                    data.mobileGoogleFirebaseKey || null,
                    data.mobileGoogleFirebaseUrl || null,
                    data.isSendMobileOTP || false,
                    data.sendMobileOTPType || null,
                    data.sendMobileOTPMaxSendLimit || null,
                    data.mobileOTPAuthKey || null,
                    data.mobileOTPExpired || null,
                    data.mobileOTPSendUrl || null,
                    data.mobileOTPResendUrl || null,
                    data.mobileOTPForgotUrl || null,
                    data.mobileSemlessOTPKey || null,
                    data.isSendMailOTP || false,
                    data.sendMailType || null,
                    data.sendMailMaxSendLimit || null,
                    data.mobileOTPVerify || null,
                    data.clientOTP || null,
                    data.isDefault || false,
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
                "wrIsActive" = $3,
                "wrUpdatedBy" = $4,
                "wrUpdatedAt" = NOW(),
                "wrIsDemoClientEnableInIOS" = $6,
                "wrIsDemoClientLogin" = $7,
                "wrIsRecatchaEnable" = $8,
                "wrRecatchKey" = $9,
                "wrIsGoogleLogin" = $10,
                "wrGoogle_Key" = $11,
                "wrIsFacebookLogin" = $12,
                "wrFacebook_Key" = $13,
                "wrMobilegoogleFirebase_Key" = $14,
                "wrMobilegoogleFirebase_Url" = $15,
                "wrIsSendMobileOTP" = $16,
                "wrSendMobileOTPType" = $17,
                "wrSendMobileOTP_MaxSendlimit" = $18,
                "wrMobileOTP_AUTHKEY" = $19,
                "wrMobileOTP_EXPIRED" = $20,
                "wrMobileOTP_SendURL" = $21,
                "wrMobileOTP_RESENDURL" = $22,
                "wrMobileOTP_FORGOTURL" = $23,
                "wrMobileSemlessOTP_Key" = $24,
                "wrIsSendMailOTP" = $25,
                "wrSendMailType" = $26,
                "wrSendMail_MaxSendlimit" = $27,
                "wrMobileOTPVerify" = $28,
                "wrClientOTP" = $29,
                "wrIsDefault" = $30
            WHERE "wrId" = $5
            RETURNING 
                "wrId" as "id",
                "wrDomain" as "domain",
                "wrImagepath" as "imagePath",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrIsFacebookLogin" as "isFacebookLogin",
                "wrFacebook_Key" as "facebookKey",
                "wrMobilegoogleFirebase_Key" as "mobileGoogleFirebaseKey",
                "wrMobilegoogleFirebase_Url" as "mobileGoogleFirebaseUrl",
                "wrIsSendMobileOTP" as "isSendMobileOTP",
                "wrSendMobileOTPType" as "sendMobileOTPType",
                "wrSendMobileOTP_MaxSendlimit" as "sendMobileOTPMaxSendLimit",
                "wrMobileOTP_AUTHKEY" as "mobileOTPAuthKey",
                "wrMobileOTP_EXPIRED" as "mobileOTPExpired",
                "wrMobileOTP_SendURL" as "mobileOTPSendUrl",
                "wrMobileOTP_RESENDURL" as "mobileOTPResendUrl",
                "wrMobileOTP_FORGOTURL" as "mobileOTPForgotUrl",
                "wrMobileSemlessOTP_Key" as "mobileSemlessOTPKey",
                "wrIsSendMailOTP" as "isSendMailOTP",
                "wrSendMailType" as "sendMailType",
                "wrMobileOTPVerify" as "mobileOTPVerify",
                "wrSendMail_MaxSendlimit" as "sendMailMaxSendLimit",
                "wrClientOTP" as "clientOTP",
                "wrIsDefault" as "isDefault";`,
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
                    data.isFacebookLogin,
                    data.facebookKey,
                    data.mobileGoogleFirebaseKey,
                    data.mobileGoogleFirebaseUrl,
                    data.isSendMobileOTP,
                    data.sendMobileOTPType,
                    data.sendMobileOTPMaxSendLimit,
                    data.mobileOTPAuthKey,
                    data.mobileOTPExpired,
                    data.mobileOTPSendUrl,
                    data.mobileOTPResendUrl,
                    data.mobileOTPForgotUrl,
                    data.mobileSemlessOTPKey,
                    data.isSendMailOTP,
                    data.sendMailType,
                    data.sendMailMaxSendLimit,
                    data.mobileOTPVerify,
                    data.clientOTP,
                    data.isDefault,
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
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt",
                "wrIsDemoClientLogin" as "isDemoClientLogin",
                "wrIsDemoClientEnableInIOS" as "isDemoClientEnableInIOS",
                "wrIsRecatchaEnable" as "isRecatchEnable",
                "wrRecatchKey" as "recatchKey",
                "wrIsGoogleLogin" as "isGoogleLogin",
                "wrGoogle_Key" as "googleKey",
                "wrIsFacebookLogin" as "isFacebookLogin",
                "wrFacebook_Key" as "facebookKey",
                "wrMobilegoogleFirebase_Key" as "mobileGoogleFirebaseKey",
                "wrMobilegoogleFirebase_Url" as "mobileGoogleFirebaseUrl",
                "wrIsSendMobileOTP" as "isSendMobileOTP",
                "wrSendMobileOTPType" as "sendMobileOTPType",
                "wrSendMobileOTP_MaxSendlimit" as "sendMobileOTPMaxSendLimit",
                "wrMobileOTP_AUTHKEY" as "mobileOTPAuthKey",
                "wrMobileOTP_EXPIRED" as "mobileOTPExpired",
                "wrMobileOTP_SendURL" as "mobileOTPSendUrl",
                "wrMobileOTP_RESENDURL" as "mobileOTPResendUrl",
                "wrMobileOTP_FORGOTURL" as "mobileOTPForgotUrl",
                "wrMobileSemlessOTP_Key" as "mobileSemlessOTPKey",
                "wrIsSendMailOTP" as "isSendMailOTP",
                "wrSendMailType" as "sendMailType",
                "wrMobileOTPVerify" as "mobileOTPVerify",
                "wrSendMail_MaxSendlimit" as "sendMailMaxSendLimit",
                "wrClientOTP" as "clientOTP",
                tw."wrIsDefault" as "isDefault",
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
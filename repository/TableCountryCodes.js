const { errorLogger } = require("../utilities/logger");

const getAllCountryCodesQuery = async (fastify) => {
  const result = await fastify.db.query(
    `SELECT 
          "wrId" as "id",
          "wrCountryCode" as "countryCode",
          "wrCountryName" as "countryName",
          "wrFlag" as "flag",
          "wrFlagPath" as "flagPath",
          "wrIsActive" as "isActive",
          "wrMaxNumber" as "maxNumber",
          "wrShortName" as "shortName",
          "wrTimezone" as "timezone"
      FROM "tblCountryCodes"
      WHERE "wrIsDeleted" = FALSE;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
  return result;
};

const insertCountryCodeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
            INSERT INTO "tblCountryCodes" (
            "wrCountryCode", "wrCountryName", "wrFlag", "wrFlagPath", "wrIsActive", "wrMaxNumber",
            "wrShortName", "wrTimezone"
            ) 
            VALUES (
                $1, $2, $3, $4, $5 ,$6 ,$7, $8
            ) 
            RETURNING *
            )        
            SELECT 
                "wrId" as "id",
                "wrCountryCode" as "countryCode",
                "wrCountryName" as "countryName",
                "wrFlag" as "flag",
                "wrFlagPath" as "flagPath",
                "wrIsActive" as "isActive",
                "wrMaxNumber" as "maxNumber",
                "wrShortName" as "shortName",
                "wrTimezone" as "timezone"
            FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.countryCode || null,
          data.countryName || null,
          data.flag || null,
          data.flagPath || null,
          data.isActive || false,
          data.maxNumber || null,
          data.shortName || null,
          data.timezone || null,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCountryCode.js/insertCountryCodeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateCountryCodeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCountryCodes" SET 
            "wrCountryCode" = $1,
            "wrCountryName" = $2,
            "wrFlag" = $3,
            "wrFlagPath" = $5,
            "wrIsActive" = $6,
            "wrMaxNumber" = $7,
            "wrShortName" = $8,
            "wrTimezone" = $9
            WHERE "wrId" = $4
            RETURNING 
                "wrId" as "id",
                "wrCountryCode" as "countryCode",
                "wrCountryName" as "countryName",
                "wrFlag" as "flag",
                "wrFlagPath" as "flagPath",
                "wrIsActive" as "isActive",
                 "wrMaxNumber" as "maxNumber",
                "wrShortName" as "shortName",
                "wrTimezone" as "timezone";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.countryCode,
            data.countryName,
            data.flag,
            data.id,
            data.flagPath,
            data.isActive,
            data.maxNumber,
            data.shortName || null,
            data.timezone,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCountryCode.js/updateCountryCodeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCountryCodeQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCountryCodes" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrId" = ANY($3);`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCountryCode.js/deleteCountryCodeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveCountryCodeQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblCountryCodes" SET "wrIsActive" = $1 WHERE "wrId" = $2`,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCountryCode.js/activeInactiveCountryCodeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
    getAllCountryCodesQuery,
    insertCountryCodeQuery,
    updateCountryCodeQuery,
    deleteCountryCodeQuery,
    activeInactiveCountryCodeQuery,
};

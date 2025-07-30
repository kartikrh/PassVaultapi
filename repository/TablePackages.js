const { errorLogger } = require("../utilities/logger");

const getAllPackagesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrName" as "name",
                "wrDescription" as "description",
                "wrPrice" as "price",
                "wrCurrency" as "currency",
                "wrIntervalType" as "intervalType",
                "wrIntervalCount" as "intervalCount",
                "wrRazorPayPlanId" as "razorPayPlanId",
                "wrIsActive" as "isActive",
                "wrIsDisplay" as "isDisplay",
                "wrDisplayOrder" as "displayOrder",
                "wrTrialDays" as "trailDays",
                "wrIsDefault" as "isDefault",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM "tblPackages"
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePackages.js/getAllPackagesQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertPackagesQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblPackages" (
            "wrName", "wrDescription", "wrPrice", "wrCurrency", "wrIntervalType", "wrIntervalCount",
            "wrRazorPayPlanId", "wrIsActive", "wrIsDisplay", "wrDisplayOrder", "wrTrialDays", "wrIsDefault",
            "wrCreatedAt", "wrCreatedBy"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                (SELECT COALESCE((SELECT MAX("wrDisplayOrder") FROM "tblPackages"), 0) + 1),
                $10, $11, NOW(), $12
            ) 
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrName" as "name",
                "wrDescription" as "description",
                "wrPrice" as "price",
                "wrCurrency" as "currency",
                "wrIntervalType" as "intervalType",
                "wrIntervalCount" as "intervalCount",
                "wrRazorPayPlanId" as "razorPayPlanId",
                "wrIsActive" as "isActive",
                "wrIsDisplay" as "isDisplay",
                "wrDisplayOrder" as "displayOrder",
                "wrTrialDays" as "trailDays",
                "wrIsDefault" as "isDefault",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.name,
                    data.description,
                    data.price,
                    data.currency,
                    data.intervalType,
                    data.intervalCount,
                    // data.razorPayPlanId,
                    null,
                    data.isActive,
                    data.isDisplay,
                    data.trailDays,
                    data.isDefault,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePackages.js/insertPackagesQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updatePackagesQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblPackages" SET 
                "wrName" = $1,
                "wrDescription" = $2,
                "wrPrice" = $3,
                "wrCurrency" = $4,
                "wrIntervalType" = $5,
                "wrIntervalCount" = $6,
                "wrIsActive" = $7,
                "wrIsDisplay" = $8,
                "wrTrialDays" = $9,
                "wrIsDefault" = $10,
                "wrUpdatedBy" = $11,
                "wrUpdatedAt" = now()
            WHERE "wrId" = $12
            RETURNING 
                "wrId" as "id",
                "wrName" as "name",
                "wrDescription" as "description",
                "wrPrice" as "price",
                "wrCurrency" as "currency",
                "wrIntervalType" as "intervalType",
                "wrIntervalCount" as "intervalCount",
                "wrRazorPayPlanId" as "razorPayPlanId",
                "wrIsActive" as "isActive",
                "wrIsDisplay" as "isDisplay",
                "wrDisplayOrder" as "displayOrder",
                "wrTrialDays" as "trailDays",
                "wrIsDefault" as "isDefault",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy",
                "wrUpdatedBy" as "updatedBy",
                "wrUpdatedAt" as "updatedAt";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.name,
                    data.description,
                    data.price,
                    data.currency,
                    data.intervalType,
                    data.intervalCount,
                    data.isActive,
                    data.isDisplay,
                    data.trailDays,
                    data.isDefault,
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
            "DB ERROR --> repository/TablePackages.js/updatePackagesQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deletePackageQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `update "tblPackages" set
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
            "DB ERROR --> repository/TablePackages.js/deletePackageQuery",
            request
        );
        throw new Error(err.message);
    }
};

const activeInactivePackageQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblPackages" SET
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
        "DB ERROR --> repository/TablePackages.js/activeInactivePackageQuery",
        request
      );
      throw new Error(err.message);
    }
};

const isDisplayPackageQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblPackages" SET
                    "wrIsDisplay" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isDisplay, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TablePackages.js/isDisplayPackageQuery",
        request
      );
      throw new Error(err.message);
    }
};

const isDefaultChangeQuery = async (data, request, fastify) => {
    try {
      return await fastify.db.query(
        `
                  UPDATE "tblPackages" SET
                    "wrIsDefault" = $1
                  WHERE "wrId" = $2
              `,
        {
          bind: [data.isDefault, data.id],
        }
      );
    } catch (err) {
      errorLogger(
        fastify,
        err.message,
        "DB ERROR --> repository/TablePackages.js/isDefaultChangeQuery",
        request
      );
      throw new Error(err.message);
    }
};

const updateDisplayOrderQuery = async (body,request, fastify) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblPackages" SET
                "wrDisplayOrder" = $1
            WHERE "wrId" in ($2) `,
            {
                bind: [body.displayOrder, body.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePackages.js/updateDisplayOrderQuery",
            request
        );
        throw new Error(err.message);
    }
}

const isDefaultFalseQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblPackages" SET "wrIsDefault" = $1 
            WHERE "wrId" != $2
            AND "wrIsDeleted" = false`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [false, id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablePackages.js/isDefaultFalseQuery",
            request
        );
        throw new Error(err.message);
    }
};
module.exports = {
    getAllPackagesQuery,
    insertPackagesQuery,
    updatePackagesQuery,
    deletePackageQuery,
    activeInactivePackageQuery,
    isDisplayPackageQuery,
    isDefaultChangeQuery,
    updateDisplayOrderQuery,
    isDefaultFalseQuery,
};
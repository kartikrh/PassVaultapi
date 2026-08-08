const { errorLogger } = require("../utilities/logger");
const { getPagination, autoImportStatusValues } = require("../utilities");

const getAllAutoImportDataQuery = async (request, fastify, whereCondition = undefined) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrErrorStackData" as "errorStackData",
                "wrESApiResponseData" as "esApiResponseData",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/getAllAutoImportDataQuery",
            request || null
        );
        throw new Error(err.message);
    }
};

const getAutoImportDataByIdQuery = async (whereCondition = undefined, request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrErrorStackData" as "errorStackData",
                "wrESApiResponseData" as "esApiResponseData",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            { type: fastify.db.QueryTypes.SELECT }
        );
        return result[0]
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/getAutoImportDataByIdQuery",
            request || null
        );
        throw new Error(err.message);
    }
};
const insertAutoImportDataQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblAutoImportData" (
            "wrRefId", "wrRefType", "wrSourceId", "wrIsImported", "wrIsImportStart", "wrImportStartTime",
            "wrImportEndTime", "wrCreatedBy", "wrCreateDate"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, NOW()
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrErrorStackData" as "errorStackData",
                "wrESApiResponseData" as "esApiResponseData",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.refId || null,
                    data.refType || null,
                    data.sourceId || null,
                    true,
                    data?.isImportStart || false,
                    data?.importStartTime || null,
                    null,
                    request.userTokenInfo?.WrUserId || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/insertAutoImportDataQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateAutoImportDataQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH updated_data AS (
            UPDATE "tblAutoImportData" SET 
                "wrRefId" = $1,
                "wrRefType" = $2,
                "wrSourceId" = $3,
                "wrIsImported" = $4,
                "wrIsImportStart" = $5,
                "wrImportStartTime" = $6,
                "wrImportEndTime" = $7,
                "wrErrorStackData" = $8,
                "wrESApiResponseData" = $9
            WHERE "wrId" = $10
            RETURNING *
        )
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrErrorStackData" as "errorStackData",
                "wrESApiResponseData" as "esApiResponseData",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM updated_data;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.refId,
                    data.refType,
                    data.sourceId,
                    data.isImported,
                    data.isImportStart,
                    data.importStartTime,
                    data.importEndTime,
                    data?.errorStackData,
                    data?.esApiResponseData || null,
                    data.id,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/updateAutoImportDataQuery",
            request
        );
        throw new Error(err.message);
    }
};
const deleteAutoImportDataQuery = async (id, request, fastify) => {
  try {
    return await fastify.db.query(
      `
           DELETE FROM "tblAutoImportData"
           WHERE "wrId" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAutoImportData/deleteAutoImportDataQuery",
      request
    );
    throw new Error(err.message);
  }
};

const allAutoImportDataLogsQuery = async (body, request, fastify) => {
    try {
        const { startDate, endDate, refType, autoImportStatus, page = 1, limit = 50 } = body;

        const whereConditions = [];
        const bind = [];
        let index = 1;

        if (startDate && endDate) {
            whereConditions.push(`"wrCreateDate" BETWEEN $${index} AND $${index + 1}`);
            bind.push(startDate, endDate);
            index += 2;
        }

        if (refType) {
            whereConditions.push(`"wrRefType" = $${index}`);
            bind.push(refType);
            index += 1;
        }

        if (autoImportStatusValues.includes(autoImportStatus)) {
            if (autoImportStatus === 1) {
                whereConditions.push(`"wrImportStartTime" IS NULL`);
            } else if (autoImportStatus === 2) {
                whereConditions.push(`"wrImportStartTime" IS NOT NULL AND "wrImportEndTime" IS NULL`);
            } else if (autoImportStatus === 3) {
                whereConditions.push(`"wrIsImported" = 'FALSE' AND "wrImportStartTime" IS NOT NULL AND "wrImportEndTime" IS NOT NULL`);
            } else if (autoImportStatus === 4) {
                whereConditions.push(`NULLIF(TRIM("wrErrorStackData"), '') IS NOT NULL`);
            }
        }

        const whereClause = whereConditions.length
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

        const [{ total }] = await fastify.db.query(
            `
                SELECT COUNT(*)::int AS total
                FROM "tblAutoImportData"
                LEFT JOIN "tblUsers" tu ON "tblAutoImportData"."wrCreatedBy" = tu."WrUserId"
                ${whereClause};
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind,
            }
        );

        const result = await fastify.db.query(
            `
                SELECT
                    "wrId" as "id",
                    "wrRefId" as "refId",
                    "wrRefType" as "refType",
                    "wrSourceId" as "sourceId",
                    "wrIsImported" as "isImported",
                    "wrIsImportStart" as "isImportStart",
                    "wrImportStartTime" as "importStartTime",
                    "wrImportEndTime" as "importEndTime",
                    "wrErrorStackData" as "errorStackData",
                    "wrESApiResponseData" as "esApiResponseData",
                    tu."WrName" as "createdBy",
                    "wrCreateDate" as "createdDate"
                FROM "tblAutoImportData"
                LEFT JOIN "tblUsers" tu ON "tblAutoImportData"."wrCreatedBy" = tu."WrUserId"
                ${whereClause}
                ORDER BY "tblAutoImportData"."wrCreateDate" DESC
                LIMIT $${index} OFFSET $${index + 1};
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    ...bind,
                    Number(limit),
                    (Number(page) - 1) * Number(limit),
                ],
            }
        );

        return {
            totalRecords: total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            data: result
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAutoImportData.js/allAutoImportDataLogsQuery",
            request
        );
        throw error;
    }
};

module.exports = {
    getAllAutoImportDataQuery,
    getAutoImportDataByIdQuery,
    insertAutoImportDataQuery,
    updateAutoImportDataQuery,
    deleteAutoImportDataQuery,
    allAutoImportDataLogsQuery,
};
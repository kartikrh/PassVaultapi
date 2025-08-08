const { errorLogger } = require("../utilities/logger");
const { getPagination } = require("../utilities");

const getAllAutoImportDataQuery = async (request, fastify) => {
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
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData";`,
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
                    false,
                    null,
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
                "wrImportEndTime" = $7
            WHERE "wrId" = $8
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

const allAutoImportDataLogsQuery = async (body ,request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrCreateDate" BETWEEN '${startDate}' AND '${endDate}'` : '';
        const query = `
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                tu."WrUserName" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData"
            LEFT JOIN "tblUsers" tu ON "tblAutoImportData"."wrCreatedBy" = tu."WrUserId"
            ${where}
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        }); 

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblAutoImportData"
            ${where}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAutoImportData.js/allAutoImportDataLogsQuery",
            request
        );
        throw new Error(err.message);
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
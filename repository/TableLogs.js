const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

// These log queries splice filter values into the SQL text; every such
// value goes through one of these first, so only a strict date or integer
// can ever reach the query (previously raw request input = SQL injection).
const sqlDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date filter");
    return date.toISOString();
};
const allErrorLogsQuery = async (body ,request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrCreatedDate" BETWEEN '${sqlDate(startDate)}' AND '${sqlDate(endDate)}'` : '';
        const query = `
            SELECT 
                logs."wrErrId" as "errId",
                logs."wrErrMessage" as "errMessage",
                logs."wrErrStack" as "errStack",
                logs."wrDomain" as "domain",
                logs."wrUserId" as "userId",
                logs."wrUserIp" as "userIp",
                logs."wrApi" as "api",
                logs."wrCreatedDate" as "createdDate",
                logs."wrRequestBody" as "requestBody",
                users."WrName" as "createdBy"
            FROM
            "tblErrorLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrUserId" = users."WrUserId"
            ${where}
            ORDER BY logs."wrErrId" DESC
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
            FROM "tblErrorLogs"
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
            "DB ERROR --> repository/TableLogs.js/allErrorLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};
module.exports = {
  allErrorLogsQuery,
};

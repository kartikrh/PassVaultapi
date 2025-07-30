const {
    getAllAutoImportDataQuery,
    getAutoImportDataByIdQuery,
    insertAutoImportDataQuery,
} = require("../repository/TableAutoImportData")

const getAllAutoImportDataService = async (request, fastify) => {
    const result = await getAllAutoImportDataQuery(request, fastify);
    return result || []
}

const insertAutoImportDataService = async (request, fastify) => {
    const { refId, refType, sourceId } = request.body;

    const whereCondition = `"wrRefId" = ${refId} AND "wrRefType" = ${refType} AND "wrSourceId" = ${sourceId} AND "wrIsImported" = true`;
    const validateCompImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
    if (!validateCompImportData) {
        await insertAutoImportDataQuery(request.body, fastify, request);

        return "Data added in AutoImport successfully";
    } else {
        return "Data Already added";
    }
}

module.exports = {
    getAllAutoImportDataService,
    insertAutoImportDataService
}
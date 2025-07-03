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

    const whereCondition = `"wrRefId" = ${refId} AND "wrRefType" = ${refType} AND "wrSourceId" = ${sourceId}`;
    const validateCompImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
    console.log("validafsdf", validateCompImportData)
    if (!validateCompImportData) {
        await insertAutoImportDataQuery(request.body, fastify, request);

        return "Commentary import added successfully";
    } else {
        return "Commentary Already added successfully";
    }
}

module.exports = {
    getAllAutoImportDataService,
    insertAutoImportDataService
}
const {
    getAllAutoImportDataQuery,
    getAutoImportDataByIdQuery,
    insertAutoImportDataQuery,
    updateAutoImportDataQuery,
    deleteAutoImportDataQuery,
    allAutoImportDataLogsQuery,
} = require("../repository/TableAutoImportData");
const { RefType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const getAllAutoImportDataService = async (request, fastify) => {
    const result = await getAllAutoImportDataQuery(request, fastify);
    return result || []
}

const getAutoImportDataByIdService = async (request, fastify) => {
    const whereCondition = `"wrId" = ${request.body.id}`;
    const result = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
    if (!result) {
        return null;
    }
    return result || null;
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

const updateAutoImportDataService = async (request, fastify) => {
    const { id } = request.body
    const whereCondition = `"wrId" = ${id}`;
    const validateImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
    if (!validateImportData) {
        throw new Error("Auto import data with this Id not found");
    }
    // if (request.body.refId && request.body.sourceId) {
    //     let where = `"wrId" != ${id} AND "wrRefId" = ${request.body.refId} AND "wrSourceId" = ${request.body.sourceId}`;
    //     const validateRefId = await getAutoImportDataByIdQuery(where, request, fastify);
    //     if (validateRefId) {
    //         throw new Error("Auto import data already existed with this refId and sourceId");
    //     }
    // }

    const body = {
        refId: validateImportData.refId,
        refType: validateImportData.refType,
        sourceId: validateImportData.sourceId,
        isImported: request.body.isImported == undefined ? validateImportData.isImported : request.body.isImported,
        isImportStart: request.body.isImportStart == undefined ? validateImportData.isImportStart : request.body.isImportStart,
        importStartTime: request.body.importStartTime || validateImportData.importStartTime,
        importEndTime: request.body.importEndTime || validateImportData.importEndTime,
        id: request.body.id || validateImportData.id,
    };

    await updateAutoImportDataQuery(body, fastify, request);
    return body;
}

const deleteAutoImportDataService = async (request, fastify) => {
    const { id } = request.body;
    await deleteAutoImportDataQuery(id, request, fastify);

    return `Auto-Import data successfully deleted`
}

const allAutoImportDataLogsService = async (request, fastify) => {
    return await allAutoImportDataLogsQuery(request.body || {}, request, fastify);
};

const insertAllAutoImportDataService = async (request, fastify) => {
    const { refType, refIds, sourceId } = request.body;

    const alreadyAddedIds = [];

    let tpIds = [];
    if (refType === RefType.TeamUpdate) {
        tpIds = global.tblTeams.filter(item => refIds.includes(item.teamId) && item.tpId !== null)?.map(item => item.tpId);
    } else {
        tpIds = global.tblPlayers.filter(item => refIds.includes(item.playerId) && item.tpId !== null)?.map(item => item.tpId);
    }

    for (const refId of tpIds) {
        const result = await insertAutoImportDataService({
            ...request,
            body: {
                refId,
                refType,
                sourceId
            }
        }, fastify);

        if (result === "Data Already added") {
            alreadyAddedIds.push(refId);
        }
    }

    if (alreadyAddedIds.length > 0) {
        errorLogger(fastify, `${alreadyAddedIds.join(", ")} : This refIds of type ${refType} is already added`, "/services/autoImportData.js/insertAllAutoImportDataService", request);
    }

    return "All selected data added in AutoImport successfully";
}

module.exports = {
    getAllAutoImportDataService,
    getAutoImportDataByIdService,
    insertAutoImportDataService,
    updateAutoImportDataService,
    deleteAutoImportDataService,
    allAutoImportDataLogsService,
    insertAllAutoImportDataService
}
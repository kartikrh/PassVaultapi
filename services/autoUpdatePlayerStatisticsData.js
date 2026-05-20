const { getAutoUpdatePlayerStatisticsDataQuery, updateAutoUpdatePlayerStatisticsDataQuery, insertCommentaryPlayerInAutoUpdatePlayerStatisticsQuery } = require("../repository/TableAutoUpdatePlayerStatisticsData");

const getAllAutoUpdatePlayerStatisticsDataService = async (request, fastify) => {
    const result = await getAutoUpdatePlayerStatisticsDataQuery(fastify, request);
    return result || [];
}

const insertAutoUpdatePlayerStatisticsDataService = async (request, fastify) => {
    const { commentaryId, commentaryPlayerId, playerId } = request.body;
    const whereCondition = `"wrCommentaryId" = ${commentaryId} AND "wrCommentaryPlayerId" = ${commentaryPlayerId} AND "wrPlayerId" = ${playerId} AND "wrStartTime" = NULL`;
    const validateAutoUpdatePlayerStatisticsData = await getAutoUpdatePlayerStatisticsDataQuery(fastify, request, whereCondition);
    if (validateAutoUpdatePlayerStatisticsData.length > 0) {
        throw new Error("Data Already added in Auto Update Player Statistics");
    } else {
        await insertCommentaryPlayerInAutoUpdatePlayerStatisticsQuery(request, fastify);
        return "Data added in Auto Update Player Statistics successfully";
    }
}

const updateAutoUpdatePlayerStatisticsDataService = async (request, fastify) => {
    const { id, status = false, startTime, endTime } = request.body;
    const whereCondition = `"wrId" = ${id}`;
    let validateAutoUpdatePlayerStatisticsData = await getAutoUpdatePlayerStatisticsDataQuery(fastify, request, whereCondition);
    if (validateAutoUpdatePlayerStatisticsData.length === 0) {
        throw new Error(`Auto import player statistics data with Id ${id} not found`);
    } else {
        validateAutoUpdatePlayerStatisticsData = validateAutoUpdatePlayerStatisticsData[0];
        const body = {
            id: validateAutoUpdatePlayerStatisticsData.id,
            status: status ? status : validateAutoUpdatePlayerStatisticsData.isUpdated,
            startTime: startTime ? startTime : validateAutoUpdatePlayerStatisticsData.startTime,
            endTime: endTime ? endTime : validateAutoUpdatePlayerStatisticsData.endTime
        };

        await updateAutoUpdatePlayerStatisticsDataQuery({
            ...request,
            body
        }, fastify);
        return "Update Data of auto update player statistics data updated";
    }
}

module.exports = {
    getAllAutoUpdatePlayerStatisticsDataService,
    insertAutoUpdatePlayerStatisticsDataService,
    updateAutoUpdatePlayerStatisticsDataService
}
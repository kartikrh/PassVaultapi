const { insertCompetitionStatisticsQuery, updateCompetitionStatisticsByIdQuery, deleteCompetitionStatisticsByIdQuery, updateCompetitionStatisticsDisplayOrderQuery } = require("../repository/TableCompetitionStatistics");
const { CompetitionStatisticsType, getKeyAndValueKey, callEntitySportAPI } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const getAllCompetitionStatisticsService = async (request, fastify) => {
    const { isActive, eventTypeId, competitionId, competitionStatisticsTypeEnum } = request.body;
    let competitionStatistics = global.tblCompetitionStatistics;

    if ("isActive" in request.body) {
        competitionStatistics = competitionStatistics.filter(item => item.isActive === isActive);
    }

    if (eventTypeId && eventTypeId !== 0) {
        competitionStatistics = competitionStatistics.filter(item => item.eventTypeId === eventTypeId);
    }

    if (competitionId && competitionId !== 0) {
        competitionStatistics = competitionStatistics.filter(item => item.competitionId === competitionId);
    }

    if (competitionStatisticsTypeEnum && competitionStatisticsTypeEnum !== 0) {
        const getCompetitionStatisticsTypeData = global.tblCompetitionStatisticsType.find(tcst => tcst.entityEnum === competitionStatisticsTypeEnum);
        competitionStatistics = competitionStatistics.filter(item => item.competitionStatisticsTypeId === getCompetitionStatisticsTypeData.competitionStatisticsTypeId);
    }

    return competitionStatistics;
};

const getCompetitionStatisticsByIdService = async (request, fastify) => {
    const { competitionStatisticsId } = request.body;
    return global.tblCompetitionStatistics.find(item => item.competitionStatisticsId === competitionStatisticsId) || null;
};

const createCompetitionStatisticsService = async (request, fastify) => {
    const { eventTypeId, competitionId, competitionStatisticsTypeEnum, teamId, playerId, displayOrder, value } = request.body;

    if (!eventTypeId) {
        throw new Error("Event Type Id is required");
    } else if (!competitionId) {
        throw new Error("Competition Id is required");
    } else if (!competitionStatisticsTypeEnum) {
        throw new Error("Competition Statistics Type Enum is required");
    } else if (!displayOrder) {
        throw new Error("Display Order is required");
    } else if (!value) {
        throw new Error("Value is required");
    }

    const getCompetition = global.tblCompetitions.find(tc => tc.competitionId === competitionId);
    if (!getCompetition) {
        throw new Error(`Competition with id ${competitionId} not Found`);
    }

    const getCompetitionStatisticsTypeData = global.tblCompetitionStatisticsType.find(tcst => tcst.entityEnum === competitionStatisticsTypeEnum);
    if (!getCompetitionStatisticsTypeData) {
        throw new Error("Invalid Competition Statistics Type Enum");
    }

    let competitionStatisticsTypeData = null, categoryId = null;
    for (let category of ["batting", "bowling", "team"]) {
        competitionStatisticsTypeData = Object.values(CompetitionStatisticsType[category]).find(stat => stat.enum === competitionStatisticsTypeEnum);
        categoryId = category;
        if (competitionStatisticsTypeData) break;
    }

    if (!competitionStatisticsTypeData) {
        throw new Error("Competition Statistics Type Enum not found");
    }

    if ((categoryId === "batting" || categoryId === "bowling") && !playerId) {
        throw new Error("Player Id is required");
    } else if (categoryId === "team" && !teamId) {
        throw new Error("Team Id is required");
    }

    if ((categoryId === "batting" || categoryId === "bowling")) {
        const getTeam = global.tblTeams.find(tt => tt.teamId === teamId);
        if (!getTeam) {
            throw new Error(`Team ${teamId} not found for player ${playerId}`);
        }
        request.body = {
            ...request.body,
            teamId: getTeam.teamId
        };

        const getPlayer = global.tblPlayers.find(tp => tp.playerId === playerId);
        if (!getPlayer) {
            throw new Error("Player not found");
        }
    } else if (categoryId === "team") {
        const getTeam = global.tblTeams.find(tp => tp.teamId === teamId);
        if (!getTeam) {
            throw new Error("Team not found");
        }
    }

    const getCompetitionStatisticsData = global.tblCompetitionStatistics.find(tcs => {
        const commonCondition = tcs.eventTypeId === eventTypeId &&
            tcs.competitionId === competitionId &&
            tcs.competitionStatisticsTypeId === getCompetitionStatisticsTypeData.competitionStatisticsTypeId &&
            tcs.displayOrder === displayOrder;

        if (categoryId === "batting" || categoryId === "bowling") {
            return commonCondition && tcs.playerId === playerId && tcs.teamId === teamId;
        } else if (categoryId === "team") {
            return commonCondition && tcs.teamId === teamId;
        }

        return false;
    });


    if (getCompetitionStatisticsData) {
        throw new Error(`Competition Statistics already exists with id ${getCompetitionStatisticsData?.competitionStatisticsId}`);
    }

    const result = await insertCompetitionStatisticsQuery({
        ...request.body,
        competitionStatisticsTypeId: getCompetitionStatisticsTypeData.competitionStatisticsTypeId
    }, fastify, request);
    global.tblCompetitionStatistics.push(result);

    return result;
};

const updateCompetitionStatisticsService = async (request, fastify) => {
    const { competitionStatisticsId, eventTypeId, competitionId, competitionStatisticsTypeEnum, teamId, playerId, displayOrder, value } = request.body;
    const getCompetitionStatistics = global.tblCompetitionStatistics.find(item => item.competitionStatisticsId === competitionStatisticsId);

    if (!getCompetitionStatistics) {
        throw new Error(`Competition Statistics with this id ${competitionStatisticsId} not Found`);
    }

    const getCompetitionStatisticsType = global.tblCompetitionStatisticsType.find(tcst => tcst.entityEnum === competitionStatisticsTypeEnum);
    if (!getCompetitionStatisticsType) {
        throw new Error("Invalid Competition Statistics Type Enum");
    }
    const isChange = (
        (eventTypeId && eventTypeId !== getCompetitionStatistics.eventTypeId) ||
        (competitionId && competitionId !== getCompetitionStatistics.competitionId) ||
        (competitionStatisticsTypeEnum && getCompetitionStatistics.competitionStatisticsTypeId !== getCompetitionStatisticsType.competitionStatisticsTypeId) ||
        (teamId && teamId !== getCompetitionStatistics.teamId) ||
        (playerId && playerId !== getCompetitionStatistics.playerId) ||
        (displayOrder && displayOrder !== getCompetitionStatistics.displayOrder) ||
        (value && value !== getCompetitionStatistics.value)
    );

    if (!isChange) {
        return "No changes detected";
    }

    const updateData = {
        ...getCompetitionStatistics,
        teamId: request.body.teamId ?? getCompetitionStatistics.teamId,
        playerId: request.body.playerId ?? getCompetitionStatistics.playerId,
        value: request.body.value ?? getCompetitionStatistics.value,
        ...("isActive" in request.body ? {
            isActive: request.body.isActive
        } : {
            isActive: getCompetitionStatistics.isActive
        }),
    };

    const result = await updateCompetitionStatisticsByIdQuery(updateData, fastify, request);
    const index = global.tblCompetitionStatistics.findIndex(item => item.competitionStatisticsId === competitionStatisticsId);
    global.tblCompetitionStatistics[index] = result;

    return result;
};

const saveCompetitionStatisticsService = async (request, fastify) => {
    const { competitionStatisticsId } = request.body;

    if (competitionStatisticsId === 0) {
        return await createCompetitionStatisticsService(request, fastify);
    } else {
        return await updateCompetitionStatisticsService(request, fastify);
    }
};

const deleteCompetitionStatisticsService = async (request, fastify) => {
    const { competitionStatisticsId } = request.body;
    await deleteCompetitionStatisticsByIdQuery(competitionStatisticsId, fastify, request);

    global.tblCompetitionStatistics = global.tblCompetitionStatistics.filter(
        (item) => !competitionStatisticsId.includes(item.competitionStatisticsId)
    );
    return true;
};

const updateCompetitionStatisticsDisplayOrderService = async (request, fastify) => {
    for (const item of request.body) {
        await updateCompetitionStatisticsDisplayOrderQuery(item, request, fastify);
        let index = global.tblCompetitionStatistics.findIndex((elem) => elem.competitionStatisticsId === item.competitionStatisticsId);
        if (index !== -1) {
            global.tblCompetitionStatistics[index].displayOrder = item.displayOrder;
        }
    }

    return `Display order updated successfully`;
}

const importCompetitionstatisticsService = async (data, fastify, request) => {
    const competitionTpId = data.cid;
    let getCompetition = global.tblCompetitions.find(item => item.tpId === competitionTpId);
    if (!getCompetition) {
        throw new Error(`Competition tpId ${competitionTpId} not found`);
    }

    if (!getCompetition.isCompetitionStatisticsCalculation) {
        return null;
    }

    const esResponseData = [];
    const getCompetitionStatisticsType = global.tblCompetitionStatisticsType.filter(tcst => tcst.isActive === true);
    for (const statType of getCompetitionStatisticsType) {
        const getKey = await getKeyAndValueKey(statType.entityEnum);
        if (getKey) {
            const url = `/competition/${competitionTpId}/stats/${getKey.key}?paged=1&per_page=50`;
            const entitySportCompetitionStatistics = await callEntitySportAPI(url, request, fastify);

            esResponseData.push({
                stats: entitySportCompetitionStatistics?.data?.result?.stats,
                modified: entitySportCompetitionStatistics?.data?.result?.modified
            });

            if (entitySportCompetitionStatistics && entitySportCompetitionStatistics?.data?.result.stats?.length > 0) {
                const response = entitySportCompetitionStatistics?.data?.result?.stats;
                let displayOrderCount = 1;
                for (const res of response) {
                    const getTeam = global.tblTeams.find(tt => tt.tpId === res?.team?.tid);
                    const getPlayer = global.tblPlayers.find(tp => tp.tpId === res?.player?.pid);
                    const body = {
                        eventTypeId: getCompetition.eventTypeId,
                        competitionId: getCompetition.competitionId,
                        competitionStatisticsTypeEnum: statType.entityEnum,
                        teamId: getTeam?.teamId || null,
                        playerId: getPlayer?.playerId || null,
                        displayOrder: displayOrderCount,
                        value: String(res[getKey.valueKey]) || "0"
                    }
                    try {
                        await createCompetitionStatisticsService({
                            ...request,
                            body
                        }, fastify);
                        displayOrderCount++;
                    } catch (error) {
                        if (error.message.includes("Competition Statistics already exists")) {
                            const competitionStatisticsId = error.message.split("id ")[1];
                            await updateCompetitionStatisticsService({
                                ...request,
                                body: {
                                    ...body,
                                    competitionStatisticsId: Number(competitionStatisticsId)
                                }
                            }, fastify)
                        } else {
                            errorLogger(
                                fastify,
                                error.message,
                                "/services/competitionStatistics.js/importCompetitionstatisticsService - updateCompetitionStatisticsService",
                                request
                            );
                        }
                        continue;
                    }
                }
            }
        }
    }

    if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
        global.autoImportData.esApiResponseData = { ...esResponseData };
    }

    return true;
}

const getCompetitionStatisticsByCompetitionIdService = async (request, fastify) => {
    const { competitionId } = request.body;
    let getCompetition = global.tblCompetitions.find(item => item.competitionId === competitionId);

    if (!getCompetition) {
        throw new Error(`Competition id ${competitionId} not found`);
    }

    const getCompetitionStatistics = global.tblCompetitionStatistics.filter(tcs => tcs.competitionId === competitionId);
    const displayData = [];

    const getCompetitionStatisticsType = global.tblCompetitionStatisticsType.filter(tcst => tcst.isActive === true)
        .sort((a, b) => a.typeId - b.typeId || a.entityEnum - b.entityEnum);

    for (const competitionStatisticsType of getCompetitionStatisticsType) {
        const existingType = displayData.find(item => item.competitionStatisticsType.typeId === competitionStatisticsType.typeId);

        if (!existingType) {
            const competitionStatisticsData = getCompetitionStatistics.filter(item => item.competitionStatisticsTypeId === competitionStatisticsType.competitionStatisticsTypeId);

            if (competitionStatisticsData.length > 0) {
                displayData.push({
                    competitionStatisticsType,
                    competitionStatisticsData
                });
            }
        }
    }

    return displayData;
};

module.exports = {
    getAllCompetitionStatisticsService,
    getCompetitionStatisticsByIdService,
    saveCompetitionStatisticsService,
    deleteCompetitionStatisticsService,
    updateCompetitionStatisticsDisplayOrderService,
    importCompetitionstatisticsService,
    getCompetitionStatisticsByCompetitionIdService
};
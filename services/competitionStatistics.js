const { insertCompetitionStatisticsQuery, updateCompetitionStatisticsByIdQuery, deleteCompetitionStatisticsByIdQuery, updateCompetitionStatisticsDisplayOrderQuery, removeDeletedCompetitionStatisticsQuery } = require("../repository/TableCompetitionStatistics");
const { CompetitionStatisticsType, getKeyAndValueKey, callEntitySportAPI, RefType, competitionMatchTypeEnum } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { insertAutoImportDataService } = require("./autoImportData");
const { playerImportService } = require("./player");
const { teamImportService } = require("./teams");

const getAllCompetitionStatisticsService = async (request, fastify) => {
    const { isActive, eventTypeId, competitionId, matchTypeId, competitionStatisticsTypeEnum } = request.body;
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

    if (matchTypeId && matchTypeId !== 0) {
        competitionStatistics = competitionStatistics.filter(item => item.matchTypeId === matchTypeId);
    }

    if (competitionStatisticsTypeEnum && competitionStatisticsTypeEnum !== 0) {
        const getCompetitionStatisticsTypeData = global.tblCompetitionStatisticsType.find(tcst => tcst.entityEnum === competitionStatisticsTypeEnum);
        if (getCompetitionStatisticsTypeData) {
            competitionStatistics = competitionStatistics.filter(item => item.competitionStatisticsTypeId === getCompetitionStatisticsTypeData.competitionStatisticsTypeId);
        }
    }

    return competitionStatistics;
};

const getCompetitionStatisticsByIdService = async (request, fastify) => {
    const { competitionStatisticsId } = request.body;
    return global.tblCompetitionStatistics.find(item => item.competitionStatisticsId === competitionStatisticsId) || null;
};

const createCompetitionStatisticsService = async (request, fastify) => {
    const { eventTypeId, competitionId, matchTypeId, competitionStatisticsTypeEnum, teamId, playerId, displayOrder, value } = request.body;

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
        throw new Error(`Invalid Competition Statistics Type Enum ${competitionStatisticsTypeEnum} of competition id ${competitionId}`);
    }

    let competitionStatisticsTypeData = null, categoryId = null;
    for (let category of ["batting", "bowling", "team"]) {
        competitionStatisticsTypeData = Object.values(CompetitionStatisticsType[category]).find(stat => stat.enum === competitionStatisticsTypeEnum);
        categoryId = category;
        if (competitionStatisticsTypeData) break;
    }

    if (!competitionStatisticsTypeData) {
        throw new Error(`Competition Statistics Type data of competition id ${competitionId} not found`);
    }

    if ((categoryId === "batting" || categoryId === "bowling") && !playerId) {
        throw new Error(`Player Id is required for competition id ${competitionId}`);
    } else if (categoryId === "team" && !teamId) {
        throw new Error(`Team Id is required for competition id ${competitionId}`);
    }

    if ((categoryId === "batting" || categoryId === "bowling")) {
        const getTeam = global.tblTeams.find(tt => tt.teamId === teamId);
        if (!getTeam) {
            throw new Error(`Team not found for player ${playerId}`);
        }
        request.body = {
            ...request.body,
            teamId: getTeam.teamId
        };

        const getPlayer = global.tblPlayers.find(tp => tp.playerId === playerId);
        if (!getPlayer) {
            throw new Error(`Player not found in competition id ${competitionId}`);
        }
    } else if (categoryId === "team") {
        const getTeam = global.tblTeams.find(tp => tp.teamId === teamId);
        if (!getTeam) {
            throw new Error(`Team not found in competition id ${competitionId}`);
        }
    }

    const getCompetitionStatisticsData = global.tblCompetitionStatistics.find(tcs => {
        const commonCondition = tcs.eventTypeId === eventTypeId &&
            tcs.competitionId === competitionId &&
            tcs.matchTypeId === matchTypeId &&
            tcs.competitionStatisticsTypeId === getCompetitionStatisticsTypeData.competitionStatisticsTypeId;

        if (categoryId === "batting" || categoryId === "bowling") {
            return commonCondition && tcs.playerId === playerId && tcs.teamId === teamId;
        } else if (categoryId === "team") {
            return commonCondition && tcs.teamId === teamId && !tcs.playerId;
        }

        return false;
    });


    if (getCompetitionStatisticsData) {
        throw new Error(`Competition Statistics already exists with id ${getCompetitionStatisticsData?.competitionStatisticsId}`);
    }

    const displayOrderConflict = global.tblCompetitionStatistics.find(tcs =>
        tcs.eventTypeId === eventTypeId &&
        tcs.competitionId === competitionId &&
        tcs.matchTypeId === matchTypeId &&
        tcs.competitionStatisticsTypeId === getCompetitionStatisticsTypeData.competitionStatisticsTypeId &&
        tcs.displayOrder === displayOrder
    );

    if (displayOrderConflict) {
        throw new Error(`Display order ${displayOrder} already exists for this competition statistics type`);
    }

    const result = await insertCompetitionStatisticsQuery({
        ...request.body,
        competitionStatisticsTypeId: getCompetitionStatisticsTypeData.competitionStatisticsTypeId
    }, fastify, request);
    global.tblCompetitionStatistics.push(result);

    return result;
};

const updateCompetitionStatisticsService = async (request, fastify) => {
    const { competitionStatisticsId, eventTypeId, competitionId, matchTypeId, competitionStatisticsTypeEnum, teamId, playerId, displayOrder, value, inningsCount } = request.body;
    const getCompetitionStatistics = global.tblCompetitionStatistics.find(item => item.competitionStatisticsId === competitionStatisticsId);

    if (!getCompetitionStatistics) {
        throw new Error(`Competition Statistics with this id ${competitionStatisticsId} not Found`);
    }

    const getCompetitionStatisticsType = global.tblCompetitionStatisticsType.find(tcst => tcst.entityEnum === competitionStatisticsTypeEnum);
    if (!getCompetitionStatisticsType) {
        throw new Error(`Invalid Competition Statistics Type Enum ${competitionStatisticsTypeEnum} of competition id ${competitionId}`);
    }

    const isChange = (
        (eventTypeId !== undefined && eventTypeId !== getCompetitionStatistics.eventTypeId) ||
        (competitionId !== undefined && competitionId !== getCompetitionStatistics.competitionId) ||
        (matchTypeId !== undefined && matchTypeId !== getCompetitionStatistics.matchTypeId) ||
        (competitionStatisticsTypeEnum !== undefined && getCompetitionStatistics.competitionStatisticsTypeId !== getCompetitionStatisticsType.competitionStatisticsTypeId) ||
        (teamId !== undefined && teamId !== getCompetitionStatistics.teamId) ||
        (playerId !== undefined && playerId !== getCompetitionStatistics.playerId) ||
        (displayOrder !== undefined && displayOrder !== getCompetitionStatistics.displayOrder) ||
        (value !== undefined && value !== getCompetitionStatistics.value) ||
        (inningsCount !== undefined && inningsCount !== getCompetitionStatistics.inningsCount) ||
        ("isActive" in request.body && request.body.isActive !== getCompetitionStatistics.isActive)
    );

    if (!isChange) {
        return "No changes detected";
    }

    if (displayOrder !== undefined && displayOrder !== getCompetitionStatistics.displayOrder) {
        const displayOrderConflict = global.tblCompetitionStatistics.find(tcs =>
            tcs.competitionStatisticsId !== competitionStatisticsId &&
            tcs.eventTypeId === (eventTypeId !== undefined ? eventTypeId : getCompetitionStatistics.eventTypeId) &&
            tcs.competitionId === (competitionId !== undefined ? competitionId : getCompetitionStatistics.competitionId) &&
            tcs.matchTypeId !== matchTypeId &&
            tcs.competitionStatisticsTypeId === (competitionStatisticsTypeEnum !== undefined ? getCompetitionStatisticsType.competitionStatisticsTypeId : getCompetitionStatistics.competitionStatisticsTypeId) &&
            tcs.displayOrder === displayOrder &&
            !tcs.isDeleted
        );

        if (displayOrderConflict) {
            throw new Error(`Display order ${displayOrder} already exists for this competition statistics type`);
        }
    }

    const updateData = {
        ...getCompetitionStatistics,
        ...(eventTypeId !== undefined && { eventTypeId }),
        ...(competitionId !== undefined && { competitionId }),
        ...(matchTypeId !== undefined && { matchTypeId }),
        ...(competitionStatisticsTypeEnum !== undefined && { competitionStatisticsTypeId: getCompetitionStatisticsType.competitionStatisticsTypeId }),
        ...(displayOrder !== undefined && { displayOrder }),
        teamId: request.body.teamId !== undefined ? request.body.teamId : getCompetitionStatistics.teamId,
        playerId: request.body.playerId !== undefined ? request.body.playerId : getCompetitionStatistics.playerId,
        value: request.body.value !== undefined ? request.body.value : getCompetitionStatistics.value,
        inningsCount: request.body.inningsCount !== undefined ? request.body.inningsCount : getCompetitionStatistics.inningsCount,
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

    const idsArray = Array.isArray(competitionStatisticsId) ? competitionStatisticsId : [competitionStatisticsId];

    await deleteCompetitionStatisticsByIdQuery(idsArray, fastify, request);

    global.tblCompetitionStatistics = global.tblCompetitionStatistics.filter(
        (item) => !idsArray.includes(item.competitionStatisticsId)
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
    await removeDeletedCompetitionStatisticsQuery(request, fastify);

    const competitionTpId = data.cid;
    let getCompetition = global.tblCompetitions.find(item => item.tpId === competitionTpId);
    if (!getCompetition) {
        throw new Error(`Competition tpId ${competitionTpId} not found`);
    }

    const isMen = getCompetition?.isMen;

    const esResponseData = [];
    const getEntitySportCompetitionStatisticsUrl = `/competition/${competitionTpId}/stats/`;
    const getEntitySportCompetitionStatistics = await callEntitySportAPI(getEntitySportCompetitionStatisticsUrl, request, fastify);
    const getEntitySportCompetitionStatisticsResponse = getEntitySportCompetitionStatistics?.data?.result?.formats;
    esResponseData.push(getEntitySportCompetitionStatistics?.data?.result);

    if (data?.autoImportId === global?.autoImportData?.id) {
        global.autoImportData.esApiResponseData = { ...esResponseData };
    }

    if (!Array.isArray(getEntitySportCompetitionStatisticsResponse) || getEntitySportCompetitionStatisticsResponse.length === 0) {
        return false;
    }

    const getCompetitionStatisticsType = global.tblCompetitionStatisticsType.filter(tcst => tcst.isActive);
    for (const esMatchType of getEntitySportCompetitionStatisticsResponse) {
        for (const statType of getCompetitionStatisticsType) {
            const getKey = await getKeyAndValueKey(statType.entityEnum);
            if (getKey) {
                const getMatchType = global.tblMatchTypes.find(tmt => tmt.entityEnum === competitionMatchTypeEnum[isMen ? "men" : "women"][esMatchType]);
                const url = `/competition/${competitionTpId}/stats/${getKey.key}?paged=1&per_page=50&format=${esMatchType}`;
                const entitySportCompetitionStatistics = await callEntitySportAPI(url, request, fastify);

                esResponseData.push({
                    stats: entitySportCompetitionStatistics?.data?.result?.stats,
                    modified: entitySportCompetitionStatistics?.data?.result?.modified
                });

                if (entitySportCompetitionStatistics && entitySportCompetitionStatistics?.data?.result?.stats?.length > 0) {
                    const getRecords = global.tblCompetitionStatistics.filter(tcs => (
                        tcs.eventTypeId === getCompetition.eventTypeId &&
                        tcs.competitionId === getCompetition.competitionId &&
                        tcs.matchTypeId === getMatchType?.matchTypeId &&
                        tcs.competitionStatisticsTypeId === statType.competitionStatisticsTypeId
                    ));

                    if (getRecords.length > 0) {
                        const getRecordIds = getRecords.map(r => r.competitionStatisticsId);
                        await deleteCompetitionStatisticsByIdQuery(getRecordIds, fastify, request);
                        global.tblCompetitionStatistics = global.tblCompetitionStatistics.filter(tcs => !getRecordIds.includes(tcs.competitionStatisticsId));
                    }

                    const response = entitySportCompetitionStatistics?.data?.result?.stats;
                    for (let index = 0; index < response.length; index++) {
                        const res = response[index];
                        const displayOrder = index + 1;

                        let getTeam = global.tblTeams.find(tt => tt.tpId === res?.team?.tid);
                        let getPlayer = global.tblPlayers.find(tp => tp.tpId === res?.player?.pid);

                        if (res?.team?.tid && !getTeam) {
                            getTeam = await teamImportService({
                                tid: res.team.tid
                            }, fastify, request);
                        }

                        if (res?.player?.pid) {
                            getPlayer = global.tblPlayers.find(tp => tp.tpId === res?.player?.pid);
                            if (!getPlayer) {
                                getPlayer = await playerImportService({
                                    pid: res.player.pid
                                }, fastify, request);
                            }
                        }

                        let competitionStatisticsTypeData = null;
                        for (let category of ["batting", "bowling", "team"]) {
                            competitionStatisticsTypeData = Object.values(CompetitionStatisticsType[category]).find(stat => stat.enum === statType.entityEnum);
                            if (competitionStatisticsTypeData) {
                                break;
                            }
                        }

                        const body = {
                            eventTypeId: getCompetition.eventTypeId,
                            competitionId: getCompetition.competitionId,
                            matchTypeId: getMatchType?.matchTypeId,
                            competitionStatisticsTypeEnum: statType.entityEnum,
                            teamId: getTeam?.teamId || null,
                            playerId: getPlayer?.playerId || null,
                            displayOrder: displayOrder,
                            value: String(res[getKey.valueKey]) || "0",
                            inningsCount: res?.innings
                        }

                        try {
                            await createCompetitionStatisticsService({ ...request, body }, fastify);
                        } catch (error) {
                            errorLogger(
                                fastify,
                                error.message,
                                "/services/competitionStatistics.js/importCompetitionstatisticsService - createCompetitionStatisticsService",
                                { ...request, body }
                            );
                        }
                    }
                }
            }
        }
    }

    if (data?.autoImportId === global?.autoImportData?.id) {
        global.autoImportData.esApiResponseData = { ...esResponseData };
    }

    return true;
}

const getCompetitionStatisticsByCompetitionIdService = async (request, fastify) => {
    const { competitionId } = request.body;

    const competition = global.tblCompetitions.find(
        c => c.competitionId === competitionId
    );

    if (!competition) {
        throw new Error(`Competition id ${competitionId} not found`);
    }

    const competitionStatistics = global.tblCompetitionStatistics.filter(
        s => s.competitionId === competitionId
    );

    const statisticsByMatchType = new Map();
    for (const stat of competitionStatistics) {
        const matchTypeId = stat.matchTypeId;
        if (!statisticsByMatchType.has(matchTypeId)) {
            statisticsByMatchType.set(matchTypeId, []);
        }
        statisticsByMatchType.get(matchTypeId).push(stat);
    }

    const result = [];

    for (const [matchTypeId, stats] of statisticsByMatchType) {
        const matchType = global.tblMatchTypes.find(mt => mt.matchTypeId === matchTypeId);

        const statisticsMap = new Map();
        for (const stat of stats) {
            if (!statisticsMap.has(stat.competitionStatisticsTypeId)) {
                statisticsMap.set(stat.competitionStatisticsTypeId, []);
            }
            statisticsMap.get(stat.competitionStatisticsTypeId).push(stat);
        }

        const typeGroups = new Map();
        typeGroups.set(1, { typeId: 1, type: "batting", competitionStatistics: [] });
        typeGroups.set(2, { typeId: 2, type: "bowling", competitionStatistics: [] });
        typeGroups.set(3, { typeId: 3, type: "team", competitionStatistics: [] });

        const activeTypes = global.tblCompetitionStatisticsType
            .filter(t => t.isActive)
            .sort((a, b) => a.typeId - b.typeId || a.entityEnum - b.entityEnum);

        const seenEntityEnums = new Set();

        for (const type of activeTypes) {
            if (seenEntityEnums.has(type.entityEnum)) continue;

            const statsForType = statisticsMap.get(type.competitionStatisticsTypeId);
            if (!statsForType?.length) continue;

            const targetGroup = typeGroups.get(type.typeId);
            if (!targetGroup) continue;

            targetGroup.competitionStatistics.push({
                ...type,
                data: statsForType
            });

            seenEntityEnums.add(type.entityEnum);
        }

        const competitionStatisticsData = Array.from(typeGroups.values())
            .filter(group => group.competitionStatistics.length > 0);

        result.push({
            matchTypeId: matchTypeId,
            matchType: matchType?.matchType || null,
            competitionStatisticsData: competitionStatisticsData
        });
    }

    result.sort((a, b) => (a.matchTypeId || 0) - (b.matchTypeId || 0));

    return result;
};

const insertCompetitionstatisticsInAutoImportService = async (fastify) => {
    try {
        const formatDate = (date) => date.toISOString().split("T")[0];
        const yesterdayStr = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const competitionList = global.tblCompetitions.filter(cp => {
            const startStr = formatDate(new Date(cp.startDate));
            const endStr = formatDate(new Date(cp.endDate));

            return yesterdayStr >= startStr && yesterdayStr <= endStr && cp.tpId !== null;
        })

        for (const competition of competitionList) {
            await insertAutoImportDataService({
                body: {
                    refId: competition?.tpId || competition?.competitionId,
                    refType: RefType.CompetitionStatistics,
                    sourceId: 3
                },
                userTokenInfo: {
                    WrUserId: -2
                }
            }, fastify);
        }
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "ERROR --> services/competitionStatistics.js/insertCompetitionstatisticsInAutoImportService",
            null
        );
    }
}

module.exports = {
    getAllCompetitionStatisticsService,
    getCompetitionStatisticsByIdService,
    saveCompetitionStatisticsService,
    deleteCompetitionStatisticsService,
    updateCompetitionStatisticsDisplayOrderService,
    importCompetitionstatisticsService,
    getCompetitionStatisticsByCompetitionIdService,
    insertCompetitionstatisticsInAutoImportService
};
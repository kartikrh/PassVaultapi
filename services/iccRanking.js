const { deleteICCRankingByIdQuery, insertICCRankingQuery, updateICCRankingQuery, activeInactiveICCRankingByIdQuery } = require("../repository/TableICCRanking");
const { ICCRankingType, extractEntries, callEntitySportAPI, ServiceType, APIEndpointModuleType, callClientAPI } = require("../utilities");
const { errorLogger } = require("../utilities/logger")

const getAllICCRankingService = async (request) => {
    const { isActive, type, matchTypeId, sportId, playerTypeId } = request.body;

    return global.tblICCRanking.filter((item) => {
        return (
            (isActive === undefined || item.isActive === isActive) &&
            (type === undefined || type === 0 || item.type === type) &&
            (matchTypeId === undefined || matchTypeId === 0 || item.matchTypeId === matchTypeId) &&
            (sportId === undefined || sportId === 0 || item.sportId === sportId) &&
            (playerTypeId === undefined || playerTypeId === 0 || item.playerTypeId === playerTypeId)
        );
    }).map(item => {
        const teamName = global.tblTeams.find(tn => tn.teamId == item.teamId)?.teamName || null;
        item = { ...item, teamName };
        if (item.type === ICCRankingType.Player) {
            const playerName = global.tblPlayers.find(pn => pn.playerId == item.playerId)?.playerName || null;
            const playerTypeName = global.tblPlayerTypes.find(pt => pt.playerTypeId == item.playerTypeId)?.playerType || null;
            item = { ...item, playerName, playerTypeName };
        }
        return item;
    });
};

const AllICCRankingService = async (request) => {
    const { isActive } = request.body;
    const filterValue = isActive !== undefined ? isActive : true;

    return Promise.all(
        global.tblICCRanking
            .filter(item => item.isActive === filterValue)
            .map(async (item) => {
                const fields = await fieldNamesService(item);
                return { ...item, ...fields };
            })
    );
};

const getICCRankingByIdService = async (request) => {
    const { id } = request.body;
    const result = global.tblICCRanking.find((item) => item.id === id);
    if (!result) {
        return null;
    }

    const teamName = global.tblTeams.find(tn => tn.teamId == result.teamId)?.teamName || null;
    result.teamName = teamName;
    if (result.type === ICCRankingType.Player) {
        const playerName = global.tblPlayers.find(pn => pn.playerId == result.playerId)?.playerName || null;
        const playerTypeName = global.tblPlayerTypes.find(pt => pt.playerTypeId == result.playerTypeId)?.playerType || null;
        result.playerName = playerName;
        result.playerTypeName = playerTypeName;
    }
    return result;
};

const createICCRankingService = async (request, fastify) => {
    const { sportId, matchTypeId, type, isMen, teamId, playerId, playerTypeId, rank } = request.body;
    let result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen);
    if (result) {
        if (type === ICCRankingType.Team) {
            result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.rank === rank);
            if (result) {
                throw new Error("ICC Ranking with this rank already exists");
            } else {
                result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.teamId === teamId);
                if (result) {
                    throw new Error("ICC Ranking with this team already exists");
                }
            }
        } else if (type === ICCRankingType.Player) {
            result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.playerTypeId === playerTypeId && item.rank === rank);
            if (result) {
                throw new Error("ICC Ranking with this rank already exists");
            } else {
                result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.playerId === playerId && item.playerTypeId === playerTypeId);
                if (result) {
                    throw new Error("ICC Ranking with this player already exists");
                }
            }
        }
    }
    const saveData = await insertICCRankingQuery(request.body, fastify, request);
    global.tblICCRanking.push(saveData);
    if (saveData && saveData.isActive == true) {
        const keyNames = await fieldNamesService(saveData);
        callClientAPI(
            {
                serviceType: ServiceType.clientAPI,
                moduleType: APIEndpointModuleType.updateSeoModule,
                data: {
                    module: 'iccRankings',
                    type: "add",
                    data: { ...saveData, ...keyNames }
                }
            }, request, fastify)
            .catch((err) => {
                errorLogger(
                    fastify,
                    err.message,
                    "services/iccRanking.js/createICCRankingService - callClientAPI",
                    request
                );
            });
    }
    return saveData;
};

const updateICCRankingByIdService = async (request, fastify) => {
    const { id: bodyId, sportId: bodySportId, matchTypeId: bodyMatchTypeId, type: bodyType, isMen: bodyIsMen, teamId: bodyTeamId, playerId: bodyPlayerId, playerTypeId: bodyPlayerTypeId, rank: bodyRank } = request.body;

    const newRank = Number(bodyRank);
    if (!Number.isInteger(newRank) || newRank <= 0) {
        throw new Error("Rank must be a positive integer");
    }
    const updateData = []
    const rankingIndex = global.tblICCRanking.findIndex(item => item.id === bodyId);
    if (rankingIndex === -1) {
        throw new Error("ICC Ranking with this ID not found");
    }

    const currentRanking = global.tblICCRanking[rankingIndex];
    const {
        sportId, matchTypeId, type, isMen, teamId, playerId, playerTypeId, rank: currentRank
    } = currentRanking;

    const isValidMatch =
        sportId === bodySportId &&
        matchTypeId === bodyMatchTypeId &&
        type === bodyType &&
        isMen === bodyIsMen &&
        (type === ICCRankingType.Team ? (
            teamId === bodyTeamId
        ) : (
            playerId === bodyPlayerId &&
            playerTypeId === bodyPlayerTypeId
        ));

    if (!isValidMatch) {
        throw new Error("Request body does not match existing ICC Ranking data");
    }

    if (currentRank === newRank) {
        return "No changes detected in rank. ICC Ranking(s) not updated.";
    }

    const isRankIncreasing = currentRank < newRank;

    const affectedRankings = global.tblICCRanking.filter(item => {
        return (
            item.sportId === sportId &&
            item.matchTypeId === matchTypeId &&
            item.type === type &&
            item.isMen === isMen &&
            item.id !== bodyId &&
            (
                type === ICCRankingType.Team
                    ? item.teamId !== null
                    : item.playerId !== null && item.playerTypeId === playerTypeId
            ) &&
            (
                isRankIncreasing
                    ? item.rank > currentRank && item.rank <= newRank
                    : item.rank < currentRank && item.rank >= newRank
            )
        );
    });

    for (const ranking of affectedRankings) {
        ranking.preRank = ranking.rank;
        ranking.rank += isRankIncreasing ? -1 : 1;

        const updated = await updateICCRankingQuery(ranking, fastify, request);
        const idx = global.tblICCRanking.findIndex(item => item.id === updated[0].id);
        if (idx !== -1) {
            global.tblICCRanking[idx] = updated[0];
            updateData.push(updated[0])
        }
    }

    const otherAffected = global.tblICCRanking.filter(item => {
        return (
            item.sportId === sportId &&
            item.matchTypeId === matchTypeId &&
            item.type === type &&
            item.isMen === isMen &&
            item.id !== bodyId &&
            (
                type === ICCRankingType.Team
                    ? item.teamId !== null
                    : item.playerId !== null && item.playerTypeId === playerTypeId
            )
        );
    }).filter(
        item2 => !affectedRankings.some(item1 => item1.id === item2.id)
    );

    for (const ranking of otherAffected) {
        ranking.preRank = ranking.rank;

        const updated = await updateICCRankingQuery(ranking, fastify, request);
        const idx = global.tblICCRanking.findIndex(item => item.id === updated[0].id);
        if (idx !== -1) {
            global.tblICCRanking[idx] = updated[0];
            updateData.push(updated[0]);
        }
    }

    const updatedCurrent = await updateICCRankingQuery({
        ...currentRanking,
        rank: newRank,
        preRank: currentRank
    }, fastify, request);

    global.tblICCRanking[rankingIndex] = updatedCurrent[0];
    updateData.push(updatedCurrent[0])

    const clientData = await Promise.all(
        updateData
            .filter(elem => elem.isActive === true)
            .map(async item => {
                const fields = await fieldNamesService(item);
                return { ...item, ...fields };
            })
    );

    if (clientData.length > 0) {
        callClientAPI(
            {
                serviceType: ServiceType.clientAPI,
                moduleType: APIEndpointModuleType.updateSeoModule,
                data: {
                    module: 'iccRankings',
                    type: "update",
                    data: clientData
                }
            }, request, fastify)
            .catch((err) => {
                errorLogger(
                    fastify,
                    err.message,
                    "services/iccRanking.js/updateICCRankingByIdService - callClientAPI",
                    request
                );
            });
    }

    return "ICC Ranking(s) updated successfully";
};

const saveICCRankingService = async (request, fastify) => {
    const { id } = request.body;

    if (id === 0) {
        return await createICCRankingService(request, fastify);
    } else {
        return await updateICCRankingByIdService(request, fastify);
    }
};

const deleteICCRankingByIdService = async (request, fastify) => {
    const { id } = request.body;

    await deleteICCRankingByIdQuery(id, fastify, request);
    global.tblICCRanking = global.tblICCRanking.filter((item) => !id.includes(item.id));

    callClientAPI(
        {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.updateSeoModule,
            data: {
                module: 'iccRankings',
                type: "delete",
                data: {
                    id: id
                }
            }
        }, request, fastify)
        .catch((err) => {
            errorLogger(
                fastify,
                err.message,
                "services/iccRanking.js/deleteICCRankingByIdService - callClientAPI",
                request
            );
        });

    return `ICC Ranking(s) deleted successfully`;
};

const activeInactiveICCRankingByIdService = async (request, fastify) => {
    const { id, isActive } = request.body;
    const validateId = global.tblICCRanking.find(
        (item) => item.id === id
    );
    if (!validateId) {
        throw new Error("ICC Ranking Id not found");
    }
    await activeInactiveICCRankingByIdQuery({ id, isActive }, request, fastify);

    const index = global.tblICCRanking.findIndex((item) => item.id === id);
    if (index != -1) {
        global.tblICCRanking[index].isActive = isActive;
    }

    const keyNames = await fieldNamesService(global.tblICCRanking[index]);
    callClientAPI(
        {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.updateSeoModule,
            data: {
                module: 'iccRankings',
                type: isActive ? "active" : "inactive",
                data: { ...global.tblICCRanking[index], ...keyNames }
            }
        }, request, fastify)
        .catch((err) => {
            errorLogger(
                fastify,
                err.message,
                "services/iccRanking.js/activeInactiveICCRankingByIdService - callClientAPI",
                request
            );
        });

    return `IsActive stage updated successfully`;
};

const fieldNamesService = async (data) => {
    let sportName = null,
        matchType = null,
        teamName = null,
        playerName = null,
        playerTypeName = null;

    if (data.sportId) {
        sportName = global.tblEventTypes.find(e => e.eventTypeId == data.sportId)?.eventType || null;
    }
    if (data.matchTypeId) {
        matchType = global.tblMatchTypes.find(e => e.matchTypeId == data.matchTypeId)?.matchType || null;
    }
    if (data.teamId) {
        teamName = global.tblTeams.find(e => e.teamId == data.teamId)?.teamName || null;
    }
    if (data.playerId) {
        playerName = global.tblPlayers.find(e => e.playerId == data.playerId)?.playerName || null;
    }
    if (data.playerTypeId) {
        playerTypeName = global.tblPlayerTypes.find(e => e.playerTypeId == data.playerTypeId)?.playerType || null;
    }

    return {
        sportName,
        matchType,
        teamName,
        playerName,
        playerTypeName,
    };
};

const importICCRankingFromEntitySportService = async (request, fastify) => {
    await callEntitySportAPI(
        {
            serviceType: ServiceType.entitySport,
            moduleType: APIEndpointModuleType.getICCRankingData,
            data: {
                module: "iccRanking",
                type: "get",
            }
        },
        request,
        fastify
    ).then(async (response) => {
        if (response && response.data && response.data.result) {
            const iccRankingData = response.data.result;
            const menEntries = await extractEntries(iccRankingData.ranks, true, request, fastify);
            const womenEntries = await extractEntries(iccRankingData.women_ranks, false, request, fastify);
            const resultEntries = [...menEntries, ...womenEntries];
            const rankingMap = new Map();
            for (const item of global.tblICCRanking) {
                const key = `${item.sportId}-${item.matchTypeId}-${item.type}-${item.isMen}-${item.teamId}-${item.playerId}-${item.playerTypeId}-${item.rank}`;
                rankingMap.set(key, item);
            }

            for (const entry of resultEntries) {
                const key = `${entry.sportId}-${entry.matchTypeId}-${entry.type}-${entry.isMen}-${entry.teamId}-${entry.playerId}-${entry.playerTypeId}-${entry.rank}`;
                const checkEntry = rankingMap.get(key);
                if (checkEntry) {
                    await updateICCRankingByIdService({
                        ...request,
                        body: {
                            ...checkEntry,
                            ...entry
                        }
                    }, fastify).catch((err) => {
                        // console.log("error", err.message);
                    });
                } else {
                    await createICCRankingService({
                        ...request,
                        body: entry
                    }, fastify).catch((err) => {
                        // console.log("error", err.message);
                    });
                }
            }
            return `ICC Ranking data imported successfully`;
        } else {
            throw new Error("Error fetching ICC Ranking data from EntitySport API");
        }
    }).catch((err) => {
        throw new Error("API ERROR --> services/iccRanking.js/importICCRankingFromEntitySportService - callEntitySportAPI");
    });
};

module.exports = {
    getAllICCRankingService,
    getICCRankingByIdService,
    saveICCRankingService,
    deleteICCRankingByIdService,
    activeInactiveICCRankingByIdService,
    AllICCRankingService,
    importICCRankingFromEntitySportService
}
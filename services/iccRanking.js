const { deleteICCRankingByIdQuery, insertICCRankingQuery, updateICCRankingQuery, activeInactiveICCRankingByIdQuery } = require("../repository/tblICCRanking");
const { ICCRankingType, extractEntries, callEntitySportAPI, ServiceType, APIEndpointModuleType, callClientAPI } = require("../utilities");
const { errorLogger } = require("../utilities/logger")

const getAllICCRankingService = async (request) => {
    const { isActive } = request.body;
    if (isActive !== undefined) {
        const result = global.tblICCRanking.filter(
            (item) => item.isActive === isActive
        );
        return result;
    } else {
        const result = global.tblICCRanking.filter((item) => item.isActive === true);
        return result;
    }
};

const AllICCRankingService = (request) => {
  const { isActive } = request.body;

  const filterValue = isActive !== undefined ? isActive : true;

  return global.tblICCRanking
    .filter(item => item.isActive === filterValue)
    .map(item => {
      const sportName = item.sportId
        ? global.tblEventTypes.find(e => e.eventTypeId == item.sportId)?.eventType || null
        : null;

      const matchType = item.matchTypeId
        ? global.tblMatchTypes.find(e => e.matchTypeId == item.matchTypeId)?.matchType || null
        : null;

      const teamName = item.teamId
        ? global.tblTeams.find(e => e.teamId == item.teamId)?.teamName || null
        : null;

      const playerName = item.playerId
        ? global.tblPlayers.find(e => e.playerId == item.playerId)?.playerName || null
        : null;

      const playerTypeName = item.playerType
        ? global.tblPlayerTypes.find(e => e.playerTypeId == data.playerType)?.playerType || null
        : null

      return {
        ...item,
        sportName,
        matchType,
        teamName,
        playerName,
        playerTypeName,
      };
    });
};

const getICCRankingByIdService = async (request) => {
    const { id } = request.body;
    const result = global.tblICCRanking.find((item) => item.id === id);
    return result || null;
};

const createICCRankingService = async (request, fastify) => {
    const { sportId, matchTypeId, type, isMen, teamId, playerId, playerType, rank } = request.body;
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
            result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.playerType === playerType && item.rank === rank);
            if (result) {
                throw new Error("ICC Ranking with this rank already exists");
            } else {
                result = global.tblICCRanking.find((item) => item.sportId === sportId && item.matchTypeId === matchTypeId && item.type === type && item.isMen === isMen && item.playerId === playerId && item.playerType === playerType);
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
    const { id: bodyId, sportId: bodySportId, matchTypeId: bodyMatchTypeId, type: bodyType, isMen: bodyIsMen, teamId: bodyTeamId, playerId: bodyPlayerId, playerType: bodyPlayerType, rank: bodyRank } = request.body;

    const newRank = Number(bodyRank);
    if (!Number.isInteger(newRank) || newRank <= 0) {
        throw new Error("Rank must be a positive integer");
    }

    const rankingIndex = global.tblICCRanking.findIndex(item => item.id === bodyId);
    if (rankingIndex === -1) {
        throw new Error("ICC Ranking with this ID not found");
    }

    const currentRanking = global.tblICCRanking[rankingIndex];
    const {
        sportId, matchTypeId, type, isMen, teamId, playerId, playerType, rank: currentRank
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
            playerType === bodyPlayerType
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
                    : item.playerId !== null && item.playerType === playerType
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
                    : item.playerId !== null && item.playerType === playerType
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
        }
    }

    const updatedCurrent = await updateICCRankingQuery({
        ...currentRanking,
        rank: newRank,
        preRank: currentRank
    }, fastify, request);

    global.tblICCRanking[rankingIndex] = updatedCurrent[0];

    const updateData = global.tblICCRanking
        .filter(elem =>
          elem.sportId == sportId &&
          elem.matchTypeId === matchTypeId &&
          elem.type === type &&
          elem.isMen === isMen &&
          elem.isActive === true
        )
        .map(item => {
          const sportName = item.sportId
            ? global.tblEventTypes.find(e => e.eventTypeId == item.sportId)?.eventType || null
            : null;

          const matchType = item.matchTypeId
            ? global.tblMatchTypes.find(e => e.matchTypeId == item.matchTypeId)?.matchType || null
            : null;

          const teamName = item.teamId
            ? global.tblTeams.find(e => e.teamId == item.teamId)?.teamName || null
            : null;

          const playerName = item.playerId
            ? global.tblPlayers.find(e => e.playerId == item.playerId)?.playerName || null
            : null;

          const playerTypeName = item.playerType
            ? global.tblPlayerTypes.find(e => e.playerTypeId == item.playerType)?.playerType || null
            : null;

          return {
            ...item,
            sportName,
            matchType,
            teamName,
            playerName,
            playerTypeName,
          };
        });
    callClientAPI(
        {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.updateSeoModule,
            data: {
                module: 'iccRankings',
                type: "update",
                data: updateData
            }
        }, request, fastify)
        .catch((err) => {
            errorLogger(
                fastify,
                err.message,
                "services/iccRanking.js/updateICCRankingByIdService - callClientAPI",
                request
            );
        }
        );

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
    const result = global.tblICCRanking.find((item) => item.id === id);

    if (!result) {
        throw new Error("ICC Ranking with this id not Found");
    } else {
        await deleteICCRankingByIdQuery(id, fastify, request);

        global.tblICCRanking = global.tblICCRanking.filter(
            (item) => item.id !== id
        );

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
    }
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

const fieldNamesService = (data) => {
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
    if (data.playerType) {
        playerTypeName = global.tblPlayerTypes.find(e => e.playerTypeId == data.playerType)?.playerType || null;
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
    callEntitySportAPI(
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
            const menEntries = extractEntries(iccRankingData.ranks, true);
            const womenEntries = extractEntries(iccRankingData.women_ranks, false);
            const resultEntries = [...menEntries, ...womenEntries];
            for (const entry of resultEntries) {
                await createICCRankingService({
                    ...request,
                    body: entry
                }, fastify).catch((err) => {
                    // console.log("error", err.message);
                });
            }
        } else {
            throw new Error("Error fetching ICC Ranking data from EntitySport API");
        }
    }).catch((err) => {
        throw new Error("API ERROR --> services/iccRanking.js/importICCRankingFromEntitySportService - callEntitySportAPI");
    });

    return `ICC Ranking data imported successfully`;
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
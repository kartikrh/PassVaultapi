const { deleteICCRankingByIdQuery, insertICCRankingQuery, updateICCRankingQuery } = require("../repository/tblICCRanking");
const { ICCRankingType } = require("../utilities");

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

        return `ICC Ranking(s) deleted successfully`;
    }
};

module.exports = {
    getAllICCRankingService,
    getICCRankingByIdService,
    saveICCRankingService,
    deleteICCRankingByIdService
}
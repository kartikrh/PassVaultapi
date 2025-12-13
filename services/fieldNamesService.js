const { getTeamPlayerJerseyByPlayerIdQuery } = require("../repository/TablePlayer");

const fieldNamesService = async (data, fastify) => {
    let sportName = null,
        matchType = null,
        teamName = null,
        playerName = null,
        playerTypeName = null,
        jerseyPlayerImage = null,
        jerseyPlayerImagePath = null,
        teamLogo = null;

    if (data.sportId) {
        sportName = global.tblEventTypes.find(e => e.eventTypeId == data.sportId)?.eventType || null;
    }
    if (data.matchTypeId) {
        matchType = global.tblMatchTypes.find(e => e.matchTypeId == data.matchTypeId)?.matchType || null;
    }
    if (data.teamId) {
        teamName = global.tblTeams.find(e => e.teamId == data.teamId)?.teamName || null;
        teamLogo = global.tblTeams.find(e => e.teamId == data.teamId)?.imagePath || null;
    }
    if (data.playerId) {
        playerName = global.tblPlayers.find(e => e.playerId == data.playerId)?.playerName || null;
        const teamPlayer = await getTeamPlayerJerseyByPlayerIdQuery(data.playerId, fastify, data);
        if (teamPlayer) {
            jerseyPlayerImage = teamPlayer?.jerseyPlayerImage || null;
            jerseyPlayerImagePath = teamPlayer?.jerseyPlayerImagePath || null;
        }
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
        jerseyPlayerImage,
        jerseyPlayerImagePath,
        teamLogo,
    };
};

module.exports = { fieldNamesService };
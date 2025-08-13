const {
    getAllDuplicatePlayersQuery,
} = require("../repository/TablePlayer");

const getAllNullImagePlayersService = async (fastify, request) => {
    return global.tblPlayers
        .filter(item => item.image == null)
        .map(elem => ({
            playerId: elem.playerId,
            playerName: elem.playerName,
            displayName: elem.displayName,
            image: elem.image,
            imagePath: elem.imagePath,
            isActive: elem.isActive,
        }));
};

const getAllNullImageTeamsService = async (fastify, request) => {
    return global.tblTeams
        .filter(item => item.jersey == null || item.image == null)
        .map(elem => ({
            teamId: elem.teamId,
            teamName: elem.teamName,
            teamShortName: elem.teamShortName,
            jersey: elem.jersey,
            jerseyPath: elem.jerseyPath,
            image: elem.image,
            imagePath: elem.imagePath,
        }));
};

const getAllNullImageTeamsAndPlayersService = async (fastify, request) => {
    const players = global.tblPlayers
        .filter(item => item.image == null)
        .map(elem => ({
            playerId: elem.playerId,
            playerName: elem.playerName,
            displayName: elem.displayName,
            image: elem.image,
            imagePath: elem.imagePath,
            isActive: elem.isActive,
        }));

    const teams = global.tblTeams
        .filter(item => item.jersey == null || item.image == null)
        .map(elem => ({
            teamId: elem.teamId,
            teamName: elem.teamName,
            teamShortName: elem.teamShortName,
            jersey: elem.jersey,
            jerseyPath: elem.jerseyPath,
            image: elem.image,
            imagePath: elem.imagePath,
        }));

    return {
        players,
        teams,
    }
};

const getAllDuplicatePlayersService = async (fastify, request) => {
    let result = await getAllDuplicatePlayersQuery(request, fastify)
    return result;
};

module.exports = {
    getAllNullImagePlayersService,
    getAllNullImageTeamsService,
    getAllDuplicatePlayersService,
    getAllNullImageTeamsAndPlayersService,
};

const { getTeamMatchTypeByTeamQuery, insertTeamMatchTypeByTeamQuery, updateTeamMatchTypeJerseyImageByTeamQuery, activeInactiveTeamMatchTypeByTeamQuery, deleteTeamMatchTypeByTeamQuery } = require("../repository/TableTeamMatchType");
const { getTeamPlayersByTeamMatchTypeIdQuery, updateTeamPlayerMatchTypeIdQuery, insertTeamPlayerWithHomeTeamQuery, deleteTeamPlayerByTeamPlayerIdQuery } = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { generateImageName, storeImageOnServer, removeImageFromServer } = require("../utilities/Images");

const getTeamMatchTypeByTeamService = async (request, fastify) => {
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamId" = ${request.body.teamId}`);

    const response = [];
    for (const tmt of teamMatchType) {
        const players = await getTeamPlayersByTeamMatchTypeIdQuery({
            ...request,
            body: {
                teamId: tmt.teamId,
                matchTypeId: tmt.matchTypeId
            }
        }, fastify);
        response.push({
            ...tmt,
            players
        })
    }

    return response;
}

const saveTeamMatchTypeByTeamService = async (request, fastify) => {
    const { teamId, matchTypeId } = request.body;
    const team = global.tblTeams.find(tt => tt.teamId === teamId);
    if (!team) {
        throw new Error(`Team with id ${teamId} not found`);
    }

    if (matchTypeId !== -1) {
        const matchType = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
        if (!matchType) {
            throw new Error(`MatchType with id ${matchTypeId} not found`);
        }
    }

    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamId" = ${teamId} AND ttmt."wrMatchTypeId" = ${matchTypeId}`);
    if (teamMatchType.find(tmt => tmt.matchTypeId === matchTypeId)) {
        throw new Error(`TeamMatchType with match type id ${matchTypeId} already exists`);
    }

    request.body.teamJerseyImage = global.tblEntitySockets?.[0]?.defaultJerseyImage ?? null;
    request.body.teamJerseyImagePath = global.tblEntitySockets?.[0]?.defaultJerseyImagePath ?? null;

    return await insertTeamMatchTypeByTeamQuery(request, fastify);
}

const updateTeamMatchTypeDataByTeamService = async (request, fastify) => {
    const { teamMatchTypeId } = request.body;
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }

    let { teamId, matchTypeId, teamJerseyImage } = teamMatchType[0];

    const team = global.tblTeams.find(tt => tt.teamId === teamId);
    if (!team) {
        throw new Error(`Team with id ${teamId} not found`);
    }

    if (matchTypeId !== -1) {
        const matchType = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
        if (!matchType) {
            throw new Error(`MatchType with id ${matchTypeId} not found`);
        }
    }

    if (request.body.image && request.body.image.length) {
        isImage = true;
        const imgName = generateImageName({ name: team.teamName + matchType.matchType });
        const projectName = global.tblConfigs.find(
            (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
        ).value;
        const { fullPath, imagePath } = await storeImageOnServer({
            image: request.body.image[0],
            project: projectName,
            name: imgName,
            ...ImgModuleConfig.TeamMatchType,
        });
        request.body.teamJerseyImage = fullPath;
        request.body.teamJerseyImagePath = imagePath;
        teamJerseyImage = fullPath;
        await updateTeamMatchTypeJerseyImageByTeamQuery(request, fastify);
    }

    if (request.body?.playerIds) {
        const entitySocketData = global.tblEntitySockets[0];
        const oldTeamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
            ...request,
            body: {
                teamId,
                matchTypeId
            }
        }, fastify);

        const newPlayerIds = JSON.parse(request.body.playerIds);
        const players = global.tblPlayers.filter(tp => newPlayerIds.includes(tp.playerId));

        for (const pId of newPlayerIds) {
            let teamPlayer = oldTeamPlayers.find(otp => otp.refPlayerId === pId);
            const player = players.find(tp => tp.playerId === pId);
            if (player) {
                if (!teamPlayer) {
                    teamPlayer = await insertTeamPlayerWithHomeTeamQuery({
                        teamId: team.teamId,
                        refPlayerId: player.playerId,
                        tpId: player?.tpId ?? null,
                        userId: request?.userTokenInfo?.WrUserId ?? -2,
                        jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage ?? null,
                        jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath ?? null,
                        matchTypeId: matchTypeId
                    }, fastify, request);
                }

                if (teamPlayer) {
                    if (player?.image && team?.jersey && teamPlayer?.teamPlayerId) {
                        try {
                            await mergeAndSaveImage({
                                playerImage: player.image,
                                jersey: teamJerseyImage ?? team.jersey,
                                playerName: player.playerName,
                                teamName: team.teamName,
                                teamPlayerId: teamPlayer?.teamPlayerId,
                                commentaryPlayerId: null,
                                commentaryId: null,
                            }, fastify);
                            if (teamPlayer?.homeTeam == true) {
                                await require("./player").playerImageChangeOnClientAPIService(player, fastify);
                            }
                        } catch (error) {
                            console.log("🚀 ~ updateTeamMatchTypeDataByTeamService ~ error:", error)
                        }
                    }
                }
            }
        }

        for (const oldPlayer of oldTeamPlayers) {
            if (!newPlayerIds.includes(oldPlayer.refPlayerId)) {
                await deleteTeamPlayerByTeamPlayerIdQuery(oldPlayer.teamPlayerId, fastify, request);
                await removeImageFromServer({
                    path: oldPlayer.jerseyPlayerImage,
                });
            }
        }
    }

    return true;
}

const activeInactiveTeamMatchDataTypeByTeamIdService = async (request, fastify) => {
    const { teamMatchTypeId } = request.body;
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }

    await activeInactiveTeamMatchTypeByTeamQuery(request, fastify);
    return true;
}

const deleteTeamMatchTypeByTeamIdService = async (request, fastify) => {
    const { teamMatchTypeId } = request.body;
    let teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }
    teamMatchType = teamMatchType[0];

    await deleteTeamMatchTypeByTeamQuery(request, fastify);
    if (teamMatchType?.teamJerseyImagePath) {
        await removeImageFromServer({
            path: teamMatchType.teamJerseyImagePath
        });
    }

    const players = await getTeamPlayersByTeamMatchTypeIdQuery({
            ...request,
            body: {
                teamId: teamMatchType.teamId,
                matchTypeId: teamMatchType.matchTypeId
            }
    }, fastify);
    if (players?.length) {
        for (const player of players) {
            await deleteTeamPlayerByTeamPlayerIdQuery(player.teamPlayerId, fastify, request);
            await removeImageFromServer({
                path: player.jerseyPlayerImage,
            });
        }
    }

    return true;
}

const getPlayersForTeamMatchTypeByTeamIdService = async (request, fastify) => {
    const { teamId } = request.body;

    const playersInTeams = await getAllPlayersByTeamIdQuery(
      teamId,
      fastify,
      request
    );

    const teamPlayerIds = [...new Set(playersInTeams.map(player => player.playerId))];
    const players = global.tblPlayers.filter(tp => teamPlayerIds.includes(tp.playerId));
    return players;
}

module.exports = {
    getTeamMatchTypeByTeamService,
    saveTeamMatchTypeByTeamService,
    updateTeamMatchTypeDataByTeamService,
    activeInactiveTeamMatchDataTypeByTeamIdService,
    deleteTeamMatchTypeByTeamIdService,
    getPlayersForTeamMatchTypeByTeamIdService
}
const { getTeamMatchTypeByTeamQuery, insertTeamMatchTypeByTeamQuery, updateTeamMatchTypeJerseyImageByTeamQuery, activeInactiveTeamMatchTypeByTeamQuery, deleteTeamMatchTypeByTeamQuery } = require("../repository/TableTeamMatchType");
const { getTeamPlayersByTeamMatchTypeIdQuery, updateTeamPlayerMatchTypeIdQuery, insertTeamPlayerWithHomeTeamQuery, deleteTeamPlayerByTeamPlayerIdQuery } = require("../repository/TableTeamPlayer");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { generateImageName, storeImageOnServer, removeImageFromServer } = require("../utilities/Images");
const { playerImageChangeOnClientAPIService } = require("./player");

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

    const matchType = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
    if (!matchType) {
        throw new Error(`MatchType with id ${matchTypeId} not found`);
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
    let isImage = false;
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }

    let { teamId, matchTypeId, teamJerseyImage } = teamMatchType[0];

    const team = global.tblTeams.find(tt => tt.teamId === teamId);
    if (!team) {
        throw new Error(`Team with id ${teamId} not found`);
    }

    const matchType = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
    if (!matchType) {
        throw new Error(`MatchType with id ${matchTypeId} not found`);
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
                                await playerImageChangeOnClientAPIService(player, fastify);
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
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }

    await deleteTeamMatchTypeByTeamQuery(request, fastify);
    return true;
}

module.exports = {
    getTeamMatchTypeByTeamService,
    saveTeamMatchTypeByTeamService,
    updateTeamMatchTypeDataByTeamService,
    activeInactiveTeamMatchDataTypeByTeamIdService,
    deleteTeamMatchTypeByTeamIdService
}
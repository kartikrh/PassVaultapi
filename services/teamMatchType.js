const { getTeamMatchTypeByTeamQuery, insertTeamMatchTypeByTeamQuery, updateTeamMatchTypeJerseyImageByTeamQuery } = require("../repository/TableTeamMatchType");
const { getTeamPlayersByTeamMatchTypeIdQuery, insertTeamPlayerQuery, updateTeamPlayerMatchTypeIdQuery } = require("../repository/TableTeamPlayer");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { generateImageName, storeImageOnServer } = require("../utilities/Images");

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

    return await insertTeamMatchTypeByTeamQuery(request, fastify);
}

const updateTeamMatchTypeDataByTeamService = async (request, fastify) => {
    const { teamMatchTypeId } = request.body;
    const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamMatchTypeId" = ${teamMatchTypeId}`);
    console.log("🚀 ~ updateTeamMatchTypeDataByTeamService ~ teamMatchType:", teamMatchType)
    if (!teamMatchType[0]) {
        throw new Error(`TeamMatchType with team match type id ${teamMatchTypeId} not found`);
    }

    const { teamId, matchTypeId } = teamMatchType[0];

    const team = global.tblTeams.find(tt => tt.teamId === teamId);
    if (!team) {
        throw new Error(`Team with id ${teamId} not found`);
    }

    const matchType = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
    if (!matchType) {
        throw new Error(`MatchType with id ${matchTypeId} not found`);
    }

    if (request.body.image && request.body.image.length) {
        const imgName = generateImageName({ name: teamMatchTypeId + teamId + matchTypeId });
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
        await updateTeamMatchTypeJerseyImageByTeamQuery(request, fastify);
    }

    if (request.body?.playerIds) {
        const oldTeamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
            ...request,
            body: {
                teamId,
                matchTypeId
            }
        }, fastify);

        const newPlayerIds = request.body.playerIds;
        const players = global.tblPlayers.find(tp => tp.playerId === newPlayerIds.includes(tp.playerId));

        for (const pId of newPlayerIds) {
            const exists = oldTeamPlayers.find(otp => otp.refPlayerId === pId);
            if (!exists) {
                const player = players.find(tp => tp.playerId === pId);
                if (player) {
                    await insertTeamPlayerQuery({
                        teamId,
                        refPlayerId: pId,
                        userId: request?.userTokenInfo?.WrUserId ?? -5,
                        tpId: player.tpId,
                        matchTypeId
                    }, fastify, request);
                }
            }
        }

        for (const oldPlayer of oldTeamPlayers) {
            if (!newPlayerIds.includes(oldPlayer.refPlayerId)) {
                await updateTeamPlayerMatchTypeIdQuery({
                    ...request,
                    body: {
                        teamId,
                        matchTypeId: -1,
                        refPlayerId: oldPlayer.refPlayerId,
                        oldMatchTypeId: oldPlayer?.matchTypeId
                    }
                }, fastify);
            }
        }
    }

    return true;
}

module.exports = {
    getTeamMatchTypeByTeamService,
    saveTeamMatchTypeByTeamService,
    updateTeamMatchTypeDataByTeamService
}
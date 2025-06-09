const {
    insertCommentaryWithImportQuery,
    insertCommentaryPlayers,
    insertCommentaryTeamsOnImportQuery,
    getAllCommentaryPlayerQuery,
    getAllCommentaryTeamsQuery,
} = require("../repository/TableCommentary");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { insertTeamQuery, updateTeamQuery } = require("../repository/TableTeams");
const { insertPlayerQuery, updatePlayerQuery } = require("../repository/TablePlayer");
const { insertTeamPlayerQuery, getTeamPlayerByTeamIdQuery } = require("../repository/TableTeamPlayer");
const { insertTeamCompetitionQuery } = require("../repository/TableTeamCompetition");
const { importPlayerAndTeamOnEntityAPI, importTeamsOnEntityAPI } = require("../utilities/entity");
const { insertWeatherQuery } = require("../repository/TableWeather");
const { insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertCompetitionWithImportQuery, updateCompititionQuery } = require("../repository/TableCompitition")
const { default: axios } = require("axios");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const {
    generateImageName,
    storeImageOnServer,
} = require("../utilities/Images");

const processTeam = async (teamData, fastify, request) => {
    const existingTpId = global.tblTeams.find(item =>
        item.tpId === teamData.team_id
    );
    if (existingTpId) return existingTpId.teamId;

    const existingTeam = global.tblTeams.find(item =>
        item.teamName.toLowerCase().trim() === teamData.name.toLowerCase().trim()
    );
    if (existingTeam) {
        const updateData = {
            ...existingTeam,
            tpId: teamData.team_id,
            userId: request.userTokenInfo.WrUserId,
        }
        await updateTeamQuery(updateData, fastify, request);

        const index = global.tblTeams.findIndex(item => item.teamId === updateData.teamId);
        if (index !== -1) {
            global.tblTeams[index].tpId = teamData.team_id;
        }
        return existingTeam.teamId;
    }


    let teamImg, teamImgPath;

    try {
        const imageResponse = await axios.get(teamData.logo_url, {
            responseType: "arraybuffer",
        });
        const imgName = generateImageName({ name: teamData.name });
        const projectName = global.tblConfigs.find(
            item => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
        )?.value;

        const imageBuffer = Buffer.from(imageResponse.data, "binary");

        const imageFile = {
            data: imageBuffer,
            filename: `${imgName}.png`,
            encoding: "7bit",
            mimetype: imageResponse.headers["content-type"] || "image/png",
            limit: false,
        };

        const { fullPath, imagePath } = await storeImageOnServer({
            image: imageFile,
            project: projectName,
            name: imgName,
            ...ImgModuleConfig.Teams,
        });

        teamImg = fullPath;
        teamImgPath = imagePath;
    } catch (error) {
        console.error(`Image download/save failed for team: ${teamData.name}`, error);
    }

    const teamPayload = {
        teamName: teamData.name,
        eventTypeId: 1,
        tpId: teamData.team_id,
        teamShortName: teamData.short_name,
        image: teamImg,
        imagePath: teamImgPath,
        userId: request.userTokenInfo.WrUserId,
    };
    const savedTeam = await insertTeamQuery(teamPayload, fastify, request);
    global.tblTeams.push(savedTeam);
    return savedTeam.teamId;
};

const parseUmpires = (umpiresString) => {
    const umpires = [];
    let current = '';
    let level = 0;

    for (const char of umpiresString) {
        if (char === '(') level++;
        else if (char === ')') level--;

        if (char === ',' && level === 0) {
            umpires.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current) umpires.push(current.trim());

    const onFieldUmpires = [];
    let thirdUmpire = null;

    for (const umpire of umpires) {
        if (umpire.toLowerCase().includes('tv')) {
            thirdUmpire = umpire;
        } else if (onFieldUmpires.length < 2) {
            onFieldUmpires.push(umpire);
        }
    }

    return { onFieldUmpires, thirdUmpire };
};

const importMatchService = async (request, fastify) => {
    const {
        status, match_id, competition, format, teama, teamb, umpires, referee, subtitle,
        verified, date_start, toss, day, session, venue, title, weather, pitch
    } = request.body;

    // // status 2 means completed
    // if (status === 2) {
    //     throw new Error("This commentary already completed");
    // }

    const matchId = match_id;

    const existingCommentary = global.tblCommentaries.find(item => item.tpId === matchId);

    if (!existingCommentary) {
        // save teams data
        const team1Id = await processTeam(teama, fastify, request);
        const team2Id = await processTeam(teamb, fastify, request);

        //save commentary data
        const compId = global.tblCompetitions.find(item =>
            item.competition.toLowerCase().trim() === competition?.title.toLowerCase().trim()
        )?.competitionId;

        const matchTypeId = global.tblMatchTypes.find(item =>
            item.entityEnum === format
        )?.matchTypeId;

        const { onFieldUmpires, thirdUmpire } = parseUmpires(umpires);
        const onFieldUmpiresStr = onFieldUmpires.join(', ');
        let commStatus = status === 1 ? 1 : 2

        const commentaryData = {
            eventName: title,
            eventTypeId: 1,
            matchTypeId: matchTypeId ?? null,
            historyMatchTypeId: matchTypeId ?? null,
            competitionId: compId ?? null,
            eventNo: subtitle ?? null,
            isActive: verified ?? true,
            eventDate: date_start,
            commentaryStatus: commStatus,
            tossWonBy: toss?.winner === teama?.team_id ? team1Id : team2Id ?? null,
            choseTo: toss?.decision ?? null,
            displayStatus: toss?.text ?? "Toss Pending!!",
            isClientShow: true,
            isCountInPoint: true,
            tpId: matchId,
            testDayCount: day ?? null,
            team1Id,
            team2Id,
            onfieldUmpires: onFieldUmpiresStr ?? null,
            thirdUmpire,
            matchReferee: referee ?? null,
            session,
        };

        const saveCommentary = await insertCommentaryWithImportQuery(commentaryData, request, fastify);
        global.tblCommentaries.push(saveCommentary);

        // save venue data
        const validateTpId = global.tblVenues.find(item =>
            item.tpId === venue?.venue_id
        );
        if (!validateTpId) {
            const validateName = global.tblVenues.find(item =>
                item.name === venue?.name
            );
            if (validateName) {
                const updateData = {
                    ...validateName,
                    tpId: venue?.venue_id
                };
                const updateVenue = await updateVenueQuery(updateData, fastify, request);

                const index = global.tblVenues.findIndex(item => item.id === validateName.id);
                if (index !== -1) {
                    global.tblVenues[index] = updateVenue[0];
                }
            } else {
                const country = global.tblCountryCodes.find(item =>
                    item.countryName.toLowerCase().trim() === venue?.country.toLowerCase().trim()
                );

                const saveData = {
                    countryId: country?.id,
                    city: venue?.location,
                    name: venue?.name,
                    tpId: venue?.venue_id,
                    isActive: true,
                    capacity: venue?.capacity,
                };
                const saveVenue = await insertVenueQuery(saveData, fastify, request);
                global.tblVenues.push(saveVenue);
            }
        }

        // save weather data
        if (weather) {
            weather.commentaryId = saveCommentary?.commentaryId
            const saveWeather = await insertWeatherQuery(weather, fastify, request);
            global.tblWeather.push(saveWeather);
        }

        //save pitchCondition data
        if (pitch) {
            const pitchData = {
                commentaryId: saveCommentary?.commentaryId,
                pitchCondition: pitch?.pitch_condition,
                battingCondition: pitch?.batting_condition,
                paceBowlingCondition: pitch?.pace_bowling_condition,
                spineBowlingConniton: pitch?.spine_bowling_condition,
            }
            const savePitch = await insertPitchConditionQuery(pitchData, fastify, request);
            global.tblPitchConditions.push(savePitch);
        }

        let team1Players = await getTeamPlayerByTeamIdQuery(team1Id, fastify, request);
        let team2Players = await getTeamPlayerByTeamIdQuery(team2Id, fastify, request);

        team1Players = team1Players.map(item => {
            return item.refPlayerId;
        });
        team2Players = team2Players.map(item => {
            return item.refPlayerId;
        });

        const validateMatchTypeId = global.tblMatchTypes.find(
            (item) => item.matchTypeId === matchTypeId
        );
        if (validateMatchTypeId) {
            if (
                validateMatchTypeId?.noOfIningsPerSide &&
                validateMatchTypeId?.noOfIningsPerSide > 1
            ) {
                const TotalInnning = validateMatchTypeId?.noOfIningsPerSide;
                for (let i = 0; i < TotalInnning; i++) {
                    let currentInnings = i + 1;
                    request.body.currentInnings = currentInnings
                    let commTeam
                    let selectedCompetition;
                    if (competition?.cid) {
                        selectedCompetition = global.tblCompetitions.find(item => item.tpId === competition.cid);
                    }
                    if (selectedCompetition) {
                        const teamComp1 = global.tblTeamCompetition.find(item =>
                            item.teamId === team1Id && item.refCompetitionId === selectedCompetition.competitionId
                        );
                        const teamComp2 = global.tblTeamCompetition.find(item =>
                            item.teamId === team2Id && item.refCompetitionId === selectedCompetition.competitionId
                        );

                        commTeam = {
                            commentaryId: saveCommentary?.commentaryId,
                            team1Id: teamComp1?.teamId || team1Id,
                            team2Id: teamComp2?.teamId || team2Id,
                            currentInnings: currentInnings || request.body.currentInnings,
                            teamMaxOver: validateMatchTypeId?.maxOversInFirstInings,
                        };
                    } else {
                        commTeam = {
                            commentaryId: saveCommentary?.commentaryId,
                            team1Id,
                            team2Id,
                            currentInnings: currentInnings || request.body.currentInnings,
                            teamMaxOver: validateMatchTypeId?.maxOversInFirstInings,
                        };
                    }

                    await insertCommentaryTeamsOnImportQuery(commTeam, request, fastify);
                    if (
                        team1Players &&
                        team1Players.length > 0 &&
                        team2Players &&
                        team2Players.length > 0
                    ) {
                        const data = [
                            ...team1Players.map((item, i) => {
                                return {
                                    commentaryId: saveCommentary?.commentaryId,
                                    teamId: team1Id,
                                    playerId: item,
                                    displayOrder: i + 1,
                                };
                            }),
                            ...team2Players.map((item, i) => {
                                return {
                                    commentaryId: saveCommentary?.commentaryId,
                                    teamId: team2Id,
                                    playerId: item,
                                    displayOrder: i + 1,
                                };
                            }),
                        ];
                        for (let info of data) {
                            await insertCommentaryPlayers(
                                {
                                    ...info,
                                    matchTypeId: matchTypeId,
                                },
                                request.body.currentInnings,
                                fastify,
                                request
                            );
                        }
                    }
                }
            } else {
                const currentinning = 1;
                request.body.currentInnings = currentinning;
                let commTeamData
                let selectedCompetition;
                if (competition?.cid) {
                    selectedCompetition = global.tblCompetitions.find(item => item.tpId === competition.cid);
                }
                if (selectedCompetition) {
                    const teamComp1 = global.tblTeamCompetition.find(item =>
                        item.teamId === team1Id && item.refCompetitionId === selectedCompetition.competitionId
                    );
                    const teamComp2 = global.tblTeamCompetition.find(item =>
                        item.teamId === team2Id && item.refCompetitionId === selectedCompetition.competitionId
                    );

                    commTeamData = {
                        commentaryId: saveCommentary?.commentaryId,
                        team1Id: teamComp1?.teamId || team1Id,
                        team2Id: teamComp2?.teamId || team2Id,
                        currentInnings: currentinning || request.body.currentInnings,
                        teamMaxOver: validateMatchTypeId?.maxOversInFirstInings,
                    };
                } else {
                    commTeamData = {
                        commentaryId: saveCommentary?.commentaryId,
                        team1Id,
                        team2Id,
                        currentInnings: currentinning || request.body.currentInnings,
                        teamMaxOver: validateMatchTypeId?.maxOversInFirstInings
                    };
                }

                await insertCommentaryTeamsOnImportQuery(commTeamData, request, fastify);
                if (
                    team1Players &&
                    team1Players.length > 0 &&
                    team2Players &&
                    team2Players.length > 0
                ) {
                    const data = [
                        ...team1Players.map((item, i) => {
                            return {
                                commentaryId: saveCommentary?.commentaryId,
                                teamId: team1Id,
                                playerId: item,
                                displayOrder: i + 1,
                            };
                        }),
                        ...team2Players.map((item, i) => {
                            return {
                                commentaryId: saveCommentary?.commentaryId,
                                teamId: team2Id,
                                playerId: item,
                                displayOrder: i + 1,
                            };
                        }),
                    ];
                    for (let info of data) {
                        await insertCommentaryPlayers(
                            {
                                ...info,
                                matchTypeId: matchTypeId,
                            },
                            currentinning,
                            fastify,
                            request
                        );
                    }
                }
            }
        }
        global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
        global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);
    } else {
        return "Commentary already imported"
    }

    return "Commentary imported successfully";
};

const importCompetitionService = async (request, fastify) => {
    const { cid, title, datestart, dateend, status, venue_list, category } = request.body;

    const existingByTpId = global.tblCompetitions.find(item => item.tpId === cid);

    if (!existingByTpId) {
        const existingByName = global.tblCompetitions.find(item =>
            item.competition.trim().toLowerCase() === title.trim().toLowerCase()
        );

        if (existingByName) {
            const data = {
                ...existingByName,
                tpId: cid,
            };
            await updateCompititionQuery(data, fastify, request);
            const index = global.tblCompetitions.findIndex(item =>
                item.competitionId === existingByName.competitionId
            );

            if (index !== -1) {
                global.tblCompetitions[index].tpId = cid;
            }
        } else {
            const data = {
                competition: title,
                eventTypeId: 1,
                refId: null,
                image: null,
                isActive: true,
                isTrending: false,
                isEventSnap: true,
                isPointTable: true,
                matchTypeId: null,
                imagePath: null,
                isMen: category?.toLowerCase().trim() == "women" ? false : true,
                type: 1,
                isVirtual: true,
                commStatus: status === "fixture" ? 1 : status === "live" ? 2 : 3,
                startDate: datestart,
                endDate: dateend,
                tpId: cid,
            };

            const saveData = await insertCompetitionWithImportQuery(data, request, fastify);
            global.tblCompetitions.push(saveData);
        }
    }

    // save venues
    for (const venue of venue_list) {
        const existingVenueByTpId = global.tblVenues.find(item =>
            item.tpId === venue?.venue_id
        );

        if (existingVenueByTpId) {
            continue;
        }

        const existingVenueByName = global.tblVenues.find(item =>
            item.name.trim().toLowerCase() === venue?.name.trim().toLowerCase()
        );

        if (existingVenueByName) {
            const updateData = {
                ...existingVenueByName,
                tpId: venue?.venue_id
            };

            const updatedVenue = await updateVenueQuery(updateData, fastify, request);
            const index = global.tblVenues.findIndex(item => item.id === existingVenueByName.id);
            if (index !== -1) {
                global.tblVenues[index] = updatedVenue[0];
            }
            continue;
        }

        const country = global.tblCountryCodes.find(item =>
            item.countryName.trim().toLowerCase() === venue?.country.trim().toLowerCase()
        );
        const saveData = {
            countryId: country?.id || null,
            city: venue?.city,
            name: venue?.name,
            tpId: venue?.venue_id,
            isActive: true,
            capacity: venue?.capacity,
        };

        const saveVenue = await insertVenueQuery(saveData, fastify, request);
        global.tblVenues.push(saveVenue);
    }

    return "Competition imported successfully";
}

const insertAndUpdateTeamService = async (team, request, fastify) => {
    let playerTeamId
    const validateTpId = global.tblTeams.find(item =>
        item.tpId === team.tid
    );
    if (validateTpId) {
        playerTeamId = validateTpId.teamId
    } else {
        const existingByName = global.tblTeams.find(item =>
            item.teamName?.trim().toLowerCase() === team.title?.trim().toLowerCase()
        );

        if (existingByName) {
            const updateData = {
                ...existingByName,
                tpId: team.tid,
                userId: request.userTokenInfo.WrUserId,
                country: team.country,
            };
            playerTeamId = updateData.teamId
            updateTeamQuery(updateData, fastify, request);
            const index = global.tblTeams.findIndex(t => t.teamId === updateData.teamId);
            if (index !== -1) global.tblTeams[index].tpId = team.tid;
            playerTeamId = updateData.teamId;
        } else {
            let teamImg, teamImgPath;
            if (team.logo_url) {
                try {
                    const imageResponse = await axios.get(team.logo_url, {
                        responseType: "arraybuffer",
                    });

                    const imgName = generateImageName({ name: team.title });

                    const projectName = global.tblConfigs.find(
                        item => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
                    )?.value;

                    const imageBuffer = Buffer.from(imageResponse.data, "binary");

                    const imageFile = {
                        data: imageBuffer,
                        filename: `${imgName}.png`,
                        encoding: "7bit",
                        mimetype: imageResponse.headers["content-type"] || "image/png",
                        limit: false,
                    };

                    const { fullPath, imagePath } = await storeImageOnServer({
                        image: imageFile,
                        project: projectName,
                        name: imgName,
                        ...ImgModuleConfig.Teams,
                    });

                    teamImg = fullPath;
                    teamImgPath = imagePath;
                } catch (error) {
                    console.error(`Image download/save failed for team: ${team.title}`, error.message);
                }
            }

            const teamPayload = {
                teamName: team.title,
                eventTypeId: 1,
                tpId: team.tid,
                teamShortName: team.abbr,
                image: teamImg,
                imagePath: teamImgPath,
                userId: request.userTokenInfo.WrUserId,
                country: team?.country,
            };

            const savedTeam = await insertTeamQuery(teamPayload, fastify, request);
            global.tblTeams.push(savedTeam);
            playerTeamId = savedTeam.teamId
        }
    }

    const competition = global.tblCompetitions.find(c => c.tpId === request.body.cid);
    if (competition) {
        const exists = global.tblTeamCompetition.find(
            item => item.teamId === playerTeamId && item.refCompetitionId === competition.competitionId
        );
        if (!exists) {
            const res = await insertTeamCompetitionQuery(
                {
                    teamId: playerTeamId,
                    refCompetitionId: competition.competitionId,
                    userId: request.userTokenInfo.WrUserId,
                },
                fastify,
                request
            );
            global.tblTeamCompetition.push(res);
        }
    }
    return playerTeamId
}

const insertAndUpdatePlayerService = async (player, team_id, request, fastify) => {
    let playerId
    const validatetpId = global.tblPlayers.find(item =>
        item.tpId === player?.pid
    );
    if (validatetpId) {
        playerId = validatetpId.playerId
    } else {
        const existingByName = global.tblPlayers.find(p =>
            p.playerName?.trim().toLowerCase() === player.title?.trim().toLowerCase()
        );

        if (existingByName) {
            const updateData = {
                ...existingByName,
                tpId: player.pid,
                userId: request.userTokenInfo.WrUserId,
            };
            updatePlayerQuery(updateData, fastify, request);
            const index = global.tblPlayers.findIndex(p => p.playerId === updateData.playerId);
            if (index !== -1) global.tblPlayers[index].tpId = player.pid;
            playerId = updateData.playerId

        } else {
            let playerImg, playerImgPath;
            if (player.logo_url) {
                try {
                    const imageResponse = await axios.get(player.logo_url, { responseType: "arraybuffer" });
                    const imgName = generateImageName({ name: player.title });
                    const projectName = global.tblConfigs.find(c => c.key.toLowerCase() === PROJECT_NAME.toLowerCase())?.value;

                    const imageFile = {
                        data: Buffer.from(imageResponse.data, "binary"),
                        filename: `${imgName}.png`,
                        encoding: "7bit",
                        mimetype: imageResponse.headers["content-type"] || "image/png",
                        limit: false,
                    };

                    const { fullPath, imagePath } = await storeImageOnServer({
                        image: imageFile,
                        project: projectName,
                        name: imgName,
                        ...ImgModuleConfig.Players,
                    });

                    playerImg = fullPath;
                    playerImgPath = imagePath;
                } catch (err) {
                    console.error(`Player image error [${player.title}]:`, err.message);
                }
            }

            const playerType = player.playing_role === "bat"
                ? 1 : player.playing_role === "bowl"
                    ? 2 : player.playing_role === "wk"
                        ? 3 : 4;

            const playerPayload = {
                playerName: player.title,
                country: player.nationality,
                displayName: player.short_name,
                playerTypeId: playerType,
                tpId: player.pid,
                isKipper: playerType === 3,
                isActive: true,
                userId: request.userTokenInfo.WrUserId,
                image: playerImg,
                imagePath: playerImgPath,
                eventTypeId: 1,
                isLeftHandedBatting: player.batting_style?.toLowerCase().includes("left") || false,
            };

            const savedPlayer = await insertPlayerQuery(playerPayload, fastify, request);
            global.tblPlayers.push(savedPlayer);
            playerId = savedPlayer.playerId
        }
    }
    if (team_id != null && team_id != undefined) {
        const teamPlayersData = await getTeamPlayerByTeamIdQuery(team_id, fastify, request);
        const isAlreadyLinked = teamPlayersData.some(t => t.refPlayerId === playerId);

        if (!isAlreadyLinked) {
            await insertTeamPlayerQuery({
                teamId: team_id,
                refPlayerId: playerId,
                userId: request.userTokenInfo.WrUserId,
            }, fastify, request);
        }
    }

}

const importPlayerService = async (request, fastify) => {
    const { cid } = request.body;
    const teamSquad = await importPlayerAndTeamOnEntityAPI(cid, request, fastify);

    if (!teamSquad || !teamSquad.squads) {
        throw new Error("Response error from entity sport API");
    }
    for (const squad of teamSquad?.squads) {
        // teams save and update
        const team_id = await insertAndUpdateTeamService(squad.team, request, fastify);
        //Players saving and update
        for (const player of squad.players) {
            await insertAndUpdatePlayerService(player, team_id, request, fastify);
        }
    }

    return "Players imported successfully";
};

const importTeamsService = async (request, fastify) => {
    const { cid } = request.body;

    const compTeams = await importTeamsOnEntityAPI(cid, request, fastify);
    if (!compTeams || !compTeams.teams) {
        throw new Error("Response error from entity sport API");
    }
    for (let team of compTeams.teams) {
        await insertAndUpdateTeamService(team, request, fastify);
    }

    return "Teams imported successfully";
};
module.exports = {
    importMatchService,
    importCompetitionService,
    importPlayerService,
    importTeamsService,
};
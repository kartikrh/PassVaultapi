const { checkEntitySportAPIEndpointIsActive, APIEndpointModuleType, callEntitySportAPI, parseUmpires, ScoringTypes, ServiceType, callClientAPI, commentaryStatus } = require(".");
const { errorLogger } = require("./logger");
const { autoUpdateCommentaryDataStatus, intervalTimesForUpdateCommentary } = require('./entityConst');
const { getAllAutoUpdateCommentaryDataQuery, insertAutoUpdateCommentaryDataQuery, updateAutoUpdateCommentaryDataQuery } = require('../repository/TableAutoUpdateCommentaryData');
const { updateCommentaryQuery, insertCommentaryTeams, getCommentaryTeamsQuery, deleteCommentaryPlayersByPlayerId, updateCommentaryDateByCommentaryIdQuery } = require('../repository/TableCommentary');
const { insertCommentaryPlayersByTeam, insertTeamPlayersByTeamId, esGetMatchNumberFromCompetitionMatchAPI } = require('../services/competition');
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { updateWeatherQuery, insertWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertVenueQuery } = require("../repository/TableVenue");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { deleteTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers");
const { getMatchDataByCId } = require("../services/commentry");

const entitySportAutoUpdateCommentary = async (fastify) => {
    try {
        const getAllCommentaryData = global.tblCommentaries.filter(item => item.tpId !== null && [commentaryStatus.OPEN, commentaryStatus.TOSSDONE].includes(item.commentaryStatus) && item.scoringType === ScoringTypes.Entity && item.isEventStart === false && new Date(item.eventDate) > new Date() && new Date(item.eventDate) <= new Date(Date.now() + 50 * 60 * 60 * 1000));
        if (getAllCommentaryData && getAllCommentaryData.length > 0) {
            for (const commentary of getAllCommentaryData) {
                const currentDate = new Date();
                currentDate.setSeconds(0, 0);
                const eventDate = new Date(commentary.eventDate);
                eventDate.setSeconds(0, 0);
                const commentaryStartTime = eventDate;

                const diffHours = (commentaryStartTime - currentDate) / (1000 * 60 * 60);

                for (let hour of intervalTimesForUpdateCommentary) {
                    const upper = hour;
                    const lower = hour - 0.25; // 15-minute buffers

                    if (diffHours > 0 && diffHours <= upper && diffHours >= lower) {
                        hour = hour.toFixed(0);
                        let insertAutoUpdateCommentaryData = null;
                        try {
                            const autoUpdateCommentaryData = await getAllAutoUpdateCommentaryDataQuery(
                                `"wrCommentaryId" = '${commentary.commentaryId}' AND "wrOffsetHour" = ${hour}`,
                                fastify
                            );

                            if (!autoUpdateCommentaryData || autoUpdateCommentaryData.length === 0) {
                                const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getMatchDataByIdFromEntity);
                                if (!checkEntitySportAPIEndpoint.data) {
                                    throw new Error(checkEntitySportAPIEndpoint.message);
                                }

                                const url = checkEntitySportAPIEndpoint.data.replace("{mid}", commentary.tpId);
                                const entitySportMatch = await callEntitySportAPI(url, null, fastify);

                                let entitySportMatchResponse = entitySportMatch?.data?.result;
                                if (!entitySportMatchResponse) {
                                    throw new Error("Invalid response from Entit-Sport API");
                                }

                                const matchInfoData = entitySportMatchResponse.match_info || {};
                                const teama = matchInfoData.teama || {};
                                const teamb = matchInfoData.teamb || {};
                                const venue = matchInfoData.venue || {};
                                const pitchDetails = entitySportMatchResponse?.pitch_details || {};

                                const checkCompetition = global.tblCompetitions.find(item => item.tpId === matchInfoData?.competition?.cid);
                                if (!checkCompetition) {
                                    throw new Error(`Competition with tpId ${matchInfoData?.competition?.cid} not found`);
                                }

                                console.log(`🔔 Running update for commentary id ${commentary.commentaryId} at ${hour}h before start`);

                                const insertData = {
                                    commentaryId: commentary.commentaryId,
                                    offsetHour: hour,
                                    status: autoUpdateCommentaryDataStatus.start,
                                    message: `Running update for commentary id ${commentary.commentaryId} at ${hour}h before start`,
                                    responseData: entitySportMatchResponse
                                };

                                insertAutoUpdateCommentaryData = await insertAutoUpdateCommentaryDataQuery(insertData, fastify);

                                const { commentaryId, eventDate, eventName, eventNo, team1Id, team2Id, onfieldUmpires, thirdUmpire: cThirdUmpire, matchReferee, venueId, location, countryId, eventTypeId } = commentary;
                                let changedValues = {
                                    id: commentaryId,
                                    team1Id: team1Id,
                                    team2Id: team2Id,
                                    eventDate: new Date(eventDate),
                                    eventName: eventName,
                                    eventNo: eventNo,
                                    onfieldUmpires: onfieldUmpires,
                                    thirdUmpire: cThirdUmpire,
                                    matchReferee: matchReferee,
                                    countryId: countryId,
                                    venueId: venueId,
                                    location: location
                                };

                                if (!eventName || (eventName !== matchInfoData.title)) {
                                    changedValues.eventName = matchInfoData.title;
                                }

                                const esTeam1Id = global.tblTeams.find(tt => tt.tpId === matchInfoData.teama?.team_id)
                                if (!team1Id || (team1Id !== esTeam1Id?.teamId)) {
                                    changedValues.team1Id = esTeam1Id?.teamId;
                                }

                                const esTeam2Id = global.tblTeams.find(tt => tt.tpId === matchInfoData.teamb?.team_id)
                                if (!team2Id || (team2Id !== esTeam2Id?.teamId)) {
                                    changedValues.team2Id = esTeam2Id?.teamId;
                                }

                                if (!checkCompetition?.matchTypeId) {
                                    const esAllCompetitionMatches = await esGetMatchNumberFromCompetitionMatchAPI(checkCompetition.tpId);
                                    const getMatchNumber = esAllCompetitionMatches.find(m => m.match_id === matchInfoData?.match_id);
                                    if (eventNo !== getMatchNumber.match_number) {
                                        changedValues.eventNo = getMatchNumber.match_number ?? matchInfoData?.match_number;
                                    }
                                }

                                const { onFieldUmpires, thirdUmpire } = parseUmpires(matchInfoData.umpires);
                                if (onFieldUmpires && onFieldUmpires.length > 0) {
                                    const joined = onFieldUmpires.join(', ');
                                    if (joined !== onfieldUmpires) {
                                        changedValues.onfieldUmpires = joined;
                                    }
                                }

                                if (thirdUmpire && thirdUmpire !== cThirdUmpire) {
                                    changedValues.thirdUmpire = thirdUmpire;
                                }

                                if (matchInfoData?.referee && matchInfoData.referee !== matchReferee) {
                                    changedValues.matchReferee = matchInfoData.referee;
                                }

                                if (venue?.country) {
                                    const existingCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === venue.country.toLowerCase());

                                    if (existingCountry) {
                                        if (existingCountry.id !== countryId) {
                                            changedValues.countryId = existingCountry.id;
                                        }
                                    } else {
                                        const newCountryData = {
                                            countryName: venue.country || null,
                                            isActive: true,
                                        };
                                        const insertedCountry = await insertCountryCodeQuery(newCountryData, fastify, null);
                                        global.tblCountryCodes.push(insertedCountry);
                                        changedValues.countryId = insertedCountry.countryId;
                                    }
                                }

                                if (venue?.venue_id) {
                                    const existingVenue = global.tblVenues.find(item =>
                                        item.countryId === changedValues?.countryId &&
                                        item.city === venue?.location &&
                                        item.name === venue?.name
                                    );

                                    if (existingVenue) {
                                        if (existingVenue.id !== venueId) {
                                            changedValues.venueId = existingVenue.id;
                                        }
                                    } else {
                                        const newVenueData = {
                                            countryId: changedValues?.countryId || null,
                                            city: venue?.location || null,
                                            name: venue?.name || null,
                                            tpId: venue?.venue_id || null,
                                            isActive: true,
                                            capacity: venue?.capacity || null,
                                        };

                                        const insertedVenue = await insertVenueQuery(newVenueData, fastify, {
                                            userTokenInfo: {
                                                WrUserId: -2
                                            }
                                        });
                                        global.tblVenues.push(insertedVenue);
                                        changedValues.venueId = insertedVenue.id;
                                    }
                                }

                                if (changedValues.countryId && changedValues.venueId) {
                                    const getVenueData = global.tblVenues.find(item => item.id === changedValues.venueId);
                                    if (getVenueData) {
                                        const getLocation = `${getVenueData.name}, ${getVenueData.city}`;
                                        if (getLocation !== location) {
                                            changedValues.location = getLocation;
                                        }
                                    }
                                }

                                let isChanged = (
                                    changedValues.eventName !== eventName ||
                                    changedValues.team1Id !== team1Id ||
                                    changedValues.team2Id !== team2Id ||
                                    changedValues.eventNo !== eventNo ||
                                    changedValues.onfieldUmpires !== onfieldUmpires ||
                                    changedValues.thirdUmpire !== cThirdUmpire ||
                                    changedValues.matchReferee !== matchReferee ||
                                    changedValues.countryId !== countryId ||
                                    changedValues.venueId !== venueId ||
                                    changedValues.location !== location
                                );

                                if (isChanged) {
                                    const updateCommentaryData = await updateCommentaryQuery({
                                        body: {
                                            ...commentary,
                                            ...changedValues,
                                        }
                                    }, fastify);

                                    let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentary?.commentaryId);
                                    if (index !== -1) {
                                        global.tblCommentaries[index] = updateCommentaryData[0][0];
                                    }
                                }

                                const esEventStartDate = matchInfoData.date_start
                                    ? new Date(matchInfoData.date_start)
                                    : null;

                                if (esEventStartDate && (!eventDate || (eventDate.getTime() !== esEventStartDate?.getTime()))) {
                                    isChanged = true;
                                    const updated = await updateCommentaryDateByCommentaryIdQuery({
                                        body: {
                                            eventDate: esEventStartDate,
                                            commentaryId
                                        }
                                    }, fastify);
                                    const index = global.tblCommentaries.findIndex(tc => tc.commentaryId === commentaryId);
                                    if (index !== -1) {
                                        global.tblCommentaries[index] = {
                                            ...global.tblCommentaries[index],
                                            ...updated
                                        };
                                    }
                                }

                                let commentaryTeamPlayers = [];
                                const getTeamIsMen = global.tblTeams.find(item => item.tpId === teama?.team_id)?.teamName?.toLowerCase().includes("women");
                                const matchType = global.tblMatchTypes.find(item => item.matchTypeId === commentary.matchTypeId);
                                const noOfInning = matchType?.noOfIningsPerSide;
                                const maxOver = matchType?.maxOversInFirstInings;
                                const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
                                let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
                                let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

                                if (teamASquad && teamASquad.length > 0) {
                                    commentaryTeamPlayers.push({
                                        commentaryId,
                                        teamId: changedValues.team1Id,
                                        players: teamASquad.map(item => Number(item.player_id))
                                    });
                                }

                                if (teamASquad.length === 0) {
                                    teamASquad = await getAllPlayersByTeamIdQuery(changedValues.team1Id, fastify, null);
                                    teamASquad = teamASquad.filter(item => item.tpId != null);
                                    if (teamASquad.length === 0) {
                                        teamASquad = await insertTeamPlayersByTeamId(changedValues.team1Id, teama?.team_id, getTeamIsMen, null, fastify);
                                        teamASquad = teamASquad.filter(item => item.tpId != null);
                                    }
                                    teamASquad = teamASquad?.map(item => ({
                                        player_id: `${item.tpId}`,
                                        playing11: `${true}`
                                    }))
                                }

                                if (teamBSquad && teamBSquad.length > 0) {
                                    commentaryTeamPlayers.push({
                                        commentaryId,
                                        teamId: changedValues.team2Id,
                                        players: teamBSquad.map(item => Number(item.player_id))
                                    });
                                }

                                if (teamBSquad.length === 0) {
                                    teamBSquad = await getAllPlayersByTeamIdQuery(changedValues.team2Id, fastify, null);
                                    teamBSquad = teamBSquad.filter(item => item.tpId != null);
                                    if (teamBSquad.length === 0) {
                                        teamBSquad = await insertTeamPlayersByTeamId(changedValues.team2Id, teamb?.team_id, getTeamIsMen, null, fastify);
                                        teamBSquad = teamBSquad.filter(item => item.tpId != null);
                                    }
                                    teamBSquad = teamBSquad?.map(item => ({
                                        player_id: `${item.tpId}`,
                                        playing11: `${true}`
                                    }))
                                }

                                for (let i = 1; i <= noOfInning; i++) {
                                    let commentaryTeam = global.tblCommentaryTeams.filter(
                                        (item) =>
                                            item.commentaryId === commentary.commentaryId &&
                                            item.currentInnings === i &&
                                            (item.teamId === changedValues.team1Id || item.teamId === changedValues.team2Id)
                                    );
                                    if (commentaryTeam.length === 0) {
                                        const team1Data = global.tblTeams.find(tt => tt.teamId === changedValues.team1Id);
                                        const team2Data = global.tblTeams.find(tt => tt.teamId === changedValues.team2Id);
                                        await insertCommentaryTeams({
                                            body: {
                                                commentaryId: commentary.commentaryId,
                                                team1Id: team1Data.teamId,
                                                team2Id: team2Data.teamId,
                                                currentInnings: i,
                                                teamMaxOver: maxOver,
                                                team1TpId: team1Data?.tpId,
                                                team2TpId: team2Data?.tpid
                                            },
                                        }, fastify);
                                        const teamACommentaryTeam = await getCommentaryTeamsQuery({
                                            commentaryId: commentary.commentaryId,
                                            teamId: changedValues.team1Id,
                                            currentInnings: i
                                        }, fastify, null);
                                        const teamBCommentaryTeam = await getCommentaryTeamsQuery({
                                            commentaryId: commentary.commentaryId,
                                            teamId: changedValues.team2Id,
                                            currentInnings: i
                                        }, fastify, null);
                                        global.tblCommentaryTeams.push(teamACommentaryTeam, teamBCommentaryTeam);
                                    }

                                    const teamAUpdated = await insertCommentaryPlayersByTeam(i, commentary.commentaryId, changedValues.team1Id, teamASquad, entitySportMatchResponse?.players, matchType?.matchTypeId, getTeamIsMen, fastify, {
                                        userTokenInfo: {
                                            WrUserId: -2
                                        }
                                    });
                                    if (teamAUpdated) {
                                        isChanged = true;
                                    }

                                    const teamBUpdated = await insertCommentaryPlayersByTeam(i, commentary.commentaryId, changedValues.team2Id, teamBSquad, entitySportMatchResponse?.players, matchType?.matchTypeId, getTeamIsMen, fastify, {
                                        userTokenInfo: {
                                            WrUserId: -2
                                        }
                                    });
                                    if (teamBUpdated) {
                                        isChanged = true;
                                    }
                                }

                                const upsertedTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => item.competitionId === checkCompetition?.competitionId);
                                for (const teamPlayers of commentaryTeamPlayers) {
                                    const { commentaryId, teamId, players } = teamPlayers;
                                    const removedCommentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId && !players.includes(item.tpId));
                                    if (removedCommentaryPlayers && removedCommentaryPlayers.length > 0) {
                                        const playerIds = removedCommentaryPlayers?.map(item => item.playerId);
                                        await deleteCommentaryPlayersByPlayerId({
                                            playerIds,
                                            commentaryId
                                        }, {
                                            userTokenInfo: { WrUserId: -2 }
                                        }, fastify);
                                        global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(item => !(item.commentaryId === commentaryId && item.teamId === teamId && playerIds.includes(item.playerId)));
                                    }

                                    const removedTournamentTeamPlayers = upsertedTournamentTeamPlayers.filter(item => item.teamId === teamId && !players.includes(item.tpId));
                                    if (removedTournamentTeamPlayers && removedTournamentTeamPlayers.length > 0) {
                                        const playerIds = removedTournamentTeamPlayers?.map(item => item.id);
                                        await deleteTournamentTeamPlayersQuery(playerIds, {
                                            userTokenInfo: { WrUserId: -2 }
                                        }, fastify);
                                        global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => !playerIds.includes(item.id));
                                    }
                                }

                                if (entitySportMatchResponse?.weather && entitySportMatchResponse?.weather.length > 0) {
                                    const checkWeather = global.tblWeather.find(item => item.commentaryId === commentary.commentaryId);
                                    if (checkWeather) {
                                        const matchWeather = entitySportMatchResponse?.weather[0];
                                        const weatherData = {
                                            weatherCondition: matchWeather?.weather ?? checkWeather?.weatherCondition,
                                            description: matchWeather?.weather_desc ?? checkWeather?.description,
                                            commentaryId: commentary.commentaryId ?? checkWeather?.commentaryId,
                                            temp: matchWeather?.temp ?? checkWeather?.temp,
                                            humidity: matchWeather?.humidity ?? checkWeather?.humidity,
                                            visibility: matchWeather?.visibility ?? checkWeather?.visibility,
                                            windSpeed: matchWeather?.wind_speed ?? checkWeather?.windSpeed,
                                            clouds: matchWeather?.clouds ?? checkWeather?.clouds,
                                            id: checkWeather?.id
                                        };
                                        const updateWeather = await updateWeatherQuery(weatherData, fastify, null);
                                        const index = global.tblWeather.findIndex(item => item?.commentaryId === commentary.commentaryId);
                                        if (index !== -1) {
                                            global.tblWeather[index] = updateWeather[0]
                                            isChanged = true;
                                        } else {
                                            global.tblWeather.push(updateWeather[0]);
                                        }
                                    } else {
                                        const matchWeather = entitySportMatchResponse?.weather[0];
                                        const weatherData = {
                                            weatherCondition: matchWeather?.weather,
                                            description: matchWeather?.weather_desc,
                                            commentaryId: commentary.commentaryId,
                                            temp: matchWeather?.temp,
                                            humidity: matchWeather?.humidity,
                                            visibility: matchWeather?.visibility,
                                            windSpeed: matchWeather?.wind_speed,
                                            clouds: matchWeather?.clouds
                                        };
                                        const insertWeather = await insertWeatherQuery(weatherData, fastify, null);
                                        global.tblWeather.push(insertWeather);
                                        isChanged = true;
                                    }
                                }

                                if (Object.keys(pitchDetails).length > 0 && (pitchDetails?.pitch_condition != "" || pitchDetails?.batting_condition != "" || pitchDetails?.pace_bowling_condition != "" || pitchDetails?.spine_bowling_condition != "")) {
                                    const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === commentary.commentaryId);
                                    if (checkPitchDetails) {
                                        const pitchConditionData = {
                                            pitchCondition: pitchDetails?.pitch_condition ?? checkPitchDetails?.pitchCondition,
                                            battingCondition: pitchDetails?.batting_condition ?? checkPitchDetails?.battingCondition,
                                            paceBowlingCondition: pitchDetails?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
                                            spineBowlingConniton: pitchDetails?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingCondition,
                                            commentaryId: commentary.commentaryId,
                                            id: checkPitchDetails?.id
                                        };
                                        const updatePitch = await updatePitchConditionQuery(pitchConditionData, fastify, null);
                                        const index = global.tblPitchConditions.findIndex(item => item?.commentaryId === commentary.commentaryId);
                                        if (index !== -1) {
                                            global.tblPitchConditions[index] = updatePitch[0]
                                            isChanged = true;
                                        } else {
                                            global.tblPitchConditions.push(updatePitch[0]);
                                        }
                                    } else {
                                        const pitchConditionData = {
                                            pitchCondition: pitchDetails?.pitch_condition,
                                            battingCondition: pitchDetails?.batting_condition,
                                            paceBowlingCondition: pitchDetails?.pace_bowling_condition,
                                            spineBowlingConniton: pitchDetails?.spine_bowling_condition,
                                            commentaryId: commentary.commentaryId
                                        };

                                        const insertPitchDetails = await insertPitchConditionQuery(pitchConditionData, fastify, null);
                                        global.tblPitchConditions.push(insertPitchDetails);
                                        isChanged = true;
                                    }
                                }

                                if (isChanged) {
                                    let cData = await getMatchDataByCId(
                                        {
                                            commentaryId,
                                        },
                                        null,
                                        fastify
                                    );

                                    callClientAPI(
                                        {
                                            serviceType: ServiceType.clientAPI,
                                            moduleType: APIEndpointModuleType.commentaryUpdate,
                                            data: {
                                                ...cData,
                                                type: "update",
                                            },
                                        },
                                        null,
                                        fastify
                                    ).catch((err) => {
                                        console.log("call client api console", err);
                                        errorLogger(
                                            fastify,
                                            err.message,
                                            "ERROR --> utilities/entitySportAutoUpdateCommentary.js/entitySportAutoUpdateCommentary",
                                            null
                                        );
                                    });
                                }

                                if (insertAutoUpdateCommentaryData?.id) {
                                    await updateAutoUpdateCommentaryDataQuery({
                                        status: isChanged ? autoUpdateCommentaryDataStatus.success : autoUpdateCommentaryDataStatus.noupdate,
                                        message: isChanged ? "Commentary updated" : "No changes in commentary",
                                        id: insertAutoUpdateCommentaryData.id,
                                        responseData: entitySportMatchResponse
                                    }, fastify);
                                }
                            }
                        } catch (error) {
                            if (insertAutoUpdateCommentaryData?.id) {
                                await updateAutoUpdateCommentaryDataQuery({
                                    status: autoUpdateCommentaryDataStatus.failed,
                                    message: "Failed to update commentary",
                                    id: insertAutoUpdateCommentaryData.id,
                                    responseData: insertAutoUpdateCommentaryData?.responseData ?? null
                                }, fastify);
                            }
                            console.error(`Error processing commentary ${commentary.commentaryId} for ${hour}h before start: `, error);
                            errorLogger(
                                fastify,
                                error.message,
                                `ERROR --> utilities/entitySportAutoUpdateCommentary.js/entitySportAutoUpdateCommentary`,
                                null
                            );
                            continue;
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in entitySportAutoUpdateCommentary", err);
        errorLogger(
            fastify,
            err.message,
            "ERROR --> utilities/entitySportAutoUpdateCommentary.js/entitySportAutoUpdateCommentary",
            null
        );
    }
};


module.exports = {
    entitySportAutoUpdateCommentary,
}
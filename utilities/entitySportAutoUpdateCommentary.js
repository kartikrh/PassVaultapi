const { checkEntitySportAPIEndpointIsActive, APIEndpointModuleType, callEntitySportAPI, parseUmpires, ScoringTypes, ServiceType, callClientAPI, commentaryStatus } = require(".");
const { errorLogger } = require("./logger");
const { autoUpdateCommentaryDataStatus, intervalTimesForUpdateCommentary } = require('./entityConst');
const { getAllAutoUpdateCommentaryDataQuery, insertAutoUpdateCommentaryDataQuery, updateAutoUpdateCommentaryDataQuery } = require('../repository/TableAutoUpdateCommentaryData');
const { updateCommentaryQuery, updateCommentaryDateByCommentaryIdQuery } = require('../repository/TableCommentary');
const { esGetMatchNumberFromCompetitionMatchAPI, upsertCommentaryTeamsAndPlayersService } = require('../services/competition');
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { updateWeatherQuery, insertWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { getMatchDataByCId } = require("../services/commentry");

const entitySportAutoUpdateCommentary = async (fastify) => {
    try {
        const getAllCommentaryData = global.tblCommentaries.filter(item => item.tpId !== null && [commentaryStatus.OPEN, commentaryStatus.TOSSDONE].includes(item.commentaryStatus) && item.scoringType === ScoringTypes.Entity && item.isEventStart === false && new Date(item.eventDate) > new Date() && new Date(item.eventDate) <= new Date(Date.now() + 50 * 60 * 60 * 1000));
        if (getAllCommentaryData && getAllCommentaryData.length > 0) {
            const request = {
                userTokenInfo: {
                    WrUserId: -2
                }
            }
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
                                    throw new Error(`Invalid response from Entit-Sport API for url ${url}`);
                                }

                                const matchInfoData = entitySportMatchResponse.match_info || {};
                                const venue = matchInfoData.venue || {};

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

                                let commentaryData = commentary;
                                const { commentaryId, eventDate, eventName, eventNo, team1Id, team2Id, onfieldUmpires, thirdUmpire: cThirdUmpire, matchReferee, venueId, location, countryId, matchTypeId } = commentary;
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
                                    let existingVenue = global.tblVenues.find(item => item.tpId && item.tpId === venue?.venue_id);
                                    if (!existingVenue) {
                                        existingVenue = global.tblVenues.find(item => item.countryId === changedValues?.countryId && item.city === venue?.location && item.name === venue?.name);
                                        if (!existingVenue) {
                                            const newVenueData = {
                                                countryId: changedValues?.countryId || null,
                                                city: venue?.location || null,
                                                name: venue?.name || null,
                                                tpId: venue?.venue_id || null,
                                                isActive: true,
                                                capacity: venue?.capacity || null,
                                            };

                                            const insertedVenue = await insertVenueQuery(newVenueData, fastify, request);
                                            global.tblVenues.push(insertedVenue);
                                            changedValues.venueId = insertedVenue.id;
                                        } else if (existingVenue?.tpId === null || !existingVenue?.tpId || existingVenue?.tpId !== venue?.venue_id) {
                                            const venueData = {
                                                tpId: venue?.venue_id || null,
                                                venueId: existingVenue.id,
                                            };

                                            existingVenue = await updateVenueQuery(venueData, fastify, request);
                                            existingVenue = existingVenue[0];
                                            const index = global.tblVenues.findIndex(item => item.id === existingVenue.id);
                                            global.tblVenues[index] = existingVenue;
                                        }
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
                                    const updatedCommentaryData = await updateCommentaryQuery({
                                        body: {
                                            ...commentary,
                                            ...changedValues,
                                        }
                                    }, fastify);

                                    let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentary?.commentaryId);
                                    if (index !== -1) {
                                        global.tblCommentaries[index] = updatedCommentaryData[0][0];
                                        commentaryData = global.tblCommentaries[index];
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
                                        commentaryData = global.tblCommentaries[index];
                                    }
                                }

                                const entitySocketData = global.tblEntitySockets[0];
                                const matchType = global.tblMatchTypes.find(item => item.matchTypeId === matchTypeId);
                                const noOfInning = matchType?.noOfIningsPerSide;
                                const maxOver = matchType?.maxOversInFirstInings;
                                const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];

                                const teamA = global.tblTeams.find(tt => tt.teamId === changedValues.team1Id);
                                const teamB = global.tblTeams.find(tt => tt.teamId === changedValues.team2Id);

                                let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
                                let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

                                const tournamentTeamsPlayers = global.tblTournamentTeamPlayers.filter(tttp => tttp.competitionId === checkCompetition.competitionId);
                                const commentaryTeams = global.tblCommentaryTeams.filter(tct => tct.commentaryId === commentaryId && [teamA.teamId, teamB.teamId].includes(tct.teamId));
                                const commentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && [teamA.teamId, teamB.teamId].includes(item.teamId));
                                for (let i = 1; i <= noOfInning; i++) {
                                    // teamA
                                    await upsertCommentaryTeamsAndPlayersService(checkCompetition, tournamentTeamsPlayers, commentaryData, maxOver, commentaryTeams, teamA, i, commentaryPlayers, teamASquad, entitySportMatchResponse?.players, entitySocketData, request, fastify);

                                    // TeamB
                                    await upsertCommentaryTeamsAndPlayersService(checkCompetition, tournamentTeamsPlayers, commentaryData, maxOver, commentaryTeams, teamB, i, commentaryPlayers, teamBSquad, entitySportMatchResponse?.players, entitySocketData, request, fastify);
                                }

                                const matchWeather = entitySportMatchResponse?.match_info?.weather;
                                if (matchWeather && typeof matchWeather === "object") {
                                    const checkWeather = global.tblWeather.find(item => item.commentaryId === commentary.commentaryId);
                                    if (checkWeather) {
                                        const weatherData = {
                                            weatherCondition: matchWeather?.weather || checkWeather?.weatherCondition,
                                            description: matchWeather?.weather_desc || checkWeather?.description,
                                            commentaryId: commentary.commentaryId || checkWeather?.commentaryId,
                                            temp: matchWeather?.temp || checkWeather?.temp,
                                            humidity: matchWeather?.humidity || checkWeather?.humidity,
                                            visibility: matchWeather?.visibility || checkWeather?.visibility,
                                            windSpeed: matchWeather?.wind_speed || checkWeather?.windSpeed,
                                            clouds: matchWeather?.clouds || checkWeather?.clouds,
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
                                        const weatherData = {
                                            weatherCondition: matchWeather?.weather || null,
                                            description: matchWeather?.weather_desc || null,
                                            commentaryId: commentary.commentaryId,
                                            temp: matchWeather?.temp || null,
                                            humidity: matchWeather?.humidity || null,
                                            visibility: matchWeather?.visibility || null,
                                            windSpeed: matchWeather?.wind_speed || null,
                                            clouds: matchWeather?.clouds || null
                                        };
                                        const insertWeather = await insertWeatherQuery(weatherData, fastify, null);
                                        global.tblWeather.push(insertWeather);
                                        isChanged = true;
                                    }
                                }

                                const matchPitch = entitySportMatchResponse?.match_info?.pitch;
                                if (matchPitch && (matchPitch?.pitch_condition != "" || matchPitch?.batting_condition != "" || matchPitch?.pace_bowling_condition != "" || matchPitch?.spine_bowling_condition != "")) {
                                    const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === commentary.commentaryId);
                                    if (checkPitchDetails) {
                                        const pitchConditionData = {
                                            pitchCondition: matchPitch?.pitch_condition ?? checkPitchDetails?.pitchCondition,
                                            battingCondition: matchPitch?.batting_condition ?? checkPitchDetails?.battingCondition,
                                            paceBowlingCondition: matchPitch?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
                                            spineBowlingConniton: matchPitch?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingCondition,
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
                                            pitchCondition: matchPitch?.pitch_condition,
                                            battingCondition: matchPitch?.batting_condition,
                                            paceBowlingCondition: matchPitch?.pace_bowling_condition,
                                            spineBowlingConniton: matchPitch?.spine_bowling_condition,
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
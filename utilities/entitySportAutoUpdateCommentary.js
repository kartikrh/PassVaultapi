const { roundToNearestMinutes, checkEntitySportAPIEndpointIsActive, APIEndpointModuleType, callEntitySportAPI, parseUmpires, ScoringTypes } = require(".");
const { errorLogger } = require("./logger");
const { entitySportAutoUpdateCommentaryTime, intervalTimesForUpdateCommentary, autoUpdateCommentaryDataStatus } = require('./entityConst');
const { getAllAutoUpdateCommentaryDataQuery, insertAutoUpdateCommentaryDataQuery, updateAutoUpdateCommentaryDataQuery } = require('../repository/TableAutoUpdateCommentaryData');
const { updateCommentaryQuery, insertCommentaryTeams, getCommentaryTeamsQuery } = require('../repository/TableCommentary');
const { insertCommentaryPlayersByTeam, insertTeamPlayersByTeamId } = require('../services/competition');
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { updateWeatherQuery, insertWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertVenueQuery } = require("../repository/TableVenue");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");

const entitySportAutoUpdateCommentary = async (fastify) => {
    try {
        const getAllCommentaryData = global.tblCommentaries.filter(item => item.tpId !== null && item.commentaryStatus === 1 && item.scoringType === ScoringTypes.Entity && item.isEventStart === false && new Date(item.eventDate) > new Date());
        if (getAllCommentaryData && getAllCommentaryData.length > 0) {
            const roundedNowTime = await roundToNearestMinutes(entitySportAutoUpdateCommentaryTime);

            for (const commentary of getAllCommentaryData) {
                const commentaryStartTime = new Date(commentary.eventDate);

                for (const hoursBefore of intervalTimesForUpdateCommentary) {
                    let insertAutoUpdateCommentaryData = null;
                    const intervalTime = new Date(commentaryStartTime.getTime() - hoursBefore * 60 * 60 * 1000);
                    const differenceTime = Math.abs(intervalTime - roundedNowTime);

                    if (differenceTime <= entitySportAutoUpdateCommentaryTime * 60 * 1000) {
                        try {
                            const autoUpdateCommentaryData = await getAllAutoUpdateCommentaryDataQuery(
                                `"wrCommentaryId" = '${commentary.commentaryId}' AND "wrOffsetHour" = ${hoursBefore}`,
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

                                const checkCompetiton = global.tblCompetitions.find(item => item.tpId === matchInfoData?.competition?.cid);
                                if (!checkCompetiton) {
                                    throw new Error(`Competition with tpId ${matchInfoData?.competition?.cid} not found`);
                                }

                                console.log(`🔔 Running update for ${commentary.commentaryId} at ${hoursBefore}h before start`);

                                const insertData = {
                                    commentaryId: commentary.commentaryId,
                                    offsetHour: hoursBefore,
                                    status: autoUpdateCommentaryDataStatus.start,
                                    message: `Running update for ${commentary.commentaryId} at ${hoursBefore}h before start`
                                };

                                insertAutoUpdateCommentaryData = await insertAutoUpdateCommentaryDataQuery(insertData, fastify);

                                const { commentaryId, eventDate, eventName, team1Id, team2Id, onfieldUmpires, thirdUmpire: cThirdUmpire, matchReferee, venueId, location, countryId, eventTypeId } = commentary;
                                let changedValues = {
                                    id: commentaryId,
                                    eventDate: eventDate,
                                    eventName: eventName,
                                    onfieldUmpires: onfieldUmpires,
                                    thirdUmpire: cThirdUmpire,
                                    matchReferee: matchReferee,
                                    countryId: countryId,
                                    venueId: venueId,
                                    location: location
                                };

                                if (!eventDate || (new Date(eventDate).getTime() !== new Date(matchInfoData.date_start).getTime())) {
                                    changedValues.eventDate = new Date(matchInfoData.date_start);
                                }

                                if (!eventName || (eventName !== matchInfoData.title)) {
                                    changedValues.eventName = matchInfoData.title;
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
                                        const getLocation = `${getVenueData.name}, ${getVenueData.countryName}`;
                                        if (getLocation !== location) {
                                            changedValues.location = getLocation;
                                        }
                                    }
                                }

                                let isChanged = (
                                    changedValues.eventDate !== eventDate ||
                                    changedValues.eventName !== eventName ||
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
                                            ...changedValues
                                        }
                                    }, fastify);

                                    let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentary?.commentaryId);
                                    if (index !== -1) {
                                        global.tblCommentaries[index] = updateCommentaryData[0][0];
                                    }
                                }

                                const getTeamIsMen = global.tblTeams.find(item => item.tpId === teama?.team_id)?.teamName?.toLowerCase().includes("women");
                                const matchType = global.tblMatchTypes.find(item => item.matchTypeId === commentary.matchTypeId);
                                const noOfInning = matchType?.noOfIningsPerSide;
                                const maxOver = matchType?.maxOversInFirstInings;
                                const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
                                let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
                                let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

                                if (teamASquad.length === 0) {
                                    teamASquad = await getAllPlayersByTeamIdQuery(team1Id, fastify, null);
                                    teamASquad = teamASquad.filter(item => item.tpId != null);
                                    if (teamASquad.length === 0) {
                                        teamASquad = await insertTeamPlayersByTeamId(team1Id, teama?.team_id, getTeamIsMen, null, fastify);
                                        teamASquad = teamASquad.filter(item => item.tpId != null);
                                    }
                                    teamASquad = teamASquad?.map(item => ({
                                        player_id: `${item.tpId}`,
                                        playing11: `${true}`
                                    }))
                                }

                                if (teamBSquad.length === 0) {
                                    teamBSquad = await getAllPlayersByTeamIdQuery(team2Id, fastify, null);
                                    teamBSquad = teamBSquad.filter(item => item.tpId != null);
                                    if (teamBSquad.length === 0) {
                                        teamBSquad = await insertTeamPlayersByTeamId(team2Id, teamb?.team_id, getTeamIsMen, null, fastify);
                                        teamBSquad = teamBSquad.filter(item => item.tpId != null);
                                    }
                                    teamBSquad = teamBSquad?.map(item => ({
                                        player_id: `${item.tpId}`,
                                        playing11: `${true}`
                                    }))
                                }

                                for (let i = 1; i <= noOfInning; i++) {
                                    let commentaryTeam = global.tblCommentaryTeams.findIndex(
                                        (item) =>
                                            item.commentaryId === commentary.commentaryId &&
                                            item.currentInnings === i
                                    );
                                    if (commentaryTeam === -1) {
                                        await insertCommentaryTeams({
                                            body: {
                                                commentaryId: commentary.commentaryId,
                                                team1Id,
                                                team2Id,
                                                currentInnings: i,
                                                teamMaxOver: maxOver,
                                                team1TpId: teama?.team_id,
                                                team2TpId: teamb?.team_id
                                            },
                                        }, fastify);
                                        const teamACommentaryTeam = await getCommentaryTeamsQuery({
                                            commentaryId: commentary.commentaryId,
                                            teamId: team1Id,
                                            currentInnings: i
                                        }, fastify, null);
                                        const teamBCommentaryTeam = await getCommentaryTeamsQuery({
                                            commentaryId: commentary.commentaryId,
                                            teamId: team2Id,
                                            currentInnings: i
                                        }, fastify, null);
                                        global.tblCommentaryTeams.push(teamACommentaryTeam, teamBCommentaryTeam);
                                    }

                                    await insertCommentaryPlayersByTeam(i, commentary.commentaryId, team1Id, teamASquad, entitySportMatchResponse?.players, matchType?.matchTypeId, getTeamIsMen, fastify, {
                                        userTokenInfo: {
                                            WrUserId: -2
                                        }
                                    });
                                    await insertCommentaryPlayersByTeam(i, commentary.commentaryId, team2Id, teamBSquad, entitySportMatchResponse?.players, matchType?.matchTypeId, getTeamIsMen, fastify, {
                                        userTokenInfo: {
                                            WrUserId: -2
                                        }
                                    });
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
                                            isChanged = true;
                                            global.tblPitchConditions[index] = updatePitch[0]
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

                                await updateAutoUpdateCommentaryDataQuery({
                                    status: isChanged ? autoUpdateCommentaryDataStatus.success : autoUpdateCommentaryDataStatus.noupdate,
                                    message: "Match data updated successfully",
                                    id: insertAutoUpdateCommentaryData.id
                                }, fastify);
                            }
                        } catch (error) {
                            await updateAutoUpdateCommentaryDataQuery({
                                status: autoUpdateCommentaryDataStatus.failed,
                                message: "Failed to update Match data",
                                id: insertAutoUpdateCommentaryData.id
                            }, fastify);
                            console.error(`Error processing commentary ${commentary.commentaryId} for ${hoursBefore}h before start: `, error);
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
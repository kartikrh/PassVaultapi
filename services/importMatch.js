const {
    insertCommentaryWithImportQuery
} = require("../repository/TableCommentary");
const { insertVenueQuery } = require("../repository/TableVenue");
const { insertTeamQuery, updateTeamQuery } = require("../repository/TableTeams");
const { insertWeatherQuery } = require("../repository/TableWeather");
const { insertPitchConditionQuery } = require("../repository/TablePitchCondition");
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
    if(existingTpId) return existingTpId.teamId;

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

    // status 2 means completed
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
        const venueExists = global.tblVenues.find(item =>
            item.name.toLowerCase().trim() === venue?.location?.toLowerCase().trim() ||
            item.tpId === venue?.venue_id
        );

        if (!venueExists && venue) {
            const country = global.tblCountryCodes.find(item =>
                item.countryName.toLowerCase().trim() === venue?.country.toLowerCase().trim()
            );

            const venueData = {
                name: venue?.name,
                tpId: venue?.venue_id,
                isActive: true,
                city: venue?.location,
                countryId: country?.id,
            };

            const saveVenue = await insertVenueQuery(venueData, fastify, request);
            global.tblVenues.push(saveVenue);
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
    } else {
        return "Commentary already imported"
    }

    return "Commentary imported successfully";
};

module.exports = {
    importMatchService
};
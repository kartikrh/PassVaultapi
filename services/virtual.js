const { getCompEventByIdQuery } = require("../repository/TableCompetitionEvent");
const { generateEventId, callPredictorMarket } = require("../utilities");
const { cloneCommentaryService } = require("./commentry");
const { 
  insertVirtualEventQuery, 
  virtualEventTossQuery,
  insertVirtualCommentaryTeams,
  insertVirtualCommentaryPlayers,
  virtualEventTeamUpdateQuery,
  virtualPlayersSelectQuery,
  updateCommentaryPlayerJerseyImageQuery,
  virtualEventBallStartQuery,
} = require("../repository/TableCommentary");
const { getTournamentTeamsByCompIdQuery } = require("../repository/TableTournmentTeamPoints");
const { getAllPlayersByTeamAndCompetitionIdQuery } = require("../repository/TableTournamentsTeamPlayers");
const { getAllTeamPlayersByTeamIdAndPlayerIdQuery } = require("../repository/TableTeamPlayer");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { commentaryDetailsByEventIdService } = require("./commentry");
const { errorLogger } = require("../utilities/logger");

const saveEventervice = async (request ,fastify)=>{
  // get event by competition id
  let comp = global.tblCompetitions.find((item) => item.competitionId == request.body.competitionId);
  if(!comp){
    throw new Error("No Competition Found with this Id")
  }
  const compEvent = await getCompEventByIdQuery(request , fastify);
  console.log("compEvent", compEvent);
  if(!compEvent){
    throw new Error("No Event Found for this competition")
  }
  // now clone this event and store in db
  if(!request.body.eventRefId){
    let id = generateEventId();
    request.body.eventRefId = id;
  }
  request.body = {
    ...request.body,
    commentaryId : compEvent.commentaryId,
  }
  let com = await cloneCommentaryService(request,fastify)

  return {
    commentaryId : com.commentaryId,
    eventRefId : com.eventRefId,
    eventName : com.eventName,
    eventDate : com.eventDate,
  };
}

const createVirtualEventService = async (request, fastify) => {
  let checkComp = global.tblCompetitions.find((item) => 
    item.competitionId == request.body.competitionId && 
    item.isActive == true
  );
  if(!checkComp){
    throw new Error("Competition with this Id not found");
  }

  const validateCommentary = global.tblCommentaries.find((item) => item.eventRefId == request.body.eventRefId);
  if(validateCommentary) {
    throw new Error("EventRefId should be unique");
  }

  const tournamentTeams = await getTournamentTeamsByCompIdQuery(request.body.competitionId, request, fastify);
  if (!tournamentTeams || tournamentTeams.length < 2) {
    throw new Error("Not enough teams for the tournament, atleast 2 teams are required.");
  }

  if (tournamentTeams.length >= 2) {
    const teamIds = [...tournamentTeams];
    for (let i = teamIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
    }
    // Pick two unique teams
    request.body.team1Id = teamIds[0].teamId;
    request.body.team2Id = teamIds[1].teamId;
    const team1Name = global.tblTeams.find(item => item.teamId == request.body.team1Id).teamName
    const team2Name = global.tblTeams.find(item => item.teamId == request.body.team2Id).teamName

    request.body.eventName = `${team1Name} v ${team2Name}`;

    const team1Players = await getAllPlayersByTeamAndCompetitionIdQuery(
      { teamId: request.body.team1Id, competitionId: request.body.competitionId },
      request, fastify
    )
    const team2Players = await getAllPlayersByTeamAndCompetitionIdQuery(
      { teamId: request.body.team2Id, competitionId: request.body.competitionId },
      request, fastify
    )
    if(team1Players.length < 2 && team2Players.length < 2) {
      throw new Error("No players found for teams");
    }

    const commentaryData = await insertVirtualEventQuery(request, fastify);
    global.tblCommentaries.push(commentaryData);
    
    const teamData = {
      commentaryId: commentaryData.commentaryId,
      team1Id: request.body.team1Id,
      team2Id: request.body.team2Id,
    }
    const teamsData = await insertVirtualCommentaryTeams(teamData, request, fastify);
    for (let team of teamsData) {
      global.tblCommentaryTeams.push(team);
    }

    if(team1Players.length >= 2 && team2Players.length >= 2) {
      const data = [
        ...team1Players.map((item, i) => {
          return {
            commentaryId: commentaryData.commentaryId,
            teamId: request.body.team1Id,
            playerId: item.playerId,
            displayOrder: i + 1,
          };
        }),
        ...team2Players.map((item, i) => {
          return {
            commentaryId: commentaryData.commentaryId,
            teamId: request.body.team2Id,
            playerId: item.playerId,
            displayOrder: i + 1,
          };
        }),
      ];
      for (let info of data) {
        let playerData = await insertVirtualCommentaryPlayers(info, fastify, request);
        const teamPlayerData = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
          { playerId: playerData.playerId, teamId: playerData.teamId },
          fastify, request
        );
        if(teamPlayerData && teamPlayerData?.jerseyPlayerImage){
          await updateCommentaryPlayerJerseyImageQuery(
              {
                commentaryPlayerId: playerData.commentaryPlayerId, 
                jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath, 
              },
              fastify
            );
        } else {
          const teamData = global.tblTeams.find((item) => item.teamId == playerData.teamId);
          const playerImgData = global.tblPlayers.find((elem) => elem.playerId == playerData.playerId)

          if(playerImgData.image && teamData.jersey) {
            mergeAndSaveImage({
              playerImage: playerImgData.image,
              jersey: teamData.jersey,
              playerName: playerImgData.playerName,
              teamName: teamData.teamName,
              commentaryPlayerId: playerData.commentaryPlayerId,
              teamPlayerId: null,
            }, fastify);
          }
        }
        
        global.tblCommentaryPlayers.push(playerData);
      }

      for (const team of [request.body.team1Id, request.body.team2Id]) {
        const playerOrder = global.tblCommentaryPlayers.filter(item =>
          item.commentaryId == commentaryData.commentaryId && item.teamId == team
        ).sort((a, b) => a.displayOrder - b.displayOrder);

        const updateTeamData = {
          teamStatus: null,
          teamBattingOrder: null,
          teamCaptain: playerOrder[0].playerId,
          teamKipper: playerOrder[1].playerId,
          commentaryPlayerTeamCaptain: playerOrder[0].commentaryPlayerId,
          commentaryPlayerTeamKipper: playerOrder[1].commentaryPlayerId,
          commentaryId: commentaryData.commentaryId,
          teamId: team,
        };

        const teamData = await virtualEventTeamUpdateQuery(updateTeamData, request, fastify);
        const teamIndex = global.tblCommentaryTeams.findIndex(item => 
          item.commentaryId == commentaryData.commentaryId && item.teamId == team
        );
        if (teamIndex !== -1) {
          global.tblCommentaryTeams[teamIndex] = {
            ...global.tblCommentaryTeams[teamIndex],
            ...teamData[0],
          };
        }
      }

    }
  }
  
  return "Commentary Created Successfully";
}

const virtualEventTossService = async (request, fastify) => {
  const { commentaryId, tossWonTeam, decision } = request.body;

  const commentary = global.tblCommentaries.find(item => item.commentaryId == commentaryId);
  if (!commentary) {
    throw new Error("Commentary with this ID not found");
  }

  let tossWonBy, shortName;
  if (tossWonTeam === 1) {
    tossWonBy = commentary.team1Id;
    shortName = global.tblTeams.find(item => item.teamId == tossWonBy)?.teamShortName;
  } else if (tossWonTeam === 2) {
    tossWonBy = commentary.team2Id;
    shortName = global.tblTeams.find(item => item.teamId == tossWonBy)?.teamShortName;
  } else {
    throw new Error("Invalid toss won team value must be 1 or 2.");
  }

  let choseTo, displayStatus, rmk;
  if (decision === 1) {
    choseTo = 1;
    displayStatus = `Toss won by ${shortName} and chose to Bat`;
    rmk = displayStatus;
  } else if (decision === 2) {
    choseTo = 2;
    displayStatus = `Toss won by ${shortName} and chose to Bowl`;
    rmk = displayStatus;
  } else {
    throw new Error("Invalid decision value must be 1 (Bat) or 2 (Bowl).");
  }

  const data = {
    tossWonBy,
    choseTo,
    displayStatus,
    rmk,
    commentaryId,
  };

  const tossData = await virtualEventTossQuery(data, request, fastify);
  const index = global.tblCommentaries.findIndex(item => item.commentaryId == commentaryId);
  if (index !== -1) {
    global.tblCommentaries[index] = {
      ...global.tblCommentaries[index],
      ...tossData[0],
    };
  }
  // update team status and batting order
  for (const team of [commentary.team1Id, commentary.team2Id]) {
    const isTossWinner = team === tossWonBy;
    const teamStatus = isTossWinner ? (choseTo === 1 ? 1 : 2) : (choseTo === 1 ? 2 : 1);
    const teamBattingOrder = isTossWinner ? (choseTo === 1 ? 1 : 2) : (choseTo === 1 ? 2 : 1);

    const teamPlayer = global.tblCommentaryTeams.find(item => 
      item.commentaryId == commentaryId && item.teamId == team
    );

    const updateTeamData = {
      teamStatus,
      teamBattingOrder,
      teamCaptain: teamPlayer.teamCaptain,
      teamKipper: teamPlayer.teamKipper,
      commentaryPlayerTeamCaptain: teamPlayer.commentaryPlayerTeamCaptain,
      commentaryPlayerTeamKipper: teamPlayer.commentaryPlayerTeamKipper,
      commentaryId,
      teamId: team,
    };

    const teamData = await virtualEventTeamUpdateQuery(updateTeamData, request, fastify);

    const teamIndex = global.tblCommentaryTeams.findIndex(item => 
      item.commentaryId == commentaryId && item.teamId == team
    );
    if (teamIndex !== -1) {
      global.tblCommentaryTeams[teamIndex] = {
        ...global.tblCommentaryTeams[teamIndex],
        ...teamData[0],
      };
    }
  }

  // update players status and order
  const battingTeamId = choseTo === 1
  ? tossWonBy
  : (tossWonBy === commentary.team1Id ? commentary.team2Id : commentary.team1Id);

  const bowlingTeamId = choseTo === 2
    ? tossWonBy
    : (tossWonBy === commentary.team1Id ? commentary.team2Id : commentary.team1Id);

  const batters = global.tblCommentaryPlayers
    .filter(p => p.commentaryId === commentaryId && p.teamId === battingTeamId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 2);

    for (let i = 0; i < batters.length; i++) {
    const batter = batters[i];

    const updateData = {
      isPlay: true,
      onStrike: i === 0 ? true : false,
      bowlerOver: null,
      isBatterOut: false,
      batterOrder: batter.displayOrder,
      bowlerOrder: null,
      commentaryPlayerId: batter.commentaryPlayerId,
      commentaryId,
      teamId: battingTeamId,
    };
    const players = await virtualPlayersSelectQuery(updateData, request, fastify);

    const batterIndex = global.tblCommentaryPlayers.findIndex(
      p => p.commentaryPlayerId === batter.commentaryPlayerId
    );

    if (batterIndex !== -1) {
      global.tblCommentaryPlayers[batterIndex] = {
        ...global.tblCommentaryPlayers[batterIndex],
        ...players[0],
      };
    }
  }

  const bowlers = global.tblCommentaryPlayers
    .filter(p => p.commentaryId === commentaryId && p.teamId === bowlingTeamId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const bowler = bowlers[0];
  if (bowler) {
    const updateData = {
      isPlay: true,
      onStrike: null,
      bowlerOver: 0,
      isBatterOut: null,
      batterOrder: null,
      bowlerOrder: bowler.displayOrder,
      commentaryPlayerId: bowler.commentaryPlayerId,
      commentaryId,
      teamId: bowlingTeamId,
    };
    const player = await virtualPlayersSelectQuery(updateData, request, fastify);

    const bowlerIndex = global.tblCommentaryPlayers.findIndex(
      p => p.commentaryPlayerId === bowler.commentaryPlayerId
    );

    if (bowlerIndex !== -1) {
      global.tblCommentaryPlayers[bowlerIndex] = {
        ...global.tblCommentaryPlayers[bowlerIndex],
        ...player[0],
      };
    }
  }

  return "Toss Done Successfully";
};

const updateVirtualEventStatusService = async (request, fastify) => {
  const { commentaryId, displayStatus, commentaryPlayerId } = request.body;
  if (!commentaryId || displayStatus === undefined) {
    throw new Error(
      "Invalid input: commentaryId and displayStatus are required"
    );
  }
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not found");
  }
  const commentaryDetails = {
    commentaryId,
    displayStatus,
  };

  await virtualEventBallStartQuery(commentaryDetails, fastify, request);

  // Update the commentary status in the global array
  global.tblCommentaries[index].displayStatus = displayStatus

  if (global.tblCommentaries[index].isPredictMarket) {
      callPredictorMarket(
        {
          commentary_id: commentaryId,
          status: EventMarketStatus.Suspend,
          match_type_id: global.tblCommentaries[index].matchTypeId,
          is_open_market: false,
          player_id : commentaryPlayerId || null
        },
        "/api/v1/updatemarketstatus",
        fastify,
        request
      );
    }

  if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: global.tblCommentaries[index].eventRefId,
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService/updateVirtualEventStatusService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/virtual.js/updateVirtualEventStatusService",
          request
        );
      });
  }

  commentaryDetails.callPredictions = [];
  return {
    name: "commentaryDetails",
    value: commentaryDetails,
  };
};


const ballByBallVirtualEventService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not found");
  }
  
  if(request.body.commentaryTeams) {
    
  }

  if(request.body.commentaryPlayers) {

  }

  if(request.body.commentaryWickets) {

  }

  if(request.body.overs) {

  }

  if(request.body.commentaryBallByBall) {

  }

  if(request.body.commentaryPartnerships) {

  }
};

module.exports = {
    saveEventervice,
    createVirtualEventService,
    virtualEventTossService,
    updateVirtualEventStatusService,
}
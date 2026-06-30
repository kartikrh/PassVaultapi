const {
  getCompEventByIdQuery,
} = require("../repository/TableCompetitionEvent");
const {
  generateEventId,
  callPredictorMarket,
  BALL_TYPE,
  inningSwitch,
  playerType,
  commentaryStatus,
  teamStatus,
  wicketType,
  wicketTypeObj,
  Cards,
  MarketActionType,
  EventMarketStatus,
  ServiceType,
  APIEndpointModuleType,
  callDataProvider,
  callVirtualPredictorMarket,
  callClientAPI,
} = require("../utilities");
const { cloneCommentaryService, saveComVirtual, getGroupId, getMatchDataByCId } = require("./commentry");
const {
  insertVirtualEventQuery,
  virtualEventTossQuery,
  insertVirtualCommentaryTeams,
  insertVirtualCommentaryPlayers,
  virtualEventTeamUpdateQuery,
  virtualPlayersSelectQuery,
  updateCommentaryPlayerJerseyImageQuery,
  virtualEventBallStartQuery,
  createvirtualPartnershipQuery,
  createVirtualOverQuery,
  createVirtualBallByBallQuery,
  virtualTeamRunsQuery,
  virtualPlayerRunsQuery,
  updateVirtualPartnershipQuery,
  updateVirtualBallByBallQuery,
  updateVirtualOverQuery,
  createVirtualWicketQuery,
  cancelComQuery,
  addCompTempQuery,
} = require("../repository/TableCommentary");
const {
  getTournamentTeamsByCompIdQuery,
} = require("../repository/TableTournmentTeamPoints");
const {
  getAllPlayersByTeamAndCompetitionIdQuery,
} = require("../repository/TableTournamentsTeamPlayers");
const {
  getAllTeamPlayersByTeamIdAndPlayerIdQuery,
} = require("../repository/TableTeamPlayer");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { commentaryDetailsByEventIdService, weatherAndPitchDataService } = require("./commentry");
const { errorLogger, marketLogger, cardLogger } = require("../utilities/logger");
const {
  virtualOverQuery,
  virtualBallByBallQuery,
  virtualPartnershipQuery,
  comStatusUpdateQuery,
  saveComCardQuery,
} = require("../repository/TableVirtual");
const {
  generateBall,
  generatePartnership,
  generateDisplayStatus,
  generateRemainingRuns,
  getBowlerOnlyRuns,
  generateOver,
  fetchWinnerMessage,
  generateWicket,
} = require("../utilities/comFunction");
const { default: fastify } = require("fastify");
const { processPredictScoreMarket } = require("../markets/index")
const { cancelEventMarketsQuery, closeEventMarketByCIdQuery, cancelMarketVirtualQuery } = require("../repository/TableEventMarkets");
const { ISPREDICATIONONCRICKETCARD, DEFAULTBALLFACED, DEFAULTPLAYERRUNS, DEFAULTPLAYERBOUNDARIES } = require("../utilities/configConstants");
const configConstants = require("../utilities/configConstants");
const { getDetailsByCIdV1Service, createEventMarketsServiceV1, changeMarketCloseService, changeMarketResultService } = require("./eventMarket");
// const ballbyball ={
//   commentaryBallByBallId: 0,
//   commentaryId: commentary?.commentaryId,
//   teamId: battingTeamId,
//   overId: over?.overId,
//   overCount: 0,
//   currentOverBalls: 0,
//   bowlerId: bowler?.commentaryPlayerId,
//   batStrikeId: onStrikePlayerId,
//   batNonStrikeId: nonStrikerPlayerId,
//   ballIsCount: true,
//   ballType: 0,
//   ballIsDot: false,
//   ballRun: 0,
//   ballExtraRun: 0,
//   ballIsBoundry: false,
//   ballFour: 0,
//   ballSix: 0,
//   ballIsWicket: false,
//   ballWicketType: 0,
//   ballPlayerId: 0,
//   ballBowlerId: 0,
//   ballFielderId1: 0,
//   ballFielderId2: 0,
//   overIsMaiden: false,
//   nextBatStrikeId: onStrikePlayerId,
//   nextBatNonStrikeId: nonStrikerPlayerId,
//   currentInnings: commentary.currentInnings,
// };
const saveEventervice = async (request, fastify) => {
  // get event by competition id
  let comp = global.tblCompetitions.find(
    (item) => item.competitionId == request.body.competitionId
  );
  if (!comp) {
    throw new Error("No Competition Found with this Id");
  }
  const compEvent = await getCompEventByIdQuery(request, fastify);
  console.log("compEvent", compEvent);
  if (!compEvent) {
    throw new Error("No Event Found for this competition");
  }
  // now clone this event and store in db
  if (!request.body.eventRefId) {
    let id = generateEventId();
    request.body.eventRefId = id;
  }
  request.body = {
    ...request.body,
    commentaryId: compEvent.commentaryId,
  };
  let com = await cloneCommentaryService(request, fastify);

  //store the commentary cards

  return {
    commentaryId: com.commentaryId,
    eventRefId: com.eventRefId,
    eventName: com.eventName,
    eventDate: com.eventDate,
  };
};

const createVirtualEventService = async (request, fastify) => {
  let checkComp = global.tblCompetitions.find(
    (item) =>
      item.competitionId == request.body.competitionId && item.isActive == true
  );
  if (!checkComp) {
    throw new Error("Competition with this Id not found");
  }
  let comId;
  const validateCommentary = global.tblCommentaries.find(
    (item) => item.eventRefId == request.body.eventRefId
  );
  if (validateCommentary) {
    throw new Error("EventRefId should be unique");
  }
  let matchType;
  // check Match Type
  if (!checkComp.matchTypeId) {
    throw new Error("Match Type not found");
  } else {
    matchType = global.tblMatchTypes.find(
      (item) => item.matchTypeId == checkComp.matchTypeId
    );
    if (!matchType) {
      throw new Error("Match Type details not found");
    }
  }

  const tournamentTeams = await getTournamentTeamsByCompIdQuery(
    request.body.competitionId,
    request,
    fastify
  );
  if (!tournamentTeams || tournamentTeams.length < 2) {
    throw new Error(
      "Not enough teams for the tournament, atleast 2 teams are required."
    );
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
    const team1Name = global.tblTeams.find(
      (item) => item.teamId == request.body.team1Id
    ).teamName;
    const team2Name = global.tblTeams.find(
      (item) => item.teamId == request.body.team2Id
    ).teamName;

    request.body.eventName = `${team1Name} v ${team2Name}`;

    const team1Players = await getAllPlayersByTeamAndCompetitionIdQuery(
      {
        teamId: request.body.team1Id,
        competitionId: request.body.competitionId,
      },
      request,
      fastify
    );
    const team2Players = await getAllPlayersByTeamAndCompetitionIdQuery(
      {
        teamId: request.body.team2Id,
        competitionId: request.body.competitionId,
      },
      request,
      fastify
    );
    if (team1Players.length < 2 && team2Players.length < 2) {
      throw new Error("No players found for teams");
    }

    const isPrediction = global.tblConfigs.find(item =>
      item.key.toLowerCase().trim() === ISPREDICATIONONCRICKETCARD.trim().toLowerCase()
    )?.value;
    const isPredictMarket = isPrediction === "true";
    let pythonId, pythonURI
    if (checkComp?.pythonId) {
      pythonId = checkComp.pythonId
      const pythonAPI = global.tblPythonAPI.find(elem => elem.id === pythonId);
      pythonURI = pythonAPI?.URI;
    } else {
      let pythonAPI = global.tblPythonAPI.find(elem => elem.isActive === true && elem.isDefault === true);
      pythonId = pythonAPI?.id;
      pythonURI = pythonAPI?.URI;
    }
    let shuffle = {
      Wicket : false,
      OverComplete : false,
      MinCardRemain : false,
      InningsComplete : false
    }
    let reqSuffle = request.body.shuffleOn ? request.body.shuffleOn : null;
    let suffleNo = reqSuffle?.split(",") || []
    if(suffleNo.length > 0){
      for (let i of suffleNo){  
        i = parseInt(i)
        switch(i) {
          case 1 :
              shuffle.Wicket = true
              break;
          case 2 : 
              shuffle.OverComplete = true
              break;
          case 3 : 
            shuffle.MinCardRemain = true;
            break;
          case 4:
            shuffle.InningsComplete = true
            break;
          default :
            break;
        }
      }
    }

    let dataToInsert = {
      ...request.body,
      ...checkComp,
      isPredictMarket,
      pythonId,
      pythonURI,
      shuffle,
      setOfRules: checkComp.setOfRules ? checkComp.setOfRules : null
    };

    const commentaryData = await insertVirtualEventQuery(
      dataToInsert,
      request,
      fastify
    );
    global.tblCommentaries.push(commentaryData);
    comId = commentaryData.commentaryId;
    const team1TpId = global.tblTeams.find(
      (item) => item.teamId == request.body.team1Id
    );
    const team2TpId = global.tblTeams.find(
      (item) => item.teamId == request.body.team2Id
    );
    request.body.team1GroupId = await getGroupId(request.body.team1Id, request, fastify);
    request.body.team2GroupId = await getGroupId(request.body.team2Id, request, fastify);
    const teamData = {
      commentaryId: commentaryData.commentaryId,
      team1Id: request.body.team1Id,
      team2Id: request.body.team2Id,
      teamMaxOver: matchType.maxOversInFirstInings,
      subInning: request.body?.subInning ?? null,
      team1TpId: team1TpId?.tpId ?? null,
      team2TpId: team2TpId?.tpId ?? null,
      team1GroupId: request.body.team1GroupId,
      team2GroupId: request.body.team2GroupId,
    };
    const teamsData = await insertVirtualCommentaryTeams(
      teamData,
      request,
      fastify
    );
    for (let team of teamsData) {
      global.tblCommentaryTeams.push(team);
    }

    if (team1Players.length >= 2 && team2Players.length >= 2) {
      const data = [
        ...team1Players.map((item, i) => {
          const playerTpId = global.tblPlayers.find(elem => elem.playerId == item.playerId);
          return {
            commentaryId: commentaryData.commentaryId,
            teamId: request.body.team1Id,
            playerId: item.playerId,
            tpId: playerTpId?.tpId ?? null,
            displayOrder: i + 1,
          };
        }),
        ...team2Players.map((item, i) => {
          const playTpId = global.tblPlayers.find(elem => elem.playerId == item.playerId);
          return {
            commentaryId: commentaryData.commentaryId,
            teamId: request.body.team2Id,
            playerId: item.playerId,
            tpId: playTpId?.tpId ?? null,
            displayOrder: i + 1,
          };
        }),
      ];
      for (let info of data) {
        let playerData = await insertVirtualCommentaryPlayers(
          info,
          fastify,
          request
        );
        const teamPlayerData = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
          { playerId: playerData.playerId, teamId: playerData.teamId },
          fastify,
          request
        );
        if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
          await updateCommentaryPlayerJerseyImageQuery(
            {
              commentaryPlayerId: playerData.commentaryPlayerId,
              jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
              jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
            },
            fastify
          );
        } else {
          const teamData = global.tblTeams.find(
            (item) => item.teamId == playerData.teamId
          );
          const playerImgData = global.tblPlayers.find(
            (elem) => elem.playerId == playerData.playerId
          );

          if (playerImgData.image && teamData.jersey) {
            mergeAndSaveImage(
              {
                playerImage: playerImgData.image,
                jersey: teamData.jersey,
                playerName: playerImgData.playerName,
                teamName: teamData.teamName,
                commentaryPlayerId: playerData.commentaryPlayerId,
                teamPlayerId: null,
                commentaryId: commentaryData.commentaryId,
              },
              fastify
            );
          }
        }

        global.tblCommentaryPlayers.push(playerData);
      }

      for (const team of [request.body.team1Id, request.body.team2Id]) {
        const playerOrder = global.tblCommentaryPlayers
          .filter(
            (item) =>
              item.commentaryId == commentaryData.commentaryId &&
              item.teamId == team
          )
          .sort((a, b) => a.displayOrder - b.displayOrder);

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

        const teamData = await virtualEventTeamUpdateQuery(
          updateTeamData,
          request,
          fastify
        );
        const teamIndex = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId == commentaryData.commentaryId &&
            item.teamId == team
        );
        if (teamIndex !== -1) {
          global.tblCommentaryTeams[teamIndex] = {
            ...global.tblCommentaryTeams[teamIndex],
            ...teamData[0],
          };
        }
      }
    }
    if (commentaryData?.isPredictMarket) {
      let comp = global.tblCompetitions.find(
        (elem) => elem.competitionId == commentaryData.competitionId
      );
      if (comp && comp.matchTypeId != null && comp.matchTypeId == commentaryData.matchTypeId) {
        await addCompTempQuery(
          {
            commentaryId: commentaryData.commentaryId,
            matchTypeId: commentaryData.matchTypeId,
            competitionId: commentaryData.competitionId,
          },
          request,
          fastify
        );
      }

      callDataProvider(
        {
          commentaryId: commentaryData.commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "create",
        },
        fastify
      ).catch((err) => {
        console.log("call data provider console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/virtual.js/createVirtualEventService",
          request
        );
      });

      const { marketTemplate, eventMarket, teamAndPlayers, commentary, matchType } = await getDetailsByCIdV1Service({ ...request, body: { commentaryId: commentaryData.commentaryId } }, fastify);
      const processedMarkets = processMarketData(marketTemplate, eventMarket, teamAndPlayers, commentary, matchType, commentaryData);
      for (const d of Object.keys(processedMarkets)) {
        const data = processedMarkets[d]
        await createEventMarketsServiceV1({ ...request, body: { eventMarket: data } }, fastify);
      }
    }
    let cData = await getMatchDataByCId(
        {
          commentaryId: commentaryData.commentaryId,
        },
        request,
        fastify
    );
    await callClientAPI(
      {
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData,
      },
      request,
      fastify,
      "services/virtual.js/createVirtualEventService"
    );
  }
  // save virtual card data
  if (request.body.cards.length > 0) {
    await saveComCardQuery(
      {
        commentaryId: comId,
        cards: request.body.cards,
      },
      request,
      fastify
    );
  }
  const comData = await commentaryResponseSerivce(comId);
  // return "Commentary Created Successfully";
  return comData;
};

const virtualEventTossService = async (request, fastify) => {
  const { commentaryId, tossWonTeam, decision } = request.body;

  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId == commentaryId
  );
  if (!commentary) {
    throw new Error("Event with this ID not found");
  }
  if (commentary.commentaryStatus == commentaryStatus.COMPLETED) {
    throw new Error("Event is already completed");
  }
  if (commentary.commentaryStatus != commentaryStatus.OPEN) {
    throw new Error("Toss already done");
  }

  let tossWonBy, shortName;
  if (tossWonTeam === 1) {
    tossWonBy = commentary.team1Id;
    shortName = global.tblTeams.find(
      (item) => item.teamId == tossWonBy
    )?.teamShortName;
  } else if (tossWonTeam === 2) {
    tossWonBy = commentary.team2Id;
    shortName = global.tblTeams.find(
      (item) => item.teamId == tossWonBy
    )?.teamShortName;
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
    commentaryStatus: commentaryStatus.TOSSDONE,
  };

  const tossData = await virtualEventTossQuery(data, request, fastify);
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId == commentaryId
  );
  if (index !== -1) {
    global.tblCommentaries[index] = {
      ...global.tblCommentaries[index],
      ...tossData[0],
    };
  }
  // update team status and batting order
  for (const team of [commentary.team1Id, commentary.team2Id]) {
    const isTossWinner = team === tossWonBy;
    const teamStatus = isTossWinner
      ? choseTo === 1
        ? 1
        : 2
      : choseTo === 1
        ? 2
        : 1;
    const teamBattingOrder = isTossWinner
      ? choseTo === 1
        ? 1
        : 2
      : choseTo === 1
        ? 2
        : 1;

    let subInning;
    if (teamStatus == 1) {
      subInning = 1;
    } else {
      subInning = 2;
    }
    const teamPlayer = global.tblCommentaryTeams.find(
      (item) => item.commentaryId == commentaryId && item.teamId == team
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
      teamOver: 0,
      teamWicket: 0,
      subInning,
    };

    const teamData = await virtualEventTeamUpdateQuery(
      updateTeamData,
      request,
      fastify
    );

    const teamIndex = global.tblCommentaryTeams.findIndex(
      (item) => item.commentaryId == commentaryId && item.teamId == team
    );
    if (teamIndex !== -1) {
      global.tblCommentaryTeams[teamIndex] = {
        ...global.tblCommentaryTeams[teamIndex],
        ...teamData[0],
      };
    }
  }

  // update players status and order
  const battingTeamId =
    choseTo === 1
      ? tossWonBy
      : tossWonBy === commentary.team1Id
        ? commentary.team2Id
        : commentary.team1Id;

  const bowlingTeamId =
    choseTo === 2
      ? tossWonBy
      : tossWonBy === commentary.team1Id
        ? commentary.team2Id
        : commentary.team1Id;

  let onStrikePlayerId = null;
  let nonStrikerPlayerId = null;
  let onStrikePlayer = {};
  let nonStrikerPlayer = {};
  let currentBowler = {};
  const batters = global.tblCommentaryPlayers
    .filter(
      (p) => p.commentaryId === commentaryId && p.teamId === battingTeamId
    )
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
    const players = await virtualPlayersSelectQuery(
      updateData,
      request,
      fastify
    );

    const batterIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === batter.commentaryPlayerId
    );

    if (batterIndex !== -1) {
      global.tblCommentaryPlayers[batterIndex] = {
        ...global.tblCommentaryPlayers[batterIndex],
        ...players[0],
      };
    }
    if (i === 0) {
      onStrikePlayerId = batter.commentaryPlayerId;
      onStrikePlayer = global.tblCommentaryPlayers[batterIndex];
    }
    if (i === 1) {
      nonStrikerPlayerId = batter.commentaryPlayerId;
      nonStrikerPlayer = global.tblCommentaryPlayers[batterIndex];
    }
  }
  const bowlers = global.tblCommentaryPlayers
    .filter(
      (p) => p.commentaryId === commentaryId && p.teamId === bowlingTeamId
    )
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
    const player = await virtualPlayersSelectQuery(
      updateData,
      request,
      fastify
    );

    const bowlerIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === bowler.commentaryPlayerId
    );

    if (bowlerIndex !== -1) {
      global.tblCommentaryPlayers[bowlerIndex] = {
        ...global.tblCommentaryPlayers[bowlerIndex],
        ...player[0],
      };
    }
    currentBowler = global.tblCommentaryPlayers[bowlerIndex];
  }
  // create over
  const commentaryOvers = {
    overId: 0,
    commentaryId: commentary?.commentaryId,
    // teamId: bowlingTeamId,
    teamId: battingTeamId,
    over: 0,
    ballCount: 0,
    bowlerId: bowler?.commentaryPlayerId,
    totalRun: 0,
    totalFour: 0,
    totalSix: 0,
    totalWideBall: 0,
    totalWideRun: 0,
    totalNoball: 0,
    totalNoBallRun: 0,
    totalByesRun: 0,
    totalLegByesRun: 0,
    totalPanelty: 0,
    totalWicket: 0,
    dotBall: 0,
    isComplete: false,
    powerplay: false,
    isOverInPowerplay: false,
    powerplayType: 1,
    isMaiden: false,
    isDelete: false,
    currentInnings: commentary.currentInnings,
    teamScore: 0,
    powerPlayName: null,
    isPowerPlay: false,
  };
  const over = await virtualOverQuery(commentaryOvers, request, fastify);
  // add over to global variable
  global.tblOvers.push(over);
  // create first ball
  const commentaryBallByBall = {
    commentaryBallByBallId: 0,
    commentaryId: commentary?.commentaryId,
    teamId: battingTeamId,
    overId: over?.overId,
    overCount: 0,
    currentOverBalls: 0,
    bowlerId: bowler?.commentaryPlayerId,
    batStrikeId: onStrikePlayerId,
    batNonStrikeId: nonStrikerPlayerId,
    ballIsCount: true,
    ballType: 0,
    ballIsDot: false,
    ballRun: 0,
    ballExtraRun: 0,
    ballIsBoundry: false,
    ballFour: 0,
    ballSix: 0,
    ballIsWicket: false,
    ballWicketType: 0,
    ballPlayerId: 0,
    ballBowlerId: 0,
    ballFielderId1: 0,
    devOver: null,
    devCurrentOverBall: null,
    ballFielderId2: 0,
    overIsMaiden: false,
    nextBatStrikeId: onStrikePlayerId,
    nextBatNonStrikeId: nonStrikerPlayerId,
    currentInnings: commentary.currentInnings,
    cardType: request.body.cardType ? request.body.cardType : null,
    cardKey: request.body.cardKey ? request.body.cardKey : null,
  };
  const ball = await virtualBallByBallQuery(
    commentaryBallByBall,
    request,
    fastify
  );
  // add ball to global variable
  global.tblCommentaryBallByBall.push(ball);

  // battingTeams
  const batTeam = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.teamId == battingTeamId &&
      item.currentInnings == commentary.currentInnings
  );
  const compartnership = {
    commentaryPartnershipId: 0,
    commentaryId: commentary?.commentaryId,
    teamId: battingTeamId,
    batter1Id: onStrikePlayerId,
    batter1Name: onStrikePlayer.playerName,
    batter2Id: nonStrikerPlayerId,
    batter2Name: nonStrikerPlayer.playerName,
    isActive: true,
    order: batTeam.teamWicket ? batTeam.teamWicket : 1,
    commentaryBallByBallId: ball?.commentaryBallByBallId,
    currentInnings: commentary.currentInnings,
  };
  // partnership
  const partner = await virtualPartnershipQuery(
    compartnership,
    request,
    fastify
  );
  global.tblCommentaryPartnership.push(partner);
  //update commentary Status
  await comStatusUpdateQuery(
    {
      commentaryId,
      commentaryStatus: commentaryStatus.INPROGRESS,
    },
    request,
    fastify
  );
  global.tblCommentaries[index].commentaryStatus = commentaryStatus.INPROGRESS;
  const comData = await commentaryResponseSerivce(commentaryId);
  // return "Toss Done Successfully";
  const pythonURI = commentary.pythonURI ?? null;

  let key1 = global.tblConfigs.find((item) => item.key === DEFAULTBALLFACED);
  let key2 = global.tblConfigs.find((item) => item.key === DEFAULTPLAYERBOUNDARIES);
  let key3 = global.tblConfigs.find((item) => item.key === DEFAULTPLAYERRUNS);

  if (commentary?.isPredictMarket) {
    callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        match_type_id: commentary.matchTypeId,
        event_id: commentary.eventRefId,
        default_ball_faced: parseInt(key1?.value) || 0,
        default_player_boundaries: parseInt(key2?.value) || 0,
        default_player_runs: parseInt(key3?.value) || 0,
      },
      "/api/v1/loadcommentary",
      fastify,
      request,
      pythonURI
    );
    callDataProvider(
        {
          commentaryId: commentary?.commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "update",
        },
        fastify
    ).catch((err) => {
      console.log("call Data Provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/virtualEventTossService",
        request
      );
    });

    const getEventMarketId = global.tblEventMarketsV2.find(item => item.commentaryId === commentaryId && item.eventRefId === commentary?.eventRefId);
    if (getEventMarketId) {
      await changeMarketCloseService({ ...request, body: { commentaryId: commentaryId, eventMarketId: getEventMarketId.eventMarketId } }, fastify);
      const getCommentaryTeam = global.tblCommentaryTeams.find(item => item.commentaryId === commentaryId && item.teamId === tossWonBy);
      if (getCommentaryTeam) {
        const marketRunner = global.tblMarketRunnerV2.find(item => item.eventMarketId === getEventMarketId.eventMarketId && item.selectionId == getCommentaryTeam.commentaryTeamId);
        if (marketRunner) {
          await changeMarketResultService({ ...request, body: { eventMarketId: getEventMarketId.eventMarketId, commentaryId, result: marketRunner.runnerId } }, fastify);
        }
      }
    }
  }
  let cData = await getMatchDataByCId(
    {
      commentaryId: commentaryId,
    },
    request,
    fastify
  );
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: cData,
    },
    request,
    fastify,
    "services/virtual.js/virtualEventTossService"
  );
  return comData;
};

const updateVirtualEventStatusService = async (request, fastify) => {
  const { commentaryId, commentaryPlayerId } = request.body;
  if (commentaryId === undefined) {
    throw new Error("Invalid input: commentaryId is required");
  }
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not found");
  }
  const response = {};
  const sendDataForSocketUpdate = {};
  sendDataForSocketUpdate.commentaryId = commentaryId;
  sendDataForSocketUpdate.eventRefId = global.tblCommentaries[index]?.eventRefId ?? null;
  sendDataForSocketUpdate.dataToUpdate = [];

  let pythonURI = global.tblCommentaries[index]?.pythonURI || null;
  let displayStatus = "Ball";
  const commentaryDetails = {
    commentaryId,
    displayStatus,
  };

  await virtualEventBallStartQuery(commentaryDetails, fastify, request);

  // Update the commentary status in the global array
  global.tblCommentaries[index].displayStatus = displayStatus;

  if (global.tblCommentaries[index].isPredictMarket) {
    callPredictorMarket(
      {
        commentary_id: commentaryId,
        status: EventMarketStatus.Suspend,
        match_type_id: global.tblCommentaries[index].matchTypeId,
        is_open_market: false,
        player_id: commentaryPlayerId || null,
      },
      "/api/v1/updatemarketstatus",
      fastify,
      request,
      pythonURI
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
          commentaryId :global.tblCommentaries[index].commentaryId
        },
      },
      fastify,
      "callFromSocket"
    ).catch((err) => {
      console.log(
        "err in commentaryDetailsByEventIdService/updateVirtualEventStatusService",
        err
      );
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/virtual.js/updateVirtualEventStatusService",
        request
      );
    });
  }

  const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
  
  response.commentaryDetails = {
    ...global.tblCommentaries[index],
    displayStatus,
    ...weatherAndPitchData,
  };
  sendDataForSocketUpdate.dataToUpdate.push({
    module: "commentaryDetails",
    type: "update",
    data: response.commentaryDetails,
  });

  global.clientSocketIo.forEach((socket) => {
    socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  });

  commentaryDetails.callPredictions = [];
  const comData = await commentaryResponseSerivce(commentaryId);
  // return {
  //   name: "commentaryDetails",
  //   value: commentaryDetails,
  // };
  return comData;
};

const commentaryResponseSerivce = async (commentaryId) => {
  // get commentary data
  if (commentaryId === null || commentaryId === undefined) {
    return null;
  }
  let com = global.tblCommentaries.find(
    (item) => item.commentaryId == commentaryId
  );
  if (!com) {
    return null;
  }
  const commentaryData = {
    commentaryId: com.commentaryId,
    eventName: com.eventName,
    eventTypeName:
      com.eventTypeId != null
        ? global.tblEventTypes.find(
          (item) => item.eventTypeId === com.eventTypeId
        ).eventType
        : null,
    competitionName: com.competition,
    eventRefId: com.eventRefId,
    eventDate: com.eventDate,
    commentaryStatus: com.commentaryStatus,
    choseTo:
      com.choseTo != null ? (com.choseTo === 1 ? "Batting" : "Bowling") : null,
    tossWonBy:
      com.tossWonBy != null
        ? global.tblTeams.find((item) => item.teamId === com.tossWonBy).teamName
        : null,
    remark: com.rmk,
    shuffle : com.shuffle
  };
  return commentaryData;
};

const ballByBallVirtualEventService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not found");
  }
  let commentaryTeamData, commentaryPlayerData;
  const commentaryTeams = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId == commentaryId && item.teamId == request.body.teamId
  );
  let totalBalls = (commentaryTeams?.teamOver || 0) * 10;
  totalBalls++;
  let overs = Math.floor(totalBalls / 6);
  let balls = totalBalls % 6;
  let teamOver = parseFloat(`${overs}.${balls}`);

  if (commentaryTeams) {
    commentaryTeamData = {
      teamScore: commentaryTeams?.teamScore + request.body.run,
      teamOver: teamOver,
      teamWicket: 0,
      crr: 0,
      rrr: 0,
      teamTrialRuns: 0,
      teamLeadRuns: 0,
      teamWideRuns: 0,
      teamByRuns: 0,
      teamLegByRuns: 0,
      teamNoBallRuns: 0,
      teamPenaltyRuns: 0,
      isWin: false,
      commentaryId,
      commentaryTeamId: request.body.commentaryTeamId,
    };
    const teamsScoring = await virtualTeamRunsQuery(
      commentaryTeamData,
      fastify,
      request
    );
    // console.log("teamsScoring", teamsScoring);
    const index = global.tblCommentaryTeams.findIndex(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.teamId == request.body.teamId
    );
    if (index !== -1) {
      global.tblCommentaryTeams[index] = {
        ...global.tblCommentaryTeams[index],
        ...teamsScoring,
      };
    }
  }
  const commentaryPlayers = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.commentaryPlayerId == request.body.commentaryPlayerId
  );

  if (commentaryPlayers) {
    const commentaryPlayerData = {
      batRun,
      batBall: request.boyd.batBall
        ? commentaryPlayers.batBall + 1
        : commentaryPlayers.batBall,
      batDotBall: request.body.batDotBall
        ? commentaryPlayers.batDotBall + 1
        : commentaryPlayers.batDotBall,
      batFour: request.body.batFour
        ? commentaryPlayers.batFour + 1
        : commentaryPlayers.batFour,
      batSix: request.body.batSix
        ? commentaryPlayers.batSix + 1
        : commentaryPlayers.batSix,
      batSrr: commentaryPlayers.batSrr || null,
      bowlerRun: request.body.bowlerRun
        ? commentaryPlayers.bowlerRun + request.body.run
        : commentaryPlayers.bowlerRun,
      bowlerOver:
        request.body.isBallCount == true
          ? commentaryPlayers.bowlerOver + 1
          : commentaryPlayers.bowlerOver,
      bowlerTotalBall:
        request.body.isBallCount == true
          ? commentaryPlayers.bowlerTotalBall + 1
          : commentaryPlayers.bowlerTotalBall,
      bowlerDotBall:
        request.body.isBallCount == true && request.body.batRun === 0
          ? commentaryPlayers.bowlerDotBall + 1
          : commentaryPlayers.bowlerDotBall,
      bowlerMaidenOver: request.body.bowlerMaidenOver
        ? commentaryPlayers.bowlerMaidenOver + 1
        : commentaryPlayers.bowlerMaidenOver,
      bowlerFour: request.body.batFour
        ? commentaryPlayers.bowlerFour + 1
        : commentaryPlayers.bowlerFour,
      bowlerSix: request.body.batSix
        ? commentaryPlayers.bowlerSix + 1
        : commentaryPlayers.bowlerSix,
      bowlerWideBall:
        request.body.isBallCount == false && request.body.bowlerWideBall
          ? commentaryPlayers.bowlerWideBall + 1
          : commentaryPlayers.bowlerWideBall,
      bowlerNoBall:
        request.body.isBallCount == false && request.body.bowlerNoBall
          ? commentaryPlayers.bowlerNoBall + 1
          : commentaryPlayers.bowlerNoBall,
      bowlerByeBall:
        request.body.isBallCount == false && request.body.bowlerByeBall
          ? commentaryPlayers.bowlerByeBall + 1
          : commentaryPlayers.bowlerByeBall,
      bowlerLegByeBall:
        request.body.isBallCount == false && request.body.bowlerLegByeBall
          ? commentaryPlayers.bowlerLegByeBall + 1
          : commentaryPlayers.bowlerLegByeBall,
      bowlerTotalWicket: request.body.wicket
        ? commentaryPlayers.bowlerTotalWicket + 1
        : commentaryPlayers.bowlerTotalWicket,
      bowlerEconomy: commentaryPlayers.bowlerEconomy || null,
      commentaryId: commentaryId,
      commentaryPlayerId: request.body.commentaryPlayerId,
    };
    const batPlayer = await virtualPlayerRunsQuery(
      commentaryPlayerData,
      fastify,
      request
    );
    const index = global.tblCommentaryPlayers.findIndex(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.commentaryPlayerId == request.body.commentaryPlayerId
    );
    if (index !== -1) {
      global.tblCommentaryPlayers[index] = {
        ...global.tblCommentaryPlayers[index],
        ...batPlayer,
      };
    }
  }

  if (request.body.commentaryWickets) {
    const wicketData = await createVirtualWicketQuery(data, fastify, request);
    global.tblCommentaryWicket.push(wicketData);
  }

  if (request.body.overs) {
    if (request.body.overId == 0) {
      const over = {
        commentaryId,
        teamId: request.body.teamId,
        bowlerId: request.body.bowlerId,
      };
      const overData = await createVirtualOverQuery(over, fastify, request);
      global.tblOvers.push(overData);
    } else {
      const overData = await updateVirtualOverQuery(data, fastify, request);
      const index = global.tblOvers.findIndex(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.overId == request.body.overId
      );
      if (index !== -1) {
        global.tblOvers[index] = {
          ...global.tblOvers[index],
          ...overData,
        };
      }
    }
  }

  if (request.body.commentaryBallByBall) {
    const ballData = {
      commentaryId,
      teamId: bowlingTeamId,
      bowlerId: request.body.bowlerId,
      overId: overs.overId,
      batStrikeId: request.body.bowler1Id,
      batNonStrikeId: request.body.bowler2Id,
      ballIsCount: request.body.ballIsCount,
      ballType: request.body.ballType,
      overIsMaiden: false,
      ballBowlerId: request.body.bowlerId,
      ballPlayerId: request.body.batterId,
      commentaryPartnershipId: partnerships.commentaryPartnershipId,
      cardKey: request.body.cardKey ? request.body.cardKey : null,
      cardType: request.body.cardType ? request.body.cardType : null,
    };
    const balls = await createVirtualBallByBallQuery(
      ballData,
      fastify,
      request
    );
    global.tblCommentaryBallByBall.push(balls);
    // const commentaryBallByBall = await updateVirtualBallByBallQuery(data, fastify, request)
    // const index = global.tblCommentaryBallByBall.findIndex(
    //   (item) => item?.commentaryId === commentaryId && item.commentaryBallByBallId == request.body.commentaryBallByBallId
    // );
    // if(index !== -1) {
    //   global.tblCommentaryBallByBall[index] = {
    //     ...global.tblCommentaryBallByBall[index],
    //     ...commentaryBallByBall,
    //   };
    // }
  }

  if (request.body.commentaryPartnerships) {
    if (request.body.commentaryPartnershipId == 0) {
      const partnershipData = await createvirtualPartnershipQuery(
        data,
        fastify,
        request
      );
      global.tblCommentaryPartnership.push(partnershipData);
    } else {
      const partnershipData = await updateVirtualPartnershipQuery(
        data,
        fastify,
        request
      );
      const index = global.tblCommentaryPartnership.findIndex(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.commentaryPartnershipId == request.body.commentaryPartnershipId
      );
      if (index !== -1) {
        global.tblCommentaryPartnership[index] = {
          ...global.tblCommentaryPartnership[index],
          ...partnershipData,
        };
      }
    }
  }
};
const ballByBallChangeService = async (request, fastify) => {
  let ball = 1;
  let isBoundary = false;
  // const { commentaryId, run, ballType, isWicket = false } = request.body;
  const { commentaryId, cardType, cardKey, cardValue } = request.body;
  cardLogger(
    request,
    fastify
  )
  const commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Event with this id not found");
  }
  if (commentaryDetails.commentaryStatus == commentaryStatus.OPEN) {
    throw new Error("Toss is not done yet");
  }
  if (commentaryDetails.commentaryStatus == commentaryStatus.COMPLETED) {
    throw new Error("Event is already completed");
  }

  let run = 0,
    isWicket = false,
    ballType = BALL_TYPE.REGULAR;
  if (cardValue != Cards.J && cardValue != Cards.K) {
    run = parseInt(cardValue);
    if (cardValue == Cards[4] || cardValue == Cards[6]) {
      isBoundary = true;
    } else {
      isBoundary = false;
    }
    isWicket = false;
  }
  if (cardValue == Cards.K) {
    isWicket = true;
    run = 0;
  }
  if (cardValue == Cards.J) {
    isWicket = false;
    run = 0;
    ballType = BALL_TYPE.WIDE;
    ball = 0; // wide ball does not count as a ball
  }

  if (commentaryDetails.commentaryStatus == commentaryStatus.COMPLETED) {
    let getRes = await comResponseService(request, fastify);
    return {
      isMatchComplete: true,
      isOverComplete: false,
      isWicket: false,
      inningChange: false,
      message: "Match is already completed",
      ...getRes,
    };
  }
  // get teams
  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings
  );
  // get latest over
  const over = global.tblOvers
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.overId - a.overId)[0];
  // get latest partnership
  const partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId)[0];
  // get latest ball
  const prevBall = global.tblCommentaryBallByBall
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0];

  // get the onPitch players
  let battingTeam = teams.find((item) => item.teamStatus == 1);
  let bowlingTeam = teams.find((item) => item.teamStatus == 2);
  let onStrikePlayer = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.onStrike == true &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == battingTeam.teamId
  );
  let nonStrikePlayer = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.onStrike == false &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == battingTeam.teamId
  );
  let currentBowler = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == bowlingTeam.teamId
  );
  let matchType = global.tblMatchTypes.find(
    (i) => i.matchTypeId == commentaryDetails.matchTypeId
  );

  if (isWicket && isWicket == true) {
    const result = await handleWicketService(
      {
        commentaryDetails,
        battingTeam,
        bowlingTeam,
        onStrikePlayer,
        nonStrikePlayer,
        currentBowler,
        currentOver: over,
        prevBall,
        partnership,
        matchType,
        ballType,
      },
      request,
      fastify
    );

    // set res
    if (result.comOver != null) {
      let getRes = await comResponseService(request, fastify, true);
      result.comOver = undefined;
      return {
        ...result,
        ...getRes
      };
    }
    else {
      let getRes = await comResponseService(request, fastify);
      result.comOver = undefined;
      return {
        ...result,
        ...getRes
      };
    }
    // let getRes = await comResponseService(request, fastify);
    // if (result.comOver !== null) {
    //   let over = {
    //     overId: result.comOver.overId,
    //     over: result.comOver.over,
    //     teamId: result.comOver.teamId,
    //     ballCount: result.comOver.ballCount,
    //     teamScore: result.comOver.teamScore,
    //     isComplete: result.comOver.isComplete,
    //   };
    //   delete result.comOver;
    //   return {
    //     ...result,
    //     ...getRes,
    //     over,
    //   };
    // } else {
    //   delete result.comOver;
    //   return {
    //     ...result,
    //     inningChange: false,
    //     ...getRes,
    //   };
    // }
  }

  let result = await updateRunPayload(
    {
      run: run,
      ballType: ballType,
      commentaryId: commentaryId,
      commentaryDetails: commentaryDetails,
      battingTeam: battingTeam,
      bowlingTeam: bowlingTeam,
      pitchPlayers: {
        onStrikePlayer: onStrikePlayer,
        nonStrikePlayer: nonStrikePlayer,
        currentBowler: currentBowler,
      },
      onStrikePlayer: onStrikePlayer,
      nonStrikePlayer: nonStrikePlayer,
      currentBowler: currentBowler,
      partnership: partnership,
      over: over,
      ball: ball,
      isBoundary: isBoundary,
      prevBall: prevBall,
      matchType,
    },
    request,
    fastify
  );
  const { ballByBall } = result;
  // save data in db
  // const ballByBall = await saveComVirtual(
  //   {
  //     ...request,
  //     body: result,
  //   },
  //   fastify
  // );
  // return res;
  let overComplete = null;
  if (result.isOverComplete) {
    let checkMatch = await checkInningsSwitch(
      {
        commentaryDetails,
        commentaryId: commentaryDetails.commentaryId,
        checkFor: inningSwitch.ALL,
        matchType,
      },
      request,
      fastify
    );
    if (checkMatch.inningChange) {
      loadVirtualCom(request, fastify)
      let getRes = await comResponseService(request, fastify, true);
      return {
        isMatchComplete: checkMatch.matchComplete,
        inningChange: checkMatch.inningChange,
        isOverComplete: true,
        isWicket: false,
        ...getRes,
      };
    }
    if (checkMatch.matchComplete) {
      let getRes = await comResponseService(request, fastify);
      return {
        isMatchComplete: true,
        isOverComplete: true,
        isWicket: false,
        inningChange: false,
        ...getRes,
      };
    }
    overComplete = await generateOverService(
      {
        ...ballByBall,
        checkFor: inningSwitch.OVER,
        matchType,
        commentaryId: request.body.commentaryId,
      },
      request,
      fastify
    );
    let getRes = await comResponseService(request, fastify, true);
    let over = overComplete.completedOver;
    return {
      inningChange: false,
      isOverComplete: true,
      isWicket: false,
      isMatchComplete: false,
      ...getRes,
      // over: {
      //   overId: over.overId,
      //   over: over.over,
      //   teamId: over.teamId,
      //   ballCount: over.ballCount,
      //   teamScore: over.teamScore,
      //   isComplete: over.isComplete,
      // },
    };
  }
  const mc = await checkInningsSwitch(
    {
      ...result,
      commentaryDetails,
      commentaryId: commentaryDetails.commentaryId,
      checkFor: inningSwitch.RUN,
      matchType,
    },
    request,
    fastify
  );
  if (mc.matchComplete) {
    let getRes = await comResponseService(request, fastify);
    return {
      isMatchComplete: mc.matchComplete,
      isOverComplete: false,
      isWicket: false,
      inningChange: false,
      ...getRes,
    };
  }

  let getRes = await comResponseService(request, fastify);
  return {
    inningChange: false,
    isMatchComplete: false,
    isOverComplete: false,
    isWicket: false,
    ...getRes,
  };
};
const updateRunPayload = async (data, request, fastify) => {
  // generate db update payload using data
  let isChangeStrike = false;
  let updateBall = {};
  let updateOver = {};
  let updatePartnership = {};
  let updateBowler = {};
  let updateBatter = {};
  let updateBattingTeam = {};
  let nonStrikeBatter = {};
  const {
    run,
    ballType,
    commentaryId,
    commentaryDetails,
    battingTeam,
    bowlingTeam,
    pitchPlayers,
    partnership,
    over,
    ball,
    onStrikePlayer,
    nonStrikePlayer,
    currentBowler,
    isBoundary,
    prevBall,
    matchType,
  } = data;
  const updateBowlOver =
    ball > 0
      ? currentBowler.bowlerOver
        ? (parseFloat(currentBowler.bowlerOver || 0) + 0.1).toFixed(1)
        : (currentBowler.bowlerOver + 0.1).toFixed(1)
      : currentBowler.bowlerOver;
  if (ballType === BALL_TYPE.WIDE) {
    // const valueOfWideBall = +matchType.valueOfWideBall || 0;
    const runToUpdate = +matchType.valueOfWideBall || 0;
    updateBowler["bowlerOver"] = currentBowler.bowlerOver || 0;
    updateBowler["bowlerWideBall"] = (currentBowler.bowlerWideBall || 0) + 1;
    updateBowler["bowlerWideBallRun"] =
      (currentBowler.bowlerWideBallRun || 0) + runToUpdate;
    updateBowler["bowlerRun"] = (currentBowler.bowlerRun || 0) + runToUpdate;
    updateBattingTeam["teamWideRuns"] =
      (battingTeam.teamWideRuns || 0) + runToUpdate;
    updateBattingTeam["teamScore"] = (battingTeam.teamScore || 0) + runToUpdate;
    updateOver["teamScore"] = `${updateBattingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0
      }`;
    updateOver["totalWideBall"] = (over.totalWideBall || 0) + 1;
    updateOver["totalWideRun"] = (over.totalWideRun || 0) + runToUpdate;
    updateOver["totalRun"] = (over.totalRun || 0) + runToUpdate;
    updateBall["ballIsCount"] = false;
    updateBall["ballRun"] = 0;
    updateBall["ballExtraRun"] = runToUpdate;
    updateBall["ballType"] = BALL_TYPE.WIDE;
    updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
    updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    // updateBall.autoStrikeBallCount = over.ballCount + 1;
    updatePartnership["totalRuns"] = partnership.totalRuns + runToUpdate;
    updatePartnership["extras"] = partnership.extras + runToUpdate;
    // updateBattingTeam["teamOver"] = battingTeam.teamOver;
    updateBall["overCount"] = (
      parseFloat(battingTeam.teamOver || 0) + 0.1
    ).toFixed(1);
    updateBall["currentOverBalls"] = over.ballCount + 1;
    updateBall["cardType"] = request.body.cardType;
    updateBall["cardKey"] = request.body.cardKey;
  } else {
    updateBall["ballIsCount"] = ball > 0 ? true : false;
    updateBall["ballType"] = BALL_TYPE.REGULAR;
    updateBall["ballRun"] = run;
    updateBall["batStrikeId"] = onStrikePlayer.commentaryPlayerId;
    updateBall["batNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    updateBall["teamId"] = battingTeam.teamId;
    updateBall["overId"] = over.overId;
    updateBall["cardType"] = request.body.cardType;
    updateBall["cardKey"] = request.body.cardKey;
    updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
    updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    if (matchType.isAutoChangeStriker && ball > 0) {
      updateBall.autoStrikeBallCount = over.ballCount + 1;
    }
    // update batter
    updateBatter["batRun"] = onStrikePlayer.batRun + run;
    updateBatter["batBall"] = onStrikePlayer.batBall + ball;
    // update bowler
    updateBowler["bowlerRun"] = currentBowler.bowlerRun + run;
    updateBowler["bowlerTotalBall"] = currentBowler.bowlerTotalBall + ball;
    updateBowler["bowlerOver"] = updateBowlOver;
    // update partnership
    updatePartnership["totalRuns"] = partnership.totalRuns + run;
    updatePartnership["totalBalls"] = partnership.totalBalls + ball;
    updatePartnership["batter1Runs"] =
      // check if the same batter is on strike or not
      partnership.batter1Id == onStrikePlayer.commentaryPlayerId
        ? partnership.batter1Runs + run
        : partnership.batter1Runs;
    updatePartnership["batter2Runs"] =
      // check if the same batter is on strike or not
      partnership.batter2Id == onStrikePlayer.commentaryPlayerId
        ? partnership.batter2Runs + run
        : partnership.batter2Runs;
    updatePartnership["batter1Balls"] =
      // check if the same batter is on strike or not
      partnership.batter1Id == onStrikePlayer.commentaryPlayerId
        ? partnership.batter1Balls + ball
        : partnership.batter1Balls;
    updatePartnership["batter2Balls"] =
      // check if the same batter is on strike or not
      partnership.batter2Id == onStrikePlayer.commentaryPlayerId
        ? partnership.batter2Balls + ball
        : partnership.batter2Balls;
    // update over
    updateOver["ballCount"] = over.ballCount + ball;
    updateOver["totalRun"] = over.totalRun + run;
    // update batting team
    updateBattingTeam["teamScore"] = battingTeam.teamScore + run;
    updateBattingTeam["teamWicket"] = battingTeam.teamWicket + 0;
    updateBattingTeam["teamOver"] =
      ball > 0
        ? (parseFloat(battingTeam.teamOver || 0) + 0.1).toFixed(1)
        : battingTeam.teamOver;
    updateOver["teamScore"] = `${updateBattingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0
      }`;
    // update ballByBall
    updateBall["overCount"] = updateBattingTeam.teamOver;
    updateBall["currentOverBalls"] = updateOver.ballCount;
    updateBall["bowlerId"] = currentBowler.commentaryPlayerId;
  }
  // changes according to run and ball type
  if (run === 0) {
    updateBall["batStrikeId"] = onStrikePlayer.commentaryPlayerId;
    updateBall["batNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    updateBall["ballIsDot"] = true;
    updateBatter["batDotBall"] = onStrikePlayer.batDotBall + ball;
    updateOver["dotBall"] = over.dotBall + ball;
    updateBowler["bowlerDotBall"] = currentBowler.bowlerDotBall + ball;
  } else if (isBoundary) {
    if (run == 4) {
      updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
      updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
      updateBall["ballIsBoundry"] = true;
      updateBall["ballFour"] = 1;
      updateBatter["batFour"] = onStrikePlayer.batFour + 1;
      updateBowler["bowlerFour"] = currentBowler.bowlerFour + 1;
      updateOver["totalFour"] = over.totalFour + 1;
      updatePartnership["totalFour"] = partnership.totalFour + 1;
    }
    if (run == 6) {
      updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
      updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
      updateBall["ballIsBoundry"] = true;
      updateBall["ballSix"] = 1;
      updateBatter["batSix"] = onStrikePlayer.batSix + 1;
      updateBowler["bowlerSix"] = currentBowler.bowlerSix + 1;
      updateOver["totalSix"] = over.totalSix + 1;
      updatePartnership["totalSix"] = partnership.totalSix + 1;
    }
  } else if (run % 2 !== 0) {
    isChangeStrike = true;
    updateBall["nextBatStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    updateBall["nextBatNonStrikeId"] = onStrikePlayer.commentaryPlayerId;
  }
  // check this weather complete or not
  let newOver = {};
  let isOverComplete =
    updateOver.ballCount >= (matchType?.ballsPerOver || 6) ? true : false;
  updateBatter = {
    ...onStrikePlayer,
    ...updateBatter,
    onStrike: isChangeStrike ? false : true,
  };
  updateBowler = {
    ...currentBowler,
    ...updateBowler,
  };
  nonStrikeBatter = {
    ...nonStrikePlayer,
    onStrike: isChangeStrike ? true : false,
  };
  updateBattingTeam = {
    ...battingTeam,
    ...updateBattingTeam,
  };
  updateOver = {
    ...over,
    ...updateOver,
  };
  updatePartnership = {
    ...partnership,
    ...updatePartnership,
  };
  const ballByBall = generateBall(
    {
      updateBall,
      commentaryBallByBallId: 0,
      updateBattingTeam,
      updateOver,
      updateBatter,
      updateBowler,
      nonStrikeBatter,
      updatePartnership,
      commentaryDetails,
    },
    request
  );
  const newPart = generatePartnership(
    {
      updateBattingTeam,
      currentPartnership: updatePartnership,
      commentaryDetails,
    },
    request
  );
  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings
  );

  let remainingBallsShow = teams.some((team) => team.isBattingComplete);
  const ncom = {
    ...commentaryDetails,
    displayStatus: generateDisplayStatus({
      currentBall: ballByBall,
    }),
    rmk: remainingBallsShow ? generateRemainingRuns(
      {
        team: updateBattingTeam,
        ballsPerOver: matchType.ballsPerOver,
      },
      request
    ) : "",
  };
  let objToSave = {
    commentaryTeams: [updateBattingTeam],
    commentaryOvers: updateOver,
    commentaryPlayers: [updateBatter, updateBowler, nonStrikeBatter],
    commentaryBallByBall: ballByBall,
    commentaryPartnership: newPart,
    commentaryDetails: ncom,
    commentaryId: commentaryDetails.commentaryId,
  };
  const prediction = checkInningChangePredictor({
    commentaryDetails: ncom,
    matchType,
    batTeam: updateBattingTeam,
    bowlTeam : bowlingTeam,
    over: updateOver,
    isOverComplete
  });

  const endInningForPredictor = prediction.inningChange;
  const ballByBall1 = await saveComVirtual(
    {
      ...request,
      body: {
        ...objToSave,
        isOverComplete,
        endInningForPredictor
      },
    },
    fastify
  );
  // check if isautochange striker is true
  if (
    matchType.isAutoChangeStriker &&
    updateBall.autoStrikeBallCount >= matchType.autoChangeStrikerAfterBall
  ) {
    // get the striker and non striker
    const striker = global.tblCommentaryPlayers.find(
      (item) =>
        item.commentaryId == commentaryId &&
        item.isPlay == true &&
        item.onStrike == true &&
        item.currentInnings == commentaryDetails.currentInnings &&
        item.teamId == battingTeam.teamId
    );
    const nonStriker = global.tblCommentaryPlayers.find(
      (item) =>
        item.commentaryId == commentaryId &&
        item.isPlay == true &&
        item.onStrike == false &&
        item.currentInnings == commentaryDetails.currentInnings &&
        item.teamId == battingTeam.teamId
    );
    // change the striker to non striker and non striker to striker
    let strikePlayer = {
      ...striker,
      onStrike: false,
    };
    let nonStrikePlayer = {
      ...nonStriker,
      onStrike: true,
    };
    let obj = {
      commentaryId,
      commentaryPlayers: [strikePlayer, nonStrikePlayer],
    };
    // update the player data
    await saveComVirtual(
      {
        ...request,
        body: {
          ...obj,
        },
      },
      fastify
    );
  }

  return {
    ...objToSave,
    isOverComplete,
    ballByBall: ballByBall1,
    // over : updateOver
  };
};
const checkInningsSwitch = async (data, request, fastify) => {
  const { commentaryDetails, commentaryId, matchType, checkFor } = data;
  let teams = global.tblCommentaryTeams.filter(
    (i) =>
      i.commentaryId == commentaryId &&
      i.currentInnings == commentaryDetails.currentInnings
  );
  const batTeam = teams.find((t) => t.teamStatus == 1);
  const bowlTeam = teams.find((t) => t.teamStatus == 2);
  const maxNoOfWicket =
    matchType?.noOfPlayer - (matchType?.isLastManStand ? 0 : 1);
  const isLastInnigs =
    commentaryDetails.currentInnings >= matchType.noOfIningsPerSide;
  // let target =
  // let currentOver = Math.floor(batTeam?.teamOver)
  let target = 0;
  if (bowlTeam.isBattingComplete) {
    const trail = +batTeam?.teamTrialRuns || 0;
    if (trail > -1) target = trail + 1;
  }
  const overdetails = global.tblOvers
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.overId - a.overId)[0];
  let conditionsToCheck = [];
  // let overLimit =
  //   matchType.isLimitedOvers &&
  //   Math.ceil(+overdetails.over || 0) + 1 >= batTeam?.teamMaxOver;
  // let wicketLimit = batTeam?.teamWicket > maxNoOfWicket - 2;
  // let isRunTargetAchieved =
  //   isLastInnigs && target !== 0 && batTeam?.teamScore >= target;

  let overLimit, wicketLimit, isRunTargetAchieved;
  switch (checkFor) {
    case "ALL":
      overLimit =
        matchType.isLimitedOvers &&
        Math.ceil(+overdetails.over || 0) + 1 >= batTeam?.teamMaxOver;
      wicketLimit = batTeam?.teamWicket >= maxNoOfWicket;
      isRunTargetAchieved =
        isLastInnigs && target !== 0 && batTeam?.teamScore >= target;

      conditionsToCheck.push(overLimit, wicketLimit, isRunTargetAchieved);
      break;
    case "OVER":
      overLimit =
        matchType.isLimitedOvers &&
        Math.ceil(+overdetails.over || 0) + 1 >= batTeam?.teamMaxOver;
      conditionsToCheck.push(overLimit);
      // conditionsToCheck.push(true)
      break;
    case "WICKET":
      wicketLimit = batTeam?.teamWicket >= maxNoOfWicket;
      conditionsToCheck.push(wicketLimit);
      break;
    case "RUN":
      isRunTargetAchieved =
        isLastInnigs && target !== 0 && batTeam?.teamScore >= target;
      conditionsToCheck.push(isRunTargetAchieved);
      // conditionsToCheck.push(true)

      break;
    default:
      break;
  }

  let res = null;
  let matchComplete = false;
  if (conditionsToCheck.some((condition) => condition)) {
    const runDifference =
      (batTeam.teamScore || 0) +
      (batTeam.teamLeadRuns || 0) -
      (batTeam.teamTrialRuns || 0);
    let result = {};
    if (bowlTeam.isBattingComplete && isLastInnigs) {
      result = await checkWinner({
        ...request.body,
        ...data,
        target,
        bowlTeam,
        batTeam,
      });
      matchComplete = true;
    } else if (
      !bowlTeam.isBattingComplete &&
      isLastInnigs &&
      runDifference < 0
    ) {
      result = await checkWinner({
        ...request.body,
        ...data,
        target,
        bowlTeam,
        batTeam,
        isWonByInnings: runDifference * -1,
      });
      matchComplete = true;
    } else {
      const partnership = global.tblCommentaryPartnership
        .filter(
          (item) =>
            item?.commentaryId === commentaryId &&
            item.currentInnings == commentaryDetails.currentInnings
        )
        .sort(
          (a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId
        )[0];
      // check last over
      const over = global.tblOvers
        .filter(
          (item) =>
            item?.commentaryId === commentaryId &&
            item.currentInnings == commentaryDetails.currentInnings
        )
        .sort((a, b) => b.overId - a.overId)[0];

      // inning change code
      result = await onInningChangeService(
        {
          ...request.body,
          ...data,
          target,
          bowlTeam,
          batTeam,
          isLastInnigs,
          runDifference,
          currentPartnership: partnership,
        },
        request,
        fastify
      );
      matchComplete = false;

      return {
        matchComplete: matchComplete,
        inningChange: true,
        comOver: over,
      };
    }
    res = await saveComVirtual(
      {
        ...request,
        body: result.objToSave,
      },
      fastify
    );
    return {
      matchComplete: matchComplete,
      response: res,
    };
  } else {
    return {
      matchComplete: matchComplete,
      response: res,
    };
  }
};
const changePlayer = async (data) => {
  const { plytyp, bowlingTeam, battingTeam, commentaryId, commentaryDetails } =
    data;
  let team;
  let teamPlayers;
  let playerToreturn;
  if (plytyp == playerType.CURRENT_BOWLER) {
    team = bowlingTeam;
    teamPlayers = global.tblCommentaryPlayers.filter(
      (i) =>
        i.commentaryId == commentaryId &&
        i.currentInnings == commentaryDetails.currentInnings &&
        i.teamId == bowlingTeam.teamId
    );
    playerToreturn = teamPlayers
      .filter((i) => i.bowlerOrder == null)
      .sort((a, b) => a.displayOrder - b.displayOrder)[0];

    let oldBowler = teamPlayers
      .filter((i) => i.bowlerOrder != null)
      .sort((a, b) => b.bowlerOrder - a.bowlerOrder)[0];
    playerToreturn = {
      ...playerToreturn,
      isPlay: true,
      bowlerOrder: oldBowler.bowlerOrder + 1,
    };
  } else {
    team = battingTeam;
    teamPlayers = global.tblCommentaryPlayers.filter(
      (i) =>
        // i.isPlay == null &&
        // i.isBatterOut != true &&
        i.currentInnings == commentaryDetails.currentInnings &&
        i.teamId == battingTeam.teamId &&
        i.commentaryId == commentaryId
    );
    playerToreturn = teamPlayers
      .filter((i) => i.batterOrder == null)
      .sort((a, b) => a.displayOrder - b.displayOrder)[0];
    let oldBatter = teamPlayers
      .filter((i) => i.batterOrder != null)
      .sort((a, b) => b.batterOrder - a.batterOrder)[0];
    playerToreturn = {
      ...playerToreturn,
      isPlay: true,
      batterOrder: oldBatter.batterOrder + 1,
    };
  }
  return {
    player: playerToreturn,
  };
};
const generateOverService = async (data, request, fastify) => {
  const { commentaryDetails, commentaryId, overdetails, matchType } = data;
  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings
  );
  let battingTeam = teams.find((item) => item.teamStatus == 1);
  let bowlingTeam = teams.find((item) => item.teamStatus == 2);
  let remainingBallsShow = teams.some((team) => team.isBattingComplete);
  let currentBowler = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.teamId == bowlingTeam.teamId
  );
  let updateTeam = {
    ...battingTeam,
    teamOver: Math.ceil(+battingTeam.teamOver || 0),
  };
  let updateBowler = {
    ...currentBowler,
    isPlay: null,
    bowlerOver: Math.ceil(currentBowler.bowlerOver || 0),
    bowlerMaidenOver: overdetails.totalRun < 1 ? 1 : 0,
  };
  const updatedOver = {
    ...overdetails,
    teamScore: `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`,
    isMaiden: getBowlerOnlyRuns(overdetails) < 1,
    isComplete: true,
  };
  const objToSave1 = {
    commentaryId,
    commentaryDetails: {
      ...commentaryDetails,
      displayStatus: inningSwitch.OVER,
      // rmk: remainingBallsShow
      //   ? generateRemainingRuns({
      //     team: battingTeam,
      //     ballsPerOver: matchType.ballsPerOver,
      //   })
      //   : "",
    },
    commentaryOvers: updatedOver,
    commentaryPlayers: [updateBowler],
    commentaryTeams: [updateTeam],
  };
  const res1 = await saveComVirtual(
    {
      ...request,
      body: objToSave1,
    },
    fastify
  );
  let completedOver = global.tblOvers.find(
    (item) => item.overId == overdetails.overId
  );
  // db update call here
  let { player } = await changePlayer({
    plytyp: playerType.CURRENT_BOWLER,
    bowlingTeam,
    commentaryId,
    commentaryDetails,
  });
  // console.log("battingTeam", battingTeam);

  const objToSave2 = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryOvers: generateOver({
      commentaryDetails,
      teams: {
        battingTeam: updateTeam,
        bowlingTeam,
      },
      bowler: player,
    }),
    commentaryPlayers: [player],
  };

  const res2 = await saveComVirtual(
    {
      ...request,
      body: objToSave2,
    },
    fastify
  );

  //db update call
  let onStrikePlayer = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.onStrike == true &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == battingTeam.teamId
  );
  let nonStrikePlayer = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.onStrike == false &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == battingTeam.teamId
  );
  let currentBowler1 = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.teamId == bowlingTeam.teamId
  );
  const partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId)[0];
  // let updateBattingTeam = teams.find((item) => item.teamBattingOrder == 1);

  // next request
  const generatedBall = generateBall({
    commentaryBallByBallId: 0,
    commentaryDetails,
    updateOver: res2.overdetails,
    updateBatter: onStrikePlayer,
    nonStrikeBatter: nonStrikePlayer,
    updateBowler: currentBowler1,
    updateBattingTeam: updateTeam,
    updatePartnership: partnership,
    updateBall: {
      cardKey: null,
      cardType: null,
    },
  });

  const objTosave3 = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryDetails: {
      ...commentaryDetails,
      displayStatus: generateDisplayStatus({ currentBall: generatedBall }),
      rmk: remainingBallsShow
        ? generateRemainingRuns({
          team: battingTeam,
          ballsPerOver: matchType.ballsPerOver,
        })
        : "",
    },
    commentaryBallByBall: generatedBall,
  };
  const res3 = await saveComVirtual(
    {
      ...request,
      body: objTosave3,
    },
    fastify
  );

  return {
    res1,
    res2,
    res3,
    completedOver,
  };
};
const onPlayerChangeService = (data) => {
  let newPlayerId = player.commentaryPlayerId;
  let playerToChange = data.plytyp;
};
const checkWinner = async (data) => {
  const { isWonByInnings, bowlTeam, batTeam, target, commentaryDetails } = data;
  let winMsg, winTeam, isBatTeamWon;
  let isMatchTie;
  if (isWonByInnings) {
    isBatTeamWon = false;
    winTeam = bowlTeam;
    winMsg = `${bowlTeam.shortName} won by innings and ${isWonByInnings} runs.`;
  } else {
    isMatchTie = batTeam?.teamScore === target - 1;
    isBatTeamWon = batTeam?.teamScore >= target;
    winTeam = isBatTeamWon ? batTeam : bowlTeam;
    winMsg = isMatchTie
      ? `Match tied  between ${batTeam.teamName} and ${bowlTeam.teamName}`
      : fetchWinnerMessage({
        ...data,
        isBatTeamWon,
      });

    
  }

  let updateBatTeam,updateBowlTeam = {};
  if(isMatchTie == true){
    updateBatTeam = {
      ...batTeam,
      isBattingComplete: true,
    };
    updateBowlTeam = {
      ...bowlTeam,
    };
  }else{
    updateBatTeam = {
    ...batTeam,
    isBattingComplete: true,
    isWin: isBatTeamWon,
  };
    updateBowlTeam = {
    ...bowlTeam,
    isWin: !isBatTeamWon,
  };
  }


 
  let upComDetails = {
    ...commentaryDetails,
    commentaryStatus: commentaryStatus.COMPLETED,
    winnerId: winTeam.teamId,
    winnerName: winTeam.teamName,
    displayStatus: "",
    result: winMsg,
    rmk: "",
  };
  const objToSave = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryDetails: upComDetails,
    commentaryTeams: [updateBatTeam, updateBowlTeam],
  };
  return {
    objToSave,
  };
};
const handleWicketService = async (data, request, fastify) => {
  const {
    commentaryDetails,
    battingTeam,
    bowlingTeam,
    onStrikePlayer,
    nonStrikePlayer,
    currentBowler,
    currentOver,
    matchType,
    prevBall,
    partnership,
  } = data;
  // checkInningSw
  const teams = [battingTeam, bowlingTeam];
  const freezePlayers = true;
  const ball = 1;
  const updatedBowlerOver =
    ball > 0
      ? ((+currentBowler.bowlerOver || 0) + 0.1).toFixed(1)
      : currentBowler.bowlerOver;
  let remainingBallsShow = teams.some((team) => team.isBattingComplete);

  // create wicket ball
  let wicketData = {
    wicketType: wicketTypeObj.BOLD,
    batterId: onStrikePlayer.commentaryPlayerId,
    runs: 0,
    fielder1: currentBowler.commentaryPlayerId,
    fielder2: currentBowler.commentaryPlayerId,
  };
  let to = parseFloat(battingTeam.teamOver || 0).toFixed(1);
  let upBatTeam = {
    ...battingTeam,
    teamWicket: (battingTeam.teamWicket || 0) + 1,
    teamOver:
      ball > 0 ? (parseFloat(to) + 0.1).toFixed(1) : battingTeam.teamOver,
  };

  let upBall = {
    ballIsWicket: true,
    ballWicketType: wicketTypeObj.BOLD,
    ballFielderId1: wicketData.fielder1,
    ballFielderId2: wicketData.fielder2,
    batStrikeId: onStrikePlayer.commentaryPlayerId,
    batNonStrikeId: nonStrikePlayer.commentaryPlayerId,
    ballPlayerId: onStrikePlayer.commentaryPlayerId,
    ballIsCount: ball > 0,
    ballType: BALL_TYPE.REGULAR,
    ballRun: wicketData.runs,
    ballIsDot: true,
    cardType: request.body.cardType,
    cardKey: request.body.cardKey,
  };
  if (matchType.isAutoChangeStriker && ball > 0) {
    upBall.autoStrikeBallCount = prevBall.autoStrikeBallCount + 1;
  }
  let upWicket = {
    bowlerId: currentBowler.commentaryPlayerId,
    bowlerName: currentBowler.playerName,
    wicketType: wicketData.wicketType,
    fieldPlayerId: wicketData.fielder1,
    batterId: onStrikePlayer.commentaryPlayerId,
    batterName: onStrikePlayer.playerName,
    wicketCount: upBatTeam.teamWicket,
    batterRuns: onStrikePlayer.batRun,
    batterBalls: onStrikePlayer.batBall,
  };
  // let wicketPlayerDetails = onStrikePlayer;
  let upBowler = {
    ...currentBowler,
    bowlerTotalWicket: (currentBowler.bowlerTotalWicket || 0) + 1,
    bowlerTotalBall: (currentBowler.bowlerTotalBall || 0) + ball,
    bowlerOver: updatedBowlerOver,
  };
  let upOver = {
    ...currentOver,
    totalWicket: (currentOver.totalWicket || 0) + 1,
    ballCount: (currentOver.ballCount || 0) + ball,
    dotBall: (currentOver.bowlerDotBall || 0) + ball,
    teamScore: `${upBatTeam.teamScore || 0}/${upBatTeam.teamWicket || 0}`,
  };
  let upBatter = {
    ...onStrikePlayer,
    isBatterOut: true,
    isBatterRetir: false,
    wicketType: wicketData.wicketType,
    bowlerId: currentBowler.commentaryPlayerId,
    fielderId1: wicketData.fielder1,
    fielderId2: wicketData.fielder2,
    isPlay: null,
    onStrike: null,
    batBall: (onStrikePlayer?.batBall || 0) + ball,
    batDotBall: (onStrikePlayer.batDotBall || 0) + ball,
  };
  let upPartnership = {
    ...partnership,
    totalBalls: (partnership.totalBalls || 0) + ball,
    batter1Balls:
      onStrikePlayer.commentaryPlayerId == partnership.batter1Id
        ? partnership.batter1Balls + ball
        : partnership.batter1Balls,
    batter2Balls:
      onStrikePlayer.commentaryPlayerId == partnership.batter2Id
        ? partnership.batter2Balls + ball
        : partnership.batter2Balls,
  };
  const generatedball = generateBall(
    {
      updateBall: upBall,
      commentaryBallByBallId: 0,
      updateBattingTeam: upBatTeam,
      updateOver: upOver,
      updateBatter: upBatter,
      updateBowler: upBowler,
      nonStrikeBatter: nonStrikePlayer,
      updatePartnership: upPartnership,
      commentaryId: commentaryDetails.commentaryId,
      commentaryDetails,
    },
    request
  );
  const geenrateWicket = generateWicket({
    commentaryDetails,
    currentWicket: upWicket,
    currentOver: upOver,
    battingTeam: upBatTeam,
    currentBall: generatedball,
  });

  const nCom = {
    ...commentaryDetails,
    displayStatus: generateDisplayStatus({
      currentBall: generatedball,
      upBatter,
    }),
    rmk: remainingBallsShow
      ? generateRemainingRuns({
        team: upBatTeam,
        ballsPerOver: matchType.ballsPerOver,
      })
      : "",
  };
  const prediction = checkInningChangePredictor({
    commentaryDetails: nCom,
    matchType,
    batTeam: upBatTeam,
    bowlTeam: bowlingTeam,
    over: upOver
  });

  const endInningForPredictor = prediction.inningChange;

  let objToSave = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryTeams: [upBatTeam],
    commentaryOvers: upOver,
    commentaryPlayers: [upBatter, upBowler],
    commentaryBallByBall: generatedball,
    commentaryPartnership: upPartnership,
    commentaryDetails: nCom,
    commentaryId: commentaryDetails.commentaryId,
    commentaryWicket: geenrateWicket,
    endInningForPredictor : endInningForPredictor || false
  };

  // // update in db
  const res = await saveComVirtual(
    {
      ...request,
      body: objToSave,
    },
    fastify
  );
  // const res = objToSave;

  let isOverComplete =
    upOver.ballCount >= (matchType?.ballsPerOver || 6) ? true : false;

  const mc = await checkInningsSwitch(
    {
      commentaryDetails: res.commentaryDetails,
      commentaryId: commentaryDetails.commentaryId,
      matchType,
      checkFor: inningSwitch.WICKET,
    },
    request,
    fastify
  );
  if (mc.matchComplete) {
    return {
      isMatchComplete: mc.matchComplete,
      inningChange: false,
      isOverComplete: false,
      isWicket: true,
      // result : res
    };
  }
  if (mc.inningChange) {
    loadVirtualCom(request, fastify)
    return {
      isMatchComplete: mc.matchComplete,
      isOverComplete: isOverComplete,
      isWicket: true,
      inningChange: mc.inningChange,
      comOver: mc.comOver ?? null,
    };
  }
  
  const mc1 = await checkInningsSwitch(
    {
      commentaryDetails: res.commentaryDetails,
      commentaryId: commentaryDetails.commentaryId,
      matchType,
      checkFor: inningSwitch.RUN,
      // checkFor: inningSwitch.OVER,
    },
    request,
    fastify
  );
  if (mc1.matchComplete) {
    return {
      inningChange: false,
      isMatchComplete: mc1.matchComplete,
      isOverComplete: isOverComplete,
      isWicket: true,
      // result : res
    };
  }
  if (mc1.inningChange) {
    loadVirtualCom(request, fastify)
    return {
      isMatchComplete: mc1.matchComplete,
      isOverComplete: isOverComplete,
      isWicket: true,
      inningChange: mc1.inningChange,
      comOver: mc1.comOver ?? null,
    };
  }


  let overComplete = null;
  let comOver = null;
  if (isOverComplete) {
    const mc2 = await checkInningsSwitch(
    {
      commentaryDetails: res.commentaryDetails,
      commentaryId: commentaryDetails.commentaryId,
      matchType,
      checkFor: inningSwitch.OVER,
      // checkFor: inningSwitch.OVER,
    },
    request,
    fastify
    );
    if (mc2.matchComplete) {
      return {
        isMatchComplete: mc2.matchComplete,
        isOverComplete: isOverComplete,
        isWicket: true,
        inningChange: false,
        // result : res
      };
    }
    if (mc2.inningChange) {
    loadVirtualCom(request, fastify)
      return {
        isMatchComplete: mc2.matchComplete,
        isOverComplete: isOverComplete,
        isWicket: true,
        inningChange: mc2.inningChange,
        comOver: mc2.comOver ?? null,
      };
    }
    // overComplete = await generateOverService(
    //   {
    //     commentaryDetails: nCom,
    //     overdetails: upOver,
    //     checkFor: inningSwitch.OVER,
    //     matchType,
    //     commentaryId: commentaryDetails.commentaryId,
    //   },
    //   request,
    //   fastify
    // );
    // comOver = overComplete.completedOver;
  }


  // player selection
  const { player } = await changePlayer({
    plytyp: playerType.ON_STRIKE,
    bowlingTeam,
    battingTeam,
    commentaryDetails: res.commentaryDetails,
    commentaryId: commentaryDetails.commentaryId,
  });

  let newStrikePlayer = {
    ...player,
    onStrike: true,
  };
  let currentBallDetails = {
    ...res.commentaryBallByBallDetails,
    nextBatStrikeId: newStrikePlayer.commentaryPlayerId,
    nextBatNonStrikeId: nonStrikePlayer.commentaryPlayerId,
  };
  let partnerShipDetail = {
    batter1Id: newStrikePlayer.commentaryPlayerId,
    batter1Name: newStrikePlayer.playerName,
    batter2Id: nonStrikePlayer.commentaryPlayerId,
    batter2Name: nonStrikePlayer.playerName,
    order: upBatTeam.teamWicket,
    isActive: true,
    commentaryBallByBallId: currentBallDetails.commentaryBallByBallId || 0,
  };
  let newPartnership = generatePartnership({
    commentaryDetails: res.commentaryDetails,
    currentPartnership: partnerShipDetail,
    updateBattingTeam: upBatTeam,
  });

  const objToSave2 = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryPartnership: newPartnership,
    commentaryPlayers: [newStrikePlayer],
    commentaryBallByBall: currentBallDetails,
  };
  // update in db
  const res2 = await saveComVirtual(
    {
      ...request,
      body: objToSave2,
    },
    fastify
  );
  let isOverComplete1 =
    upOver.ballCount >= (matchType?.ballsPerOver || 6) ? true : false;

  let overComplete1 = null;
  let comOver1 = null;
  if (isOverComplete1) {
    overComplete1 = await generateOverService(
      {
        commentaryDetails: nCom,
        overdetails: upOver,
        checkFor: inningSwitch.OVER,
        matchType,
        commentaryId: commentaryDetails.commentaryId,
      },
      request,
      fastify
    );
    comOver1 = overComplete1.completedOver;
  }

  return {
    // result: res2,
    isWicket: true,
    isOverComplete : isOverComplete1,
    isMatchComplete: false,
    inningChange: false,
    comOver: comOver1,
  };
};
const comResponseService = async (request, fastify, completeOver = false) => {
  let { commentaryId } = request.body;
  let commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not found");
  }
  commentaryDetails = {
    commentaryId: commentaryDetails.commentaryId,
    eventDate: commentaryDetails.eventDate,
    eventName: commentaryDetails.eventName,
    eventRefId: commentaryDetails.eventRefId,
    commentaryStatus: commentaryDetails.commentaryStatus,
    currentInnings: commentaryDetails.currentInnings,
    isActive: commentaryDetails.isActive,
    delay: commentaryDetails.delay,
  };
  // get teams
  const teams = global.tblCommentaryTeams
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .map((item) => {
      return {
        commentaryTeamId: item.commentaryTeamId,
        teamId: item.teamId,
        teamName: item.teamName,
        teamShortName: item.teamShortName,
        teamScore: item.teamScore,
        teamWicket: item.teamWicket,
        teamOver: item.teamOver,
        teamWicket: item.teamWicket,
        teamStatus: item.teamStatus,
        currentInnings: item.currentInnings,
        isBattingComplete: item.isBattingComplete,
        teamMaxOver: item.teamMaxOver,
        subInning: item.subInning,
      };
    });
  let over;
  if (completeOver) {
    // also ballCount
    let overCount = global.tblCommentaryBallByBall.filter((a) =>
      a?.commentaryId === commentaryId &&
      a.currentInnings == commentaryDetails.currentInnings
    ).sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[1]?.overCount;
    over = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings
      )
      .sort((a, b) => b.overId - a.overId)[1];
    over = {
      overId: over.overId,
      over: over.over,
      teamId: over.teamId,
      ballCount: over.ballCount,
      teamScore: over.teamScore,
      isComplete: over.isComplete,
      overCount
    };
  }
  // get latest over
  else {
    let overCount = global.tblCommentaryBallByBall.filter((a) =>
      a?.commentaryId === commentaryId &&
      a.currentInnings == commentaryDetails.currentInnings
    ).sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0]?.overCount;
    over = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings
      )
      .sort((a, b) => b.overId - a.overId)[0];
    over = {
      overId: over.overId,
      over: over.over,
      teamId: over.teamId,
      ballCount: over.ballCount,
      teamScore: over.teamScore,
      isComplete: over.isComplete,
      overCount
    };
  }
  const cData = await getMatchDataByCId({
    commentaryId: commentaryId,
  },
    request,
    fastify
  );

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: cData
    },
    request,
    fastify,
    "services/virtual.js/comResponseService"
  );
  return {
    teams,
    commentaryDetails,
    over,
  };
};
const onInningChangeService = async (data, request, fastify) => {
  const {
    runDifference,
    batTeam,
    bowlTeam,
    currentPartnership,
    commentaryDetails,
    commentaryId,
  } = data;
  const leadRuns = Math.max(runDifference * -1, 0);
  const trialRuns = Math.max(runDifference, 0);
  let teamUpdates = [
    { ...batTeam, isBattingComplete: true, teamStatus: 2, subInning: 2 },
    {
      ...bowlTeam,
      isBattingComplete: false,
      teamStatus: 1,
      teamLeadRuns: leadRuns,
      teamTrialRuns: trialRuns,
      subInning: 1,
    },
  ];
  let commentaryUpdates = {
    // commentaryStatus : commentaryStatus.INNINGCHANGE,
    displayStatus: "Innings",
    rmk : generateRemainingRuns({
      team: { ...bowlTeam, teamTrialRuns: trialRuns},
      ballsPerOver: data.matchType.ballsPerOver || 6,
    })
  };
  const partnershipDetails = {
    ...currentPartnership,
    isActive: false,
  };
  const updatedPartnership = generatePartnership({
    commentaryDetails: commentaryDetails,
    currentPartnership: partnershipDetails,
    updateBattingTeam: batTeam,
  });
  let playerToUpdate = global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId == commentaryDetails.commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings &&
      (item.onStrike == true || item.isPlay == true)
  );
  playerToUpdate = playerToUpdate.map((item) => {
    return {
      ...item,
      isPlay: null,
      onStrike: null,
    };
  });

  let objToSave = {
    commentaryId: commentaryDetails.commentaryId,
    commentaryTeams: teamUpdates,
    commentaryDetails: {
      ...commentaryDetails,
      ...commentaryUpdates,
    },
    commentaryPartnership: updatedPartnership,
    isEndInnings: true,
    commentaryPlayers: playerToUpdate,
  };
  const res1 = await saveComVirtual(
    {
      ...request,
      body: objToSave,
    },
    fastify
  );
  //player selection
  const battingTeamId = global.tblCommentaryTeams.find(
    (t) =>
      commentaryDetails.currentInnings == t.currentInnings &&
      t.commentaryId == commentaryDetails.commentaryId &&
      t.teamStatus == 1
  );
  const bowlingTeamId = global.tblCommentaryTeams.find(
    (t) =>
      commentaryDetails.currentInnings == t.currentInnings &&
      t.commentaryId == commentaryDetails.commentaryId &&
      t.teamStatus == 2
  );

  const batters = global.tblCommentaryPlayers
    .filter(
      (p) =>
        p.commentaryId === commentaryDetails.commentaryId &&
        p.teamId === battingTeamId.teamId
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 2);
  let onStrikePlayerId = null;
  let nonStrikerPlayerId = null;
  let onStrikePlayer = {};
  let nonStrikerPlayer = {};

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
      teamId: battingTeamId.teamId,
    };
    const players = await virtualPlayersSelectQuery(
      updateData,
      request,
      fastify
    );

    const batterIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === batter.commentaryPlayerId
    );

    if (batterIndex !== -1) {
      global.tblCommentaryPlayers[batterIndex] = {
        ...global.tblCommentaryPlayers[batterIndex],
        ...players[0],
      };
    }
    if (i === 0) {
      onStrikePlayerId = batter.commentaryPlayerId;
      onStrikePlayer = global.tblCommentaryPlayers[batterIndex];
    }
    if (i === 1) {
      nonStrikerPlayerId = batter.commentaryPlayerId;
      nonStrikerPlayer = global.tblCommentaryPlayers[batterIndex];
    }
  }
  const bowlers = global.tblCommentaryPlayers
    .filter(
      (p) =>
        p.commentaryId === commentaryDetails.commentaryId &&
        p.teamId === bowlingTeamId.teamId
    )
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
      teamId: bowlingTeamId.teamId,
    };
    const player = await virtualPlayersSelectQuery(
      updateData,
      request,
      fastify
    );

    const bowlerIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === bowler.commentaryPlayerId
    );

    if (bowlerIndex !== -1) {
      global.tblCommentaryPlayers[bowlerIndex] = {
        ...global.tblCommentaryPlayers[bowlerIndex],
        ...player[0],
      };
    }
  }
  // create over
  const commentaryOvers = {
    overId: 0,
    commentaryId: commentaryDetails?.commentaryId,
    // teamId: bowlingTeamId.teamId,
    teamId: battingTeamId.teamId,
    over: 0,
    ballCount: 0,
    bowlerId: bowler?.commentaryPlayerId,
    totalRun: 0,
    totalFour: 0,
    totalSix: 0,
    totalWideBall: 0,
    totalWideRun: 0,
    totalNoball: 0,
    totalNoBallRun: 0,
    totalByesRun: 0,
    totalLegByesRun: 0,
    totalPanelty: 0,
    totalWicket: 0,
    dotBall: 0,
    isComplete: false,
    powerplay: false,
    isOverInPowerplay: false,
    powerplayType: 1,
    isMaiden: false,
    isDelete: false,
    currentInnings: commentaryDetails.currentInnings,
    teamScore: 0,
    powerPlayName: null,
    isPowerPlay: false,
  };
  const over = await virtualOverQuery(commentaryOvers, request, fastify);
  // add over to global variable
  global.tblOvers.push(over);
  // create first ball
  const commentaryBallByBall = {
    commentaryBallByBallId: 0,
    commentaryId: commentaryDetails?.commentaryId,
    teamId: battingTeamId.teamId,
    overId: over?.overId,
    overCount: 0,
    currentOverBalls: 0,
    bowlerId: bowler?.commentaryPlayerId,
    batStrikeId: onStrikePlayerId,
    batNonStrikeId: nonStrikerPlayerId,
    ballIsCount: true,
    ballType: 0,
    ballIsDot: false,
    ballRun: 0,
    ballExtraRun: 0,
    ballIsBoundry: false,
    ballFour: 0,
    ballSix: 0,
    ballIsWicket: false,
    ballWicketType: 0,
    ballPlayerId: 0,
    ballBowlerId: 0,
    ballFielderId1: 0,
    ballFielderId2: 0,
    overIsMaiden: false,
    nextBatStrikeId: onStrikePlayerId,
    nextBatNonStrikeId: nonStrikerPlayerId,
    currentInnings: commentaryDetails.currentInnings,
    cardType: request.body.cardType,
    cardKey: request.body.cardKey,
  };
  const ball = await virtualBallByBallQuery(
    commentaryBallByBall,
    request,
    fastify
  );
  // add ball to global variable
  global.tblCommentaryBallByBall.push(ball);
  const compartnership = {
    commentaryPartnershipId: 0,
    commentaryId: commentaryDetails?.commentaryId,
    teamId: battingTeamId.teamId,
    batter1Id: onStrikePlayerId,
    batter1Name: onStrikePlayer.playerName,
    batter2Id: nonStrikerPlayerId,
    batter2Name: nonStrikerPlayer.playerName,
    isActive: true,
    order: batTeam.teamWicket ? batTeam.teamWicket : 1,
    commentaryBallByBallId: ball?.commentaryBallByBallId,
    currentInnings: commentaryDetails.currentInnings,
  };
  // partnership
  const partner = await virtualPartnershipQuery(
    compartnership,
    request,
    fastify
  );
  global.tblCommentaryPartnership.push(partner);

  return {
    result: null,
    inningChange: true,
  };
};
const suffleCardAPIService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not found");
  }
  let endPoint = '/api/v1/shufflecards';
  let pythonURI = commentaryDetails.pythonURI || null;

  const strikeTeam = global.tblCommentaryTeams.find(
    (item) => item?.commentaryId == commentaryId && item.teamStatus == 1
  );
  // call predct api
  await callPredictorMarket(
    {
      commentary_id: commentaryId,
      strike_team_id: strikeTeam?.teamId,
    },
    endPoint,
    fastify,
    request,
    pythonURI
  );
  return true;
};
const cancelEventAPIService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (index === -1) {
    throw new Error("Commentary with this id not found");
  }
  // update market status
  const eventMarket = await closeEventMarketByCIdQuery(
    { commentaryId },
    fastify
  );
  if (eventMarket.length > 0) {
    for (const updatedItem of eventMarket) {
      let index = global.tblEventMarketsV2.findIndex(
        (item) => item.eventMarketId === updatedItem.marketId
      );
      if (index !== -1) {
        global.tblEventMarketsV2[index] = {
          ...global.tblEventMarketsV2[index],
          ...updatedItem,
        };
      }
    }
  }
  global.tblMarketRunnerV2
    .filter((elem) =>
      eventMarket.some((e) => e.marketId === elem.eventMarketId)
    )
    .forEach((elem) => {
      elem.selectionStatus = EventMarketStatus.Close;
    });
  // cancel the close market
  let eventMarketId = eventMarket.map((item) => item.marketId);
  eventMarketId = await cancelMarketVirtualQuery({ eventMarketId, commentaryId }, request, fastify);

  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );

  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );

  if (eventMarketId.length > 0) {
    for (let item of eventMarketId) {
      // add log
      marketLogger(
        {
          eventMarketId: item,
          actionType: MarketActionType.virtualMarketCancel,
          value: `EventMarketStatus:${EventMarketStatus.Cancel}`,
          commentaryId: commentaryId
        },
        request,
        fastify
      )
    }
  }

  await cancelComQuery({ commentaryId, status: commentaryStatus.CANCELLED }, fastify, request);
  global.tblCommentaries[index].commentaryStatus = commentaryStatus.CANCELLED;

  if(global.tblCommentaries[index].isPredictMarket == true){
    callDataProvider(
    {
      commentaryId: commentaryId,
      serviceType: ServiceType.dataProviderAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      type: "close",
      },
      fastify
    ).catch((err) => {
      console.log("call data provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/closeEventMarketByCIdQuery",
        request
      );
    });
  }

  const cData = await getMatchDataByCId(
    {
      commentaryId: commentaryId,
    },
    request,
    fastify
  );

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: cData,
    },
    request,
    fastify,
    "services/virtual.js/cancelEventAPIService"
  );


  // if (
  //    global.tblCommentaries[index]?.isPredictMarket == true
  //  ) {
  //    callDataProvider(
  //      {
  //        commentaryId: commentaryId,
  //        serviceType: ServiceType.dataProviderAPI,
  //        moduleType: APIEndpointModuleType.commentaryUpdate,
  //        type: "close"
  //      },
  //      fastify
  //    ).catch((err) => {
  //      console.log("call Data Provider console", err);
  //      errorLogger(
  //        fastify,
  //        err.message,
  //        "ERROR --> services/virtual.js/cancelEventAPISerivce",
  //        request
  //      );
  //    });
  //  }
  return "Event cancelled successfully";
};
const loadVirtualCom = async (request, fastify) => {
  let attempt = 0;
  const maxAttempts = 2;
  let count = 0;

  while (attempt <= maxAttempts) {
    try {
      attempt++;
      count = attempt;

      let commentary = await global.tblCommentaries.find(
        (item) => item?.commentaryId === request.body.commentaryId
      );
      if (!commentary) {
        throw new Error("Commentary with this id not Found");
      }

      let pythonURI = commentary.pythonURI ?? null;

      if (
        commentary?.isPredictMarket === true &&
        [2, 3, 5].includes(commentary.commentaryStatus)
      ) {
        let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
        let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
        let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);

        await callVirtualPredictorMarket(
          {
            commentary_id: commentary.commentaryId,
            match_type_id: commentary.matchTypeId,
            event_id: commentary.eventRefId,
            default_ball_faced: parseInt(key1?.value) || 0,
            default_player_boundaries: parseInt(key2?.value) || 0,
            default_player_runs: parseInt(key3?.value) || 0,
          },
          "/api/v1/loadcommentary",
          fastify,
          request,
          pythonURI
        );
      }
      return true;
    } catch (error) {
      errorLogger(
        fastify,
        `Attempt ${attempt} failed: ${error.message}`,
        "Service Error -> services/virtual/loadVirtualCom",
        request
      );
      if (attempt >= maxAttempts) {
        errorLogger(
          fastify,
          `Attempt ${attempt} failed: ${error.message}`,
          "Service Error -> services/virtual/loadVirtualCom",
          request
        );
        return true;
      }
    }
  }

  return true;
};
const serverTimeAPIService = async (request, fastify) => {
  return { Remote_IP: "0.0.0.1" }
}

const checkInningChangePredictor = ({
  commentaryDetails,
  matchType,
  batTeam,
  bowlTeam,
  over,
  isOverComplete
}) => {
  const maxNoOfWicket =
    matchType.noOfPlayer - (matchType.isLastManStand ? 0 : 1);

  const isLastInnings =
    commentaryDetails.currentInnings >= matchType.noOfIningsPerSide;

  let target = 0;

  // Chase innings
  if (bowlTeam?.isBattingComplete) {
    const trialRuns = +batTeam?.teamTrialRuns || 0;
    target = trialRuns > -1 ? trialRuns + 1 : 0;
  }

  const overLimit =
    isOverComplete &&
    matchType.isLimitedOvers &&
    Math.ceil(+over.over || 0) + 1 >= batTeam.teamMaxOver;
  const wicketLimit =
    batTeam?.teamWicket >= maxNoOfWicket;

  const targetAchieved =
    isLastInnings &&
    target > 0 &&
    batTeam?.teamScore >= target;

  return {
    inningChange:
      overLimit ||
      wicketLimit ||
      targetAchieved,
  };
};

const generateMarketFromTemplate = (template, teams, commentary) => {
  // Default market name without any changes
  let marketName = template.templateName;

  // Apply specific logic only when isPerEvent is true
  if (template.isPerEvent && teams.length >= 2) {
    // const team1Name = teams[0]?.shortName || 'Team1';
    // const team2Name = teams[1]?.shortName || 'Team2';
    marketName = `${template.templateName}`;
  }

  return {
    eventMarketId: 0, // Default to 0 for new markets
    isCreate: true,  // Default to true for new markets
    status: "1",
    margin: template.margin,
    data: "",
    playerId: null,
    ...template,
    commentaryId: commentary.commentaryId,
    eventRefId: commentary.eventRefId,
    marketName, // Use the newly formatted market name only when isPerEvent is true
    defaultBackSize: template?.defaultBackSize,
    defaultLaySize: template?.defaultLaySize,
    lineType: template?.lineType,
    teamId: null,
    inningsId: 1,
    isActive: template?.isDefaultMarketActive || false,
    isAllow: template.isDefaultBetAllowed || false,
    index: 0,
    beforeSuspendMin: template.beforeSuspendMin,
    beforeCloseMin: template.beforeCloseMin,
    rateDiff: template?.rateDiff,
    runners: template.runners?.map(runner => ({
      ...runner,
      runnerId: runner.runnerId || "0",
      backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
      laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
    })) || []
  };
};

const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj, commentaryDetails) => {
  const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

  if (!processedMarketsObj[baseKey]) {
    processedMarketsObj[baseKey] = [];
  }

  // Special handling for marketTypeId=5 and marketTypeCategoryId=6
  let marketRunners = [];
  if (market.marketTypeId === 5 && market.marketTypeCategoryId === 6) {
    // Get team names from commentary object instead of marketData
    const commentaryTeams = global.tblCommentaryTeams.filter(item => item.commentaryId === commentaryDetails.commentaryId && [commentaryDetails.team1Id, commentaryDetails.team2Id].includes(item.teamId));
    const team1Name = commentaryDetails?.team1Name || 'Team1';
    const team2Name = commentaryDetails?.team2Name || 'Team2';

    // For each template runner, create two runners (one for each team)
    if (market.runners && market.runners.length > 0) {
      market.runners.forEach((templateRunner, index) => {
        // Create runner for team 1
        const team1Runner = {
          ...templateRunner,
          marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
          runnerId: templateRunner.runnerId || "0",
          marketTemplateId: market.marketTemplateId,
          runner: templateRunner.runner.replace("{team}", team1Name),
          line: templateRunner.line,
          overRate: templateRunner.overRate,
          underRate: templateRunner.underRate,
          lastUpdate: new Date().toISOString(),
          selectionId: commentaryTeams.find(item => item.teamId === commentaryDetails.team1Id)?.commentaryTeamId,
          order: templateRunner.order * 2 - 1,
          backPrice: templateRunner.backPrice,
          layPrice: templateRunner.layPrice,
          backSize: templateRunner.backSize || market.defaultBackSize,
          laySize: templateRunner.laySize || market.defaultLaySize,
        };

        // Create runner for team 2
        const team2Runner = {
          ...templateRunner,
          marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
          runnerId: templateRunner.runnerId || "0",
          marketTemplateId: market.marketTemplateId,
          runner: templateRunner.runner.replace("{team}", team2Name),
          line: templateRunner.line,
          overRate: templateRunner.overRate,
          underRate: templateRunner.underRate,
          lastUpdate: new Date().toISOString(),
          selectionId: commentaryTeams.find(item => item.teamId === commentaryDetails.team2Id)?.commentaryTeamId,
          order: templateRunner.order * 2,
          backPrice: templateRunner.backPrice,
          layPrice: templateRunner.layPrice,
          backSize: templateRunner.backSize || market.defaultBackSize,
          laySize: templateRunner.laySize || market.defaultLaySize,
        };

        marketRunners.push(team1Runner, team2Runner);
      });
    }
  }
  else if (market.marketTypeCategoryId === 28) {
    marketRunners = market.runners?.map(runner => ({
      marketTemplateRunnerId: runner.marketTemplateRunnerId,
      marketTemplateId: runner.marketTemplateId,
      runner: runner.runner,
      line: runner.line,
      overRate: runner.overRate,
      underRate: runner.underRate,
      lastUpdate: new Date().toISOString(),
      selectionId: runner.selectionId,
      order: runner.order,
      backPrice: runner.backPrice,
      layPrice: runner.layPrice,
      backSize: runner.backSize,
      laySize: runner.laySize,
      predefinedValue: runner.predefinedValue,
      runnerId: runner.runnerId || "0"
    })) || [];
  }
  else if (market.marketTypeCategoryId === 26) {
    // Handle LDO and Lottery markets
    marketRunners = market.runners?.map(runner => ({
      ...runner,  // Spread the original runner properties
      runnerId: runner.runnerId || "0",
      // Make sure each property is explicitly copied
      marketTemplateRunnerId: runner.marketTemplateRunnerId,
      marketTemplateId: market.marketTemplateId,
      runner: runner.runner,
      line: runner.line,
      overRate: runner.overRate,
      underRate: runner.underRate,
      lastUpdate: new Date().toISOString(),
      selectionId: runner.selectionId,
      order: runner.order,
      backPrice: runner.backPrice,
      layPrice: runner.layPrice,
      backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
      laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
      predefinedValue: runner.predefinedValue
    })) || [];
  } else {
    // Default runner handling for other market types
    if (!market.runners || market.runners.length === 0) {
      marketRunners = [{
        marketTemplateRunnerId: 0,
        runnerId: "0",
        marketTemplateId: market.marketTemplateId,
        runner: market?.marketName,
        line: market.defaultLine || null,
        overRate: null,
        underRate: null,
        lastUpdate: new Date().toISOString(),
        selectionId: `${market.marketTemplateId}01`,
        order: 1,
        backPrice: null,
        layPrice: null,
        backSize: market?.defaultBackSize,
        laySize: market?.defaultLaySize,
      }];
    } else {
      marketRunners = market.runners;
    }
  }

  processedMarketsObj[baseKey].push({
    ...market,
    teamId,
    eventMarketId: market.eventMarketId || 0,
    isCreate: market.isCreate !== undefined ? market.isCreate : true,
    status: market.status || "1",
    margin: parseFloat(market.margin) || 3,
    data: market.data || "",
    playerId: market.playerId || null,
    isActive: market.isActive !== undefined ? market.isActive : true,
    isAllow: market.isAllow !== undefined ? market.isAllow : false,
    inningsId: market.inningsId || 1,
    index: market.index || 0,
    commentaryId: market.commentaryId,
    eventRefId: market.eventRefId,
    isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
    runners: marketRunners
  });
};

const processTopBowlerRunsMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  const specialMarketName = `Man Of the Match ${market?.matchType} ADV`;
  const specialMarket = {
    ...market,
    marketName: specialMarketName,
    over: 0,
    runners: teams?.flatMap(team =>
      team?.players?.flatMap(player =>
        (market?.runners || []).map(runner => ({
          marketTemplateRunnerId: runner?.marketTemplateRunnerId,
          marketTemplateId: market?.marketTemplateId,
          runner: `${player?.playerName} ${team?.teamName}`,
          line: runner?.line,
          overRate: runner?.overRate,
          underRate: runner?.underRate,
          lastUpdate: new Date().toISOString(),
          selectionId: runner?.selectionId,
          order: runner?.order,
          backPrice: runner?.backPrice,
          layPrice: runner?.layPrice,
          backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
          laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
          predefinedValue: runner?.predefinedValue,
          runnerId: runner?.runnerId || "0",
          playerId: player?.commentaryPlayerId,
          defaultLine: parseFloat(player?.batsmanAverage),
          teamId: team?.teamId,
        }))
      )
    )
  }
  processMarketAndRunners(specialMarket, null, 'oneTimeMarket', processedMarketsObj, commentaryDetails);
};

const processOnlyOverMarkets = (market, teams, matchType, processedMarketsObj, commentaryDetails) => {
  // const startOver = parseInt(market.over);
  const startOver = 2;
  const maxOvers = matchType.maxOversInFirstInings
  const ballsPerOver = matchType.ballsPerOver
  teams.forEach(team => {
    for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
      let marketName = ""
      if (market.isNameInBall) {
        const endBall = currentOver * ballsPerOver
        const startBall = endBall - ballsPerOver + 1
        marketName = `${market?.templateName.replace("{x}", endBall).replace("{y}", startBall)} - ${team.shortName}`;
      } else {
        marketName = `${market?.templateName.replace("{x}", currentOver)} - ${team.shortName}`;
      }
      const specialMarket = {
        ...market,
        over: currentOver.toString(),
        marketName: marketName,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processOverSessionMarkets = (market, teams, matchType, processedMarketsObj, commentaryDetails) => {
  // const startOver = parseInt(market.over);
  const startOver = 2;
  const maxOvers = matchType.maxOversInFirstInings
  const ballsPerOver = matchType.ballsPerOver
  const overNotInclude = (market.notIncludedOver || "").split(",")
  teams.forEach(team => {
    for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
      if (overNotInclude.includes("" + currentOver)) continue
      // const specialMarketName = `ONLY ${currentOver} OVER - ${team.shortName}`;
      let marketName = ""
      if (market.isNameInBall) {
        const endBall = currentOver * ballsPerOver
        marketName = `${market?.templateName.replace("{x}", endBall)} - ${team.shortName}`;
      } else {
        marketName = `${market?.templateName.replace("{x}", currentOver)} - ${team.shortName}`;
      }
      const specialMarket = {
        ...market,
        over: currentOver.toString(),
        marketName: marketName,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processWicketMarkets = (market, teams, noOfPlayers, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    for (let wicket = 1; wicket < noOfPlayers; wicket++) {
      // const specialMarketName = `${wicket} Wicket - ${team.shortName}`;
      const specialMarketName = `${market?.marketName.replace("{fow}", wicket)} - ${team.shortName}`;
      const specialMarket = {
        ...market,
        marketName: specialMarketName,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processPlayerRunsMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    sortbasedOnthePlayerTypeAndPlayerName(team.players);
    // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
    team.players.forEach(player => {
      const specialMarketName = `${player?.playerName} Runs`;
      const specialMarket = {
        ...market,
        playerId: player.commentaryPlayerId,
        playerName: player.playerName,
        playerType: player.playerType,
        marketName: specialMarketName,
        teamId: team.teamId,
        over: 0,
        defaultLine: parseFloat(player.batsmanAverage)
      }
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    });
  });
};

const processPlayerBoundaryMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
    sortbasedOnthePlayerTypeAndPlayerName(team.players);
    team.players.forEach(player => {
      const specialMarketName = `${player?.playerName} Boundaries`;
      const specialMarket = {
        ...market,
        playerId: player.commentaryPlayerId,
        marketName: specialMarketName,
        teamId: team.teamId,
        over: 0,
        defaultLine: parseFloat(player.boundary) || 0
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    });
  });
};

const processFancyLDOMarkets = (market, teams, matchType, processedMarketsObj, commentaryDetails) => {
  const startOver = parseInt(market.over) || 2;
  const diff = startOver;
  const autoclose = parseFloat(market.beforeAutoClose) || 6;
  const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;
  const autocreate = parseFloat(market.create) || 6;
  const autoopen = parseFloat(market.autoOpen) || 6;
  const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
  const notincludedover = market.notIncludedOver ?
    market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
  const matchTypeId = market.matchTypeID || 2;

  teams.forEach(team => {
    let nextopen = 0.0;
    let nextcreate = 0.0;
    let noOfMarketsCreated = 0;
    let nextaddmarket = 0;
    const maxOvers = matchType.maxOversInFirstInings

    for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
      if (!notincludedover.includes(currentOver)) {
        const updatedBeforeAutoClose = ballsToOvers((currentOver * 6 - autoclose), matchTypeId, matchType);
        const updatedBeforeAutoSuspend = ballsToOvers((currentOver * 6 - autosuspend), matchTypeId, matchType);

        let updatedCreate, updatedAutoOpen;

        if (howManyOpenMarkets === 1) {
          updatedCreate = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId, matchType);
          updatedAutoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId, matchType);
        } else {
          updatedCreate = nextcreate;
          updatedAutoOpen = nextopen;
          noOfMarketsCreated++;

          if (noOfMarketsCreated === howManyOpenMarkets) {
            noOfMarketsCreated--;
            nextcreate = Math.floor(nextaddmarket) + (autocreate / 10);
            nextopen = Math.floor(nextaddmarket) + (autoopen / 10);
            nextaddmarket++;
          }
        }

        let marketName = ""
        const ballsPerOver = matchType.ballsPerOver
        if (market.isNameInBall) {
          const endBall = currentOver * ballsPerOver
          marketName = `${market?.templateName.replace("{x}", endBall)} - ${team.shortName}`;
        } else {
          marketName = `${market?.templateName.replace("{x}", currentOver)} - ${team.shortName}`;
        }
        const specialMarket = {
          ...market,
          over: currentOver.toString(),
          marketName: marketName,
          teamId: team.teamId,
          beforeAutoClose: updatedBeforeAutoClose.toString(),
          beforeAutoSuspend: updatedBeforeAutoSuspend.toString(),
          create: updatedCreate.toString(),
          autoOpen: updatedAutoOpen.toString()
        };

        processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
      }
    }
  });
};

const processPlayerBallMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    // team.players.sort((a, b) => a?.playerName.localeCompare(b?.playerName));
    sortbasedOnthePlayerTypeAndPlayerName(team.players);
    team.players.forEach(player => {
      const specialMarketName = market.marketName.replace("{player}", player?.playerName);
      const specialMarket = {
        ...market,
        playerId: player.commentaryPlayerId,
        marketName: specialMarketName,
        teamId: team.teamId,
        over: 0,
        defaultLine: parseFloat(player.playerBallFaced)
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    });
  });
};

const processMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    const specialMarketName = `${market.marketName} - ${team.shortName}`;
    const specialMarket = {
      ...market,
      marketName: specialMarketName,
      teamId: team.teamId
    };
    processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
  });
};

const processLotteryMarkets = (market, teams, processedMarketsObj, matchType, commentaryDetails) => {

  const maxOvers = market.maxOvers || matchType?.maxOversInFirstInings || 5;
  const startOver = parseInt(market.over) || 2;
  const diff = startOver;
  const autoclose = parseFloat(market.beforeAutoClose) || 6;
  const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;
  const autocreate = parseFloat(market.create) || 6;
  const autoopen = parseFloat(market.autoOpen) || 6;
  const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
  const notincludedover = market.notIncludedOver ?
    market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
  const matchTypeId = market.matchTypeID || 2;

  teams.forEach(team => {
    let nextopen = 0.0;
    let nextcreate = 0.0;
    let noOfMarketsCreated = 0;
    let nextaddmarket = 0;

    for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
      if (notincludedover.includes(currentOver)) continue;
      // Calculate updated values based on current over
      const updatedValues = {
        beforeAutoClose: ballsToOvers((currentOver * 6 - autoclose), matchTypeId, matchType),
        beforeAutoSuspend: ballsToOvers((currentOver * 6 - autosuspend), matchTypeId, matchType)
      };

      // Determine create and autoOpen values based on howManyOpenMarkets
      if (howManyOpenMarkets === 1) {
        updatedValues.create = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId, matchType);
        updatedValues.autoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId, matchType);
      } else {
        updatedValues.create = nextcreate;
        updatedValues.autoOpen = nextopen;
        noOfMarketsCreated++;

        if (noOfMarketsCreated === howManyOpenMarkets) {
          noOfMarketsCreated--;
          nextcreate = Math.floor(nextaddmarket) + (autocreate / 10);
          nextopen = Math.floor(nextaddmarket) + (autoopen / 10);
          nextaddmarket++;
        }
      }

      // Create market for current over
      let marketName = ""
      const ballsPerOver = matchType.ballsPerOver
      if (market.isNameInBall) {
        const endBall = currentOver * ballsPerOver
        marketName = `${market?.templateName.replace("{x}", endBall)} - ${team.shortName}`;
      } else {
        marketName = `${market?.templateName.replace("{x}", currentOver)} - ${team.shortName}`;
      }
      const specialMarket = {
        ...market,
        over: currentOver.toString(),
        marketName,
        teamId: team.teamId,
        beforeAutoClose: updatedValues.beforeAutoClose.toString(),
        beforeAutoSuspend: updatedValues.beforeAutoSuspend.toString(),
        create: updatedValues.create.toString(),
        autoOpen: updatedValues.autoOpen.toString(),
        runners: market.runners?.map(runner => ({
          marketTemplateRunnerId: runner.marketTemplateRunnerId,
          marketTemplateId: market.marketTemplateId,
          runner: runner.runner,
          line: runner.line,
          overRate: runner.overRate,
          underRate: runner.underRate,
          lastUpdate: new Date().toISOString(),
          selectionId: runner.selectionId,
          order: runner.order,
          backPrice: runner.backPrice,
          layPrice: runner.layPrice,
          backSize: market.isPredefineRunnerValue ? runner.backSize : market.defaultBackSize,
          laySize: market.isPredefineRunnerValue ? runner.laySize : market.defaultLaySize,
          predefinedValue: runner.predefinedValue,
          runnerId: runner.runnerId || "0"
        })) || []
      };

      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processFallOfWicketMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  const maxWickets = market.afterWicketAutoSuspend - 1;  // Subtract 1 to not include the suspend wicket

  teams.forEach(team => {
    for (let wicket = 1; wicket <= maxWickets; wicket++) {
      const wicketOrdinal = getOrdinalSuffix(wicket);
      const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
      const specialMarket = {
        ...market,
        marketName: `${marketName} - ${team.shortName}`,
        wicketNo: wicket,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processPartnershipBoundariesMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  const maxWickets = market?.afterWicketAutoSuspend - 2;  // Subtract 2 to not include the suspend wicket

  teams.forEach(team => {
    for (let wicket = 1; wicket <= maxWickets; wicket++) {
      const wicketOrdinal = getOrdinalSuffix(wicket);
      const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
      const specialMarket = {
        ...market,
        marketName: `${marketName} - ${team.shortName}`,
        wicketNo: wicket,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
    }
  });
};

const processWicketLostBallsMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  const maxWickets = market?.afterWicketAutoSuspend - 2;  // Subtract 2 to not include the suspend wicket

  teams.forEach(team => {
    for (let wicket = 1; wicket <= maxWickets; wicket++) {
      const wicketOrdinal = getOrdinalSuffix(wicket);
      const marketName = market.templateName.replace("{wicket}", wicketOrdinal);
      const specialMarket = {
        ...market,
        marketName: `${marketName} - ${team.shortName}`,
        wicketNo: wicket,
        teamId: team.teamId
      };
      processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
    }
  });
};

const processTopBatsManRunsMarkets = (market, teams, processedMarketsObj, commentaryDetails) => {
  teams.forEach(team => {
    sortbasedOnthePlayerTypeAndPlayerName(team.players);
    const specialMarketName = `Top Batsman ${team?.teamName} adv`;
    const specialMarket = {
      ...market,
      marketName: specialMarketName,
      teamId: team?.teamId,
      over: 0,
      runners: team?.players?.flatMap(player =>
        (market?.runners || []).map(runner => ({
          marketTemplateRunnerId: runner?.marketTemplateRunnerId,
          marketTemplateId: market?.marketTemplateId,
          runner: `${player?.playerName} ${team?.teamName}`,
          line: runner?.line,
          overRate: runner?.overRate,
          underRate: runner?.underRate,
          lastUpdate: new Date().toISOString(),
          selectionId: runner?.selectionId,
          order: runner?.order,
          backPrice: runner?.backPrice,
          layPrice: runner?.layPrice,
          backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
          laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
          predefinedValue: runner?.predefinedValue,
          runnerId: runner?.runnerId || "0",
          playerId: player?.commentaryPlayerId,
          defaultLine: parseFloat(player?.batsmanAverage),
        }))
      )
    }
    processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
  });
};

const generateExtraMarketFromTemplate = (template, team, commentary) => {
  return {
    eventMarketId: 0,
    isCreate: true,
    status: "1",
    margin: template.margin,
    data: "",
    playerId: null,
    ...template,
    commentaryId: commentary.commentaryId,
    eventRefId: commentary.eventRefId,
    marketName: `${template.templateName} - ${team.shortName}`,
    defaultBackSize: template?.defaultBackSize,
    defaultLaySize: template?.defaultLaySize,
    lineType: template?.lineType,
    teamId: null,
    inningsId: 1,
    isActive: template?.isDefaultMarketActive || false,
    isAllow: template.isDefaultBetAllowed || false,
    index: 0,
    rateDiff: template?.rateDiff,
    runners: template.runners?.map(runner => ({
      ...runner,
      runnerId: runner.runnerId || "0",
      backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
      laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
    })) || []
  };
};

// Helper function to get the key for a market
const getMarketKey = (market) => {
  const prefix = market.teamId || 'oneTimeMarket';
  return `${prefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
};

// Helper function to merge runners
const mergeRunners = (templateRunners, apiRunners, marketName, marketPredefinedValue) => {
  if (apiRunners.length > 0) {
    return apiRunners.map(apiRunner => ({
      ...apiRunner,
      runner: apiRunner.runner || marketName,
      runnerId: apiRunner.runnerId || apiRunner.selectionId || apiRunner.runner || marketName,
      predefinedValue: marketPredefinedValue, // Copy market level predefinedValue to runner
      line: apiRunner.line,
      overRate: apiRunner.overRate,
      underRate: apiRunner.underRate,
      backPrice: apiRunner.backPrice,
      layPrice: apiRunner.layPrice,
      backSize: apiRunner.backSize,
      laySize: apiRunner.laySize,
      order: apiRunner.order,
      selectionId: apiRunner.selectionId
    }));
  }
  return templateRunners;
};

const processMarketData = (templates, existingMarkets, teams, commentary, matchType, commentaryDetails) => {
  const processedMarketsObj = {};
  let sortedTemplates = [...templates];
  const type23Templates = sortedTemplates?.filter(t => t?.marketTypeCategoryId === 23)?.sort((a, b) => a?.over - b?.over);
  const otherTemplates = sortedTemplates?.filter(t => t?.marketTypeCategoryId !== 23);
  sortedTemplates = [...type23Templates, ...otherTemplates];
  // Process templates first to ensure all markets are generated
  sortedTemplates.forEach(template => {
    if (template.isPerEvent) {
      if (template.marketTypeCategoryId === 37) {
        processTopBowlerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
      } else {
        processMarketAndRunners(generateMarketFromTemplate(template, teams, commentary), null, 'oneTimeMarket', processedMarketsObj, commentaryDetails);
      }
    } else if (template.marketTypeCategoryId === 11 && template.isOver) {
      processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType, processedMarketsObj, commentaryDetails);
    }
    else if (template.marketTypeCategoryId === 10 && template.isOver) {
      processOverSessionMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 13) {
      processWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.noOfPlayer, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 12) {
      processPlayerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 29) {
      processPlayerBoundaryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 26) {
      processFancyLDOMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 30) {
      processPlayerBallMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 23 || template.marketTypeCategoryId === 26 || template.marketTypeCategoryId === 27) {
      processMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 28 || template.marketTypeCategoryId === 35) {
      processLotteryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, matchType);
    } else if (template.marketTypeCategoryId === 31) {
      processFallOfWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 32) {
      processPartnershipBoundariesMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 33) {
      processWicketLostBallsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 38) {
      processTopBatsManRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, commentaryDetails);
    } else if (template.marketTypeCategoryId === 39) {
      processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj, commentaryDetails);
    } else {
      teams.forEach(team => {
        processMarketAndRunners(generateExtraMarketFromTemplate(template, team, commentary), team.teamId, team.teamId.toString(), processedMarketsObj, commentaryDetails);
      });
    }
  });

  // Now update with existing markets from API
  existingMarkets.forEach(apiMarket => {
    const key = getMarketKey(apiMarket);
    if (!processedMarketsObj[key]) {
      processedMarketsObj[key] = [];
    }

    const existingMarketIndex = processedMarketsObj[key].findIndex(m =>
      m.teamId === apiMarket.teamId &&
      m.marketTypeId === apiMarket.marketTypeId &&
      m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
      m.marketName === apiMarket.marketName
    );

    if (existingMarketIndex !== -1) {
      // Update the existing market with API data
      const templateMarket = processedMarketsObj[key][existingMarketIndex];
      const updatedMarket = {
        ...templateMarket,
        ...apiMarket,
        isCreate: false,
        runners: mergeRunners(
          templateMarket.runners,
          apiMarket.runners,
          apiMarket.marketName,
          apiMarket.predefinedValue // Pass market level predefinedValue
        )
      };
      processedMarketsObj[key][existingMarketIndex] = updatedMarket;
    } else {
      // If the API market doesn't exist in our generated markets, add it
      processedMarketsObj[key].push({
        ...apiMarket,
        isCreate: false,
        runners: mergeRunners(
          [],
          apiMarket.runners,
          apiMarket.marketName,
          apiMarket.predefinedValue // Pass market level predefinedValue
        )
      });
    }
  });

  // Sort the markets within each key to maintain order
  Object.keys(processedMarketsObj).forEach(key => {
    processedMarketsObj[key].sort((a, b) => {
      // First, sort by over if it exists
      if (a.over && b.over) {
        return a.over - b.over;
      }
      // If over doesn't exist, maintain the original order
      return 0;
    });
  });

  return processedMarketsObj;
};

module.exports = {
  saveEventervice,
  createVirtualEventService,
  virtualEventTossService,
  updateVirtualEventStatusService,
  ballByBallVirtualEventService,
  ballByBallChangeService,
  onPlayerChangeService,
  handleWicketService,
  onInningChangeService,
  suffleCardAPIService,
  cancelEventAPIService,
  loadVirtualCom,
  serverTimeAPIService
};

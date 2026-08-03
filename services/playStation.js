const {
  virtualEventTossQuery,
  virtualEventTeamUpdateQuery,
  virtualPlayersSelectQuery,
} = require("../repository/TableCommentary");
const {
  comStatusUpdateQuery,
  virtualBallByBallQuery,
  virtualOverQuery,
  virtualOverCompleteQuery,
  virtualPartnershipQuery,
} = require("../repository/TableVirtual");
const {
  BALL_TYPE,
  commentaryStatus,
  callPredictorMarket,
  wicketTypeObj,
  playerType,
} = require("../utilities");
const {
  generateBall,
  generateDisplayStatus,
  generateRemainingRuns,
  generatePartnership,
  generateWicket,
  fetchWinnerMessage,
} = require("../utilities/comFunction");
const {
  DEFAULTBALLFACED,
  DEFAULTPLAYERBOUNDARIES,
  DEFAULTPLAYERRUNS,
} = require("../utilities/configConstants");
const { saveComVirtual } = require("./commentry");

const tossService = async (request, fastify) => {
  const { commentaryId, teamName } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId == commentaryId,
  );
  let batTeam = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings == commentary.currentInnings &&
      item.shortName == teamName,
  );

  let choseTo, displayStatus, rmk;
  choseTo = 1;
  displayStatus = `Toss Won By ${batTeam.shortName} and chose to Bat`;
  rmk = displayStatus;
  const data = {
    tossWonBy: batTeam.teamId,
    choseTo,
    displayStatus,
    rmk,
    commentaryId,
    commentaryStatus: commentaryStatus.TOSSDONE,
  };
  const tossData = await virtualEventTossQuery(data, request, fastify);
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId == commentaryId,
  );
  if (index !== -1) {
    global.tblCommentaries[index] = {
      ...global.tblCommentaries[index],
      ...tossData[0],
    };
  }
  let battingTeamId, bowlingTeamId;
  for (const team of [commentary.team1Id, commentary.team2Id]) {
    let teamStatus, subInning, teamBattingOrder;
    if (team == batTeam.teamId) {
      teamStatus = 1;
      subInning = 1;
      teamBattingOrder = 1;
      battingTeamId = team;
    } else {
      teamStatus = 2;
      subInning = 2;
      teamBattingOrder = 2;
      bowlingTeamId = team;
    }
    const teamPlayer = global.tblCommentaryTeams.find(
      (item) => item.commentaryId == commentaryId && item.teamId == team,
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
      fastify,
    );

    const teamIndex = global.tblCommentaryTeams.findIndex(
      (item) => item.commentaryId == commentaryId && item.teamId == team,
    );
    if (teamIndex !== -1) {
      global.tblCommentaryTeams[teamIndex] = {
        ...global.tblCommentaryTeams[teamIndex],
        ...teamData[0],
      };
    }
  }

  let onStrikePlayerId = null;
  let nonStrikerPlayerId = null;
  let onStrikePlayer = {};
  let nonStrikerPlayer = {};
  let currentBowler = {};
  const batters = global.tblCommentaryPlayers
    .filter(
      (p) => p.commentaryId === commentaryId && p.teamId === battingTeamId,
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
      fastify,
    );

    const batterIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === batter.commentaryPlayerId,
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
      (p) => p.commentaryId === commentaryId && p.teamId === bowlingTeamId,
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
      fastify,
    );

    const bowlerIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === bowler.commentaryPlayerId,
    );

    if (bowlerIndex !== -1) {
      global.tblCommentaryPlayers[bowlerIndex] = {
        ...global.tblCommentaryPlayers[bowlerIndex],
        ...player[0],
      };
    }
    currentBowler = global.tblCommentaryPlayers[bowlerIndex];
  }
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
    fastify,
  );
  // add ball to global variable
  global.tblCommentaryBallByBall.push(ball);
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
    fastify,
  );
  global.tblCommentaryPartnership.push(partner);

  //update commentary Status
  await comStatusUpdateQuery(
    {
      commentaryId,
      commentaryStatus: commentaryStatus.INPROGRESS,
    },
    request,
    fastify,
  );
  global.tblCommentaries[index].commentaryStatus = commentaryStatus.INPROGRESS;
  // return "Toss Done Successfully";
  const pythonURI = commentary.pythonURI ?? null;

  let key1 = global.tblConfigs.find((item) => item.key === DEFAULTBALLFACED);
  let key2 = global.tblConfigs.find(
    (item) => item.key === DEFAULTPLAYERBOUNDARIES,
  );
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
      pythonURI,
    );
  }
  return true;
};
const plyStationService = async (request, fastify) => {
  const { commentaryId, teamName, over, score, inningChange,wicket } = request.body;
  let commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId,
  );
  if (!commentaryDetails) {
    throw new Error("Event with this id not found");
  }
  if (commentaryDetails.commentaryStatus == commentaryStatus.COMPLETED) {
    throw new Error("Event is already completed");
  }
  if (commentaryDetails.commentaryStatus == commentaryStatus.OPEN) {
    throw new Error("Toss is not done yet");
    // await tossService(request, fastify);
    // commentaryDetails = global.tblCommentaries.find(
    //   (item) => item?.commentaryId === commentaryId,
    // );
  }
    let matchType = global.tblMatchTypes.find(
    (i) => i.matchTypeId == commentaryDetails.matchTypeId,
  );

  let teams = global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings === commentaryDetails.currentInnings,
  );
  let battingTeam = teams.find((item) => item.teamStatus === 1);
  let bowlingTeam = teams.find((item) => item.teamStatus === 2);
  const partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings,
    )
    .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId)[0];

  let run = Number(score || 0),
    isWicket = false,
    ballType = BALL_TYPE.REGULAR;
  // const runs = (score || 0);
  // run = runs - (battingTeam.teamScore || 0);
  isWicket = wicket > (battingTeam.teamWicket || 0);
  const [overNumber, ball] = over.toString().split(".").map(Number);

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


  let dbOver = global.tblOvers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings &&
      item.over == overNumber &&
      item.teamId == battingTeam.teamId
  );
  let isOverComplete = false;
  if (!dbOver) {
    // complete the previous over if it exists
    const preOver = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings,
      )
      .sort((a, b) => b.overId - a.overId)[0];

    if (preOver) {
      // complete the previous over
      const updateOver = {
        ...preOver,
        isComplete: true,
      };
      await virtualOverCompleteQuery(updateOver, fastify, request);
      const overIndex = global.tblOvers.findIndex(
        (item) => item.overId === preOver.overId,
      );
      global.tblOvers[overIndex].isComplete = true;
      isOverComplete = true;
    }
    const commentaryOvers = {
      overId: overNumber,
      commentaryId: commentaryDetails?.commentaryId,
      // teamId: bowlingTeamId.teamId,
      teamId: battingTeam.teamId,
      over: overNumber,
      ballCount: 0,
      bowlerId: currentBowler?.commentaryPlayerId,
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
    const over1 = await virtualOverQuery(commentaryOvers, request, fastify);
    // add over to global variable
    global.tblOvers.push(over1);
    const commentaryBallByBall = {
      commentaryBallByBallId: 0,
      commentaryId: commentaryDetails?.commentaryId,
      teamId: battingTeam.teamId,
      overId: over1?.overId,
      overCount: 0,
      currentOverBalls: 0,
      bowlerId: currentBowler?.commentaryPlayerId,
      batStrikeId: onStrikePlayer?.commentaryPlayerId,
      batNonStrikeId: nonStrikePlayer?.commentaryPlayerId,
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
      nextBatStrikeId: onStrikePlayer?.commentaryPlayerId,
      nextBatNonStrikeId: nonStrikePlayer?.commentaryPlayerId,
      currentInnings: commentaryDetails.currentInnings,
    };
    const ball = await virtualBallByBallQuery(
      commentaryBallByBall,
      request,
      fastify,
    );
    // add ball to global variable
    global.tblCommentaryBallByBall.push(ball);
    dbOver = over1;
  }
  if (isWicket) {
    const result = await plySWicketService(
      {
        commentaryDetails,
        battingTeam,
        bowlingTeam,
        onStrikePlayer,
        nonStrikePlayer,
        currentBowler,
        currentOver: dbOver,
        partnership,
        matchType,
        ballType,
      },
      request,
      fastify,
    );
  } else {
    let result = await runUpdateService(
      {
        commentaryDetails,
        battingTeam,
        bowlingTeam,
        onStrikePlayer,
        nonStrikePlayer,
        currentBowler,
        runToUpdate: run,
        isWicket,
        ballType,
        overNumber,
        ball,
        over: dbOver,
        matchType,
        isOverComplete,
        partnership: partnership,
      },
      request,
      fastify,
    );
  }
   let matchComplete = await psMatchCompleteService({
     matchType
   },request, fastify);
   if (matchComplete.isMatchComplete) {
     let getRes = await comResponseService2(request, fastify);
     return {
       inningChange: false,
       isMatchComplete: true,
       isOverComplete: isOverComplete,
       isWicket: isWicket,
       ...getRes,
     };
   }
   if (
     commentaryDetails.commentaryStatus == commentaryStatus.INPROGRESS &&
     inningChange
   ) {
     await psInningChangeService(
       {
         ...request.body,
         commentaryDetails,
         matchType,
       },
       request,
       fastify,
     );
       let getRes = await comResponseService2(request, fastify);
     return {
       inningChange: request.body.inningChange,
       isMatchComplete: false,
       isOverComplete: true,
       isWicket: isWicket,
       ...getRes,
     };
   }
   let getRes = await comResponseService2(request, fastify);
   return {
     inningChange: request.body.inningChange,
     isMatchComplete: matchComplete.isMatchComplete,
     isOverComplete: isOverComplete,
     isWicket: isWicket,
     ...getRes,
   };

};
const runUpdateService = async (data, request, fastify) => {
  let isChangeStrike = false;
  let updateBall = {};
  let updateOver = {};
  let updatePartnership = {};
  let updateBowler = {};
  let updateBatter = {};
  let updateBattingTeam = {};
  let nonStrikeBatter = {};
  const {
    runToUpdate,
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
    prevBall,
    matchType,
    isOverComplete,
  } = data;

  const runs = Number(request.body.score || 0);
  const wickets = Number(request.body.wicket || 0)
  // const [runs = 0, wickets = 0] = (request.body.score || "0-0")
  //   .split("-")
  //   .map(Number);

  updateBowler["bowlerOver"] = request.body.over;
  updateBowler["bowlerRun"] = (currentBowler.bowlerRun || 0) + runToUpdate;
  updateBattingTeam["teamScore"] = (battingTeam.teamScore || 0) + runToUpdate;
  updateOver["teamScore"] = `${updateBattingTeam?.teamScore || 0}/${
    battingTeam?.teamWicket || 0
  }`;
  updateOver["totalRun"] = (over.totalRun || 0) + runToUpdate;
  updateBall["ballIsCount"] = ball > 0 ? true : false;
  updateBall["ballType"] = BALL_TYPE.REGULAR;
  updateBall["ballRun"] = runToUpdate;
  updateBall["batStrikeId"] = onStrikePlayer.commentaryPlayerId;
  updateBall["batNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
  updateBall["teamId"] = battingTeam.teamId;
  updateBall["overId"] = over.overId;
  updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
  updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
  updateBatter["batRun"] = onStrikePlayer.batRun + runToUpdate;
  updateBatter["batBall"] = onStrikePlayer.batBall + ball;
  // updateBowler["bowlerRun"] = currentBowler.bowlerRun + runToUpdate;
  updateBowler["bowlerTotalBall"] = currentBowler.bowlerTotalBall + ball;
  // updateBowler["bowlerOver"] = request.body.over;
  updateOver["ballCount"] = ball;
  // updateOver["totalRun"] = over.totalRun + runToUpdate;
  updateBattingTeam["teamOver"] = request.body.over;
  // updateOver["teamScore"] = `${runs || 0}/${wickets || 0}`;
  updateBall["overCount"] = request.body.over;
  updateBall["currentOverBalls"] = ball;
  updatePartnership["totalRuns"] = partnership.totalRuns + runToUpdate;
  updatePartnership["totalBalls"] = partnership.totalBalls + ball;
  updatePartnership["batter1Runs"] =
    // check if the same batter is on strike or not
    partnership.batter1Id == onStrikePlayer.commentaryPlayerId
      ? partnership.batter1Runs + runToUpdate
      : partnership.batter1Runs;
  updatePartnership["batter2Runs"] =
    // check if the same batter is on strike or not
    partnership.batter2Id == onStrikePlayer.commentaryPlayerId
      ? partnership.batter2Runs + runToUpdate
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
  let isBoundary = false;
  if (runToUpdate == 4 || runToUpdate == 6) {
    isBoundary = true;
  }
  if (runToUpdate === 0) {
    updateBall["batStrikeId"] = onStrikePlayer.commentaryPlayerId;
    updateBall["batNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    updateBall["ballIsDot"] = true;
    updateBatter["batDotBall"] = onStrikePlayer.batDotBall + ball;
    updateOver["dotBall"] = over.dotBall + ball;
    updateBowler["bowlerDotBall"] = currentBowler.bowlerDotBall + ball;
  } else if (isBoundary) {
    if (runToUpdate == 4) {
      updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
      updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
      updateBall["ballIsBoundry"] = true;
      updateBall["ballFour"] = 1;
      updateBatter["batFour"] = onStrikePlayer.batFour + 1;
      updateBowler["bowlerFour"] = currentBowler.bowlerFour + 1;
      updateOver["totalFour"] = over.totalFour + 1;
      updatePartnership["totalFour"] = partnership.totalFour + 1;
    }
    if (runToUpdate == 6) {
      updateBall["nextBatStrikeId"] = onStrikePlayer.commentaryPlayerId;
      updateBall["nextBatNonStrikeId"] = nonStrikePlayer.commentaryPlayerId;
      updateBall["ballIsBoundry"] = true;
      updateBall["ballSix"] = 1;
      updateBatter["batSix"] = onStrikePlayer.batSix + 1;
      updateBowler["bowlerSix"] = currentBowler.bowlerSix + 1;
      updateOver["totalSix"] = over.totalSix + 1;
      updatePartnership["totalSix"] = partnership.totalSix + 1;
    }
  } else if (runToUpdate % 2 !== 0) {
    isChangeStrike = true;
    updateBall["nextBatStrikeId"] = nonStrikePlayer.commentaryPlayerId;
    updateBall["nextBatNonStrikeId"] = onStrikePlayer.commentaryPlayerId;
  }
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
  const newPart = generatePartnership(
    {
      updateBattingTeam,
      currentPartnership: updatePartnership,
      commentaryDetails,
    },
    request,
  );

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
    request,
  );
  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings,
  );

  let remainingBallsShow = teams.some((team) => team.isBattingComplete);
  const ncom = {
    ...commentaryDetails,
    displayStatus: generateDisplayStatus({
      currentBall: ballByBall,
    }),
    rmk: remainingBallsShow
      ? generateRemainingRuns(
          {
            team: updateBattingTeam,
            ballsPerOver: matchType.ballsPerOver,
          },
          request,
        )
      : "",
  };
  let objToSave = {
    commentaryTeams: [updateBattingTeam],
    commentaryOvers: updateOver,
    commentaryPlayers: [updateBatter, updateBowler, nonStrikeBatter],
    commentaryBallByBall: ballByBall,
    commentaryDetails: ncom,
    commentaryId: commentaryDetails.commentaryId,
    commentaryPartnership: newPart,
  };
  let endInningForPredictor = request.body.inningChange ? true : false;
  const ballByBall1 = await saveComVirtual(
    {
      ...request,
      body: {
        ...objToSave,
        isOverComplete,
        endInningForPredictor,
      },
    },
    fastify,
  );

  return ballByBall1;
};
const plySWicketService = async (data, request, fastify) => {
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

  const teams = [battingTeam, bowlingTeam];
  const freezePlayers = true;
  const ball = 1;
  const updatedBowlerOver = request.body.over;
  let remainingBallsShow = teams.some((team) => team.isBattingComplete);
  let wicketData = {
    wicketType: wicketTypeObj.BOLD,
    batterId: onStrikePlayer.commentaryPlayerId,
    runs: 0,
    fielder1: currentBowler.commentaryPlayerId,
    fielder2: currentBowler.commentaryPlayerId,
  };
  let upBatTeam = {
    ...battingTeam,
    teamScore: battingTeam.teamScore || 0,
    teamWicket: (battingTeam.teamWicket || 0) + 1,
    teamOver: request.body.over,
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
  };
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
    request,
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
  let endInningForPredictor = request.body.inningChange ? true : false;
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
    endInningForPredictor: endInningForPredictor || false,
  };

  // // update in db
  const res = await saveComVirtual(
    {
      ...request,
      body: objToSave,
    },
    fastify,
  );
  const { player } = await psChangePlayer({
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
    fastify,
  );
  return {
    isWicket: true,
    isOverComplete: false,
    ...(await comResponseService2(request, fastify)),
  };
};
const comResponseService2 = async (request, fastify, completeOver = false) => {
  let { commentaryId } = request.body;
  let commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId,
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
        item.currentInnings == commentaryDetails.currentInnings,
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
    let overCount = global.tblCommentaryBallByBall
      .filter(
        (a) =>
          a?.commentaryId === commentaryId &&
          a.currentInnings == commentaryDetails.currentInnings,
      )
      .sort(
        (a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId,
      )[1]?.overCount;
    over = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings,
      )
      .sort((a, b) => b.overId - a.overId)[1];
    over = {
      overId: over.overId,
      over: over.over,
      teamId: over.teamId,
      ballCount: over.ballCount,
      teamScore: over.teamScore,
      isComplete: over.isComplete,
      overCount,
    };
  }
  // get latest over
  else {
    let overCount = global.tblCommentaryBallByBall
      .filter(
        (a) =>
          a?.commentaryId === commentaryId &&
          a.currentInnings == commentaryDetails.currentInnings,
      )
      .sort(
        (a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId,
      )[0]?.overCount;
    over = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings,
      )
      .sort((a, b) => b.overId - a.overId)[0];
    over = {
      overId: over.overId,
      over: over.over,
      teamId: over.teamId,
      ballCount: over.ballCount,
      teamScore: over.teamScore,
      isComplete: over.isComplete,
      overCount,
    };
  }
  return {
    teams,
    commentaryDetails,
    over,
  };
};
const psChangePlayer = async (data) => {
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
        i.teamId == bowlingTeam.teamId,
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
        i.commentaryId == commentaryId,
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
const psInningChangeService = async (data, request, fastify) => {
  let { commentaryDetails, commentaryId } = data;

  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings,
  );
  const batTeam = teams.find((item) => item.teamStatus === 1);
  const bowlTeam = teams.find((item) => item.teamStatus === 2);
  const runDifference =
    (batTeam.teamScore || 0) +
    (batTeam.teamLeadRuns || 0) -
    (batTeam.teamTrialRuns || 0);
  const leadRuns = Math.max(runDifference * -1, 0);
  const trialRuns = Math.max(runDifference, 0);
  const currentPartnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings,
    )
    .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId)[0];

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
    rmk: generateRemainingRuns({
      team: { ...bowlTeam, teamTrialRuns: trialRuns },
      ballsPerOver: data.matchType.ballsPerOver || 6,
    }),
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
      (item.onStrike == true || item.isPlay == true),
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
    fastify,
  );
      const preOver = global.tblOvers
      .filter(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.currentInnings == commentaryDetails.currentInnings,
      )
      .sort((a, b) => b.overId - a.overId)[0];

    if (preOver) {
      // complete the previous over
      const updateOver = {
        ...preOver,
        isComplete: true,
      };
      await virtualOverCompleteQuery(updateOver, fastify, request);
      const overIndex = global.tblOvers.findIndex(
        (item) => item.overId === preOver.overId,
      );
      global.tblOvers[overIndex].isComplete = true;
      isOverComplete = true;
    }
  //player selection
  const battingTeamId = global.tblCommentaryTeams.find(
    (t) =>
      commentaryDetails.currentInnings == t.currentInnings &&
      t.commentaryId == commentaryDetails.commentaryId &&
      t.teamStatus == 1,
  );
  const bowlingTeamId = global.tblCommentaryTeams.find(
    (t) =>
      commentaryDetails.currentInnings == t.currentInnings &&
      t.commentaryId == commentaryDetails.commentaryId &&
      t.teamStatus == 2,
  );

  const batters = global.tblCommentaryPlayers
    .filter(
      (p) =>
        p.commentaryId === commentaryDetails.commentaryId &&
        p.teamId === battingTeamId.teamId,
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
      fastify,
    );

    const batterIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === batter.commentaryPlayerId,
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
        p.teamId === bowlingTeamId.teamId,
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
      fastify,
    );

    const bowlerIndex = global.tblCommentaryPlayers.findIndex(
      (p) => p.commentaryPlayerId === bowler.commentaryPlayerId,
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
    fastify,
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
    fastify,
  );
  global.tblCommentaryPartnership.push(partner);

  return {
    result: null,
    inningChange: true,
  };
};
const getMatchCompletionState = ({
  matchType,
  batTeam,
  overdetails,
}) => {
  const ballsPerOver = matchType?.ballsPerOver || 6;
  const overCompleted = Boolean(
    matchType?.isLimitedOvers &&
      overdetails &&
      (+overdetails.ballCount || 0) >= ballsPerOver &&
      (Math.floor(+overdetails.over || 0) + 1 >= batTeam?.teamMaxOver)
  );

  return {
    overCompleted,
  };
};

const psMatchCompleteService = async (data, request, fastify) => {
  let { commentaryId } = request.body;
  let { matchType } = data;
  let commentaryDetails = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  let teams = global.tblCommentaryTeams.filter(
    (i) =>
      i.commentaryId == commentaryId &&
      i.currentInnings == commentaryDetails.currentInnings
  );
  const batTeam = teams.find((t) => t.teamStatus == 1);
  const bowlTeam = teams.find((t) => t.teamStatus == 2);
  let target = 0;
  if (bowlTeam?.isBattingComplete) {
    const trail = +batTeam?.teamTrialRuns || 0;
    if (trail > -1) {
      target = trail + 1;
    }
  }
  const overdetails = global.tblOvers
    .filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.currentInnings == commentaryDetails.currentInnings
    )
    .sort((a, b) => b.overId - a.overId)[0];

  const completionState = getMatchCompletionState({
    matchType,
    batTeam,
    overdetails,
  });

  const shouldComplete = completionState.overCompleted;

  if (!shouldComplete) {
    return {
      isMatchComplete: false,
    };
  }

  let result;
  let res;
  if (shouldComplete) {
    result = await psCheckWinner({
      ...request.body,
      commentaryDetails,
      target,
      bowlTeam,
      batTeam,
      isWonByInnings: false,
      matchType,
    });
    res = await saveComVirtual(
      {
        ...request,
        body: result.objToSave,
      },
      fastify
    );
    return {
      isMatchComplete: true,
      result,
    };
  }

  if (request.body.inningChange) {
    await psInningChangeService(
      {
        ...request.body,
        commentaryDetails,
        matchType,
      },
      request,
      fastify
    );
    return {
      isMatchComplete: false,
      inningChange: true,
    };
  }

  return {
    isMatchComplete: false,
  };
};
const psCheckWinner = async (data) => {
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
module.exports = {
  tossService,
  plyStationService,
  getMatchCompletionState,
};

const { BALL_TYPE, playerSwitchObj, wicketTypeObj, wicketType } = require(".");

const generateBall = (data) => {
  const {
    updateBall,
    commentaryBallByBallId,
    updateBattingTeam,
    updateOver,
    updateBatter,
    updateBowler,
    nonStrikeBatter,
    updatePartnership,
    commentaryDetails
  } = data;

  return {
    commentaryBallByBallId: commentaryBallByBallId || 0,
    commentaryId: commentaryDetails.commentaryId,
    teamId: updateBattingTeam.teamId,
    overId: updateOver.overId,
    // overCount: updateBattingTeam.teamOver || 0,
    overCount : updateBall.overCount ? updateBall.overCount : updateBattingTeam.teamOver || 0,
    // currentOverBalls: updateOver.ballCount || 0,
    currentOverBalls: updateBall?.currentOverBalls  || updateOver.ballCount || 0,
    bowlerId:
        updateBall?.bowlerId ||
        updateBowler?.commentaryPlayerId ||
        0,
    batStrikeId:
        updateBall?.batStrikeId ||
        updateBatter.commentaryPlayerId ||
        0,
    batNonStrikeId:
        updateBall?.batNonStrikeId ||
        nonStrikeBatter?.commentaryPlayerId ||
        0,
    ballIsCount: updateBall?.ballIsCount || false,
    ballType: updateBall?.ballType || BALL_TYPE.OVER_COMPLETE,
    ballIsDot: updateBall?.ballIsDot || false,
    ballRun: updateBall?.ballRun || 0,
    ballExtraRun: updateBall?.ballExtraRun || 0,
    ballIsBoundry: updateBall?.ballIsBoundry || false,
    ballFour: updateBall?.ballFour || 0,
    ballSix: updateBall?.ballSix || 0,
    ballIsWicket: updateBall?.ballIsWicket || false,
    ballWicketType: updateBall?.ballWicketType || 0,
    ballPlayerId:
      updateBall?.batStrikeId ||
      updateBatter.commentaryPlayerId ||
        0,
    ballBowlerId: updateBowler?.commentaryPlayerId || 0,
    ballFielderId1: updateBall?.ballFielderId1 || 0,
    ballFielderId2: updateBall?.ballFielderId2 || 0,
    overIsMaiden: updateBall?.overIsMaiden || false,
    nextBatStrikeId:
      updateBall?.nextBatStrikeId || 0,
    nextBatNonStrikeId:
      updateBall?.nextBatNonStrikeId || 0,
    currentInnings: commentaryDetails.currentInnings,
    autoStrikeBallCount: updateBall?.autoStrikeBallCount || 0,
    commentaryPartnershipId: updatePartnership.commentaryPartnershipId || 0,
    teamScore: updateBattingTeam?.teamScore || 0,
    teamWicket: updateBattingTeam?.teamWicket || 0,
    cardType: updateBall.cardType ? updateBall.cardType : null,
    cardKey : updateBall?.cardKey ? updateBall.cardKey : null,
  };
};
const generatePartnership = (data) => {
  const {  currentPartnership,updateBattingTeam,commentaryDetails,updateBatter} =data
  const toReturn = {
    "commentaryPartnershipId": currentPartnership.commentaryPartnershipId || 0,
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": updateBattingTeam.teamId,
    "batter1Id": currentPartnership.batter1Id,
    "batter1Name": currentPartnership.batter1Name,
    "batter2Id": currentPartnership.batter2Id,
    "batter2Name": currentPartnership.batter2Name,
    "totalRuns": currentPartnership.totalRuns || 0,
    "totalBalls": currentPartnership.totalBalls || 0,
    "totalSix": currentPartnership.totalSix || 0,
    "totalFour": currentPartnership.totalFour || 0,
    "extras": currentPartnership.extras || 0,
    "commentaryBallByBallId": currentPartnership.commentaryBallByBallId || 0,
    "currentInnings": commentaryDetails.currentInnings,
    "batter1Runs": currentPartnership.batter1Runs || 0,
    "batter2Runs": currentPartnership.batter2Runs || 0,
    "batter1Balls": currentPartnership.batter1Balls || 0,
    "batter2Balls": currentPartnership.batter2Balls || 0,
    "player1image": currentPartnership.player1image || null,
    "player2image": currentPartnership.player2image || null,
    // "order" : currentPartnership?.order,
    "order" : currentPartnership.commentaryPartnershipId ? currentPartnership.order : updateBattingTeam.teamWicket + 1 || 1,
    "isActive": currentPartnership?.isActive,
  };
  return toReturn;
}
const genEtPartnership = (data) => {
  const {  currentPartnership,updateBattingTeam,commentaryDetails,updateBatter} =data
  const toReturn = {
    "commentaryPartnershipId": currentPartnership.commentaryPartnershipId || 0,
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": updateBattingTeam.teamId,
    "batter1Id": currentPartnership.batter1Id,
    "batter1Name": currentPartnership.batter1Name,
    "batter2Id": currentPartnership.batter2Id,
    "batter2Name": currentPartnership.batter2Name,
    "totalRuns": currentPartnership.totalRuns || 0,
    "totalBalls": currentPartnership.totalBalls || 0,
    "totalSix": currentPartnership.totalSix || 0,
    "totalFour": currentPartnership.totalFour || 0,
    "extras": currentPartnership.extras || 0,
    "commentaryBallByBallId": currentPartnership.commentaryBallByBallId || 0,
    "currentInnings": commentaryDetails.currentInnings,
    "batter1Runs": currentPartnership.batter1Runs || 0,
    "batter2Runs": currentPartnership.batter2Runs || 0,
    "batter1Balls": currentPartnership.batter1Balls || 0,
    "batter2Balls": currentPartnership.batter2Balls || 0,
    "player1image": currentPartnership.player1image || null,
    "player2image": currentPartnership.player2image || null,
    // "order" : currentPartnership?.order,
    "order" : currentPartnership.commentaryPartnershipId ? currentPartnership.order : updateBattingTeam.teamWicket + 1 || 1,
    "isActive": currentPartnership?.isActive,
    "teamScore": updateBattingTeam.teamScore,
    "teamWicket" : updateBattingTeam.teamWicket
  };
  return toReturn;
}
const generateDisplayStatus = (data) => {
    const { currentBall, playerSwitch , onStrikePlayer } = data 
    let displayStatus = ""
    // New Logic 
    const run = currentBall.ballRun
    const extraRun = currentBall.ballExtraRun - 1
    const ballType = currentBall.ballType
    const wicketType = currentBall.ballWicketType
    if (playerSwitch) {
      if (playerSwitch === playerSwitchObj.SWITCH_BOWLER) displayStatus = "Bowler Switched"
      else if (playerSwitch === playerSwitchObj.CHANGE_BOWLER) displayStatus = "Bowler Changed"
      else if (playerSwitch === playerSwitchObj.BATTER_SWITCH) displayStatus = "Batter Switched"
    } else {
      if (ballType === BALL_TYPE.REGULAR) {
        if (currentBall.ballIsWicket) {
          if (wicketType === wicketTypeObj.BOLD) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.BOLD_LABEL}` : ""} `
          else if (wicketType === wicketTypeObj.CATCH) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.CATCH_LABEL}`: ""}`
          else if (wicketType === wicketTypeObj.STUMP) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.STUMP_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.HIT_WICKET) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.HIT_WICKET_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.LBW) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.LBW_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.RUN_OUT) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.RUN_OUT_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.RETIRED_OUT) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.RETIRED_OUT_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.TIMED_OUT) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.TIMED_OUT_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.HIT_BALL_TWICE) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.HIT_BALL_TWICE_LABEL}` : ""}`
          else if (wicketType === wicketTypeObj.OBSTRACT_THE_FIELDING) displayStatus = `${onStrikePlayer?.playerName ? `${onStrikePlayer.playerName} ${wicketTypeObj.OBSTRACT_THE_FIELDING_LABEL}` : ""}`
        }
        else if (currentBall.ballFour !== 0) displayStatus = "4"
        else if (currentBall.ballSix !== 0) displayStatus = "6"
        else {
          if (run === 0) displayStatus = "0"
          else if (run === 1) displayStatus = "1"
          else if (run === 2) displayStatus = "2"
          else if (run === 3) displayStatus = "3"
          else if (run === 4) displayStatus = "4"
          else if (run === 5) displayStatus = "5"
        }
      }
      // else if (ballType === BALL_TYPE_OVER_COMPLETE) displayStatus = "Over Ended"
      else if (ballType === BALL_TYPE.WIDE) displayStatus = `Wide${run > 0 ? ` + ${run}` : ""}`
      else if (ballType === BALL_TYPE.BYE) displayStatus = `${run > 0 ? run : ""} Bye`
      else if (ballType === BALL_TYPE.LEG_BYE) displayStatus = `${run > 0 ? run : ""} L-Bye`
      else if (ballType === BALL_TYPE.NO_BALL) displayStatus = `No Ball${run > 0 ? ` + ${run}` : ""}`
      else if (ballType === BALL_TYPE.NO_BALL_BYE) displayStatus = `No Ball${run > 0 ? ` + ${run}` : ""} Bye`
      else if (ballType === BALL_TYPE.NO_BALL_LEG_BYE) displayStatus = `No Ball${run > 0 ? ` + ${run}` : ""} L-Bye`
    }
    return displayStatus
}
const generateRemainingRuns = (data) => {
    const {team, ballsPerOver} = data;
    // console.log("team", team)
    // console.log("ballsPerOver", ballsPerOver)
    const oversParts = String(team.teamOver || "0").split(".");
    const completedOvers = parseInt(oversParts[0], 10);
    const ballsInCurrentOver = parseInt(oversParts[1] || "0", 10);
    const totalBallsBowled = (completedOvers * ballsPerOver) + ballsInCurrentOver;
    const totalBallsRemaining = (team.teamMaxOver * ballsPerOver) - totalBallsBowled;
    const totalRunRemaining = (team.teamTrialRuns || 0) - (team.teamScore || 0);
    // console.log("totalRunRemaining",totalRunRemaining)
    let run = totalRunRemaining + 1;
    if(run <= 0 || totalBallsRemaining <= 0){
      return "";
    }
    return `${team.shortName} needs ${run} runs from ${totalBallsRemaining} balls.`;
    // return `${team.shortName} needs ${totalRunRemaining + 1} runs from ${totalBallsRemaining} balls.`;
};

const getBowlerOnlyRuns = (over) => {
  const toReturn = (+over?.totalRun || 0) - (+over?.totalByesRun || 0) - (+over?.totalLegByesRun || 0)
  // console.log("Bowler only Runs: ", { toReturn });
  return toReturn
}
const generateOver = (data) => {
  const { commentaryDetails, teams, bowler } = data;
  return {
    overId: 0,
    commentaryId: commentaryDetails.commentaryId,
    // teamId: teams.bowlingTeam.teamId,
    teamId: teams.battingTeam.teamId,
    bowlerId: bowler?.commentaryPlayerId,
    currentInnings: commentaryDetails.currentInnings,
    over: Math.floor(teams.battingTeam?.teamOver),
    ballCount: 0,
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
    powerplay: null,
    isOverInPowerplay: false,
    powerplayType: 1,
    isMaiden: false,
    isDelete: null,
  }
}
const fetchWinnerMessage = (data) => {
  const {batTeam,bowlTeam ,isBatTeamWon,matchType,target } =data;
  if (isBatTeamWon) {
    const maxNoOfWicket = matchType.noOfPlayer - (matchType.isLastManStand ? 0 : 1);
    const wicketRemaining = maxNoOfWicket - (batTeam.teamWicket || 0)
    return `${batTeam.shortName} won by ${wicketRemaining} wickets.`
  } else {
    const runsLeft = target - batTeam.teamScore - 1
    return `${bowlTeam.shortName} won by ${runsLeft} runs.`
  }
}
const generateWicket = (data) => {
  const { commentaryDetails, currentWicket, currentOver, battingTeam, currentBall } = data
  return {
    commentaryWicketId: currentWicket.commentaryWicketId || 0,
    commentaryId: commentaryDetails.commentaryId,
    bowlerId: currentWicket.bowlerId,
    bowlerName: currentWicket.bowlerName,
    wicketType: currentWicket.wicketType,
    batterId: currentWicket.batterId,
    batterName: currentWicket.batterName,
    fieldPlayerId: currentWicket.fieldPlayerId,
    fieldPlayerName: currentWicket.fieldPlayerId,
    overId: currentOver.overId,
    overCount: currentOver.over,
    commentaryBallByBallId: currentBall.commentaryBallByBallId || 0,
    teamId: battingTeam.teamId,
    teamScore: battingTeam.teamScore,
    playerRun: currentWicket.batterRuns || 0,
    playerBalls: currentWicket.batterBalls || 0,
    wicketCount: (currentWicket.wicketCount || 0),
    ballCount: 0, //Change in future
    currentInnings: commentaryDetails.currentInnings,
  }
}
const buildOverData = async (data) =>{
  // const {overend, ballEvents, commentaryDetails, teams, bowler} = data;
  const {entityData , commentaryDetails , teams ,playerTpIdObj} = data;
  let overs = [];
  let overend = entityData.filter((e)=> e.event == "overend").sort((a,b)=> a.over - b.over);
  let events = entityData.filter((e)=>e.event != "overend").sort((a,b)=>a.event_id - b.event_id);
  // let ballEvents = entityData.filter((e)=> e.event_type == "ball")
  let matchType = global.tblMatchTypes.find((mt)=> mt.matchTypeId == commentaryDetails.matchTypeId)
  for (let ov of overend){
    const overNumber = ov.over;
    const ballEvents = events.filter((b) => Number(b.over) === overNumber - 1);
    const totalFour = ballEvents.filter(b => b.four).length;
    const totalSix = ballEvents.filter(b => b.six).length;
    const totalWicket = ballEvents.filter(b => b.event === "wicket").length;
    // const totalWicket = ballEvents.filter(b => b.wicket).length || 0;
    const dotBall = ballEvents.filter(
        b =>
          Number(b.run) === 0 &&
          !b.wicket &&
          b.event !== "wicket" &&
          Number(b.wide_run) === 0 &&
          Number(b.noball_run) === 0
      ).length;

    const bowlerId = ov.bowls[0].bowler_id;
    let bowler = global.tblCommentaryPlayers.find(
      (p) => p.commentaryId == commentaryDetails.commentaryId && p.tpId == bowlerId && p.currentInnings == commentaryDetails.currentInnings
    );
    let over = {
      overId: 0,
      commentaryId: commentaryDetails?.commentaryId,
      teamId: teams?.bowlingTeam?.teamId,
      bowlerId : bowler?.commentaryPlayerId || null,
      currentInnings: commentaryDetails?.currentInnings,
      over: overNumber,
      ballCount: ballEvents.length,
      totalRun: ov.runs,
      totalFour,
      totalSix,
      totalWideBall: ballEvents.filter(b => Number(b.wide_run) > 0).length,
      totalWideRun: ballEvents.reduce((acc, b) => acc + Number(b.wide_run || 0), 0),
      totalNoball: ballEvents.filter(b => Number(b.noball_run) > 0).length,
      totalNoBallRun: ballEvents.reduce((acc, b) => acc + Number(b.noball_run || 0), 0),
      totalByesRun: ballEvents.reduce((acc, b) => acc + Number(b.bye_run || 0), 0),
      totalLegByesRun: ballEvents.reduce((acc, b) => acc + Number(b.legbye_run || 0), 0),
      totalPanelty: 0,
      totalWicket,
      dotBall,
      isComplete: true,
      isMaiden: overend.runs === 0,
      powerplay: null,
      isOverInPowerplay: false,
      powerplayType: 1,
      isDelete: null,
      teamScore : ov.score
    };
    let batters = ov.bats;
    let batterIds = {}
    for (let b of batters){
      let batter = global.tblCommentaryPlayers.find(
        (p) => p.commentaryId == commentaryDetails.commentaryId && p.tpId == b.batsman_id && p.currentInnings == commentaryDetails.currentInnings
      );
      if(batter){
        batterIds[b.batsman_id] = batter.commentaryPlayerId
      }
    }
    let ballByBall = [];
    for (let b of ballEvents){
      let wicket = null;
      let nonStrike = batters.find((ba)=> ba.batsman_id != b.batsman_id)
      let isCount = true;
      let ballType = BALL_TYPE.REGULAR;
      let ballExtraRun = 0;
      let ballRun = b.run || 0;
      let nextBatStrikeId = batterIds[b.batsman_id] || 0;
      let nextBatNonStrikeId = nonStrike ? (batterIds[nonStrike.batsman_id] || null) : 0;
      let ballIsDot = false;
      // if ball is wide it will not count in over
      if(b.wide_run && b.wide_run > 0){
        isCount = false;
        ballType = BALL_TYPE.WIDE;
        ballExtraRun = matchType.wide_run
        ballRun = 0;
      }
      if(b.run % 2 != 0){
        nextBatStrikeId = nonStrike ? (batterIds[nonStrike.batsman_id] || null) : 0;
        nextBatNonStrikeId = batterIds[b.batsman_id] || 0;
      }
      if(b.event == "wicket"){
        nextBatNonStrikeId = 0;
        nextBatStrikeId = 0;
        ballIsDot = true;
        wicket = {
          commentaryWicketId : 0,
          commentaryId : commentaryDetails?.commentaryId,
          bowlerId : bowler?.commentaryPlayerId || null,
          bowlerName : bowler?.playerName || "",
          wicketType : wicketTypeObj.BOLD,
          batterId : playerTpIdObj[b.wicket_batsman_id] ? playerTpIdObj[b.wicket_batsman_id].commentaryPlayerId : 0,
          batterName : playerTpIdObj[b.wicket_batsman_id] ? playerTpIdObj[b.wicket_batsman_id].playerName : "",
          fieldPlayerId : 0,
          fieldPlayerName : "",
          overId : 0,
          overCount : `${over.over}.${b.ball}`,
          commentaryBallByBallId : 0,
          teamId : teams?.battingTeam?.teamId,
          teamScore : null,
          playerRun : b.batsman_runs || 0,
          playerBalls : b.balls_faced || 0,
          wicketCount : null,
          ballCount : null,
          currentInnings : commentaryDetails?.currentInnings
        }
      }
      let ball = {
        commentaryBallByBallId : 0,
        commentaryId : commentaryDetails?.commentaryId,
        teamId : teams?.battingTeam?.teamId,
        overId : over.overId,
        overCount : `${over.over}.${b.ball}`,
        currentOverBalls : b.ball,
        bowlerId : bowler.commentaryPlayerId,
        batStrikeId : batterIds[b.batsman_id] || 0,
        batNonStrikeId : nonStrike ? (batterIds[nonStrike.batsman_id] || null) : 0,
        ballIsCount : isCount,
        ballType : ballType,
        ballRun: ballRun,
        ballExtraRun : ballExtraRun,
        ballIsBoundry : b.four || b.six ? true : false,
        ballFour : b.four || 0,
        ballSix : b.six || 0,
        ballIsWicket : b.event == "wicket" ? true : false,
        wicketType : b.event == "wicket" ? wicketTypeObj.BOLD : 0,
        ballPlayerId : batterIds[b.batsman_id] || 0,
        ballBowlerId : bowler.commentaryPlayerId,
        overIsMaiden : false,
        nextBatStrikeId : nextBatStrikeId,
        nextBatNonStrikeId : nextBatNonStrikeId,
        currentInnings : commentaryDetails?.currentInnings,
        autoStrikeBallCount : 0,
        commentaryPartnershipId : 0,
        teamScore : b.score != "w" ? b.score : (ov.score || 0),
        teamWicket : null,
        ballFielderId1 :bowler.commentaryPlayerId,
        ballFielderId2 : bowler.commentaryPlayerId,
        wicket : wicket
      }
      ballByBall.push(ball)
    }
    overs.push({
      ...over,
      balls: ballByBall
    })
  }
  return overs;
  // return {
  //   over: {
  //     overId: overend.over,
  //     commentaryId: commentaryDetails.commentaryId,
  //     teamId: teams.bowlingTeam.teamId,
  //     bowlerId: bowler?.commentaryPlayerId || null,
  //     currentInnings: commentaryDetails.currentInnings,
  //     over: overend.over,
  //     ballCount: ballEvents.length,

  //     // ✅ Directly from overend
  //     totalRun: overend.runs,
  //     totalFour: overend.fours,
  //     totalSix: overend.sixes,
  //     totalWideBall: overend.wide_balls,
  //     totalWideRun: overend.wide_runs,
  //     totalNoball: overend.noballs,
  //     totalNoBallRun: overend.noball_runs,
  //     totalByesRun: overend.byes,
  //     totalLegByesRun: overend.legbyes,
  //     totalPanelty: overend.penalty || 0,
  //     totalWicket: overend.wickets,
  //     dotBall: overend.dots,

  //     // ✅ Flags
  //     isComplete: true,
  //     powerplay: overend.powerplay || null,
  //     isOverInPowerplay: !!overend.powerplay,
  //     powerplayType: overend.powerplayType || 1,
  //     isMaiden: overend.runs === 0,
  //     isDelete: null,
  //   },
  //   balls: ballEvents.map(ball => ({
  //     eventId: ball.event_id,
  //     commentaryId: commentaryDetails.commentaryId,
  //     over: ball.over,
  //     ball: ball.ball,
  //     batsmanId: ball.batsman_id,
  //     bowlerId: ball.bowler_id,
  //     runs: ball.run,
  //     batRun: ball.bat_run,
  //     wideRun: ball.wide_run,
  //     noBallRun: ball.noball_run,
  //     byeRun: ball.bye_run,
  //     legByeRun: ball.legbye_run,
  //     commentary: ball.commentary,
  //     text: ball.text,
  //     four: !!ball.four,
  //     six: !!ball.six,
  //     freehit: !!ball.freehit,
  //     wicket: !!ball.wicket,
  //     timestamp: ball.timestamp
  //   }))
  // };
}
const buildPartnershipData = async (data) => {
  let { tpPartnerships, playerTpIdObj, commentaryDetails,teams} = data;
  let partnerships = [];
  tpPartnerships = tpPartnerships.sort((a,b)=> a.order - b.order)
  for (let p of tpPartnerships){
    let batsMan = p.batsmen;
    let batter1 = batsMan[0];
    let batter2 = batsMan[1];
    let totalSix = batsMan.map((b)=> b.sixes || 0).reduce((a,b)=> a+b,0)
    let totalFour = batsMan.map((b)=> b.fours || 0).reduce((a,b)=> a+b,0)
    let totalRuns = batsMan.map((b)=> b.runs || 0).reduce((a,b)=> a+b,0)
    let totalBalls = batsMan.map((b)=> b.balls_faced || 0).reduce((a,b)=> a+b,0)
    let part = {
      commentaryPartnershipId : 0,
      commentaryId : commentaryDetails.commentaryId,
      teamId : teams.battingTeam.teamId,
      batter1Id : playerTpIdObj[batter1.batsman_id] ? playerTpIdObj[batter1.batsman_id].commentaryPlayerId : 0,
      batter1Name : playerTpIdObj[batter1.batsman_id] ? playerTpIdObj[batter1.batsman_id].playerName : "",
      batter2Id : playerTpIdObj[batter2.batsman_id] ? playerTpIdObj[batter2.batsman_id].commentaryPlayerId : 0,
      batter2Name : playerTpIdObj[batter2.batsman_id] ? playerTpIdObj[batter2.batsman_id].playerName : "",
      totalRuns  : totalRuns || 0,
      totalBalls : p.balls_faced || 0,
      totalSix : totalSix || 0,
      totalFour : totalFour || 0,
      extras : 0,
      commentaryBallByBallId : 0,
      currentInnings : commentaryDetails.currentInnings,
      batter1Runs : batter1.runs || 0,
      batter2Runs : batter2.runs || 0,
      batter1Balls : batter1.balls_faced || 0,
      batter2Balls : batter2.balls_faced || 0,
      order : p.order || 0,
      isActive : true
    }
    partnerships.push(part) 
  }

  return partnerships;
}
const buildComPlayers = async(data) =>{
  const {playerTpIdObj , tpPlayers , commentaryDetails} =data;
  let comPlayers = global.tblCommentaryPlayers.filter((i)=>i.commentaryId == commentaryDetails.commentaryId
  && i.currentInnings == commentaryDetails.currentInnings)
  let playersToUpdate = []
  for (let p of comPlayers){
    let batProp = tpPlayers.batsmen.find((i)=>i.batsman_id == p.tpId)
    let bowlProp = tpPlayers.bowler.find((i)=>i.bowler_id ==p.tpId)
    let fielderProp = tpPlayers.fielder.find((i)=>i.fielder_id == p.tpId)
    if(batProp){
      let onStrike = p.position == "striker" ? true : false;
      // let nonStrike = p.position == "non striker" ? true : false;
      let isBatterOut = p.dismissal != "" ? true : false;
      p = {
        ...p,
        isPlay : true,
        onStrike,
        isBatterOut,
        batterOrder 
      }
    }
  }
}
const generateOverEt = (data) => {
  const { commentaryDetails, teams, bowler ,overNumber} = data;
  return {
    overId: 0,
    commentaryId: commentaryDetails.commentaryId,
    teamId: teams.battingTeam.teamId,
    bowlerId: bowler?.commentaryPlayerId,
    currentInnings: commentaryDetails.currentInnings,
    over: parseInt(overNumber) || 0,
    teamScore : teams.battingTeam?.teamScore || 0,
    ballCount: 0,
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
    powerplay: null,
    isOverInPowerplay: false,
    powerplayType: 1,
    isMaiden: false,
    isDelete: null,
  }
}
const generateBallET = (data) => {
  const {
    updateBall,
    commentaryBallByBallId,
    updateBattingTeam,
    updateOver,
    updateBatter,
    updateBowler,
    nonStrikeBatter,
    updatePartnership,
    commentaryDetails
  } = data;

  return {
    commentaryBallByBallId: commentaryBallByBallId || 0,
    commentaryId: commentaryDetails.commentaryId,
    teamId: updateBattingTeam.teamId,
    overId: updateOver.overId,
    // overCount: updateBattingTeam.teamOver || 0,
    overCount : updateBall.overCount ? updateBall.overCount : updateBattingTeam.teamOver || 0,
    // currentOverBalls: updateOver.ballCount || 0,
    currentOverBalls: updateBall?.currentOverBalls  || updateOver.ballCount || 0,
    bowlerId:
        updateBall?.bowlerId ||
        updateBowler?.commentaryPlayerId ||
        0,
    batStrikeId:
        updateBall?.batStrikeId ||
        updateBatter.commentaryPlayerId ||
        0,
    batNonStrikeId:
        updateBall?.batNonStrikeId ||
        nonStrikeBatter?.commentaryPlayerId ||
        0,
    ballIsCount: updateBall?.ballIsCount || false,
    ballType: updateBall?.ballType || BALL_TYPE.OVER_COMPLETE,
    ballIsDot: updateBall?.ballIsDot || false,
    ballRun: updateBall?.ballRun || 0,
    ballExtraRun: updateBall?.ballExtraRun || 0,
    ballIsBoundry: updateBall?.ballIsBoundry || false,
    ballFour: updateBall?.ballFour || 0,
    ballSix: updateBall?.ballSix || 0,
    ballIsWicket: updateBall?.ballIsWicket || false,
    ballWicketType: updateBall?.ballWicketType || 0,
    ballPlayerId:
      updateBall?.batStrikeId ||
      updateBatter.commentaryPlayerId ||
        0,
    ballBowlerId: updateBowler?.commentaryPlayerId || 0,
    ballFielderId1: updateBall?.ballFielderId1 || 0,
    ballFielderId2: updateBall?.ballFielderId2 || 0,
    overIsMaiden: updateBall?.overIsMaiden || false,
    nextBatStrikeId:
      updateBall?.nextBatStrikeId || 0,
    nextBatNonStrikeId:
      updateBall?.nextBatNonStrikeId || 0,
    currentInnings: commentaryDetails.currentInnings,
    autoStrikeBallCount: updateBall?.autoStrikeBallCount || 0,
    commentaryPartnershipId: updatePartnership.commentaryPartnershipId || 0,
    teamScore: updateBattingTeam?.teamScore || 0,
    teamWicket: updateBattingTeam?.teamWicket || 0,
    tpId : updateBall?.tpId || null,
  };
};
module.exports = {
  generateBall,
  generatePartnership,
  generateDisplayStatus,
  generateRemainingRuns,
  getBowlerOnlyRuns,
  generateOver,
  fetchWinnerMessage,
  generateWicket,
  buildOverData,
  buildPartnershipData,
  buildComPlayers,
  genEtPartnership,
  generateOverEt,
  generateBallET
};

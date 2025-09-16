const { BALL_TYPE, playerSwitchObj, wicketTypeObj } = require(".");

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
    return `${team.shortName} needs ${totalRunRemaining + 1} runs from ${totalBallsRemaining} balls.`;
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
module.exports = {
  generateBall,
  generatePartnership,
  generateDisplayStatus,
  generateRemainingRuns,
  getBowlerOnlyRuns,
  generateOver,
  fetchWinnerMessage,
  generateWicket
};

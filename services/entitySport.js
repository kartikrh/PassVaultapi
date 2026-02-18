const { getPlyByIdQuery } = require("../repository/TablePlayer")
const { getTeamsByIds } = require("../repository/TableTeams")
const { getCompetitionByIdsQuery } = require("../repository/TableCompitition")
const { 
  getComEntityQuery, 
  updateVirtualPartnershipQuery, 
  updateCommentaryStatusQuery, 
  scoringTypeCommentaryQuery,
  updateBallByBallFullCommentaryQuery,
} = require("../repository/TableCommentary")
const { getAllTournamentTeamPlayerByIdsQuery } = require("../repository/TableTournamentsTeamPlayers")
const { getMatchDataByCId, syncEntitySportCommentaryService, updateCommentaryPlayersFromEntityService} = require("../services/commentry");
const {
    callClientAPI,
    ServiceType,
    APIEndpointModuleType,
    BALL_TYPE,
    EntityCommentaryStatus,
    wicketTypeObj,
    GAME_STATUS,
    etWicketObj,
    EntityMatchStatus,
    awardTypes,
    ScoringTypes,
    SourceID,
    RefType,
    getInningWiseDataFromEntity,
    checkEntitySportAPIEndpointIsActive,
    callEntitySportAPI,
} = require("../utilities/index");
const { getCountryByIds } = require("../repository/TableCountryCodes")
const { getVenueByIds } = require("../repository/TableVenue")
const { compStatus, commentaryStatus } = require("../utilities")
const { buildOverData, buildPartnershipData, buildComPlayers, genEtPartnership, generateOverEt, generateBallET, generateDisplayStatus, getBowlerOnlyRuns, generateWicket, generateRemainingRuns } = require("../utilities/comFunction")
const { virtualOverQuery, virtualBallByBallQuery, virtualPartnershipQuery, createCommWicketQuery } = require("../repository/TableVirtual")
const { default: fastify } = require("fastify")
const { commentaryLogger, errorLogger } = require("../utilities/logger")
const { playerMarketQuery } = require("../repository/TableEventMarkets")
const { playerBattingHistSummarycalculationService } = require("./playerHistory")
const commentary = require("../routes/admin/commentary")
const { upActivePartQuery } = require("../repository/entitySportCom")
const { assignAwardService } = require("./commentaryAward")
const { insertAutoImportDataQuery, updateAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { insertTeamPlayersByTeamId, insertCommentaryPlayersByTeam } = require("./competition");
const { insertTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers")


const saveTeamsService = async (request , fastify)=>{
    // get the team by id
    // console.log("request.body", request.body)
    let team = await getTeamsByIds(request.body , request,fastify)
    // check in global and store
    for (let t of team){
        let index = global.tblTeams.findIndex((i)=> i.teamId == t.teamId)
        if(index == -1){
            global.tblTeams.push(t)
        }
        else {
            global.tblTeams[index] = t;
        }
    }
    return "Team Updated successfully."
}
const savePlayersService = async (request , fastify)=>{
    // get the team by id
    // console.log("request.body", request.body)

    let ply = await getPlyByIdQuery(request.body , request,fastify)
    // check in global and store
    for (let p of ply){
        let index = global.tblPlayers.findIndex((i)=> i.playerId == p.playerId)
        if(index == -1){
            global.tblPlayers.push(p)
        }
        else {
            global.tblPlayers[index] = p;
        }
    }
    return "Player Updated successfully."
}
const saveCompetitionsService = async (request , fastify) =>{
    let {competitionIds, tournamentTeamPlayers,tournamentTeamPoint} =request.body;
    // console.log("request.body", request.body)

    let comp = await getCompetitionByIdsQuery({
        competitionIds : competitionIds
    },request,fastify)
   
    for (c of comp){
        let index = global.tblCompetitions.findIndex((ca)=>ca.competitionId == c.competitionId);
        if(index == -1){
            global.tblCompetitions.push(c)
        }
        else{
            global.tblCompetitions[index] = c  
        }
    }
    // save tournament teamplayer
    if(tournamentTeamPlayers.length > 0){
        let ply = await getAllTournamentTeamPlayerByIdsQuery({
            tournamentTeamPlayers : tournamentTeamPlayers
        },request,fastify)

        for (let p of ply){
            let index = global.tblTournamentTeamPlayers.findIndex((tp)=> tp.id == p.id);
            if(index == -1){
                global.tblTournamentTeamPlayers.push(p)
            }
            else {
                global.tblTournamentTeamPlayers[index] = p
            }
        }
    }
    return true;
}
const saveCommentariesService = async (request , fastify) =>{
    let { commentaryIds} =request.body;
    // console.log("request.body", request.body)

    let comp = await getComEntityQuery({
        commentaryIds : commentaryIds
    },request,fastify)
   
    if(comp.com?.length > 0){
        for (c of comp.com){
            let index = global.tblCommentaries.findIndex((ca)=>ca.commentaryId == c.commentaryId);
            if(index == -1){
                global.tblCommentaries.push(c)
            }
            else{
                global.tblCommentaries[index] = c  
            }
        }
        for (let ct of comp.comTeams){
            let index = global.tblCommentaryTeams.findIndex((tp)=> tp.commentaryTeamId == ct.commentaryTeamId);
            if(index == -1){
                global.tblCommentaryTeams.push(ct)
            }
            else {
                global.tblCommentaryTeams[index] = ct
            }
        }
        for (let cp of comp.comPlayers){
            let index = global.tblCommentaryPlayers.findIndex((tp)=> tp.commentaryPlayerId == cp.commentaryPlayerId);
            if(index == -1){
                global.tblCommentaryPlayers.push(cp)
            }
            else {
                global.tblCommentaryPlayers[index] = cp
            }
        }
        for (addCommentry of comp.com) {
            if (addCommentry.isActive == true && addCommentry.isTest == false) {
              let cData = await getMatchDataByCId(
                {
                  commentaryId: addCommentry.commentaryId,
                },
                request,
                fastify
              );
              callClientAPI(
                {
                  serviceType: ServiceType.clientAPI,
                  moduleType: APIEndpointModuleType.commentaryUpdate,
                  data: {
                    ...cData,
                    type: cData?.cst == 1 ? "scheduled" 
                        : (cData?.cst === 4 || cData?.cst === 10) ? "completed" : "live"
                  },
                },
                request,
                fastify
              ).catch((err) => {
                console.log("call client api console on entitySport", err);
                errorLogger(
                  fastify,
                  err.message,
                  "ERROR --> services/entitySport.js/saveCommentariesService",
                  request
                );
              });
            }
        }
    }
    else {
        return "No commentaries found to update."
    }
}

const saveCountryCodesService = async (request, fastify) => {
    let countryCodes = await getCountryByIds(request.body, request, fastify)
    for (let cc of countryCodes) {
        let index = global.tblCountryCodes.findIndex((i) => i.id == cc.id)
        if (index == -1) {
            global.tblCountryCodes.push(cc)
        }
        else {
            global.tblCountryCodes[index] = cc;
        }
    }
    return "Country Code Updated successfully."
}

const saveVenueService = async (request, fastify) => {
    let venue = await getVenueByIds(request.body, request, fastify)
    for (let v of venue) {
        let index = global.tblVenues.findIndex((i) => i.id == v.id)
        if (index == -1) {
            global.tblVenues.push(v)
        }
        else {
            global.tblVenues[index] = v;
        }
    }
    return "Venue Updated successfully."
}
const setEntityComService = async (request , fastify) =>{
    let comDetails =global.tblCommentaries.find((c)=> c.commentaryId == request.body.commentaryId)
    if(!comDetails){
        throw new Error("Commentary with this id not found.")
    }
    let tpId = comDetails.tpId;
    if(!tpId){
        throw new Error("This commentary not associated with any tpId.")
    }
    // set batting and bowling team
    // if(comDetails.commentaryStatus == commentaryStatus.OPEN){
    //     // set toss first
    //     let firstInning = request.body.inning1.inning;
    //     let batTeamId = firstInning.batting_team_id;
    //     let bowlTeamId = firstInning.fielding_team_id;
    //     // get in comteam
    //     let batTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == batTeamId && ct.currentInnings == comDetails.currentInnings)
    //     let bowlTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == bowlTeamId && ct.currentInnings == comDetails.currentInnings)
    //     if(!batTeam || !bowlTeam){
    //         throw new Error("Batting or Bowling team not found in commentary teams.")
    //     }
    //     // set in comTeam update
    //     let comTeams = [
    //         {
    //             ...batTeam,
    //             teamStatus : 1,
    //             teamBattingOrder : 1,
    //             subInning : 1
    //         },
    //         {
    //             ...bowlTeam,
    //             teamStatus : 2,
    //             teamBattingOrder :2,
    //             subInning : 2
    //         }
    //     ]
    //     let upComData = {
    //         ...comDetails,
    //         commentaryStatus : commentaryStatus.INPROGRESS,
    //         tossWonBy : batTeam.teamId,
    //         choseTo : 1,
    //         tossRmk : `Toss won by ${batTeam.teamName} and chose to Bat.`,
    //     }
    //     let commentaryId = comDetails.commentaryId;
    //     let updatedData = await fastify.db.query(
    //         `CALL proc_commentary_toss(
    //         $1, $2, $3
    //             )`,
    //         {
    //             bind: [
    //                 comTeams ? JSON.stringify(comTeams) : null,
    //                 upComData ? JSON.stringify(upComData) : null,
    //                 commentaryId,
    //             ],
    //             type: fastify.db.QueryTypes.SELECT,
    //         }
    //     );
    //     updatedData = updatedData[0];
    //     if (upComData) {
    //         let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
    //         global.tblCommentaries[comI] = {
    //             ...global.tblCommentaries[comI],
    //             modifyDate: upComData.modifyDate,
    //             commentaryStatus: upComData.commentaryStatus,
    //             tossWonBy: upComData.tossWonBy,
    //             choseTo: upComData.choseTo,
    //             tossRmk: upComData.tossRmk,
    //         };
    //     }
    //     if(comTeams && comTeams.length > 0){
    //         for (let ct of comTeams){
    //             let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
    //             global.tblCommentaryTeams[comTI] = {
    //                 ...global.tblCommentaryTeams[comTI],
    //                 teamStatus: ct.teamStatus,
    //                 teamBattingOrder: ct.teamBattingOrder,
    //                 subInning: ct.subInning,
    //             };
    //         }
    //     }
    // }
  // }
}

const saveTournamentTeamPlayerService = async (request, fastify) => {
    const { tournamentTeamPlayerIds } = request.body;
    let ply = await getAllTournamentTeamPlayerByIdsQuery({
        tournamentTeamPlayers: tournamentTeamPlayerIds
    }, request, fastify);

    for (let p of ply) {
        let index = global.tblTournamentTeamPlayers.findIndex((tp) => tp.id == p.id);
        if (index == -1) {
            global.tblTournamentTeamPlayers.push(p)
        }
        else {
            global.tblTournamentTeamPlayers[index] = p
        }
    }

    const objectIds = ply.map(obj => obj.id);
    const missingIds = tournamentTeamPlayerIds.filter(id => !objectIds.includes(id));
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => !missingIds.includes(item.id));

    return "Tournament Team Players Data Updated successfully."
}
const setEntityCom2Service = async (request , fastify) =>{
  let matchID = request.body?.response?.match_id
  try {
        const {response} = request.body
    // await new Promise((r) => setTimeout(r, 5000));
    let comDetails = global.tblCommentaries.find((c)=> c.tpId == response?.match_id)
    if(!comDetails){
        // throw new Error("Commentary with this tp id not found.")
        return true;
    }
    if(comDetails.scoringType != 2 || comDetails.scoringType == null ){
      // console.log("scoring not auto")
      return true;
    }
    let tpId = comDetails.tpId;
    if(!tpId){
        // throw new Error("This commentary not associated with any tpId.")
        return true;
    }
    const gameState = response?.match_info?.game_state ?? response?.live?.game_state
    const scoreResponse = {};
    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = comDetails?.commentaryId;
    sendDataForSocketUpdate.eventRefId = comDetails?.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    // check the status
    if(gameState == commentaryStatus.TOSSDONE){
      if(comDetails.commentaryStatus == commentaryStatus.OPEN){
      // set the toss
      const tossInfo = response.match_info.toss;

      // get in comteam
      let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
      if(!team1){
          throw new Error("Team1 not found in commentary teams.")
      }
      let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
      if(!team1 || !team2){
          throw new Error("Batting or Bowling team not found in commentary teams.")
      }
      let comTeams;
      if(tossInfo.decision == 1){
          comTeams = [
              {
                  ...team1,
                  teamStatus : 1,
                  teamBattingOrder : 1,
                  subInning : 1
              },
              {
                  ...team2,
                  teamStatus : 2,
                  teamBattingOrder :2,
                  subInning : 2
              }
          ]
      }
      if(tossInfo.decision == 2){
          comTeams = [
              {
                  ...team1,
                  teamStatus : 2,
                  teamBattingOrder : 2,
                  subInning : 2
              },
              {
                  ...team2,
                  teamStatus : 1,
                  teamBattingOrder :1,
                  subInning : 1
              }
          ]
      }
      let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
      let upComData = {
          ...comDetails,
          commentaryStatus : commentaryStatus.TOSSDONE,
          tossWonBy : team1.teamId,
          choseTo : tossInfo.decision,
          tossRmk : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
          displayStatus : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
      }
      let commentaryId = comDetails.commentaryId;
      // return {
      //     comTeams,
      //     upComData
      // }
          let updatedData = await fastify.db.query(
              `CALL proc_commentary_toss(
              $1, $2, $3
                  )`,
              {
                  bind: [
                      comTeams ? JSON.stringify(comTeams) : null,
                      upComData ? JSON.stringify(upComData) : null,
                      commentaryId,
                  ],
                  type: fastify.db.QueryTypes.SELECT,
              }
          );
          updatedData = updatedData[0];
          if (upComData) {
              let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
              global.tblCommentaries[comI] = {
                  ...global.tblCommentaries[comI],
                  modifyDate: upComData.modifyDate,
                  commentaryStatus: upComData.commentaryStatus,
                  tossWonBy: upComData.tossWonBy,
                  choseTo: upComData.choseTo,
                  tossRmk: upComData.tossRmk,
                  displayStatus: upComData.displayStatus,
              };
              scoreResponse.commentaryDetails = global.tblCommentaries[comI]
              sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryDetails",
                type: "update",
                data: scoreResponse.commentaryDetails,
              });
          }
          if(comTeams && comTeams.length > 0){
            scoreResponse.commentaryTeams = [];
              for (let ct of comTeams){
                  let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
                  global.tblCommentaryTeams[comTI] = {
                      ...global.tblCommentaryTeams[comTI],
                      teamStatus: ct.teamStatus,
                      teamBattingOrder: ct.teamBattingOrder,
                      subInning: ct.subInning,
                  };
                  scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
              }
              scoreResponse.commentaryTeams.forEach(async (team) => {
                const _teamsC1 = global.tblTeams.filter(
                  (item) => item.teamId === team.teamId
                );
                if (_teamsC1.length > 0) {
                  team.image = _teamsC1[0].image;
                  team.jersey = _teamsC1[0].jersey;
                  team.nimage = _teamsC1[0].imagePath;
                  team.njersey = _teamsC1[0].jerseyPath;
                }
              });
              sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryTeams",
                type: "update",
                data: scoreResponse.commentaryTeams.map((team) => ({
                  ...team,
                  crr: parseFloat(team?.crr) || 0,
                  rrr: parseFloat(team?.rrr) || 0,
                })),
              });
          }
          global.clientSocketIo.forEach((socket) => {
            socket.client.emit("updateFullscore", sendDataForSocketUpdate);
          });
        const cData = await getMatchDataByCId(
          {
            commentaryId: comDetails?.commentaryId,
          },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData,
          },
          request,
          fastify
        ).catch((err) => {
          console.log("call client api console in setEntityCom2Service", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/entitysport.js/setEntityCom2Service",
            request
          );
        });
      }
      if(comDetails.commentaryStatus == commentaryStatus.TOSSDONE){
        // check if getting same data from entity
        const tossInfo = response.match_info.toss;
        // get in comteam
        let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
        if(!team1){
            throw new Error("Team1 not found in commentary teams.")
        }
        let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
        if(!team1 || !team2){
            throw new Error("Batting or Bowling team not found in commentary teams.")
        }
        let comWinTeam = comDetails.tossWonBy;
        let choseTo = comDetails.choseTo;
        if(team1.teamId != comWinTeam || choseTo != tossInfo.decision){
          // update toss info again
          await updateToss(request , fastify,comDetails);
          return true;
        }
        return true;

      }
      return true;
    }
    // set the players
    if(gameState == EntityCommentaryStatus.INPROGRESS){
        if(comDetails.commentaryStatus == commentaryStatus.OPEN){
            // set the toss
            const tossInfo = response.match_info.toss;
            // get in comteam
            // console.log("tossInfo", tossInfo)
            let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
            // console.log("team1", team1)
            if(!team1){
                throw new Error("Team1 not found in commentary teams.")
            }
            let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
            if(!team1 || !team2){
                throw new Error("Batting or Bowling team not found in commentary teams.")
            }
            let comTeams;
            if(tossInfo.decision == 1){
                comTeams = [
                    {
                        ...team1,
                        teamStatus : 1,
                        teamBattingOrder : 1,
                        subInning : 1
                    },
                    {
                        ...team2,
                        teamStatus : 2,
                        teamBattingOrder :2,
                        subInning : 2
                    }
                ]
            }
            if(tossInfo.decision == 2){
                comTeams = [
                    {
                        ...team1,
                        teamStatus : 2,
                        teamBattingOrder : 2,
                        subInning : 2
                    },
                    {
                        ...team2,
                        teamStatus : 1,
                        teamBattingOrder :1,
                        subInning : 1
                    }
                ]
            }
            let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
            let upComData = {
                ...comDetails,
                commentaryStatus : commentaryStatus.TOSSDONE,
                tossWonBy : team1.teamId,
                choseTo : tossInfo.decision,
                tossRmk : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
                displayStatus : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
            }
            let commentaryId = comDetails.commentaryId;
            let updatedData = await fastify.db.query(
                `CALL proc_commentary_toss(
                $1, $2, $3
                    )`,
                {
                    bind: [
                        comTeams ? JSON.stringify(comTeams) : null,
                        upComData ? JSON.stringify(upComData) : null,
                        commentaryId,
                    ],
                    type: fastify.db.QueryTypes.SELECT,
                }
            );
            updatedData = updatedData[0];
            if (upComData) {
                let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
                global.tblCommentaries[comI] = {
                    ...global.tblCommentaries[comI],
                    modifyDate: upComData.modifyDate,
                    commentaryStatus: upComData.commentaryStatus,
                    tossWonBy: upComData.tossWonBy,
                    choseTo: upComData.choseTo,
                    tossRmk: upComData.tossRmk,
                    displayStatus: upComData.displayStatus,
                };
                scoreResponse.commentaryDetails = global.tblCommentaries[comI]
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "commentaryDetails",
                  type: "update",
                  data: scoreResponse.commentaryDetails,
                });
            }
            if(comTeams && comTeams.length > 0){
              scoreResponse.commentaryTeams = []
                for (let ct of comTeams){
                    let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
                    global.tblCommentaryTeams[comTI] = {
                        ...global.tblCommentaryTeams[comTI],
                        teamStatus: ct.teamStatus,
                        teamBattingOrder: ct.teamBattingOrder,
                        subInning: ct.subInning,
                    };
                    scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
                  }
                scoreResponse.commentaryTeams.forEach(async (team) => {
                  const _teamsC1 = global.tblTeams.filter(
                    (item) => item.teamId === team.teamId
                  );
                  if (_teamsC1.length > 0) {
                    team.image = _teamsC1[0].image;
                    team.jersey = _teamsC1[0].jersey;
                    team.nimage = _teamsC1[0].imagePath;
                    team.njersey = _teamsC1[0].jerseyPath;
                  }
                });
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "commentaryTeams",
                  type: "update",
                  data: scoreResponse.commentaryTeams.map((team) => ({
                    ...team,
                    crr: parseFloat(team?.crr) || 0,
                    rrr: parseFloat(team?.rrr) || 0,
                  })),
                });
            }
            global.clientSocketIo.forEach((socket) => {
              socket.client.emit("updateFullscore", sendDataForSocketUpdate);
            });
        }
        comDetails = global.tblCommentaries.find((i) => i.commentaryId == comDetails.commentaryId)
        if(comDetails.commentaryStatus == commentaryStatus.TOSSDONE){
            const entityInning = response?.scorecard?.innings || [];
            const bTeam = entityInning.find(inn => inn.number === comDetails.currentInnings);
            // set player
            let batTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings 
            && (i.tpId == response.live?.live_inning?.batting_team_id || i.tpId == bTeam?.batting_team_id))
            if(!batTeam){
                throw new Error("Bat Team not found")
            }
            // set players
            let playerTpIdObj = {};
            let comPlayers = global.tblCommentaryPlayers.filter((cp)=> cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)
            for (let cp of comPlayers){
                playerTpIdObj[cp.tpId] = {
                    ...cp,
                    playerName : cp.playerName,
                    playerId : cp.playerId,
                };
            }
            let tpBatsMan = response.live.batsmen || [];
            let tpBowler = response.live.bowlers || [];
            let bowler;
            let strikePlayer;
            let nonStrikePlayer;
            let comPlayerUpdate = []
            for (let p of tpBatsMan){
                let comP = playerTpIdObj[p.batsman_id]
                let batter = response.scorecard.innings.find((i) => i.number == response.live.live_inning_number).batsmen
                .find((i1) => i1.batsman_id == p.batsman_id)
                let onStrike = batter.position == "striker" ? true : false
                let batterOrder;
                if(onStrike){
                    strikePlayer = comP;
                    batterOrder = 1
                }
                else {
                    nonStrikePlayer = comP;
                    batterOrder = 2
                }
                comPlayerUpdate.push({
                    ...comP,
                    isPlay : true,
                    isBatterOut : false,
                    onStrike,
                    batRun : p.runs,
                    // batBall : p.balls_faced,
                    // batDotBall,
                    // batFour : p.fours,
                    // batSix : p.sixes,
                    // battingOrder
                    batterOrder 
                })
            }
            let ltbOrder = 0
            for (let b of tpBowler){
                ltbOrder = ltbOrder + 1
                let comP = playerTpIdObj[b.bowler_id]
                bowler = comP;

                comPlayerUpdate.push({
                    ...comP,
                    isPlay : true,
                    // bowlerRun : b.runs_conceded,
                    // bowlerTotalBall,
                    // bowlerOver : b.overs,
                    bowlerOrder : ltbOrder
                    // bowlerDotBall,
                    // bowlerFour,
                    // bowlerSix
                })
            }
            // create partnership
            let part = response.live.live_inning?.current_partnership;
            if(!part){
              errorLogger(
                fastify,
                "Current Partnership is not in Data",
                "services/entitySport.js/setEntityCom2Service",
                null,
                request.body
              )
              return true;
            }
            
            // generate over
            const battingTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId 
            && i.currentInnings == comDetails.currentInnings && i.teamStatus ==1)
            const bowlingTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId 
            && i.currentInnings == comDetails.currentInnings && i.teamStatus ==2)
             // create over
            const commentaryOvers = {
                overId: 0,
                commentaryId: comDetails?.commentaryId,
                teamId: battingTeam?.teamId,
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
                currentInnings: comDetails.currentInnings,
                teamScore: 0,
                powerPlayName: null,
                isPowerPlay: false,
            };
            let over = await virtualOverQuery(commentaryOvers, request, fastify);
            // add over to global variable
            global.tblOvers.push(over);
            sendDataForSocketUpdate.dataToUpdate.push({
              module: "entityOvers",
              data: [{ ...over, type: "create" }],
            });
            const commentaryBallByBall = {
                commentaryBallByBallId: 0,
                commentaryId: comDetails?.commentaryId,
                teamId: battingTeam?.teamId,
                overId: over?.overId,
                overCount: "0",
                currentOverBalls: 0,
                bowlerId: bowler?.commentaryPlayerId ?? 0,
                batStrikeId: strikePlayer?.commentaryPlayerId ?? 0,
                batNonStrikeId: nonStrikePlayer?.commentaryPlayerId ?? 0,
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
                nextBatStrikeId:  strikePlayer?.commentaryPlayerId,
                nextBatNonStrikeId: nonStrikePlayer?.commentaryPlayerId,
                currentInnings: comDetails.currentInnings
            };
            const ball = await virtualBallByBallQuery(
                commentaryBallByBall,
                request,
                fastify
            );
            // add ball to global variable
            global.tblCommentaryBallByBall.push(ball);
            sendDataForSocketUpdate.dataToUpdate.push({
              module: "entityBallByBalls",
              data: [{ ...ball, type: "create" }],
            });
          // let batters = part?.batsmen?.map((i)=>i.batsman_id)
          let batters = part?.batsmen?.map(i => i.batsman_id) || [];
          let partnership
          if (batters?.length > 0) {
            let [b1, b2] = batters;
            let partExist = global.tblCommentaryPartnership.find((i) =>
              i.commentaryId == comDetails.commentaryId &&
              i.currentInnings == comDetails.currentInnings &&
              (
                (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
                (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId) // order doesn’t matter
              )
            );
            if (partExist) {
              let comPlayerId1 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter1Id)
              let comPlayerId2 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter2Id)
              let cp1 = part.batsmen.find((i) => i.batsman_id == comPlayerId1.tpId)
              let cp2 = part.batsmen.find((i) => i.batsman_id == comPlayerId2.tpId)
              partnership = {
                ...partExist,
                totalRuns: part.runs,
                totalBalls: part.balls,
                batter1Runs: cp1.runs,
                batter2Runs: cp2.runs,
                batter1Balls: cp1.balls,
                batter2Balls: cp2.balls,
                // totalFour,
                // totalSix
              }
              let par = await updateVirtualPartnershipQuery(partnership, fastify, null)
              let pI = global.tblCommentaryPartnership.findIndex((i) => i.commentaryPartnershipId == partnership.commentaryPartnershipId)
              global.tblCommentaryPartnership[pI] = par[0];
              partnership.type = "update"
            } else {
              let cp1 = playerTpIdObj[part.batsmen[0].batsman_id]
              let cp2 = playerTpIdObj[part.batsmen[1].batsman_id]
              partnership = genEtPartnership({
                currentPartnership: {
                  commentaryBallByBallId: ball?.commentaryBallByBallId,
                  batter1Id: cp1.commentaryPlayerId,
                  batter1Name: cp1.playerName,
                  batter2Id: cp2.commentaryPlayerId,
                  batter2Name: cp2.playerName,
                  totalRuns: part.runs,
                  totalBalls: part.balls,
                  // totalSix ,
                  // totalFour,
                  batter1Runs: part.batsmen[0].runs,
                  batter2Runs: part.batsmen[1].runs,
                  batter1Balls: part.batsmen[0].balls,
                  batter2Balls: part.batsmen[1].balls,
                  order: response.live.live_inning.equations.wickets + 1,
                  isActive: true
                },
                commentaryDetails: comDetails,
                updateBattingTeam: batTeam
              })
              const createPart = await virtualPartnershipQuery(
                partnership,
                request,
                fastify
              );
              global.tblCommentaryPartnership.push(createPart);
              partnership = {
                ...createPart,
                type: "create"
              }
            }
          }
            let result1 =  {
                over,
                ball,
                partnership,
                comPlayerUpdate
            }
            let upCom = {
              ...comDetails,
              commentaryStatus: commentaryStatus.INPROGRESS,
              displayStatus:  response.live.status_note
            }
            let res = await syncEntitySportCommentaryService({
                commentaryId : comDetails.commentaryId,
                commentaryDetails : upCom,
                commentaryPlayers : comPlayerUpdate,
                commentaryPartnership: partnership ? [partnership] : []
            },fastify)
            global.clientSocketIo.forEach((socket) => {
              socket.client.emit("updateFullscore", sendDataForSocketUpdate);
            });
            // return res;
            // handle commentaries arr
            // if(response.live.commentaries.length > 0){
            //     let result2 = await handleComArr(request.body , request,fastify , comDetails)
            //     return {result2,result1};
            // }
        }   
        comDetails = global.tblCommentaries.find((i) => i.commentaryId == comDetails.commentaryId)
        // if(comDetails.commentaryStatus == commentaryStatus.INPROGRESS || comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
        //   if(!response.live.commentaries || response.live.commentaries.length == 0){
        //     return true;
        //   }
        //   comDetails.isClientShow = true;
        //   const bat = await checkBattingTeamService(response, comDetails);
        //   if (bat) {
        //     let res = await handleComArr(request.body, request,fastify,comDetails)
        //     return res;
        //   } else {
        //     await onInningChangeService(request.body, fastify, comDetails);
        //     let res = await handleComArr(request.body, request,fastify,comDetails)
        //     return res;
        //   }
        // }
        if(comDetails.commentaryStatus == commentaryStatus.INPROGRESS){
          comDetails.isClientShow = true;
          let res = await handleComArr(request.body, request,fastify,comDetails)
          return res;
        }
        if(comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
          comDetails.isClientShow = false;
          const bat = await checkBattingTeamService(response, comDetails);
          if (bat) {
            if(!response.live.commentaries || response.live.commentaries.length == 0){
              return true;
            }
            let res = await handleComArr(request.body, request,fastify,comDetails)
            await inningChangeStateService(fastify, comDetails);
            return res;
          } else {
            comDetails.isClientShow = true;
            await onInningChangeService(request.body, fastify, comDetails);
            // await inningChangeStateService(fastify, comDetails);
            let res = await handleComArr(request.body, request,fastify,comDetails)
            return res;
          }
        }
    }

    if (gameState == EntityCommentaryStatus.INNINGCHANGE) {
      // if (comDetails.commentaryStatus != commentaryStatus.INNINGCHANGE) {
        comDetails.isClientShow = false;
        await handleComArr(request.body, request, fastify, comDetails)
        await inningChangeStateService(fastify, comDetails);
        return true;
      // }
    }    
    // if (gameState == EntityCommentaryStatus.INNINGCHANGE) {
    //   // if (comDetails.commentaryStatus != commentaryStatus.INNINGCHANGE) {
    //     comDetails.isClientShow = false;
    //     await handleComArr(request.body, request, fastify, comDetails)
    //     await inningChangeStateService(fastify, comDetails);
    //     return true;
    //   // }
    // }
    const entityStatus = response?.match_info?.status
    if (gameState == EntityCommentaryStatus.DEFAULT && entityStatus != EntityMatchStatus.SCHEDULED &&
      comDetails.commentaryStatus != commentaryStatus.COMPLETED) {
      await matchCompleteService(request.body, fastify, comDetails)
    }

    const ALLOWED_GAME_STATES = [
      GAME_STATUS["Default"],
      GAME_STATUS["Toss"],
      GAME_STATUS["Play Ongoing"]
    ];
    let currentState
    const currentGameState = gameState;
    if (typeof currentGameState === "number") {
      currentState = Number(currentGameState);
    }
    if (!ALLOWED_GAME_STATES.includes(currentState) && typeof currentState === "number" && !isNaN(currentState)) {
      const commDisplayStatus = Object.keys(GAME_STATUS).find(
        key => GAME_STATUS[key] == currentState
      );
      await updateCommentaryStatusQuery(
        {
          displayStatus: commDisplayStatus,
          commentaryId: comDetails?.commentaryId
        },
        fastify,
        request
      );
    
      const index = global.tblCommentaries.findIndex(
        item => item.commentaryId == comDetails?.commentaryId
      );
    
      if (index !== -1) {
        global.tblCommentaries[index].displayStatus = commDisplayStatus;
      }
      scoreResponse.commentaryDetails = global.tblCommentaries[index]
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: scoreResponse.commentaryDetails,
      });
      const cData = await getMatchDataByCId(
        {
          commentaryId: comDetails?.commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
        },
        request,
        fastify
      ).catch((err) => {
        console.log("call client api in setEntityCom2Service - 2", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/entitysport.js/serEntityCom2Service",
          request
        );
      });
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }

    if (comDetails.commentaryStatus == commentaryStatus.COMPLETED && entityStatus == EntityMatchStatus.COMPLETED) {
      if (response?.man_of_the_match?.pid) {
        const awardData = global.tblAwards.find(aw => aw.id === awardTypes.MAN_OF_THE_MATCH);
        const playerData = global.tblPlayers.find(p => p.tpId === response?.man_of_the_match?.pid);
        if (awardData && playerData) {
          await assignAwardService({
            ...request,
            body: {
              comAwards: [
                {
                  awardId: awardData.id,
                  awardName: awardData.name,
                  commentaryId: comDetails.commentaryId,
                  playerId: playerData.playerId,
                  playerName: playerData.playerName
                }
              ]
            },
            userTokenInfo: { WrUserId: -2 }
          }, fastify);
        } else {
          errorLogger(
            fastify,
            `Failed to update player of the match for commentary id: ${comDetails.commentaryId}`,
            "Error --> services/entitySport.js/setEntityCom2servie - playerOfTheMatch",
            null,
            {
              commentary: comDetails,
              entityCommentaryStatus: entityStatus,
              response: request?.body,
              awardType: awardTypes.MAN_OF_THE_MATCH,
              playerId: response?.man_of_the_match?.pid
            }
          )
        }
      }
    }

    return true;
  } catch (error) {
    console.log("error", error);
    errorLogger(
      fastify,
      `${error.message}-${matchID}`,
      // error.message,
      "Error --> services/entitySport.js/setEntityCom2servie",
      null,
      request.body
    )
    return true;
  }
}

const checkBattingTeamService = async (response, comDetails) => {
  const batTeamId = global.tblCommentaryTeams.find((i) => i.commentaryId == comDetails.commentaryId &&
    i.currentInnings == comDetails.currentInnings && i.teamStatus == 1)?.tpId;
  const liveBattingTeamId = response?.live?.live_inning?.batting_team_id ?? null;
  if (!batTeamId || !liveBattingTeamId) return false;
  return batTeamId == liveBattingTeamId
}

const updateToss = async (request , fastify,comDetails = null) =>{
    const {response} = request.body;
    const scoreResponse = {};
    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = comDetails?.commentaryId;
    sendDataForSocketUpdate.eventRefId = comDetails?.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    let matchID = request.body?.response?.match_id
    const tossInfo = response.match_info.toss;
    // get in comteam
    let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
    if(!team1){
      throw new Error("Team1 not found in commentary teams.,updateToss")
    }
    let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
    if(!team1 || !team2){
      throw new Error("Batting or Bowling team not found in commentary teams.,updateToss")
    }
    let comTeams;
    if(tossInfo.decision == 1){
    comTeams = [
        {
            ...team1,
            teamStatus : 1,
            teamBattingOrder : 1,
            subInning : 1
        },
        {
            ...team2,
            teamStatus : 2,
            teamBattingOrder :2,
            subInning : 2
        }
    ]
    }
    if(tossInfo.decision == 2){
    comTeams = [
        {
            ...team1,
            teamStatus : 2,
            teamBattingOrder : 2,
            subInning : 2
        },
        {
            ...team2,
            teamStatus : 1,
            teamBattingOrder :1,
            subInning : 1
        }
    ]
    }
    let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
    let upComData = {
    ...comDetails,
    commentaryStatus : commentaryStatus.TOSSDONE,
    tossWonBy : team1.teamId,
    choseTo : tossInfo.decision,
    tossRmk : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
    displayStatus : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
    }
    let commentaryId = comDetails.commentaryId;
    // return {
    //     comTeams,
    //     upComData
    // }
    let updatedData = await fastify.db.query(
        `CALL proc_commentary_toss(
        $1, $2, $3
            )`,
        {
            bind: [
                comTeams ? JSON.stringify(comTeams) : null,
                upComData ? JSON.stringify(upComData) : null,
                commentaryId,
            ],
            type: fastify.db.QueryTypes.SELECT,
        }
    );
    updatedData = updatedData[0];
    if (upComData) {
        let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
        global.tblCommentaries[comI] = {
            ...global.tblCommentaries[comI],
            modifyDate: upComData.modifyDate,
            commentaryStatus: upComData.commentaryStatus,
            tossWonBy: upComData.tossWonBy,
            choseTo: upComData.choseTo,
            tossRmk: upComData.tossRmk,
            displayStatus: upComData.displayStatus,
        };
        scoreResponse.commentaryDetails = global.tblCommentaries[comI]
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryDetails",
          type: "update",
          data: scoreResponse.commentaryDetails,
        });
    }
    if(comTeams && comTeams.length > 0){
      scoreResponse.commentaryTeams = [];
        for (let ct of comTeams){
            let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
            global.tblCommentaryTeams[comTI] = {
                ...global.tblCommentaryTeams[comTI],
                teamStatus: ct.teamStatus,
                teamBattingOrder: ct.teamBattingOrder,
                subInning: ct.subInning,
            };
            scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
        }
        scoreResponse.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryTeams",
          type: "update",
          data: scoreResponse.commentaryTeams.map((team) => ({
            ...team,
            crr: parseFloat(team?.crr) || 0,
            rrr: parseFloat(team?.rrr) || 0,
          })),
        });
    }
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
    return true;
  }
const handleComArr = async (data , request , fastify , comDetails) =>{
    const {response} = data;
    const commentaries = response.live.commentaries;
    const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
    i.currentInnings == comDetails.currentInnings)  
    let battingTeam = teams.find((i) => i.teamStatus ==1)
    let bowlingTeam = teams.find((i)=> i.teamStatus == 2)
    let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
    let part = response.live?.live_inning?.current_partnership;
    let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
    let isChangeStrike = false;
    const prtship = [];
    const fullCommentaries = [];
    let live_score_data = response?.live?.live_score;
    let liveTeamScore = response?.live?.live_score?.runs;
    if (commentaries?.length > 0) {
      let res =await handleStoreBall({
          response,
          battingTeam,
          // matchType
      }, fastify, comDetails, request)
    }
    // store ballbyball
    let playerTpIdObj = {};
    let comPlayers = global.tblCommentaryPlayers.filter((cp)=> cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)

    for (let cp of comPlayers){
        playerTpIdObj[cp.tpId] = {
            ...cp,
            playerName : cp.playerName,
            playerId : cp.playerId,
        };
    }
    let partnership = {}
    let ballbyball = [];
    let upPlayers =[];
    let upOvers = [];
    let upTeams = [];
    const playersMap = {}; // key: commentaryPlayerId
    let ltSetOrder = 0;
    // Find the current max batter order from global data
    let currentPlayers = []
    const existingBatters = global.tblCommentaryPlayers.filter(i =>
      i.commentaryId === comDetails.commentaryId &&
      i.currentInnings === comDetails.currentInnings &&
      i.teamId === battingTeam.teamId &&
      i.batterOrder != null
    ) || []

    ltSetOrder = existingBatters.length
      ? Math.max(...existingBatters?.map(i => i.batterOrder))
      : 0;
    if (response.live?.batsmen && response.live?.batsmen.length > 0) {
      for (let p of response.live?.batsmen) {
        if (!playerTpIdObj[p.batsman_id]) {
          request.body.response = response; 
          await updateCommentaryPlayersFromEntityService(request, fastify);
          let latestPlayers = global.tblCommentaryPlayers.filter(
            (cp) =>
              cp.commentaryId == comDetails.commentaryId &&
              cp.currentInnings == comDetails.currentInnings
          );

          for (let cp of latestPlayers) {
            if (!playerTpIdObj[cp.tpId]) {
              playerTpIdObj[cp.tpId] = {
                ...cp,
                playerName: cp.playerName,
                playerId: cp.playerId,
              };
            }
          }
        }
        let comP = playerTpIdObj[p.batsman_id];
        let batterData = response?.scorecard?.innings
          ?.find(i => i?.number === response?.live?.live_inning_number)?.batsmen
          ?.find(i1 => i1?.batsman_id == p?.batsman_id && i1?.batting == "true");
        let onStrikeData = batterData?.position === "striker";
        let isPlayData = true
        if (comP) {
          let batterOrder = comP.batterOrder;

          if (batterOrder == null) {
            ltSetOrder += 1;
            batterOrder = ltSetOrder;
          }

          if(comP?.isBatterOut == true) {
            isPlayData = null;
            onStrikeData = null; // or false
          }

          playersMap[p.batsman_id] = {
            ...comP,
            isPlay: isPlayData,
            onStrike: onStrikeData,
            batRun: p.runs,
            batBall: p.balls_faced,
            batFour: p.fours,
            batSix: p.sixes,
            batterOrder,
            batsmanStrikeRate: parseFloat(p.strike_rate) ?? "0",
            isInPlayingEleven: true,
          };
          currentPlayers.push(comP.commentaryPlayerId);
        }
      }
    }
    if (response.live?.bowlers && response.live?.bowlers.length >0) {
      for (let p of response.live?.bowlers) {
        if (!playerTpIdObj[p.bowler_id]) {
          request.body.response = response; 
          await updateCommentaryPlayersFromEntityService(request, fastify);
          let latestPlayers = global.tblCommentaryPlayers.filter(
            (cp) =>
              cp.commentaryId == comDetails.commentaryId &&
              cp.currentInnings == comDetails.currentInnings
          );

          for (let cp of latestPlayers) {
            if (!playerTpIdObj[cp.tpId]) {
              playerTpIdObj[cp.tpId] = {
                ...cp,
                playerName: cp.playerName,
                playerId: cp.playerId,
              };
            }
          }
        }
      }
    }
    let ltSetBowlerOrder = 0;
    // find the latest bowler order already stored for this innings/team
    const existingBowlers = global.tblCommentaryPlayers.filter(i =>
      i.commentaryId === comDetails.commentaryId &&
      i.currentInnings === comDetails.currentInnings &&
      i.teamId === bowlingTeam?.teamId &&
      i.bowlerOrder != null
    ) ||[]

    ltSetBowlerOrder = existingBowlers.length
      ? Math.max(...existingBowlers?.map(i => i.bowlerOrder))
      : 0;
    let inningNo = response?.live?.live_inning_number
    if(response.scorecard && response.scorecard?.innings?.length > 0){
      let cInning = response.scorecard.innings.find((i) => i.number == inningNo)
      let bowlers = cInning.bowlers;
      let currentBowler  = bowlers.filter((i)=> i.bowling == "true").map((i)=>parseInt(i.bowler_id))
      let lb = response.live.bowlers?.map((i)=>parseInt(i.bowler_id)) || []
      let ttlBowler = [...new Set([...currentBowler, ...lb])];
      // for (let b of currentBowler){
      //   let comP = playerTpIdObj[b.bowler_id];
      //   if(comP){
      //     let bowlerOrder = comP.bowlerOrder;
      //     if (bowlerOrder == null) {
      //       ltSetBowlerOrder += 1;
      //       bowlerOrder = ltSetBowlerOrder;
      //     }
      //     playersMap[b.bowler_id] = {
      //       ...comP,
      //       isPlay: true,
      //       onStrike: false,
      //       bowlerOver: b.overs,
      //       bowlerRun: b.runs_conceded,
      //       bowlerTotalWicket: b.wickets,
      //       bowlerEconomy: parseFloat(b.econ) ?? "0",
      //       bowlerOrder,
      //       bowlerMaidenOver: b?.maidens ?? 0,
      //       bowlerWideBall : b.wides,
      //       bowlerNoBall : b.noballs,
      //       bowlerDotBall : b.run0,
      //       isInPlayingEleven: true
      //     };
      //     currentPlayers.push(comP.commentaryPlayerId);
      //   }
        
      // }
      for(let b of ttlBowler){
        let comP = playerTpIdObj[b];
        let bowlerOrder;
        if(comP){
          bowlerOrder = comP.bowlerOrder;
          if(bowlerOrder == null){
            ltSetBowlerOrder += 1;
            bowlerOrder = ltSetBowlerOrder;
          }
        }
        let tpBowler = bowlers.find((i)=>i.bowler_id == b);
        playersMap[b] = {
          ...comP,
          isPlay : tpBowler.bowling == "true" ? true : null,
          onStrike : false,
          bowlerOver: tpBowler.overs,
          bowlerRun: tpBowler.runs_conceded,
          bowlerTotalWicket: tpBowler.wickets,
          bowlerEconomy: parseFloat(tpBowler.econ) ?? "0",
          bowlerOrder,
          bowlerMaidenOver: tpBowler?.maidens ?? 0,
          bowlerWideBall : tpBowler.wides,
          bowlerNoBall : tpBowler.noballs,
          bowlerDotBall : tpBowler.run0,
          isInPlayingEleven: true
        }
        currentPlayers.push(comP.commentaryPlayerId)
        // console.log(playersMap[b])
      }
    }
    // find nonplaying player and set isPlay null
    let nonPlayingPlayers = comPlayers.filter((i)=> i.isPlay == true && !currentPlayers.includes(i.commentaryPlayerId));
    for (let npp of nonPlayingPlayers){
      playersMap[npp.tpId] = {
        ...npp,
        isPlay : null,
      }
    }

   
    const oversMap = {}; // key: `${teamId}_${overNumber}`
    const ballByBall = [];
    const batsmanDotMap = {}; // key: batsman_id, value: dot balls
    const bowlerDotMap = {};  // key: bowler_id, value: dot balls
    const wickets = []; // optional: cache to avoid re-checking db

    let upComDetails = {};
    if (inningNo == 1) {
      upComDetails.rmk = ""
    } else {
      upComDetails.rmk = response.live.status_note;
    }
    upComDetails.commentaryStatus = commentaryStatus.INPROGRESS;
    if(commentaries?.length > 0){
      if(comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
        upComDetails.commentaryStatus = commentaryStatus.INPROGRESS
      }
      
      let extraRuns = response?.scorecard?.innings.find((i) => i.number == inningNo)?.extra_runs;
      // get last 5 elem of update
      // let storeBall = commentaries.filter((i)=> i.event == "ball" && i.score != "w")
      // let res =await handleStoreBall({
      //   response,
      //   battingTeam
      // },fastify,comDetails, request)
      // return res;

      for (let c of commentaries){
        let updateBall = {}
        let ball = 1;
        
        let tpId = c.event_id;
        let event = c.event;

        // Batting team extra runs
        battingTeam.teamWideRuns = extraRuns?.wides ?? 0;
        battingTeam.teamByRuns = extraRuns?.byes ?? 0;
        battingTeam.teamLegByRuns = extraRuns?.legbyes ?? 0;
        battingTeam.teamNoBallRuns = extraRuns?.noballs ?? 0;
        battingTeam.teamPenaltyRuns = Number(extraRuns?.penalty) ?? 0;

        const ballByBall = global.tblCommentaryBallByBall.find(item => 
          item.tpId == c.event_id && item.commentaryId == comDetails.commentaryId
        );
        if (ballByBall && 
          ballByBall.commentary?.toLowerCase().trim() !==
          c?.commentary?.toLowerCase().trim() &&
          c?.text?.trim().length > 0
        ) {
          const fullComm = {
            commentaryId: comDetails.commentaryId,
            tpId: c.event_id,
            commentary: c.commentary,
            commentaryBallByBallId: ballByBall.commentaryBallByBallId
          }
          fullCommentaries.push(fullComm);
        }

        if(String(c.score) == "w" ){
          event = "wicket"
        }
        if(event == "ball"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
          if(index != -1) continue; // skip already processed ball
          const overNumber = Number(c.over);
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
          let run = c.run || 0;
          let isBoundary = c.run == 4 || c.run ==6 ? true : false
          let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          let bowlerPId = playerTpIdObj[c.bowler_id]?.commentaryPlayerId
          let nonStrike = response.live.batsmen.find((i)=> i.batsman_id != c.batsman_id).batsman_id
          let nonStrikePId = playerTpIdObj[nonStrike]?.commentaryPlayerId;
          if(index == -1){
            let isWide = false;
            if(!playersMap[c.batsman_id]){
              playersMap[c.batsman_id] = {
                ...playerTpIdObj[c.batsman_id],
              }
            }
            if(!playersMap[c.bowler_id]){
              playersMap[c.bowler_id] = {
                ...playerTpIdObj[c.bowler_id],
              }
            }

            if (c.score && String(c.score).includes('wd')) {
              // it's a wide ball
              isWide = true;
              const runToUpdate = Number(c?.bat_run) ?? 0;
              const wideRun = Number(c?.wide_run) ?? 0;
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if (over) {
                  over.type = "update";
                }
                if(!over){
                  // generate new over
                  let newOver = generateOverEt({
                          commentaryDetails :comDetails,
                          teams: {
                              battingTeam: battingTeam,
                              bowlingTeam,
                          },
                          bowler: playerTpIdObj[c.bowler_id],
                          overNumber : c.over,
                  })
                  over = await virtualOverQuery(newOver, request, fastify);
                  // add over to global variable
                  global.tblOvers.push(over);
                  over.type = "create";
                  const commentaryBallByBall = {
                      commentaryBallByBallId: 0,
                      commentaryId: comDetails?.commentaryId,
                      teamId: battingTeam.teamId,
                      overId: over?.overId,
                      overCount: `${c.over}.0`,
                      currentOverBalls: 0,
                      bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                      batNonStrikeId: nonStrike.commentaryPlayerId,
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
                      ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      ballFielderId1: 0,
                      devOver: null,
                      devCurrentOverBall: null,
                      ballFielderId2: 0,
                      overIsMaiden: false,
                      nextBatStrikeId: strikePId,
                      nextBatNonStrikeId: nonStrikePId,
                      currentInnings: comDetails.currentInnings,
                      commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                      teamScore: battingTeam?.teamScore || 0,
                      teamWicket: battingTeam?.teamWicket || 0,
                      // tpId : c.event_id
                  };
                  const oball = await virtualBallByBallQuery(
                      commentaryBallByBall,
                      request,
                      fastify
                  );
                  // add ball to global variable
                  global.tblCommentaryBallByBall.push(oball);
                  oball.type = "create";
                  ballbyball.push(oball)
                }
                oversMap[overKey] = over; // store reference
              }
              updateBall = {
                ballIsCount : false,
                ballType : BALL_TYPE.WIDE,
                ballRun : runToUpdate,
                batStrikeId : playerTpIdObj[c.batsman_id].commentaryPlayerId,
                batNonStrikeId : nonStrikePId,
                teamId : battingTeam.teamId,
                overId : over.overId,
                nextBatStrikeId : strikePId,
                nextBatNonStrikeId : nonStrikePId,
                ballExtraRun : wideRun,
                tpId : c.event_id,
                commentary: c?.commentary,
              }

              battingTeam["teamScore"] = liveTeamScore;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
              battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;

              // over.ballCount += 1;
              over.totalRun += c.run;
              over.teamScore = `${liveTeamScore || 0}/${battingTeam?.teamWicket || 0}`;
              // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              over.totalWideBall += 1;
              over.totalWideRun += Number(c?.wide_run) ?? 0;
              over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
              updateBall.overCount = battingTeam.teamOver;
              updateBall.currentOverBalls = over.ballCount;
              if(!playersMap[c.bowler_id]){
                playersMap[c.bowler_id] = {
                  ...playerTpIdObj[c.bowler_id],
                }
              }
              // playersMap[c.bowler_id].bowlerWideBall = (playersMap[c.bowler_id].bowlerWideBall || 0) + 1;
              playersMap[c.bowler_id].bowlerWideBallRun = (playersMap[c.bowler_id].bowlerWideBallRun || 0) + wideRun;
              updateBall.bowlerId = playersMap[c.bowler_id].commentaryPlayerId;
            } else if (c.score && String(c.score).includes('nb')) {
              const runToUpdate = Number(c?.bat_run) ?? 0;
              const noBallRun = Number(c?.noball_run) ?? 0;
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if (over) {
                  over.type = "update";
                }
                if(!over){
                  // generate new over
                  let newOver = generateOverEt({
                          commentaryDetails :comDetails,
                          teams: {
                              battingTeam: battingTeam,
                              bowlingTeam,
                          },
                          bowler: playerTpIdObj[c.bowler_id],
                          overNumber : c.over,
                  })
                  over = await virtualOverQuery(newOver, request, fastify);
                  // add over to global variable
                  global.tblOvers.push(over);
                  over.type = "create";
                  const commentaryBallByBall = {
                      commentaryBallByBallId: 0,
                      commentaryId: comDetails?.commentaryId,
                      teamId: battingTeam.teamId,
                      overId: over?.overId,
                      overCount: `${c.over}.0`,
                      currentOverBalls: 0,
                      bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                      batNonStrikeId: nonStrike.commentaryPlayerId,
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
                      ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      ballFielderId1: 0,
                      devOver: null,
                      devCurrentOverBall: null,
                      ballFielderId2: 0,
                      overIsMaiden: false,
                      nextBatStrikeId: strikePId,
                      nextBatNonStrikeId: nonStrikePId,
                      currentInnings: comDetails.currentInnings,
                      commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                      teamScore: battingTeam?.teamScore || 0,
                      teamWicket: battingTeam?.teamWicket || 0,
                  };
                  const oball = await virtualBallByBallQuery(
                      commentaryBallByBall,
                      request,
                      fastify
                  );
                  global.tblCommentaryBallByBall.push(oball);
                  oball.type = "create";
                  ballbyball.push(oball)
                }
                oversMap[overKey] = over;
              }
              updateBall = {
                ballIsCount: false,
                ballType: BALL_TYPE.NO_BALL,
                ballRun: runToUpdate,
                batStrikeId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
                batNonStrikeId: nonStrikePId,
                teamId: battingTeam.teamId,
                overId: over.overId,
                nextBatStrikeId: strikePId,
                nextBatNonStrikeId: nonStrikePId,
                ballExtraRun: noBallRun,
                tpId: c.event_id,
                commentary: c?.commentary,
              }

              battingTeam["teamScore"] = liveTeamScore;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
              battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
              over.totalRun += c.run;
              over.teamScore = `${liveTeamScore || 0}/${battingTeam?.teamWicket || 0}`;
              // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              over.totalNoball += 1;
              over.totalNoBallRun += Number(c?.noball_run) ?? 0;
              over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
              updateBall.overCount = battingTeam.teamOver;
              updateBall.currentOverBalls = c.ball;
              if(!playersMap[c.bowler_id]){
                playersMap[c.bowler_id] = {
                  ...playerTpIdObj[c.bowler_id],
                }
              }
              // playersMap[c.bowler_id].bowlerNoBall = (playersMap[c.bowler_id].bowlerNoBall || 0) + 1;
              playersMap[c.bowler_id].bowlerNoBallRun = (playersMap[c.bowler_id].bowlerNoBallRun || 0) + noBallRun;
              // playersMap[c.bowler_id].bowlerRun = (playersMap[c.bowler_id].bowlerRun || 0) + runToUpdate;
              updateBall.bowlerId = playersMap[c.bowler_id].commentaryPlayerId;
            }
            else {
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if (over) {
                  over.type = "update";
                }
                if(!over){
                    // generate new over
                    let newOver = generateOverEt({
                            commentaryDetails :comDetails,
                            teams: {
                                battingTeam: battingTeam,
                                bowlingTeam,
                            },
                            bowler: playerTpIdObj[c.bowler_id],
                            overNumber : c.over,
                    })
                    over = await virtualOverQuery(newOver, request, fastify);
                    // add over to global variable
                    global.tblOvers.push(over);
                    over.type = "create";
                    const commentaryBallByBall = {
                        commentaryBallByBallId: 0,
                        commentaryId: comDetails?.commentaryId,
                        teamId: battingTeam.teamId,
                        overId: over?.overId,
                        overCount: `${c.over}.0`,
                        currentOverBalls: 0,
                        bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                        batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                        batNonStrikeId: nonStrike.commentaryPlayerId,
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
                        ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                        ballFielderId1: 0,
                        devOver: null,
                        devCurrentOverBall: null,
                        ballFielderId2: 0,
                        overIsMaiden: false,
                        nextBatStrikeId: strikePId,
                        nextBatNonStrikeId: nonStrikePId,
                        currentInnings: comDetails.currentInnings,
                        commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                        teamScore: battingTeam?.teamScore || 0,
                        teamWicket: battingTeam?.teamWicket || 0,
                        tpId : null
                    };
                    const oball = await virtualBallByBallQuery(
                        commentaryBallByBall,
                        request,
                        fastify
                    );
                    // add ball to global variable
                    global.tblCommentaryBallByBall.push(oball);
                    oball.type = "create";
                    ballbyball.push(oball)

                }
                oversMap[overKey] = over; // store reference
              }
              let ball_Type = BALL_TYPE.REGULAR;
              if (Number(c?.legbye_run) > 0) {
                ball_Type = BALL_TYPE.LEG_BYE;
              } else if (Number(c?.bye_run) > 0) {
                ball_Type = BALL_TYPE.BYE;
              }
              updateBall = {
                  ballIsCount : true,
                  ballType : ball_Type,
                  ballRun : c.run,
                  batStrikeId : playerTpIdObj[c.batsman_id].commentaryPlayerId,
                  batNonStrikeId : nonStrikePId,
                  teamId : battingTeam.teamId,
                  overId : over.overId,
                  nextBatStrikeId : strikePId,
                  nextBatNonStrikeId : nonStrikePId,
                  tpId : c.event_id,
                  commentary: c?.commentary,
              }
              // battingTeam["teamScore"] = (battingTeam.teamScore || 0) + run;
              battingTeam["teamScore"] = liveTeamScore;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
              battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
              // battingTeam.teamLegByRuns =( battingTeam.teamLegByRuns || 0) + parseInt(c.legbye_run)
              // battingTeam.teamNoBallRuns =( battingTeam.teamNoBallRuns || 0) + parseInt(c.noball_run)
              // battingTeam.teamByRuns =( battingTeam.teamByRuns || 0) + parseInt(c.bye_run)

              over.ballCount = c.ball;
              over.totalRun += c.run;
              over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
              // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
              if (ball_Type == BALL_TYPE.LEG_BYE) {
                over.totalLegByesRun += Number(c.legbye_run) ?? 0;
                playersMap[c.bowler_id].bowlerLegByeBall = (playersMap[c.bowler_id].bowlerLegByeBall || 0) + 1;
                playersMap[c.bowler_id].bowlerLegByeBallRun = (playersMap[c.bowler_id].bowlerLegByeBallRun || 0) + Number(c?.legbye_run);
              }
              if (ball_Type == BALL_TYPE.BYE) {
                over.totalByesRun += Number(c.bye_run) ?? 0;
                playersMap[c.bowler_id].bowlerByeBall = (playersMap[c.bowler_id].bowlerByeBall || 0) + 1
                playersMap[c.bowler_id].bowlerByeBallRun = (playersMap[c.bowler_id].bowlerByeBallRun || 0) + Number(c?.bye_run);
              }
              updateBall.overCount = battingTeam.teamOver;
              updateBall.currentOverBalls = over.ballCount;
              updateBall.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
              playersMap[c.bowler_id].bowlerTotalBall =  (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
            }
            if (run === 0) { 
              updateBall.ballIsDot = true;
              over.dotBall = over.dotBall + ball;
              playersMap[c.batsman_id].batDotBall = (+playersMap[c.batsman_id].batDotBall || 0) + 1
              // playersMap[c.bowler_id].bowlerDotBall = (playersMap[c.bowler_id].bowlerDotBall || 0) + 1
            }
            else if(isBoundary){
                if(c.run == 4){
                  updateBall.ballIsBoundry = true;
                  updateBall.ballFour = 1;
                  over.totalFour = over.totalFour + 1;
                  // strikerPly.batFour = strikerPly.batFour + 1;
                  // bowler.bowlerFour = bowler.bowlerFour + 1;
                  playersMap[c.bowler_id].bowlerFour = (playersMap[c.bowler_id].bowlerFour || 0) + 1
                  // partnership.totalFour = partnership.totalFour + 1;
                }
                if(c.run == 6){
                    updateBall.ballIsBoundry = true;
                    updateBall.ballSix = 1;
                    // strikerPly.batSix = strikerPly.batSix + 1;
                    // bowler.bowlerSix = bowler.bowlerSix + 1;
                    over.totalSix = over.totalSix + 1;
                    // partnership.totalSix = partnership.totalSix + 1
                    playersMap[c.bowler_id].bowlerSix = (playersMap[c.bowler_id].bowlerSix || 0) + 1
                }
            }
            else if(c.run % 2 != 0){
                isChangeStrike = true;
                updateBall.nextBatStrikeId = nonStrikePId;
                updateBall.nextBatNonStrikeId = strikePId;
            }
            if (c.commentary && c.commentary.toLowerCase().includes("retired hurt")) {
              // check if getting same data from entity
              const retiredBatter = response?.scorecard?.innings
                ?.find(i => i?.number == inningNo)?.batsmen
                ?.find(i1 => (i1?.how_out == "Retired hurt" || i1?.dismissal == "retired") && c.commentary.includes(i1.name));

              if (retiredBatter && playerTpIdObj[retiredBatter.batsman_id]) {
                if (!playersMap[retiredBatter.batsman_id]) {
                  playersMap[retiredBatter.batsman_id] = {
                    ...playerTpIdObj[retiredBatter.batsman_id],
                  }
                }
                playersMap[retiredBatter.batsman_id] = {
                  ...playersMap[retiredBatter.batsman_id],
                  isBatterRetir: true,
                  isPlay: null,
                  onStrike: null
                }
              }
            }
            const ballByBallUp = generateBallET(
              {
                updateBall,
                commentaryBallByBallId: 0,
                updateBattingTeam: battingTeam,
                updateOver: over,
                updateBatter: playerTpIdObj[c.batsman_id],
                updateBowler: playerTpIdObj[c.bowler_id],
                nonStrikeBatter: null,
                updatePartnership: partnership,
                commentaryDetails: comDetails,
              },
              request
            );
            const oball = await virtualBallByBallQuery(
              ballByBallUp,
              request,
              fastify
            );
            global.tblCommentaryBallByBall.push(oball)
            oball.type = "create";
            ballbyball.push(oball)
            if(batters.length > 0) {
              const partRequestData = {
                batters,
                comDetails,
                playerTpIdObj,
                part,
                commBall: oball,
                response,
                battingTeam,
              }
              const partnershipData = await upsertCommPartnershipService(partRequestData, fastify, request);
              if (partnershipData && partnershipData.length > 0) {
                prtship.push(...partnershipData);
              }
            }
          } 
        }
        if(event =="overend"){
          const overEndNumber = c.over - 1;

          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overEndNumber}`;
          let over = oversMap[overKey];
          if(over){
            const gOver = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if(gOver && gOver.isComplete) {
              delete oversMap[overKey];
              continue; // already marked complete
            }
            // mark over as
            //  complete
            over.isComplete = true;
            over.isMaiden = getBowlerOnlyRuns(over) < 1;
            over.teamScore = c.score;
          }
          else {
            const overET = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if (overET) {
              if(overET.isComplete) {
                delete oversMap[overKey];
                continue; // already marked complete
              }
              overET.isComplete = true;
              overET.isMaiden = getBowlerOnlyRuns(overET) < 1;
              overET.teamScore = c.score;
              oversMap[overKey] = overET; // store reference
            }
          }
          for(let p of c.bats){
            if(playersMap[p.batsman_id]){
              playersMap[p.batsman_id].runs = p.runs;
              playersMap[p.batsman_id].batBall = p.balls_faced;
              playersMap[p.batsman_id].batFour = p.fours;
              playersMap[p.batsman_id].batSix = p.sixes;
            }
            else {
              playersMap[p.batsman_id] = {
                ...playerTpIdObj[p.batsman_id],
                runs : p.runs,
                batBall : p.balls_faced,
                batFour : p.fours,
                batSix : p.sixes,
                // isPlay : true
              }
            }
          }
          for(let p of c.bowls){
            if(playersMap[p.bowler_id]){
              playersMap[p.bowler_id].bowlerOver = p.overs;
              playersMap[p.bowler_id].bowlerRun = p.runs_conceded;
              playersMap[p.bowler_id].isPlay = null;
            }
            else {
              playersMap[p.bowler_id] = {
                ...playerTpIdObj[p.bowler_id],
                bowlerOver : p.overs,
                bowlerRun : p.runs_conceded,
                isPlay: null 
              }
            }
          }
        }
        if(event == "wicket"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
          if(index != -1) continue;
          const overNumber = Number(c.over);
          if(!playersMap[c.batsman_id]){
            playersMap[c.batsman_id] = {
              ...playerTpIdObj[c.batsman_id],
            }
          }
          if(!playersMap[c.bowler_id]){
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
            }
          }
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
          let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          let bowlerPId = playerTpIdObj[c.bowler_id]?.commentaryPlayerId
          let nonStrike = response.live.batsmen.find((i)=> i.batsman_id != c.batsman_id).batsman_id
          let nonStrikePId = playerTpIdObj[nonStrike]?.commentaryPlayerId;
          if(playersMap[c.bowler_id]){
            // playersMap[c.bowler_id].bowlerOver = ((playersMap[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1) 
            // playersMap[c.bowler_id].bowlerTotalWicket = (playersMap[c.bowler_id].bowlerTotalWicket || 0) + 1
            playersMap[c.bowler_id].bowlerTotalBall = (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
            // playersMap[c.bowler_id].bowlerDotBall = (playersMap[c.bowler_id].bowlerDotBall || 0) + 1
          }
          else {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
              // bowlerOver :((playerTpIdObj[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1),
              // isPlay : true,
              // bowlerTotalWicket : playerTpIdObj[c.bowler_id].bowlerTotalWicket ? playerTpIdObj[c.bowler_id].bowlerTotalWicket + 1 : 1,
              bowlerTotalBall : playerTpIdObj[c.bowler_id].bowlerTotalBall ? playerTpIdObj[c.bowler_id].bowlerTotalBall + 1 : 1,  
              // bowlerDotBall : playerTpIdObj[c.bowler_id].bowlerDotBall ? playerTpIdObj[c.bowler_id].bowlerDotBall + 1 : 1,  
            }
          }
          let wicketBatsId = c.wicket_batsman_id || c.batsman_id;
          // console.log("wicketsf batild", wicketBatsId)
          const dismissalKey =
            typeof c.dismissal === "string"
              ? c.dismissal.trim().toLowerCase()
              : null;
          // console.log("dismissalKey", dismissalKey)

          const wicket_type = etWicketObj[dismissalKey] ?? null;
          // console.log("wicket_type", wicket_type)
          const entityWicketCount = live_score_data?.wickets || 0

          let wicketData = {
            wicketType: wicket_type,
            // batterId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            // batterName : playerTpIdObj[c.batsman_id]?.playerName,
            batterId: playerTpIdObj[wicketBatsId]?.commentaryPlayerId,
            batterName : playerTpIdObj[wicketBatsId]?.playerName,
            runs: c?.run ?? 0,
            fieldPlayerId : playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fieldPlayerName : playerTpIdObj[c.bowler_id]?.playerName,
            fielder1: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fielder2: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerName : playerTpIdObj[c.bowler_id]?.playerName,
            playerRun: playerTpIdObj[wicketBatsId]?.batRun,
            playerBalls: playerTpIdObj[wicketBatsId]?.batBall,
            ballCount: c?.ball || 0,
            wicketCount: entityWicketCount,
          };
          battingTeam.teamOver = `${c.over}.${c.ball}`;
          // battingTeam["teamScore"] = (battingTeam.teamScore || 0) + c?.run ?? 0;
          battingTeam["teamScore"] = liveTeamScore;
          // battingTeam.teamWicket = (battingTeam.teamWicket || 0) + 1;
          battingTeam.teamWicket = live_score_data?.wickets ?? 0;
          battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
          battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
          if(!over) {
            over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
              && i.over == c.over
              && i.teamId == battingTeam.teamId);
            if (over) {
              over.type = "update";
            }
            if(!over){
                // generate new over
                let newOver = generateOverEt({
                        commentaryDetails :comDetails,
                        teams: {
                            battingTeam: battingTeam,
                            bowlingTeam,
                        },
                        bowler: playerTpIdObj[c.bowler_id],
                        overNumber : c.over,
                })
                over = await virtualOverQuery(newOver, request, fastify);
                // add over to global variable
                global.tblOvers.push(over);
                over.type = "create";
                const commentaryBallByBall = {
                    commentaryBallByBallId: 0,
                    commentaryId: comDetails?.commentaryId,
                    teamId: battingTeam.teamId,
                    overId: over?.overId,
                    overCount: `${c.over}.0`,
                    currentOverBalls: 0,
                    bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                    batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                    batNonStrikeId: nonStrikePId,
                    ballIsCount: true,
                    ballType: 0,
                    ballIsDot: false,
                    ballRun: c?.run ?? 0,
                    ballExtraRun: 0,
                    ballIsBoundry: false,
                    ballFour: 0,
                    ballSix: 0,
                    ballIsWicket: false,
                    ballWicketType: 0,
                    ballPlayerId: 0,
                    ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                    ballFielderId1: 0,
                    devOver: null,
                    devCurrentOverBall: null,
                    ballFielderId2: 0,
                    overIsMaiden: false,
                    nextBatStrikeId: strikePId,
                    nextBatNonStrikeId: nonStrikePId,
                    currentInnings: comDetails.currentInnings,
                    commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                    teamScore: battingTeam?.teamScore || 0,
                    teamWicket: battingTeam?.teamWicket || 0,
                    // tpId : c.event_id
                };
                const oball = await virtualBallByBallQuery(
                    commentaryBallByBall,
                    request,
                    fastify
                );
                // add ball to global variable
                oball.type = "create";
                global.tblCommentaryBallByBall.push(oball);
                ballbyball.push(oball)
            }
            oversMap[overKey] = over; // store reference
          }
          over.totalWicket = (over.totalWicket || 0) + 1;
          over.totalRun += c?.run ?? 0;
          over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
          // over.ballCount += 1;
          over.ballCount = c.ball;
          over.dotBall += 1;
          // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
          if(playersMap[wicketBatsId]){
            playersMap[wicketBatsId] = {
              ...playersMap[wicketBatsId],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicket_type,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fielder1,
              fielderId2: wicketData.fielder2,
              isPlay: null,
              onStrike: null,
              // batBall: (playersMap[c.batsman_id]?.batBall || 0) + 1,
              batDotBall: (+playersMap[wicketBatsId]?.batDotBall || 0) + 1,
            }
          }
          else {
            playersMap[wicketBatsId] = {
              ...playerTpIdObj[wicketBatsId],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicket_type,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fielder1,
              fielderId2: wicketData.fielder2,
              isPlay: null,
              onStrike: null,
              // batBall: (playerTpIdObj[c.batsman_id].batBall || 0) + 1,
              batDotBall: (+playerTpIdObj[wicketBatsId].batDotBall || 0) + 1,
              // batBall: 1,
              // batDotBall: 1,
            }
          }
          let updateBall = {
            ballIsWicket: true,
            ballWicketType: wicket_type,
            ballFielderId1: wicketData.fielder1,
            ballFielderId2: wicketData.fielder2,
            batStrikeId: playerTpIdObj[wicketBatsId]?.commentaryPlayerId,
            // batNonStrikeId: ,
            batNonStrikeId: nonStrikePId,
            ballPlayerId: playerTpIdObj[wicketBatsId]?.commentaryPlayerId,
            ballIsCount: true,
            ballType: BALL_TYPE.REGULAR,
            ballRun: wicketData.runs,
            ballIsDot: true,
            tpId : c.event_id,
            currentOverBalls : c.ball,
            commentary: c?.commentary,
          };
          const ballByBallUp = generateBallET(
            {
                updateBall,
                commentaryBallByBallId: 0,
                updateBattingTeam : battingTeam,
                updateOver : over,
                updateBatter : playersMap[c.batsman_id],
                updateBowler : playersMap[c.bowler_id],
                nonStrikeBatter : null,
                updatePartnership : partnership,
                commentaryDetails:comDetails,
                tpId : c.event_id
            },
            request
          );
          const oball = await virtualBallByBallQuery(
              ballByBallUp,
              request,
              fastify
          );
          // add ball to global variable
          global.tblCommentaryBallByBall.push(oball)
          oball.type = "create";
          ballbyball.push(oball);

          if (batters.length > 0) {
            const partRequestData = {
              batters,
              comDetails,
              playerTpIdObj,
              part,
              commBall: oball,
              response,
              battingTeam,
              wicketBall: true
            }
            const partnershipData = await upsertCommPartnershipService(partRequestData, fastify, request);
            if (partnershipData && partnershipData.length > 0) {
              prtship.push(...partnershipData);
            }
          }
          const generateWicket1 = generateWicket({
            commentaryDetails : comDetails,
            currentWicket: wicketData,
            currentOver: over,
            battingTeam: battingTeam,
            currentBall: oball,
          });
          const comWicketData = await createCommWicketQuery(generateWicket1, fastify, request);
          global.tblCommentaryWicket.push(comWicketData)
          comWicketData.type = "create";
          wickets.push(comWicketData);
          // console.log("batters", batters.length)
          // if(batters.length == 2) {
          //   let [b1, b2] = batters;
          //   let oldPart = global.tblCommentaryPartnership.find((i)=>
          //     i.commentaryId == comDetails.commentaryId &&
          //     i.currentInnings == comDetails.currentInnings &&
          //     (
          //         (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
          //         (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId)
          //     )
          //   );

          //   const partData = {
          //     ...oldPart,
          //     isActive: false,
          //   };
          //   console.log("partData", partData)
          //   await upActivePartQuery(partData, fastify);
          //   let partIndex = global.tblCommentaryPartnership.findIndex(
          //     (item) => item.commentaryPartnershipId == partData.commentaryPartnershipId
          //   );
          //   if(partIndex != -1){
          //     global.tblCommentaryPartnership[partIndex].isActive = partData.isActive
          //   }
          // }
        }
        upTeams = [battingTeam, bowlingTeam]
        // upComDetails.displayStatus = c.commentary;
      }
      
      let updateWicketData = commentaries.filter((c)=>c.event == "wicket");
      if(updateWicketData.length > 0){
        for (let c of updateWicketData){
          // check if wicket need to update or not
          let ball = global.tblCommentaryBallByBall.find((i)=> i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
          let w = global.tblCommentaryWicket.find((i)=>i.commentaryBallByBallId == ball.commentaryBallByBallId)
          if(!w){
            continue;
          }
          let batsmanId = playerTpIdObj[c.wicket_batsman_id]?.commentaryPlayerId;
          const fielders = response?.scorecard?.innings?.find((i) => i.number == response?.live?.live_inning_number)?.batsmen
            .find((i1) => i1.batsman_id == c?.wicket_batsman_id)
          const commFielder = Number(fielders?.first_fielder_id) || Number(c?.bowler_id);
          const commFielder2 = Number(fielders?.second_fielder_id) || Number(c?.bowler_id);

          const commFielder1Id = playerTpIdObj[commFielder]?.commentaryPlayerId;
          const commFielder2Id = playerTpIdObj[commFielder2]?.commentaryPlayerId;
          
          if (commFielder != Number(c?.bowler_id)) {
            if (!playersMap[commFielder]) {
              playersMap[commFielder] = {
                ...playerTpIdObj[commFielder],
                isInPlayingEleven: true,
              };
            } else if (playersMap[commFielder].isInPlayingEleven == false) {
              playersMap[commFielder].isInPlayingEleven = true;
            }
          }
          if (commFielder2 != commFielder && commFielder2 != Number(c?.bowler_id)) {
            if (!playersMap[commFielder2]) {
              playersMap[commFielder2] = {
                ...playerTpIdObj[commFielder2],
                isInPlayingEleven: true,
              };
            } else if (playersMap[commFielder2].isInPlayingEleven == false) {
              playersMap[commFielder2].isInPlayingEleven = true;
            }
          }

          if(
            w.wicketType != null && batsmanId == w.batterId && 
            w.fieldPlayerId == commFielder1Id && w.fieldPlayer2Id == commFielder2Id
          ) {
            continue;
          }

          if(!c.wicket_batsman_id || !c.dismissal){
            continue;
          }
          // update wicketType and batsman_id
          let dismissal = c.dismissal.toLowerCase().trim();
          let wtEnum = etWicketObj[dismissal] || wicketTypeObj.BOLD;
          const entityWicketCount = live_score_data?.wickets || 0

          w.wicketType = wtEnum;
          w.fieldPlayerId = commFielder1Id;
          w.fieldPlayerName = playerTpIdObj[commFielder]?.playerName;
          w.fieldPlayer2Id = commFielder2Id;
          w.fieldPlayer2Name = playerTpIdObj[commFielder2]?.playerName;
          w.wicketCount = entityWicketCount;
          w.ballCount = c?.ball || 0;
          w.playerBalls =  Number(fielders?.balls_faced);
          w.playerRun = Number(fielders?.runs);


          let upBall ={
            ...ball,
            ballWicketType: wtEnum,
            batStrikeId: batsmanId,
            ballPlayerId: batsmanId,
            ballFielderId1: w.fieldPlayerId,
            ballFielderId2: w.fieldPlayer2Id,
            commentary: c?.commentary,
          }
          // if(w.batterId != batsmanId){
           
            playersMap[c.wicket_batsman_id] = {
              ...playerTpIdObj[c.wicket_batsman_id],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wtEnum,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: w.fieldPlayerId,
              fielderId2: w.fieldPlayer2Id,
              isPlay: null,
              onStrike: null,
              // batBall: (playersMap[c.batsman_id]?.batBall || 0) + 1,
              batDotBall: (+playersMap[c.wicket_batsman_id]?.batDotBall || 0) + 1,
            }
            // change old player
          if (batsmanId != w.batterId) {
            let oldBatsman = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == w.batterId && i.commentaryId == comDetails.commentaryId)
            if (!playersMap[oldBatsman.tpId]) {
              playersMap[oldBatsman.tpId] = {
                ...playerTpIdObj[oldBatsman.tpId],
              }
            }
            let onStrikeData = c.batsman_id == oldBatsman.tpId
            playersMap[oldBatsman.tpId] = {
              ...playersMap[oldBatsman.tpId],
              isBatterOut: false,
              isPlay: true,
              onStrike: onStrikeData,
              isBatterRetir: null,
              wicketType: null,
              bowlerId: null,
              bowlerId: null,
              fielderId1: null,
              fielderId2: null,
              batDotBall: (+playersMap[oldBatsman.tpId]?.batDotBall) - 1,
            }
            w.batterId = playerTpIdObj[c.wicket_batsman_id]?.commentaryPlayerId;
            w.batterName = playerTpIdObj[c.wicket_batsman_id]?.playerName;
            // w.playerRun = playerTpIdObj[c.wicket_batsman_id]?.batRun;
            // w.playerBalls = playerTpIdObj[c.wicket_batsman_id]?.batBall;
          }
            
          // }
          ballbyball.push(upBall)
          wickets.push(w);
        }
      }
    }

    if (fullCommentaries.length > 0) {
      updateFullCommentaryOfBallService(fullCommentaries, comDetails, request, fastify);
    }

    // console.log(oversMap)
    let plyArr = Object.values(playersMap);
    let overArr = Object.values(oversMap)
    if (commentaries?.length > 0) {
      let displayData = {}
      let latestBall = commentaries.filter(c => c.event != "overend").at(-1);
      const currentBall = global.tblCommentaryBallByBall.find(item => 
        item.tpId == latestBall?.event_id
      );
      if(currentBall) {
        displayData.currentBall = currentBall
      }
      if (latestBall && String(latestBall?.score) == "w") {
        // // onStrike player code
        // const currentInning = response?.scorecard?.innings?.find(
        //   i => i.number == response?.live?.live_inning_number
        // );
        // const batter = currentInning?.batsmen?.find(
        //   b => b.position == "striker" && b.batting == "true"
        // );
        
        if (latestBall?.wicket_batsman_id) {
          const onStrike = plyArr.find(item => item.tpId == latestBall?.wicket_batsman_id);
          if (onStrike) {
            displayData.playerSwitch = null;
            displayData.onStrikePlayer = onStrike;
          }
        }
      }
      if (Object.keys(displayData).length > 0) {
        const commDisplayStatus = await generateDisplayStatus(displayData);
        upComDetails.displayStatus = commDisplayStatus;
      }
      let overEndBall = commentaries.at(-1)?.event === "overend"
      if (overEndBall) {
        upTeams = upTeams.map(item => {
          if(item.teamId == battingTeam.teamId) {
            const newOver = Math.ceil(Number(item.teamOver || 0));
            return {
              ...item,
              teamOver: `${newOver}`
            };
          }
          return item;
        })
      }
    }
  if (
    prtship.length == 0 &&
    ballbyball.length == 0 &&
    overArr.length == 0 &&
    upTeams.length == 0 &&
    wickets.length == 0
  ) {
    return true;
  }

    await syncEntitySportCommentaryService({
      commentaryId : comDetails.commentaryId,
      commentaryDetails : {
        ...comDetails,
        ...upComDetails
      },
      commentaryPlayers : plyArr,
      commentaryPartnership: prtship,
      // commentaryPartnership: partnership,
      commentaryBallByBall : ballbyball,
      commentaryOvers : overArr,
      commentaryTeams : upTeams,
      commentaryWicket : wickets
    },fastify,request)


    return {
      comWickets : wickets,
      ballbyball,
      upOver :  Object.values(oversMap),
      upPlayers : Object.values(playersMap),
      upComDetails,
      upTeams,
    } 
    
    return res;
}

const inningChangeStateService = async (fastify, comDetails) => {
  let commentaryUpdates = {
    commentaryStatus: commentaryStatus.INNINGCHANGE,
    displayStatus: "Innings Break",
  };
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)
  let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
  let bowlTeam = teams.find((i)=> i.teamStatus == 2)
  // check if currentInning need to change if test match
  let isLastInning = comDetails.currentInnings >= matchType.noOfIningsPerSide;

  if(bowlTeam.isBattingComplete == true && !isLastInning){
    commentaryUpdates.currentInnings = comDetails.currentInnings + 1;
    commentaryUpdates.isEndInnings = true;
  }
  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails: {
      ...comDetails,
      ...commentaryUpdates
    },
    isCallPredict: false,
  }, fastify)

  return true;
}

const onInningChangeService = async (data, fastify, comDetails) => {
  const {response} = data;
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)  
  let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
  // chekc if one of the team bat is completed
  if(matchType.noOfIningsPerSide == 1){
    let oneTeamWon = teams.find((i)=>i.isBattingComplete == true);
    if(oneTeamWon){
      errorLogger(
        fastify,          
        "Inning already Changed again got inning break status",
        "services/entitySport.js/onInningChangeService",
        null,
        data
      )
      return true;
    } 
  }
  let batTeam = teams.find((i) => i.teamStatus ==1)
  let bowlTeam = teams.find((i)=> i.teamStatus == 2)

  if((!batTeam || !bowlTeam) && matchType.noOfIningsPerSide > 1){
    await multiInningChangeService(data,fastify, comDetails)
    return true;
  }

  const runDifference =
    (batTeam?.teamScore || 0) +
    (batTeam?.teamLeadRuns || 0) -
    (batTeam?.teamTrialRuns || 0);
  const leadRuns = Math.max(runDifference * -1, 0);
  const trialRuns = Math.max(runDifference, 0);
  const partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === comDetails.commentaryId &&
        item.currentInnings == comDetails.currentInnings
    )
    .sort(
      (a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId
    )[0];

   let teamUpdates = [
      { ...batTeam, isBattingComplete: true, teamStatus: 2, subInning: 2 },
      {
        ...bowlTeam,
        // isBattingComplete: false,
        teamStatus: 1,
        teamLeadRuns: leadRuns,
        teamTrialRuns: trialRuns,
        subInning: 1,
      },
    ];
   let commentaryUpdates = {
      commentaryStatus : commentaryStatus.INNINGCHANGE,
      // displayStatus: response.live.status_note,
      displayStatus: "Innings Break",
      isClientShow: true,
      rmk : generateRemainingRuns({
        team: { ...bowlTeam, teamTrialRuns: trialRuns},
        ballsPerOver: matchType.ballsPerOver || 6,
      })
    };
  let part = null;
  if (partnership && partnership?.commentaryPartnershipId) {
    part = {
      ...partnership,
      isActive: false,
    };
    await upActivePartQuery(part, fastify);
    let partIndex = global.tblCommentaryPartnership.findIndex(
      (item) => item.commentaryPartnershipId == part.commentaryPartnershipId
    );
    if (partIndex != -1) {
      global.tblCommentaryPartnership[partIndex].isActive = part.isActive
    }
  }
  let playerToUpdate = global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId == comDetails.commentaryId &&
      item.currentInnings == comDetails.currentInnings &&
      (item.onStrike == true || item.isPlay == true)
  );
   playerToUpdate = playerToUpdate.map((item) => {
    return {
      ...item,
      isPlay: null,
      onStrike: null,
    };
  });
  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails: {
      ...comDetails,
      ...commentaryUpdates
    },
    commentaryTeams: teamUpdates,
    commentaryPlayers: playerToUpdate,
    isCallPredict: false,
    commentaryPartnership: part ? [part] : []
  },fastify)

  return true;

}
const matchCompleteService = async (data , fastify,comDetails) =>{
  const {response} = data;
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)  
  let batTeam = teams.find((i) => i.teamStatus ==1)
  let bowlTeam = teams.find((i)=> i.teamStatus == 2)
  let winTeam = teams.find((i) => i.tpId == response.match_info.winning_team_id)
  let isBatTeamWon= false;
  let upComDetails = {}
  let upBatTeam = {}
  let upBowlTeam = {}

  const statusNote = response?.match_info?.status_note;
  const matchResult = statusNote
    ? statusNote.match(/by\s.+$/i)?.[0] || statusNote
    : null;

  const cancelledKeys = ["cancelled", "abandoned", "no result"];
  const statusString = cancelledKeys.some(val =>
    response?.match_info?.status_str?.toLowerCase().includes(val)
  )
    ? commentaryStatus.CANCELLED
    : commentaryStatus.COMPLETED;

  if (winTeam) {
    isBatTeamWon = winTeam.commentaryTeamId == batTeam.commentaryTeamId ? true : false;
    upComDetails = {
    ...comDetails,
      commentaryStatus: statusString,
      winnerId: winTeam.teamId,
      winnerName: winTeam.teamName,
      displayStatus: "",
      result: statusNote,
      rmk: "",
      winRmk: matchResult,
  }

    upBatTeam = {
    ...batTeam,
      isBattingComplete: true,
      isWin: isBatTeamWon
  }
    upBowlTeam = {
    ...bowlTeam,
      isWin: !isBatTeamWon
    }
  } else {
    upComDetails = {
      ...comDetails,
      commentaryStatus: statusString,
      displayStatus: "",
      result: statusNote,
      rmk: "",
      winRmk: matchResult,
    }
    upBatTeam = batTeam ?? null;
    upBowlTeam = bowlTeam ?? null;
  }
  // let upComDetails = {
  //   ...comDetails,
  //   // commentaryStatus : commentaryStatus.COMPLETED,
  //   commentaryStatus : statusString,
  //   winnerId : winTeam.teamId,
  //   winnerName : winTeam.teamName,
  //   displayStatus : "",
  //   result : statusNote,
  //   rmk : "",
  //   winRmk: matchResult,
  // }

  // let upBatTeam = {
  //   ...batTeam,
  //   isBattingComplete : true,
  //   isWin : isBatTeamWon  
  // }
  // let upBowlTeam = {
  //   ...bowlTeam,
  //   isWin : !isBatTeamWon
  // }

  const commentaryTeams = [upBatTeam, upBowlTeam].filter(Boolean);

  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails:upComDetails,
    // commentaryTeams: [
    //   upBatTeam,
    //   upBowlTeam
    // ],
    commentaryTeams,
    isCallPredict: false,
  },fastify)


   if (comDetails && comDetails?.isTest === false) {
    try {
      const result = await fastify.db.query(
        `SELECT * FROM fn_insert_auto_update_player_statistics_by_commentary(:commentaryId, :createdBy)`,
        {
          replacements: {
            commentaryId: comDetails.commentaryId,
            createdBy: -4
          },
          type: fastify.db.QueryTypes.SELECT
        }
      );

      if (result && result.length > 0) {
        const notInsertedCPIds = result.filter(r => r.status === "skipped")?.map(r => r.player_id);
        if (notInsertedCPIds.length > 0) {
          errorLogger(
            fastify,
            `CommentaryId: ${comDetails.commentaryId} and PlayerId: ${notInsertedCPIds.join(", ")} skipped`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
            null
          );
        }
      }
    } catch (error) {
      errorLogger(
        fastify,
        `Error in fn_insert_auto_update_player_statistics_by_commentary for CommentaryId: ${comDetails.commentaryId} => ${error.message}`,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
        null
      );
    }
  
  }
  return true

}
const multiInningChangeService = async (data, fastify, comDetails) => {
  const {response} = data;
  const liveBattingTeamId = response?.live?.live_inning?.batting_team_id ?? null;
  let batTeam = global.tblCommentaryTeams.find((i) =>i.commentaryId == comDetails.commentaryId &&
    i.tpId == liveBattingTeamId &&
    i.currentInnings == comDetails.currentInnings);
  let previousInning = comDetails.currentInnings - 1;
  let bowlTeam = global.tblCommentaryTeams.find((i) =>i.commentaryId == comDetails.commentaryId &&
    i.teamId != batTeam.teamId &&
    i.currentInnings == comDetails.currentInnings);
  let PbatTeam = global.tblCommentaryTeams.find((i) =>i.commentaryId == comDetails.commentaryId &&
    i.teamStatus == 1 &&
    i.currentInnings == previousInning);
  let PbowlTeam = global.tblCommentaryTeams.find((i) =>i.commentaryId == comDetails.commentaryId &&
    i.teamStatus == 2 &&
    i.currentInnings == previousInning);
  const runDifference =
      (PbatTeam?.teamScore || 0) +
      (PbatTeam?.teamLeadRuns || 0) -
      (PbatTeam?.teamTrialRuns || 0);

  if(runDifference > 0){
    if(PbatTeam.teamId == batTeam.teamId){
      batTeam.teamLeadRuns = runDifference;
    }
    else if(PbowlTeam.teamId == batTeam.teamId){
      batTeam.teamTrialRuns = runDifference;
    }
  }
  else {
    if(PbatTeam.teamId == batTeam.teamId){
      batTeam.teamTrialRuns = runDifference * -1;
    }
    else if(PbowlTeam.teamId == batTeam.teamId){
      batTeam.teamLeadRuns = runDifference * -1;
    }
  }
  let teamUpdates = [
    {
      ...batTeam,
      teamStatus : 1,
      teamBattingOrder : 1 + (previousInning * 2),
      subInning :  1 + (previousInning * 2),
    },
    {
      ...PbatTeam,
      isBattingComplete : true,
    },
    {
      ...bowlTeam,
      teamStatus : 2, 
      teamBattingOrder : 2 + (previousInning * 2),
      subInning : 2 + (previousInning * 2),
    }
  ]


   let playerToUpdate = global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId == comDetails.commentaryId &&
      item.currentInnings == previousInning &&
      (item.onStrike == true || item.isPlay == true)
  );
   playerToUpdate = playerToUpdate.map((item) => {
    return {
      ...item,
      isPlay: null,
      onStrike: null,
    };
  });

  let partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === comDetails.commentaryId &&
        item.currentInnings == previousInning
    )
    .sort(
      (a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId
    )[0];

    if(partnership && partnership.isActive == true){
      partnership = {
        ...partnership,
        isActive: false,
      };
      await upActivePartQuery(partnership, fastify);
      let partIndex = global.tblCommentaryPartnership.findIndex(
        (item) => item.commentaryPartnershipId == part.commentaryPartnershipId
      );
      if(partIndex != -1){
        global.tblCommentaryPartnership[partIndex].isActive = part.isActive
      }
    }

  let commentaryUpdates = {
    commentaryStatus : commentaryStatus.INNINGCHANGE,
    displayStatus : "Innings"
  }

  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails: {
      ...comDetails,
      ...commentaryUpdates
    },
    commentaryTeams: teamUpdates,
    commentaryPlayers: playerToUpdate,
    isCallPredict: false,
    commentaryPartnership : partnership ? [partnership] : []
  },fastify)


  return true;
}

const handleStoreBall = async (data, fastify, comDetails, request) => {
  let { response, battingTeam } = data;
  let com = response.live.commentaries;
  let storedCom = com.slice(-5)
  storedCom = storedCom.filter((i) => i.event != "overend").sort((i1, i2) => i2.event_id - i1.event_id)
  let playerTpIdObj = {};
  let comPlayers = global.tblCommentaryPlayers.filter((cp) => cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)
  for (let cp of comPlayers) {
    playerTpIdObj[cp.tpId] = {
      ...cp,
      playerName: cp.playerName,
      playerId: cp.playerId,
    };
  }
  let playersMap = {};
  let deleteBallByBallIds = [];
  let deleteOverIds = []
  let oversMap = {};
  let partnershipMap = {};
  for (let c of storedCom) {
    let event = c.event;
    const scoreStr = String(c.score).toLowerCase();
    if (String(scoreStr) === "w") {
      event = "wicket";
    } else if (scoreStr && scoreStr.includes("wd")) {
      event = "wide";
    } else if (scoreStr && scoreStr.includes("nb")) {
      event = "noball";
    } else if (scoreStr && scoreStr.includes("lb")) {
      event = "legbye";
    } else if (
      scoreStr &&
      scoreStr.includes("b") &&
      !scoreStr.includes("lb") &&
      !scoreStr.includes("nb")
    ) {
      event = "bye";
    } else {
      event = "ball";
    }
    // let live_score_data = response?.live?.live_score;
    // let liveTeamScore = response?.live?.live_score?.runs;
    if (String(c.score) == "w") {
      event = "wicket"
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id);
      if (index == -1) continue;
      let BallByBall = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id);
      if (BallByBall.ballIsWicket == true) {
        continue;
      }
      let afterBalls = global.tblCommentaryBallByBall.filter(
        (i) =>
          i.commentaryBallByBallId >= BallByBall.commentaryBallByBallId &&
          i.commentaryId == comDetails.commentaryId &&
          i.currentInnings == comDetails.currentInnings
      );
      for (let b1 of afterBalls) {
        deleteBallByBallIds.push(b1.commentaryBallByBallId);
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        let tpBall = com.find((i) => i.event_id == b1.tpId);
        if (!tpBall) continue;
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }
    if (event == "ball") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue;
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);

      if (!ball.ballIsWicket && ball.ballRun === c.run && ball.ballType == BALL_TYPE.REGULAR) {
        continue;
      }

      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }
    if (event == "wide") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue;
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (!ball.ballIsWicket && ball.ballType == BALL_TYPE.WIDE && ball.ballExtraRun == c.run) {
        continue;
      }
      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }

    if (event == "noball") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue;
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (!ball.ballIsWicket && ball.ballType == BALL_TYPE.NO_BALL && ball.ballExtraRun == c.run) {
        continue;
      }
      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId);
        let tpBall = com.find((i) => i.event_id == b1.tpId);
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }

    if (event == "legbye") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue;
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);

      if (!ball.ballIsWicket && ball.ballRun === c.run && ball.ballType == BALL_TYPE.LEG_BYE) {
        continue;
      }

      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }

    if (event == "bye") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue;
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);

      if (!ball.ballIsWicket && ball.ballRun === c.run && ball.ballType == BALL_TYPE.BYE) {
        continue;
      }

      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        const requestData = {
          response,
          battingTeam,
          comDetails,
          commBall: b1,
          commPlayers: playerTpIdObj,
          tpBall,
          deleteOverIds,
          over,
          tpCurrentBall: c,
        }
        const undoResult = await applyUndoForAllTypes(requestData, b1, fastify, request);

        if (undoResult) {
          battingTeam = undoResult.battingTeam;
          deleteOverIds.push(...undoResult.deleteOverIds);
          oversMap[overKey] = undoResult.over;
          Object.assign(playersMap, undoResult.playersMap);
        }
      }
    }
  }

  let plyArr = Object.values(playersMap);
  let overArr = Object.values(oversMap)
  let partnershipArr = Object.values(partnershipMap)
  if (deleteOverIds?.length > 0) {
    const remainingBallIds = global.tblCommentaryBallByBall
      .filter(item => deleteOverIds.includes(item.overId))
      .map(item => item.commentaryBallByBallId);
    for (const id of remainingBallIds) {
      if (!deleteBallByBallIds.includes(id)) {
        deleteBallByBallIds.push(id);
      }
    }
  }
  // const result = {
  //   commentaryId: comDetails.commentaryId,
  //   commentaryPlayers: plyArr,
  //   deleteBallByBallIds: deleteBallByBallIds,
  //   commentaryOvers: overArr,
  //   commentaryPartnership: partnershipArr,
  //   deleteOverIds: deleteOverIds,
  //   commentaryTeams: [battingTeam]
  // }

  if (deleteBallByBallIds.length > 0 || deleteOverIds.length > 0) {
    await syncEntitySportCommentaryService({
      commentaryId: comDetails.commentaryId,
      commentaryPlayers: plyArr,
      deleteBallByBallIds: deleteBallByBallIds,
      commentaryOvers: overArr,
      commentaryPartnership: partnershipArr,
      commentaryTeams: [battingTeam],
      deleteOverIds: deleteOverIds
    }, fastify, request)
  }
  return true;
}

const wicketUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commBall,
    commPlayers,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  battingTeam.teamWicket = Math.max(0, battingTeam.teamWicket - 1);
  // battingTeam.teamWicket = response?.live?.live_score?.wickets;
  const prevBall = Math.max(0, tpCurrentBall?.ball - 1);
  battingTeam.teamOver = `${tpCurrentBall?.over}.${prevBall}`;
  // battingTeam.teamOver = String(response?.live?.live_score?.overs);
  if (over) {
    let ball_Type = commBall?.ballType;
    over.totalWicket = Math.max(0, (over.totalWicket || 0) - 1);
    over.isComplete = false;
    if (![2, 5].includes(ball_Type)) {
      over.ballCount = Math.max(0, (over.ballCount || 0) - 1);
      if (commBall?.batRun == 0) {
        over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
      }
    }

    if (over.ballCount === 0) {
      deleteOverIds.push(over.overId);
    } else {
      // over.teamScore = `${battingTeam.teamScore || 0}/${battingTeam.teamWicket || 0}`;
      over.teamScore = `${liveTeamScore}/${battingTeam.teamWicket || 0}`;
      if (over) {
        over.type = "update"
      }
    }
  }

  // Update Batter and Bowler stats
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }

  // playersMap[tpBall.bowler_id].bowlerTotalWicket = playersMap[tpBall.bowler_id].bowlerTotalWicket > 0 ? playersMap[tpBall.bowler_id].bowlerTotalWicket - 1 : 0;
  playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
  // playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
  let o = parseFloat(playersMap[tpBall.bowler_id].bowlerOver || 0);
  let overs = Math.floor(o);
  let balls = Math.round((o % 1) * 10);
  let val = parseFloat(`${balls ? overs : overs - 1}.${balls ? balls - 1 : 5}`);
  playersMap[tpBall.bowler_id].bowlerOver = Math.max(0, val);

  let batter = response?.scorecard?.innings.find((i) => i.number == response?.live?.live_inning_number)?.batsmen
  .find((i1) => i1.batsman_id == tpBall.batsman_id)
  let onStrike = batter.position == "striker" ? true : false

  playersMap[tpBall.batsman_id].isBatterOut = null;
  playersMap[tpBall.batsman_id].wicketType = null;
  playersMap[tpBall.batsman_id].bowlerId = null;
  playersMap[tpBall.batsman_id].fielderId1 = null;
  playersMap[tpBall.batsman_id].fielderId2 = null;
  playersMap[tpBall.batsman_id].isPlay = true;
  playersMap[tpBall.batsman_id].onStrike = onStrike;


  let part = response.live?.live_inning?.current_partnership;
  let batters = part?.batsmen?.map((i) => i.batsman_id) || []
  let partnership = {}
  if (batters.length == 2) {
    let [b1, b2] = batters;
    let partExist = global.tblCommentaryPartnership.find((i) =>
      i.commentaryId == comDetails.commentaryId &&
      i.currentInnings == comDetails.currentInnings &&
      (
        (i.batter1Id == commPlayers[b1].commentaryPlayerId && i.batter2Id == commPlayers[b2].commentaryPlayerId) ||
        (i.batter1Id == commPlayers[b2].commentaryPlayerId && i.batter2Id == commPlayers[b1].commentaryPlayerId) // order doesn’t matter
      )
    );
    if (partExist) {
      let comPlayerId1 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter1Id)
      let comPlayerId2 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter2Id)
      let cp1 = part.batsmen.find((i) => i.batsman_id == comPlayerId1.tpId)
      let cp2 = part.batsmen.find((i) => i.batsman_id == comPlayerId2.tpId)
      partnership = {
        ...partExist,
        totalRuns: part.runs,
        totalBalls: part.balls,
        batter1Runs: cp1.runs,
        batter2Runs: cp2.runs,
        batter1Balls: cp1.balls,
        batter2Balls: cp2.balls
      }
      let par = await updateVirtualPartnershipQuery(partnership, fastify, null)
      //update partnersip in db
      let pI = global.tblCommentaryPartnership.findIndex((i) => i.commentaryPartnershipId == partnership.commentaryPartnershipId)
      global.tblCommentaryPartnership[pI] = par[0];
    } else {
      let cp1 = commPlayers[part.batsmen[0].batsman_id]
      let cp2 = commPlayers[part.batsmen[1].batsman_id]
      partnership = genEtPartnership({
        currentPartnership: {
          batter1Id: cp1.commentaryPlayerId,
          batter1Name: cp1.playerName,
          batter2Id: cp2.commentaryPlayerId,
          batter2Name: cp2.playerName,
          totalRuns: part.runs,
          totalBalls: part.balls,
          batter1Runs: part.batsmen[0].runs,
          batter2Runs: part.batsmen[1].runs,
          batter1Balls: part.batsmen[0].balls,
          batter2Balls: part.batsmen[1].balls,
          order: response.live.live_inning.equations.wickets + 1,
          isActive: true
        },
        commentaryDetails: comDetails,
        updateBattingTeam: battingTeam
      })
      partnership = await virtualPartnershipQuery(
        partnership,
        request,
        fastify
      );
      global.tblCommentaryPartnership.push(partnership);
    }
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  }
}

const regularBallUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commPlayers,
    commBall,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  let live_score_data = response?.live?.live_score;
  let run = commBall.ballRun;
  // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
  battingTeam["teamScore"] = liveTeamScore;
  let previousBall = tpCurrentBall?.ball - 1;
  battingTeam.teamOver = `${tpCurrentBall?.over}.${previousBall}`
  // battingTeam.teamOver = String(live_score_data?.overs);
  battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
  battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
  // battingTeam.teamLegByRuns = battingTeam.teamLegByRuns > 0 ? (battingTeam.teamLegByRuns || 0) - parseInt(commBall.teamLegByRuns) : 0;
  // battingTeam.teamByRuns = battingTeam.teamByRuns > 0 ? (battingTeam.teamByRuns || 0) - parseInt(commBall.teamByRuns) : 0;
  over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
  over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
  over.isComplete = false;
  // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
  over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }
  playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
  // playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
  playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - 1 : 0;
  playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
  let isBoundary = run == 4 || run == 6 ? true : false;
  if (run == 0) {
    over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
    playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? (+playersMap[tpBall.batsman_id].batDotBall) - 1 : 0;
    // playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
  }
  else if (isBoundary) {
    if (run == 4) {
      over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
      playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
    }
    if (run == 6) {
      over.totalSix -= 1;
      playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
    }
  }
  if (over.ballCount === 0) {
    deleteOverIds.push(over.overId);
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  }
}

const wideBallUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commPlayers,
    commBall,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  let live_score_data = response?.live?.live_score;
  let run = commBall?.ballExtraRun ?? 0;
  battingTeam["teamScore"] = liveTeamScore;
  let previousBall = tpCurrentBall?.ball - 1;
  battingTeam.teamOver = `${tpCurrentBall?.over}.${previousBall}`
  // battingTeam.teamOver = String(response?.live?.live_score?.overs);
  battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
  battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
  battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - run : 0;
  over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
  over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
  over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
  over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
  over.isComplete = false;
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }
  // playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
  playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
  // playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
  playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
  if (over.ballCount === 0) {
    deleteOverIds.push(over.overId);
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  }
}

const noballUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commPlayers,
    commBall,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  let live_score_data = response?.live?.live_score;
  let run = commBall?.ballExtraRun ?? 0;
  battingTeam["teamScore"] = liveTeamScore;
  let previousBall = tpCurrentBall?.ball - 1;
  battingTeam.teamOver = `${tpCurrentBall?.over}.${previousBall}`
  // battingTeam.teamOver = String(response?.live?.live_score?.overs);
  battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
  battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
  battingTeam.teamNoBallRuns = battingTeam.teamNoBallRuns > 0 ? battingTeam.teamNoBallRuns - run : 0;
  over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
  over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
  over.totalNoball = over.totalNoball > 0 ? over.totalNoball - 1 : 0;
  over.totalNoBallRun = over.totalNoBallRun > 0 ? over.totalNoBallRun - run : 0;
  over.isComplete = false;
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }
  // playersMap[tpBall.bowler_id].bowlerNoBall = playersMap[tpBall.bowler_id].bowlerNoBall > 0 ? playersMap[tpBall.bowler_id].bowlerNoBall - 1 : 0;
  playersMap[tpBall.bowler_id].bowlerNoBallRun = playersMap[tpBall.bowler_id].bowlerNoBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerNoBallRun - run : 0;
  // playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
  if (over.ballCount === 0) {
    deleteOverIds.push(over.overId);
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  }
}

const legByeRunUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commPlayers,
    commBall,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  let live_score_data = response?.live?.live_score;
  let run = commBall.ballRun;
  battingTeam["teamScore"] = liveTeamScore;
  let previousBall = tpCurrentBall?.ball - 1;
  battingTeam.teamOver = `${tpCurrentBall?.over}.${previousBall}`
  // battingTeam.teamOver = String(response?.live?.live_score?.overs);
  battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
  battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
  battingTeam.teamLegByRuns = battingTeam.teamLegByRuns > 0 ? (battingTeam.teamLegByRuns || 0) - run : 0;
  over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
  over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
  over.totalLegByesRun = over.totalLegByesRun > 0 ? over.totalLegByesRun - run : 0;
  over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
  over.isComplete = false;
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }
  playersMap[tpBall.bowler_id].bowlerLegByeBall = playersMap[tpBall.bowler_id].bowlerLegByeBall > 0 ? playersMap[tpBall.bowler_id].bowlerLegByeBall - 1 : 0;
  playersMap[tpBall.bowler_id].bowlerLegByeBallRun = playersMap[tpBall.bowler_id].bowlerLegByeBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerLegByeBallRun - run : 0;
  playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
  // playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
  playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - run : 0;
  playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
  let isBoundary = run == 4 || run == 6 ? true : false;
  if (run == 0) {
    over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
    playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? (+playersMap[tpBall.batsman_id].batDotBall) - 1 : 0;
    // playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
  }
  else if (isBoundary) {
    if (run == 4) {
      over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
      playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
    }
    if (run == 6) {
      over.totalSix -= 1;
      playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
    }
  }
  if (over.ballCount === 0) {
    deleteOverIds.push(over.overId);
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  }
}

const byeRunUndoService = async (data, fastify, request) => {
  let {
    response,
    battingTeam,
    comDetails,
    commPlayers,
    commBall,
    tpBall,
    deleteOverIds,
    over,
    tpCurrentBall,
  } = data;

  let playersMap = {};
  let liveTeamScore = response?.live?.live_score?.runs;
  let live_score_data = response?.live?.live_score;
  let run = commBall.ballRun;
  battingTeam["teamScore"] = liveTeamScore;
  let previousBall = tpCurrentBall?.ball - 1;
  battingTeam.teamOver = `${tpCurrentBall?.over}.${previousBall}`
  // battingTeam.teamOver = String(response?.live?.live_score?.overs);
  battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
  battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
  battingTeam.teamByRuns = battingTeam.teamByRuns > 0 ? (battingTeam.teamByRuns || 0) - run : 0;
  over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
  over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
  over.totalByesRun = over.totalByesRun > 0 ? over.totalByesRun - run : 0;
  over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
  over.isComplete = false;
  if (!playersMap[tpBall.bowler_id]) {
    playersMap[tpBall.bowler_id] = {
      ...commPlayers[tpBall.bowler_id]
    }
  }
  if (!playersMap[tpBall.batsman_id]) {
    playersMap[tpBall.batsman_id] = {
      ...commPlayers[tpBall.batsman_id]
    }
  }
  playersMap[tpBall.bowler_id].bowlerByeBall = playersMap[tpBall.bowler_id].bowlerByeBall > 0 ? playersMap[tpBall.bowler_id].bowlerByeBall - 1 : 0;
  playersMap[tpBall.bowler_id].bowlerByeBallRun = playersMap[tpBall.bowler_id].bowlerByeBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerByeBallRun - run : 0;
  playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
  // playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
  playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - 1 : 0;
  playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
  let isBoundary = run == 4 || run == 6 ? true : false;
  if (run == 0) {
    over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
    playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? (+playersMap[tpBall.batsman_id].batDotBall) - 1 : 0;
    // playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
  }
  else if (isBoundary) {
    if (run == 4) {
      over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
      playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
    }
    if (run == 6) {
      over.totalSix -= 1;
      playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
    }
  }
  if (over.ballCount === 0) {
    deleteOverIds.push(over.overId);
  }
  return {
    over,
    deleteOverIds,
    playersMap,
    battingTeam,
  } 
}

const applyUndoForAllTypes = async(requestData, b1, fastify, request) => {
  try {
    if (b1.ballIsWicket === true) {
      const result = await wicketUndoService(requestData, fastify, request);
      if (!result) {
        return
      }
      return result;
    }

    const undoFuncTypes = undoHandlers[b1.ballType];

    if (undoFuncTypes) {
      const result = await undoFuncTypes(requestData, fastify, request);
      if (!result) {
        return
      }
      return result;
    }
    return null;
  } catch (err) {
    console.log("console on applyUndoForAllTypes", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/entitySport.js/applyUndoForAllTypes",
      request
    );
    return null;
  }
}

const undoHandlers = {
    [BALL_TYPE.REGULAR]: regularBallUndoService,
    [BALL_TYPE.WIDE]: wideBallUndoService,
    [BALL_TYPE.NO_BALL]: noballUndoService,
    [BALL_TYPE.LEG_BYE]: legByeRunUndoService,
    [BALL_TYPE.BYE]: byeRunUndoService,
};

const upsertCommPartnershipService = async (data, fastify, request) => {
  const { 
    batters,
    comDetails,
    playerTpIdObj,
    part,
    commBall,
    response,
    battingTeam,
    wicketBall
  } = data;
  let prtship = [];
  let partnership;
  let [b1, b2] = batters;
  let partExist = global.tblCommentaryPartnership.find((i) =>
    i.commentaryId == comDetails.commentaryId &&
    i.currentInnings == comDetails.currentInnings &&
    (
      (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
      (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId) // order doesn’t matter
    )
  );
  if (partExist) {
    let comPlayerId1 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter1Id)
    let comPlayerId2 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter2Id)
    let cp1 = part.batsmen.find((i) => i.batsman_id == comPlayerId1.tpId)
    let cp2 = part.batsmen.find((i) => i.batsman_id == comPlayerId2.tpId)
    partnership = {
      ...partExist,
      totalRuns: part.runs,
      totalBalls: part.balls,
      batter1Runs: cp1.runs,
      batter2Runs: cp2.runs,
      batter1Balls: cp1.balls,
      batter2Balls: cp2.balls,
      isActive: wicketBall === true ? false : true
    }
    //update partnersip in db
    let par = await updateVirtualPartnershipQuery(partnership, fastify, null)
    let pI = global.tblCommentaryPartnership.findIndex((i) => i.commentaryPartnershipId == partnership.commentaryPartnershipId)
    global.tblCommentaryPartnership[pI] = par[0];
    prtship.push({
      ...par[0],
      type: "update"
    })
  }
  else {
    let cp1 = playerTpIdObj[part.batsmen[0].batsman_id]
    let cp2 = playerTpIdObj[part.batsmen[1].batsman_id]
    partnership = genEtPartnership({
      currentPartnership: {
        batter1Id: cp1.commentaryPlayerId,
        batter1Name: cp1.playerName,
        batter2Id: cp2.commentaryPlayerId,
        batter2Name: cp2.playerName,
        totalRuns: part.runs,
        totalBalls: part.balls,
        commentaryBallByBallId: commBall?.commentaryBallByBallId,
        // totalSix ,
        // totalFour,
        batter1Runs: part.batsmen[0].runs,
        batter2Runs: part.batsmen[1].runs,
        batter1Balls: part.batsmen[0].balls,
        batter2Balls: part.batsmen[1].balls,
        order: response?.live?.live_score?.wickets + 1,
        isActive: true
      },
      commentaryDetails: comDetails,
      updateBattingTeam: battingTeam
    })
    const createPart = await virtualPartnershipQuery(
      partnership,
      request,
      fastify
    );
    global.tblCommentaryPartnership.push(createPart);
    createPart.type = "create";
    prtship.push(createPart)
  }
  return prtship;
}

const storeInningWiseEntityDataService = async (request, fastify) => {
  let importData = null;
  try {
    const { matchId } = request.body;
    request.body.refId = matchId;
    request.body.refType = RefType.InningDataUpdate;
    request.body.sourceId = SourceID.EntitySport;
    request.body.isImportStart = true;
    request.body.importStartTime = new Date();
    importData = await insertAutoImportDataQuery(request.body, fastify, request);
    let comDetails = global.tblCommentaries.find(item => item.tpId == matchId);
    if (!comDetails) {
      throw new Error("Commentary not found with this matchId");
    }

    let inningWiseRes = []
    let upComDetails = {};
    let url = `/match/${matchId}/info`;
    const infoRes = await callEntitySportAPI(url, request, fastify);
    let matchInfoData = infoRes?.data?.result;
    if (!matchInfoData) {
      errorLogger(
        fastify,
        "Invalid response from Entit-Sport API", "/services/entitySport.js/storeInningWiseEntityDataService - entitySportMatchInfoResponse",
        "/services/entitySport.js/storeInningWiseEntityDataService",
        request
      );
      throw new Error("Match Info API not found");
    }
    let liveInningNumber = matchInfoData?.match_info?.latest_inning_number ||
      matchInfoData?.live?.live_inning_number;
    const gameState = matchInfoData?.match_info?.game_state ?? matchInfoData?.live?.game_state;
    const entityStatus = matchInfoData?.match_info?.status;

    if (comDetails?.commentaryStatus == commentaryStatus.OPEN) {
      const tossInfo = matchInfoData?.match_info?.toss;
      if (!tossInfo || tossInfo.winner == 0) throw new Error("Toss not done");

      const scoreResponse = {};
      const sendDataForSocketUpdate = {
        commentaryId: comDetails?.commentaryId ?? null,
        eventRefId: comDetails?.eventRefId ?? null,
        dataToUpdate: [],
      };

      const teams = global.tblCommentaryTeams.filter(
        t => t.commentaryId == comDetails.commentaryId &&
          t.currentInnings == comDetails.currentInnings
      );

      const team1 = teams.find(t => t.tpId == tossInfo.winner);
      const team2 = teams.find(t => t.commentaryTeamId !== team1.commentaryTeamId);
      if (!team1 || !team2) throw new Error("Teams not found");

      const battingFirst = tossInfo.decision == 1 ? team1 : team2;
      const bowlingFirst = tossInfo.decision == 1 ? team2 : team1;

      const comTeams = [
        { ...battingFirst, teamStatus: 1, teamBattingOrder: 1, subInning: 1 },
        { ...bowlingFirst, teamStatus: 2, teamBattingOrder: 2, subInning: 2 },
      ];
      let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
      upComDetails = {
        ...comDetails,
        commentaryStatus: commentaryStatus.TOSSDONE,
        tossWonBy: team1.teamId,
        choseTo: tossInfo.decision,
        tossRmk: `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
        displayStatus: `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
      }
      let commentaryId = comDetails.commentaryId;

      let updatedData = await fastify.db.query(
        `CALL proc_commentary_toss($1, $2, $3)`,
        {
          bind: [
            comTeams ? JSON.stringify(comTeams) : null,
            upComDetails ? JSON.stringify(upComDetails) : null,
            commentaryId,
          ],
          type: fastify.db.QueryTypes.SELECT,
        }
      );
      updatedData = updatedData[0];
      if (upComDetails) {
        let comI = global.tblCommentaries.findIndex((c) => c.commentaryId == upComDetails.commentaryId)
        global.tblCommentaries[comI] = {
          ...global.tblCommentaries[comI],
          modifyDate: upComDetails.modifyDate,
          commentaryStatus: upComDetails.commentaryStatus,
          tossWonBy: upComDetails.tossWonBy,
          choseTo: upComDetails.choseTo,
          tossRmk: upComDetails.tossRmk,
          displayStatus: upComDetails.displayStatus,
        };
        scoreResponse.commentaryDetails = global.tblCommentaries[comI]
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryDetails",
          type: "update",
          data: scoreResponse.commentaryDetails,
        });
      }
      if (comTeams && comTeams.length > 0) {
        scoreResponse.commentaryTeams = [];
        for (let ct of comTeams) {
          let comTI = global.tblCommentaryTeams.findIndex((c) => c.commentaryTeamId == ct.commentaryTeamId)
          global.tblCommentaryTeams[comTI] = {
            ...global.tblCommentaryTeams[comTI],
            teamStatus: ct.teamStatus,
            teamBattingOrder: ct.teamBattingOrder,
            subInning: ct.subInning,
          };
          scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
        }
        scoreResponse.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryTeams",
          type: "update",
          data: scoreResponse.commentaryTeams.map((team) => ({
            ...team,
            crr: parseFloat(team?.crr) || 0,
            rrr: parseFloat(team?.rrr) || 0,
          })),
        });
      }

      const cData = await getMatchDataByCId(
        {
          commentaryId: comDetails?.commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
        },
        request,
        fastify
      ).catch((err) => {
        console.log("call client api in storeInningData", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/entitysport.js/storeInningWiseEntityDataService",
          request
        );
      });

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }
    if (!liveInningNumber || liveInningNumber == 0) return;

    for (let i = 1; i <= liveInningNumber; i++) {
      let url = `/match/${matchId}/innings/${i}/commentary`;
      const entitySportMatch = await callEntitySportAPI(url, request, fastify);
      let entitySportMatchResponse = entitySportMatch?.data?.result;
      if (!entitySportMatchResponse) {
        errorLogger(
          fastify,
          "Invalid response from Entit-Sport API", "/services/entitySport.js/storeInningWiseEntityDataService - entitySportInningDataResponse",
          "/services/entitySport.js/storeInningWiseEntityDataService",
          request
        );
        throw new Error("Inning wise data API not found");
      }

      if (!entitySportMatchResponse?.commentaries?.length) continue;
      const commentaries = entitySportMatchResponse?.commentaries;

      if (upComDetails?.commentaryStatus == commentaryStatus.TOSSDONE ||
        comDetails?.commentaryStatus == commentaryStatus.TOSSDONE ||
        comDetails?.commentaryStatus == commentaryStatus.INNINGCHANGE ||
        upComDetails?.commentaryStatus == commentaryStatus.INNINGCHANGE) {
        upComDetails.commentaryStatus = commentaryStatus.INPROGRESS
      }
      const inningData = entitySportMatchResponse?.inning;
      const teams = global.tblCommentaryTeams.filter((i) => i.commentaryId == comDetails.commentaryId &&
        i.currentInnings == comDetails.currentInnings);
      let batCompleteCheck = teams.find((t) =>
        t.tpId == inningData?.batting_team_id &&
        t.isBattingComplete == true
      );
      if (batCompleteCheck) {
        continue;
      }
      let battingTeam = teams.find((i) => i.teamStatus == 1)
      let bowlingTeam = teams.find((i) => i.teamStatus == 2)

      let batsmen = inningData?.batsmen || [];
      let bowlers = inningData?.bowlers || [];
      let partData = [];

      // store ballbyball
      let playerTpIdObj = {};
      let comPlayers = global.tblCommentaryPlayers.filter((cp) => cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)

      for (let cp of comPlayers) {
        playerTpIdObj[cp.tpId] = {
          ...cp,
          playerName: cp.playerName,
          playerId: cp.playerId,
        };
      }

      let ballbyball = [];
      let upTeams = [];
      const playersMap = {};
      const oversMap = {};
      const wickets = [];
      let ltSetOrder = 0;

      // Find the current max batter order from global data
      let currentPlayers = []
      const existingBatters = global.tblCommentaryPlayers.filter(i =>
        i.commentaryId === comDetails.commentaryId &&
        i.currentInnings === comDetails.currentInnings &&
        i.teamId === battingTeam.teamId &&
        i.batterOrder != null
      ) || []

      ltSetOrder = existingBatters.length
        ? Math.max(...existingBatters?.map(i => i.batterOrder))
        : 0;

      // partnership create and update
      let statsURL = `/match/${matchId}/statistics`;
      const entitySportMatchStats = await callEntitySportAPI(statsURL, request, fastify);
      let entitySportMatchStatsResponse = entitySportMatchStats?.data?.result;
      if (!entitySportMatchStatsResponse) {
        errorLogger(
          fastify,
          "Invalid response from Entit-Sport API", "/services/entitySport.js/storeInningWiseEntityDataService - entitySportMatchStatsResponse",
          "/services/entitySport.js/storeInningWiseEntityDataService",
          request
        );
        throw new Error("Match statistics data API not found");
      }

      const statsData = entitySportMatchStatsResponse?.innings.find(item => 
        item.inning_id == inningData?.iid
      );
      const partnershpData = statsData?.statistics?.partnership
      if (partnershpData.length > 0) {
        for (const part of partnershpData) {
          let [b1, b2] = part?.batsmen;
          let batter1 = b1?.batsman_id;
          let batter2 = b2?.batsman_id;
          if (!playerTpIdObj[batter1] || !playerTpIdObj[batter2]) {
            request.body.response = { match_id: matchId };
            await updateCommentaryPlayersFromEntityService(request, fastify);
            let latestPlayers = global.tblCommentaryPlayers.filter(
              (cp) =>
                cp.commentaryId == comDetails.commentaryId &&
                cp.currentInnings == comDetails.currentInnings
            );

            for (let cp of latestPlayers) {
              if (!playerTpIdObj[cp.tpId]) {
                playerTpIdObj[cp.tpId] = {
                  ...cp,
                  playerName: cp.playerName,
                  playerId: cp.playerId,
                };
              }
            }
          }
          let liveInningData = matchInfoData?.live?.live_inning;
          let activePartnership =
            liveInningData?.iid === inningData?.iid &&
            [batter1, batter2].every(id =>
              liveInningData?.current_partnership?.batsmen?.some(
                item => item.batsman_id === id
              )
            );

          let partExist = global.tblCommentaryPartnership.find((i) =>
            i.commentaryId == comDetails.commentaryId &&
            i.currentInnings == comDetails.currentInnings &&
            (
              (i.batter1Id == playerTpIdObj[batter1].commentaryPlayerId && i.batter2Id == playerTpIdObj[batter2].commentaryPlayerId) ||
              (i.batter1Id == playerTpIdObj[batter2].commentaryPlayerId && i.batter2Id == playerTpIdObj[batter1].commentaryPlayerId)
            )
          );
          if (partExist) {
            let comPlayerId1 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter1Id)
            let comPlayerId2 = global.tblCommentaryPlayers.find((i) => i.commentaryPlayerId == partExist.batter2Id)
            let cp1 = part.batsmen.find((i) => i.batsman_id == comPlayerId1.tpId)
            let cp2 = part.batsmen.find((i) => i.batsman_id == comPlayerId2.tpId)
            let partnership = {
              ...partExist,
              totalRuns: part.runs,
              totalBalls: part.balls_faced,
              batter1Runs: cp1.runs,
              batter2Runs: cp2.runs,
              batter1Balls: cp1.balls_faced,
              batter2Balls: cp2.balls_faced,
              isActive: activePartnership,
            }
            partData.push({
              ...partnership,
              type: "update"
            })
          } else {
            let cp1 = playerTpIdObj[part.batsmen[0].batsman_id]
            let cp2 = playerTpIdObj[part.batsmen[1].batsman_id]
            let newPart = genEtPartnership({
              currentPartnership: {
                batter1Id: cp1.commentaryPlayerId,
                batter1Name: cp1.playerName,
                batter2Id: cp2.commentaryPlayerId,
                batter2Name: cp2.playerName,
                totalRuns: part.runs,
                totalBalls: part.balls_faced,
                commentaryBallByBallId: 0,
                batter1Runs: part.batsmen[0].runs,
                batter2Runs: part.batsmen[1].runs,
                batter1Balls: part.batsmen[0].balls_faced,
                batter2Balls: part.batsmen[1].balls_faced,
                order: part?.order,
                isActive: activePartnership,
              },
              commentaryDetails: comDetails,
              updateBattingTeam: battingTeam
            })
            partData.push({
              ...newPart,
              order: part?.order,
              type: "create"
            })
          }
        }
      }

      if (batsmen.length > 0) {
        for (let p of batsmen) {
          if (!playerTpIdObj[p.batsman_id]) {
            request.body.response = { match_id: matchId };
            await updateCommentaryPlayersFromEntityService(request, fastify);
            let latestPlayers = global.tblCommentaryPlayers.filter(
              (cp) =>
                cp.commentaryId == comDetails.commentaryId &&
                cp.currentInnings == comDetails.currentInnings
            );

            for (let cp of latestPlayers) {
              if (!playerTpIdObj[cp.tpId]) {
                playerTpIdObj[cp.tpId] = {
                  ...cp,
                  playerName: cp.playerName,
                  playerId: cp.playerId,
                };
              }
            }
          }
          let comP = playerTpIdObj[p.batsman_id];
          let onStrikeData = p?.position === "striker";
          let isPlayData = p?.batting === "true";
          if (comP) {
            let batterOrder = comP.batterOrder;

            if (batterOrder == null) {
              ltSetOrder += 1;
              batterOrder = ltSetOrder;
            }

            playersMap[p.batsman_id] = {
              ...comP,
              // isPlay: isPlayData,
              isPlay: isPlayData ? true : null,
              onStrike: onStrikeData,
              batRun: p.runs,
              batBall: p.balls_faced,
              batDotBall: p.run0,
              batFour: p.fours,
              batSix: p.sixes,
              batterOrder,
              batsmanStrikeRate: parseFloat(p.strike_rate) ?? "0",
            };
            currentPlayers.push(comP.commentaryPlayerId);
          }
        }
      }
      let ltSetBowlerOrder = 0;
      // find the latest bowler order already stored for this innings/team
      const existingBowlers = global.tblCommentaryPlayers.filter(i =>
        i.commentaryId === comDetails.commentaryId &&
        i.currentInnings === comDetails.currentInnings &&
        i.teamId === bowlingTeam?.teamId &&
        i.bowlerOrder != null
      ) || []

      ltSetBowlerOrder = existingBowlers.length
        ? Math.max(...existingBowlers?.map(i => i.bowlerOrder))
        : 0;

      if (bowlers.length > 0) {
        for (let b of bowlers) {
          if (!playerTpIdObj[b.bowler_id]) {
            request.body.response = { match_id: matchId };
            await updateCommentaryPlayersFromEntityService(request, fastify);
            let latestPlayers = global.tblCommentaryPlayers.filter(
              (cp) =>
                cp.commentaryId == comDetails.commentaryId &&
                cp.currentInnings == comDetails.currentInnings
            );

            for (let cp of latestPlayers) {
              if (!playerTpIdObj[cp.tpId]) {
                playerTpIdObj[cp.tpId] = {
                  ...cp,
                  playerName: cp.playerName,
                  playerId: cp.playerId,
                };
              }
            }
          }
          let currentBowler = b?.bowling == "true"
          let comP = playerTpIdObj[b.bowler_id];
          if (comP) {
            let bowlerOrder = comP.bowlerOrder;
            if (bowlerOrder == null) {
              ltSetBowlerOrder += 1;
              bowlerOrder = ltSetBowlerOrder;
            }
            playersMap[b.bowler_id] = {
              ...comP,
              // isPlay: currentBowler,
              isPlay: currentBowler ? true : null,
              onStrike: false,
              bowlerOver: b.overs,
              bowlerRun: b.runs_conceded,
              bowlerTotalWicket: b.wickets,
              bowlerEconomy: parseFloat(b.econ) ?? "0",
              bowlerOrder,
              bowlerMaidenOver: b?.maidens ?? 0,
              bowlerWideBall: b.wides,
              bowlerNoBall: b.noballs,
              bowlerDotBall: b.run0
            };
            currentPlayers.push(comP.commentaryPlayerId);
          }

        }
      }

      // find nonplaying player and set isPlay null
      let nonPlayingPlayers = comPlayers.filter((i) => i.isPlay == true && !currentPlayers.includes(i.commentaryPlayerId));
      for (let npp of nonPlayingPlayers) {
        playersMap[npp.tpId] = {
          ...npp,
          isPlay: null,
        }
      }

      for (let c of commentaries) {
        let updateBall = {}
        let tpId = c.event_id;
        let event = c.event;

        if (event == "ball") {
          let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
          if (index !== -1) continue;
          let run = c.run || 0;
          const isBoundary = c.four === true || c.six === true;
          let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          // let nonStrike = strikePId
          let nonStrikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId;

          battingTeam["teamScore"] += run;
          battingTeam.teamOver = `${c.over}.${c.ball}`;

          const overNumber = Number(c.over);
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
          if (!over) {
            over = global.tblOvers.find((i) => i.commentaryId == comDetails.commentaryId
              && i.currentInnings == comDetails.currentInnings
              && i.over == c.over
              && i.teamId == battingTeam.teamId);
          }

          if (over) {
            over.type = "update";
          } else {
            // generate new over
            let newOver = generateOverEt({
              commentaryDetails: comDetails,
              teams: {
                battingTeam: battingTeam,
                bowlingTeam,
              },
              bowler: playerTpIdObj[c.bowler_id],
              overNumber: c.over,
            })
            over = await virtualOverQuery(newOver, request, fastify);
            // add over to global variable
            global.tblOvers.push(over);
            over.type = "create";
            const commentaryBallByBall = {
              commentaryBallByBallId: 0,
              commentaryId: comDetails?.commentaryId,
              teamId: battingTeam.teamId,
              overId: over?.overId,
              overCount: `${c.over}.0`,
              currentOverBalls: 0,
              bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
              batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
              batNonStrikeId: nonStrikePId,
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
              ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
              ballFielderId1: 0,
              devOver: null,
              devCurrentOverBall: null,
              ballFielderId2: 0,
              overIsMaiden: false,
              nextBatStrikeId: strikePId,
              nextBatNonStrikeId: nonStrikePId,
              currentInnings: comDetails.currentInnings,
              commentaryPartnershipId: 0,
              // commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
              teamScore: battingTeam?.teamScore || 0,
              teamWicket: battingTeam?.teamWicket || 0,
              // tpId : c.event_id
            };
            const oball = await virtualBallByBallQuery(
              commentaryBallByBall,
              request,
              fastify
            );
            // add ball to global variable
            global.tblCommentaryBallByBall.push(oball);
            oball.type = "create";
            ballbyball.push(oball)
          }
          oversMap[overKey] = over;
          if (!playersMap[c.batsman_id]) {
            playersMap[c.batsman_id] = {
              ...playerTpIdObj[c.batsman_id],
            }
          }
          if (!playersMap[c.bowler_id]) {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
            }
          }
          if (c.score && String(c.score).includes('wd')) {
            const wideRun = Number(c?.wide_run) ?? 0;
            const runToUpdate = Number(c?.bat_run) ?? 0;
            updateBall = {
              ballIsCount: false,
              ballType: BALL_TYPE.WIDE,
              ballRun: runToUpdate,
              batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
              batNonStrikeId: nonStrikePId,
              teamId: battingTeam.teamId,
              overId: over.overId,
              nextBatStrikeId: strikePId,
              nextBatNonStrikeId: nonStrikePId,
              ballExtraRun: wideRun,
              tpId: c.event_id,
              commentary: c?.commentary,
            }

            // battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            // battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamWideRuns += wideRun ?? 0;
            over.totalRun += c.run;
            over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.totalWideBall += 1;
            over.totalWideRun += wideRun;
            over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
            updateBall.overCount = battingTeam.teamOver;
            updateBall.currentOverBalls = c?.ball;

            playersMap[c.bowler_id].bowlerWideBallRun = (playersMap[c.bowler_id].bowlerWideBallRun || 0) + wideRun;
            updateBall.bowlerId = playersMap[c.bowler_id].commentaryPlayerId;
          } else if (c.score && String(c.score).includes('nb')) {
            const runToUpdate = Number(c?.bat_run) ?? 0;
            const noBallRun = Number(c?.noball_run) ?? 0;

            updateBall = {
              ballIsCount: false,
              ballType: BALL_TYPE.NO_BALL,
              ballRun: runToUpdate,
              batStrikeId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
              batNonStrikeId: nonStrikePId,
              teamId: battingTeam.teamId,
              overId: over.overId,
              nextBatStrikeId: strikePId,
              nextBatNonStrikeId: nonStrikePId,
              ballExtraRun: noBallRun,
              tpId: c.event_id,
              commentary: c?.commentary,
            }

            // battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            // battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamNoBallRuns += noBallRun ?? 0;
            over.totalRun += c.run;
            over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.totalNoball += 1;
            over.totalNoBallRun += noBallRun;
            over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
            updateBall.overCount = battingTeam.teamOver;
            updateBall.currentOverBalls = c.ball;

            playersMap[c.bowler_id].bowlerNoBallRun = (playersMap[c.bowler_id].bowlerNoBallRun || 0) + noBallRun;
            updateBall.bowlerId = playersMap[c.bowler_id].commentaryPlayerId;
          } else {
            let ball_Type = BALL_TYPE.REGULAR;
            if (Number(c?.legbye_run) > 0) {
              ball_Type = BALL_TYPE.LEG_BYE;
              battingTeam.teamLegByRuns += Number(c?.legbye_run) ?? 0;
            } else if (Number(c?.bye_run) > 0) {
              ball_Type = BALL_TYPE.BYE;
              battingTeam.teamByRuns += Number(c?.bye_run) ?? 0;
            }


            if (c?.commentary?.toLowerCase().includes("retired")) {
              const retiredBatter = batsmen.find(batsman => {
                const isRetired =
                  batsman?.how_out?.toLowerCase() === "retired hurt" ||
                  batsman?.dismissal?.toLowerCase() === "retired";
                const isNameMatch = c.commentary?.toLowerCase().includes(batsman?.name?.toLowerCase());
                return isRetired && isNameMatch;
              });
              if (retiredBatter && playerTpIdObj[retiredBatter.batsman_id]) {
                if (!playersMap[retiredBatter.batsman_id]) {
                  playersMap[retiredBatter.batsman_id] = {
                    ...playerTpIdObj[retiredBatter.batsman_id],
                  }
                }
                playersMap[retiredBatter.batsman_id] = {
                  ...playersMap[retiredBatter.batsman_id],
                  isBatterRetir: true,
                  isPlay: null,
                  onStrike: null
                }
                ball_Type = BALL_TYPE.RETIRED_HURT
              }
            }

            updateBall = {
              ballIsCount: true,
              ballType: ball_Type,
              ballRun: c.run,
              batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
              batNonStrikeId: nonStrikePId,
              teamId: battingTeam.teamId,
              overId: over.overId,
              nextBatStrikeId: strikePId,
              nextBatNonStrikeId: nonStrikePId,
              tpId: c.event_id,
              commentary: c?.commentary,
            }

            battingTeam.teamOver = `${c.over}.${c.ball}`;
            // battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            // battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;

            over.ballCount = c.ball;
            over.totalRun += c.run;
            over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
            over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            if (ball_Type == BALL_TYPE.LEG_BYE) {
              over.totalLegByesRun += Number(c.legbye_run) ?? 0;
              playersMap[c.bowler_id].bowlerLegByeBall = (playersMap[c.bowler_id].bowlerLegByeBall || 0) + 1;
              playersMap[c.bowler_id].bowlerLegByeBallRun = (playersMap[c.bowler_id].bowlerLegByeBallRun || 0) + Number(c?.legbye_run);
            }
            if (ball_Type == BALL_TYPE.BYE) {
              over.totalByesRun += Number(c.bye_run) ?? 0;
              playersMap[c.bowler_id].bowlerByeBall = (playersMap[c.bowler_id].bowlerByeBall || 0) + 1
              playersMap[c.bowler_id].bowlerByeBallRun = (playersMap[c.bowler_id].bowlerByeBallRun || 0) + Number(c?.bye_run);
            }
            updateBall.overCount = battingTeam.teamOver;
            updateBall.currentOverBalls = over.ballCount;
            updateBall.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
            playersMap[c.bowler_id].bowlerTotalBall = (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
          }
          if (run === 0) {
            updateBall.ballIsDot = true;
            over.dotBall = over.dotBall + 1;
          } else if (isBoundary) {
            if (c.run == 4 && c.four == true) {
              updateBall.ballIsBoundry = true;
              updateBall.ballFour = 1;
              over.totalFour = over.totalFour + 1;
              playersMap[c.bowler_id].bowlerFour += 1;
            }
            if (c.run == 6 && c.six == true) {
              updateBall.ballIsBoundry = true;
              updateBall.ballSix = 1;
              over.totalSix = over.totalSix + 1;
              playersMap[c.bowler_id].bowlerSix += 1
            }
          } else if (c.run % 2 != 0) {
            updateBall.nextBatStrikeId = nonStrikePId;
            updateBall.nextBatNonStrikeId = strikePId;
          }
          const ballByBallUp = generateBallET(
            {
              updateBall,
              commentaryBallByBallId: 0,
              updateBattingTeam: battingTeam,
              updateOver: over,
              updateBatter: playerTpIdObj[c.batsman_id],
              updateBowler: playerTpIdObj[c.bowler_id],
              nonStrikeBatter: null,
              // updatePartnership: partnership,
              commentaryDetails: comDetails,
            },
            request
          );
          const oball = await virtualBallByBallQuery(
            ballByBallUp,
            request,
            fastify
          );
          global.tblCommentaryBallByBall.push(oball)
          oball.type = "create";
          ballbyball.push(oball)
        }

        if (event == "wicket") {
          let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
          if (index !== -1) continue;
          let run = c.run || 0;
          let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          let nonStrike = strikePId
          let nonStrikePId = playerTpIdObj[nonStrike]?.commentaryPlayerId;

          battingTeam["teamScore"] += run;
          battingTeam.teamOver = `${c.over}.${c.ball}`;

          const overNumber = Number(c.over);
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
          if (!over) {
            over = global.tblOvers.find((i) => i.commentaryId == comDetails.commentaryId
              && i.currentInnings == comDetails.currentInnings
              && i.over == c.over
              && i.teamId == battingTeam.teamId);
          }

          if (over) {
            over.type = "update";
          } else {
            // generate new over
            let newOver = generateOverEt({
              commentaryDetails: comDetails,
              teams: {
                battingTeam: battingTeam,
                bowlingTeam,
              },
              bowler: playerTpIdObj[c.bowler_id],
              overNumber: c.over,
            })
            over = await virtualOverQuery(newOver, request, fastify);
            // add over to global variable
            global.tblOvers.push(over);
            over.type = "create";
            const commentaryBallByBall = {
              commentaryBallByBallId: 0,
              commentaryId: comDetails?.commentaryId,
              teamId: battingTeam.teamId,
              overId: over?.overId,
              overCount: `${c.over}.0`,
              currentOverBalls: 0,
              bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
              batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
              batNonStrikeId: nonStrikePId,
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
              ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
              ballFielderId1: 0,
              devOver: null,
              devCurrentOverBall: null,
              ballFielderId2: 0,
              overIsMaiden: false,
              nextBatStrikeId: strikePId,
              nextBatNonStrikeId: nonStrikePId,
              currentInnings: comDetails.currentInnings,
              commentaryPartnershipId: 0,
              // commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
              teamScore: battingTeam?.teamScore || 0,
              teamWicket: battingTeam?.teamWicket || 0,
              // tpId : c.event_id
            };
            const oball = await virtualBallByBallQuery(
              commentaryBallByBall,
              request,
              fastify
            );
            // add ball to global variable
            global.tblCommentaryBallByBall.push(oball);
            oball.type = "create";
            ballbyball.push(oball)
          }
          oversMap[overKey] = over;
          if (!playersMap[c.batsman_id]) {
            playersMap[c.batsman_id] = {
              ...playerTpIdObj[c.batsman_id],
            }
          }
          if (!playersMap[c.bowler_id]) {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
            }
          }

          if (playersMap[c.bowler_id]) {
            playersMap[c.bowler_id].bowlerTotalBall = (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
          } else {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
              isPlay: true,
              bowlerTotalBall: playersMap[c.bowler_id].bowlerTotalBall ? playersMap[c.bowler_id].bowlerTotalBall + 1 : 1,
            }
          }

          let wicketBatsId = c.wicket_batsman_id || c.batsman_id;
          let batsmanId = playerTpIdObj[wicketBatsId]?.commentaryPlayerId;
          const fielders = batsmen?.find((i1) => i1.batsman_id == wicketBatsId);
          const dismissalKey =
            typeof fielders?.dismissal === "string"
              ? fielders?.dismissal.trim().toLowerCase()
              : null;

          const wicket_type = etWicketObj[dismissalKey] ?? wicketTypeObj.BOLD;
          battingTeam.teamWicket = (Number(battingTeam.teamWicket) || 0) + 1;
          const entityWicketCount = battingTeam.teamWicket;
          const commFielder = Number(fielders?.first_fielder_id) || Number(c?.bowler_id);
          const commFielder2 = Number(fielders?.second_fielder_id) || Number(c?.bowler_id);

          const commFielder1Id = playerTpIdObj[commFielder]?.commentaryPlayerId;
          const commFielder2Id = playerTpIdObj[commFielder2]?.commentaryPlayerId;

          let wicketData = {
            wicketType: wicket_type,
            batterId: batsmanId,
            batterName: playerTpIdObj[wicketBatsId]?.playerName,
            runs: c?.run ?? 0,
            fieldPlayerId: commFielder1Id,
            fieldPlayerName: playerTpIdObj[commFielder]?.playerName,
            fieldPlayer2Id: commFielder2Id,
            fieldPlayer2Name: playerTpIdObj[commFielder2]?.playerName,
            bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerName: playerTpIdObj[c.bowler_id]?.playerName,
            playerRun: playersMap[wicketBatsId]?.batRun,
            playerBalls: playersMap[wicketBatsId]?.batBall,
            ballCount: c?.ball || 0,
            wicketCount: entityWicketCount,
          };
          // battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
          // battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
          over.totalWicket = (over.totalWicket || 0) + 1;
          over.totalRun += c?.run ?? 0;
          over.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
          over.ballCount = c.ball;
          over.dotBall += 1;
          over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          let typeOfBall = BALL_TYPE.REGULAR
          if (c?.commentary?.toLowerCase().includes("retired")) {
            const retiredBatter = batsmen.find(batsman => {
              const isRetired =
                batsman?.how_out?.toLowerCase() === "retired hurt" ||
                batsman?.dismissal?.toLowerCase() === "retired";
              const isNameMatch = c.commentary?.toLowerCase().includes(batsman?.name?.toLowerCase());
              return isRetired && isNameMatch;
            });
            if (retiredBatter && playerTpIdObj[retiredBatter.batsman_id]) {
              if (!playersMap[retiredBatter.batsman_id]) {
                playersMap[retiredBatter.batsman_id] = {
                  ...playerTpIdObj[retiredBatter.batsman_id],
                }
              }
              playersMap[retiredBatter.batsman_id] = {
                ...playersMap[retiredBatter.batsman_id],
                isBatterRetir: true,
                isPlay: null,
                onStrike: null
              }
              typeOfBall = BALL_TYPE.RETIRED_HURT
            }
          }
          if (playersMap[wicketBatsId]) {
            playersMap[wicketBatsId] = {
              ...playersMap[wicketBatsId],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicket_type,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fieldPlayerId,
              fielderId2: wicketData.fieldPlayer2Id,
              isPlay: null,
              onStrike: null,
            }
          } else {
            playersMap[wicketBatsId] = {
              ...playerTpIdObj[wicketBatsId],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicket_type,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fieldPlayerId,
              fielderId2: wicketData.fieldPlayer2Id,
              isPlay: null,
              onStrike: null,
            }
          }
          let updateBall = {
            ballIsWicket: true,
            ballWicketType: wicket_type,
            ballFielderId1: wicketData.fieldPlayerId,
            ballFielderId2: wicketData.fieldPlayer2Id,
            batStrikeId: playerTpIdObj[wicketBatsId]?.commentaryPlayerId,
            batNonStrikeId: nonStrikePId,
            ballPlayerId: playerTpIdObj[wicketBatsId]?.commentaryPlayerId,
            ballIsCount: true,
            ballType: typeOfBall,
            ballRun: wicketData.runs,
            ballIsDot: true,
            tpId: c.event_id,
            currentOverBalls: c.ball,
            commentary: c?.commentary,
          };
          const ballByBallUp = generateBallET(
            {
              updateBall,
              commentaryBallByBallId: 0,
              updateBattingTeam: battingTeam,
              updateOver: over,
              updateBatter: playersMap[c.batsman_id],
              updateBowler: playersMap[c.bowler_id],
              nonStrikeBatter: null,
              // updatePartnership: partnership,
              commentaryDetails: comDetails,
              tpId: c.event_id
            },
            request
          );
          const oball = await virtualBallByBallQuery(
            ballByBallUp,
            request,
            fastify
          );
          global.tblCommentaryBallByBall.push(oball)
          oball.type = "create";
          ballbyball.push(oball);

          const generateWicket1 = generateWicket({
            commentaryDetails: comDetails,
            currentWicket: wicketData,
            currentOver: over,
            battingTeam: battingTeam,
            currentBall: oball,
          });
          const comWicketData = await createCommWicketQuery(generateWicket1, fastify, request);
          global.tblCommentaryWicket.push(comWicketData)
          comWicketData.type = "create";
          wickets.push(comWicketData);
        }

        if (event == "overend") {
          const overEndNumber = c.over - 1;

          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overEndNumber}`;
          let over = oversMap[overKey];
          battingTeam.teamOver = c.over;
          if (over) {
            const gOver = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if (gOver && gOver.isComplete) {
              delete oversMap[overKey];
              continue;
            }
            over.isComplete = true;
            over.isMaiden = getBowlerOnlyRuns(over) < 1;
            over.teamScore = c.score;
          } else {
            const overET = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if (overET) {
              if (overET.isComplete) {
                delete oversMap[overKey];
                continue;
              }
              overET.isComplete = true;
              overET.isMaiden = getBowlerOnlyRuns(overET) < 1;
              overET.teamScore = c.score;
              oversMap[overKey] = overET;
            }
          }
        }
        if (liveInningNumber > i || gameState == EntityCommentaryStatus.INNINGCHANGE) {
          upComDetails.commentaryStatus = commentaryStatus.INNINGCHANGE;
          upTeams = [
            { ...battingTeam, isBattingComplete: true, teamStatus: 2 },
            { ...bowlingTeam, isBattingComplete: false, teamStatus: 1 },
          ]
        } else {
          upTeams = [battingTeam, bowlingTeam]
        }
      }
      inningWiseRes.push({ InningNumber: i, inningResponse: entitySportMatchResponse })
      let plyArr = Object.values(playersMap);
      let overArr = Object.values(oversMap)

      await syncEntitySportCommentaryService({
        commentaryId: comDetails.commentaryId,
        commentaryDetails: {
          ...comDetails,
          ...upComDetails
        },
        commentaryPlayers: plyArr,
        commentaryBallByBall: ballbyball,
        commentaryOvers: overArr,
        commentaryTeams: upTeams,
        commentaryPartnership: partData,
        commentaryWicket: wickets
      }, fastify, request)
    }
    if (gameState == EntityCommentaryStatus.DEFAULT && entityStatus != EntityMatchStatus.SCHEDULED &&
      comDetails.commentaryStatus != commentaryStatus.COMPLETED) {
      await matchCompleteService({ response: matchInfoData }, fastify, comDetails)
    }
    const scoreTypeData = {
      commentaryId: comDetails.commentaryId,
      scoringType: ScoringTypes.Entity,
      tpId: matchId
    }
    await scoringTypeCommentaryQuery(scoreTypeData, fastify, request);
    const index = global.tblCommentaries.findIndex((c) => c.commentaryId == comDetails.commentaryId);
    if (index !== -1) {
      global.tblCommentaries[index] = {
        ...global.tblCommentaries[index],
        ...scoreTypeData,
      }
    }
    importData.importEndTime = new Date();
    importData.isImported = false;
    importData.esApiResponseData = {
      InningDataRes: inningWiseRes,
      matchInfoRes: matchInfoData,
    }
    await updateAutoImportDataQuery(importData, fastify, request);

    return `Inning data inserted successfully`
  } catch (error) {
    if (importData) {
      await updateAutoImportDataQuery({ ...importData, errorStackData: error.stack }, fastify, request);
    }
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/entitySport.js/storeInningWiseEntityDataService",
      request
    );
    return null;
  }
}

const updateFullCommentaryOfBallService = async (fullCommentaries, comDetails, request, fastify) => {
  try {
    const startTime = new Date();
    let updatedData = [];
    const sendDataForSocketUpdate = {
      commentaryId: comDetails?.commentaryId,
      eventRefId: comDetails?.eventRefId,
      dataToUpdate: [],
    }
    for (const data of fullCommentaries) {
      const index = global.tblCommentaryBallByBall.findIndex(item =>
        item.tpId == data?.tpId && item.commentaryId == comDetails?.commentaryId &&
        item.commentaryBallByBallId == data?.commentaryBallByBallId
      )
      if (index == -1) {
        return;
      }
      await updateBallByBallFullCommentaryQuery(data, request, fastify);
      global.tblCommentaryBallByBall[index].commentary = data.commentary;

      updatedData.push({
        ...global.tblCommentaryBallByBall[index],
        overCount: global.tblCommentaryBallByBall[index].overCount !== null
          ? global.tblCommentaryBallByBall[index].overCount.toString() : null,
        type: "update",
      })
    }

    sendDataForSocketUpdate.dataToUpdate.push({
      module: "entityBallByBalls",
      data: updatedData
    })
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
    await commentaryLogger(
      {
        commentaryId: comDetails.commentaryId,
        requestBody: JSON.stringify(fullCommentaries),
        response: JSON.stringify(sendDataForSocketUpdate.dataToUpdate),
        global: null,
        extra: null,
        apiName: "/UpdateFullCommentary",
        reqStartTime: startTime,
      },
      null,
      fastify
    ).catch((err) => {
      console.log("commentary logger console of fullCommentary", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/entitySport.js.js/updateFullCommentaryOfBallService",
        null
      );
    });
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/entitySport.js/updateFullCommentaryOfBallService",
      request
    );
    return null;
  }
}

module.exports = {
    saveTeamsService,
    savePlayersService,
    saveCompetitionsService,
    saveCommentariesService,
    saveCountryCodesService,
    saveVenueService,
    setEntityComService,
    setEntityCom2Service,
    saveTournamentTeamPlayerService,
    handleStoreBall,
    storeInningWiseEntityDataService,
}
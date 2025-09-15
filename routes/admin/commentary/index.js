const {
  authorize,
  checkPermission,
  multiTabPermissionCheck,
} = require("../../../controller/middleware");
const {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  getAllDisplayStatus,
  getCommentaryDetailsById,
  saveCommentaryDetails,
  deleteBallByBallCommentary,
  deleteOverCommentary,
  //nitesh Updated
  getCommentaryDetailsByEventId,
  getCommentaryDetailsBycommentaryId,
  getCurrentUpdatedCommentaryID,
  cloneCommentary,
  updateMatchTypeInCommentary,
  getMatchTypeListByCommentary,
  getCommentaryDetailsBycommentaryEventId,
  changeBowlerOfCommentary,
  getCommentaryTeamList,
  updateShowClientOfCommentary,
  updatePlayersShowOfCommentary,
  testStoreProcedure,
  getTeamAndPlayerList,
  addTeamPlayer,
  deleteTeamPlayer,
  loadTeamPlayer,
  saveShortCommentary,
  updateCommentaryStatus,
  updateisPredictMarketInCommentary,
  getEventDetailsByCId,
  saveCommentaryDetailsAPI,
  loadMultiCommentary,
  activeInactiveCommentary,
  closeCommentary,
  deleteAllCommentary,
  updateDelayInCommentary,
  deleteCommentaryData,
  updateEventRefIdInCommentary,
  loadcommentaryapi,
  updateTeamPlayer,
  getPredictorLogsById,
  updateResultInCommentary,
  changeMaxOverDetail,
  AddSuperOverCommentary,
  updateTeamPrediction,
  updateLineRatio,
  deleteBallFromMemory,
  getEventSnapByCom,
  completedCommentary,
  updateEventSnapByCom,
  revertCommentary,
  getGlobalData,
  getTemplateByComId,
  saveComTemplates,
  getCommentaryBallByBall,
  saveWagonWheel,
  updateShotType,
  updateIsWheelShow,
  getTeamAndPlayerListV1,
  cancelCommentary,
  deleteEventResults,
  isCountInPointCommentary,
  multiIsCountInPointCommentary,
  getRunnerOfMarket,
  getAllCommentaryEventMarkets,
  commentaryHistory,
  deleteCommentaryHistory,
  upDLSDetails,
  updateMergeImageOnCommentaryPlayers,
  saveCommDrsLog,
  changeIsTestCom,
  changeIsEventStart,
  getAllDifficulties,
  commentaryStatus,
  commentaryStart,
  commentaryToss,
  commentaryScore,
  commentaryOverStart,
  commentarySwapPlayer,
  commentaryInningChange,
  getPitchAndSession,
  updatePitchAndSession,
  commentaryWicket,
  commentarySetPlayer,
  allPythonAPIs,
  updatePythonAPI,
  undoAPI,
  getCommDRSLogById,
  getCommDRSLogByCommId,
  dltDrs,
  takeDrsData,
  upDrsData,
  changeStrikerPly,
  changePlayer,
  changeOver,
  updateEventTypeAndCompId,
  getCommWicketById,
  updateCommWicket,
  scoringTypeCommentary,
  validatePasswordOnPredictionFalse,
  updateMatchInfo,
  overTypeChangeOnOvers,
  marketOddsdata,
  updateStreamURL,
} = require("../../../controller/users/admin/commentary/commentary");
const {
  getCompetitionListByeventTypeId,
} = require("../../../controller/users/admin/competition");
const {
  getEventId,
  getEventListcompetitionId,
} = require("../../../controller/users/admin/event");
const {
  getEventTypeList,
} = require("../../../controller/users/admin/eventTypes");
const {
  getMatchTypeList,
} = require("../../../controller/users/admin/matchType");
const {
  getAllPlayerByTeam,
} = require("../../../controller/users/admin/teamsAndPlayer/players");
const {
  getTeamList,
} = require("../../../controller/users/admin/teamsAndPlayer/teams");
const { getAllAward } = require("../../../controller/users/admin/award");
const { assignAward, getAssignAward } = require("../../../controller/users/admin/commentaryAward")
const { Commentary, ImportMarket } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary" , "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCommentaries(request, reply, fastify),
  });
  fastify.post("/history", {
    schema: Commentary.getAllCommentaryHistory.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => commentaryHistory(request, reply, fastify),
  });
  fastify.post("/matchTypeList", {
    schema: Commentary.matchTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMatchTypeList(request, reply, fastify),
  });
  fastify.post("/changeResult", {
    schema: Commentary.changeResult.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateResultInCommentary(request, reply, fastify),
  });
  fastify.post("/teamList", {
    schema: Commentary.teamList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryTeamList(request, reply, fastify),
  });
  fastify.post("/eventTypeList", {
    schema: Commentary.eventTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });
  fastify.post("/competitionListByEventTypeId", {
    schema: Commentary.competitionListByEventTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCompetitionListByeventTypeId(request, reply, fastify),
  });
  fastify.post("/eventListByCompetitionId", {
    schema: Commentary.eventListByCompetitionId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getEventListcompetitionId(request, reply, fastify),
  });
  fastify.post("/eventDataById", {
    schema: Commentary.eventDataById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventId(request, reply, fastify),
  });

  fastify.post("/playerListByTeamId", {
    schema: Commentary.playerListByTeamId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPlayerByTeam(request, reply, fastify),
  });
  fastify.post("/displayStatus", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllDisplayStatus(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: Commentary.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryById(request, reply, fastify),
  });
  fastify.post("/detailsById", {
    schema: Commentary.getByIdDetails.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCommentaryDetailsById(request, reply, fastify),
  });
  fastify.post("/getPredictorlogsById", {
    schema: Commentary.getPredictorlogsById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getPredictorLogsById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Commentary.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: request.body.commentaryId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => addCommentary(request, reply, fastify),
  });
  // fastify.post("/updateCommentaryStatus", {
  //   schema: Commentary.updateCommentaryStatus.schema,
  //   preHandler: [
  //     (request, reply) => authorize(request, reply, fastify),
  //     (request, reply, done) =>
  //       multiTabPermissionCheck(request, reply, fastify, {
  //         tabName:[ "Commentary", "Commentary List" ],
  //         mode: "edit",
  //       }),
  //   ],
  //   handler: (request, reply) =>
  //     updateCommentaryStatus(request, reply, fastify),
  // });
  fastify.post("/ballStart", {
    schema: Commentary.updateCommentaryStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updateCommentaryStatus(request, reply, fastify),
  });
  fastify.post("/updateCommentaryStatus", {
    schema: Commentary.updateCommentaryStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      commentaryStatus(request, reply, fastify),
  });

  fastify.post("/clone", {
    schema: Commentary.clone.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "add",
        }),
    ],
    handler: (request, reply) => cloneCommentary(request, reply, fastify),
  });

  fastify.post("/loadMultiCommentary", {
    schema: Commentary.loadMultiCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "add",
        }),
    ],
    handler: (request, reply) => loadMultiCommentary(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Commentary.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommentary(request, reply, fastify),
  });
  fastify.post("/saveDetails", {
    schema: Commentary.saveDetails.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => saveCommentaryDetails(request, reply, fastify),
  });
  fastify.post("/deleteBallByBall", {
    schema: Commentary.deleteBallByBall.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      deleteBallByBallCommentary(request, reply, fastify),
  });
  fastify.post("/deleteOverCommentary", {
    schema: Commentary.deleteOvers.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteOverCommentary(request, reply, fastify),
  });

  fastify.post("/getscore", {
    schema: Commentary.getBycommentaryEId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCommentaryDetailsByEventId(request, reply, fastify),
  });
  fastify.post("/getscoreByCId", {
    schema: Commentary.getBycommentaryId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsBycommentaryId(request, reply, fastify),
  });

  fastify.post("/getscoreByEId", {
    schema: Commentary.getBycommentaryEId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsBycommentaryEventId(request, reply, fastify),
  });

  fastify.post("/getCIds", {
    schema: Commentary.getAllUpdatedIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCurrentUpdatedCommentaryID(request, reply, fastify),
  });

  fastify.post("/changeMatchType", {
    schema: Commentary.changeMatchType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      updateMatchTypeInCommentary(request, reply, fastify),
  });
  fastify.post("/getMatchTypeListByCommentary", {
    schema: Commentary.getMatchTypeListByCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getMatchTypeListByCommentary(request, reply, fastify),
  });
  fastify.post("/changeBowler", {
    schema: Commentary.changeBowler.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      changeBowlerOfCommentary(request, reply, fastify),
  });
  fastify.post("/updateShowClient", {
    schema: Commentary.updateShowClient.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updateShowClientOfCommentary(request, reply, fastify),
  });
  fastify.post("/updatePlayersShow", {
    schema: Commentary.updatePlayersShow.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updatePlayersShowOfCommentary(request, reply, fastify),
  });
  fastify.post("/testSP", {
    schema: Commentary.saveDetails.schema,
    handler: (request, reply) => testStoreProcedure(request, reply, fastify),
  });
  fastify.post("/getTeamAndPlayerById", {
    schema: Commentary.getById.schema,
    handler: (request, reply) => getTeamAndPlayerList(request, reply, fastify),
  });
  fastify.post("/addTeamPlayer", {
    schema: Commentary.addTeamPlayers.schema,
    handler: (request, reply) => addTeamPlayer(request, reply, fastify),
  });
  fastify.post("/deleteTeamPlayer", {
    schema: Commentary.deleteTeamPlayer.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => deleteTeamPlayer(request, reply, fastify),
  });
  fastify.post("/loadTeamPlayer", {
    schema: Commentary.loadTeamPlayer.schema,
    handler: (request, reply) => loadTeamPlayer(request, reply, fastify),
  });
  fastify.post("/updateTeamPlayer", {
    schema: Commentary.updateTeamPlayer.schema,
    handler: (request, reply) => updateTeamPlayer(request, reply, fastify),
  });

  fastify.post("/saveShortCommentary", {
    schema: Commentary.saveShortCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "add",
        }),
    ],
    handler: (request, reply) => saveShortCommentary(request, reply, fastify),
  });
  fastify.post("/changePredictMarket", {
    schema: Commentary.changePredictMarket.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      updateisPredictMarketInCommentary(request, reply, fastify),
  });
  fastify.post("/getEventDetailsByCId", {
    schema: Commentary.getDetailsByCId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getEventDetailsByCId(request, reply, fastify),
  });
  fastify.post("/saveCommentaryDetails", {
    schema: Commentary.saveCommentaryDetails.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      saveCommentaryDetailsAPI(request, reply, fastify),
  });
  fastify.post("/activeInactiveCommentary", {
    schema: Commentary.activeInactiveCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      activeInactiveCommentary(request, reply, fastify),
  });
  fastify.post("/closeCommentary", {
    schema: Commentary.closeCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => closeCommentary(request, reply, fastify),
  });
  fastify.post("/cancelCommentary", {
    schema: Commentary.cancelCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => cancelCommentary(request, reply, fastify),
  });
  fastify.post("/deleteAllCommentary", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteAllCommentary(request, reply, fastify),
  });
  fastify.post("/changeDelay", {
    schema: Commentary.changeDelay.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      updateDelayInCommentary(request, reply, fastify),
  });
  fastify.post("/deleteCommentaryDetails", {
    schema: Commentary.deleteCommentaryData.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommentaryData(request, reply, fastify),
  });
  fastify.post("/changeEventRefId", {
    schema: Commentary.changeEventRefId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      updateEventRefIdInCommentary(request, reply, fastify),
  });

  fastify.post("/loadcommentaryapi", {
    schema: Commentary.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     multiTabPermissionCheck(request, reply, fastify, {
    //       tabName:[ "Commentary", "Commentary List" ],
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => loadcommentaryapi(request, reply, fastify),
  });

  fastify.post("/updateDLSDetail", {
    schema: Commentary.changeMaxOverDetail.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => changeMaxOverDetail(request, reply, fastify)
  });
  fastify.post("/upDLSDetail", {
    schema: Commentary.upDLSDetail.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => upDLSDetails(request, reply, fastify)
  });

  fastify.post("/addSuperOver", {
    schema: Commentary.saveSuperOver.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: request.body.commentaryId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => AddSuperOverCommentary(request, reply, fastify),
  });
  fastify.post("/updateTeamPrediction", {
    schema: Commentary.updateTeamPrediction.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: request.body.commentaryId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => updateTeamPrediction(request, reply, fastify),
  });
  fastify.post("/updatLineRatio", {
    schema: Commentary.updateLineRatio.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateLineRatio(request, reply, fastify),
  });
  fastify.post("/dltBallfromMeomory", {
    schema: Commentary.dltBallfromMeomory.schema,
    handler: (request, reply) => deleteBallFromMemory(request, reply, fastify)
  })
  fastify.post("/awards", {
    schema: Commentary.getAllAwards.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => getAllAward(request, reply, fastify),
  });
  fastify.post("/assignAward", {
    schema: Commentary.assignAward.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler: (request, reply) => assignAward(request, reply, fastify)
  })
  fastify.post("/getAssignAward", {
    schema: Commentary.getAssignAward.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler: (request, reply) => getAssignAward(request, reply, fastify)
  })
  fastify.post("/getEventSnap", {
    schema: Commentary.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler: (request, reply) => getEventSnapByCom(request, reply, fastify)
  })
  fastify.post("/updateEventSnap", {
    schema: Commentary.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler: (request, reply) => updateEventSnapByCom(request, reply, fastify)
  })
  fastify.post("/completeCommentary", {
    schema: Commentary.completedCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => completedCommentary(request, reply, fastify),
  });
  fastify.post("/revertCommentary", {
    schema: Commentary.revertCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => revertCommentary(request, reply, fastify),
  })
  fastify.post("/commentaryBallByBallIds", {
    schema: Commentary.getCommentaryBallByBallData.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryBallByBall(request, reply, fastify),
  })
  fastify.post("/wagonWheel", {
    schema: Commentary.saveWagonWheel.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => saveWagonWheel(request, reply, fastify),
  })
  fastify.post("/getGlobalData",{
    schema: Commentary.getById.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler: (request, reply) => getGlobalData(request, reply, fastify)
  })
  fastify.post("/getTemplateByCom", {
    schema : Commentary.getById.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler : (request, reply) => getTemplateByComId(request, reply, fastify)
  })
  fastify.post("/saveComTemplate", {
    schema : Commentary.saveComTemplate.schema,

    
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler : (request, reply) => saveComTemplates(request, reply, fastify)
  })
  fastify.post("/upShotType", {
    schema : Commentary.upShotType.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler : (request, reply) => updateShotType(request, reply, fastify)
  })
  fastify.post("/upIsWheelShow",{
    schema : Commentary.upIsWheelShow.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler : (request, reply) => updateIsWheelShow(request, reply, fastify)
  })
  fastify.post("/getTeamAndPlayerByIdV1", {
    schema: Commentary.getById.schema,
    handler: (request, reply) => getTeamAndPlayerListV1(request, reply, fastify),
  });

  fastify.post("/deleteResult",{
    schema: Commentary.delete.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete"
        })
    ],
    handler : (request, reply) => deleteEventResults(request, reply, fastify)
  })

  fastify.post("/isCountInPoint",{
    schema: Commentary.isCountInPointCommentary.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler : (request, reply) => isCountInPointCommentary(request, reply, fastify)
  })

  fastify.post("/changeIsCountInPoint",{
    schema: Commentary.changeIsCountInPoint.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        })
    ],
    handler : (request, reply) => multiIsCountInPointCommentary(request, reply, fastify)
  })
  fastify.post("/getRunnerOfMarket",{
    schema: ImportMarket.getMarket.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler: (request, reply) =>
      getRunnerOfMarket(request, reply, fastify),
  })
  fastify.post("/eventMarkets",{
    schema: Commentary.getEventMarketsByCommentaryId.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        })
    ],
    handler: (request, reply) => getAllCommentaryEventMarkets(request, reply, fastify),
  })
  fastify.post("/deleteCommHist", {
    schema: Commentary.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommentaryHistory(request, reply, fastify),
  });
  fastify.post("/mergeImage", {
    schema: Commentary.MergeImage.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateMergeImageOnCommentaryPlayers(request, reply, fastify),
  });
  fastify.post("/saveDrs", {
    schema: Commentary.DRSLog.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: request.body.id === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveCommDrsLog(request, reply, fastify),
  });
  fastify.post("/changeIsTest", {
    schema : Commentary.changeIsTest.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request, reply) => changeIsTestCom(request, reply, fastify),
  })
  fastify.post("/isEventStart", {
    schema : Commentary.changeIsEventStart.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request, reply) => changeIsEventStart(request, reply, fastify),
  })
  fastify.post("/allDifficulties", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => getAllDifficulties(request, reply, fastify),
  })
  fastify.post("/comStart",{
    schema : Commentary.comStart.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryStart(request,reply,fastify)
  })
  fastify.post("/comToss",{
    schema : Commentary.comToss.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryToss(request,reply,fastify)
  })
  fastify.post("/comScore",{
    schema : Commentary.comScore.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryScore(request,reply,fastify)
  })
  fastify.post("/comOverStart",{
    schema : Commentary.comOverStart.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryOverStart(request,reply,fastify)
  })
  fastify.post("/comSwapPlayer",{
    schema : Commentary.comSwapPlayer.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentarySwapPlayer(request,reply,fastify)
  })
  fastify.post("/comInningChange",{
    schema : Commentary.comInningChange.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryInningChange(request,reply,fastify)
  })
  fastify.post("/pitchAndSession",{
    schema : Commentary.GetPitchageAndSession.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        }),
    ],
    handler: (request , reply) => getPitchAndSession(request,reply,fastify)
  })
  fastify.post("/updatePitchAndSession",{
    schema : Commentary.UpdatePitchageAndSession.schema,
     preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updatePitchAndSession(request,reply,fastify)
  })
  fastify.post("/comWicket",{
    schema : Commentary.comWicket.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentaryWicket(request,reply,fastify)
  })
  fastify.post("/comSetPlayer",{
    schema : Commentary.comSetPlayer.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => commentarySetPlayer(request,reply,fastify)
  })
  fastify.post("/pythonAPIs",{
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        }),
    ],
    handler: (request , reply) => allPythonAPIs(request,reply,fastify)
  })
  fastify.post("/updatePythonAPI", {
    schema : Commentary.UpdatePythonAPI.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updatePythonAPI(request, reply, fastify)
  })
  fastify.post("/undo", {
    schema : Commentary.UndoAPI.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => undoAPI(request, reply, fastify)
  })
  fastify.post("/undoAPI", {
    schema : Commentary.UndoAPI.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => undoAPI(request, reply, fastify)
  })
  fastify.post("/drsById", {
    schema : Commentary.drsById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        }),
    ],
    handler: (request , reply) => getCommDRSLogById(request, reply, fastify)
  })
  fastify.post("/drsByCommId", {
    schema : Commentary.drsByCommentaryId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        }),
    ],
    handler: (request , reply) => getCommDRSLogByCommId(request, reply, fastify)
  })
  fastify.post("/dltDrs", {
    schema : Commentary.dltDrs.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "delete"
        }),
    ],
    handler: (request , reply) => dltDrs(request, reply, fastify)
  })
  fastify.post("/takeDrs", {
    schema : Commentary.takeDrs.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "add"
        }),
    ],
    handler: (request , reply) => takeDrsData(request, reply, fastify)
  })
  fastify.post("/upDrs", {
    schema : Commentary.upDrs.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "add"
        }),
    ],
    handler: (request , reply) => upDrsData(request, reply, fastify)
  })
  fastify.post("/changeStriker", {
    schema : Commentary.changeStriker.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => changeStrikerPly(request, reply, fastify)
  })
  fastify.post("/changePly", {
    schema : Commentary.changePly.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => changePlayer(request, reply, fastify)
  })
  fastify.post("/changeOver", {
    schema : Commentary.changeOver.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => changeOver(request, reply, fastify)
  })
  fastify.post("/changeIds", {
    schema : Commentary.updateEventTypeIdAndCompId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updateEventTypeAndCompId(request, reply, fastify)
  })
  fastify.post("/commWicketById", {
    schema : Commentary.commWicketById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "view"
        }),
    ],
    handler: (request , reply) => getCommWicketById(request, reply, fastify)
  });
  fastify.post("/updateCommWicket", {
    schema : Commentary.updateCommWicket.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updateCommWicket(request, reply, fastify)
  });
  fastify.post("/scoringType", {
    schema : Commentary.changeScoringType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => scoringTypeCommentary(request, reply, fastify)
  });
  fastify.post("/validatePass", {
    schema : Commentary.validatePassword.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => validatePasswordOnPredictionFalse(request, reply, fastify)
  });
  fastify.post("/upMatchInfo", {
    schema : Commentary.upMatchInfo.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updateMatchInfo(request, reply, fastify)
  });
  fastify.post("/overTypeChange", {
    schema : Commentary.changeOverType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => overTypeChangeOnOvers(request, reply, fastify)
  });
  fastify.post("/marketOdds", {
    handler: (request , reply) => marketOddsdata(request, reply, fastify)
  });
  fastify.post("/updateStreaming", {
    schema : Commentary.updateStreamingURLAndType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Commentary", "Commentary List" ],
          mode: "edit"
        }),
    ],
    handler: (request , reply) => updateStreamURL(request, reply, fastify)
  });
};

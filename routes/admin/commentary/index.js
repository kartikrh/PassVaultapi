const {
  authorize,
  checkPermission,
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
  getCommentaryBallByBall,
  saveWagonWheel,
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
const { Commentary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCommentaries(request, reply, fastify),
  });
  fastify.post("/matchTypeList", {
    schema: Commentary.matchTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => updateResultInCommentary(request, reply, fastify),
  });
  fastify.post("/teamList", {
    schema: Commentary.teamList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryById(request, reply, fastify),
  });
  fastify.post("/detailsById", {
    schema: Commentary.getByIdDetails.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsById(request, reply, fastify),
  });
  fastify.post("/getPredictorlogsById", {
    schema: Commentary.getPredictorlogsById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: request.body.commentaryId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => addCommentary(request, reply, fastify),
  });
  fastify.post("/updateCommentaryStatus", {
    schema: Commentary.updateCommentaryStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updateCommentaryStatus(request, reply, fastify),
  });

  fastify.post("/clone", {
    schema: Commentary.clone.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
    schema: Commentary.addTeamPlayers.schema,
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => closeCommentary(request, reply, fastify),
  });
  fastify.post("/deleteAllCommentary", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      updateEventRefIdInCommentary(request, reply, fastify),
  });

  fastify.post("/loadcommentaryapi", {
    schema: Commentary.getById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => changeMaxOverDetail(request, reply, fastify)
  });

  fastify.post("/addSuperOver", {
    schema: Commentary.saveSuperOver.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
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
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => saveWagonWheel(request, reply, fastify),
  })
};

const {
  commentaryByIdService,
  allCommentaryService,
  saveCommentaryService,
  cloneCommentaryService,
  deleteCommentaryService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  saveCommentaryDetailsService,
  deleteBallByBallCommentoriesService,
  deleteOverCommentoriesService,
  commentaryDetailsByEventIdService,
  commentaryDetailsByCommentaryIdService,
  getCurrentUpdatedCommentaryIDService,
  updateMatchTypeInCommentaryService,
  getMatchTypeListByCommentaryService,
  changeBowlerOfCommentaryService,
  getMatchListByStatus,
  getAllDetailsByEventIdService,
  getTeamListByEventTypeService,
  getCommenrtySquadDetailsService,
  getPartnershipListService,
  changeShowClientService,
  changePlayerShowService,
  getNodeEventbyEidService,
  testStoreProcedureService,
  getTeamAndPlayerListService,
  addTeamPlayerService,
  deleteTeamPlayerService,
  loadTeamPlayerService,
  saveShortCommentaryService,
  updateCommentaryStatusService,
  updateisPredictMarketInCommentaryService,
  getEventDetailsByCIdService,
  saveCommentaryDetailsAPIService,
  loadMultiCommentaryService,
  activeInactiveCommentaryService,
  closeCommentaryService,
  deleteAllCommentaryService,
  getOpenCommentariesService,
  updateDelayInCommentaryService,
  getActiveCommertyService,
  getShortCommertyService,
  deleteCommentaryDataService,
  updateEventRefIdInCommentaryService,
  loadcommentaryService,
  updateTeamPlayerService,
  predictorLogsByIdService,
  updateResultInCommentaryService,
  changeMaxOverDetailService,
  AddSuperOverCommentaryService,
  syncCommentaryStatsWithAPIAndSocket,
  updateTeamPredictionService,
  updateLineRationService,
  deleteBallFromMemorynService,
  completedCommentaryService,
  insertCommentaryConsoleFeService,
  revertCommentaryService,
  getGlobalDataService,
  getTemplateByComIdService,
  saveComTemplatesService,
  getCommentaryBallByBallService,
  saveWagonWheelPositionService,
  updateShotTypeService,
  updateIsWheelShowService,
  getTeamAndPlayerListServiceV1,
  cancelCommentaryService,
  deleteEventResultService,
  isCountInPointCommentaryService,
  multiIsCountInPointCommentaryService,
  getRunnerOfMarketService,
  getEventMarketAndRunnersService,
  commentaryHistoryService,
  deleteCommentaryHistoryService,
  getAllCompletedCommentaryService,
  upDLSDetailsService,
  updateMergeImageOnCommentaryPlayersService,
  changeIsTestComService,
  changeisEventStartService,
  getAllDifficultyService,
  commentaryStatusService,
  commentaryStartService,
  commentaryTossService,
  commentaryScoreService,
  commentaryOverStartService,
  commentarySwapPlayerService,
  commentaryInningChangeService,
  getPitchAndSessionService,
  updatePitchAndSessionService,
  commentaryWicketService,
  commentarySetPlayerService,
  updatePythonAPIOnCommentaryService,
  undoAPIService2,
  changeStrikerPlyService,
  changePlayerService,
  changeOverService,
  updateEventTypeAndCompIdService,
  getCommWicketByIdService,
  updateCommWicketService,
} = require("../../../../services/commentry");
const { getEventSnapByComService, updateEventSnapByComService } = require("../../../../services/competitionEventSnap");
const { getAllCommentariesDataService, getAllCommentariesDataServiceV1 } = require("../../../../services/score");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const { saveCommDrsLogService, getCommDRSLogByIdService, getCommDRSLogByCommIdService, dltDrsService, takeDrsDataService, upDrsDataService } = require("../../../../services/commentaryDRSLogs");
const { allPythonAPIsService } = require("../../../../services/pythonAPI")

let path = "controller/users/admin/commentary/commentary";


const getAllCommentaries = async (request, reply, fastify) => {
  try {
    const result = await allCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentaries", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllDisplayStatus = async (request, reply, fastify) => {
  try {
    const result = await allDisplayStatusService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllDisplayStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryById = async (request, reply, fastify) => {
  try {
    const result = await commentaryByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryDetailsById = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPredictorLogsById = async (request, reply, fastify) => {
  try {
    const result = await predictorLogsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getPredictorLogsById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const addCommentary = async (request, reply, fastify) => {
  try {
    const result = await saveCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateCommentaryStatus = async (request, reply, fastify) => {
  try {
    const result = await updateCommentaryStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateCommentaryStatus",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const cloneCommentary = async (request, reply, fastify) => {
  try {
    const result = await cloneCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/cloneCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const loadMultiCommentary = async (request, reply, fastify) => {
  try {
    const result = await loadMultiCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/loadMultiCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/delete", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCommentaryDetails = async (request, reply, fastify) => {
  try {
    // return true;
    //const result = await testStoreProcedureService(request, fastify);
    if(request.body.commentaryId == 5068){
      return true;
    }
    const result = await syncCommentaryStatsWithAPIAndSocket(request, fastify);
    // const result = await saveCommentaryDetailsService(request, fastify);
    //console.timeEnd("saveCommentaryDetails");
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveDetails", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteBallByBallCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteBallByBallCommentoriesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/deleteBallByBallCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteOverCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteOverCommentoriesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteOverCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetailsByEventId = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByEventIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCommentaryDetailsByEventId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetailsBycommentaryId = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByCommentaryIdService(
      request,
      fastify
    );
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCommentaryDetailsBycommentaryId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetailsBycommentaryEventId = async (
  request,
  reply,
  fastify
) => {
  try {
    const result = await commentaryDetailsByEventIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCommentaryDetailsBycommentaryEventId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCurrentUpdatedCommentaryID = async (request, reply, fastify) => {
  try {
    const result = await getCurrentUpdatedCommentaryIDService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCurrentUpdatedCommentaryID",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateMatchTypeInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateMatchTypeInCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateMatchTypeInCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMatchTypeListByCommentary = async (request, reply, fastify) => {
  try {
    const result = await getMatchTypeListByCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getMatchTypeListByCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeBowlerOfCommentary = async (request, reply, fastify) => {
  try {
    const result = await changeBowlerOfCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/changeBowlerOfCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getScheduleMatchList = async (request, reply, fastify) => {
  try {
    let commentaryData = global.tblCommentaries.filter(
      (item) => item.commentaryStatus === 1 && item.isActive == true && item.isTest == false
    );
    const body = {
      commentaryData,
      type: "scheduled",
    };

    const result = await getMatchListByStatus(body, request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getScheduleMatchList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCompleteMatchList = async (request, reply, fastify) => {
  try {
    let commentaryData = global.tblCommentaries.filter(
      (item) => item.commentaryStatus == 4 && item.isActive == true && item.isTest == false
    );
    const body = {
      commentaryData,
      type: "completed",
    };
    const result = await getMatchListByStatus(body, request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCompleteMatchList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getLiveMatchList = async (request, reply, fastify) => {
  try {
    let commentaryData = global.tblCommentaries.filter(
      (item) =>
        item.commentaryStatus !== 1 &&
        item.commentaryStatus !== 4 &&
        item.isActive == true &&
        item.isTest == false
    );
    const body = {
      commentaryData,
      type: "live",
    };
    const result = await getMatchListByStatus(body, request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getLiveMatchList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllDetailsByEventId = async (request, reply, fastify) => {
  try {
    const result = await getAllDetailsByEventIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getAllDetailsByEventId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryTeamList = async (request, reply, fastify) => {
  try {
    let result = await getTeamListByEventTypeService(request, fastify);
    result = result.map((item) => {
      return {
        teamId: item.teamId,
        teamName: item.teamName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTeamList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommenrtySquadList = async (request, reply, fastify) => {
  try {
    const result = await getCommenrtySquadDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommenrtySquadList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPartnershipList = async (request, reply, fastify) => {
  try {
    const result = await getPartnershipListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommenrtySquadList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateShowClientOfCommentary = async (request, reply, fastify) => {
  try {
    const result = await changeShowClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateShowClientOfCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updatePlayersShowOfCommentary = async (request, reply, fastify) => {
  try {
    const result = await changePlayerShowService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updatePlayersShowOfCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getNodeEventbyEid = async (request, reply, fastify) => {
  try {
    const result = await getNodeEventbyEidService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getNodeEventbyEid", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getActiveCommenrty = async (request, reply, fastify) => {
  try {
    const result = await getActiveCommertyService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getActiveCommenrty", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const testStoreProcedure = async (request, reply, fastify) => {
  try {
    const result = await testStoreProcedureService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/testStoreProcedure", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getTeamAndPlayerList = async (request, reply, fastify) => {
  try {
    const result = await getTeamAndPlayerListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTeamAndPlayerList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
// const getshort = async (request, reply, fastify) => {
//   try {
//     const result = await getshortService(request, fastify);
//     reply.status(200).send(success(result, 200));
//   } catch (err) {
//     errorLogger(fastify, err.message, path + "/getshort", request);
//     reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
//   }
// };
const addTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await addTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addTeamPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await deleteTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteTeamPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const loadTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await loadTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/loadTeamPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateTeamPlayer = async (request, reply, fastify) => {
  try {
    const result = await updateTeamPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateTeamPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveShortCommentary = async (request, reply, fastify) => {
  try {
    const result = await saveShortCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveShortCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateisPredictMarketInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateisPredictMarketInCommentaryService(
      request,
      fastify
    );
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateisPredictMarketInCommentaryService",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateResultInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateResultInCommentaryService(
      request,
      fastify
    );
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateResultInCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEventDetailsByCId = async (request, reply, fastify) => {
  try {
    const result = await getEventDetailsByCIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventDetailsByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCommentaryDetailsAPI = async (request, reply, fastify) => {
  try {
    const result = await saveCommentaryDetailsAPIService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/saveCommentaryDetailsAPI",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveCommentary = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/activeInactiveCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const closeCommentary = async (request, reply, fastify) => {
  try {
    // console.log("closeCommentary");
    const result = await closeCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/closeCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const cancelCommentary = async (request, reply, fastify) => {
  try {
    const result = await cancelCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/cancelCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteAllCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteAllCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteAllCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getOpenCommentaries = async (request, reply, fastify) => {
  try {
    const result = await getOpenCommentariesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getOpenCommentaries", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateDelayInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateDelayInCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateDelayInCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getShortCommerty = async (request, reply, fastify) => {
  try {
    const result = await getShortCommertyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getShortCommerty", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteCommentaryData = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteCommentaryData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateEventRefIdInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateEventRefIdInCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateEventRefIdInCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const loadcommentaryapi = async (request, reply, fastify) => {
  try {
    const result = await loadcommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/loadcommentaryapi", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeMaxOverDetail = async (request, reply, fastify) => {
  try {
    const result = await changeMaxOverDetailService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMaxOverDetail", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upDLSDetails = async (request, reply, fastify) => {
  try {
    const result = await upDLSDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/upDLSDetails", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const getAllCommentariesData = async (request, reply, fastify) => {
  try {
    const result = await getAllCommentariesDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentariesData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllCommentariesDataV1 = async (request, reply, fastify) => {
  try {
    const result = await getAllCommentariesDataServiceV1(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentariesDataV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const AddSuperOverCommentary = async (request, reply, fastify) => {
  try {
    const result = await AddSuperOverCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/AddSuperOverCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateTeamPrediction = async (request, reply, fastify) => {
  try {
    const result = await updateTeamPredictionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateTeamPrediction",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateLineRatio = async (request, reply, fastify) => {
  try {
    const result = await updateLineRationService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateLineRatio", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteBallFromMemory = async (request, reply, fastify) => {
  try {
    const result = await deleteBallFromMemorynService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteBallFromMemory", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventSnapByCom = async (request, reply, fastify) => {
  try {
    const result = await getEventSnapByComService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventSnapByCom", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateEventSnapByCom = async (request, reply, fastify) => {
  try {
    const result = await updateEventSnapByComService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateEventSnapByCom", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const completedCommentary = async (request, reply, fastify) => {
  try {
    const result = await completedCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/completedCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};



const insertCommentaryConsoleFe = async (request, reply, fastify) => {
  try {
    const result = await insertCommentaryConsoleFeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/insertCommentaryConsoleFe", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const revertCommentary = async (request, reply, fastify) => {
  try {
    const result = await revertCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/revertCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getGlobalData = async (request, reply, fastify) => {
  try {
    const result = await getGlobalDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getGlobalData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const getTemplateByComId = async (request, reply, fastify) => {
  try {
    const result = await getTemplateByComIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTemplateByComId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const saveComTemplates = async (request, reply, fastify) => {
  try {
    const result = await saveComTemplatesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveComTemplates", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getCommentaryBallByBall = async (request, reply, fastify) => {
  try {
    const result = await getCommentaryBallByBallService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryBallByBall", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const saveWagonWheel = async (request, reply, fastify) => {
  try {
    const result = await saveWagonWheelPositionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveWagonWheel", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const updateShotType = async (request, reply, fastify) => {
  try {
    const result = await updateShotTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateShotType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const updateIsWheelShow = async (request, reply, fastify) => {
  try {
    const result = await updateIsWheelShowService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateIsWheelShow", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getTeamAndPlayerListV1 = async (request, reply, fastify) => {
  try {
    const result = await getTeamAndPlayerListServiceV1(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTeamAndPlayerListV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteEventResults = async (request, reply, fastify) => {
  try {
    const result = await deleteEventResultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEventResults", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isCountInPointCommentary = async (request, reply, fastify) => {
  try {
    const result = await isCountInPointCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isCountInPointCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const multiIsCountInPointCommentary = async (request, reply, fastify) => {
  try {
    const result = await multiIsCountInPointCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/multiIsCountInPointCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getRunnerOfMarket = async (request, reply, fastify) => {
  try {
    const result = await getRunnerOfMarketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getRunnerOfMarket",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllCommentaryEventMarkets = async (request, reply, fastify) => {
  try {
    const result = await getEventMarketAndRunnersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentaryEventMarkets", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryHistory = async (request, reply, fastify) => {
  try {
    const result = await commentaryHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryHistory", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteCommentaryHistory = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteCommentaryHistory", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllCompletedCommentary = async (request, reply, fastify) => {
  try {
    const result = await getAllCompletedCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCompletedCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateMergeImageOnCommentaryPlayers = async (request, reply, fastify) => {
  try {
    const result = await updateMergeImageOnCommentaryPlayersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateMergeImageOnCommentaryPlayers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCommDrsLog = async (request, reply, fastify) => {
  try {
    const result = await saveCommDrsLogService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveCommDrsLog", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeIsTestCom = async (request, reply, fastify) => {
  try {
    const result = await changeIsTestComService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/changeIsTestCom",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeIsEventStart = async (request, reply, fastify) => {
  try {
    const result = await changeisEventStartService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeIsEventStart", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllDifficulties = async (request, reply, fastify) => {
  try {
    const result = await getAllDifficultyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllDifficulties", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryStatus = async (request, reply, fastify) => {
  try {
    const result = await commentaryStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryStart = async (request, reply, fastify) => {
  try {
    const result = await commentaryStartService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryStart", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryToss = async (request, reply, fastify) => {
  try {
    const result = await commentaryTossService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryToss", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryScore = async (request, reply, fastify) => {
  try {
    const result = await commentaryScoreService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryScore", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryOverStart = async (request, reply, fastify) => {
  try {
    const result = await commentaryOverStartService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryOverStart", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentarySwapPlayer = async (request, reply, fastify) => {
  try {
    const result = await commentarySwapPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentarySwapPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentaryInningChange = async (request, reply, fastify) => {
  try {
    const result = await commentaryInningChangeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryInningChange", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPitchAndSession = async (request, reply, fastify) => {
  try {
    const result = await getPitchAndSessionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getPitchAndSession", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updatePitchAndSession = async (request, reply, fastify) => {
  try {
    const result = await updatePitchAndSessionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updatePitchAndSession", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const commentaryWicket = async (request, reply, fastify) => {
  try {
    const result = await commentaryWicketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentaryWicket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const commentarySetPlayer = async (request, reply, fastify) => {
  try {
    const result = await commentarySetPlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/commentarySetPlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const allPythonAPIs = async (request, reply, fastify) => {
  try {
    request.body = request.body || {};
    request.body.isActive = true;
    const result = await allPythonAPIsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/allPythonAPIs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updatePythonAPI = async (request, reply, fastify) => {
  try {
    const result = await updatePythonAPIOnCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updatePythonAPI", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const undoAPI = async (request, reply, fastify) => {
  try {
    const result = await undoAPIService2(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/undoAPI", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommDRSLogById = async (request, reply, fastify) => {
  try {
    const result = await getCommDRSLogByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommDRSLogById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommDRSLogByCommId = async (request, reply, fastify) => {
  try {
    const result = await getCommDRSLogByCommIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommDRSLogByCommId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const dltDrs = async (request, reply, fastify) => {
  try {
    const result = await dltDrsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/dltDrs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const takeDrsData = async (request, reply, fastify) => {
  try {
    const result = await takeDrsDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/takeDrsData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upDrsData = async (request, reply, fastify) => {
  try {
    const result = await upDrsDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/upDrsData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeStrikerPly = async (request, reply, fastify) => {
  try {
    const result = await changeStrikerPlyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeStrikerPly", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changePlayer = async (request, reply, fastify) => {
  try {
    const result = await changePlayerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changePlayer", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeOver = async (request, reply, fastify) => {
  try {
    const result = await changeOverService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeOver", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateEventTypeAndCompId = async (request, reply, fastify) => {
  try {
    const result = await updateEventTypeAndCompIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateEventTypeAndCompId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommWicketById = async (request, reply, fastify) => {
  try {
    const result = await getCommWicketByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommWicketById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateCommWicket = async (request, reply, fastify) => {
  try {
    const result = await updateCommWicketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateCommWicket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  getAllDisplayStatus,
  getCommentaryDetailsById,
  getPredictorLogsById,
  saveCommentaryDetails,
  cloneCommentary,
  deleteBallByBallCommentary,
  deleteOverCommentary,
  getCommentaryDetailsByEventId,
  getCommentaryDetailsBycommentaryId,
  getCurrentUpdatedCommentaryID,
  updateMatchTypeInCommentary,
  getMatchTypeListByCommentary,
  getCommentaryDetailsBycommentaryEventId,
  changeBowlerOfCommentary,
  getScheduleMatchList,
  getCompleteMatchList,
  getLiveMatchList,
  getAllDetailsByEventId,
  getCommentaryTeamList,
  getCommenrtySquadList,
  getPartnershipList,
  updateShowClientOfCommentary,
  updatePlayersShowOfCommentary,
  getNodeEventbyEid,
  testStoreProcedure,
  getTeamAndPlayerList,
  addTeamPlayer,
  deleteTeamPlayer,
  loadTeamPlayer,
  updateTeamPlayer,
  saveShortCommentary,
  updateCommentaryStatus,
  updateisPredictMarketInCommentary,
  updateResultInCommentary,
  getEventDetailsByCId,
  saveCommentaryDetailsAPI,
  loadMultiCommentary,
  activeInactiveCommentary,
  closeCommentary,
  deleteAllCommentary,
  getOpenCommentaries,
  updateDelayInCommentary,
  getActiveCommenrty,
  getShortCommerty,
  deleteCommentaryData,
  updateEventRefIdInCommentary,
  loadcommentaryapi,
  getAllCommentariesData,
  changeMaxOverDetail,
  AddSuperOverCommentary,
  updateTeamPrediction,
  updateLineRatio,
  deleteBallFromMemory,
  getEventSnapByCom,
  completedCommentary,
  updateEventSnapByCom,
  insertCommentaryConsoleFe,
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
  getAllCompletedCommentary,
  upDLSDetails,
  getAllCommentariesDataV1,
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
}
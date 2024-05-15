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
} = require("../../../../services/commentry");
const { getAllCommentariesDataService } = require("../../../../services/score");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

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
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCommentaryDetails = async (request, reply, fastify) => {
  try {
    console.log("saveCommentaryDetails");
    const result = await testStoreProcedureService(request, fastify);
    // const result = await saveCommentaryDetailsService(request, fastify);
    //console.timeEnd("saveCommentaryDetails");
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
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
      (item) => item.commentaryStatus === 1
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
      (item) => item.commentaryStatus === 4
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
        item.isActive == true
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
    const result = await closeCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/closeCommentary", request);
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

const getAllCommentariesData = async (request, reply, fastify) => {
  try {
    const result = await getAllCommentariesDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentariesData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
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
  getAllCommentariesData
};

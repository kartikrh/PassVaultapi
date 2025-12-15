const {
  allCompetitionService,
  competitionByIdService,
  saveCompetitionService,
  deleteCompetitionService,
  updateDisplayOrderService,
  competitionByeventTypeIdService,
  isTrendingChangeStatusService,
  isEventSnapService,
  isPointTableService,
  getCompletedCommentaryResultService,
  getAllTeamListService,
  getAllCompetitionListService,
  isMenChangeStatusService,
  getTemplateByCompetitionIdService,
  saveCompTemplatesService,
  isVirtualCompetitionService,
  upCompStatusService,
  getMatchTypeTemplateByCompetitionIdService,
} = require("../../../../services/competition");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const { getEventSnapByCompetitionIdService, updateEventSnapService } = require("../../../../services/competitionEventSnap");
const { allPythonAPIsService } = require("../../../../services/pythonAPI")

let path = "controller/users/admin/competition/index";

const getAllCompetition = async (request, reply, fastify) => {
  try {
    const result = await allCompetitionService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCompetition", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCompetitionList = async (request, reply, fastify) => {
  try {
    let result = await allCompetitionService(request);
    result = result.map((item) => {
      return {
        competitionId: item.competitionId,
        competition: item.competition,
        drsCount: item.drsCount,
        matchTypeId: item.matchTypeId,
        startDate: item.startDate ?? null,
        endDate: item.endDate ?? null
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCompetitionList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCompetitionById = async (request, reply, fastify) => {
  try {
    const result = await competitionByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCompetitionById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCompetitionByeventTypeId = async (request, reply, fastify) => {
  try {
    const result = await competitionByeventTypeIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCompetitionByeventTypeId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCompetitionListByeventTypeId = async (request, reply, fastify) => {
  try {
    let result = await competitionByeventTypeIdService(request);
    result = result.map((item) => {
      const pythonURI = global.tblPythonAPI.find(elem => elem.id == item?.pythonId)
      return {
        competitionId: item.competitionId,
        competition: item.competition,
        drsCount: item.drsCount,
        matchTypeId: item.matchTypeId,
        isVirtual: item.isVirtual,
        pythonId: item.pythonId,
        pythonURI: pythonURI?.URI ?? null,
        countryId: item.countryId
      };
    })
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCompetitionByeventTypeId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCompetition = async (request, reply, fastify) => {
  try {
    // console.log("saveCompetition -> request", request.body);
    const result = await saveCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveCompetition", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteCompetition = async (request, reply, fastify) => {
  try {
    const result = await deleteCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteCompetition", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await updateDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateDisplayOrder", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isTrendingChangeStatus = async (request, reply, fastify) => {
  try {
    const result = await isTrendingChangeStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isTrendingChangeStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isEventSnap = async (request, reply, fastify) => {
  try {
    const result = await isEventSnapService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isEventSnap", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isPointTable = async (request, reply, fastify) => {
  try {
    const result = await isPointTableService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isPointTable", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEventSnapByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getEventSnapByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventSnapByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateEventSnap = async (request, reply, fastify) => {
  try {
    const result = await updateEventSnapService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateEventSnap", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryResult = async (request, reply, fastify) => {
  try {
    const result = await getCompletedCommentaryResultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTeamList = async (request, reply, fastify) => {
  try {
    const result = await getAllTeamListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTeamList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const allCompetitionsList = async (request, reply, fastify) => {
  try {
    const result = await getAllCompetitionListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/allCompetitionsList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isMenChangeStatus = async (request, reply, fastify) => {
  try {
    const result = await isMenChangeStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isMenChangeStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getTemplateByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getTemplateByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTemplateByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMatchTypeTemplateByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getMatchTypeTemplateByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getMatchTypeTemplateByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCompTemplates = async (request, reply, fastify) => {
  try {
    const result = await saveCompTemplatesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveCompTemplates", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isVirtualCompetition = async (request, reply, fastify) => {
  try {
    const result = await isVirtualCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isVirtualCompetition", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upCompStatus = async (request, reply, fastify) => {
  try {
    const result = await upCompStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/upCompStatus", request);
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
module.exports = {
  getAllCompetition,
  getCompetitionById,
  saveCompetition,
  deleteCompetition,
  updateDisplayOrder,
  getCompetitionByeventTypeId,
  getCompetitionListByeventTypeId,
  getCompetitionList,
  isTrendingChangeStatus,
  isEventSnap,
  isPointTable,
  getEventSnapByCompetitionId,
  updateEventSnap,
  getCommentaryResult,
  getTeamList,
  allCompetitionsList,
  isMenChangeStatus,
  getTemplateByCompetitionId,
  saveCompTemplates,
  isVirtualCompetition,
  upCompStatus,
  allPythonAPIs,
  getMatchTypeTemplateByCompetitionId,
  changeIsCompetitionStatisticsCalculationStatus,
};

const { allEventTypesService } = require("../../../../services/eventTypes");
const { allteamByEventTypeIdService } = require("../../../../services/teams");
const {
    allPlayerService,
    allBowlingTypeService,
    allPlayerTypeService,
} = require("../../../../services/player");
const { 
    getMatchTypeListService,
    getMarketTypeListService,
    mtAndCategoriesService,
    getCategoryByMarketTypeService,
} = require("../../../../services/marketTemplate");
const { marketTypeService, allMatchTypesService } = require("../../../../services/matchType");
const { allPythonAPIsService } = require("../../../../services/pythonAPI");
const { allCompetitionService } = require("../../../../services/competition");
const { getAllDifficultyService } = require("../../../../services/commentry");
const { eventBycompetitionIdService } = require("../../../../services/event");
const { allRolesService } = require("../../../../services/roles");
const { getAllUsersWithCurrentService } = require("../../../../services/user");
const { allBlocksService } = require("../../../../services/blocks");
const { getTabsService } = require("../../../../services/admin");
const { getCommentaryListByCompetitionIdService } = require("../../../../services/eventMarket");
const { getEventListService } = require("../../../../services/notification");

const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { matchStatusDataService, matchTypeDataService, compStatusDataService } = require("../../../../services/list");

let commonPath = "controller/users/admin/list/index.js";

const getEventTypeList = async (request, reply, fastify) => {
    try {
        let result = await allEventTypesService(request);
        result = result.map((item) => ({
            eventTypeId: item.eventTypeId,
            eventType: item.eventType,
        }));
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getEventTypeList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getTeamList = async (request, reply, fastify) => {
    try {
        let result = await allteamByEventTypeIdService(request);
        result = result.map((item) => {
            return {
                teamId: item.teamId,
                teamName: item.teamName,
            };
        });
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getTeamList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllPlayerType = async (request, reply, fastify) => {
    try {
        const result = await allPlayerTypeService();
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger( fastify, err.message, commonPath + "/allPlayerTypeService", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllBowlingType = async (request, reply, fastify) => {
    try {
        const result = await allBowlingTypeService();
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger( fastify, err.message, commonPath + "/getAllBowlingType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllPlayerList = async (request, reply, fastify) => {
    try {
        let result = await allPlayerService(request);
        result = result.map((item) => {
            return {
                playerId: item.playerId,
                playerName: item.playerName,
            };
        });
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger( fastify, err.message, commonPath + "/getAllPlayerList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getMatchTypeList = async (request, reply, fastify) => {
  try {
    const result = await getMatchTypeListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getMarketTypeList = async (request, reply, fastify) => {
  try {
    const result = await getMarketTypeListService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketTypeList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const marketType = async (request, reply, fastify) => {
  try {
    const result = await marketTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/marketType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const mtAndCategories = async (request, reply, fastify) => {
  try {
    const result = await mtAndCategoriesService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/mtAndCategories", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCategoryByMarketType = async (request, reply, fastify) => {
  try {
    const result = await getCategoryByMarketTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getCategoryByMarketType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllMatchTypes = async (request, reply, fastify) => {
  try {
    const result = await allMatchTypesService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger( fastify, err.message, commonPath + "/getAllMatchTypes", request);
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
    errorLogger(fastify, err.message, commonPath + "/allPythonAPIs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCompetitionList = async (request, reply, fastify) => {
  try {
    let result = await allCompetitionService(request);
    result = result.map((item) => {
        const pythonURI = global.tblPythonAPI.find(elem => elem.id == item?.pythonId);
      return {
        competitionId: item.competitionId,
        competition: item.competition,
        drsCount: item.drsCount,
        matchTypeId: item.matchTypeId,
        isVirtual: item.isVirtual,
        pythonId: item.pythonId,
        pythonURI: pythonURI?.URI ?? null
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getCompetitionList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllDifficulties = async (request, reply, fastify) => {
  try {
    const result = await getAllDifficultyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllDifficulties", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEventListcompetitionId = async (request, reply, fastify) => {
  try {
    let result = await eventBycompetitionIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getEventListcompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getRoleList = async (request, reply, fastify) => {
  try {
    let result = await allRolesService(request);
    result = result.map((item) => {
      return {
        roleId: item.roleId,
        roleName: item.roleName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getRoleList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllUsersWithCurrent = async (request, reply, fastify) => {
  try {
    const result = await getAllUsersWithCurrentService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger( fastify, err.message, commonPath + "/getAllUsersWithCurrent", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getBlockList = async (request, reply, fastify) => {
  try {
    let result = await allBlocksService(request, fastify);
    result = result.map((item) => ({
      blockId: item.blockId,
      blockName: item.blockName,
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getBlockList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTabs = async (request, reply, fastify) => {
  try {
    const result = await getTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTabs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryList = async (request, reply, fastify) => {
  try {
    const result = await getCommentaryListByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getCommentaryList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEventList = async (request , reply , fastify)=>{
    try {
        const result = await getEventListService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getEventList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const matchStatusData = async (request , reply , fastify)=>{
    try {
        const result = await matchStatusDataService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/matchStatusData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const matchTypeData = async (request , reply , fastify)=>{
    try {
        const result = await matchTypeDataService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/matchTypeData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const compStatusData = async (request , reply , fastify)=>{
    try {
        const result = await compStatusDataService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/compStatusData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

module.exports = {
    getEventTypeList,
    getTeamList,
    getAllPlayerType,
    getAllBowlingType,
    getAllPlayerList,
    getMatchTypeList,
    getMarketTypeList,
    marketType,
    mtAndCategories,
    getCategoryByMarketType,
    getAllMatchTypes,
    allPythonAPIs,
    getCompetitionList,
    getAllDifficulties,
    getEventListcompetitionId,
    getRoleList,
    getAllUsersWithCurrent,
    getBlockList,
    getTabs,
    getCommentaryList,
    getEventList,
    matchStatusData,
    matchTypeData,
    compStatusData
}
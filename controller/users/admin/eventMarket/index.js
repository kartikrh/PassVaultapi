const { getDetailsByCIdService, getAllEventMarketsService, createEventMarketsService, deleteEventMarketsService, activeInactiveMarketsService, updateAllowMarketsService, getEventListByCompetitionIdsService, marketListResultFalseService, changeResultOfMarketService, changeMarketCancelService, changeMarketResultService, marketListByCIdService, saveEventMarketService, updateMarketRateService, changeMarketCloseService, suspendMarketByCIdService, getEventMarketByIdService, marketTemplateTypeService, commentaryTypeService, setDelayEventMarketService, getDSReportEventMarketService, getSLReportEventMarketService, getMarketDataByCIdService,UpdateResulOrApproveEventMarketService, getMarketTypeCategoryService,marketListcategoryNameByCIdService, setAllMarketCloseService, setCloseMarketCancelService, getAllEventMarketsAndRunnersService, cancelSettleMarketService,getDetailsByCIdV1Service, createEventMarketsServiceV1, updateMarketRateServiceV1, marketListByCIdServiceV1, getRunnerByMarketService, pendingMultiRunnerMarketsService, updateMarketResultService, getComByCompIdService, updateEventMarketCloseSuspendTimeService, closeEventMarketsByIdsService, cancelEventMarketsByIdsService, getManualMarketDataService, saveManualMarketDataService, upManualMarketDataService, getCommentaryListByCompetitionIdService, upIsInningRunApiService, globalEventMarketDataWithCommIdService, globalEventMarketDataWithMarketIdsService, upSendMarketDataService, upSusTimeDataService, upCloseTimeDataService, changeMultiMarketsSessionIsResultService, changeMultiMarketsIsResultService, getCommentaryDetailsService, loadMarketByComIdService } = require("../../../../services/eventMarket");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/eventMarket/index";
const getDetailsByCId = async (request, reply, fastify) => {
  try {
    const result = await getDetailsByCIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getDetailsByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllEventMarket = async (request, reply, fastify) => {
  try {
    const result = await getAllEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventMarketById = async (request, reply, fastify) => {
  try {
    const result = await getEventMarketByIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventMarketById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const createEventMarket = async (request, reply, fastify) => {
  try {
    const result = await createEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/createEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const createEventMarketV1 = async (request, reply, fastify) => {
  try {
    const result = await createEventMarketsServiceV1(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/createEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteEventMarket = async (request, reply, fastify) => {
  try {
    const result = await deleteEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveMarket = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/activeInactiveMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateAllowMarket = async (request, reply, fastify) => {
  try {
    const result = await updateAllowMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateAllowMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventListByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getEventListByCompetitionIdsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventListByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const marketListResultFalse = async (request, reply, fastify) => {
  try {
    const result = await marketListResultFalseService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListResultFalse", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeResultOfMarket = async (request, reply, fastify) => {
  try {
    const result = await changeResultOfMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeResultOfMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const marketListByCId = async (request, reply, fastify) => {
  try {
    const result = await marketListByCIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const marketListByCIdV1 = async (request, reply, fastify) => {
  try {
    const result = await marketListByCIdServiceV1(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListByCIdV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateMarketRate = async (request, reply, fastify) => {
  try {
    const result = await updateMarketRateService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateMarketRate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const upSendMarketData = async (request, reply, fastify) => {
  try {
    const result = await upSendMarketDataService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/upSendMarketData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveEventMarket = async (request, reply, fastify) => {
  try {
    const result = await saveEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketCancel = async (request, reply, fastify) => {
  try {
    const result = await changeMarketCancelService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketCancel", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketResult = async (request, reply, fastify) => {
  try {
    const result = await changeMarketResultService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketClose = async (request, reply, fastify) => {
  try {
    const result = await changeMarketCloseService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketClose", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const suspendMarketByCId = async (request, reply, fastify) => {
  try {
    const result = await suspendMarketByCIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/suspendMarketByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryTypeList  = async (request, reply, fastify) => {
  try {
    const result = await commentaryTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMarketTemplateTypeList  = async (request, reply, fastify) => {
  try {
    const result = await marketTemplateTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getMarketTemplateList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const setDelayEventMarket = async (request, reply, fastify) => {
  try {
    const result = await setDelayEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/setDelayEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getDSReportEventMarket = async (request, reply, fastify) => {
  try {
    const result = await getDSReportEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getDSReportEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getSLReportEventMarket = async (request, reply, fastify) => {
  try {
    const result = await getSLReportEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getSLReportEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMarketDataByCId = async (request, reply, fastify) => {
  try {
    const result = await getMarketDataByCIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getMarketDataByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const UpdateResulOrApproveEventMarket = async (request, reply, fastify) => {
  try {
    const result = await UpdateResulOrApproveEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/UpdateResulOrApproveEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};


const marketListcategoryNameByCId = async (request, reply, fastify) => {
  try {
    const result = await marketListcategoryNameByCIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListcategoryNameByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};


const getMarketTypeCategory = async (request , reply , fastify)=>{
  try {
    const result = await getMarketTypeCategoryService(request,fastify);
    reply.status(200).send(success(result , 200))
  }
  catch(error){
    errorLogger(fastify , error.message , path + "/getMarketTypeCategory" , request);
    reply.status(200).send(error(error.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const setAllMarketClose = async (request , reply , fastify)=>{
  try {
    const result = await setAllMarketCloseService(request,fastify);
    reply.status(200).send(success(result , 200))
  }
  catch(err){
    errorLogger(fastify , err.message , path + "/setAllMarketClose" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const setCloseMarketCancel = async (request , reply , fastify)=>{
  try {
    const result = await setCloseMarketCancelService(request,fastify);
    reply.status(200).send(success(result , 200))
  }
  catch(err){
    errorLogger(fastify , err.message , path + "/setCloseMarketCancel" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}

const getAllEventMarketsAndRunners = async (request, reply, fastify)=>{
  try {
    const result = await getAllEventMarketsAndRunnersService(fastify, request);
    reply.status(200).send(success(result, 200))
  }
  catch(err){
    errorLogger(fastify , err.message , path + "/getAllEventMarketsAndRunners" , request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const cancelSettleMarket = async (request, reply, fastify)=>{
  try {
    const result = await cancelSettleMarketService(request,fastify);
    reply.status(200).send(success(result, 200))
  }
  catch(err){
    errorLogger(fastify , err.message , path + "/cancelSettleMarket" , request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getDetailsByCIdV1 = async (request, reply, fastify) => {
  try {
    const result = await getDetailsByCIdV1Service(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    // console.log("err", err);
    errorLogger(fastify, err.message, path + "/getDetailsByCIdV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const updateMarketRateV1 = async (request, reply, fastify) => {
  try {
    const result = await updateMarketRateServiceV1(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateMarketRateV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getRunnerByMarket = async (request, reply, fastify) => {
  try {
    const result = await getRunnerByMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getRunnerByMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const pendingMultiRunnerMarkets = async (request, reply, fastify) => {
  try {
    const result = await pendingMultiRunnerMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/pendingMultiRunnerMarkets", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateMarketResult = async (request, reply, fastify) => {
  try {
    const result = await updateMarketResultService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateMarketResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getComByCompId = async (request, reply, fastify) => {
  try {
    const result = await getComByCompIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getComByCompId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateEventMarketCloseSuspendTime = async (request, reply, fastify) => {
  try {
    const result = await updateEventMarketCloseSuspendTimeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateEventMarketCloseSuspendTime", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const closeMarketsByIds = async (request , reply , fastify)=>{
  try {
    const result = await closeEventMarketsByIdsService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/closeMarketsByIds" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}

const cancelMarketsByIds = async (request , reply , fastify)=>{
  try {
    const result = await cancelEventMarketsByIdsService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/cancelMarketsByIds" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const getManualMarketData = async (request , reply , fastify)=>{
  try {
    const result = await getManualMarketDataService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/getManualMarketData" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const saveManualMarketData = async (request , reply , fastify)=>{
  try {
    const result = await saveManualMarketDataService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/saveManualMarketData" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const upManualMarketData = async (request , reply , fastify)=>{
  try {
    const result = await upManualMarketDataService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/upManualMarketData" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const upIsInningRunApi = async (request , reply , fastify)=>{
  try {
    const result = await upIsInningRunApiService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/upIsInningRunApi" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const upSusTimeData = async (request , reply , fastify)=>{
  try {
    const result = await upSusTimeDataService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/upSusTimeData" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}
const upCloseTimeData = async (request , reply , fastify)=>{
  try {
    const result = await upCloseTimeDataService(request,fastify);
    reply.status(200).send(success(result , 200))
  } catch(err){
    errorLogger(fastify , err.message , path + "/upCloseTimeData" , request);
    reply.status(200).send(error(err.message , ERROR_CODES.SERVER_ERROR , 200))
  }
}

const getCommentaryList = async (request, reply, fastify) => {
  try {
    const result = await getCommentaryListByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const globalEventMarketDataWithCommId = async (request, reply, fastify) => {
  try {
    const result = await globalEventMarketDataWithCommIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/globalEventMarketDataWithCommId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const globalEventMarketDataWithMarketIds = async (request, reply, fastify) => {
  try {
    const result = await globalEventMarketDataWithMarketIdsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/globalEventMarketDataWithMarketIds", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMultiMarketsSessionIsResult = async (request, reply, fastify) => {
  try {
    const result = await changeMultiMarketsSessionIsResultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMultiMarketsSessionIsResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMultiMarketsIsResult = async (request, reply, fastify) => {
  try {
    const result = await changeMultiMarketsIsResultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMultiMarketsIsResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const loadMarketByComId = async (request, reply, fastify) => {
  try {
    const result = await loadMarketByComIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/loadMarketByComId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetails = async (request, reply, fastify) => {
  try {
    const result = await getCommentaryDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryDetails", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getDetailsByCId,
    getAllEventMarket,
    createEventMarket,
    deleteEventMarket,
    activeInactiveMarket,
    updateAllowMarket,
    getEventListByCompetitionId,
    marketListResultFalse,
    changeResultOfMarket,
    marketListByCId,
    updateMarketRate,
    saveEventMarket,
    changeMarketCancel,
    changeMarketResult,
    changeMarketClose,
    suspendMarketByCId,
    getEventMarketById,
    getCommentaryTypeList,
    getMarketTemplateTypeList,
    setDelayEventMarket,
    getDSReportEventMarket,
    getSLReportEventMarket,
    getMarketDataByCId,
    UpdateResulOrApproveEventMarket,
    marketListcategoryNameByCId,
    getMarketTypeCategory,
    setAllMarketClose,
    setCloseMarketCancel,
    getAllEventMarketsAndRunners,
    cancelSettleMarket,
    getDetailsByCIdV1,
    createEventMarketV1,
    updateMarketRateV1,
    marketListByCIdV1,
    getRunnerByMarket,
    pendingMultiRunnerMarkets,
    updateMarketResult,
    getComByCompId,
    updateEventMarketCloseSuspendTime,
    closeMarketsByIds,
    cancelMarketsByIds,
    getManualMarketData,saveManualMarketData,
    upManualMarketData,
    getCommentaryList,
    upIsInningRunApi,
    globalEventMarketDataWithCommId,
    globalEventMarketDataWithMarketIds,
    upSendMarketData,
    upSusTimeData,
    upCloseTimeData,
    changeMultiMarketsIsResult,
    changeMultiMarketsSessionIsResult,
    getCommentaryDetails,
    loadMarketByComId
};

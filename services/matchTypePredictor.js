const {
  createMatchTypePredictorQuery,
  deletePredictorByMatchTypeQuery,
  deletePredictorQuery,
} = require("../repository/TableMatchTypePredictor");
const { callPredictorMarket } = require("../utilities");
const { updateSumOfRunPerBallQuery } = require("../repository/TableMatchType");

const savePredictorDataService = async (request, fastify) => {
  // validate match type Id
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if (!matchType) {
    throw new Error("Match Type not found for give id");
  }
  // let _resFromPredictAPI;
   let callPrediction = {};
  // _resFromPredictAPI = await callPredictorMarket(
  //   {
  //     match_type_id: matchType.matchTypeId,
  //     is_market_template: false,
  //   },
  //   "/api/v1/updatemarketpredictors",
  //   fastify,
  //   request
  // );
  // // Check for error_msg in the response
  // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
  //   callPrediction.predictioncallSuccess = false;
  //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
  //   callPrediction.endPoint = '/api/v1/updatemarketpredictors';
  // }else {
  //   callPrediction.predictioncallSuccess = true;
  //   callPrediction.predictionMessage = 'Prediction call successful';
  //   callPrediction.endPoint = '/api/v1/updatemarketpredictors';
  // }
  // check if there is data for this predictor
  const predictor = global.tblMatchTypePredictor.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if (predictor) {
    //delete if there is predictor data for the match type
    await deletePredictorByMatchTypeQuery(request.body.matchTypeId, fastify);
    global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
      (item) => item.matchTypeId !== request.body.matchTypeId
    );
  }
  const data = await createMatchTypePredictorQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );
  global.tblMatchTypePredictor.push(...data);
  await updateSumOfRunPerBallQuery(request.body.matchTypeId, fastify, request);
  // Add callPrediction to the data object
  const result = {
    ...data,
    callPrediction,
  };
  return result;
};
const getAllPredictorDataService = async (request, fastify) => {
  return global.tblMatchTypePredictor;
};
const getPredictorByMatchTypeIdService = async (request, fastify) => {
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if (!matchType) {
    throw new Error("Match Type not found for given id");
  }
  const data = global.tblMatchTypePredictor.filter(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  return {
    ...matchType,
    predictorData: data,
  };
};
const getPredictorByIdService = async (request, fastify) => {
  const data = global.tblMatchTypePredictor.find(
    (item) => item.matchTypePredictorId === request.body.matchTypePredictorId
  );
  return data || {};
};

const deletePredictorByMatchTypeService = async (request, fastify) => {
  await deletePredictorByMatchTypeQuery(request.body.matchTypeId, fastify);
  global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
    (item) => item.matchTypeId !== request.body.matchTypeId
  );

  return "Predictor deleted successfully";
};
const deletePredictorService = async (request, fastify) => {
  const { matchTypePredictorId } = request.body;
  await deletePredictorQuery(matchTypePredictorId, fastify);
  global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
    (item) => !matchTypePredictorId.includes(item.matchTypePredictorId)
  );

  return "Predictor deleted successfully";
};

module.exports = {
  savePredictorDataService,
  getAllPredictorDataService,
  getPredictorByMatchTypeIdService,
  deletePredictorByMatchTypeService,
  deletePredictorService,
  getPredictorByIdService,
};

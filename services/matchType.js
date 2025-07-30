const {
  insertMatchTypeQuery,
  deleteMatchTypeQuery,
  updateMatchTypeQuery,
  deleteMatchTypePredictorQuery,
  updateSumOfRunPerBallQuery,
  isHistoryChangeInMatchTypeQuery,
  activeInactiveMatchTypeQuery,
} = require("../repository/TableMatchType");
const { createMatchTypePredictorQuery } = require("../repository/TableMatchTypePredictor");
const { saveTemplateQuery, dltTemplateQuery, deleteTemplatesByMatchTypeIdQuery } = require("../repository/TableMatchTypeTemplates");
const { MarketTypeId, trimTextData } = require("../utilities");

// const allMatchTypesService = async (request) => {
//   if(request?.body?.entityEnum) {
//     let result = global.tblMatchTypes.filter(item => item.entityEnum === request?.body?.entityEnum);
//     if(result.length > 0) {
//       // get the templates for the match types
//       for (let item of result) {
//         let tempIds = global.tblMatchTypeTemplates.filter(
//           (temp) => temp.matchTypeId === item.matchTypeId
//         ).map((temp) => temp.marketTemplateId);
//         if(tempIds.length > 0) {
//           item.templateIds = tempIds.map((id) => {
//             const template = global.tblMarketTemplate.find(
//               (temp) => temp.marketTemplateId === id
//             );
//             return {
//               marketTemplateId: id,
//               templateName: template.templateName || null,
//               devTemplateName : template.devTemplateName || null,
//             }
//           });
//         }
//         else {
//           item.templateIds = [];
//         }
//       }
//     }
//     return result || []
//   } else {
//     // return global.tblMatchTypes;
//     let result = global.tblMatchTypes;
//     // get the templates for the match types
//     for (let item of result) {
//       let tempIds = global.tblMatchTypeTemplates.filter(
//         (temp) => temp.matchTypeId === item.matchTypeId
//       ).map((temp) => temp.marketTemplateId);
//       if(tempIds.length > 0) {
//         item.templateIds = tempIds.map((id) => {
//           const template = global.tblMarketTemplate.find(
//             (temp) => temp.marketTemplateId === id
//           );
//           return {
//             marketTemplateId: id,
//             templateName: template.templateName || null,
//             devTemplateName : template.devTemplateName || null,
//           }
//         });
//       }
//       else {
//         item.templateIds = [];
//       }
//     }
//     return result || []
//   }
//   // return global.tblMatchTypes;
// };

const allMatchTypesService = async (request) => {
  const { isActive, entityEnum } = request?.body || {};
  let result = global.tblMatchTypes;
  if (isActive !== undefined) {
    result = result.filter(item => item.isActive === isActive);
  } else {
    result = result.filter(item => item.isActive === true);
  }
   

  if (entityEnum) {
    result = result.filter(item => item.entityEnum === entityEnum);
  }
  // for (let item of result) {
  //   let tempIds = global.tblMatchTypeTemplates.filter(
  //     (temp) => temp.matchTypeId === item.matchTypeId
  //   ).map((temp) => temp.marketTemplateId);
  //   if(tempIds.length > 0) {
  //     item.templateIds = tempIds.map((id) => {
  //       const template = global.tblMarketTemplate.find(
  //         (temp) => temp.marketTemplateId === id
  //       );
  //       return {
  //         marketTemplateId: id,
  //         templateName: template?.templateName || null,
  //         devTemplateName : template?.devTemplateName || null,
  //       }
  //     });
  //   } else {
  //     item.templateIds = [];
  //   }
  // }

  return result || []
};

const matchTypeByIdService = async (request) => {
  const { matchTypeId } = request.body;
  const result = { ...global.tblMatchTypes.find(i => i.matchTypeId === matchTypeId) };

  // get the templates for the match type
  if (result) {
    let tempIds = global.tblMatchTypeTemplates.filter(
      (temp) => temp.matchTypeId === result.matchTypeId
    ).map((temp) => temp.marketTemplateId);
    if(tempIds.length > 0) {
      result.templateIds = tempIds.map((id) => {
        const template = global.tblMarketTemplate.find(
          (temp) => temp.marketTemplateId === id
        );
        return {
          marketTemplateId: id,
          templateName: template?.templateName || null,
          devTemplateName : template?.devTemplateName || null,
        }
      });
    } else {
      result.templateIds = [];
    }
  }
  return result || null;
};

const createMatchTypeService = async (request, fastify) => {
  const trimData = await trimTextData({
    matchType: request.body?.matchType
  }, request, fastify);
  
  if(trimData) {
    Object.assign(request.body, trimData);
  }

  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }
  if (request.body?.entityEnum) {
    const validate = global.tblMatchTypes.find(item => 
      item.entityEnum == request.body.entityEnum
    );
    if(validate) {
      throw new Error("This entity enum already exist");
    }
  }
  const data = await insertMatchTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblMatchTypes.push(data);
  // save the matchTemplate if templateIds are provided
  if(request.body?.templateIds && request.body.templateIds.length > 0) {
    let tempData = await saveTemplateQuery(
      {
        templateIds: request.body.templateIds,
        matchTypeId: data.matchTypeId,
        userId: request.userTokenInfo.WrUserId,
      },
      fastify,
      request
    );
    // store in global variable
    global.tblMatchTypeTemplates.push(...tempData);
  }
  return data;
};

const cloneMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  const trimData = await trimTextData({
    matchType: request.body?.matchType
  }, request, fastify);
  
  if(trimData) {
    Object.assign(request.body, trimData);
  }
  
  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }

  if (request.body?.entityEnum) {
    const validateTpId = global.tblMatchTypes.find(item =>
      item.entityEnum == request.body?.entityEnum
    );
    if (validateTpId) {
      throw new Error("Entity enum already existed");
    }
  }

  const data = await insertMatchTypeQuery(
    {
      ...checkId,
      entityEnum: request.body?.entityEnum ?? null,
      matchType: request.body.matchType,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );
  
  global.tblMatchTypes.push(data);



    // get tempData from global variable
  const tempData = global.tblMatchTypeTemplates.filter(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if(tempData.length > 0) {
    const clonedTempData = tempData.map((item) => ({
      ...item,
      matchTypeId: data.matchTypeId,
    }));

    // save the cloned templates
    const savedTempData = await saveTemplateQuery(
      {
        templateIds: clonedTempData.map(item => item.marketTemplateId),
        matchTypeId: data.matchTypeId,
      },
      fastify,
      request
    );

    global.tblMatchTypeTemplates.push(...savedTempData);
  }
  
  // clone the matchType predictor 
  const predictorData = global.tblMatchTypePredictor.filter(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if(!predictorData.length) return data;


  const predictorDataClone = predictorData.map((item) => ({
    ...item,
    matchTypeId: data.matchTypeId,
  }));

  const predictor = await createMatchTypePredictorQuery(
    {
      matchTypeId: data.matchTypeId,
      predictorData: predictorDataClone,
    },
    request,
    fastify
  )

  const validate = global.tblMatchTypePredictor.filter((item) => item.matchTypeId === request.body.matchTypeId);
  if(validate.length > 0 ){
     const sumOfRPB = await updateSumOfRunPerBallQuery(data.matchTypeId, fastify, request);
     data.sumOfRunPerBall = sumOfRPB
  }

  global.tblMatchTypePredictor.push(...predictor);



  return data;
};

const updateMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  const trimData = await trimTextData({
    matchType: request.body?.matchType
  }, request, fastify);
  
  if(trimData) {
    Object.assign(request.body, trimData);
  }

  if (request.body.matchTypeName) {
    const validateMatchType = global.tblMatchTypes.find(
      (item) =>
        item.matchType.toLowerCase() === request.body.matchType.toLowerCase() &&
        item.matchTypeId !== request.body.matchTypeId
    );

    if (validateMatchType) {
      throw new Error("MatchType already exist");
    }
  }
  if (request.body?.entityEnum) {
    const validate = global.tblMatchTypes.find(item => 
      item.entityEnum == request.body.entityEnum && 
      item.matchTypeId != request.body.matchTypeId
    );
    if(validate) {
      throw new Error("This entity enum already exist");
    }
  }
  const data = await updateMatchTypeQuery(
    {
      ...request.body,
      modifyBy: request.userTokenInfo.WrUserId,
      modifyDate: new Date(),
    },
    fastify,
    request
  );

  const index = global.tblMatchTypes.findIndex(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  global.tblMatchTypes[index] = {
    ...data,
    matchTypeId: request.body.matchTypeId,
  };

  const validate = global.tblMatchTypePredictor.filter((item) => item.matchTypeId === request.body.matchTypeId);
  if(validate.length > 0 ){
     const sumOfRPB = await updateSumOfRunPerBallQuery(request.body.matchTypeId, fastify, request);
     global.tblMatchTypes[index].sumOfRunPerBall = sumOfRPB
  }
  // get the templates from global variable
  const tempData = global.tblMatchTypeTemplates.filter(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
   // save the matchTemplate if templateIds are provided
  if(request.body?.templateIds && request.body.templateIds.length == 0) {
    // delete the templates if no templateIds are provided
    await deleteTemplatesByMatchTypeIdQuery([request.body.matchTypeId]
    , fastify, request);
    // remove from global variable
    global.tblMatchTypeTemplates = global.tblMatchTypeTemplates.filter(
      (item) => item.matchTypeId !== request.body.matchTypeId
    );
    return { ...data, matchTypeId: request.body.matchTypeId };
  }
  // check 
  // if templateIds are provided is already exist
  if(request.body?.templateIds && request.body.templateIds.length > 0) {
    // new templateIds
    const newTemplateIds = request.body.templateIds.filter(
      (id) => !tempData.some((item) => item.marketTemplateId === id)
    );
    // not in global which need to be delete
    const deleteTemplateIds = tempData.filter(
      (item) => !request.body.templateIds.includes(item.marketTemplateId)
    )

    // save the new templates
    if(newTemplateIds.length > 0) {
      const savedTempData = await saveTemplateQuery(
        {
          templateIds: newTemplateIds,
          matchTypeId: request.body.matchTypeId,
          userId: request.userTokenInfo.WrUserId,
        },
        fastify,
        request
      );
      global.tblMatchTypeTemplates.push(...savedTempData);
    }
    // delete the templates which are not in request body
    if(deleteTemplateIds.length > 0) {
      // delete from database
      await dltTemplateQuery({
        ids : deleteTemplateIds.map((i)=> i.id)
      },fastify,request) 
      let ids = deleteTemplateIds.map((item) => item.id);
      global.tblMatchTypeTemplates = global.tblMatchTypeTemplates.filter(
        (item) => !ids.includes(item.id)
      );
    }
  }

  return { ...data, matchTypeId: request.body.matchTypeId };
};

const saveMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  if (matchTypeId === 0) {
    return await createMatchTypeService(request, fastify);
  } else {
    return await updateMatchTypeService(request, fastify);
  }
};

const deleteMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  // check if matchType is use in commentary
  for (let id of matchTypeId) {
    const checkMatchType = global.tblCommentaries.find(
      (item) => item.matchTypeId === id
    );

    if (checkMatchType) {
      throw new Error(`One of the MatchType cannot be deleted as it is used in Commentary.`);
    }

    const checkInMarketTemplate = global.tblMarketTemplate.find(
      (item) => item.matchTypeID === id
    );
    if(checkInMarketTemplate){
      throw new Error(`One of the MatchType cannot be deleted as it is used in Market Template.`);
    }
  }

  await deleteMatchTypePredictorQuery(matchTypeId, fastify, request);
  await deleteMatchTypeQuery(matchTypeId, fastify, request);
  await deleteTemplatesByMatchTypeIdQuery(matchTypeId, fastify, request);
  global.tblMatchTypeTemplates = global.tblMatchTypeTemplates.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );

  global.tblMatchTypes = global.tblMatchTypes.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );
  global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );

  return `Match Type(s) deleted successfully`;
};

const isHistoryChangeInMatchTypeService = async (request, fastify) => {
  const { isHistory, matchTypeId } = request.body;
  await isHistoryChangeInMatchTypeQuery(
    {
      isHistory,
      matchTypeId,
    },
    request,
    fastify
  );
  const index = global.tblMatchTypes.findIndex((item) => item.matchTypeId == matchTypeId);
  
  if(index != -1){
    global.tblMatchTypes[index].isHistory = isHistory;
  }
  
  return `MatchType isHistory data updated successfully`;
}

const marketTypeService = async (request, fastify) => {
  return MarketTypeId;
}

const activeInactiveMatchTypeService = async (request, fastify) => {
  const { matchTypeId, isActive } = request.body;
  const validateId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeId
  );

  if (!validateId) {
    throw new Error("MatchType with this Id not found");
  }
  await activeInactiveMatchTypeQuery(
    {
      matchTypeId,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblMatchTypes.findIndex((item) => item.matchTypeId == matchTypeId);
  if(index != -1){
    global.tblMatchTypes[index].isActive = isActive;
  }

  return `MatchType data updated successfully`;
};

module.exports = {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
  cloneMatchTypeService,
  isHistoryChangeInMatchTypeService,
  marketTypeService,
  activeInactiveMatchTypeService,
};

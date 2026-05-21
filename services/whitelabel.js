const {
  insertWhitelabelQuery,
  updateWhitelabelQuery,
  deleteWhitelabelQuery,
  activeInactiveWhitelabelQuery,
  demoClientEnableInIOSWhitelabelQuery,
  isDemoClientLoginQuery,
  getAllEncryptWhitelabelsQuery,
  isDefaultUpQuery,
} = require("../repository/TableWhitelabel");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { callClientAPI, APIEndpointModuleType, HideEventType, commentaryStatus } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { hideEventsQuery, unHideEventQuery } = require("../repository/TableHideEvents");

const saveWhitelabelService = async (request, fastify) => {
  // if (request.body.imagePath && request.body.imagePath.length) {
  //   const imgName = generateImageName({
  //     name: request.body.domain,
  //   });

  //   const projectName = global.tblConfigs.find(
  //     (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
  //   )?.value;

  //   const { imagePath } = await storeImageOnServer({
  //     image: request.body.imagePath[0],
  //     project: projectName,
  //     name: imgName,
  //     ...ImgModuleConfig.Whitelable,
  //   });
  //   request.body.imagePath = imagePath;
  // }
  const saveData = await insertWhitelabelQuery(request.body, fastify, request);
  global.tblWhitelabels.push(saveData);
  if(saveData.isActive){
      await callClientAPI(
       {
          moduleType : APIEndpointModuleType.updateSeoModule,
          data : {
            module : 'whiteLable',
            type : "add",
            data : saveData
          }
       }, request, fastify,
        "services/whitelabel.js/saveWhitelabelService"
      );
    }
  return saveData;
};

const editWhitelabelService = async (request, fastify) => { 
  const validateId = global.tblWhitelabels.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Whitelabel data with this Id not found");
  }

  // if (request.body.imagePath && request.body.imagePath.length) {
  //   const imgName = generateImageName({
  //     name: request.body.domain,
  //   });
  //   const projectName = global.tblConfigs.find(
  //     (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
  //   ).value;
  //   const { imagePath } = await storeImageOnServer({
  //     image: request.body.imagePath[0],
  //     project: projectName,
  //     name: imgName,
  //     ...ImgModuleConfig.Whitelable,
  //   });
  //   request.body.imagePath = imagePath;
  // }

  const updateData = {
    domain: request.body.domain ?? validateId.domain,
    imagePath: request.body.imagePath ?? validateId.imagePath,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    id: request.body.id ?? validateId.id,
    isDemoClientEnableInIOS: request.body.isDemoClientEnableInIOS ?? validateId.isDemoClientEnableInIOS,
    isDemoClientLogin: request.body.isDemoClientLogin ?? validateId.isDemoClientLogin,
    isRecatchEnable: request.body.isRecatchEnable ?? validateId.isRecatchEnable,
    recatchKey: request.body.recatchKey ?? validateId.recatchKey,
    isGoogleLogin: request.body.isGoogleLogin ?? validateId.isGoogleLogin,
    googleKey: request.body.googleKey ?? validateId.googleKey,
    isFacebookLogin: request.body.isFacebookLogin ?? validateId.isFacebookLogin,
    facebookKey: request.body.facebookKey ?? validateId.facebookKey,
    mobileGoogleFirebaseKey: request.body.mobileGoogleFirebaseKey ?? validateId.mobileGoogleFirebaseKey,
    mobileGoogleFirebaseUrl: request.body.mobileGoogleFirebaseUrl ?? validateId.mobileGoogleFirebaseUrl,
    isSendMobileOTP: request.body.isSendMobileOTP ?? validateId.isSendMobileOTP,
    sendMobileOTPType: request.body.sendMobileOTPType ?? validateId.sendMobileOTPType,
    sendMobileOTPMaxSendLimit: request.body.sendMobileOTPMaxSendLimit ?? validateId.sendMobileOTPMaxSendLimit,
    mobileOTPAuthKey: request.body.mobileOTPAuthKey ?? validateId.mobileOTPAuthKey,
    mobileOTPExpired: request.body.mobileOTPExpired ?? validateId.mobileOTPExpired,
    mobileOTPSendUrl: request.body.mobileOTPSendUrl ?? validateId.mobileOTPSendUrl,
    mobileOTPResendUrl: request.body.mobileOTPResendUrl ?? validateId.mobileOTPResendUrl,
    mobileOTPForgotUrl: request.body.mobileOTPForgotUrl ?? validateId.mobileOTPForgotUrl,
    mobileSemlessOTPKey: request.body.mobileSemlessOTPKey ?? validateId.mobileSemlessOTPKey,
    isSendMailOTP: request.body.isSendMailOTP ?? validateId.isSendMailOTP,
    sendMailType: request.body.sendMailType ?? validateId.sendMailType,
    sendMailMaxSendLimit: request.body.sendMailMaxSendLimit ?? validateId.sendMailMaxSendLimit,
    mobileOTPVerify: request.body.mobileOTPVerify ?? validateId.mobileOTPVerify,
    clientOTP: request.body.clientOTP ?? validateId.clientOTP,
    whitelabelId : request.body.whitelabelId ?? validateId.whitelabelId,
    isDefault: request.body.isDefault ?? validateId.isDefault,
  };

  const modifiedData = await updateWhitelabelQuery(updateData, fastify, request);

  const index = global.tblWhitelabels.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblWhitelabels[index] = {
      ...global.tblWhitelabels[index],
      ...modifiedData[0],
    };
  }
  
   await callClientAPI(
     {
       moduleType : APIEndpointModuleType.updateSeoModule,
       data : {
         module : 'whiteLable',
         type : "update",
         data : updateData
       }
     }, request, fastify,
     "services/whitelabel.js/editWhitelabelService"
   );


  return modifiedData[0];
};

const allWhitelabelsService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblWhitelabels.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblWhitelabels.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const whitelabelByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblWhitelabels.find((item) => item.id === id);
  return result || null;
};

const createWhitelabelService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveWhitelabelService(request, fastify, request);
  } else {
    return await editWhitelabelService(request, fastify, request);
  }
};

const deleteWhitelabelService = async (request, fastify) => {
  const { id } = request.body;
  for (const elem of id) {
    const validateId = global.tblSocialMedia.find((item) => item.id === elem);
    if (validateId && validateId.imagePath) {
      await removeImageFromServer({
        path: validateId.imagePath,
      });
    }
  }
  await deleteWhitelabelQuery(id, fastify, request);
  global.tblWhitelabels = global.tblWhitelabels.filter(
    (item) => !id.includes(item.id)
  );

  await callClientAPI({
    moduleType : APIEndpointModuleType.updateSeoModule,
    data : {
      module : 'whiteLable',
      type : "delete",
      data : {
        id : id
      }
    }
  }, request, fastify,
    "services/whitelabel.js/deleteWhitelabelService"
  );
  return `Whitelabel(s) data deleted successfully`;
};

const activeInactiveWhitelabelService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await activeInactiveWhitelabelQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isActive = isActive;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : isActive ? "active" : "inactive",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/activeInactiveWhitelabelService"
  );
  return `Whitelabel data updated successfully`;
};
const upIsDefaultAPIService = async (request, fastify) => {
  const { id, isDefault } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  
  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  if(!isDefault){
    // check if any other whitelabel is default
    const defaultWhitelabel = global.tblWhitelabels.find((item) => item.isDefault === true && item.id != id);
    if(!defaultWhitelabel){
      throw new Error("No whitelabel is default, Please select any whitelabel as default");
    }
  }
  if(isDefault){
    await isDefaultUpQuery(
      {
        id,
        isDefault,
      },
      request,
      fastify
    );
    const index = global.tblWhitelabels.findIndex((item) => item.id == id);
    if (index != -1) {
      global.tblWhitelabels[index].isDefault = isDefault;
    }
    await callClientAPI(
      {
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'whiteLable',
          type : isDefault ? "isDefault" : "isNotDefault",  
          data : [id]
        }
      }, request, fastify,
      "services/whitelabel.js/upIsDefaultAPIService"
    )
    // other set to false
    let otherIndex = global.tblWhitelabels.filter((item) => item.id != id && item.isDefault == true);
    if(otherIndex.length > 0){
      otherIndex.forEach((item) => {
        item.isDefault = false;
      })
      await callClientAPI(
        {
          moduleType : APIEndpointModuleType.updateSeoModule,
          data : {
            module : 'whiteLable',
            type : "isNotDefault",
            data : otherIndex.map((item) => item.id)
          }
        }, request, fastify,
        "services/whitelabel.js/upIsDefaultAPIService"
      )
      }
  } 
  else {
    await isDefaultUpQuery(
      {
        id,
        isDefault,
      },
      request,
      fastify
    );
    const index = global.tblWhitelabels.findIndex((item) => item.id == id);
    if (index != -1) {
      global.tblWhitelabels[index].isDefault = isDefault;
    }
    await callClientAPI(
      {
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'whiteLable',
          type : "isNotDefault",
          data : [id]
        }
      }, request, fastify,
      "services/whitelabel.js/upIsDefaultAPIService"
    )
  }
  return `Whitelabel data updated successfully`;
};

const demoClientEnableInIOSWhitelabelService = async (request, fastify) => {
  const { id, isDemoClientEnableInIOS } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await demoClientEnableInIOSWhitelabelQuery(
    {
      id,
      isDemoClientEnableInIOS,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isDemoClientEnableInIOS = isDemoClientEnableInIOS;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : "isDemoClientEnableInIOS",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/demoClientEnableInIOSWhitelabelService"
  );
  return `Whitelabel data updated successfully`;
};
const isDemoClientLoginService = async (request, fastify) => {
  const { id, isDemoClientLogin } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await isDemoClientLoginQuery(
    {
      id,
      isDemoClientLogin,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isDemoClientLogin = isDemoClientLogin;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : "isDemoClientLogin",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/isDemoClientLoginService"
  );
  return `Whitelabel data updated successfully`;
};

const clientApiWhitelabelsService = async (request, fastify) => {
  const { isActive } = request.body || {};
  let activeValue = isActive !== undefined ? isActive : true
  
  let whereCondition = `tw."wrIsDeleted" = false AND tw."wrIsActive" = ${activeValue}`
  const result = await getAllEncryptWhitelabelsQuery(fastify, whereCondition);
  return result;
};
const hideEventsService = async (request, fastify) => {
  const {id ,type ,refId} = request.body;
  const wl = global.tblWhitelabels.find((item) => item.id === id);
  if (!wl) {
    throw new Error("Whitelabel with this Id not found");
  }
  // hide this event for this whitelabel
  if(type == HideEventType.eventType){
    // eventType check
    const ev = global.tblEventTypes.find((item) => item.eventTypeId == refId && item.isActive == true);
    if (!ev) {
      throw new Error("EventType with this Id not found");
    }
    const hideEvent = global.tblHideEvents.find((item) => item.whitelabelId == id && item.refId == refId);
    if(hideEvent){
      throw new Error("This event is already hidden for this whitelabel");
    }
  }
  if(type == HideEventType.competition){
    // eventCategoryType check
    const comp = global.tblCompetitions.find((item) => item.competitionId == refId && item.isActive == true);
    if (!comp) {
      throw new Error("Competition with this Id not found");
    }
    const hideEvent = global.tblHideEvents.find((item) => item.whitelabelId === id && item.refId === refId);
    if(hideEvent){
      throw new Error("This event is already hidden for this whitelabel");
    }
  }
  if(type == HideEventType.commentary){
    // eventCategoryType check
    const comm = global.tblCommentaries.find((item) => item.commentaryId == refId && item.commentaryStatus != commentaryStatus.COMPLETED && item.isActive == true);
    if (!comm) {
      throw new Error("Commentary with this Id not found");
    }
    const hideEvent = global.tblHideEvents.find((item) => item.whitelabelId === id && item.refId === refId);
    if(hideEvent){
      throw new Error("This event is already hidden for this whitelabel");
    }
  }
  const hideEvent = await hideEventsQuery({
    whitelabelId : id,
    type : type,
    refId : refId
  }, request, fastify);
  global.tblHideEvents.push(hideEvent);
  await callClientAPI(
    {
       moduleType : APIEndpointModuleType.updateSeoModule,
       data : {
         module : 'hideEvent',
         type : "hide",
         data : hideEvent
       }
    }, request, fastify,
    "services/whitelabel.js/hideEventsService"
  );
  return "Event hidden successfully";
}
const unhideEventsService = async (request, fastify) => {
  const {hideEventId } = request.body;
  // hidden event check
  const he = global.tblHideEvents.findIndex((item) => item.id == hideEventId);
  if (he == -1) {
    throw new Error("hidden event with this Id not found");
  }
  let result = await unHideEventQuery(request.body, request, fastify);
  if (result) {
    global.tblHideEvents.splice(he, 1);
  }
  await callClientAPI({
    moduleType : APIEndpointModuleType.updateSeoModule,
    data : {
      module : 'hideEvent',
      type : "unhide",
      data : {
        id : hideEventId
      }
    }
  }, request, fastify,
    "services/whitelabel.js/unhideEventsService"
  );
  return "Event unhidden successfully";
}
const getEventTypesService = async (request, fastify) => {
  // get all event types if hidden then isHide true else false
  const { id } = request.body;
  const wl = global.tblWhitelabels.find((item) => item.id == id);
  if (!wl) {
    throw new Error("Whitelabel with this Id not found");
  }
  const eventTypes = global.tblEventTypes.filter(item => item.isActive === true);
  const hideEvents = global.tblHideEvents.filter(item => item.whitelabelId == id && item.type == HideEventType.eventType);

 // Step 3: Map refId to hideEvent object for quick lookup
  const hideEventMap = new Map(hideEvents.map(item => [item.refId, item]));

  // Step 4: Merge event types with isHide and hideEventId if present
  const eventTypesWithHide = eventTypes.map(item => {
    const matchedHide = hideEventMap.get(item.eventTypeId);
    return {
      ...item,
      isHide: !!matchedHide,
      hideEventId: matchedHide?.id || null
    };
  });

  return eventTypesWithHide;
}
const getCompetitionService = async (request, fastify) => {
  // get all event types if hidden then isHide true else false
  const { id,eventTypeId } = request.body;
  const wl = global.tblWhitelabels.find((item) => item.id == id);
  if (!wl) {
    throw new Error("Whitelabel with this Id not found");
  }
  const eventType = global.tblEventTypes.find(item => item.eventTypeId == eventTypeId && item.isActive === true);
  if (!eventType) {
    throw new Error("EventType with this Id not found");
  }
  const competitions = global.tblCompetitions.filter(item => item.isActive === true && item.eventTypeId == eventTypeId);  
  const hideEvents = global.tblHideEvents.filter(item => item.whitelabelId == id && item.type == HideEventType.competition);
 
  // Step 3: Map refId to hideEvent object for quick lookup
  const hideEventMap = new Map(hideEvents.map(item => [item.refId, item]));
  // Step 4: Merge event types with isHide and hideEventId if present
  const competitionsWithHide = competitions.map(item => {
    const matchedHide = hideEventMap.get(item.competitionId);
    return {
      ...item,
      isHide: !!matchedHide,
      hideEventId: matchedHide?.id || null
    };
  });
  return competitionsWithHide;

}
const getCommentaryService = async (request, fastify) => {
  // get all event types if hidden then isHide true else false
  const { id ,competitionId} = request.body;
  const wl = global.tblWhitelabels.find((item) => item.id == id);
  if (!wl) {
    throw new Error("Whitelabel with this Id not found");
  }
  const competition = global.tblCompetitions.find(item => item.competitionId == competitionId && item.isActive === true);
  if (!competition) {
    throw new Error("Competition with this Id not found");
  }
  const commentaries = global.tblCommentaries.filter(
    item => 
    item.isActive === true &&
    item.competitionId == competitionId &&
    item.commentaryStatus != commentaryStatus.COMPLETED);
  const hideEvents = global.tblHideEvents.filter(item => item.whitelabelId == id && item.type == HideEventType.commentary);
  // Create a Set or Map for fast lookup
  const hideEventMap = new Map(hideEvents.map(item => [item.refId, item]));
  // Step 4: Merge event types with isHide and hideEventId if present
  const commentariesWithHide = commentaries.map(item => {
    const matchedHide = hideEventMap.get(item.commentaryId);
    return {
      ...item,
      isHide: !!matchedHide,
      hideEventId: matchedHide?.id || null
    };
  });

  return commentariesWithHide;
}
const getHideEventService = async (request, fastify) => {
  return global.tblHideEvents;
}
module.exports = {
  createWhitelabelService,
  allWhitelabelsService,
  whitelabelByIdService,
  deleteWhitelabelService,
  activeInactiveWhitelabelService,
  demoClientEnableInIOSWhitelabelService,
  isDemoClientLoginService,
  clientApiWhitelabelsService,
  upIsDefaultAPIService,
  hideEventsService,
  getEventTypesService,
  getCompetitionService,
  getCommentaryService,
  unhideEventsService,
  getHideEventService
};

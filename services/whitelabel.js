const {
  insertWhitelabelQuery,
  updateWhitelabelQuery,
  deleteWhitelabelQuery,
  activeInactiveWhitelabelQuery,
  demoClientEnableInIOSWhitelabelQuery,
} = require("../repository/TableWhitelabel");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { callClientAPI, ServiceType, APIEndpointModuleType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

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
      callClientAPI(
       {
          serviceType : ServiceType.clientAPI,
          moduleType : APIEndpointModuleType.updateSeoModule,
          data : {
            module : 'whiteLable',
            type : "add",
            data : saveData
          }
       }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/whitelabel.js/saveWhitelabelService - callClientAPI",
          request
        );
      });
    }
  return saveData;
};

const editWhitelabelService = async (request, fastify) => {
  console.log("request.body", request.body);
  
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
    id: parseInt(request.body.id, 10),
    isDemoClientEnableInIOS: request.body.isDemoClientEnableInIOS ?? validateId.isDemoClientEnableInIOS,
  };

  const modifiedData = await updateWhitelabelQuery(updateData, fastify, request);

  const index = global.tblWhitelabels.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblWhitelabels[index] = modifiedData[0];
  }
  
   callClientAPI(
     {
       serviceType : ServiceType.clientAPI,
       moduleType : APIEndpointModuleType.updateSeoModule,
       data : {
         module : 'whiteLable',
         type : "update",
         data : modifiedData[0]
       }
     }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/whitelabel.js/editWhitelabelService - callClientAPI",
       request
     );
   });


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

  callClientAPI({
    serviceType : ServiceType.clientAPI,
    moduleType : APIEndpointModuleType.updateSeoModule,
    data : {
      module : 'whiteLable',
      type : "delete",
      data : {
        id : id
      }
    }
  }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/whitelabel.js/deleteWhitelabelService - callClientAPI",
      request
    );
  });
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
  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : isActive ? "active" : "inactive",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/whitelabel.js/activeInactiveWhitelabelService - callClientAPI",
      request
    );
  });
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
  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : isDemoClientEnableInIOS ? "isDemoClientEnableInIOSTrue" : "isDemoClientEnableInIOSFalse",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/whitelabel.js/demoClientEnableInIOSWhitelabelService - callClientAPI",
      request
    );
  });
  return `Whitelabel data updated successfully`;
};

module.exports = {
  createWhitelabelService,
  allWhitelabelsService,
  whitelabelByIdService,
  deleteWhitelabelService,
  activeInactiveWhitelabelService,
  demoClientEnableInIOSWhitelabelService,
};

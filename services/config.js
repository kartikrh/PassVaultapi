const {
  insertConfigQuery,
  updateConfigQuery,
  deleteConfigQuery,
} = require("../repository/TableConfig");
const { callClientAPI, ServiceType, APIEndpointModuleType, callEntitySportAPI } = require("../utilities");
const configConstants = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { generateImageName, storeImageOnServer } = require("../utilities/Images");
const { errorLogger } = require("../utilities/logger");

const allCongifService = async (request,fastify) => {
  // return global.tblConfigs;
  const {isActive} = request.body;
  if(isActive === undefined){
    return global.tblConfigs;
  }
  else{
    const result = global.tblConfigs.filter((config) => config.isActive === isActive);
    return result;
  }
};

const configByIdService = async (request) => {
  const { configId } = request.body;
  const result = global.tblConfigs.find((item) => item.configId === configId);
  return result || null;
};

const createConfigService = async (request, fastify) => {
  // check if key already exists
  const checkKey = global.tblConfigs.find((item) => item.key.toLowerCase() === request.body.key.trim().toLowerCase());
  if (checkKey) {
    throw new Error("Config with this Key already exists");
  }
  if(request.body.image && request.body.image.length > 0){
    const iName = generateImageName({name : request.body.key})
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === configConstants.PROJECT_NAME.toLowerCase()
    ).value;
    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: iName,
      ...ImgModuleConfig.Config,
    });
    request.body.value = path;
  }
  const data = await insertConfigQuery(
    {
      ...request.body,
      userId :request.userTokenInfo.WrUserId,
    }, fastify, request);

  global.tblConfigs.push(data);
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateConfig,
        data : data
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/config/createConfigService",
        request
      )
    });
    callEntitySportAPI(
      {
        serviceType: ServiceType.entitySport,
        moduleType: APIEndpointModuleType.configUpdate,
        data: {
          module : "config",
          type : "add",
          data : data
        }
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/config/createConfigService - callEntitySportAPI",
        request
      )
    });
  
  return data;
};

const updateConfigService = async (request, fastify) => {
  const { configId } = request.body;
  const checkId = global.tblConfigs.find((item) => item.configId === configId);

  if (!checkId) {
    throw new Error("Config with this id not Found");
  }
  const checkKey = global.tblConfigs.find((item) => item.key.toLowerCase() === request.body.key.trim().toLowerCase() && item.configId !== configId);
  if (checkKey) {
    throw new Error("Config with this Key already exists");
  }

  const data = {
    configId: request.body.configId,
    key: request.body.key || checkId.key,
    value: request.body.value || checkId.value,
    desc: request.body.desc || checkId.desc,
    isActive : request.body.hasOwnProperty('isActive') ? request.body.isActive : checkId.isActive,
    isForAdmin: request.body.hasOwnProperty('isForAdmin') ? request.body.isForAdmin : checkId.isForAdmin,
  };

  if(request.body.image && request.body.image.length > 0){
    const iName = generateImageName({name : request.body.key})
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === configConstants.PROJECT_NAME.toLowerCase()
    ).value;
    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: iName,
      ...ImgModuleConfig.Config,
    });
    data.value = path;
  }

  // if ("isActive" in request.body) {
  //   data.isActive = request.body.isActive;
  // }

  await updateConfigQuery({
    ...data,
    userId : request.userTokenInfo.WrUserId,
  }, fastify, request);

  const index = global.tblConfigs.findIndex((item) => item.configId === configId);

  global.tblConfigs[index] = data;
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateConfig,
        data : data
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/config/updateConfigService",
        request
      )
    });

    callEntitySportAPI(
      {
        serviceType: ServiceType.entitySport,
        moduleType: APIEndpointModuleType.configUpdate,
        data: {
          module : "config",
          type : "update",
          data : data
        }
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/config/createConfigService - callEntitySportAPI",
        request
      )
    });

  return data;
};

const saveConfigService = async (request, fastify) => {
  const { configId } = request.body;

  if (configId === "0") {
    return await createConfigService(request, fastify);
  } else {
    return await updateConfigService(request, fastify);
  }
};

const deleteConfigService = async (request, fastify) => {
  const { configId } = request.body;

  await deleteConfigQuery(configId, fastify, request);

  global.tblConfigs = global.tblConfigs.filter((item) => !configId.includes(item.configId));

  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateConfig,
      data : {
        type : "delete",
        configId : configId
      }
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/config/deleteConfigService",
      request
    )
  });
  callEntitySportAPI(
      {
        serviceType: ServiceType.entitySport,
        moduleType: APIEndpointModuleType.configUpdate,
        data: {
          module : "config",
          type : "delete",
          data : configId
        }
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/config/createConfigService - callEntitySportAPI",
        request
      )
    });

  return `Config(s) deleted successfully`;
};

const allConfigDetails = async (request) => {
  let result = global.tblConfigs;

  const validKeys = request.body.keys.map(element => element.toLowerCase());
  result = result.filter(item => validKeys.includes(item.key.toLowerCase()));

  return result
};
const getInitConfigDetails = async (request,fastify) => {
  const initKeys = [configConstants.DPAPIURL, configConstants.DPAPIXKEY , configConstants.DPSOCKETURL, configConstants.SCORECARDFRAMEURL, configConstants.ENABLELOGROCKET, configConstants.LOGROCKETAPPID ,
     configConstants.ISAPPLYPLAYERSTRIKELOGIC , configConstants.ISAPPLYPARTNERSHIPLOGIC, configConstants.ENTITYSPORTURL];
  let result = global.tblConfigs.filter(item => initKeys.includes(item.key));
  return result;
}
const getAllConfigService = async (request, fastify) => {
  const validKeys = ['repetitioncallinterval', 'ismarketrepetitioncall'];
  return global.tblConfigs.filter(item =>
    validKeys.includes(item.key.toLowerCase())
  );
};

module.exports = {
  allCongifService,
  configByIdService,
  saveConfigService,
  deleteConfigService,
  allConfigDetails,
  getInitConfigDetails,
  getAllConfigService,
};

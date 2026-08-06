const {
  createAdvertiseQuery,
  updateAdvertiseQuery,
  deleteAdvertiseQuery,
  activeInactiveAdvertiseQuery,
  changeDisplayOrderQuery
} = require("../repository/TableAdvertise");
const { APIEndpointModuleType, callClientAPI, ClientAPIType, getDataFromTime, checkDataSendToClient } = require("../utilities");

const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
  const { PROJECT_NAME } = require("../utilities/configConstants");
  const { ImgModuleConfig } = require("../utilities/imageConstant");

const getAllAdvertiseService = async (request, fastify) => {
  const isActive = request.body?.isActive;
  const dateTime = request.body?.dateTime;
  const { isPermanent , startDate, endDate} = request.body;

  let data = global.tblAdvertise;

  if (isActive != undefined) {
    data = data.filter((item) => item.isActive === isActive);
  }
  if(isPermanent != undefined){
    data = data.filter((i)=> i.isPermanent == Boolean(isPermanent))
  }
  if(startDate &&  endDate){
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    data = data.filter(item => {
      if (item.isPermanent) return false; // optional
      
      const stDate = new Date(item.startDate).getTime();
      const enDate = new Date(item.endDate).getTime();

      return stDate <= end && enDate >= start;
    });
  }

  if (dateTime) {
    data = getDataFromTime(data, "pendingAdvertiseToClient");
  }

  return data;
};

const advertiseByIdService = async (request) => {
  const { advertiseId } = request.body;

  return (
    global.tblAdvertise.find((item) => item.advertiseId === advertiseId) ||
    null
  );
};

const saveAdvertiseService = async (request, fastify) => {
  const { advertiseId } = request.body;

  if (advertiseId === 0) {
    return await createAdvertiseService(request, fastify);
  } else {
    return await updateAdvertiseService(request, fastify);
  }
};

const createAdvertiseService = async (request, fastify) => {
  try {
       request.body.displayOrder = request.body.displayOrder ?? null;
    if (request.body.image && request.body.image.length) {
      const imgName = generateImageName({
        name: request.body.title,
      });
      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      )?.value;
      const { fullPath, imagePath } = await storeImageOnServer({
        image: request.body.image[0],
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.Advertise,
      });
      request.body.image = fullPath;
      request.body.imagePath = imagePath;
    }
    if (request.body.isPermanent === true) {
      request.body.startDate = null;
      request.body.endDate = null;
    }

    if (request.body?.whitelabelId) {
      request.body.whitelabelId = request.body.whitelabelId.split(",").map(id => Number(id.trim()));
    }
    const data = await createAdvertiseQuery(
      request.body,
      request,
      fastify
    );
    let newAdvertise = data[0];

    const whitelableData = global.tblWhitelabels.filter(item => newAdvertise.whitelabelId.includes(item.id));
    newAdvertise.whitelabelId = newAdvertise.whitelabelId?.map(item => {
      return {
        id: item,
        domain: whitelableData.find(wl => wl.id === item)?.domain || null,
        encryptWhitelabelId: whitelableData.find(wl => wl.id === item)?.whitelabelId || null
      };
    });
    global.tblAdvertise.push(newAdvertise);

    const sendToClient = checkDataSendToClient(newAdvertise);
    if (sendToClient) {
      await callClientAPI(
        {
          moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
          data: {
            type: ClientAPIType.Insert,
            advertise: newAdvertise
          }
        },
        request,
        fastify,
        "services/advertise.js/createAdvertiseService"
      );
    } else {
      global.pendingAdvertiseToClient.push(newAdvertise);
    }

    return newAdvertise;
  } catch (err) {
    throw new Error(`Failed to create advertise: ${err.message}`);
  }
};

const updateAdvertiseService = async (request, fastify) => {
  const validateAdvertise = global.tblAdvertise.find(
    (item) => item.advertiseId == request.body.advertiseId
  );
  if (!validateAdvertise) {
    throw new Error("Advertise with this Id not found");
  }

  request.body.whitelabelId = request.body?.whitelabelId ? request.body.whitelabelId.split(",").map(id => Number(id.trim())) : validateAdvertise.whitelabelId;

  const body = {
    advertiseId: request.body.advertiseId,
    title: request.body.title || validateAdvertise.title,
    image: validateAdvertise.image,
    imagePath: validateAdvertise.imagePath,
    link: request.body.link || validateAdvertise.link,
    isPermanent: request.body.hasOwnProperty("isPermanent")
      ? request.body.isPermanent
      : validateAdvertise.isPermanent,
    isActive: request.body.hasOwnProperty("isActive")
      ? request.body.isActive
      : validateAdvertise.isActive,
    startDate: request.body.startDate || validateAdvertise.startDate,
    endDate: request.body.endDate || validateAdvertise.endDate,
    viewerCount: validateAdvertise.viewerCount,
    whitelabelId: request.body.whitelabelId ?? validateAdvertise.whitelabelId,
    displayOrder: request.body.hasOwnProperty("displayOrder")
  ? request.body.displayOrder
  : validateAdvertise.displayOrder,
  };

  if (request.body.image && request.body.image.length) {
    if (validateAdvertise.image) {
      await removeImageFromServer({ path: validateAdvertise.image });
    }

    const imgName = generateImageName({ name: request.body.title });

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Advertise, 
    });

    body.image = fullPath;
    // body.imagePath = imagePath;
  }

  if (body.isPermanent === true) {
    body.startDate = null;
    body.endDate = null;
  }

  await updateAdvertiseQuery(body, request, fastify);

  const whitelableData = global.tblWhitelabels.filter(item => body.whitelabelId.includes(item.id));
  body.whitelabelId = body.whitelabelId?.map(item => {
    return {
      id: item,
      domain: whitelableData.find(wl => wl.id === item)?.domain || null,
      encryptWhitelabelId: whitelableData.find(wl => wl.id === item)?.whitelabelId || null
    };
  });

//   callClientAPI(
//   {
//     serviceType: ServiceType.clientAPI,
//     moduleType: APIEndpointModuleType.updateAdvertise,
//     data: body,
//   },
//   request,
//   fastify
// ).catch((err) => {
//   errorLogger(
//     fastify,
//     err.message,
//     "API ERROR --> services/advertise/updateAdvertiseService",
//     request
//   );
// });

  const index = global.tblAdvertise.findIndex(
    (item) => item.advertiseId == body.advertiseId
  );
  if (index !== -1) {
    global.tblAdvertise[index] = { ...global.tblAdvertise[index], ...body };
  }

  global.pendingAdvertiseToClient = global.pendingAdvertiseToClient.filter(item => item.advertiseId !== body.advertiseId);

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
      data: {
        type: ClientAPIType.Update,
        advertise: global.tblAdvertise[index]
      }
    },
    request,
    fastify,
    "services/advertise.js/updateAdvertiseService"
  );

  return body;
};

const deleteAdvertiseService = async (request, fastify) => {
  const { advertiseId } = request.body;
  for (const id of advertiseId) {
    const validateAdvertise = global.tblAdvertise.find(
      (item) => item.advertiseId === id
    );
    if (validateAdvertise && validateAdvertise.image) {
      await removeImageFromServer({
        path: validateAdvertise.image,
      });
    }
  }
  await deleteAdvertiseQuery(advertiseId, request, fastify);
  global.tblAdvertise = global.tblAdvertise.filter(
    (item) => !advertiseId.includes(item.advertiseId)
  );

  global.pendingAdvertiseToClient = global.pendingAdvertiseToClient.filter(item => !advertiseId.includes(item.advertiseId));

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
      data: {
        type: ClientAPIType.Delete,
        advertise: global.tblAdvertise[index]
      }
    },
    request,
    fastify,
    "services/advertise.js/deleteAdvertiseService"
  );

  return "Advertise deleted successfully";
};

const activeInactiveAdvertiseService = async (request, fastify) => {
  const { advertiseId, isActive } = request.body;

  await activeInactiveAdvertiseQuery(
    { advertiseId, isActive },
    request,
    fastify
  );

  const index = global.tblAdvertise.findIndex(
    (item) => item.advertiseId === advertiseId
  );

  global.tblAdvertise[index].isActive = isActive;

  global.pendingAdvertiseToClient = global.pendingAdvertiseToClient.filter(item => item.advertiseId !== advertiseId);

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
      data: {
        type: ClientAPIType.Update,
        advertise: global.tblAdvertise[index]
      }
    },
    request,
    fastify,
    "services/advertise.js/activeInactiveAdvertiseService"
  );

  return "Advertise updated successfully";
};

const changeDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await changeDisplayOrderQuery(item, request, fastify);
    let index = global.tblAdvertise.findIndex(
      (elem) => elem.advertiseId === item.advertiseId
    );
    if (index !== -1) {
      global.tblAdvertise[index].displayOrder = item.displayOrder;
    }
  }
  const now = Date.now();
  let allActiveData = global.tblAdvertise.filter(item =>
    item.isActive === true && (item.isPermanent === true ||
      (
        new Date(item.startDate).getTime() <= now &&
        new Date(item.endDate).getTime() >= now
      )
    )
  );
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
      data: {
        type: ClientAPIType.ChangeDisplayOrder,
        advertise: allActiveData
      }
    },
    request,
    fastify,
    "services/advertise.js/changeDisplayOrderService"
  );
 
  return true;
};
const sendActiveAdvertiseToClientAPIService = async (fastify) => {
  try {
    if (global.pendingAdvertiseToClient.length > 0) {
      const now = Date.now();
      for (const data of global.pendingAdvertiseToClient) {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();

        const result = start <= now && end >= now;
        if (result) {
          global.pendingAdvertiseToClient = global.pendingAdvertiseToClient.filter(item => item.advertiseId !== data.advertiseId);
          await callClientAPI(
            {
              moduleType: APIEndpointModuleType.upsertAdvertiseDataToClient,
              data: {
                type: ClientAPIType.Insert,
                advertise: data
              }
            },
            null,
            fastify,
            "services/advertise.js/sendActiveAdvertiseToClientAPIService"
          );
        }
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/advertise.js/sendActiveAdvertiseToClientService",
      null
    );
  }
}

module.exports = {
  getAllAdvertiseService,
  advertiseByIdService,
  saveAdvertiseService,
  deleteAdvertiseService,
  activeInactiveAdvertiseService,
  changeDisplayOrderService,
  sendActiveAdvertiseToClientAPIService
};
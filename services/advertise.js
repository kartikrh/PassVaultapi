const {
  createAdvertiseQuery,
  updateAdvertiseQuery,
  deleteAdvertiseQuery,
  activeInactiveAdvertiseQuery,
} = require("../repository/TableAdvertise");

const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
  const { PROJECT_NAME } = require("../utilities/configConstants");
  const { ImgModuleConfig } = require("../utilities/imageConstant");

const getAllAdvertiseService = async (request, fastify) => {
  const { isActive } = request.body;

  if (isActive === undefined) {
    return global.tblAdvertise;
  }

  return global.tblAdvertise.filter((item) => item.isActive === isActive);
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
    const data = await createAdvertiseQuery(
      request.body,
      request,
      fastify
    );
    const newAdvertise = data[0][0];
    global.tblAdvertise.push(newAdvertise);
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
    whitelabelId: Number(request.body.whitelabelId) || validateAdvertise.whitelabelId,
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

  const index = global.tblAdvertise.findIndex(
    (item) => item.advertiseId == body.advertiseId
  );
  if (index !== -1) {
    global.tblAdvertise[index] = { ...global.tblAdvertise[index], ...body };
  }

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

  return "Advertise updated successfully";
};

module.exports = {
  getAllAdvertiseService,
  advertiseByIdService,
  saveAdvertiseService,
  deleteAdvertiseService,
  activeInactiveAdvertiseService,
};
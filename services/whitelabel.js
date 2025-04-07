const {
  insertWhitelabelQuery,
  updateWhitelabelQuery,
  deleteWhitelabelQuery,
  activeInactiveWhitelabelQuery,
} = require("../repository/TableWhitelabel");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const saveWhitelabelService = async (request, fastify) => {
  if (request.body.imagePath && request.body.imagePath.length) {
    const imgName = generateImageName({
      name: request.body.domain,
    });

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const { imagePath } = await storeImageOnServer({
      image: request.body.imagePath[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Whitelable,
    });
    request.body.imagePath = imagePath;
  }
  const saveData = await insertWhitelabelQuery(request.body, fastify, request);
  global.tblWhitelabels.push(saveData);
  return saveData;
};

const editWhitelabelService = async (request, fastify) => {
  const validateId = global.tblWhitelabels.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Whitelabel data with this Id not found");
  }

  if (request.body.imagePath && request.body.imagePath.length) {
    const imgName = generateImageName({
      name: request.body.domain,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { imagePath } = await storeImageOnServer({
      image: request.body.imagePath[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Whitelable,
    });
    request.body.imagePath = imagePath;
  }

  const updateData = {
    domain: request.body.domain ?? validateId.domain,
    imagePath: request.body.imagePath ?? validateId.imagePath,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateWhitelabelQuery(updateData, fastify, request);

  const index = global.tblWhitelabels.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblWhitelabels[index] = modifiedData[0];
  }

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

  return `Whitelabel(s) data deleted successfully`;
};

const activeInactiveWhitelabelService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Package with this Id not found");
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

  return `Social media data updated successfully`;
};

module.exports = {
  createWhitelabelService,
  allWhitelabelsService,
  whitelabelByIdService,
  deleteWhitelabelService,
  activeInactiveWhitelabelService,
};

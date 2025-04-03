const {
  insertShotTypeQuery,
  updateShotTypeQuery,
  deleteShotTypeQuery,
  changeDisplayOrderQuery,
  isActiveInactiveChangeQuery,
} = require("../repository/TableShotType");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const saveShotTypeService = async (request, fastify, data) => {
  const validateId = global.tblShotType.find(
    (item) => item.name.toLowerCase() == request.body.name.toLowerCase()
  );
  if (validateId) {
    throw new Error("Shot type with same name already exists");
  }
  if (data.body.image && data.body.image.length) {
    const imgName = generateImageName({
      name: data.body.name,
    });

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const { fullPath, imagePath } = await storeImageOnServer({
      image: data.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.ShotType,
    });
    data.body.image = fullPath;
    data.body.imagePath = imagePath;
  }
  const saveData = await insertShotTypeQuery(data.body, fastify, request);
  global.tblShotType.push(saveData);

  return saveData;
};

const editShotTypeService = async (request, fastify, data) => {
  const validateId = global.tblShotType.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Shot type data with this Id not found");
  }
  const validateName = global.tblShotType.find(
    (item) =>
      item.name.toLowerCase() == request.body.name.toLowerCase() &&
      item.id !== request.body.id
  );
  if (validateName) {
    throw new Error("Shot type with same name already exists");
  }

  if (request.body.image && request.body.image.length) {
    const imgName = generateImageName({
      name: request.body.name,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.ShotType,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }

  const updateData = {
    name: request.body.name ?? validateId.name,
    image: request.body.image ?? validateId.image,
    isActive: request.body.isActive ?? validateId.isActive,
    id: parseInt(request.body.id, 10),
    imagePath: request.body.imagePath ?? validateId.imagePath,
  };

  const modifiedData = await updateShotTypeQuery(updateData, fastify, request);

  const index = global.tblShotType.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblShotType[index] = modifiedData[0];
  }
  return modifiedData[0];
};

const getAllShotTypesService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblShotType.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblShotType
    return result;
  }
};

const shotTypeByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblShotType.find((item) => item.id === id);
  return result || null;
};

const createShotTypeService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveShotTypeService(request, fastify, request);
  } else {
    return await editShotTypeService(request, fastify, request);
  }
};

const deleteShotTypeService = async (request, fastify) => {
  const { id } = request.body;
  for (const elem of id) {
    const validateId = global.tblShotType.find((item) => item.id === elem);
    if (validateId && validateId.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
  }
  await deleteShotTypeQuery(id, fastify, request);
  global.tblShotType = global.tblShotType.filter(
    (item) => !id.includes(item.id)
  );

  return `ShotType(s) data deleted successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await changeDisplayOrderQuery(item, request, fastify);
    let index = global.tblShotType.findIndex((elem) => elem.id === item.id);
    if (index !== -1) {
      global.tblShotType[index].displayOrder = item.displayOrder;
    }
  }

  return `Display order updated successfully`;
};

const activeInactiveShotTypeService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblShotType.find(
    (item) => item.id == id
  );
  if (!validateId) {
    throw new Error("Shot type data with this Id not found");
  }
  await isActiveInactiveChangeQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblShotType.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblShotType[index].isActive = isActive;
  }

  return `ShotType data updated successfully`;
};

module.exports = {
  createShotTypeService,
  getAllShotTypesService,
  shotTypeByIdService,
  deleteShotTypeService,
  updateDisplayOrderService,
  activeInactiveShotTypeService,
};

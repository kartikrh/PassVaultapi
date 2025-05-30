const { insertCardTypeQuery, updateCardTypeQuery, deleteCardTypeQuery, activeInactiveCardTypeQuery } = require("../repository/TableCardType");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const {
    storeImageOnServer,
    generateImageName,
    removeImageFromServer,
} = require("../utilities/Images");

 const SuitEnum = {
    1: 'hearts',
    2: 'diamonds',
    3: 'clubs',
    4: 'spades'
};

const saveCardTypeService = async (request, fastify) => {
  // let validateCode = global.tblCardType.find(
  //   (item) => item.countryCode === request.body.countryCode
  // );
  // if (validateCode) {
  //   throw new Error(`Card Type already existed`);
  // }
  // let validateName = global.tblCardType.find(
  //   (item) =>
  //     item.countryName.trim().toLowerCase() ===
  //     request.body.countryName.trim().toLowerCase()
  // );
  // if (validateName) {
  //   throw new Error(`Card Enum already existed`);
  // }

  if (request.body.image && request.body.image.length) {
    const enumValue = request.body.enum;
    const enumName = SuitEnum[enumValue] || 'unknown'; 
    const imgName = generateImageName({ name: enumName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.CardType,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }
  const saveData = await insertCardTypeQuery(request.body, fastify, request);
  global.tblCardType.push(saveData);

  return saveData;
};

const editCardTypeService = async (request, fastify) => {
  let validateId = global.tblCardType.find(
    (item) => item.id === request.body.id
  );
  if (!validateId) {
    throw new Error(`Card Type with this ID not found`);
  }

  const updateData = {
    enum: request.body.enum ?? validateId.enum,
    image: validateId.image,
    imagePath: validateId.imagePath,
    isActive: request.body.hasOwnProperty("isActive")
    ? request.body.isActive === 'true' || request.body.isActive === true
    : validateId.isActive,
    isDeleted: request.body.hasOwnProperty("isDeleted")
    ? request.body.isDeleted === 'true' || request.body.isDeleted === true
    : validateId.isDeleted,
    id: parseInt(request.body.id, 10),
  };
  if (request.body.image && request.body.image.length > 0) {
    const enumValue = request.body.enum;
    const enumName = SuitEnum[enumValue] || 'unknown';
    const imgName = generateImageName({ name: enumName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.CardType,
    });
    updateData.image = fullPath;
    updateData.imagePath = imagePath;
  }

  const modifiedData = await updateCardTypeQuery(updateData, fastify, request);

  const index = global.tblCardType.findIndex((item) => item.id === updateData.id);
  if (index !== -1) {
    global.tblCardType[index] = updateData;
  }

  return modifiedData[0];
};

const allCardTypeService = async (fastify, request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblCardType.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblCardType.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const cardTypeByIdService = async (fastify, request) => {
  let result = global.tblCardType.find((item) => item.id === request.body.id)
  return result || null;
};

const createCardTypeService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveCardTypeService(request, fastify);
  } else {
    return await editCardTypeService(request, fastify);
  }
};

const deleteCardTypeService = async (fastify, request) => {
  const { id } = request.body;
  await deleteCardTypeQuery(id, fastify, request);
  for (const codeId of id) {
    const cardType = global.tblCardType.find((item) => item.id === codeId);
    if (cardType && cardType?.image) {
      await removeImageFromServer({
        path: cardType.image,
      });
    }
  }
  global.tblCardType = global.tblCardType.filter((item) => !id.includes(item.id));

  return `Card Type(s) data deleted successfully`;
};

const activeInactiveCardTypeService = async (fastify, request) => {
  const { id, isActive } = request.body;
  const validateId = global.tblCardType.find(
    (item) => item.id === id
  );

  if (!validateId) {
    throw new Error("Card Type with this Id not found");
  }
  await activeInactiveCardTypeQuery({id, isActive }, request, fastify);
  const index = global.tblCardType.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblCardType[index].isActive = isActive;
  }

  return `Card Type data updated successfully`;
};


module.exports = {
  allCardTypeService,
  cardTypeByIdService,
  createCardTypeService,
  deleteCardTypeService,
  activeInactiveCardTypeService,
};

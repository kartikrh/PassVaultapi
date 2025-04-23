const {
  insertCountryCodeQuery,
  updateCountryCodeQuery,
  deleteCountryCodeQuery,
  activeInactiveCountryCodeQuery,
} = require("../repository/TableCountryCodes");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const {
    storeImageOnServer,
    generateImageName,
    removeImageFromServer,
} = require("../utilities/Images");

const saveCountryCodeService = async (request, fastify) => {
  let validateCode = global.tblCountryCodes.find(
    (item) => item.countryCode === request.body.countryCode
  );
  if (validateCode) {
    throw new Error(`Country Code already existed`);
  }
  let validateName = global.tblCountryCodes.find(
    (item) =>
      item.countryName.trim().toLowerCase() ===
      request.body.countryName.trim().toLowerCase()
  );
  if (validateName) {
    throw new Error(`Country Name already existed`);
  }
  if (request.body.flag && request.body.flag.length) {
    const imgName = generateImageName({ name: request.body.countryName.trim() });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.flag[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Flag,
    });
    request.body.flag = fullPath;
    request.body.flagPath = imagePath;
  }
  const saveData = await insertCountryCodeQuery(request.body, fastify, request);
  global.tblCountryCodes.push(saveData);

  return saveData;
};

const editCountryCodeService = async (request, fastify) => {
  let validateId = global.tblCountryCodes.find(
    (item) => item.id === request.body.id
  );
  if (!validateId) {
    throw new Error(`Country code with this ID not found`);
  }

  const updateData = {
    countryCode: request.body.countryCode ?? validateId.countryCode,
    countryName: request.body.countryName.trim() ?? validateId.countryName,
    flag: validateId.flag,
    flagPath: validateId.flagPath,
    // isActive: request.body.hasOwnProperty("isActive")
    //     ? request.body.isActive
    //     : validateId.isActive,
    isActive: request.body.hasOwnProperty("isActive")
    ? request.body.isActive === 'true' || request.body.isActive === true
    : validateId.isActive,
    id: parseInt(request.body.id, 10),
    maxNumber : request.body.maxNumber ?? validateId.maxNumber,
  };
  if (request.body.flag && request.body.flag.length > 0) {
    const imgName = generateImageName({ name: updateData.countryName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.flag[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Flag,
    });
    updateData.flag = fullPath;
    updateData.flagPath = imagePath;
  }

  const modifiedData = await updateCountryCodeQuery(updateData, fastify, request);

  const index = global.tblCountryCodes.findIndex((item) => item.id === updateData.id);
  if (index !== -1) {
    global.tblCountryCodes[index] = updateData;
  }

  return modifiedData[0];
};

const allCountryCodeService = async (fastify, request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblCountryCodes.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblCountryCodes.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const countryCodeByIdService = async (fastify, request) => {
  let result = global.tblCountryCodes.find((item) => item.id === request.body.id)
  return result || null;
};

const createCountryCodeService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveCountryCodeService(request, fastify);
  } else {
    return await editCountryCodeService(request, fastify);
  }
};

const deleteCountryCodeService = async (fastify, request) => {
  const { id } = request.body;
  await deleteCountryCodeQuery(id, fastify, request);
  for (const codeId of id) {
    const countryCodes = global.tblCountryCodes.find((item) => item.id === codeId);
    if (countryCodes && countryCodes?.flag) {
      await removeImageFromServer({
        path: countryCodes.flag,
      });
    }
  }
  global.tblCountryCodes = global.tblCountryCodes.filter((item) => !id.includes(item.id));

  return `Country Code(s) data deleted successfully`;
};

const activeInactiveCountryCodeService = async (fastify, request) => {
  const { id, isActive } = request.body;
  const validateId = global.tblCountryCodes.find(
    (item) => item.id === id
  );

  if (!validateId) {
    throw new Error("Country Code with this Id not found");
  }
  await activeInactiveCountryCodeQuery({id, isActive }, request, fastify);
  const index = global.tblCountryCodes.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblCountryCodes[index].isActive = isActive;
  }

  return `Country Code data updated successfully`;
};


module.exports = {
  allCountryCodeService,
  countryCodeByIdService,
  createCountryCodeService,
  deleteCountryCodeService,
  activeInactiveCountryCodeService,
};

const {
  insertPageFormateQuery,
  updatePageFormateQuery,
  validatePageFormatQuery,
  deletePageFormatQuery,
} = require("../repository/TablePageFormate");
const { removeImageFromServer, storeImageOnServer, generateImageName } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const allPageFormatService = async (request,fastify) => {
  // return global.tblPageFormats;
  const {isActive} = request.body;
  if(isActive === undefined){
    return global.tblPageFormats;
  }
  else{
    const result = global.tblPageFormats.filter((pageFormat) => pageFormat.isActive === isActive);
    return result;
  }
};

const pageFormatServiceById = async (request, fastify) => {
  const { pageFormatId } = request.body;
  const result = global.tblPageFormats.find(
    (item) => item.pageFormatId === pageFormatId
  );
  return result || null;
};

const addPageFormatService = async (request, fastify) => {
  const validateByName = global.tblPageFormats.find(
    (item) =>
      item.pageFormatName.toLowerCase() ===
      request.body.pageFormatName.toLowerCase()
  );
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }

  const { image } = request.body;
  if(image && image.length > 0){

    // generate image name
    const imgName = generateImageName({
      name : request.body.pageFormatName,
    });

    const projectName = global.tblConfigs.find((item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()).value;
    const path = await storeImageOnServer({
      image : image[0],
      project : projectName,
      name : imgName,
      ...ImgModuleConfig.PageFormates
    });

    if(!path){
      throw new Error("Error while storing image on server");
    }

    request.body.image = path;
  }
  const data = await insertPageFormateQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );
  global.tblPageFormats.push(data);
  return data;
};

const updatePageFormatService = async (request, fastify) => {
  const checkId = global.tblPageFormats.find(
    (item) => item.pageFormatId === request.body.pageFormatId
  );

  if (!checkId) {
    throw new Error("Page Format with this id not Found");
  }

  if (request.body.image && request.body.image.length > 0) {
    let imgName = generateImageName({name : request.body.pageFormatName});
    const projectName = global.tblConfigs.find((item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()).value;
    const path = await storeImageOnServer({
      image : request.body.image[0],
      project : projectName,
      name : imgName,
      ...ImgModuleConfig.PageFormates
    });

    console.log(path);
    request.body.image = path;
  }

  const body = {
    pageFormatName: request.body.pageFormatName || checkId.pageFormatName,
    pageName: request.body.pageName || checkId.pageName,
    image: request.body.image || checkId.image,
    description: request.body.description || checkId.description,
    pageFormatId: request.body.pageFormatId,
    userId: request.userTokenInfo.WrUserId,
    isActive : request.body.hasOwnProperty("isActive") 
    ? request.body.isActive 
    : checkId.isActive
  };

  // if ("isActive" in request.body) {
  //   body.isActive = request.body.isActive;
  // } else {
  //   body.isActive = checkId.isActive;
  // }

  const validateByName = await global.tblPageFormats.find(
    (item) =>
      item.pageFormatName.toLowerCase() === body.pageFormatName.toLowerCase() &&
      item.pageFormatId !== body.pageFormatId
  );
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }

  const data = await updatePageFormateQuery(body, fastify, request);

  const index = global.tblPageFormats.findIndex(
    (item) => item.pageFormatId === body.pageFormatId
  );

  global.tblPageFormats[index] = data;

  return data;
};

const deletePageFormatService = async (request, fastify) => {
  const encryptedIds = request.body.pageFormatId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validatePageFormatQuery(
      encryptedId,
      fastify,
      request
    );

    if (checkInValide) {
      throw new Error(
        `Page Formate with name ${checkInValide.wrPageFormatName} associate in Pages, skiped from deletion`
      );
    }
    else{
      // delete image
      const pageFormat = global.tblPageFormats.find((item) => item.pageFormatId === encryptedId);
      if(pageFormat?.image){
        await removeImageFromServer({
          path : pageFormat.image,
        });
      }
    }
  }

  await deletePageFormatQuery(encryptedIds, fastify, request);

  global.tblPageFormats = global.tblPageFormats.filter(
    (item) => !encryptedIds.includes(item.pageFormatId)
  );

  return "Page formate(s) deleted successfully";
};

const savePageFormatService = async (request, fastify) => {
  const { pageFormatId } = request.body;

  if (pageFormatId === "0") {
    return await addPageFormatService(request, fastify);
  } else {
    return await updatePageFormatService(request, fastify);
  }
};

module.exports = {
  allPageFormatService,
  pageFormatServiceById,
  savePageFormatService,
  deletePageFormatService,
};

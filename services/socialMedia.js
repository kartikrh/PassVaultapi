const {
    insertSocialMediaQuery,
    updateSocialMediaQuery,
    deleteSocialMediaQuery,
    activeInactiveSocialMediaQuery,
  } = require("../repository/TableSocialMedia");
  const {
    generateImageName,
    storeImageOnServer,
    removeImageFromServer,
  } = require("../utilities/Images");
  const { PROJECT_NAME } = require("../utilities/configConstants");
  const { ImgModuleConfig } = require("../utilities/imageConstant");
  
  const saveSocialMedia = async (request, fastify, data) => {
    if (data.body.image && data.body.image.length) {
      const imgName = generateImageName({
        name: data.body.name,
      });
  
      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      )?.value;
  
      const path = await storeImageOnServer({
        image: data.body.image[0],
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.SocialMedia,
      });
      data.body.image = path;
    }
  
    const saveData = await insertSocialMediaQuery(data.body, fastify, request);
    global.tblSocialMedia.push(saveData);

    return saveData;
  };
  
  const editSocialMedia = async (request, fastify, data) => {
    const validateId = global.tblSocialMedia.find(
      (item) => item.id == request.body.id
    );
    if (!validateId) {
      throw new Error("Social media data with this Id not found");
    }
  
    if (request.body.image && request.body.image.length) {
      const imgName = generateImageName({
        name: request.body.name,
      });
      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      ).value;
      const path = await storeImageOnServer({
        image: request.body.image[0],
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.SocialMedia,
      });
      request.body.image = path;
    }
  
    const updateData = {
      name: request.body.name ?? validateId.name,
      link: request.body.link ?? validateId.link,
      image: request.body.image ?? validateId.image,
      isActive: Boolean(request.body.isActive) ?? validateId.isActive,
      id: parseInt(request.body.id, 10),
  };
  
    const modifiedData = await updateSocialMediaQuery(updateData, fastify, request);
    
    const index = global.tblSocialMedia.findIndex(
      (item) => item.id == request.body.id
    );
    
    if(index != -1){
      global.tblSocialMedia[index] = modifiedData[0];
    }

    return modifiedData[0];
  };
  
  const allSocialMediaService = async (request) => {
    const { isActive } = request.body || {};
    if (isActive !== undefined) {
      const result = global.tblSocialMedia.filter(
        (item) => item.isActive === isActive
      );
      return result;
    } else {
      const result = global.tblSocialMedia.filter(
        (item) => item.isActive === true
      );
      return result;
    }
  };
  
  const socialMediaByIdService = async (request) => {
    const { id } = request.body;
    const result = global.tblSocialMedia.find((item) => item.id === id);
    return result || null;
  };
  
  const createSocialMediaService = async (request, fastify) => {
    if (request.body.id == 0) {
      return await saveSocialMedia(request, fastify, request);
    } else {
      return await editSocialMedia(request, fastify, request);
    }
  };
  
  const deleteSocialMediaService = async (request, fastify) => {
    const { id } = request.body;
    for (const elem of id) {
      const validateId = global.tblSocialMedia.find((item) => item.id === elem);
      if (validateId && validateId.image) {
        await removeImageFromServer({
          path: validateId.image,
        });
      }
    }
    await deleteSocialMediaQuery(id, fastify, request);
    global.tblSocialMedia = global.tblSocialMedia.filter(
      (item) => !id.includes(item.id)
    );
  
    return `Social media(s) data deleted successfully`;
  };
  
  const activeInactiveSocialMediaService = async (request, fastify) => {
    const { id, isActive } = request.body;
    await activeInactiveSocialMediaQuery(
      {
        id,
        isActive,
      },
      request,
      fastify
    );
    const index = global.tblSocialMedia.findIndex((item) => item.id == id);
    if(index != -1){
      global.tblSocialMedia[index].isActive = isActive;
    }
    
    return `Social media data updated successfully`;
  };
  
  module.exports = {
    allSocialMediaService,
    socialMediaByIdService,
    createSocialMediaService,
    deleteSocialMediaService,
    activeInactiveSocialMediaService,
  };
  
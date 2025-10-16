const path = require("path");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { storeImageOnServer } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { generateFileName } = require("../utilities/generateFileName");

const ckImageUploadService = async (request) => {
    if (request.body.upload && request.body.upload.length) {
        const imgName = 'content_' + generateFileName();
        const projectName = global.tblConfigs.find((item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()).value;
        const config = ImgModuleConfig[request?.query?.type] || ImgModuleConfig.CK_Images;
        const imagePath = await storeImageOnServer({
            image: request.body.upload[0],
            project: projectName,
            name: imgName,
            ...config
        });
        request.body.image = imagePath.fullPath;
        return imagePath?.fullPath;
    }
}
const imgUploadService = async (request) =>{
    if(request.body.image && request.body.image.length){
        const module = request.body.module.toLowerCase();
        const imgName = `${module}_` + generateFileName();
        const imgConfig = ImgModuleConfig.CK_Images;
        const projectName = global.tblConfigs.find((item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()).value;
        const imagePath = await storeImageOnServer({
            image: request.body.image[0],
            project: projectName,
            name: imgName,
            ...imgConfig
        });
        return {
            path : imagePath?.fullPath,
        };
    }
}
module.exports = {
    ckImageUploadService,
    imgUploadService
};
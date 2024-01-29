const path = require("path");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { storeImageOnServer } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { generateFileName } = require("../utilities");

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
        request.body.image = imagePath;
        return imagePath;
    }
}

module.exports = {
    ckImageUploadService,
};
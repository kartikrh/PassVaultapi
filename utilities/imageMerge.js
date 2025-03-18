const mergeImages = require("merge-images");
const { Canvas, Image, createCanvas, loadImage } = require("canvas");
const path = require("path");
const configConstants = require("./configConstants");
const { generateImageName, storeImageOnServer, removeImageFromServer } = require("./Images");
const { PROJECT_NAME } = require("./configConstants");
const { ImgModuleConfig } = require("./imageConstant");
const { errorLogger } = require("./logger");
const axios = require("axios");
const { updateTeamPlayerImageQuery } = require("../repository/TableTeamPlayer");
const { updateCommentaryPlayerJerseyImageQuery } = require("../repository/TableCommentary");
const sharp = require("sharp");


const convertToPng = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    let imageBuffer = Buffer.from(response.data);

    if (!imageUrl.toLowerCase().endsWith(".png")) {
      imageBuffer = await sharp(imageBuffer)
        .toFormat("png", { quality: 100, compressionLevel: 0 })
        .toBuffer();
    }

    return imageBuffer;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> utilities/imageMerge.js/convertToPng",
      null
    );
    return null;
  }
};


const resizeImage = async (imageBuffer, width, height, fastify) => {
  try {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toBuffer("image/png");
  } catch (error) {
    errorLogger(fastify, error.message, "ERROR --> utilities/imageMerge.js/resizeImage", null);
    return null;
  }
};

// const resizeImage = async (imageBuffer, width, height, fastify) => {
//   try {
//     return await sharp(imageBuffer)
//       .resize(width, height, {withoutEnlargement: true })
//       .toFormat("png", { quality: 100, compressionLevel: 0 })
//       .toBuffer();
//   } catch (error) {
//     errorLogger(fastify, error.message, "ERROR --> utilities/imageMerge.js/resizeImage", null);
//     return null;
//   }
// };

const mergeAndSaveImage = async (data, fastify) => {
  try {
    let playerBuffer = await convertToPng(data.playerImage);
    let jerseyBuffer = await convertToPng(data.jersey);

    const backgroundImage = path.resolve("bgMergeImage", "bgMergeImage.png");
    const CANVAS_WIDTH = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.BGIMGWIDTH.toLowerCase())?.value,
        10
      );
    const CANVAS_HEIGHT = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.BGIMGHEIGHT.toLowerCase())?.value,
        10
      );
    const PLAYER_WIDTH = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.PLAYERIMAGEWIDTH.toLowerCase())?.value,
        10
      );
    const PLAYER_HEIGHT = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.PLAYERIMAGEHEIGHT.toLowerCase())?.value,
        10
      );
    const JERSEY_WIDTH = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.JERSEYWIDTH.toLowerCase())?.value,
        10
      );
    const JERSEY_HEIGHT = parseInt(
        global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.JERSEYHEIGHT.toLowerCase())?.value,
        10
      );

    const bgImage = await resizeImage(backgroundImage, CANVAS_WIDTH, CANVAS_HEIGHT, fastify);
    const playerImage = await resizeImage(playerBuffer, PLAYER_WIDTH, PLAYER_HEIGHT, fastify);
    const jerseyImage = await resizeImage(jerseyBuffer, JERSEY_WIDTH, JERSEY_HEIGHT, fastify);

    const positionConfig = {
      playerX: parseInt(global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.PLAYERIMAGEXPOSITION.toLowerCase())?.value, 10),
      playerY: parseInt(global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.PLAYERIMAGEYPOSITION.toLowerCase())?.value, 10),
      jerseyX: parseInt(global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.JERSEYXPOSITION.toLowerCase())?.value, 10),
      jerseyY: parseInt(global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.JERSEYYPOSITION.toLowerCase())?.value, 10),
    };
    const base64Image = await mergeImages(
      [
        { src: bgImage, x: 0, y: 0 },
        { src: playerImage, x: positionConfig.playerX, y: positionConfig.playerY },
        { src: jerseyImage, x: positionConfig.jerseyX, y: positionConfig.jerseyY },
      ],
      { Canvas, Image }
    );

    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imgName = generateImageName({ name: `${data.playerName.trim().toLowerCase()}-${data.teamName.trim().toLowerCase()}` });
    const fileUploadURL = global.tblConfigs.find((item) => item.key === configConstants.FILE_UPLOAD_URL)?.value;

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const removeImagePath = `${fileUploadURL}/${projectName}/${ImgModuleConfig.PlayerAndJersey.type}/${imgName}.png`
    await removeImageFromServer({ path: removeImagePath });

    const bodyImage = {
      data: imageBuffer,
      filename: `${imgName}.png`,
      encoding: "7bit",
      mimetype: "image/png",
      limit: false,
    }
    const imagePath = await storeImageOnServer({
      image: bodyImage,
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.PlayerAndJersey,
    });
    if(data.teamPlayerId){
      await updateTeamPlayerImageQuery({ teamPlayerId: data.teamPlayerId, jerseyPlayerImage: imagePath }, fastify);
    }

    if(data.commentaryPlayerId){
      await updateCommentaryPlayerJerseyImageQuery(
        { commentaryPlayerId: data.commentaryPlayerId, jerseyPlayerImage: imagePath },
        fastify
      );
    }
  } catch (error) {
    console.log("mergeimage error", error)
    errorLogger(
      fastify,
      error.message,
      "ERROR --> utilities/imageMerge.js/mergeAndSaveImage",
      null
    );
  }
};

module.exports = {
  mergeAndSaveImage
};
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
const { updateCommentaryPlayerJerseyImageQuery, updateCommPlayersImagePathQuery } = require("../repository/TableCommentary");
const sharp = require("sharp");


const convertToPng = async (imageUrl, fastify, data) => {
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
      `${error.message} ${data?.playerName ? '- ' + data?.playerName : ""} ${data?.teamName ? ' and teamName ' + data?.teamName : ""} ${data?.commentaryId ? ' with ' + data?.commentaryId : " "}`,
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
    let playerBuffer = await convertToPng(data.playerImage, fastify, data);
    let jerseyBuffer =  await convertToPng(data.jersey, fastify, data);

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
    if(!CANVAS_HEIGHT || !CANVAS_WIDTH || !PLAYER_HEIGHT || !PLAYER_WIDTH || !JERSEY_HEIGHT || !JERSEY_WIDTH){
      throw new Error("Image size not found in config");
    }

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
    // const imgName = generateImageName({ name: `${data.playerName.trim().toLowerCase()}-${data.teamName.trim().toLowerCase()}` });
    const imgName = generateImageName({
      name: `${data.playerName.trim().toLowerCase().replace(/\s|-/g, '')}-${data.teamName.trim().toLowerCase().replace(/\s|-/g, '')}`
    });
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
    const { fullPath, imagePath } = await storeImageOnServer({
      image: bodyImage,
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.PlayerAndJersey,
    });
    if(data.teamPlayerId){
      const updateData = await updateTeamPlayerImageQuery({ teamPlayerId: data.teamPlayerId, jerseyPlayerImage: fullPath, jerseyPlayerImagePath: imagePath }, fastify);
      if (updateData && updateData.length > 0) {
        const { refPlayerId, teamId } = updateData[0];
        await updateCommPlayerImagePath(refPlayerId, teamId, fullPath, imagePath, fastify);
      }
    }

    if(data.commentaryPlayerId){
      const updateData = await updateCommentaryPlayerJerseyImageQuery(
        { commentaryPlayerId: data.commentaryPlayerId, jerseyPlayerImage: fullPath, jerseyPlayerImagePath: imagePath },
        fastify
      );
      if (updateData && updateData.length > 0) {
        const { playerId, teamId } = updateData[0];
        await updateCommPlayerImagePath(playerId, teamId, fullPath, imagePath, fastify);
      }
    }
    return { fullPath, imagePath };
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

const updateCommPlayerImagePath = async (playerId, teamId, fullPath, imagePath, fastify) => {
  if (!playerId || !teamId || !fullPath || !imagePath) {
    return;
  }

  await updateCommPlayersImagePathQuery(
    {
      playerId,
      teamId,
      jerseyPlayerImage: fullPath,
      jerseyPlayerImagePath: imagePath,
    },
    fastify
  );

  const commPlayerData = global.tblCommentaryPlayers.filter(
    (item) => item.playerId === playerId && item.teamId === teamId
  );

  for (const commPlayer of commPlayerData) {
    const index = global.tblCommentaryPlayers.findIndex(
      (item) => item.commentaryPlayerId === commPlayer.commentaryPlayerId
    );

    if (index !== -1) {
      global.tblCommentaryPlayers[index] = {
        ...global.tblCommentaryPlayers[index],
        jerseyPlayerImage: fullPath,
        jerseyPlayerImagePath: imagePath,
      };
    }
  }
};

module.exports = {
  mergeAndSaveImage
};
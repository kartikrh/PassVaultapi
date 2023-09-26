const fs = require("fs");
const { generateFileName } = require("./index");
const path = require("path");

const storeImage = async (imageBuffer) => {
  try {
    const folderPath = path.join(__dirname, "../images");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const { filename, data } = await imageBuffer;

    const { ext } = path.parse(filename);
    const filenameNew = generateFileName() + ext;
    const imagePath = path.join(folderPath, filenameNew);

    fs.writeFile(imagePath, data, (err) => {
      if (err) {
        throw new Error(err.message);
      }
    });

    return `/images/${filenameNew}`;
  } catch (err) {
    throw new Error(err.message);
  }
};

const removeImage = async (imageName) => {
  try {
    const fullPath = path.join(__dirname, "../", imageName);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          throw new Error(err.message);
        }
      });
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  storeImage,
  removeImage,
};

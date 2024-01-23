const fs = require("fs");
const { generateFileName } = require("./index");
const path = require("path");
const { default: axios } = require("axios");
const FormData = require('form-data');
const { FILE_UPLOAD_URL } = require("./configConstants");

const storeImage = async (imageBuffer) => {
  try {
    const folderPath = path.join(__dirname, "../images");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const { filename, data } = await imageBuffer;

    if (!data) {
      throw new Error("Try Image With Smaller Size");
    }

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
const storeImageOnServer = async (args) => {
    const formData = new FormData();
    formData.append("project", args.project);
    formData.append("type", args.type);
    formData.append("name", args.name);
    formData.append("format", args.formate);
    formData.append("size", args.size);
    formData.append("width", args.width);
    formData.append("height", args.height);


    const {filename , data } = args.image;
    const imageBuffer = Buffer.from(data, 'base64');
    formData.append("file", imageBuffer, { filename});
    const fileUploadURL = global.tblConfigs.find((item) => item.key === FILE_UPLOAD_URL).value;
    const result = await axios.post(
      `${fileUploadURL}/save`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    if(!result.data.success){
      throw new Error(result.data.error.message);
    }
    return result.data.result;
}

const removeImageFromServer = async (args) =>{
  const fileUploadURL = global.tblConfigs.find((item) => item.key === FILE_UPLOAD_URL).value;
  const result = await axios.post(
    `${fileUploadURL}/delete`,
    {
        path : args.path
    }
  );
  console.log(result.data);
  if(!result.data.success){
    throw new Error(result.data.error.message);
  }
  return result.data.result;
}

const generateImageName = (args) => {
  // replace spaces with -
  const name = args.name.replace(/\s/g, "-");
  // and remove special characters
  const imageName = name.replace(/[^a-zA-Z0-9-_]/g, "");
  return imageName;
}
module.exports = {
  storeImage,
  removeImage,
  storeImageOnServer,
  removeImageFromServer,
  generateImageName
};

const fs = require("fs");
const { generateFileName } = require("./index");
const path = require("path");
const { default: axios } = require("axios");
const FormData = require('form-data');
const { FILE_UPLOAD_URL, VIDEOUPLOADMAXSIZE, PROJECT_NAME } = require("./configConstants");

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
   try {
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
    return {
      fullPath: result.data.result.fullPath,
      imagePath: result.data.result.imagePath,
    };
    // return result.data.result;
   } catch (error) {
      console.log("Error in storeImageOnServer", error);
      throw new Error(error.message);
   }
}

const storeFileOnServer = async (args) => {
  try {
    const formData = new FormData();
    formData.append("project", args.project);
    formData.append("type", args.type);
    formData.append("name", args.name);
    formData.append("format", args.formate);
    formData.append("size", args.size);
    formData.append("width", args.width);
    formData.append("height", args.height);

    const { filename, data } = args.file;

    const fileBuffer = Buffer.from(data, 'base64');
    const mimeType = args.file.mimetype || "application/octet-stream";

    formData.append("file", fileBuffer, { filename, contentType: mimeType });

    const fileUploadURL = global.tblConfigs.find(
      (item) => item.key === FILE_UPLOAD_URL
    )?.value;

    const fileUploadSize = global.tblConfigs.find(
      (item) => item.key === VIDEOUPLOADMAXSIZE
    )?.value;
    const maxSize = (fileUploadSize ? parseInt(fileUploadSize) : 50) * 1024 * 1024;

    if (formData?._valueLength > maxSize) {
      throw new Error(`Video size is too large. Maximum allowed size is ${maxSize / (1024 * 1024)} MB.`);
    }
    const result = await axios.post(
      `${fileUploadURL}/save`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (!result.data.success) {
      throw new Error(result.data.error.message);
    }
    // return result.data.result;
    return {
      fullPath: result.data.result.fullPath,
      imagePath: result.data.result.imagePath,
    };
  } catch (error) {
    console.error("Error in storeFileOnServer:", error);
    throw error;
  }
};

const removeImageFromServer = async (args) =>{
  try {
    const fileUploadURL = global.tblConfigs.find((item) => item.key === FILE_UPLOAD_URL).value;
    const result = await axios.post(
      `${fileUploadURL}/delete`,
      {
          path : args.path
      }
    );
    if(!result.data.success){
      throw new Error(result.data.error.message);
    }
    return result.data.result;
  } catch (error) {
    console.log("Error in removeImageFromServer", error);
    throw new Error(error.message);
  }
}

const generateImageName = (args) => {
  // replace spaces with -
  const name = args.name.replace(/\s/g, "-");
  // and remove special characters
  const imageName = name.replace(/[^a-zA-Z0-9-_]/g, "");
  return imageName;
}

const getImageFromUrl = async (args) => {
  try {
    const { type, imageUrl } = args;
    const fileUploadURL = global.tblConfigs.find((item) => item.key === FILE_UPLOAD_URL).value;
    const projectName = global.tblConfigs.find((item) => item.key === PROJECT_NAME).value;
    const result = await axios.post(
      `${fileUploadURL}/download`,
      {
        project: projectName,
        type,
        imageUrl
      }
    );
    if (!result.data.success) {
      throw new Error(result.data.error.message);
    }
    return result.data.result;
  } catch (error) {
    console.log("Error in getImageFromUrl", error);
    throw new Error(error.message);
  }
}

module.exports = {
  storeImage,
  removeImage,
  storeImageOnServer,
  removeImageFromServer,
  generateImageName,
  storeFileOnServer,
  getImageFromUrl
};

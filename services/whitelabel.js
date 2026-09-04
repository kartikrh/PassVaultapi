const {
  insertWhitelabelQuery,
  updateWhitelabelQuery,
  deleteWhitelabelQuery,
  activeInactiveWhitelabelQuery,
  demoClientEnableInIOSWhitelabelQuery,
  isDemoClientLoginQuery,
  getAllEncryptWhitelabelsQuery,
  isDefaultUpQuery,
} = require("../repository/TableWhitelabel");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { callClientAPI, APIEndpointModuleType, encrypt, decrypt } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

// Uploads whichever of logo/favicon were sent as new files on this request,
// mutating request.body[field] in place from a raw upload into the stored
// fullPath -- same convention as Banner's "image" field. Fields left
// untouched (still a string, or absent) pass through unchanged so the
// caller's existing/default value wins.
const uploadWhitelabelImages = async (request) => {
  const projectName = global.tblConfigs.find(
    (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
  )?.value;

  if (request.body.logo && request.body.logo.length) {
    const imgName = generateImageName({ name: `${request.body.domain || "whitelabel"}-logo` });
    const { fullPath } = await storeImageOnServer({
      image: request.body.logo[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.WhitelabelLogo,
    });
    request.body.logo = fullPath;
  }

  if (request.body.favicon && request.body.favicon.length) {
    const imgName = generateImageName({ name: `${request.body.domain || "whitelabel"}-favicon` });
    const { fullPath } = await storeImageOnServer({
      image: request.body.favicon[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.WhitelabelFavicon,
    });
    request.body.favicon = fullPath;
  }
};

const saveWhitelabelService = async (request, fastify) => {
  await uploadWhitelabelImages(request);
  const saveData = await insertWhitelabelQuery(request.body, fastify, request);
  global.tblWhitelabels.push(saveData);
  if(saveData.isActive){
      await callClientAPI(
       {
          moduleType : APIEndpointModuleType.updateSeoModule,
          data : {
            module : 'whiteLable',
            type : "add",
            data : saveData
          }
       }, request, fastify,
        "services/whitelabel.js/saveWhitelabelService"
      );
    }
  return saveData;
};

const editWhitelabelService = async (request, fastify) => { 
  const validateId = global.tblWhitelabels.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Whitelabel data with this Id not found");
  }

  await uploadWhitelabelImages(request);

  const updateData = {
    domain: request.body.domain ?? validateId.domain,
    imagePath: request.body.imagePath ?? validateId.imagePath,
    logo: request.body.logo ?? validateId.logo,
    favicon: request.body.favicon ?? validateId.favicon,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    id: request.body.id ?? validateId.id,
    isDemoClientEnableInIOS: request.body.isDemoClientEnableInIOS ?? validateId.isDemoClientEnableInIOS,
    isDemoClientLogin: request.body.isDemoClientLogin ?? validateId.isDemoClientLogin,
    isRecatchEnable: request.body.isRecatchEnable ?? validateId.isRecatchEnable,
    recatchKey: request.body.recatchKey ?? validateId.recatchKey,
    recatchSecret: request.body.recatchSecret ?? validateId.recatchSecret,
    isGoogleLogin: request.body.isGoogleLogin ?? validateId.isGoogleLogin,
    googleKey: request.body.googleKey ?? validateId.googleKey,
    googleSecret: request.body.googleSecret ?? validateId.googleSecret,
    clientOTP: request.body.clientOTP ?? validateId.clientOTP,
    whitelabelId : request.body.whitelabelId ?? validateId.whitelabelId,
    isDefault: request.body.isDefault ?? validateId.isDefault,
    mailSettingId: request.body.mailSettingId ?? validateId.mailSettingId,
  };

  const modifiedData = await updateWhitelabelQuery(updateData, fastify, request);

  const index = global.tblWhitelabels.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblWhitelabels[index] = {
      ...global.tblWhitelabels[index],
      ...modifiedData[0],
    };
  }
  
   await callClientAPI(
     {
       moduleType : APIEndpointModuleType.updateSeoModule,
       data : {
         module : 'whiteLable',
         type : "update",
         data : updateData
       }
     }, request, fastify,
     "services/whitelabel.js/editWhitelabelService"
   );


  return modifiedData[0];
};

const allWhitelabelsService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblWhitelabels.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblWhitelabels.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

// GET-equivalent for a browser client (no auth, called before anyone is
// signed in) -- unlike allWhitelabelsService above (used by the staff admin
// panel), this hands back only what a public page needs to light up Google
// login / reCAPTCHA. Everything else on tblWhitelabel (clientOTP,
// mobile*AuthKey/SemlessOTPKey, encryptedWhitelabelId, createdBy, ...) stays
// server-side.
const PUBLIC_WHITELABEL_FIELDS = ["domain", "isGoogleLogin", "googleKey", "isRecatchEnable", "recatchKey", "isDefault", "logo", "favicon"];

const publicWhitelabelsService = async () => {
  return global.tblWhitelabels
    .filter((item) => item.isActive)
    .map((item) => {
      const picked = {};
      PUBLIC_WHITELABEL_FIELDS.forEach((key) => {
        picked[key] = item[key];
      });
      return picked;
    });
};

// Decrypts googleSecret/recatchSecret for the Add/Edit White Label form,
// same convention as mailSettingsById decrypting Mail Settings' password
// field. The list endpoints (allWhitelabelsService, publicWhitelabelsService)
// never do this -- both secrets stay encrypted everywhere except this one
// lookup, and recatchSecret is never added to PUBLIC_WHITELABEL_FIELDS at
// all, so it never reaches the unauthenticated public endpoint.
const whitelabelByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblWhitelabels.find((item) => item.id === id);
  if (!result) return null;
  const decryptedGoogleSecret = result.googleSecret ? await decrypt(result.googleSecret) : result.googleSecret;
  const decryptedRecatchSecret = result.recatchSecret ? await decrypt(result.recatchSecret) : result.recatchSecret;
  return { ...result, googleSecret: decryptedGoogleSecret, recatchSecret: decryptedRecatchSecret };
};

const createWhitelabelService = async (request, fastify) => {
  if (request.body.googleSecret) {
    request.body.googleSecret = encrypt(request.body.googleSecret);
  }
  if (request.body.recatchSecret) {
    request.body.recatchSecret = encrypt(request.body.recatchSecret);
  }
  if (request.body.id == 0) {
    return await saveWhitelabelService(request, fastify, request);
  } else {
    return await editWhitelabelService(request, fastify, request);
  }
};

const deleteWhitelabelService = async (request, fastify) => {
  const { id } = request.body;
  for (const elem of id) {
    const validateId = global.tblWhitelabels.find((item) => item.id === elem);
    if (validateId && validateId.imagePath) {
      await removeImageFromServer({
        path: validateId.imagePath,
      });
    }
    if (validateId && validateId.logo) {
      await removeImageFromServer({
        path: validateId.logo,
      });
    }
    if (validateId && validateId.favicon) {
      await removeImageFromServer({
        path: validateId.favicon,
      });
    }
  }
  await deleteWhitelabelQuery(id, fastify, request);
  global.tblWhitelabels = global.tblWhitelabels.filter(
    (item) => !id.includes(item.id)
  );

  await callClientAPI({
    moduleType : APIEndpointModuleType.updateSeoModule,
    data : {
      module : 'whiteLable',
      type : "delete",
      data : {
        id : id
      }
    }
  }, request, fastify,
    "services/whitelabel.js/deleteWhitelabelService"
  );
  return `Whitelabel(s) data deleted successfully`;
};

const activeInactiveWhitelabelService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await activeInactiveWhitelabelQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isActive = isActive;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : isActive ? "active" : "inactive",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/activeInactiveWhitelabelService"
  );
  return `Whitelabel data updated successfully`;
};
const upIsDefaultAPIService = async (request, fastify) => {
  const { id, isDefault } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  
  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  if(!isDefault){
    // check if any other whitelabel is default
    const defaultWhitelabel = global.tblWhitelabels.find((item) => item.isDefault === true && item.id != id);
    if(!defaultWhitelabel){
      throw new Error("No whitelabel is default, Please select any whitelabel as default");
    }
  }
  if(isDefault){
    await isDefaultUpQuery(
      {
        id,
        isDefault,
      },
      request,
      fastify
    );
    const index = global.tblWhitelabels.findIndex((item) => item.id == id);
    if (index != -1) {
      global.tblWhitelabels[index].isDefault = isDefault;
    }
    await callClientAPI(
      {
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'whiteLable',
          type : isDefault ? "isDefault" : "isNotDefault",  
          data : [id]
        }
      }, request, fastify,
      "services/whitelabel.js/upIsDefaultAPIService"
    )
    // other set to false
    let otherIndex = global.tblWhitelabels.filter((item) => item.id != id && item.isDefault == true);
    if(otherIndex.length > 0){
      otherIndex.forEach((item) => {
        item.isDefault = false;
      })
      await callClientAPI(
        {
          moduleType : APIEndpointModuleType.updateSeoModule,
          data : {
            module : 'whiteLable',
            type : "isNotDefault",
            data : otherIndex.map((item) => item.id)
          }
        }, request, fastify,
        "services/whitelabel.js/upIsDefaultAPIService"
      )
      }
  } 
  else {
    await isDefaultUpQuery(
      {
        id,
        isDefault,
      },
      request,
      fastify
    );
    const index = global.tblWhitelabels.findIndex((item) => item.id == id);
    if (index != -1) {
      global.tblWhitelabels[index].isDefault = isDefault;
    }
    await callClientAPI(
      {
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'whiteLable',
          type : "isNotDefault",
          data : [id]
        }
      }, request, fastify,
      "services/whitelabel.js/upIsDefaultAPIService"
    )
  }
  return `Whitelabel data updated successfully`;
};

const demoClientEnableInIOSWhitelabelService = async (request, fastify) => {
  const { id, isDemoClientEnableInIOS } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await demoClientEnableInIOSWhitelabelQuery(
    {
      id,
      isDemoClientEnableInIOS,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isDemoClientEnableInIOS = isDemoClientEnableInIOS;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : "isDemoClientEnableInIOS",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/demoClientEnableInIOSWhitelabelService"
  );
  return `Whitelabel data updated successfully`;
};
const isDemoClientLoginService = async (request, fastify) => {
  const { id, isDemoClientLogin } = request.body;
  const validateId = global.tblWhitelabels.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Whitelabel with this Id not found");
  }
  await isDemoClientLoginQuery(
    {
      id,
      isDemoClientLogin,
    },
    request,
    fastify
  );
  const index = global.tblWhitelabels.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblWhitelabels[index].isDemoClientLogin = isDemoClientLogin;
  }
  await callClientAPI(
    {
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'whiteLable',
        type : "isDemoClientLogin",
        data : global.tblWhitelabels[index]
      }
    }, request, fastify,
    "services/whitelabel.js/isDemoClientLoginService"
  );
  return `Whitelabel data updated successfully`;
};

const clientApiWhitelabelsService = async (request, fastify) => {
  const { isActive } = request.body || {};
  let activeValue = isActive !== undefined ? isActive : true
  
  let whereCondition = `tw."wrIsDeleted" = false AND tw."wrIsActive" = ${activeValue}`
  const result = await getAllEncryptWhitelabelsQuery(fastify, whereCondition);
  return result;
};
module.exports = {
  createWhitelabelService,
  allWhitelabelsService,
  whitelabelByIdService,
  deleteWhitelabelService,
  activeInactiveWhitelabelService,
  demoClientEnableInIOSWhitelabelService,
  isDemoClientLoginService,
  clientApiWhitelabelsService,
  upIsDefaultAPIService,
  publicWhitelabelsService,
};

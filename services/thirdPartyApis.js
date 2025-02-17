const {
  insertThirdPartyApisQuery,
  updateThirdPartyApisQuery,
  deleteThirdPartApisQuery,
  activeInactiveThirdPartyApisQuery,
  isDefaultChangeQuery,
  isDefaultFalseQuery
} = require("../repository/TableThirdPartyApis");

const allThirdPartyApisService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblThirdPartyApis.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblThirdPartyApis.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const thirdPartyApiseByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblThirdPartyApis.find((item) => item.id === id);
  return result || null;
};

const createThirdPartyApisService = async (request, fastify) => {
  const validateUrl = global.tblThirdPartyApis.find((item) => item.url.toLowerCase() === request.body.url.toLowerCase());
  if(validateUrl){
    throw new Error("URL already exists");
  }
  const saveData = await insertThirdPartyApisQuery(request.body, fastify, request);
//   if (request.body.type === 1 && request.body.isDefault === true ||
//     request.body.type === 2 && request.body.isDefault === true) {  
//     await isDefaultFalseQuery(saveData, fastify, {...request.body})
//     global.tblThirdPartyApis.forEach((item) => {
//         if (item.id !== saveData.id && item.type === request.body.type) {
//             item.isDefault = false;
//         }
//     });
// }
  global.tblThirdPartyApis.push(saveData);
  return saveData;
};

const updateThirdPartyApisService = async (request, fastify) => {
  const checkId = global.tblThirdPartyApis.find((item) => item.id === request.body.id);
  if (!checkId) {
    throw new Error("ID not Found");
  }

  const validateUrl = global.tblThirdPartyApis.find((item) => item.url.toLowerCase() === request.body.url.toLowerCase()
    && item.id !== request.body.id);
  if(validateUrl){
    throw new Error("URL already exists");
  }

  const updateData = {
    providerName: request.body.providerName ?? checkId.providerName,
    url: request.body.url ?? checkId.url,
    type: request.body.type ?? checkId.type,
    isActive: request.body.isActive ?? checkId.isActive,
    isConnect: request.body.isConnect ?? checkId.isConnect,
    isDefault: request.body.isDefault ?? checkId.isDefault,
    id: request.body.id,
    adminDisconnected: checkId.adminDisconnected ?? true,
};

//   if (updateData.type === 1 && updateData.isDefault === true ||
//     updateData.type === 2 && updateData.isDefault === true) {
//     await isDefaultFalseQuery(updateData, fastify, {...request.body})
//     global.tblThirdPartyApis.forEach((item) => {
//         if (item.id !== updateData.id && item.type === updateData.type) {
//             item.isDefault = false;
//         }
//     });
// }

  await updateThirdPartyApisQuery(updateData, fastify, request);

  const index = global.tblThirdPartyApis.findIndex(
    (item) => item.id === updateData.id
  );
  if (index !== -1) {
    global.tblThirdPartyApis[index] = updateData;
  }

  return updateData;
};

const saveThirdPartyApisService = async (request, fastify) => {
  const { id } = request.body;

  if (id === 0) {
    return await createThirdPartyApisService(request, fastify);
  } else {
    return await updateThirdPartyApisService(request, fastify);
  }
};

const deleteThirdPartyApisService = async (request, fastify) => {
  const { id } = request.body;

  await deleteThirdPartApisQuery(id, fastify, request);
  global.tblThirdPartyApis = global.tblThirdPartyApis.filter(
    (item) => !id.includes(item.id)
  );

  return `Third party Api(s) deleted successfully`;
};

const activeInactiveThirdPartyApisService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateApiId = global.tblThirdPartyApis.find((item) => item.id === id);
  if (!validateApiId) {
    throw new Error("ID not found");
  }
  await activeInactiveThirdPartyApisQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblThirdPartyApis.findIndex((item) => item.id === id);
  if (index != -1) {
    global.tblThirdPartyApis[index].isActive = isActive;
  }

  return `IsActive stage updated successfully`;
};

const changeIsDefaultStage = async (request, fastify) => {
  const body = request.body;
  body.isDefault = Boolean(body.isDefault);

  const result = global.tblThirdPartyApis.find(
      (item) => item.id === body.id
  );
  if(!result) {
    throw new Error("ID not found");
  }
  
  // if (result.type === 1 && body.isDefault === true || result.type === 2 && body.isDefault === true) {
  //   body.type = result.type;
  //   await isDefaultFalseQuery(body, fastify, request);
  //     global.tblThirdPartyApis.forEach((item) => {
  //         if (item.id !== body.id && item.type === body.type) {
  //             item.isDefault = false;
  //         }
  //     });
  // }

  await isDefaultChangeQuery(body, fastify, request);
  const index = global.tblThirdPartyApis.findIndex(
      (item) => item.id === body.id
  );

  if (index !== -1) {
      global.tblThirdPartyApis[index].isDefault = body.isDefault;
  }

  return `IsDefault stage changed successfully`;
};

module.exports = {
  allThirdPartyApisService,
  thirdPartyApiseByIdService,
  saveThirdPartyApisService,
  deleteThirdPartyApisService,
  activeInactiveThirdPartyApisService,
  changeIsDefaultStage
};

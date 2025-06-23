const {
    insertPythonAPIQuery,
    updatePythonAPIQuery,
    deletePythonAPIQuery,
    activeInactivePythonAPIQuery,
    isDefaultChangeQuery,
    isDefaultFalseQuery,
} = require("../repository/TablePythonAPI");

const savePythonAPIService = async (request, fastify) => {
    if (request.body.isDefault == true) {
        if (request.body?.isActive == false) {
            throw new Error(`For Default record IsActive must be true`);
        }
        await isDefaultFalseQuery(request.body, fastify, request);
        global.tblPythonAPI.forEach((item) => {
            if (
                item.id != request.body.id
            ) {
                item.isDefault = false;
            }
        });
    }
    const saveData = await insertPythonAPIQuery(request.body, fastify, request);
    global.tblPythonAPI.push(saveData);
    return saveData;
};

const editPythonAPIService = async (request, fastify) => {
    const validateId = global.tblPythonAPI.find(
        (item) => item.id == request.body.id
    );
    if (!validateId) {
        throw new Error("Python api data with this Id not found");
    }
    if (request.body?.isActive == false && validateId?.isDefault == true) {
        throw new Error(`Default record cannot be deactivated`);
    }

    const updateData = {
        developerName: request.body.developerName ?? validateId.developerName,
        URI: request.body.URI ?? validateId.URI,
        isActive: request.body.isActive ?? validateId.isActive,
        isDefault: request.body.isDefault ?? validateId.isDefault,
        createdBy: request.body.createdBy ?? validateId.createdBy,
        createdAt: request.body.createdAt ?? validateId.createdAt,
        updatedBy: request.body.updatedBy ?? validateId.updatedBy,
        updatedAt: request.body.updatedAt ?? validateId.updatedAt,
        id: parseInt(request.body.id, 10),
    };
    if (request.body.isDefault == false) {
        const isCurrentlyDefault = validateId.isDefault ===true;
        const defaultCount = global.tblPythonAPI.filter(item => item.isDefault).length;
        if (isCurrentlyDefault && defaultCount === 1) {
            throw new Error(`At least one Python API must be default, Cannot set that to false.`);
        }
    }
    if (request.body.isDefault === true) {
        await isDefaultFalseQuery(request.body, fastify, request);
        global.tblPythonAPI.forEach((item) => {
            if (
                item.id !== request.body.id
            ) {
                item.isDefault = false;
            }
        });
    }
    const modifiedData = await updatePythonAPIQuery(updateData, fastify, request);
    const index = global.tblPythonAPI.findIndex(
        (item) => item.id == request.body.id
    );
    if (index != -1) {
        global.tblPythonAPI[index] = modifiedData[0];
    }

    return modifiedData[0];
};

const allPythonAPIsService = async (request) => {
    const { isActive } = request.body;
    let result = global.tblPythonAPI;
    if(isActive !== undefined){
        result = result.filter((item) => item.isActive === isActive);
    }
    return result;
};


const pythonAPIByID = async (request) => {
    const { id } = request.body;
    const result = global.tblPythonAPI.find(
        (item) => item.id === id
    );
    return result || null;
};


const createPythonAPIService = async (request, fastify) => {
    if (request.body.id == 0) {
        return await savePythonAPIService(request, fastify, request);
    } else {
        return await editPythonAPIService(request, fastify, request);
    }
};


const deletePythonAPIService = async (request, fastify) => {
    const { id } = request.body;
    const defaultEntry = global.tblPythonAPI.find(
        (item) => id.includes(item.id) && item.isDefault === true
    );

    if (defaultEntry) {
        throw new Error(`Cannot delete default true Python API.`);
    }
    await deletePythonAPIQuery(id, fastify, request);
    global.tblPythonAPI = global.tblPythonAPI.filter(
        (item) => !id.includes(item.id)
    );

    return `Python API data deleted successfully`;
};

const updateIsDefultService = async (request, fastify) => {
    const { id, isDefault } = request.body;
    const result = global.tblPythonAPI.find(
        (item) => item.id === id
    );

    if (!result) {
        throw new Error("Python API with this Id not found");
    }
    if (isDefault === false) {
        const isCurrentlyDefault = result.isDefault === true;
        const defaultCount = global.tblPythonAPI.filter(item => item.isDefault).length;
        if (isCurrentlyDefault && defaultCount === 1) {
            throw new Error(`One Python API must be default, Cannot set that to false.`);
        }
    }
    if (isDefault === true) {
        await isDefaultFalseQuery(request.body, fastify, request);
        global.tblPythonAPI.forEach((item) => {
            if (
                item.id !== id
            ) {
                item.isDefault = false;
            }
        });
    }
    await isDefaultChangeQuery(request.body, fastify, request);
    const index = global.tblPythonAPI.findIndex(
        (item) => item.id === id
    );

    if (index !== -1) {
        global.tblPythonAPI[index].isDefault = isDefault;
    }

    return `IsDefault updated successfully`;
};

const activeInactivePythonAPIService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblPythonAPI.find((item) => item.id === id);
  if (!validateId) {
    throw new Error("Python api with this Id not found");
  }
  if (isActive == false && validateId?.isDefault == true) {
    throw new Error(`Default record cannot be deactivated`);
  }
  await activeInactivePythonAPIQuery(
    {
      isActive,
      id,
    },
    request,
    fastify
  );

  const index = global.tblPythonAPI.findIndex((item) => item.id === id);
  if(index != -1) {
    global.tblPythonAPI[index].isActive = isActive;
  }
  
  return `Python api updated successfully`;
};

module.exports = {
    allPythonAPIsService,
    pythonAPIByID,
    createPythonAPIService,
    deletePythonAPIService,
    activeInactivePythonAPIService,
    updateIsDefultService,
};

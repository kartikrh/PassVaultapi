const {
    insertPackagesQuery,
    updatePackagesQuery,
    deletePackageQuery,
    activeInactivePackageQuery,
    isDefaultChangeQuery,
    updateDisplayOrderQuery,
    isDefaultFalseQuery,
} = require("../repository/TablePackages");

const savePackageService = async (request, fastify) => {
  const saveData = await insertPackagesQuery(request.body, fastify, request);
  global.tblPackages.push(saveData);
  if(request.body.isDefault) {
    await isDefaultFalseQuery(saveData.id, fastify, request);
    global.tblPackages.forEach((item) => {
      if (item.id !== saveData.id) {
        item.isDefault = false;
      }
    });
  }
  return saveData;
};

const editPackageService = async (request, fastify) => {
    const validateId = global.tblPackages.find(
      (item) => item.id == request.body.id
    );
    if (!validateId) {
      throw new Error("Package data with this Id not found");
    }
    const updateData = {
      name: request.body.name ?? validateId.name,
      description: request.body.description ?? validateId.description,
      price: request.body.price ?? validateId.price,
      currency: request.body.currency ?? validateId.currency,
      intervalType: request.body.intervalType ?? validateId.intervalType,
      intervalCount: request.body.intervalCount ?? validateId.intervalCount,
      razorPayPlanId: request.body.razorPayPlanId ?? validateId.razorPayPlanId,
      isActive: Boolean(request.body.isActive) ?? validateId.isActive,
      isDisplay: Boolean(request.body.isDisplay) ?? validateId.isDisplay,
      trailDays: request.body.trailDays ?? validateId.trailDays,
      isDefault: request.body.isDefault ?? validateId.isDefault,
      id: parseInt(request.body.id, 10),
  };
  
    const modifiedData = await updatePackagesQuery(updateData, fastify, request);
    
    const index = global.tblPackages.findIndex(
      (item) => item.id == request.body.id
    );
    
    if(index != -1){
      global.tblPackages[index] = modifiedData[0];
    }

    if(updateData.isDefault) {
      await isDefaultFalseQuery(updateData.id, fastify, request);
      global.tblPackages.forEach((item) => {
        if (item.id !== updateData.id) {
          item.isDefault = false;
        }
      });
    }

    return modifiedData[0];
};
  
const allPackageService = async (request) => {
    const { isActive } = request.body || {};
    if (isActive !== undefined) {
      const result = global.tblPackages.filter(
        (item) => item.isActive === isActive
      );
      return result;
    } else {
      const result = global.tblPackages.filter(
        (item) => item.isActive === true
      );
      return result;
    }
};
  
const packageByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblPackages.find((item) => item.id === id);
  return result || null;
};
  
const createPackageService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await savePackageService(request, fastify, request);
  } else {
    return await editPackageService(request, fastify, request);
  }
};
  
const deletePackageService = async (request, fastify) => {
  const { id } = request.body;
  await deletePackageQuery(id, fastify, request);
  global.tblPackages = global.tblPackages.filter(
    (item) => !id.includes(item.id)
  );

  return `Social media(s) data deleted successfully`;
};
  
const activeInactivePackageService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblPackages.find(
    (item) => item.id === id
  );

  if (!validateId) {
    throw new Error("Package with this Id not found");
  }
  await activeInactivePackageQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblPackages.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblPackages[index].isActive = isActive;
  }

  return `Social media data updated successfully`;
};
  
const isDefaultChangeService = async (request, fastify) => {
  const { id, isDefault } = request.body;
  const validateId = global.tblPackages.find(
    (item) => item.id === id
  );

  if (!validateId) {
    throw new Error("Package with this Id not found");
  }

  await isDefaultChangeQuery(
    {
      id,
      isDefault,
    },
    request,
    fastify
  );
  const index = global.tblPackages.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblPackages[index].isDefault = isDefault;
  }

  if(isDefault) {
    await isDefaultFalseQuery(id, fastify, request);
    global.tblPackages.forEach((item) => {
      if (item.id !== id) {
        item.isDefault = false;
      }
    });
  }

  return `Social media data updated successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
    for (const item of request.body) {
        await updateDisplayOrderQuery(item, request, fastify);
        let index = global.tblPackages.findIndex((elem) => elem.id === item.id);
        if(index !== -1){
            global.tblPackages[index].displayOrder = item.displayOrder;
        }
    }
    
    return `Display order updated successfully`;
}
module.exports = {
    createPackageService,
    allPackageService,
    packageByIdService,
    deletePackageService,
    activeInactivePackageService,
    isDefaultChangeService,
    updateDisplayOrderService,
};
  
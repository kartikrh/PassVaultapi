const {
  deleteMenuTypeQuery,
  insertMenuTypeQuery,
  updatetMenuTypeQuery,
  validatMenuTypeQuery,
  getAllMenuTypesQuery,
} = require("../repository/TableMenuTypes");
const { callClientAPI, ServiceType, APIEndpointModuleType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allMenuTypeService = async (request , fastify) => {
  // return global.tblMenuTypes;
  global.tblMenuTypes = await getAllMenuTypesQuery(fastify);
  const {isActive} = request.body;
  if(isActive === undefined){
    return global.tblMenuTypes;
  }
  return global.tblMenuTypes.filter(menuType => menuType.isActive === isActive);
};

const getAllMenuItemListService = async (request, fastify) => {
  let menuTypeList = global.tblMenuTypes.filter(menuType => menuType.isActive === true);
  const result = menuTypeList.map(menuType => {
    let menuItem = global.tblMenuItems.filter(item => item.menuTypeId === menuType.menuTypeId && item.parentId === "0" && item.isActive === true)
                  .map((item)=>{
                      const pageDetails = global.tblPages.find(page => page.pageId === item.pageId);
                      return {
                        menuItemId : item.menuItemId,
                        menuItem : item.menuItem,
                        parentId : item.parentId,
                        pageId : item.pageId,
                        displayOrder : item.displayOrder,
                        pageDetails : {
                          alias : pageDetails.alias,
                          linkURL : pageDetails.linkURL,
                        }
                      }
                  })
                  .sort((a, b) => a.displayOrder - b.displayOrder);
    if(menuItem.length > 0){
      menuItem = appendChild(menuItem);
    }
    return {
      menuTypeId : menuType.menuTypeId,
      menuTypeName : menuType.menuTypeName,
      menuItem : menuItem
    };
  });

  return result;
}
const appendChild = (menuItems) => {
  return menuItems.map(menuItem => {
    const child = global.tblMenuItems.filter(item => item.parentId === menuItem.menuItemId && item.isActive == true).map(
      (item) => {
        const pageDetails = global.tblPages.find(page => page.pageId === item.pageId);
        return {
          menuItemId : item.menuItemId,
          menuItem : item.menuItem,
          displayOrder : item.displayOrder,
          parentId : item.parentId,
          pageId : item.pageId,
          pageDetails : {
            alias : pageDetails.alias,
            linkURL : pageDetails.linkURL,
          }
        }
      }
    
    );
    if(child.length > 0){
      menuItem.menuItems = appendChild(child);
    }
    return menuItem ;
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}

const menuTypeByIdService = async (request, fastify) => {
  const { menuTypeId } = request.body;
  const result = global.tblMenuTypes.find(
    (menuType) => menuType.menuTypeId === menuTypeId
  );
  return result || null;
};

const createMenuTypeService = async (request, fastify) => {
  const validateBlockId = global.tblBlocks.find(
    (block) => block.blockId === request.body.blockId
  );

  if (!validateBlockId) {
    throw new Error("Block not found for give id");
  }

  const validateByName = global.tblMenuTypes.find(
    (menuType) =>
      menuType.menuTypeName.toLowerCase() === request.body.menuTypeName.toLowerCase().trim() &&
      menuType.blockId === request.body.blockId
  );

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  const data = await insertMenuTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblMenuTypes.push(data);

  if(data.isActive){
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuTypes",
          type : "add",
          data : data
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuType.js/createMenuTypeService - callClientAPI", request)
    );
  }
  return data;
};

const updateMenuTypeService = async (request, fastify) => {
  const checkId = global.tblMenuTypes.find(
    (menuType) => menuType.menuTypeId === request.body.menuTypeId
  );

  if (!checkId) {
    throw new Error("Menu Type with this id not Found");
  }

  const body = {
    menuTypeName: request.body.menuTypeName || checkId.menuTypeName,
    blockId: request.body.blockId || checkId.blockId,
    noOfLevel: request.body.noOfLevel || checkId.noOfLevel,
    menuTypeId: request.body.menuTypeId,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  if (request.body.blockId) {
    const validateBlockId = global.tblBlocks.find(
      (block) => block.blockId === request.body.blockId
    );
    if (!validateBlockId) {
      throw new Error("Block not found for give id");
    }
  }

  const validateByName = global.tblMenuTypes.find(
    (menuType) =>
      menuType.menuTypeName.toLowerCase() === body.menuTypeName.toLowerCase().trim() &&
      menuType.blockId === body.blockId &&
      menuType.menuTypeId !== request.body.menuTypeId
  );

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  const result = await updatetMenuTypeQuery(body, fastify, request);

  const index = global.tblMenuTypes.findIndex(
    (menuType) => menuType.menuTypeId === request.body.menuTypeId
  );

  global.tblMenuTypes[index] = {
    ...result,
    blockId: body.blockId,
    menuTypeId: request.body.menuTypeId,
  };
  // if(result.isActive){
      callClientAPI(
        {
          serviceType : ServiceType.clientAPI, 
          moduleType : APIEndpointModuleType.updateMenuList,
          data : {
            module : "menuTypes",
            type : "update",
            data : global.tblMenuTypes[index]
          }
        },
        request,
        fastify
      ).catch(err => 
        errorLogger(fastify, err.message, "services/menuType.js/updateMenuTypeService - callClientAPI", request)
      );
  // }

  return {
    ...result,
    blockId: body.blockId,
    menuTypeId: request.body.menuTypeId,
  };
};

const deleteMenuTypeService = async (request, fastify) => {
  const encryptedIds = request.body.menuTypeId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validatMenuTypeQuery(
      encryptedId,
      fastify,
      request
    );

    if (checkInValide) {
      throw new Error(
        `Menu Type with name ${checkInValide.wrMenuTypeName} associate in Menu Items, skiped from deletion`
      );
    }
  }

  await deleteMenuTypeQuery(encryptedIds, fastify, request);

  global.tblMenuTypes = global.tblMenuTypes.filter(
    (menuType) => !encryptedIds.includes(menuType.menuTypeId)
  );
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuTypes",
          type : "delete",
          data : {
            menuTypeId : encryptedIds
          }
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuType.js/createMenuTypeService - callClientAPI", request)
    );
  

  return "Menu Item type(s) deleted successfully";
};

const saveMenuTypeService = async (request, fastify) => {
  const { menuTypeId } = request.body;

  if (menuTypeId === "0") {
    return await createMenuTypeService(request, fastify);
  } else {
    return await updateMenuTypeService(request, fastify);
  }
};

module.exports = {
  allMenuTypeService,
  menuTypeByIdService,
  saveMenuTypeService,
  deleteMenuTypeService,
  getAllMenuItemListService
};

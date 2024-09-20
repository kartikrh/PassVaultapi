const {
  menuItemByIdQuery,
  createMenuItemQuery,
  updateMenuItemQuery,
  validateMenuItemQuery,
  deleteMenuItemQuery,
  findMenuItemByParentId,
  updateMenuItemStatusQuery,
  allMenuItemsQuery,
  updateDisplayOrderQuery,
} = require("../repository/TableMenuItem");
const {
  updatePageService, addPageService
} = require('../services/page');
const { ServiceType, APIEndpointModuleType, callClientAPI } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { getAllMenuItemListService } = require("./menuType");
const allMenuItemService = async (request,fastify) => {
  // return global.tblMenuItems;
  const {isActive} = request.body;
  if(isActive === undefined) return global.tblMenuItems;
  
  const result = global.tblMenuItems.filter(
    (item) => item.isActive === isActive
  );
  return result || [];
};

const menuItemByIdService = async (request, fastify) => {
  const { menuItemId } = request.body;
  const result = global.tblMenuItems.find((item) => item.menuItemId === menuItemId);

  let dataToreturn = {...result};

  if(dataToreturn?.pageId && dataToreturn.pageId !== "0"){
    let pageDetails = global.tblPages.find((item) => item.pageId === dataToreturn.pageId);
    dataToreturn.pageDetails = pageDetails;
  }

  return dataToreturn || null;
  
};


const createMenuItemService = async (request, fastify) => {
  const body = {
    ...request.body,
  }
  const validateMenuTypeId = global.tblMenuTypes.find(
    (item) => item.menuTypeId === request.body.menuTypeId
  );
  if (!validateMenuTypeId) {
    throw new Error("Menu Type not found for give id");
  }

  if (request.body.parentId && request.body.parentId !== "0") {
    const findParentId = global.tblMenuItems.find(item => item.menuItemId === request.body.parentId);

    if (!findParentId) {
        throw new Error("Parent Menu Item not found for the given id");
    }

    let parentId = request.body.parentId;
    let itemlevel = 1;

    while (parentId !== "0") {
        parentId = global.tblMenuItems.find(item => item.menuItemId === parentId).parentId;
        itemlevel += 1;
    }

    if (itemlevel > validateMenuTypeId.noOfLevel) {
        throw new Error(`You cannot add more than ${validateMenuTypeId.noOfLevel} levels of menu items`);
    }
  }
  if(request.body.pageId){
    request.body = {
      ...request.body.pageDetails,
      ...request.body,
    };
    if(request.body.pageId !== "0"){
      await updatePageService(request, fastify)
    }
    else if(request.body.pageId === "0"){
      if(!request.body.pageDetails){
        throw new Error("Page Details not found for create Page")
      }
      let pageData = await addPageService(request, fastify)
      body.pageId = pageData.pageId
    }
  }

  const data = await createMenuItemQuery(
    {
      ...body,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );

  global.tblMenuItems.push(data);
  if(data.isActive){
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuItems",
          type : "update",
          data : data
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuItem.js/createMenuItemService - callClientAPI", request)
    );
    
  }
  return data;
};

const updateMenuItemService = async (request, fastify) => {
  const validateMenuItemId = global.tblMenuItems.find(
    (item) => item.menuItemId === request.body.menuItemId
  );
  if (!validateMenuItemId) {
    throw new Error("Menu Item not found for give id");
  }

  const body = {
    menuItemId: validateMenuItemId.menuItemId,
    menuItem: request.body.menuItem || validateMenuItemId.menuItem,
    userId: request.userTokenInfo.WrUserId,
    menuTypeId: validateMenuItemId.menuTypeId,
    pageId: validateMenuItemId.pageId,
    menuItemTypeId: validateMenuItemId.menuItemTypeId,
    parentId: validateMenuItemId.parentId || "0",
    isActive: request.body.hasOwnProperty("isActive") ? request.body.isActive : validateMenuItemId.isActive,
    displayOrder: validateMenuItemId.displayOrder,
  };

  let validateMenuTypeId;
  if (request.body.menuTypeId) {
     validateMenuTypeId = global.tblMenuTypes.find(
      (item) => item.menuTypeId === request.body.menuTypeId
    );
    if (!validateMenuTypeId) {
      throw new Error("Menu Type not found for give id");
    } else {
      body.menuTypeId = validateMenuTypeId.menuTypeId;
    }
  }
  if (request.body.parentId == "0") {
    body.parentId = "0";  
  }
  else if (request.body.parentId && request.body.parentId !== "0") {
    const findParentId = global.tblMenuItems.find(item => item.menuItemId === request.body.parentId);

    if (!findParentId) {
        throw new Error("Parent Menu Item not found for the given id");
    }

    let parentId = request.body.parentId;
    let itemlevel = 1;

    while (parentId !== "0") {
        parentId = global.tblMenuItems.find(item => item.menuItemId === parentId).parentId;
        itemlevel += 1;
    }

    if (itemlevel > validateMenuTypeId.noOfLevel) {
        throw new Error(`You cannot add more than ${validateMenuTypeId.noOfLevel} levels of menu items`);
    }
    body.parentId = request.body.parentId;
  }
  if (request.body.pageId) {
    request.body = {
      ...request.body.pageDetails,
      ...request.body,
    };
    if (request.body.pageId !== "0") {
        await updatePageService(request, fastify);
        body.pageId = request.body.pageId;
    } else {
      if(!request.body.pageDetails){
       throw new Error("Page Details not found for create Page")
      }
        const pageData = await addPageService(request, fastify);
        body.pageId = pageData.pageId;
    }
  }


  await updateMenuItemQuery(body, fastify);

  const index = global.tblMenuItems.findIndex(
    (item) => item.menuItemId === request.body.menuItemId
  );
  global.tblMenuItems[index] = { ...body, userId: undefined };
  if(body.isActive){
      callClientAPI(
        {
          serviceType : ServiceType.clientAPI, 
          moduleType : APIEndpointModuleType.updateMenuList,
          data : {
            module : "menuItems",
            type : "update",
            data : global.tblMenuItems[index]
          }
        },
        request,
        fastify
      ).catch(err => 
        errorLogger(fastify, err.message, "services/menuItem.js/createMenuItemService - callClientAPI", request)
      );
  }
  return `Menu Item updated successfully`;
};

const deleteMenuItemService = async (request, fastify) => {
  const encryptedIds = request.body.menuItemId;

  for (const encryptedId of encryptedIds) {
    // const checkInValide = await validateMenuItemQuery(
    //   encryptedId,
    //   fastify,
    //   request
    // );

    // if (checkInValide) {
    //   throw new Error(
    //     `Menu Item with name ${checkInValide.wrMenuItem} associate in Page Alias, skiped from deletion`
    //   );
    // }

    const checkChild = await findMenuItemByParentId(
      encryptedId,
      fastify,
      request
    );
    if (checkChild) {
      // get the menu item name
      let menuItemName = global.tblMenuItems.find(
        (item) => item.menuItemId === encryptedId
      ).menuItem;
      throw new Error(
        `Menu Item with name ${menuItemName} associate in other Menu Item, skiped from deletion`
      );
    }
  }

  await deleteMenuItemQuery(encryptedIds, fastify, request);

  global.tblMenuItems = global.tblMenuItems.filter(
    (item) => !encryptedIds.includes(item.menuItemId)
  );
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuItems",
          type : "update",
          data : {
            menuItemId : request.body.menuItemId,
          }
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuItem.js/createMenuItemService - callClientAPI", request)
    );
    
  

  return "Menu item(s) deleted successfully";
};

const saveMenuItemService = async (request, fastify) => {
  const { menuItemId } = request.body;

  if (menuItemId === "0") {
    return await createMenuItemService(request, fastify);
  } else {
    return await updateMenuItemService(request, fastify);
  }
};
const getMenuItemListByParentService = async (request, fastify) => {
  const {menuTypeId , isActive, parentId} = request.body;
  global.tblMenuItems = await allMenuItemsQuery(fastify)
  let result;
  if(menuTypeId){
    result = global.tblMenuItems.filter(
      (item) => item.menuTypeId === menuTypeId && item.isActive === isActive && item.parentId === parentId
    );
  }
  else{
    result = global.tblMenuItems.filter(
      (item) => item.isActive === isActive && item.parentId === parentId
    );
  }
  return result || [];
};


const updateMenuItemStatusService = async (request, fastify) => {
  const { menuItemId, isActive} = request.body;

  const index = global.tblMenuItems.findIndex(
    (menuType) => menuType.menuItemId === menuItemId
  );

  if (index == -1) {
    throw new Error("Menu Type with this id not Found");
  }
  const body = {
    menuItemId,
    isActive,
    userId: request.userTokenInfo.WrUserId,
  };

  await updateMenuItemStatusQuery(body, request,fastify);

  global.tblMenuItems[index] = {
    ...global.tblMenuItems[index],
    isActive,
  };
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuItems",
          type : isActive ? "active" : "inactive",
          data : menu
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuItem.js/createMenuItemService - callClientAPI", request)
    );

  return `Menu Item status updated successfully`;
  
};
const updateMenuItemDisplayOrderService = async (request, fastify) => {
  const menuItemIds = request.body.map((item) => item.menuItemId);
  const validateAllMenuItem = global.tblMenuItems.filter(
    (item) => menuItemIds.includes(item.menuItemId)
  );
  if (validateAllMenuItem.length !== menuItemIds.length) {
    throw new Error("Invalid Menu Item Ids");
  }
  // check if all menu item's parent id is same
  const checkAllMenuItemParent = validateAllMenuItem.every(
    (item) => item.parentId === validateAllMenuItem[0].parentId
  );

  if (!checkAllMenuItemParent) {
    throw new Error("All menu items should have same parent");
  }
  for (const item of request.body) {
    await updateDisplayOrderQuery(
      {
        menuItemId: item.menuItemId,
        displayOrder: item.displayOrder
      },
      fastify
    );
  }    

  const getAllMenuItems = await allMenuItemsQuery(fastify);
  global.tblMenuItems = getAllMenuItems;
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI, 
        moduleType : APIEndpointModuleType.updateMenuList,
        data : {
          module : "menuItems",
          type : "updateOrder",
          data : request.body
        }
      },
      request,
      fastify
    ).catch(err => 
      errorLogger(fastify, err.message, "services/menuItem.js/createMenuItemService - callClientAPI", request)
    );
  return "Order chaged successfully";

};
module.exports = {
  allMenuItemService,
  menuItemByIdService,
  saveMenuItemService,
  deleteMenuItemService,
  getMenuItemListByParentService,
  updateMenuItemStatusService,
  updateMenuItemDisplayOrderService
};

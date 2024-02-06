const {
  allMenuItemService,
  menuItemByIdService,
  saveMenuItemService,
  deleteMenuItemService,
  getMenuItemListByParentService,
  updateMenuItemStatusService
} = require("../../../../services/menuItem");
const { allMenuTypeService } = require("../../../../services/menuType");
const { allPageService } = require("../../../../services/page");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/menuItem/index.js";

const getAllMenuItems = async (request, reply, fastify) => {
  try {
    const result = await allMenuItemService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllMenuItems", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllMenuItemsData = async (request, reply, fastify) => {
  try {
    let result = await allMenuItemService(request,fastify);
    result = result.map((item) => ({
      menuItemId : item.menuItemId,
      menuItem : item.menuItem,
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllMenuItemsData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMenuItemById = async (request, reply, fastify) => {
  try {
    const result = await menuItemByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMenuItemById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveMenuItem = async (request, reply, fastify) => {
  try {
    const result = await saveMenuItemService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMenuItem", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteMenuItem = async (request, reply, fastify) => {
  try {
    const result = await deleteMenuItemService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteMenuItem", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMenuItemListByParent = async (request, reply, fastify) => {
  try {
    const result = await getMenuItemListByParentService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMenuItemListByParent", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMenuTypeList = async (request, reply, fastify) => {
  try {
    let result = await allMenuTypeService(request, fastify);
    result = result.map((item) => ({
      menuTypeId: item.menuTypeId,
      menuTypeName: item.menuTypeName,
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMenuTypeList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllPageList = async (request, reply, fastify) => {
  try {
    let result = await allPageService(fastify);
    result = result.map((item) => ({
      pageId: item.pageId,
      pageName: item.pageName, 
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPageList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateMenuItemStatus = async (request, reply, fastify) => {
  try {
    const result = await updateMenuItemStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateMenuItemStatus",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  saveMenuItem,
  deleteMenuItem,
  getMenuItemListByParent,
  getMenuTypeList,
  updateMenuItemStatus,
  getAllPageList,
  getAllMenuItemsData
};

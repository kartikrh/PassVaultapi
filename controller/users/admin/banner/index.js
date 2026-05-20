const { getAllBannerService, bannerByIdService, saveBannerService, deleteBannerService, activeInactiveBannerService, updateDisplayOrderBannerService } = require("../../../../services/banner");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/news/index.js";

const getAllBanners = async (request, reply, fastify) => {
    try {
      const result = await getAllBannerService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getAllBanners", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
  
const getBannerById = async (request, reply, fastify) => {
    try {
      const result = await bannerByIdService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getBannerById", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
  
const saveBanner = async (request, reply, fastify) => {
  try {
    const result = await saveBannerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveBanner", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteBanner = async (request, reply, fastify) => {
    try {
      const result = await deleteBannerService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/deleteBanner", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const activeInactiveBanner = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveBannerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveBanner", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateDisplayOrderBanner = async (request, reply, fastify) => {
  try {
    const result = await updateDisplayOrderBannerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateDisplayOrderBanner", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
    getAllBanners,
    getBannerById,
    saveBanner,
    deleteBanner,
    activeInactiveBanner,
    updateDisplayOrderBanner
};
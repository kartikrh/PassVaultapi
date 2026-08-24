const { getAllPage } = require("../../../controller/users/admin/Page/page");
const { getAllPageFormats } = require("../../../controller/users/admin/Page/pageFormate");
const { getAllBlocks } = require("../../../controller/users/admin/blocks");
const { getAllMenuItems } = require("../../../controller/users/admin/menuItem");
const { getAllMenuTypes } = require("../../../controller/users/admin/menuType");
const { getAllNews, getNewsById } = require("../../../controller/users/admin/news");
const { saveDeviceData } = require("../../../controller/users/admin/score");
const { allCongifService } = require("../../../services/config");
const { getAllBanners } = require("../../../controller/users/admin/banner");
const { getAllVideoLibrary } = require("../../../controller/users/admin/videoLibrary/index");
const { getAllPhotoLibrary, allLibraryImages } = require("../../../controller/users/admin/photoLibrary/index");
const { getAllCountryCode } = require("../../../controller/users/admin/countryCode");

const {
  Score,
  Config,
} = require("../../../swaggerSchema/groupTags/schema");
const { getAllSocialMedia } = require("../../../controller/users/admin/socialMedia");
const { clientApiWhitelabels } = require("../../../controller/users/admin/whitelabel");

module.exports = async (fastify, opts) => {
  fastify.post("/getConfigs",{
    schema: Config.getAll.schema,
    handler: (request, reply) => allCongifService(request, reply, fastify),
  })
  fastify.post("/getAllBlock", {
    handler: (request, reply) => getAllBlocks(request, reply, fastify)
  })
  fastify.post("/getPageFormat", {
    handler: (request, reply) => getAllPageFormats(request, reply, fastify)
  })
  fastify.post("/getAllNews", {
    handler: (request, reply) => getAllNews(request, reply, fastify)
  })
  fastify.post("/newsById", {
    handler: (request, reply) => getNewsById(request, reply, fastify)
  })
  fastify.post("/getMenutype", {
    handler: (request, reply) => getAllMenuTypes(request, reply, fastify)
  })
  fastify.post("/getMenuItem", {
    handler: (request, reply) => getAllMenuItems(request, reply, fastify)
  })
  fastify.post("/getBanners" , {
    schema: Score.getBanners.schema,
    handler: (request, reply) => getAllBanners(request, reply, fastify)
  })
  fastify.post("/videoLibrary", {
    handler: (request, reply) => getAllVideoLibrary(request, reply, fastify)
  });
  fastify.post("/photoLibrary", {
    handler: (request, reply) => getAllPhotoLibrary(request, reply, fastify)
  });
  fastify.post("/libraryImage", {
    handler: (request, reply) => allLibraryImages(request, reply, fastify)
  });
  fastify.post("/countryCodes", {
    handler: (request, reply) => getAllCountryCode(request, reply, fastify),
  });
  fastify.post("/socialMedia", {
    handler: (request, reply) => getAllSocialMedia(request, reply, fastify),
  });
  fastify.post("/whiteLabel", {
    handler: (request, reply) => clientApiWhitelabels(request, reply, fastify),
  });
  fastify.post("/saveDeviceData", {
    handler: (request, reply) => saveDeviceData(request, reply, fastify),
  });
};

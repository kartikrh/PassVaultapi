const { ModuleTypes, GlobalModuleType, StoreTypes } = require("../utilities/index");
const { errorLogger } = require("./logger");
const { getAllActiveInactiveTabsQuery } = require("../repository/TableTabs");
const { getAllBlocksQuery } = require("../repository/TableBlock");
const { getAllMenuTypesQuery } = require("../repository/TableMenuTypes");
const { getAllMenuItemTypesQuery } = require("../repository/TableMenuItemType");
const { allPageQuery } = require("../repository/TablePage");
const { allPageFormateQuery } = require("../repository/TablePageFormate");
const { allPageAliases } = require("../repository/TablePageAlias");
const { allMenuItemsQuery } = require("../repository/TableMenuItem");
const { getAllRolesQuery } = require("../repository/TableRoles");
const { getAllUsersQuery } = require("../repository/TableUser");
const { getAllCongigQuery } = require("../repository/TableConfig");
const { getAllDevicesQuery } = require("../repository/TableDevice");
const { getAllNewsQuery } = require("../repository/TableNews");

const { getAllClientSocketQuery } = require("../repository/TableClientSocket");
const { getAllBannerQuery } = require("../repository/TableBanner");
const { getAllAdvertiseQuery } = require("../repository/TableAdvertise");
const { getAllActivityLogQuery } = require("../repository/TableActivityLog");
const { getAllAPI } = require("../repository/TableAPI");
const { getAllAPIEndPoint } = require("../repository/TableAPIEndPoint");
const { getAllNotificationQuery } = require("../repository/TableNotification");
const { allMailSettingsQuery } = require('../repository/TableMailSettings');
const { allSocialMediaQuery } = require("../repository/TableSocialMedia");
const { getAllArticlesQuery } = require("../repository/TableArticles");
const { getAllPhotoLibraryQuery, getAllLibraryImagesQuery } = require("../repository/TablePhotoLibrary");
const { getAllVideoLibraryQuery } = require("../repository/TableVideoLibrary");
const configConstants = require("./configConstants");
const { getAllCountryCodesQuery } = require("../repository/TableCountryCodes");
const { getAllPackagesQuery } = require("../repository/TablePackages");
const { getAllPaymentMethodsQuery } = require("../repository/TablePaymentMethods");
const { getAllWhitelabelsQuery } = require("../repository/TableWhitelabel");
const { getAllNotificationConfigsQuery } = require("../repository/TableNotificationConfig");
const { getAllTemplateQuery } = require("../repository/TableTemplate");

const fetchAllDataFromDb = async (fastify, reply) => {
  try {
    const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);
    const getAllRoles = await getAllRolesQuery(fastify);
    const getAllBlocks = await getAllBlocksQuery(fastify);
    const getAllMenuTypes = await getAllMenuTypesQuery(fastify);
    const getAllMenuItemTypes = await getAllMenuItemTypesQuery(fastify);
    const getAllPageFormats = await allPageFormateQuery(fastify);
    const getAllPages = await allPageQuery(fastify);
    const getAllPageAliases = await allPageAliases(fastify);
    const getAllMenuItems = await allMenuItemsQuery(fastify);
    const getAllUsers = await getAllUsersQuery(fastify);
    const getAllConfigs = await getAllCongigQuery(fastify);
    const getAllDevices = await getAllDevicesQuery(fastify);
    const getAllActivityLog = await getAllActivityLogQuery(fastify);
    const getAllClientSocket = await getAllClientSocketQuery(fastify);
    const getAllTemplate = await getAllTemplateQuery(fastify);
    const getAllAPIs = await getAllAPI(fastify);
    const getAllAPIEndpoints = await getAllAPIEndPoint(fastify);
    const getAllNotification = await getAllNotificationQuery(fastify);
    const getAllMailSettings = await allMailSettingsQuery(fastify);
    const getAllSocialMediaData = await allSocialMediaQuery(fastify);
    const getAllArticlesData = await getAllArticlesQuery(fastify);
    const getAllCountryCodes = await getAllCountryCodesQuery(fastify);
    const getAllPackages = await getAllPackagesQuery(fastify);
    const getAllPaymentMethods = await getAllPaymentMethodsQuery(fastify);
    const getAllWhitelabels = await getAllWhitelabelsQuery(fastify);
    const whitelabelMap = new Map(
      getAllWhitelabels.map(wl => [
        wl.id,
        {
          domain: wl.domain,
          encryptWhitelabelId: wl.whitelabelId
        }
      ])
    );

    const getAllAdvertiseQueryData = await getAllAdvertiseQuery(fastify);
    const getAllAdvertise = getAllAdvertiseQueryData?.map(item => ({
      ...item,
      whitelabelId: item.whitelabelId?.map(id => {
        const whitelabel = whitelabelMap.get(id);
        return {
          id,
          domain: whitelabel?.domain || null,
          encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
        }
      })
    }));

    const getAllNewsQueryData = await getAllNewsQuery(fastify);
    const getAllNews = getAllNewsQueryData?.map(item => ({
      ...item,
      whitelabelId: item.whitelabelId?.map(id => {
        const whitelabel = whitelabelMap.get(id);
        return {
          id,
          domain: whitelabel?.domain || null,
          encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
        }
      })
    }));

    const getAllBannersQueryData = await getAllBannerQuery(fastify);
    const getAllBanners = getAllBannersQueryData?.map(item => ({
      ...item,
      whitelabelId: item.whitelabelId?.map(id => {
        const whitelabel = whitelabelMap.get(id);
        return {
          id,
          domain: whitelabel?.domain || null,
          encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
        }
      })
    }));

    const getAllLibraryImages = await getAllLibraryImagesQuery(fastify);
    const getAllPhotoLibraryQueryData = await getAllPhotoLibraryQuery(fastify);
    const getAllPhotoLibrary = getAllPhotoLibraryQueryData?.map(item => ({
      ...item,
      whitelabelId: item.whitelabelId?.map(id => {
        const whitelabel = whitelabelMap.get(id);
        return {
          id,
          domain: whitelabel?.domain || null,
          encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
        }
      })
    }));

    // NOTE: like/dislike counters previously sourced from tblClientLikeDislikeActivity,
    // which has been dropped along with the clientLikeDislikeActivity domain. Defaulted
    // to 0 to preserve the shape consumed by the videoLibrary route.
    const getAllVideoLibraryQueryData = await getAllVideoLibraryQuery(fastify);
    const getAllVideoLibrary = getAllVideoLibraryQueryData?.map(item => ({
      ...item,
      whitelabelId: item.whitelabelId?.map(id => {
        const whitelabel = whitelabelMap.get(id);
        return {
          id,
          domain: whitelabel?.domain || null,
          encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
          likeCount: 0,
          dislikeCount: 0
        }
      })
    }));

    const getAllNotificationConfigs = await getAllNotificationConfigsQuery(fastify);

    global.tblTabs = getAllTabs;
    global.tblRoles = getAllRoles;
    global.tblBlocks = getAllBlocks;
    global.tblMenuTypes = getAllMenuTypes;
    global.tblMenuItemTypes = getAllMenuItemTypes;
    global.tblPageFormats = getAllPageFormats;
    global.tblPages = getAllPages;
    global.tblPageAliases = getAllPageAliases;
    global.tblMenuItems = getAllMenuItems;
    global.tblUsers = getAllUsers;
    global.tblConfigs = getAllConfigs;
    global.tblDevices = getAllDevices;
    global.tblActivityLogs = getAllActivityLog;
    global.tblBanner = getAllBanners;
    global.tblAdvertise = getAllAdvertise;
    global.tblAPIs = getAllAPIs;
    global.tblAPIEndpoints = getAllAPIEndpoints;
    global.tblNotifications = getAllNotification;
    global.tblMailSettings = getAllMailSettings;
    global.tblSocialMedia = getAllSocialMediaData;
    global.tblArticles = getAllArticlesData;
    global.tblPhotoLibrary = getAllPhotoLibrary;
    global.tblLibraryImages = getAllLibraryImages;
    global.tblVideoLibrary = getAllVideoLibrary;
    global.tblCountryCodes = getAllCountryCodes;
    global.tblPackages = getAllPackages;
    global.tblPaymentMethods = getAllPaymentMethods;
    global.tblWhitelabels = getAllWhitelabels;
    global.tblNotificationConfig = getAllNotificationConfigs;
    global.tblClientSocket = getAllClientSocket;
    global.tblTemplate = getAllTemplate;
    global.tblNews = getAllNews;

    console.log("Okkkk - Data Synchronized successfully");
    global.isAllDataLoadedInGlobal = true;

    if (reply) {

      reply.status(200).send({
        status: 200,
        message: "Data fetched successfully",
      });
    }
  } catch (error) {
    console.log("error in fetchAllDataFromDb", error.message,error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> utilities/fetchAllData.js/fetchDataFromDb",
      null
    );
    if (reply) {
      reply.status(200).send({
        status: 200,
        error: error.message,
      });
    }
  }
};

const panelLoadDataByEnum = async (request, fastify, reply) => {
  try {
    const {password} = request.body;
    let pass = global.tblConfigs.find((item) => item.key === configConstants.LOADDATAPASSWORD);
    if (!pass) {
      throw new Error("Password not found");
    }
    if (pass.value !== password) {
      throw new Error("Invalid password");
    }
    let {module} = request.body;

    let whitelabelMap = new Map();
    if (module?.some(num => [ModuleTypes.News, ModuleTypes.Banners, ModuleTypes.Advertise, ModuleTypes.PhotoLibrary, ModuleTypes.VideoLibrary].includes(num))) {
      const getAllWhitelabels = global.tblWhitelabels;
      whitelabelMap = new Map(
        getAllWhitelabels.map(wl => [
          wl.id,
          {
            domain: wl.domain,
            encryptWhitelabelId: wl.whitelabelId
          }
        ])
      );
    }

    for (const mod of module) {
      switch (mod) {
        case ModuleTypes.News: {
          const getAllNewsQueryData = await getAllNewsQuery(fastify);
          const getAllNews = getAllNewsQueryData?.map(item => ({
            ...item,
            whitelabelId: item.whitelabelId?.map(id => {
              const whitelabel = whitelabelMap.get(id);
              return {
                id,
                domain: whitelabel?.domain || null,
                encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
              }
            })
          }));
          global.tblNews = getAllNews;
          break;
        }
        case ModuleTypes.Banners: {
          const getAllBannersQueryData = await getAllBannerQuery(fastify);
          const getAllBanners = getAllBannersQueryData?.map(item => ({
            ...item,
            whitelabelId: item.whitelabelId?.map(id => {
              const whitelabel = whitelabelMap.get(id);
              return {
                id,
                domain: whitelabel?.domain || null,
                encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
              }
            })
          }));
          global.tblBanner = getAllBanners;
          break;
        }
         case ModuleTypes.Advertise: {
          const getAllAdvertiseQueryData = await getAllAdvertiseQuery(fastify);
          const getAllAdvertise = getAllAdvertiseQueryData?.map(item => ({
            ...item,
            whitelabelId: item.whitelabelId?.map(id => {
              const whitelabel = whitelabelMap.get(id);
              return {
                id,
                domain: whitelabel?.domain || null,
                encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
              }
            })
          }));
          global.tblAdvertise = getAllAdvertise;
          break;
        }
        case ModuleTypes.PhotoLibrary: {
          const getAllLibraryImages = await getAllLibraryImagesQuery(fastify);
          global.tblLibraryImages = getAllLibraryImages;

          const getAllPhotoLibraryQueryData = await getAllPhotoLibraryQuery(fastify);
          const getAllPhotoLibrary = getAllPhotoLibraryQueryData?.map(item => ({
            ...item,
            whitelabelId: item.whitelabelId?.map(id => {
              const whitelabel = whitelabelMap.get(id);
              return {
                id,
                domain: whitelabel?.domain || null,
                encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
              }
            })
          }));
          global.tblPhotoLibrary = getAllPhotoLibrary;
          break;
        }
        case ModuleTypes.VideoLibrary: {
          // NOTE: like/dislike counters previously sourced from tblClientLikeDislikeActivity,
          // which has been dropped along with the clientLikeDislikeActivity domain. Defaulted
          // to 0 to preserve the shape consumed by the videoLibrary route.
          const getAllVideoLibraryQueryData = await getAllVideoLibraryQuery(fastify);
          const getAllVideoLibrary = getAllVideoLibraryQueryData?.map(item => ({
            ...item,
            whitelabelId: item.whitelabelId?.map(id => {
              const whitelabel = whitelabelMap.get(id);
              return {
                id,
                domain: whitelabel?.domain || null,
                encryptWhitelabelId: whitelabel?.encryptWhitelabelId || null,
                likeCount: 0,
                dislikeCount: 0
              }
            })
          }));
          global.tblVideoLibrary = getAllVideoLibrary;
          break;
        }
        case ModuleTypes.SendMailConfig: {
          const getAllMailSettings = await allMailSettingsQuery(fastify);
          global.tblMailSettings = getAllMailSettings;
          break;
        }
        case ModuleTypes.PageFormat: {
          const getAllPageFormats = await allPageFormateQuery(fastify);
          global.tblPageFormats = getAllPageFormats;
          break;
        }
        case ModuleTypes.MenuList: {
          const getAllMenuTypes = await getAllMenuTypesQuery(fastify);
          const getAllMenuItems = await allMenuItemsQuery(fastify);

          global.tblMenuTypes = getAllMenuTypes;
          global.tblMenuItems = getAllMenuItems;
          break;
        }
        case ModuleTypes.Blocks: {
          const getAllBlocks = await getAllBlocksQuery(fastify);
          global.tblBlocks = getAllBlocks;
          break;
        }
        case ModuleTypes.Pages: {
          const getAllPages = await allPageQuery(fastify);
          global.tblPages = getAllPages;
          break;
        }
        case ModuleTypes.Tabs: {
          const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);
          global.tblTabs = getAllTabs;
          break;
        }
        case ModuleTypes.SocialMedia: {
          const getAllSocialMediaData = await allSocialMediaQuery(fastify);
          global.tblSocialMedia = getAllSocialMediaData;
          break;
        }
        case ModuleTypes.Config: {
          const getAllConfigs = await getAllCongigQuery(fastify);
          global.tblConfigs = getAllConfigs;
          break;
        }
        case ModuleTypes.Roles: {
          const getAllRoles = await getAllRolesQuery(fastify);
          global.tblRoles = getAllRoles;
          break;
        }
        case ModuleTypes.Users: {
          const getAllUsers = await getAllUsersQuery(fastify);
          global.tblUsers = getAllUsers;
          break;
        }
        case ModuleTypes.ClientScokets: {
          const getAllClientSocket = await getAllClientSocketQuery(fastify);
          global.tblClientSocket = getAllClientSocket;
          break;
        }
        case ModuleTypes.API: {
          const getAllAPIs = await getAllAPI(fastify);
          global.tblAPIs = getAllAPIs;
          break;
        }
        case ModuleTypes.APIEndpoints: {
          const getAllAPIEndpoints = await getAllAPIEndPoint(fastify);
          global.tblAPIEndpoints = getAllAPIEndpoints;
          break;
        }
        case ModuleTypes.Notifications: {
          const getAllNotifications = await getAllNotificationQuery(fastify);
          global.tblNotifications = getAllNotifications;
          break;
        }
        case ModuleTypes.CountryCode: {
          const cc =  await getAllCountryCodesQuery(fastify);
          global.tblCountryCodes = cc;
          break;
        }
        case ModuleTypes.NotificationConfig: {
          const notiConfig =  await getAllNotificationConfigsQuery(fastify);
          global.tblNotificationConfig = notiConfig;
          break;
        }
        case ModuleTypes.Packages: {
          const packages =  await getAllPackagesQuery(fastify);
          global.tblPackages = packages;
          break;
        }
        case ModuleTypes.PaymentMethods: {
          const paymentMethods = await getAllPaymentMethodsQuery(fastify);
          global.tblPaymentMethods = paymentMethods;
          break;
        }
        case ModuleTypes.Whitelabel: {
          const whitelabel =  await getAllWhitelabelsQuery(fastify);
          global.tblWhitelabels = whitelabel;
          break;
        }
        case ModuleTypes.Template: {
          const template = await getAllTemplateQuery(fastify);
          global.tblTemplate = template;
          break;
        }
        default:
          break;
      }
    }

    if (reply) {
      reply.status(200).send({
        status: 200,
        message: "PanelData loaded on Memory successfully",
      });
    }
  } catch (error) {
    console.log(new Date(), "error in panelLoadDataByEnum", error.message,error);
    if (reply) {
      reply.status(200).send({
        status: 200,
        error: error.message,
      });
    }
  }
}


const loadEnityDataOnGlobal = async (request, fastify, reply) => {
  const { data, storeType, moduleType: mod } = request.body;
  try {
    switch (storeType) {
      case StoreTypes.Insert: {
        switch (mod) {
          case GlobalModuleType.CountryCode:
            global.tblCountryCodes.push(data);
            break;

          default:
        }
        break;
      }

      default:
    }

    // console.log("Data updated in global memory.");
  } catch (error) {
    console.error("Error in loadEnityDataOnGlobal:", error.message, error);
    if (reply) {
      reply.status(500).send({
        status: 500,
        error: error.message,
      });
    }
  }
};
const v8 = require('v8');

function getHeapSize(obj) {
  try {
    const serialized = v8.serialize(obj);
    return (serialized.length / (1024 * 1024)).toFixed(2);
  } catch (e) {
    return 'N/A';
  }
}
const globalMemoryDatas = async(request = null , fastify = null) =>{
  let result = [];

  for (const key of Object.keys(global)) {
    // if (key.startsWith('tbl')) {
      result.push({
        key,
        size : parseFloat(getHeapSize(global[key])) || 0,
        sizeinMb: `${parseFloat(getHeapSize(global[key])) || 0 } MB`
      });
    // }
  }

  result = result.sort((a, b) => b.size - a.size)
  // .forEach(i => console.log(`${i.key}: ${i.size} MB`));
  return result;
}

module.exports = { fetchAllDataFromDb, panelLoadDataByEnum, loadEnityDataOnGlobal, globalMemoryDatas };

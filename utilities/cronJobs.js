"use strict";

const cron = require("node-cron");
const { sendActiveAdvertiseToClientAPIService } = require("../services/advertise.js");
const { sendActiveBannerToClientAPIService } = require("../services/banner.js");
const { sendActiveNewsToClientAPIService } = require("../services/news.js");
const { sendActivePhotoLibraryToClientAPIService } = require("../services/photoLibrary.js");
const { sendActiveVideoLibraryToClientAPIService } = require("../services/videoLibrary.js");

const registerCronJobs = (fastify) => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        if (global.isAllDataLoadedInGlobal) {
          await sendActiveAdvertiseToClientAPIService(fastify);
          await sendActiveBannerToClientAPIService(fastify);
          await sendActiveNewsToClientAPIService(fastify);
          await sendActivePhotoLibraryToClientAPIService(fastify);
          await sendActiveVideoLibraryToClientAPIService(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task send-data-to-client:", error);
      }
    }
  );

  cron.schedule(
    "0 * * * *",
    async () => {
      const memoryUsage = process.memoryUsage();
      console.log(new Date(), "Memory Usage Log:", {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  );
}


module.exports = {
  registerCronJobs,
};

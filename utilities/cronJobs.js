"use strict";

const cron = require("node-cron");
const {
  FetchingCommentariesDataFromCron,
  upcomingCommentaries,
} = require("./fetchAllData");
const { entitySportAutoImportProcess } = require("./entitySportAutoImport.js");
const { entitySportAutoUpdateCommentary } = require("./entitySportAutoUpdateCommentary.js");
const { entitySportAutoUpdateCommentaryTime } = require("./entityConst.js");
const { autoUpdatePlayerStatisticsDataProcess } = require("./autoUpdatePlayerStatisticsData.js");
const { ISPLAYERCALCULATIONON } = require("./configConstants.js");
const { withSentryCronProfiling } = require("./sentryCron.js");
const { insertCompetitionstatisticsInAutoImportService } = require("../services/competitionStatistics.js");
const { insertICCRankingInAutoImportService } = require("../services/iccRanking.js");
const {
  importCompetitionMatchService,
  insertCompletedCommentaryForTournamentTeamPointUpdateService,
} = require("../services/commentry.js");
const { insertCompletedCompetitionsInAutoImportService } = require("../services/competition.js");

const registerCronJobs = (fastify) => {
  cron.schedule(
    "0 0 * * *",
    withSentryCronProfiling("fetch-commentaries-data", "0 0 * * *", async () => {
      try {
        // Fetch data from DB once every 24 hours at midnight.
        await FetchingCommentariesDataFromCron(fastify);
      } catch (error) {
        console.error(new Date(), "Error during scheduled task:", error);
      }
    })
  );

  cron.schedule(
    "* * * * *",
    withSentryCronProfiling("upcoming-commentaries", "* * * * *", async () => {
      try {
        await upcomingCommentaries(fastify);
        if (global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          await insertCompletedCommentaryForTournamentTeamPointUpdateService(fastify);
        }
      } catch (error) {
        console.error(new Date(), "Error during scheduled task:", error);
      }
    })
  );

  let isAutoImportProcessRunning = false;
  cron.schedule(
    "0,30 * * * * *",
    withSentryCronProfiling("entitysport-auto-import", "0,30 * * * * *", async () => {
      try {
        if (!isAutoImportProcessRunning && global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          isAutoImportProcessRunning = true;
          await entitySportAutoImportProcess(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - entitySportAutoImportProcess:", error);
      } finally {
        isAutoImportProcessRunning = false;
      }
    })
  );

  let isAutoUpdateCommentaryProcessRunning = false;
  cron.schedule(
    `*/${entitySportAutoUpdateCommentaryTime} * * * *`,
    withSentryCronProfiling(
      "entitysport-auto-update-commentary",
      `*/${entitySportAutoUpdateCommentaryTime} * * * *`,
      async () => {
        try {
          if (
            !isAutoUpdateCommentaryProcessRunning &&
            global.isAllDataLoadedInGlobal &&
            global.tblEntitySockets?.[0]?.isActive &&
            global.tblEntitySockets?.[0]?.isAutoUpdateCommentary
          ) {
            isAutoUpdateCommentaryProcessRunning = true;
            await entitySportAutoUpdateCommentary(fastify);
          }
        } catch (error) {
          console.error("Error during scheduled task - entitySportAutoUpdateCommentary:", error);
        } finally {
          isAutoUpdateCommentaryProcessRunning = false;
        }
      }
    )
  );

  let isAutoUpdatePlayerStatisticsProcessRunning = false;
  cron.schedule(
    "*/30 * * * * *",
    withSentryCronProfiling("auto-update-player-statistics", "*/30 * * * * *", async () => {
      try {
        if (
          !isAutoUpdatePlayerStatisticsProcessRunning &&
          global.isAllDataLoadedInGlobal &&
          global.tblConfigs.find((item) => item.key === ISPLAYERCALCULATIONON).value === "true"
        ) {
          isAutoUpdatePlayerStatisticsProcessRunning = true;
          await autoUpdatePlayerStatisticsDataProcess(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - autoUpdatePlayerStatisticsDataProcess:", error);
      } finally {
        isAutoUpdatePlayerStatisticsProcessRunning = false;
      }
    })
  );

  cron.schedule(
    "30 0 * * *",
    withSentryCronProfiling("daily-competition-imports", "30 0 * * *", async () => {
      try {
        if (global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          await insertCompletedCompetitionsInAutoImportService(fastify);
          await insertCompetitionstatisticsInAutoImportService(fastify);
          await insertICCRankingInAutoImportService(fastify);
          await importCompetitionMatchService(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task:", error);
      }
    })
  );
}

module.exports = {
  registerCronJobs,
};

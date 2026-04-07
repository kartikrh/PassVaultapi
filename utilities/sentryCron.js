"use strict";

const Sentry = require("@sentry/node");

const isSentryEnabled = () => process.env.ENABLE_SENTRY === "TRUE";

const withSentryCronProfiling = (jobName, cronExpression, task) => {
  return async (...args) => {
    if (!isSentryEnabled()) {
      return task(...args);
    }

    return Sentry.startSpan(
      {
        name: `cron ${jobName}`,
        op: "cron",
        forceTransaction: true,
        attributes: {
          "cron.job.name": jobName,
          "cron.expression": cronExpression,
        },
      },
      async () => {
        try {
          return await task(...args);
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              job_name: jobName,
              job_type: "cron",
            },
            extra: {
              cronExpression,
            },
          });
          throw error;
        }
      }
    );
  };
};

module.exports = {
  withSentryCronProfiling,
};

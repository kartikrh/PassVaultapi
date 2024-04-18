const { errorLogger } = require("../utilities/logger");

const insertActivityLogQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblActivityLog" (
                        "wrActivityType",
                        "wrRefID",
                        "wrIpAddress",
                        "wrCreatedDate"
                    )
                values ($1, $2, $3, now()) returning *
                )
                select 
                    "wrId" as "activityLogId",
                    "wrActivityType" as "activityType",
                    "wrRefID" as "refId",
                    "wrIpAddress" as "ipAddress"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.activityType,
          data.refId || null,
          data.ipAddress
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableActivityLog/insertActivityLogQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateActivityLogQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblActivityLog" set
                "wrActivityType" = $1,
                "wrRefID" = $2,
                "wrIpAddress" = $3,
                "wrCreatedDate" = now()
                where "wrId" = $4
            `,
      {
        bind: [
          data.activityType,
          data.refId || null,
          data.ipAddress,
          data.activityLogId
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableActivityLog/updateActivityLogQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  insertActivityLogQuery,
  updateActivityLogQuery
};
const getAllActivityLogQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrId" as "activityLogId",
            "wrActivityType" as "activityType",
            "wrRefID" as "refId",
            "wrIpAddress" as "ipAddress"
        from "tblActivityLogs"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  getAllActivityLogQuery,
};
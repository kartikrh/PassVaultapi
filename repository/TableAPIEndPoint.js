const { errorLogger } = require("../utilities/logger");

const getAllAPIEndPoint = async (fastify) => {
  return await fastify.db.query(
    `select 
                "wrId" as "apiEndPointId",
                "wrServiceType" as "serviceType",
                "wrEndpoint" as "endPoint",
                "wrModuleType" as "moduleType",
                "wrTimeOut" as "timeOut",
                "wrIsActive" as "isActive"
            from "tblAPIEndpoints"
            where "wrIsDeleted" = false
            `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const deleteApiEndPointQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
          UPDATE "tblAPIEndpoints" SET
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
          WHERE "wrId" = ANY ($3)
            `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, request.body.apiEndPointId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPIEndPoint/deleteApiEndPointQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertApiEndPointQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblAPIEndpoints" (
                        "wrServiceType",
                        "wrEndpoint",
                        "wrModuleType",
                        "wrTimeOut",
                        "wrIsActive"
                    )
                values ($1, $2, $3, $4, $5) returning *
                )
                select 
                    "wrId" as "apiEndPointId",
                    "wrServiceType" as "serviceType",
                    "wrEndpoint" as "endPoint",
                    "wrModuleType" as "moduleType",
                    "wrTimeOut" as "timeOut",
                    "wrIsActive" as "isActive"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.serviceType,
          data.endPoint,
          data.moduleType,
          data.timeOut || 0,
          data.isActive || false,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPIEndPoint/insertApiEndPointQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateApiEndPointQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblAPIEndpoints" set
                "wrServiceType" = $1,
                "wrEndpoint" = $2,
                "wrModuleType" = $3,
                "wrTimeOut" = $4,
                "wrIsActive" = $5
                where "wrId" = $6
            `,
      {
        bind: [
          data.serviceType,
          data.endPoint,
          data.moduleType,
          data.timeOut || 0,
          data.isActive || false,
          data.apiEndPointId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPIEndPoint/updateApiEndPointQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveApiEndPointQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblAPIEndpoints" set
                "wrIsActive" = $1
                where "wrId" = $2
            `,
      {
        bind: [data.isActive, data.apiEndPointId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPIEndPoint/activeInactiveApiEndPointQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllAPIEndPoint,
  deleteApiEndPointQuery,
  insertApiEndPointQuery,
  updateApiEndPointQuery,
  activeInactiveApiEndPointQuery,
};

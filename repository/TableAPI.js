const getAllAPI = async (fastify) => {
    return await fastify.db.query(
        `select 
                "wrId" as "apiId",
                "wrType" as "type",
                "wrApi" as "api",
                "wrIsActive" as "isActive"
            from "tblAPIs"
            `,
        {
          type: fastify.db.QueryTypes.SELECT,
        }
      );
}
const deleteApiQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                delete from "tblAPIs" where "wrId" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.apiId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPI/deleteApiQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertApiQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblAPIs" (
                        "wrType",
                        "wrApi",
                        "wrIsActive"
                    )
                values ($1, $2, $3) returning *
                )
                select 
                    "wrId" as "apiId",
                    "wrType" as "type",
                    "wrApi" as "api",
                    "wrIsActive" as "isActive"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.type || 0,
          data.api,
          data.isActive || false,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPI/insertApiQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateApiQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblAPIs" set
                "wrType" = $1,
                "wrApi" = $2,
                "wrIsActive" = $3
                where "wrId" = $4
            `,
      {
        bind: [
          data.type || 0,
          data.api,
          data.isActive || false,
          data.apiId,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPI/updateApiQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveApiQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblAPIs" set
                "wrIsActive" = $1
                where "wrId" = $2
            `,
      {
        bind: [data.isActive, data.apiId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableAPI/activeInactiveApiQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
    getAllAPI,
    deleteApiQuery,
    insertApiQuery,
    updateApiQuery,
    activeInactiveApiQuery
}
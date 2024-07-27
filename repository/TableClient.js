
const getAllClientQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrClientID" as "clientId",
            "wrClientName" as "fullName",
            "wrUserName" as "userName",
            "wrIsAllowMultiLogin" as "isAllowMultiLogin",
            "wrIsDelete" as "isDelete",
            "wrIsEmailVerified" as "isEmailVerified",
            "wrEmailID" as "emailId",
            "wrIsMobileVerified" as "isMobileVerified",
            "wrMobileNo" as "mobileNo",
            "wrRegistrationProcessStatus" as "registrationProcessStatus",
            "wrIsUserActive" as "isUserActive",
            "wrProvider" as "provider",
            "wrCreatedDate" as "createdDate",
            "wrIsActive" as "isActive"
        from "tblClient"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const deleteClientQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                delete from "tblClient" where "wrClientID" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.clientId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableClient/deleteClientQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertClientQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblClient" (
                        "wrClientName",
                        "wrUserName",
                        "wrIsAllowMultiLogin",
                        "wrIsDelete",
                        "wrIsEmailVerified",
                        "wrEmailID",
                        "wrIsMobileVerified",
                        "wrMobileNo",
                        "wrRegistrationProcessStatus",
                        "wrIsUserActive",
                        "wrProvider",
                        "wrIsActive",
                        "wrCreatedBy",
                        "wrCreatedDate"
                    )
                values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now()) returning *
                )
                select 
                    "wrClientID" as "clientId",
                    "wrClientName" as "fullName",
                    "wrUserName" as "userName",
                    "wrIsAllowMultiLogin" as "isAllowMultiLogin",
                    "wrIsDelete" as "isDelete",
                    "wrIsEmailVerified" as "isEmailVerified",
                    "wrEmailID" as "emailId",
                    "wrIsMobileVerified" as "isMobileVerified",
                    "wrMobileNo" as "mobileNo",
                    "wrRegistrationProcessStatus" as "registrationProcessStatus",
                    "wrIsUserActive" as "isUserActive",
                    "wrProvider" as "provider",
                    "wrIsActive" as "isActive"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.fullName,
          data.userName,
          data.isAllowMultiLogin || false,
          data.isDelete || false,
          data.isEmailVerified || false,
          data.emailId,
          data.isMobileVerified || false,
          data.mobileNo,
          data.registrationProcessStatus,
          data.isUserActive,
          data.provider,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableClient/insertClientQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateClientQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblClient" set
                "wrClientName" = $1,
                "wrUserName" = $2,
                "wrIsAllowMultiLogin" = $3,
                "wrIsDelete" = $4,
                "wrIsEmailVerified" = $5,
                "wrEmailID" = $6,
                "wrIsMobileVerified" = $7,
                "wrMobileNo" = $8,
                "wrRegistrationProcessStatus" = $9,
                "wrIsUserActive" = $10,
                "wrProvider" = $11,
                "wrIsActive" = $12,
                "wrModifyBy" = $13,
                "wrModifyDate" = now()
                where "wrClientID" = $14
            `,
      {
        bind: [
          data.fullName,
          data.userName,
          data.isAllowMultiLogin || false,
          data.isDelete || false,
          data.isEmailVerified || false,
          data.emailId,
          data.isMobileVerified || false,
          data.mobileNo,
          data.registrationProcessStatus,
          data.isUserActive,
          data.provider,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.clientId
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableClient/updateClientQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveClientQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblClient" set
                "wrIsActive" = $1
                where "wrClientID" = $2
            `,
      {
        bind: [data.isActive, data.clientId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableClient/activeInactiveClientQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  getAllClientQuery,
  insertClientQuery,
  updateClientQuery,
  deleteClientQuery,
  activeInactiveClientQuery
};
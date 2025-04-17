const { errorLogger } = require("../utilities/logger");

const createClientLoginInfoQuery = async (data, fastify) => {
  try {
    await fastify.db.query(
      `with insert_data as (
                  INSERT INTO "tblClientLoginInfo" ("wrClientId", "wrInfo", "wrIsLogin", "wrLoginType", "wrCreatedAt") values ($1, $2, $3, $4, now()) 
                )
                update "tblClientLoginInfo" set "wrIsLogin" = false where "wrClientId" in (
                    select "wrClientId" from "tblClient" where "wrClientId" = $1 and "wrIsAllowMultiLogin" = false
                )`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.clientId, JSON.stringify(data.info), data.isLogin, data.loginType],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableClientLoginInfo.js/createClientLoginInfoQuery",
      null
    );
    throw new Error(error.message);
  }
};

async function signOutClientInfoQuery(clientId, fastify) {
  try {
    await fastify.db.query(
      `UPDATE "tblClientLoginInfo" set "wrIsLogin" = false where "wrClientId" = $1`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientId],
      }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableClientLoginInfo.js/signOutClientInfoQuery",
      null
    );
    throw new Error(error.message);
  }
}

module.exports = {
  createClientLoginInfoQuery,
  signOutClientInfoQuery,
};

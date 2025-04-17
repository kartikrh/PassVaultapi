const { errorLogger } = require("../utilities/logger");

const createClientLoginInfoQuery = async (data, fastify) => {
  await fastify.db.query(
    `with insert_data as (
          INSERT INTO "tblClientLoginInfo" ("wrClientId", "wrInfo", "wrIsLogin", "wrCreatedAt") values ($1, $2, true, now()) 
        )
        update "tblClientLoginInfo" set "wrIsLogin" = false where "wrClientId" in (
            select "wrClientId" from "tblClient" where "wrClientId" = $1 and "wrIsAllowMultiLogin" = false
        )`,
    {
        type: fastify.db.QueryTypes.SELECT,
      bind: [data.clientId, JSON.stringify(data.info)],
    }
  );
};

async function signOutClientInfoQuery(clientId, fastify) {
  await fastify.db.query(
    `UPDATE "tblClientLoginInfo" set "wrIsLogin" = false where "wrClientId" = $1`,
    {
        type: fastify.db.QueryTypes.SELECT,
      bind: [clientId],
    }
  );
}

module.exports = {
  createClientLoginInfoQuery,
  signOutClientInfoQuery,
};

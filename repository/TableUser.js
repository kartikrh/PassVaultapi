const { QueryTypes } = require("sequelize");

//TODO: this is a test api
async function signUpUser(request, fastify) {
  const data = await fastify.db.query(
    `INSERT INTO "tblUsers" ("WrUserName","WrPassword","WrRoleId","WrName","WrUserType","WrMobile","WrIsActive","WrIsSuperAdmin","WrCreatedBy","WrCreatedType","WrModifyBy","WrModifyType","WrParentId","WrIsDelete","WrDeleteBy","WrDeleteDate","WrAllowMultipleLogin","WrSubAdminId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),$16,$17) RETURNING "WrUserId"`,
    {
      type: QueryTypes.SELECT,
      bind: [
        request.WrUserName,
        request.WrPassword,
        request.WrRoleId,
        request.WrName,
        request.WrUserType,
        request.WrMobile,
        request.WrIsActive,
        request.WrIsSuperAdmin,
        request.WrCreatedBy,
        request.WrCreatedType,
        request.WrModifyBy,
        request.WrModifyType,
        request.WrParentId,
        request.WrIsDelete,
        request.WrDeleteBy,
        request.WrAllowMultipleLogin,
        request.WrSubAdminId,
      ],
    }
  );

  return data[0];
}

async function signInUser({ WrUserName }, fastify) {
  const data = await fastify.db.query(
    `select "WrUserId","WrPassword","WrUserType","WrRoleId","WrUserName","WrIsSuperAdmin","WrParentId","WrAllowMultipleLogin","WrSubAdminId" from "tblUsers" where "WrUserName" = $1`,
    {
      type: QueryTypes.SELECT,
      bind: [WrUserName], // Bind parameters to prevent SQL injection
    }
  );

  return data[0];
}

async function createUserLoginInfo(userLoginInfo, fastify) {
  await fastify.db.query(
    `with insert_data as (
      INSERT INTO "tblUserLoginInfos" ("WrUserId","WrUserType","wrInfo","wrIsLogin","wrToken") values ($1,$2,$3,$4,$5) 
    )
    update "tblUserLoginInfos" set "wrIsLogin" = false where "WrUserId" in (select "WrUserId" from "tblUsers" where "WrUserId" = $1 and "WrAllowMultipleLogin" = false)`,
    {
      type: QueryTypes.RAW,
      bind: [
        userLoginInfo.WrUserId,
        userLoginInfo.WrUserType,
        JSON.stringify(userLoginInfo.wrInfo),
        userLoginInfo.wrIsLogin,
        userLoginInfo.wrToken,
      ],
    }
  );
}
// with user_data as (
//   select
//   "WrUserId","WrPassword","WrUserType","WrRoleId","WrUserName",
//   "WrIsSuperAdmin","WrParentId","WrAllowMultipleLogin","WrSubAdminId"
// from "tblUsers" where "WrUserName" = 'himanshu1'
// ),
// insert_data as(
// insert into "tblUserLoginInfos" ("WrUserId","WrUserType","wrInfo","wrIsLogin","wrToken")
// select
// coalesce(ud."WrUserId", null), coalesce(ud."WrUserType" , '-1'), 'test', true, 'test'
// from user_data ud
// )

// update "tblUserLoginInfos" set "wrIsLogin" = false where "WrUserId"
// in (select "WrUserId" from "tblUsers" where "WrUserId" in ( select "WrUserId" from  user_data ) and "WrAllowMultipleLogin" = false)

async function userAuthorization(
  UserLoginInfoSearchParameters,
  userModelSearchParameters,
  fastify
) {
  return await fastify.db.models.tblUserLoginInfo.findAll({
    where: UserLoginInfoSearchParameters,
    include: [
      {
        model: UserModel,
        where: userModelSearchParameters,
      },
    ],
  });
}

async function generateEncryptionData(data, fastify) {
  return await fastify.db.query(
    `INSERT INTO "tblEncryptedData" ("wrKey","wrValue") VALUES ($1,$2) `,
    {
      type: QueryTypes.INSERT,
      bind: [data.wrKey, data.wrValue],
    }
  );
}

async function getMaxKey(fastify) {
  const data = await fastify.db.query(
    `select max("wrKey") from "tblEncryptedData"`,
    {
      type: QueryTypes.SELECT,
    }
  );

  return +data[0].max || 0;
}

module.exports = {
  signInUser,
  signUpUser,
  createUserLoginInfo,
  userAuthorization,
  getMaxKey,
  generateEncryptionData,
};

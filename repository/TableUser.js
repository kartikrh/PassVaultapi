const { QueryTypes } = require("sequelize");
const { errorLogger } = require("../utilities/logger");

//TODO: this is a test api
async function signUpUser(request, fastify) {
  const data = await fastify.db.query(
    `INSERT INTO "tblUsers" ("WrUserName","WrPassword","WrRoleId","WrName","WrUserType","WrIsActive","WrIsSuperAdmin","WrParentId","WrAllowMultipleLogin","WrSubAdminId") VALUES ($1,$2,$3,$4,$5,$6,$7,$3,$8,$3) RETURNING "WrUserId"`,
    {
      type: QueryTypes.SELECT,
      bind: [
        request.userName,
        request.password,
        "0",
        request.name,
        request.userType,
        request.isActive,
        true,
        false,
      ],
    }
  );

  return data[0];
}

async function signInUser(body, fastify) {
  const data = await fastify.db.query(
    `WITH user_data AS (
      SELECT
        "WrUserId", "WrPassword", "WrUserType", "WrRoleId", "WrUserName",
        "WrIsSuperAdmin", "WrParentId", "WrAllowMultipleLogin", "WrSubAdminId" ,"WrUserIp"
      FROM "tblUsers" WHERE "WrUserName" = $1 AND "WrPassword"=$2 AND "WrIsActive" = true
    ),
    insert_data AS (
      INSERT INTO "tblUserLoginInfos" ("WrUserId", "WrUserType", "wrInfo", "wrIsLogin", "wrToken","WrCreatedDate")
      SELECT
        ud."WrUserId",
        ud."WrUserType",
        $3, 
       true,
       $4,
        now()
      FROM user_data ud
    ),
    insert_invalid_data as (
      INSERT INTO "tblUserLoginInfos" ("WrUserId", "WrUserType", "wrInfo", "wrIsLogin", "wrToken","WrCreatedDate") 
      select 
      null,'-1',$3,false,null,now() WHERE NOT EXISTS (SELECT 1 FROM user_data)
    ),
    update_loginInfo AS (
      UPDATE "tblUserLoginInfos" SET "wrIsLogin" = false
      WHERE "WrUserId" IN (
        SELECT "WrUserId" FROM "tblUsers" 
        WHERE "WrUserId" IN (SELECT "WrUserId" FROM user_data) AND "WrAllowMultipleLogin" = false
      )
    )
    SELECT * FROM user_data;
    
    `,
    {
      type: QueryTypes.SELECT,
      bind: [body.userName, body.password, body.deviceInfo, body.token], // Bind parameters to prevent SQL injection
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

async function checkValidQuery(body, fastify) {
  const data = await fastify.db.query(
    `select * from "tblUserLoginInfos"  where "wrToken" = $1 and "wrIsLogin" = true and "WrUserType" = $2 and "WrUserId" = $3 `,
    {
      type: QueryTypes.SELECT,
      bind: [body.wrToken, body.WrUserType, body.WrUserId],
    }
  );

  return !!data.length;
}

const getAllUsersQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    te."wrValue" as "userId",
    COALESCE(te1."wrValue" , '0') as "parentId",
    COALESCE(te2."wrValue",'0') as "roleId",
    COALESCE(tu1."WrUserName",'') as "parentName",
    tu."WrUserName" as "userName",
    tu."WrName" as "name",
    tu."WrPassword" as "password",
    tu."WrIsActive" as "isActive",
    tu."WrAllowMultipleLogin" as "allowMultipleLogin",
    tu."WrMobile" as "mobile",
    tu."WrUserType" as "userType"
     from "tblUsers" tu left join "tblEncryptedData" te on tu."WrUserId" = te."wrKey"
     left join "tblEncryptedData" te1 on tu."WrParentId" = te1."wrKey" 
     left join "tblEncryptedData" te2 on tu."WrRoleId" = te2."wrKey"
     left join "tblUsers" tu1 on tu."WrParentId" = tu1."WrUserId"
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
};

const addUserQuery = async (request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_data as (
        INSERT INTO "tblUsers" ("WrParentId" , "WrRoleId" , "WrUserName" , "WrPassword" , "WrName" , "WrMobile" , "WrIsActive" , "WrAllowMultipleLogin" , "WrIsSuperAdmin", "WrCreatedBy","WrCreatedDate" , "WrUserIp" , "WrUserType") VALUES (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *
      )

      select 
    te."wrValue" as "userId",
    COALESCE(te1."wrValue" , '0') as "parentId",
    COALESCE(te2."wrValue",'0') as "roleId",
    tu."WrUserName" as "userName",
    tu."WrName" as "name",
    tu."WrPassword" as "password",
    tu."WrIsActive" as "isActive",
    tu."WrAllowMultipleLogin" as "allowMultipleLogin",
    tu."WrMobile" as "mobile",
    tu."WrUserType" as "userType"
     from "insert_data" tu left join "tblEncryptedData" te on tu."WrUserId" = te."wrKey"
     left join "tblEncryptedData" te1 on tu."WrParentId" = te1."wrKey" 
     left join "tblEncryptedData" te2 on tu."WrRoleId" = te2."wrKey"

      `,
      {
        type: QueryTypes.SELECT,
        bind: [
          request.body.parentId || 0,
          request.body.roleId || 0,
          request.body.userName || "",
          request.body.password || "",
          request.body.name || "",
          request.body.mobile || "",
          request.body.isActive || false,
          request.body.allowMultipleLogin || false,
          false,
          request.userTokenInfo.WrUserId,
          new Date(),
          "0",
          request.body.userType || null,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableUser/addUserQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateUserQuery = async (body, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblUsers" SET
       "WrUserName" = $1,
        "WrName" = $2, 
        "WrMobile" = $3, 
        "WrIsActive" = $4,
         "WrAllowMultipleLogin" = $5, 
         "WrUserType" = $6, 
         "WrRoleId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7), 
         "WrPassword" = $8,
         "WrModifyBy" = $10,
          "WrModifyDate" = $11
          WHERE "WrUserId" =( select "wrKey" from "tblEncryptedData" where "wrValue" = $9)`,
      {
        type: QueryTypes.UPDATE,
        bind: [
          body.userName,
          body.name,
          body.mobile,
          body.isActive,
          body.allowMultipleLogin,
          body.userType,
          body.roleId,
          body.password,
          body.userId,
          request.userTokenInfo.WrUserId,
          new Date(),
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableUser/updateUserQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  signInUser,
  signUpUser,
  createUserLoginInfo,
  getMaxKey,
  generateEncryptionData,
  checkValidQuery,
  getAllUsersQuery,
  addUserQuery,
  updateUserQuery,
};

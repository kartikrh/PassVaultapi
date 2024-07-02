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
        "WrUserId", te."wrValue" as "WrEId", "WrPassword", "WrUserType", "WrRoleId", "WrUserName",
        "WrIsSuperAdmin", "WrParentId", "WrAllowMultipleLogin", "WrSubAdminId" ,"WrUserIp"
      FROM "tblUsers" left join "tblEncryptedData" te on "WrUserId" = te."wrKey" WHERE "WrUserName" = $1 AND "WrPassword"=$2 AND "WrIsActive" = true
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

async function signOutUser(userLoginInfo, fastify) {
  await fastify.db.query(
    `UPDATE "tblUserLoginInfos" set "wrIsLogin" = false where "WrUserId" = $1 and "wrToken" = $2`,
    {
      type: QueryTypes.RAW,
      bind: [userLoginInfo.WrUserId, userLoginInfo.wrToken],
    }
  );
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

const getOriginalIdFromEncryptedId = async (encryptedId, fastify) => {
  const data = await fastify.db.query(
    `select "wrKey" from "tblEncryptedData" where "wrValue" = $1`,
    {
      type: QueryTypes.SELECT,
      bind: [encryptedId],
    }
  );

  return data[0].wrKey;
};
const getAllUsersQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    te."wrValue" as "userId",
    COALESCE(te1."wrValue" , '0') as "parentId",
    COALESCE(te2."wrValue",'0') as "roleId",
    COALESCE(tu1."WrUserName",'') as "parentName",
    COALESCE(tr."wrRoleName",'') as "roleName",
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
      left join "tblRoles" tr on tu."WrRoleId" = tr."wrRoleId"
      where tu."WrIsDelete" is not true
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
          $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
      )

      select 
    te."wrValue" as "userId",
    COALESCE(te1."wrValue" , '0') as "parentId",
    COALESCE(te2."wrValue",'0') as "roleId",
    COALESCE(tu1."WrUserName",'') as "parentName",
    COALESCE(tr."wrRoleName",'') as "roleName",
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
     left join "tblUsers" tu1 on tu."WrParentId" = tu1."WrUserId"
      left join "tblRoles" tr on tu."WrRoleId" = tr."wrRoleId"
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

const deleteUserQuery = async (request, fastify) => {
  try {
    // return await fastify.db.query(
    //   `UPDATE "tblUsers" set "WrIsDelete" = true , "WrDeleteBy" = $2 , "WrDeleteDate"=$3 where "WrUserId" in (
    //   select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1)
    // )`
    return await fastify.db.query(
      `WITH deleted_user AS (
          DELETE FROM "tblUsers"
          WHERE "WrUserId" in (
            select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))
          RETURNING *
      )
      INSERT INTO "tblUserdeleteLogs" (
          "wrDeletebyId",
          "wrDeletedDate",
          "WrUserId",
          "WrUserName",
          "WrPassword",
          "WrRoleId",
          "WrName",
          "WrUserType",
          "WrMobile",
          "WrIsActive",
          "WrIsSuperAdmin",
          "WrCreatedBy",
          "WrCreatedDate",
          "WrCreatedType",
          "WrModifyBy",
          "WrModifyDate",
          "WrModifyType",
          "WrParentId",
          "WrIsDelete",
          "WrDeleteBy",
          "WrDeleteDate",
          "WrAllowMultipleLogin",
          "WrSubAdminId",
          "WrUserIp"
      )
      SELECT
          $2,
          $3,
          "WrUserId",
          "WrUserName",
          "WrPassword",
          "WrRoleId",
          "WrName",
          "WrUserType",
          "WrMobile",
          "WrIsActive",
          "WrIsSuperAdmin",
          "WrCreatedBy",
          "WrCreatedDate",
          "WrCreatedType",
          "WrModifyBy",
          "WrModifyDate",
          "WrModifyType",
          "WrParentId",
          true,
          $2,
          $3,
          "WrAllowMultipleLogin",
          "WrSubAdminId",
          "WrUserIp"
      FROM deleted_user;
      `,
      {
        type: QueryTypes.UPDATE,
        bind: [request.body.userId, request.userTokenInfo.WrUserId, new Date()],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableUser/deleteUserQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateUserPasswordQuery = async (body, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblUsers" set "WrPassword" = $1 where "WrUserId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2)`,
      {
        type: QueryTypes.UPDATE,
        bind: [body.password, body.userId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableUser/updateUserPasswordQuery",
      request
    );
    throw new Error(err.message);
  }
};

async function loginRegistrationClient(body, fastify) {
  try {
    const { userName, password, deviceInfo, token, googleID, mobileNo, ipAddress } = body;

    let data;

    if (!googleID && !token) {
      // Check if user exists by userName (wrEmailID)
      data = await fastify.db.query(
        `SELECT "wrClientID", "wrGoogleID", "wrPassword", "wrUserName", "wrIsAllowMultiLogin", "wrIpAddress"
         FROM "tblClient"
         WHERE "wrEmailID" = $1 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [userName],
        }
      );

      if (data.length === 0) {
        // Registering via registration form
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrClientName", "wrUserName", "wrPassword", "wrIsAllowMultiLogin", "wrCreatedDate", 
            "wrEmailID", "wrMobileNo", "wrIpAddress", "wrIsActive", "wrIsEmailVerified","wrIsDelete"
          ) VALUES (
            $1, $2, $3, $4, now(), $5, $6, $7, true, false,false
          ) RETURNING "wrClientID";`,
          {
            type: QueryTypes.INSERT,
            bind: [userName, userName, password, true, userName, mobileNo, ipAddress],
          }
        );
        return registrationData[0][0];
      }
    } else {
      // Handle Google login or existing user login
      data = await fastify.db.query(
        `WITH user_data AS (
          SELECT
            "wrClientID", "wrGoogleID", "wrPassword", "wrUserName", "wrIsAllowMultiLogin", "wrIpAddress"
          FROM "tblClient"
          WHERE ("wrUserName" = $1 AND "wrPassword" = $2 AND "wrIsDelete" = false)
             OR ("wrGoogleID" = $5 AND "wrIsDelete" = false)
        ),
        insert_data AS (
          INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate")
          SELECT
            ud."wrClientID",
            $3, 
            true,
            $4,
            now()
          FROM user_data ud
          WHERE EXISTS (SELECT 1 FROM user_data)
        ),
        insert_invalid_data AS (
          INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate") 
          SELECT 
            null, $3, false, null, now() 
          WHERE NOT EXISTS (SELECT 1 FROM user_data)
        ),
        update_loginInfo AS (
          UPDATE "tblUserLoginInfos" SET "wrIsLogin" = false
          WHERE "wrClientID" IN (
            SELECT "wrClientID" FROM "tblClient" 
            WHERE "wrClientID" IN (SELECT "wrClientID" FROM user_data) AND "wrIsAllowMultiLogin" = false
          )
        ),
        insert_google_user AS (
          INSERT INTO "tblClient" ("wrGoogleID", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsEmailVerified","wrIsDelete")
          SELECT
            $5, true, now(), $1, true, true ,false
          WHERE NOT EXISTS (SELECT 1 FROM user_data)
          RETURNING "wrClientID"
        )
        SELECT * FROM user_data
        UNION ALL
        SELECT * FROM insert_google_user;
        `,
        {
          type: QueryTypes.SELECT,
          bind: [userName, password, deviceInfo, token, googleID],
        }
      );
    }

    return data[0];

  } catch (error) {
    return error.message;
  }
}


module.exports = {
  signInUser,
  signUpUser,
  signOutUser,
  createUserLoginInfo,
  getMaxKey,
  generateEncryptionData,
  checkValidQuery,
  getAllUsersQuery,
  addUserQuery,
  updateUserQuery,
  deleteUserQuery,
  getOriginalIdFromEncryptedId,
  updateUserPasswordQuery,
  loginRegistrationClient,
};

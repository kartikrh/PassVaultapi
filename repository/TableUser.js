const { QueryTypes } = require("sequelize");
const { errorLogger } = require("../utilities/logger");
const { clientProvider, getIpAddress, clientProcessStatus, deviceInfo } = require("../utilities");
const { generateToken } = require("../utilities/tokenization");

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
        "WrIsSuperAdmin", "WrParentId", "WrAllowMultipleLogin", "WrSubAdminId" ,"WrUserIp",
        "wrEventTypeId","wrCompetitionId"
      FROM "tblUsers" left join "tblEncryptedData" te on "WrUserId" = te."wrKey" 
      WHERE "WrUserName" = $1 AND "WrPassword"=$2 AND "WrIsActive" = true AND "WrIsDelete" = false
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
        WHERE "WrUserId" IN (SELECT "WrUserId" FROM user_data) AND "WrAllowMultipleLogin" = false AND "WrIsDelete" = false
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
  if (body.WrUserId) {
    const data = await fastify.db.query(
      `select * from "tblUserLoginInfos"  where "wrToken" = $1 and "wrIsLogin" = true and "WrUserType" = $2 and "WrUserId" = $3 `,
      {
        type: QueryTypes.SELECT,
        bind: [body.wrToken, body.WrUserType, body.WrUserId],
      }
    );
    return !!data.length;
  }
  else if (body.WrClientId) {
    const data = await fastify.db.query(
      `select * from "tblUserLoginInfos"  where "wrToken" = $1 and "wrIsLogin" = true and "WrUserType" = $2 and "wrClientID" = $3 `,
      {
        type: QueryTypes.SELECT,
        bind: [body.wrToken, body.WrUserType, body.WrClientId],
      }
    );
    return !!data.length;
  }
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
    tu."WrUserType" as "userType",
    tu."wrEventTypeId" as "eventTypeId",
    tu."wrCompetitionId" as "competitionId"
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
        INSERT INTO "tblUsers" ("WrParentId" , "WrRoleId" , "WrUserName" , "WrPassword" , "WrName" , "WrMobile" , "WrIsActive" ,
         "WrAllowMultipleLogin" , "WrIsSuperAdmin", "WrCreatedBy","WrCreatedDate" , "WrUserIp" , "WrUserType",
         "wrEventTypeId","wrCompetitionId") 
        VALUES (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *
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
    tu."WrUserType" as "userType",
    tu."wrEventTypeId" as "eventTypeId",
    tu."wrCompetitionId" as "competitionId"
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
          request.body.eventTypeId || 0,
          request.body.competitionId || 0
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
          "WrModifyDate" = $11,
          "wrEventTypeId" = $12,
          "wrCompetitionId" = $13
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
          body.eventTypeId || 0,
          body.competitionId || 0
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
          UPDATE "tblUsers" SET
              "WrIsDelete" = $4,
              "WrDeleteBy" = $2,
              "WrDeleteDate" = now()
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
        bind: [request.body.userId, request.userTokenInfo.WrUserId, new Date(), true],
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
async function registerClient(body, request ,fastify) {
  try {
    const { fullName, email, userName, password, token, googleID, mobileNo, ipAddress, facebookId } = body;
    // const ip = getIpAddress(request);

    if (facebookId && token) {
      // check if user exust by facebookId
      let query1 =
        ` SELECT 
            "wrClientID" as "clientId",
            "wrGoogleID" as "googleId",
            "wrFacebookId" as "facebookId",
            "wrUserName" as "userName",
            "wrIsAllowMultiLogin" as "isAllowMultiLogin",
            "wrEmailID" as "emailId",
            "wrMobileNo" as "mobileNo"
          FROM "tblClient"
          WHERE "wrFacebookId" = $1 AND "wrIsDelete" = false;
        `;
      const checkData = await fastify.db.query(query1, {
        type: fastify.db.QueryTypes.SELECT,
        bind: [facebookId],
      });
      if (checkData.length > 0) {
        return checkData[0]
      }
      else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrFacebookId", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsDelete","wrUserName","wrIpAddress"
          ) VALUES (
            $1, true, now(), $2, true, false , $3,$4
          ) RETURNING "wrClientID" as "clientId", "wrFacebookId" as "facebookId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId","wrMobileNo" as "mobileNo";`,
          {
            type: fastify.db.QueryTypes.SELECT,
            bind: [facebookId, email, userName, ipAddress],
          }
        );
        return registrationData[0];
      }
    }

    if (!googleID && !token) {
      // Check if user exists by userName (wrEmailID)
      let data = await fastify.db.query(
        // `SELECT "wrMobileNo", "wrEmailID"
        //  FROM "tblClient"
        //  WHERE "wrMobileNo" = $1 AND "wrIsDelete" = false AND "wrEmailID" = $2;`,
        `SELECT 
            CASE 
              WHEN COUNT(*) = 1 AND "wrProvider" = 1 THEN 'MobileNo OR Email is already exists for manually'
              WHEN COUNT(*) = 1 AND "wrProvider" = 2 THEN 'MobileNo OR Email is already exists for google login'
              WHEN COUNT(*) = 1 AND "wrProvider" = 3 THEN 'MobileNo OR Email is already exists for fb login'
              WHEN COUNT(*) > 1 AND "wrProvider" = 1 THEN 'MobileNo AND Email are already exists for manually'
              WHEN COUNT(*) > 1 AND "wrProvider" = 2 THEN 'MobileNo AND Email are already exists for google login'
              WHEN COUNT(*) > 1 AND "wrProvider" = 3 THEN 'MobileNo AND Email are already exists for fb login'
            END as result
          FROM "tblClient"
          WHERE ("wrMobileNo" = $1 OR "wrEmailID" = $2) 
          AND "wrIsDelete" = false
          GROUP BY "wrProvider";`,
        {
          type: QueryTypes.SELECT,
          bind: [mobileNo, email],
        }
      );

      if (data.length > 0) {
        return  data[0].result;
      } else {
        // Register new user
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrClientName", "wrUserName", "wrPassword", "wrIsAllowMultiLogin", "wrCreatedDate", 
            "wrEmailID", "wrMobileNo", "wrIpAddress", "wrIsActive", "wrIsEmailVerified", "wrIsDelete","wrIsMobileVerified", "wrProvider","wrRegistrationProcessStatus",
             "wrIsUserActive"
          ) VALUES (
            $1, $2, $3, $4, now(), $5, $6, $7, true, false, false ,false,1,1,1
          ) RETURNING "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo", "wrClientName" as "fullName", "wrRegistrationProcessStatus" as "registrationProcessStatus", "wrIsUserActive" as "isUserActive", "wrIsActive" as "isActive", "wrProvider" as "provider", "wrIsEmailVerified" as "isEmailVerified", "wrIsMobileVerified" as "isMobileVerified", "wrIsDelete" as "isDelete", "wrCreatedDate" as "createdDate";`,
          {
            type: QueryTypes.INSERT,
            bind: [fullName, userName, password, false, email, mobileNo, ipAddress],
          }
        );
        return registrationData[0][0];
      }
    } else {
      // Handle Google registration
      let data = await fastify.db.query(
        `SELECT "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo"
         FROM "tblClient"
         WHERE "wrGoogleID" = $1 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [googleID],
        }
      );

      if (data.length > 0) {
        return data[0];
      } else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrGoogleID", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsEmailVerified", "wrIsDelete","wrUserName","wrMobileNo",
            "wrIpAddress", "wrIsUserActive"
          ) VALUES (
            $1, true, now(), $2, true, true, false ,$3,$4 ,$5,$6
          ) RETURNING "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", 
           "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo",
           "wrIsUserActive" as "isUserActive";`,
           
          {
            type: QueryTypes.INSERT,
            bind: [googleID, email, userName, mobileNo , ipAddress , 1]
          }
        );
        return registrationData[0][0];
      }
    }
  } catch (error) {
    return error.message;
  }
}
async function registerClientDetails(body, fastify) {
  try {
    const { fullName, userName, email, mobileNo, token, googleID, ipAddress, facebookId } = body;

    if (facebookId && token) {
      // check if user exust by facebookId
      let query1 =
        `
          SELECT 
            "wrClientID" as "clientId",
            "wrGoogleID" as "googleId",
            "wrFacebookId" as "facebookId",
            "wrUserName" as "userName",
            "wrIsAllowMultiLogin" as "isAllowMultiLogin",
            "wrRegistrationProcessStatus" as "registrationProcessStatus",
            "wrEmailID" as "emailId",
            "wrMobileNo" as "mobileNo",
            "wrProvider" as "provider"
          FROM "tblClient"
          WHERE "wrFacebookId" = $1 AND "wrIsDelete" = false;
        `;
      const checkData = await fastify.db.query(query1, {
        type: fastify.db.QueryTypes.SELECT,
        bind: [facebookId],
      });
      if (checkData.length > 0) {
        if (checkData[0].registrationProcessStatus === 3) {
          throw new Error("User is already exists");
        }
        return checkData[0]
      }
      else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrFacebookId", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsDelete","wrUserName" , 
            "wrProvider", "wrRegistrationProcessStatus"
          ) VALUES (
            $1, true, now(), $2, true, false , $3 , $4, 2
          ) RETURNING "wrClientID" as "clientId", "wrFacebookId" as "facebookId", "wrUserName" as "userName", 
           "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId", "wrRegistrationProcessStatus" as "registrationProcessStatus",
           "wrProvider" as "provider",
           "wrMobileNo" as "mobileNo";`,
          {
            type: fastify.db.QueryTypes.SELECT,
            bind: [facebookId, email, userName, clientProvider.Facebook],
          }
        );
        return registrationData[0];
      }
    }
    if (!googleID && !token) {
      // Check if user exists by userName (wrEmailID)
      let data = await fastify.db.query(
        `SELECT 
            "wrClientName" as "fullName",
            "wrIsUserActive" as "isUserActive",
            "wrIsActive" as "isActive",
            "wrRegistrationProcessStatus" as "registrationProcessStatus",
            "wrClientID" as "clientId",
            "wrGoogleID" as "googleId",
            "wrFacebookId" as "facebookId",
            "wrUserName" as "userName",
            "wrIsAllowMultiLogin" as "isAllowMultiLogin",
            "wrEmailID" as "emailId",
            "wrMobileNo" as "mobileNo",
            "wrProvider" as "provider"
          FROM "tblClient"
         WHERE "wrMobileNo" = $1 AND "wrIsDelete" = false AND "wrEmailID" = $2;`,
        {
          type: QueryTypes.SELECT,
          bind: [mobileNo, email],
        }
      );

      if (data.length > 0) {
        // throw new Error("Mobile number and Email is already exists");
        if (data[0].registrationProcessStatus === 3) {
          throw new Error("User is already exists");
        }
        return data[0]
      } else {
        // Register new user
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrClientName", "wrIsAllowMultiLogin", "wrCreatedDate", 
            "wrEmailID", "wrMobileNo", "wrIpAddress", "wrIsActive", "wrIsEmailVerified", "wrIsDelete", "wrRegistrationProcessStatus", "wrUserName", "wrProvider"
          ) VALUES (
            $1, $2, now(), $3, $4, $5, true, false, false, $6, $7 , $8
          ) RETURNING "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo", "wrRegistrationProcessStatus" as "registrationProcessStatus", 
           "wrUserName" as "userName", "wrClientName" as "fullName" , "wrProvider" as "provider", "wrIsActive" as "isActive", "wrIsUserActive" as "isUserActive";`,
          {
            type: QueryTypes.INSERT,
            bind: [fullName, false, email, mobileNo, ipAddress, 1, userName, clientProvider.Manual],
          }
        );
        return registrationData[0][0];
      }
    } else {
      // Handle Google registration
      let data = await fastify.db.query(
        `SELECT "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin",
        "wrRegistrationProcessStatus" as "registrationProcessStatus", "wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo", "wrProvider" as "provider"
         FROM "tblClient"
         WHERE "wrGoogleID" = $1 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [googleID],
        }
      );


      if (data.length > 0) {
        if (data[0].registrationProcessStatus === 3) {
          throw new Error("User is already exists");
        }
        return data[0];
      } else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrGoogleID", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsEmailVerified", 
            "wrIsDelete","wrMobileNo" , "wrProvider", "wrRegistrationProcessStatus"
          ) VALUES (
            $1, true, now(), $2, true, true, false ,$3 ,$4, 2
          ) RETURNING "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,
           "wrMobileNo" as "mobileNo" , "wrProvider" as "provider", "wrRegistrationProcessStatus" as "registrationProcessStatus";`,
          {
            type: QueryTypes.INSERT,
            bind: [googleID, email, mobileNo, clientProvider.Google],
          }
        );
        return registrationData[0][0];
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/registerClientDetails",
      null
    );
    throw new Error(error.message);
  }
}
async function insertOtpQuery(body, fastify) {
  try {
    const { clientId, otp } = body;

    const registrationData = await fastify.db.query(
      `INSERT INTO "tblOtp" (
            "wrUserId", "wrOtp", "wrCreatedDate", "wrExperiedTime"
          ) VALUES (
            $1, $2, now(), now()
          ) RETURNING "wrUserId" as "userId", "wrOtp" as "otp", "wrCreatedDate" as "createdDate", "wrExperiedTime" as "expiredTime", "wrId" as "otpId";`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, otp],
      }
    );
    return registrationData[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/insertOtpQuery",
      null
    );
    throw new Error(error.message);
  }
}
async function registerClientOtpValidation(body, fastify) {
  try {
    const { email, otp, clientId, isMobileVerify, isEmailVerify } = body;
    await fastify.db.query(
      `UPDATE "tblClient" set "wrRegistrationProcessStatus" = $2, "wrIsMobileVerified" = $3, "wrIsEmailVerified" = $4
           WHERE "wrClientID" = $1`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, 2, isMobileVerify, isEmailVerify],
      }
    );
    return "Status updated successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/registerClientOtpValidation",
      null
    );
    throw new Error(error.message);
  }
}
async function verifyMobileOtp(body, fastify) {
  try {
    const { email, otp, clientId } = body;
    await fastify.db.query(
      `UPDATE "tblClient" set "wrIsMobileVerified" = $2, "wrRegistrationProcessStatus" = $3, "wrIsUserActive" = $4
           WHERE "wrClientID" = $1`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, true, 2, 1],
      }
    );
    return "Status updated successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/verifyMobileOtp",
      null
    );
    throw new Error(error.message);
  }
}
async function verifyEmail(body, fastify) {
  try {
    const { clientId } = body;
    await fastify.db.query(
      `UPDATE "tblClient" set "wrIsEmailVerified" = $2, "wrRegistrationProcessStatus" = $3, "wrIsUserActive" = $4
           WHERE "wrClientID" = $1`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, true, 2, 1],
      }
    );
    return "Email verified successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/verifyEmail",
      null
    );
    throw new Error(error.message);
  }
}
async function registerClientPassword(body, fastify) {
  try {
    const { email, password } = body;
    await fastify.db.query(
      `UPDATE "tblClient" set "wrPassword" = $2, "wrRegistrationProcessStatus" = $3, "wrIsUserActive" = $4
           WHERE "wrEmailID" = $1`,
      {
        type: QueryTypes.INSERT,
        bind: [email, password, 3, 1],
      }
    );
    return "Password set successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/registerClientPassword",
      null
    );
    throw new Error(error.message);
  }
}
async function updateClientPassword(body, fastify) {
  try {
    const { email, newPassword, clientId } = body;
    await fastify.db.query(
      `UPDATE "tblClient" set "wrPassword" = $2
           WHERE "wrClientID" = $1`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, newPassword],
      }
    );
    return "Password updated successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/updateClientPassword",
      null
    );
    throw new Error(error.message);
  }
}
async function loginClient(body, fastify) {
  try {
    const { userName, email, password, deviceInfo, token, googleID, facebookId, fullName,ipAddress } = body;
    if (googleID && token) {
      // Handle Google login
      let data = await fastify.db.query(
        `SELECT "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId" ,"wrMobileNo" as "mobileNo",
        "wrRegistrationProcessStatus" as "registrationProcessStatus", "wrProvider" as "provider",
        "wrCountryCode" as "countryCode"
         FROM "tblClient"
         WHERE "wrGoogleID" = $1 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [googleID],
        }
      );

      if (data.length > 0) {
        return data[0];
      } else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrGoogleID", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive", "wrIsEmailVerified", "wrIsDelete","wrUserName" , "wrProvider", "wrRegistrationProcessStatus", "wrIsUserActive", "wrClientName"
            , "wrIpAddress"
          ) VALUES (
            $1, true, now(), $2, true, true, false , $3 , $4, $5, $6, $7,$8
          ) RETURNING "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin",
           "wrEmailID" as "emailId","wrMobileNo" as "mobileNo" , "wrProvider" as "provider" ,
            "wrRegistrationProcessStatus" as "registrationProcessStatus", "wrIsEmailVerified" as "isEmailVerified", "wrIsUserActive" as "isUserActive", "wrIsActive" as "isActive", "wrCreatedDate" as "createdDate", "wrIsMobileVerified" as "isMobileVerified", "wrIsDelete" as "isDelete", "wrClientName" as "fullName",
            "wrCountryCode" as "countryCode";`,
          {
            type: QueryTypes.INSERT,
            bind: [googleID, email, userName, clientProvider.Google, 3, 1, fullName, ipAddress],
          }
        );

        // Insert login information
        await fastify.db.query(
          `INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate")
           VALUES ($1, $2, true, $3, now());`,
          {
            type: QueryTypes.INSERT,
            bind: [registrationData[0][0].clientId, deviceInfo, token],
          }
        );
        return registrationData[0][0];
      }
    }
    else if (facebookId && token) {
      // check if user exust by facebookId
      let query1 =
        `
          SELECT 
            "wrClientID" as "clientId",
            "wrGoogleID" as "googleId",
            "wrFacebookId" as "facebookId",
            "wrUserName" as "userName",
            "wrIsAllowMultiLogin" as "isAllowMultiLogin",
            "wrEmailID" as "emailId",
            "wrMobileNo" as "mobileNo",
            "wrProvider" as "provider",
            "wrRegistrationProcessStatus" as "registrationProcessStatus"
          FROM "tblClient"
          WHERE "wrFacebookId" = $1 AND "wrIsDelete" = false;
        `;
      const checkData = await fastify.db.query(query1, {
        type: fastify.db.QueryTypes.SELECT,
        bind: [facebookId],
      });
      if (checkData.length > 0) {
        return checkData[0]
      }
      else {
        const registrationData = await fastify.db.query(
          `INSERT INTO "tblClient" (
            "wrFacebookId", "wrIsAllowMultiLogin", "wrCreatedDate", "wrEmailID", "wrIsActive","wrIsDelete","wrUserName", "wrProvider", "wrRegistrationProcessStatus", "wrIsUserActive", "wrClientName", "wrIpAddress"
          ) VALUES (
            $1, true, now(), $2, true ,false, $3 ,$4, $5, $6, $7 ,$8
          ) RETURNING "wrClientID" as "clientId", "wrFacebookId" as "facebookId", "wrUserName" as "userName", "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId",
           "wrMobileNo" as "mobileNo" , "wrProvider" as "provider", "wrRegistrationProcessStatus" as "registrationProcessStatus", "wrIsEmailVerified" as "isEmailVerified", "wrIsUserActive" as "isUserActive",
            "wrIsActive" as "isActive",
             "wrCreatedDate" as "createdDate",
              "wrIsMobileVerified" as "isMobileVerified", "wrIsDelete" as "isDelete",
               "wrClientName" as "fullName" , "wrCountryCode" as "countryCode";`,
          {
            type: fastify.db.QueryTypes.SELECT,
            bind: [facebookId, email, userName, clientProvider.Facebook, 3, 1, fullName, ipAddress],
          }
        );
        return registrationData[0];
      }
    }
    else if (email && password) {
      // Handle normal login
      let data = await fastify.db.query(
        `SELECT "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName",
         "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId",
         "wrMobileNo" as "mobileNo","wrClientName" as "fullName", "wrProvider" as "provider",
         "wrRegistrationProcessStatus" as "registrationProcessStatus",
         "wrIsUserActive" as "isUserActive", "wrCountryCode" as "countryCode"
         FROM "tblClient"
         WHERE "wrEmailID" = $1 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [email],
        }
      );
      if (data.length <= 0) {
        return "User not found";
      }
      if(data[0].isUserActive != 1){
        console.log("User is not active");
        return "User is not active";
      }
      let validatePassword = await fastify.db.query(
        `SELECT "wrClientID" as "clientId", "wrGoogleID" as "googleId", "wrUserName" as "userName",
         "wrIsAllowMultiLogin" as "isAllowMultiLogin","wrEmailID" as "emailId",
         "wrMobileNo" as "mobileNo","wrClientName" as "fullName", "wrProvider" as "provider",
          "wrRegistrationProcessStatus" as "registrationProcessStatus",
          "wrCountryCode" as "countryCode"
         FROM "tblClient"
         WHERE "wrEmailID" = $1 AND "wrPassword" = $2 AND "wrIsDelete" = false;`,
        {
          type: QueryTypes.SELECT,
          bind: [email, password],
        }
      );
      if (validatePassword.length <= 0) {
        return "Invalid password";
      }
      if (data.length > 0) {
        // Insert login information
        await fastify.db.query(
          `INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate")
          VALUES ($1, $2, true, $3, now());`,
          {
            type: QueryTypes.INSERT,
            bind: [data[0].clientId, deviceInfo, token],
          }
        );
        return data[0];
      }
    } else {
      return "User not found";
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/loginClient",
      null
    );
    throw new Error(error.message);
  }
}

// const updateClient = async (body, fastify) => {
//   try {
//     const { clientId, fullName, email, mobileNo } = body;

//     // Check if the client ID exists
//     const clientExists = await fastify.db.query(
//       `SELECT 1 FROM "tblClient" WHERE "wrClientID" = $1`,
//       {
//         type: fastify.db.QueryTypes.SELECT,
//         bind: [clientId],
//       }
//     );

//     if (clientExists.length === 0) {
//       return "Client ID does not exist";
//     }

//     // Proceed with the update if client ID exists
//     await fastify.db.query(
//       `UPDATE "tblClient" SET "wrClientName" = $2, "wrEmailID" = $3, "wrMobileNo" = $4
//       WHERE "wrClientID" = $1`,
//       {
//         type: fastify.db.QueryTypes.UPDATE,
//         bind: [clientId, fullName, email, mobileNo],
//       }
//     );

//     return "Client updated successfully";
//   } catch (err) {
//     errorLogger(
//       fastify,
//       err.message,
//       "DB ERROR --> repository/TableConfig/updateConfigQuery"
//     );
//     throw new Error(err.message);
//   }
// };

const updateClient = async (body, fastify) => {
  try {
    const { clientId, fullName, email, mobileNo } = body;

    // Check if the client ID exists
    const clientExists = await fastify.db.query(
      `SELECT "wrEmailID", "wrMobileNo" 
       FROM "tblClient" 
       WHERE "wrClientID" = $1`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientId],
      }
    );

    if (clientExists.length === 0) {
      return "Client ID does not exist";
    }

    const existingClient = clientExists[0];
    let emailChanged = false;
    let mobileNoChanged = false;

    // Check if the new email already exists for another client
    const emailExists = await fastify.db.query(
      `SELECT 1 FROM "tblClient" WHERE "wrEmailID" = $1 AND "wrClientID" != $2`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [email, clientId],
      }
    );

    if (emailExists.length > 0) {
      return "Email is already in use by another client";
    }

    // Check if the new mobileNo already exists for another client
    const mobileNoExists = await fastify.db.query(
      `SELECT 1 FROM "tblClient" WHERE "wrMobileNo" = $1 AND "wrClientID" != $2`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [mobileNo, clientId],
      }
    );

    if (mobileNoExists.length > 0) {
      return "Mobile number is already in use by another client";
    }

    // Determine if email or mobileNo has changed
    if (existingClient.wrEmailID !== email) {
      emailChanged = true;
    }
    if (existingClient.wrMobileNo !== mobileNo) {
      mobileNoChanged = true;
    }

    let updateQuery = `UPDATE "tblClient" SET "wrClientName" = $2, "wrEmailID" = $3, "wrMobileNo" = $4`;
    const updateParams = [clientId, fullName, email, mobileNo];

    if (emailChanged || mobileNoChanged) {
      updateQuery += `, "wrRegistrationProcessStatus" = 2`;
    }

    if (emailChanged) {
      updateQuery += `, "wrIsEmailVerified" = false`;
    }

    if (mobileNoChanged) {
      updateQuery += `, "wrIsMobileVerified" = false`;
    }

    updateQuery += ` WHERE "wrClientID" = $1`;

    // Proceed with the update
    await fastify.db.query(updateQuery, {
      type: fastify.db.QueryTypes.UPDATE,
      bind: updateParams,
    });

    // Return the updated client details
    const updatedClient = await fastify.db.query(
      `SELECT "wrClientID" as "clientId", 
              "wrGoogleID" as "googleId", 
              "wrFacebookId" as "facebookId",
              "wrUserName" as "userName", 
              "wrClientName" as "fullName",
              "wrIsAllowMultiLogin" as "isAllowMultiLogin",
              "wrRegistrationProcessStatus" as "registrationProcessStatus", 
              "wrEmailID" as "emailId", 
              "wrMobileNo" as "mobileNo",
              "wrProvider" as "provider", 
              "wrIsUserActive" as "isUserActive",
              "wrIsActive" as "isActive",
              "wrIsEmailVerified" AS "isEmailVerified",
              "wrIsMobileVerified" AS "isMobileVerified"
       FROM "tblClient" 
       WHERE "wrClientID" = $1`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientId],
      }
    );

    return updatedClient[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/updateConfigQuery"
    );
    throw new Error(err.message);
  }
};

async function loginClientLogAdded(body, fastify) {
  try {
    const { clientId, deviceInfo, token } = body;
    // Insert login information
    await fastify.db.query(
      `INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate")
        VALUES ($1, $2, true, $3, now());`,
      {
        type: QueryTypes.INSERT,
        bind: [clientId, deviceInfo, token],
      }
    );
    return true;
  } catch (error) {
    return error.message;
  }
}

async function signOutClient(body, fastify) {
  const { WrClientId, wrToken } = body;
  await fastify.db.query(
    `UPDATE "tblUserLoginInfos" set "wrIsLogin" = false where "wrClientID" = $1 and "wrToken" = $2`,
    {
      type: QueryTypes.RAW,
      bind: [WrClientId, wrToken],
    }
  );
}


async function validateUser(body, request, fastify) {
  try{
    const data = await fastify.db.query(
      `SELECT * FROM "tblUsers" WHERE "WrPassword" = $1 AND "WrUserId" = $2`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [body.password, request.userTokenInfo.WrUserId],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableUser/validateUser",
      request
    );
    throw new Error(err.message);
  }
}
const registerClientAppQuery = async (data,request,fastify) => {
  try {
    let q1 = `
      WITH insert_data AS
        (
          INSERT INTO "tblClient" (
          "wrClientName",
          "wrUserName",
          "wrPassword",
          "wrIsAllowMultiLogin",
          "wrCreatedDate",
          "wrIsEmailVerified",
          "wrIsMobileVerified",
          "wrMobileNo",
          "wrIpAddress",
          "wrProvider",
          "wrRegistrationProcessStatus",
          "wrCountryCode",
          "wrIsUserActive"
        )   
        VALUES (
          $1,$2,$3,$4,now(),$5,$6,$7,$8,$9,$10,$11,1
        )
        RETURNING *
      )
      SELECT 
        et."wrValue" as "encryptClientId",
        "wrClientID" as "clientId",
        "wrClientName" as "fullName",
        "wrUserName" as "userName",
        "wrPassword" as "password",
        "wrIsAllowMultiLogin" as "isAllowMultiLogin",
        "wrCreatedDate" as "createdDate",
        "wrCreatedBy" as "createdBy",
        "wrModifyBy" as "modifyBy",
        "wrModifyDate" as "modifyDate",
        "wrModifyType" as "modifyType",
        "wrIsDelete" as "isDelete",
        "wrIsEmailVerified" as "isEmailVerified",
        "wrEmailID" as "emailId",
        "wrIsMobileVerified" as "isMobileVerified",
        "wrMobileNo" as "mobileNo",
        "wrIpAddress" as "ipAddress",
        "wrGoogleID" as "googleId",
        "wrIsActive" as "isActive",
        "wrFacebookId" as "facebookId",
        "wrProvider" as "provider",
        "wrRegistrationProcessStatus" as "registrationProcessStatus",
        "wrIsUserActive" as "isUserActive",
        "wrDeletedBy" as "deletedBy",
        "wrDeletedAt" as "deletedAt",
        "wrCountryCode" as "countryCode"
      FROM insert_data a
      LEFT JOIN "tblEncryptedData" et on a."wrClientID"=et."wrKey"
    `;

    const rs = await fastify.db.query(q1, {
      type: fastify.db.QueryTypes.INSERT,
      bind: [
        data.mobileNo,
        data.mobileNo,
        data.password,
        false,
        false,
        false,
        data.mobileNo,
        data.ipAddress,
        clientProvider.Manual,
        clientProcessStatus.ADDUSERDETAIL,
        data.countryCode
      ],
    });
    return rs[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/registerClientAppQuery",
      request
    );
    throw new Error(error.message);
  }
}
const getIdByValue = async (data, request , fastify)=>{
  try {
    const res = await fastify.db.query(
      `
        SELECT "wrKey" as "clientId"
        FROM "tblEncryptedData"
        WHERE "wrValue" = $1
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.clientId],
      }
    );
    return res[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/getIdByValue",
      request
    );
    throw new Error(error.message);
  }
}
const verifyMobileNoAppQuery = async (data, request, fastify) => {
  try {
    let q1 = `
      UPDATE "tblClient"
      SET "wrIsMobileVerified" = true,
          "wrRegistrationProcessStatus" = $1
      WHERE "wrClientID" = $2
    `;
    const rs = await fastify.db.query(q1, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [clientProcessStatus.MOEMAILVERIFIED, data.clientId],
    });
    return rs[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/verifyMobileNoAppQuery",
      request
    );
    throw new Error(error.message);
    
  }
}
const getEncryptClinet = async (data, request , fastify)=>{
  try {
    const res = await fastify.db.query(
      `
        SELECT "wrValue" as "clientId"
        FROM "tblEncryptedData"
        WHERE "wrKey" = $1
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.clientId],
      }
    );
    return res[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/getEncryptClinet",
      request
    );
    throw new Error(error.message);
  }
}
const signInClientAppQuery = async (data, request, fastify) => {
  try{
    // find if password is correct
    let user = await fastify.db.query(
      `SELECT * FROM "tblClient" 
      WHERE "wrClientID" = $1 AND "wrPassword" = $2
      AND "wrIsDelete" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.clientId, data.password],
      }
    );
    if(user.length == 0){
      throw new Error("Invalid password");
    }
    if(user[0].wrIsUserActive != 1){
      throw new Error("User is not active");
    }
   
    let tokenPayload = {
      WrClientId: user[0].wrClientID,
      WrUserName: user[0].wrUserName,
      WrUserName: user[0].wrUserName,
      WrIsSuperAdmin: user[0].wrIsSuperAdmin,
      WrRoleId : 0,
      WrUserType : 0,
      WrAllowMultiLogin : false,
      wrToken : data.token
    }
    const df = deviceInfo(request);
    const ft = generateToken(tokenPayload);
    // Insert login information
    await fastify.db.query(
      `INSERT INTO "tblUserLoginInfos" ("wrClientID", "wrInfo", "wrIsLogin", "wrToken", "wrCreatedDate")
      VALUES ($1, $2, true, $3, now());`,
      {
        type: QueryTypes.INSERT,
        bind: [user[0].wrClientID, df, data.token],
      }
    );
    return ft;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableUser/signInClientAppQuery",
      request
    );
    throw new Error(error.message);
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
  registerClient,
  loginClient,
  updateClient,
  loginClientLogAdded,
  signOutClient,
  registerClientDetails,
  insertOtpQuery,
  registerClientOtpValidation,
  registerClientPassword,
  updateClientPassword,
  verifyEmail,
  verifyMobileOtp,
  validateUser,
  registerClientAppQuery,
  getIdByValue,
  verifyMobileNoAppQuery,
  getEncryptClinet,
  signInClientAppQuery
};
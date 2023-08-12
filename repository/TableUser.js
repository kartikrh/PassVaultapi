//TODO: this is a test api
async function signUpUser(request, fastify) {
  let newUser = await fastify.db.models.tblUser.create(request);
  return { WrUserId: newUser.WrUserId };
}

async function signInUser({ WrUserName }, fastify) {
  return await fastify.db.models.tblUser.findOne({
    where: { WrUserName },
    attributes: [
      "WrUserId",
      "WrPassword",
      "WrUserType",
      "WrRoleId",
      "WrUserName",
      "WrIsSuperAdmin",
      "WrParentId",
      "WrAllowMultipleLogin",
      "WrSubAdminId",
    ],
  });
}

async function createUserLoginInfo(userLoginInfo, fastify) {
  return await fastify.db.models.tblUserLoginInfo.create(userLoginInfo);
}

async function updateSingleLoginInfoToLogout(userLoginInfo, fastify) {
  return await fastify.db.models.tblUserLoginInfo.update(
    { wrIsLogin: false },
    {
      where: {
        WrUserId: userLoginInfo,
      },
    }
  );
}

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

module.exports = {
  signInUser,
  signUpUser,
  createUserLoginInfo,
  updateSingleLoginInfoToLogout,
  userAuthorization,
};

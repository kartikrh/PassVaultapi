const { allRolesService } = require("../../../../services/roles");
const { getAllUsersWithCurrentService } = require("../../../../services/user");
const { allBlocksService } = require("../../../../services/blocks");
const { getTabsService } = require("../../../../services/admin");

const { errorLogger } = require("../../../../utilities/logger");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const {
  getUserListService,
} = require("../../../../services/list");
const { allCountryCodeService } = require("../../../../services/countryCode");

let commonPath = "controller/users/admin/list/index.js";

const getRoleList = async (request, reply, fastify) => {
  try {
    let result = await allRolesService(request);
    result = result.map((item) => {
      return {
        roleId: item.roleId,
        roleName: item.roleName,
      };
    });
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getRoleList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllUsersWithCurrent = async (request, reply, fastify) => {
  try {
    const result = await getAllUsersWithCurrentService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger( fastify, err.message, commonPath + "/getAllUsersWithCurrent", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getBlockList = async (request, reply, fastify) => {
  try {
    let result = await allBlocksService(request, fastify);
    result = result.map((item) => ({
      blockId: item.blockId,
      blockName: item.blockName,
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getBlockList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTabs = async (request, reply, fastify) => {
  try {
    const result = await getTabsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTabs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const allCountryCodes = async (request, reply, fastify)=>{
    try {
        const countryData = await allCountryCodeService(fastify, request);
        const result = countryData.map(item => {
          return {
            countryId: item.id,
            countryName: item.countryName,
          }
        })
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allCountryCodes", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getUserList = async (request, reply, fastify)=>{
  try {
      const result = await getUserListService(request, fastify);
      reply.status(200).send(success(result, 200));
  } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getUserList", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
module.exports = {
    getRoleList,
    getAllUsersWithCurrent,
    getBlockList,
    getTabs,
    allCountryCodes,
    getUserList,
}

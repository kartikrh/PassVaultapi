const { allSubScribesDomainService ,subScribeDomainByIdService, saveSubScribeDomainService, deleteSubScribeDomainService, approveDomainService, activeInactiveVideoApprovedService, getAllSubDomainDataService, insertSubDomainsService, insertDomainsService, activeInactiveSubscribeDomainService, inactiveAllSubscribeDomainService} = require("../../../../services/subScribesDomain");
const { error, success,ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

const commonPath = "controller/users/admin/subScribesDomai/index.js";
const getAllSubScribesDomain = async (request, reply, fastify) => {
    try {
        const result = await allSubScribesDomainService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllSubScribesDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getAllSubDomainData = async (request, reply, fastify) => {
    try {
        const result = await getAllSubDomainDataService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllSubDomainData", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const insertSubDomains = async (request, reply, fastify) => {
    try {
        const result = await insertSubDomainsService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/insertSubDomains", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const insertDomains = async (request, reply, fastify) => {
    try {
        const result = await insertDomainsService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/insertDomains", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getSubscribeDomainById = async (request, reply, fastify) => {
    try {
        const result = await subScribeDomainByIdService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllSubScribesDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const saveSubScribeDomain = async (request, reply, fastify) => {
    try {
        const result = await saveSubScribeDomainService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveSubScribeDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const deleteSubScribeDomain = async (request, reply, fastify) => {
    try {
        const result = await deleteSubScribeDomainService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteSubScribeDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const approveDomain = async (request, reply, fastify) => {
    try {
        const result = await approveDomainService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/approveDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const activeInactiveVideoApproved = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveVideoApprovedService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveVideoApproved", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const activeInactiveSubscribeDomain = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveSubscribeDomainService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveSubscribeDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const inactiveAllSubscribeDomain = async (request, reply, fastify) => {
    try {
        const result = await inactiveAllSubscribeDomainService(request,fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/inactiveAllSubscribeDomain", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllSubScribesDomain,
    getSubscribeDomainById,
    saveSubScribeDomain,
    deleteSubScribeDomain,
    approveDomain,
    activeInactiveVideoApproved,
    getAllSubDomainData,
    insertSubDomains,
    insertDomains,
    activeInactiveSubscribeDomain,
    inactiveAllSubscribeDomain
}
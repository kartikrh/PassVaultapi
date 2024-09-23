const {
    allSocialMediaService,
    socialMediaByIdService,
    createSocialMediaService,
    deleteSocialMediaService,
    activeInactiveSocialMediaService
} = require("../../../../services/socialMedia");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/socialMedia/index.js";

const getAllSocialMedia = async (request, reply, fastify) => {
    try {
        const result = await allSocialMediaService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllSocialMedia", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const socialMediaById = async (request, reply, fastify) => {
    try {
        const result = await socialMediaByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/socialMediaById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveSocialMedia = async (request, reply, fastify) => {
    try {
        const result = await createSocialMediaService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveSocialMedia", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteSocialMedia = async (request, reply, fastify) => {
    try {
        const result = await deleteSocialMediaService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteSocialMedia", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};


const activeInactiveSocialMedia = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveSocialMediaService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveSocialMedia", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllSocialMedia,
    socialMediaById,
    saveSocialMedia,
    deleteSocialMedia,
    activeInactiveSocialMedia
};

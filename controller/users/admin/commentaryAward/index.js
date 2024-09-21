const { 
    getAllComAwardService,
    getComAwardByIdService,
    saveComAwardService,
    deleteComAwardService, 
    getCommentariesService,
    getCommentaryTeamService,
    getCommentaryPlayerByComService,
    assignAwardService,
    getAssignAwardService} = require("../../../../services/commentaryAward");
const { error, success, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/commentaryAward/index.js";


const getAllCommentaryAward = async (request, reply, fastify) => {
    try {
        const result = await getAllComAwardService(fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllCommentaryAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getCommentaryAwardById = async (request, reply, fastify) => {
    try {
        const result = await getComAwardByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getCommentaryAwardById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const saveCommentaryAward = async (request, reply, fastify) => {
    try {
        const result = await saveComAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveCommentaryAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const deleteCommentaryAward = async (request, reply, fastify) => {
    try {
        const result = await deleteComAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteCommentaryAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getCommentaries = async (request, reply, fastify) => {
    try {
        const result = await getCommentariesService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getCommentaries", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getCommentaryTeam = async (request, reply, fastify) => {
    try {
        const result = await getCommentaryTeamService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getCommentaryTeam", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getCommentaryPlayerByCom = async (request, reply, fastify) => {
    try {
        const result = await getCommentaryPlayerByComService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getCommentaryPlayerByCom", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const assignAward = async (request, reply, fastify) => {
    try {
        const result = await assignAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/assignAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getAssignAward = async (request, reply, fastify) => {
    try {
        const result = await getAssignAwardService(request, fastify);
        reply.status(200).send(success(result, 200));
    }
    catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAssignAward", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
module.exports = {
    getAllCommentaryAward,
    getCommentaryAwardById,
    saveCommentaryAward,
    deleteCommentaryAward,
    getCommentaries,
    getCommentaryTeam,
    getCommentaryPlayerByCom,
    assignAward,
    getAssignAward
}
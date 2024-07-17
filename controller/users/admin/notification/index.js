
const { getAllNotificationService, getNotificationByIdService, saveNotificationService, deleteNotificationService, getEventListService, sendNotService } = require("../../../../services/notification");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/notification";

const getAllNotification = async (request , reply , fastify)=>{
    try {
        const result = await getAllNotificationService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllNotification", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getEventList = async (request , reply , fastify)=>{
    try {
        const result = await getEventListService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getEventList", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getNotificationById = async (request, reply, fastify) => {
    try {
        const result = await getNotificationByIdService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getNotificationById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const saveNotification = async (request , reply , fastify) =>{
    try {
        const result = await saveNotificationService(request ,fastify);
        reply.status(200).send(success(result,200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveNotification", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

const deleteNotification = async (request , reply , fastify) =>{
    try {
        const result = await deleteNotificationService(request ,fastify);
        reply.status(200).send(success(result,200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteNotification", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const sendNot = async (request , reply , fastify) =>{
    try {
        const result = await sendNotService(request ,fastify);
        reply.status(200).send(success(result,200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/sendNot", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

module.exports ={
    getAllNotification,
    getNotificationById,
    saveNotification,
    deleteNotification,
    getEventList,
    sendNot
}
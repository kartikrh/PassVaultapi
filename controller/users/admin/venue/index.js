const {
    allVenuesService,
    venueByIdService,
    createVenueService,
    deleteVenueService,
    activeInactiveVenueService,
} = require("../../../../services/venue");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/venue/index.js";

const getAllVenues = async (request, reply, fastify) => {
    try {
        const result = await allVenuesService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllVenues", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const venueById = async (request, reply, fastify) => {
    try {
        const result = await venueByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/venueById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveVenue = async (request, reply, fastify) => {
    try {
        const result = await createVenueService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveVenue", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteVenue = async (request, reply, fastify) => {
    try {
        const result = await deleteVenueService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteVenue", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const activeInactiveVenue = async (request, reply, fastify) => {
    try {
        const result = await activeInactiveVenueService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/activeInactiveVenue", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
module.exports = {
    getAllVenues,
    venueById,
    saveVenue,
    deleteVenue,
    activeInactiveVenue,
};

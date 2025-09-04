const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const {
  saveTeamsService,
  savePlayersService,
  saveCompetitionsService,
  saveCommentariesService,
  saveCountryCodesService,
  saveVenueService
} = require("../../../../services/entitySport");

let path = "controller/users/admin/entitySport/index";

const saveTeams = async (request ,reply ,fastify)=>{
    try {
        const result = await saveTeamsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveTeams", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
    
}
const savePlayers = async (request ,reply ,fastify)=>{
    try {
        const result = await savePlayersService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/savePlayers", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
    
}
const saveCompetitions = async (request ,reply ,fastify)=>{
    try {
        const result = await saveCompetitionsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveCompetitions", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const saveCommentaries = async (request ,reply ,fastify)=>{
    try {
        const result = await saveCommentariesService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveCommentaries", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }

}

const saveCountryCodes = async (request, reply, fastify) => {
    try {
        const result = await saveCountryCodesService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveCountryCodes", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

const saveVenues = async (request, reply, fastify) => {
    try {
        const result = await saveVenueService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveVenues", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

module.exports = {
    saveTeams,
    savePlayers,
    saveCompetitions,
    saveCommentaries,
    saveCountryCodes,
    saveVenues,
}
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const {
  saveTeamsService,
  savePlayersService
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
module.exports = {
    saveTeams,
    savePlayers
}
const { errorLogger } = require("./logger");
const axios = require("axios");
const { ENTITYSPORTBASEURL, ENTITYAUTHTOKEN, ENTITYSPORTURL } = require("./configConstants");

const importPlayerAndTeamOnEntityAPI = async (data, request, fastify) => {
    try {
        let baseUrl = global.tblConfigs.find(item => item.key === ENTITYSPORTBASEURL || item.key === ENTITYSPORTURL)?.value;
        if (!baseUrl) return 'Entity sport base URL not found';
        const authToken = global.tblConfigs.find(item => item.key === ENTITYAUTHTOKEN)?.value;
        if (!authToken) {
            throw new Error("Auth token not found in config");
        }
        let url = `${baseUrl}/admin/list/compSquadssss`;
        const result = await axios.post(url, { cid: data }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        });
        return result.data.result;
    } catch (error) {
        console.log("error from importPlayerAndTeamOnEntityAPI", error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> utilities/entity/importPlayerAndTeamOnEntityAPI",
            request
        );
        return error.response?.data || { status: "failed", response: error.message, api_version: "3.0" };
    }
}


const importTeamsOnEntityAPI = async (data, request, fastify) => {
    try {
        let baseUrl = global.tblConfigs.find(item => item.key === ENTITYSPORTBASEURL || item.key === ENTITYSPORTURL)?.value;
        if (!baseUrl) return 'Entity sport base URL not found';
        const authToken = global.tblConfigs.find(item => item.key === ENTITYAUTHTOKEN)?.value;
        if (!authToken) {
            throw new Error("Auth token not found in config");
        }
        let url = `${baseUrl}/admin/list/compTeams`;
        const result = await axios.post(url, { cid: data }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        });
        return result.data.result;
    } catch (error) {
        console.log("error from importTeamsOnEntityAPI", error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> utilities/entity/importTeamsOnEntityAPI",
            request
        );
        return error.response?.data || { status: "failed", response: error.message, api_version: "3.0" };
    }
}

module.exports = {
    importPlayerAndTeamOnEntityAPI,
    importTeamsOnEntityAPI,
}
const { errorLogger } = require("./logger");
const axios = require("axios");
const { ENTITYSPORTBASEURL, ENTITYAUTHTOKEN, ENTITYSPORTURL } = require("./configConstants");

const importCommentaryOnEntityAPI = async (data, request, fastify) => {
    try {
        let baseUrl = global.tblConfigs.find(item => item.key === ENTITYSPORTBASEURL || item.key === ENTITYSPORTURL)?.value;
        if (!baseUrl) return 'Entity sport base URL not found';
        const authToken = global.tblConfigs.find(item => item.key === ENTITYAUTHTOKEN)?.value;
        if (!authToken) {
            throw new Error("Auth token not found in config");
        }
        let url = `${baseUrl}/admin/list/matchInfo`;
        const result = await axios.post(url, { mid: data }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        });
        return result.data.result;
    } catch (error) {
        console.log("error from importCommentaryOnEntityAPI", error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> utilities/entity/importCommentaryOnEntityAPI",
            request
        );
        return error.response?.data || { status: "failed", response: error.message, api_version: "3.0" };
    }
}

const importCompetitonOnEntityAPI = async (data, request, fastify) => {
    try {
        let baseUrl = global.tblConfigs.find(item => item.key === ENTITYSPORTBASEURL || item.key === ENTITYSPORTURL)?.value;
        if (!baseUrl) return 'Entity sport base URL not found';
        const authToken = global.tblConfigs.find(item => item.key === ENTITYAUTHTOKEN)?.value;
        if (!authToken) {
            throw new Error("Auth token not found in config");
        }
        let url = `${baseUrl}/admin/list/compOverview`;
        const result = await axios.post(url, { cid: data }, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        });
        return result.data.result;
    } catch (error) {
        console.log("error from importCompetitonOnEntityAPI", error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> utilities/entity/importCompetitonOnEntityAPI",
            request
        );
        return error.response?.data || { status: "failed", response: error.message, api_version: "3.0" };
    }
}

const importPlayerAndTeamOnEntityAPI = async (data, request, fastify) => {
    try {
        let baseUrl = global.tblConfigs.find(item => item.key === ENTITYSPORTBASEURL || item.key === ENTITYSPORTURL)?.value;
        if (!baseUrl) return 'Entity sport base URL not found';
        const authToken = global.tblConfigs.find(item => item.key === ENTITYAUTHTOKEN)?.value;
        if (!authToken) {
            throw new Error("Auth token not found in config");
        }
        let url = `${baseUrl}/admin/list/compSquads`;
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
    importCommentaryOnEntityAPI,
    importCompetitonOnEntityAPI,
    importPlayerAndTeamOnEntityAPI,
    importTeamsOnEntityAPI,
}
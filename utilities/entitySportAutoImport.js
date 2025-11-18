const { RefType } = require(".");
const { getAllAutoImportDataQuery, updateAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { matchImportService } = require("../services/commentry");
const { competitionImportService } = require("../services/competition");
const { playerImportService, UpdatePlayerFromEntityService } = require("../services/player");
const { teamImportService, UpdateTeamFromEntityService } = require("../services/teams");
const { importUpdateTournamentTeamPointFromEntitySportService } = require("../services/tournamentTeamPoints");
const { errorLogger } = require("./logger");

const importUpdate = async (data, fastify) => {
    try {
        await updateAutoImportDataQuery(data, fastify, null);
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> utilities/entitySportAutoImport.js/importUpdate",
            null,
            data
        );
        throw error;
    }
};

const getImportPayload = (importFn, refId) => {
    const mapping = {
        [competitionImportService.name]: { cid: refId },
        [importUpdateTournamentTeamPointFromEntitySportService.name]: { cid: refId },
        [matchImportService.name]: { mid: refId },
        [teamImportService.name]: { tid: refId },
        [UpdateTeamFromEntityService.name]: { tid: refId },
        [playerImportService.name]: { pid: refId },
        [UpdatePlayerFromEntityService.name]: { pid: refId },
    };
    return mapping[importFn.name] || {};
};

const processImport = async (importFn, importData, fastify) => {
    importData.isImportStart = true;
    importData.importStartTime =  new Date();

    try {
        await importUpdate(importData, fastify);

        const payload = getImportPayload(importFn, importData.refId);

        await importFn(payload, fastify, {
            userTokenInfo: { WrUserId: -2 }
        });

        importData.importEndTime = new Date();
        importData.isImported = false;
        await importUpdate(importData, fastify);
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            `DB ERROR --> utilities/entitySportAutoImport.js/processImport/${importFn.name}`,
            null,
            importData
        );
        throw error;
    }
};

const validateImportData = (data, fastify) => {
    if (!data || !data.id) return false;
    const { id, refId, refType } = data;
    if (!refId || !refType) {
        errorLogger(
            fastify,
            `Invalid refId or refType for wrId: ${id}, skipping import`,
            "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess - validateImportData",
            null,
            data
        );
        return false;
    }

    const validRefTypes = Object.values(RefType);
    if (!validRefTypes.includes(Number(refType))) {
        errorLogger(
            fastify,
            `Unknown refType: ${refType} for wrId: ${id}, skipping import`,
            "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess - validRefTypes",
            null,
            data
        );
        return false;
    }

    return true;
};

const entitySportAutoImportProcess = async (fastify) => {
    try {
        const condition = `"wrIsImported" = true AND "wrIsImportStart" = false AND "wrSourceId" = 3 ORDER BY "wrId" ASC LIMIT 1`;
        const autoImportData = await getAllAutoImportDataQuery(null, fastify, condition);

        if (!autoImportData?.length) return;

        const importData = autoImportData[0];
        if (!validateImportData(importData, fastify)) return;

        const { refId, refType } = importData;

        const importMap = {
            [RefType.Competition]: competitionImportService,
            [RefType.Match]: matchImportService,
            [RefType.Team]: teamImportService,
            [RefType.Player]: playerImportService,
            [RefType.TeamUpdate]: UpdateTeamFromEntityService,
            [RefType.PlayerUpdate]: UpdatePlayerFromEntityService,
            [RefType.tournamentTeamPointUpdate]: importUpdateTournamentTeamPointFromEntitySportService,
        };

        const importFn = importMap[Number(refType)];
        if (!importFn) {
            errorLogger(
                fastify,
                `Unknown refType: ${refType} for refId: ${refId}`,
                "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess - importFn",
                null,
                refType
            );
            return;
        }

        await processImport(importFn, importData, fastify);
    } catch (error) {
        console.error("Error in autoImportProcess", error);
        errorLogger(
            fastify,
            error.message,
            "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess",
            null
        );
    }
};

module.exports = {
    entitySportAutoImportProcess,
};
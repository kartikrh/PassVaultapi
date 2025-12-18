const { RefType } = require(".");
const { getAllAutoImportDataQuery, updateAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { matchImportService } = require("../services/commentry");
const { competitionImportService } = require("../services/competition");
const { importCompetitionstatisticsService } = require("../services/competitionStatistics");
const { importICCRankingFromEntitySportService } = require("../services/iccRanking");
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
        [importCompetitionstatisticsService.name]: { cid: refId }
    };
    return mapping[importFn.name] || {};
};

const validateImportData = (data, fastify) => {
    if (!data || !data.id) return false;
    if (data.refType !== RefType.ICCRanking) {
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
    }


    const validRefTypes = Object.values(RefType);
    if (!validRefTypes.includes(Number(data.refType))) {
        errorLogger(
            fastify,
            `Unknown refType: ${data.refType} for wrId: ${id}, skipping import`,
            "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess - validRefTypes",
            null,
            data
        );
        return false;
    }

    return true;
};

const entitySportAutoImportProcess = async (fastify) => {
    const condition = `"wrIsImported" = true AND "wrIsImportStart" = false AND "wrSourceId" = 3 AND "wrImportStartTime" IS NULL ORDER BY "wrId" ASC`;
    const autoImportData = await getAllAutoImportDataQuery(null, fastify, condition);

    for (const aID of autoImportData) {
        let importData = aID;
        global.autoImportData = null;
        try {

            if (!validateImportData(importData, fastify)) continue;
            const { id, refId, refType } = importData;

            const importMap = {
                [RefType.Competition]: competitionImportService,
                [RefType.Match]: matchImportService,
                [RefType.Team]: teamImportService,
                [RefType.Player]: playerImportService,
                [RefType.TeamUpdate]: UpdateTeamFromEntityService,
                [RefType.PlayerUpdate]: UpdatePlayerFromEntityService,
                [RefType.tournamentTeamPointUpdate]: importUpdateTournamentTeamPointFromEntitySportService,
                [RefType.ICCRanking]: importICCRankingFromEntitySportService,
                [RefType.CompetitionStatistics]: importCompetitionstatisticsService,
                [RefType.CompetitionUpdate]: competitionImportService
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
                continue;
            }

            importData.isImportStart = true;
            importData.importStartTime = new Date();

            global.autoImportData = {
                id,
                esApiResponseData: null
            }

            await importUpdate(importData, fastify);

            const payload = getImportPayload(importFn, refId);

            await importFn({ ...payload, autoImportId: id }, fastify, {
                userTokenInfo: { WrUserId: -2 }
            });

            importData.importEndTime = new Date();
            importData.isImported = false;

            if (global?.autoImportData && global?.autoImportData?.id === id) {
                importData.esApiResponseData = global.autoImportData.esApiResponseData;
            }
            await importUpdate(importData, fastify);
        } catch (error) {
            if (importData && global?.autoImportData && global?.autoImportData?.id) {
                if (global?.autoImportData?.id === importData.id) {
                    importData.esApiResponseData = global.autoImportData.esApiResponseData;
                }
                await importUpdate({
                    ...importData,
                    errorStackData: error.stack
                }, fastify);
            }
            errorLogger(
                fastify,
                error.message,
                "ERROR --> services/entitySportAutoImport.js/entitySportAutoImportProcess",
                null
            );
        } finally {
            importData = null;
            global.autoImportData = null;
        }
    }
};

module.exports = {
    entitySportAutoImportProcess,
};
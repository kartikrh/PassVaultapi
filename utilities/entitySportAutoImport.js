const { RefType } = require(".");
const { getAllAutoImportDataQuery, updateAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { matchImportService } = require("../services/commentry");
const { competitionImportService } = require("../services/competition");
const { playerImportService } = require("../services/player");
const { teamImportService } = require("../services/teams");
const { errorLogger } = require("./logger");

const entitySportAutoImportProcess = async (fastify) => {
    console.log("🚀 ~ entitySportAutoImportProcess ~ started:")
    try {
        const condition = `"wrIsImported" = ${true} AND "wrIsImportStart" = ${false} AND "wrSourceId" = ${3}`;
        const autoImportDataCompetition = await getAllAutoImportDataQuery(null, fastify, condition);
        if (!autoImportDataCompetition?.length) return;

        const grouped = {};
        autoImportDataCompetition.forEach(item => {
            if (!grouped[item.refType]) {
                grouped[item.refType] = [];
            }
            grouped[item.refType].push(item);
        });

        const importStart = async (data) => {
            console.log("🚀 ~ entitySportAutoImportProcess ~ importStart:", data)
            try {
                await updateAutoImportDataQuery(data, fastify, null);
            } catch (err) {
                errorLogger(fastify, err.message, `DB ERROR --> utilities/entitySportAutoImport.js/entitySportAutoImportProcess/importStart`, null);
            }
        };

        const importEnd = async (data) => {
            console.log("🚀 ~ entitySportAutoImportProcess ~ importEnd:", data)
            try {
                await updateAutoImportDataQuery({
                    ...data,
                }, fastify, null);
            } catch (err) {
                errorLogger(fastify, err.message, `DB ERROR --> utilities/entitySportAutoImport.js/entitySportAutoImportProcess/importEnd`, null);
            }
        };

        const processImport = async (autoImport, importFn, idKey) => {
            if (!autoImport?.refId) {
                console.log(`No wrRefId found in ${idKey}, skipping import`);
                return;
            }

            autoImport.importStartTime = new Date();
            autoImport.isImportStart = true;

            await importStart(autoImport);

            try {
                const data = { [idKey]: autoImport.refId };
                const syncData = await importFn(data, fastify, null);
                if (syncData) {
                    autoImport.importEndTime = new Date();
                    autoImport.isImported = false;
                    await importEnd(autoImport);
                }
            } catch (err) {
                errorLogger(fastify, err.message, `DB ERROR --> utilities/entitySportAutoImport.js/processImport/${importFn.name}`, null);
            }
        };

        for (const competition of grouped?.[RefType.Competition.toString()] || []) {
            const result = await processImport(competition, competitionImportService, 'cid');
            if (result) return true;  // if you want to stop after first successful?
        }

        for (const team of grouped?.[RefType.Team.toString()] || []) {
            const result = await processImport(team, teamImportService, 'tid');
            if (result) return true;  // if you want to stop after first successful?
        }

        for (const match of grouped?.[RefType.Match.toString()] || []) {
            const result = await processImport(match, matchImportService, 'mid');
            if (result) return true;  // if you want to stop after first successful?
        }

        for (const player of grouped?.[RefType.Player.toString()] || []) {
            const result = await processImport(player, playerImportService, 'pid');
            if (result) return true;  // if you want to stop after first successful?
        }

    } catch (err) {
        console.error(new Date(), "Error in autoImportProcess", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/entitySportAutoImport.js/entitySportAutoImport",
          null
        );
    }
};


module.exports = {
    entitySportAutoImportProcess,
}
const { RefType } = require(".");
const { insertAutoImportDataService } = require("../services/autoImportData");
const { errorLogger } = require("./logger");

const formatDate = (date) => date.toISOString().split("T")[0];

const autoUpdateTournamentTeamPoints = async (fastify) => {
    const request = {
        userTokenInfo: {
            WrUserId: -2
        }
    }
    try {
        const yesterdayStr = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const competitionList = global.tblCompetitions.filter(cp => {
            const startStr = formatDate(new Date(cp.startDate));
            const endStr = formatDate(new Date(cp.endDate));

            return yesterdayStr >= startStr && yesterdayStr <= endStr && cp.tpId !== null;
        })

        for (const competition of competitionList) {
            await insertAutoImportDataService({
                ...request,
                body: {
                    refId: competition?.tpId || competition?.competitionId,
                    refType: RefType.tournamentTeamPointUpdate,
                    sourceId: 3
                },
                userTokenInfo: {
                    WrUserId: request?.userTokenInfo?.WrUserId ?? -2
                }
            }, fastify);
        }
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "ERROR --> utilities/autoUpdateTournamentTeamPoints.js/autoUpdateTournamentTeamPoints",
            request
        );
    }
}

module.exports = {
    autoUpdateTournamentTeamPoints
}
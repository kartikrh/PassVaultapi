const { compStatus } = require(".");
const { saveCompetitionService } = require("../services/competition");
const { importUpdateTournamentTeamPointFromEntitySportService } = require("../services/tournamentTeamPoints");
const { errorLogger } = require("./logger");

const formatDate = (date) => date.toISOString().split("T")[0];

const autoUpdateTournamentTeamPoints = async (fastify) => {
    try {
        const yesterdayStr = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const competitionList = global.tblCompetitions.filter(cp => {
            const startStr = formatDate(new Date(cp.startDate));
            const endStr = formatDate(new Date(cp.endDate));

            return yesterdayStr >= startStr && yesterdayStr <= endStr && cp.tpId !== null;
        })

        for (const competition of competitionList) {
            const result = await importUpdateTournamentTeamPointFromEntitySportService({
                cid: competition.tpId
            }, fastify, null);
            const entityCompetitionStatus = compStatus[result?.status]
            if (entityCompetitionStatus !== competition.commStatus) {
                await saveCompetitionService({
                    body: {
                        ...competition,
                        commStatus: entityCompetitionStatus
                    },
                    userTokenInfo: {
                        WrUserId: -2
                    }
                }, fastify);
            }
        }
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "ERROR --> utilities/autoUpdateTournamentTeamPoints.js/autoUpdateTournamentTeamPoints",
            null
        );

    }
}

module.exports = {
    autoUpdateTournamentTeamPoints
}
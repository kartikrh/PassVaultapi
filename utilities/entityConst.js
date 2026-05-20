const entityConstant = {
   EXCHANGEMATCHINFOAPI: "https://restapi.entitysport.com/exchange/matches/{match_id}/info?token={token}",
}
const PlayerType = {
   bat: 1,
   bowl: 2,
   all: 4,
   wk: 3,
   wkbat: 3
}

const nullTeamtpIds = [
   127770,
   127775
]

const entitySportAutoUpdateCommentaryTime = 15; //minutes

const intervalTimesForUpdateCommentary = [48, 24, 12, 6, 3, 1, 0.25]; // hours (use 0.25 for 15 minutes)

const autoUpdateCommentaryDataStatus = {
   start: 1,
   noupdate: 2,
   success: 3,
   failed: 4,
   added: 5
}

const entitySportAPIEndPoint = {
   getICCRankingData: "/iccRanking/info",
   getCompetitionData: "/competition/{cid}/info",
   getCompetitionMatchData: "/competition/{cid}/matches",
   getCompetitionStatisticsData: "/competition/{cid}/stats",
   getCompetitionSquadData: "/competition/{cid}/squads",
   getMatchData: "/match/{mid}/info",
   getMatchInningsData: "/match/{mid}/innings/{inningId}/commentary",
   getMatchStatisticsData: "/match/{mid}/statistics",
   getTeamAndPlayerData: "/team/{tid}/player",
   getPlayerAndStatisticsData: "/player/{pid}/statistics",
   searchPlayerData: "/player/search"
}

module.exports = {
   entityConstant,
   PlayerType,
   nullTeamtpIds,
   entitySportAutoUpdateCommentaryTime,
   intervalTimesForUpdateCommentary,
   autoUpdateCommentaryDataStatus,
   entitySportAPIEndPoint
}
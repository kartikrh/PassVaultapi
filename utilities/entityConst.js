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

module.exports = {
   entityConstant,
   PlayerType,
   nullTeamtpIds,
   entitySportAutoUpdateCommentaryTime,
   intervalTimesForUpdateCommentary,
   autoUpdateCommentaryDataStatus
}
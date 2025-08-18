const entityConstant = {
   EXCHANGEMATCHINFOAPI: "https://restapi.entitysport.com/exchange/matches/{match_id}/info?token={token}",
}
const PlayerType = {
   bat: 1,
   bowl: 2,
   all: 4,
   wk: 3,
   wkbat : 3
}
module.exports = {
    entityConstant,
    PlayerType
}
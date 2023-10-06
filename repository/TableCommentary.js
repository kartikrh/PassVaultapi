const { errorLogger } = require("../utilities/logger");

const getAllCommentaryQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        te."wrValue" as "commentaryId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "matchTypeId",
        "wrCompetitionId" as "competitionId",
        "wrEventId" as "eventId",
        "wrEventDate" as "eventDate",
        "wrEventName" as "eventName",
        "wrEventRefId" as "eventRefId",
        te4."wrValue" as "team1Id",
        te5."wrValue" as "team2Id",
        "wrLocation" as "location",
        "wrWeather" as "weather",
        "wrPitch" as "pitch",
        te6."wrValue" as "homeSideTeam",
        te7."wrValue" as "tossWonBy",
        "wrChoseTo" as "choseTo",
        te8."wrValue" as "winnerId",
        "wrWinnerName" as "winnerName",
        "wrIsViewTable" as "isViewTable",
        "wrDisplayStatus" as "displayStatus",
        "wrCommentaryStatus" as "commentaryStatus",
        "wrRmk" as "rmk",
        "wrCommentaryUserId" as "commentaryUserId",
        "wrUpdateTime" as "updateTime",
        "wrIsMatchDraw" as "isMatchDraw",
        "wrTarget" as "target",
        "wrMarketID" as "marketId",
        "wrTpId" as "tpId",
        "isSignalROn" as "isSignalROn",
        "isMatchTypeUpdated" as "isMatchTypeUpdated"
        from "tblCommentaries" tc 
        left join "tblEncryptedData" te on tc."wrCommentaryId" = te."wrKey"
        left join "tblEncryptedData" te2 on tc."wrEventTypeId" = te2."wrKey"
        left join "tblEncryptedData" te3 on tc."wrMatchTypeId" = te3."wrKey"
        left join "tblEncryptedData" te4 on tc."wrTeam1Id" = te4."wrKey"
        left join "tblEncryptedData" te5 on tc."wrTeam2Id" = te5."wrKey"
        left join "tblEncryptedData" te6 on tc."wrHomeSideTeam" = te6."wrKey"
        left join "tblEncryptedData" te7 on tc."wrTossWonBy" = te7."wrKey"
        left join "tblEncryptedData" te8 on tc."wrWinnerId" = te8."wrKey"       
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertCommentaryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_data as(
        insert into "tblCommentaries" ("wrEventTypeId","wrMatchTypeId","wrCompetitionId","wrEventId","wrEventDate","wrEventName","wrEventRefId","wrTeam1Id","wrTeam2Id","wrLocation","wrWeather","wrPitch","wrHomeSideTeam","wrTossWonBy","wrChoseTo","wrWinnerId","wrWinnerName","wrIsViewTable","wrDisplayStatus","wrCommentaryStatus","wrRmk","wrCommentaryUserId","wrUpdateTime","wrIsMatchDraw","wrTarget","wrMarketID","wrTpId","isSignalROn","isMatchTypeUpdated") values (
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $1),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $2),
          $3,$4,$5,$6,$7,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $8),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $9),
          $10,$11,$12,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $13),
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $14),
          $15,
          (select "wrKey" from "tblEncryptedData" where "wrValue" = $16),
          $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
        ) returning *
         
      )

      select 
        te."wrValue" as "commentaryId",
        te2."wrValue" as "eventTypeId",
        te3."wrValue" as "matchTypeId",
        "wrCompetitionId" as "competitionId",
        "wrEventId" as "eventId",
        "wrEventDate" as "eventDate",
        "wrEventName" as "eventName",
        "wrEventRefId" as "eventRefId",
        te4."wrValue" as "team1Id",
        te5."wrValue" as "team2Id",
        "wrLocation" as "location",
        "wrWeather" as "weather",
        "wrPitch" as "pitch",
        te6."wrValue" as "homeSideTeam",
        te7."wrValue" as "tossWonBy",
        "wrChoseTo" as "choseTo",
        te8."wrValue" as "winnerId",
        "wrWinnerName" as "winnerName",
        "wrIsViewTable" as "isViewTable",
        "wrDisplayStatus" as "displayStatus",
        "wrCommentaryStatus" as "commentaryStatus",
        "wrRmk" as "rmk",
        "wrCommentaryUserId" as "commentaryUserId",
        "wrUpdateTime" as "updateTime",
        "wrIsMatchDraw" as "isMatchDraw",
        "wrTarget" as "target",
        "wrMarketID" as "marketId",
        "wrTpId" as "tpId",
        "isSignalROn" as "isSignalROn",
        "isMatchTypeUpdated" as "isMatchTypeUpdated"
        from "insert_data" tc 
        left join "tblEncryptedData" te on tc."wrCommentaryId" = te."wrKey"
        left join "tblEncryptedData" te2 on tc."wrEventTypeId" = te2."wrKey"
        left join "tblEncryptedData" te3 on tc."wrMatchTypeId" = te3."wrKey"
        left join "tblEncryptedData" te4 on tc."wrTeam1Id" = te4."wrKey"
        left join "tblEncryptedData" te5 on tc."wrTeam2Id" = te5."wrKey"
        left join "tblEncryptedData" te6 on tc."wrHomeSideTeam" = te6."wrKey"
        left join "tblEncryptedData" te7 on tc."wrTossWonBy" = te7."wrKey"
        left join "tblEncryptedData" te8 on tc."wrWinnerId" = te8."wrKey"
      `,
      {
        bind: [
          data.eventTypeId || null,
          data.matchTypeId || null,
          data.competitionId || null,
          data.eventId || null,
          data.eventDate ? new Date(data.eventDate) : null,
          data.eventName || null,
          data.eventRefId || null,
          data.team1Id || null,
          data.team2Id || null,
          data.location || null,
          data.weather || null,
          data.pitch || null,
          data.homeSideTeam || null,
          data.tossWonBy || null,
          data.choseTo || null,
          data.winnerId || null,
          data.winnerName || null,
          data.isViewTable || false,
          data.displayStatus || null,
          data.commentaryStatus || null,
          data.rmk || null,
          data.commentaryUserId || null,
          data.updateTime ? new Date(data.updateTime) : null,
          data.isMatchDraw || false,
          data.target || null,
          data.marketId || null,
          data.tpId || null,
          data.isSignalROn || false,
          data.isMatchTypeUpdated || false,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableConfig/insertConfigQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllCommentaryQuery,
  insertCommentaryQuery,
};

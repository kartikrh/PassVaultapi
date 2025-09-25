const { errorLogger } = require("../utilities/logger");

const updateEntityPartnershipQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      UPDATE "tblCommentaryPartnerships" SET
        "wrTotalRuns" = $1,
        "wrTotalBalls" = $2,
        "wrExtras" = $3,
        "wrCommentaryBallByBallId" = $4,
        "wrBatter1Balls" = $5,
        "wrBatter2Balls" = $6,
        "wrBatter1Runs" = $7,
        "wrBatter2Runs" = $8,
        "wrTotalFour" = $9,
        "wrTotalSix" = $10,
        "wrTotalExtra" = $11,
        "wrTotalWide" = $12,
        "wrTotalNoBall" = $13,
        "wrTeamScore" = $14,
        "wrTeamWicket" = $15
      WHERE "wrCommentaryPartnershipId" = $16
      AND "wrCommentaryId" = $17
      AND "wrIsDelete" = false
      RETURNING
          "wrCommentaryPartnershipId" as "commentaryPartnershipId",
          "wrCommentaryId" as "commentaryId",
          "wrTeamId" as "teamId",
          "wrBatter1Id" as "batter1Id",
          "wrBatter1Name" as "batter1Name",
          "wrBatter2Id" as "batter2Id",
          "wrBatter2Name" as "batter2Name",
          "wrTotalRuns" as "totalRuns",
          "wrTotalBalls" as "totalBalls",
          "wrExtras" as "extras",
          "wrCurrentInnings" as "currentInnings",
          "wrCommentaryBallByBallId" as "commentaryBallByBallId",
          "wrBatter1Balls" as "batter1Balls",
          "wrBatter2Balls" as "batter2Balls",
          "wrBatter1Runs" as "batter1Runs",
          "wrBatter2Runs" as "batter2Runs",
          "wrCreatedDate" as "createdDate",
          "wrTotalFour" as "totalFour",
          "wrTotalSix" as "totalSix",
          "wrTotalExtra" as "totalExtra",
          "wrTotalWide" as "totalWide",
          "wrTotalNoBall" as "totalNoBall",
          "wrOrder" as "order",
          "wrIsActive" as "isActive",
          "wrP1Ball" as "p1Ball",
          "wrP2Ball" as "p2Ball",
          "wrP1Run" as "p1Run",
          "wrP2Run" as "p2Run",
          "wrTeamScore" as "teamScore",
          "wrTeamWicket" as "teamWicket"
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.totalRuns,
          data.totalBalls,
          data.extras,
          data.commentaryBallByBallId,
          data.batter1Balls,
          data.batter2Balls,
          data.batter1Runs,
          data.batter2Runs,
          data.totalFour,
          data.totalSix,
          data.totalExtra,
          data.totalWide,
          data.totalNoBall,
          data.teamScore ,
          data.teamWicket,
          data.commentaryPartnershipId,
          data.commentaryId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/updateVirtualPartnershipQuery",
      null
    );
    throw new Error(err.message);
  }
};

const upActivePartQuery = async (data, fastify, request = null) => {
  try {
    const result = await fastify.db.query(
      `
      UPDATE "tblCommentaryPartnerships" SET
        "wrIsActive" = $1
      WHERE "wrCommentaryPartnershipId" = $2
      AND "wrIsDelete" = false
      RETURNING
          "wrCommentaryPartnershipId" as "commentaryPartnershipId",
          "wrCommentaryId" as "commentaryId",
          "wrTeamId" as "teamId",
          "wrBatter1Id" as "batter1Id",
          "wrBatter1Name" as "batter1Name",
          "wrBatter2Id" as "batter2Id",
          "wrBatter2Name" as "batter2Name",
          "wrTotalRuns" as "totalRuns",
          "wrTotalBalls" as "totalBalls",
          "wrExtras" as "extras",
          "wrCurrentInnings" as "currentInnings",
          "wrCommentaryBallByBallId" as "commentaryBallByBallId",
          "wrBatter1Balls" as "batter1Balls",
          "wrBatter2Balls" as "batter2Balls",
          "wrBatter1Runs" as "batter1Runs",
          "wrBatter2Runs" as "batter2Runs",
          "wrCreatedDate" as "createdDate",
          "wrTotalFour" as "totalFour",
          "wrTotalSix" as "totalSix",
          "wrTotalExtra" as "totalExtra",
          "wrTotalWide" as "totalWide",
          "wrTotalNoBall" as "totalNoBall",
          "wrOrder" as "order",
          "wrIsActive" as "isActive",
          "wrP1Ball" as "p1Ball",
          "wrP2Ball" as "p2Ball",
          "wrP1Run" as "p1Run",
          "wrP2Run" as "p2Run",
          "wrTeamScore" as "teamScore",
          "wrTeamWicket" as "teamWicket"
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.isActive,
          data.commentaryPartnershipId,

        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary/upActivePartQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  updateEntityPartnershipQuery,
  upActivePartQuery
};